/**
 * 语音识别 — 上传音频到 Whisper 服务并获取转写文本。
 *
 * 使用原生 fetch（multipart/form-data 上传）。
 * 服务不可用时返回具体错误消息，不阻塞文本输入。
 */
export async function transcribeAudio(
  audioBlob: Blob,
  signal?: AbortSignal,
): Promise<string> {
  const whisperUrl = import.meta.env.VITE_WHISPER_URL || 'http://localhost:7860'
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  try {
    const formData = new FormData()
    formData.append('file', audioBlob, `recording-${Date.now()}.wav`)

    const response = await fetch(`${whisperUrl}/transcribe`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMsg: string
      try {
        const parsed = JSON.parse(errorText)
        errorMsg = parsed.error || `语音识别失败：HTTP ${response.status}`
      } catch {
        errorMsg = `语音识别失败：HTTP ${response.status}`
      }
      throw new Error(errorMsg)
    }

    const data = await response.json()
    return data.text ?? ''
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('语音识别请求超时，请稍后重试。')
    }
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('无法连接到语音识别服务，请确保服务已启动。')
    }
    throw err instanceof Error ? err : new Error('语音识别失败')
  } finally {
    clearTimeout(timeoutId)
  }
}
