<template>
  <div class="my-services-page">
    <main class="container my-services-content">
      
      <!-- Page Header -->
      <div class="page-header-row">
        <div class="header-left-col">
          <h1 class="page-title">Mening xizmatlarim</h1>
          <p class="page-subtitle">Siz tomonidan e'lon qilingan barcha xizmatlar va ularning statistikasi</p>
        </div>
        <router-link to="/services/new" class="btn btn-primary btn-add-service">
          <Plus :size="18" />
          <span>Yangi xizmat qo'shish</span>
        </router-link>
      </div>

      <!-- Empty State -->
      <div v-if="myServices.length === 0" class="empty-card card">
        <div class="empty-icon-wrap">
          <Wrench :size="40" class="empty-icon" />
        </div>
        <h3>Sizda hali yaratilgan xizmatlar yo'q</h3>
        <p>Hozircha e'lon qilingan xizmatlaringiz mavjud emas. Yangi xizmat qo'shib, mijozlardan buyurtma qabul qiling.</p>
        <router-link to="/services/new" class="btn btn-primary" style="margin-top: 8px;">
          <Plus :size="16" />
          <span>Xizmat qo'shish</span>
        </router-link>
      </div>

      <!-- Services List Grid -->
      <div v-else class="services-list-grid">
        <div v-for="item in myServices" :key="item.id" class="card my-service-card">
          
          <!-- 1. Cover Image & Overlays -->
          <div class="card-cover">
            <img :src="item.cover_image" :alt="item.title" class="cover-img" loading="lazy" />
            <div class="cover-gradient-overlay"></div>
          </div>

          <!-- 2. Overlapping Avatar & Category Pill Row -->
          <div class="pin-header-overlap">
            <div class="pin-avatar-wrap">
              <img
                v-if="item.craftsman?.avatar_url"
                :src="item.craftsman.avatar_url"
                :alt="item.craftsman.full_name"
                class="pin-avatar-img"
              />
              <div v-else class="pin-avatar-placeholder">
                {{ getInitials(item.craftsman?.full_name || authStore.profile?.full_name || 'Usta') }}
              </div>
            </div>

            <!-- Category Pill -->
            <div class="pin-category-pill">
              <Sparkles :size="12" class="pin-cat-icon" />
              <span>{{ item.category }}</span>
            </div>
          </div>

          <!-- 3. Title & Status Badge -->
          <div class="pin-info-row">
            <div class="pin-text-col">
              <h3 class="pin-name" :title="item.title">{{ item.title }}</h3>
              <p class="pin-service-sub">{{ item.city || 'Toshkent' }}</p>
            </div>

            <!-- Status Indicator -->
            <div class="status-badge-wrap">
              <span v-if="isItemBoosted(item.id)" class="badge-boost-active">
                <Zap :size="12" /> Boost Faol
              </span>
              <span v-else class="badge-live-active">
                <span class="pulse-dot"></span> Faol
              </span>
            </div>
          </div>

          <!-- 4. 3-Column Stats Matrix -->
          <div class="pin-stats-matrix">
            <div class="pin-stat-item">
              <div class="stat-top">
                <Star :size="13" fill="#F59E0B" color="#F59E0B" />
                <span class="stat-val">{{ (item.rating || 5.0).toFixed(1) }}</span>
              </div>
              <span class="stat-lbl">Reyting</span>
            </div>

            <div class="pin-stat-divider"></div>

            <div class="pin-stat-item">
              <div class="stat-top">
                <Coins :size="13" class="stat-icon-blue" />
                <span class="stat-val">{{ formatShortPrice(item.price) }}</span>
              </div>
              <span class="stat-lbl">Narx</span>
            </div>

            <div class="pin-stat-divider"></div>

            <div class="pin-stat-item">
              <div class="stat-top">
                <Clock :size="13" class="stat-icon-purple" />
                <span class="stat-val">{{ item.duration_days }} kun</span>
              </div>
              <span class="stat-lbl">Muddati</span>
            </div>
          </div>

          <!-- 5. Action Buttons Group -->
          <div class="card-footer-box">
            <!-- Boost Button -->
            <button
              type="button"
              class="btn-action btn-action-boost"
              :class="{ 'is-active-boost': isItemBoosted(item.id) }"
              @click="openBoost(item)"
              :title="isItemBoosted(item.id) ? 'Boost faol' : 'E\'lonni yuqoriga ko\'tarish'"
            >
              <Zap :size="14" />
              <span>{{ isItemBoosted(item.id) ? 'Boost Faol' : 'Boost' }}</span>
            </button>

            <!-- View Detail Button -->
            <router-link :to="`/services/${item.id}`" class="btn-action btn-action-view" title="Xizmatni ko'rish">
              <Eye :size="14" />
              <span>Ko'rish</span>
            </router-link>

            <!-- Delete Button -->
            <button 
              type="button" 
              class="btn-action btn-action-delete" 
              @click="deleteService(item.id)" 
              title="Xizmatni o'chirish"
            >
              <Trash2 :size="14" />
            </button>
          </div>

        </div>
      </div>

    </main>

    <!-- Boost Modal -->
    <BoostModal
      :show="boostModal.show"
      :item-id="boostModal.itemId"
      item-type="service"
      :item-title="boostModal.itemTitle"
      @close="boostModal.show = false"
      @boosted="onBoosted"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { Wrench, Trash2, Zap, Plus, MapPin, Clock, Star, Eye, Coins, Sparkles } from 'lucide-vue-next'
