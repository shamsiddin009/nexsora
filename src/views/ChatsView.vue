<template>
  <div class="messenger-container">
    <div class="messenger-card">

      <!-- LEFT COLUMN: Sidebar -->
      <ChatSidebar
        :filtered-chats="filteredChats"
        :active-chat-id="activeChatId"
        v-model:search-query="searchQuery"
        :loading="loading"
        v-model:is-muted="isMuted"
        :starred-chats="starredChats"
        :current-user-id="authStore.user?.id"
        :hide-on-mobile="!!(activeChatId && isMobile)"
        @select-chat="selectChat"
        @toggle-star="toggleStar"
        @delete-chat="deleteChat"
      />

      <!-- RIGHT COLUMN: Active Chat or Empty State -->
      <main class="chat-main-panel" :class="{ 'active-on-mobile': activeChatId && isMobile }">

        <!-- CASE 1: Active chat -->
        <div v-if="activeChat" class="active-conversation">

          <!-- Conversation Header -->
          <ChatConvHeader
            :chat="activeChat"
            :partner="getPartner(activeChat)"
            :is-client="activeChat.client_id === authStore.user?.id"
            :is-craftsman="activeChat.craftsman_id === authStore.user?.id"
            :sending="sending"
            @back="clearActiveChat"
            @open-escrow="showEscrowModal = true"
            @open-complete="openCompleteModal"
            @open-revision="openRevisionModal"
            @notify-done="notifyCraftsmanDone"
            @notify-fixed="notifyCraftsmanFixed"
            @open-rate-client="openRateClientModal"
          />

          <!-- Job Banner -->
          <ChatJobBanner
            v-if="activeChat.jobs"
            :job="activeChat.jobs"
            :offer="activeChat.offer"
            :job-id="activeChat.job_id"
            :client-name="activeChat.client?.full_name || 'Mijoz'"
            :craftsman-name="activeChat.craftsman?.full_name || 'Usta'"
          />


          <!-- Pinned Message Banner -->
          <div v-if="pinnedMessage" class="pinned-message-banner" @click="scrollToMessage(pinnedMessage.id)">
            <div class="pinned-left">
              <div class="pinned-icon-box"><Pin :size="15" /></div>
              <div class="pinned-text-col">
                <span class="pinned-sender">Qadalgan xabar ({{ getMessageSenderName(pinnedMessage) }}):</span>
                <span class="pinned-snippet">{{ getCleanSnippet(pinnedMessage.content, 70) }}</span>
              </div>
            </div>
            <button class="unpin-btn" title="Qadashdan chiqarish" @click.stop="unpinMessage">
              <X :size="16" />
            </button>
          </div>

          <!-- Success Toast -->
          <div v-if="alertSuccess" class="success-toast">
            <CheckCircle2 :size="18" />
            <span>{{ alertSuccessText }}</span>
          </div>

          <!-- Messages Area -->
          <div class="messages-container" ref="messagesAreaRef">
            <div v-if="messagesLoading" class="messages-loading">
              <span class="animate-spin loader"></span>
            </div>

            <div v-else-if="messages.length === 0" class="no-messages-box">
              <div class="greeting-icon">ğŸ‘‹</div>
              <h5>Suhbatni boshlang!</h5>
              <p>Kelishuv shartlari va ish tafsilotlarini muhokama qiling.</p>
            </div>

            <div v-else class="messages-stream">
              <ChatMessageBubble
                v-for="msg in messages"
                :key="msg.id"
                :message="msg"
                :current-user-id="authStore.user?.id"
                :pinned-message-id="pinnedMessageId"
                :highlighted-message-id="highlightedMessageId"
                :active-menu-message-id="activeMenuMessage?.id"
                :reactions="getMessageReactions(msg.id)"
                :reply-quote="getQuotedReply(msg)"
                @open-menu="openMessageMenu"
                @scroll-to="scrollToMessage"
                @toggle-reaction="toggleReaction"
              />
            </div>
            <div ref="bottomAnchorRef"></div>
          </div>

          <!-- Context Menu -->
          <ChatContextMenu
            :message="activeMenuMessage"
            :position="menuPosition"
            :pinned-message-id="pinnedMessageId"
            @close="closeMessageMenu"
            @reply="msg => handleMenuAction('reply', msg)"
            @pin="msg => handleMenuAction('pin', msg)"
            @copy="msg => handleMenuAction('copy', msg)"
            @delete="msg => handleMenuAction('delete', msg)"
            @react="toggleReaction"
          />

          <!-- Input Bar -->
          <ChatInputBar
            ref="inputBarRef"
            v-model="messageText"
            :replying-to="replyingTo"
            :reply-sender-name="getMessageSenderName(replyingTo)"
            :reply-snippet="getCleanSnippet(replyingTo?.content, 60)"
            :sending="sending"
            :is-recording-voice="isRecordingVoice"
            @send="sendMessage"
            @send-with-image="handleSendWithImage"
            @cancel-reply="cancelReply"
            @voice-recorded="handleVoiceRecorded"
            @start-recording="isRecordingVoice = true"
            @stop-recording="isRecordingVoice = false"
          />
        </div>

        <!-- CASE 2: No chat selected -->
        <div v-else class="empty-conversation-state">
          <div class="empty-plane-circle">
            <Send :size="38" class="plane-icon" />
          </div>
          <h3 class="empty-state-title">Suhbatdoshni tanlang</h3>
          <p class="empty-state-subtitle">
            Xabarlarni ko'rish yoki yangi xabar yozish uchun chap tomondagi ro'yxatdan suhbatni tanlang.
          </p>
        </div>

      </main>
    </div>

    <!-- MODALS -->
    <ReviewModal
      :show="showReviewModal"
      :review-mode="reviewMode"
      :partner-name="getPartner(activeChat)?.full_name"
      :job="activeChat?.jobs"
      :offer-price="activeChat?.offer?.price"
      :submitting="submittingReview"
      :error="reviewSubmitError"
      @close="showReviewModal = false"
      @submit="handleReviewModalSubmit"
    />

    <RevisionModal
      :show="showRevisionModal"
      :partner-name="getPartner(activeChat)?.full_name"
      :job="activeChat?.jobs"
      :submitting="submittingRevision"
      :error="revisionError"
      @close="showRevisionModal = false"
      @submit="handleRevisionModalSubmit"
    />

    <EscrowModal
      :show="showEscrowModal"
      :chat-partner="getPartner(activeChat)"
      :current-user-id="authStore.user?.id"
      :job-title="activeChat?.jobs?.title"
      :job-budget="activeChat?.offer?.price || activeChat?.jobs?.budget_max || activeChat?.jobs?.budget_min"
      @close="showEscrowModal = false"
      @created="handleEscrowCreated"
    />
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import { supabase } from '../services/supabase'

// Layout Components
import ChatSidebar from '../components/chat/ChatSidebar.vue'
import ChatConvHeader from '../components/chat/ChatConvHeader.vue'
import ChatJobBanner from '../components/chat/ChatJobBanner.vue'
import ChatMessageBubble from '../components/chat/ChatMessageBubble.vue'
import ChatContextMenu from '../components/chat/ChatContextMenu.vue'
import ChatInputBar from '../components/chat/ChatInputBar.vue'

