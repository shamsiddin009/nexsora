<template>
  <div class="profile-page-container">
    <main class="content">
      <!-- 1. Profile Hero Header -->
      <ProfileHeader
        :displayed-user="displayedUser"
        :is-own-profile="isOwnProfile"
        :is-craftsman="isCraftsman"
        :user-avatar-url="userAvatarUrl"
        :uploading-avatar="uploadingAvatar"
        :user-telegram-username="userTelegramUsername"
        :user-telegram-link="userTelegramLink"
        :average-rating="averageRating"
        :reviews-count="reviews.length"
        :starting-chat="startingChat"
        @trigger-file-upload="triggerFileInput"
        @start-chat="handleStartChat"
        @open-review-modal="openReviewModal = true"
      />

      <!-- Hidden file input for avatar upload -->
      <input
        v-if="isOwnProfile"
        ref="fileInputRef"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileUpload"
      />

      <!-- 2. Main Profile Grid -->
      <div class="profile-grid">
        <!-- Left Column: About, Portfolio, Calendar, Reviews -->
        <div class="profile-main-column">
          <!-- About & Bio Section -->
          <ProfileAbout
            :bio-text="craftsmanData?.bio || displayedUser?.bio || ''"
            :is-own-profile="isOwnProfile"
            :is-craftsman="isCraftsman"
            :specialties="specialties"
            :saving-bio="savingBio"
            @save-bio="saveBio"
          />

          <!-- Portfolio Gallery Section (For Craftsmen) -->
          <ProfilePortfolio
            v-if="isCraftsman"
            :portfolio-items="portfolioItems"
            :is-own-profile="isOwnProfile"
            :submitting-portfolio="submittingPortfolio"
            @add-portfolio-item="handleAddPortfolioItem"
            @delete-portfolio-item="deletePortfolioItem"
          />

          <!-- Availability Calendar (For Craftsmen) -->
          <AvailabilityCalendar
            v-if="isCraftsman"
            :craftsman-id="displayedUser?.id || authStore.user?.id || 'default'"
            :is-own-profile="isOwnProfile"
          />

          <!-- Reviews Section -->
          <ProfileReviews
            :reviews="reviews"
            :average-rating="averageRating"
            :is-own-profile="isOwnProfile"
            @open-review-modal="openReviewModal = true"
          />
        </div>

        <!-- Right Column: Sidebar Stats & Guarantees -->
        <ProfileSidebar
          :completed-jobs-count="craftsmanData?.completed_jobs || 12"
        />
      </div>
    </main>

    <!-- Review Modal for Profile -->
    <Teleport to="body">
      <div v-if="openReviewModal" class="modal-backdrop" @click="openReviewModal = false">
        <div class="modal-card review-modal-box" @click.stop>
          <div class="modal-header">
            <h3><Star :size="18" /> {{ isCraftsman ? 'Ustaga sharh va baho qoldirish' : 'Mijozga sharh va baho qoldirish' }}</h3>
            <button class="modal-close-btn" @click="openReviewModal = false"><X :size="18" /></button>
          </div>
          <div class="modal-body">
            <div class="rating-picker-row">
              <span class="label">Bahoingiz:</span>
              <div class="star-buttons">
                <button
                  v-for="s in 5"
                  :key="s"
                  type="button"
                  class="star-pick-btn"
                  @click="newReview.rating = s"
                >
                  <Star :size="24" :class="s <= newReview.rating ? 'star-filled' : 'star-empty'" />
                </button>
              </div>
            </div>

            <textarea
              v-model="newReview.comment"
              class="textarea"
              rows="4"
              :placeholder="isCraftsman ? 'Usta ishi, mahorati va muomilasi haqida fikr bildiring...' : 'Mijoz bilan ishlash tajribangiz haqida yozing...'"
            />

            <div v-if="reviewError" class="modal-error-box">{{ reviewError }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="openReviewModal = false">Bekor qilish</button>
            <button class="btn btn-primary" :disabled="reviewSubmitting" @click="submitReview">
              <span v-if="reviewSubmitting" class="animate-spin loader-sm"></span>
              <span v-else>Sharhni saqlash</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../services/supabase'
import { getInitials, formatPrice, formatDate, formatRelativeTime } from '../utils'

// Subcomponents
import ProfileHeader from '../components/profile/ProfileHeader.vue'
import ProfileAbout from '../components/profile/ProfileAbout.vue'
import ProfilePortfolio from '../components/profile/ProfilePortfolio.vue'
import ProfileReviews from '../components/profile/ProfileReviews.vue'
import ProfileSidebar from '../components/profile/ProfileSidebar.vue'
import AvailabilityCalendar from '../components/profile/AvailabilityCalendar.vue'

import {
  Star, X
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sidebarOpen = ref(false)
const displayedUser = ref(null)
const craftsmanData = ref(null)
const startingChat = ref(false)
const submittingPortfolio = ref(false)

const userTelegramLink = computed(() => {
  const targetId = displayedUser.value?.id || authStore.profile?.id || route.params.id
  let tg = displayedUser.value?.telegram || authStore.profile?.telegram || ''
  if (!tg && targetId) {
    try {
      const meta = localStorage.getItem(`nexsora_user_meta_${targetId}`)
      if (meta) {
        const parsed = JSON.parse(meta)
        tg = parsed.telegram || ''
      }
    } catch (e) {}
  }
  if (!tg) return null
  const clean = tg.replace(/^@/, '').trim()
  if (!clean) return null
  return `https://t.me/${clean}`
})

const userTelegramUsername = computed(() => {
  const targetId = displayedUser.value?.id || authStore.profile?.id || route.params.id
  let tg = displayedUser.value?.telegram || authStore.profile?.telegram || ''
  if (!tg && targetId) {
    try {
      const meta = localStorage.getItem(`nexsora_user_meta_${targetId}`)
      if (meta) {
        const parsed = JSON.parse(meta)
        tg = parsed.telegram || ''
      }
    } catch (e) {}
  }
  if (!tg) return null
  return tg.startsWith('@') ? tg : `@${tg}`
})

async function handleStartChat() {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  const partnerId = displayedUser.value?.id || route.params.id
  if (!partnerId || partnerId === authStore.user?.id) return

  startingChat.value = true
  try {
    const isTargetCraftsman = (displayedUser.value?.role || 'craftsman') === 'craftsman'
    const clientId = isTargetCraftsman ? authStore.user.id : partnerId
    const craftsmanId = isTargetCraftsman ? partnerId : authStore.user.id

    // Check if chat exists
    let chatId = null
    const { data: existingChat } = await supabase
      .from('chats')
      .select('id')
      .eq('client_id', clientId)
      .eq('craftsman_id', craftsmanId)
      .maybeSingle()

    if (existingChat) {
      chatId = existingChat.id
    } else {
      const { data: newChat } = await supabase
        .from('chats')
        .insert({
          client_id: clientId,
          craftsman_id: craftsmanId,
        })
        .select()
        .single()
      if (newChat) chatId = newChat.id
    }

    if (chatId) {
      router.push(`/chat/${chatId}`)
    } else {
      router.push('/chat')
    }
  } catch (err) {
    console.error('Start chat error:', err)
    router.push('/chat')
  } finally {
    startingChat.value = false
  }
}

const isOwnProfile = computed(() => {
  return !route.params.id || route.params.id === authStore.user?.id
})

const isCraftsman = computed(() => {
  return (displayedUser.value?.role || authStore.profile?.role) === 'craftsman'
})

// ─── Portfolio Logic ──────────────────────────────────────────────────────────
const defaultPortfolios = [
  {
    id: 'p1',
    title: 'Kvartirani to\'liq sifatli ta\'mirlash',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80',
    category: 'Ta\'mirlash',
    duration: '5 kunda',
    is_before_after: true,
  },
  {
    id: 'p2',
    title: 'Santexnika va vanna xonasi montaji',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
    category: 'Santexnik',
    duration: '2 kunda',
    is_before_after: false,
  },
  {
    id: 'p3',
    title: 'Zamonaviy elektr yoritish tizimi',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80',
    category: 'Elektrik',
    duration: '1 kunda',
    is_before_after: false,
  },
]

const portfolioItems = ref([])
const lightboxItem = ref(null)
const showAddPortfolioModal = ref(false)
const newPortfolio = ref({
  title: '',
  image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
  duration: '2 kunda',
  is_before_after: false,
})

function loadPortfolio() {
  const targetId = displayedUser.value?.id || authStore.user?.id || 'default'
  try {
    const saved = localStorage.getItem(`nexsora_portfolio_${targetId}`)
    if (saved) {
      portfolioItems.value = JSON.parse(saved)
    } else {
      portfolioItems.value = [...defaultPortfolios]
    }
  } catch (e) {
    portfolioItems.value = [...defaultPortfolios]
  }
}

function savePortfolio() {
  const targetId = displayedUser.value?.id || authStore.user?.id || 'default'
  localStorage.setItem(`nexsora_portfolio_${targetId}`, JSON.stringify(portfolioItems.value))
}

function openLightbox(item) {
  lightboxItem.value = item
}

function handleAddPortfolioItem(item) {
  if (!item?.title) return
  submittingPortfolio.value = true
  try {
    portfolioItems.value.unshift({
      id: 'p_' + Date.now(),
      title: item.title,
      category: item.category || 'Montaj',
      image: item.image || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80',
      duration: item.duration || '1 kunda',
      is_before_after: item.is_before_after || false,
    })
    savePortfolio()
    if (typeof item.done === 'function') item.done()
  } finally {
    submittingPortfolio.value = false
  }
}

async function saveBio(payload) {
  if (!authStore.user?.id) return
  const text = (typeof payload === 'string' ? payload : payload?.text || '').trim()
  savingBio.value = true
  try {
    // Update profiles table
    await supabase
      .from('profiles')
      .update({ bio: text })
      .eq('id', authStore.user.id)

    // If craftsman, update craftsman_profiles too
    if (isCraftsman.value) {
      await supabase
        .from('craftsman_profiles')
        .update({ bio: text })
        .eq('id', authStore.user.id)
      
      if (craftsmanData.value) craftsmanData.value.bio = text
    }

    if (displayedUser.value) displayedUser.value.bio = text
    if (authStore.profile) authStore.profile.bio = text

    if (payload?.done) payload.done()
  } catch (err) {
    console.error('Save bio error:', err)
  } finally {
    savingBio.value = false
  }
}


const userAvatarUrl = computed(() => {
  if (isOwnProfile.value) {
    return authStore.profile?.avatar_url || displayedUser.value?.avatar_url || ''
  }
  return displayedUser.value?.avatar_url || ''
})

// Avatar Modal & Upload States
const fileInputRef = ref(null)
const showAvatarModal = ref(false)
const uploadingAvatar = ref(false)
const avatarError = ref('')

const presetAvatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
]

function triggerFileInput() {
  fileInputRef.value?.click()
}

function compressAndResizeImage(file, maxWidth = 400, maxHeight = 400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
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
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}

async function handleFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  uploadingAvatar.value = true
  avatarError.value = ''

  try {
    const compressedDataUrl = await compressAndResizeImage(file, 400, 400, 0.85)
    await saveAvatarUrl(compressedDataUrl)
  } catch (err) {
    console.error('Image compression error:', err)
    avatarError.value = "Rasmni yuklashda xatolik yuz berdi"
    uploadingAvatar.value = false
  } finally {
    if (event.target) event.target.value = ''
  }
}

