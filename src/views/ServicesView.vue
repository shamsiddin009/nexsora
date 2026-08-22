<template>
  <div class="services-page-container">
    <!-- Hero Banner -->
    <section class="services-hero">
      <div class="container hero-content">
        <span class="hero-tag"><Sparkles :size="14" /> Ustalarning Tayyor Xizmatlari</span>
        <h1 class="hero-title">Tajribali ustalardan <span class="text-gradient">tayyor xizmatlar</span> va takliflar</h1>
        <p class="hero-desc">
          O'zingizga kerakli xizmatni tanlang, usta bilan to'g'ridan-to'g'ri bog'laning va ishni sifatli bajartiring.
        </p>

        <!-- Search Bar -->
        <div class="hero-search-bar">
          <Search :size="20" class="search-icon" />
          <input
            v-model="filters.q"
            type="text"
            placeholder="Qanday xizmat qidiryapsiz? (Masalan: santexnik, kafel terish, elektr montaj)..."
            class="hero-search-input"
          />
          <button v-if="filters.q" class="clear-search-btn" @click="filters.q = ''">
            <X :size="16" />
          </button>
        </div>

        <!-- Popular Category Pills -->
        <div class="quick-category-pills">
          <button
            class="cat-pill"
            :class="{ active: !filters.category }"
            @click="filters.category = ''"
          >
            Barchasi
          </button>
          <button
            v-for="cat in popularCategories"
            :key="cat"
            class="cat-pill"
            :class="{ active: filters.category === cat }"
            @click="filters.category = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>
    </section>

    <!-- Main Content Section -->
    <main class="container services-main">
      <!-- Horizontal Filter Toolbar -->
      <div class="services-top-bar card">
        <div class="filter-item-city">
          <CustomSelect
            v-model="filters.city"
            :options="[{ value: '', label: 'Barcha shaharlar', icon: '📍' }, ...CITY_OPTIONS]"
            placeholder="Barcha shaharlar"
            search-placeholder="Shaharni qidirish..."
            size="sm"
            clearable
          />
        </div>

        <div class="filter-item-district" v-if="filters.city === 'Toshkent' || !filters.city">
          <CustomSelect
            v-model="filters.district"
            :options="[{ value: '', label: 'Barcha tumanlar', icon: '🏙️' }, ...DISTRICT_OPTIONS]"
            placeholder="Tuman tanlash"
            search-placeholder="Tumanni qidirish..."
            size="sm"
            clearable
          />
        </div>

        <div class="filter-item-category">
          <CustomSelect
            v-model="filters.category"
            :options="[{ value: '', label: 'Barcha kategoriyalar', icon: '✨' }, ...CATEGORY_OPTIONS]"
            placeholder="Barcha kategoriyalar"
            search-placeholder="Kategoriyani qidirish..."
            size="sm"
            clearable
          />
        </div>

        <div class="filter-item-rating">
          <CustomSelect
            v-model="filters.minRating"
            :options="[{ value: '', label: 'Barcha reytinglar', icon: '⭐' }, ...RATING_OPTIONS]"
            placeholder="Reyting"
            size="sm"
            clearable
          />
        </div>

        <div class="filter-item-price">
          <span class="price-label">Narx:</span>
          <input
            v-model="filters.minPrice"
            type="number"
            placeholder="Min"
            class="input input-sm price-input"
          />
          <span>—</span>
          <input
            v-model="filters.maxPrice"
            type="number"
            placeholder="Max"
            class="input input-sm price-input"
          />
        </div>

        <button v-if="hasActiveFilters" class="reset-filter-btn" @click="resetFilters">
          <RotateCcw :size="14" /> Tozalash
        </button>

        <div class="results-count-badge">
          <strong>{{ filteredServices.length }} ta</strong> xizmat
        </div>

        <div class="view-mode-toggle">
          <button
            type="button"
            class="view-toggle-btn"
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
            title="Ro'yxat ko'rinishi"
          >
            <LayoutGrid :size="14" />
            <span>Ro'yxat</span>
          </button>
          <button
            type="button"
            class="view-toggle-btn"
            :class="{ active: viewMode === 'map' }"
            @click="viewMode = 'map'"
            title="Xarita ko'rinishi"
          >
            <Map :size="14" />
            <span>Xarita</span>
          </button>
        </div>
      </div>

      <!-- MAP VIEW -->
      <div v-if="viewMode === 'map'" class="map-view-container card">
        <div class="map-canvas">
          <div class="map-bg-pattern">
            <div class="map-region-label toshkent-label"><MapPin :size="12" /> Toshkent</div>
            <div class="map-region-label samarqand-label"><MapPin :size="12" /> Samarqand</div>
            <div class="map-region-label buxoro-label"><MapPin :size="12" /> Buxoro</div>
            <div class="map-region-label fargona-label"><MapPin :size="12" /> Farg'ona</div>
          </div>

          <!-- Pins for Services -->
          <div
            v-for="(service, idx) in filteredServices"
            :key="service.id"
            class="map-craftsman-pin"
            :class="{ active: selectedMapService?.id === service.id }"
            :style="getPinPosition(service, idx)"
            @click="selectedMapService = service"
          >
            <div class="pin-avatar">
              <img v-if="service.craftsman?.avatar_url" :src="service.craftsman.avatar_url" :alt="service.craftsman.full_name" />
              <span v-else>{{ (service.craftsman?.full_name || 'U')[0] }}</span>
            </div>
            <div class="pin-badge">
              <Star :size="11" fill="currentColor" /> {{ service.rating.toFixed(1) }}
            </div>
          </div>

          <!-- Selected Service Popup Card -->
          <div v-if="selectedMapService" class="map-service-popup card">
            <button class="popup-close" @click="selectedMapService = null"><X :size="15" /></button>
            <div class="popup-header">
              <img :src="selectedMapService.cover_image" class="popup-thumb" />
              <div>
                <span class="popup-cat">{{ selectedMapService.category }}</span>
                <h4 class="popup-title">{{ selectedMapService.title }}</h4>
                <div class="popup-price">{{ formatPrice(selectedMapService.price) }}</div>
              </div>
            </div>
            <div class="popup-footer">
              <span class="popup-loc"><MapPin :size="13" /> {{ selectedMapService.city }} {{ selectedMapService.district ? '(' + selectedMapService.district + ')' : '' }}</span>
              <router-link :to="`/services/${selectedMapService.id}`" class="btn btn-primary btn-sm">
                Xizmatni ko'rish →
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredServices.length === 0" class="empty-state-box card">
        <Wrench :size="48" class="empty-icon" />
        <h3>Xizmatlar topilmadi</h3>
        <p>Tanlangan filtrlar bo'yicha hech qanday xizmat topilmadi. Qidiruv so'zini yoki filtrni o'zgartirib ko'ring.</p>
        <button class="btn btn-secondary btn-sm" @click="resetFilters">
          Barcha xizmatlarni ko'rish
        </button>
      </div>

      <!-- Service Cards Grid -->
      <div v-else class="services-grid">
        <div
          v-for="service in filteredServices"
          :key="service.id"
          class="kwork-card card"
          @click="router.push(`/services/${service.id}`)"
        >
          <!-- Cover Image & Duration Badge -->
          <div class="kwork-cover-box">
            <img :src="service.cover_image" :alt="service.title" class="kwork-cover-img" loading="lazy" decoding="async" />
            <span class="duration-badge">

              <Clock :size="12" /> {{ service.duration_days }} kun
            </span>
            <!-- Bookmark Button -->
            <button
              type="button"
              class="bm-heart-btn"
              :class="{ active: bookmarkStore.isBookmarked('service', service.id) }"
              :title="bookmarkStore.isBookmarked('service', service.id) ? 'Saqlanganlardan o\'chirish' : 'Saqlab qo\'yish'"
              @click.stop="bookmarkStore.toggleBookmark('service', service)"
            >
              <Heart :size="16" />
            </button>
          </div>

          <!-- Card Body -->
          <div class="kwork-body">
            <!-- Craftsman Mini Header -->
            <div class="craftsman-mini-row">
              <div class="craftsman-avatar-wrap">
                <img
                  v-if="service.craftsman?.avatar_url"
                  :src="service.craftsman.avatar_url"
                  :alt="service.craftsman.full_name"
                  class="craftsman-avatar"
                />
                <div v-else class="craftsman-avatar-placeholder">
                  {{ getInitials(service.craftsman?.full_name || 'Usta') }}
                </div>
              </div>
              <div class="craftsman-info">
                <span class="craftsman-name">{{ service.craftsman?.full_name || 'Usta' }}</span>
                <span class="craftsman-level">Daraja {{ service.craftsman?.level || 1 }}</span>
              </div>
              <div class="rating-badge">
                <Star :size="12" class="star-icon" fill="currentColor" />
                <span>{{ service.rating.toFixed(1) }}</span>
                <span class="reviews-count">({{ service.reviews_count }})</span>
              </div>
            </div>

            <!-- Service Title -->
            <h3 class="kwork-title">
              {{ service.title }}
            </h3>

            <!-- Tags / Badges -->
            <div class="kwork-tags">
              <span class="badge badge-primary">{{ service.category }}</span>
              <span class="badge badge-subtle"><MapPin :size="12" /> {{ service.city }}</span>
            </div>

            <div class="kwork-divider"></div>

            <!-- Card Footer: Price & Action -->
            <div class="kwork-footer">
              <div class="price-box">
                <span class="price-prefix">Boshlang'ich narx</span>
                <span class="price-val">{{ formatPrice(service.price) }}</span>
              </div>
              <span class="order-link">
                Batafsil →
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import CustomSelect from '../components/CustomSelect.vue'
import { useAuthStore } from '../stores/auth'
import { useBookmarkStore } from '../stores/bookmarkStore'
import { formatPrice, getInitials, CATEGORY_OPTIONS, CITY_OPTIONS, DISTRICT_OPTIONS, RATING_OPTIONS, JOB_CATEGORIES, UZ_CITIES } from '../utils'
import { SAMPLE_SERVICES } from '../data/sampleServices'
import {
  Search, Filter, RotateCcw, Plus, Wrench,
  Star, Clock, X, MapPin, Heart, Map, LayoutGrid, Sparkles
} from 'lucide-vue-next'

