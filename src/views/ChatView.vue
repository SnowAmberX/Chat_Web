<template>
  <div class="h-screen flex flex-col bg-[var(--surface-primary)]">
    <!-- 移动端顶部栏 -->
    <header
      class="md:hidden glass border-b border-[var(--border-subtle)] py-3 px-4 flex items-center justify-between flex-shrink-0"
    >
      <button
        class="p-2 -ml-2 rounded-xl hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 transition-colors"
        aria-label="打开菜单"
        @click="sidebarOpen = true"
      >
        <IconMenu :size="20" />
      </button>
      <h1 class="text-sm font-semibold tracking-tight">BNBU招生问答助手</h1>
      <div class="w-8" />
    </header>

    <div class="flex flex-1 overflow-hidden md:pl-[var(--sidebar-width)]">
      <main class="flex-1 flex flex-col min-w-0">
        <!-- 消息区域 -->
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto"
          role="log"
          aria-live="polite"
          :aria-busy="store.isCurrentSessionLoading"
        >
          <!-- 欢迎状态 -->
          <div
            v-if="store.messages.length === 0 && !store.isCurrentSessionLoading"
            class="flex items-center justify-center h-full px-4"
          >
            <div class="text-center max-w-sm">
              <div class="w-16 h-16 rounded-2xl bg-accent-100 dark:bg-accent-900/30 text-accent-500 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <IconBot :size="32" />
              </div>
              <p class="text-lg font-semibold tracking-tight">您好！我是BNBU招生助手</p>
              <p class="text-sm text-neutral-400 dark:text-neutral-500 mt-2">
                有什么我能帮您的吗？
              </p>
            </div>
          </div>

          <!-- 消息列表 -->
          <div class="max-w-3xl mx-auto">
            <TransitionGroup name="message" tag="div">
              <ChatMessage
                v-for="(msg, idx) in store.messages"
                :key="msg.id"
                :message="msg"
                :is-streaming="
                  store.isCurrentSessionLoading &&
                  idx === store.messages.length - 1 &&
                  msg.role === 'assistant'
                "
                :is-last="idx === store.messages.length - 1"
              />
            </TransitionGroup>
          </div>

          <!-- 上下文超限提示 -->
          <div v-if="overflowDetected" class="text-center py-6 px-4">
            <div class="inline-flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-xl px-4 py-3">
              <IconAlert :size="16" />
              <span>对话轮次已达到上限，请开启新对话</span>
            </div>
            <br />
            <button
              class="text-sm text-accent-500 mt-3 hover:underline font-medium"
              @click="handleNewSession"
            >
              开启新对话
            </button>
          </div>
        </div>

        <!-- 输入区域 -->
        <ChatInput
          :disabled="store.isCurrentSessionLoading"
          :is-recording="recordingState === 'recording'"
          :recording-state="recordingState"
          :voice-supported="voiceSupported"
          @send="handleSend"
          @start-recording="handleStartRecording"
          @stop-recording="handleStopRecording"
        />

        <!-- 快捷联系入口 -->
        <div
          v-if="store.contactModalState === 'dismissed'"
          class="text-center pb-3"
        >
          <button
            class="text-xs text-accent-500 hover:underline transition-colors"
            @click="store.resetContactState(); store.showContactModal = true"
          >
            找不到人工入口？点击这里联系招生老师
          </button>
        </div>
      </main>
    </div>

    <!-- 侧边栏 -->
    <AppSidebar
      :is-open="sidebarOpen"
      :sessions="store.sessions"
      :current-session-id="store.currentSessionId"
      :user-display-name="store.currentDisplayName"
      :is-dark="isDark"
      @close="sidebarOpen = false"
      @select-session="handleSwitchSession"
      @delete-session="handleDeleteSession"
      @new-session="handleNewSession"
      @toggle-theme="toggleTheme"
      @navigate-settings="sidebarOpen = false"
    />

    <!-- 弹窗 -->
    <WelcomeModal @registered="handleRegistered" />
    <ContactModal />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useChat } from '@/composables/useChat'
import { useVoice } from '@/composables/useVoice'
import { useTheme } from '@/composables/useTheme'
import ChatMessage from '@/components/ChatMessage.vue'
import ChatInput from '@/components/ChatInput.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import WelcomeModal from '@/components/WelcomeModal.vue'
import ContactModal from '@/components/ContactModal.vue'
import IconMenu from '@/components/icons/IconMenu.vue'
import IconBot from '@/components/icons/IconBot.vue'
import IconAlert from '@/components/icons/IconAlert.vue'

const store = useChatStore()
const { sendMessage, overflowDetected } = useChat()
const { recordingState, isSupported: voiceSupported, startRecording, stopRecording } = useVoice()
const { isDark, toggleTheme } = useTheme()

const sidebarOpen = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

/* 自动滚动 */
function scrollToBottom() {
  nextTick(() => {
    const el = messagesContainer.value
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    if (nearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  })
}

/* 监听消息变化 */
watch(
  () => store.messages.length,
  () => scrollToBottom(),
)

/* 监听流式内容变化 */
watch(
  () => {
    const last = store.messages[store.messages.length - 1]
    return last?.content
  },
  () => scrollToBottom(),
)

/* 处理函数 */
async function handleSend(text: string) {
  overflowDetected.value = false
  await sendMessage(text)
}

function handleNewSession() {
  store.createNewSession()
  overflowDetected.value = false
}

async function handleSwitchSession(id: string) {
  await store.switchSession(id)
  overflowDetected.value = false
  nextTick(() => scrollToBottom())
}

async function handleDeleteSession(id: string) {
  if (store.sessions.length <= 1) {
    await store.deleteSession(id)
  } else {
    const confirmed = window.confirm('确定要删除这个对话吗？')
    if (confirmed) {
      await store.deleteSession(id)
    }
  }
}

async function handleRegistered() {
  await store.loadSessionsFromDB()
}

function handleStartRecording() {
  startRecording()
}

async function handleStopRecording() {
  const text = await stopRecording()
  if (text) {
    await sendMessage(text)
  }
}
</script>
