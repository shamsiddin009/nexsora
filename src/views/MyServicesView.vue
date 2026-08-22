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
          
          <!-- Cover Image & Overlays -->
          <div class="card-cover">
            <img :src="item.cover_image" :alt="item.title" class="cover-img" loading="lazy" />
            <div class="cover-gradient-overlay"></div>
            
            <!-- Category Badge -->
            <span class="category-tag">{{ item.category }}</span>
            
            <!-- Status Badge -->
            <div class="status-badge-wrap">
              <span v-if="isItemBoosted(item.id)" class="badge-boost-active">
                <Zap :size="12" /> Boost Faol
              </span>
              <span v-else class="badge-live-active">
                <span class="pulse-dot"></span> Faol
              </span>
            </div>
          </div>

          <!-- Card Content Body -->
          <div class="card-content">
            <h3 class="service-title" :title="item.title">{{ item.title }}</h3>
            
            <div class="service-meta-row">
              <span class="meta-item">
                <MapPin :size="13" class="meta-icon" />
                <span>{{ item.city || 'Toshkent' }}</span>
              </span>
              <span class="meta-item">
                <Clock :size="13" class="meta-icon" />
                <span>{{ item.duration_days }} kunda</span>
              </span>
              <span class="meta-item meta-rating">
                <Star :size="13" fill="#F59E0B" class="star-icon" />
                <span>{{ (item.rating || 5.0).toFixed(1) }} ({{ item.reviews_count || 0 }})</span>
              </span>
            </div>

            <!-- Card Footer Row -->
            <div class="card-footer-box">
              <div class="price-section">
                <span class="price-label">Boshlang'ich narx</span>
                <div class="price-val">{{ formatPrice(item.price) }}</div>
              </div>
              
              <div class="action-buttons-group">
                <!-- Boost Button -->
                <button
                  type="button"
                  class="btn-action btn-action-boost"
                  :class="{ 'is-active-boost': isItemBoosted(item.id) }"
                  @click="openBoost(item)"
                  :title="isItemBoosted(item.id) ? 'Boost faol' : 'E\'lonni yuqoriga ko\'tarish'"
                >
                  <Zap :size="14" />
                  <span>{{ isItemBoosted(item.id) ? 'Boost' : 'Boost' }}</span>
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
import { formatPrice } from '../utils'
import { SAMPLE_SERVICES } from '../data/sampleServices'
import { Wrench, Trash2, Zap, Plus, MapPin, Clock, Star, Eye } from 'lucide-vue-next'
import BoostModal from '../components/common/BoostModal.vue'

const authStore = useAuthStore()
const myServices = ref([])

const boostModal = reactive({ show: false, itemId: null, itemTitle: '' })

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
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

@media (max-width: 480px) {
  .services-list-grid {
    grid-template-columns: 1fr;
  }
}

/* Service Card */
.my-service-card {
  padding: 0;
  overflow: hidden;
  border-radius: 22px;
  display: flex;
  flex-direction: column;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease;
}

.my-service-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: color-mix(in srgb, var(--color-primary) 50%, var(--color-border));
}

/* Cover Image */
.card-cover {
  width: 100%;
  height: 185px;
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
  transform: scale(1.04);
}

.cover-gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, transparent 40%, rgba(0, 0, 0, 0.4) 100%);
  pointer-events: none;
}

.category-tag {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.status-badge-wrap {
  position: absolute;
  top: 14px;
  right: 14px;
}

.badge-boost-active {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(135deg, #F59E0B, #EA580C);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 5px 12px;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.badge-live-active {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.9);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 8px #fff;
  animation: pulseAnim 1.8s infinite;
}

@keyframes pulseAnim {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

/* Card Body */
.card-content {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 14px;
}

.service-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.45;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 46px;
}

.service-meta-row {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 0.82rem;
  color: var(--color-text-2);
  flex-wrap: wrap;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.meta-icon {
  color: var(--color-muted);
}

.meta-rating {
  font-weight: 700;
  color: var(--color-text);
}

.star-icon {
  color: #F59E0B;
}

/* Card Footer */
.card-footer-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
  margin-top: auto;
  gap: 12px;
  flex-wrap: wrap;
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-muted);
}

.price-val {
  font-size: 1.22rem;
  font-weight: 900;
  color: var(--color-primary);
  letter-spacing: -0.01em;
}

/* Action Buttons Group */
.action-buttons-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  border: 1px solid transparent;
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
  width: 36px;
  padding: 0;
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
