<template>
  <div class="service-detail-page">
    <main class="container detail-content">
      <div v-if="!service" class="empty-box card">
        <Wrench :size="48" class="empty-icon" />
        <h3>Xizmat topilmadi</h3>
        <p>Qidirilayotgan xizmat mavjud emas yoki o'chirilgan.</p>
        <router-link to="/services" class="btn btn-secondary btn-sm" style="margin-top: 12px">
          Xizmatlar katalogiga qaytish
        </router-link>
      </div>

      <div v-else class="service-container">
        <!-- Breadcrumbs -->
        <div class="breadcrumbs">
          <router-link to="/services">Xizmatlar</router-link>
          <span>/</span>
          <span>{{ service.category }}</span>
          <span>/</span>
          <span class="crumb-active">{{ service.title?.slice(0, 32) }}...</span>
        </div>

        <!-- Main Service Card -->
        <div class="card service-showcase-card">
          <div class="showcase-cover-box">
            <img :src="service.cover_image" :alt="service.title" class="showcase-cover-img" />
            <div class="showcase-badges">
              <span class="badge badge-primary">{{ service.category }}</span>
              <span class="badge badge-subtle"><MapPin :size="12" /> {{ service.city }}</span>
            </div>
          </div>

          <div class="showcase-info">
            <h1 class="service-title">{{ service.title }}</h1>

            <!-- Quick Metrics -->
            <div class="metrics-row">
              <div class="metric-item">
                <Star :size="16" class="star-gold" />
                <span class="metric-val">{{ service.rating.toFixed(1) }}</span>
                <span class="metric-sub">({{ service.reviews_count }} ta sharh)</span>
              </div>
              <div class="metric-divider"></div>
              <div class="metric-item">
                <CheckCircle2 :size="16" class="icon-success" />
                <span class="metric-val">{{ service.orders_count || 30 }}+</span>
                <span class="metric-sub">bajarilgan buyurtma</span>
              </div>
              <div class="metric-divider"></div>
              <div class="metric-item">
                <Clock :size="16" class="icon-primary" />
                <span class="metric-val">{{ service.duration_days }} kunda</span>
                <span class="metric-sub">bajariladi</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2-Column Info Grid: Price & Order Action + Craftsman Profile -->
        <div class="details-info-grid">
          
          <!-- Left: Price & Direct Order Box -->
          <div class="card price-order-card">
            <div class="price-header">
              <span class="price-tag-label">Xizmat narxi:</span>
              <div class="price-big">{{ formatPrice(service.price) }}</div>
            </div>

            <div class="order-features">
              <div class="feature-item">
                <ShieldCheck :size="18" class="feature-icon" />
                <span>Kafolatlangan xizmat ko'rsatish</span>
              </div>
              <div class="feature-item">
                <Clock :size="18" class="feature-icon" />
                <span>Belgilangan muddatda yetkazish ({{ service.duration_days }} kun)</span>
              </div>
              <div class="feature-item">
                <MessageSquare :size="18" class="feature-icon" />
                <span>To'g'ridan-to'g'ri usta bilan onlayn aloqa</span>
              </div>
            </div>

            <!-- Order / Contact Button -->
            <button
              class="btn btn-primary btn-lg order-action-btn"
              :disabled="creatingChat"
              @click="handleOrderService"
            >
              <span v-if="creatingChat" class="animate-spin loader"></span>
              <template v-else>
                <MessageCircle :size="18" />
                <span>Ustaga buyurtma berish / Bog'lanish</span>
              </template>
            </button>
          </div>

          <!-- Right: Craftsman Profile Card -->
          <div class="card craftsman-profile-card">
            <div class="craftsman-header-row">
              <div class="avatar-placeholder avatar-lg">
                <img
                  v-if="service.craftsman?.avatar_url"
                  :src="service.craftsman.avatar_url"
                  :alt="service.craftsman.full_name"
                  class="avatar-img"
                />
                <span v-else>{{ getInitials(service.craftsman?.full_name) }}</span>
              </div>
              <div class="craftsman-details">
                <span class="craftsman-label">Xizmat ijrochisi</span>
                <h3 class="craftsman-fullname">{{ service.craftsman?.full_name }}</h3>
                <div class="craftsman-specs">
                  <span class="badge badge-primary">{{ service.craftsman?.specialty || service.category }}</span>
                  <span class="city-pill"><MapPin :size="12" /> {{ service.craftsman?.city || service.city }}</span>
                </div>
              </div>
            </div>

            <div class="craftsman-stats-grid">
              <div class="craft-stat">
                <span class="craft-stat-val">{{ service.craftsman?.experience_yrs ? service.craftsman.experience_yrs + ' yil' : '5+ yil' }}</span>
                <span class="craft-stat-sub">Tajriba</span>
              </div>
              <div class="craft-stat">
                <span class="craft-stat-val"><Star :size="14" fill="currentColor" class="star-icon-inline" /> {{ service.craftsman?.rating?.toFixed(1) || '5.0' }}</span>
                <span class="craft-stat-sub">Reyting</span>
              </div>
              <div class="craft-stat">
                <span class="craft-stat-val">{{ service.craftsman?.completed_jobs || service.orders_count }}+</span>
                <span class="craft-stat-sub">Bitkazgan</span>
              </div>
            </div>

            <div v-if="craftsmanPhone || craftsmanTelegramLink" class="craftsman-quick-contacts">
              <a
                v-if="craftsmanPhone"
                :href="`tel:${craftsmanPhone.replace(/\\s+/g, '')}`"
                class="btn btn-success btn-sm contact-btn"
                title="Qo'ng'iroq qilish"
              >
                <Phone :size="14" />
                <span>Qo'ng'iroq</span>
              </a>

              <a
                v-if="craftsmanTelegramLink"
                :href="craftsmanTelegramLink"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-secondary btn-sm contact-btn telegram-btn"
                title="Telegram orqali bog'lanish"
              >
                <Send :size="14" />
                <span>Telegram</span>
              </a>
            </div>

            <router-link
              v-if="service.craftsman?.id"
              :to="`/profile/${service.craftsman.id}`"
              class="btn btn-secondary btn-sm full-btn"
            >
              Ustaning to'liq profilini ko'rish
            </router-link>
          </div>
        </div>

        <!-- Description & Inclusions Card -->
        <div class="card description-card">
          <h3 class="card-title">Xizmat haqida batafsil</h3>
          <p class="service-description-text">
            {{ service.description }}
          </p>

          <div v-if="service.includes && service.includes.length > 0" class="inclusions-section">
            <h4 class="inclusions-title">Xizmat paketiga nimalar kiradi?</h4>
            <div class="inclusions-list">
              <div v-for="(inc, idx) in service.includes" :key="idx" class="inclusion-item">
                <Check :size="16" class="check-icon" />
                <span>{{ inc }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../services/supabase'
import { formatPrice, getInitials, toDeterministicUuid, generateUuid } from '../utils'
import {
  Star, Clock, CheckCircle2, ShieldCheck, MessageCircle,
  MessageSquare, Check, Wrench, Phone, Send, MapPin
} from 'lucide-vue-next'
import { SAMPLE_SERVICES } from '../data/sampleServices'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const service = ref(null)
const creatingChat = ref(false)

const craftsmanPhone = computed(() => {
  return service.value?.craftsman?.phone || ''
})

const craftsmanTelegramLink = computed(() => {
  const cId = service.value?.craftsman?.id
  let tg = service.value?.craftsman?.telegram || ''
  if (!tg && cId) {
    try {
      const meta = localStorage.getItem(`nexsora_user_meta_${cId}`)
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

function loadService() {
  const serviceId = route.params.id

  // 1. Check custom services in localStorage
  try {
    const saved = localStorage.getItem('nexsora_custom_services')
    if (saved) {
      const customList = JSON.parse(saved)
      const foundCustom = customList.find(s => s.id === serviceId)
      if (foundCustom) {
        service.value = foundCustom
        return
      }
    }
  } catch (e) {}

  // 2. Check sample services
  const foundSample = SAMPLE_SERVICES.find(s => s.id === serviceId)
  if (foundSample) {
    service.value = foundSample
  }
}

async function handleOrderService() {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  const validClientId = toDeterministicUuid(authStore.user?.id)
  const rawCraftsmanId = service.value?.craftsman?.id || 'sample-craftsman'
  const validCraftsmanId = toDeterministicUuid(rawCraftsmanId)

  if (validClientId === validCraftsmanId) {
    alert("Bu sizning shaxsiy xizmatingiz.")
    return
  }

  creatingChat.value = true

  try {
    // Check if chat already exists or create new one
    let chatId = null
    try {
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('client_id', validClientId)
        .eq('craftsman_id', validCraftsmanId)
        .maybeSingle()

      if (existingChat) {
        chatId = existingChat.id
      } else {
        const { data: newChat } = await supabase
          .from('chats')
          .insert({
            id: generateUuid(),
            client_id: validClientId,
            craftsman_id: validCraftsmanId,
          })
          .select()
          .single()
        if (newChat) chatId = newChat.id
      }
    } catch (e) {}

    if (!chatId) {
      chatId = generateUuid()
    }

    // Send an automated greeting message referencing the service
    try {
      await supabase.from('messages').insert({
        chat_id: chatId,
        sender_id: validClientId,
        content: `Assalomu alaykum! Men sizning "${service.value.title}" xizmatingizga buyurtma bermoqchiman (Narxi: ${formatPrice(service.value.price)}). Tafsilotlarni kelishib olsak bo'ladimi?`,
      })

      // Send notification to craftsman
      await supabase.from('notifications').insert({
        user_id: validCraftsmanId,
        type: 'new_message',
        title: 'Yangi xizmat buyurtmasi!',
        body: `${authStore.profile?.full_name || 'Mijoz'} "${service.value.title}" xizmatingiz bo'yicha murojaat qildi.`,
        link: `/chat/${chatId}`,
      })
    } catch (e) {}

    router.push(`/chat/${chatId}`)
  } catch (err) {
    console.error('Order service error:', err)
    router.push('/chat')
  } finally {
    creatingChat.value = false
  }
}

onMounted(() => {
  loadService()
})
</script>

<style scoped>
.service-detail-page {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
}

.detail-content {
  padding: 32px 24px 60px;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
}

.service-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Breadcrumbs */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--color-muted);
}

.breadcrumbs a {
  color: var(--color-primary-light);
  text-decoration: none;
  font-weight: 600;
}

.crumb-active {
  color: var(--color-text-2);
}

/* Showcase Card */
.service-showcase-card {
  padding: 0;
  overflow: hidden;
  border-radius: 24px;
}

.showcase-cover-box {
  width: 100%;
  height: 340px;
  position: relative;
  overflow: hidden;
  background: var(--color-surface-2);
}

.showcase-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.showcase-badges {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  gap: 8px;
}

.badge-subtle {
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.showcase-info {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.service-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.35;
  margin: 0;
}

.metrics-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.metric-divider {
  width: 1px;
  height: 16px;
  background: var(--color-border);
}

.star-gold { color: var(--color-warning); fill: var(--color-warning); }
.icon-success { color: var(--color-success); }
.icon-primary { color: var(--color-primary-light); }

.metric-val {
  font-weight: 700;
  color: var(--color-text);
  font-size: 0.95rem;
}

.metric-sub {
  font-size: 0.85rem;
  color: var(--color-muted);
}

/* 2-Column Info Grid */
.details-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* Price & Order Card */
.price-order-card {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-radius: 20px;
}

.price-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-tag-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-muted);
  text-transform: uppercase;
}

.price-big {
  font-size: 1.85rem;
  font-weight: 900;
  color: var(--color-success);
}

.order-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: 16px 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
  color: var(--color-text-2);
}

.feature-icon {
  color: var(--color-primary-light);
  flex-shrink: 0;
}

.order-action-btn {
  width: 100%;
  justify-content: center;
  padding: 14px 20px;
  font-size: 1rem;
  font-weight: 700;
}

/* Craftsman Profile Card */
.craftsman-profile-card {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-radius: 20px;
}

.craftsman-header-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.craftsman-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.craftsman-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-muted);
  text-transform: uppercase;
}

