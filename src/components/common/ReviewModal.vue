<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="show" class="review-overlay" @click.self="close">
        <div class="review-modal">

          <!-- Header -->
          <div class="review-header">
            <div class="review-header-left">
              <div class="review-icon-box">
                <Star :size="20" />
              </div>
              <div>
                <h2 class="review-title">Baholash va Sharh</h2>
                <p class="review-subtitle">Siz haqiqatan ham bu xizmatdan foydalandingizmi?</p>
              </div>
            </div>
            <button class="review-close-btn" @click="close">
              <X :size="18" />
            </button>
          </div>

          <!-- Craftsman Info -->
          <div class="review-craftsman-card" v-if="craftsman">
            <div class="rc-avatar">
              <img v-if="craftsman.avatar_url" :src="craftsman.avatar_url" :alt="craftsman.full_name" />
              <div v-else class="rc-avatar-fallback">{{ (craftsman.full_name || 'U')[0] }}</div>
            </div>
            <div class="rc-info">
              <span class="rc-name">{{ craftsman.full_name }}</span>
              <span class="rc-specialty">{{ craftsman.specialty || 'Usta' }}</span>
            </div>
          </div>

          <!-- Star Rating -->
          <div class="rating-section">
            <label class="review-label">Umumiy baho</label>
            <div class="star-row">
              <button
                v-for="i in 5"
                :key="i"
                type="button"
                class="star-btn"
                :class="{ active: i <= hoverRating || i <= rating }"
                @mouseenter="hoverRating = i"
                @mouseleave="hoverRating = 0"
                @click="rating = i"
              >
                <Star :size="32" :fill="(i <= hoverRating || i <= rating) ? 'currentColor' : 'none'" />
              </button>
            </div>
            <span class="rating-label-text">{{ ratingLabels[rating - 1] || 'Yulduz tanlang' }}</span>
          </div>

          <!-- Category Ratings -->
          <div class="category-ratings">
            <div class="cat-rating-item" v-for="cat in categories" :key="cat.key">
              <span class="cat-label">{{ cat.label }}</span>
              <div class="cat-stars">
                <button
                  v-for="i in 5"
                  :key="i"
                  type="button"
                  class="cat-star-btn"
                  :class="{ active: i <= (catRatings[cat.key] || 0) }"
                  @click="catRatings[cat.key] = i"
                >
                  <Star :size="18" :fill="i <= (catRatings[cat.key] || 0) ? 'currentColor' : 'none'" />
                </button>
              </div>
            </div>
          </div>

          <!-- Review Text -->
          <div class="review-text-section">
            <label class="review-label">Sharh yozing</label>
            <textarea
              v-model="reviewText"
              class="review-textarea"
              placeholder="Bu usta haqida boshqalar uchun foydali ma'lumot yozing... (Masalan: ish sifati, o'z vaqtida bajarish, muloqot)"
              maxlength="500"
              rows="4"
            ></textarea>
            <span class="char-count">{{ reviewText.length }} / 500</span>
          </div>

          <!-- Recommend Toggle -->
          <div class="recommend-row">
            <label class="recommend-toggle-label">
              <input type="checkbox" v-model="wouldRecommend" class="recommend-check" />
              <div class="recommend-box" :class="{ recommended: wouldRecommend }">
                <ThumbsUp :size="16" />
                <span>{{ wouldRecommend ? "Tavsiya qilaman" : "Tavsiya qilishni belgilang" }}</span>
              </div>
            </label>
          </div>

          <!-- Action Buttons -->
          <div class="review-actions">
            <button class="btn-cancel-review" @click="close">Bekor qilish</button>
            <button
              class="btn-submit-review"
              :disabled="rating === 0 || submitting"
              @click="submitReview"
            >
              <Loader2 v-if="submitting" :size="16" class="animate-spin" />
              <CheckCircle2 v-else :size="16" />
              {{ submitting ? 'Saqlanmoqda...' : 'Sharhni yuborish' }}
            </button>
          </div>

        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Star, X, ThumbsUp, CheckCircle2, Loader2 } from 'lucide-vue-next'
import { useToast } from '../../composables/useToast'

const props = defineProps({
  show: { type: Boolean, default: false },
  craftsman: { type: Object, default: null },
  serviceId: { type: String, default: null },
})
const emit = defineEmits(['close', 'submitted'])

const { addToast } = useToast()

const rating = ref(0)
const hoverRating = ref(0)
const reviewText = ref('')
const wouldRecommend = ref(true)
const submitting = ref(false)

const catRatings = reactive({})

const categories = [
  { key: 'quality', label: '🛠️ Ish sifati' },
  { key: 'timing', label: '⏰ O\'z vaqtidaligi' },
  { key: 'communication', label: '💬 Muloqot' },
  { key: 'price_quality', label: '💰 Narx-sifat' },
]

const ratingLabels = ['Yomon', 'Qoniqarsiz', 'O\'rtacha', 'Yaxshi', 'A\'lo!']

watch(() => props.show, (val) => {
  if (val) {
    rating.value = 0
    hoverRating.value = 0
    reviewText.value = ''
    wouldRecommend.value = true
    Object.keys(catRatings).forEach(k => delete catRatings[k])
  }
})

function close() {
  emit('close')
}

