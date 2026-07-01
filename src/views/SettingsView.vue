<template>
  <div class="min-h-[100dvh] bg-[var(--surface-primary)] flex flex-col">
    <!-- 顶部栏 -->
    <header class="glass border-b border-[var(--border-subtle)] py-4 px-6 flex items-center gap-4 flex-shrink-0">
      <router-link
        to="/"
        class="p-2 -ml-2 rounded-xl hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 transition-colors"
        aria-label="返回主页"
      >
        <IconChevronLeft :size="20" />
      </router-link>
      <h1 class="text-lg font-semibold tracking-tight">设置</h1>
    </header>

    <!-- 设置项 -->
    <main class="flex-1 max-w-2xl mx-auto w-full p-6 space-y-5">
      <!-- 主题 -->
      <div class="glass rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-medium">外观主题</h3>
          <p class="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
            {{ isDark ? '深色模式' : '浅色模式' }}
          </p>
        </div>
        <button
          class="glass-button rounded-xl py-2 px-4 text-sm flex items-center gap-2"
          @click="toggleTheme"
        >
          <IconSun v-if="isDark" :size="16" />
          <IconMoon v-else :size="16" />
          <span>{{ isDark ? '切换浅色' : '切换深色' }}</span>
        </button>
      </div>

      <!-- API 地址 -->
      <div class="glass rounded-2xl p-5">
        <h3 class="text-sm font-medium mb-3">API 地址</h3>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 font-mono bg-neutral-50 dark:bg-neutral-800/50 rounded-lg px-3 py-2">
          {{ apiBaseUrl || '（使用 Vite 代理）' }}
        </p>
      </div>

      <!-- 模型选择 -->
      <div class="glass rounded-2xl p-5">
        <label class="text-sm font-medium mb-2 block" for="model-select">模型选择</label>
        <select
          id="model-select"
          v-model="selectedModel"
          class="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 px-4 py-3 text-sm outline-none focus:border-accent-500 transition-colors appearance-none"
        >
          <option value="Qwen3-14B">Qwen3-14B</option>
          <option value="Qwen3.6-35B-A3B">Qwen3.6-35B-A3B</option>
        </select>
        <p class="text-xs text-neutral-400 mt-2">模型选择当前为 UI 展示，实际模型由后端控制。</p>
      </div>

      <!-- 流式输出开关 -->
      <div class="glass rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-medium">流式输出</h3>
          <p class="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
            实时显示 AI 回复内容
          </p>
        </div>
        <button
          role="switch"
          :aria-checked="store.isStreaming"
          class="w-12 h-7 rounded-full transition-colors relative flex-shrink-0"
          :class="store.isStreaming ? 'bg-accent-500' : 'bg-neutral-300 dark:bg-neutral-600'"
          @click="store.toggleStreaming()"
        >
          <span
            class="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform"
            :class="store.isStreaming ? 'translate-x-[22px]' : 'translate-x-0.5'"
          />
        </button>
      </div>

      <!-- 关于 -->
      <div class="glass rounded-2xl p-5">
        <h3 class="text-sm font-medium mb-2">关于</h3>
        <p class="text-sm text-neutral-400 dark:text-neutral-500">
          BNBU招生问答助手 v1.0.0
        </p>
        <p class="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
          北京师范大学-香港浸会大学联合国际学院 (BNBU) 招生咨询智能助理
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useTheme } from '@/composables/useTheme'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import IconSun from '@/components/icons/IconSun.vue'
import IconMoon from '@/components/icons/IconMoon.vue'

const store = useChatStore()
const { isDark, toggleTheme } = useTheme()

const selectedModel = ref('Qwen3-14B')

const apiBaseUrl = computed(() => import.meta.env.VITE_API_BASE_URL || '')
</script>
