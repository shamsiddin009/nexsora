<template>
  <div class="conversation-footer-wrapper">
    <!-- Reply Preview Bar -->
    <div v-if="replyingTo" class="reply-preview-bar">
      <div class="reply-preview-left">
        <CornerDownRight :size="16" class="reply-icon" />
        <div class="reply-preview-text">
          <span class="reply-to-name">Javob berilmoqda: <strong>{{ replySenderName }}</strong></span>
          <span class="reply-to-snippet">{{ replySnippet }}</span>
        </div>
      </div>
      <button type="button" class="cancel-reply-btn" title="Bekor qilish" @click="$emit('cancel-reply')">
        <X :size="16" />
      </button>
    </div>

    <!-- Image Attachment Preview Bar (Before Sending) -->
    <div v-if="attachedImage" class="attachment-preview-bar">
      <div class="attachment-thumb-box">
        <img :src="attachedImage" alt="Biriktirilgan rasm" class="attachment-thumb" />
        <button type="button" class="remove-attachment-btn" @click="attachedImage = null" title="Olib tashlash">
          <X :size="14" />
        </button>
      </div>
      <span class="attachment-note">Rasm biriktirildi. Xabar matni bilan birga yuborishingiz mumkin.</span>
    </div>

    <!-- Voice Recorder -->
    <VoiceRecorder
      v-if="isRecordingVoice"
      @recorded="$emit('voice-recorded', $event)"
      @cancel="$emit('stop-recording')"
    />

    <!-- Text Input Bar -->
    <form v-else class="conversation-input-bar" @submit.prevent="handleFormSubmit">
      <!-- Hidden File Input -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        style="display: none"
        @change="handleFileSelected"
      />

      <!-- Attach Photo Button -->
      <button
        type="button"
        class="attach-action-btn"
        title="Rasm biriktirish"
        :disabled="compressingImage"
        @click="triggerFileInput"
      >
        <span v-if="compressingImage" class="animate-spin loader-xs"></span>
        <Paperclip v-else :size="18" />
      </button>

      <textarea
        ref="inputRef"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="message-input"
        :placeholder="replyingTo ? 'Javob yozing... (Enter — yuborish)' : 'Xabar yozing... (Enter — yuborish)'"
        rows="1"
        @keydown.enter.exact.prevent="handleFormSubmit"
      />

      <!-- Send Button -->
      <button
        v-if="modelValue.trim() || attachedImage"
        type="submit"
        class="send-action-btn"
        :disabled="sending || compressingImage"
        title="Yuborish"
      >
        <Send :size="18" />
      </button>

      <!-- Mic Button -->
      <button
        v-else
        type="button"
        class="mic-action-btn"
        title="Ovozli xabar yozish"
        @click="$emit('start-recording')"
      >
        <Mic :size="18" />
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Send, Mic, X, CornerDownRight, Paperclip } from 'lucide-vue-next'
import VoiceRecorder from './VoiceRecorder.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  replyingTo: { type: Object, default: null },
  replySenderName: { type: String, default: '' },
  replySnippet: { type: String, default: '' },
  sending: { type: Boolean, default: false },
  isRecordingVoice: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:modelValue',
  'send',
  'send-with-image',
  'cancel-reply',
  'voice-recorded',
  'start-recording',
  'stop-recording'
])

const inputRef = ref(null)
const fileInputRef = ref(null)
const attachedImage = ref(null)
const compressingImage = ref(false)

function focus() {
  inputRef.value?.focus()
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
    }
    reader.onerror = reject
  })
}

async function handleFileSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return
  compressingImage.value = true
  try {
    const dataUrl = await compressImage(file)
    attachedImage.value = dataUrl
  } catch (err) {
    console.error('Image compression error:', err)
  } finally {
    compressingImage.value = false
    if (event.target) event.target.value = ''
  }
}

function handleFormSubmit() {
  if (attachedImage.value) {
    emit('send-with-image', {
      text: props.modelValue,
      image: attachedImage.value
    })
    attachedImage.value = null
  } else {
    emit('send')
  }
}

defineExpose({ focus })
</script>

<style scoped>
.conversation-footer-wrapper {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}

.reply-preview-bar {
  padding: 8px 20px;
  background: color-mix(in srgb, var(--color-surface-2) 90%, var(--color-primary) 10%);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  animation: slideUpFast 0.2s ease;
}

.attachment-preview-bar {
  padding: 10px 20px;
  background: color-mix(in srgb, var(--color-surface-2) 85%, var(--color-primary) 15%);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideUpFast 0.2s ease;
}

.attachment-thumb-box {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid var(--color-primary);
  flex-shrink: 0;
}

.attachment-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-attachment-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.attachment-note {
  font-size: 0.82rem;
  color: var(--color-text-2);
}

@keyframes slideUpFast {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.reply-preview-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.reply-icon { color: var(--color-primary); flex-shrink: 0; }

.reply-preview-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 1px;
}

.reply-to-name { font-size: 0.76rem; color: var(--color-primary-light); }

.reply-to-snippet {
  font-size: 0.82rem;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 440px;
}

.cancel-reply-btn {
  background: transparent;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.cancel-reply-btn:hover {
  background: var(--color-surface);
  color: var(--color-text);
}

.conversation-input-bar {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.attach-action-btn {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.attach-action-btn:hover:not(:disabled) {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.message-input {
  flex: 1;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 12px 16px;
  color: var(--color-text);
  font-size: 0.92rem;
  outline: none;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  font-family: inherit;
}

.message-input:focus { border-color: var(--color-primary); }

.send-action-btn {
  width: 44px; height: 44px;
  border-radius: 14px;
  background: var(--gradient-primary);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3);
  flex-shrink: 0;
}

.send-action-btn:hover:not(:disabled) { transform: scale(1.04); }
.send-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.mic-action-btn {
  width: 44px; height: 44px;
  border-radius: 14px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.mic-action-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.loader-xs {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  display: inline-block;
}
</style>
