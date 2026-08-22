<template>
  <div class="profile-header-card">
    <div
      class="profile-avatar-box"
      :class="{ 'avatar-interactive': isOwnProfile }"
      @click="isOwnProfile && $emit('trigger-file-upload')"
      :title="isOwnProfile ? 'Rasm yuklash yoki almashtirish' : ''"
    >
      <div class="avatar-placeholder avatar-xl">
        <img
          v-if="userAvatarUrl"
          :src="userAvatarUrl"
          :alt="displayedUser?.full_name"
          class="avatar-img"
        />
        <span v-else>{{ getInitials(displayedUser?.full_name || authStore.profile?.full_name) }}</span>

        <!-- Hover Overlay with + Icon -->
        <div v-if="isOwnProfile" class="avatar-hover-overlay">
          <span v-if="uploadingAvatar" class="animate-spin loader-sm"></span>
          <Plus v-else :size="32" class="plus-icon" />
        </div>
      </div>

      <!-- Online Indicator -->
      <span class="online-status"></span>
    </div>

    <div class="profile-meta-info">
      <div class="profile-title-row">
        <h2>{{ displayedUser?.full_name || 'Foydalanuvchi' }}</h2>
        <span class="badge" :class="isCraftsman ? 'badge-primary' : 'badge-secondary'">
          {{ isCraftsman ? 'Usta' : 'Mijoz' }}
        </span>
        <span v-if="isCraftsman" class="verified-badge">
          <CheckCircle2 :size="15" /> Tasdiqlangan usta
        </span>
      </div>

      <div class="profile-sub-meta">
        <span><MapPin :size="15" /> {{ displayedUser?.city || authStore.profile?.city || 'Shahar ko\'rsatilmagan' }}</span>
        <span><Calendar :size="15" /> A'zo bo'lgan: {{ formatDate(displayedUser?.created_at || authStore.profile?.created_at || new Date()) }}</span>
        <span v-if="displayedUser?.phone || authStore.profile?.phone"><Phone :size="15" /> {{ displayedUser?.phone || authStore.profile?.phone }}</span>
        <span v-if="userTelegramUsername" class="telegram-badge-sub"><Send :size="13" /> {{ userTelegramUsername }}</span>
      </div>

      <!-- Rating badge -->
      <div class="rating-badge-row">
        <div class="rating-stars">
          <Star
            v-for="s in 5"
            :key="s"
            :size="16"
            :class="s <= Math.round(averageRating) ? 'star-filled' : 'star-empty'"
          />
        </div>
        <span class="rating-num">{{ averageRating.toFixed(1) }}</span>
        <span class="rating-count">({{ reviewsCount }} ta sharh)</span>
      </div>
    </div>

    <!-- Profile Action Buttons -->
    <div class="profile-actions">
      <router-link v-if="isOwnProfile" to="/settings" class="btn btn-primary">
        <Settings :size="16" /> Sozlamalar
      </router-link>
      <template v-else>
        <!-- Call Phone Button -->
        <a
          v-if="displayedUser?.phone"
          :href="`tel:${displayedUser.phone.replace(/\\s+/g, '')}`"
          class="btn btn-success"
          title="Qo'ng'iroq qilish"
        >
          <Phone :size="16" />
          <span>Qo'ng'iroq</span>
        </a>

        <!-- Telegram Button -->
        <a
          v-if="userTelegramLink"
          :href="userTelegramLink"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-secondary telegram-btn"
          title="Telegram orqali bog'lanish"
        >
          <Send :size="16" />
          <span>Telegram</span>
        </a>

        <!-- Direct Chat Button -->
        <button
          class="btn btn-primary"
          :disabled="startingChat"
          @click="$emit('start-chat')"
          title="Xabar yozish"
        >
          <MessageSquare :size="16" />
          <span>{{ startingChat ? 'Ochilmoqda...' : 'Xabar yozish' }}</span>
        </button>

        <button class="btn btn-secondary" @click="$emit('open-review-modal')">
          <Star :size="16" /> Sharh
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import {
  Plus, CheckCircle2, MapPin, Calendar, Phone, Send, Star, Settings, MessageSquare
} from 'lucide-vue-next'
import { getInitials, formatDate } from '../../utils'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

defineProps({
  displayedUser: { type: Object, default: null },
  isOwnProfile: { type: Boolean, default: false },
  isCraftsman: { type: Boolean, default: false },
  userAvatarUrl: { type: String, default: '' },
  uploadingAvatar: { type: Boolean, default: false },
  userTelegramUsername: { type: String, default: '' },
  userTelegramLink: { type: String, default: '' },
  averageRating: { type: Number, default: 5 },
  reviewsCount: { type: Number, default: 0 },
  startingChat: { type: Boolean, default: false }
})

defineEmits(['trigger-file-upload', 'start-chat', 'open-review-modal'])
</script>

<style scoped>
.profile-header-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
  flex-wrap: wrap;
}

.profile-avatar-box {
  position: relative;
  flex-shrink: 0;
}

.avatar-interactive {
  cursor: pointer;
}

.avatar-xl {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  color: white;
  font-size: 2rem;
  font-weight: 700;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.avatar-interactive:hover .avatar-hover-overlay {
  opacity: 1;
}

.plus-icon {
  color: white;
}

.online-status {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-success, #10B981);
  border: 3px solid var(--color-surface);
}

.profile-meta-info {
  flex: 1;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.profile-title-row h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text);
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-success, #10B981);
  font-size: 0.82rem;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.1);
  padding: 4px 10px;
  border-radius: 999px;
}

.profile-sub-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: var(--color-text-2);
}

.profile-sub-meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.telegram-badge-sub {
  color: #0088cc;
  font-weight: 600;
}

.rating-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.rating-stars {
  display: flex;
  align-items: center;
  gap: 2px;
}

.star-filled {
  color: #F7B731;
  fill: #F7B731;
}

.star-empty {
  color: var(--color-border);
}

.rating-num {
  font-weight: 800;
  font-size: 1rem;
  color: var(--color-text);
}

.rating-count {
  font-size: 0.82rem;
  color: var(--color-muted);
}

.profile-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.telegram-btn {
  background: #0088cc;
  color: white;
  border-color: #0088cc;
}

.telegram-btn:hover {
  background: #0077b5;
}

@media (max-width: 768px) {
  .profile-header-card {
    padding: 20px;
    gap: 16px;
  }
  .profile-avatar-box {
    margin: 0 auto;
  }
  .profile-meta-info {
    text-align: center;
  }
  .profile-title-row, .profile-sub-meta, .rating-badge-row {
    justify-content: center;
  }
  .profile-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>
