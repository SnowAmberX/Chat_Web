<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
      >
        <!-- 背景遮罩 -->
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" />

        <!-- 弹窗 -->
        <div class="glass-strong rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl">
          <div class="text-center mb-6">
            <div class="w-14 h-14 rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg shadow-accent-500/25">
              <img :src="aiAvatarUrl" alt="AI 助手" class="w-full h-full object-cover" />
            </div>
            <h2 id="welcome-title" class="text-xl font-semibold tracking-tight">欢迎使用 BNBU 招生助手</h2>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              请告诉我您的称呼，以便为您提供更好的服务。
            </p>
          </div>

          <form @submit.prevent="handleSubmit">
            <label class="text-sm font-medium mb-2 block" for="display-name">您的称呼</label>
            <input
              id="display-name"
              v-model="displayName"
              type="text"
              class="w-full rounded-xl border bg-white/50 dark:bg-neutral-800/50 px-4 py-3 text-sm outline-none transition-colors"
              :class="
                error
                  ? 'border-red-400 dark:border-red-500'
                  : 'border-neutral-200 dark:border-neutral-700 focus:border-accent-500'
              "
              placeholder="请输入您的姓名或昵称"
              maxlength="64"
              :disabled="isSubmitting"
              aria-describedby="name-error"
              autofocus
            />

            <p v-if="error" id="name-error" class="text-red-500 text-xs mt-2">{{ error }}</p>

            <button
              type="submit"
              :disabled="!isValid || isSubmitting"
              class="w-full mt-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 active:scale-[0.98]"
              :class="
                isValid && !isSubmitting
                  ? 'bg-accent-500 text-white shadow-sm shadow-accent-500/25 hover:bg-accent-600'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
              "
            >
              <span v-if="isSubmitting" class="inline-flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                注册中...
              </span>
              <span v-else>开始咨询</span>
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { registerUser } from '@/api/records'
import { useChatStore } from '@/stores/chat'

const aiAvatarUrl = import.meta.env.BASE_URL + 'AI.jpg'

const emit = defineEmits<{
  registered: []
}>()

const store = useChatStore()

/* 判断是否需要显示 */
const visible = computed(() => !store.currentUserId || !store.currentDisplayName)

const displayName = ref('')
const error = ref('')
const isSubmitting = ref(false)

const isValid = computed(() => displayName.value.trim().length >= 1)

async function handleSubmit() {
  error.value = ''

  if (!isValid.value) {
    error.value = '请输入您的称呼'
    return
  }

  isSubmitting.value = true

  try {
    const result = await registerUser(displayName.value.trim())
    store.setUserInfo(result.id.toString(), result.username)
    emit('registered')
    displayName.value = ''
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : '注册失败，请重试'
  } finally {
    isSubmitting.value = false
  }
}
</script>