// Modal Components (unchanged)
import ReviewModal from '../components/chat/ReviewModal.vue'
import RevisionModal from '../components/chat/RevisionModal.vue'
import EscrowModal from '../components/chat/EscrowModal.vue'

import {
  formatPrice,
  formatRelativeTime,
  getInitials,
  getStatusLabel
} from '../utils'
import { Pin, X, Send, CheckCircle2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const chats = ref([])
const loading = ref(true)
const searchQuery = ref('')
const isMuted = ref(false)
const starredChats = ref([])

const activeChatId = ref(route.params.id || null)
const activeChat = computed(() => chats.value.find(c => String(c.id) === String(activeChatId.value)) || null)

const messages = ref([])
const messagesLoading = ref(false)
const messageText = ref('')
const sending = ref(false)
const isRecordingVoice = ref(false)

function isVoiceMessage(content) {
  return typeof content === 'string' && content.startsWith('[VOICE')
}

function getVoiceDuration(content) {
  if (typeof content !== 'string') return 5
  const match = content.match(/\[VOICE:(\d+)(?:\|[^\]]+)?\]/)
  return match ? Number(match[1]) : 5
}

async function handleVoiceRecorded({ dataUrl, duration }) {
  isRecordingVoice.value = false
  const audioPart = dataUrl ? `|${dataUrl}` : ''
  const voiceContent = `[VOICE:${duration || 5}${audioPart}] Ovozli xabar`
  await sendCustomMessage(voiceContent)
}

async function handleSendWithImage({ text, image }) {
  if (!image || !activeChat.value || !authStore.user) return
  
  let fullPayloadContent = `[IMAGE:${image}]`
  if (text?.trim()) {
    fullPayloadContent += ` ${text.trim()}`
  }

  // Format reply quote if active
  if (replyingTo.value) {
    const authorName = getMessageSenderName(replyingTo.value)
    const snippet = getCleanSnippet(replyingTo.value.content, 60)
    fullPayloadContent = `[reply:${replyingTo.value.id}|${authorName}|${snippet}]\n` + fullPayloadContent
  }

  replyingTo.value = null
  messageText.value = ''
  await sendCustomMessage(fullPayloadContent)
}

async function sendCustomMessage(text) {
  if (!activeChat.value || !authStore.user) return
  sending.value = true
  try {
    const newMsg = {
      chat_id: activeChat.value.id,
      sender_id: authStore.user.id,
      content: text,
      created_at: new Date().toISOString(),
      is_read: false,
    }
    const { data, error } = await supabase.from('messages').insert(newMsg).select().single()
    if (!error && data) {
      messages.value.push(data)
    } else {
      messages.value.push({ id: 'msg_' + Date.now(), ...newMsg })
    }
    nextTick(() => {
      scrollToBottom()
    })
  } catch (e) {
    console.error('Send voice message error:', e)
  } finally {
    sending.value = false
  }
}

const messagesAreaRef = ref(null)
const bottomAnchorRef = ref(null)
const inputBarRef = ref(null)

const replyingTo = ref(null)
const pinnedMessageId = ref(null)
const highlightedMessageId = ref(null)

const pinnedMessage = computed(() => {
  if (!pinnedMessageId.value) return null
  return messages.value.find(m => m.id === pinnedMessageId.value) || null
})

const isMobile = ref(window.innerWidth <= 768)

const activeMenuMessage = ref(null)
const menuPosition = ref({ x: 0, y: 0 })

function closeMessageMenu() {
  activeMenuMessage.value = null
}

watch(activeChatId, (newId) => {
  if (newId) {
    pinnedMessageId.value = localStorage.getItem(`nexsora_pin_${newId}`) || null
    replyingTo.value = null
    closeMessageMenu()
  }
}, { immediate: true })


function openMessageMenu(event, msg) {
  if (event) {
    event.stopPropagation()
  }
  activeMenuMessage.value = msg

  const bubbleEl = event?.currentTarget?.classList?.contains('bubble')
    ? event.currentTarget
    : event?.target?.closest?.('.bubble')

  const bubbleRect = bubbleEl?.getBoundingClientRect?.()

  const menuWidth = 280
  const menuHeight = 260

  let x = event?.clientX || window.innerWidth / 2
  let y = event?.clientY || window.innerHeight / 2

  if (bubbleRect) {
    const isMine = msg?.sender_id === authStore.user?.id

    if (isMine) {
      // My message (right side): position to the LEFT side of the bubble
      x = bubbleRect.left - menuWidth - 12
      if (x < 16) {
        // If not enough room on left, align along the bubble
        x = Math.max(16, bubbleRect.right - menuWidth)
      }
    } else {
      // Partner's message (left side): position to the RIGHT side of the bubble
      x = bubbleRect.right + 12
      if (x + menuWidth > window.innerWidth - 16) {
        // If not enough room on right, align along the bubble
        x = Math.min(window.innerWidth - menuWidth - 16, bubbleRect.left)
      }
    }

    y = bubbleRect.top
  }

  // Viewport bounds clamping
  if (x + menuWidth > window.innerWidth - 16) {
    x = window.innerWidth - menuWidth - 16
  }
  if (x < 16) x = 16

  if (y + menuHeight > window.innerHeight - 20) {
    y = Math.max(16, window.innerHeight - menuHeight - 20)
  }
  if (y < 16) y = 16

  menuPosition.value = {
    x: Math.round(x),
    y: Math.round(y)
  }
}



const messageReactions = ref(JSON.parse(localStorage.getItem('nexsora_msg_reactions') || '{}'))

function toggleReaction(msg, emoji) {
  if (!msg?.id) return
  if (!messageReactions.value[msg.id]) {
    messageReactions.value[msg.id] = {}
  }
  const current = messageReactions.value[msg.id][emoji] || 0
  messageReactions.value[msg.id][emoji] = current + 1
  
  localStorage.setItem('nexsora_msg_reactions', JSON.stringify(messageReactions.value))
  closeMessageMenu()
}

function getMessageReactions(msgId) {
  if (!msgId) return {}
  return messageReactions.value[msgId] || {}
}

function handleMenuAction(action, msg) {
  closeMessageMenu()
  if (!msg) return

  if (action === 'reply') {
    startReply(msg)
  } else if (action === 'copy') {
    copyMessage(msg)
  } else if (action === 'pin') {
    togglePinMessage(msg)
  } else if (action === 'delete') {
    deleteMessage(msg)
  }
}

// Review Modal States
const showReviewModal = ref(false)
const reviewMode = ref('client_rates_craftsman') // 'client_rates_craftsman' or 'craftsman_rates_client'
const reviewRating = ref(5)
const hoverRating = ref(0)
const reviewComment = ref('')
const selectedTags = ref([])
const submittingReview = ref(false)
const reviewSubmitError = ref('')
const alertSuccess = ref(false)
const alertSuccessText = ref('Muvaffaqiyatli saqlandi! ğŸ‰')

