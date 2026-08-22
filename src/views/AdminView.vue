<template>
  <div class="admin-page">
    <div class="container-fluid admin-container">
      
      <!-- ADMIN TOP HEADER BAR -->
      <header class="admin-header-card card">
        <div class="header-glow-effect"></div>
        <div class="admin-header-left">
          <div class="admin-badge-icon">
            <ShieldCheck :size="26" />
          </div>
          <div>
            <div class="admin-title-row">
              <h1 class="admin-title">Nexsora Super Admin & CRM</h1>
              <span class="badge badge-primary enterprise-badge">v2.5 Enterprise</span>
            </div>
            <p class="admin-subtitle">Platforma moliyasi, Ustalarni tasdiqlash, Escrow arbitraj va foydalanuvchilar boshqaruvi</p>
          </div>
        </div>

        <div class="admin-header-right">
          <div class="admin-live-pulse">
            <span class="pulse-dot"></span>
            <span>Real-time Tizim Faol</span>
          </div>
          <button class="btn btn-secondary btn-sm refresh-btn" @click="refreshData" :disabled="refreshing">
            <RotateCcw :size="14" :class="{ 'animate-spin': refreshing }" />
            <span>{{ refreshing ? 'Yangilanmoqda...' : 'Ma\'lumotlarni yangilash' }}</span>
          </button>
        </div>
      </header>

      <!-- NAVIGATION TABS -->
      <nav class="admin-nav-tabs">
        <button
          class="admin-tab-btn"
          :class="{ active: activeTab === 'overview' }"
          @click="activeTab = 'overview'"
        >
          <LayoutDashboard :size="16" />
          <span>Analitika & Moliya</span>
        </button>
        <button
          class="admin-tab-btn"
          :class="{ active: activeTab === 'disputes' }"
          @click="activeTab = 'disputes'"
        >
          <Scale :size="16" />
          <span>Escrow Arbitraj & Nizolar</span>
          <span v-if="pendingDisputesCount > 0" class="tab-badge badge-warning">{{ pendingDisputesCount }}</span>
        </button>
        <button
          class="admin-tab-btn"
          :class="{ active: activeTab === 'verifications' }"
          @click="activeTab = 'verifications'"
        >
          <BadgeCheck :size="16" />
          <span>Ustalarni Tasdiqlash (KYC)</span>
          <span v-if="pendingVerificationsCount > 0" class="tab-badge badge-info">{{ pendingVerificationsCount }}</span>
        </button>
        <button
          class="admin-tab-btn"
          :class="{ active: activeTab === 'users' }"
          @click="activeTab = 'users'"
        >
          <Users :size="16" />
          <span>Foydalanuvchilar CRM</span>
        </button>
        <button
          class="admin-tab-btn"
          :class="{ active: activeTab === 'payouts' }"
          @click="activeTab = 'payouts'"
        >
          <CreditCard :size="16" />
          <span>Tranzaksiyalar & Pul Yechish</span>
          <span v-if="pendingPayoutsCount > 0" class="tab-badge badge-success">{{ pendingPayoutsCount }}</span>
        </button>
      </nav>

      <!-- TAB 1: EXECUTIVE KPI OVERVIEW -->
      <AdminOverviewTab
        v-if="activeTab === 'overview'"
        :stats="stats"
        :monthly-chart-data="monthlyChartData"
      />

      <!-- TAB 2: ESCROW ARBITRATION & DISPUTES -->
      <AdminDisputesTab
        v-if="activeTab === 'disputes'"
        :disputes-list="disputesList"
        @resolve-dispute="resolveDispute"
      />

      <!-- TAB 3: CRAFTSMEN VERIFICATIONS (KYC) -->
      <AdminVerificationsTab
        v-if="activeTab === 'verifications'"
        :verifications-list="verificationsList"
        @approve-craftsman="approveCraftsman"
        @revoke-craftsman="revokeCraftsman"
      />

      <!-- TAB 4: USERS CRM TABLE -->
      <AdminUsersTab
        v-if="activeTab === 'users'"
        :users="filteredUsers"
        v-model:search-query="userSearchQuery"
        v-model:role-filter="userRoleFilter"
        @open-balance-modal="openBalanceModal"
        @toggle-block-user="toggleBlockUser"
      />

      <!-- TAB 5: TRANSACTIONS & PAYOUTS -->
      <AdminPayoutsTab
        v-if="activeTab === 'payouts'"
        :payouts-list="payoutsList"
        @approve-payout="approvePayout"
      />

    </div>

    <!-- MODAL: MANUAL BALANCE TOP-UP -->
    <div v-if="showBalanceModal" class="modal-overlay" @click.self="showBalanceModal = false">
      <div class="modal-card card">
        <div class="modal-header">
          <h3>💰 Balansni To'ldirish</h3>
          <button class="close-btn" @click="showBalanceModal = false"><X :size="18" /></button>
        </div>
        <div class="modal-body">
          <p class="modal-info-text">Foydalanuvchi: <strong>{{ selectedUser?.full_name }}</strong></p>
          <p class="modal-info-text">Hozirgi balans: <strong>{{ formatPrice(selectedUser?.balance || 0) }}</strong></p>
          
          <div class="form-group mt-3">
            <label class="input-label">Qo'shiladigan summa (UZS):</label>
            <input v-model.number="topUpAmount" type="number" step="10000" class="input input-clean" placeholder="Masalan: 500000" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showBalanceModal = false">Bekor qilish</button>
          <button class="btn btn-primary" @click="confirmTopUp">Tasdiqlash & Qo'shish</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import { supabase } from '../services/supabase'
