/**
 * 将文本中的裸 URL 转换为 Markdown 链接格式。
 *
 * 处理顺序：
 * 1. 识别现有 Markdown 链接，记录其位置
 * 2. 在非 Markdown 链接区域中查找裸 URL
 * 3. 剥离 URL 尾部标点
 * 4. 转换为 [url](url) 格式
 */
export function linkifyPlainTextUrls(text: string): string {
  // 匹配已有 Markdown 链接
  const mdLinkRe = /\[[^\]]+\]\([^)]+\)/g
  const protectedRanges: Array<[number, number]> = []
  let m: RegExpExecArray | null
  while ((m = mdLinkRe.exec(text)) !== null) {
    protectedRanges.push([m.index, m.index + m[0].length])
  }

  // 判断位置是否在已保护的范围内
  function isProtected(pos: number): boolean {
    return protectedRanges.some(([s, e]) => pos >= s && pos < e)
  }

  // 裸 URL 正则
  const urlRe = /https?:\/\/[A-Za-z0-9\-._~:/?#[\]@!$&'*+,;=%]+/g

  // 尾部标点剥离
  const tailPunctRe = /[,\.\?\!;:，。；：！？）】》\)'"」』]+$/

  const replacements: Array<{ start: number; end: number; replacement: string }> = []
  let um: RegExpExecArray | null
  while ((um = urlRe.exec(text)) !== null) {
    if (isProtected(um.index)) continue
    let raw = um[0]
    raw = raw.replace(tailPunctRe, '')
    replacements.push({
      start: um.index,
      end: um.index + um[0].length,
      replacement: `[${raw}](${raw})`,
    })
  }

  // 从后往前替换，保持索引正确
  let result = text
  for (const r of replacements.reverse()) {
    result = result.slice(0, r.start) + r.replacement + result.slice(r.end)
  }

  return result
}
