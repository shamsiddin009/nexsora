<template>
  <div class="dashboard-page-container">
    <main class="content">
      
      <!-- HERO WELCOME BANNER -->
      <section class="hero-welcome-card">
        <div class="hero-bg-glow"></div>
        <div class="hero-main-content">
          <div class="hero-text-block">
            <div class="greeting-badge">
              <span class="pulse-dot"></span>
              <span>{{ timeGreeting }}</span>
            </div>
            <h1 class="hero-title">
              Xush kelibsiz, <span class="gradient-text">{{ userName }}</span>!
            </h1>
            <p class="hero-subtitle">
              {{ authStore.isClient 
                ? "E'lonlaringiz holati, kelgan takliflar va xavfsiz to'lovlarni boshqaring." 
                : "Yangi buyurtmalarni oling, mijozlar bilan bog'laning va daromadingizni oshiring." 
              }}
            </p>
          </div>

          <!-- Quick Action Buttons -->
          <div class="hero-actions-group">
            <template v-if="authStore.isClient">
              <router-link to="/jobs/new" class="btn btn-primary hero-btn">
                <Plus :size="18" />
                <span>Yangi e'lon berish</span>
              </router-link>
              <router-link to="/services" class="btn btn-secondary hero-btn">
                <Search :size="18" />
                <span>Usta qidirish</span>
              </router-link>
            </template>
            <template v-else>
              <router-link to="/jobs" class="btn btn-primary hero-btn">
                <Briefcase :size="18" />
                <span>Yangi ishlar birjasi</span>
              </router-link>
              <router-link to="/services/new" class="btn btn-secondary hero-btn">
                <Plus :size="18" />
                <span>Xizmat qo'shish</span>
              </router-link>
            </template>
            
            <button class="btn btn-ghost hero-wallet-pill" @click="walletStore.openWalletModal">
              <Wallet :size="17" class="text-success" />
              <div class="wallet-pill-info">
                <span class="pill-label">Hamyon balansi</span>
                <strong class="pill-val">{{ walletStore.balanceFormatted }} UZS</strong>
              </div>
            </button>
          </div>
        </div>
      </section>

      <!-- STATS METRICS GRID -->
      <section class="stats-grid">
        <div 
          v-for="(stat, idx) in stats" 
          :key="stat.label" 
          class="stat-metric-card card"
          :style="{ '--accent-color': stat.color, animationDelay: `${idx * 0.08}s` }"
        >
          <div class="stat-card-header">
            <div class="stat-icon-wrapper" :style="{ background: stat.bg || `${stat.color}15`, color: stat.color }">
              <component :is="stat.icon" :size="22" />
            </div>
            <span v-if="stat.trend" class="stat-trend-pill" :class="stat.trendType || 'trend-up'">
              <TrendingUp :size="13" />
              <span>{{ stat.trend }}</span>
            </span>
          </div>

          <div class="stat-card-body">
            <div class="stat-metric-value">{{ stat.value }}</div>
            <div class="stat-metric-label">{{ stat.label }}</div>
          </div>

          <div class="stat-card-footer" v-if="stat.footer">
            <span class="stat-footer-text">{{ stat.footer }}</span>
          </div>
        </div>
      </section>

      <!-- MAIN CONTENT 2-COLUMN GRID -->
      <div class="dashboard-main-grid">
        
        <!-- LEFT COLUMN: Jobs / Orders Feed -->
        <div class="grid-left-column">
          <div class="dashboard-card card">
            <div class="card-header-bar">
              <div class="card-header-title">
                <div class="header-icon-box">
                  <Briefcase :size="18" class="text-primary" />
                </div>
                <div>
                  <h3>{{ authStore.isClient ? "Mening faol e'lonlarim" : "Tavsiya etilgan yangi ishlar" }}</h3>
                  <span class="header-subtitle">{{ authStore.isClient ? "Siz joylagan oxirgi buyurtmalar" : "Sizning sohangizga mos real loyihalar" }}</span>
                </div>
              </div>
              <router-link :to="authStore.isClient ? '/my-jobs' : '/jobs'" class="see-all-link">
                <span>Barchasini ko'rish</span>
                <ArrowRight :size="15" />
              </router-link>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="dashboard-loading-box">
              <span class="animate-spin loader"></span>
            </div>

            <!-- Empty State -->
            <div v-else-if="jobs.length === 0" class="empty-state-box">
              <div class="empty-icon-circle">
                <Briefcase :size="32" class="text-muted" />
              </div>
              <h4>Hozircha buyurtmalar yo'q</h4>
              <p>{{ authStore.isClient ? "Birinchi ish e'loningizni joylang va ustalardan taklif oling." : "Yangi e'lonlar birjasida taklif yuborishingiz mumkin." }}</p>
              <router-link :to="authStore.isClient ? '/jobs/new' : '/jobs'" class="btn btn-primary btn-sm">
                <Plus v-if="authStore.isClient" :size="16" />
                <span>{{ authStore.isClient ? "E'lon joylash" : "Ishlarni ko'rish" }}</span>
              </router-link>
            </div>

            <!-- Jobs List -->
            <div v-else class="jobs-interactive-list">
              <router-link
                v-for="job in jobs"
                :key="job.id"
                :to="`/jobs/${job.id}`"
                class="job-row-item"
              >
                <div class="job-row-left">
                  <div class="job-category-tag">
                    <span class="cat-dot"></span>
                    <span>{{ job.category || 'Xizmat' }}</span>
                  </div>
                  <h4 class="job-row-title">{{ job.title }}</h4>
                  <div class="job-row-meta">
                    <span class="meta-item"><MapPin :size="13" /> {{ job.city || 'Toshkent' }}</span>
                    <span class="meta-dot">•</span>
                    <span class="meta-item"><Clock :size="13" /> {{ formatRelativeTime(job.created_at) }}</span>
                  </div>
                </div>

                <div class="job-row-right">
                  <div class="job-budget-val">{{ formatPrice(job.budget_min) }}</div>
                  <span class="status-badge" :style="{
                    background: getStatusColor(job.status) + '18',
                    color: getStatusColor(job.status),
                    borderColor: getStatusColor(job.status) + '35'
                  }">
                    {{ getStatusLabel(job.status) }}
                  </span>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Chats & Quick Shortcuts -->
        <div class="grid-right-column">
          
          <!-- Recent Conversations -->
          <div class="dashboard-card card">
            <div class="card-header-bar">
              <div class="card-header-title">
                <div class="header-icon-box">
                  <MessageSquare :size="18" class="text-primary" />
                </div>
                <div>
                  <h3>Oxirgi yozishmalar</h3>
                  <span class="header-subtitle">Real-time xabarlar</span>
                </div>
              </div>
              <router-link to="/chat" class="see-all-link">
                <span>Chat</span>
                <ArrowRight :size="15" />
              </router-link>
            </div>

            <div v-if="chats.length === 0" class="empty-state-box mini">
              <div class="empty-icon-circle mini">
                <MessageSquare :size="24" class="text-muted" />
              </div>
              <p>Hali faol yozishmalar yo'q</p>
            </div>

            <div v-else class="chats-compact-list">
              <router-link
                v-for="chat in chats"
                :key="chat.id"
                :to="`/chat/${chat.id}`"
                class="chat-compact-item"
              >
                <div class="chat-avatar-circle">
                  <img
                    v-if="getChatPartnerAvatar(chat)"
                    :src="getChatPartnerAvatar(chat)"
                    :alt="getChatPartnerName(chat)"
                    class="chat-avatar-img"
                  />
                  <span v-else class="chat-avatar-fallback">{{ getInitials(getChatPartnerName(chat)) }}</span>
                  <span class="online-indicator"></span>
                </div>
                <div class="chat-item-body">
                  <div class="chat-item-header">
                    <span class="chat-partner-name">{{ getChatPartnerName(chat) }}</span>
                    <span class="chat-time-tag">{{ formatRelativeTime(chat.last_message?.created_at || chat.created_at) }}</span>
                  </div>
                  <p class="chat-last-snippet">{{ getChatSnippet(chat) }}</p>
                </div>
              </router-link>
            </div>

          </div>

          <!-- Quick Shortcuts Widget -->
          <div class="dashboard-card card shortcuts-card">
            <div class="card-header-bar">
              <div class="card-header-title">
                <div class="header-icon-box">
                  <Zap :size="18" class="text-warning" />
                </div>
                <div>
                  <h3>Tezkor amallar</h3>
                  <span class="header-subtitle">Foydali sahifalar</span>
                </div>
              </div>
            </div>

            <div class="shortcuts-grid">
              <router-link to="/profile" class="shortcut-btn">
                <User :size="18" class="shortcut-icon" />
                <span>Mening profilim</span>
              </router-link>
              <button class="shortcut-btn" @click="walletStore.openWalletModal">
                <Wallet :size="18" class="shortcut-icon" />
                <span>Hamyon & To'lov</span>
              </button>
              <router-link to="/bookmarks" class="shortcut-btn">
                <Heart :size="18" class="shortcut-icon" />
                <span>Saqlanganlar</span>
              </router-link>
              <router-link to="/settings" class="shortcut-btn">
                <Settings :size="18" class="shortcut-icon" />
                <span>Sozlamalar</span>
              </router-link>
            </div>
          </div>

        </div>
      </div>

      <!-- REFERRAL & BONUS HERO CARD -->
      <section class="referral-banner-card card" v-if="authStore.isAuthenticated">
        <div class="referral-banner-left">
          <div class="referral-badge-pill">
            <Sparkles :size="14" />
            <span>Bonus dasturi</span>
          </div>
          <h2 class="referral-title">Do'stlaringizni taklif qiling — <strong>50,000 so'm</strong> bonus oling!</h2>
          <p class="referral-description">
            Do'stingiz sizning havolangiz orqali ro'yxatdan o'tib, birinchi buyurtmasini berganda, hisobingizga avtomatik bonus o'tkaziladi.
          </p>

          <div class="referral-link-bar">
            <div class="referral-code-display">
              <span class="code-label">Sizning kodingiz:</span>
              <strong class="code-val">{{ referralCode }}</strong>
            </div>
            <button class="btn btn-primary btn-sm copy-link-btn" @click="handleCopyLink" :class="{ copied: justCopied }">
              <Check v-if="justCopied" :size="16" />
              <Copy v-else :size="16" />
              <span>{{ justCopied ? 'Nusxalandi!' : 'Havolani nusxalash' }}</span>
            </button>
          </div>
        </div>

        <div class="referral-banner-right">
          <div class="ref-kpi-card">
            <span class="ref-kpi-val">{{ referralStats.invited }} ta</span>
            <span class="ref-kpi-label">Taklif etilgan do'stlar</span>
          </div>
          <div class="ref-kpi-card">
            <span class="ref-kpi-val highlight">{{ (referralStats.earned || 0).toLocaleString() }} UZS</span>
            <span class="ref-kpi-label">Jami ishlangan bonus</span>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useWalletStore } from '../stores/walletStore'
