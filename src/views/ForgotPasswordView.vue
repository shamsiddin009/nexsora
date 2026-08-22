<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Back to login -->
      <router-link to="/login" class="back-link">
        <ArrowLeft :size="16" />
        Kirish sahifasiga qaytish
      </router-link>

      <!-- Icon -->
      <div class="auth-icon-box">
        <KeyRound :size="28" />
      </div>

      <template v-if="!emailSent">
        <h1 class="auth-title">Parolni tiklash</h1>
        <p class="auth-desc">Email manzilingizni kiriting. Parolni tiklash uchun havola yuboramiz.</p>

        <form class="auth-form" @submit.prevent="sendReset">
          <div class="form-group">
            <label class="form-label">Email manzil</label>
            <div class="input-icon-wrap">
              <Mail :size="17" class="input-icon" />
              <input
                v-model="email"
                type="email"
                class="form-input"
                placeholder="email@example.com"
                required
                autocomplete="email"
                :disabled="loading"
              />
            </div>
          </div>

          <button type="submit" class="btn-auth" :disabled="loading || !email">
            <Loader2 v-if="loading" :size="18" class="animate-spin" />
            <Send v-else :size="18" />
            {{ loading ? 'Yuborilmoqda...' : 'Havola yuborish' }}
          </button>
        </form>
      </template>

      <!-- Success state -->
      <template v-else>
        <div class="sent-state">
          <div class="sent-icon">
            <MailCheck :size="48" />
          </div>
          <h1 class="auth-title">Email yuborildi!</h1>
          <p class="auth-desc">
            <strong>{{ email }}</strong> manziliga parol tiklash havolasi yuborildi.<br/>
            Email kelmaganda spam papkasini tekshiring.
          </p>
          <button class="btn-auth" @click="emailSent = false; email = ''">
            Boshqa email bilan urinish
          </button>
          <router-link to="/login" class="btn-back-login">
            Kirish sahifasiga qaytish
          </router-link>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowLeft, Mail, KeyRound, Send, Loader2, MailCheck } from 'lucide-vue-next'
import { supabase } from '../services/supabase'
import { useToast } from '../composables/useToast'

const { addToast } = useToast()

const email = ref('')
const loading = ref(false)
const emailSent = ref(false)

async function sendReset() {
  if (!email.value) return
  loading.value = true
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
    emailSent.value = true
  } catch (err) {
    // Show success regardless (security best practice — don't reveal if email exists)
    emailSent.value = true
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

.back-link {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.85rem; color: var(--color-text-2);
  text-decoration: none; transition: color 0.2s;
}
.back-link:hover { color: var(--color-primary); }

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
.form-input {
  width: 100%; background: var(--color-surface-2);
  border: 1px solid var(--color-border); border-radius: 10px;
  padding: 11px 14px 11px 40px; color: var(--color-text);
  font-size: 0.9rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;
}
.form-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(108,99,255,0.12); }
.form-input:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-auth {
  width: 100%; padding: 13px; background: var(--gradient-primary);
  border: none; color: #fff; border-radius: 12px; font-size: 0.95rem;
  font-weight: 700; cursor: pointer; display: flex; align-items: center;
  justify-content: center; gap: 8px;
  transition: all 0.2s; box-shadow: 0 4px 14px rgba(108,99,255,0.35);
}
.btn-auth:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-auth:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(108,99,255,0.5); }

/* Sent state */
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

.btn-back-login {
  color: var(--color-text-2); font-size: 0.875rem; text-decoration: none;
  transition: color 0.2s;
}
.btn-back-login:hover { color: var(--color-primary); }
</style>