import { formatPrice } from '../utils'

// Admin Subcomponents
import AdminOverviewTab from '../components/admin/AdminOverviewTab.vue'
import AdminDisputesTab from '../components/admin/AdminDisputesTab.vue'
import AdminVerificationsTab from '../components/admin/AdminVerificationsTab.vue'
import AdminUsersTab from '../components/admin/AdminUsersTab.vue'
import AdminPayoutsTab from '../components/admin/AdminPayoutsTab.vue'

import {
  ShieldCheck, LayoutDashboard, Scale, BadgeCheck, Users,
  CreditCard, RotateCcw, X
} from 'lucide-vue-next'

const authStore = useAuthStore()
const toast = useToast()

const activeTab = ref('overview')
const refreshing = ref(false)

// Executive Stats
const stats = ref({
  totalGmv: 184500000,
  netRevenue: 24650000,
  escrowLocked: 12800000,
  activeEscrowJobs: 14,
  proUsersCount: 38,
  mrr: 7560000,
  totalUsers: 1420,
  totalCraftsmen: 480,
  totalClients: 940,
  completedJobs: 892
})

// Monthly Revenue Bars Data
const monthlyChartData = ref([
  { month: 'Yan', amount: 8500000, percentage: 35 },
  { month: 'Fev', amount: 11200000, percentage: 48 },
  { month: 'Mar', amount: 14800000, percentage: 62 },
  { month: 'Apr', amount: 18400000, percentage: 76 },
  { month: 'May', amount: 21500000, percentage: 88 },
  { month: 'Iyun', amount: 24650000, percentage: 100 },
])

// Disputes / Arbitration List
const disputesList = ref([
  {
    id: 'DSP-8492',
    chatId: 'demo-chat-1',
    jobTitle: "Konditsioner montaj qilish va freon quyish",
    amount: 650000,
    clientName: "Alisher Vohidov",
    clientComplaint: "Usta kelib konditsionerni o'rnatdi, lekin trubadan suv oqmoqda va sovitmayapti. Qayta kelishdan bosh tortyapti.",
    craftsmanName: "Jamshid Usta (Santexnik-Sovutgich)",
    craftsmanRating: 4.9,
    craftsmanDefense: "Mijozning elektr ta'minotida past kuchlanish bor, kompressor shuning uchun o'chyapti. O'rnatish ishlari sifatli qilingan.",
    resolved: false
  },
  {
    id: 'DSP-8495',
    chatId: 'demo-chat-2',
    jobTitle: "Oshxona mebelini yig'ish va furnitura o'rnatish",
    amount: 1200000,
    clientName: "Shahnoza Karimova",
    clientComplaint: "Eshikchalari qiyshiq o'rnatilgan, bitta ruchkasi yetishmayapti.",
    craftsmanName: "Botir Mebelchi",
    craftsmanRating: 4.7,
    craftsmanDefense: "Ruchka zavoddan kam chiqqan, bugun kechki payt olib kelib to'g'irlab berishga kelishgandik.",
    resolved: false
  }
])

