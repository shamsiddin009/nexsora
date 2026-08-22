<template>
  <div class="auth-container">
    <div class="auth-card">
      <router-link to="/" class="logo notranslate" translate="no">
        <Wrench :size="22" />
        <span>Nex<span class="logo-accent">sora</span></span>
      </router-link>

      <h1 class="title">Xush kelibsiz</h1>
      <p class="subtitle">Hisobingizga kiring</p>

      <!-- Auth Method Switcher Tabs -->
      <div class="auth-tabs">
        <button
          type="button"
          class="auth-tab-btn"
          :class="{ active: authMethod === 'phone' }"
          @click="switchAuthMethod('phone')"
        >
          <Smartphone :size="16" />
          <span>Telefon (SMS)</span>
        </button>
        <button
          type="button"
          class="auth-tab-btn"
          :class="{ active: authMethod === 'email' }"
          @click="switchAuthMethod('email')"
        >
          <Mail :size="16" />
          <span>Email & Parol</span>
        </button>
      </div>

      <!-- METHOD 1: PHONE (SMS OTP) LOGIN -->
      <form v-if="authMethod === 'phone'" @submit.prevent="handlePhoneSubmit" class="form">
        <!-- Step 1: Enter Phone Number -->
        <div v-if="phoneStep === 'enter_phone'" class="input-group">
          <label class="input-label">Telefon raqamingiz</label>
          <div class="input-icon-wrapper">
            <Phone :size="18" class="input-icon" />
            <input
              v-model="phoneForm.phone"
              type="tel"
              placeholder="+998 90 123 45 67"
              class="input"
              required
              @input="formatPhoneInput"
            />
          </div>
          <p class="input-hint">Kodni SMS orqali qabul qilib, parolsiz tezkor kiring.</p>
        </div>

        <!-- Step 2: Enter Verification Code (OTP) -->
        <div v-else class="otp-step-box">
          <div class="telegram-otp-banner">
            <div class="tg-banner-icon">
              <Send :size="18" />
            </div>
            <div class="tg-banner-text">
              <p>Tasdiqlash kodini <strong>@NexsoraOPT_bot</strong> orqali oling:</p>
              <a href="https://t.me/NexsoraOPT_bot?start=login" target="_blank" rel="noopener" class="tg-bot-link">
                <span>📲 Telegram Botni Ochish</span>
              </a>
            </div>
          </div>

          <div class="otp-header-info">
            <span class="otp-sent-to">{{ phoneForm.phone }} raqami uchun</span>
            <button type="button" class="change-phone-btn" @click="phoneStep = 'enter_phone'">
              O'zgartirish
            </button>
          </div>

          <div class="input-group">
            <label class="input-label">4 xonali tasdiqlash kodi</label>
            <div class="input-icon-wrapper">
              <KeyRound :size="18" class="input-icon" />
              <input
                v-model="phoneForm.otpCode"
                type="text"
                maxlength="6"
                placeholder="Kod (masalan: 7777)"
                class="input otp-input"
                required
                autofocus
              />
            </div>
            <div class="otp-timer-row">
              <span v-if="otpTimer > 0" class="timer-text">
                Kodni qayta so'rash: <strong>00:{{ otpTimer < 10 ? '0' + otpTimer : otpTimer }}</strong>
              </span>
              <button
                v-else
                type="button"
                class="resend-btn"
                :disabled="loading"
                @click="sendOtpCode"
              >
                Kodni qayta yuborish
              </button>
            </div>
          </div>
        </div>

        <div v-if="error" class="error-box">{{ error }}</div>
        <div v-if="infoSuccess" class="success-box">{{ infoSuccess }}</div>

        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          <span v-if="loading" class="animate-spin loader"></span>
          <span v-else-if="phoneStep === 'enter_phone'">SMS Kodni olish</span>
          <span v-else>Tasdiqlash & Kirish</span>
        </button>
      </form>

      <!-- METHOD 2: EMAIL & PASSWORD LOGIN -->
      <form v-else @submit.prevent="handleEmailSubmit" class="form">
        <div class="input-group">
          <label class="input-label">Email</label>
          <div class="input-icon-wrapper">
            <Mail :size="18" class="input-icon" />
            <input
              v-model="emailForm.email"
              type="email"
              placeholder="email@example.com"
              class="input"
              required
            />
          </div>
        </div>

        <div class="input-group">
          <label class="input-label">Parol</label>
          <div class="input-icon-wrapper pass-wrapper">
            <Lock :size="18" class="input-icon" />
            <input
              v-model="emailForm.password"
              :type="showPass ? 'text' : 'password'"
              placeholder="Parolingizni kiriting"
              class="input"
              required
            />
            <button type="button" class="eye-btn" @click="showPass = !showPass">
              <EyeOff v-if="showPass" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </div>

        <div v-if="error" class="error-box">{{ error }}</div>

        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          <span v-if="loading" class="animate-spin loader"></span>
          <span v-else>Kirish</span>
        </button>

        <div class="forgot-link-row">
          <router-link to="/forgot-password" class="forgot-link">
            Parolni unutdingizmi?
          </router-link>
        </div>
      </form>

      <p class="auth-switch">
        Hisobingiz yo'qmi?
        <router-link to="/register" class="auth-link">Ro'yxatdan o'tish</router-link>
      </p>

      <router-link to="/#guide" class="guide-quick-link">
        💡 Ro'yxatdan o'tish bo'yicha qo'llanma
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Wrench, Mail, Lock, Eye, EyeOff, Smartphone, Phone, KeyRound, Send } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const authMethod = ref('phone') // 'phone' | 'email'
const phoneStep = ref('enter_phone') // 'enter_phone' | 'enter_otp'

