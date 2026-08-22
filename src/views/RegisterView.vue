<template>
  <div class="auth-container">
    <div class="auth-card">
      <router-link to="/" class="logo notranslate" translate="no">
        <Wrench :size="22" />
        <span>Nex<span class="logo-accent">sora</span></span>
      </router-link>

      <h1 class="title">Ro'yxatdan o'tish</h1>
      <p class="subtitle">Platformaga qo'shiling va ishni boshlang</p>

      <!-- Role Selector -->
      <div class="role-tabs">
        <button
          type="button"
          class="role-tab"
          :class="{ 'role-tab-active': role === 'client' }"
          @click="role = 'client'"
        >
          <User :size="18" /> Mijoz
        </button>
        <button
          type="button"
          class="role-tab"
          :class="{ 'role-tab-active': role === 'craftsman' }"
          @click="role = 'craftsman'"
        >
          <Wrench :size="18" /> Usta
        </button>
      </div>

      <!-- Auth Method Switcher Tabs -->
      <div class="auth-tabs">
        <button
          type="button"
          class="auth-tab-btn"
          :class="{ active: authMethod === 'telegram' }"
          @click="switchAuthMethod('telegram')"
        >
          <Send :size="15" />
          <span>Telegram / Telefon</span>
        </button>
        <button
          type="button"
          class="auth-tab-btn"
          :class="{ active: authMethod === 'email' }"
          @click="switchAuthMethod('email')"
        >
          <Mail :size="15" />
          <span>Email & Parol</span>
        </button>
      </div>

      <!-- METHOD 1: TELEGRAM & PHONE OTP REGISTRATION -->
      <form v-if="authMethod === 'telegram'" @submit.prevent="handleTelegramRegisterSubmit" class="form">
        
        <!-- Case A: Step 1 Basic Info & Phone -->
        <template v-if="phoneStep === 'enter_info' && step === 1">
          <div class="input-group">
            <label class="input-label">To'liq ismingiz</label>
            <div class="input-icon-wrapper">
              <User :size="18" class="input-icon" />
              <input v-model="form.fullName" placeholder="Ism Familiya" class="input" required />
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">Telefon raqamingiz</label>
            <div class="input-icon-wrapper">
              <Phone :size="18" class="input-icon" />
              <input 
                v-model="form.phone" 
                type="tel"
                placeholder="+998 90 123 45 67" 
                class="input" 
                required 
                @input="formatPhoneInput"
              />
            </div>
            <p class="input-hint">Tasdiqlash kodi Telegram botimiz orqali yuboriladi.</p>
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

          <div class="input-group">
            <label class="input-label">Referral kod (ixtiyoriy)</label>
            <div class="input-icon-wrapper">
              <Gift :size="18" class="input-icon" />
              <input v-model="form.referralCode" placeholder="Masalan: NEX-A1B2C3D4" class="input" />
            </div>
            <p class="input-hint" v-if="form.referralCode">🎁 Do'stingiz sizni taklif qilgani uchun 50,000 UZS bonus taqdim etiladi!</p>
          </div>
        </template>

        <!-- Case B: Step 2 Craftsman Info (if role is craftsman) -->
        <template v-if="phoneStep === 'enter_info' && role === 'craftsman' && step === 2">
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

          <div class="input-group">
            <label class="input-label">Tajriba (yillarda)</label>
            <input v-model="form.experienceYrs" type="number" min="0" placeholder="Masalan: 5" class="input" />
          </div>

          <div class="price-range">
            <div class="input-group">
              <label class="input-label">Min narx (so'm)</label>
              <input v-model="form.priceMin" type="number" placeholder="50,000" class="input" />
            </div>
            <div class="input-group">
              <label class="input-label">Max narx (so'm)</label>
              <input v-model="form.priceMax" type="number" placeholder="500,000" class="input" />
            </div>
          </div>
        </template>

        <!-- Case C: Step 3 OTP Verification via Telegram Bot -->
        <template v-if="phoneStep === 'verify_otp'">
          <div class="telegram-otp-banner">
            <div class="tg-banner-icon">
              <Send :size="20" />
            </div>
            <div class="tg-banner-text">
              <p>Tasdiqlash kodini <strong>@NexsoraOPT_bot</strong> orqali oling:</p>
              <a href="https://t.me/NexsoraOPT_bot?start=reg" target="_blank" rel="noopener" class="tg-bot-link">
                <span>📲 Telegram Botni Ochish</span>
              </a>
            </div>
          </div>

          <div class="otp-header-info">
            <span class="otp-sent-to">{{ form.phone }} raqami uchun</span>
            <button type="button" class="change-phone-btn" @click="phoneStep = 'enter_info'">
              O'zgartirish
            </button>
          </div>

          <div class="input-group">
            <label class="input-label">Bot yuborgan 4 xonali kod</label>
            <div class="input-icon-wrapper">
              <KeyRound :size="18" class="input-icon" />
              <input
                v-model="otpCode"
                type="text"
                maxlength="6"
                placeholder="Masalan: 7777"
                class="input otp-input"
                required
                autofocus
              />
            </div>
            <p class="input-hint">Botga kiring va «📱 Telefon raqamni yuborish» tugmasini bosing.</p>
          </div>
        </template>

        <div v-if="error" class="error-box">{{ error }}</div>

        <!-- Form Action Buttons -->
        <div class="form-actions">
          <button 
            v-if="phoneStep === 'enter_info' && role === 'craftsman' && step === 2" 
            type="button" 
            class="btn btn-secondary" 
            @click="step = 1"
          >
            <ArrowLeft :size="16" /> Orqaga
          </button>

          <button type="submit" class="btn btn-primary" :disabled="loading" style="flex: 1">
            <span v-if="loading" class="animate-spin loader"></span>
            <span v-else-if="phoneStep === 'enter_info' && role === 'craftsman' && step === 1">Keyingi qadam</span>
            <span v-else-if="phoneStep === 'enter_info'">Telegram orqali Kod Olish</span>
            <span v-else>Tasdiqlash & Akkaunt Yaratish</span>
          </button>
        </div>

        <p class="auth-switch">
          Hisobingiz bormi?
          <router-link to="/login" class="auth-link">Kirish</router-link>
        </p>
      </form>

      <!-- METHOD 2: EMAIL & PASSWORD REGISTRATION -->
      <form v-else @submit.prevent="handleEmailSubmit" class="form">
        <!-- Step 1: Basic Info -->
        <template v-if="step === 1">
          <div class="input-group">
            <label class="input-label">To'liq ism</label>
            <div class="input-icon-wrapper">
              <User :size="18" class="input-icon" />
              <input v-model="form.fullName" placeholder="Ism Familiya" class="input" required />
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">Email</label>
            <div class="input-icon-wrapper">
              <Mail :size="18" class="input-icon" />
              <input v-model="form.email" type="email" placeholder="email@example.com" class="input" required />
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">Telefon</label>
            <div class="input-icon-wrapper">
              <Phone :size="18" class="input-icon" />
              <input 
                v-model="form.phone" 
                placeholder="+998 90 123 45 67" 
                class="input"
                @input="formatPhoneInput"
              />
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">Shahar</label>
            <CustomSelect
              v-model="form.city"
              :options="CITY_OPTIONS"
              placeholder="Shahar tanlang"
              search-placeholder="Shaharni qidirish..."
            />
          </div>

          <div class="input-group">
            <label class="input-label">Parol</label>
            <div class="input-icon-wrapper pass-wrapper">
              <Lock :size="18" class="input-icon" />
              <input v-model="form.password" :type="showPass ? 'text' : 'password'" placeholder="Kamida 6 ta belgi" class="input" required />
              <button type="button" class="eye-btn" @click="showPass = !showPass">
                <EyeOff v-if="showPass" :size="18" />
                <Eye v-else :size="18" />
              </button>
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">Parolni tasdiqlang</label>
            <div class="input-icon-wrapper">
              <Lock :size="18" class="input-icon" />
              <input v-model="form.confirmPassword" type="password" placeholder="Parolni qaytaring" class="input" required />
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">Referral kod (ixtiyoriy)</label>
            <div class="input-icon-wrapper">
              <Gift :size="18" class="input-icon" />
              <input v-model="form.referralCode" placeholder="Masalan: NEX-A1B2C3D4" class="input" />
            </div>
            <p class="input-hint" v-if="form.referralCode">🎁 Do'stingiz sizni taklif qilgani uchun 50,000 UZS bonus taqdim etiladi!</p>
          </div>
        </template>

        <!-- Step 2: Craftsman Info -->
        <template v-if="role === 'craftsman' && step === 2">
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

          <div class="input-group">
            <label class="input-label">Tajriba (yillarda)</label>
            <input v-model="form.experienceYrs" type="number" min="0" placeholder="Masalan: 5" class="input" />
          </div>

          <div class="price-range">
            <div class="input-group">
              <label class="input-label">Min narx (so'm)</label>
              <input v-model="form.priceMin" type="number" placeholder="50,000" class="input" />
            </div>
            <div class="input-group">
              <label class="input-label">Max narx (so'm)</label>
              <input v-model="form.priceMax" type="number" placeholder="500,000" class="input" />
            </div>
          </div>
        </template>

        <div v-if="error" class="error-box">{{ error }}</div>

        <div class="form-actions">
          <button v-if="role === 'craftsman' && step === 2" type="button" class="btn btn-secondary" @click="step = 1">
            <ArrowLeft :size="16" /> Orqaga
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading" style="flex: 1">
            <span v-if="loading" class="animate-spin loader"></span>
            <span v-else>{{ role === 'craftsman' && step === 1 ? 'Keyingi qadam' : 'Ro\'yxatdan o\'tish' }}</span>
          </button>
        </div>

        <p class="auth-switch">
          Hisobingiz bormi?
          <router-link to="/login" class="auth-link">Kirish</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import CustomSelect from '../components/CustomSelect.vue'
import {
  Wrench, User, Mail, Phone, Lock, Eye, EyeOff,
  CheckCircle, ArrowLeft, Send, KeyRound, Gift
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import { supabase } from '../services/supabase'
import { CATEGORY_OPTIONS, CITY_OPTIONS } from '../utils'
import { formatUzbekPhone } from '../utils/phoneMask'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const authMethod = ref('telegram') // 'telegram' | 'email'
const phoneStep = ref('enter_info') // 'enter_info' | 'verify_otp'
const role = ref(route.query.role || 'client')
const step = ref(1)
const loading = ref(false)
const error = ref('')
const showPass = ref(false)
const otpCode = ref('')

const form = ref({
  fullName: '', 
  email: '', 
  phone: '+998 ', 
  city: 'Toshkent', 
  password: '', 
  confirmPassword: '',
  referralCode: route.query.ref || '',
  specialty: [], 
  experienceYrs: '', 
  priceMin: '', 
  priceMax: '', 
  bio: '',
})

function formatPhoneInput(e) {
  form.value.phone = formatUzbekPhone(e.target.value)
}

function switchAuthMethod(method) {
  authMethod.value = method
  error.value = ''
}

function toggleSpecialty(cat) {
  if (form.value.specialty.includes(cat)) {
    form.value.specialty = form.value.specialty.filter(s => s !== cat)
  } else {
    form.value.specialty.push(cat)
  }
}

// Telegram / Phone Flow
async function handleTelegramRegisterSubmit() {
  error.value = ''
  
  if (phoneStep.value === 'enter_info') {
    if (role.value === 'craftsman' && step.value === 1) {
      step.value = 2
      return
    }

    if (!form.value.fullName.trim()) {
      error.value = "Iltimos, ismingizni kiriting"
      return
    }

    if (form.value.phone.replace(/\D/g, '').length < 12) {
      error.value = "Iltimos, to'liq telefon raqamingizni kiriting (+998 ...)"
      return
    }

    loading.value = true
    try {
      await authStore.sendPhoneOtp(form.value.phone)
      phoneStep.value = 'verify_otp'
      toast.info('Telegram Bot', 'Tasdiqlash kodini @NexsoraOPT_bot orqali oling')
    } catch (e) {
      error.value = e.message || "Kod yuborishda xatolik"
    } finally {
      loading.value = false
    }
  } else {
    // Verify OTP and complete registration
    if (!otpCode.value.trim()) {
      error.value = "Iltimos, tasdiqlash kodini kiriting"
      return
    }

    loading.value = true
    try {
      const metadata = {
        full_name: form.value.fullName,
        role: role.value,
        city: form.value.city,
        specialty: form.value.specialty,
        experience_yrs: form.value.experienceYrs,
        price_min: form.value.priceMin,
        price_max: form.value.priceMax
      }

      await authStore.verifyPhoneOtp(form.value.phone, otpCode.value, metadata)
      toast.success('Muvaffaqiyatli!', 'Akkauntingiz yaratildi va tizimga kirdingiz!')
      router.push('/dashboard')
    } catch (e) {
      error.value = e.message || "Tasdiqlash kodi noto'g'ri yoki muddati tugagan"
    } finally {
      loading.value = false
    }
  }
}

// Email Flow
function handleEmailSubmit() {
  if (role.value === 'craftsman' && step.value === 1) {
    step.value = 2
  } else {
    handleEmailRegister()
  }
}

async function handleEmailRegister() {
  if (form.value.password !== form.value.confirmPassword) {
    error.value = "Kiritilgan parollar bir-biriga mos kelmadi"
    return
  }

  if (form.value.password.length < 6) {
    error.value = "Parol kamida 6 ta belgidan iborat bo'lishi kerak"
    return
  }

  loading.value = true
  error.value = ''

  try {
    const data = await authStore.register(form.value.email, form.value.password, {
      full_name: form.value.fullName,
      role: role.value,
    })

    if (data?.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error('User already registered')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: form.value.fullName,
        phone: form.value.phone,
        city: form.value.city,
        role: role.value,
      })

      if (role.value === 'craftsman') {
        await supabase.from('craftsman_profiles').upsert({
          id: user.id,
          specialty: form.value.specialty,
          experience_yrs: Number(form.value.experienceYrs) || 0,
          price_min: Number(form.value.priceMin) || 0,
          price_max: Number(form.value.priceMax) || 0,
          bio: form.value.bio,
        })
      } else {
        await supabase.from('client_profiles').upsert({
          id: user.id,
        })
      }
    }

    await authStore.fetchUser()
    toast.success('Muvaffaqiyatli!', 'Ro\'yxatdan o\'tish muvaffaqiyatli yakunlandi!')
    router.push('/dashboard')
  } catch (err) {
    const msg = err?.message || ''
    if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
      error.value = "Bu email manzili bilan allaqachon ro'yxatdan o'tilgan. Iltimos, Kirish sahifasidan kiring."
    } else {
      error.value = msg || "Ro'yxatdan o'tishda xatolik yuz berdi"
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: var(--color-bg);
}

.auth-card {
  width: 100%;
  max-width: 480px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 28px;
  padding: 36px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 8px;
}
.logo svg { color: var(--color-primary); }
.logo-accent { color: var(--color-primary-light); }

.title { font-size: 1.6rem; font-weight: 800; margin-bottom: 2px; }
.subtitle { font-size: 0.88rem; color: var(--color-text-2); margin-bottom: 12px; }

/* Role Tabs */
.role-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  background: var(--color-surface-2);
  padding: 4px;
  border-radius: 14px;
  margin-bottom: 8px;
}

.role-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  background: transparent;
  color: var(--color-text-2);
  font-weight: 700;
  font-size: 0.88rem;
  transition: all var(--transition-fast);
}

.role-tab-active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
}

/* Auth Tabs */
.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
}

