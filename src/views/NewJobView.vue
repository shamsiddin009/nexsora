<template>
  <div class="new-job-page-container">
    <main class="content">
      
      <!-- CRAFTSMAN RESTRICTION BANNER -->
      <div v-if="authStore.isCraftsman" class="craftsman-warning-card card">
        <div class="warning-icon-box">
          <HardHat :size="28" />
        </div>
        <div class="warning-info">
          <h3>Siz Usta Profilidasiz</h3>
          <p>E'lon berish faqat buyurtmachi (mijoz)lar uchun mo'ljallangan. Usta sifatida yangi xizmat qo'shishingiz yoki Birjada mijozlar e'lonlariga taklif yuborishingiz mumkin.</p>
          <div class="warning-actions">
            <router-link to="/services/new" class="btn btn-primary btn-sm">
              <Plus :size="15" /> Xizmat Qo'shish
            </router-link>
            <router-link to="/jobs" class="btn btn-secondary btn-sm">
              <Briefcase :size="15" /> Birjaga O'tish
            </router-link>
          </div>
        </div>
      </div>

      <!-- MAIN CLIENT JOB FORM -->
      <template v-else>
        <div class="page-header">
          <h1>Yangi E'lon Joylash</h1>
          <p>Buyurtma turini tanlang va professional ustalardan takliflar qabul qiling</p>
        </div>

        <!-- PROJECT TYPE SELECTOR: Regular vs Big Building -->
        <div class="project-type-grid">
          <div
            class="type-card"
            :class="{ active: projectType === 'regular' }"
            @click="setProjectType('regular')"
          >
            <div class="type-icon-box regular">
              <Wrench :size="22" />
            </div>
            <div class="type-content">
              <h4>Oddiy Xizmat / Buyurtma</h4>
              <p>Santexnika, elektr, mayda ta'mirlash va xonadon xizmatlari</p>
            </div>
            <div v-if="projectType === 'regular'" class="type-check-badge">
              <Check :size="14" />
            </div>
          </div>

          <div
            class="type-card"
            :class="{ active: projectType === 'building' }"
            @click="setProjectType('building')"
          >
            <div class="type-icon-box building">
              <Building2 :size="22" />
            </div>
            <div class="type-content">
              <h4>Katta Loyiha / Bino Qurilishi</h4>
              <p>Hovli, kottej, ofis qurilishi yoki kompleks brigada talab qiladigan obyektlar</p>
            </div>
            <div v-if="projectType === 'building'" class="type-check-badge">
              <Check :size="14" />
            </div>
          </div>
        </div>

        <div class="form-wrapper">
          <form class="form" @submit.prevent="handleSubmit">
            <div class="input-group">
              <label class="input-label">
                {{ projectType === 'building' ? 'Loyiha / Bino sarlavhasi *' : 'Ish sarlavhasi *' }}
              </label>
              <div class="input-icon-wrapper">
                <Type :size="16" class="input-icon" />
                <input
                  v-model="form.title"
                  :placeholder="projectType === 'building' ? 'Masalan: 2 qavatli 350 m² kottej qurilishiga usta brigadasi kerak' : 'Masalan: Vannaxona santexnikasini ta\'mirlash kerak'"
                  class="input"
                  required
                />
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">Kategoriya *</label>
              <CustomSelect
                v-model="form.category"
                :options="CATEGORY_OPTIONS"
                placeholder="Kategoriya tanlang"
                search-placeholder="Kategoriyani qidirish..."
              />
            </div>


          <div class="input-group">
            <label class="input-label">Tavsif *</label>
            <textarea
              v-model="form.description"
              placeholder="Qanday ish kerakligini, hajmini va talablaringizni tushuntiring..."
              class="textarea"
              rows="5"
              required
            />
          </div>

          <!-- Turnkey Building / Brigade Project Special Block -->
          <div v-if="form.category === 'Quruvchi & Brigada'" class="building-project-box card">
            <div class="box-header">
              <div class="box-icon"><HardHat :size="18" /></div>
              <div>
                <h4>Katta Bino / Kottej Qurilishi Parametrlari</h4>
                <p>Usta brigadalari uchun obyekt o'lchamlari va bosqichlarini belgilang</p>
              </div>
            </div>

            <div class="row">
              <div class="input-group">
                <label class="input-label sub-label">Bino / Obyekt Maydoni (m²):</label>
                <div class="input-icon-wrapper">
                  <Ruler :size="16" class="input-icon" />
                  <input v-model="buildingDetails.area" type="number" placeholder="Masalan: 350" class="input" />
                </div>
              </div>
              <div class="input-group">
                <label class="input-label sub-label">Qavatlar soni:</label>
                <CustomSelect
                  v-model="buildingDetails.floors"
                  :options="FLOOR_OPTIONS"
                  placeholder="Qavatlar sonini tanlang"
                  :searchable="false"
                />
              </div>
            </div>

            <div class="milestones-info-pill">
              <ShieldCheck :size="16" class="text-success" />
              <span><strong>Bosqichma-bosqich Escrow:</strong> Mablag' poydevor, devor, tom va pardozlash bosqichlari topshirilgach to'lanadi.</span>
            </div>
          </div>


          <!-- AI Assistant Banner & Trigger -->
          <div class="ai-assistant-card">
            <div class="ai-header">
              <div class="ai-badge">
                <Sparkles :size="15" />
                <span>AI Narx & Byudjet Yordamchisi</span>
              </div>
              <button
                type="button"
                class="btn-ask-ai"
                :disabled="isEstimating || !form.title"
                @click="runAiEstimate"
              >
                <Loader2 v-if="isEstimating" :size="15" class="animate-spin" />
                <Sparkles v-else :size="15" />
                <span>{{ isEstimating ? 'Tahlil qilinmoqda...' : 'AI Maslahati olish' }}</span>
              </button>
            </div>

            <!-- AI Result Box -->
            <div v-if="aiResult" class="ai-result-content">
              <div class="ai-prices-row">
                <div class="ai-price-box">
                  <span class="ai-price-label">Tavsiya qilingan bozor narxi:</span>
                  <span class="ai-price-val">
                    {{ aiResult.minPrice.toLocaleString() }} — {{ aiResult.maxPrice.toLocaleString() }} so'm
                  </span>
                </div>
                <div class="ai-price-box">
                  <span class="ai-price-label">O'rtacha muddat:</span>
                  <span class="ai-price-val">{{ aiResult.days }} kun</span>
                </div>
                <button type="button" class="btn-apply-ai" @click="applyAiRecommendation">
                  <Check :size="14" /> Narxni qo'llash
                </button>
              </div>

              <div class="ai-tip-box" v-if="aiResult.advice">
                <Lightbulb :size="16" class="tip-icon" />
                <p>{{ aiResult.advice }}</p>
              </div>
            </div>
          </div>

          <div class="budget-section-container">
            <div class="budget-header-row">
              <label class="input-label">Byudjet oralig'i (so'm)</label>
              <button type="button" class="btn-ai-budget-trigger" @click="showAiPriceModal = true">
                <Sparkles :size="14" />
                <span>AI Narx Kalkulyatori</span>
              </button>
            </div>
            <div class="row">
              <div class="input-group">
                <CurrencyInput
                  v-model="form.budget_min"
                  label="Minimal byudjet"
                  placeholder="50 000"
                  :quick-presets="[50000, 100000, 300000, 500000]"
                  :step="50000"
                />
              </div>
              <div class="input-group">
                <CurrencyInput
                  v-model="form.budget_max"
                  label="Maksimal byudjet"
                  placeholder="500 000"
                  :quick-presets="[500000, 1000000, 2000000, 5000000]"
                  :step="50000"
                />
              </div>
            </div>
          </div>


          <div class="row">
            <div class="input-group">
              <label class="input-label">Shahar / Viloyat</label>
              <CustomSelect
                v-model="form.city"
                :options="CITY_OPTIONS"
                placeholder="Shahar tanlang"
                search-placeholder="Shaharni qidirish..."
              />
            </div>
            <div class="input-group">
              <label class="input-label">Bajarish muddati</label>
              <input v-model="form.deadline" type="date" class="input" />
            </div>
          </div>

          <div v-if="error" class="error-box">{{ error }}</div>

          <button type="submit" class="btn btn-primary btn-lg" :disabled="loading" style="align-self: flex-start; min-width: 180px">
            <span v-if="loading" class="animate-spin loader"></span>
            <span v-else>{{ projectType === 'building' ? 'Bino Qurilishini E\'lon Qilish' : 'E\'lon Joylash' }}</span>
          </button>
        </form>
      </div>
    </template>
    </main>

    <!-- AI Price Estimator Modal -->
    <AiPriceEstimatorModal
      :is-open="showAiPriceModal"
      :initial-title="form.title"
      :initial-category="form.category || 'Elektrik'"
      @close="showAiPriceModal = false"
      @applied="handleAiPriceApplied"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../services/supabase'
