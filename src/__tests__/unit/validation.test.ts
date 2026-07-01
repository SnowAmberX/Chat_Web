import { describe, it, expect } from 'vitest'
import { validatePhone, checkForKeywords } from '@/utils/validation'

describe('validatePhone', () => {
  it('有效的手机号', () => {
    expect(validatePhone('13800138000')).toBe(true)
  })

  it('无效的手机号（短）', () => {
    expect(validatePhone('123')).toBe(false)
  })

  it('无效的手机号（含字母）', () => {
    expect(validatePhone('1380013800a')).toBe(false)
  })

  it('空字符串', () => {
    expect(validatePhone('')).toBe(false)
  })

  it('含空格的手机号', () => {
    expect(validatePhone('138 0013 8000')).toBe(true)
  })

  it('12位数字', () => {
    expect(validatePhone('138001380000')).toBe(false)
  })

  it('非1开头', () => {
    expect(validatePhone('23800138000')).toBe(false)
  })
})

describe('checkForKeywords', () => {
  it('匹配 HIGH_INTENT 关键词', () => {
    const result = checkForKeywords('请问我能报吗')
    expect(result.type).toBe('high_intent')
    expect(result.matched).toBe('能报吗')
  })

  it('匹配 URGENT 关键词', () => {
    const result = checkForKeywords('我要投诉')
    expect(result.type).toBe('urgent')
    expect(result.matched).toBe('投诉')
  })

  it('同时匹配 URGENT 和 HIGH_INTENT 优先 URGENT', () => {
    const result = checkForKeywords('我要投诉，请问能报吗')
    expect(result.type).toBe('urgent')
  })

  it('无匹配', () => {
    const result = checkForKeywords('今天天气真好')
    expect(result.type).toBeNull()
    expect(result.matched).toBeNull()
  })

  it('匹配联系方式', () => {
    const result = checkForKeywords('怎么加老师联系方式')
    expect(result.type).toBe('high_intent')
  })
})
