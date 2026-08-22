<template>
  <div class="chat-window">
    <!-- Header -->
    <div class="chat-header">
      <router-link to="/chat" class="back-btn">
        <ArrowLeft :size="20" />
      </router-link>
      <div class="avatar-placeholder avatar-sm">
        {{ getInitials(partner?.full_name) }}
      </div>
      <div>
        <div class="chat-title">{{ partner?.full_name || 'Foydalanuvchi' }}</div>
        <div v-if="job" class="chat-sub">{{ job.category }} · {{ job.title?.slice(0, 30) }}</div>
      </div>
    </div>

    <!-- Messages -->
    <div class="messages-area">
      <div v-if="messages.length === 0" class="empty-msg">
        Suhbat boshlang! 👋
      </div>
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-bubble"
        :class="msg.sender_id === userId ? 'bubble-mine' : 'bubble-other'"
      >
        <div class="message-content">{{ msg.content }}</div>
        <div class="message-time">{{ formatRelativeTime(msg.created_at) }}</div>
      </div>
      <div ref="bottomRef"></div>
    </div>

    <!-- Input -->
    <form class="chat-input-area" @submit.prevent="sendMessage">
      <textarea
        v-model="input"
        class="chat-input"
        placeholder="Xabar yozing... (Enter — yuborish)"
        rows="1"
        @keydown.enter.exact.prevent="sendMessage"
      />
      <button type="submit" class="send-btn" :disabled="!input.trim() || sending">
        <Send :size="18" />
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ArrowLeft, Send } from 'lucide-vue-next'
import { supabase } from '../services/supabase'
import { getInitials, formatRelativeTime } from '../utils'

const props = defineProps({
  chatId: String,
  userId: String,
  partner: Object,
  job: Object,
})

const messages = ref([])
const input = ref('')
const sending = ref(false)
const bottomRef = ref(null)
let channel = null

async function loadMessages() {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', props.chatId)
    .order('created_at', { ascending: true })

  messages.value = data || []
  scrollToBottom()

  if (props.userId) {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('chat_id', props.chatId)
      .neq('sender_id', props.userId)
  }
}

function scrollToBottom() {
  nextTick(() => {
    bottomRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

function subscribeRealtime() {
  channel = supabase
    .channel(`chat:${props.chatId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${props.chatId}`,
      },
      (payload) => {
        messages.value.push(payload.new)
        scrollToBottom()
      }
    )
    .subscribe()
}

async function sendMessage() {
  const text = input.value.trim()
  if (!text || sending.value) return

  sending.value = true
  input.value = ''

  try {
    const { error } = await supabase.from('messages').insert({
      chat_id: props.chatId,
      sender_id: props.userId,
      content: text,
      is_read: false,
    })
    if (error) throw error
  } catch (err) {
    console.error('Send message error:', err)
    input.value = text
  } finally {
    sending.value = false
  }
}

watch(() => props.chatId, (newId) => {
  if (newId) {
    if (channel) supabase.removeChannel(channel)
    loadMessages()
    subscribeRealtime()
  }
})

onMounted(() => {
  loadMessages()
  subscribeRealtime()
})

onUnmounted(() => {
  if (channel) supabase.removeChannel(channel)
})
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.back-btn { color: var(--color-muted); display: flex; }
.chat-title { font-weight: 700; font-size: 1rem; }
.chat-sub { font-size: 0.75rem; color: var(--color-muted); }

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-msg {
  text-align: center;
  color: var(--color-muted);
  padding: 32px;
  font-size: 0.9rem;
}

.message-bubble {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bubble-mine { align-self: flex-end; }
.bubble-other { align-self: flex-start; }

.message-content {
  padding: 10px 16px;
  border-radius: 18px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.bubble-mine .message-content {
  background: var(--gradient-primary);
  color: white;
  border-bottom-right-radius: 4px;
}

.bubble-other .message-content {
  background: var(--color-surface-2);
  color: var(--color-text);
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 0.7rem;
  color: var(--color-muted);
  padding: 0 4px;
}

.bubble-mine .message-time { text-align: right; }

.chat-input-area {
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 10px 16px;
  color: var(--color-text);
  font-size: 0.9rem;
  resize: none;
  max-height: 120px;
  min-height: 44px;
}

.chat-input:focus { border-color: var(--color-primary); }

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.send-btn:disabled { opacity: 0.5; }
</style>