import CustomSelect from '../components/CustomSelect.vue'
import CurrencyInput from '../components/common/CurrencyInput.vue'
import AiPriceEstimatorModal from '../components/AiPriceEstimatorModal.vue'
import { CATEGORY_OPTIONS, CITY_OPTIONS, JOB_CATEGORIES, UZ_CITIES, toDeterministicUuid, generateUuid } from '../utils'
import {
  Type, Briefcase, Sparkles, Loader2, Check, Lightbulb,
  HardHat, ShieldCheck, Building2, Wrench, Plus, Ruler, Layers
} from 'lucide-vue-next'
import { sendTelegramNotification, formatJobAlert, formatClientJobConfirmation } from '../services/telegramNotifier'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')

const projectType = ref('regular')

function setProjectType(type) {
  projectType.value = type
  if (type === 'building') {
    form.value.category = 'Quruvchi & Brigada'
    if (!form.value.title) {
      form.value.title = 'Kottej / Bino qurilishiga usta brigadasi'
    }
  } else {
    if (form.value.category === 'Quruvchi & Brigada') {
      form.value.category = ''
    }
  }
}

const FLOOR_OPTIONS = [
  { value: '1', label: '1 qavatli bino', icon: '🏠' },
  { value: '2', label: '2 qavatli (Mansarda bilan)', icon: '🏡' },
  { value: '3', label: '3 qavat va undan ortiq', icon: '🏢' },
  { value: 'commercial', label: 'Tijoriy / Ofis binosi', icon: '🏬' },
]

