<template>
  <div class="notifications-page-container">
    <main class="content">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Bildirishnomalar</h1>
          <p>{{ notifications.length }} ta bildirishnoma</p>
        </div>
        <button
          v-if="notifications.length > 0"
          type="button"
          class="btn btn-secondary btn-sm clear-all-btn"
          @click="clearAllNotifications"
        >
          <Trash2 :size="15" />
          <span>Barchasini tozalash</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-box">
        <span class="animate-spin loader"></span>
      </div>

      <!-- Empty State -->
      <div v-else-if="notifications.length === 0" class="empty-box card">
        <Bell :size="48" style="color: var(--color-muted)" />
        <h3>Hali bildirishnoma yo'q</h3>
        <p>Yangi taklif yoki xabar kelganda bu yerda ko'rinadi</p>
      </div>

      <!-- Notifications List -->
      <div v-else class="notif-list">
        <div
          v-for="n in notifications"
          :key="n.id"
          class="notif-item-wrapper"
          :class="{ unread: !n.is_read }"
        >
          <router-link
            :to="n.link || '#'"
            class="notif-link"
          >
            <div class="notif-icon" :class="`notif-${n.type || 'default'}`">
              <component :is="getTypeIcon(n.type)" :size="20" />
            </div>
            <div class="notif-content">
              <div class="notif-title">{{ n.title }}</div>
              <div v-if="n.body" class="notif-body">{{ n.body }}</div>
              <div class="notif-time">{{ formatRelativeTime(n.created_at) }}</div>
            </div>
          </router-link>

          <!-- Delete single notification button -->
          <button
            type="button"
            class="delete-notif-btn"
            title="O'chirish"
            @click.stop="deleteNotification(n.id)"
          >
            <Trash2 :size="16" />
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../services/supabase'
import { formatRelativeTime } from '../utils'
import {
  Bell, Trash2, Mail, MessageSquare, CheckCircle2, Trophy, Sparkles, AlertCircle
} from 'lucide-vue-next'

const authStore = useAuthStore()
const notifications = ref([])
const loading = ref(true)
let channel = null

function getTypeIcon(type) {
  switch (type) {
    case 'new_offer':
      return Mail
    case 'new_message':
      return MessageSquare
    case 'offer_accepted':
      return CheckCircle2
    case 'job_completed':
      return Trophy
    case 'system':
      return Sparkles
    default:
      return Bell
  }
}

async function loadNotifications() {
  if (!authStore.user?.id) return
  loading.value = true
  try {
    let dbNotifs = []
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', authStore.user.id)
        .order('created_at', { ascending: false })
      if (data) dbNotifs = data
    } catch (e) {}

    // Also load local notifications
    let localNotifs = []
    try {
      localNotifs = JSON.parse(localStorage.getItem(`nexsora_notifications_${authStore.user.id}`) || '[]')
    } catch (e) {}

    const dbIds = new Set(dbNotifs.map(n => n.id))
    const uniqueLocals = localNotifs.filter(n => !dbIds.has(n.id))
    const combined = [...dbNotifs, ...uniqueLocals]
    combined.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))

    notifications.value = combined

    // Mark all read in DB and local
    if (combined.some(n => !n.is_read)) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', authStore.user.id)
      } catch (e) {}

      try {
        const markedLocal = localNotifs.map(n => ({ ...n, is_read: true }))
        localStorage.setItem(`nexsora_notifications_${authStore.user.id}`, JSON.stringify(markedLocal))
      } catch (e) {}
    }
  } catch (err) {
    console.error('Notifications error:', err)
  } finally {
    loading.value = false
  }
}

async function deleteNotification(id) {
  notifications.value = notifications.value.filter(n => n.id !== id)
  try {
    await supabase.from('notifications').delete().eq('id', id)
  } catch (err) {
    console.error('Error deleting notification:', err)
  }
}

async function clearAllNotifications() {
  if (!authStore.user?.id) return
  notifications.value = []
  try {
    await supabase.from('notifications').delete().eq('user_id', authStore.user.id)
  } catch (err) {
    console.error('Error clearing notifications:', err)
  }
}

onMounted(() => {
  loadNotifications()

  if (authStore.user?.id) {
    channel = supabase
      .channel(`notifs-view-${authStore.user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${authStore.user.id}`
      }, () => {
        loadNotifications()
      })
      .subscribe()
  }
})

onUnmounted(() => {
  if (channel) supabase.removeChannel(channel)
})
</script>

<style scoped>
.notifications-page-container {
  min-height: calc(100vh - 68px);
  background: var(--color-bg);
  width: 100%;
}

.content {
  padding: 32px clamp(16px, 3.5vw, 32px) 60px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.page-header h1 { font-size: 1.75rem; font-weight: 800; color: var(--color-text); }
.page-header p { color: var(--color-text-2); font-size: 0.95rem; margin-top: 4px; }

.clear-all-btn {
  color: var(--color-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.clear-all-btn:hover {
  color: var(--color-error);
  border-color: rgba(255, 71, 87, 0.4);
}

.notif-list {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.notif-item-wrapper {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  transition: background 150ms ease;
  position: relative;
}

.notif-item-wrapper:last-child {
  border-bottom: none;
}

.notif-item-wrapper:hover {
  background: var(--color-card-hover);
}

.notif-link {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  flex: 1;
  text-decoration: none;
  min-width: 0;
}

.unread {
  background: rgba(108, 99, 255, 0.05);
}

.notif-icon {
  font-size: 1.5rem;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--color-surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-text);
}

.notif-body {
  font-size: 0.88rem;
  color: var(--color-text-2);
  margin-top: 4px;
  line-height: 1.5;
}

.notif-time {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-top: 6px;
}

.delete-notif-btn {
  background: transparent;
  border: none;
  color: var(--color-muted);
  padding: 10px;
  margin-right: 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.notif-item-wrapper:hover .delete-notif-btn {
  opacity: 1;
}

.delete-notif-btn:hover {
  color: var(--color-error);
  background: rgba(255, 71, 87, 0.1);
  transform: scale(1.1);
}

.empty-box, .loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  color: var(--color-muted);
  text-align: center;
  gap: 12px;
}

.loader {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
}

@media (max-width: 640px) {
  .content { padding: 20px 16px 40px; }
  .notif-link { padding: 16px; }
  .delete-notif-btn { margin-right: 10px; opacity: 1; }
}
</style>
