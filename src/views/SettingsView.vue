<template>
  <div class="settings-page-container">
    <main class="content">
      <div class="page-header">
        <div>
          <h1>Sozlamalar</h1>
          <p>Profilingiz, xavfsizlik va tizim parametrlarini boshqaring</p>
        </div>
        <router-link to="/profile" class="btn btn-secondary">
          <User :size="16" /> Profilni ko'rish
        </router-link>
      </div>

      <!-- Navigation Tabs -->
      <div class="settings-tabs">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'profile' }"
          @click="activeTab = 'profile'"
        >
          <User :size="18" /> Profil ma'lumotlari
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'security' }"
          @click="activeTab = 'security'"
        >
          <Lock :size="18" /> Xavfsizlik
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'appearance' }"
          @click="activeTab = 'appearance'"
        >
          <Sun :size="18" /> Interfeys
        </button>
      </div>

      <div class="settings-card">
        <!-- TAB 1: Profile Settings -->
        <div v-if="activeTab === 'profile'">
          <form @submit.prevent="handleSaveProfile" class="settings-form">
            <!-- Avatar Row -->
            <div class="settings-avatar-row">
              <div class="avatar-placeholder avatar-xl settings-avatar-box">
                <img
                  v-if="authStore.profile?.avatar_url"
                  :src="authStore.profile.avatar_url"
                  :alt="form.full_name"
                  class="avatar-img"
                />
                <span v-else>{{ getInitials(form.full_name || authStore.user?.email) }}</span>
              </div>
              <div class="avatar-change-controls">
                <h4 style="margin: 0; font-size: 0.98rem; font-weight: 700;">Profil rasmi</h4>
                <p style="margin: 0; font-size: 0.82rem; color: var(--color-text-2)">PNG, JPG yoki WebP formatida (max 5MB)</p>
                <div class="avatar-btns-group">
                  <input
                    ref="settingsFileInputRef"
                    type="file"
                    accept="image/*"
                    style="display: none"
                    @change="handleSettingsFileUpload"
                  />
                  <button
                    type="button"
                    class="btn btn-secondary btn-sm"
                    :disabled="avatarUploading"
                    @click="triggerSettingsFile"
                  >
                    <Upload :size="14" />
                    <span>{{ avatarUploading ? 'Yuklanmoqda...' : 'Rasm yuklash' }}</span>
                  </button>
                  <button
                    v-if="authStore.profile?.avatar_url"
                    type="button"
                    class="btn btn-secondary btn-sm remove-avatar-btn"
                    :disabled="avatarUploading"
                    @click="removeSettingsAvatar"
                  >
                    <Trash2 :size="14" />
                    <span>O'chirish</span>
                  </button>
                </div>
              </div>
            </div>

            <hr class="divider" style="margin: 12px 0 20px;" />

            <h3 class="section-title">Asosiy ma'lumotlar</h3>

            <!-- Role Selector -->
            <div class="input-group" style="margin-bottom: 18px;">
              <label class="input-label">Profil Turi (Rolingiz)</label>
              <div class="role-selector-row">
                <button
                  type="button"
                  class="role-pill-btn"
                  :class="{ active: form.role === 'craftsman' }"
                  @click="form.role = 'craftsman'"
                >
                  <Wrench :size="16" />
                  <div class="role-pill-text">
                    <strong>Usta (Xizmat ko'rsatuvchi)</strong>
                    <span>Xizmatlar qo'shish va Birjada buyurtmalar olish</span>
                  </div>
                </button>
                <button
                  type="button"
                  class="role-pill-btn"
                  :class="{ active: form.role === 'client' }"
                  @click="form.role = 'client'"
                >
                  <User :size="16" />
                  <div class="role-pill-text">
                    <strong>Mijoz (Buyurtmachi)</strong>
                    <span>E'lon berish va ustalarga buyurtma berish</span>
                  </div>
                </button>
              </div>
            </div>

            <div class="row">
              <div class="input-group">
                <label class="input-label">To'liq ism *</label>
                <div class="input-icon-wrapper">
                  <User :size="16" class="input-icon" />
                  <input v-model="form.full_name" class="input" placeholder="Ism Familiya" required />
                </div>
              </div>

              <div class="input-group">
                <label class="input-label">Telefon raqam</label>
                <div class="input-icon-wrapper">
                  <Phone :size="16" class="input-icon" />
                  <input v-model="form.phone" class="input" placeholder="+998 90 000 00 00" />
                </div>
              </div>
            </div>

            <div class="row">
              <div class="input-group">
                <label class="input-label">Telegram username / ID raqami</label>
                <div class="input-icon-wrapper">
                  <Send :size="16" class="input-icon" />
                  <input v-model="form.telegram" class="input" placeholder="ID (masalan: 7952376402) yoki @username" />
                  <button
                    v-if="form.telegram"
                    type="button"
                    class="btn-test-tg"
                    :disabled="testingTelegram"
                    @click="handleTestTelegram"
                  >
                    <Smartphone :size="14" />
                    <span>{{ testingTelegram ? 'Yuborilmoqda...' : 'Test xabar' }}</span>
                  </button>
                </div>
                
                <!-- 1-Click ID Helper Links -->
                <div class="tg-helper-hint">
                  <span class="hint-title"><Lightbulb :size="14" /> ID raqamingizni bilmaysizmi?</span>
                  <div class="tg-helper-links">
                    <a
                      href="https://t.me/userinfobot"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="tg-helper-btn"
                    >
                      <ExternalLink :size="12" />
                      <span>1. ID ni olish (@userinfobot)</span>
                    </a>
                    <a
                      href="https://t.me/NexsoraOPT_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="tg-helper-btn tg-bot-link"
                    >
                      <Bot :size="12" />
                      <span>2. Botni faollashtirish (/start)</span>
                    </a>
                  </div>
                </div>

                <span v-if="tgTestStatus" class="tg-test-feedback" :class="tgTestSuccess ? 'success' : 'error'">
                  {{ tgTestStatus }}
                </span>
              </div>
              <div class="input-group">
                <label class="input-label">Shahar / Viloyat</label>
                <CustomSelect
                  v-model="form.city"
                  :options="CITY_OPTIONS"
                  placeholder="Shahar tanlang"
                  search-placeholder="Shaharni qidirish..."
                />
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">O'zingiz haqingizda (Bio)</label>
              <textarea
                v-model="form.bio"
                class="textarea"
                rows="4"
                placeholder="Qanday ishlar bilan shug'ullanasiz, tajribangiz yoki o'zingiz haqingizda yozing..."
              />
            </div>

            <!-- Craftsman specific settings -->
            <template v-if="authStore.isCraftsman">
              <hr class="divider" />
              <h3 class="section-title">Usta kasbiy ma'lumotlari</h3>

              <div class="input-group">
                <label class="input-label">Mutaxassislik yo'nalishlari</label>
                <div class="specialty-grid">
                  <button
                    v-for="cat in CATEGORY_OPTIONS"
                    :key="cat.value"
                    type="button"
                    class="specialty-chip"
                    :class="{ 'chip-active': form.specialty.includes(cat.value) }"
                    @click="toggleSpecialty(cat.value)"
                  >
                    <span class="chip-emoji">{{ cat.icon }}</span>
                    <span>{{ cat.label }}</span>
                    <CheckCircle v-if="form.specialty.includes(cat.value)" :size="13" class="chip-check" />
                  </button>
                </div>
              </div>

              <div class="row">
                <div class="input-group">
                  <label class="input-label">Tajriba (yil)</label>
                  <input v-model="form.experience_yrs" type="number" min="0" class="input" placeholder="Masalan: 5" />
                </div>
                <div class="input-group">
                  <label class="input-label">Min xizmat narxi (so'm)</label>
                  <input v-model="form.price_min" type="number" class="input" placeholder="50,000" />
                </div>
                <div class="input-group">
                  <label class="input-label">Max xizmat narxi (so'm)</label>
                  <input v-model="form.price_max" type="number" class="input" placeholder="500,000" />
                </div>
              </div>
            </template>

            <div v-if="error" class="error-box">{{ error }}</div>
            <div v-if="success" class="success-box">
              <CheckCircle2 :size="16" class="inline-icon" />
              <span>Profil sozlamalari muvaffaqiyatli saqlandi!</span>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="saving" style="align-self: flex-start; min-width: 160px">
              <span v-if="saving" class="animate-spin loader"></span>
              <template v-else>
                <Save :size="16" /> Saqlash
              </template>
            </button>
          </form>
        </div>

        <!-- TAB 2: Security Settings -->
        <div v-else-if="activeTab === 'security'">
          <form @submit.prevent="handleUpdatePassword" class="settings-form">
            <h3 class="section-title">Parolni o'zgartirish</h3>
            <p style="color: var(--color-text-2); font-size: 0.88rem; margin-top: -10px">
              Hisobingiz xavfsizligini ta'minlash uchun yangi parol o'rnating
            </p>

            <div class="input-group" style="max-width: 480px">
              <label class="input-label">Yangi parol</label>
              <div class="input-icon-wrapper">
                <Lock :size="16" class="input-icon" />
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="input"
                  placeholder="Kamida 6 ta belgi"
                  required
                />
              </div>
            </div>

            <div class="input-group" style="max-width: 480px">
              <label class="input-label">Yangi parolni tasdiqlang</label>
              <div class="input-icon-wrapper">
                <Lock :size="16" class="input-icon" />
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="input"
                  placeholder="Parolni qayta kiriting"
                  required
                />
              </div>
            </div>

            <div v-if="passwordError" class="error-box">{{ passwordError }}</div>
            <div v-if="passwordSuccess" class="success-box">
              <CheckCircle2 :size="16" class="inline-icon" />
              <span>Parolingiz muvaffaqiyatli yangilandi!</span>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="passwordSaving" style="align-self: flex-start; min-width: 180px">
              <span v-if="passwordSaving" class="animate-spin loader"></span>
              <template v-else>
                <ShieldCheck :size="16" /> Parolni yangilash
              </template>
            </button>
          </form>
        </div>

        <!-- TAB 3: Appearance / Interface -->
        <div v-else-if="activeTab === 'appearance'">
          <div class="settings-form">
            <h3 class="section-title">Interfeys va Mavzu</h3>
            <p style="color: var(--color-text-2); font-size: 0.88rem; margin-top: -10px">
              O'zingizga qulay rejimni tanlang
            </p>

            <div class="theme-choice-grid">
              <div
                class="theme-card"
                :class="{ active: currentTheme === 'dark' }"
                @click="setTheme('dark')"
              >
                <div class="theme-preview dark-preview">
                  <div class="preview-bar"></div>
                  <div class="preview-box"></div>
                </div>
                <div class="theme-label">
                  <Moon :size="16" /> Qora rejim (Dark)
                </div>
              </div>

              <div
                class="theme-card"
                :class="{ active: currentTheme === 'light' }"
                @click="setTheme('light')"
              >
                <div class="theme-preview light-preview">
                  <div class="preview-bar"></div>
                  <div class="preview-box"></div>
                </div>
                <div class="theme-label">
                  <Sun :size="16" /> Oq rejim (Light)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import CustomSelect from '../components/CustomSelect.vue'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../services/supabase'
import { useTheme } from '../composables/useTheme'
import { CATEGORY_OPTIONS, CITY_OPTIONS, JOB_CATEGORIES, UZ_CITIES, getInitials } from '../utils'
import {
  User, Phone, MapPin, Save, Lock,
  Sun, Moon, ShieldCheck, CheckCircle, CheckCircle2,
  Upload, Trash2, Camera, Send, ExternalLink, Bot,
  Lightbulb, Smartphone, AlertTriangle, XCircle
} from 'lucide-vue-next'
import { sendTelegramNotification } from '../services/telegramNotifier'

const authStore = useAuthStore()
const { currentTheme, toggleTheme } = useTheme()

const activeTab = ref('profile')

const saving = ref(false)
const success = ref(false)
const error = ref('')

const settingsFileInputRef = ref(null)
const avatarUploading = ref(false)

function triggerSettingsFile() {
  settingsFileInputRef.value?.click()
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

async function handleSettingsFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  avatarUploading.value = true
  error.value = ''

  try {
    const compressedDataUrl = await compressAndResizeImage(file, 400, 400, 0.85)
    await supabase
      .from('profiles')
      .update({ avatar_url: compressedDataUrl })
      .eq('id', authStore.user.id)

    if (authStore.profile) {
      authStore.profile.avatar_url = compressedDataUrl
    }
    success.value = true
    setTimeout(() => { success.value = false }, 3000)
  } catch (err) {
    console.error('Update avatar error:', err)
    error.value = "Rasmni yuklashda xatolik yuz berdi"
  } finally {
    avatarUploading.value = false
    if (event.target) event.target.value = ''
  }
}

async function removeSettingsAvatar() {
  avatarUploading.value = true
  try {
    await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', authStore.user.id)

    if (authStore.profile) {
      authStore.profile.avatar_url = null
    }
    success.value = true
    setTimeout(() => { success.value = false }, 3000)
  } catch (err) {
    console.error('Remove avatar error:', err)
  } finally {
    avatarUploading.value = false
  }
}

const form = ref({
  role: 'craftsman',
  full_name: '',
  phone: '',
  telegram: '',
  city: '',
  specialty: [],
  experience_yrs: '',
  price_min: '',
  price_max: '',
  bio: '',
})

const testingTelegram = ref(false)
const tgTestStatus = ref('')
const tgTestSuccess = ref(false)

async function handleTestTelegram() {
  if (!form.value.telegram) return
  testingTelegram.value = true
  tgTestStatus.value = ''
  try {
    const isId = /^\d+$/.test(form.value.telegram.trim())
    if (!isId) {
      tgTestStatus.value = "⚠️ Raqamli Telegram ID kiriting (masalan: 7952376402). @userinfobot dan olishingiz mumkin."
      tgTestSuccess.value = false
      return
    }
    
    // Save to localStorage immediately
    localStorage.setItem('nexsora_telegram_id', form.value.telegram.trim())

    const ok = await sendTelegramNotification(
      form.value.telegram.trim(),
      `🎉 <b>Nexsora boti muvaffaqiyatli ulandi!</b>\n\nIsm: <b>${form.value.full_name || 'Foydalanuvchi'}</b>\nHolat: ✅ Xabarnomalar faol\n\nEndi yangi e'lonlar va takliflar shu yerga keladi!`
    )
    if (ok) {
      tgTestStatus.value = "✅ Telegramga test xabar yuborildi! Telegramingizni tekshiring."
      tgTestSuccess.value = true
    } else {
      tgTestStatus.value = "❌ Xabar yuborilmadi. Avval @NexsoraOPT_bot ga kirib /start bosing!"
      tgTestSuccess.value = false
    }
  } catch (err) {
    tgTestStatus.value = "❌ Xatolik yuz berdi. @NexsoraOPT_bot ga /start bosing."
    tgTestSuccess.value = false
  } finally {
    testingTelegram.value = false
  }
}

const passwordSaving = ref(false)
const passwordSuccess = ref(false)
const passwordError = ref('')
const passwordForm = ref({
  newPassword: '',
  confirmPassword: '',
})

function setTheme(theme) {
  if (currentTheme.value !== theme) {
    toggleTheme()
  }
}

function toggleSpecialty(cat) {
  if (form.value.specialty.includes(cat)) {
    form.value.specialty = form.value.specialty.filter(s => s !== cat)
  } else {
    form.value.specialty.push(cat)
  }
  localStorage.setItem('nexsora_craftsman_specialties', JSON.stringify(form.value.specialty))
  if (authStore.user?.id) {
    const meta = localStorage.getItem(`nexsora_user_meta_${authStore.user.id}`)
    let metaObj = {}
    try { if (meta) metaObj = JSON.parse(meta) } catch (e) {}
    metaObj.specialties = form.value.specialty
    localStorage.setItem(`nexsora_user_meta_${authStore.user.id}`, JSON.stringify(metaObj))
  }
}

function populateForm(p) {
  if (p) {
    form.value.role = p.role || 'craftsman'
    form.value.full_name = p.full_name || ''
    form.value.phone = p.phone || ''
    form.value.city = p.city || ''
    
    // Load telegram from profile or localStorage
    const savedMeta = localStorage.getItem(`nexsora_user_meta_${p.id}`)
    const globalTg = localStorage.getItem('nexsora_telegram_id')
    let metaObj = {}
    try { if (savedMeta) metaObj = JSON.parse(savedMeta) } catch (e) {}
    form.value.telegram = p.telegram || metaObj.telegram || globalTg || ''

    const cp = Array.isArray(p.craftsman_profiles) ? p.craftsman_profiles[0] : p.craftsman_profiles
    const savedSpecialties = localStorage.getItem('nexsora_craftsman_specialties')
    let localSpecs = []
    try { if (savedSpecialties) localSpecs = JSON.parse(savedSpecialties) } catch (e) {}

    const dbSpecs = cp ? (Array.isArray(cp.specialty) ? cp.specialty : []) : []
    form.value.specialty = dbSpecs.length > 0 ? dbSpecs : (metaObj.specialties || localSpecs || [])

    if (cp) {
      form.value.experience_yrs = cp.experience_yrs || ''
      form.value.price_min = cp.price_min || ''
      form.value.price_max = cp.price_max || ''
      form.value.bio = cp.bio || ''
    }
  }
}

async function handleSaveProfile() {
  saving.value = true
  error.value = ''
  success.value = false

  try {
    // 1. Switch role if modified
    if (form.value.role && form.value.role !== authStore.profile?.role) {
      await authStore.switchRole(form.value.role)
    }

    // Save metadata locally
    if (form.value.telegram) {
      localStorage.setItem('nexsora_telegram_id', form.value.telegram.trim())
    }
    if (form.value.role === 'craftsman') {
      localStorage.setItem('nexsora_craftsman_specialties', JSON.stringify(form.value.specialty))
    }
    if (authStore.user?.id) {
      localStorage.setItem(`nexsora_user_meta_${authStore.user.id}`, JSON.stringify({
        telegram: form.value.telegram,
        phone: form.value.phone,
        specialties: form.value.specialty,
        role: form.value.role
      }))
    }

    const updatePayload = {
      role: form.value.role,
      full_name: form.value.full_name,
      phone: form.value.phone,
      city: form.value.city,
    }
    
    // Try updating profile with telegram & telegram_id
    try {
      await supabase.from('profiles').update({
        ...updatePayload,
        telegram: form.value.telegram,
        telegram_id: form.value.telegram
      }).eq('id', authStore.user.id)
    } catch (e) {
      try {
        await supabase.from('profiles').update({
          ...updatePayload,
          telegram: form.value.telegram
        }).eq('id', authStore.user.id)
      } catch (err2) {
        await supabase.from('profiles').update(updatePayload).eq('id', authStore.user.id)
      }
    }

    if (form.value.role === 'craftsman') {
      const { error: craftsmanErr } = await supabase.from('craftsman_profiles').upsert({
        id: authStore.user.id,
        specialty: form.value.specialty,
        experience_yrs: Number(form.value.experience_yrs) || 0,
        price_min: Number(form.value.price_min) || 0,
        price_max: Number(form.value.price_max) || 0,
        bio: form.value.bio,
      })

      if (craftsmanErr) throw craftsmanErr
    }


    await authStore.fetchUser()
    success.value = true
    setTimeout(() => { success.value = false }, 4000)
  } catch (err) {
    error.value = err.message || 'Xatolik yuz berdi'
  } finally {
    saving.value = false
  }
}

async function handleUpdatePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = "Kiritilgan parollar bir-biriga mos kelmadi"
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = "Parol kamida 6 ta belgidan iborat bo'lishi kerak"
    return
  }

  passwordSaving.value = true
  passwordError.value = ''
  passwordSuccess.value = false

  try {
    const { error: passErr } = await supabase.auth.updateUser({
      password: passwordForm.value.newPassword
    })

    if (passErr) throw passErr

    passwordSuccess.value = true
    passwordForm.value.newPassword = ''
    passwordForm.value.confirmPassword = ''
    setTimeout(() => { passwordSuccess.value = false }, 4000)
  } catch (err) {
    passwordError.value = err.message || "Parolni yangilashda xatolik yuz berdi"
  } finally {
    passwordSaving.value = false
  }
}

watch(() => authStore.profile, (newProfile) => {
  if (newProfile) populateForm(newProfile)
}, { immediate: true })

onMounted(() => {
  if (authStore.profile) populateForm(authStore.profile)
})
</script>

<style scoped>
.settings-page-container {
  min-height: calc(100vh - 68px);
  background: var(--color-bg);
  width: 100%;
}

.content {
  padding: 32px clamp(16px, 3.5vw, 32px) 60px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header h1 { font-size: 1.75rem; font-weight: 800; color: var(--color-text); }
.page-header p { color: var(--color-text-2); font-size: 0.95rem; margin-top: 4px; }

.settings-tabs {
  display: flex;
  gap: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 6px;
  border-radius: 14px;
  width: fit-content;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover { color: var(--color-text); }
.tab-btn.active {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3);
}

.settings-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  padding: 32px;
  box-shadow: var(--shadow-sm);
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-avatar-row {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
}

.settings-avatar-box {
  border: 3px solid var(--color-primary);
  box-shadow: 0 4px 12px rgba(108, 99, 255, 0.25);
}

.avatar-change-controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.avatar-btns-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.remove-avatar-btn {
  color: var(--color-error);
}

.section-title { font-size: 1.1rem; font-weight: 700; color: var(--color-text); }

/* Role Selector */
.role-selector-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 6px;
}

.role-pill-btn {
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  color: var(--color-text-2);
}

.role-pill-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-text);
}

