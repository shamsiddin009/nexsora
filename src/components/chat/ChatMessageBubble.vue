<template>
  <div
    class="message-row"
    :id="`msg-${message.id}`"
    :class="[
      isMine ? 'msg-mine' : 'msg-partner',
      isSystemCelebration ? 'msg-system-celebration' : '',
      isSystemRevision ? 'msg-system-revision' : '',
      isSystemFixed ? 'msg-system-fixed' : '',
      isHighlighted ? 'msg-highlighted' : '',
      isMenuActive ? 'msg-menu-active' : ''
    ]"
  >
    <div class="message-bubble-wrapper">
      <div
        class="bubble"
        :class="{ 'bubble-with-image': isImageMessage }"
        @contextmenu.prevent="$emit('open-menu', $event, message)"
      >


        <!-- Quoted Reply -->
        <div
          v-if="replyQuote"
          class="bubble-reply-quote"
          @click.stop="$emit('scroll-to', replyQuote.id)"
          title="Asl xabarga o'tish"
        >
          <div class="quote-bar"></div>
          <div class="quote-content">
            <span class="quote-author">{{ replyQuote.author }}</span>
            <span class="quote-text">{{ replyQuote.snippet }}</span>
          </div>
        </div>

        <!-- 1. Voice Message Bubble -->
        <AudioMessageBubble
          v-if="isVoice"
          :duration="voiceDuration"
          :audio-url="voiceAudioUrl"
          :is-mine="isMine"
        />

        <!-- 2. Image Message Bubble -->
        <div v-else-if="isImageMessage" class="bubble-image-container" @click.stop="openImageLightbox">
          <img :src="imageUrl" alt="Yuborilgan rasm" class="bubble-image" />
          <div v-if="imageCaption" class="bubble-image-caption">{{ imageCaption }}</div>
        </div>

        <!-- 3. Standard Text Message -->
        <div v-else class="bubble-text">{{ displayContent }}</div>

        <div class="bubble-meta">
          <span v-if="isPinned" class="pin-mini-badge" title="Qadalgan xabar">
            <Pin :size="11" />
          </span>
          <span class="time">{{ formattedTime }}</span>
          <CheckCheck
            v-if="isMine"
            :size="13"
            class="read-check"
            :class="{ 'read-done': message.is_read }"
          />
        </div>
      </div>

      <!-- Reaction Badges -->
      <div
        v-if="Object.keys(reactions).length > 0"
        class="message-reactions-row"
      >
        <button
          v-for="(count, emoji) in reactions"
          :key="emoji"
          type="button"
          class="reaction-badge-item"
          @click.stop="$emit('toggle-reaction', message, emoji)"
        >
          <span class="emoji-symbol">{{ emoji }}</span>
          <span v-if="count > 1" class="emoji-count">{{ count }}</span>
        </button>
      </div>
    </div>

    <!-- Image Lightbox Modal -->
    <Teleport to="body">
      <div v-if="showLightbox" class="lightbox-overlay" @click="showLightbox = false">
        <div class="lightbox-modal-content" @click.stop>
          <button class="lightbox-close-btn" @click="showLightbox = false">
            <X :size="24" />
          </button>
          <img :src="imageUrl" alt="Rasm kattalashtirilgan" class="lightbox-full-img" />
          <p v-if="imageCaption" class="lightbox-caption-text">{{ imageCaption }}</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Pin, CheckCheck, X } from 'lucide-vue-next'
import AudioMessageBubble from './AudioMessageBubble.vue'

const props = defineProps({
  message: { type: Object, required: true },
  currentUserId: { type: String, default: null },
  pinnedMessageId: { type: [String, Number], default: null },
  highlightedMessageId: { type: [String, Number], default: null },
  activeMenuMessageId: { type: [String, Number], default: null },
  reactions: { type: Object, default: () => ({}) },
  replyQuote: { type: Object, default: null },
})

defineEmits(['open-menu', 'scroll-to', 'toggle-reaction'])

const showLightbox = ref(false)

const isMine = computed(() => props.message.sender_id === props.currentUserId)
const isPinned = computed(() => props.pinnedMessageId === props.message.id)
const isHighlighted = computed(() => props.highlightedMessageId === props.message.id)
const isMenuActive = computed(() => props.activeMenuMessageId === props.message.id)

const isVoice = computed(() =>
  typeof props.message.content === 'string' && props.message.content.startsWith('[VOICE')
)

const voiceDuration = computed(() => {
  if (!isVoice.value) return 5
  const match = props.message.content.match(/\[VOICE:(\d+)(?:\|[^\]]+)?\]/)
  return match ? Number(match[1]) : 5
})

