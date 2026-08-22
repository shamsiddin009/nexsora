<template>
  <div class="birja-page-wrapper">
    <main class="public-content">
      <div class="birja-page">
        <!-- Top Page Header & Connects Widget -->
        <div class="birja-header-banner">
          <div class="header-title-box">
            <div class="title-with-badge">
              <h1>Loyiha almashinuvi</h1>
              <span class="birja-tag">Birja</span>
            </div>
            <p class="subtitle">Faol mijozlardan real buyurtmalar ro'yxati</p>
          </div>

          <!-- Craftsman Connects Widget (Kwork Style) -->
          <div class="connects-widget">
            <div class="connects-left">
              <div class="connects-label">
                <span>Aloqalar (Limit)</span>
                <span class="connects-count"><strong>28 tasi qoldi</strong> / 30 tadan</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: 85%"></div>
              </div>
              <div class="connects-sub">To'ldirish sanasi: 21-avgust</div>
            </div>
            <div class="connects-actions">
              <router-link v-if="authStore.isClient" to="/jobs/new" class="btn btn-primary btn-sm">
                <Plus :size="16" /> E'lon joylash
              </router-link>
              <router-link v-else-if="!authStore.isAuthenticated" to="/register?role=client" class="btn btn-primary btn-sm">
                <Plus :size="16" /> E'lon joylash
              </router-link>
            </div>
          </div>
        </div>

        <!-- Birja Main Layout: Sidebar Filters (Left) + Job Feed (Right) -->
        <div class="birja-layout">
          
          <!-- Left Filter Sidebar -->
          <aside class="filter-sidebar">
            <div class="filter-card">
              <div class="filter-card-header">
                <h3><Filter :size="18" /> Kategoriyalar</h3>
              </div>
              <div class="category-list">
                <button
                  class="category-btn"
                  :class="{ 'active': !filters.category }"
                  @click="filters.category = ''; fetchJobs()"
                >
                  <span>Barcha kategoriyalar</span>
                  <span class="count-badge">{{ jobs.length }}</span>
                </button>
                <button
                  v-for="cat in CATEGORY_OPTIONS"
                  :key="cat.value"
                  class="category-btn"
                  :class="{ 'active': filters.category === cat.value }"
                  @click="filters.category = cat.value; fetchJobs()"
                >
                  <component :is="cat.icon" :size="16" class="cat-icon-svg" />
                  <span>{{ cat.label }}</span>
                </button>
              </div>
            </div>

            <!-- Budget & Location Filter -->
            <div class="filter-card">
              <div class="filter-card-header">
                <h3><SlidersHorizontal :size="18" /> Byudjet va Manzil</h3>
              </div>
              <div class="filter-inputs">
                <div class="input-group">
                  <label class="input-label">Shahar / Viloyat</label>
                  <CustomSelect
                    v-model="filters.city"
                    :options="[{ value: '', label: 'Barcha shaharlar', icon: MapPin }, ...CITY_OPTIONS]"
                    placeholder="Barcha shaharlar"
                    search-placeholder="Shaharni qidirish..."
                    size="sm"
                    clearable
                    @change="fetchJobs"
                  />
                </div>

                <div class="input-group">
                  <label class="input-label">Byudjet (so'm)</label>
                  <div class="budget-range-inputs">
                    <input
                      v-model="filters.minBudget"
                      type="number"
                      placeholder="Min"
                      class="input input-sm"
                      @change="fetchJobs"
                    />
                    <span>—</span>
                    <input
                      v-model="filters.maxBudget"
                      type="number"
                      placeholder="Max"
                      class="input input-sm"
                      @change="fetchJobs"
                    />
                  </div>
                </div>

                <button class="btn btn-ghost btn-sm reset-btn" @click="resetFilters">
                  <RotateCcw :size="14" /> Filtrlarni tiklash
                </button>
              </div>
            </div>
          </aside>

          <!-- Right Main Job Feed -->
          <div class="job-feed">
            <!-- Feed Header & Search -->
            <div class="feed-header">
              <div class="search-bar-inline">
                <Search :size="18" class="search-icon" />
                <input
                  v-model="filters.q"
                  type="text"
                  placeholder="Kalit so'z bo'yicha qidirish..."
                  class="input"
                  @input="debouncedFetchJobs"
                />
              </div>


              <!-- Sorting Dropdown -->
              <div class="sort-selector-box">
                <span class="sort-label">Saralash:</span>
                <select v-model="sortBy" class="select-clean">
                  <option value="newest">Eng yangi e'lonlar</option>
                  <option value="budget_desc">Yuqori byudjet</option>
                  <option value="budget_asc">Qulay byudjet</option>
                  <option value="urgent">Shoshilinch</option>
                </select>
              </div>
            </div>

            <!-- Quick Filter Chips Row -->
            <div class="quick-tags-strip">
              <button
                class="quick-pill"
                :class="{ active: activeQuickTag === 'all' }"
                @click="setQuickFilter('all')"
              >
                Barchasi (Yangi)
              </button>
              <button
                class="quick-pill"
                :class="{ active: activeQuickTag === 'urgent' }"
                @click="setQuickFilter('urgent')"
              >
                <Flame :size="13" />
                <span>Shoshilinch</span>
              </button>
              <button
                class="quick-pill"
                :class="{ active: activeQuickTag === 'guaranteed' }"
                @click="setQuickFilter('guaranteed')"
              >
                <ShieldCheck :size="13" />
                <span>Escrow Kafolatli</span>
              </button>
              <button
                class="quick-pill"
                :class="{ active: activeQuickTag === 'high_budget' }"
                @click="setQuickFilter('high_budget')"
              >
                <Gem :size="13" />
                <span>1 000 000+ so'm</span>
              </button>
              <button
                class="quick-pill"
                :class="{ active: activeQuickTag === 'tashkent' }"
                @click="setQuickFilter('tashkent')"
              >
                <MapPin :size="13" />
                <span>Toshkent</span>
              </button>
              <button
                v-if="authStore.isCraftsman && myOfferedCount > 0"
                class="quick-pill"
                :class="{ active: activeQuickTag === 'my_offers' }"
                @click="setQuickFilter('my_offers')"
              >
                <Mail :size="13" />
                <span>Taklif yuborilganlar ({{ myOfferedCount }})</span>
              </button>
            </div>

            <div class="feed-count">
              Ko'rsatilyapti: <strong>{{ sortedAndFilteredJobs.length }} ta loyiha</strong>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-box">
              <span class="animate-spin loader"></span>
            </div>

            <!-- Empty State -->
            <div v-else-if="jobs.length === 0" class="empty-box card">
              <Briefcase :size="48" />
              <h3>Loyihalar topilmadi</h3>
              <p>Qidiruv so'rovini yoki kategoriyani o'zgartirib ko'ring</p>
              <button class="btn btn-secondary btn-sm" @click="resetFilters">
                Filtrlarni tozalash
              </button>
            </div>

            <!-- Jobs List (Kwork Card Design) -->
            <div v-else class="jobs-list">
              <div v-for="job in sortedAndFilteredJobs" :key="job.id" class="kwork-job-card card">
                
                <!-- Card Header: Title & Budget -->
                <div class="card-top">
                  <div class="title-section">
                    <router-link :to="'/jobs/' + job.id" class="kwork-job-title">
                      {{ job.title }}
                    </router-link>
                    <div class="badges-row">
                      <span class="badge badge-primary">{{ job.category }}</span>
                      <span class="badge badge-success"><MapPin :size="11" /> {{ job.city || 'Toshkent' }}</span>
                      <span v-if="job.hasMyOffer" class="badge badge-info"><CheckCircle2 :size="11" /> Taklifingiz yuborilgan</span>
                      <span v-if="job.budget_max >= 1000000" class="badge badge-warning"><Coins :size="11" /> VIP Byudjet</span>
                    </div>
                  </div>
                  <div class="card-top-right">
                    <div class="budget-box">
                      <div class="budget-label">Kerakli byudjet</div>
                      <div class="budget-amount">
                        {{ formatPrice(job.budget_min) }} — {{ formatPrice(job.budget_max) }}
                      </div>
                    </div>
                    <!-- Bookmark Button -->
                    <button
                      class="bm-heart-btn"
                      :class="{ bookmarked: bookmarkStore.isJobBookmarked(job.id) }"
                      @click.stop="bookmarkStore.toggleJob(job)"
                      :title="bookmarkStore.isJobBookmarked(job.id) ? `Saqlangandan o'chirish` : 'Saqlash'"
                    >
                      <Heart :size="16" :fill="bookmarkStore.isJobBookmarked(job.id) ? 'currentColor' : 'none'" />
                    </button>
                  </div>
                </div>

                <!-- Description -->
                <p class="job-snippet">
                  {{ job.description }}
                </p>

                <!-- Client Details Box (Kwork Style) -->
                <div class="client-info-box">
                  <div class="client-avatar">
                    <div class="avatar-placeholder avatar-md">
                      <img
                        v-if="job.profiles?.avatar_url"
                        :src="job.profiles.avatar_url"
                        :alt="job.profiles?.full_name"
                        class="avatar-img"
                      />
                      <span v-else>{{ getInitials(job.profiles?.full_name) }}</span>
                    </div>
                  </div>
                  <div class="client-meta">
                    <div class="client-name-row">
                      <span class="client-label">Xaridor:</span>
                      <strong class="client-name">{{ job.profiles?.full_name || 'Foydalanuvchi' }}</strong>
                      <span class="verified-icon" title="Tasdiqlangan mijoz"><CheckCircle2 :size="14" /></span>
                    </div>
                    <div class="client-stats">
                      <span>E'lonlar: <strong>12 ta</strong></span>
                      <span class="dot">•</span>
                      <span>Qabul qilinganlar: <strong>95%</strong></span>
                    </div>
                  </div>
                </div>

                <!-- Card Footer: Tags & Action Button -->
                <div class="card-footer">
                  <div class="tags-group">
                    <span class="feature-tag"><Zap :size="13" /> Tezkor</span>
                    <span class="feature-tag"><ShieldCheck :size="13" /> Kafolatlangan</span>
                    <span class="feature-tag"><Sparkles :size="13" /> AI Tahlil</span>
                    <span class="time-tag"><Calendar :size="13" /> {{ formatRelativeTime(job.created_at) }}</span>
                  </div>
                  <router-link
                    :to="'/jobs/' + job.id"
                    class="btn btn-sm cta-btn"
                    :class="job.hasMyOffer ? 'btn-secondary' : 'btn-primary'"
                  >
                    {{ job.hasMyOffer ? "Taklifni ko'rish" : "Taklif yuborish" }}
                  </router-link>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CustomSelect from '../components/CustomSelect.vue'
import { useAuthStore } from '../stores/auth'
import { useBookmarkStore } from '../stores/bookmarkStore'
import { supabase } from '../services/supabase'
import { formatPrice, formatRelativeTime, getInitials, CATEGORY_OPTIONS, CITY_OPTIONS, JOB_CATEGORIES, UZ_CITIES, debounce } from '../utils'
import {
  Plus, Search, Calendar, Briefcase,
  SlidersHorizontal, Zap, ShieldCheck, Sparkles, Filter, CheckCircle2, RotateCcw, Heart,
  Flame, Gem, MapPin, Mail, Coins
} from 'lucide-vue-next'


import { SAMPLE_CLIENT_JOBS } from '../data/sampleJobs'

const bookmarkStore = useBookmarkStore()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const jobs = ref([])
const loading = ref(true)
const sortBy = ref('newest')
const activeQuickTag = ref('all')

const filters = ref({
  q: route.query.q || '',
  category: route.query.category || '',
  city: route.query.city || '',
  minBudget: '',
  maxBudget: '',
})

const debouncedFetchJobs = debounce(() => {
  fetchJobs()
}, 300)

function setQuickFilter(tag) {
  activeQuickTag.value = tag
}


const myOfferedCount = computed(() => {
  return jobs.value.filter(j => j.hasMyOffer).length
})

const sortedAndFilteredJobs = computed(() => {
  let list = [...jobs.value]

  // If user is a craftsman and clicks "Taklif yuborilganlar" tag
  if (activeQuickTag.value === 'my_offers') {
    list = list.filter(j => j.hasMyOffer)
  } else {
    // By default for craftsmen, HIDE already-applied jobs from the main Birja feed!
    if (authStore.isCraftsman) {
      list = list.filter(j => !j.hasMyOffer)
    }

    // Apply Quick Filter Tag
    if (activeQuickTag.value === 'urgent') {
      list = list.filter(j => j.title.toLowerCase().includes('shoshilinch') || j.description?.toLowerCase().includes('shoshilinch') || j.category === 'Santexnik')
    } else if (activeQuickTag.value === 'guaranteed') {
      list = list.filter(j => (j.budget_max || 0) >= 300000)
    } else if (activeQuickTag.value === 'high_budget') {
      list = list.filter(j => (j.budget_max || j.budget_min || 0) >= 1000000)
    } else if (activeQuickTag.value === 'tashkent') {
      list = list.filter(j => (j.city || '').toLowerCase().includes('toshkent') || !j.city)
    }
  }

  // Apply Sorting
  if (sortBy.value === 'budget_desc') {
    list.sort((a, b) => (b.budget_max || b.budget_min || 0) - (a.budget_max || a.budget_min || 0))
  } else if (sortBy.value === 'budget_asc') {
    list.sort((a, b) => (a.budget_min || a.budget_max || 0) - (b.budget_min || b.budget_max || 0))
  } else if (sortBy.value === 'urgent') {
    list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  } else {
    // newest
    list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  }

  return list
})


watch(() => route.query.q, (newQ) => {
  filters.value.q = newQ || ''
  fetchJobs()
})

function resetFilters() {
  filters.value = {
    q: '',
    category: '',
    city: '',
    minBudget: '',
    maxBudget: '',
  }
  activeQuickTag.value = 'all'
  router.push('/jobs')
  fetchJobs()
}

async function fetchJobs() {
  loading.value = true
  try {
    const myOfferedJobIds = new Set()
    if (authStore.user?.id) {
      const uid = authStore.user.id
      try {
        const { data: myOffers } = await supabase
          .from('offers')
          .select('job_id')
          .eq('craftsman_id', uid)

        if (myOffers) {
          myOffers.forEach(o => {
            if (o.job_id) myOfferedJobIds.add(o.job_id)
          })
        }
      } catch (e) {
        console.warn('Offers fetch error:', e)
      }

      // Check localStorage for offers submitted by this craftsman
      try {
        const myKey = `nexsora_my_offers_${uid}`
        const localMyOffers = JSON.parse(localStorage.getItem(myKey) || '[]')
        localMyOffers.forEach(o => {
          if (o.job_id) myOfferedJobIds.add(o.job_id)
        })

        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)
          if (k && k.startsWith('nexsora_offers_')) {
            const list = JSON.parse(localStorage.getItem(k) || '[]')
            list.forEach(o => {
              if (o.craftsman_id === uid && o.job_id) {
                myOfferedJobIds.add(o.job_id)
              }
            })
          }
        }
      } catch (e) {}
    }

    let allJobs = []
    try {
      let query = supabase
        .from('jobs')
        .select('*, profiles(*)')
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (filters.value.category) {
        query = query.eq('category', filters.value.category)
      }
      if (filters.value.city) {
        query = query.eq('city', filters.value.city)
      }
      if (filters.value.q) {
        query = query.ilike('title', `%${filters.value.q}%`)
      }
      if (filters.value.minBudget) {
        query = query.gte('budget_min', Number(filters.value.minBudget))
      }
      if (filters.value.maxBudget) {
        query = query.lte('budget_max', Number(filters.value.maxBudget))
      }

      const { data, error } = await query
      if (!error && data) {
        allJobs = data
      }
    } catch (dbErr) {
      console.warn('DB jobs fetch error:', dbErr)
    }

    // Merge custom created jobs from localStorage
    try {
      const rawCustomJobs = JSON.parse(localStorage.getItem('nexsora_custom_jobs') || '[]')
      const filteredCustoms = rawCustomJobs.filter(job => {
        if (filters.value.category && job.category !== filters.value.category) return false
        if (filters.value.city && job.city !== filters.value.city) return false
        if (filters.value.q && !job.title.toLowerCase().includes(filters.value.q.toLowerCase())) return false
        if (filters.value.minBudget && job.budget_min < Number(filters.value.minBudget)) return false
        if (filters.value.maxBudget && job.budget_max > Number(filters.value.maxBudget)) return false
        return true
      })
      const existingIds = new Set(allJobs.map(j => j.id))
      const uniqueCustoms = filteredCustoms.filter(j => !existingIds.has(j.id))
      allJobs = [...uniqueCustoms, ...allJobs]
    } catch (e) {}

    // Merge realistic sample client jobs with filters applied
    const filteredSamples = SAMPLE_CLIENT_JOBS.filter(job => {
      if (filters.value.category && job.category !== filters.value.category) return false
      if (filters.value.city && job.city !== filters.value.city) return false
      if (filters.value.q && !job.title.toLowerCase().includes(filters.value.q.toLowerCase())) return false
      if (filters.value.minBudget && job.budget_min < Number(filters.value.minBudget)) return false
      if (filters.value.maxBudget && job.budget_max > Number(filters.value.maxBudget)) return false
      return true
    })

    const dbJobIds = new Set(allJobs.map(j => j.id))
    const uniqueSamples = filteredSamples.filter(s => !dbJobIds.has(s.id))
    allJobs = [...allJobs, ...uniqueSamples]

    // Mark jobs that already have offers from this craftsman
    allJobs.forEach(j => {
      j.hasMyOffer = myOfferedJobIds.has(j.id)
    })

    jobs.value = allJobs
  } catch (err) {
    console.error('Fetch jobs error:', err)
  } finally {
    loading.value = false
  }
}