const quickTags = [
  'âš¡ Tez va sifatli',
  'ğŸ¤ Xushmuomala',
  'ğŸ›  O\'z ishining ustasi',
  'ğŸ’ A\'lo natija',
  'ğŸ’° Hamyonbop narx',
  'â± O\'z vaqtida keldi'
]

const clientQuickTags = [
  'ğŸ’° O\'z vaqtida to\'ladi',
  'ğŸ¤ Xushmuomala va samimiy',
  'ğŸ“ Aniq manzil berdi',
  'ğŸ“‰ Narxni juda tushiradi',
  'â± To\'lovni kechiktirdi',
  'â­ Ajoyib mijoz',
  'âŒ Talablari noaniq'
]

const currentQuickTags = computed(() => {
  return reviewMode.value === 'client_rates_craftsman' ? quickTags : clientQuickTags
})

function handleResize() {
  isMobile.value = window.innerWidth <= 768
}

function getPartner(chat) {
  if (!chat) return null
  return chat.client_id === authStore.user?.id ? chat.craftsman : chat.client
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'open': return 'badge-success'
    case 'in_progress': return 'badge-primary'
    case 'revision': return 'badge-warning'
    case 'completed': return 'badge-neutral'
    default: return 'badge-secondary'
  }
}

function getRatingLabel(rating) {
  switch (rating) {
    case 5: return "A'lo darajada (Tavsiya qilaman) ğŸŒŸ"
    case 4: return "Juda yaxshi ğŸ‘"
    case 3: return "Yaxshi ğŸ™‚"
    case 2: return "Qoniqarli ğŸ˜"
    case 1: return "Qoniqarsiz ğŸ‘"
    default: return ""
  }
}

function toggleTag(tag) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
}

// Escrow Safe Deal Modal States
const showEscrowModal = ref(false)

async function handleEscrowCreated(deal) {
  showEscrowModal.value = false
  if (!activeChat.value) return

  const dealTitle = deal?.title || activeChat.value.jobs?.title || 'Kafolatlangan xizmat'
  const dealAmount = deal?.amount || 500000
  const warrantyDays = deal?.warrantyDays || 14
  const days = deal?.days || 3

  const dealMessage = `ğŸ›¡ï¸ KAFOLATLANGAN XAVFSIZ BITIM TUZILDI!\n` +
    `ğŸ“‹ Shartnoma: "${dealTitle}"\n` +
    `ğŸ’° Muzlatilgan summa: ${formatPrice(dealAmount)}\n` +
    `â±ï¸ Topshirish muddati: ${days} kun\n` +
    `â­ Usta kafolati: ${warrantyDays} kunlik bepul ta'mirlash\n` +
    `ğŸ”’ Mablag' Nexsora Escrow tizimida xavfsiz qulflangan.`

  try {
    const { data: newMsg, error } = await supabase.from('messages').insert({
      chat_id: activeChat.value.id,
      sender_id: authStore.user?.id,
      content: dealMessage,
      is_read: false
    }).select().single()

    if (!error && newMsg) {
      messages.value.push(newMsg)
      scrollToBottom()
    }
  } catch (e) {
    console.warn('Escrow message insert error:', e)
  }
}

// Revision Modal States
const showRevisionModal = ref(false)
const revisionComment = ref('')
const selectedRevisionTags = ref([])
const submittingRevision = ref(false)
const revisionError = ref('')

const revisionQuickTags = [
  'ğŸ›  Kamchiliklar to\'liq tuzatilmagan',
  'ğŸ“ O\'lcham yoki montajda xatolik bor',
  'ğŸ§¹ Tozalik va tartibga e\'tibor berilmagan',
  'â± Ish to\'liq yakuniga yetmagan',
  'ğŸ’¡ Kelishilgan talablarga mos kelmadi',
  'âš™ï¸ Qayta tekshirish talab etiladi'
]

function openRevisionModal() {
  revisionComment.value = ''
  selectedRevisionTags.value = ['ğŸ›  Kamchiliklar to\'liq tuzatilmagan']
  revisionError.value = ''
  showRevisionModal.value = true
}

function handleReviewModalSubmit(data) {
  reviewRating.value = data.rating
  reviewComment.value = data.comment
  selectedTags.value = data.selectedTags
  submitCompleteAndReview()
}

function handleRevisionModalSubmit(data) {
  revisionComment.value = data.comment
  selectedRevisionTags.value = data.selectedTags
  submitRevisionRequest()
}

function toggleRevisionTag(tag) {
  if (selectedRevisionTags.value.includes(tag)) {
    selectedRevisionTags.value = selectedRevisionTags.value.filter(t => t !== tag)
  } else {
    selectedRevisionTags.value.push(tag)
  }
}

async function submitRevisionRequest() {
  if (!activeChat.value || !activeChat.value.jobs) return
  submittingRevision.value = true
  revisionError.value = ''

  try {
    const jobId = activeChat.value.jobs.id || activeChat.value.job_id
    const craftsmanId = activeChat.value.craftsman_id
    const clientName = authStore.profile?.full_name || 'Mijoz'

    // 1. Update job status to 'revision' in DB and locally
    await supabase
      .from('jobs')
      .update({ status: 'revision' })
      .eq('id', jobId)

    if (activeChat.value.jobs) {
      activeChat.value.jobs.status = 'revision'
    }

    // 2. Send Revision message into chat
    const reasons = selectedRevisionTags.value.join(', ') || 'Kamchiliklar mavjud'
    const details = revisionComment.value.trim() || 'Iltimos, ishni qaytadan ko\'rib chiqing va kamchiliklarni bartaraf eting.'
    const revisionMsg = `ğŸ”„ ISHNI QAYTA ISHLASH SO'ROVI:\nMijoz ishni tekshirdi va quyidagi kamchiliklarni tuzatishni so'radi:\n\nğŸ“Œ Sabab: ${reasons}\nğŸ“ Tafsilot: ${details}\n\nIltimos, kamchiliklarni bartaraf etib ishni qaytadan topshiring.`

    await supabase.from('messages').insert({
      chat_id: activeChat.value.id,
      sender_id: authStore.user.id,
      content: revisionMsg,
      is_read: false
    })

    // 3. Send Notification to craftsman
    if (craftsmanId) {
      try {
        await supabase.from('notifications').insert({
          user_id: craftsmanId,
          type: 'new_message',
          title: 'Qayta ishlash so\'rovi yuborildi ğŸ”„',
          body: `${clientName} "${activeChat.value.jobs.title?.slice(0, 30)}" ishi bo'yicha kamchiliklarni tuzatishni so'radi.`,
          link: `/chat/${activeChat.value.id}`
        })
      } catch (e) {}
    }

    showRevisionModal.value = false
    alertSuccessText.value = 'Qayta ishlash so\'rovi ustaga yuborildi ğŸ”„'
    alertSuccess.value = true
    setTimeout(() => { alertSuccess.value = false }, 5000)

  } catch (err) {
    console.error('Submit revision error:', err)
    revisionError.value = 'Xatolik yuz berdi, qaytadan urinib ko\'ring'
  } finally {
    submittingRevision.value = false
  }
}

