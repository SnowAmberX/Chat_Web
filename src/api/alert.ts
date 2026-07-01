import axios from 'axios'
import { extractErrorMessage } from './client'
import type { ApiResponse, AlertRequest } from '@/types'

const alertApi = axios.create({
  baseURL: '/api/alert',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * 发送告警通知给招生老师。
 */
export async function sendAlert(data: AlertRequest): Promise<void> {
  try {
    const res = await alertApi.post<ApiResponse>('/teacher', data)
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '告警发送失败')
    }
  } catch (err) {
    throw new Error(extractErrorMessage(err))
  }
}