async function selectPresetAvatar(url) {
  await saveAvatarUrl(url)
}

async function removeAvatar() {
  await saveAvatarUrl(null)
}

async function saveAvatarUrl(url) {
  if (!authStore.user?.id) return
  uploadingAvatar.value = true
  try {
    // 1. Update in Supabase profiles
    await supabase
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', authStore.user.id)

    // 2. Update store and local reactive state
    if (authStore.profile) {
      authStore.profile.avatar_url = url
    }
    if (displayedUser.value) {
      displayedUser.value.avatar_url = url
    }

    showAvatarModal.value = false
  } catch (err) {
    console.error('Save avatar error:', err)
    avatarError.value = "Rasmni saqlashda xatolik yuz berdi"
  } finally {
    uploadingAvatar.value = false
  }
}

const specialties = computed(() => {
  const s = craftsmanData.value?.specialty
  if (Array.isArray(s)) return s
  return []
})

// Reviews system
const reviews = ref([])
const openReviewModal = ref(false)
const reviewSubmitting = ref(false)
const reviewError = ref('')
const newReview = ref({
  rating: 5,
  comment: '',
})

const averageRating = computed(() => {
  if (reviews.value.length === 0) {
    const cp = displayedUser.value?.client_profiles
    const cpRating = Array.isArray(cp) ? cp[0]?.rating : cp?.rating
    const mpRating = craftsmanData.value?.rating
    const r = isCraftsman.value ? mpRating : cpRating
    if (typeof r === 'number' && r > 0) return Number(r)
    return 5.0
  }
  const sum = reviews.value.reduce((acc, r) => acc + (Number(r.rating) || 5), 0)
  return sum / reviews.value.length
})