const voiceAudioUrl = computed(() => {
  if (!isVoice.value) return ''
  const match = props.message.content.match(/\[VOICE:\d+\|([^\]]+)\]/)
  return match ? match[1] : ''
})

const isImageMessage = computed(() => {
  return typeof props.message.content === 'string' && props.message.content.includes('[IMAGE:')
})

const imageUrl = computed(() => {
  if (!isImageMessage.value) return ''
  const match = props.message.content.match(/\[IMAGE:([^\]]+)\]/)
  return match ? match[1] : ''
})

const imageCaption = computed(() => {
  if (!isImageMessage.value) return ''
  return props.message.content.replace(/^\[reply:[^\]]+\]\n/, '').replace(/\[IMAGE:[^\]]+\]\s*/, '').trim()
})

const displayContent = computed(() => {
  if (!props.message.content) return ''
  return props.message.content.replace(/^\[reply:[^\]]+\]\n/, '')
})

const formattedTime = computed(() => {
  if (!props.message.created_at) return ''
  return new Date(props.message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

const isSystemCelebration = computed(() =>
  props.message.content?.startsWith('🎉 Ish mijoz tomonidan') ||
  props.message.content?.startsWith('⭐ Usta mijozni')
)
const isSystemRevision = computed(() =>
  props.message.content?.startsWith('🔄 ISHNI QAYTA ISHLASH')
)
const isSystemFixed = computed(() =>
  props.message.content?.startsWith('✅ KAMCHILIKLAR BARTARAF ETILDI')
)

function openImageLightbox() {
  showLightbox.value = true
}
</script>

<style scoped>
.message-row {
  display: flex;
  width: 100%;
}

.msg-mine { justify-content: flex-end; }
.msg-partner { justify-content: flex-start; }

.message-bubble-wrapper {
  position: relative;
  max-width: 72%;
  display: flex;
  flex-direction: column;
}

.msg-mine .message-bubble-wrapper { align-items: flex-end; }
.msg-partner .message-bubble-wrapper { align-items: flex-start; }

.bubble {
  padding: 10px 16px 8px;
  border-radius: 18px;
  font-size: 0.92rem;
  line-height: 1.45;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: default;
}

.bubble-with-image {
  padding: 6px 6px 8px;
}

.msg-mine .bubble {
  background: var(--gradient-primary);
  color: white;
  border-bottom-right-radius: 4px;
}

.msg-partner .bubble {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-bottom-left-radius: 4px;
}

.bubble-image-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
}

.bubble-image {
  max-width: 320px;
  max-height: 280px;
  width: 100%;
  border-radius: 14px;
  object-fit: cover;
  transition: opacity 0.15s ease;
}

.bubble-image:hover {
  opacity: 0.95;
}

.bubble-image-caption {
  padding: 0 8px;
  font-size: 0.9rem;
  line-height: 1.4;
}

.bubble-reply-quote {
  display: flex;
  align-items: stretch;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 10px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.msg-mine .bubble-reply-quote { background: rgba(0,0,0,0.18); }
.msg-partner .bubble-reply-quote { background: var(--color-surface-2); }
.bubble-reply-quote:hover { opacity: 0.9; }

.quote-bar {
  width: 3px;
  border-radius: 2px;
  background: var(--color-primary-light);
  flex-shrink: 0;
}

.quote-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 1px;
}

.quote-author {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-primary-light);
}

.msg-mine .quote-author { color: #E0E7FF; }

.quote-text {
  font-size: 0.78rem;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
}

.bubble-text { word-break: break-word; white-space: pre-line; }

.bubble-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  font-size: 0.68rem;
  opacity: 0.8;
  padding: 0 4px;
}

.pin-mini-badge { display: flex; align-items: center; opacity: 0.85; }
.msg-mine .bubble-meta { color: rgba(255,255,255,0.85); }
.msg-partner .bubble-meta { color: var(--color-muted); }

.read-check { opacity: 0.7; }
.read-done { opacity: 1; color: #38F9D7; }

.msg-highlighted .bubble {
  box-shadow: 0 0 0 3px var(--color-primary-light), 0 6px 24px rgba(108, 99, 255, 0.4);
  transform: scale(1.02);
}

.message-reactions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.reaction-badge-item {
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 2px 7px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.reaction-badge-item:hover {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface));
}

.emoji-count { font-size: 0.75rem; font-weight: 700; color: var(--color-text); }

/* Lightbox */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(6px);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.lightbox-modal-content {
  position: relative;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
}

.lightbox-full-img {
  max-width: 100%;
  max-height: 80vh;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
  object-fit: contain;
}

.lightbox-caption-text {
  color: white;
  margin-top: 12px;
  font-size: 0.95rem;
  text-align: center;
}
</style>
