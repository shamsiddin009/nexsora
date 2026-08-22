<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-card escrow-modal-card">
      
      <!-- MODAL HEADER -->
      <div class="modal-header">
        <div class="header-title">
          <div class="header-shield-icon">
            <ShieldCheck :size="22" />
          </div>
          <div>
            <h3>Kafolatlangan Xavfsiz Bitim</h3>
            <span class="escrow-subtag">Nexsora Escrow Protection 2026</span>
          </div>
        </div>
        <button class="close-btn" @click="close" title="Yopish">
          <X :size="20" />
        </button>
      </div>

      <!-- MODAL BODY -->
      <div class="modal-body">
        
        <!-- STEP TABS -->
        <div class="escrow-tabs">
          <button
            type="button"
            class="escrow-tab-btn"
            :class="{ active: currentTab === 'create' }"
            @click="currentTab = 'create'"
          >
            <ShieldCheck :size="15" />
            <span>Shartnoma Tuzish</span>
          </button>
          <button
            type="button"
            class="escrow-tab-btn"
            :class="{ active: currentTab === 'certificate' }"
            @click="currentTab = 'certificate'"
          >
            <FileText :size="15" />
            <span>Elektron Shartnoma & QR</span>
          </button>
        </div>

        <!-- TAB 1: FORM CONFIGURATION -->
        <div v-if="currentTab === 'create'">
          <!-- GUARANTEE INFO BANNER -->
          <div class="info-banner">
            <Lock :size="20" class="banner-icon" />
            <div>
              <strong>100% Mablag' Kafolati:</strong>
              <p>
                To'lovingiz Nexsora xavfsiz hisobida muzlatiladi. Usta ishni to'liq topshirib, siz tasdiqlamaguningizcha pul chiqarilmaydi.
              </p>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="escrow-form">
            <!-- Deal Title -->
            <div class="form-group">
              <label class="form-label">Loyiha / Ish nomi</label>
              <input
                v-model="form.title"
                type="text"
                class="form-input"
                placeholder="Masalan: Santexnika quvurlarini almashtirish va krant o'rnatish"
                required
              />
            </div>

            <!-- Amount and Duration -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Kelishilgan Byudjet (UZS)</label>
                <div class="input-with-currency">
                  <input
                    v-model.number="form.amount"
                    type="number"
                    min="20000"
                    step="10000"
                    class="form-input"
                    placeholder="500000"
                    required
                  />
                  <span class="currency-tag">so'm</span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Bajarish muddati</label>
                <div class="input-with-currency">
                  <input
                    v-model.number="form.days"
                    type="number"
                    min="1"
                    max="90"
                    class="form-input"
                    placeholder="3"
                    required
                  />
                  <span class="currency-tag">kun</span>
                </div>
              </div>
            </div>

            <!-- PAYMENT MILESTONE MODE -->
            <div class="form-group">
              <label class="form-label">To'lov & Kafolat turi</label>
              <div class="milestone-options">
                <label class="option-pill" :class="{ selected: form.paymentType === 'full' }">
                  <input type="radio" v-model="form.paymentType" value="full" class="d-none" />
                  <div class="pill-content">
                    <span class="pill-title">100% Bir martalik to'lov</span>
                    <span class="pill-sub">Ish to'liq yakunlanganda bitta bosqichda</span>
                  </div>
                </label>

                <label class="option-pill" :class="{ selected: form.paymentType === 'split' }">
                  <input type="radio" v-model="form.paymentType" value="split" class="d-none" />
                  <div class="pill-content">
                    <span class="pill-title">2-Bosqichli to'lov (50% / 50%)</span>
                    <span class="pill-sub">Katta hajmdagi loyihalar uchun bosqichma-bosqich</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- WARRANTY SELECTION -->
            <div class="form-group">
              <label class="form-label">Usta tomonidan bepul kafolat muddati</label>
              <div class="warranty-selector">
                <button
                  type="button"
                  class="warranty-btn"
                  :class="{ active: form.warrantyDays === 7 }"
                  @click="form.warrantyDays = 7"
                >
                  <Award :size="14" />
                  <span>7 Kunlik kafolat</span>
                </button>
                <button
                  type="button"
                  class="warranty-btn"
                  :class="{ active: form.warrantyDays === 14 }"
                  @click="form.warrantyDays = 14"
                >
                  <Sparkles :size="14" />
                  <span>14 Kun (Tavsiya)</span>
                </button>
                <button
                  type="button"
                  class="warranty-btn"
                  :class="{ active: form.warrantyDays === 30 }"
                  @click="form.warrantyDays = 30"
                >
                  <ShieldCheck :size="14" />
                  <span>30 Kun Premium</span>
                </button>
              </div>
            </div>

            <!-- FINANCIAL BREAKDOWN -->
            <div class="breakdown-card">
              <div class="breakdown-row">
                <span>Kelishilgan byudjet:</span>
                <strong>{{ formatPrice(form.amount || 0) }}</strong>
              </div>
              <div class="breakdown-row">
                <span>Platforma kafolati & Arbitraj xizmati (5%):</span>
                <span class="text-muted">{{ formatPrice(commissionAmount) }}</span>
              </div>
              <div class="breakdown-row">
                <span>Bepul ta'mirlash kafolati:</span>
                <span class="text-primary font-semibold">{{ form.warrantyDays }} kun davomida</span>
              </div>
              <div class="breakdown-divider"></div>
              <div class="breakdown-row total-row">
                <span>Usta hisobiga o'tadigan sof summa:</span>
                <strong class="text-success">{{ formatPrice(netAmount) }}</strong>
              </div>
            </div>

            <!-- WALLET BALANCE BAR -->
            <div class="wallet-check-bar">
              <div class="wallet-info">
                <Wallet :size="16" class="text-primary" />
                <span>Sizning Hamyon balansingiz: <strong>{{ formatPrice(walletStore.balance || 0) }}</strong></span>
              </div>
              <button
                v-if="walletStore.balance < (form.amount || 0)"
                type="button"
                class="btn btn-outline btn-xs"
                @click="walletStore.openWalletModal"
              >
                + To'ldirish
              </button>
            </div>

            <!-- MODAL ACTIONS -->
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="close">Bekor qilish</button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <ShieldCheck :size="16" />
                <span>{{ loading ? 'Muzlatilmoqda...' : 'Xavfsiz Bitimni Tasdiqlash' }}</span>
              </button>
            </div>
          </form>
        </div>

        <!-- TAB 2: CERTIFICATE & CONTRACT PREVIEW -->
        <div v-else class="certificate-preview-view">
          <div class="contract-paper" id="escrow-printable-contract">
            <div class="contract-top-header">
              <div class="contract-logo">
                <ShieldCheck :size="28" class="text-primary" />
                <div>
                  <h4>NEXSORA ESCROW</h4>
                  <span>O'zbekiston Respublikasi Raqamli Kafolat Shartnomasi</span>
                </div>
              </div>
              <div class="contract-badge-number">
                <span>KOD: NX-2026-{{ Math.floor(100000 + Math.random() * 900000) }}</span>
              </div>
            </div>

            <div class="contract-parties-section">
              <div class="party-col">
                <span class="p-label">BUYURTMACHI (MIJOZ):</span>
                <strong>{{ authStore.profile?.full_name || 'Foydalanuvchi' }}</strong>
                <p>{{ authStore.profile?.phone || '+998 (90) •••-••-••' }}</p>
              </div>
              <div class="party-col">
                <span class="p-label">IJROCHI (USTA):</span>
                <strong>{{ chatPartner?.full_name || 'Usta mutaxassis' }}</strong>
                <p>{{ chatPartner?.phone || '+998 (93) •••-••-••' }}</p>
              </div>
            </div>

            <div class="contract-body-text">
              <p><strong>1. Shartnoma predmeti:</strong> "{{ form.title || 'Belgilangan montaj va ta\'mirlash ishlari' }}"</p>
              <p><strong>2. Kafolatlangan summa:</strong> {{ formatPrice(form.amount || 500000) }} (Platformada muzlatilgan holatda saqlanadi).</p>
              <p><strong>3. Muddat va Kafolat:</strong> {{ form.days }} kun ichida topshirish va {{ form.warrantyDays }} kunlik bepul qayta tuzatish kafolati.</p>
              <p><strong>4. Nizo va Arbitraj:</strong> Har qanday e'tiroz bo'lsa, Nexsora xolis arbitraj komissiyasi shartnoma asosida hal qiladi.</p>
            </div>

            <div class="contract-footer-qr">
              <div class="qr-box">
                <QrCode :size="56" class="text-dark" />
              </div>
              <div class="qr-caption">
                <div class="stamp-verified">
                  <CheckCircle2 :size="14" />
                  <span>TASDIQLANGAN ELEKTRON SHARTNOMA</span>
                </div>
                <small>Haqiqiyligini tekshirish uchun QR-kodni skaner qiling</small>
              </div>
            </div>
          </div>

          <div class="cert-action-bar">
            <button class="btn btn-secondary btn-sm" @click="printContract">
              <Printer :size="15" />
              <span>Chop etish (PDF)</span>
            </button>
            <button class="btn btn-primary btn-sm" @click="currentTab = 'create'">
              <span>Bitimni Davom Ettirish</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  ShieldCheck, Lock, X, Award, Sparkles, Wallet,
  FileText, QrCode, CheckCircle2, Printer
} from 'lucide-vue-next'
import { escrowService } from '../../services/escrow'
import { contractPdfService } from '../../services/contractPdfService'
import { useAuthStore } from '../../stores/auth'
import { useWalletStore } from '../../stores/walletStore'
import { useToast } from '../../composables/useToast'
import { formatPrice } from '../../utils'