const buildingDetails = ref({
  area: '',
  floors: '2'
})

onMounted(() => {
  if (authStore.isCraftsman) {
    router.replace('/services/new')
    return
  }
  if (route.query.type === 'building' || route.query.category === 'Quruvchi & Brigada') {
    setProjectType('building')
  } else if (route.query.category) {
    form.value.category = route.query.category
  }
})




const showAiPriceModal = ref(false)


function handleAiPriceApplied(data) {
  form.value.budget_min = data.minBudget
  form.value.budget_max = data.maxBudget
  if (data.category && !form.value.category) {
    form.value.category = data.category
  }
}

const isEstimating = ref(false)
const aiResult = ref(null)

const form = ref({
  title: '',

  description: '',
  category: '',
  budget_min: '',
  budget_max: '',
  deadline: '',
  city: '',
})

async function runAiEstimate() {
  if (!form.value.title) return
  isEstimating.value = true
  try {
    aiResult.value = await aiAssistantService.estimateJob({
      title: form.value.title,
      category: form.value.category || 'Boshqa',
      description: form.value.description,
      city: form.value.city || 'Toshkent'
    })
  } catch (e) {
    console.warn('AI estimate error:', e)
  } finally {
    isEstimating.value = false
  }
}

function applyAiRecommendation() {
  if (!aiResult.value) return
  form.value.budget_min = aiResult.value.minPrice
  form.value.budget_max = aiResult.value.maxPrice
}

