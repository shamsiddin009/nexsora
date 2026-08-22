<template>
  <div class="pricing-page">
    <div class="container">
      
      <!-- HERO HEADER -->
      <section class="pricing-hero">
        <div class="badge badge-primary hero-pill">
          <Sparkles :size="14" />
          <span>Tariflar va Obunalar</span>
        </div>
        
        <h1 class="pricing-title">
          Daromadingizni Oshiring va <span class="hero-gradient">Kafolatlangan Imtiyozlarga</span> Ega Bo'ling
        </h1>
        
        <p class="pricing-subtitle">
          O'zingizga mos tarifni tanlang, VIP mijozlar oqimini jalb qiling va har bir bitimda komissiyani tejang.
        </p>

        <!-- AUDIENCE SELECTOR (Usta vs Mijoz) -->
        <div class="audience-tabs">
          <button 
            :class="['audience-btn', { active: targetRole === 'craftsman' }]"
            @click="targetRole = 'craftsman'"
          >
            <Wrench :size="18" />
            <span>Ustalar & Jamoalar uchun</span>
          </button>
          <button 
            :class="['audience-btn', { active: targetRole === 'client' }]"
            @click="targetRole = 'client'"
          >
            <Building2 :size="18" />
            <span>Mijozlar & Qurilish Biznesi</span>
          </button>
        </div>

        <!-- BILLING CYCLE TOGGLE -->
        <div class="billing-toggle-wrapper">
          <span :class="['billing-label', { active: billingCycle === 'monthly' }]">Oylik to'lov</span>
          <button class="toggle-switch" @click="toggleBilling" :class="{ yearly: billingCycle === 'yearly' }">
            <div class="toggle-thumb"></div>
          </button>
          <span :class="['billing-label', { active: billingCycle === 'yearly' }]">
            Yillik to'lov
            <span class="discount-badge">-20% chegirma</span>
          </span>
        </div>
      </section>

      <!-- PRICING CARDS GRID -->
      <div class="pricing-grid">
        <div 
          v-for="plan in currentPlanList" 
          :key="plan.id"
          :class="['pricing-card', 'card', { 'popular-card': plan.popular }]"
        >
          <div v-if="plan.popular" class="popular-ribbon">
            <Zap :size="13" />
            <span>{{ plan.badge }}</span>
          </div>

          <div class="plan-header">
            <h3 class="plan-name">{{ plan.name }}</h3>
            <div class="plan-price-box">
              <div class="price-val">
                <span class="currency-symbol">{{ currency === 'UZS' ? '' : '$' }}</span>
                <span class="amount">{{ formatPriceValue(plan) }}</span>
                <span v-if="currency === 'UZS' && getPrice(plan) > 0" class="currency-code"> so'm</span>
              </div>
              <span class="billing-text">
                {{ getPrice(plan) === 0 ? 'butunlay bepul' : (billingCycle === 'yearly' ? '/ yiliga' : '/ oyiga') }}
              </span>
            </div>
          </div>

          <div class="plan-divider"></div>

          <!-- Feature List -->
          <ul class="features-list">
            <li v-for="(feat, idx) in plan.features" :key="idx">
              <CheckCircle2 :size="17" class="feat-icon text-success" />
              <span>{{ feat }}</span>
            </li>
          </ul>

          <button 
            :class="['btn', 'w-full', plan.popular ? 'btn-primary' : 'btn-secondary']"
            @click="openCheckout(plan)"
          >
            <span>{{ subscriptionStore.currentPlan === plan.id ? 'Joriy Tarif' : 'Tanlash va To\'lash' }}</span>
            <ArrowRight :size="16" />
          </button>
        </div>
      </div>

      <!-- ROI & SAVINGS CALCULATOR (Ustalar uchun) -->
      <section v-if="targetRole === 'craftsman'" class="roi-section card">
        <div class="roi-header">
          <div class="roi-badge">
            <Calculator :size="18" />
            <span>Daromad & Tejash Kalkulyatori</span>
          </div>
          <h2>Pro Tarif Sizga Qancha Daromad Keltiradi?</h2>
          <p>O'zingizning oylik ko'rsatkichlaringizni kiriting va Pro tarifdagi sof tejamkorlikni hisoblang</p>
        </div>

        <div class="roi-grid">
          <div class="roi-controls">
            <!-- Slider 1 -->
            <div class="slider-group">
              <div class="slider-labels">
                <label>Oylik Bajariladigan Buyurtmalar Soni:</label>
                <strong class="slider-val">{{ monthlyJobsCount }} ta</strong>
              </div>
              <input 
                v-model.number="monthlyJobsCount" 
                type="range" 
                min="1" 
                max="30" 
                step="1" 
                class="range-slider"
              />
            </div>

            <!-- Slider 2 -->
            <div class="slider-group">
              <div class="slider-labels">
                <label>Bitta Buyurtmaning O'rtacha Qiymati:</label>
                <strong class="slider-val">{{ formatNumber(avgJobValue) }} so'm</strong>
              </div>
              <input 
                v-model.number="avgJobValue" 
                type="range" 
                min="100000" 
                max="5000000" 
                step="50000" 
                class="range-slider"
              />
            </div>
          </div>

          <!-- Result Card -->
          <div class="roi-result-box">
            <div class="roi-stat">
              <span class="stat-label">Jami Oylik Oborot:</span>
              <strong class="stat-num">{{ formatNumber(totalMonthlyTurnover) }} so'm</strong>
            </div>
            <div class="roi-stat-highlight">
              <span class="stat-label">Pro Tarifda Escrow Komissiyasidan Sof Tejov:</span>
              <strong class="stat-savings">+{{ formatNumber(monthlyCommissionSavings) }} so'm / oyiga</strong>
            </div>
            <p class="roi-note">
              <Lightbulb :size="15" class="inline-icon" /> Pro Usta tarifi narxi (189 000 so'm) atigi bir nechta buyurtmada o'zini <strong>{{ roiMultiple }} barobar</strong> oqlaydi!
            </p>
          </div>
        </div>
      </section>

      <!-- A LA CARTE ADD-ON BOOSTS -->
      <section class="addons-section">
        <div class="section-header text-center">
          <span class="section-tag">Tezkor Natijalar</span>
          <h2>Alohida Mikro-Xizmatlar & E'lonni Ko'tarish (Boost)</h2>
          <p>Obuna bo'lmasdan ham e'loningizni bir lahzada eng yuqoriga chiqaring</p>
        </div>

        <div class="addons-grid">
          <div 
            v-for="addon in subscriptionStore.addOns" 
            :key="addon.id"
            class="addon-card card"
          >
            <div class="addon-info">
              <h4 class="addon-title">
                <Rocket v-if="addon.id === 'boost_top_3d'" :size="18" class="addon-icon-svg" />
                <Bot v-else-if="addon.id === 'boost_telegram'" :size="18" class="addon-icon-svg" />
                <Zap v-else-if="addon.id === 'boost_urgent'" :size="18" class="addon-icon-svg" />
                <ShieldCheck v-else :size="18" class="addon-icon-svg" />
                <span>{{ addon.name }}</span>
              </h4>
              <p class="addon-desc">{{ addon.desc }}</p>
            </div>
            <div class="addon-action">
              <div class="addon-price">
                <strong>{{ formatNumber(addon.priceUzs) }}</strong>
                <span>so'm</span>
              </div>
              <button 
                class="btn btn-primary btn-sm"
                @click="buyAddon(addon)"
              >
                <span>Xarid qilish</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- TRUST & GUARANTEE BANNER -->
      <div class="guarantee-card card">
        <div class="guarantee-icon-box">
          <ShieldCheck :size="36" class="text-success" />
        </div>
        <div class="guarantee-text">
          <h3>100% Xavfsizlik va Kafolatlangan Natija</h3>
          <p>
            Platformadagi barcha to'lovlar Click, Payme va Uzum Bank orqali xavfsiz amalga oshiriladi. 
            Agar tarif sizga to'g'ri kelmasa, dastlabki 7 kun ichida to'liq pulingiz qaytarib beriladi.
          </p>
        </div>
      </div>

    </div>

    <!-- INTERACTIVE CHECKOUT MODAL -->
    <div v-if="checkoutModalOpen" class="checkout-overlay" @click.self="checkoutModalOpen = false">
      <div class="checkout-modal card">
        <div class="modal-head">
          <h3>To'lovni Amalga Oshirish</h3>
          <button class="close-modal-btn" @click="checkoutModalOpen = false">
            <X :size="18" />
          </button>
        </div>

        <div class="modal-content">
          <div class="selected-item-box">
            <div class="item-details">
              <strong>{{ selectedItem?.name }}</strong>
              <span class="text-muted">{{ billingCycle === 'yearly' ? 'Yillik Obuna (20% chegirma)' : 'Oylik Obuna' }}</span>
            </div>
            <div class="item-price">
              <strong>{{ formatNumber(selectedItemPrice) }} so'm</strong>
            </div>
          </div>

          <label class="form-label">To'lov usulini tanlang:</label>
          <div class="payment-methods-grid">
            <button 
              :class="['pay-method-btn', { active: paymentMethod === 'wallet' }]"
              @click="paymentMethod = 'wallet'"
            >
              <span class="pay-name">Hamyon</span>
              <span class="pay-tag">{{ walletStore.balanceFormatted }} so'm</span>
            </button>
            <button 
              :class="['pay-method-btn', { active: paymentMethod === 'click' }]"
              @click="paymentMethod = 'click'"
            >
              <span class="pay-name">Click Up</span>
              <span class="pay-tag">Ilova orqali</span>
            </button>
            <button 
              :class="['pay-method-btn', { active: paymentMethod === 'payme' }]"
              @click="paymentMethod = 'payme'"
            >
              <span class="pay-name">Payme</span>
              <span class="pay-tag">Avto-to'lov</span>
            </button>
            <button 
              :class="['pay-method-btn', { active: paymentMethod === 'uzum' }]"
              @click="paymentMethod = 'uzum'"
            >
              <span class="pay-name">Uzum Bank</span>
              <span class="pay-tag">Keshbek</span>
            </button>
          </div>

          <button 
            class="btn btn-primary btn-lg w-full pay-confirm-btn"
            :disabled="processingPayment"
            @click="confirmPayment"
          >
            <Lock :size="16" />
            <span>{{ processingPayment ? 'To\'lov tekshirilmoqda...' : `${formatNumber(selectedItemPrice)} so'm To'lash` }}</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Sparkles, Wrench, Building2, CheckCircle2, Zap, 
  ArrowRight, Calculator, ShieldCheck, Lock, X, Lightbulb, Rocket, Bot
} from 'lucide-vue-next'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import { useWalletStore } from '../stores/walletStore'
import { paymentService } from '../services/paymentService'
import { useToast } from '../composables/useToast'

