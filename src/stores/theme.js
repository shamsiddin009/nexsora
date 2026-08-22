import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('nexsora_theme') || 'system')

  function setTheme(newTheme) {
    theme.value = newTheme
    localStorage.setItem('nexsora_theme', newTheme)
    applyTheme()
  }

  function toggleTheme() {
    const next = isDark() ? 'light' : 'dark'
    setTheme(next)
  }

  function isDark() {
    if (theme.value === 'dark') return true
    if (theme.value === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  function applyTheme() {
    const root = document.documentElement
    if (isDark()) {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
    } else {
      root.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
    }
  }

  // Initial application
  applyTheme()

  // Listen to system changes if in system mode
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (theme.value === 'system') {
      applyTheme()
    }
  })

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
    applyTheme
  }
})