import BoostModal from '../components/common/BoostModal.vue'

const authStore = useAuthStore()
const myServices = ref([])

const boostModal = reactive({ show: false, itemId: null, itemTitle: '' })

function formatShortPrice(price) {
  if (!price) return "0"
  if (price >= 1000000) {
    const m = (price / 1000000).toFixed(1).replace('.0', '')
    return `${m}M`
  }
  if (price >= 1000) {
    return `${Math.round(price / 1000)}k`
  }
  return `${price}`
}

function openBoost(item) {
  boostModal.itemId = item.id
  boostModal.itemTitle = item.title
  boostModal.show = true
}

function onBoosted() {
  // Refresh boost states
  myServices.value = [...myServices.value]
}

function isItemBoosted(id) {
  try {
    const boosts = JSON.parse(localStorage.getItem('nexsora_boosts_service') || '{}')
    const boost = boosts[id]
    return boost && boost.expiresAt > Date.now()
  } catch { return false }
}

function loadMyServices() {
  let custom = []
  try {
    const saved = localStorage.getItem('nexsora_custom_services')
    if (saved) custom = JSON.parse(saved)
  } catch (e) {}

  // Filter custom services created by this user or default sample ones
  const userCustom = custom.filter(s => !s.craftsman?.id || s.craftsman?.id === authStore.user?.id || s.craftsman?.id === 'current-user')
  
  if (userCustom.length > 0) {
    myServices.value = userCustom
  } else {
    // Show top 2 samples as starter items for the craftsman
    myServices.value = SAMPLE_SERVICES.slice(0, 2)
  }
}

function deleteService(id) {
  if (!confirm("Haqiqatan ham bu xizmatni o'chirmoqchimisiz?")) return

  let custom = []
  try {
    const saved = localStorage.getItem('nexsora_custom_services')
    if (saved) custom = JSON.parse(saved)
  } catch (e) {}

  custom = custom.filter(s => s.id !== id)
  localStorage.setItem('nexsora_custom_services', JSON.stringify(custom))
  myServices.value = myServices.value.filter(s => s.id !== id)
}

onMounted(() => {
  loadMyServices()
})
</script>

<style scoped>
.my-services-page {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
}

.my-services-content {
  padding: 32px clamp(16px, 3.5vw, 32px) 80px;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  flex: 1;
}

.page-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 32px;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin: 0;
}

.page-subtitle {
  font-size: 0.95rem;
  color: var(--color-text-2);
  margin-top: 6px;
}

