<template>
  <!-- 1. If offer was already submitted -->
  <div v-if="existingOffer" class="card existing-offer-card">
    <div class="existing-offer-header">
      <div class="status-indicator">
        <span class="pulse-dot"></span>
        <h4>Sizning taklifingiz</h4>
      </div>
      <span class="badge" :class="getStatusBadgeClass(existingOffer.status)">
        {{ getOfferStatusLabel(existingOffer.status) }}
      </span>
    </div>

    <!-- Job snippet -->
    <div class="job-snippet-box">
      <div class="snippet-label">Tanlangan e'lon:</div>
      <div class="snippet-title">{{ jobTitle || job?.title || 'E\'lon' }}</div>
    </div>

    <!-- Offer details -->
    <div class="existing-details-grid">
      <div class="detail-item">
        <DollarSign :size="16" class="icon-accent" />
        <div>
          <div class="detail-label">Taklif summasi</div>
          <div class="detail-val highlight">{{ formatPrice(existingOffer.price) }}</div>
        </div>
      </div>

      <div class="detail-item">
        <Clock :size="16" class="icon-accent" />
        <div>
          <div class="detail-label">Muddati</div>
          <div class="detail-val">{{ existingOffer.duration_days }} kunda</div>
        </div>
      </div>
    </div>

    <div v-if="existingOffer.message" class="existing-message-box">
      <div class="message-label"><FileText :size="14" /> Xizmat tavsifi & imkoniyatlar:</div>
      <p class="message-content">{{ existingOffer.message }}</p>
    </div>
  </div>

  <!-- 2. Success state -->
  <div v-else-if="success" class="card success-card">
    <div class="success-icon-box">
      <CheckCircle2 :size="32" />
    </div>
    <h4>Taklifingiz muvaffaqiyatli yuborildi!</h4>
    <p>Mijoz taklifingizni ko'rib chiqib, chat orqali siz bilan bog'lanadi.</p>
  </div>

  <!-- 3. Offer Submission Form -->
  <div v-else class="card offer-form-card">
    <div class="form-header">
      <div class="form-title-box">
        <Wrench :size="20" class="header-icon" />
        <h4>Ustaning Taklif Yuborish Bo'limi</h4>
      </div>
      <span class="badge badge-primary">Faol e'lon</span>
    </div>

    <!-- 1-QADAM: Birinchi e'lon ko'rinib turishi -->
    <div class="job-preview-banner">
      <div class="preview-tag">E'lon tafsilotlari</div>
      <h5 class="preview-title">{{ jobTitle || job?.title || 'Ish sarlavhasi' }}</h5>
      <div class="preview-meta-row">
        <span v-if="job?.category" class="preview-meta-pill">
          <Briefcase :size="12" /> {{ job.category }}
        </span>
        <span v-if="job?.city" class="preview-meta-pill">
          <MapPin :size="12" /> {{ job.city }}
        </span>
        <span v-if="job?.budget_min || job?.budget_max" class="preview-meta-pill budget-pill">
          <DollarSign :size="12" /> Byudjet: {{ formatPrice(job.budget_min) }} - {{ formatPrice(job.budget_max) }}
        </span>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="offer-fields-form">
      
      <!-- 2-QADAM: Tagida nima qila olishi haqida yozishi kerak -->
      <div class="input-group">
        <label class="input-label">
          <FileText :size="14" /> Nima qila olasiz? (Xizmat va tajribangiz tavsifi) *
        </label>
        <textarea
          v-model="form.message"
          placeholder="Ushbu ishni qanday bajarasiz, qanday uskunalar/materiallar ishlatasiz va nimalar qila olishingiz haqida batafsil yozing..."
          class="textarea custom-textarea"
          rows="4"
          required
        />
        <span class="input-hint">Mijoz aynan sizning ushbu izohingiz orqali tanlov qiladi</span>
      </div>

      <!-- 3-QADAM: Keyin esa summasini -->
      <div class="input-group">
        <label class="input-label">
          <DollarSign :size="14" /> Taklif summasi (so'mda) *
        </label>
        <div class="input-icon-wrapper">
          <DollarSign :size="16" class="input-icon" />
          <input
            v-model="form.price"
            type="number"
            min="1000"
            placeholder="Masalan: 150000"
            class="input"
            required
          />
        </div>
      </div>

      <!-- 4-QADAM: Keyin ishni nomini kiritadi -->
      <div class="input-group">
        <label class="input-label">
          <Wrench :size="14" /> Taklif etilayotgan ish / xizmat nomi *
        </label>
        <div class="input-icon-wrapper">
          <Briefcase :size="16" class="input-icon" />
          <input
            v-model="form.job_name"
            type="text"
            placeholder="Masalan: Santexnika quvurlarini almashtirish va montaj"
            class="input"
            required
          />
        </div>
      </div>

      <!-- 5-QADAM: Keyin kunini nechi kunda tugata olishini -->
      <div class="input-group">
        <label class="input-label">
          <Clock :size="14" /> Necha kunda tugata olasiz? (kun) *
        </label>
        <div class="input-icon-wrapper">
          <Clock :size="16" class="input-icon" />
          <input
            v-model="form.duration_days"
            type="number"
            min="1"
            max="365"
            placeholder="Masalan: 2 (2 kunda to'liq bitkaziladi)"
            class="input"
            required
          />
        </div>
      </div>

      <div v-if="error" class="error-box">{{ error }}</div>

      <!-- Submit Action Button -->
      <button type="submit" class="btn btn-primary btn-submit-offer" :disabled="loading">
        <span v-if="loading" class="animate-spin loader"></span>
        <template v-else>
          <Send :size="16" /> Taklifni yuborish
        </template>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  DollarSign, Clock, Send, Briefcase, FileText,
  Wrench, MapPin, CheckCircle2
} from 'lucide-vue-next'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../stores/auth'
import { formatPrice, toDeterministicUuid, generateUuid } from '../utils'
import { sendTelegramNotification, formatOfferAlert } from '../services/telegramNotifier'

