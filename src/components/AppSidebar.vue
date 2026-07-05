<template>
  <!-- 桌面端侧边栏 -->
  <aside
    class="hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col"
    style="width: var(--sidebar-width)"
  >
    <div class="glass-strong h-full flex flex-col border-r border-[var(--glass-border)]">
      <!-- 头部 -->
      <div class="px-4 pt-5 pb-3">
        <div class="flex items-center justify-between mb-1">
          <div>
            <h1 class="text-sm font-semibold tracking-tight">BNBU招生问答助手</h1>
            <p class="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">招生咨询智能助理</p>
          </div>
          <button
            class="p-2 rounded-xl hover:bg-neutral-200/80 dark:hover:bg-neutral-700/60 hover:scale-110 hover:shadow-md transition-all active:scale-95"
            :aria-label="isDark ? '切换浅色模式' : '切换深色模式'"
            @click="emit('toggleTheme')"
          >
            <IconSun v-if="isDark" :size="18" />
            <IconMoon v-else :size="18" />
          </button>
        </div>
      </div>
      <!-- 会话列表 -->
      <div class="flex-1 px-3 overflow-hidden">
        <SessionList
          :sessions="sessions"
          :current-session-id="currentSessionId"
          @select="emit('selectSession', $event)"
          @delete="emit('deleteSession', $event)"
          @new-session="emit('newSession')"
        />
      </div>
      <!-- 底部 -->
      <div class="p-4 border-t border-[var(--border-subtle)]">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-7 h-7 rounded-full bg-accent-500 text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
              {{ userDisplayName?.[0] ?? '?' }}
            </div>
            <span class="text-[13px] truncate text-neutral-700 dark:text-neutral-300">{{ userDisplayName || '未登录' }}</span>
          </div>

        </div>
      </div>
    </div>
  </aside>

  <!-- 移动端抽屉 -->
  <Teleport to="body">
    <Transition name="slide-left">
      <div v-if="isOpen" class="fixed inset-0 z-50 md:hidden" @click.self="emit('close')">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <aside class="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] z-10">
          <div class="glass-strong h-full flex flex-col">
            <div class="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <h1 class="text-sm font-semibold">BNBU招生问答助手</h1>
              <button
                class="p-2 rounded-xl hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 transition-colors"
                aria-label="关闭菜单"
                @click="emit('close')"
              >
                <IconClose :size="18" />
              </button>
            </div>
            <div class="flex-1 p-3 overflow-hidden">
              <SessionList
                :sessions="sessions"
                :current-session-id="currentSessionId"
                @select="onSelect"
                @delete="emit('deleteSession', $event)"
                @new-session="onNew"
              />
            </div>
            <div class="p-4 border-t border-[var(--border-subtle)]">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-accent-500 text-white flex items-center justify-center text-xs font-medium">
                    {{ userDisplayName?.[0] ?? '?' }}
                  </div>
                  <span class="text-[13px] truncate">{{ userDisplayName || '未登录' }}</span>
                </div>
              </div>
              <div class="flex gap-2">
                <button class="glass-button rounded-xl py-2 text-xs flex items-center justify-center gap-1.5 w-full" @click="emit('toggleTheme')">
                  <IconSun v-if="isDark" :size="14" />
                  <IconMoon v-else :size="14" />
                  <span>{{ isDark ? '浅色' : '深色' }}</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { ClientSession } from '@/types'
import IconSun from './icons/IconSun.vue'
import IconMoon from './icons/IconMoon.vue'
import IconClose from './icons/IconClose.vue'
import SessionList from './SessionList.vue'

defineProps<{
  isOpen: boolean
  sessions: ClientSession[]
  currentSessionId: string
  userDisplayName: string
  isDark: boolean
}>()

const emit = defineEmits<{
  close: []
  selectSession: [sessionId: string]
  deleteSession: [sessionId: string]
  newSession: []
  toggleTheme: []
}>()

function onSelect(id: string) { emit('selectSession', id); emit('close') }
function onNew() { emit('newSession'); emit('close') }
</script>