function getRatingLabel(rating) {
  const labels = {
    1: 'Juda yomon',
    2: 'Qoniqarsiz',
    3: "O'rtacha",
    4: 'Yaxshi',
    5: "A'lo darajada!",
  }
  return labels[rating] || "A'lo"
}

function loadLocalReviews(userId) {
  const key = `nexsora_reviews_${userId}`
  try {
    const saved = localStorage.getItem(key)
    if (saved) return JSON.parse(saved)
  } catch (e) {}

  if (isCraftsman.value) {
    // Default sample reviews for craftsmen
    return [
      {
        id: '1',
        author_name: 'Sanjar Rahimov',
        rating: 5,
        comment: 'Juda professional usta! Belgilangan vaqtda kelib sifatli bitirib berdi.',
        created_at: new Date(Date.now() - 24 * 3600 * 1000 * 2).toISOString(),
      },
      {
        id: '2',
        author_name: 'Gulnoza Karimova',
        rating: 5,
        comment: 'Ishiga mas\'uliyatli, narxlari ham hamyonbop. Rahmat katta!',
        created_at: new Date(Date.now() - 24 * 3600 * 1000 * 5).toISOString(),
      },
    ]
  }

  return []
}

function saveLocalReviews(userId, list) {
  const key = `nexsora_reviews_${userId}`
  try {
    localStorage.setItem(key, JSON.stringify(list))
  } catch (e) {}
}