const props = defineProps({
  job: Object,
  jobId: String,
  userId: String,
  clientId: String,
  jobTitle: String,
  craftsmanName: String,
  existingOffer: Object,
})

const emit = defineEmits(['submitted'])
const authStore = useAuthStore()

const form = ref({
  message: '',
  price: '',
  job_name: '',
  duration_days: '',
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

function getStatusBadgeClass(status) {
  if (status === 'accepted') return 'badge-success'
  if (status === 'rejected') return 'badge-error'
  return 'badge-warning'
}

function getOfferStatusLabel(status) {
  if (status === 'accepted') return 'Qabul qilindi'
  if (status === 'rejected') return 'Rad etildi'
  return 'Kutilmoqda'
}

async function handleSubmit() {
  if (!form.value.message.trim() || !form.value.price || !form.value.job_name.trim() || !form.value.duration_days) {
    error.value = "Barcha maydonlarni to'liq to'ldiring"
    return
  }

  loading.value = true
  error.value = ''

  try {
    const validJobId = toDeterministicUuid(props.jobId)
    const validCraftsmanId = toDeterministicUuid(props.userId || authStore.user?.id)
    const fullMessage = `Xizmat: ${form.value.job_name.trim()}\n\nTavsif: ${form.value.message.trim()}`

    const newOfferData = {
      id: generateUuid(),
      job_id: validJobId,
      craftsman_id: validCraftsmanId,
      price: Number(form.value.price),
      duration_days: Number(form.value.duration_days),
      message: fullMessage,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    // 1. Try Supabase insert
    let savedInSupabase = false
    try {
      // Ensure job exists in DB if it's a sample job
      if (props.job && (!props.job.created_at || props.job.id !== validJobId)) {
        try {
          await supabase.from('jobs').upsert({
            id: validJobId,
            client_id: toDeterministicUuid(props.clientId || props.job.client_id),
            title: props.job.title,
            category: props.job.category,
            city: props.job.city || 'Toshkent',
            budget_min: props.job.budget_min || 0,
            budget_max: props.job.budget_max || 0,
            description: props.job.description || '',
            status: 'open'
          })
        } catch (e) {}
      }

      const { data, error: offerError } = await supabase.from('offers').insert(newOfferData).select().single()
      if (!offerError && data) {
        savedInSupabase = true
      }
    } catch (dbErr) {
      console.warn('Supabase offer insert fallback to local:', dbErr)
    }

    // 2. Persist locally in localStorage for resilience
    try {
      const localOffersKey = `nexsora_offers_${validJobId}`
      const existing = JSON.parse(localStorage.getItem(localOffersKey) || '[]')
      existing.unshift(newOfferData)
      localStorage.setItem(localOffersKey, JSON.stringify(existing))

      // Also track in craftsman's submitted offers list
      const myOffersKey = `nexsora_my_offers_${validCraftsmanId}`
      const myExisting = JSON.parse(localStorage.getItem(myOffersKey) || '[]')
      myExisting.unshift({
        ...newOfferData,
        job: props.job || { title: props.jobTitle }
      })
      localStorage.setItem(myOffersKey, JSON.stringify(myExisting))
    } catch (e) {}

    // 3. Send notification to the job owner (client)
    try {
      const ustaName = props.craftsmanName || authStore.profile?.full_name || 'Usta'
      const priceText = formatPrice(Number(form.value.price))
      const notifBody = `${ustaName} "${props.jobTitle || 'Ish'}" uchun "${form.value.job_name.trim()}" bo'yicha ${priceText} taklif qildi (${form.value.duration_days} kunda).`
      const targetClientUid = toDeterministicUuid(props.clientId || props.job?.client_id)

      if (targetClientUid) {
        const notifItem = {
          id: generateUuid(),
          user_id: targetClientUid,
          type: 'new_offer',
          title: "E'loningizga yangi taklif keldi! 📩",
          body: notifBody,
          link: `/jobs/${validJobId}`,
          is_read: false,
          created_at: new Date().toISOString()
        }

        try {
          await supabase.from('notifications').insert(notifItem)
        } catch (e) {}

        // Also save to localStorage for client notification sync
        try {
          const clientNotifKey = `nexsora_notifications_${targetClientUid}`
          const savedNotifs = JSON.parse(localStorage.getItem(clientNotifKey) || '[]')
          savedNotifs.unshift(notifItem)
          localStorage.setItem(clientNotifKey, JSON.stringify(savedNotifs))

          // Trigger cross-window / tab notification event
          window.dispatchEvent(new CustomEvent('nexsora:notification', { detail: notifItem }))
        } catch (e) {}
      }

      // Telegram xabarnoma: FAQAT e'lon egasiga (mijozga) yuborish
      try {
        const tgMsg = formatOfferAlert(
          props.jobTitle || props.job?.title || 'Buyurtma',
          ustaName,
          priceText,
          form.value.duration_days,
          validJobId
        )

        const clientRecipients = new Set()
        const clientUid = props.clientId || props.job?.client_id
        const currentCraftsmanId = authStore.user?.id

        // 1. Agar e'lon egasi (mijoz) bor bo'lsa, uning Telegram ID sini aniqlash
        if (clientUid && clientUid !== currentCraftsmanId) {
          // Supabase profiles jadvalidan
          try {
            const { data: clientProfile } = await supabase
              .from('profiles')
              .select('telegram_id, telegram')
              .eq('id', toDeterministicUuid(clientUid))
              .maybeSingle()

            const tg = clientProfile?.telegram_id || clientProfile?.telegram
            if (tg && /^\d+$/.test(String(tg).trim())) {
              clientRecipients.add(String(tg).trim())
            }
          } catch (e) {}

          // LocalStorage foydalanuvchi ma'lumotlaridan
          try {
            const meta = localStorage.getItem(`nexsora_user_meta_${toDeterministicUuid(clientUid)}`)
            if (meta) {
              const parsed = JSON.parse(meta)
              if (parsed.telegram && /^\d+$/.test(String(parsed.telegram).trim())) {
                clientRecipients.add(String(parsed.telegram).trim())
              }
            }
          } catch (e) {}
        }

        // 2. E'lon obyektining o'zida mijoz telegrami ko'rsatilgan bo'lsa
        if (props.job?.client?.telegram && /^\d+$/.test(String(props.job.client.telegram).trim())) {
          clientRecipients.add(String(props.job.client.telegram).trim())
        }

        // 3. /telegram-subscribers.json faylidan mijozlarni tekshirish (agar clientRecipients bo'sh bo'lsa)
        if (clientRecipients.size === 0) {
          try {
            const subRes = await fetch(`/telegram-subscribers.json?t=${Date.now()}`)
            if (subRes.ok) {
              const subData = await subRes.json()
              if (Array.isArray(subData.clients)) {
                for (const cl of subData.clients) {
                  if (cl.chatId && /^\d+$/.test(String(cl.chatId).trim())) {
                    clientRecipients.add(String(cl.chatId).trim())
                  }
                }
              }
            }
          } catch (e) {}

          const directClientTg = localStorage.getItem('nexsora_client_telegram_id')
          if (directClientTg && /^\d+$/.test(directClientTg.trim())) {
            clientRecipients.add(directClientTg.trim())
          }
        }

        // 4. Joriy taklif yuborayotgan ustaning o'z Telegram ID sini qat'iyan o'chirish (o'ziga bormasligi uchun)
        const myUstaTg = authStore.profile?.telegram_id || authStore.profile?.telegram || localStorage.getItem('nexsora_craftsman_telegram_id') || localStorage.getItem(`nexsora_user_meta_${currentCraftsmanId}`)
        if (myUstaTg && typeof myUstaTg === 'string' && /^\d+$/.test(myUstaTg.trim())) {
          clientRecipients.delete(myUstaTg.trim())
        }

        // Mijozga xabar yuborish
        for (const clientTg of clientRecipients) {
          await sendTelegramNotification(clientTg, tgMsg)
        }
      } catch (tgErr) {
        console.warn('Telegram offer alert error:', tgErr)
      }
    } catch (e) {}

    success.value = true
    emit('submitted', newOfferData)
  } catch (err) {
    error.value = err.message || "Taklif yuborishda xatolik yuz berdi"
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.offer-form-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 14px;
}

.form-title-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-title-box h4 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.header-icon {
  color: var(--color-primary-light);
}

/* 1. Job Preview Banner */
.job-preview-banner {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-primary);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-tag {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-primary-light);
  letter-spacing: 0.5px;
}

.preview-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.preview-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.preview-meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 3px 8px;
  border-radius: 6px;
  color: var(--color-text-2);
}

.budget-pill {
  color: var(--color-success);
  font-weight: 600;
  border-color: rgba(67, 233, 123, 0.25);
  background: rgba(67, 233, 123, 0.08);
}

/* Form Fields */
.offer-fields-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 6px;
}

.input-label svg {
  color: var(--color-primary-light);
}

.input-hint {
  font-size: 0.74rem;
  color: var(--color-muted);
  margin-top: 4px;
}

.custom-textarea {
  resize: vertical;
  min-height: 90px;
}

.input-icon-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-muted);
}

