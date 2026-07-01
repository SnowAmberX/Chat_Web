import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { linkifyPlainTextUrls } from './url'

/* marked 全局配置 */
marked.setOptions({
  breaks: true,
  gfm: true,
})

/* DOMPurify 白名单配置 */
const ALLOWED_TAGS: string[] = [
  'p', 'br', 'strong', 'em', 'u', 's', 'del',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'hr', 'img', 'sup', 'sub', 'span', 'div',
]

const ALLOWED_ATTR: string[] = ['href', 'src', 'alt', 'title', 'target', 'class']

/**
 * 安全渲染 Markdown 文本为 HTML。
 *
 * 流程：URL 预处理 → marked 解析 → DOMPurify 净化 → 外链安全属性
 */
export function renderMarkdown(text: string): string {
  // 1. URL 自动链接
  const linked = linkifyPlainTextUrls(text)

  // 2. Markdown → HTML
  const raw = marked.parse(linked, { breaks: true, gfm: true }) as string
  if (typeof raw !== 'string') return ''

  // 3. DOMPurify 净化
  const clean = DOMPurify.sanitize(raw, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  })

  // 4. 外链添加安全属性
  const doc = new DOMParser().parseFromString(clean, 'text/html')
  doc.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href')
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      a.setAttribute('target', '_blank')
      a.setAttribute('rel', 'noopener noreferrer')
    }
  })

  return doc.body.innerHTML
}
