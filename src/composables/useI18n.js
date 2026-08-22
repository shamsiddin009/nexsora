import { ref, computed } from 'vue'
import uz from '../locales/uz'
import ru from '../locales/ru'

const currentLocale = ref(localStorage.getItem('nexsora_locale') || 'uz')

const messages = { uz, ru }

export function useI18n() {
  function setLocale(lang) {
    if (messages[lang]) {
      currentLocale.value = lang
      localStorage.setItem('nexsora_locale', lang)
      document.documentElement.lang = lang
    }
  }

  function toggleLocale() {
    setLocale(currentLocale.value === 'uz' ? 'ru' : 'uz')
  }

  function t(path, fallback = '') {
    const keys = path.split('.')
    let current = messages[currentLocale.value]
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key]
      } else {
        return fallback || path
      }
    }
    return current
  }

  const locale = computed(() => currentLocale.value)

  return {
    locale,
    setLocale,
    toggleLocale,
    t,
  }
}