let jobsRealtimeChannel = null

onMounted(() => {
  fetchJobs()

  // Real-time: remove jobs as soon as they are accepted / closed
  jobsRealtimeChannel = supabase
    .channel('birja-jobs-realtime')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'jobs'
    }, (payload) => {
      if (payload.eventType === 'UPDATE') {
        if (payload.new && payload.new.status !== 'open') {
          jobs.value = jobs.value.filter(j => j.id !== payload.new.id)
        } else {
          fetchJobs()
        }
      } else {
        fetchJobs()
      }
    })
    .subscribe()
})

onUnmounted(() => {
  if (jobsRealtimeChannel) {
    supabase.removeChannel(jobsRealtimeChannel)
  }
})
</script>

<style scoped>
.birja-page-wrapper {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
}

.public-content {
  padding: 24px clamp(16px, 3.5vw, 32px) 60px;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  flex: 1;
}

/* Birja Header Banner */
.birja-header-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 28px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 24px 28px;
  box-shadow: var(--shadow-sm);
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-with-badge h1 {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--color-text);
}

.birja-tag {
  background: rgba(67, 233, 123, 0.15);
  color: var(--color-success);
  border: 1px solid rgba(67, 233, 123, 0.3);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.subtitle {
  color: var(--color-text-2);
  font-size: 0.95rem;
  margin-top: 4px;
}

/* Connects Widget */
.connects-widget {
  display: flex;
  align-items: center;
  gap: 24px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 16px 20px;
}

.connects-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 220px;
}