import { supabase } from '../services/supabase'
import { formatPrice, formatRelativeTime, getStatusLabel, getStatusColor, getInitials } from '../utils'
import { useReferral } from '../composables/useReferral'
import { SAMPLE_CLIENT_JOBS } from '../data/sampleJobs'
import {
  Plus, Briefcase, Clock, MessageSquare, Star, TrendingUp, Gift, Copy, Check, Eye, Award,
  Search, Wallet, MapPin, ArrowRight, User, Heart, Settings, Sparkles, Zap, ShieldCheck
} from 'lucide-vue-next'

const authStore = useAuthStore()
const walletStore = useWalletStore()
const { referralCode, referralLink, referralStats, copyReferralLink } = useReferral()
const justCopied = ref(false)
const loading = ref(true)

function handleCopyLink() {
  copyReferralLink()
  justCopied.value = true
  setTimeout(() => { justCopied.value = false }, 2000)
}

const userName = computed(() => {
  return authStore.profile?.full_name?.split(' ')[0] || 'Foydalanuvchi'
})

const timeGreeting = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Xayrli tong'
  if (hour >= 12 && hour < 18) return 'Xayrli kun'
  return 'Xayrli oqshom'
})

const jobs = ref([])
const chats = ref([])

function getChatPartner(chat) {
  if (!chat) return null
  return chat.client_id === authStore.user?.id ? chat.craftsman : chat.client
}

