<template>
  <div v-if="walletStore.isModalOpen" class="wallet-overlay" @click.self="walletStore.closeWalletModal">
    <div class="wallet-modal card">
      
      <!-- Modal Header -->
      <div class="modal-head">
        <div class="head-left">
          <div class="wallet-icon-box">
            <Wallet :size="20" />
          </div>
          <div>
            <h3>Mening Hamyonim</h3>
            <span class="head-sub">
              {{ authStore.isCraftsman ? '🛠️ Usta hisobi — Ish haqlari va Kartaga chiqarish' : '👤 Mijoz hisobi — Xizmatlar to\'lovi va Balans' }}
            </span>
          </div>
        </div>
        <button class="close-btn" @click="walletStore.closeWalletModal">
          <X :size="18" />
        </button>
      </div>

      <!-- Current Balance Card -->
      <div class="balance-card">
        <div class="bal-info">
          <span class="bal-label">{{ authStore.isCraftsman ? 'Yechib olish mumkin bo\'lgan daromad:' : 'Xizmatlar uchun mavjud balans:' }}</span>
          <div class="bal-val">
            <strong>{{ walletStore.balanceFormatted }}</strong>
            <span class="currency">UZS</span>
          </div>
        </div>
        <div class="bal-badge">
          <ShieldCheck :size="15" class="text-success" />
          <span>Kafolatlangan</span>
        </div>
      </div>

      <!-- Role-Based Navigation Tabs -->
      <div class="modal-tabs">
        <!-- If Craftsman: Withdraw is Primary -->
        <template v-if="authStore.isCraftsman">
          <button 
            :class="['tab-btn', { active: activeTab === 'withdraw' }]"
            @click="activeTab = 'withdraw'"
          >
            <ArrowUpRight :size="16" />
            <span>Kartaga Yechib Olish</span>
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'deposit' }]"
            @click="activeTab = 'deposit'"
          >
            <ArrowDownLeft :size="16" />
            <span>To'ldirish (Pro / Boost)</span>
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'history' }]"
            @click="activeTab = 'history'"
          >
            <History :size="16" />
            <span>Tarix</span>
          </button>
        </template>

        <!-- If Client: Deposit is Primary -->
        <template v-else>
          <button 
            :class="['tab-btn', { active: activeTab === 'deposit' }]"
            @click="activeTab = 'deposit'"
          >
            <ArrowDownLeft :size="16" />
            <span>Balansni To'ldirish</span>
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'history' }]"
            @click="activeTab = 'history'"
          >
            <History :size="16" />
            <span>To'lovlar Tarixi</span>
          </button>
        </template>
      </div>

      <!-- TAB 1: TOP UP BALANCE -->
      <div v-if="activeTab === 'deposit'" class="tab-content">
        <div class="amount-presets">
          <button 
            v-for="preset in [50000, 100000, 250000, 500000, 1000000]"
            :key="preset"
            :class="['preset-btn', { active: depositAmount === preset }]"
            @click="depositAmount = preset"
          >
            {{ formatNum(preset) }}
          </button>
        </div>

        <div class="input-group">
          <label class="input-label">Boshqa summa (so'm):</label>
          <div class="input-icon-wrapper">
            <DollarSign :size="18" class="input-icon" />
            <input 
              v-model.number="depositAmount"
              type="number"
              min="5000"
              step="5000"
              class="input"
              placeholder="50000"
            />
          </div>
        </div>

        <label class="input-label">To'lov tizimini tanlang:</label>
        <div class="providers-grid">
          <button 
            :class="['provider-card', { active: depositProvider === 'click' }]"
            @click="depositProvider = 'click'"
          >
            <div class="provider-title">
              <strong>Click Up</strong>
              <span class="badge-mini">0% komissiya</span>
            </div>
            <span class="provider-desc">Click ilovasi orqali 1-klikda to'lash</span>
          </button>

          <button 
            :class="['provider-card', { active: depositProvider === 'payme' }]"
            @click="depositProvider = 'payme'"
          >
            <div class="provider-title">
              <strong>Payme</strong>
              <span class="badge-mini">Tezkor</span>
            </div>
            <span class="provider-desc">Payme orqali to'g'ridan-to'g'ri o'tkazma</span>
          </button>

          <button 
            :class="['provider-card', { active: depositProvider === 'uzum' }]"
            @click="depositProvider = 'uzum'"
          >
            <div class="provider-title">
              <strong>Uzum Bank</strong>
              <span class="badge-mini">Keshbek</span>
            </div>
            <span class="provider-desc">Uzum Bank & QR to'lov</span>
          </button>
        </div>

        <button 
          class="btn btn-primary btn-lg w-full pay-action-btn"
          :disabled="loadingDeposit || !depositAmount || depositAmount < 5000"
          @click="handleDeposit"
        >
          <Lock :size="16" />
          <span>{{ loadingDeposit ? 'To\'lovga yo\'naltirilmoqda...' : `${formatNum(depositAmount)} so'm To'ldirish` }}</span>
        </button>
      </div>

      <!-- TAB 2: WITHDRAW PAYOUT TO UZCARD/HUMO -->
      <div v-else-if="activeTab === 'withdraw'" class="tab-content">
        <div class="input-group">
          <label class="input-label">Karta raqami (Uzcard / Humo):</label>
          <div class="input-icon-wrapper">
            <CreditCard :size="18" class="input-icon" />
            <input 
              v-model="withdrawCard"
              type="text"
              maxlength="19"
              placeholder="8600 0000 0000 0000"
              class="input"
              @input="formatCardInput"
            />
          </div>
          <span v-if="cardType" class="card-brand-badge">{{ cardType }}</span>
        </div>

        <div class="input-group">
          <label class="input-label">Karta egasining ismi:</label>
          <input 
            v-model="withdrawHolder"
            type="text"
            placeholder="ISLOM KARIMOV"
            class="input text-uppercase"
          />
        </div>

        <div class="input-group">
          <label class="input-label">Yechib olinadigan summa (so'm):</label>
          <input 
            v-model.number="withdrawAmount"
            type="number"
            min="10000"
            :max="walletStore.balance"
            class="input"
            placeholder="100000"
          />
        </div>

        <!-- Payout Calculation Box -->
        <div class="payout-breakdown">
          <div class="break-row">
            <span>Yechib olinadigan:</span>
            <strong>{{ formatNum(withdrawAmount || 0) }} UZS</strong>
          </div>
          <div class="break-row">
            <span>Bank xizmati (1%):</span>
            <span class="text-muted">{{ formatNum(withdrawFee) }} UZS</span>
          </div>
          <div class="break-divider"></div>
          <div class="break-row total-row">
            <span>Balansdan yechiladi:</span>
            <strong class="text-warning">{{ formatNum((withdrawAmount || 0) + withdrawFee) }} UZS</strong>
          </div>
        </div>

        <button 
          class="btn btn-primary btn-lg w-full pay-action-btn"
          :disabled="loadingWithdraw || !withdrawAmount || withdrawAmount < 10000 || ((withdrawAmount + withdrawFee) > walletStore.balance)"
          @click="handleWithdraw"
        >
          <ArrowUpRight :size="16" />
          <span>{{ loadingWithdraw ? 'So\'rov yuborilmoqda...' : 'Kartaga O\'tkazish' }}</span>
        </button>
      </div>

      <!-- TAB 3: TRANSACTIONS HISTORY -->
      <div v-else class="tab-content history-content">
        <div v-if="walletStore.transactions.length === 0" class="empty-history">
          <History :size="32" class="text-muted" />
          <p>Hozircha tranzaksiyalar mavjud emas</p>
        </div>

        <div v-else class="tx-list">
          <div 
            v-for="tx in walletStore.transactions" 
            :key="tx.id"
            class="tx-item"
          >
            <div class="tx-left">
              <div :class="['tx-icon', tx.amount > 0 ? 'tx-plus' : 'tx-minus']">
                <ArrowDownLeft v-if="tx.amount > 0" :size="16" />
                <ArrowUpRight v-else :size="16" />
              </div>
              <div class="tx-details">
                <span class="tx-title">{{ tx.title }}</span>
                <span class="tx-date">{{ formatDate(tx.date) }}</span>
              </div>
            </div>
            <div class="tx-right">
              <span :class="['tx-amount', tx.amount > 0 ? 'text-success' : 'text-main']">
                {{ tx.amount > 0 ? '+' : '' }}{{ formatNum(tx.amount) }} UZS
              </span>
              <div class="tx-actions-row">
                <button type="button" class="btn-receipt-view" @click="openReceipt(tx)">
                  <FileText :size="12" />
                  <span>Chek</span>
                </button>
                <span class="tx-status">{{ tx.status === 'success' ? 'Bajarildi' : 'Jarayonda' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Electronic Receipt Modal -->
    <ReceiptModal 
      :is-open="receiptModalOpen" 
      :receipt-data="selectedReceiptTx" 
      @close="receiptModalOpen = false" 
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { 
  Wallet, X, ShieldCheck, ArrowDownLeft, ArrowUpRight, 
  History, DollarSign, Lock, CreditCard, FileText 
} from 'lucide-vue-next'
import ReceiptModal from './ReceiptModal.vue'
import { useWalletStore } from '../../stores/walletStore'
import { useAuthStore } from '../../stores/auth'
import { paymentService } from '../../services/paymentService'
import { useToast } from '../../composables/useToast'

const walletStore = useWalletStore()
const authStore = useAuthStore()
const toast = useToast()

const activeTab = ref(authStore.isCraftsman ? 'withdraw' : 'deposit')

// Receipt Modal State
const receiptModalOpen = ref(false)
const selectedReceiptTx = ref(null)

function openReceipt(tx) {
  selectedReceiptTx.value = {
    ...tx,
    payerName: authStore.profile?.full_name || authStore.user?.phone || 'Mijoz',
    provider: tx.provider || 'Click Up'
  }
  receiptModalOpen.value = true
}

watch(() => walletStore.isModalOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
    activeTab.value = authStore.isCraftsman ? 'withdraw' : 'deposit'
  } else {
    document.body.style.overflow = ''
  }
}, { immediate: true })

onUnmounted(() => {
  document.body.style.overflow = ''
})

// Deposit State
const depositAmount = ref(100000)
const depositProvider = ref('click')
const loadingDeposit = ref(false)

// Withdraw State
const withdrawCard = ref('')
const withdrawHolder = ref('')
const withdrawAmount = ref(50000)
const loadingWithdraw = ref(false)

function formatNum(val) {
  return new Intl.NumberFormat('uz-UZ').format(val || 0)
}

function formatDate(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Card Formatter
function formatCardInput(e) {
  let val = e.target.value.replace(/\D/g, '').slice(0, 16)
  let formatted = val.match(/.{1,4}/g)?.join(' ') || val
  withdrawCard.value = formatted
}

const cardType = computed(() => {
  const digits = withdrawCard.value.replace(/\D/g, '')
  if (digits.startsWith('8600') || digits.startsWith('5614')) return 'Uzcard'
  if (digits.startsWith('9860')) return 'Humo'
  if (digits.startsWith('4')) return 'Visa'
  if (digits.startsWith('5')) return 'Mastercard'
  return ''
})

const withdrawFee = computed(() => {
  return Math.round((withdrawAmount.value || 0) * 0.01)
})

// Handlers
async function handleDeposit() {
  loadingDeposit.value = true
  
  try {
    const res = await paymentService.processPayment({
      provider: depositProvider.value,
      amount: depositAmount.value,
      title: "Nexsora Hamyon Balansini To'ldirish"
    })

    if (res.redirectUrl) {
      // In production, redirects to real Click/Payme gateway
      window.open(res.redirectUrl, '_blank')
    }

    // Instant local deposit simulation for frictionless testing
    walletStore.deposit(depositAmount.value, depositProvider.value)
    toast.success("To'lov Qabul Qilindi!", `${formatNum(depositAmount.value)} so'm hamyoningizga muvaffaqiyatli qo'shildi.`)
    activeTab.value = 'history'
  } catch (e) {
    toast.error("Xatolik", "To'lovni amalga oshirishda xatolik yuz berdi")
  } finally {
    loadingDeposit.value = false
  }
}

async function handleWithdraw() {
  const cleanCard = withdrawCard.value.replace(/\D/g, '')
  if (cleanCard.length < 16) {
    toast.error("Xatolik", "Iltimos, 16 xonali karta raqamini to'liq kiriting")
    return
  }

  loadingWithdraw.value = true
  try {
    const res = walletStore.withdraw(withdrawAmount.value, cleanCard, withdrawHolder.value)
    if (res.success) {
      toast.success("So'rov Yuborildi", `${formatNum(withdrawAmount.value)} so'm kartangizga o'tkazilmoqda.`)
      withdrawAmount.value = 0
      activeTab.value = 'history'
    } else {
      toast.error("Xatolik", res.message)
    }
  } finally {
    loadingWithdraw.value = false
  }
}
</script>

<style scoped>
.wallet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 15, 0.75);
  backdrop-filter: blur(8px);
  z-index: 2600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

.wallet-modal {
  width: 100%;
  max-width: 480px;
  max-height: min(90vh, 720px);
  overflow-y: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  box-shadow: var(--shadow-lg);
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wallet-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-head h3 {
  margin: 0;
  font-size: 1.15rem;
}

.head-sub {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.close-btn:hover {
  background: rgba(255, 71, 87, 0.15);
  border-color: rgba(255, 71, 87, 0.3);
  color: var(--color-error);
  transform: scale(1.05);
}

/* Input Icon Wrapper */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-muted);
  pointer-events: none;
  display: flex;
  align-items: center;
}

.input-icon-wrapper .input {
  padding-left: 42px;
}

/* Balance Card */
.balance-card {
  background: linear-gradient(135deg, rgba(108, 99, 255, 0.15) 0%, rgba(67, 233, 123, 0.1) 100%), var(--color-surface-2);
  border: 1px solid var(--color-border);
  padding: 18px 20px;
  border-radius: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bal-label {
  font-size: 0.8rem;
  color: var(--color-text-2);
}

.bal-val {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.bal-val strong {
  font-size: 1.8rem;
  color: var(--color-text);
  font-family: var(--font-display);
}

.currency {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-primary-light);
}

.bal-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-2);
}

/* Modal Tabs */
.modal-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  background: var(--color-surface-2);
  padding: 4px;
  border-radius: 12px;
}

.tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 4px;
  border-radius: 9px;
  background: transparent;
  color: var(--color-text-2);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn.active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Presets */
.amount-presets {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.preset-btn {
  padding: 8px 4px;
  border-radius: 10px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.preset-btn.active {
  border-color: var(--color-primary);
  background: rgba(108, 99, 255, 0.15);
  color: var(--color-primary-light);
}

.providers-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.provider-card {
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--color-surface-2);
  border: 1.5px solid var(--color-border);
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: all var(--transition-fast);
}

.provider-card:hover {
  border-color: var(--color-primary-light);
}

.provider-card.active {
  border-color: var(--color-primary);
  background: rgba(108, 99, 255, 0.1);
}

.provider-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.provider-title strong {
  font-size: 0.9rem;
}

.badge-mini {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--color-success);
  background: rgba(67, 233, 123, 0.15);
  padding: 1px 6px;
  border-radius: 999px;
}

.provider-desc {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.pay-action-btn {
  margin-top: 6px;
  border-radius: 12px;
  padding: 14px;
}

/* Card Brand Badge */
.card-brand-badge {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--color-primary-light);
  margin-top: 2px;
}

.text-uppercase {
  text-transform: uppercase;
}

/* Payout Breakdown */
.payout-breakdown {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  padding: 12px 14px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
}

.break-row {
  display: flex;
  justify-content: space-between;
}

.break-divider {
  height: 1px;
  background: var(--color-border);
  margin: 2px 0;
}

/* History */
.history-content {
  max-height: 280px;
  overflow-y: auto;
}

.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 36px 0;
  color: var(--color-muted);
  font-size: 0.85rem;
}

.tx-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tx-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.tx-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tx-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tx-plus {
  background: rgba(67, 233, 123, 0.15);
  color: var(--color-success);
}

.tx-minus {
  background: rgba(255, 71, 87, 0.15);
  color: var(--color-error);
}

.tx-details {
  display: flex;
  flex-direction: column;
}

.tx-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text);
}

.tx-date {
  font-size: 0.72rem;
  color: var(--color-muted);
}

.tx-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.tx-amount {
  font-size: 0.85rem;
  font-weight: 800;
}

.tx-status {
  font-size: 0.68rem;
  color: var(--color-muted);
}

.tx-actions-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.btn-receipt-view {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: rgba(108, 99, 255, 0.12);
  border: 1px solid rgba(108, 99, 255, 0.3);
  color: var(--color-primary-light);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-receipt-view:hover {
  background: var(--color-primary);
  color: white;
}
</style>
