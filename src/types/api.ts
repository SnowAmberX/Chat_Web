/** Python 后端统一响应包装 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/* 通用请求状态 */
export type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

/* 流式请求状态 */
export type StreamState = 'idle' | 'streaming' | 'done' | 'error'

/* 录音状态 */
export type RecordingState = 'idle' | 'recording' | 'transcribing'

/* 联系方式弹窗状态机 */
export type ContactModalState = 'idle' | 'dismissed' | 'contacted'

/* 告警类型 */
export type AlertType = 'high_intent' | 'urgent'