function openCompleteModal() {
  reviewMode.value = 'client_rates_craftsman'
  reviewRating.value = 5
  hoverRating.value = 0
  reviewComment.value = ''
  selectedTags.value = ['âš¡ Tez va sifatli', 'ğŸ’ A\'lo natija']
  reviewSubmitError.value = ''
  showReviewModal.value = true
}

function openRateClientModal() {
  reviewMode.value = 'craftsman_rates_client'
  reviewRating.value = 5
  hoverRating.value = 0
  reviewComment.value = ''
  selectedTags.value = ['ğŸ’° O\'z vaqtida to\'ladi', 'ğŸ¤ Xushmuomala va samimiy']
  reviewSubmitError.value = ''
  showReviewModal.value = true
}

const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) return chats.value
  const q = searchQuery.value.toLowerCase().trim()
  return chats.value.filter(chat => {
    const partnerName = getPartner(chat)?.full_name?.toLowerCase() || ''
    const jobTitle = chat.jobs?.title?.toLowerCase() || ''
    const lastMsg = chat.last_message?.content?.toLowerCase() || ''
    return partnerName.includes(q) || jobTitle.includes(q) || lastMsg.includes(q)
  })
})

function formatTimeDisplay(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function toggleStar(chatId) {
  if (starredChats.value.includes(chatId)) {
    starredChats.value = starredChats.value.filter(id => id !== chatId)
  } else {
    starredChats.value.push(chatId)
  }
}

function formatLastMessagePreview(content) {
  if (!content) return ''
  return content.replace(/^\[reply:[^\]]+\]\n/, '')
}

async function deleteChat(chat) {
  if (!chat?.id) return
  const partnerName = getPartner(chat)?.full_name || 'Ushbu'
  if (!confirm(`"${partnerName}" bilan bo'lgan suhbatni ro'yxatdan o'chirmoqchimisiz?`)) return

  const targetId = chat.id

  // 1. Remove from local reactive state
  chats.value = chats.value.filter(c => c.id !== targetId)

  // Track locally deleted chats so they don't reappear on reload
  const deletedChats = JSON.parse(localStorage.getItem('nexsora_deleted_chats') || '[]')
  if (!deletedChats.includes(targetId)) {
    deletedChats.push(targetId)
    localStorage.setItem('nexsora_deleted_chats', JSON.stringify(deletedChats))
  }

  // If this was active, clear active chat
  if (activeChatId.value === targetId) {
    clearActiveChat()
  }

  // 2. Delete messages and chat from Supabase
  try {
    await supabase.from('messages').delete().eq('chat_id', targetId)
    await supabase.from('chats').delete().eq('id', targetId)
    toast.success("O'chirildi", "Suhbat muvaffaqiyatli o'chirildi! ğŸ—‘ï¸")
  } catch (err) {
    console.warn('Delete chat warning:', err)
  }
}

function selectChat(id) {
  activeChatId.value = id
  router.replace(`/chat/${id}`)
  loadMessages(id)
}

function clearActiveChat() {
  activeChatId.value = null
  router.replace('/chat')
}

async function loadChats() {
  if (!authStore.user?.id) return
  loading.value = true
  try {
    const { data } = await supabase
      .from('chats')
      .select(`
        *,
        jobs(*),
        client:client_id(*),
        craftsman:craftsman_id(*, craftsman_profiles(*))
      `)
      .or(`client_id.eq.${authStore.user.id},craftsman_id.eq.${authStore.user.id}`)
      .order('created_at', { ascending: false })

    const rawChatList = data || []
    const deletedChatIds = JSON.parse(localStorage.getItem('nexsora_deleted_chats') || '[]')
    const chatList = rawChatList.filter(c => !deletedChatIds.includes(c.id))

    // Fetch accepted offer or offer details for chats
    const offerIds = chatList.map(c => c.offer_id).filter(Boolean)
    if (offerIds.length > 0) {
      try {
        const { data: offersData } = await supabase
          .from('offers')
          .select('*')
          .in('id', offerIds)

        const offerMap = new Map((offersData || []).map(o => [o.id, o]))
        chatList.forEach(c => {
          if (c.offer_id) {
            c.offer = offerMap.get(c.offer_id) || null
          }
        })
      } catch (e) {
        console.warn('Offers fetch error:', e)
      }
    }

    // Fetch latest message for each chat in ONE batch request (no N+1!)
    const chatIds = chatList.map(c => c.id)
    if (chatIds.length > 0) {
      try {
        const { data: allLastMessages } = await supabase
          .from('messages')
          .select('*')
          .in('chat_id', chatIds)
          .order('created_at', { ascending: false })

        // Group: keep only the latest message per chat
        const lastMsgMap = new Map()
        for (const msg of (allLastMessages || [])) {
          if (!lastMsgMap.has(msg.chat_id)) {
            lastMsgMap.set(msg.chat_id, msg)
          }
        }
        chatList.forEach(c => {
          c.last_message = lastMsgMap.get(c.id) || null
        })
      } catch (e) {
        console.warn('Last messages batch fetch error:', e)
      }
    }

    chats.value = chatList

    if (activeChatId.value) {
      loadMessages(activeChatId.value)
    } else if (chatList.length > 0 && window.innerWidth > 768) {
      selectChat(chatList[0].id)
    }
  } catch (err) {
    console.error('Load chats error:', err)
  } finally {
    loading.value = false
  }
}

let activeChatChannel = null