const router = useRouter()
const subscriptionStore = useSubscriptionStore()
const walletStore = useWalletStore()
const toast = useToast()

const targetRole = ref('craftsman')
const billingCycle = ref('monthly')
const currency = ref('UZS')

// Calculator state
const monthlyJobsCount = ref(8)
const avgJobValue = ref(600000)

// Checkout Modal
const checkoutModalOpen = ref(false)
const selectedItem = ref(null)
const paymentMethod = ref('wallet')
const processingPayment = ref(false)

const currentPlanList = computed(() => {
  return targetRole.value === 'craftsman' 
    ? subscriptionStore.craftsmanPlans 
    : subscriptionStore.clientPlans
})

function toggleBilling() {
  billingCycle.value = billingCycle.value === 'monthly' ? 'yearly' : 'monthly'
}

function getPrice(plan) {
  if (billingCycle.value === 'yearly') {
    // 20% discount on 12 months (i.e. price * 12 * 0.8)
    return Math.round(plan.priceUzsMonthly * 12 * 0.8)
  }
  return plan.priceUzsMonthly
}

function formatPriceValue(plan) {
  const price = getPrice(plan)
  if (price === 0) return '0'
  return new Intl.NumberFormat('uz-UZ').format(price)
}

function formatNumber(val) {
  return new Intl.NumberFormat('uz-UZ').format(val || 0)
}