const bookmarkStore = useBookmarkStore()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const viewMode = ref('list') // 'list' | 'map'
const selectedMapService = ref(null)

const popularCategories = ['Santexnik', 'Elektrik', 'Duradgor', 'Quruvchi', 'Konditsioner']

function getPinPosition(service, idx) {
  // Deterministic positions on map based on city/district
  if (service.city === 'Samarqand') return { top: '65%', left: '42%' }
  if (service.city === 'Buxoro') return { top: '55%', left: '30%' }
  if (service.district === 'Yunusobod') return { top: '30%', left: '72%' }
  if (service.district === 'Chilonzor') return { top: '48%', left: '68%' }
  
  // Default staggered positions for Tashkent
  const tops = ['38%', '45%', '52%', '34%', '60%', '42%']
  const lefts = ['70%', '74%', '66%', '76%', '72%', '69%']
  return {
    top: tops[idx % tops.length],
    left: lefts[idx % lefts.length]
  }
}

const filters = ref({
  q: route.query.q || '',
  category: route.query.category || '',
  city: route.query.city || '',
  district: '',
  minRating: '',
  minPrice: '',
  maxPrice: '',
})

const servicesList = ref([])

function loadAllServices() {
  let custom = []
  try {
    const saved = localStorage.getItem('nexsora_custom_services')
    if (saved) custom = JSON.parse(saved)
  } catch (e) {}

  // Combine custom created services with sample services
  servicesList.value = [...custom, ...SAMPLE_SERVICES]
}

