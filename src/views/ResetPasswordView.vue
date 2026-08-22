<template>
  <div class="auth-page">
    <div class="auth-card">

      <div class="auth-icon-box">
        <LockKeyhole :size="28" />
      </div>

      <template v-if="!success">
        <h1 class="auth-title">Yangi parol o'rnatish</h1>
        <p class="auth-desc">Xavfsiz yangi parol yarating. Kamida 8 ta belgi.</p>

        <form class="auth-form" @submit.prevent="resetPassword">
          <!-- New password -->
          <div class="form-group">
            <label class="form-label">Yangi parol</label>
            <div class="input-icon-wrap">
              <Lock :size="17" class="input-icon" />
              <input
                v-model="password"
                :type="showPass ? 'text' : 'password'"
                class="form-input"
                placeholder="Kamida 8 ta belgi"
                required
                minlength="8"
                :disabled="loading"
              />
              <button type="button" class="toggle-pass" @click="showPass = !showPass">
                <Eye v-if="!showPass" :size="16" />
                <EyeOff v-else :size="16" />
              </button>
            </div>
            <!-- Password strength -->
            <div class="pass-strength">
              <div
                class="strength-bar"
                :class="strengthClass"
                :style="{ width: strengthWidth }"
              ></div>
            </div>
            <span class="strength-label">{{ strengthText }}</span>
          </div>

          <!-- Confirm password -->
          <div class="form-group">
            <label class="form-label">Parolni tasdiqlang</label>
            <div class="input-icon-wrap">
              <Lock :size="17" class="input-icon" />
              <input
                v-model="confirm"
                :type="showConfirm ? 'text' : 'password'"
                class="form-input"
                :class="{ 'input-error': confirm && confirm !== password }"
                placeholder="Parolni qaytaring"
                required
                :disabled="loading"
              />
              <button type="button" class="toggle-pass" @click="showConfirm = !showConfirm">
                <Eye v-if="!showConfirm" :size="16" />
                <EyeOff v-else :size="16" />
              </button>
            </div>
            <span v-if="confirm && confirm !== password" class="field-error">
              Parollar mos kelmaydi
            </span>
          </div>

          <button type="submit" class="btn-auth" :disabled="loading || !canSubmit">
            <Loader2 v-if="loading" :size="18" class="animate-spin" />
            <ShieldCheck v-else :size="18" />
            {{ loading ? 'Saqlanmoqda...' : 'Parolni yangilash' }}
          </button>
        </form>
      </template>

      <!-- Success -->
      <template v-else>
        <div class="sent-state">
          <div class="sent-icon">
            <ShieldCheck :size="48" />
          </div>
          <h1 class="auth-title">Parol yangilandi!</h1>
          <p class="auth-desc">Yangi parolingiz muvaffaqiyatli o'rnatildi.</p>
          <router-link to="/login" class="btn-auth" style="text-decoration: none; justify-content: center;">
            Tizimga kirish →
          </router-link>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Lock, LockKeyhole, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-vue-next'
import { supabase } from '../services/supabase'
import { useToast } from '../composables/useToast'
import { useRouter } from 'vue-router'

const { addToast } = useToast()
const router = useRouter()

const password = ref('')
const confirm = ref('')
const showPass = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const success = ref(false)

const canSubmit = computed(() =>
  password.value.length >= 8 && password.value === confirm.value
)

const strengthScore = computed(() => {
  const p = password.value
  let score = 0
  if (p.length >= 8) score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthClass = computed(() => {
  if (strengthScore.value <= 1) return 'strength-weak'
  if (strengthScore.value <= 3) return 'strength-medium'
  return 'strength-strong'
})

const strengthWidth = computed(() => `${(strengthScore.value / 5) * 100}%`)

const strengthText = computed(() => {
  if (!password.value) return ''
  if (strengthScore.value <= 1) return '🔴 Juda zaif'
  if (strengthScore.value <= 3) return '🟡 O\'rtacha'
  return '🟢 Kuchli parol'
})

async function resetPassword() {
  if (!canSubmit.value) return
  loading.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: password.value })
    if (error) throw error
    success.value = true
  } catch (err) {
    addToast({ type: 'error', message: err.message || 'Xatolik yuz berdi' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--color-bg); padding: 20px;
}
.auth-card {
  background: var(--color-card); border: 1px solid var(--color-border);
  border-radius: 20px; padding: 36px 32px;
  width: 100%; max-width: 420px;
  display: flex; flex-direction: column; gap: 20px;
  box-shadow: var(--shadow-lg);
}
.auth-icon-box {
  width: 56px; height: 56px; border-radius: 16px;
  background: rgba(108,99,255,0.15); color: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
}
.auth-title { font-size: 1.5rem; font-weight: 800; color: var(--color-text); margin: 0; }
.auth-desc { font-size: 0.9rem; color: var(--color-text-2); line-height: 1.6; margin: 0; }
.auth-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 7px; }
.form-label { font-size: 0.85rem; font-weight: 600; color: var(--color-text-2); }
.input-icon-wrap { position: relative; }
.input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--color-muted); }
.toggle-pass {
  position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: var(--color-muted); cursor: pointer;
}
.form-input {
  width: 100%; background: var(--color-surface-2);
  border: 1px solid var(--color-border); border-radius: 10px;
  padding: 11px 40px; color: var(--color-text);
  font-size: 0.9rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;
}
.form-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(108,99,255,0.12); }
.form-input.input-error { border-color: var(--color-error); }

/* Password strength */
.pass-strength {
  height: 4px; border-radius: 2px; background: var(--color-surface-2); overflow: hidden;
}
.strength-bar { height: 100%; border-radius: 2px; transition: all 0.3s ease; }
.strength-weak { background: var(--color-error); }
.strength-medium { background: var(--color-warning); }
.strength-strong { background: var(--color-success); }
.strength-label { font-size: 0.75rem; color: var(--color-text-2); }
.field-error { font-size: 0.78rem; color: var(--color-error); }

.btn-auth {
  width: 100%; padding: 13px; background: var(--gradient-primary);
  border: none; color: #fff; border-radius: 12px; font-size: 0.95rem;
  font-weight: 700; cursor: pointer; display: flex; align-items: center;
  justify-content: center; gap: 8px;
  transition: all 0.2s; box-shadow: 0 4px 14px rgba(108,99,255,0.35);
}
.btn-auth:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-auth:not(:disabled):hover { transform: translateY(-1px); }

.sent-state { display: flex; flex-direction: column; gap: 16px; align-items: center; text-align: center; }
.sent-icon {
  width: 80px; height: 80px; border-radius: 50%;
  background: rgba(67,233,123,0.12); color: var(--color-success);
  display: flex; align-items: center; justify-content: center;
  animation: pop-in 0.4s cubic-bezier(0.16,1,0.3,1);
}
@keyframes pop-in {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
