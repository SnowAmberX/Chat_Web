<template>
  <router-view />
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

/* 初始化主题（设置 document.documentElement 上的 dark 类） */
useTheme()
</script>
