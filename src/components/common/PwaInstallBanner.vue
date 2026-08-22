<template>
  <!-- PWA Install Banner — shows only when browser fires beforeinstallprompt -->
  <transition name="banner-slide">
    <div v-if="showBanner" class="pwa-banner" role="banner" aria-label="Ilovani o'rnatish">
      <div class="pwa-banner-inner">
        <!-- Logo -->
        <div class="pwa-logo">
          <img src="/favicon.svg" alt="Nexsora" class="pwa-logo-img" />
        </div>

        <!-- Text -->
        <div class="pwa-text">
          <strong class="pwa-title">Nexsora ilovasini o'rnating!</strong>
          <span class="pwa-desc">Tezroq kirish, offline ishlash va bildirishnomalar</span>
        </div>

        <!-- Actions -->
        <div class="pwa-actions">
          <button class="pwa-install-btn" @click="install">
            <Download :size="15" />
            O'rnatish
          </button>
          <button class="pwa-dismiss-btn" @click="dismiss" aria-label="Yopish">
            <X :size="16" />
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Download, X } from 'lucide-vue-next'

const showBanner = ref(false)
let deferredPrompt = null

// Don't show if user already dismissed within 7 days
const DISMISS_KEY = 'nexsora_pwa_dismissed'
const wasDismissed = () => {
  const ts = localStorage.getItem(DISMISS_KEY)
  if (!ts) return false
  return Date.now() - Number(ts) < 7 * 24 * 60 * 60 * 1000
}

function handleInstallPrompt(e) {
  e.preventDefault()
  deferredPrompt = e
  if (!wasDismissed()) {
    // Small delay so it doesn't pop up immediately on first visit
    setTimeout(() => { showBanner.value = true }, 3000)
  }
}

function handleAppInstalled() {
  showBanner.value = false
  deferredPrompt = null
}

async function install() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  if (outcome === 'accepted') {
    showBanner.value = false
  }
  deferredPrompt = null
}

function dismiss() {
  showBanner.value = false
  localStorage.setItem(DISMISS_KEY, String(Date.now()))
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
})
onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
})
</script>

<style scoped>
.pwa-banner {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9990;
  width: calc(100vw - 32px);
  max-width: 520px;
}

.pwa-banner-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(108,99,255,0.2);
  backdrop-filter: blur(20px);
}

.pwa-logo-img {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  flex-shrink: 0;
}

.pwa-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.pwa-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pwa-desc {
  font-size: 0.75rem;
  color: var(--color-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pwa-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.pwa-install-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--gradient-primary);
  color: #fff;
  border: none;
  padding: 9px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(108, 99, 255, 0.35);
}
.pwa-install-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(108, 99, 255, 0.5);
}

.pwa-dismiss-btn {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-2);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.pwa-dismiss-btn:hover {
  background: var(--color-card-hover);
  color: var(--color-text);
}

/* Transition */
.banner-slide-enter-active,
.banner-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.banner-slide-enter-from,
.banner-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