function getChatPartnerName(chat) {
  const partner = getChatPartner(chat)
  if (partner?.full_name) return partner.full_name
  if (chat.jobs?.title) return chat.jobs.title
  return 'Suhbatdosh'
}

function getChatPartnerAvatar(chat) {
  const partner = getChatPartner(chat)
  return partner?.avatar_url || ''
}

function getChatSnippet(chat) {
  if (!chat.last_message?.content) {
    return chat.jobs?.title ? `Loyiha: ${chat.jobs.title}` : "Suhbatni boshlang..."
  }
  const content = chat.last_message.content
  if (content.startsWith('[VOICE')) return 'Ovozli xabar'
  if (content.includes('[IMAGE:')) return 'Rasm yuborildi'
  return content.replace(/^\[reply:[^\]]+\]\n/, '').slice(0, 45)
}

const stats = computed(() => {
  const cp = authStore.profile?.client_profiles
  const mp = authStore.profile?.craftsman_profiles
  
  let rating = 5.0
  if (authStore.user?.id) {
    try {
      const localReviews = JSON.parse(localStorage.getItem(`nexsora_reviews_${authStore.user.id}`) || '[]')
      if (localReviews.length > 0) {
        const sum = localReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0)
        rating = parseFloat((sum / localReviews.length).toFixed(1))
      }
    } catch (e) {}
  }

  if (authStore.isClient) {
    return [
      { 
        icon: Briefcase, 
        label: "Jami e'lonlarim", 
        value: `${jobs.value.length} ta`, 
        color: '#6C63FF', 
        bg: 'rgba(108, 99, 255, 0.12)',
        trend: '+1 bu hafta',
        footer: 'Barcha berilgan buyurtmalar'
      },
      { 
        icon: Clock, 
        label: 'Faol jarayondagi ishlar', 
        value: `${jobs.value.filter(j => j.status === 'open' || j.status === 'in_progress').length} ta`, 
        color: '#FFB800', 
        bg: 'rgba(255, 184, 0, 0.12)',
        trend: 'Faol',
        footer: 'Ustalardan taklif kutilyapti'
      },
      { 
        icon: MessageSquare, 
        label: 'Faol suhbatlar', 
        value: `${chats.value.length} ta`, 
        color: '#00D2D3', 
        bg: 'rgba(0, 210, 211, 0.12)',
        trend: 'Jonli',
        footer: 'Usta bilan to\'g\'ridan-to\'g\'ri chat'
      },
      { 
        icon: Star, 
        label: 'Mijoz ishonch reytingi', 
        value: `${rating.toFixed(1)} / 5.0`, 
        color: '#FF7675', 
        bg: 'rgba(255, 118, 117, 0.12)',
        trend: 'A\'lo',
        footer: 'Ustalar tomonidan berilgan baho'
      },
    ]
  } else {
    return [
      { 
        icon: Eye, 
        label: "Profilni ko'rishlar", 
        value: '184 ta', 
        color: '#10B981', 
        bg: 'rgba(16, 185, 129, 0.12)',
        trend: '+24% bu oy',
        footer: 'Mijozlar e\'tibori oshmoqda'
      },
      { 
        icon: TrendingUp, 
        label: 'Mavjud yangi ishlar', 
        value: `${jobs.value.length} ta`, 
        color: '#6C63FF', 
        bg: 'rgba(108, 99, 255, 0.12)',
        trend: 'Birja',
        footer: 'Taklif yuborishga tayyor'
      },
      { 
        icon: Award, 
        label: 'Bajarilgan buyurtmalar', 
        value: '22 ta', 
        color: '#F59E0B', 
        bg: 'rgba(245, 158, 11, 0.12)',
        trend: '100% kafolat',
        footer: 'Muvaffaqiyatli topshirilgan'
      },
      { 
        icon: Star, 
        label: 'Usta reytingi', 
        value: `${rating.toFixed(1)} / 5.0`, 
        color: '#EC4899', 
        bg: 'rgba(236, 72, 153, 0.12)',
        trend: 'TOP Usta',
        footer: 'Real mijozlar sharhlari asosida'
      },
    ]
  }
})