const props = defineProps({
  show: Boolean,
  chatPartner: Object,
  currentUserId: String,
  jobTitle: String,
  jobBudget: Number
})

const emit = defineEmits(['close', 'created'])

const authStore = useAuthStore()
const walletStore = useWalletStore()
const toast = useToast()

const currentTab = ref('create')
const loading = ref(false)

const form = ref({
  title: props.jobTitle || 'Xizmat ko\'rsatish bo\'yicha kafolatlangan bitim',
  amount: props.jobBudget || 500000,
  days: 3,
  paymentType: 'full',
  warrantyDays: 14
})

const commissionAmount = computed(() => {
  return Math.round((form.value.amount || 0) * 0.05)
})

const netAmount = computed(() => {
  return (form.value.amount || 0) - commissionAmount.value
})

function close() {
  emit('close')
}

function printContract() {
  contractPdfService.generateAndPrintContract({
    orderId: 'escrow_' + Date.now(),
    clientName: authStore.profile?.full_name || 'Mijoz',
    craftsmanName: props.chatPartner?.full_name || 'Usta mutaxassis',
    jobTitle: form.value.title || props.jobTitle || 'Xizmat montaji',
    amount: form.value.amount || props.jobBudget || 500000,
    deadline: `${form.value.days || 3} kun`,
  })
}

