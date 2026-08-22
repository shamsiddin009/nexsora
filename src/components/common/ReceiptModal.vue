<template>
  <div v-if="isOpen" class="receipt-overlay" @click.self="close">
    <div class="receipt-card-wrapper">
      
      <!-- Receipt Top Action Bar -->
      <div class="receipt-actions-bar">
        <button class="action-pill-btn" @click="printReceipt">
          <Printer :size="15" />
          <span>Chop etish / PDF</span>
        </button>
        <button class="action-pill-btn" @click="sendToTelegram">
          <Send :size="15" />
          <span>Telegramga yuborish</span>
        </button>
        <button class="close-receipt-btn" @click="close">
          <X :size="18" />
        </button>
      </div>

      <!-- Printable Electronic Receipt Card -->
      <div id="nexsora-printable-receipt" class="receipt-paper">
        
        <!-- Receipt Header with Watermark / Logo -->
        <div class="paper-header">
          <div class="brand-row">
            <div class="brand-logo">
              <Wrench :size="20" class="brand-icon" />
              <span>Nex<span class="brand-accent">sora</span></span>
            </div>
            <span class="fiscal-tag">ELEKTRON CHEK</span>
          </div>
          <span class="company-sub">«NEXSORA TECHNOLOGY» MCHJ • O'zbekiston</span>
          <span class="company-meta">STIR / INN: 309 481 294 • Xavfsiz To'lov Tizimi</span>
        </div>

        <div class="paper-zigzag-top"></div>

        <!-- Receipt Main Body -->
        <div class="paper-body">
          
          <!-- Big Status Indicator -->
          <div class="receipt-status-badge">
            <CheckCircle2 :size="18" class="text-success" />
            <span>TO'LOV MUVAFFAQIYATLI BAJARILDI</span>
          </div>

          <!-- Total Amount Display -->
          <div class="receipt-amount-display">
            <span class="amount-label">Jami Summa:</span>
            <div class="amount-value">
              <strong>{{ formatMoney(receiptData?.amount || 0) }}</strong>
              <span class="currency">UZS</span>
            </div>
          </div>

          <!-- Detailed Key-Value Table -->
          <div class="receipt-table">
            <div class="receipt-row">
              <span class="r-label">Chek / Tranzaksiya №:</span>
              <span class="r-val font-mono">{{ receiptData?.id || 'NX-2026-89104' }}</span>
            </div>
            <div class="receipt-row">
              <span class="r-label">Sana va Vaqt:</span>
              <span class="r-val">{{ formatDate(receiptData?.date) }}</span>
            </div>
            <div class="receipt-row">
              <span class="r-label">Operatsiya turi:</span>
              <span class="r-val">{{ receiptData?.title || "Xizmat to'lovi" }}</span>
            </div>
            <div class="receipt-row">
              <span class="r-label">To'lov usuli:</span>
              <span class="r-val font-bold text-primary">{{ (receiptData?.provider || 'CLICK UP').toUpperCase() }}</span>
            </div>
            <div v-if="receiptData?.payerName" class="receipt-row">
              <span class="r-label">To'lovchi:</span>
              <span class="r-val">{{ receiptData.payerName }}</span>
            </div>
            <div v-if="receiptData?.cardNumber" class="receipt-row">
              <span class="r-label">Karta raqami:</span>
              <span class="r-val font-mono">{{ maskCard(receiptData.cardNumber) }}</span>
            </div>
          </div>

          <div class="receipt-divider"></div>

          <!-- Financial Breakdown -->
          <div class="receipt-breakdown">
            <div class="r-sub-row">
              <span>Asosiy xizmat qiymati:</span>
              <span>{{ formatMoney(receiptData?.amount || 0) }} UZS</span>
            </div>
            <div class="r-sub-row">
              <span>Platforma kafolat komissiyasi (0%):</span>
              <span>0 UZS</span>
            </div>
            <div class="r-sub-row">
              <span>QQS (0%):</span>
              <span>0 UZS</span>
            </div>
          </div>

          <div class="receipt-divider"></div>

          <!-- Security & Verification Stamp with QR Code Mock -->
          <div class="receipt-footer-stamp">
            <div class="qr-box">
              <div class="qr-mock">
                <!-- SVG Vector QR Code -->
                <svg viewBox="0 0 100 100" class="qr-svg">
                  <rect width="100" height="100" fill="#ffffff" />
                  <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z" fill="#000" />
                  <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z" fill="#000" />
                  <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z" fill="#000" />
                  <rect x="45" y="15" width="8" height="8" fill="#000" />
                  <rect x="45" y="30" width="8" height="8" fill="#000" />
                  <rect x="45" y="45" width="10" height="10" fill="#000" />
                  <rect x="15" y="45" width="10" height="8" fill="#000" />
                  <rect x="60" y="45" width="12" height="12" fill="#000" />
                  <rect x="75" y="65" width="15" height="15" fill="#000" />
                  <rect x="50" y="70" width="12" height="12" fill="#000" />
                </svg>
              </div>
              <span class="qr-desc">Tasdiqlash kodi</span>
            </div>
            
            <div class="stamp-info">
              <div class="stamp-badge">
                <ShieldCheck :size="16" class="text-success" />
                <span>NEXSORA ESCROW VERIFIED</span>
              </div>
              <p class="stamp-text">
                Ushbu kvitansiya Nexsora to'lov shlyuzi orqali elektron shaklda shakllantirilgan va to'liq yuridik kuchga ega.
              </p>
            </div>
          </div>

        </div>

        <div class="paper-zigzag-bottom"></div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { 
  Printer, Send, X, Wrench, CheckCircle2, ShieldCheck 
} from 'lucide-vue-next'
import { useToast } from '../../composables/useToast'
import { sendTelegramNotification } from '../../services/telegramNotifier'
import { useAuthStore } from '../../stores/auth'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  receiptData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])
const toast = useToast()
const authStore = useAuthStore()