.role-pill-btn.active {
  background: linear-gradient(135deg, rgba(108, 99, 255, 0.12) 0%, rgba(59, 130, 246, 0.06) 100%);
  border-color: var(--color-primary);
  color: var(--color-text);
  box-shadow: 0 4px 16px rgba(108, 99, 255, 0.15);
}

.role-pill-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.role-pill-text strong {
  font-size: 0.9rem;
  color: var(--color-text);
}

.role-pill-text span {
  font-size: 0.75rem;
  color: var(--color-muted);
}

@media (max-width: 640px) {
  .role-selector-row {
    grid-template-columns: 1fr;
  }
}

.row { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }

.input-icon-wrapper { position: relative; }
.input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--color-muted); }
.input { padding-left: 44px; }

.specialty-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.specialty-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 500;
  background: var(--color-surface-2);
  color: var(--color-text-2);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip-active {
  background: rgba(108, 99, 255, 0.15);
  color: var(--color-primary-light);
  border-color: rgba(108, 99, 255, 0.4);
  font-weight: 600;
}

.chip-emoji {
  font-size: 0.95rem;
  line-height: 1;
}

.chip-check {
  color: var(--color-primary-light);
  margin-left: 2px;
}

.theme-choice-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 500px;
  margin-top: 10px;
}