async function loadMessages(chatId) {
  if (!chatId) return
  messagesLoading.value = true
  try {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(50)

    messages.value = (data || []).reverse()
    scrollToBottom()

    // Mark partner messages as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('chat_id', chatId)
      .neq('sender_id', authStore.user.id)

    // Subscribe to realtime messages & job status updates for this chat
    if (activeChatChannel) supabase.removeChannel(activeChatChannel)
    activeChatChannel = supabase
      .channel(`chat-realtime:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        messages.value.push(payload.new)
        scrollToBottom()

        // Sync status if system messages received
        if (payload.new.content?.startsWith('ğŸ”„ ISHNI QAYTA ISHLASH')) {
          if (activeChat.value?.jobs) {
            activeChat.value.jobs.status = 'revision'
          }
        } else if (payload.new.content?.startsWith('âœ… KAMCHILIKLAR BARTARAF')) {
          if (activeChat.value?.jobs) {
            activeChat.value.jobs.status = 'in_progress'
          }
        } else if (payload.new.content?.startsWith('ğŸ‰ Ish mijoz tomonidan') || payload.new.content?.startsWith('â­ Usta mijozni')) {
          if (activeChat.value?.jobs) {
            activeChat.value.jobs.status = 'completed'
          }
        }

        // Update last message preview in chat list
        const c = chats.value.find(item => item.id === chatId)
        if (c) c.last_message = payload.new
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'jobs'
      }, (payload) => {
        if (activeChat.value?.jobs && payload.new && (payload.new.id === (activeChat.value.jobs.id || activeChat.value.job_id))) {
          activeChat.value.jobs.status = payload.new.status
        }
      })
      .subscribe()
  } catch (err) {
    console.error('Load messages error:', err)
  } finally {
    messagesLoading.value = false
  }
}

function getMessageSenderName(msg) {
  if (!msg) return 'Foydalanuvchi'
  if (msg.sender_id === authStore.user?.id) return 'Siz'
  const partner = getPartner(activeChat.value)
  return partner?.full_name || 'Suhbatdosh'
}

function getCleanSnippet(content, maxLen = 80) {
  if (!content) return ''
  const cleaned = content.replace(/^\[reply:[^\]]+\]\n/, '').replace(/\n+/g, ' ').trim()
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen) + '...' : cleaned
}

function getQuotedReply(msg) {
  if (!msg?.content) return null
  const match = msg.content.match(/^\[reply:([^|]+)\|([^|]+)\|([^\]]+)\]\n/)
  if (match) {
    return {
      id: match[1],
      author: match[2],
      snippet: match[3]
    }
  }
  return null
}

function getDisplayContent(content) {
  if (!content) return ''
  return content.replace(/^\[reply:[^\]]+\]\n/, '')
}

function startReply(msg) {
  replyingTo.value = msg
  nextTick(() => {
    inputBarRef.value?.focus()
  })
}

function cancelReply() {
  replyingTo.value = null
}

function copyMessage(msg) {
  const clean = getDisplayContent(msg.content)
  navigator.clipboard.writeText(clean)
  toast.success('Nusxa olindi', 'Xabar matni nusxalandi! ğŸ“‹')
}

function togglePinMessage(msg) {
  if (pinnedMessageId.value === msg.id) {
    unpinMessage()
  } else {
    pinnedMessageId.value = msg.id
    if (activeChatId.value) {
      localStorage.setItem(`nexsora_pin_${activeChatId.value}`, msg.id)
    }
    toast.success('Qadaldi', 'Xabar yuqoriga qadaldi! ğŸ“Œ')
  }
}

function unpinMessage() {
  pinnedMessageId.value = null
  if (activeChatId.value) {
    localStorage.removeItem(`nexsora_pin_${activeChatId.value}`)
  }
  toast.info('Qadash bekor qilindi', 'Xabar qadalishdan chiqarildi.')
}

async function deleteMessage(msg) {
  if (!confirm("Haqiqatan ham bu xabarni o'chirmoqchimisiz?")) return

  messages.value = messages.value.filter(m => m.id !== msg.id)
  if (pinnedMessageId.value === msg.id) {
    unpinMessage()
  }

  try {
    await supabase.from('messages').delete().eq('id', msg.id)
    toast.success("O'chirildi", "Xabar o'chirildi! ğŸ—‘ï¸")
  } catch (e) {
    console.warn('Delete message warning:', e)
  }
}

function scrollToMessage(msgId) {
  if (!msgId) return
  const el = document.getElementById(`msg-${msgId}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    highlightedMessageId.value = msgId
    setTimeout(() => {
      if (highlightedMessageId.value === msgId) {
        highlightedMessageId.value = null
      }
    }, 2500)
  } else {
    toast.info("Xabar", "Ushbu xabar ancha oldingi yozishmalarda yoki topilmadi.")
  }
}

function scrollToBottom() {
  nextTick(() => {
    bottomAnchorRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

async function sendMessage() {
  const text = messageText.value.trim()
  if (!text || !activeChatId.value || sending.value) return

  sending.value = true
  
  // Format reply quote if active
  let fullPayloadContent = text
  if (replyingTo.value) {
    const authorName = getMessageSenderName(replyingTo.value)
    const snippet = getCleanSnippet(replyingTo.value.content, 60)
    fullPayloadContent = `[reply:${replyingTo.value.id}|${authorName}|${snippet}]\n` + text
  }

  messageText.value = ''
  const currentReply = replyingTo.value
  replyingTo.value = null

  try {
    const { data: newMsg, error } = await supabase.from('messages').insert({
      chat_id: activeChatId.value,
      sender_id: authStore.user.id,
      content: fullPayloadContent,
      is_read: false,
    }).select().single()

    if (error) throw error

    // Update last message in chat list
    const c = chats.value.find(item => item.id === activeChatId.value)
    if (c) c.last_message = newMsg

    scrollToBottom()
  } catch (err) {
    console.error('Send message error:', err)
    messageText.value = text
    replyingTo.value = currentReply
  } finally {
    sending.value = false
  }
}

async function notifyCraftsmanDone() {
  if (!activeChat.value || sending.value) return
  messageText.value = "Assalomu alaykum! Men topshiriqni to'liq va sifatli yakunladim. Iltimos, tekshirib ishni qabul qilib bering."
  await sendMessage()
}

async function notifyCraftsmanFixed() {
  if (!activeChat.value || sending.value) return
  sending.value = true

  try {
    const jobId = activeChat.value.jobs.id || activeChat.value.job_id
    const clientId = activeChat.value.client_id
    const craftsmanName = authStore.profile?.full_name || 'Usta'

    // 1. Update job status to 'in_progress'
    await supabase
      .from('jobs')
      .update({ status: 'in_progress' })
      .eq('id', jobId)

    if (activeChat.value.jobs) {
      activeChat.value.jobs.status = 'in_progress'
    }

    // 2. Send message into chat
    const resubmitMsg = "âœ… KAMCHILIKLAR BARTARAF ETILDI:\nAssalomu alaykum! Barcha ko'rsatilgan kamchiliklarni to'liq bartaraf etdim va sifatini qayta tekshirib chiqdim. Iltimos, tekshirib ishni qabul qilib bering."

    const { data: newMsg } = await supabase.from('messages').insert({
      chat_id: activeChat.value.id,
      sender_id: authStore.user.id,
      content: resubmitMsg,
      is_read: false
    }).select().single()

    if (newMsg) {
      const c = chats.value.find(item => item.id === activeChat.value.id)
      if (c) c.last_message = newMsg
    }

    // 3. Send Notification to client
    if (clientId) {
      try {
        await supabase.from('notifications').insert({
          user_id: clientId,
          type: 'new_message',
          title: 'Usta kamchiliklarni to\'g\'irladi! âœ…',
          body: `${craftsmanName} "${activeChat.value.jobs.title?.slice(0, 30)}" ishidagi kamchiliklarni bartaraf etib, ishni qayta topshirdi.`,
          link: `/chat/${activeChat.value.id}`
        })
      } catch (e) {}
    }

    alertSuccessText.value = "Kamchiliklar to'g'irlandi deb mijozga xabar yuborildi! âœ…"
    alertSuccess.value = true
    setTimeout(() => { alertSuccess.value = false }, 5000)

  } catch (err) {
    console.error('Notify craftsman fixed error:', err)
  } finally {
    sending.value = false
  }
}

async function submitCompleteAndReview() {
  if (!activeChat.value || !activeChat.value.jobs) return
  submittingReview.value = true
  reviewSubmitError.value = ''

  try {
    const jobId = activeChat.value.jobs.id || activeChat.value.job_id
    const isCraftsmanReviewingClient = reviewMode.value === 'craftsman_rates_client'

    if (isCraftsmanReviewingClient) {
      // CRAFTSMAN RATES CLIENT
      const clientId = activeChat.value.client_id
      const craftsmanName = authStore.profile?.full_name || 'Usta'

      const reviewItem = {
        id: 'rev_' + Date.now(),
        author_name: craftsmanName,
        rating: reviewRating.value,
        comment: [
          selectedTags.value.join(', '),
          reviewComment.value.trim()
        ].filter(Boolean).join(' â€” ') || "Mijoz bilan ishlash a'lo darajada bo'ldi!",
        job_id: jobId,
        created_at: new Date().toISOString()
      }

      // Save to client's reviews storage
      const storageKey = `nexsora_reviews_${clientId}`
      let storedReviews = []
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) storedReviews = JSON.parse(saved)
      } catch (e) {}

      storedReviews.unshift(reviewItem)
      try {
        localStorage.setItem(storageKey, JSON.stringify(storedReviews))
      } catch (e) {}

      // Calculate new average rating for client
      const totalRatingSum = storedReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0)
      const newAverageRating = parseFloat((totalRatingSum / storedReviews.length).toFixed(1))
      const totalReviewsCount = storedReviews.length

      // Update client_profiles in Supabase
      if (clientId) {
        try {
          await supabase
            .from('client_profiles')
            .update({
              rating: newAverageRating,
              reviews_count: totalReviewsCount
            })
            .eq('id', clientId)
        } catch (err) {
          console.warn('Update client_profiles rating error:', err)
        }
      }

      // Send chat message
      const completionMsg = `â­ Usta mijozni baholadi: ${reviewRating.value}/5 â€” ${getRatingLabel(reviewRating.value)}\nğŸ“ˆ Mijozning yangi reytingi: â­ ${newAverageRating}`
      
      await supabase.from('messages').insert({
        chat_id: activeChat.value.id,
        sender_id: authStore.user.id,
        content: completionMsg,
        is_read: false
      })

      // Send Notification to client
      if (clientId) {
        try {
          await supabase.from('notifications').insert({
            user_id: clientId,
            type: 'new_message',
            title: 'Usta sizga baho qoldirdi! â­',
            body: `${craftsmanName} sizga ${reviewRating.value} yulduzli baho va fikr qoldirdi. Yangi reytingingiz: â­ ${newAverageRating}`,
            link: `/profile/${clientId}`
          })
        } catch (e) {}
      }

      alertSuccessText.value = 'Mijoz baholandi va profiliga sharh saqlandi! â­'

    } else {
      // CLIENT RATES CRAFTSMAN & COMPLETES JOB
      const craftsmanId = activeChat.value.craftsman_id
      const clientName = authStore.profile?.full_name || 'Mijoz'

      // 1. Update Job status to 'completed'
      await supabase
        .from('jobs')
        .update({ status: 'completed' })
        .eq('id', jobId)

      // 2. Update offer status if exists
      if (activeChat.value.offer_id) {
        try {
          await supabase
            .from('offers')
            .update({ status: 'completed' })
            .eq('id', activeChat.value.offer_id)
        } catch (e) {}
      }

      // 3. Save review for craftsman (in Supabase and localStorage)
      const reviewItem = {
        id: 'rev_' + Date.now(),
        author_name: clientName,
        rating: reviewRating.value,
        comment: [
          selectedTags.value.join(', '),
          reviewComment.value.trim()
        ].filter(Boolean).join(' â€” ') || "A'lo darajada bajarildi!",
        job_id: jobId,
        created_at: new Date().toISOString()
      }

      // Save in localStorage for craftsman profile sync & calculate new rating
      const storageKey = `nexsora_reviews_${craftsmanId}`
      let storedReviews = []
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) storedReviews = JSON.parse(saved)
      } catch (e) {}

      storedReviews.unshift(reviewItem)
      try {
        localStorage.setItem(storageKey, JSON.stringify(storedReviews))
        localStorage.setItem(`reviews_${craftsmanId}`, JSON.stringify(storedReviews))
      } catch (e) {
        console.warn('Local review storage error:', e)
      }

      // Calculate real-time updated average rating
      const totalRatingSum = storedReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0)
      const newAverageRating = parseFloat((totalRatingSum / storedReviews.length).toFixed(1))
      const totalReviewsCount = storedReviews.length

      // Update craftsman_profiles in Supabase (rating, reviews_count, completed_jobs)
      if (craftsmanId) {
        try {
          const { data: existingCp } = await supabase
            .from('craftsman_profiles')
            .select('completed_jobs')
            .eq('id', craftsmanId)
            .maybeSingle()

          const newCompleted = (existingCp?.completed_jobs || 0) + 1

          await supabase
            .from('craftsman_profiles')
            .update({
              rating: newAverageRating,
              reviews_count: totalReviewsCount,
              completed_jobs: newCompleted
            })
            .eq('id', craftsmanId)
        } catch (err) {
          console.warn('Update craftsman_profiles rating error:', err)
        }
      }

      // 4. Send chat message informing both parties
      const completionMsg = `ğŸ‰ Ish mijoz tomonidan muvaffaqiyatli qabul qilindi va yakunlandi!\nâ­ Baho: ${reviewRating.value}/5 â€” ${getRatingLabel(reviewRating.value)}\nğŸ“ˆ Ustaning yangi reytingi: â­ ${newAverageRating}`
      
      await supabase.from('messages').insert({
        chat_id: activeChat.value.id,
        sender_id: authStore.user.id,
        content: completionMsg,
        is_read: false
      })

      // 5. Send Notification to craftsman
      if (craftsmanId) {
        try {
          await supabase.from('notifications').insert({
            user_id: craftsmanId,
            type: 'offer_accepted',
            title: 'Ish qabul qilindi va baholandi! ğŸ‰',
            body: `${clientName} ishni yakunladi va sizga ${reviewRating.value} yulduzli baho berdi! Yangi reytingingiz: â­ ${newAverageRating}`,
            link: `/chat/${activeChat.value.id}`
          })
        } catch (e) {}
      }

      // Update activeChat status locally
      if (activeChat.value.jobs) {
        activeChat.value.jobs.status = 'completed'
      }

      alertSuccessText.value = 'Ish muvaffaqiyatli qabul qilindi va usta baholandi! ğŸ‰'
    }

    showReviewModal.value = false
    alertSuccess.value = true
    setTimeout(() => {
      alertSuccess.value = false
    }, 4500)

    // Reload messages to show the completion bubble
    loadMessages(activeChat.value.id)
  } catch (err) {
    console.error('Complete job error:', err)
    reviewSubmitError.value = "Xatolik yuz berdi, qaytadan urinib ko'ring"
  } finally {
    submittingReview.value = false
  }
}