.connects-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--color-text-2);
}

.connects-count strong {
  color: var(--color-success);
}

.progress-track {
  height: 6px;
  background: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-success) 100%);
  border-radius: 3px;
}

.connects-sub {
  font-size: 0.7rem;
  color: var(--color-muted);
}

.connects-actions {
  display: flex;
  gap: 8px;
}

/* Birja Layout Grid */
.birja-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
}

/* Left Filter Sidebar */
.filter-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: var(--shadow-sm);
}

.filter-card-header h3 {
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text);
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--color-text-2);
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 150ms ease;
}

.category-btn:hover, .category-btn.active {
  background: var(--color-surface-2);
  color: var(--color-primary-light);
  font-weight: 600;
}

.cat-icon-emoji {
  font-size: 1.05rem;
  margin-right: 6px;
  line-height: 1;
}

.count-badge {
  font-size: 0.72rem;
  background: rgba(108,99,255,0.15);
  color: var(--color-primary-light);
  padding: 2px 8px;
  border-radius: 999px;
}

.filter-inputs {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.budget-range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-sm {
  padding: 8px;
  font-size: 0.8rem;
}

.reset-btn {
  width: 100%;
  justify-content: center;
  margin-top: 4px;
}

/* Job Feed */
.job-feed {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.search-bar-inline {
  position: relative;
  flex: 1;
  max-width: 480px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-muted);
}

.search-bar-inline .input {
  padding-left: 42px;
}

.feed-count {
  font-size: 0.85rem;
  color: var(--color-text-2);
}

/* Kwork Job Card */
.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.kwork-job-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-radius: 20px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.kwork-job-card:hover {
  transform: translateY(-2px);
  border-color: rgba(108,99,255,0.3);
  box-shadow: var(--shadow-md);
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.kwork-job-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-success);
  text-decoration: none;
  line-height: 1.3;
  transition: color 150ms ease;
}

