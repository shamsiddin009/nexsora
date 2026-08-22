<template>
  <header class="header-wrapper">
    <!-- Top Accent Bar -->
    <div class="top-accent-bar"></div>

    <nav class="navbar">
      <div class="nav-container">
        
        <!-- Brand Logo -->
        <router-link to="/" class="logo" translate="no">
          <div class="logo-icon-box">
            <Wrench :size="20" />
          </div>
          <div class="logo-text-box">
            <span class="logo-main notranslate" translate="no">Nex<span class="logo-accent">sora</span></span>
            <span class="logo-sub">USTALAR BOZORI</span>
          </div>
        </router-link>

        <!-- 1. FOR CRAFTSMAN (USTA NAV) -->
        <template v-if="authStore.isCraftsman">
          <form class="search-form" @submit.prevent="handleSearch">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Birjadagi buyurtmalarni qidirish..."
              class="search-input"
            />
            <button type="submit" class="search-btn" title="Qidirish">
              <Search :size="16" />
            </button>
          </form>

          <div class="nav-links">
            <router-link to="/jobs" class="nav-link">
              <Briefcase :size="15" />
              <span>Birja</span>
            </router-link>

            <router-link to="/brigades" class="nav-link">
              <HardHat :size="15" />
              <span>Brigadalar</span>
            </router-link>

            <router-link to="/my-services" class="nav-link">
              <Wrench :size="15" />
              <span>Xizmatlarim</span>
            </router-link>

            <router-link to="/chat" class="nav-link chat-link">
              <MessageCircle :size="16" />
              <span>Chat</span>
              <span v-if="unreadChatCount > 0" class="badge-count chat-badge">{{ unreadChatCount }}</span>
            </router-link>
          </div>
        </template>

        <!-- 2. FOR CLIENT (MIJOZ NAV) -->
        <template v-else-if="authStore.isClient">
          <form class="search-form" @submit.prevent="handleSearch">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Kerakli usta yoki xizmatni qidirish..."
              class="search-input"
            />
            <button type="submit" class="search-btn" title="Qidirish">
              <Search :size="16" />
            </button>
          </form>

          <div class="nav-links">
            <router-link to="/services" class="nav-link">
              <Wrench :size="15" />
              <span>Usta Qidirish</span>
            </router-link>

            <router-link to="/my-jobs" class="nav-link">
              <Briefcase :size="15" />
              <span>E'lonlarim</span>
            </router-link>

            <router-link to="/jobs/new" class="nav-link new-job-link">
              <Plus :size="15" />
              <span>E'lon Joylash</span>
            </router-link>

            <router-link to="/chat" class="nav-link chat-link">
              <MessageCircle :size="16" />
              <span>Chat</span>
              <span v-if="unreadChatCount > 0" class="badge-count chat-badge">{{ unreadChatCount }}</span>
            </router-link>
          </div>
        </template>

        <!-- 3. FOR GUEST (MEHMON NAV) -->
        <template v-else>
          <form class="search-form" @submit.prevent="handleSearch">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Xizmatlar yoki ustalarni qidirish..."
              class="search-input"
            />
            <button type="submit" class="search-btn" title="Qidirish">
              <Search :size="16" />
            </button>
          </form>

          <div class="nav-links">
            <router-link to="/services" class="nav-link">
              <span>Xizmatlar</span>
            </router-link>
            <router-link to="/jobs" class="nav-link">
              <span>Birja</span>
            </router-link>
            <router-link to="/jobs/new" class="nav-link new-job-link">
              <Plus :size="15" />
              <span>E'lon berish</span>
            </router-link>
          </div>
        </template>


        <!-- Right Side: User Menu or Auth Buttons -->
        <div class="nav-right">
          <!-- Notifications Bell (when authenticated) -->
          <router-link
            v-if="authStore.isAuthenticated"
            to="/notifications"
            class="notif-btn"
            :title="unreadNotifCount > 0 ? `${unreadNotifCount} ta yangi bildirishnoma` : 'Bildirishnomalar'"
          >
            <Bell :size="18" />
            <span v-if="unreadNotifCount > 0" class="badge-count">{{ unreadNotifCount }}</span>
          </router-link>

          <!-- Theme Toggle Button -->
          <button
            class="theme-toggle-btn"
            @click="toggleTheme"
            :title="currentTheme === 'dark' ? 'Oq rejimga o\'tish' : 'Qora rejimga o\'tish'"
          >
            <Sun v-if="currentTheme === 'dark'" :size="18" />
            <Moon v-else :size="18" />
          </button>

          <template v-if="authStore.isAuthenticated">
            <!-- Balance / Wallet indicator -->
            <button class="balance-badge" @click="walletStore.openWalletModal" title="Hamyon & Balansni boshqarish">
              <Wallet :size="13" class="text-success" />
              <span class="balance-amount">{{ walletStore.balanceFormatted }}</span>
              <span class="balance-currency">so'm</span>
            </button>

            <!-- Profile Dropdown Trigger -->
            <div class="profile-dropdown-wrapper" ref="dropdownRef">
              <button class="profile-trigger-btn" @click="dropdownOpen = !dropdownOpen">
                <div class="avatar-placeholder avatar-sm">
                  <img
                    v-if="authStore.profile?.avatar_url"
                    :src="authStore.profile.avatar_url"
                    :alt="authStore.profile?.full_name"
                    class="avatar-img"
                  />
                  <span v-else>{{ getInitials(authStore.profile?.full_name || authStore.user?.email) }}</span>
                </div>
                <span class="trigger-name">{{ authStore.profile?.full_name?.split(' ')[0] || 'Profil' }}</span>
                <ChevronDown :size="15" class="chevron-icon" :class="{ 'rotate-180': dropdownOpen }" />
              </button>

              <!-- Dropdown Menu -->
              <transition name="dropdown-anim">
                <div v-if="dropdownOpen" class="dropdown-menu">
                  <div class="dropdown-header">
                    <div class="avatar-placeholder avatar-md">
                      <img
                        v-if="authStore.profile?.avatar_url"
                        :src="authStore.profile.avatar_url"
                        :alt="authStore.profile?.full_name"
                        class="avatar-img"
                      />
                      <span v-else>{{ getInitials(authStore.profile?.full_name || authStore.user?.email) }}</span>
                    </div>
                    <div class="dropdown-user-details">
                      <div class="user-name">{{ authStore.profile?.full_name || 'Foydalanuvchi' }}</div>
                      <div class="user-role-badge">
                        {{ authStore.profile?.role === 'client' ? 'Mijoz' : 'Usta' }}
                      </div>
                    </div>
                  </div>

                  <div class="dropdown-divider"></div>


                  <router-link v-if="authStore.isAdmin" to="/admin" class="dropdown-item admin-dropdown-item" @click="dropdownOpen = false">
                    <ShieldCheck :size="16" class="text-primary" />
                    <span style="font-weight: 700">Super Admin Panel</span>
                    <span class="badge badge-primary" style="font-size: 0.65rem; margin-left: auto;">CRM</span>
                  </router-link>

                  <router-link to="/dashboard" class="dropdown-item" @click="dropdownOpen = false">
                    <LayoutDashboard :size="16" />
                    <span>Shaxsiy kabinet</span>
                  </router-link>


                  <router-link to="/bookmarks" class="dropdown-item" @click="dropdownOpen = false">
                    <Heart :size="16" />
                    <span style="flex:1">Saqlanganlar</span>
                    <span v-if="bookmarkStore.totalBookmarks > 0" class="dropdown-unread-pill">{{ bookmarkStore.totalBookmarks }}</span>
                  </router-link>

                  <router-link v-if="authStore.isClient" to="/my-jobs" class="dropdown-item" @click="dropdownOpen = false">
                    <Briefcase :size="16" />
                    <span>Mening e'lonlarim</span>
                  </router-link>

                  <router-link v-if="authStore.isCraftsman" to="/my-services" class="dropdown-item" @click="dropdownOpen = false">
                    <Wrench :size="16" />
                    <span>Mening xizmatlarim</span>
                  </router-link>


                  <router-link to="/profile" class="dropdown-item" @click="dropdownOpen = false">
                    <User :size="16" />
                    <span>Mening profilim</span>
                  </router-link>

                  <router-link to="/settings" class="dropdown-item" @click="dropdownOpen = false">
                    <Settings :size="16" />
                    <span>Sozlamalar</span>
                  </router-link>

                  <router-link to="/notifications" class="dropdown-item" @click="dropdownOpen = false">
                    <Bell :size="16" />
                    <span style="flex: 1">Bildirishnomalar</span>
                    <span v-if="unreadNotifCount > 0" class="dropdown-unread-pill">{{ unreadNotifCount }} ta yangi</span>
                  </router-link>

                  <div class="dropdown-divider"></div>

                  <button class="dropdown-item logout-item" @click="handleLogout">
                    <LogOut :size="16" />
                    <span>Chiqish</span>
                  </button>
                </div>
              </transition>
            </div>
          </template>

          <template v-else>
            <router-link to="/login" class="btn btn-ghost btn-sm hide-mobile">
              Kirish
            </router-link>
            <router-link to="/register" class="btn btn-primary btn-sm hide-mobile">
              Ro'yxatdan o'tish
            </router-link>
          </template>

          <!-- Mobile Menu Button -->
          <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Menyu">
            <Menu v-if="!mobileMenuOpen" :size="22" />
            <X v-else :size="22" />
          </button>
        </div>

      </div>

      <!-- Mobile Dropdown Nav Drawer -->
      <transition name="mobile-menu-anim">
        <div v-if="mobileMenuOpen" class="mobile-nav-drawer">
          <form class="mobile-search-form" @submit.prevent="handleSearch">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="authStore.isCraftsman ? 'Mijozlar loyihalari & ishlarini toping...' : 'Xizmatlarni toping...'"
              class="search-input"
            />
            <button type="submit" class="search-btn" title="Qidirish">
              <Search :size="18" />
            </button>
          </form>

          <div class="mobile-nav-links">
            <!-- CRAFTSMAN MOBILE LINKS -->
            <template v-if="authStore.isCraftsman">
              <router-link to="/jobs" class="mobile-nav-link" @click="mobileMenuOpen = false">
                <Briefcase :size="18" />
                <span>Birjadagi Ishlar</span>
              </router-link>
              <router-link to="/my-services" class="mobile-nav-link" @click="mobileMenuOpen = false">
                <Wrench :size="18" />
                <span>Mening Xizmatlarim</span>
              </router-link>
            </template>

            <!-- CLIENT MOBILE LINKS -->
            <template v-else-if="authStore.isClient">
              <router-link to="/services" class="mobile-nav-link" @click="mobileMenuOpen = false">
                <Wrench :size="18" />
                <span>Usta Qidirish</span>
              </router-link>
              <router-link to="/my-jobs" class="mobile-nav-link" @click="mobileMenuOpen = false">
                <Briefcase :size="18" />
                <span>Mening E'lonlarim</span>
              </router-link>
              <router-link to="/jobs/new" class="mobile-nav-link" @click="mobileMenuOpen = false">
                <Plus :size="18" />
                <span>E'lon Joylash</span>
              </router-link>
            </template>

            <!-- GUEST MOBILE LINKS -->
            <template v-else>
              <router-link to="/services" class="mobile-nav-link" @click="mobileMenuOpen = false">
                <Wrench :size="18" />
                <span>Xizmatlar Katalogi</span>
              </router-link>
              <router-link to="/jobs" class="mobile-nav-link" @click="mobileMenuOpen = false">
                <Briefcase :size="18" />
                <span>Ishlar Birjasi</span>
              </router-link>
            </template>

            <router-link :to="authStore.isAuthenticated ? '/dashboard' : '/login'" class="mobile-nav-link" @click="mobileMenuOpen = false">
              <LayoutDashboard :size="18" />
              <span>Boshqaruv Paneli</span>
            </router-link>
            <router-link :to="authStore.isAuthenticated ? '/notifications' : '/login'" class="mobile-nav-link" @click="mobileMenuOpen = false">
              <Bell :size="18" />
              <span>Bildirishnomalar</span>
              <span v-if="unreadNotifCount > 0" class="mobile-unread-pill">{{ unreadNotifCount }} ta yangi</span>
            </router-link>
            <router-link :to="authStore.isAuthenticated ? '/chat' : '/login'" class="mobile-nav-link" @click="mobileMenuOpen = false">
              <MessageCircle :size="18" />
              <span>Chat</span>
              <span v-if="unreadChatCount > 0" class="mobile-unread-pill">{{ unreadChatCount }} ta yangi</span>
            </router-link>
            <router-link :to="authStore.isAuthenticated ? '/profile' : '/login'" class="mobile-nav-link" @click="mobileMenuOpen = false">
              <User :size="18" />
              <span>Profil</span>
            </router-link>


            <div v-if="!authStore.isAuthenticated" class="mobile-auth-actions">
              <router-link to="/login" class="btn btn-ghost w-full" @click="mobileMenuOpen = false">
                Kirish
              </router-link>
              <router-link to="/register" class="btn btn-primary w-full" @click="mobileMenuOpen = false">
                Ro'yxatdan o'tish
              </router-link>
            </div>
            <div v-else class="mobile-auth-actions">
              <button class="btn btn-danger w-full" @click="handleLogout">
                <LogOut :size="16" /> Chiqish
              </button>
            </div>
          </div>
        </div>
      </transition>
    </nav>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import {
  Wrench, Search, ChevronDown, LayoutDashboard, User,
  Bell, LogOut, Menu, X, Briefcase, MessageCircle, Sun, Moon,
  Plus, Settings, Wallet, ShieldCheck, Heart, HardHat, RefreshCw
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useWalletStore } from '../stores/walletStore'
import { useBookmarkStore } from '../stores/bookmarkStore'
import { supabase } from '../services/supabase'
import { getInitials } from '../utils'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const walletStore = useWalletStore()
const bookmarkStore = useBookmarkStore()
const { currentTheme, toggleTheme } = useTheme()

