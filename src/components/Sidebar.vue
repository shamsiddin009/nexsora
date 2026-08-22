<template>
  <div>
    <!-- Mobile overlay -->
    <div v-if="isOpen" class="overlay" @click="emit('close')"></div>

    <aside class="sidebar" :class="{ 'sidebar-open': isOpen }">
      <!-- Logo -->
      <div class="sidebar-logo">
        <router-link to="/dashboard" class="logo notranslate" translate="no">
          <Wrench :size="20" />
          <span>Nex<span class="logo-accent">sora</span></span>
        </router-link>
        <button class="close-btn" @click="emit('close')">
          <X :size="20" />
        </button>
      </div>

      <!-- User Info -->
      <div class="user-info">
        <div class="avatar-placeholder avatar-md">
          <img
            v-if="authStore.profile?.avatar_url"
            :src="authStore.profile.avatar_url"
            :alt="authStore.profile?.full_name"
            class="avatar-img"
          />
          <span v-else>{{ getInitials(authStore.profile?.full_name || authStore.user?.email) }}</span>
        </div>
        <div class="user-details">
          <div class="user-name">{{ authStore.profile?.full_name || 'Foydalanuvchi' }}</div>
          <div class="user-role">
            {{ authStore.profile?.role === 'client' ? 'Mijoz' : 'Usta' }}
          </div>
        </div>
      </div>

      <hr class="divider" style="margin: 0" />

      <!-- Nav Links -->
      <nav class="nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ 'nav-item-active': route.path === item.path }"
        >
          <component :is="item.icon" :size="20" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <div style="flex: 1"></div>

      <!-- Bottom Actions -->
      <div class="sidebar-bottom">
        <button class="theme-toggle-sidebar" @click="toggleTheme">
          <Sun v-if="currentTheme === 'dark'" :size="16" />
          <Moon v-else :size="16" />
          <span>{{ currentTheme === 'dark' ? 'Oq rejim' : 'Qora rejim' }}</span>
        </button>
        <router-link to="/settings" class="settings-link">
          <Settings :size="16" /> Sozlamalar
        </router-link>
        <button class="logout-btn" @click="handleLogout">
          <LogOut :size="16" /> Chiqish
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getInitials } from '../utils'
import { useTheme } from '../composables/useTheme'
import {
  Wrench, LayoutDashboard, Briefcase, Plus, MessageCircle,
  Bell, User, Settings, LogOut, X, FileText, Sun, Moon
} from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { currentTheme, toggleTheme } = useTheme()

const navItems = computed(() => {
  const isClient = authStore.profile?.role === 'client'
  const isCraftsman = authStore.profile?.role === 'craftsman'

  return [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Boshqaruv' },
    ...(!isCraftsman ? [
      { path: '/services', icon: Wrench, label: 'Xizmatlar' },
    ] : []),
    ...(!isClient ? [
      { path: '/jobs', icon: Briefcase, label: 'Birja' },
    ] : []),
    ...(isClient ? [
      { path: '/jobs/new', icon: Plus, label: 'E\'lon berish' },
      { path: '/my-jobs', icon: Briefcase, label: 'Mening e\'lonlarim' },
    ] : []),
    ...(isCraftsman ? [
      { path: '/services/new', icon: Plus, label: 'Xizmat qo\'shish' },
      { path: '/my-services', icon: Wrench, label: 'Mening xizmatlarim' },
    ] : []),
    { path: '/chat', icon: MessageCircle, label: 'Chatlar' },
    { path: '/notifications', icon: Bell, label: 'Bildirishnomalar' },
    { path: '/profile', icon: User, label: 'Profil' },
  ]
})

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  min-height: calc(100vh - 68px);
  height: calc(100vh - 68px);
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 68px;
  flex-shrink: 0;
  transition: transform 300ms ease;
  z-index: 100;
  overflow-y: auto;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-text);
  text-decoration: none;
}

.logo svg { color: var(--color-primary); }
.logo-accent { color: var(--color-primary-light); }

.close-btn {
  display: none;
  background: none;
  color: var(--color-muted);
  padding: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text);
}

.user-role {
  font-size: 0.75rem;
  color: var(--color-primary-light);
  font-weight: 500;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-2);
  text-decoration: none;
  transition: all 150ms ease;
}

.nav-item:hover {
  color: var(--color-text);
  background: var(--color-surface-2);
}

.nav-item-active {
  color: var(--color-primary-light);
  background: rgba(108,99,255,0.1);
}

.sidebar-bottom {
  padding: 16px 12px;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settings-link, .theme-toggle-sidebar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--color-text-2);
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  text-decoration: none;
  transition: all 150ms ease;
}

.theme-toggle-sidebar:hover, .settings-link:hover {
  color: var(--color-text);
  background: var(--color-surface-2);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--color-error);
  background: none;
  width: 100%;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 99;
  backdrop-filter: blur(4px);
}

@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 68px;
    bottom: 0;
    height: calc(100vh - 68px);
    transform: translateX(-100%);
  }

  .sidebar-open { transform: translateX(0); }
  .close-btn { display: flex; }
}
</style>