async function handleSubmit() {
  if (!form.value.title || !form.value.description || !form.value.category) {
    error.value = 'Sarlavha, tavsif va kategoriya majburiy'
    return
  }

  loading.value = true
  error.value = ''

  try {
    let finalDescription = form.value.description
    if (form.value.category === 'Quruvchi & Brigada' && buildingDetails.value.area) {
      finalDescription += `\n\n🏢 Bino parametrlari: ${buildingDetails.value.area} m² | Qavatlar: ${buildingDetails.value.floors} | Bosqichma-bosqich (Milestone) to'lov`
    }

    const clientId = toDeterministicUuid(authStore.user?.id || 'client-local-id')
    const newJobId = generateUuid()

    const newJobPayload = {
      id: newJobId,
      client_id: clientId,
      title: form.value.title,
      description: finalDescription,
      category: form.value.category,
      budget_min: Number(form.value.budget_min) || 0,
      budget_max: Number(form.value.budget_max) || 0,
      deadline: form.value.deadline || null,
      city: form.value.city || 'Toshkent',
      status: 'open',
      created_at: new Date().toISOString(),
      profiles: authStore.profile || {
        id: clientId,
        full_name: authStore.profile?.full_name || 'Mijoz',
        phone: authStore.profile?.phone || '+998901234567',
        city: form.value.city || 'Toshkent',
        avatar_url: authStore.profile?.avatar_url || null
      }
    }

    let savedJob = newJobPayload

    // 1. Try Supabase insert
    try {
      const { data, error: jobError } = await supabase
        .from('jobs')
        .insert({
          id: newJobId,
          client_id: clientId,
          title: form.value.title,
          description: finalDescription,
          category: form.value.category,
          budget_min: Number(form.value.budget_min) || 0,
          budget_max: Number(form.value.budget_max) || 0,
          deadline: form.value.deadline || null,
          city: form.value.city || 'Toshkent',
          status: 'open',
        })
        .select()
        .single()

      if (!jobError && data) {
        savedJob = { ...newJobPayload, ...data }
      }
    } catch (dbErr) {
      console.warn('Supabase job insert RLS fallback:', dbErr)
    }

    // 2. Always persist in localStorage for resilience
    try {
      const customJobs = JSON.parse(localStorage.getItem('nexsora_custom_jobs') || '[]')
      customJobs.unshift(savedJob)
      localStorage.setItem('nexsora_custom_jobs', JSON.stringify(customJobs))
    } catch (e) {}

    // 3. Telegram xabarnomalari (Faqat shu kategoriyani tanlagan ustalarga yuborish)
    try {
      const clientName = authStore.profile?.full_name || 'Mijoz'
      const jobCategory = (savedJob.category || '').trim()
      const clientConfirmation = formatClientJobConfirmation(savedJob)

      // Kategoriya mosligini tekshirish uchun yordamchi funksiya
      const normalizeCat = (str) => String(str || '').toLowerCase().replace(/['`’‘]/g, '').replace(/[^a-z0-9а-яё]/gi, '').trim()
      const isMatching = (specialties, targetCat) => {
        if (!Array.isArray(specialties) || specialties.length === 0) return false
        const targetNorm = normalizeCat(targetCat)
        if (!targetNorm) return false
        return specialties.some(spec => {
          const specNorm = normalizeCat(spec)
          if (!specNorm) return false
          if (specNorm === targetNorm) return true
          if (targetNorm.includes(specNorm) || specNorm.includes(targetNorm)) return true
          const specRoot = specNorm.slice(0, 4)
          const jobRoot = targetNorm.slice(0, 4)
          if (specRoot.length >= 3 && jobRoot.length >= 3 && specRoot === jobRoot) return true
          return false
        })
      }

      // 3.1 Mijozning Telegram ID sini aniqlash (ustalar ro'yxatidan chiqarib tashlash uchun)
      let clientTg = localStorage.getItem('nexsora_client_telegram_id') || localStorage.getItem('nexsora_telegram_id')
      if (!clientTg && authStore.user?.id) {
        try {
          const meta = localStorage.getItem(`nexsora_user_meta_${authStore.user.id}`)
          if (meta) {
            const parsed = JSON.parse(meta)
            clientTg = parsed.telegram
          }
        } catch (e) {}
      }
      const clientChatId = clientTg && /^\d+$/.test(String(clientTg).trim()) ? String(clientTg).trim() : null

      // DIQQAT: Mijoz e'lon joylaganda uning o'ziga Telegramga xabar YUBORILMAYDI.
      // Xabar FAQAT sohasiga mos USTALARGA yuboriladi!

      // 3.2 Kategoriya bo'yicha FAQAT mos ustalarni yig'ish (chatId)
      const recipientMap = new Map()

      // 1. /telegram-subscribers.json faylidagi ro'yxatdan o'tgan ustalarni olish
      try {
        const subRes = await fetch(`/telegram-subscribers.json?t=${Date.now()}`)
        if (subRes.ok) {
          const subData = await subRes.json()
          if (Array.isArray(subData.craftsmen)) {
            for (const c of subData.craftsmen) {
              const tg = c.chatId
              if (tg && /^\d+$/.test(String(tg).trim())) {
                const specList = Array.isArray(c.specialties) ? c.specialties : []
                if (specList.length === 0 || isMatching(specList, jobCategory)) {
                  recipientMap.set(String(tg).trim(), true)
                }
              }
            }
          }
          // Mijozlar ro'yxatidagi barcha chat_id larni ustalar ro'yxatidan o'chirish
          if (Array.isArray(subData.clients)) {
            for (const cl of subData.clients) {
              if (cl.chatId) recipientMap.delete(String(cl.chatId).trim())
            }
          }
        }
      } catch (subErr) {
        console.warn('Subscribers file read warning:', subErr)
      }

      // 2. Supabase'dagi barcha ustalar va ularning mutaxassisliklarini tekshirish
      try {
        const { data: dbCraftsmen } = await supabase
          .from('craftsman_profiles')
          .select('id, specialty, profiles:id(telegram, telegram_id, role)')

        if (dbCraftsmen && dbCraftsmen.length > 0) {
          for (const c of dbCraftsmen) {
            const tg = c.profiles?.telegram_id || c.profiles?.telegram
            if (tg && /^\d+$/.test(String(tg).trim())) {
              const specList = Array.isArray(c.specialty) ? c.specialty : []
              if (specList.length === 0 || isMatching(specList, jobCategory)) {
                recipientMap.set(String(tg).trim(), true)
              }
            }
          }
        }
      } catch (dbErr) {
        console.warn('DB craftsmen query for TG alerts:', dbErr)
      }

      // 3. Lokal saqlangan foydalanuvchilar (localStorage metadata)
      try {
        const directUstaTg = localStorage.getItem('nexsora_craftsman_telegram_id')
        if (directUstaTg && /^\d+$/.test(directUstaTg.trim())) {
          recipientMap.set(directUstaTg.trim(), true)
        }

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('nexsora_user_meta_')) {
            const val = localStorage.getItem(key)
            if (val) {
              const obj = JSON.parse(val)
              const tg = obj.telegram
              if (tg && /^\d+$/.test(String(tg).trim())) {
                const specList = Array.isArray(obj.specialties) ? obj.specialties : []
                const isCraftsmanRole = obj.role === 'craftsman' || !obj.role
                if (isCraftsmanRole && (specList.length === 0 || isMatching(specList, jobCategory))) {
                  recipientMap.set(String(tg).trim(), true)
                }
              }
            }
          }
        }
      } catch (e) {}

      // E'lon bergan mijozning o'zini qat'iy ustalar ro'yxatidan o'chirish
      if (clientChatId) {
        recipientMap.delete(clientChatId)
      }
      if (authStore.profile?.telegram_id) {
        recipientMap.delete(String(authStore.profile.telegram_id).trim())
      }
      if (authStore.profile?.telegram) {
        recipientMap.delete(String(authStore.profile.telegram).trim())
      }

      // Faqat mutaxassisligi mos ustalarga xabar yuborish
      const sendPromises = []
      for (const [chatId, isMatched] of recipientMap.entries()) {
        if (chatId !== clientChatId) {
          const msg = formatJobAlert(savedJob, clientName, isMatched)
          sendPromises.push(sendTelegramNotification(chatId, msg))
        }
      }

      if (sendPromises.length > 0) {
        await Promise.allSettled(sendPromises)
      }
    } catch (tgErr) {
      console.warn('Telegram broadcast error:', tgErr)
    }

    router.push(`/jobs/${savedJob.id}`)
  } catch (err) {
    error.value = err.message || 'Xatolik yuz berdi'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Craftsman Restriction Card */
.craftsman-warning-card {

  padding: 36px 32px;
  border-radius: 24px;
  background: var(--color-card);
  border: 1px solid rgba(245, 158, 11, 0.3);
  display: flex;
  align-items: flex-start;
  gap: 20px;
  box-shadow: var(--shadow-md);
  margin-top: 20px;
}

.warning-icon-box {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.35);
}

.warning-info h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}

