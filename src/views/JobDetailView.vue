<template>
  <div class="job-detail-page-wrapper">
    <main class="public-content">
      <div v-if="loading" class="loading-box">
        <span class="animate-spin loader"></span>
      </div>

      <div v-else-if="!job" class="empty-box card">
        <h3>Ish topilmadi</h3>
        <p>Qidirilayotgan e'lon mavjud emas yoki o'chirilgan</p>
        <router-link to="/jobs" class="btn btn-secondary btn-sm" style="margin-top: 12px">
          Birjaga qaytish
        </router-link>
      </div>

      <div v-else class="job-container">
        <!-- 1. Header Card -->
        <div class="job-header-card">
          <div class="badges">
            <span class="badge badge-primary">{{ job.category }}</span>
            <span class="badge" :style="{
              background: getStatusColor(job.status) + '20',
              color: getStatusColor(job.status),
              border: '1px solid ' + getStatusColor(job.status) + '40'
            }">
              {{ getStatusLabel(job.status) }}
            </span>
          </div>
          <h1 class="job-title">{{ job.title }}</h1>
          <div class="job-meta">
            <span><MapPin :size="14" /> {{ job.city || 'Aniqlanmagan' }}</span>
            <span><Calendar :size="14" /> {{ job.deadline ? formatDate(job.deadline) : 'Muddat yo\'q' }}</span>
            <span><Clock :size="14" /> {{ formatRelativeTime(job.created_at) }}</span>
          </div>
        </div>

        <!-- 2. Description Card -->
        <div class="card job-desc-card">
          <h3 class="section-title">Tavsif</h3>
          <p class="job-desc-text">
            {{ job.description }}
          </p>
        </div>

        <!-- 3. Key Details: Byudjet & Mijoz in a 2-column info grid right below description -->
        <div class="job-info-grid">
          <!-- Byudjet bloki -->
          <div class="card info-box budget-box">
            <div class="info-icon-circle budget-icon">
              <DollarSign :size="22" />
            </div>
            <div class="info-content">
              <span class="info-label">Mo'ljallangan byudjet</span>
              <div class="budget-value">
                {{ formatPrice(job.budget_min) }} — {{ formatPrice(job.budget_max) }}
              </div>
            </div>
          </div>

          <!-- Mijoz bloki -->
          <div class="card info-box client-box">
            <div class="avatar-placeholder avatar-md">
              <img
                v-if="job.profiles?.avatar_url"
                :src="job.profiles.avatar_url"
                :alt="job.profiles?.full_name"
                class="avatar-img"
              />
              <span v-else>{{ getInitials(job.profiles?.full_name) }}</span>
            </div>
            <div class="info-content">
              <span class="info-label">E'lon beruvchi mijoz</span>
              <div class="client-name">
                {{ job.profiles?.full_name || 'Foydalanuvchi' }}
              </div>
              <div class="client-sub">
                <MapPin :size="13" class="inline-icon" />
                <span>{{ job.profiles?.city || job.city || 'Hudud ko\'rsatilmagan' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Action Section: Ustaning Taklif Yuborish Bo'limi / Closed status / Guest CTA -->
        <div class="job-action-section">
          <!-- Offer Form for Craftsman -->
          <OfferForm
            v-if="authStore.isCraftsman && job.status === 'open'"
            :job="job"
            :job-id="job.id"
            :user-id="authStore.user?.id"
            :client-id="job.client_id"
            :job-title="job.title"
            :craftsman-name="authStore.profile?.full_name"
            :existing-offer="myOffer"
            @submitted="fetchJobDetails"
          />

          <!-- Closed / Assigned Job Status Card -->
          <div v-else-if="job.status !== 'open'" class="card closed-job-card">
            <div class="closed-icon-box">
              <CheckCircle2 :size="28" />
            </div>
            <div class="closed-title">
              {{ job.status === 'completed' ? 'Ish yakunlangan' : 'Ish jarayonda' }}
            </div>
            <p class="closed-desc">
              {{ job.status === 'completed' ? 'Ushbu ish muvaffaqiyatli yakunlandi va qabul qilindi.' : 'Ushbu e\'lon uchun taklif qabul qilingan va ijro jarayonda.' }}
            </p>
            <router-link
              v-if="authStore.isAuthenticated"
              to="/chat"
              class="btn btn-primary btn-sm"
              style="margin-top: 14px; width: auto; padding: 10px 24px;"
            >
              <MessageSquare :size="16" />
              <span>Suhbatga o'tish</span>
            </router-link>
          </div>

          <!-- Guest CTA -->
          <div v-else-if="!authStore.isAuthenticated" class="card guest-cta">
            <div class="guest-cta-content">
              <div>
                <h4>Taklif yubormoqchimisiz?</h4>
                <p style="font-size: 0.9rem; color: var(--color-text-2); margin-top: 4px">
                  Usta sifatida ro'yxatdan o'ting yoki tizimga kiring
                </p>
              </div>
              <router-link to="/register?role=craftsman" class="btn btn-primary" style="padding: 10px 24px">
                Ro'yxatdan o'tish
              </router-link>
            </div>
          </div>
        </div>

        <!-- 5. Offers list (Job owner view) -->
        <div v-if="isJobOwner" class="card offers-card">
          <h3 class="section-title" style="margin-bottom: 20px">Kelib tushgan takliflar ({{ offers.length }})</h3>
          <div v-if="offers.length === 0" style="color: var(--color-muted); text-align: center; padding: 32px 0">
            Hali taklif kelmagan
          </div>
          <div v-else class="offers-list">
            <div v-for="offer in offers" :key="offer.id" class="offer-card">
              <div class="offer-header">
                <div class="avatar-placeholder avatar-md">
                  <img
                    v-if="offer.profiles?.avatar_url"
                    :src="offer.profiles.avatar_url"
                    :alt="offer.profiles?.full_name"
                    class="avatar-img"
                  />
                  <span v-else>{{ getInitials(offer.profiles?.full_name) }}</span>
                </div>
                <div>
                  <div class="offer-name">{{ offer.profiles?.full_name }}</div>
                  <div class="offer-sub">
                    {{ offer.profiles?.craftsman_profiles?.specialty?.join(', ') }}
                  </div>
                </div>
                <div class="offer-price-box">
                  <div class="offer-price">{{ formatPrice(offer.price) }}</div>
                  <div class="offer-duration">{{ offer.duration_days }} kun</div>
                </div>
              </div>
              <p v-if="offer.message" class="offer-msg">{{ offer.message }}</p>
              <div class="offer-footer">
                <span class="badge" :class="offer.status === 'accepted' ? 'badge-success' : offer.status === 'rejected' ? 'badge-error' : 'badge-warning'">
                  {{ offer.status === 'accepted' ? 'Qabul qilindi' : offer.status === 'rejected' ? 'Rad etildi' : 'Kutilmoqda' }}
                </span>
                <button
                  v-if="offer.status === 'pending' && job.status === 'open'"
                  class="btn btn-success btn-sm"
                  @click="acceptOffer(offer)"
                >
                  Qabul qilish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import OfferForm from '../components/OfferForm.vue'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../services/supabase'
import { formatPrice, formatDate, formatRelativeTime, getStatusLabel, getStatusColor, getInitials, toDeterministicUuid, generateUuid } from '../utils'
import { MapPin, Calendar, Clock, CheckCircle2, MessageSquare, DollarSign } from 'lucide-vue-next'

import { SAMPLE_CLIENT_JOBS } from '../data/sampleJobs'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const job = ref(null)
const offers = ref([])
const loading = ref(true)
let offerChannel = null

const isJobOwner = computed(() => job.value?.client_id === authStore.user?.id)
const myOffer = computed(() => offers.value.find(o => o.craftsman_id === authStore.user?.id))

async function fetchJobDetails() {
  if (!route.params.id) return
  loading.value = true
  const validJobId = toDeterministicUuid(route.params.id)

  try {
    const { data: jobData } = await supabase
      .from('jobs')
      .select('*, profiles(*)')
      .eq('id', validJobId)
      .maybeSingle()

    if (jobData) {
      job.value = jobData
    } else {
      const customJobs = JSON.parse(localStorage.getItem('nexsora_custom_jobs') || '[]')
      const customMatch = customJobs.find(j => j.id === validJobId || j.id === route.params.id)
      if (customMatch) {
        job.value = customMatch
      } else {
        const sample = SAMPLE_CLIENT_JOBS.find(j => j.id === validJobId || j.id === route.params.id)
        if (sample) {
          job.value = sample
        }
      }
    }

    if (authStore.isAuthenticated) {
      let combinedOffers = []

      // 1. Fetch DB offers
      try {
        const { data: rawOffers } = await supabase
          .from('offers')
          .select('*')
          .eq('job_id', validJobId)
          .order('created_at', { ascending: false })

        if (rawOffers && rawOffers.length > 0) {
          const craftsmanIds = [...new Set(rawOffers.map(o => o.craftsman_id).filter(Boolean))]
          const { data: profs } = await supabase
            .from('profiles')
            .select('*, craftsman_profiles(*)')
            .in('id', craftsmanIds)

          const profMap = new Map((profs || []).map(p => [p.id, p]))

          combinedOffers = rawOffers.map(o => {
            const profile = profMap.get(o.craftsman_id)
            return {
              ...o,
              profiles: profile,
              craftsman: profile,
            }
          })
        }
      } catch (e) {}

      // 2. Fetch local offers for this job (e.g. from craftsman submission)
      try {
        const localKey = `nexsora_offers_${validJobId}`
        const localList = JSON.parse(localStorage.getItem(localKey) || '[]')
        const existingOfferIds = new Set(combinedOffers.map(o => o.id))

        localList.forEach(loc => {
          if (!existingOfferIds.has(loc.id)) {
            combinedOffers.push({
              ...loc,
              profiles: loc.craftsman_id === authStore.user?.id ? authStore.profile : null,
              craftsman: loc.craftsman_id === authStore.user?.id ? authStore.profile : null,
            })
          }
        })
      } catch (e) {}

      offers.value = combinedOffers
    }
  } catch (err) {
    console.error('Job details error:', err)
  } finally {
    loading.value = false
  }
}

async function acceptOffer(offer) {
  try {
    const validJobId = toDeterministicUuid(job.value.id)
    const validClientId = toDeterministicUuid(authStore.user.id)
    const validCraftsmanId = toDeterministicUuid(offer.craftsman_id)

    try {
      await supabase.from('offers').update({ status: 'accepted' }).eq('id', offer.id)
      await supabase.from('offers').update({ status: 'rejected' }).eq('job_id', validJobId).neq('id', offer.id)
      await supabase.from('jobs').update({ status: 'in_progress' }).eq('id', validJobId)

      // Remove pending offer notification
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', validClientId)
        .eq('link', `/jobs/${validJobId}`)
    } catch (e) {}

    // Update local state as well
    if (job.value) job.value.status = 'in_progress'
    offers.value.forEach(o => {
      o.status = o.id === offer.id ? 'accepted' : 'rejected'
    })

    // Create or find chat between client and craftsman
    let chatId = null
    try {
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('job_id', validJobId)
        .eq('craftsman_id', validCraftsmanId)
        .maybeSingle()

      if (existingChat) {
        chatId = existingChat.id
      } else {
        const { data: newChat } = await supabase
          .from('chats')
          .insert({
            id: generateUuid(),
            job_id: validJobId,
            offer_id: offer.id,
            client_id: validClientId,
            craftsman_id: validCraftsmanId,
          })
          .select()
          .single()
        chatId = newChat?.id
      }
    } catch (e) {}

    if (!chatId) {
      chatId = generateUuid()
    }

    // Send initial greeting system message
    try {
      await supabase.from('messages').insert({
        chat_id: chatId,
        sender_id: validClientId,
        content: `Assalomu alaykum! "${job.value.title}" bo'yicha taklifingiz qabul qilindi. Ishni boshlash tafsilotlarini kelishib olamiz.`,
      })

      // Notify craftsman
      await supabase.from('notifications').insert({
        user_id: validCraftsmanId,
        type: 'offer_accepted',
        title: 'Taklifingiz qabul qilindi!',
        body: `"${job.value.title}" bo'yicha yuborgan taklifingiz mijoz tomonidan qabul qilindi. Chat orqali bog'laning.`,
        link: `/chat/${chatId}`,
      })
    } catch (e) {}

    router.push(`/chat/${chatId}`)
  } catch (err) {
    console.error('Accept offer error:', err)
  }
}

watch(() => route.params.id, (newId) => {
  if (newId) fetchJobDetails()
})

onMounted(() => {
  fetchJobDetails()

  if (route.params.id) {
    offerChannel = supabase
      .channel(`job-offers-${route.params.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'offers',
        filter: `job_id=eq.${route.params.id}`
      }, () => {
        fetchJobDetails()
      })
      .subscribe()
  }
})

onUnmounted(() => {
  if (offerChannel) {
    supabase.removeChannel(offerChannel)
  }
})
</script>

<style scoped>
.job-detail-page-wrapper {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
}

.public-content {
  padding: 32px 24px 60px;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
}

.job-container {
  max-width: 920px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.job-header-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: var(--shadow-sm);
}

.badges { display: flex; gap: 8px; flex-wrap: wrap; }
.job-title { font-size: 1.65rem; font-weight: 800; color: var(--color-text); line-height: 1.35; }
.job-meta { display: flex; gap: 16px; flex-wrap: wrap; font-size: 0.82rem; color: var(--color-muted); }
.job-meta span { display: flex; align-items: center; gap: 5px; }

.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 14px;
}

.job-desc-card {
  padding: 28px;
}

.job-desc-text {
  white-space: pre-line;
  line-height: 1.8;
  color: var(--color-text-2);
  font-size: 0.98rem;
  margin: 0;
}

/* 2-Column Info Grid for Budget & Client */
.job-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-box {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-radius: 18px;
}

.info-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.budget-icon {
  background: rgba(67, 233, 123, 0.15);
  color: var(--color-success);
  border: 1px solid rgba(67, 233, 123, 0.25);
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.budget-value {
  font-size: 1.22rem;
  font-weight: 800;
  color: var(--color-success);
}

.client-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
}

.client-sub {
  font-size: 0.8rem;
  color: var(--color-muted);
}

.job-action-section {
  width: 100%;
}

.guest-cta {
  padding: 24px 28px;
}

.guest-cta-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.guest-cta h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
}

.offers-card {
  padding: 28px;
}

.offers-list { display: flex; flex-direction: column; gap: 16px; }
.offer-card { padding: 20px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; }
.offer-header { display: flex; align-items: center; gap: 12px; }
.offer-name { font-weight: 600; font-size: 0.9rem; color: var(--color-text); }
.offer-sub { font-size: 0.75rem; color: var(--color-muted); }
.offer-price-box { margin-left: auto; text-align: right; }
.offer-price { font-weight: 700; color: var(--color-success); font-size: 1.1rem; }
.offer-duration { font-size: 0.75rem; color: var(--color-muted); }
.offer-msg { font-size: 0.85rem; color: var(--color-text-2); margin: 12px 0; line-height: 1.6; }
.offer-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }

.loading-box, .empty-box { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px; color: var(--color-muted); gap: 12px; text-align: center; }
.loader { display: inline-block; width: 32px; height: 32px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; }

.closed-job-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  padding: 28px 24px;
  border-left: 4px solid var(--color-success);
}

.closed-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(67, 233, 123, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-success);
}

.closed-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
}

.closed-desc {
  font-size: 0.85rem;
  color: var(--color-text-2);
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .job-info-grid {
    grid-template-columns: 1fr;
  }
  .job-title {
    font-size: 1.35rem;
  }
  .public-content {
    padding: 20px 16px 40px;
  }
}
</style>
