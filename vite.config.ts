import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8000'
  const chatBackend = env.VITE_CHAT_BACKEND_URL || 'http://localhost:9000'

  const proxy = {
    '/v1': {
      target: proxyTarget,
      changeOrigin: true,
      secure: false,
    },
    '/api/chat': {
      target: chatBackend,
      changeOrigin: true,
      secure: false,
      xfwd: true,
    },
    '/api/alert': {
      target: chatBackend,
      changeOrigin: true,
      secure: false,
      xfwd: true,
    },
    '/api/dashboard': {
      target: chatBackend,
      changeOrigin: true,
      secure: false,
      xfwd: true,
    },
    '/api/statistic': {
      target: chatBackend,
      changeOrigin: true,
      secure: false,
      xfwd: true,
    },
    '/api/ip': {
      target: chatBackend,
      changeOrigin: true,
      secure: false,
      xfwd: true,
    },
    '/ws/dashboard': {
      target: chatBackend.replace(/^http/, 'ws'),
      ws: true,
      changeOrigin: true,
      secure: false,
    },
    '/dashboard': {
      target: chatBackend,
      changeOrigin: true,
      secure: false,
    },
  }

  return {
    base: '/RAGWEB/',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [vue(), tailwindcss()],
    server: { proxy },
    preview: { proxy },
  }
})
