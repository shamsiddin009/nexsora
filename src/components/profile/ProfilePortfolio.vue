<template>
  <div class="card portfolio-card">
    <div class="portfolio-header">
      <div>
        <h3 class="section-heading" style="margin-bottom: 0">
          <ImageIcon :size="18" /> Bajarilgan ishlar (Portfolio)
        </h3>
        <p style="color: var(--color-text-2); font-size: 0.85rem; margin-top: 2px">
          Usta tomonidan bajarilgan real ishlar va natijalar fotosuratlari
        </p>
      </div>
      <button v-if="isOwnProfile" class="btn btn-primary btn-sm" @click="showAddPortfolioModal = true">
        <Plus :size="15" /> Rasm qo'shish
      </button>
    </div>

    <!-- Portfolio Grid -->
    <div v-if="portfolioItems.length > 0" class="portfolio-grid">
      <div
        v-for="(item, idx) in portfolioItems"
        :key="item.id || idx"
        class="portfolio-item-card"
        @click="openLightbox(item)"
      >
        <div class="portfolio-thumb-wrap">
          <img :src="item.image" :alt="item.title" class="portfolio-thumb" />
          <span v-if="item.is_before_after" class="badge-ba">Oldin & Keyin</span>
          <button
            v-if="isOwnProfile"
            class="portfolio-delete-btn"
            @click.stop="$emit('delete-portfolio-item', item.id || idx)"
            title="O'chirish"
          >
            <Trash2 :size="13" />
          </button>
        </div>
        <div class="portfolio-info">
          <h5 class="portfolio-title">{{ item.title }}</h5>
          <span class="portfolio-meta">{{ item.category || 'Montaj' }} · {{ item.duration || '2 kunda' }}</span>
        </div>
      </div>
    </div>

    <div v-else class="empty-portfolio-box">
      <ImageIcon :size="36" class="empty-icon" />
      <p>Hozircha portfolio rasmlari yuklanmagan.</p>
      <button v-if="isOwnProfile" class="btn btn-secondary btn-sm" @click="showAddPortfolioModal = true">
        <Plus :size="14" /> Ish rasmlarini yuklash
      </button>
    </div>

    <!-- Add Portfolio Modal -->
    <Teleport to="body">
      <div v-if="showAddPortfolioModal" class="modal-backdrop" @click="showAddPortfolioModal = false">
        <div class="modal-card portfolio-add-modal" @click.stop>
          <div class="modal-header">
            <h3><Plus :size="18" /> Portfolioga ish qo'shish</h3>
            <button class="modal-close-btn" @click="showAddPortfolioModal = false">
              <X :size="18" />
            </button>
          </div>
          <form @submit.prevent="handleAddPortfolio" class="modal-body">
            <div class="form-group">
              <label class="form-label">Ish nomi / Qisqacha tavsifi *</label>
              <input
                v-model="newPortfolioItem.title"
                type="text"
                class="input"
                placeholder="Masalan: Yevro remont va pol yotqizish"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">Kategoriya / Yo'nalish</label>
              <input
                v-model="newPortfolioItem.category"
                type="text"
                class="input"
                placeholder="Santexnika, Elektrika, Mebel..."
              />
            </div>
            <div class="form-group">
              <label class="form-label">Bajarilgan muddat</label>
              <input
                v-model="newPortfolioItem.duration"
                type="text"
                class="input"
                placeholder="3 kun, 1 hafta..."
              />
            </div>
            <div class="form-group">
              <label class="form-label">Rasm yuklash yoki Rasm URL *</label>
              <input
                v-model="newPortfolioItem.image"
                type="url"
                class="input"
                placeholder="https://images.unsplash.com/..."
                required
              />
            </div>
            <div class="form-check-group">
              <label class="checkbox-label">
                <input v-model="newPortfolioItem.is_before_after" type="checkbox" />
                <span>Oldin va keyingi (Before & After) holat surati</span>
              </label>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showAddPortfolioModal = false">
                Bekor qilish
              </button>
              <button type="submit" class="btn btn-primary" :disabled="submittingPortfolio">
                <span v-if="submittingPortfolio" class="animate-spin loader-sm"></span>
                <span v-else>Qo'shish</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <div v-if="activeLightboxItem" class="modal-backdrop lightbox-backdrop" @click="activeLightboxItem = null">
        <div class="lightbox-content" @click.stop>
          <button class="lightbox-close" @click="activeLightboxItem = null">
            <X :size="24" />
          </button>
          <img :src="activeLightboxItem.image" :alt="activeLightboxItem.title" class="lightbox-img" />
          <div class="lightbox-caption">
            <h4>{{ activeLightboxItem.title }}</h4>
            <p>{{ activeLightboxItem.category }} · {{ activeLightboxItem.duration }}</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Image as ImageIcon, Plus, Trash2, X } from 'lucide-vue-next'

defineProps({
  portfolioItems: { type: Array, default: () => [] },
  isOwnProfile: { type: Boolean, default: false },
  submittingPortfolio: { type: Boolean, default: false }
})

const emit = defineEmits(['add-portfolio-item', 'delete-portfolio-item'])

const showAddPortfolioModal = ref(false)
const activeLightboxItem = ref(null)

const newPortfolioItem = ref({
  title: '',
  category: '',
  duration: '',
  image: '',
  is_before_after: false
})

function openLightbox(item) {
  activeLightboxItem.value = item
}

function handleAddPortfolio() {
  emit('add-portfolio-item', {
    ...newPortfolioItem.value,
    done: () => {
      showAddPortfolioModal.value = false
      newPortfolioItem.value = {
        title: '',
        category: '',
        duration: '',
        image: '',
        is_before_after: false
      }
    }
  })
}
</script>

<style scoped>
.portfolio-card {
  padding: 24px;
}

.portfolio-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.portfolio-item-card {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.portfolio-item-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.portfolio-thumb-wrap {
  position: relative;
  width: 100%;
  height: 140px;
  background: var(--color-surface);
}

.portfolio-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-ba {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.75);
  color: #F7B731;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  backdrop-filter: blur(4px);
}

.portfolio-delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(239, 68, 68, 0.85);
  color: white;
  border: none;
  border-radius: 6px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease;
}

.portfolio-delete-btn:hover {
  background: #DC2626;
}

.portfolio-info {
  padding: 12px;
}

.portfolio-title {
  margin: 0 0 4px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.portfolio-meta {
  font-size: 0.78rem;
  color: var(--color-muted);
}

.empty-portfolio-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--color-muted);
  gap: 12px;
}

.empty-icon {
  opacity: 0.4;
}

/* Modal styling */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
}

.modal-close-btn {
  background: transparent;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
}

.input {
  width: 100%;
  padding: 10px 14px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text);
  font-family: inherit;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--color-text-2);
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

/* Lightbox */
.lightbox-backdrop {
  background: rgba(0, 0, 0, 0.88);
}

.lightbox-content {
  position: relative;
  max-width: 800px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
}

.lightbox-img {
  max-width: 100%;
  max-height: 75vh;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.lightbox-caption {
  margin-top: 16px;
  text-align: center;
  color: white;
}

.lightbox-caption h4 {
  margin: 0;
  font-size: 1.1rem;
}

.lightbox-caption p {
  margin: 4px 0 0;
  font-size: 0.85rem;
  opacity: 0.8;
}
</style>
