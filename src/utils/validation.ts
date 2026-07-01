import type { AlertType } from '@/types'

const HIGH_INTENT_KEYWORDS: string[] = [
  '第一志愿', '第一选择', '很想来', '想把贵校', '冲一冲', '稳录', '保底',
  '能报吗', '有希望吗', '机会大吗', '能上吗', '能进吗', '能被录取', '稳不稳',
  '加微信', '加老师', '电话', '联系方式',
]

const URGENT_KEYWORDS: string[] = [
  '投诉', '举报', '不合理', '不一样', '有问题', '不满意', '离谱', '欺骗',
  '截止', '马上', '着急', '来不及', '报错', '失败', '申诉', '人工',
]

export interface KeywordMatch {
  type: AlertType
  matched: string
}

/**
 * 检测用户消息中是否包含高意向或紧急关键词。
 * 同时匹配 URGENT 和 HIGH_INTENT 时优先判定为 urgent。
 */
export function checkForKeywords(text: string): { type: AlertType | null; matched: string | null } {
  for (const kw of URGENT_KEYWORDS) {
    if (text.includes(kw)) {
      return { type: 'urgent', matched: kw }
    }
  }
  for (const kw of HIGH_INTENT_KEYWORDS) {
    if (text.includes(kw)) {
      return { type: 'high_intent', matched: kw }
    }
  }
  return { type: null, matched: null }
}

/**
 * 校验中国大陆手机号格式。
 * 先去除空格，再匹配 1 开头的 11 位数字。
 */
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '')
  return /^1\d{10}$/.test(cleaned)
}
