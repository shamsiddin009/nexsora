<template>
  <Teleport to="body">
    <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal-dialog review-modal-dialog">
        <div class="modal-header">
          <div class="modal-title-box">
            <div class="modal-icon-badge">
              <Award :size="22" />
            </div>
            <div>
              <h3 class="modal-heading">
                {{ reviewMode === 'client_rates_craftsman' ? 'Ishni qabul qilish va baholash' : 'Mijozni baholash va sharh qoldirish' }}
              </h3>
              <p class="modal-subtitle">
                {{ reviewMode === 'client_rates_craftsman' ? 'Usta:' : 'Mijoz:' }} 
                <strong>{{ partnerName || 'Foydalanuvchi' }}</strong>
              </p>
            </div>
          </div>
          <button class="modal-close-btn" @click="$emit('close')" title="Yopish">
            <X :size="18" />
          </button>
        </div>

        <div class="modal-body">
          <!-- Job Summary Card -->
          <div class="modal-job-summary">
            <div class="summary-label">E'lon / Buyurtma:</div>
            <div class="summary-title">{{ job?.title }}</div>
            <div class="summary-meta">
              <span v-if="offerPrice">Kelishilgan summa: <strong>{{ formatPrice(offerPrice) }}</strong></span>
              <span v-else>Byudjet: <strong>{{ formatPrice(job?.budget_max || job?.budget_min) }}</strong></span>
            </div>
          </div>

          <!-- Star Rating Section -->
          <div class="rating-section">
            <label class="section-label">
              {{ reviewMode === 'client_rates_craftsman' ? 'Ustaning xizmat sifatiga baho bering:' : 'Mijozning to\'lov va muomilasiga baho bering:' }}
            </label>
            <div class="stars-interactive-row">
              <button
                v-for="s in 5"
                :key="s"
                type="button"
                class="star-pick-btn"
                :class="{ 'star-active': s <= (hoverRating || rating) }"
                @mouseenter="hoverRating = s"
                @mouseleave="hoverRating = 0"
                @click="rating = s"
              >
                <Star :size="32" class="star-svg" />
              </button>
            </div>
            <div class="rating-verbal-score">
              <span class="score-badge">{{ rating }} / 5</span>
              <span class="score-text">{{ getRatingLabel(rating) }}</span>
            </div>
          </div>

          <!-- Quick Impressions -->
          <div class="tags-section">
            <label class="section-label">Tezkor taassurotlar (tanlash mumkin):</label>
            <div class="tags-wrap">
              <button
                v-for="tag in currentQuickTags"
                :key="tag"
                type="button"
                class="tag-chip"
                :class="{ active: selectedTags.includes(tag) }"
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </div>

          <!-- Review Comment Textarea -->
          <div class="comment-section">
            <label class="section-label">Batafsil sharhingiz (ixtiyoriy):</label>
            <textarea
              v-model="comment"
              class="modal-textarea"
              rows="3"
              :placeholder="reviewMode === 'client_rates_craftsman' ? 'Usta ishi, sifati va muomilasi haqida fikringizni yozing...' : 'Mijozning to\'lovi, muomilasi va narx shartlari haqida xolis fikringizni yozing (boshqa ustalar ko\'rishi uchun)...'"
            />
          </div>

          <div v-if="error" class="modal-error-box">
            <AlertCircle :size="16" />
            <span>{{ error }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="submitting"
            @click="$emit('close')"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            class="btn btn-success submit-finish-btn"
            :disabled="submitting"
            @click="handleSubmit"
          >
            <span v-if="submitting" class="animate-spin loader"></span>
            <template v-else>
              <CheckCircle2 :size="16" />
              <span>{{ reviewMode === 'client_rates_craftsman' ? 'Ishni yakunlash va tasdiqlash' : 'Bahoni saqlash' }}</span>
            </template>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Award, Star, X, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import { formatPrice } from '../../utils'

const props = defineProps({
  show: Boolean,
  reviewMode: {
    type: String,
    default: 'client_rates_craftsman'
  },
  partnerName: String,
  job: Object,
  offerPrice: [Number, String],
  submitting: Boolean,
  error: String
})

const emit = defineEmits(['close', 'submit'])

const rating = ref(5)
const hoverRating = ref(0)
const comment = ref('')
const selectedTags = ref([])

const craftsmanQuickTags = [
  'Tez va sifatli',
  'A\'lo natija',
  'Xushmuomala usta',
  'Narxiga arziydi',
  'O\'z vaqtida topshirdi',
  'Ish joyini toza qoldirdi'
]

const clientQuickTags = [
  'O\'z vaqtida to\'ladi',
  'Xushmuomala va samimiy',
  'Talabni aniq tushuntirdi',
  'Tezda qabul qildi',
  'Ajoyib mijoz'
]

const currentQuickTags = computed(() => {
  return props.reviewMode === 'client_rates_craftsman' ? craftsmanQuickTags : clientQuickTags
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    rating.value = 5
    hoverRating.value = 0
    comment.value = ''
    selectedTags.value = props.reviewMode === 'client_rates_craftsman' 
      ? ['Tez va sifatli', 'A\'lo natija']
      : ['O\'z vaqtida to\'ladi', 'Xushmuomala va samimiy']
  }
})

function toggleTag(tag) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
}

function getRatingLabel(r) {
  switch (r) {
    case 5: return "A'lo darajada (Tavsiya qilaman)"
    case 4: return "Juda yaxshi"
    case 3: return "Yaxshi"
    case 2: return "Qoniqarli"
    case 1: return "Qoniqarsiz"
    default: return ""
  }
}

function handleSubmit() {
  emit('submit', {
    rating: rating.value,
    comment: comment.value,
    selectedTags: selectedTags.value
  })
}
</script>
