<template>
  <div class="px-4 pb-4 pt-2">
    <div class="glass-strong rounded-2xl px-4 py-2 max-w-3xl mx-auto">
      <div class="flex items-end gap-2">
        <!-- 文本输入区 -->
        <textarea
          ref="textareaRef"
          v-model="text"
          class="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed py-2 min-h-[44px] max-h-[120px] placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          :placeholder="isRecording ? '录音中...' : '输入您的问题...'"
          rows="1"
          :disabled="disabled || isRecording"
          aria-label="消息输入框"
          @input="autoResize"
          @keydown="handleKeydown"
        />

        <!-- 麦克风按钮 -->
        <button
          v-if="voiceSupported"
          class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
          :class="
            isRecording
              ? 'text-red-500 bg-red-50 dark:bg-red-950/30'
              : 'text-neutral-400 hover:text-accent-500 hover:bg-accent-50 dark:hover:bg-accent-950/20'
          "
          :aria-label="isRecording ? '停止录音' : '开始录音'"
          :disabled="disabled && !isRecording"
          @click="toggleRecording"
        >
          <IconMicOff v-if="isRecording" :size="18" />
          <IconMic v-else :size="18" />
        </button>

        <!-- 发送按钮 -->
        <button
          class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 active:scale-95"
          :class="
            canSend
              ? 'bg-accent-500 text-white shadow-sm shadow-accent-500/25 hover:bg-accent-600'
              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
          "
          :disabled="!canSend"
          aria-label="发送消息"
          @click="handleSend"
        >
          <IconSend :size="18" />
        </button>
      </div>

      <!-- 录音指示器 -->
      <div
        v-if="isRecording"
        class="flex items-center gap-2 mt-2 text-xs text-red-500 animate-pulse"
      >
        <span class="w-2 h-2 rounded-full bg-red-500" />
        <span>录音中，点击麦克风结束录音</span>
      </div>

      <!-- 转写中 -->
      <div
        v-if="recordingState === 'transcribing'"
        class="flex items-center gap-2 mt-2 text-xs text-neutral-400"
      >
        <span class="w-2 h-2 rounded-full bg-accent-400 animate-bounce" />
        <span>语音识别中...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import IconSend from './icons/IconSend.vue'
import IconMic from './icons/IconMic.vue'
import IconMicOff from './icons/IconMicOff.vue'

const props = defineProps<{
  disabled?: boolean
  isRecording?: boolean
  recordingState?: string
  voiceSupported?: boolean
}>()

const emit = defineEmits<{
  send: [text: string]
  startRecording: []
  stopRecording: []
}>()

const text = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const canSend = computed(() => text.value.trim().length > 0 && !props.disabled)

function autoResize() {
  nextTick(() => {
    const el = textareaRef.value
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function handleSend() {
  const trimmed = text.value.trim()
  if (!trimmed || props.disabled) return
  emit('send', trimmed)
  text.value = ''
  nextTick(() => {
    const el = textareaRef.value
    if (el) {
      el.style.height = 'auto'
    }
  })
}

function toggleRecording() {
  if (props.isRecording) {
    emit('stopRecording')
  } else {
    emit('startRecording')
  }
}
</script>