async function fetchProfileData() {
  const targetId = route.params.id || authStore.user?.id
  if (!targetId) return

  if (targetId === authStore.user?.id && authStore.profile) {
    displayedUser.value = authStore.profile
    const cp = Array.isArray(authStore.profile.craftsman_profiles)
      ? authStore.profile.craftsman_profiles[0]
      : authStore.profile.craftsman_profiles
    craftsmanData.value = cp || null
  } else {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*, craftsman_profiles(*), client_profiles(*)')
        .eq('id', targetId)
        .maybeSingle()

      if (data) {
        displayedUser.value = data
        const cp = Array.isArray(data.craftsman_profiles) ? data.craftsman_profiles[0] : data.craftsman_profiles
        craftsmanData.value = cp || null
      }
    } catch (e) {
      console.error('Fetch profile error:', e)
    }
  }

  // Load reviews
  reviews.value = loadLocalReviews(targetId)
}

// Quick Impression Tags
const craftsmanTags = [
  'Tez va sifatli',
  'Xushmuomala',
  "O'z ishining ustasi",
  "A'lo natija",
  'Hamyonbop narx',
  "O'z vaqtida keldi"
]

const clientTags = [
  "O'z vaqtida to'ladi",
  'Xushmuomala va samimiy',
  'Aniq manzil berdi',
  'Tezkor kelishuv',
  "To'lovni o'z vaqtida qildi",
  'Ajoyib mijoz',
  'Talablari aniq'
]

function addTagToComment(tag) {
  if (!newReview.value.comment) {
    newReview.value.comment = tag
  } else if (!newReview.value.comment.includes(tag)) {
    newReview.value.comment += ', ' + tag
  }
}