const pendingDisputesCount = computed(() => disputesList.value.filter(d => !d.resolved).length)

// Craftsmen Verifications (KYC)
const verificationsList = ref([
  {
    id: 'craftsman-1',
    name: 'Rustam Qodirov',
    category: 'Elektromontaj & Avtomatika',
    experience: 8,
    phone: '+998 90 123 45 67',
    city: 'Toshkent sh.',
    is_verified: false,
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'craftsman-2',
    name: 'Dilshod Normatov',
    category: 'Santexnika & Isitish tizimlari',
    experience: 12,
    phone: '+998 93 456 78 90',
    city: 'Samarqand sh.',
    is_verified: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'craftsman-3',
    name: 'Anvar Zokirov',
    category: 'Mebel yasash & Ta\'mirlash',
    experience: 6,
    phone: '+998 97 111 22 33',
    city: 'Buxoro sh.',
    is_verified: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
])

const pendingVerificationsCount = computed(() => verificationsList.value.filter(c => !c.is_verified).length)

// Users CRM Data
const usersList = ref([
  { id: 'usr-1', full_name: 'Rustam Qodirov', role: 'craftsman', phone: '+998 90 123 45 67', subscription_plan: 'pro', balance: 1450000, is_blocked: false },
  { id: 'usr-2', full_name: 'Alisher Vohidov', role: 'client', phone: '+998 93 987 65 43', subscription_plan: 'free', balance: 350000, is_blocked: false },
  { id: 'usr-3', full_name: 'Dilshod Normatov', role: 'craftsman', phone: '+998 93 456 78 90', subscription_plan: 'brigade', balance: 2800000, is_blocked: false },
  { id: 'usr-4', full_name: 'Shahnoza Karimova', role: 'client', phone: '+998 90 555 44 33', subscription_plan: 'free', balance: 0, is_blocked: false },
  { id: 'usr-5', full_name: 'Shavkat Murodov', role: 'craftsman', phone: '+998 99 777 88 99', subscription_plan: 'free', balance: 120000, is_blocked: true },
])

const userSearchQuery = ref('')
const userRoleFilter = ref('all')

const filteredUsers = computed(() => {
  return usersList.value.filter(u => {
    const matchesSearch = !userSearchQuery.value ||
      u.full_name?.toLowerCase().includes(userSearchQuery.value.toLowerCase()) ||
      u.phone?.includes(userSearchQuery.value)
    const matchesRole = userRoleFilter.value === 'all' || u.role === userRoleFilter.value
    return matchesSearch && matchesRole
  })
})

// Payouts List
const payoutsList = ref([
  { id: 'pay-1', craftsmanName: 'Rustam Qodirov', phone: '+998 90 123 45 67', cardNumber: '8600 •••• •••• 4591', cardHolder: 'RUSTAM QODIROV (Uzcard)', amount: 1200000, status: 'pending', date: '2026-08-19 14:32' },
  { id: 'pay-2', craftsmanName: 'Dilshod Normatov', phone: '+998 93 456 78 90', cardNumber: '9860 •••• •••• 1120', cardHolder: 'DILSHOD NORMATOV (Humo)', amount: 2500000, status: 'completed', date: '2026-08-18 10:15' },
])

const pendingPayoutsCount = computed(() => payoutsList.value.filter(p => p.status === 'pending').length)

// Modal State
const showBalanceModal = ref(false)
const selectedUser = ref(null)
const topUpAmount = ref(100000)

function openBalanceModal(user) {
  selectedUser.value = user
  topUpAmount.value = 100000
  showBalanceModal.value = true
}

function confirmTopUp() {
  if (!selectedUser.value || topUpAmount.value <= 0) return
  selectedUser.value.balance = (selectedUser.value.balance || 0) + topUpAmount.value
  showBalanceModal.value = false
  toast.success("Balans to'ldirildi", `${selectedUser.value.full_name} hisobiga +${formatPrice(topUpAmount.value)} qo'shildi! 💳`)
}

function toggleBlockUser(user) {
  user.is_blocked = !user.is_blocked
  if (user.is_blocked) {
    toast.error("Foydalanuvchi bloklandi", `${user.full_name} tizimdan vaqtincha chetlatildi! 🚫`)
  } else {
    toast.success("Blokdan chiqarildi", `${user.full_name} hisobi qayta faollashtirildi! 🟢`)
  }
}

function resolveDispute(disp, verdict) {
  disp.resolved = true
  if (verdict === 'release_craftsman') {
    toast.success("Hukm chiqarildi", `Mablag' (${formatPrice(disp.amount)}) to'liq ustaga o'tkazildi! 🔨`)
  } else if (verdict === 'refund_client') {
    toast.info("Hukm chiqarildi", `Mablag' (${formatPrice(disp.amount)}) mijoz hamyoniga qaytarildi! 💰`)
  } else {
    toast.warning("Hukm chiqarildi", `Mablag' 50/50 teng taqsimlandi! ⚖️`)
  }
}

function approveCraftsman(craftsman) {
  craftsman.is_verified = true
  toast.success("Usta tasdiqlandi", `${craftsman.name}ga Tasdiqlangan Ko'k Nishon berildi! 🏅`)
}

function revokeCraftsman(craftsman) {
  craftsman.is_verified = false
  toast.info("Tasdiq bekor qilindi", `${craftsman.name}ning tasdiqlangan maqomi olib tashlandi.`)
}

function approvePayout(p) {
  p.status = 'completed'
  toast.success("To'lov tasdiqlandi", `${p.craftsmanName} hisobiga ${formatPrice(p.amount)} muvaffaqiyatli chiqarildi! 💳`)
}

async function refreshData() {
  refreshing.value = true
  try {
    const { data: profiles } = await supabase.from('profiles').select('*').limit(30)
    if (profiles && profiles.length > 0) {
      usersList.value = profiles.map(p => ({
        id: p.id,
        full_name: p.full_name || 'Foydalanuvchi',
        role: p.role || 'client',
        phone: p.phone || '',
        subscription_plan: p.subscription_plan || 'free',
        balance: p.balance || 0,
        is_blocked: false
      }))
    }
  } catch (e) {}
  setTimeout(() => {
    refreshing.value = false
    toast.success("Yangilandi", "Barcha ma'lumotlar real vaqt rejimida yangilandi! ⚡")
  }, 400)
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.admin-page {
  background: var(--color-bg);
  min-height: calc(100vh - 68px);
  padding: 32px 0 80px;
}

.admin-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* HEADER CARD */
.admin-header-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 12%, var(--color-surface)), var(--color-surface));
  border: 1px solid color-mix(in srgb, var(--color-primary) 25%, var(--color-border));
  border-radius: 24px;
  padding: 30px 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  box-shadow: var(--shadow-md);
}