.btn-add-service {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  font-weight: 700;
  border-radius: 14px;
}

/* Empty State */
.empty-card {
  padding: 64px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  border-radius: 24px;
  max-width: 600px;
  margin: 40px auto;
}

.empty-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: rgba(108, 99, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

/* Services Grid */
.services-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 26px;
}

@media (max-width: 480px) {
  .services-list-grid {
    grid-template-columns: 1fr;
  }
}

/* Service Card (Pinterest Reference Style) */
.my-service-card {
  padding: 0;
  border-radius: 28px;
  overflow: hidden;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 28px -10px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease;
}

.my-service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.16), 0 0 24px rgba(59, 130, 246, 0.12);
  border-color: color-mix(in srgb, var(--color-primary) 50%, var(--color-border));
}

/* 1. Cover Image */
.card-cover {
  width: 100%;
  height: 125px;
  position: relative;
  overflow: hidden;
  background: var(--color-surface);
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.my-service-card:hover .cover-img {
  transform: scale(1.06);
}

.cover-gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, transparent 60%, rgba(0, 0, 0, 0.35) 100%);
  pointer-events: none;
}

/* 2. Overlapping Avatar & Category Pill */
.pin-header-overlap {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 20px;
  margin-top: -30px;
  position: relative;
  z-index: 2;
}

.pin-avatar-wrap {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3.5px solid var(--color-card);
  overflow: hidden;
  background: var(--color-surface);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

.pin-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pin-avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), #8B5CF6);
  color: #fff;
  font-weight: 800;
  font-size: 1.1rem;
}

.pin-category-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.pin-cat-icon {
  color: #F59E0B;
}

/* 3. Title & Subtitle Info */
.pin-info-row {
  padding: 14px 20px 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.pin-text-col {
  flex: 1;
  min-width: 0;
}

.pin-name {
  font-size: 1.08rem;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.35;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 44px;
}

.pin-service-sub {
  font-size: 0.82rem;
  color: var(--color-muted);
  font-weight: 500;
  margin: 4px 0 0;
}

.status-badge-wrap {
  flex-shrink: 0;
}

.badge-boost-active {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(135deg, #F59E0B, #EA580C);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);
}

.badge-live-active {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.12);
  color: #10B981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 6px #10B981;
  animation: pulseAnim 1.8s infinite;
}

@keyframes pulseAnim {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

/* 4. 3-Column Stats Matrix */
.pin-stats-matrix {
  margin: 14px 20px;
  padding: 12px 6px;
  background: color-mix(in srgb, var(--color-surface) 75%, var(--color-bg));
  border-radius: 18px;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.pin-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.stat-top {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.stat-val {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--color-text);
}

.stat-lbl {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-muted);
}

.pin-stat-divider {
  width: 1px;
  height: 24px;
  background: var(--color-border);
}

.stat-icon-blue {
  color: #3B82F6;
}

.stat-icon-purple {
  color: #8B5CF6;
}

/* 5. Action Buttons Group */
.card-footer-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px 20px;
  margin-top: auto;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 42px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  border: 1px solid transparent;
  flex: 1;
}

/* View Button */
.btn-action-view {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}

.btn-action-view:hover {
  background: color-mix(in srgb, var(--color-primary) 12%, var(--color-surface));
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Boost Button */
.btn-action-boost {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(234, 88, 12, 0.14));
  border-color: rgba(245, 158, 11, 0.35);
  color: #D97706;
}

.btn-action-boost:hover {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(234, 88, 12, 0.25));
  border-color: #D97706;
  transform: translateY(-1px);
}

.btn-action-boost.is-active-boost {
  background: linear-gradient(135deg, #F59E0B, #EA580C);
  color: #fff;
  border-color: transparent;
}

/* Delete Button */
.btn-action-delete {
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  padding: 0;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

.btn-action-delete:hover {
  background: #EF4444;
  color: #fff;
  border-color: #EF4444;
}
</style>