async function loadData() {
  if (!authStore.user) return
  loading.value = true

  try {
    if (authStore.isClient) {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('client_id', authStore.user.id)
        .order('created_at', { ascending: false })
        .limit(6)

      let clientList = data || []
      try {
        const customJobs = JSON.parse(localStorage.getItem('nexsora_custom_jobs') || '[]')
        const myCustoms = customJobs.filter(j => j.client_id === authStore.user.id || !j.client_id)
        const existingIds = new Set(clientList.map(j => j.id))
        const uniqueCustoms = myCustoms.filter(j => !existingIds.has(j.id))
        clientList = [...uniqueCustoms, ...clientList]
      } catch (e) {}

      jobs.value = clientList.slice(0, 6)
    } else {
      let myOfferedIds = []
      try {
        const { data: myOffers } = await supabase
          .from('offers')
          .select('job_id')
          .eq('craftsman_id', authStore.user.id)

        if (myOffers) {
          myOfferedIds = myOffers.map(o => o.job_id).filter(Boolean)
        }
      } catch (e) {}

      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(10)

      let openJobs = data || []

      // Merge custom created jobs from localStorage
      try {
        const customJobs = JSON.parse(localStorage.getItem('nexsora_custom_jobs') || '[]')
        const existingIds = new Set(openJobs.map(j => j.id))
        const uniqueCustoms = customJobs.filter(j => !existingIds.has(j.id))
        openJobs = [...uniqueCustoms, ...openJobs]
      } catch (e) {}

      // Fallback sample jobs
      const dbIds = new Set(openJobs.map(j => j.id))
      const uniqueSamples = SAMPLE_CLIENT_JOBS.filter(s => !dbIds.has(s.id))
      openJobs = [...openJobs, ...uniqueSamples]

      if (myOfferedIds.length > 0) {
        openJobs = openJobs.filter(j => !myOfferedIds.includes(j.id))
      }
      jobs.value = openJobs.slice(0, 6)
    }

    const { data: chatsData } = await supabase
      .from('chats')
      .select(`
        *,
        jobs(*),
        client:client_id(*),
        craftsman:craftsman_id(*, craftsman_profiles(*))
      `)
      .or(`client_id.eq.${authStore.user.id},craftsman_id.eq.${authStore.user.id}`)
      .order('created_at', { ascending: false })
      .limit(5)

    const rawChats = chatsData || []

    // Fetch latest message for each chat in ONE batch query
    const chatIds = rawChats.map(c => c.id)
    if (chatIds.length > 0) {
      try {
        const { data: lastMsgs } = await supabase
          .from('messages')
          .select('*')
          .in('chat_id', chatIds)
          .order('created_at', { ascending: false })

        const lastMsgMap = new Map()
        for (const m of (lastMsgs || [])) {
          if (!lastMsgMap.has(m.chat_id)) lastMsgMap.set(m.chat_id, m)
        }
        rawChats.forEach(c => {
          c.last_message = lastMsgMap.get(c.id) || null
        })
      } catch (e) {
        console.warn('Dashboard chats batch last message fetch warning:', e)
      }
    }

    chats.value = rawChats
  } catch (e) {
    console.error('Load dashboard data error:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

</script>

<style scoped>
.dashboard-page-container {
  min-height: calc(100vh - 68px);
  background: var(--color-bg);
  width: 100%;
}

.content {
  padding: 36px 24px 80px;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* ─── 1. HERO WELCOME CARD ─────────────────────────────────────── */
.hero-welcome-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 14%, var(--color-surface)), var(--color-surface));
  border: 1px solid color-mix(in srgb, var(--color-primary) 28%, var(--color-border));
  border-radius: 24px;
  padding: 36px 40px;
  box-shadow: var(--shadow-lg);
}

.hero-bg-glow {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(108, 99, 255, 0.25) 0%, rgba(108, 99, 255, 0) 70%);
  pointer-events: none;
}

