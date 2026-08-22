<template>
  <div class="conversation-header">
    <div class="header-left-box">
      <button class="mobile-back-btn" @click="$emit('back')" title="Orqaga">
        <ArrowLeft :size="20" />
      </button>

      <div class="header-user-info">
        <div class="avatar-placeholder avatar-sm">
          <img
            v-if="partner?.avatar_url"
            :src="partner.avatar_url"
            :alt="partner?.full_name"
            class="avatar-img"
          />
          <span v-else>{{ getInitials(partner?.full_name) }}</span>
        </div>
        <div class="user-text-col">
          <div class="header-name">{{ partner?.full_name || 'Foydalanuvchi' }}</div>
          <div class="header-status">
            <span class="status-dot"></span>
            <span>Onlayn</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Header Right: Job Pill & Actions -->
    <div class="header-right-box">
      <div v-if="chat.jobs" class="header-job-badge">
        <router-link :to="`/jobs/${chat.jobs.id || chat.job_id}`" class="job-link-pill">
          <Briefcase :size="13" />
          <span>{{ chat.jobs.category }}: {{ chat.jobs.title?.slice(0, 18) }}...</span>
        </router-link>
      </div>

      <ChatHeaderActions
        v-if="chat.jobs"
        :is-client="isClient"
        :is-craftsman="isCraftsman"
        :job-status="chat.jobs.status"
        :sending="sending"
        @open-escrow="$emit('open-escrow')"
        @open-complete="$emit('open-complete')"
        @open-revision="$emit('open-revision')"
        @notify-done="$emit('notify-done')"
        @notify-fixed="$emit('notify-fixed')"
        @open-rate-client="$emit('open-rate-client')"
      />
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft, Briefcase } from 'lucide-vue-next'
import { getInitials } from '../../utils'
import ChatHeaderActions from './ChatHeaderActions.vue'

defineProps({
  chat: { type: Object, required: true },
  partner: { type: Object, default: null },
  isClient: { type: Boolean, default: false },
  isCraftsman: { type: Boolean, default: false },
  sending: { type: Boolean, default: false },
})

defineEmits(['back', 'open-escrow', 'open-complete', 'open-revision', 'notify-done', 'notify-fixed', 'open-rate-client'])
</script>

<style scoped>
.conversation-header {
  padding: 12px 20px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.header-left-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-back-btn {
  display: none;
  background: transparent;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 4px;
}

@media (max-width: 768px) {
  .mobile-back-btn { display: flex; }
}

.header-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-text-col { display: flex; flex-direction: column; }

.header-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

.header-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--color-success);
  font-weight: 500;
}

.status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--color-success);
}

.header-right-box {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.job-link-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(108, 99, 255, 0.1);
  border: 1px solid rgba(108, 99, 255, 0.25);
  color: var(--color-primary-light);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 999px;
  text-decoration: none;
  transition: all 0.15s ease;
}

.job-link-pill:hover { background: rgba(108, 99, 255, 0.2); }
</style>
