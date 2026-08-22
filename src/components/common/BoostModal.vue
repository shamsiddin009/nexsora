<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="show" class="boost-overlay" @click.self="close">
        <div class="boost-modal">

          <!-- Header -->
          <div class="boost-header">
            <div class="boost-header-left">
              <div class="boost-icon-box">
                <Zap :size="22" />
              </div>
              <div>
                <h2 class="boost-title">E'lonni ko'tarish (Boost)</h2>
                <p class="boost-sub">E'loningizni qidiruv tepasiga chiqaring</p>
              </div>
            </div>
            <button class="boost-close" @click="close"><X :size="18" /></button>
          </div>

          <!-- What you get -->
          <div class="boost-benefits">
            <div class="benefit-item"><TrendingUp :size="15" /><span>Qidiruv tepasida ko'rsatiladi</span></div>
            <div class="benefit-item"><Eye :size="15" /><span>10x ko'proq ko'riladi</span></div>
            <div class="benefit-item"><Sparkles :size="15" /><span>Sariq Boost nishoni bilan ajralib turadi</span></div>
            <div class="benefit-item"><Bell :size="15" /><span>Mos foydalanuvchilarga bildirishnoma</span></div>
          </div>

          <!-- Pricing Plans -->
          <div class="boost-plans">
            <div
              v-for="plan in plans"
              :key="plan.id"
              class="boost-plan"
              :class="{ selected: selectedPlan === plan.id, popular: plan.popular }"
              @click="selectedPlan = plan.id"
            >
              <div v-if="plan.popular" class="plan-popular-badge"><Flame :size="12" /> Mashhur</div>
              <div class="plan-header">
                <div class="plan-duration">{{ plan.days }} kun</div>
                <div class="plan-price">
                  {{ plan.price.toLocaleString() }}
                  <span class="plan-currency">UZS</span>
                </div>
              </div>
              <div class="plan-per-day">
                Kuniga: {{ Math.round(plan.price / plan.days).toLocaleString() }} UZS
              </div>
              <div class="plan-check" v-if="selectedPlan === plan.id">
                <CheckCircle2 :size="18" />
              </div>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="payment-section">
            <label class="review-label">To'lov usuli</label>
            <div class="payment-methods">
              <button
                v-for="method in paymentMethods"
                :key="method.id"
                class="payment-method-btn"
                :class="{ active: selectedMethod === method.id }"
                @click="selectedMethod = method.id"
              >
                <span class="method-icon"><component :is="method.icon" :size="16" /></span>
                <span class="method-name">{{ method.name }}</span>
              </button>
            </div>
          </div>

          <!-- Summary -->
          <div class="boost-summary" v-if="selectedPlan">
            <div class="summary-row">
              <span>Tanlangan muddat:</span>
              <strong>{{ selectedPlanData?.days }} kun</strong>
            </div>
            <div class="summary-row">
              <span>To'lov:</span>
              <strong class="summary-price">{{ selectedPlanData?.price.toLocaleString() }} UZS</strong>
            </div>
          </div>

          <!-- Actions -->
          <div class="boost-actions">
            <button class="btn-cancel-boost" @click="close">Bekor qilish</button>
            <button
              class="btn-boost-now"
              :disabled="!selectedPlan || boosting"
              @click="activateBoost"
            >
              <Loader2 v-if="boosting" :size="16" class="animate-spin" />
              <Zap v-else :size="16" />
              {{ boosting ? 'Faollashtirilmoqda...' : 'Boost Faollashtirish' }}
            </button>
          </div>

        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Zap, X, TrendingUp, Eye, Sparkles, Bell, CheckCircle2, Loader2, Flame, CreditCard, Wallet } from 'lucide-vue-next'
import { useToast } from '../../composables/useToast'

const props = defineProps({
  show: { type: Boolean, default: false },
  itemId: { type: String, default: null },
  itemType: { type: String, default: 'service' }, // 'service' | 'job'
  itemTitle: { type: String, default: '' },
})
const emit = defineEmits(['close', 'boosted'])

const { addToast } = useToast()

const selectedPlan = ref('3day')
const selectedMethod = ref('payme')
const boosting = ref(false)

const plans = [
  { id: '1day', days: 1, price: 15000, popular: false },
  { id: '3day', days: 3, price: 35000, popular: true },
  { id: '7day', days: 7, price: 65000, popular: false },
]

const paymentMethods = [
  { id: 'payme', name: 'Payme', icon: CreditCard },
  { id: 'click', name: 'Click', icon: Zap },
  { id: 'wallet', name: 'Hamyon', icon: Wallet },
]

const selectedPlanData = computed(() => plans.find(p => p.id === selectedPlan.value))

function close() {
  emit('close')
}

async function activateBoost() {
  if (!selectedPlan.value) return
  boosting.value = true

  try {
    await new Promise(r => setTimeout(r, 1200)) // Simulate payment processing

    // Save boost to localStorage
    const key = `nexsora_boosts_${props.itemType}`
    const boosts = JSON.parse(localStorage.getItem(key) || '{}')
    const expiresAt = Date.now() + (selectedPlanData.value.days * 24 * 60 * 60 * 1000)
    boosts[props.itemId] = {
      plan: selectedPlan.value,
      days: selectedPlanData.value.days,
      price: selectedPlanData.value.price,
      method: selectedMethod.value,
      activatedAt: Date.now(),
      expiresAt,
    }
    localStorage.setItem(key, JSON.stringify(boosts))

    addToast({
      type: 'success',
      title: 'Boost faollashtirildi!',
      message: `"${props.itemTitle}" ${selectedPlanData.value.days} kun davomida qidiruv tepasida ko'rsatiladi.`,
    })

    emit('boosted', { itemId: props.itemId, plan: selectedPlanData.value })
    close()
  } catch (e) {
    addToast({ type: 'error', message: 'To\'lov amalga oshmadi, qayta urinib ko\'ring' })
  } finally {
    boosting.value = false
  }
}
</script>

