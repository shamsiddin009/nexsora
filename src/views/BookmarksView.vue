<template>
  <div class="bookmarks-page">
    <!-- Header -->
    <div class="bm-header">
      <div class="container">
        <div class="bm-header-inner">
          <div class="bm-header-left">
            <div class="bm-icon-box">
              <Bookmark :size="22" />
            </div>
            <div>
              <h1 class="bm-title">Saqlanganlar</h1>
              <p class="bm-subtitle">{{ bookmarkStore.totalBookmarks }} ta saqlangan</p>
            </div>
          </div>
          <button
            v-if="bookmarkStore.totalBookmarks > 0"
            class="clear-btn"
            @click="confirmClear"
          >
            <Trash2 :size="15" />
            Hammasini o'chirish
          </button>
        </div>

        <!-- Tabs -->
        <div class="bm-tabs">
          <button
            :class="['bm-tab', { active: activeTab === 'services' }]"
            @click="activeTab = 'services'"
          >
            <Wrench :size="15" />
            Ustalar
            <span class="tab-count">{{ bookmarkStore.bookmarkedServices.length }}</span>
          </button>
          <button
            :class="['bm-tab', { active: activeTab === 'jobs' }]"
            @click="activeTab = 'jobs'"
          >
            <Briefcase :size="15" />
            Ish e'lonlari
            <span class="tab-count">{{ bookmarkStore.bookmarkedJobs.length }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="container bm-body">

      <!-- Services Tab -->
      <template v-if="activeTab === 'services'">
        <div v-if="bookmarkStore.bookmarkedServices.length === 0" class="bm-empty">
          <BookmarkX :size="52" class="bm-empty-icon" />
          <h3>Saqlangan ustalar yo'q</h3>
          <p>Ustalar katalogiga kiring va saqlash tugmasini bosing</p>
          <router-link to="/services" class="bm-explore-btn">
            <Wrench :size="16" />
            Ustalarni ko'rish
          </router-link>
        </div>

        <div v-else class="bm-grid">
          <div
            v-for="service in bookmarkStore.bookmarkedServices"
            :key="service.id"
            class="bm-card"
          >
            <!-- Remove button -->
            <button class="bm-remove-btn" @click="bookmarkStore.removeService(service.id)" title="Saqlangan'dan o'chirish">
              <X :size="14" />
            </button>

            <!-- Card content -->
            <div class="bm-card-avatar">
              <img
                v-if="service.image_url || service.avatar"
                :src="service.image_url || service.avatar"
                :alt="service.title || service.name"
                class="bm-avatar-img"
              />
              <div v-else class="bm-avatar-fallback">
                {{ (service.title || service.name || 'U')[0].toUpperCase() }}
              </div>
              <div v-if="service.is_verified" class="bm-verified-badge" title="Tasdiqlangan usta">
                <BadgeCheck :size="14" />
              </div>
            </div>

            <div class="bm-card-body">
              <h3 class="bm-card-title">{{ service.title || service.name }}</h3>
              <p v-if="service.specialty" class="bm-card-specialty">{{ Array.isArray(service.specialty) ? service.specialty[0] : service.specialty }}</p>
              <div class="bm-card-meta">
                <span v-if="service.city" class="bm-meta-item">
                  <MapPin :size="12" />
                  {{ service.city }}
                </span>
                <span v-if="service.rating" class="bm-meta-item bm-rating">
                  <Star :size="12" />
                  {{ Number(service.rating).toFixed(1) }}
                </span>
              </div>
              <div class="bm-card-price" v-if="service.price_min">
                <span>{{ Number(service.price_min).toLocaleString() }}</span>
                <span class="price-currency">UZS</span>
                <span class="price-per">dan</span>
              </div>
            </div>

            <router-link :to="`/services/${service.id}`" class="bm-card-link">
              Ko'rish <ArrowRight :size="14" />
            </router-link>
          </div>
        </div>
      </template>

      <!-- Jobs Tab -->
      <template v-if="activeTab === 'jobs'">
        <div v-if="bookmarkStore.bookmarkedJobs.length === 0" class="bm-empty">
          <BookmarkX :size="52" class="bm-empty-icon" />
          <h3>Saqlangan e'lonlar yo'q</h3>
          <p>Ish e'lonlariga kiring va saqlash tugmasini bosing</p>
          <router-link to="/jobs" class="bm-explore-btn">
            <Briefcase :size="16" />
            E'lonlarni ko'rish
          </router-link>
        </div>

        <div v-else class="bm-list">
          <div
            v-for="job in bookmarkStore.bookmarkedJobs"
            :key="job.id"
            class="bm-job-card"
          >
            <button class="bm-remove-btn" @click="bookmarkStore.removeJob(job.id)" title="O'chirish">
              <X :size="14" />
            </button>
            <div class="bm-job-body">
              <div class="bm-job-badges">
                <span class="bm-badge bm-badge-category">{{ job.category || 'Umumiy' }}</span>
                <span v-if="job.budget" class="bm-badge bm-badge-budget">
                  {{ Number(job.budget).toLocaleString() }} UZS
                </span>
              </div>
              <h3 class="bm-job-title">{{ job.title }}</h3>
              <p class="bm-job-desc">{{ job.description?.slice(0, 120) }}{{ job.description?.length > 120 ? '…' : '' }}</p>
              <div class="bm-job-meta">
                <span v-if="job.city"><MapPin :size="12" /> {{ job.city }}</span>
                <span v-if="job.deadline"><Clock :size="12" /> {{ job.deadline }}</span>
              </div>
            </div>
            <router-link :to="`/jobs/${job.id}`" class="bm-card-link">
              Ko'rish <ArrowRight :size="14" />
            </router-link>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBookmarkStore } from '../stores/bookmarkStore'
