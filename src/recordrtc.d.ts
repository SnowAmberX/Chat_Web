declare module 'recordrtc' {
  export = RecordRTC

  declare class RecordRTC {
    constructor(stream: MediaStream, config?: RecordRTC.Options)
    static StereoAudioRecorder: typeof RecordRTC.StereoAudioRecorder
    startRecording(): void
    stopRecording(callback: () => void): void
    getBlob(): Blob
    destroy(): void
    getState(): RecordRTC.State
    reset(): void
  }

  declare namespace RecordRTC {
    type State = 'inactive' | 'recording' | 'stopped' | 'paused' | 'destroyed'

    interface Options {
      type?: 'audio' | 'video' | 'gif' | 'canvas'
      mimeType?: string
      recorderType?: typeof StereoAudioRecorder
      numberOfAudioChannels?: number
      desiredSampRate?: number
      checkForInactiveTracks?: boolean
      bufferSize?: number
      sampleRate?: number
      [key: string]: unknown
    }

    class StereoAudioRecorder {
      constructor(stream: MediaStream, config?: Options)
    }
  }
}
