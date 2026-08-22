<template>
  <div class="new-service-page">
    <main class="container new-service-content">
      <div class="card form-card">
        
        <!-- Header -->
        <div class="form-header-box">
          <div class="icon-circle">
            <Sparkles :size="24" />
          </div>
          <div>
            <h1 class="page-title">Yangi xizmat yaratish</h1>
            <p class="page-subtitle">O'z mahoratingizni ko'rsatuvchi xizmat e'lon qiling va yangi mijozlarni jalb qiling</p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="service-form">
          
          <!-- 1. Title -->
          <div class="input-group">
            <label class="input-label">Xizmat sarlavhasi *</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="Masalan: Barcha turdagi santexnika montaji va kranlarni o'rnatish"
              class="input"
              required
            />
            <span class="field-hint">Mijozlar qidirganda aniq tushunadigan sarlavha yozing</span>
          </div>

          <!-- 2. Category & City -->
          <div class="form-row-2">
            <div class="input-group">
              <label class="input-label">Kategoriya *</label>
              <CustomSelect
                v-model="form.category"
                :options="CATEGORY_OPTIONS"
                placeholder="Kategoriya tanlang"
                search-placeholder="Kategoriyani qidirish..."
              />
            </div>

            <div class="input-group">
              <label class="input-label">Shahar / Viloyat *</label>
              <CustomSelect
                v-model="form.city"
                :options="CITY_OPTIONS"
                placeholder="Shahar tanlang"
                search-placeholder="Shaharni qidirish..."
              />
            </div>
          </div>

          <!-- 3. Price & Duration -->
          <div class="form-row-2">
            <div class="input-group">
              <CurrencyInput
                v-model="form.price"
                label="Boshlang'ich narx"
                placeholder="300 000"
                :required="true"
                :min="10000"
                :quick-presets="[100000, 300000, 500000, 1000000]"
                :step="50000"
              />
            </div>

            <div class="input-group">
              <label class="input-label">Bajarish muddati (kun) *</label>
              <input
                v-model="form.duration_days"
                type="number"
                placeholder="1"
                class="input"
                required
                min="1"
                max="90"
              />
            </div>
          </div>

          <!-- 4. Cover Image Upload -->
          <div class="input-group">
            <label class="input-label">Xizmat muqovasi (Portfolio rasmi) *</label>
            
            <div class="cover-uploader-box" @click="triggerFileInput">
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleImageUpload"
              />

              <div v-if="form.cover_image" class="cover-preview">
                <img :src="form.cover_image" alt="Cover preview" class="preview-img" />
                <button type="button" class="change-img-btn" @click.stop="triggerFileInput">
                  <Upload :size="14" /> Rasmni almashtirish
                </button>
              </div>

              <div v-else class="upload-placeholder">
                <div class="upload-icon-circle">
                  <Upload :size="24" />
                </div>
                <div class="upload-text">
                  <span class="upload-title">Rasm yuklash uchun bu yerga bosing</span>
                  <span class="upload-sub">PNG, JPG yoki WebP formatida (avtomatik siqiladi)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 5. Description -->
          <div class="input-group">
            <label class="input-label">Xizmatning to'liq tavsifi *</label>
            <textarea
              v-model="form.description"
              rows="6"
              class="textarea"
              placeholder="Xizmatingiz nimadan iboratligi, qanday asbob-uskunalar ishlatishingiz va kafolatlaringiz haqida yozing..."
              required
            />
          </div>

          <!-- 6. Inclusions (Xizmatga nimalar kiradi?) -->
          <div class="input-group">
            <label class="input-label">Xizmatga nimalar kiradi? (Bandma-band)</label>
            
            <div class="inclusions-input-row">
              <input
                v-model="newInclusion"
                type="text"
                placeholder="Masalan: Joyiga borib o'lchash va diagnostika qilish"
                class="input"
                @keyup.enter.prevent="addInclusion"
              />
              <button type="button" class="btn btn-secondary btn-sm" @click="addInclusion">
                <Plus :size="16" /> Qo'shish
              </button>
            </div>

            <div v-if="form.includes.length > 0" class="inclusions-chips">
              <div v-for="(inc, idx) in form.includes" :key="idx" class="inc-chip">
                <Check :size="14" class="check-icon" />
                <span>{{ inc }}</span>
                <button type="button" class="remove-chip-btn" @click="removeInclusion(idx)">
                  <X :size="12" />
                </button>
              </div>
            </div>
          </div>

          <!-- Error Alert -->
          <div v-if="error" class="error-box">
            <AlertCircle :size="16" />
            <span>{{ error }}</span>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <router-link to="/services" class="btn btn-secondary">
              Bekor qilish
            </router-link>
            <button type="submit" class="btn btn-primary btn-lg" :disabled="submitting">
              <span v-if="submitting" class="animate-spin loader"></span>
              <template v-else>
                <Sparkles :size="18" />
                <span>Xizmatni e'lon qilish</span>
              </template>
            </button>
          </div>

        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CustomSelect from '../components/CustomSelect.vue'
