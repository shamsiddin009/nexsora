import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { useTheme } from './composables/useTheme'
import { telegramWebApp } from './services/telegramWebApp'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize Theme & Telegram WebApp
useTheme().initTheme()
telegramWebApp.init()

app.mount('#app')


// ─── PWA Service Worker Registration ──────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('✅ Nexsora SW registered:', reg.scope)
      })
      .catch((err) => {
        console.warn('SW registration failed:', err)
      })
  })
}

