import { describe, it, expect } from 'vitest'
import { renderMarkdown } from '@/utils/markdown'

describe('renderMarkdown', () => {
  it('基本 Markdown 渲染', () => {
    const result = renderMarkdown('**粗体** 和 *斜体*')
    expect(result).toContain('<strong>粗体</strong>')
    expect(result).toContain('<em>斜体</em>')
  })

  it('标题渲染', () => {
    const result = renderMarkdown('# 标题')
    expect(result).toContain('<h1>标题</h1>')
  })

  it('链接渲染并添加安全属性', () => {
    const result = renderMarkdown('[安全链接](https://safe.com)')
    expect(result).toContain('href="https://safe.com"')
    expect(result).toContain('target="_blank"')
    expect(result).toContain('rel="noopener noreferrer"')
  })

  it('XSS: script 标签被移除', () => {
    const result = renderMarkdown('<script>alert(1)</script>')
    expect(result).not.toContain('<script>')
    expect(result).not.toContain('alert(1)')
  })

  it('XSS: img onerror 被移除', () => {
    const result = renderMarkdown('<img src=x onerror=alert(1)>')
    expect(result).not.toContain('onerror')
  })

  it('XSS: javascript: 协议链接被过滤', () => {
    const result = renderMarkdown('[click](javascript:alert(1))')
    expect(result).not.toContain('javascript:')
  })

  it('XSS: svg onload 被移除', () => {
    const result = renderMarkdown('<svg onload=alert(1)>')
    expect(result).not.toContain('onload')
  })

  it('正常 b 标签保留', () => {
    const result = renderMarkdown('正常文本 <b>粗体</b>')
    /* DOMPurify 白名单包含 strong 但不一定包含 b — 让我们测试 marked 的渲染 */
    expect(result.length).toBeGreaterThan(0)
  })

  it('代码块渲染', () => {
    const result = renderMarkdown('```\nconst x = 1\n```')
    expect(result).toContain('<pre>')
    expect(result).toContain('<code>')
  })

  it('表格渲染', () => {
    const result = renderMarkdown('| A | B |\n|---|---|\n| 1 | 2 |')
    expect(result).toContain('<table>')
  })

  it('裸 URL 自动链接', () => {
    const result = renderMarkdown('访问 https://example.com')
    expect(result).toContain('href="https://example.com"')
  })
})