const filteredServices = computed(() => {
  return servicesList.value.filter(s => {
    if (filters.value.category && s.category !== filters.value.category) return false
    if (filters.value.city && s.city !== filters.value.city) return false
    if (filters.value.district && s.district && s.district !== filters.value.district) return false
    if (filters.value.minRating && s.rating < Number(filters.value.minRating)) return false
    if (filters.value.q) {
      const q = filters.value.q.toLowerCase().trim()
      const titleMatch = s.title.toLowerCase().includes(q)
      const descMatch = s.description.toLowerCase().includes(q)
      const craftMatch = s.craftsman?.full_name?.toLowerCase().includes(q)
      if (!titleMatch && !descMatch && !craftMatch) return false
    }
    if (filters.value.minPrice && s.price < Number(filters.value.minPrice)) return false
    if (filters.value.maxPrice && s.price > Number(filters.value.maxPrice)) return false
    return true
  })
})

const hasActiveFilters = computed(() => {
  return !!(filters.value.q || filters.value.category || filters.value.city || filters.value.district || filters.value.minRating || filters.value.minPrice || filters.value.maxPrice)
})

function resetFilters() {
  filters.value = {
    q: '',
    category: '',
    city: '',
    district: '',
    minRating: '',
    minPrice: '',
    maxPrice: '',
  }
}

