import type { ChatResponse, SessionsListItem, ChatRecordItem } from '@/types'

export const mockChatResponse: ChatResponse = {
  id: 'mock-1234567890',
  object: 'chat.completion',
  created: Math.floor(Date.now() / 1000),
  question: '测试问题',
  context_count: 3,
  contexts: [
    { content: 'BNBU 2025年招生计划...', similarity: 0.92, source: '招生简章' },
    { content: '录取分数线...', similarity: 0.87, source: '历年数据' },
  ],
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: '这是模拟回复。\n\n关于「测试问题」的问题，以下是相关信息。',
      },
      finish_reason: 'stop',
    },
  ],
  usage: {
    prompt_tokens: 100,
    completion_tokens: 80,
    total_tokens: 180,
  },
}

export const mockSessionsList: SessionsListItem[] = [
  {
    session_id: '1712345678000',
    last_time: '2025-06-15 14:30:00',
    create_time: '2025-06-15 09:00:00',
    first_message: '请问录取分数线...',
  },
  {
    session_id: '1712345600000',
    last_time: '2025-06-14 16:00:00',
    create_time: '2025-06-14 10:00:00',
    first_message: '你好',
  },
]

export const mockChatRecords: ChatRecordItem[] = [
  { id: '1-u', role: 'user', content: '你好', create_time: '2025-01-01 10:00:00' },
  { id: '1-a', role: 'assistant', content: '你好！我是BNBU招生助手...', create_time: '2025-01-01 10:00:01' },
  { id: '2-u', role: 'user', content: '请问录取分数线是多少？', create_time: '2025-01-01 10:01:00' },
  { id: '2-a', role: 'assistant', content: '2025年录取分数线...', create_time: '2025-01-01 10:01:05' },
]
