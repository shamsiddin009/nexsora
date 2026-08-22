<template>
  <Teleport to="body">
    <div
      v-if="message"
      class="message-context-backdrop"
      @click="$emit('close')"
      @contextmenu.prevent="$emit('close')"
    >
      <div
        class="telegram-context-wrapper"
        :style="{ top: `${position.y}px`, left: `${position.x}px` }"
        @click.stop
      >
        <!-- Floating Emoji Reactions Bar -->
        <div class="telegram-reactions-bar">
          <button
            v-for="emoji in ['👍', '❤️', '🔥', '👏', '😂', '🤔', '🤝', '🎉']"
            :key="emoji"
            type="button"
            class="telegram-emoji-btn"
            @click="$emit('react', message, emoji)"
          >
            {{ emoji }}
          </button>
        </div>

        <!-- Context Menu Body -->
        <div class="telegram-menu-card">
          <button type="button" class="telegram-menu-item" @click="$emit('reply', message)">
            <Reply :size="18" class="item-icon" />
            <span>Javob yozish</span>
          </button>
          <button type="button" class="telegram-menu-item" @click="$emit('pin', message)">
            <Pin :size="18" class="item-icon" />
            <span>{{ pinnedMessageId === message.id ? 'Qadashdan chiqarish' : 'Qadash' }}</span>
          </button>
          <button type="button" class="telegram-menu-item" @click="$emit('copy', message)">
            <Copy :size="18" class="item-icon" />
            <span>Nusxa olish</span>
          </button>
          <div class="telegram-menu-divider"></div>
          <button type="button" class="telegram-menu-item delete-item" @click="$emit('delete', message)">
            <Trash2 :size="18" class="item-icon" />
            <span>O'chirish</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { Reply, Pin, Copy, Trash2 } from 'lucide-vue-next'

defineProps({
  message: { type: Object, default: null },
  position: { type: Object, default: () => ({ x: 0, y: 0 }) },
  pinnedMessageId: { type: [String, Number], default: null },
})

defineEmits(['close', 'reply', 'pin', 'copy', 'delete', 'react'])
</script>

<style scoped>
.message-context-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: transparent;
  backdrop-filter: none;
}

.telegram-context-wrapper {
  position: fixed;
  z-index: 100000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 32px);
  animation: slideSideIn 0.16s cubic-bezier(0.16, 1, 0.3, 1);
  filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.22));
}

@keyframes slideSideIn {
  from { opacity: 0; transform: scale(0.92) translateX(8px); }
  to { opacity: 1; transform: scale(1) translateX(0); }
}


.telegram-reactions-bar {
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 6px 10px;
  box-shadow: var(--shadow-lg);
}

.telegram-emoji-btn {
  background: transparent;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 4px 5px;
  border-radius: 10px;
  transition: transform 0.15s ease, background 0.15s ease;
  line-height: 1;
}

.telegram-emoji-btn:hover {
  transform: scale(1.28);
  background: var(--color-surface-2);
}

.telegram-menu-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  min-width: 200px;
}

.telegram-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: var(--color-text);
  font-size: 0.92rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s ease;
}

.telegram-menu-item:hover { background: var(--color-surface-2); }

.item-icon { color: var(--color-muted); flex-shrink: 0; }

.telegram-menu-divider {
  height: 1px;
  background: var(--color-border);
  margin: 2px 0;
}

.delete-item { color: var(--color-error, #EF4444); }
.delete-item .item-icon { color: var(--color-error, #EF4444); }
.delete-item:hover { background: rgba(239, 68, 68, 0.08); }
</style>
