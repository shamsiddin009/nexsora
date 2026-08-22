import { ref } from 'vue'

const currentTheme = ref(localStorage.getItem('nexsora_theme') || 'dark')

export function useTheme() {
  function setTheme(theme) {
    currentTheme.value = theme
    localStorage.setItem('nexsora_theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function toggleTheme() {
    setTheme(currentTheme.value === 'dark' ? 'light' : 'dark')
  }

  function initTheme() {
    const saved = localStorage.getItem('nexsora_theme') || 'dark'
    setTheme(saved)
  }

  return {
    currentTheme,
    setTheme,
    toggleTheme,
    initTheme,
  }
}