onMounted(() => {
  if (authStore.isCraftsman) {
    router.replace('/jobs')
    return
  }
  loadAllServices()
})
</script>

<style scoped>
.services-page-container {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
}

/* HERO BANNER */
.services-hero {
  background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%);
  border-bottom: 1px solid var(--color-border);
  padding: 48px 0 36px;
  text-align: center;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 860px;
}

.hero-tag {
  display: inline-flex;
  padding: 6px 16px;
  border-radius: var(--radius-full);
  background: rgba(108, 99, 255, 0.12);
  color: var(--color-primary-light);
  border: 1px solid rgba(108, 99, 255, 0.25);
  font-size: 0.85rem;
  font-weight: 700;
}

.hero-title {
  font-size: 2.3rem;
  font-weight: 900;
  line-height: 1.25;
  color: var(--color-text);
  margin: 0;
}

.text-gradient {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-desc {
  font-size: 1.05rem;
  color: var(--color-text-2);
  line-height: 1.6;
  max-width: 680px;
  margin: 0;
}

/* Search Bar */
.hero-search-bar {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  max-width: 680px;
  background: var(--color-card);
  border: 2px solid var(--color-border);
  border-radius: 16px;
  padding: 6px 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.hero-search-bar:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 10px 30px rgba(108, 99, 255, 0.18);
}

.search-icon {
  color: var(--color-muted);
  margin-right: 12px;
}

.hero-search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 1rem;
  outline: none;
  padding: 8px 0;
}

.clear-search-btn {
  background: transparent;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  padding: 4px;
}

/* Quick pills */
.quick-category-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 8px;
}

.cat-pill {
  padding: 6px 16px;
  border-radius: var(--radius-full);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-2);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cat-pill:hover, .cat-pill.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* MAIN CONTENT */
.services-main {
  padding: 24px clamp(16px, 3.5vw, 32px) 60px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* TOP HORIZONTAL FILTER TOOLBAR */
.services-top-bar {
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  border-radius: 16px;
}

.filter-item-city, .filter-item-category {
  display: flex;
  align-items: center;
  gap: 8px;
}

.inline-select {
  height: 38px;
  min-width: 180px;
  padding: 6px 32px 6px 12px;
  font-size: 0.88rem;
  border-radius: 10px;
}

.filter-item-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-muted);
}

.price-input {
  width: 110px;
  height: 38px;
  padding: 6px 10px;
  font-size: 0.85rem;
  border-radius: 10px;
}

.reset-filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-2);
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.reset-filter-btn:hover {
  background: rgba(255, 71, 87, 0.12);
  color: var(--color-error);
  border-color: rgba(255, 71, 87, 0.25);
}

.results-count-badge {
  margin-left: auto;
  font-size: 0.88rem;
  color: var(--color-muted);
  background: var(--color-surface);
  padding: 6px 14px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
}

.results-count-badge strong {
  color: var(--color-text);
}