.hero-main-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  flex-wrap: wrap;
}

.hero-text-block {
  max-width: 620px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.greeting-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary-light);
  width: fit-content;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-primary-light);
  box-shadow: 0 0 8px var(--color-primary);
  animation: pulseGlow 1.8s infinite;
}

@keyframes pulseGlow {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.6; }
}

.hero-title {
  font-size: 2.1rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-text);
  margin: 0;
  line-height: 1.2;
}

.gradient-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 0.98rem;
  color: var(--color-text-2);
  line-height: 1.5;
  margin: 0;
}

.hero-actions-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-btn {
  padding: 12px 22px;
  border-radius: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.hero-wallet-pill {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 18px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hero-wallet-pill:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.wallet-pill-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.pill-label {
  font-size: 0.7rem;
  color: var(--color-muted);
  font-weight: 500;
}

.pill-val {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
}

/* ─── 2. STATS METRICS GRID ─────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.stat-metric-card {
  position: relative;
  padding: 24px;
  border-radius: 20px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.stat-metric-card:hover {
  transform: translateY(-3px);
  border-color: var(--accent-color);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.stat-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-trend-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(16, 185, 129, 0.12);
  color: #10B981;
}

.stat-card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-metric-value {
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-text);
}

.stat-metric-label {
  font-size: 0.88rem;
  color: var(--color-text-2);
  font-weight: 500;
}

.stat-card-footer {
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.stat-footer-text {
  font-size: 0.78rem;
  color: var(--color-muted);
}

/* ─── 3. DASHBOARD 2-COLUMN GRID ────────────────────────────────── */
.dashboard-main-grid {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  gap: 24px;
}

.grid-left-column, .grid-right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-card {
  padding: 24px;
  border-radius: 20px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: var(--color-surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-header-title h3 {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.header-subtitle {
  font-size: 0.78rem;
  color: var(--color-muted);
}

.see-all-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-primary-light);
  transition: gap 0.15s ease;
}

.see-all-link:hover {
  gap: 7px;
}

/* Jobs Interactive Rows */
.jobs-interactive-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.job-row-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 16px;
  background: var(--color-surface-2);
  border: 1px solid transparent;
  text-decoration: none;
  transition: all 0.18s ease;
}

.job-row-item:hover {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 5%, var(--color-surface-2));
  transform: translateX(4px);
}

.job-row-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.job-category-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-primary-light);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.cat-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-primary);
}

