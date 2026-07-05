import { defineStore } from 'pinia'
import type { Message, ClientSession, ContactModalState, AlertType } from '@/types'
import {
  fetchSessions,
  fetchChatRecords,
  deleteChatSession as deleteChatSessionApi,
  saveChatRecord,
} from '@/api/records'

/* localStorage 安全读写 */
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // 静默失败（隐私模式等）
  }
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [] as Message[],
    loadingSessions: {} as Record<string, boolean>,
    isStreaming: import.meta.env.VITE_STREAMING_ENABLED !== 'false',
    sessions: [] as ClientSession[],
    currentSessionId: '' as string,
    currentUserId: safeGetItem('chat_user_id') || '',
    currentDisplayName: safeGetItem('chat_display_name') || '',
    showContactModal: false,
    pendingAlertType: null as AlertType | null,
    contactInfo: { phone: '' },
    contactModalState: 'idle' as ContactModalState,

    /* 用户地理位置信息 */
    userGeo: {
      region: safeGetItem('chat_user_region') || '',
      country_code: safeGetItem('chat_user_country_code') || '',
      country_name: safeGetItem('chat_user_country_name') || '',
      manual_geo: safeGetItem('chat_user_manual_geo') === 'true',
    },
  }),

  getters: {
    isCurrentSessionLoading: (state) =>
      state.currentSessionId ? (state.loadingSessions[state.currentSessionId] ?? false) : false,
  },

  actions: {
    setUserInfo(uid: string, displayName: string) {
      this.currentUserId = uid
      this.currentDisplayName = displayName
      safeSetItem('chat_user_id', uid)
      safeSetItem('chat_display_name', displayName)
    },

    setUserGeo(region: string, country_code: string, country_name: string, manual_geo: boolean) {
      this.userGeo.region = region
      this.userGeo.country_code = country_code
      this.userGeo.country_name = country_name
      this.userGeo.manual_geo = manual_geo
      safeSetItem('chat_user_region', region)
      safeSetItem('chat_user_country_code', country_code)
      safeSetItem('chat_user_country_name', country_name)
      safeSetItem('chat_user_manual_geo', String(manual_geo))
    },

    addMessage(message: Message) {
      this.messages.push(message)

      /* 同步到当前会话 */
      const session = this.sessions.find((s) => s.id === this.currentSessionId)
      if (session) {
        session.messages.push({ ...message })

        /* 如果是第一条用户消息且标题仍为默认，自动更新标题 */
        if (
          message.role === 'user' &&
          session.title === '新对话'
        ) {
          session.title = message.content.slice(0, 20)
        }
      }
    },

    createNewSession() {
      const id = Date.now().toString()
      const newSession: ClientSession = {
        id,
        title: '新对话',
        messages: [],
        loaded: false,
      }
      this.sessions.unshift(newSession)
      this.currentSessionId = id
      this.messages = []

      /* 添加欢迎消息 */
      const welcomeMsg: Message = {
        id: 'welcome',
        content: '您好！我是BNBU招生助手，有什么我能帮您的吗？',
        role: 'assistant',
        timestamp: Date.now(),
      }
      this.messages.push(welcomeMsg)
    },

    async switchSession(sessionId: string) {
      if (this.loadingSessions[sessionId]) return

      const session = this.sessions.find((s) => s.id === sessionId)
      if (!session) return

      this.currentSessionId = sessionId

      if (session.loaded) {
        this.messages = [...session.messages]
      } else {
        await this.loadMessagesForSession(sessionId)
      }
    },

    async loadMessagesForSession(sessionId: string) {
      this.setSessionLoading(sessionId, true)

      try {
        const records = await fetchChatRecords(sessionId, this.currentUserId)
        const messages: Message[] = records.map((r) => ({
          id: r.id,
          content: r.content,
          role: r.role,
          timestamp: new Date(r.create_time).getTime(),
        }))

        const session = this.sessions.find((s) => s.id === sessionId)
        if (session) {
          session.messages = messages
          session.loaded = true
        }

        if (this.currentSessionId === sessionId) {
          this.messages = messages
        }
      } catch {
        /* 加载失败，设置 loaded=true 防止无限重试 */
        const session = this.sessions.find((s) => s.id === sessionId)
        if (session) {
          session.messages = []
          session.loaded = true
        }
        if (this.currentSessionId === sessionId) {
          this.messages = []
        }
      } finally {
        this.setSessionLoading(sessionId, false)
      }
    },

    async loadSessionsFromDB() {
      try {
        const list = await fetchSessions(this.currentUserId)

        if (list.length === 0) {
          this.createNewSession()
          return
        }

        this.sessions = list.map((item) => ({
          id: item.session_id,
          title: item.first_message
            ? item.first_message.slice(0, 20)
            : '新对话',
          messages: [],
          loaded: false,
        }))

        /* 切换到第一个会话并加载消息 */
        await this.switchSession(this.sessions[0].id)
      } catch (err: unknown) {
        /* 404 表示用户不存在，清除本地信息 */
        if (err instanceof Error && err.message.includes('404')) {
          safeSetItem('chat_user_id', '')
          safeSetItem('chat_display_name', '')
          this.currentUserId = ''
          this.currentDisplayName = ''
          this.sessions = []
          this.messages = []
        }

        /* 本地无会话时创建新会话 */
        if (this.sessions.length === 0) {
          this.createNewSession()
        }
      }
    },

    async deleteSession(sessionId: string) {
      try {
        await deleteChatSessionApi(sessionId, this.currentUserId)
      } catch {
        // 静默处理删除失败
      }

      this.sessions = this.sessions.filter((s) => s.id !== sessionId)

      if (this.sessions.length === 0) {
        this.createNewSession()
      } else {
        await this.switchSession(this.sessions[0].id)
      }
    },

    async clearMessages() {
      try {
        await deleteChatSessionApi(this.currentSessionId, this.currentUserId)
        this.messages = []
        const session = this.sessions.find((s) => s.id === this.currentSessionId)
        if (session) {
          session.messages = []
        }
      } catch {
        // 静默处理
      }
    },

    updateMessageContent(id: string, content: string) {
      const msg = this.messages.find((m) => m.id === id)
      if (msg) msg.content = content

      /* 同步到对应会话 */
      const session = this.sessions.find((s) => s.id === this.currentSessionId)
      const sessionMsg = session?.messages.find((m) => m.id === id)
      if (sessionMsg) sessionMsg.content = content
    },

    removeMessage(id: string) {
      this.messages = this.messages.filter((m) => m.id !== id)

      const session = this.sessions.find((s) => s.id === this.currentSessionId)
      if (session) {
        session.messages = session.messages.filter((m) => m.id !== id)
      }
    },

    setSessionLoading(sessionId: string, loading: boolean) {
      if (loading) {
        this.loadingSessions[sessionId] = true
      } else {
        delete this.loadingSessions[sessionId]
      }
    },

    setPendingAlert(type: AlertType, _messageSnippet: string) {
      this.pendingAlertType = type
      this.showContactModal = true
    },

    markContactDismissed() {
      this.contactModalState = 'dismissed'
      this.showContactModal = false
      this.pendingAlertType = null
    },

    markContactCompleted() {
      this.contactModalState = 'contacted'
      this.showContactModal = false
      this.pendingAlertType = null
      this.contactInfo.phone = ''
    },

    resetContactState() {
      this.contactModalState = 'idle'
      this.showContactModal = false
      this.pendingAlertType = null
      this.contactInfo.phone = ''
    },
  },
})