// ROI calculations
const totalMonthlyTurnover = computed(() => {
  return monthlyJobsCount.value * avgJobValue.value
})

const monthlyCommissionSavings = computed(() => {
  // Free tier is 5% commission, Pro is 3% commission -> 2% net savings
  return Math.round(totalMonthlyTurnover.value * 0.02)
})

const roiMultiple = computed(() => {
  const proCost = 189000
  const ratio = (monthlyCommissionSavings.value / proCost).toFixed(1)
  return Math.max(1, parseFloat(ratio))
})

// Checkout Handlers
const selectedItemPrice = computed(() => {
  if (!selectedItem.value) return 0
  if (selectedItem.value.priceUzs) {
    return selectedItem.value.priceUzs
  }
  return getPrice(selectedItem.value)
})

function openCheckout(plan) {
  if (getPrice(plan) === 0) {
    subscriptionStore.selectPlan(plan.id)
    toast.success('Tarif Tanlandi', `${plan.name} muvaffaqiyatli faollashtirildi!`)
    return
  }
  selectedItem.value = plan
  paymentMethod.value = walletStore.balance >= selectedItemPrice.value ? 'wallet' : 'click'
  checkoutModalOpen.value = true
}

function buyAddon(addon) {
  selectedItem.value = addon
  paymentMethod.value = walletStore.balance >= (addon.priceUzs || 0) ? 'wallet' : 'click'
  checkoutModalOpen.value = true
}