watch(() => route.params.id, (newId) => {
  if (newId && newId !== activeChatId.value) {
    activeChatId.value = newId
    loadMessages(newId)
  } else if (!newId) {
    activeChatId.value = null
  }
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
  loadChats()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (activeChatChannel) supabase.removeChannel(activeChatChannel)
})
</script>

<style scoped>
.messenger-container {
  padding: 12px 16px 16px;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
  height: calc(100vh - 68px);
  box-sizing: border-box;
}

.messenger-card {
  display: flex;
  height: 100%;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .messenger-container {
    padding: 0;
    height: calc(100vh - 60px);
  }
  .messenger-card {
    border-radius: 0;
    border: none;
  }
}

/* LEFT COLUMN: Sidebar */
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

.search-icon {
  color: var(--color-muted);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 0.88rem;
  outline: none;
}

.search-input::placeholder {
  color: var(--color-muted);
}

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

.empty-list-icon {
  opacity: 0.5;
}

.chat-items-list {
  display: flex;
  flex-direction: column;
}

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

.chat-list-item:hover {
  background: var(--color-surface-2);
}

.chat-list-item.active {
  background: color-mix(in srgb, var(--color-primary) 12%, var(--color-surface-2));
  border-left: 3px solid var(--color-primary);
}

.item-avatar-box {
  position: relative;
  flex-shrink: 0;
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
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

.item-time {
  font-size: 0.72rem;
  color: var(--color-muted);
}

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

.star-btn:hover, .star-active {
  color: #F7B731;
}

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

.chat-list-item:hover .delete-chat-btn {
  opacity: 1;
}

.delete-chat-btn:hover {
  color: var(--color-error, #EF4444);
  background: rgba(239, 68, 68, 0.12);
}

@media (max-width: 768px) {
  .delete-chat-btn {
    opacity: 0.75;
  }
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

.sender-prefix {
  font-weight: 600;
  color: var(--color-text);
}

.msg-check {
  color: var(--color-muted);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.check-read {
  color: var(--color-primary-light);
}

/* RIGHT COLUMN: Chat Main Panel */
.chat-main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  min-width: 0;
}

/* Active Conversation View */
.active-conversation {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.conversation-header {
  padding: 12px 20px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.header-left-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-back-btn {
  display: none;
  background: transparent;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 4px;
}

.header-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-text-col {
  display: flex;
  flex-direction: column;
}

.header-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

.header-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--color-success);
  font-weight: 500;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success);
}

.header-right-box {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.header-action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.craftsman-completed-group,
.client-completed-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.job-link-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(108, 99, 255, 0.1);
  border: 1px solid rgba(108, 99, 255, 0.25);
  color: var(--color-primary-light);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 999px;
  text-decoration: none;
  transition: all 0.15s ease;
}

.job-link-pill:hover {
  background: rgba(108, 99, 255, 0.2);
}

/* JOB ORDER BANNER */
.job-order-banner {
  padding: 10px 20px;
  background: color-mix(in srgb, var(--color-surface) 90%, var(--color-primary) 10%);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.banner-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(108, 99, 255, 0.25);
}

.banner-text-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.banner-top-line {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.banner-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
}

.banner-title:hover {
  color: var(--color-primary-light);
}

.banner-meta-line {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 0.78rem;
  color: var(--color-text-2);
}

.meta-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.price-tag {
  color: var(--color-primary-light);
  font-weight: 600;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.finish-job-btn {
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.notify-done-btn {
  font-size: 0.8rem;
}

.completed-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--color-success);
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* PINNED MESSAGE BANNER */
.pinned-message-banner {
  padding: 8px 18px;
  background: color-mix(in srgb, var(--color-surface) 85%, var(--color-primary) 15%);
  border-bottom: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  transition: background 0.15s ease;
  z-index: 5;
}

.pinned-message-banner:hover {
  background: color-mix(in srgb, var(--color-surface) 75%, var(--color-primary) 25%);
}

.pinned-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.pinned-icon-box {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(108, 99, 255, 0.25);
}

.pinned-text-col {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 1px;
}

.pinned-sender {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--color-primary-light);
}

.pinned-snippet {
  font-size: 0.82rem;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 480px;
}

.unpin-btn {
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

.unpin-btn:hover {
  background: var(--color-surface-2);
  color: var(--color-error);
}

/* Success Toast */
.success-toast {
  background: #10B981;
  color: white;
  padding: 10px 20px;
  font-size: 0.88rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Messages Area */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.messages-stream {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.message-row {
  display: flex;
  width: 100%;
}

.msg-mine {
  justify-content: flex-end;
}

.msg-partner {
  justify-content: flex-start;
}

.message-bubble-wrapper {
  position: relative;
  max-width: 72%;
  display: flex;
  flex-direction: column;
}

.msg-mine .message-bubble-wrapper {
  align-items: flex-end;
}

.msg-partner .message-bubble-wrapper {
  align-items: flex-start;
}

/* Bubble Design */
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

/* Quoted Reply inside Bubble */
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

.msg-mine .bubble-reply-quote {
  background: rgba(0, 0, 0, 0.18);
}

.msg-partner .bubble-reply-quote {
  background: var(--color-surface-2);
}

.bubble-reply-quote:hover {
  opacity: 0.9;
}

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

.msg-mine .quote-author {
  color: #E0E7FF;
}

.quote-text {
  font-size: 0.78rem;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
}

.bubble-text {
  word-break: break-word;
  white-space: pre-line;
}

.bubble-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  font-size: 0.68rem;
  opacity: 0.8;
}

.pin-mini-badge {
  display: flex;
  align-items: center;
  opacity: 0.85;
}

.msg-mine .bubble-meta {
  color: rgba(255, 255, 255, 0.85);
}

.msg-partner .bubble-meta {
  color: var(--color-muted);
}

.read-check {
  opacity: 0.7;
}

.read-done {
  opacity: 1;
  color: #38F9D7;
}

/* Highlight Animation when jumping to message */
.msg-highlighted .bubble {
  box-shadow: 0 0 0 3px var(--color-primary-light), 0 6px 24px rgba(108, 99, 255, 0.4);
  transform: scale(1.02);
}

/* Conversation Footer & Reply Bar */
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

.reply-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.reply-preview-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 1px;
}

.reply-to-name {
  font-size: 0.76rem;
  color: var(--color-primary-light);
}

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
  gap: 12px;
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

.message-input:focus {
  border-color: var(--color-primary);
}

.send-action-btn {
  width: 44px;
  height: 44px;
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

.send-action-btn:hover:not(:disabled) {
  transform: scale(1.04);
}

.send-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty State */
.empty-conversation-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
  background: var(--color-bg);
}

.empty-plane-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(108, 99, 255, 0.08);
  border: 1px solid rgba(108, 99, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.plane-icon {
  color: var(--color-primary-light);
  transform: translate(2px, -2px);
}

.empty-state-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 8px;
}

.empty-state-subtitle {
  font-size: 0.92rem;
  color: var(--color-text-2);
  max-width: 420px;
  line-height: 1.5;
  margin: 0;
}

.loader {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  display: inline-block;
}

/* MODAL STYLING */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.review-modal-dialog {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  width: 100%;
  max-width: 520px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalPop {
  from {
    transform: scale(0.92);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title-box {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modal-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-heading {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: var(--color-text-2);
  margin: 2px 0 0;
}

.modal-close-btn {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-close-btn:hover {
  color: var(--color-text);
  border-color: var(--color-text);
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  max-height: calc(85vh - 140px);
}

.modal-job-summary {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}

.summary-meta {
  font-size: 0.82rem;
  color: var(--color-primary-light);
}

.section-label {
  display: block;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

/* Stars Row */
.stars-interactive-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 0;
}

.star-pick-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: transform 0.15s ease;
}

.star-pick-btn:hover {
  transform: scale(1.22);
}

.star-svg {
  color: var(--color-border);
  fill: transparent;
  transition: all 0.2s ease;
}

.star-active .star-svg {
  color: #F7B731;
  fill: #F7B731;
}

.rating-verbal-score {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 4px;
}

.score-badge {
  background: rgba(247, 183, 49, 0.15);
  color: #F7B731;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
}

.score-text {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text);
}

/* Tags wrap */
.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-2);
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tag-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-text);
}

.tag-chip.active {
  background: color-mix(in srgb, var(--color-primary) 15%, var(--color-surface));
  border-color: var(--color-primary);
  color: var(--color-primary-light);
  font-weight: 600;
}

.modal-textarea {
  width: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 10px 14px;
  color: var(--color-text);
  font-size: 0.88rem;
  outline: none;
  font-family: inherit;
  resize: vertical;
}

.modal-textarea:focus {
  border-color: var(--color-primary);
}

.modal-error-box {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-error);
  color: var(--color-error);
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.84rem;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  background: var(--color-surface);
}

.submit-finish-btn {
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.client-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.craftsman-revision-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.revision-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(250, 130, 49, 0.14);
  border: 1px solid rgba(250, 130, 49, 0.4);
  color: #FA8231;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 999px;
  animation: pulseRevision 2.2s infinite ease-in-out;
}

@keyframes pulseRevision {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(0.98); }
}

.badge-warning {
  background: rgba(250, 130, 49, 0.15);
  color: #FA8231;
  border: 1px solid rgba(250, 130, 49, 0.3);
}

.revision-job-btn {
  background: rgba(250, 130, 49, 0.12);
  color: #FA8231;
  border: 1px solid rgba(250, 130, 49, 0.3);
  font-weight: 600;
}

.revision-job-btn:hover {
  background: rgba(250, 130, 49, 0.2);
  border-color: #FA8231;
  color: #FA8231;
}

.revision-badge {
  background: rgba(250, 130, 49, 0.15) !important;
  color: #FA8231 !important;
}

.revision-notice-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: rgba(250, 130, 49, 0.1);
  border: 1px solid rgba(250, 130, 49, 0.25);
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #FA8231;
  line-height: 1.45;
}

