<template>
  <div class="my-services-page">
    <main class="container my-services-content">
      
      <!-- Page Header -->
      <div class="page-header-row">
        <div>
          <h1 class="page-title">Mening xizmatlarim</h1>
          <p class="page-subtitle">Siz tomonidan e'lon qilingan barcha xizmatlar va ularning statistikasi</p>
        </div>
        <router-link to="/services/new" class="btn btn-primary">
          <Plus :size="16" />
          <span>+ Yangi xizmat qo'shish</span>
        </router-link>
      </div>

      <!-- Empty State -->
      <div v-if="myServices.length === 0" class="empty-card card">
        <Wrench :size="48" class="empty-icon" />
        <h3>Sizda hali yaratilgan xizmatlar yo'q</h3>
        <p>Hozircha e'lon qilingan xizmatlaringiz mavjud emas. Yangi xizmat qo'shib, mijozlardan buyurtma qabul qiling.</p>
        <router-link to="/services/new" class="btn btn-primary" style="margin-top: 12px;">
          <Plus :size="16" />
          <span>Xizmat qo'shish</span>
        </router-link>
      </div>

      <!-- Services List -->
      <div v-else class="services-list-grid">
        <div v-for="item in myServices" :key="item.id" class="card my-service-card">
          <div class="card-cover">
            <img :src="item.cover_image" :alt="item.title" class="cover-img" />
            <span class="category-tag">{{ item.category }}</span>
            <!-- Boost badge -->
            <span v-if="isItemBoosted(item.id)" class="boost-active-badge">
              <Zap :size="11" /> Boost aktiv
            </span>
          </div>

          <div class="card-content">
            <h3 class="service-title">{{ item.title }}</h3>
            
            <div class="service-meta-row">
              <span class="meta-item"><MapPin :size="12" /> {{ item.city }}</span>
              <span class="meta-item"><Clock :size="12" /> {{ item.duration_days }} kunda</span>
              <span class="meta-item"><Star :size="12" fill="currentColor" /> {{ item.rating.toFixed(1) }} ({{ item.reviews_count }})</span>
            </div>

            <div class="card-footer-row">
              <div class="price-val">{{ formatPrice(item.price) }}</div>
              
              <div class="action-buttons">
                <button
                  class="btn btn-boost btn-sm"
                  @click="openBoost(item)"
                  :title="isItemBoosted(item.id) ? 'Boost faol' : 'E\'lonni ko\'tarish'"
                >
                  <Zap :size="13" />
                  {{ isItemBoosted(item.id) ? 'Boost faol' : 'Boost' }}
                </button>
                <router-link :to="`/services/${item.id}`" class="btn btn-secondary btn-sm">
                  Ko'rish
                </router-link>
                <button class="btn btn-ghost btn-sm delete-btn" @click="deleteService(item.id)">
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
import { Wrench, Trash2, Zap, Plus, MapPin, Clock, Star } from 'lucide-vue-next'
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
  padding: 32px clamp(16px, 3.5vw, 32px) 70px;
  max-width: 1000px;
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
  margin-bottom: 28px;
}

.page-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}

.page-subtitle {
  font-size: 0.92rem;
  color: var(--color-text-2);
  margin-top: 4px;
}

.empty-card {
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

.services-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 22px;
}

.my-service-card {
  padding: 0;
  overflow: hidden;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
}

.card-cover {
  width: 100%;
  height: 160px;
  position: relative;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

.card-content {
  padding: 18px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
}

.service-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.4;
  margin: 0;
}

.service-meta-row {
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
  color: var(--color-muted);
  flex-wrap: wrap;
}

.card-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--color-border);
  padding-top: 12px;
  margin-top: auto;
}

.price-val {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-success);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.delete-btn {
  color: var(--color-error);
}

.delete-btn:hover {
  background: rgba(255, 71, 87, 0.15);
}

/* Boost button */
.btn-boost {
  display: inline-flex; align-items: center; gap: 5px;
  background: linear-gradient(135deg, rgba(247,183,49,0.15), rgba(255,107,107,0.15));
  border: 1px solid rgba(247,183,49,0.35);
  color: #F7B731; font-size: 0.78rem; font-weight: 700;
  padding: 5px 10px; border-radius: 8px; cursor: pointer;
  transition: all 0.2s; white-space: nowrap;
}
.btn-boost:hover {
  background: linear-gradient(135deg, rgba(247,183,49,0.25), rgba(255,107,107,0.25));
  transform: translateY(-1px);
}

/* Boost active badge */
.boost-active-badge {
  position: absolute; bottom: 8px; left: 8px;
  background: rgba(247,183,49,0.9); color: #000;
  font-size: 0.68rem; font-weight: 700;
  padding: 3px 8px; border-radius: 8px;
  display: flex; align-items: center; gap: 3px;
  backdrop-filter: blur(4px);
}
</style>