.job-row-title {
  font-size: 0.98rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 480px;
}

.job-row-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--color-muted);
}

.job-row-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.job-budget-val {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

.status-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 8px;
  border: 1px solid transparent;
}

/* Compact Chat List */
.chats-compact-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-compact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--color-surface-2);
  border: 1px solid transparent;
  text-decoration: none;
  transition: all 0.15s ease;
}

.chat-compact-item:hover {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 6%, var(--color-surface-2));
}

.chat-avatar-circle {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--gradient-primary);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: visible;
}

.chat-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.chat-avatar-fallback {
  font-size: 0.88rem;
  font-weight: 800;
  color: white;
}


.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #10B981;
  border: 2px solid var(--color-surface);
}

.chat-item-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.chat-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-partner-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-text);
}

.chat-time-tag {
  font-size: 0.72rem;
  color: var(--color-muted);
}

.chat-last-snippet {
  font-size: 0.78rem;
  color: var(--color-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

/* Shortcuts Widget */
.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.shortcut-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.shortcut-btn:hover {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface-2));
  transform: translateY(-2px);
}

.shortcut-icon {
  color: var(--color-primary-light);
}

/* ─── 4. REFERRAL HERO BANNER ───────────────────────────────────── */
.referral-banner-card {
  padding: 32px 40px;
  border-radius: 24px;
  background: linear-gradient(135deg, color-mix(in srgb, #EC4899 12%, var(--color-surface)), var(--color-surface));
  border: 1px solid color-mix(in srgb, #EC4899 25%, var(--color-border));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
}

.referral-banner-left {
  max-width: 680px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.referral-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #EC4899;
  background: rgba(236, 72, 153, 0.12);
  width: fit-content;
}

.referral-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
  line-height: 1.3;
}

.referral-description {
  font-size: 0.9rem;
  color: var(--color-text-2);
  line-height: 1.5;
  margin: 0;
}

.referral-link-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.referral-code-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  background: var(--color-surface-2);
  border: 1px dashed var(--color-border);
}

.code-label {
  font-size: 0.8rem;
  color: var(--color-muted);
}

.code-val {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--color-primary-light);
  letter-spacing: 0.05em;
}

.referral-banner-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.ref-kpi-card {
  padding: 16px 22px;
  border-radius: 16px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  min-width: 140px;
}

.ref-kpi-val {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--color-text);
}

.ref-kpi-val.highlight {
  color: #10B981;
}

.ref-kpi-label {
  font-size: 0.75rem;
  color: var(--color-muted);
}

/* Empty State */
.empty-state-box {
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-state-box.mini {
  padding: 28px 16px;
  gap: 8px;
}

.empty-icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon-circle.mini {
  width: 44px;
  height: 44px;
}

.empty-state-box h4 {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.empty-state-box p {
  font-size: 0.85rem;
  color: var(--color-muted);
  max-width: 320px;
  margin: 0;
}

.dashboard-loading-box {
  padding: 40px;
  display: flex;
  justify-content: center;
}

.loader {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
}

/* ─── RESPONSIVE BREAKPOINTS ───────────────────────────────────── */
@media (max-width: 1024px) {
  .dashboard-main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-welcome-card {
    padding: 24px 20px;
  }
  .hero-title {
    font-size: 1.6rem;
  }
  .hero-actions-group {
    width: 100%;
  }
  .hero-btn {
    flex: 1;
  }
  .referral-banner-card {
    padding: 24px 20px;
  }
  .referral-banner-right {
    width: 100%;
    justify-content: space-between;
  }
  .ref-kpi-card {
    flex: 1;
  }
}
</style>
