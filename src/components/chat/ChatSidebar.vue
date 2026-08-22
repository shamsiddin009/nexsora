<template>
  <aside class="chat-sidebar" :class="{ 'hide-on-mobile': hideOnMobile }">
    <!-- Search & Tools Header -->
    <div class="sidebar-header">
      <div class="search-box">
        <Search :size="16" class="search-icon" />
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          type="text"
          placeholder="Qidiruv..."
          class="search-input"
        />
      </div>
      <button
        class="header-action-btn"
        :title="isMuted ? 'Ovozni yoqish' : 'Ovozni o\'chirish'"
        @click="$emit('update:isMuted', !isMuted)"
      >
        <VolumeX v-if="isMuted" :size="18" />
        <Volume2 v-else :size="18" />
      </button>
    </div>

    <!-- Conversations List -->
    <div class="conversations-scroll">
      <div v-if="loading" class="loading-state">
        <span class="animate-spin loader"></span>
        <span>Yuklanmoqda...</span>
      </div>

      <div v-else-if="filteredChats.length === 0" class="empty-list-state">
        <MessageSquare :size="32" class="empty-list-icon" />
        <p v-if="searchQuery">Mos keluvchi suhbat topilmadi</p>
        <p v-else>Hozircha suhbatlar yo'q</p>
      </div>

      <div v-else class="chat-items-list">
        <ChatListItem
          v-for="chat in filteredChats"
          :key="chat.id"
          :chat="chat"
          :is-active="activeChatId === chat.id"
          :is-starred="starredChats.includes(chat.id)"
          :current-user-id="currentUserId"
          @select="$emit('select-chat', chat.id)"
          @toggle-star="$emit('toggle-star', chat.id)"
          @delete="$emit('delete-chat', chat)"
        />
      </div>
    </div>
  </aside>
</template>

<script setup>
import { Search, Volume2, VolumeX, MessageSquare } from 'lucide-vue-next'
import ChatListItem from './ChatListItem.vue'

defineProps({
  filteredChats: { type: Array, default: () => [] },
  activeChatId: { type: [String, Number], default: null },
  searchQuery: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  isMuted: { type: Boolean, default: false },
  starredChats: { type: Array, default: () => [] },
  currentUserId: { type: String, default: null },
  hideOnMobile: { type: Boolean, default: false },
})

defineEmits(['select-chat', 'toggle-star', 'delete-chat', 'update:searchQuery', 'update:isMuted'])
</script>

<style scoped>
.chat-sidebar {
  width: 380px;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  flex-shrink: 0;
}

.sidebar-header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-surface-2);
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 6px 12px;
  gap: 8px;
}

.search-icon { color: var(--color-muted); }

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 0.88rem;
  outline: none;
}

.search-input::placeholder { color: var(--color-muted); }

.header-action-btn {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-action-btn:hover {
  color: var(--color-text);
  border-color: var(--color-primary);
}

.conversations-scroll {
  flex: 1;
  overflow-y: auto;
}

.loading-state, .empty-list-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--color-muted);
  gap: 12px;
  text-align: center;
  font-size: 0.9rem;
}

.empty-list-icon { opacity: 0.5; }

.chat-items-list {
  display: flex;
  flex-direction: column;
}

.loader {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  display: inline-block;
}

@media (max-width: 768px) {
  .chat-sidebar {
    width: 100%;
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 1;
    transition: transform 0.3s ease;
  }
  .hide-on-mobile {
    display: none;
  }
}
</style>
