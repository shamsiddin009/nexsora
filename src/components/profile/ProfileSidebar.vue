<template>
  <aside class="profile-sidebar-column">
    <!-- Statistics Card -->
    <div class="card sidebar-card stats-card">
      <h4 class="sidebar-heading"><Activity :size="16" /> Ko'rsatkichlar</h4>
      <div class="stats-list">
        <div class="stat-item">
          <span class="stat-label">Bajarilgan ishlar:</span>
          <span class="stat-value font-bold text-success">{{ completedJobsCount }} ta</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Muvaffaqiyat ko'rsatkichi:</span>
          <span class="stat-value font-bold text-primary">99%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">O'rtacha javob berish vaqti:</span>
          <span class="stat-value font-bold">15 daqiqa</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Verifikatsiya:</span>
          <span class="badge badge-success">Tasdiqlangan</span>
        </div>
      </div>
    </div>

    <!-- Contact & Direct Details -->
    <div class="card sidebar-card">
      <h4 class="sidebar-heading"><ShieldCheck :size="16" /> Ishonchli Usta Kafolati</h4>
      <ul class="guarantee-list">
        <li>
          <CheckCircle2 :size="14" class="text-success" />
          <span>Shaxsiy ma'lumotlar tekshirilgan</span>
        </li>
        <li>
          <CheckCircle2 :size="14" class="text-success" />
          <span>Xavfsiz Escrow to'lov kafolati</span>
        </li>
        <li>
          <CheckCircle2 :size="14" class="text-success" />
          <span>Bajarilgan ishlarga rasmiy sharhlar</span>
        </li>
      </ul>
    </div>

    <!-- Referral / Promo Banner -->
    <div class="card sidebar-card promo-card">
      <div class="promo-icon"><Sparkles :size="20" /></div>
      <h5 class="promo-title">Ustani do'stlarga ulashing</h5>
      <p class="promo-subtitle">Ushbu usta profilini boshqalarga yuboring va tavsiya qiling.</p>
      <button class="btn btn-secondary btn-sm w-full" @click="handleShare">
        <Share2 :size="14" /> Profil havolasini nusxalash
      </button>
    </div>
  </aside>
</template>

<script setup>
import { Activity, ShieldCheck, CheckCircle2, Sparkles, Share2 } from 'lucide-vue-next'
import { useToast } from '../../composables/useToast'

const toast = useToast()

defineProps({
  completedJobsCount: { type: Number, default: 0 }
})

function handleShare() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Nusxa olindi', 'Profil havolasi nusxalandi!')
  }
}
</script>

<style scoped>
.profile-sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card {
  padding: 20px;
}

.sidebar-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
}

.stat-label {
  color: var(--color-text-2);
}

.stat-value {
  color: var(--color-text);
}

.guarantee-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.guarantee-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--color-text-2);
}

.promo-card {
  background: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface));
  border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.promo-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.promo-title {
  margin: 0 0 4px;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-text);
}

.promo-subtitle {
  margin: 0 0 12px;
  font-size: 0.8rem;
  color: var(--color-text-2);
  line-height: 1.4;
}

.w-full {
  width: 100%;
}
</style>