async function confirmPayment() {
  processingPayment.value = true
  const price = selectedItemPrice.value
  const title = selectedItem.value?.name || "Nexsora Xizmati"
  
  try {
    if (paymentMethod.value === 'wallet') {
      const res = walletStore.payFromWallet(price, title, selectedItem.value?.priceUzs ? 'boost' : 'subscription')
      if (!res.success) {
        toast.error("Mablag' yetarli emas", "Iltimos, avval hamyoningizni Click yoki Payme orqali to'ldiring.")
        processingPayment.value = false
        return
      }
    } else {
      const res = await paymentService.processPayment({
        provider: paymentMethod.value,
        amount: price,
        title
      })
      if (res.redirectUrl) {
        window.open(res.redirectUrl, '_blank')
      }
    }

    checkoutModalOpen.value = false
    
    if (selectedItem.value?.priceUzs) {
      subscriptionStore.buyBoost(selectedItem.value.id)
      toast.success('Xarid Muvaffaqiyatli!', `${title} darhol faollashtirildi.`)
    } else {
      subscriptionStore.selectPlan(selectedItem.value.id)
      toast.success('Tabriklaymiz!', `${title} tarifi muvaffaqiyatli yoqildi.`)
    }
  } catch (e) {
    toast.error("Xatolik", "To'lovni amalga oshirishda xatolik yuz berdi")
  } finally {
    processingPayment.value = false
  }
}
</script>

<style scoped>
.pricing-page {
  padding: 48px 0 100px;
  background: var(--color-bg);
  min-height: 100vh;
}

.pricing-hero {
  max-width: 820px;
  margin: 0 auto 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  padding-top: 16px;
}

.hero-pill {
  padding: 6px 16px;
  font-size: 0.82rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.pricing-title {
  font-size: clamp(2.2rem, 4.8vw, 3.2rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.5px;
  color: var(--color-text);
  margin: 0;
  text-align: center;
  max-width: 800px;
}

.hero-gradient {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.pricing-subtitle {
  font-size: 1.1rem;
  color: var(--color-text-2);
  max-width: 620px;
  line-height: 1.6;
  margin: 0 auto;
  text-align: center;
}

/* Audience Switcher */
.audience-tabs {
  display: inline-flex;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 4px;
  margin-top: 8px;
  gap: 4px;
}

.audience-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-2);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.audience-btn:hover {
  color: var(--color-text);
}

.audience-btn.active {
  background: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-sm);
}

/* Billing Toggle */
.billing-toggle-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 4px;
}

.billing-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-muted);
  display: flex;
  align-items: center;
  gap: 8px;
}

.billing-label.active {
  color: var(--color-text);
}

.toggle-switch {
  width: 48px;
  height: 26px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 2px;
  cursor: pointer;
  position: relative;
  transition: background var(--transition-fast);
}

.toggle-switch.yearly {
  background: var(--color-primary);
}

.toggle-thumb {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform var(--transition-fast);
}

.toggle-switch.yearly .toggle-thumb {
  transform: translateX(22px);
}

.discount-badge {
  background: rgba(67, 233, 123, 0.15);
  color: var(--color-success);
  border: 1px solid rgba(67, 233, 123, 0.3);
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 700;
}

/* Pricing Grid */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 28px;
  margin-bottom: 72px;
}

.pricing-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 36px 32px;
  border-radius: 24px;
  transition: all var(--transition-base);
}

.pricing-card:hover {
  transform: translateY(-6px);
  border-color: rgba(108, 99, 255, 0.35);
  box-shadow: var(--shadow-lg), var(--shadow-glow-sm);
}

