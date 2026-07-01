import { ragApi, extractErrorMessage } from './client'
import type { ChatRequest, ChatResponse } from '@/types'

/* Mock 开关 — 仅开发环境生效，生产构建时 tree-shaking 移除 */
const USE_MOCK = import.meta.env.DEV && import.meta.env.VITE_DEV_MOCK_RAG_CHAT === 'true'

/* ===== 真实实现 ===== */

/**
 * RAG 对话 — 普通模式。
 * 使用 axios 发送 POST 请求，等待完整响应。
 */
export async function sendMessage(data: ChatRequest): Promise<ChatResponse> {
  if (USE_MOCK) return mockSendMessage(data)

  const response = await ragApi.post<ChatResponse>('/v1/rag/chat', data)
  return response.data
}

/**
 * RAG 对话 — 流式模式（SSE）。
 * 使用原生 fetch 逐行解析 SSE 事件流。
 */
export async function sendMessageStream(
  data: ChatRequest,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: Error) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (USE_MOCK) return mockSendMessageStream(data, onChunk, onDone, onError, signal)

  const timeoutMs = Number(import.meta.env.VITE_CHAT_TIMEOUT_MS ?? 15000)
  const controller = new AbortController()
  const linkedSignal = signal

  // 超时管理
  let timeoutId: ReturnType<typeof setTimeout> = 0 as unknown as ReturnType<typeof setTimeout>
  const refreshTimeout = () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      controller.abort()
    }, timeoutMs)
  }

  // 外部取消信号转发
  if (linkedSignal) {
    linkedSignal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  try {
    refreshTimeout()

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/v1/rag/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, stream: true }),
        signal: controller.signal,
      },
    )

    if (!response.ok) {
      const text = await response.text()
      let errMsg: string
      try {
        const parsed = JSON.parse(text)
        errMsg = parsed.detail ?? parsed.message ?? parsed.error ?? text
        if (parsed.code === 'CONTEXT_OVERFLOW') {
          errMsg = '输入内容过长，已超过模型上下文长度上限，请精简后重试。'
        }
      } catch {
        errMsg = text || `HTTP ${response.status}`
      }
      onError(new Error(errMsg))
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      onError(new Error('浏览器不支持 ReadableStream'))
      return
    }

    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      refreshTimeout()
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data: ')) continue

        const payload = trimmed.slice(6)

        if (payload === '[DONE]') {
          onDone()
          return
        }

        try {
          const parsed = JSON.parse(payload)
          const content =
            parsed.choices?.[0]?.delta?.content ??
            parsed.choices?.[0]?.message?.content
          if (content) onChunk(content)
        } catch {
          // 忽略非 JSON 行
        }
      }
    }

    /* 流正常结束，未收到 [DONE] */
    onDone()
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      onError(new Error('请求超时，请检查网络后重试。'))
    } else {
      onError(err instanceof Error ? err : new Error(extractErrorMessage(err)))
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

/* ===== Mock 实现 ===== */

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function mockSendMessage(data: ChatRequest): Promise<ChatResponse> {
  await delay(randBetween(1500, 3000))
  return {
    id: `mock-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    question: data.question,
    context_count: 3,
    contexts: [
      { content: 'BNBU 2025年招生计划包括计算机科学、数据科学等专业。', similarity: 0.92, source: '招生简章' },
      { content: '2025年广东省录取分数线：物理类560分，历史类545分。', similarity: 0.87, source: '历年数据' },
      { content: '学校提供国家奖学金、校级奖学金和企业奖学金三类。', similarity: 0.81, source: '奖助学金政策' },
    ],
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: `这是模拟回复。\n\n关于「${data.question}」的问题，以下是相关信息：\n\n1. 招生政策方面，BNBU 提供多元化的招生渠道，包括统一高考和自主招生。\n2. 录取条件方面，各专业要求有所不同，建议参考最新招生简章。\n\n如需更多帮助，请随时提问。`,
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: data.question.length + (data.history?.length ?? 0) * 20,
      completion_tokens: 80,
      total_tokens: data.question.length + 80,
    },
  }
}

async function mockSendMessageStream(
  data: ChatRequest,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: Error) => void,
  signal?: AbortSignal,
): Promise<void> {
  /* 错误模拟 */
  const q = data.question
  if (q.includes('[TIMEOUT]')) {
    await delay(15000)
    onError(new Error('请求超时，请检查网络后重试。'))
    return
  }
  if (q.includes('[OVERFLOW]')) {
    onError(new Error('输入内容过长，已超过模型上下文长度上限，请精简后重试。'))
    return
  }
  if (q.includes('[ERROR]')) {
    onError(new Error('Internal Server Error'))
    return
  }
  if (q.includes('[NETWORK]')) {
    onError(new Error('网络错误，请检查连接后重试。'))
    return
  }

  const fullText = `这是模拟流式回复。\n\n关于「${data.question}」的问题，以下是相关信息：\n\n1. 招生政策方面，BNBU 提供多元化的招生渠道。\n2. 录取条件方面，建议参考最新招生简章。\n3. 如有其他疑问，欢迎继续咨询。\n\n祝您升学顺利！`

  /* 初始延迟 */
  await delay(randBetween(500, 1500))

  /* 将文本切分为 4-10 个随机片段 */
  const chunkCount = randBetween(4, 10)
  const chunkSize = Math.ceil(fullText.length / chunkCount)

  for (let i = 0; i < fullText.length; i += chunkSize) {
    if (signal?.aborted) return
    await delay(randBetween(120, 350))
    const chunk = fullText.slice(i, i + chunkSize)
    onChunk(chunk)
  }

  onDone()
}