.header-glow-effect {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, rgba(108, 99, 255, 0.2) 0%, transparent 70%);
  pointer-events: none;
}

.admin-header-left {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 2;
}

.admin-badge-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px rgba(108, 99, 255, 0.35);
  flex-shrink: 0;
}

.admin-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.admin-title {
  font-size: 1.7rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin: 0;
}

.enterprise-badge {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.admin-subtitle {
  font-size: 0.92rem;
  color: var(--color-text-2);
  margin: 4px 0 0;
}

.admin-header-right {
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  z-index: 2;
  flex-wrap: wrap;
}

.admin-live-pulse {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #10B981;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
  animation: pulse 1.8s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
  70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.refresh-btn {
  padding: 8px 18px;
  border-radius: 12px;
  font-weight: 600;
}

/* NAV TABS */
.admin-nav-tabs {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 2px;
}

.admin-tab-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  color: var(--color-text-2);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.admin-tab-btn:hover {
  color: var(--color-text);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.admin-tab-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  box-shadow: 0 6px 20px rgba(108, 99, 255, 0.35);
}

.tab-badge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 999px;
}

.admin-tab-btn.active .tab-badge {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 440px;
  border-radius: 20px;
  padding: 28px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
}

.modal-info-text {
  font-size: 0.92rem;
  color: var(--color-text-2);
  margin: 4px 0;
}

.input-clean {
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 0.95rem;
  outline: none;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 900px) {
  .admin-header-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .admin-header-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