.craftsman-fullname {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}

.craftsman-specs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--color-muted);
}

.craftsman-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 12px;
  text-align: center;
}

.craft-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.craft-stat-val {
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--color-text);
}

.craft-stat-sub {
  font-size: 0.72rem;
  color: var(--color-muted);
}

.craftsman-quick-contacts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.contact-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-decoration: none;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 10px;
}

.telegram-btn {
  background: rgba(36, 161, 222, 0.15) !important;
  color: #24A1DE !important;
  border: 1px solid rgba(36, 161, 222, 0.35) !important;
}

.telegram-btn:hover {
  background: #24A1DE !important;
  color: #ffffff !important;
  border-color: #24A1DE !important;
}

.full-btn {
  width: 100%;
  justify-content: center;
}

/* Description Card */
.description-card {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-radius: 20px;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}

.service-description-text {
  white-space: pre-line;
  line-height: 1.8;
  color: var(--color-text-2);
  font-size: 0.98rem;
  margin: 0;
}

.inclusions-section {
  border-top: 1px solid var(--color-border);
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inclusions-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.inclusions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.inclusion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.92rem;
  color: var(--color-text);
}

.check-icon {
  color: var(--color-success);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .details-info-grid {
    grid-template-columns: 1fr;
  }
  .showcase-cover-box {
    height: 220px;
  }
  .service-title {
    font-size: 1.35rem;
  }
}
</style>