import CurrencyInput from '../components/common/CurrencyInput.vue'
import { useAuthStore } from '../stores/auth'
import { CATEGORY_OPTIONS, CITY_OPTIONS, JOB_CATEGORIES, UZ_CITIES } from '../utils'
import {
  Sparkles, Upload, Plus, Check, X, AlertCircle
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const fileInputRef = ref(null)
const submitting = ref(false)
const error = ref('')
const newInclusion = ref('')

const form = ref({
  title: '',
  category: '',
  city: authStore.profile?.city || '',
  price: '',
  duration_days: 1,
  cover_image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
  description: '',
  includes: [
    'Joyiga borib diagnostika qilish',
    'Sifatli asbob-uskunalar bilan bajarish',
    'Ish natijasiga kafolat berish'
  ]
})

function triggerFileInput() {
  fileInputRef.value?.click()
}

function compressAndResizeImage(file, maxWidth = 800, maxHeight = 500, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}

async function handleImageUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const compressed = await compressAndResizeImage(file)
    form.value.cover_image = compressed
  } catch (err) {
    console.error('Image upload error:', err)
  }
}

function addInclusion() {
  if (!newInclusion.value.trim()) return
  form.value.includes.push(newInclusion.value.trim())
  newInclusion.value = ''
}

function removeInclusion(idx) {
  form.value.includes.splice(idx, 1)
}

async function handleSubmit() {
  if (!form.value.title || !form.value.category || !form.value.city || !form.value.price) {
    error.value = "Iltimos, barcha majburiy maydonlarni to'ldiring"
    return
  }

  submitting.value = true
  error.value = ''

  try {
    const newServiceObj = {
      id: 'srv-custom-' + Date.now(),
      title: form.value.title.trim(),
      category: form.value.category,
      city: form.value.city,
      price: Number(form.value.price),
      duration_days: Number(form.value.duration_days) || 1,
      cover_image: form.value.cover_image,
      description: form.value.description.trim(),
      includes: form.value.includes,
      rating: 5.0,
      reviews_count: 0,
      orders_count: 0,
      created_at: new Date().toISOString(),
      craftsman: {
        id: authStore.user?.id || 'current-user',
        full_name: authStore.profile?.full_name || 'Usta',
        specialty: form.value.category,
        city: form.value.city,
        phone: authStore.profile?.phone || '',
        avatar_url: authStore.profile?.avatar_url || '',
        experience_yrs: 3,
        rating: 5.0,
        reviews_count: 0,
        completed_jobs: 0
      }
    }

    // Save to local storage custom services
    let currentList = []
    try {
      const saved = localStorage.getItem('nexsora_custom_services')
      if (saved) currentList = JSON.parse(saved)
    } catch (e) {}

    currentList.unshift(newServiceObj)
    localStorage.setItem('nexsora_custom_services', JSON.stringify(currentList))

    router.push(`/services/${newServiceObj.id}`)
  } catch (err) {
    console.error('Create service error:', err)
    error.value = "Xizmatni yaratishda xatolik yuz berdi"
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.new-service-page {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
}

.new-service-content {
  padding: 40px 24px 70px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
}

.form-card {
  padding: 36px;
  border-radius: 24px;
}

.form-header-box {
  display: flex;
  align-items: center;
  gap: 18px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 24px;
  margin-bottom: 28px;
}

.icon-circle {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(108, 99, 255, 0.18) 0%, rgba(67, 233, 123, 0.18) 100%);
  border: 1px solid rgba(108, 99, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-light);
  flex-shrink: 0;
}

.page-title {
  font-size: 1.55rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-2);
  margin-top: 4px;
}

.service-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.field-hint {
  font-size: 0.78rem;
  color: var(--color-muted);
  margin-top: 4px;
}

/* Cover Uploader */
.cover-uploader-box {
  border: 2px dashed var(--color-border);
  border-radius: 18px;
  background: var(--color-surface);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cover-uploader-box:hover {
  border-color: var(--color-primary);
  background: var(--color-surface-2);
}

.upload-placeholder {
  padding: 36px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.upload-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(108, 99, 255, 0.12);
  color: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
}

.upload-sub {
  font-size: 0.8rem;
  color: var(--color-muted);
}

.cover-preview {
  width: 100%;
  height: 240px;
  position: relative;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.change-img-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Inclusions */
.inclusions-input-row {
  display: flex;
  gap: 10px;
}

.inclusions-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.inc-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--color-text);
}

.check-icon {
  color: var(--color-success);
}

.remove-chip-btn {
  background: transparent;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 2px;
}

.remove-chip-btn:hover {
  color: var(--color-error);
}

.error-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(255, 71, 87, 0.12);
  color: var(--color-error);
  border: 1px solid rgba(255, 71, 87, 0.25);
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 14px;
  margin-top: 10px;
}

@media (max-width: 640px) {
  .form-row-2 {
    grid-template-columns: 1fr;
  }
  .form-card {
    padding: 24px 18px;
  }
}
</style>
