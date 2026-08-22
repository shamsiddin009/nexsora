<template>
  <section class="tab-content">
    <!-- KPI METRICS GRID -->
    <div class="kpi-grid">
      <div class="kpi-card card">
        <div class="kpi-icon-box bg-primary-gradient">
          <TrendingUp :size="24" />
        </div>
        <div class="kpi-data">
          <span class="kpi-label">Umumiy Savdo Oboroti (GMV)</span>
          <h2 class="kpi-value">{{ formatPrice(stats.totalGmv) }}</h2>
          <div class="kpi-growth text-success">
            <span class="growth-arrow">↑</span>
            <span>+24.8% o'tgan oyga nisbatan</span>
          </div>
        </div>
      </div>

      <div class="kpi-card card">
        <div class="kpi-icon-box bg-success-gradient">
          <DollarSign :size="24" />
        </div>
        <div class="kpi-data">
          <span class="kpi-label">Platforma Sof Daromadi (10% + SaaS)</span>
          <h2 class="kpi-value text-success">{{ formatPrice(stats.netRevenue) }}</h2>
          <div class="kpi-growth text-success">
            <span class="growth-arrow">↑</span>
            <span>Komissiya & VIP Obunalar</span>
          </div>
        </div>
      </div>

      <div class="kpi-card card">
        <div class="kpi-icon-box bg-warning-gradient">
          <ShieldAlert :size="24" />
        </div>
        <div class="kpi-data">
          <span class="kpi-label">Escrow Muzlatilgan Mablag'</span>
          <h2 class="kpi-value text-warning">{{ formatPrice(stats.escrowLocked) }}</h2>
          <div class="kpi-growth text-muted">
            <ShieldCheck :size="13" class="text-warning" />
            <span>{{ stats.activeEscrowJobs }} ta xavfsiz bitimda</span>
          </div>
        </div>
      </div>

      <div class="kpi-card card">
        <div class="kpi-icon-box bg-purple-gradient">
          <Award :size="24" />
        </div>
        <div class="kpi-data">
          <span class="kpi-label">VIP Pro & Brigada Obunachilar</span>
          <h2 class="kpi-value text-purple">{{ stats.proUsersCount }} ta usta</h2>
          <div class="kpi-growth text-success">
            <span>MRR: <strong>{{ formatPrice(stats.mrr) }}</strong> / oy</span>
          </div>
        </div>
      </div>
    </div>

    <!-- REVENUE BARS & ACTIVITY SPLIT -->
    <div class="overview-split-grid">
      <!-- Monthly Revenue Chart Card -->
      <div class="admin-card card">
        <div class="card-header-clean">
          <div>
            <h3>Oylik Daromad Dinamikasi</h3>
            <p>2026-yil bo'yicha platformaning oylik umumiy aylanmasi</p>
          </div>
          <span class="badge badge-success">+142% Yillik O'sish</span>
        </div>
        
        <div class="bar-chart-container">
          <div v-for="item in monthlyChartData" :key="item.month" class="bar-col">
            <div class="bar-fill-track">
              <div class="bar-fill" :style="{ height: `${item.percentage}%` }">
                <span class="bar-tooltip">{{ formatPrice(item.amount) }}</span>
              </div>
            </div>
            <span class="bar-month">{{ item.month }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Stats & System Health -->
      <div class="admin-card card">
        <div class="card-header-clean">
          <div>
            <h3>Ekotizim & Server Holati</h3>
            <p>Real-vaqt monitoringi va konversiya</p>
          </div>
          <span class="badge badge-primary">99.98% Ishonchlilik</span>
        </div>

        <div class="health-list">
          <div class="health-item">
            <div class="health-left">
              <div class="h-icon bg-blue"><Users :size="18" /></div>
              <div>
                <strong>Jami Foydalanuvchilar</strong>
                <p>{{ stats.totalCraftsmen }} usta, {{ stats.totalClients }} mijoz</p>
              </div>
            </div>
            <span class="health-val">{{ stats.totalUsers }}</span>
          </div>

          <div class="health-item">
            <div class="health-left">
              <div class="h-icon bg-green"><CheckCircle2 :size="18" /></div>
              <div>
                <strong>Muvaffaqiyatli Bitgan Ishlar</strong>
                <p>Mijozlar tomonidan to'liq qabul qilingan</p>
              </div>
            </div>
            <span class="health-val text-success">{{ stats.completedJobs }} ta</span>
          </div>

          <div class="health-item">
            <div class="health-left">
              <div class="h-icon bg-orange"><Scale :size="18" /></div>
              <div>
                <strong>Nizo & Arbitraj Ko'rsatkichi</strong>
                <p>Barcha bitimlarga nisbatan e'tirozlar</p>
              </div>
            </div>
            <span class="health-val text-info">0.4% (Zo'r)</span>
          </div>

          <div class="health-item">
            <div class="health-left">
              <div class="h-icon bg-purple"><Send :size="18" /></div>
              <div>
                <strong>Telegram Bot Xabarnomalari</strong>
                <p>Xabardor qilish va bildirishnomalar</p>
              </div>
            </div>
            <span class="health-val text-purple">100% Faol</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { TrendingUp, DollarSign, ShieldAlert, Award, Users, CheckCircle2, Scale, Send, ShieldCheck } from 'lucide-vue-next'
import { formatPrice } from '../../utils'

defineProps({
  stats: { type: Object, required: true },
  monthlyChartData: { type: Array, required: true }
})
</script>

<style scoped>
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* KPI GRID */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.kpi-card {
  padding: 26px;
  border-radius: 20px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: flex-start;
  gap: 18px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-3px);
  border-color: var(--color-primary);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}

.kpi-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.bg-primary-gradient { background: linear-gradient(135deg, #6C63FF, #4834D4); }
.bg-success-gradient { background: linear-gradient(135deg, #10B981, #059669); }
.bg-warning-gradient { background: linear-gradient(135deg, #F59E0B, #D97706); }
.bg-purple-gradient  { background: linear-gradient(135deg, #EC4899, #8B5CF6); }

.kpi-data {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kpi-label {
  font-size: 0.82rem;
  color: var(--color-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.kpi-value {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.02em;
}

.kpi-growth {
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.text-purple { color: #8B5CF6; }

/* SPLIT GRID */
.overview-split-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 24px;
}

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
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.card-header-clean p {
  font-size: 0.85rem;
  color: var(--color-muted);
  margin: 4px 0 0;
}

/* BAR CHART */
.bar-chart-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 220px;
  padding: 20px 10px 0;
  gap: 16px;
  border-bottom: 2px dashed var(--color-border);
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  height: 100%;
  justify-content: flex-end;
}

.bar-fill-track {
  width: 100%;
  max-width: 44px;
  height: 100%;
  background: var(--color-surface-2);
  border-radius: 10px 10px 0 0;
  display: flex;
  align-items: flex-end;
  position: relative;
  overflow: visible;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #6C63FF 0%, #4834D4 100%);
  border-radius: 10px 10px 0 0;
  position: relative;
  transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 12px rgba(108, 99, 255, 0.35);
}

.bar-col:hover .bar-fill {
  background: linear-gradient(180deg, #8177FF 0%, #5B47EB 100%);
}

.bar-tooltip {
  position: absolute;
  top: -34px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-text);
  color: var(--color-bg);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
  z-index: 10;
}

.bar-col:hover .bar-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(-2px);
}

.bar-month {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-muted);
}

/* HEALTH LIST */
.health-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.health-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 14px;
  background: var(--color-surface-2);
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.health-item:hover {
  border-color: var(--color-border);
  transform: translateX(3px);
}

.health-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.h-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.bg-blue { background: #3B82F6; }
.bg-green { background: #10B981; }
.bg-orange { background: #F59E0B; }
.bg-purple { background: #8B5CF6; }

.health-left strong {
  font-size: 0.92rem;
  color: var(--color-text);
}

.health-left p {
  font-size: 0.78rem;
  color: var(--color-muted);
  margin: 1px 0 0;
}

.health-val {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-text);
}

@media (max-width: 1024px) {
  .overview-split-grid {
    grid-template-columns: 1fr;
  }
}
</style>