.auth-tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-2);
  font-weight: 700;
  font-size: 0.85rem;
  transition: all var(--transition-fast);
}

.auth-tab-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: var(--color-muted);
  pointer-events: none;
}

.input-icon-wrapper .input {
  padding-left: 44px;
}

.input-hint {
  font-size: 0.76rem;
  color: var(--color-muted);
  margin-top: 4px;
}

/* Telegram OTP Banner */
.telegram-otp-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(108, 99, 255, 0.12);
  border: 1px solid rgba(108, 99, 255, 0.3);
  padding: 14px 16px;
  border-radius: 14px;
  margin-bottom: 12px;
}

.tg-banner-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tg-banner-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tg-banner-text p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text);
  line-height: 1.3;
}

.tg-bot-link {
  display: inline-flex;
  align-items: center;
  color: var(--color-primary-light);
  font-weight: 700;
  font-size: 0.88rem;
  text-decoration: underline;
}

.tg-bot-link:hover {
  color: white;
}

.otp-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  margin-bottom: 4px;
}

.otp-sent-to {
  color: var(--color-text-2);
}

.change-phone-btn {
  background: transparent;
  border: none;
  color: var(--color-primary-light);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.otp-input {
  letter-spacing: 4px;
  font-size: 1.15rem;
  font-weight: 700;
  text-align: center;
}

.specialty-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.specialty-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-2);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chip-active {
  border-color: var(--color-primary);
  background: rgba(108, 99, 255, 0.15);
  color: var(--color-primary-light);
}

.price-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.pass-wrapper { position: relative; }
.eye-btn {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
}

.error-box {
  padding: 10px 14px;
  background: rgba(255, 71, 87, 0.12);
  border: 1px solid rgba(255, 71, 87, 0.25);
  border-radius: 10px;
  color: var(--color-error);
  font-size: 0.82rem;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.auth-switch {
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-text-2);
  margin-top: 8px;
}

.auth-link {
  color: var(--color-primary-light);
  font-weight: 700;
  margin-left: 4px;
}
</style>
