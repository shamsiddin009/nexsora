<template>
  <div class="app-root">
    <Navbar />
    <main class="app-main-content">
      <router-view />
    </main>
    <Footer v-if="showFooter" />
    <ToastContainer />
    <WalletModal />
    <PwaInstallBanner />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import ToastContainer from './components/common/ToastContainer.vue'
import WalletModal from './components/common/WalletModal.vue'
import PwaInstallBanner from './components/common/PwaInstallBanner.vue'
import { useThemeStore } from './stores/theme'

const route = useRoute()
const themeStore = useThemeStore()

onMounted(() => {
  themeStore.applyTheme()
})

const showFooter = computed(() => {
  return !['chats', 'chat-room'].includes(route.name)
})
</script>

<style>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-page);
  color: var(--text-main);
}

.app-main-content {
  padding-top: 68px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Page transitions */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