<style scoped>
.boost-overlay {
  position: fixed; inset: 0; z-index: 9100;
  background: rgba(0,0,0,0.75); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.boost-modal {
  background: var(--color-card); border: 1px solid var(--color-border);
  border-radius: 20px; width: 100%; max-width: 480px;
  padding: 26px; display: flex; flex-direction: column; gap: 20px;
  max-height: 90vh; overflow-y: auto;
  box-shadow: 0 40px 100px rgba(0,0,0,0.6);
}

/* Header */
.boost-header { display: flex; align-items: flex-start; justify-content: space-between; }
.boost-header-left { display: flex; align-items: center; gap: 12px; }
.boost-icon-box {
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(247,183,49,0.15); color: #F7B731;
  display: flex; align-items: center; justify-content: center;
}
.boost-title { font-size: 1.05rem; font-weight: 700; color: var(--color-text); margin: 0; }
.boost-sub { font-size: 0.78rem; color: var(--color-text-2); margin: 0; }
.boost-close {
  width: 32px; height: 32px; border-radius: 8px;
  background: var(--color-surface-2); border: 1px solid var(--color-border);
  color: var(--color-text-2); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; flex-shrink: 0;
}
.boost-close:hover { background: var(--color-card-hover); color: var(--color-text); }

/* Benefits */
.boost-benefits {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  background: var(--color-surface-2); border-radius: 12px; padding: 12px;
}
.benefit-item {
  display: flex; align-items: center; gap: 7px;
  font-size: 0.8rem; color: var(--color-text-2);
}
.benefit-item svg { color: var(--color-primary); flex-shrink: 0; }

/* Plans */
.boost-plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.boost-plan {
  position: relative; border: 2px solid var(--color-border);
  border-radius: 14px; padding: 14px 12px; cursor: pointer;
  text-align: center; transition: all 0.2s; background: var(--color-surface-2);
}
.boost-plan:hover { border-color: var(--color-primary); }
.boost-plan.selected {
  border-color: var(--color-primary);
  background: rgba(108,99,255,0.08);
}
.boost-plan.popular { border-color: rgba(247,183,49,0.5); }
.boost-plan.popular.selected { border-color: var(--color-primary); }

.plan-popular-badge {
  position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
  background: #F7B731; color: #000; font-size: 0.65rem; font-weight: 700;
  padding: 2px 8px; border-radius: 10px; white-space: nowrap;
}
.plan-duration { font-size: 1rem; font-weight: 800; color: var(--color-text); }
.plan-price { font-size: 0.95rem; font-weight: 700; color: var(--color-primary); margin-top: 4px; }
.plan-currency { font-size: 0.65rem; color: var(--color-text-2); }
.plan-per-day { font-size: 0.7rem; color: var(--color-muted); margin-top: 4px; }
.plan-check {
  position: absolute; top: 8px; right: 8px; color: var(--color-primary);
}

/* Payment */
.payment-section { display: flex; flex-direction: column; gap: 10px; }
.review-label { font-size: 0.85rem; font-weight: 600; color: var(--color-text-2); }
.payment-methods { display: flex; gap: 8px; }
.payment-method-btn {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 10px 8px; border-radius: 12px;
  border: 2px solid var(--color-border); background: var(--color-surface-2);
  cursor: pointer; transition: all 0.2s;
}
.payment-method-btn.active { border-color: var(--color-primary); background: rgba(108,99,255,0.08); }
.method-icon { font-size: 1.2rem; }
.method-name { font-size: 0.75rem; font-weight: 600; color: var(--color-text-2); }
.payment-method-btn.active .method-name { color: var(--color-primary); }

/* Summary */
.boost-summary {
  background: var(--color-surface-2); border-radius: 12px; padding: 14px;
  display: flex; flex-direction: column; gap: 8px;
}
.summary-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.875rem; color: var(--color-text-2);
}
.summary-row strong { color: var(--color-text); }
.summary-price { color: var(--color-primary) !important; font-size: 1rem; }

/* Actions */
.boost-actions { display: flex; gap: 10px; }
.btn-cancel-boost {
  flex: 1; padding: 11px; background: transparent;
  border: 1px solid var(--color-border); color: var(--color-text-2);
  border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-cancel-boost:hover { border-color: var(--color-primary); color: var(--color-primary); }
.btn-boost-now {
  flex: 2; padding: 11px 20px;
  background: linear-gradient(135deg, #F7B731, #FF6B6B);
  border: none; color: #fff; border-radius: 12px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.2s; box-shadow: 0 4px 14px rgba(247,183,49,0.35);
}
.btn-boost-now:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-boost-now:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(247,183,49,0.5); }

/* Transition */
.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .boost-modal, .modal-fade-leave-to .boost-modal { transform: scale(0.95) translateY(10px); }
</style>
