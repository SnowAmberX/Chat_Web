import type { AlertType } from './api'

/* 前端消息实体 */
export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: number
}

/* 前端会话实体 */
export interface ClientSession {
  id: string
  title: string
  messages: Message[]
  loaded: boolean
}

/* 对话历史记录（传给后端的格式） */
export interface HistoryItem {
  role: 'user' | 'assistant'
  content: string
}

/* 检索上下文 */
export interface RetrievedContext {
  content: string
  similarity?: number
  source?: string
}

/* POST /v1/rag/chat 请求体 */
export interface ChatRequest {
  question: string
  history?: HistoryItem[]
  contexts?: RetrievedContext[]
  similar_num?: number
  temperature?: number
  max_tokens?: number
  top_p?: number
  stream?: boolean
  system_prompt_prefix?: string
}

/* POST /v1/rag/chat 普通模式响应体 */
export interface ChatResponse {
  id: string
  object: string
  created: number
  question: string
  context_count: number
  contexts: RetrievedContext[]
  choices: {
    index: number
    message: {
      role: 'assistant'
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/* POST /api/chat/register 请求 */
export interface RegisterRequest {
  display_name: string
}

/* POST /api/chat/register 响应 data */
export interface RegisterResponseData {
  id: number
  username: string
  region?: string
  country_code?: string | null
  country_name?: string
  manual_geo?: boolean
}

/* PUT /api/chat/user-geo 请求 */
export interface UpdateUserGeoRequest {
  user_id: string
  region: string
  country_code: string
  country_name: string
}

/* POST /api/chat/record 请求 */
export interface SaveRecordRequest {
  user_id: string
  session_id: string
  question: string
  answer: string
}

/* GET /api/chat/records/{session_id} 响应 data 的单项 */
export interface ChatRecordItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  create_time: string
}

/* GET /api/chat/sessions/{user_id} 响应 data 的单项 */
export interface SessionsListItem {
  session_id: string
  last_time: string
  create_time: string
  first_message: string | null
}

/* POST /api/alert/teacher 请求 */
export interface AlertRequest {
  studentName: string
  contact: string
  sessionId: string
  intentType: AlertType
  messageSnippet: string
  userId?: string
}

/* GET /api/ip/lookup 响应 data */
export interface IpLookupData {
  ip: string
  region: string
}

/* Whisper 成功响应 */
export interface WhisperResponse {
  text: string
}

/* Whisper 错误响应 */
export interface WhisperError {
  error: string
}

/* 发送上下文（并发隔离） */
export interface SendContext {
  requestId: string
  sessionId: string
  userMessageId: string
  assistantMessageId: string
  abortController: AbortController
}