async function submitReview() {
  if (isOwnProfile.value) {
    reviewError.value = "O'zingizning profilingizga sharh qoldira olmaysiz"
    return
  }

  if (!newReview.value.comment.trim()) {
    reviewError.value = 'Iltimos, sharh matnini yozing'
    return
  }

  reviewSubmitting.value = true
  reviewError.value = ''

  const targetId = route.params.id || authStore.user?.id
  const author = authStore.profile?.full_name || (authStore.isCraftsman ? 'Usta' : 'Mijoz')

  const reviewItem = {
    id: 'rev_' + Date.now(),
    author_name: author,
    author_avatar_url: authStore.profile?.avatar_url || '',
    rating: newReview.value.rating,
    comment: newReview.value.comment.trim(),
    created_at: new Date().toISOString(),
  }

  // Save to list
  reviews.value.unshift(reviewItem)
  saveLocalReviews(targetId, reviews.value)

  // Calculate new average rating
  const totalSum = reviews.value.reduce((acc, r) => acc + (Number(r.rating) || 5), 0)
  const newAvg = parseFloat((totalSum / reviews.value.length).toFixed(1))
  const newCount = reviews.value.length

  // Update in Supabase (craftsman_profiles or client_profiles)
  try {
    if (isCraftsman.value) {
      await supabase
        .from('craftsman_profiles')
        .update({ rating: newAvg, reviews_count: newCount })
        .eq('id', targetId)
    } else {
      await supabase
        .from('client_profiles')
        .update({ rating: newAvg, reviews_count: newCount })
        .eq('id', targetId)
    }
  } catch (e) {
    console.warn('Update profile rating error:', e)
  }

  // Send notification if someone else reviewed
  if (targetId && targetId !== authStore.user?.id) {
    try {
      await supabase.from('notifications').insert({
        user_id: targetId,
        type: 'new_message',
        title: isCraftsman.value ? 'Mijozdan yangi sharh!' : 'Ustadan yangi sharh!',
        body: `${author} sizga ${newReview.value.rating} yulduzli baho va fikr qoldirdi. Yangi reytingingiz: ⭐ ${newAvg}`,
        link: `/profile/${targetId}`,
      })
    } catch (e) {}
  }

  newReview.value.comment = ''
  newReview.value.rating = 5
  openReviewModal.value = false
  reviewSubmitting.value = false
}

watch(() => authStore.profile, () => {
  fetchProfileData()
  loadPortfolio()
})

watch(() => route.params.id, () => {
  fetchProfileData()
  loadPortfolio()
})

onMounted(() => {
  fetchProfileData()
  loadPortfolio()
})
</script>

<style scoped>
.profile-page-container {
  min-height: calc(100vh - 68px);
  background: var(--color-bg);
  width: 100%;
}

.content {
  padding: 32px clamp(16px, 3.5vw, 32px) 60px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* Profile Hero Card */
.profile-header-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  padding: 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: var(--shadow-sm);
  position: relative;
  flex-wrap: wrap;
}

.profile-avatar-box {
  position: relative;
}

.avatar-interactive {
  cursor: pointer;
}

.avatar-hover-overlay {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 2;
}

.profile-avatar-box:hover .avatar-hover-overlay {
  opacity: 1;
}

.plus-icon {
  color: white;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.profile-avatar-box:hover .plus-icon {
  transform: scale(1.15) rotate(90deg);
}

.loader-sm {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  display: inline-block;
}

.online-status {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-success);
  border: 3px solid var(--color-card);
  position: absolute;
  bottom: 2px;
  right: 2px;
  z-index: 3;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* Avatar Modal Styles */
.avatar-modal-dialog {
  max-width: 480px;
}

.avatar-modal-preview {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  margin-bottom: 16px;
}

.preview-ring {
  border: 3px solid var(--color-primary);
  box-shadow: 0 4px 14px rgba(108, 99, 255, 0.3);
}

.preview-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.remove-avatar-btn {
  color: var(--color-error);
}

.remove-avatar-btn:hover {
  border-color: var(--color-error);
}

.preset-avatars-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.preset-avatar-btn {
  aspect-ratio: 1;
  border-radius: 50%;
  border: 2px solid transparent;
  padding: 0;
  background: transparent;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.15s ease;
}

.preset-avatar-btn:hover {
  transform: scale(1.12);
  border-color: var(--color-primary);
}

.preset-avatar-btn.active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.4);
}

.preset-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.profile-meta-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 260px;
}

.profile-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.profile-title-row h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-success);
  background: rgba(67, 233, 123, 0.12);
  padding: 3px 10px;
  border-radius: 9999px;
  border: 1px solid rgba(67, 233, 123, 0.25);
}

.profile-sub-meta {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: var(--color-muted);
}

.profile-sub-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.telegram-badge-sub {
  color: #24A1DE !important;
  font-weight: 600;
}

.rating-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.rating-stars {
  display: flex;
  gap: 3px;
}

.star-filled { color: #FFB800; fill: #FFB800; }
.star-empty { color: var(--color-border); }

.rating-num {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-text);
}

.rating-count {
  font-size: 0.8rem;
  color: var(--color-muted);
}

.profile-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.telegram-btn {
  background: rgba(36, 161, 222, 0.15) !important;
  color: #24A1DE !important;
  border: 1px solid rgba(36, 161, 222, 0.35) !important;
  text-decoration: none;
  font-weight: 600;
}