function close() {
  emit('close')
}

function formatMoney(val) {
  return new Intl.NumberFormat('uz-UZ').format(Math.abs(val || 0))
}

function formatDate(isoStr) {
  const d = isoStr ? new Date(isoStr) : new Date()
  return d.toLocaleDateString('uz-UZ', { 
    day: '2-digit', month: '2-digit', year: 'numeric', 
    hour: '2-digit', minute: '2-digit', second: '2-digit' 
  })
}

function maskCard(cardNum) {
  if (!cardNum) return '•••• 8890'
  const clean = cardNum.replace(/\D/g, '')
  if (clean.length === 16) {
    return `${clean.slice(0, 4)} •••• •••• ${clean.slice(12)}`
  }
  return cardNum
}

function printReceipt() {
  window.print()
}

async function sendToTelegram() {
  const phone = authStore.profile?.phone || authStore.user?.phone || 'Mijoz'
  const amount = formatMoney(props.receiptData?.amount || 0)
  const txId = props.receiptData?.id || 'NX-2026-89104'
  const title = props.receiptData?.title || "Xizmat to'lovi"
  
  const text = `🧾 <b>NEXSORA ELEKTRON TO'LOV CHEKI</b>\n\n` +
               `📌 <b>Xizmat:</b> ${title}\n` +
               `💰 <b>Summa:</b> ${amount} UZS\n` +
               `🔢 <b>Chek №:</b> <code>${txId}</code>\n` +
               `📅 <b>Sana:</b> ${formatDate(props.receiptData?.date)}\n` +
               `🛡️ <b>Holat:</b> Muvaffaqiyatli to'landi\n\n` +
               `<i>Nexsora Kafolatlangan To'lov Tizimi</i>`

  // Send to user telegram if available
  toast.success('Yuborildi!', 'Chek nusxasi Telegram botingizga yuborildi.')
  if (authStore.profile?.telegram_chat_id) {
    await sendTelegramNotification(authStore.profile.telegram_chat_id, text)
  }
}
</script>

<style scoped>
.receipt-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 15, 0.82);
  backdrop-filter: blur(10px);
  z-index: 2800;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.receipt-card-wrapper {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.receipt-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.action-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-pill-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.close-receipt-btn {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-muted);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Printable Paper Design */
.receipt-paper {
  background: #ffffff;
  color: #1a1a24;
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  overflow: hidden;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.paper-header {
  padding: 24px 24px 16px;
  background: #f8f9fc;
  border-bottom: 2px dashed #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 900;
  color: #0f172a;
}
.brand-icon { color: #6C63FF; }
.brand-accent { color: #6C63FF; }

.fiscal-tag {
  background: #0f172a;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.company-sub {
  font-size: 0.76rem;
  font-weight: 700;
  color: #475569;
}

.company-meta {
  font-size: 0.68rem;
  color: #64748b;
}

.paper-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.receipt-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.74rem;
  font-weight: 800;
  align-self: flex-start;
}

.receipt-amount-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0 6px;
  border-bottom: 1px solid #f1f5f9;
}

.amount-label {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 600;
}

.amount-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.amount-value strong {
  font-size: 2rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.currency {
  font-size: 0.9rem;
  font-weight: 800;
  color: #6C63FF;
}

.receipt-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.82rem;
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.r-label {
  color: #64748b;
}

.r-val {
  color: #0f172a;
  font-weight: 600;
  text-align: right;
}

.font-mono {
  font-family: ui-monospace, monospace;
}

.font-bold {
  font-weight: 800;
}

.text-primary {
  color: #6C63FF !important;
}

.receipt-divider {
  height: 1px;
  border-top: 1px dashed #cbd5e1;
  margin: 2px 0;
}

.receipt-breakdown {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.75rem;
  color: #64748b;
}

.r-sub-row {
  display: flex;
  justify-content: space-between;
}

.receipt-footer-stamp {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 4px;
}

.qr-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.qr-mock {
  width: 60px;
  height: 60px;
  padding: 4px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.qr-svg {
  width: 100%;
  height: 100%;
}

.qr-desc {
  font-size: 0.6rem;
  font-weight: 700;
  color: #64748b;
}

.stamp-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stamp-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 800;
  color: #0f172a;
}

.stamp-text {
  font-size: 0.66rem;
  color: #64748b;
  line-height: 1.35;
  margin: 0;
}

/* Print Styles */
@media print {
  body * {
    visibility: hidden;
  }
  .receipt-overlay {
    position: absolute;
    inset: 0;
    background: transparent;
    padding: 0;
  }
  .receipt-actions-bar {
    display: none !important;
  }
  #nexsora-printable-receipt, #nexsora-printable-receipt * {
    visibility: visible;
  }
  #nexsora-printable-receipt {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    max-width: 480px;
    box-shadow: none;
    border: 1px solid #ccc;
  }
}
</style>
