import axios from 'axios'
import type { ApiResponse } from '@/types'

/* RAG API 实例 */
export const ragApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: Number(import.meta.env.VITE_CHAT_TIMEOUT_MS ?? 15000),
  headers: { 'Content-Type': 'application/json' },
})

/* 聊天后端 API 实例 */
export const chatApi = axios.create({
  baseURL: '/api/chat',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * 统一错误消息提取。
 *
 * 级联查找：detail → message → error → msg → Error.message → 回退
 */
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data

    // CONTEXT_OVERFLOW 特殊处理
    if (data?.code === 'CONTEXT_OVERFLOW' || data?.detail?.code === 'CONTEXT_OVERFLOW') {
      return '输入内容过长，已超过模型上下文长度上限，请精简后重试。'
    }

    // 级联提取
    const msg =
      data?.detail ??
      data?.message ??
      data?.error ??
      data?.msg

    if (typeof msg === 'string' && msg.length > 0) return msg

    // 超时
    if (error.code === 'ECONNABORTED') {
      return '请求超时，请检查网络后重试。'
    }

    // 网络错误
    if (!error.response) {
      return '网络错误，请检查连接后重试。'
    }
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return '请求超时，请检查网络后重试。'
    }
    return error.message
  }

  return '请求失败'
}

/**
 * 业务成功判断（Python 后端统一响应包装）。
 * RAG API 不使用此判断（无 code 包装）。
 */
export function isBusinessSuccess(response: { data: ApiResponse }): boolean {
  return response.data?.code === 200
}