.telegram-btn:hover {
  background: #24A1DE !important;
  color: #ffffff !important;
  border-color: #24A1DE !important;
  transform: translateY(-1px);
}

/* Grid Layout */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
}

.profile-main-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 12px;
}

.about-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.edit-bio-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-primary-light);
  font-weight: 600;
  font-size: 0.82rem;
  padding: 4px 10px;
}

.bio-edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 6px;
}

.bio-textarea {
  line-height: 1.6;
  font-size: 0.92rem;
}

.bio-edit-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

.empty-bio-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.bio-text {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--color-text-2);
  white-space: pre-line;
}

.empty-text {
  color: var(--color-muted);
  font-size: 0.88rem;
  font-style: italic;
}

.specialty-chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 9999px;
  background: var(--color-surface-2);
  color: var(--color-primary-light);
  border: 1px solid var(--color-border);
  font-size: 0.82rem;
  font-weight: 600;
}

/* Reviews Section */
.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.review-form-box {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 20px;
}

.review-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.close-icon-btn {
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
}

.star-picker {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.stars-row {
  display: flex;
  gap: 4px;
}

.picker-star-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  transition: transform 0.15s ease;
}

.picker-star-btn:hover {
  transform: scale(1.2);
}

.profile-quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.mini-tag-btn {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-2);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mini-tag-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-text);
}

.mini-tag-btn.active {
  background: color-mix(in srgb, var(--color-primary) 15%, var(--color-surface));
  border-color: var(--color-primary);
  color: var(--color-primary-light);
  font-weight: 600;
}

.rating-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
}

.empty-reviews {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--color-muted);
  gap: 8px;
  text-align: center;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  padding: 16px 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
}

.review-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.review-author {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text);
}

.review-date {
  font-size: 0.72rem;
  color: var(--color-muted);
}

.review-stars {
  margin-left: auto;
  display: flex;
  gap: 2px;
}

.review-comment {
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--color-text-2);
}

/* Sidebar Info Cards */
.profile-side-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.88rem;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-row-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-2);
}

.stat-row-val {
  font-weight: 600;
  color: var(--color-text);
}

.highlight-val {
  color: var(--color-primary-light);
  font-weight: 700;
}

.contact-items-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.contact-icon {
  color: var(--color-primary-light);
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  flex-shrink: 0;
}

.contact-sub {
  font-size: 0.72rem;
  color: var(--color-muted);
}

.contact-val {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text);
}

.error-box { padding: 10px 14px; background: rgba(255,71,87,0.1); border: 1px solid rgba(255,71,87,0.25); border-radius: 10px; color: var(--color-error); font-size: 0.82rem; margin-top: 10px; }
.loader { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; display: inline-block; }

@media (max-width: 960px) {
  .profile-grid { grid-template-columns: 1fr; }
  .profile-header-card { flex-direction: column; align-items: flex-start; }
}

@media (max-width: 768px) {
  .topbar { display: flex; }
  .content { padding: 20px 16px; }
}

/* ─── Portfolio Section Styles ────────────────────────────────────────────────── */
.portfolio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}

.portfolio-item-card {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.portfolio-item-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.portfolio-thumb-wrap {
  position: relative;
  width: 100%;
  height: 125px;
  background: var(--color-surface);
}

.portfolio-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-ba {
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(108, 99, 255, 0.85);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  backdrop-filter: blur(4px);
}

.portfolio-delete-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 71, 87, 0.85);
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s;
}

.portfolio-delete-btn:hover {
  transform: scale(1.15);
}

.portfolio-info {
  padding: 8px 10px;
}

.portfolio-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.portfolio-meta {
  font-size: 0.72rem;
  color: var(--color-muted);
}

.empty-portfolio-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: var(--color-muted);
  text-align: center;
  gap: 8px;
}

/* Lightbox Modal */
.lightbox-modal {
  position: relative;
  background: #000;
  border-radius: 16px;
  overflow: hidden;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
}

.lightbox-close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
}

.lightbox-close-btn:hover {
  background: rgba(255, 71, 87, 0.8);
  transform: scale(1.1);
}

.lightbox-img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  display: block;
}

.lightbox-caption {
  padding: 16px 20px;
  background: var(--color-surface);
}

.lightbox-caption h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: var(--color-text);
}

.lightbox-caption p {
  margin: 0;
  font-size: 0.82rem;
  color: var(--color-text-2);
}
</style>