async function submitReview() {
  if (rating.value === 0) return
  submitting.value = true

  try {
    // Save review to localStorage (demo) + would normally save to Supabase
    const review = {
      id: Date.now().toString(),
      service_id: props.serviceId,
      craftsman_id: props.craftsman?.id,
      rating: rating.value,
      category_ratings: { ...catRatings },
      text: reviewText.value.trim(),
      would_recommend: wouldRecommend.value,
      created_at: new Date().toISOString(),
    }

    // Persist locally
    const key = `nexsora_reviews_${props.serviceId || 'general'}`
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    existing.unshift(review)
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)))

    await new Promise(r => setTimeout(r, 800)) // UX delay

    addToast({
      type: 'success',
      title: 'Sharh yuborildi! ⭐',
      message: 'Rahmat! Sizning sharhingiz boshqalarga yordam beradi.',
    })

    emit('submitted', review)
    close()
  } catch (e) {
    addToast({ type: 'error', message: 'Xatolik yuz berdi, qayta urinib ko\'ring' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.review-overlay {
  position: fixed; inset: 0; z-index: 9000;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}

.review-modal {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  width: 100%; max-width: 520px;
  padding: 28px;
  display: flex; flex-direction: column; gap: 22px;
  max-height: 90vh; overflow-y: auto;
}

/* Header */
.review-header { display: flex; align-items: flex-start; justify-content: space-between; }
.review-header-left { display: flex; align-items: center; gap: 12px; }
.review-icon-box {
  width: 42px; height: 42px; border-radius: 12px;
  background: rgba(247,183,49,0.15); color: #F7B731;
  display: flex; align-items: center; justify-content: center;
}
.review-title { font-size: 1.1rem; font-weight: 700; color: var(--color-text); margin: 0; }
.review-subtitle { font-size: 0.8rem; color: var(--color-text-2); margin: 0; }
.review-close-btn {
  background: var(--color-surface-2); border: 1px solid var(--color-border);
  color: var(--color-text-2); width: 32px; height: 32px; border-radius: 8px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; flex-shrink: 0;
}
.review-close-btn:hover { background: var(--color-card-hover); color: var(--color-text); }

/* Craftsman card */
.review-craftsman-card {
  display: flex; align-items: center; gap: 12px;
  background: var(--color-surface-2); border: 1px solid var(--color-border);
  padding: 12px 16px; border-radius: 12px;
}
.rc-avatar { width: 42px; height: 42px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
.rc-avatar img { width: 100%; height: 100%; object-fit: cover; }
.rc-avatar-fallback {
  width: 100%; height: 100%; background: var(--gradient-primary);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 1.1rem;
}
.rc-info { display: flex; flex-direction: column; gap: 2px; }
.rc-name { font-size: 0.9rem; font-weight: 700; color: var(--color-text); }
.rc-specialty { font-size: 0.78rem; color: var(--color-text-2); }

/* Stars */
.rating-section { display: flex; flex-direction: column; gap: 10px; align-items: center; }
.review-label { font-size: 0.85rem; font-weight: 600; color: var(--color-text-2); align-self: flex-start; }
.star-row { display: flex; gap: 6px; }
.star-btn {
  background: none; border: none; cursor: pointer;
  color: var(--color-muted); padding: 4px;
  transition: all 0.15s; line-height: 1;
}
.star-btn.active { color: #F7B731; transform: scale(1.1); }
.star-btn:hover { transform: scale(1.2); }
.rating-label-text { font-size: 0.85rem; font-weight: 600; color: #F7B731; min-height: 20px; }

/* Category ratings */
.category-ratings {
  display: flex; flex-direction: column; gap: 10px;
  background: var(--color-surface-2); border-radius: 12px; padding: 14px;
}
.cat-rating-item { display: flex; align-items: center; justify-content: space-between; }
.cat-label { font-size: 0.82rem; color: var(--color-text-2); }
.cat-stars { display: flex; gap: 3px; }
.cat-star-btn {
  background: none; border: none; cursor: pointer;
  color: var(--color-muted); padding: 2px; line-height: 1; transition: all 0.15s;
}
.cat-star-btn.active { color: #F7B731; }
.cat-star-btn:hover { transform: scale(1.2); }

/* Review text */
.review-text-section { display: flex; flex-direction: column; gap: 8px; position: relative; }
.review-textarea {
  width: 100%; background: var(--color-surface-2);
  border: 1px solid var(--color-border); border-radius: 12px;
  padding: 12px 14px; color: var(--color-text); font-size: 0.875rem;
  font-family: var(--font-body); resize: vertical; outline: none;
  transition: border-color 0.2s; box-sizing: border-box;
  min-height: 100px;
}
.review-textarea:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(108,99,255,0.1); }
.char-count { font-size: 0.75rem; color: var(--color-muted); text-align: right; }

/* Recommend */
.recommend-row { display: flex; }
.recommend-toggle-label { cursor: pointer; }
.recommend-toggle-label input { display: none; }
.recommend-box {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px; border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-2); color: var(--color-text-2);
  font-size: 0.875rem; font-weight: 600; transition: all 0.2s;
}
.recommend-box.recommended {
  background: rgba(67,233,123,0.1); border-color: rgba(67,233,123,0.3);
  color: var(--color-success);
}

/* Actions */
.review-actions { display: flex; gap: 10px; }
.btn-cancel-review {
  flex: 1; padding: 11px; background: transparent;
  border: 1px solid var(--color-border); color: var(--color-text-2);
  border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-cancel-review:hover { border-color: var(--color-primary); color: var(--color-primary); }
.btn-submit-review {
  flex: 2; padding: 11px 20px; background: var(--gradient-primary);
  border: none; color: #fff; border-radius: 12px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.2s; box-shadow: 0 4px 14px rgba(108,99,255,0.35);
}
.btn-submit-review:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-submit-review:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(108,99,255,0.5); }

/* Modal transition */
.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .review-modal, .modal-fade-leave-to .review-modal { transform: scale(0.95) translateY(10px); }
</style>
