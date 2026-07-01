/** Mock SSE 数据块 */
export const sseChunks = {
  singleLine: 'data: {"choices":[{"delta":{"content":"你好"}}]}\n\n',
  multiChunk: [
    'data: {"choices":[{"delta":{"content":"您"}}]}\n\n',
    'data: {"choices":[{"delta":{"content":"好"}}]}\n\n',
    'data: {"choices":[{"delta":{"content":"，关于"}}]}\n\n',
    'data: {"choices":[{"delta":{"content":"招生"}}]}\n\n',
  ],
  done: 'data: [DONE]\n\n',
  invalidJson: 'data: {invalid}\n\n',
  emptyLine: '\n',
  commentLine: ': heartbeat\n',
  messageContent: 'data: {"choices":[{"message":{"content":"直接返回"}}]}\n\n',

  /** 模拟 UTF-8 跨 chunk 的原始字节：'你好' 的 UTF-8 编码分两段 */
  utf8CrossChunk: {
    part1: new Uint8Array([0xe4, 0xbd]),  // '你' 的前 2 字节
    part2: new Uint8Array([0xa0, 0xe5, 0xa5, 0xbd]), // '你' 的第 3 字节 + '好' 的 3 字节
  },
}
