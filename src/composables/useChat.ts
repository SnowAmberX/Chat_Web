import { ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import { sendMessage, sendMessageStream } from '@/api/rag'
import { saveChatRecord, checkUserHasPhone } from '@/api/records'
import { checkForKeywords } from '@/utils/validation'
import type { HistoryItem, SendContext, Message } from '@/types'

/* 从消息列表中构建对话历史（排除欢迎消息和当前用户消息） */
function buildHistory(messages: Message[]): HistoryItem[] {
  return messages
    .filter((m) => m.id !== 'welcome' && m.role === 'user')
    .slice(0, -1) // 排除最后一条用户消息（即当前输入）
    .map((m) => ({
      role: m.role,
      content: m.content,
    }))
}

export function useChat() {
  const store = useChatStore()
  const activeContext = ref<SendContext | null>(null)
  const isSending = ref(false)
  const streamText = ref('')
  const overflowDetected = ref(false)

  function abortCurrentRequest() {
    activeContext.value?.abortController.abort()
    activeContext.value = null
    isSending.value = false
    if (store.currentSessionId) {
      store.setSessionLoading(store.currentSessionId, false)
    }
  }

  async function handleSend(text: string) {
    if (!text.trim() || isSending.value) return

    /* 确保有当前会话 */
    if (!store.currentSessionId) {
      store.createNewSession()
    }

    const sessionId = store.currentSessionId
    const requestId = Date.now().toString()
    const userMessageId = Date.now().toString()
    const assistantMessageId = `stream-${Date.now().toString()}`
    const abortController = new AbortController()

    /* 创建发送上下文 */
    const context: SendContext = {
      requestId,
      sessionId,
      userMessageId,
      assistantMessageId,
      abortController,
    }
    activeContext.value = context
    isSending.value = true
    overflowDetected.value = false

    /* 添加用户消息 */
    store.addMessage({
      id: userMessageId,
      content: text.trim(),
      role: 'user',
      timestamp: Date.now(),
    })

    /* 构建请求 */
    const history = buildHistory(store.messages)

    store.setSessionLoading(sessionId, true)

    try {
      if (store.isStreaming) {
        /* 流式模式 */
        const aiMsg: Message = {
          id: assistantMessageId,
          content: '',
          role: 'assistant',
          timestamp: Date.now(),
        }
        store.addMessage(aiMsg)

        let accumulated = ''

        await sendMessageStream(
          { question: text.trim(), history },
          (chunk) => {
            accumulated += chunk
            streamText.value = accumulated

            /* 直接更新会话中的消息（通过 sessionId 定位，并发安全） */
            const session = store.sessions.find((s) => s.id === sessionId)
            const msg = session?.messages.find((m) => m.id === assistantMessageId)
            if (msg) msg.content = accumulated

            /* 同时更新当前展示的 messages */
            if (store.currentSessionId === sessionId) {
              const displayMsg = store.messages.find((m) => m.id === assistantMessageId)
              if (displayMsg) displayMsg.content = accumulated
            }
          },
          () => {
            /* onDone */
            streamText.value = ''
          },
          (error) => {
            /* onError */
            streamText.value = ''
            const errMsg = error.message

            if (errMsg.includes('上下文长度上限') || errMsg.includes('过长')) {
              /* CONTEXT_OVERFLOW */
              store.removeMessage(assistantMessageId)
              overflowDetected.value = true
            } else {
              /* 更新 AI 消息为错误信息 */
              const session = store.sessions.find((s) => s.id === sessionId)
              const msg = session?.messages.find((m) => m.id === assistantMessageId)
              if (msg) {
                msg.content =
                  errMsg === '请求超时，请检查网络后重试。'
                    ? '请求超时，请检查网络后重试。'
                    : '抱歉，发送失败了，请稍后再试。'
              }
              if (store.currentSessionId === sessionId) {
                const displayMsg = store.messages.find((m) => m.id === assistantMessageId)
                if (displayMsg) {
                  displayMsg.content =
                    errMsg === '请求超时，请检查网络后重试。'
                      ? '请求超时，请检查网络后重试。'
                      : '抱歉，发送失败了，请稍后再试。'
                }
              }
            }
          },
          abortController.signal,
        )

        /* 流式完成，保存记录 */
        const finalContent =
          store.sessions
            .find((s) => s.id === sessionId)
            ?.messages.find((m) => m.id === assistantMessageId)?.content ?? ''

        if (finalContent && !finalContent.includes('请求超时') && !finalContent.includes('发送失败')) {
          saveChatRecord({
            user_id: store.currentUserId,
            session_id: sessionId,
            question: text.trim(),
            answer: finalContent,
          }).catch(() => {})
        }
      } else {
        /* 普通模式 */
        const response = await sendMessage({ question: text.trim(), history })

        const content = response.choices[0]?.message?.content ?? ''

        store.addMessage({
          id: assistantMessageId,
          content,
          role: 'assistant',
          timestamp: Date.now(),
        })

        /* 保存记录 */
        saveChatRecord({
          user_id: store.currentUserId,
          session_id: sessionId,
          question: text.trim(),
          answer: content,
        }).catch(() => {})
      }

      /* 关键词检测 */
      if (store.contactModalState === 'idle') {
        const result = checkForKeywords(text.trim())
        if (result.type && result.matched) {
          /* 如果用户已留过手机号，不再重复告警 */
          const hasPhone = await checkUserHasPhone(store.currentUserId)
          if (hasPhone) return
          store.setPendingAlert(result.type, result.matched)
        }
      }
    } catch (err: unknown) {
      /* 顶层错误处理 */
      const errMsg = err instanceof Error ? err.message : '请求失败'

      if (errMsg.includes('上下文长度上限') || errMsg.includes('过长')) {
        store.removeMessage(assistantMessageId)
        overflowDetected.value = true
      } else {
        store.addMessage({
          id: assistantMessageId,
          content: errMsg === '请求超时，请检查网络后重试。'
            ? '请求超时，请检查网络后重试。'
            : '抱歉，发送失败了，请稍后再试。',
          role: 'assistant',
          timestamp: Date.now(),
        })
      }
    } finally {
      store.setSessionLoading(sessionId, false)
      activeContext.value = null
      isSending.value = false
    }
  }

  return {
    sendMessage: handleSend,
    abortCurrentRequest,
    isSending,
    streamText,
    overflowDetected,
  }
}
