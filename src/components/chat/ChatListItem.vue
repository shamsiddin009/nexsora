<template>
  <div
    class="chat-list-item"
    :class="{ active: isActive }"
    @click="$emit('select')"
  >
    <!-- Avatar with Online Status -->
    <div class="item-avatar-box">
      <div class="avatar-placeholder avatar-md">
        <img
          v-if="partner?.avatar_url"
          :src="partner.avatar_url"
          :alt="partner?.full_name"
          class="avatar-img"
        />
        <span v-else>{{ getInitials(partner?.full_name) }}</span>
      </div>
      <span class="online-indicator"></span>
    </div>

    <!-- Content Details -->
    <div class="item-details">
      <div class="item-row-top">
        <span class="partner-name">{{ partner?.full_name || 'Foydalanuvchi' }}</span>
        <div class="item-top-right">
          <span class="item-time">{{ formatTimeDisplay(chat.last_message?.created_at || chat.created_at) }}</span>
          <button
            type="button"
            class="star-btn"
            :class="{ 'star-active': isStarred }"
            @click.stop="$emit('toggle-star')"
            title="Saralangan"
          >
            <Star :size="14" />
          </button>
          <button
            type="button"
            class="delete-chat-btn"
            @click.stop="$emit('delete')"
            title="Suhbatni o'chirish"
          >
            <Trash2 :size="13" />
          </button>
        </div>
      </div>

      <div class="item-row-bottom">
        <p class="last-msg-preview">
          <span v-if="chat.last_message?.sender_id === currentUserId" class="sender-prefix">Siz: </span>
          {{ formatLastMessagePreview(chat.last_message?.content) || (chat.jobs?.title ? `${chat.jobs.category} bo'yicha suhbat` : 'Suhbat boshlandi') }}
        </p>
        <span
          v-if="chat.last_message?.sender_id === currentUserId"
          class="msg-check"
          :class="{ 'check-read': chat.last_message?.is_read }"
        >
          <CheckCheck :size="15" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Star, Trash2, CheckCheck } from 'lucide-vue-next'
import { getInitials } from '../../utils'

const props = defineProps({
  chat: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
  isStarred: { type: Boolean, default: false },
  currentUserId: { type: String, default: null },
})

defineEmits(['select', 'toggle-star', 'delete'])

const partner = computed(() => {
  if (!props.chat) return null
  return props.chat.client_id === props.currentUserId
    ? props.chat.craftsman
    : props.chat.client
})

function formatTimeDisplay(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function formatLastMessagePreview(content) {
  if (!content) return ''
  return content.replace(/^\[reply:[^\]]+\]\n/, '')
}
</script>

<style scoped>
.chat-list-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  gap: 12px;
  cursor: pointer;
  transition: background 0.15s ease;
  position: relative;
}

.chat-list-item:hover { background: var(--color-surface-2); }
.chat-list-item.active {
  background: color-mix(in srgb, var(--color-primary) 12%, var(--color-surface-2));
  border-left: 3px solid var(--color-primary);
}

.item-avatar-box { position: relative; flex-shrink: 0; }

.online-indicator {
  position: absolute;
  bottom: 0; right: 0;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--color-success);
  border: 2px solid var(--color-surface);
}

.item-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.partner-name {
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-top-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.item-time { font-size: 0.72rem; color: var(--color-muted); }

.star-btn {
  background: transparent;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  transition: color 0.15s ease;
}

.star-btn:hover, .star-active { color: #F7B731; }

.delete-chat-btn {
  background: transparent;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  padding: 3px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.15s ease;
}

.chat-list-item:hover .delete-chat-btn { opacity: 1; }
.delete-chat-btn:hover {
  color: var(--color-error, #EF4444);
  background: rgba(239, 68, 68, 0.12);
}

@media (max-width: 768px) {
  .delete-chat-btn { opacity: 0.75; }
}

.item-row-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.last-msg-preview {
  font-size: 0.8rem;
  color: var(--color-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.sender-prefix { font-weight: 600; color: var(--color-text); }

.msg-check {
  color: var(--color-muted);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.check-read { color: var(--color-primary-light); }
</style>
