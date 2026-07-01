import { describe, it, expect } from 'vitest'
import { linkifyPlainTextUrls } from '@/utils/url'

describe('linkifyPlainTextUrls', () => {
  it('将裸 HTTP URL 转换为 Markdown 链接', () => {
    const input = '访问 https://example.com 了解更多'
    const result = linkifyPlainTextUrls(input)
    expect(result).toContain('[https://example.com](https://example.com)')
  })

  it('将裸 HTTPS URL 转换为 Markdown 链接', () => {
    const input = '安全链接 https://secure.example.com/page'
    const result = linkifyPlainTextUrls(input)
    expect(result).toContain('[https://secure.example.com/page](https://secure.example.com/page)')
  })

  it('剥离 URL 尾部标点', () => {
    const input = '链接 https://example.com。'
    const result = linkifyPlainTextUrls(input)
    expect(result).toContain('https://example.com')
    expect(result).not.toContain('example.com。')
  })

  it('已有 Markdown 链接不重复转换', () => {
    const input = '[example](https://example.com)'
    const result = linkifyPlainTextUrls(input)
    /* 不应该嵌套转换 */
    expect(result.match(/\[https?:\/\//g)?.length || 0).toBe(0)
  })

  it('纯文本不修改', () => {
    const input = '这是一段纯文本'
    const result = linkifyPlainTextUrls(input)
    expect(result).toBe(input)
  })

  it('多个 URL', () => {
    const input = '链接1 https://a.com 链接2 https://b.com'
    const result = linkifyPlainTextUrls(input)
    expect(result).toContain('[https://a.com](https://a.com)')
    expect(result).toContain('[https://b.com](https://b.com)')
  })
})
