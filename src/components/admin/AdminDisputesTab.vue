<template>
  <div class="admin-card card">
    <div class="card-header-clean">
      <div>
        <h3>🛡️ Escrow Arbitraj & Nizo Hal Qilish Markazi</h3>
        <p>Mijoz yoki usta ish natijasidan norozi bo'lganida platforma admini xolis qaror qabul qiladi</p>
      </div>
      <span class="badge badge-warning">{{ disputesList.length }} ta masala</span>
    </div>

    <div v-if="disputesList.length === 0" class="empty-admin-box">
      <CheckCircle2 :size="48" class="text-success" />
      <h4>Hozirda hech qanday nizo yo'q!</h4>
      <p>Barcha xavfsiz bitimlar tinch va kelishilgan holda bajarilmoqda.</p>
    </div>

    <div v-else class="disputes-list">
      <div v-for="disp in disputesList" :key="disp.id" class="dispute-card">
        <div class="dispute-header">
          <div class="dispute-title-box">
            <span class="dispute-id">#{{ disp.id }}</span>
            <h4 class="dispute-job-title">{{ disp.jobTitle }}</h4>
          </div>
          <div class="dispute-price-tag">
            <span class="price-sub">Muzlatilgan summa:</span>
            <strong class="price-main">{{ formatPrice(disp.amount) }}</strong>
          </div>
        </div>

        <div class="dispute-parties-grid">
          <!-- Client side -->
          <div class="party-box client-box">
            <div class="party-role"><User :size="15" /> Mijoz: <strong>{{ disp.clientName }}</strong></div>
            <div class="party-reason">
              <span class="reason-label">Mijoz e'tirozi:</span>
              <p>"{{ disp.clientComplaint }}"</p>
            </div>
          </div>

          <!-- VS Divider -->
          <div class="party-vs">VS</div>

          <!-- Craftsman side -->
          <div class="party-box craftsman-box">
            <div class="party-role"><Wrench :size="15" /> Usta: <strong>{{ disp.craftsmanName }}</strong> (⭐ {{ disp.craftsmanRating }})</div>
            <div class="party-reason">
              <span class="reason-label">Usta javobi:</span>
              <p>"{{ disp.craftsmanDefense }}"</p>
            </div>
          </div>
        </div>

        <!-- Admin Verdict Actions -->
        <div class="dispute-actions-bar">
          <span class="actions-label">Admin Hukmi:</span>
          <div class="verdict-buttons">
            <button
              class="btn btn-success btn-sm"
              @click="$emit('resolve-dispute', disp, 'release_craftsman')"
              :disabled="disp.resolved"
            >
              <Check :size="14" />
              <span>Ustaga o'tkazish (100%)</span>
            </button>

            <button
              class="btn btn-info btn-sm"
              @click="$emit('resolve-dispute', disp, 'refund_client')"
              :disabled="disp.resolved"
            >
              <RotateCcw :size="14" />
              <span>Mijozga qaytarish (100%)</span>
            </button>

            <button
              class="btn btn-warning btn-sm"
              @click="$emit('resolve-dispute', disp, 'split_50')"
              :disabled="disp.resolved"
            >
              <Scale :size="14" />
              <span>50% / 50% Taqsimlash</span>
            </button>

            <router-link :to="`/chat/${disp.chatId}`" class="btn btn-secondary btn-sm">
              <MessageSquare :size="14" />
              <span>Chat tarixini ko'rish</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CheckCircle2, User, Wrench, Check, RotateCcw, Scale, MessageSquare } from 'lucide-vue-next'
import { formatPrice } from '../../utils'

defineProps({
  disputesList: { type: Array, required: true }
})

defineEmits(['resolve-dispute'])
</script>

<style scoped>
.admin-card {
  padding: 28px;
  border-radius: 20px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-header-clean {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.card-header-clean h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.card-header-clean p {
  font-size: 0.88rem;
  color: var(--color-muted);
  margin: 4px 0 0;
}

.disputes-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dispute-card {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dispute-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border);
}

.dispute-title-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dispute-id {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--color-primary-light);
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  padding: 3px 8px;
  border-radius: 6px;
}

.dispute-job-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.dispute-price-tag {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-sub {
  font-size: 0.8rem;
  color: var(--color-muted);
}

.price-main {
  font-size: 1.15rem;
  font-weight: 800;
  color: #F59E0B;
}

.dispute-parties-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
}

.party-box {
  padding: 16px 18px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.client-box {
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.craftsman-box {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.party-role {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--color-text);
}

.reason-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-muted);
  text-transform: uppercase;
}

.party-reason p {
  font-size: 0.88rem;
  font-style: italic;
  color: var(--color-text);
  margin: 4px 0 0;
  line-height: 1.45;
}

.party-vs {
  font-size: 0.8rem;
  font-weight: 900;
  color: var(--color-muted);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dispute-actions-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
}

.actions-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text);
}

.verdict-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.empty-admin-box {
  padding: 60px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-admin-box h4 {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.empty-admin-box p {
  font-size: 0.88rem;
  color: var(--color-muted);
  margin: 0;
}

@media (max-width: 900px) {
  .dispute-parties-grid {
    grid-template-columns: 1fr;
  }
  .party-vs {
    margin: 0 auto;
  }
}
</style>