import {
  Bookmark, BookmarkX, Wrench, Briefcase, Trash2, X,
  MapPin, Star, BadgeCheck, ArrowRight, Clock
} from 'lucide-vue-next'

const bookmarkStore = useBookmarkStore()
const activeTab = ref('services')

function confirmClear() {
  if (confirm("Barcha saqlangan narsalarni o'chirishni xohlaysizmi?")) {
    bookmarkStore.clearAll()
  }
}
</script>

<style scoped>
.bookmarks-page { min-height: 100vh; background: var(--color-bg); }

.bm-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 28px 0 0;
}
.bm-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.bm-header-left { display: flex; align-items: center; gap: 14px; }
.bm-icon-box {
  width: 48px; height: 48px;
  border-radius: 14px;
  background: rgba(108, 99, 255, 0.15);
  color: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
}
.bm-title { font-size: 1.5rem; font-weight: 700; color: var(--color-text); margin: 0; }
.bm-subtitle { font-size: 0.85rem; color: var(--color-text-2); margin: 0; }

.clear-btn {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255, 71, 87, 0.1);
  color: var(--color-error);
  border: 1px solid rgba(255, 71, 87, 0.2);
  padding: 8px 16px; border-radius: 10px;
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.clear-btn:hover { background: rgba(255, 71, 87, 0.2); }

.bm-tabs { display: flex; gap: 4px; }
.bm-tab {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 20px;
  border: none; background: transparent;
  color: var(--color-text-2); font-size: 0.9rem; font-weight: 600;
  cursor: pointer; border-bottom: 2px solid transparent;
  transition: all 0.2s;
}
.bm-tab.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
.tab-count {
  background: var(--color-surface-2);
  padding: 1px 7px; border-radius: 10px;
  font-size: 0.75rem; color: var(--color-text-2);
}
.bm-tab.active .tab-count {
  background: rgba(108,99,255,0.15); color: var(--color-primary);
}

.bm-body { padding: 32px 0 80px; }

/* Empty state */
.bm-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 12px;
  padding: 80px 20px; text-align: center;
}
.bm-empty-icon { color: var(--color-muted); opacity: 0.5; }
.bm-empty h3 { font-size: 1.2rem; font-weight: 700; color: var(--color-text); margin: 0; }
.bm-empty p { color: var(--color-text-2); margin: 0; }
.bm-explore-btn {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--gradient-primary); color: #fff;
  padding: 11px 22px; border-radius: 12px;
  font-weight: 600; text-decoration: none; font-size: 0.9rem;
  margin-top: 8px; transition: all 0.2s;
}
.bm-explore-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(108,99,255,0.4); }

