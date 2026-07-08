<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="store.showContactModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
      >
        <!-- 背景遮罩 -->
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="handleDismiss" />

        <!-- 弹窗 -->
        <div class="glass-strong rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl">
          <div class="text-center mb-6">
            <div class="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <IconAlert :size="22" />
            </div>
            <h2 id="contact-title" class="text-lg font-semibold">联系招生老师</h2>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
              请留下手机号，招生老师将尽快联系您。
            </p>
          </div>

          <form @submit.prevent="handleSubmit">
            <label class="text-sm font-medium mb-2 block" for="phone">手机号</label>
            <input
              id="phone"
              v-model="phone"
              type="tel"
              class="w-full rounded-xl border bg-white/50 dark:bg-neutral-800/50 px-4 py-3 text-sm outline-none transition-colors"
              :class="
                phoneError
                  ? 'border-red-400 dark:border-red-500'
                  : 'border-neutral-200 dark:border-neutral-700 focus:border-accent-500'
              "
              placeholder="请输入手机号"
              aria-describedby="phone-error"
              autofocus
            />

            <p v-if="phoneError" id="phone-error" class="text-red-500 text-xs mt-2">
              {{ phoneError }}
            </p>

            <div class="flex gap-3 mt-5">
              <button
                type="button"
                class="flex-1 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 font-medium text-sm transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-[0.98]"
                @click="handleDismiss"
              >
                稍后再说
              </button>
              <button
                type="submit"
                :disabled="!isPhoneValid || isSubmitting"
                class="flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-200 active:scale-[0.98]"
                :class="
                  isPhoneValid && !isSubmitting
                    ? 'bg-accent-500 text-white shadow-sm shadow-accent-500/25 hover:bg-accent-600'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                "
              >
                <span v-if="isSubmitting" class="inline-flex items-center gap-1.5">
                  <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  提交中
                </span>
                <span v-else>提交</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { validatePhone } from '@/utils/validation'
import { sendAlert } from '@/api/alert'
import { saveUserPhone } from '@/api/records'
import IconAlert from './icons/IconAlert.vue'

const store = useChatStore()

const phone = ref('')
const phoneError = ref('')
const isSubmitting = ref(false)

/* 实时校验 */
watch(phone, (val) => {
  if (val && !validatePhone(val)) {
    phoneError.value = '请输入正确的手机号格式'
  } else {
    phoneError.value = ''
  }
})

const isPhoneValid = computed(() => validatePhone(phone.value))

async function handleSubmit() {
  if (!isPhoneValid.value) {
    phoneError.value = '请输入正确的手机号'
    return
  }

  isSubmitting.value = true

  try {
    /* 先加密保存手机号到数据库 */
    const cleanedPhone = phone.value.replace(/\s/g, '')
    await saveUserPhone(store.currentUserId, cleanedPhone)
    /* 再发送告警通知 */
    await sendAlert({
      studentName: store.currentDisplayName || store.currentUserId,
      contact: cleanedPhone,
      sessionId: store.pendingSessionId,
      intentType: store.pendingAlertType ?? 'high_intent',
      messageSnippet: store.pendingMessageSnippet,
      userId: store.currentUserId,
    })
    store.markContactCompleted()
    phone.value = ''
  } catch (err: unknown) {
    phoneError.value = err instanceof Error ? err.message : '提交失败，请重试'
  } finally {
    isSubmitting.value = false
  }
}

function handleDismiss() {
  store.markContactDismissed()
  phone.value = ''
  phoneError.value = ''
}
</script>