async function handleSubmit() {
  if (!form.value.amount || form.value.amount < 20000) {
    toast.error('Xatolik', 'Minimal summa 20 000 UZS bo\'lishi kerak')
    return
  }

  loading.value = true
  try {
    const result = await escrowService.createDeal({
      clientId: props.currentUserId || authStore.user?.id,
      craftsmanId: props.chatPartner?.id,
      title: form.value.title,
      amount: form.value.amount,
      warrantyDays: form.value.warrantyDays,
      paymentType: form.value.paymentType
    })

    if (result.success) {
      toast.success(
        'Xavfsiz Bitim Tuzildi! 🛡️',
        `Mablag' (${formatPrice(form.value.amount)}) xavfsiz muzlatildi va ${form.value.warrantyDays} kunlik kafolat belgilandi!`
      )
      emit('created', {
        ...result.deal,
        title: form.value.title,
        amount: form.value.amount,
        warrantyDays: form.value.warrantyDays
      })
      close()
    }
  } catch (e) {
    toast.error('Xatolik', 'Shartnoma yaratishda xatolik yuz berdi')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.escrow-modal-card {
  width: 100%;
  max-width: 540px;
  background: var(--color-surface);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  max-height: 92vh;
}

.modal-header {
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-2);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-shield-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(108, 99, 255, 0.15);
  color: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
}

.escrow-subtag {
  font-size: 0.72rem;
  color: var(--color-primary-light);
  font-weight: 600;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: var(--color-surface);
  color: var(--color-text);
}

.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
}

