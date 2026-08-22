<template>
  <div class="my-jobs-page-container">
    <main class="content">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>Mening e'lonlarim</h1>
          <p>Siz joylashtirgan barcha e'lonlar va ularga kelgan takliflar nazorati</p>
        </div>
        <router-link to="/jobs/new" class="btn btn-primary new-job-btn">
          <Plus :size="18" />
          <span>Yangi e'lon qo'shish</span>
        </router-link>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'all' }"
          @click="currentTab = 'all'"
        >
          Barchasi ({{ jobs.length }})
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'open' }"
          @click="currentTab = 'open'"
        >
          Ochiq ({{ countByStatus('open') }})
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'in_progress' }"
          @click="currentTab = 'in_progress'"
        >
          Jarayonda ({{ countByStatus('in_progress') }})
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'completed' }"
          @click="currentTab = 'completed'"
        >
          Bajarildi ({{ countByStatus('completed') }})
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-box">
        <span class="animate-spin loader"></span>
        <span>E'lonlar yuklanmoqda...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredJobs.length === 0" class="empty-box card">
        <Briefcase :size="48" style="color: var(--color-muted)" />
        <h3>Hozircha e'lonlar yo'q</h3>
        <p v-if="currentTab === 'all'">Siz hali birorta ham ish yoki xizmat e'loni joylashtirmadingiz.</p>
        <p v-else>Ushbu bo'limda e'lonlar mavjud emas.</p>
        <router-link to="/jobs/new" class="btn btn-primary" style="margin-top: 12px">
          <Plus :size="16" />
          <span>Birinchi e'loningizni bering</span>
        </router-link>
      </div>

      <!-- Jobs Grid / List -->
      <div v-else class="jobs-list">
        <div
          v-for="job in filteredJobs"
          :key="job.id"
          class="my-job-card card"
        >
          <div class="job-card-header">
            <div class="job-badges">
              <span class="category-pill">{{ job.category }}</span>
              <span class="badge" :class="getStatusBadgeClass(job.status)">
                {{ getStatusLabel(job.status) }}
              </span>
            </div>
            <span class="job-date">{{ formatRelativeTime(job.created_at) }}</span>
          </div>

          <router-link :to="`/jobs/${job.id}`" class="job-title-link">
            <h3>{{ job.title }}</h3>
          </router-link>

          <p class="job-desc">{{ job.description }}</p>

          <div class="job-meta-row">
            <div class="meta-item">
              <MapPin :size="14" />
              <span>{{ job.city }}</span>
            </div>
            <div class="meta-item price-item">
              <span class="price-val">{{ formatPrice(job.budget_max || job.budget_min) }}</span>
            </div>
          </div>

          <div class="job-card-footer">
            <div class="offers-count-box">
              <Users :size="16" />
              <span class="count-num">{{ job.offers_count || 0 }} ta</span>
              <span class="count-label">taklif kelgan</span>
            </div>

            <div class="action-buttons">
              <router-link :to="`/jobs/${job.id}`" class="btn btn-primary btn-sm">
                <span>Ko'rish & Takliflar</span>
                <ChevronRight :size="16" />
              </router-link>
              <button
                type="button"
                class="btn btn-secondary btn-sm delete-btn"
                title="E'lonni o'chirish"
                @click="deleteJob(job.id)"
              >
                <Trash2 :size="15" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../services/supabase'
import { formatPrice, formatRelativeTime, getStatusLabel } from '../utils'
import {
  Briefcase, Plus, MapPin, Users, ChevronRight, Trash2
} from 'lucide-vue-next'

const authStore = useAuthStore()
const jobs = ref([])
const loading = ref(true)
const currentTab = ref('all')

function countByStatus(status) {
  return jobs.value.filter(j => j.status === status).length
}

const filteredJobs = computed(() => {
  if (currentTab.value === 'all') return jobs.value
  return jobs.value.filter(j => j.status === currentTab.value)
})

function getStatusBadgeClass(status) {
  switch (status) {
    case 'open': return 'badge-success'
    case 'in_progress':
    case 'negotiating': return 'badge-warning'
    case 'completed': return 'badge-info'
    default: return 'badge-neutral'
  }
}

async function loadMyJobs() {
  if (!authStore.user?.id) return
  loading.value = true
  try {
    const { data: jobsData, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('client_id', authStore.user.id)
      .order('created_at', { ascending: false })

    let list = jobsData || []

    // Merge custom created jobs from localStorage
    try {
      const customJobs = JSON.parse(localStorage.getItem('nexsora_custom_jobs') || '[]')
      const myCustoms = customJobs.filter(j => j.client_id === authStore.user.id || !j.client_id)
      const existingIds = new Set(list.map(j => j.id))
      const uniqueCustoms = myCustoms.filter(j => !existingIds.has(j.id))
      list = [...uniqueCustoms, ...list]
    } catch (e) {}

    // Fetch offers count for each job
    for (const job of list) {
      const { count } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('job_id', job.id)

      job.offers_count = count || 0
    }

    jobs.value = list
  } catch (err) {
    console.error('Error loading my jobs:', err)
  } finally {
    loading.value = false
  }
}

async function deleteJob(id) {
  if (!confirm("Haqiqatan ham ushbu e'lonni o'chirmoqchimisiz?")) return

  jobs.value = jobs.value.filter(j => j.id !== id)
  try {
    await supabase.from('jobs').delete().eq('id', id)
  } catch (err) {
    console.error('Error deleting job:', err)
  }
}

onMounted(() => {
  loadMyJobs()
})
</script>

<style scoped>
.my-jobs-page-container {
  min-height: calc(100vh - 68px);
  background: var(--color-bg);
  width: 100%;
}

.content {
  padding: 32px clamp(16px, 3.5vw, 32px) 60px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left h1 {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--color-text);
}

.header-left p {
  color: var(--color-text-2);
  font-size: 0.95rem;
  margin-top: 4px;
}

.new-job-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.tab-btn {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-2);
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.tab-btn.active {
  background: var(--gradient-primary);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(108, 99, 255, 0.25);
}

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.my-job-card {
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.my-job-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.job-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.job-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-pill {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary-light);
  background: rgba(108, 99, 255, 0.1);
  padding: 3px 10px;
  border-radius: 999px;
}

.job-date {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.job-title-link {
  text-decoration: none;
}

.job-title-link h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  transition: color 0.15s ease;
}

.job-title-link:hover h3 {
  color: var(--color-primary-light);
}

.job-desc {
  font-size: 0.88rem;
  color: var(--color-text-2);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.job-meta-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--color-muted);
}

.price-item {
  color: var(--color-success);
  font-weight: 700;
}

.job-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
  flex-wrap: wrap;
  gap: 12px;
}

.offers-count-box {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--color-text);
}

.count-num {
  font-weight: 800;
  color: var(--color-primary-light);
}

.count-label {
  color: var(--color-text-2);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-btn {
  color: var(--color-muted);
}

.delete-btn:hover {
  color: var(--color-error);
  border-color: rgba(255, 71, 87, 0.4);
}

.loading-box, .empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  color: var(--color-muted);
  text-align: center;
  gap: 12px;
}

.loader {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
}

@media (max-width: 640px) {
  .content { padding: 20px 16px 40px; }
  .my-job-card { padding: 16px; }
}
</style>