.theme-card {
  padding: 16px;
  border-radius: 16px;
  border: 2px solid var(--color-border);
  background: var(--color-surface-2);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;
}

.theme-card:hover { border-color: var(--color-primary-light); }
.theme-card.active { border-color: var(--color-primary); box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.3); }

.theme-preview {
  height: 80px;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dark-preview { background: #0D0D18; border: 1px solid rgba(255,255,255,0.1); }
.dark-preview .preview-bar { height: 10px; width: 60%; background: #6C63FF; border-radius: 4px; }
.dark-preview .preview-box { flex: 1; background: #16162A; border-radius: 6px; }

.light-preview { background: #F8F9FD; border: 1px solid #E2E8F0; }
.light-preview .preview-bar { height: 10px; width: 60%; background: #4F46E5; border-radius: 4px; }
.light-preview .preview-box { flex: 1; background: #FFFFFF; border-radius: 6px; border: 1px solid #E2E8F0; }

.theme-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
}

.error-box { padding: 12px 16px; background: rgba(255,71,87,0.1); border: 1px solid rgba(255,71,87,0.25); border-radius: 10px; color: var(--color-error); font-size: 0.85rem; }
.success-box { padding: 12px 16px; background: rgba(67,233,123,0.1); border: 1px solid rgba(67,233,123,0.25); border-radius: 10px; color: var(--color-success); font-size: 0.85rem; }
.loader { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; display: inline-block; }

.btn-test-tg {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 700;
  padding: 6px 10px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.btn-test-tg:hover {
  opacity: 0.9;
  transform: translateY(-50%) scale(1.02);
}

.tg-test-feedback {
  font-size: 0.78rem;
  margin-top: 4px;
}

.tg-test-feedback.success {
  color: var(--color-success);
}

.tg-test-feedback.error {
  color: var(--color-error);
}

.tg-helper-hint {
  margin-top: 6px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hint-title {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--color-text-2);
}

.tg-helper-links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.tg-helper-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.73rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(108, 99, 255, 0.08);
  color: var(--color-primary-light);
  border: 1px solid rgba(108, 99, 255, 0.2);
  text-decoration: none;
  transition: all 0.15s ease;
}

.tg-helper-btn:hover {
  background: rgba(108, 99, 255, 0.18);
  transform: translateY(-1px);
}

.tg-bot-link {
  background: rgba(34, 197, 94, 0.08);
  color: #10B981;
  border-color: rgba(34, 197, 94, 0.25);
}

.tg-bot-link:hover {
  background: rgba(34, 197, 94, 0.18);
}

@media (max-width: 768px) {
  .content { padding: 20px 16px 40px; }
  .settings-tabs { width: 100%; overflow-x: auto; }
  .theme-choice-grid { grid-template-columns: 1fr; }
}
</style>
