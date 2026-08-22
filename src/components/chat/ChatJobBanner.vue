<template>
  <!-- JOB ORDER DEAL BANNER -->
  <div v-if="job" class="job-order-banner">
    <div class="banner-content">
      <div class="banner-icon-box">
        <Briefcase :size="18" />
      </div>
      <div class="banner-text-col">
        <div class="banner-top-line">
          <router-link :to="`/jobs/${job.id || jobId}`" class="banner-title" :title="job.title">
            {{ job.title }}
          </router-link>
          <span class="badge" :class="getStatusBadgeClass(job.status)">
            {{ getStatusLabel(job.status) }}
          </span>
        </div>
        <div class="banner-meta-line">
          <span v-if="offer?.price" class="meta-tag price-tag">
            <DollarSign :size="13" />
            <strong>{{ formatPrice(offer.price) }}</strong>
          </span>
          <span v-else class="meta-tag price-tag">
            <DollarSign :size="13" />
            <strong>{{ formatPrice(job.budget_max || job.budget_min) }}</strong>
          </span>
          <span v-if="offer?.duration_days" class="meta-tag">
            <Clock :size="13" />
            <span>{{ offer.duration_days }} kun</span>
          </span>
          <span v-if="job.city" class="meta-tag">
            <MapPin :size="13" />
            <span>{{ job.city }}</span>
          </span>
          <button type="button" class="btn-contract-print" @click="handlePrintContract" title="Rasmiy kafolat shartnomasini yuklab olish">
            <FileText :size="13" />
            <span>Shartnoma (.PDF)</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Briefcase, DollarSign, Clock, MapPin, FileText } from 'lucide-vue-next'
import { formatPrice, getStatusLabel } from '../../utils'
import { openAndPrintContract } from '../../utils/contractGenerator'

const props = defineProps({
  job: { type: Object, default: null },
  offer: { type: Object, default: null },
  jobId: { type: [String, Number], default: null },
  clientName: { type: String, default: 'Mijoz' },
  craftsmanName: { type: String, default: 'Usta' }
})

function handlePrintContract() {
  openAndPrintContract({
    jobTitle: props.job?.title || 'Xizmat ko\'rsatish',
    amount: props.offer?.price || props.job?.budget_max || props.job?.budget_min || 0,
    warrantyDays: 30,
    deadlineDays: props.offer?.duration_days || 3,
    clientName: props.clientName || 'Mijoz',
    craftsmanName: props.craftsmanName || 'Usta'
  })
}


function getStatusBadgeClass(status) {
  switch (status) {
    case 'open': return 'badge-success'
    case 'in_progress': return 'badge-primary'
    case 'revision': return 'badge-warning'
    case 'completed': return 'badge-neutral'
    default: return 'badge-secondary'
  }
}
</script>

<style scoped>
.job-order-banner {
  padding: 10px 20px;
  background: color-mix(in srgb, var(--color-surface) 90%, var(--color-primary) 10%);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.banner-icon-box {
  width: 38px; height: 38px;
  border-radius: 10px;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(108, 99, 255, 0.25);
}

.banner-text-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.banner-top-line {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.banner-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
}

.banner-title:hover { color: var(--color-primary-light); }

.banner-meta-line {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 0.78rem;
  color: var(--color-text-2);
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.price-tag {
  color: #10B981;
  font-weight: 700;
}

.btn-contract-print {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(108, 99, 255, 0.12);
  border: 1px solid rgba(108, 99, 255, 0.25);
  color: var(--color-primary-light);
  font-size: 0.74rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-left: 4px;
}

.btn-contract-print:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-1px);
}
</style>