.popular-card {
  border-color: var(--color-primary);
  background: linear-gradient(180deg, rgba(108, 99, 255, 0.08) 0%, var(--color-card) 40%);
  box-shadow: 0 12px 36px rgba(108, 99, 255, 0.15);
}

.popular-ribbon {
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--gradient-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 4px 14px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(108, 99, 255, 0.4);
}

.plan-name {
  font-size: 1.35rem;
  margin-bottom: 14px;
}

.plan-price-box {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price-val {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.currency-symbol, .currency-code {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-2);
}

.amount {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-text);
  font-family: var(--font-display);
}

.billing-text {
  font-size: 0.85rem;
  color: var(--color-muted);
}

.plan-divider {
  height: 1px;
  background: var(--color-border);
  margin: 24px 0;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}

.features-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.9rem;
  color: var(--color-text-2);
  line-height: 1.45;
}

.feat-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

/* ROI Section */
.roi-section {
  padding: 48px;
  margin-bottom: 72px;
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(108, 99, 255, 0.05) 0%, rgba(67, 233, 123, 0.05) 100%), var(--color-card);
}

.roi-header {
  text-align: center;
  max-width: 620px;
  margin: 0 auto 36px;
}

.roi-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 999px;
  background: rgba(67, 233, 123, 0.12);
  color: var(--color-success);
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.roi-header h2 {
  font-size: 1.8rem;
  margin-bottom: 8px;
}

.roi-header p {
  color: var(--color-text-2);
  font-size: 0.95rem;
}

.roi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.roi-controls {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.92rem;
}

.slider-labels label {
  color: var(--color-text-2);
}

.slider-val {
  color: var(--color-primary-light);
  font-size: 1.05rem;
}

.range-slider {
  width: 100%;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.roi-result-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 28px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.roi-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  color: var(--color-text-2);
}

.roi-stat-highlight {
  background: rgba(67, 233, 123, 0.1);
  border: 1px solid rgba(67, 233, 123, 0.25);
  padding: 16px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-savings {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--color-success);
}

.roi-note {
  font-size: 0.85rem;
  color: var(--color-text-2);
  margin: 0;
  line-height: 1.5;
}

/* Addons Section */
.addons-section {
  margin-bottom: 72px;
}

.addons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.addon-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
}

.addon-title {
  font-size: 1.05rem;
  margin-bottom: 8px;
}

.addon-desc {
  font-size: 0.85rem;
  color: var(--color-text-2);
  line-height: 1.5;
  margin: 0;
}

.addon-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
}

.addon-price strong {
  font-size: 1.15rem;
  color: var(--color-text);
}

.addon-price span {
  font-size: 0.8rem;
  color: var(--color-muted);
  margin-left: 3px;
}

/* Guarantee Card */
.guarantee-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px 40px;
  background: var(--color-surface);
}

.guarantee-text h3 {
  font-size: 1.2rem;
  margin-bottom: 6px;
}

.guarantee-text p {
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.6;
}

/* Checkout Modal */
.checkout-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 15, 0.75);
  backdrop-filter: blur(8px);
  z-index: 2500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.checkout-modal {
  width: 100%;
  max-width: 460px;
  padding: 28px;
  border-radius: 24px;
  background: var(--color-surface);
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal-head h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-modal-btn {
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
}

.selected-item-box {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  padding: 16px;
  border-radius: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-price strong {
  font-size: 1.15rem;
  color: var(--color-primary-light);
}

.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 10px 0 24px 0;
}

.pay-method-btn {
  padding: 14px 10px;
  border-radius: 12px;
  background: var(--color-surface-2);
  border: 2px solid var(--color-border);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pay-method-btn:hover {
  border-color: var(--color-primary-light);
}

.pay-method-btn.active {
  border-color: var(--color-primary);
  background: rgba(108, 99, 255, 0.12);
}

.pay-name {
  font-weight: 700;
  font-size: 0.9rem;
}

.pay-tag {
  font-size: 0.68rem;
  color: var(--color-muted);
}

.pay-confirm-btn {
  border-radius: 14px;
  padding: 16px;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .pricing-hero {
    gap: 16px;
  }
  .pricing-title {
    font-size: 1.8rem;
  }
  .audience-tabs {
    flex-direction: column;
    border-radius: 16px;
    width: 100%;
  }
  .audience-btn {
    width: 100%;
    justify-content: center;
  }
  .roi-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .roi-section {
    padding: 28px 20px;
  }
  .guarantee-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