.warning-info p {
  font-size: 0.92rem;
  color: var(--color-text-2);
  line-height: 1.55;
  margin: 8px 0 18px;
}

.warning-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Project Type Grid */
.project-type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.type-card {
  position: relative;
  background: var(--color-card);
  border: 2px solid var(--color-border);
  border-radius: 20px;
  padding: 20px 22px;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.2s ease;
}

.type-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.type-card.active {
  border-color: var(--color-primary);
  background: linear-gradient(135deg, rgba(108, 99, 255, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%);
  box-shadow: 0 8px 24px rgba(108, 99, 255, 0.12);
}

.type-icon-box {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.type-icon-box.regular {
  background: rgba(59, 130, 246, 0.15);
  color: #3B82F6;
}

.type-icon-box.building {
  background: rgba(245, 158, 11, 0.15);
  color: #D97706;
}

.type-content h4 {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}

.type-content p {
  font-size: 0.8rem;
  color: var(--color-muted);
  margin: 4px 0 0;
  line-height: 1.4;
}

.type-check-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 640px) {
  .project-type-grid {
    grid-template-columns: 1fr;
  }
}

.modern-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236C63FF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 16px;
  padding-right: 38px !important;
  cursor: pointer;
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.modern-select:hover {
  border-color: var(--color-primary-light);
}

.modern-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.15);
}

