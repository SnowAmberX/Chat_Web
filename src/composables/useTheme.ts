import { ref, computed, watch } from 'vue'

type Theme = 'light' | 'dark'

const THEME_KEY = 'theme-preference'
const theme = ref<Theme>('light')

/* 初始化主题 */
function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // ignore
  }

  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

function applyTheme(mode: Theme) {
  theme.value = mode
  document.documentElement.classList.toggle('dark', mode === 'dark')
}

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark')

  /* 初始化 */
  if (typeof document !== 'undefined') {
    applyTheme(getInitialTheme())
  }

  /* 监听系统主题变化 */
  if (typeof window !== 'undefined') {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      /* 仅当无手动偏好时跟随系统 */
      try {
        const stored = localStorage.getItem(THEME_KEY)
        if (!stored) {
          applyTheme(e.matches ? 'dark' : 'light')
        }
      } catch {
        applyTheme(e.matches ? 'dark' : 'light')
      }
    }
    mq?.addEventListener('change', handler)
  }

  function toggleTheme() {
    const next = theme.value === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // ignore
    }
  }

  function setTheme(mode: Theme) {
    applyTheme(mode)
    try {
      localStorage.setItem(THEME_KEY, mode)
    } catch {
      // ignore
    }
  }

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
  }
}