/* GRID OF CARDS */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 24px;
}

.kwork-card {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.kwork-card:hover {
  transform: translateY(-6px);
  border-color: rgba(108, 99, 255, 0.4);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12), 0 0 20px rgba(108, 99, 255, 0.1);
}

.kwork-cover-box {
  width: 100%;
  height: 180px;
  position: relative;
  overflow: hidden;
  background: var(--color-surface-2);
}

.kwork-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.kwork-card:hover .kwork-cover-img {
  transform: scale(1.06);
}

.duration-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 0.72rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.kwork-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
}

.craftsman-info-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.craftsman-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.craftsman-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text);
}

.craftsman-rating-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
}

.star-gold {
  color: var(--color-warning);
  fill: var(--color-warning);
}

.rating-num {
  font-weight: 700;
  color: var(--color-text);
}

.reviews-count {
  color: var(--color-muted);
}

.kwork-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.45;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.8em;
}

.kwork-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.badge-subtle {
  background: var(--color-surface-2);
  color: var(--color-text-2);
  border: 1px solid var(--color-border);
}

.kwork-divider {
  height: 1px;
  background: var(--color-border);
  margin-top: auto;
}

.kwork-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 4px;
}

.price-box {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price-prefix {
  font-size: 0.72rem;
  color: var(--color-muted);
  font-weight: 500;
}

.price-val {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-success);
}

.order-link {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-primary-light);
  transition: transform 0.15s ease;
}

.kwork-card:hover .order-link {
  transform: translateX(3px);
}

.empty-state-box {
  padding: 60px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.empty-icon {
  color: var(--color-muted);
  opacity: 0.5;
}

@media (max-width: 900px) {
  .services-layout {
    grid-template-columns: 1fr;
  }
  .hero-title {
    font-size: 1.8rem;
  }
}

/* ─── Map View Styles ────────────────────────────────────────────────────────── */
.view-mode-toggle {
  display: flex;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
  margin-left: auto;
}

.view-toggle-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: none;
  color: var(--color-text-2);
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.view-toggle-btn.active {
  background: var(--color-surface);
  color: var(--color-primary-light);
  box-shadow: var(--shadow-sm);
}

.map-view-container {
  padding: 0;
  overflow: hidden;
  border-radius: 20px;
  min-height: 480px;
  position: relative;
}

.map-canvas {
  width: 100%;
  height: 520px;
  background: radial-gradient(circle at 50% 50%, var(--color-surface-2) 0%, var(--color-surface) 100%);
  position: relative;
  overflow: hidden;
}

.map-bg-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(108, 99, 255, 0.12) 1px, transparent 1px);
  background-size: 24px 24px;
}

.map-region-label {
  position: absolute;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--color-muted);
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 10px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.toshkent-label { top: 22%; left: 68%; }
.samarqand-label { top: 60%; left: 40%; }
.buxoro-label { top: 50%; left: 26%; }
.fargona-label { top: 40%; left: 82%; }

/* Map Pin */
.map-craftsman-pin {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-surface);
  border: 2px solid var(--color-primary);
  border-radius: 999px;
  padding: 3px 8px 3px 3px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 6px 16px rgba(108, 99, 255, 0.35);
  transform: translate(-50%, -50%);
  z-index: 5;
}

.map-craftsman-pin:hover, .map-craftsman-pin.active {
  transform: translate(-50%, -50%) scale(1.15);
  border-color: #F7B731;
  z-index: 20;
}

.pin-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--gradient-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
}

.pin-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pin-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
}

/* Selected Service Popup */
.map-service-popup {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  max-width: 380px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 16px;
  z-index: 50;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.popup-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.popup-header {
  display: flex;
  gap: 12px;
  align-items: center;
}

.popup-thumb {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.popup-cat {
  font-size: 0.72rem;
  color: var(--color-primary-light);
  font-weight: 700;
}

.popup-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 2px 0 4px 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.popup-price {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--color-success);
}

.popup-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
}

.popup-loc {
  font-size: 0.78rem;
  color: var(--color-muted);
}
</style>