.modern-select option {
  background: var(--color-card);
  color: var(--color-text);
  padding: 10px;
}

.building-project-box {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(108, 99, 255, 0.05) 100%);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 18px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.box-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.box-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #F59E0B;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.box-header h4 {
  font-size: 1.02rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}

.box-header p {
  font-size: 0.8rem;
  color: var(--color-muted);
  margin: 2px 0 0;
}

.milestones-info-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 0.82rem;
  color: var(--color-text-2);
}

.new-job-page-container {
  min-height: calc(100vh - 68px);
  background: var(--color-bg);
  width: 100%;
}

.content {
  padding: 32px 24px 60px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 860px;
  margin: 0 auto;
}

.page-header h1 { font-size: 1.75rem; font-weight: 800; color: var(--color-text); }
.page-header p { color: var(--color-text-2); font-size: 0.95rem; margin-top: 4px; }

.form-wrapper {
  width: 100%;
}

.form {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  padding: 36px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: var(--shadow-sm);
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.input-icon-wrapper { position: relative; }
.input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--color-muted); }
.input { padding-left: 44px; }

.error-box {
  padding: 12px 16px;
  background: rgba(255,71,87,0.1);
  border: 1px solid rgba(255,71,87,0.25);
  border-radius: 10px;
  color: var(--color-error);
  font-size: 0.85rem;
}

.loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  display: inline-block;
}

@media (max-width: 640px) {
  .row { grid-template-columns: 1fr; }
  .form { padding: 24px 16px; }
  .content { padding: 20px 16px 40px; }
}

/* ─── AI Assistant Card ───────────────────────────────────────────────────────── */
.ai-assistant-card {
  background: linear-gradient(135deg, rgba(108, 99, 255, 0.08) 0%, rgba(247, 183, 49, 0.08) 100%);
  border: 1px solid rgba(108, 99, 255, 0.25);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.ai-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-primary-light);
}

.btn-ask-ai {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--gradient-primary);
  color: #fff;
  border: none;
  padding: 7px 14px;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3);
}

.btn-ask-ai:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-ask-ai:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ai-result-content {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.ai-prices-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.ai-price-box {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-price-label {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.ai-price-val {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-success);
}

.btn-apply-ai {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(67, 233, 123, 0.15);
  border: 1px solid rgba(67, 233, 123, 0.35);
  color: var(--color-success);
  font-size: 0.82rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-apply-ai:hover {
  background: rgba(67, 233, 123, 0.25);
  transform: scale(1.03);
}

.ai-tip-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--color-text-2);
  line-height: 1.5;
  background: var(--color-surface-2);
  padding: 10px 12px;
  border-radius: 8px;
}

.tip-icon {
  color: #F7B731;
  flex-shrink: 0;
  margin-top: 2px;
}

.budget-section-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.budget-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sub-label {
  font-size: 0.78rem;
  color: var(--color-muted);
}

.btn-ai-budget-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, rgba(108, 99, 255, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%);
  border: 1px solid rgba(108, 99, 255, 0.35);
  color: var(--color-primary-light);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-ai-budget-trigger:hover {
  background: linear-gradient(135deg, rgba(108, 99, 255, 0.25) 0%, rgba(236, 72, 153, 0.25) 100%);
  transform: translateY(-1px);
}
</style>

