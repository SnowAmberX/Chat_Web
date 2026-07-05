import { chatApi, extractErrorMessage } from './client'
import type {
  ApiResponse,
  RegisterResponseData,
  UpdateUserGeoRequest,
  SaveRecordRequest,
  ChatRecordItem,
  SessionsListItem,
} from '@/types'

/**
 * 用户注册。
 */
export async function registerUser(displayName: string): Promise<RegisterResponseData> {
  try {
    const res = await chatApi.post<ApiResponse<RegisterResponseData>>('/register', {
      display_name: displayName,
    })
    if (res.data.code === 200) return res.data.data
    throw new Error(res.data.message || '注册失败')
  } catch (err) {
    throw new Error(extractErrorMessage(err))
  }
}

/**
 * 手动更新用户地理位置信息。
 */
export async function updateUserGeo(data: UpdateUserGeoRequest): Promise<void> {
  try {
    const res = await chatApi.put<ApiResponse>('/user-geo', data)
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '更新失败')
    }
  } catch (err) {
    throw new Error(extractErrorMessage(err))
  }
}

/**
 * 保存对话记录。
 */
export async function saveChatRecord(data: SaveRecordRequest): Promise<void> {
  try {
    const res = await chatApi.post<ApiResponse>('/record', data)
    if (res.data.code !== 200) {
      console.error('保存对话记录失败:', res.data.message)
    }
  } catch (err) {
    console.error('保存对话记录失败:', extractErrorMessage(err))
  }
}

/**
 * 获取会话历史消息。
 */
export async function fetchChatRecords(
  sessionId: string,
  userId: string,
): Promise<ChatRecordItem[]> {
  try {
    const res = await chatApi.get<ApiResponse<ChatRecordItem[]>>(
      `/records/${encodeURIComponent(sessionId)}`,
      { params: { user_id: userId } },
    )
    if (res.data.code === 200) return res.data.data
    return []
  } catch (err) {
    throw new Error(extractErrorMessage(err))
  }
}

/**
 * 删除会话记录。
 */
export async function deleteChatSession(sessionId: string, userId: string): Promise<void> {
  try {
    const res = await chatApi.delete<ApiResponse>(
      `/records/${encodeURIComponent(sessionId)}`,
      { params: { user_id: userId } },
    )
    if (res.data.code !== 200) {
      throw new Error(res.data.message || '删除失败')
    }
  } catch (err) {
    throw new Error(extractErrorMessage(err))
  }
}

/**
 * 获取用户会话列表。
 */
export async function fetchSessions(userId: string): Promise<SessionsListItem[]> {
  try {
    const res = await chatApi.get<ApiResponse<SessionsListItem[]>>(
      `/sessions/${encodeURIComponent(userId)}`,
    )
    if (res.data.code === 200) return res.data.data
    return []
  } catch (err) {
    throw new Error(extractErrorMessage(err))
  }
}