async function handleQuickRoleSwitch() {
  const nextRole = authStore.isCraftsman ? 'client' : 'craftsman'
  dropdownOpen.value = false
  await authStore.switchRole(nextRole)
  router.push('/dashboard')
}


const searchQuery = ref('')
const dropdownOpen = ref(false)
const dropdownRef = ref(null)
const mobileMenuOpen = ref(false)

const unreadNotifCount = ref(0)
const unreadChatCount = ref(0)
let notifChannel = null
let msgChannel = null

async function fetchUnreadCounts() {
  if (!authStore.user?.id) {
    unreadNotifCount.value = 0
    unreadChatCount.value = 0
    return
  }

  try {
    // 1. Fetch unread notifications
    let dbCount = 0
    const { count: notifs, error: notifErr } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authStore.user.id)
      .eq('is_read', false)

    if (!notifErr && typeof notifs === 'number') {
      dbCount = notifs
    }

    // Check local storage notifications
    let localCount = 0
    try {
      const savedNotifs = JSON.parse(localStorage.getItem(`nexsora_notifications_${authStore.user.id}`) || '[]')
      localCount = savedNotifs.filter(n => !n.is_read).length
    } catch (e) {}

    unreadNotifCount.value = Math.max(dbCount, localCount)

    // 2. Fetch unread messages
    if (route.path.startsWith('/chat')) {
      unreadChatCount.value = 0
    } else {
      const { count: msgs, error: msgErr } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .neq('sender_id', authStore.user.id)
        .eq('is_read', false)

      if (!msgErr && typeof msgs === 'number') {
        unreadChatCount.value = msgs
      }
    }
  } catch (e) {
    console.error('Error fetching unread counts:', e)
  }
}