.kwork-job-title:hover {
  color: #38F9D7;
}

.badges-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.budget-box {
  text-align: right;
  flex-shrink: 0;
}

.budget-label {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.budget-amount {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-success);
}

.job-snippet {
  font-size: 0.9rem;
  color: var(--color-text-2);
  line-height: 1.6;
}

/* Client Details Box */
.client-info-box {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 12px 16px;
}

.client-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
}

.client-label {
  color: var(--color-muted);
}

.client-name {
  color: var(--color-text);
}

.verified-icon {
  color: var(--color-success);
  display: flex;
}

.client-stats {
  font-size: 0.75rem;
  color: var(--color-muted);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.client-stats strong {
  color: var(--color-text-2);
}

/* Card Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.tags-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.feature-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--color-primary-light);
  background: rgba(108,99,255,0.1);
  padding: 3px 10px;
  border-radius: 999px;
}

.time-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--color-muted);
}

.cta-btn {
  padding: 8px 20px;
}

.loading-box, .empty-box {
  padding: 60px 24px;
  text-align: center;
  gap: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loader {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
}

.sort-selector-box {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.sort-label {
  font-size: 0.85rem;
  color: var(--color-text-2);
  white-space: nowrap;
}

.select-clean {
  padding: 8px 14px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text);
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;
  cursor: pointer;
}

.quick-tags-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 12px 0 16px;
}

.quick-pill {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-2);
  cursor: pointer;
  transition: all 0.15s ease;
}

.quick-pill:hover {
  border-color: var(--color-primary);
  color: var(--color-text);
}

.quick-pill.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

@media (max-width: 1024px) {
  .birja-layout { grid-template-columns: 1fr; }
  .birja-header-banner { flex-direction: column; align-items: flex-start; }
  .connects-widget { width: 100%; justify-content: space-between; }
}

@media (max-width: 640px) {
  .card-top { flex-direction: column; }
  .budget-box { text-align: left; }
  .connects-widget { flex-direction: column; align-items: stretch; }
  .feed-header { flex-direction: column; align-items: stretch; }
}
</style>

