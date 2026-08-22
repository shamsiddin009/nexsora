<template>
  <div class="card reviews-card">
    <div class="reviews-header">
      <div>
        <h3 class="section-heading" style="margin-bottom: 0">
          <Star :size="18" /> Mijozlar sharhlari va baholar
        </h3>
        <p style="color: var(--color-text-2); font-size: 0.85rem; margin-top: 2px">
          Ushbu usta haqida qoldirilgan barcha xolis fikrlar
        </p>
      </div>
      <button v-if="!isOwnProfile" class="btn btn-primary btn-sm" @click="$emit('open-review-modal')">
        <Plus :size="15" /> Sharh qoldirish
      </button>
    </div>

    <!-- Rating Summary Bar Breakdown -->
    <div v-if="reviews.length > 0" class="rating-overview-card">
      <div class="rating-overview-left">
        <h1 class="big-rating-num">{{ averageRating.toFixed(1) }}</h1>
        <div class="rating-stars">
          <Star
            v-for="s in 5"
            :key="s"
            :size="18"
            :class="s <= Math.round(averageRating) ? 'star-filled' : 'star-empty'"
          />
        </div>
        <span class="total-reviews-count">{{ reviews.length }} ta sharh</span>
      </div>

      <div class="rating-breakdown-bars">
        <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="breakdown-row">
          <span class="star-label">{{ star }} <Star :size="12" class="mini-star" /></span>
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: `${getRatingPercentage(star)}%` }"
            ></div>
          </div>
          <span class="count-label">{{ getRatingCount(star) }}</span>
        </div>
      </div>
    </div>

    <!-- Filter Buttons -->
    <div v-if="reviews.length > 0" class="review-filter-chips">
      <button
        class="filter-chip"
        :class="{ active: selectedRatingFilter === null }"
        @click="selectedRatingFilter = null"
      >
        Barchasi ({{ reviews.length }})
      </button>
      <button
        v-for="star in [5, 4, 3, 2, 1]"
        :key="star"
        class="filter-chip"
        :class="{ active: selectedRatingFilter === star }"
        @click="selectedRatingFilter = star"
      >
        {{ star }} ⭐ ({{ getRatingCount(star) }})
      </button>
    </div>

    <!-- Reviews List -->
    <div v-if="filteredReviews.length > 0" class="reviews-list">
      <div v-for="review in filteredReviews" :key="review.id" class="review-item">
        <div class="review-item-header">
          <div class="review-author-info">
            <div class="avatar-placeholder avatar-sm">
              <span>{{ getInitials(review.author_name || 'Mijoz') }}</span>
            </div>
            <div>
              <h5 class="review-author-name">{{ review.author_name || 'Mijoz' }}</h5>
              <span class="review-date">{{ formatDate(review.created_at) }}</span>
            </div>
          </div>
          <div class="review-stars-badge">
            <Star
              v-for="s in 5"
              :key="s"
              :size="14"
              :class="s <= (Number(review.rating) || 5) ? 'star-filled' : 'star-empty'"
            />
          </div>
        </div>
        <p class="review-comment-text">{{ review.comment }}</p>
      </div>
    </div>

    <div v-else class="empty-reviews-box">
      <MessageSquare :size="36" class="empty-icon" />
      <p v-if="selectedRatingFilter">Ushbu baho bo'yicha sharhlar yo'q.</p>
      <p v-else>Hozircha hech qanday sharh qoldirilmagan.</p>
      <button v-if="!isOwnProfile" class="btn btn-secondary btn-sm" @click="$emit('open-review-modal')">
        <Star :size="14" /> Birinchi bo'lib sharh qoldiring
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Star, Plus, MessageSquare } from 'lucide-vue-next'
import { getInitials, formatDate } from '../../utils'

const props = defineProps({
  reviews: { type: Array, default: () => [] },
  averageRating: { type: Number, default: 5 },
  isOwnProfile: { type: Boolean, default: false }
})

defineEmits(['open-review-modal'])

const selectedRatingFilter = ref(null)

const filteredReviews = computed(() => {
  if (selectedRatingFilter.value === null) return props.reviews
  return props.reviews.filter(r => Math.round(Number(r.rating) || 5) === selectedRatingFilter.value)
})

function getRatingCount(star) {
  return props.reviews.filter(r => Math.round(Number(r.rating) || 5) === star).length
}

function getRatingPercentage(star) {
  if (props.reviews.length === 0) return 0
  return (getRatingCount(star) / props.reviews.length) * 100
}
</script>

<style scoped>
.reviews-card {
  padding: 24px;
}

.reviews-header {
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

.rating-overview-card {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 20px;
}

.rating-overview-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.big-rating-num {
  font-size: 2.6rem;
  font-weight: 900;
  color: var(--color-text);
  margin: 0;
  line-height: 1;
}

.rating-stars {
  display: flex;
  gap: 3px;
  margin: 6px 0;
}

.star-filled {
  color: #F7B731;
  fill: #F7B731;
}

.star-empty {
  color: var(--color-border);
}

.mini-star {
  color: #F7B731;
  fill: #F7B731;
}

.total-reviews-count {
  font-size: 0.8rem;
  color: var(--color-muted);
}

.rating-breakdown-bars {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.breakdown-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.82rem;
}

.star-label {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  width: 32px;
  font-weight: 600;
  color: var(--color-text);
}

.progress-track {
  flex: 1;
  height: 8px;
  background: var(--color-surface);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #F7B731;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.count-label {
  width: 24px;
  text-align: right;
  color: var(--color-muted);
}

.review-filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.filter-chip {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-2);
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-text);
}

.filter-chip.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.review-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.review-author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.review-author-name {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-text);
}

.review-date {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.review-stars-badge {
  display: flex;
  gap: 2px;
}

.review-comment-text {
  color: var(--color-text-2);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.empty-reviews-box {
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

@media (max-width: 600px) {
  .rating-overview-card {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
