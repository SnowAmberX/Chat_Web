<template>
  <div
    class="flex gap-3 py-4 px-4"
    :class="[message.role === 'user' ? 'flex-row-reverse' : 'flex-row']"
  >
    <!-- 头像 -->
    <div
      class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden"
      :class="message.role === 'user' ? 'bg-accent-500 text-white' : ''"
      :aria-label="message.role === 'user' ? '用户' : 'AI 助手'"
    >
      <IconUser v-if="message.role === 'user'" :size="16" />
      <img
        v-else
        :src="aiAvatarUrl"
        alt="AI 助手"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- 消息气泡 -->
    <div class="max-w-[72%] lg:max-w-[65%]">
      <div
        class="rounded-2xl px-4 py-3 text-sm leading-relaxed"
        :class="
          message.role === 'user'
            ? 'bg-accent-500 text-white rounded-tr-md'
            : 'glass rounded-tl-md'
        "
      >
        <!-- AI 消息：Markdown 渲染 -->
        <div
          v-if="message.role === 'assistant' && message.content"
          class="prose prose-sm"
          v-html="renderedContent"
        />
        <!-- 用户消息：纯文本 -->
        <p v-else-if="message.content" class="whitespace-pre-wrap break-words">
          {{ message.content }}
        </p>
        <!-- 空内容（流式加载中） -->
        <div v-else class="flex items-center gap-1.5 py-1">
          <span class="w-1.5 h-1.5 rounded-full bg-accent-400 animate-bounce" style="animation-delay: 0ms" />
          <span class="w-1.5 h-1.5 rounded-full bg-accent-400 animate-bounce" style="animation-delay: 150ms" />
          <span class="w-1.5 h-1.5 rounded-full bg-accent-400 animate-bounce" style="animation-delay: 300ms" />
        </div>

        <!-- 流式输出光标 -->
        <span
          v-if="isStreaming && isLast && message.role === 'assistant'"
          class="inline-block w-1.5 h-4 bg-accent-500 animate-blink ml-0.5 align-text-bottom rounded-sm"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '@/types'
import { renderMarkdown } from '@/utils/markdown'
import IconUser from './icons/IconUser.vue'

const aiAvatarUrl = import.meta.env.BASE_URL + 'AI.jpg'

const props = defineProps<{
  message: Message
  isStreaming?: boolean
  isLast?: boolean
}>()

const renderedContent = computed(() => {
  if (props.message.role !== 'assistant') return ''
  return renderMarkdown(props.message.content)
})
</script>