/* Service Cards Grid */
.bm-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}
.bm-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 20px;
  position: relative;
  display: flex; flex-direction: column; gap: 12px;
  transition: all 0.2s;
}
.bm-card:hover { border-color: var(--color-primary); transform: translateY(-2px); box-shadow: var(--shadow-md); }

.bm-remove-btn {
  position: absolute; top: 12px; right: 12px;
  width: 26px; height: 26px; border-radius: 50%;
  background: rgba(255,71,87,0.1); border: none;
  color: var(--color-error); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; opacity: 0;
}
.bm-card:hover .bm-remove-btn { opacity: 1; }
.bm-remove-btn:hover { background: rgba(255,71,87,0.2); transform: scale(1.1); }

.bm-card-avatar {
  position: relative; width: 56px; height: 56px;
}
.bm-avatar-img {
  width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
}
.bm-avatar-fallback {
  width: 100%; height: 100%; border-radius: 50%;
  background: var(--gradient-primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; font-weight: 700;
}
.bm-verified-badge {
  position: absolute; bottom: -2px; right: -2px;
  background: var(--color-primary); color: #fff;
  border-radius: 50%; padding: 2px;
  display: flex; align-items: center;
}

.bm-card-title { font-size: 1rem; font-weight: 700; color: var(--color-text); margin: 0; }
.bm-card-specialty { font-size: 0.82rem; color: var(--color-primary); margin: 0; }
.bm-card-meta { display: flex; gap: 10px; flex-wrap: wrap; }
.bm-meta-item { display: flex; align-items: center; gap: 4px; font-size: 0.78rem; color: var(--color-text-2); }
.bm-rating { color: #F7B731; }
.bm-card-price { font-size: 0.9rem; color: var(--color-text); font-weight: 600; }
.price-currency { font-size: 0.75rem; color: var(--color-text-2); margin-left: 3px; }
.price-per { font-size: 0.75rem; color: var(--color-text-2); margin-left: 3px; }

.bm-card-link {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 16px; border-radius: 10px;
  background: rgba(108,99,255,0.08); color: var(--color-primary);
  font-weight: 600; font-size: 0.85rem; text-decoration: none;
  border: 1px solid rgba(108,99,255,0.15);
  transition: all 0.2s; justify-content: center; margin-top: auto;
}
.bm-card-link:hover { background: rgba(108,99,255,0.15); }

/* Jobs List */
.bm-list { display: flex; flex-direction: column; gap: 14px; }
.bm-job-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 14px; padding: 18px 20px;
  display: flex; gap: 16px; align-items: flex-start;
  position: relative; transition: all 0.2s;
}
.bm-job-card:hover { border-color: var(--color-primary); transform: translateY(-1px); box-shadow: var(--shadow-md); }
.bm-job-card .bm-remove-btn { top: 14px; right: 14px; }
.bm-job-card:hover .bm-remove-btn { opacity: 1; }

.bm-job-body { flex: 1; }
.bm-job-badges { display: flex; gap: 8px; margin-bottom: 8px; }
.bm-badge {
  padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
}
.bm-badge-category { background: rgba(108,99,255,0.12); color: var(--color-primary); }
.bm-badge-budget { background: rgba(67,233,123,0.12); color: var(--color-success); }

.bm-job-title { font-size: 1rem; font-weight: 700; color: var(--color-text); margin: 0 0 6px; }
.bm-job-desc { font-size: 0.85rem; color: var(--color-text-2); margin: 0 0 10px; line-height: 1.5; }
.bm-job-meta { display: flex; gap: 14px; flex-wrap: wrap; font-size: 0.78rem; color: var(--color-text-2); }
.bm-job-meta span { display: flex; align-items: center; gap: 4px; }
</style>