function handleCustomNotifEvent() {
  fetchUnreadCounts()
}

function setupRealtime() {
  if (!authStore.user?.id) return

  if (notifChannel) supabase.removeChannel(notifChannel)
  if (msgChannel) supabase.removeChannel(msgChannel)

  window.addEventListener('nexsora:notification', handleCustomNotifEvent)

  notifChannel = supabase
    .channel(`navbar-notifs-${authStore.user.id}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${authStore.user.id}`
    }, () => {
      fetchUnreadCounts()
    })
    .subscribe()

  msgChannel = supabase
    .channel(`navbar-msgs-${authStore.user.id}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'messages'
    }, () => {
      fetchUnreadCounts()
    })
    .subscribe()
}

watch(() => authStore.user, (user) => {
  if (user) {
    fetchUnreadCounts()
    setupRealtime()
  } else {
    unreadNotifCount.value = 0
    unreadChatCount.value = 0
  }
}, { immediate: true })

watch(() => route.path, (path) => {
  if (path === '/notifications') {
    unreadNotifCount.value = 0
  }
  if (path.startsWith('/chat')) {
    unreadChatCount.value = 0
  }
}, { immediate: true })

function handleSearch() {
  mobileMenuOpen.value = false
  const targetPath = authStore.isCraftsman ? '/jobs' : '/services'
  if (searchQuery.value.trim()) {
    router.push({ path: targetPath, query: { q: searchQuery.value.trim() } })
  } else {
    router.push(targetPath)
  }
}

async function handleLogout() {
  dropdownOpen.value = false
  mobileMenuOpen.value = false
  await authStore.logout()
  router.push('/')
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  fetchUnreadCounts()
  setupRealtime()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (notifChannel) supabase.removeChannel(notifChannel)
  if (msgChannel) supabase.removeChannel(msgChannel)
})
</script>

<style scoped>
.header-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.top-accent-bar {
  height: 4px;
  width: 100%;
  background: linear-gradient(90deg, #6C63FF 0%, #FF6584 50%, #43E97B 100%);
}

.navbar {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
  padding: 10px 0;
  transition: background 250ms ease, border-color 250ms ease;
}

.nav-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 clamp(16px, 3.5vw, 32px);
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(108,99,255,0.2) 0%, rgba(255,101,132,0.2) 100%);
  border: 1px solid rgba(108,99,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-light);
}

.logo-text-box {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.logo-main {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.3px;
}

.logo-accent {
  color: var(--color-primary-light);
}

.logo-sub {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--color-muted);
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

/* Search Form */
.search-form {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 280px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  overflow: hidden;
  transition: all 200ms ease;
  height: 38px;
}

.search-form:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(108,99,255,0.15);
}

.search-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  padding: 6px 14px;
  color: var(--color-text);
  font-size: 0.82rem;
  outline: none;
}

.search-input::placeholder {
  color: var(--color-muted);
}

.search-btn {
  background: var(--color-primary);
  color: #FFFFFF;
  border: none;
  padding: 0 12px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 150ms ease;
}

.search-btn:hover {
  background: #584ee8;
}

/* Nav Links */
.nav-links {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.nav-link {

  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-2);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 150ms ease;
  position: relative;
}

.nav-link:hover, .nav-link.router-link-active {
  color: var(--color-text);
}

.badge-tag {
  color: var(--color-primary-light);
}

.chat-link {
  position: relative;
}

.unread-dot {
  width: 7px;
  height: 7px;
  background: var(--color-secondary);
  border-radius: 50%;
  position: absolute;
  top: -2px;
  right: -8px;
}

.new-job-link {
  color: var(--color-primary-light);
  background: rgba(108, 99, 255, 0.08);
  padding: 5px 12px;
  border-radius: 8px;
}

.new-job-link:hover {
  background: rgba(108, 99, 255, 0.15);
}

/* Right Section */
.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.notif-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-2);
  text-decoration: none;
  position: relative;
  transition: all 150ms ease;
}

.notif-btn:hover {
  background: var(--color-card-hover);
  border-color: var(--color-primary);
  color: var(--color-primary-light);
  transform: scale(1.05);
}

.badge-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background: linear-gradient(135deg, #FF6584 0%, #FF4757 100%);
  color: white;
  font-size: 0.68rem;
  font-weight: 800;
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 2px 6px rgba(255, 71, 87, 0.4);
  border: 2px solid var(--color-surface);
  line-height: 1;
}

.chat-badge {
  position: static;
  margin-left: 2px;
}

.dropdown-unread-pill {
  font-size: 0.72rem;
  font-weight: 700;
  color: #FF6584;
  background: rgba(255, 101, 132, 0.12);
  border: 1px solid rgba(255, 101, 132, 0.25);
  padding: 2px 8px;
  border-radius: 999px;
}

.mobile-unread-pill {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  background: #FF4757;
  padding: 2px 8px;
  border-radius: 999px;
}

.theme-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  cursor: pointer;
  transition: all 150ms ease;
}

.theme-toggle-btn:hover {
  background: var(--color-card-hover);
  border-color: var(--color-primary);
  color: var(--color-primary-light);
  transform: scale(1.05);
}

/* Balance Badge */
.balance-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(67, 233, 123, 0.12);
  border: 1px solid rgba(67, 233, 123, 0.25);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-success);
}

.balance-currency {
  font-size: 0.72rem;
  font-weight: 500;
  opacity: 0.85;
}

/* Profile Dropdown */
.profile-dropdown-wrapper {
  position: relative;
}

.profile-trigger-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid var(--color-border);
  padding: 3px 8px 3px 3px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 150ms ease;
}

.profile-trigger-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-surface-2);
}

.trigger-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
  padding-left: 2px;
}

.chevron-icon {
  color: var(--color-text-2);
  transition: transform 200ms ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Dropdown Menu Box */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 230px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 12px;
  box-shadow: var(--shadow-lg), var(--shadow-glow-sm);
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 1100;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 4px;
}

.dropdown-user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-text);
}

.user-role-badge {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-primary-light);
}

.dropdown-divider {
  height: 1px;
  background: var(--color-border);
  margin: 6px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-2);
  text-decoration: none;
  background: transparent;
  border: none;
  width: 100%;
  cursor: pointer;
  transition: all 150ms ease;
}

.dropdown-item:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.logout-item {
  color: var(--color-error);
}

.logout-item:hover {
  background: rgba(255, 71, 87, 0.12);
  color: var(--color-error);
}

/* Animations */
.dropdown-anim-enter-active,
.dropdown-anim-leave-active {
  transition: all 150ms ease;
}

.dropdown-anim-enter-from,
.dropdown-anim-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

.mobile-menu-btn {
  display: none;
  background: transparent;
  color: var(--color-text);
  padding: 6px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
}

.mobile-nav-drawer {
  display: none;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 16px 20px 24px;
  flex-direction: column;
  gap: 16px;
}

.mobile-search-form {
  display: flex;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-2);
  text-decoration: none;
  transition: all 150ms ease;
}

.mobile-nav-link:hover, .mobile-nav-link.router-link-active {
  background: var(--color-surface-2);
  color: var(--color-primary-light);
}

.mobile-auth-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
}

.w-full { width: 100%; }

.mobile-menu-anim-enter-active,
.mobile-menu-anim-leave-active {
  transition: all 200ms ease;
}

.mobile-menu-anim-enter-from,
.mobile-menu-anim-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 1024px) {
  .search-form { max-width: 240px; }
  .nav-links { gap: 16px; }
}

@media (max-width: 768px) {
  .search-form, .nav-links, .hide-mobile, .balance-badge {
    display: none;
  }
  .mobile-menu-btn {
    display: flex;
  }
  .mobile-nav-drawer {
    display: flex;
  }
}
</style>
