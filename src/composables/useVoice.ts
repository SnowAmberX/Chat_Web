import { ref, onBeforeUnmount } from 'vue'
import RecordRTC from 'recordrtc'
import { transcribeAudio } from '@/api/whisper'
import { useChatStore } from '@/stores/chat'
import type { RecordingState } from '@/types'

export function useVoice() {
  const store = useChatStore()
  const recordingState = ref<RecordingState>('idle')
  const isSupported = ref(false)
  const isToggling = ref(false)

  let stream: MediaStream | null = null
  let recorder: RecordRTC | null = null
  let abortController: AbortController | null = null

  /* 检测浏览器支持 */
  if (typeof navigator !== 'undefined') {
    isSupported.value = !!navigator.mediaDevices?.getUserMedia
  }

  function cleanupMedia() {
    if (recorder) {
      try {
        recorder.destroy()
      } catch {
        // ignore
      }
      recorder = null
    }
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      stream = null
    }
  }

  async function startRecording() {
    if (isToggling.value || recordingState.value !== 'idle') return

    isToggling.value = true

    try {
      /* 先清理之前的残余 */
      cleanupMedia()

      stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000,
        checkForInactiveTracks: true,
      })

      recorder.startRecording()
      recordingState.value = 'recording'
    } catch {
      /* 权限被拒绝或不支持 */
      store.addMessage({
        id: `voice-error-${Date.now()}`,
        content: '无法访问麦克风，请检查权限设置。',
        role: 'assistant',
        timestamp: Date.now(),
      })
    } finally {
      isToggling.value = false
    }
  }

  async function stopRecording(): Promise<string | null> {
    if (!recorder || recordingState.value !== 'recording') return null

    return new Promise((resolve) => {
      recorder!.stopRecording(async () => {
        /* 停止录音，释放资源 */
        stream?.getTracks().forEach((t) => t.stop())

        /* 获取音频 Blob */
        const blob = recorder!.getBlob()
        cleanupMedia()

        recordingState.value = 'transcribing'

        abortController = new AbortController()

        try {
          const text = await transcribeAudio(blob, abortController.signal)
          recordingState.value = 'idle'
          resolve(text)
        } catch (err: unknown) {
          recordingState.value = 'idle'
          const errMsg = err instanceof Error ? err.message : '语音识别失败'
          /* 以 AI 助手消息形式显示错误 */
          store.addMessage({
            id: `whisper-error-${Date.now()}`,
            content: errMsg,
            role: 'assistant',
            timestamp: Date.now(),
          })
          resolve(null)
        } finally {
          abortController = null
        }
      })
    })
  }

  function abortTranscribing() {
    abortController?.abort()
    abortController = null
    recordingState.value = 'idle'
  }

  onBeforeUnmount(() => {
    abortTranscribing()
    cleanupMedia()
  })

  return {
    recordingState,
    isSupported,
    isToggling,
    startRecording,
    stopRecording,
    abortTranscribing,
  }
}