.submit-revision-btn {
  background: linear-gradient(135deg, #FA8231 0%, #F7B731 100%);
  color: #0A0A0F;
  font-weight: 700;
  border: none;
  box-shadow: 0 4px 16px rgba(250, 130, 49, 0.35);
}

.submit-revision-btn:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.msg-system-revision {
  justify-content: center;
  margin: 14px 0;
}

.msg-system-revision .bubble {
  background: rgba(250, 130, 49, 0.1);
  border: 1px solid rgba(250, 130, 49, 0.35);
  color: var(--color-text);
  border-radius: 16px;
  max-width: 82%;
  box-shadow: 0 4px 16px rgba(250, 130, 49, 0.15);
}

.msg-system-revision .bubble-text {
  white-space: pre-line;
  font-size: 0.88rem;
  line-height: 1.5;
}

.resubmit-job-btn {
  background: linear-gradient(135deg, #FA8231 0%, #F7B731 100%);
  color: #0A0A0F;
  font-weight: 700;
  border: none;
  box-shadow: 0 4px 12px rgba(250, 130, 49, 0.3);
}

.resubmit-job-btn:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.msg-system-fixed {
  justify-content: center;
  margin: 14px 0;
}

.msg-system-fixed .bubble {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: var(--color-text);
  border-radius: 16px;
  max-width: 82%;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.15);
}

.msg-system-fixed .bubble-text {
  white-space: pre-line;
  font-size: 0.88rem;
  line-height: 1.5;
  font-weight: 500;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .messenger-container {
    padding: 0;
    height: calc(100vh - 68px);
  }

  .messenger-card {
    border-radius: 0;
    border: none;
  }

  .chat-sidebar {
    width: 100%;
  }

  .hide-on-mobile {
    display: none;
  }

  .chat-main-panel {
    display: none;
  }

  .active-on-mobile {
    display: flex;
  }

  .mobile-back-btn {
    display: flex;
  }

  .job-order-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 14px;
  }

  .banner-actions {
    width: 100%;
  }

  .finish-job-btn, .notify-done-btn {
    width: 100%;
    justify-content: center;
  }
}

