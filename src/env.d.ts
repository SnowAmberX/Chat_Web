/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_CHAT_BACKEND_URL: string
  readonly VITE_WHISPER_URL: string
  readonly VITE_CHAT_TIMEOUT_MS: string
  readonly VITE_DEV_MOCK_RAG_CHAT: string
  readonly VITE_PROXY_TARGET: string
  readonly VITE_APP_TITLE: string
  readonly VITE_STREAMING_ENABLED: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