.input {
  padding-left: 42px;
}

.btn-submit-offer {
  width: 100%;
  justify-content: center;
  padding: 13px;
  font-size: 0.95rem;
  font-weight: 700;
  margin-top: 4px;
  box-shadow: 0 4px 14px rgba(108, 99, 255, 0.25);
}

/* Existing Offer Card */
.existing-offer-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--shadow-sm);
}

.existing-offer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator h4 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-warning);
  box-shadow: 0 0 0 3px rgba(247, 183, 49, 0.2);
}

.job-snippet-box {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 10px 14px;
}

.snippet-label {
  font-size: 0.72rem;
  color: var(--color-muted);
}

.snippet-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  margin-top: 2px;
}

.existing-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.icon-accent {
  color: var(--color-primary-light);
}

.detail-label {
  font-size: 0.72rem;
  color: var(--color-muted);
}

.detail-val {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-text);
}

.detail-val.highlight {
  color: var(--color-success);
}

.existing-message-box {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 14px;
}

.message-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-2);
  margin-bottom: 6px;
}

.message-content {
  font-size: 0.86rem;
  color: var(--color-text);
  line-height: 1.5;
  white-space: pre-line;
  margin: 0;
}

/* Success Card */
.success-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  padding: 32px 24px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 20px;
}

.success-icon-box {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(67, 233, 123, 0.15);
  border: 2px solid rgba(67, 233, 123, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-success);
}

.error-box {
  padding: 12px 14px;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.25);
  border-radius: 10px;
  color: var(--color-error);
  font-size: 0.85rem;
}

.loader {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
}
</style>
