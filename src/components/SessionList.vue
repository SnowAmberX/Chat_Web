<template>
  <div class="flex flex-col h-full">
    <!-- 新建会话按钮 -->
    <button
      class="glass-button rounded-xl py-2.5 px-4 flex items-center gap-3 text-sm font-medium w-full transition-all"
      aria-label="新建对话"
      @click="$emit('newSession')"
    >
      <IconPlus :size="18" />
      <span>新建对话</span>
    </button>

    <!-- 会话列表 -->
    <div class="flex-1 overflow-y-auto mt-3 space-y-0.5" role="listbox" aria-label="会话列表">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="w-full text-left rounded-xl py-2.5 px-3 text-sm transition-all flex items-center justify-between group cursor-pointer"
        :class="
          session.id === currentSessionId
            ? 'glass'
            : 'hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40'
        "
        :aria-selected="session.id === currentSessionId"
        role="option"
        tabindex="0"
        @click="$emit('select', session.id)"
        @keydown.enter="$emit('select', session.id)"
        @keydown.space.prevent="$emit('select', session.id)"
      >
        <span class="truncate flex-1 text-[13px] leading-tight">
          {{ session.title }}
        </span>
        <button
          class="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 transition-all flex-shrink-0 ml-1"
          :aria-label="`删除会话: ${session.title}`"
          @click.stop="$emit('delete', session.id)"
        >
          <IconTrash :size="14" class="text-neutral-400 hover:text-red-500 transition-colors" />
        </button>
      </div>

      <!-- 空状态 -->
      <div v-if="sessions.length === 0" class="text-center py-12">
        <IconBot :size="28" class="mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
        <p class="text-xs text-neutral-400 dark:text-neutral-500">
          暂无对话记录
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ClientSession } from '@/types'
import IconPlus from './icons/IconPlus.vue'
import IconTrash from './icons/IconTrash.vue'
import IconBot from './icons/IconBot.vue'

defineProps<{
  sessions: ClientSession[]
  currentSessionId: string
}>()

defineEmits<{
  select: [sessionId: string]
  delete: [sessionId: string]
  newSession: []
}>()
</script>