/* TABS */
.escrow-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
  background: var(--color-surface-2);
  padding: 4px;
  border-radius: 12px;
}

.escrow-tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 9px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-2);
  cursor: pointer;
  transition: all 0.15s ease;
}

.escrow-tab-btn.active {
  background: var(--color-surface);
  color: var(--color-primary-light);
  box-shadow: var(--shadow-sm);
}

/* BANNER */
.info-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 12px 16px;
  border-radius: 14px;
  margin-bottom: 18px;
}

.banner-icon {
  color: var(--color-success);
  flex-shrink: 0;
  margin-top: 2px;
}

.info-banner strong {
  font-size: 0.85rem;
  color: var(--color-success);
  display: block;
}

.info-banner p {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: var(--color-text-2);
  line-height: 1.35;
}

/* FORM */
.escrow-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 12px;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-2);
}

.form-input {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 0.92rem;
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s ease;
}

.form-input:focus {
  border-color: var(--color-primary);
}

.input-with-currency {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-currency input {
  width: 100%;
  padding-right: 52px;
}

.currency-tag {
  position: absolute;
  right: 14px;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--color-muted);
}

/* MILESTONE OPTIONS */
.milestone-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.option-pill {
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: block;
}

.option-pill.selected {
  border-color: var(--color-primary);
  background: rgba(108, 99, 255, 0.08);
}

.pill-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text);
  display: block;
}

.pill-sub {
  font-size: 0.7rem;
  color: var(--color-text-2);
  display: block;
  margin-top: 2px;
}

/* WARRANTY SELECTOR */
.warranty-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.warranty-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 6px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text-2);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.warranty-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

/* FINANCIAL BREAKDOWN */
.breakdown-card {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  padding: 14px 16px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.84rem;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breakdown-divider {
  height: 1px;
  background: var(--color-border);
  margin: 4px 0;
}

.total-row {
  font-size: 0.92rem;
  font-weight: 700;
}

/* WALLET CHECK BAR */
.wallet-check-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(108, 99, 255, 0.06);
  border-radius: 12px;
  border: 1px solid rgba(108, 99, 255, 0.2);
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--color-text);
}

.btn-xs {
  padding: 4px 10px;
  font-size: 0.75rem;
  border-radius: 6px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

/* CONTRACT PRINTABLE PREVIEW */
.contract-paper {
  background: #FFFFFF;
  color: #0F172A;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.contract-top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #E2E8F0;
  padding-bottom: 14px;
  margin-bottom: 16px;
}

.contract-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.contract-logo h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #1E293B;
}

.contract-logo span {
  font-size: 0.72rem;
  color: #64748B;
  display: block;
}

.contract-badge-number {
  background: #F1F5F9;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 700;
  color: #334155;
}

.contract-parties-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 12px 14px;
  background: #F8FAFC;
  border-radius: 10px;
  margin-bottom: 16px;
}

.p-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: #94A3B8;
  display: block;
}

.party-col strong {
  font-size: 0.88rem;
  color: #0F172A;
  display: block;
}

.party-col p {
  font-size: 0.78rem;
  color: #64748B;
  margin: 2px 0 0;
}

.contract-body-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.84rem;
  line-height: 1.4;
  color: #334155;
  margin-bottom: 18px;
}

.contract-footer-qr {
  display: flex;
  align-items: center;
  gap: 14px;
  border-top: 1px dashed #CBD5E1;
  padding-top: 14px;
}

.qr-box {
  background: #F8FAFC;
  padding: 6px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
}

.stamp-verified {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #10B981;
  font-weight: 800;
  font-size: 0.78rem;
}

.cert-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}
</style>