const phoneForm = ref({
  phone: '+998 ',
  otpCode: ''
})

const emailForm = ref({
  email: '',
  password: ''
})

const showPass = ref(false)
const loading = ref(false)
const error = ref('')
const infoSuccess = ref('')
const otpTimer = ref(0)
let timerInterval = null

function switchAuthMethod(method) {
  authMethod.value = method
  error.value = ''
  infoSuccess.value = ''
}

function formatPhoneInput(e) {
  let val = e.target.value.replace(/[^\d+]/g, '')
  if (!val.startsWith('+998')) {
    val = '+998 ' + val.replace(/^\+?998?/, '')
  }
  phoneForm.value.phone = val
}

function startOtpTimer() {
  otpTimer.value = 60
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (otpTimer.value > 0) {
      otpTimer.value--
    } else {
      clearInterval(timerInterval)
    }
  }, 1000)
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

async function sendOtpCode() {
  const p = phoneForm.value.phone.trim()
  if (p.length < 9) {
    error.value = "Telefon raqamingizni to'liq kiriting"
    return
  }

  loading.value = true
  error.value = ''
  infoSuccess.value = ''

  try {
    const res = await authStore.sendPhoneOtp(p)
    phoneStep.value = 'enter_otp'
    phoneForm.value.otpCode = ''
    startOtpTimer()
    infoSuccess.value = `SMS kod yuborildi! (Sinov uchun kod: ${res.demoOtp || '7777'})`
  } catch (err) {
    error.value = err.message || "SMS kod yuborishda xatolik yuz berdi"
  } finally {
    loading.value = false
  }
}

async function handlePhoneSubmit() {
  if (phoneStep.value === 'enter_phone') {
    await sendOtpCode()
  } else {
    // Verify OTP
    if (!phoneForm.value.otpCode.trim()) {
      error.value = "Tasdiqlash kodini kiriting"
      return
    }

    loading.value = true
    error.value = ''

    try {
      await authStore.verifyPhoneOtp(phoneForm.value.phone, phoneForm.value.otpCode)
      router.push('/dashboard')
    } catch (err) {
      error.value = err.message || "Kod noto'g'ri kiritildi"
    } finally {
      loading.value = false
    }
  }
}

async function handleEmailSubmit() {
  loading.value = true
  error.value = ''

  try {
    await authStore.login(emailForm.value.email, emailForm.value.password)
    router.push('/dashboard')
  } catch (err) {
    error.value = "Email yoki parol noto'g'ri"
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
  padding: 24px;
  background: var(--color-bg);
}

.auth-card {
  width: 100%;
  max-width: 440px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 28px;
  padding: 36px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.logo {
  display: flex;
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

.title { font-size: 1.65rem; font-weight: 800; }
.subtitle { font-size: 0.88rem; color: var(--color-text-2); margin-bottom: 6px; }

/* Tabs Switcher */
.auth-tabs {
  display: flex;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
  margin-bottom: 8px;
}

.auth-tab-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--color-muted);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.auth-tab-btn.active {
  background: var(--color-card);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
}

.form { display: flex; flex-direction: column; gap: 16px; margin-top: 4px; }

.input-icon-wrapper { position: relative; }
.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-muted);
}

.input { padding-left: 44px; }
.pass-wrapper .input { padding-right: 44px; }

.input-hint {
  font-size: 0.78rem;
  color: var(--color-muted);
  margin: 4px 0 0;
}

.otp-header-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.82rem;
}

.otp-sent-to {
  color: var(--color-text-2);
  font-weight: 500;
}

.change-phone-btn {
  background: none;
  border: none;
  color: var(--color-primary-light);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.otp-input {
  letter-spacing: 4px;
  font-size: 1.1rem;
  font-weight: 700;
}

.otp-timer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 0.8rem;
}

.timer-text {
  color: var(--color-muted);
}

.resend-btn {
  background: none;
  border: none;
  color: var(--color-primary-light);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.eye-btn {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  color: var(--color-muted);
}

.error-box {
  padding: 10px 14px;
  background: rgba(255,71,87,0.1);
  border: 1px solid rgba(255,71,87,0.25);
  border-radius: 10px;
  color: var(--color-error);
  font-size: 0.82rem;
}

.success-box {
  padding: 10px 14px;
  background: rgba(46, 213, 115, 0.12);
  border: 1px solid rgba(46, 213, 115, 0.3);
  border-radius: 10px;
  color: #2ed573;
  font-size: 0.82rem;
}

.w-full { width: 100%; }

.auth-switch { text-align: center; font-size: 0.85rem; color: var(--color-text-2); margin-top: 4px; }
.auth-link { color: var(--color-primary-light); font-weight: 600; }

.guide-quick-link {
  display: block;
  text-align: center;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-primary-light);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  border-radius: 10px;
  text-decoration: none;
}

.telegram-otp-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(108, 99, 255, 0.1);
  border: 1px solid rgba(108, 99, 255, 0.25);
  padding: 14px 16px;
  border-radius: 14px;
  margin-bottom: 16px;
}

.tg-banner-icon {
  width: 38px;
  height: 38px;
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
  font-size: 0.85rem;
  text-decoration: underline;
}

.tg-bot-link:hover {
  color: white;
}

.forgot-link-row {
  text-align: right;
  margin-top: -4px;
}
.forgot-link {
  font-size: 0.82rem;
  color: var(--color-text-2);
  text-decoration: none;
  transition: color 0.2s;
}
.forgot-link:hover {
  color: var(--color-primary);
  text-decoration: underline;
}
</style>