/* TELEGRAM STYLE MESSAGE CONTEXT MENU POPUP */
.message-context-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(1px);
}

/* CLEAN WHITE TELEGRAM STYLE CONTEXT MENU POPUP */
.message-context-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: transparent;
}

.telegram-context-wrapper {
  position: fixed;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: telegramContextPop 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: top left;
}

@keyframes telegramContextPop {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* TOP FLOATING EMOJI REACTIONS PILL (WHITE) */
.telegram-reactions-bar {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 999px;
  padding: 5px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04);
  align-self: flex-start;
}

.telegram-emoji-btn {
  background: transparent;
  border: none;
  font-size: 1.35rem;
  line-height: 1;
  padding: 4px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.15s ease;
}

.telegram-emoji-btn:hover {
  transform: scale(1.35) translateY(-3px);
  background: #F1F5F9;
}

/* CONTEXT MENU CARD (WHITE) */
.telegram-menu-card {
  min-width: 220px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.telegram-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: #1E293B;
  font-size: 0.92rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 0.12s ease, color 0.12s ease;
}

.telegram-menu-item:hover {
  background: #F1F5F9;
  color: #0F172A;
}

.telegram-menu-item .item-icon {
  color: #64748B;
  transition: color 0.12s ease;
  flex-shrink: 0;
}

.telegram-menu-item:hover .item-icon {
  color: var(--color-primary, #6C63FF);
}

.telegram-menu-divider {
  height: 1px;
  background: #E2E8F0;
  margin: 4px 6px;
}

.telegram-menu-item.delete-item {
  color: #EF4444;
}

.telegram-menu-item.delete-item .item-icon {
  color: #EF4444;
}

.telegram-menu-item.delete-item:hover {
  background: #FEF2F2;
  color: #DC2626;
}

.telegram-menu-item.delete-item:hover .item-icon {
  color: #DC2626;
}

/* REACTION BADGES ROW (Under message bubble) */
.message-reactions-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.reaction-badge-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: var(--shadow-sm);
}

.reaction-badge-item:hover {
  transform: scale(1.08);
  border-color: var(--color-primary);
}

.emoji-symbol {
  font-size: 0.95rem;
}

.emoji-count {
  font-weight: 700;
  font-size: 0.76rem;
  color: var(--color-text);
}

.msg-menu-active .bubble {
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.mic-action-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.mic-action-btn:hover {
  background: rgba(108, 99, 255, 0.15);
  border-color: var(--color-primary);
  transform: scale(1.08);
}
</style>
