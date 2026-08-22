<template>
  <div class="availability-card card">
    <div class="cal-header">
      <div>
        <h3 class="section-heading" style="margin-bottom: 0">
          <Calendar :size="18" /> Bandlik Jadvali & Ish Grafigi
        </h3>
        <p class="cal-subtitle">
          {{ isOwnProfile ? 'Kalendardan sanani bosib, bo\'sh yoki bandligingizni belgilang' : 'Ustaning yaqin kunlardagi ish grafigi' }}
        </p>
      </div>

      <div class="cal-nav">
        <button type="button" class="cal-nav-btn" @click="prevMonth"><ChevronLeft :size="16" /></button>
        <span class="cal-current-month">{{ monthNames[currentMonth] }} {{ currentYear }}</span>
        <button type="button" class="cal-nav-btn" @click="nextMonth"><ChevronRight :size="16" /></button>
      </div>
    </div>

    <!-- Legend -->
    <div class="cal-legend">
      <div class="legend-item"><span class="legend-dot dot-free"></span><span>Bo'sh (Buyurtma qabul qilinadi)</span></div>
      <div class="legend-item"><span class="legend-dot dot-busy"></span><span>Band (Ish jarayonida)</span></div>
      <div class="legend-item"><span class="legend-dot dot-today"></span><span>Bugun</span></div>
    </div>

    <!-- Calendar Grid -->
    <div class="cal-grid-wrapper">
      <div class="cal-weekdays">
        <span v-for="w in weekDays" :key="w">{{ w }}</span>
      </div>

      <div class="cal-days-grid">
        <!-- Empty offset days -->
        <span v-for="n in firstDayOffset" :key="'empty_' + n" class="cal-day day-empty"></span>

        <!-- Month Days -->
        <button
          v-for="day in daysInMonth"
          :key="day"
          type="button"
          class="cal-day"
          :class="{
            'day-today': isToday(day),
            'day-busy': isBusy(day),
            'day-free': !isBusy(day) && !isPast(day),
            'day-past': isPast(day),
            'interactive': isOwnProfile && !isPast(day)
          }"
          :disabled="!isOwnProfile || isPast(day)"
          @click="toggleDayStatus(day)"
          :title="getDayTooltip(day)"
        >
          <span class="day-num">{{ day }}</span>
          <span class="day-status-pill">{{ isPast(day) ? '—' : (isBusy(day) ? 'Band' : 'Bo\'sh') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  craftsmanId: { type: String, default: 'default' },
  isOwnProfile: { type: Boolean, default: false },
})

const now = new Date()
const currentMonth = ref(now.getMonth())
const currentYear = ref(now.getFullYear())

const monthNames = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
]

const weekDays = ['Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan', 'Yak']

const busyDaysSet = ref(new Set())

function getStorageKey() {
  return `nexsora_cal_${props.craftsmanId}_${currentYear.value}_${currentMonth.value}`
}

function loadAvailability() {
  try {
    const saved = localStorage.getItem(getStorageKey())
    if (saved) {
      busyDaysSet.value = new Set(JSON.parse(saved))
    } else {
      // Default demo busy days (e.g. 2nd, 3rd day from now)
      const currentDay = now.getDate()
      busyDaysSet.value = new Set([currentDay + 1, currentDay + 2])
    }
  } catch (e) {
    busyDaysSet.value = new Set()
  }
}

function saveAvailability() {
  localStorage.setItem(getStorageKey(), JSON.stringify([...busyDaysSet.value]))
}

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

const firstDayOffset = computed(() => {
  const day = new Date(currentYear.value, currentMonth.value, 1).getDay()
  return day === 0 ? 6 : day - 1 // Monday start
})

function isToday(day) {
  return now.getDate() === day && now.getMonth() === currentMonth.value && now.getFullYear() === currentYear.value
}

function isPast(day) {
  const target = new Date(currentYear.value, currentMonth.value, day)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return target < today
}

function isBusy(day) {
  return busyDaysSet.value.has(day)
}

function toggleDayStatus(day) {
  if (!props.isOwnProfile || isPast(day)) return
  if (busyDaysSet.value.has(day)) {
    busyDaysSet.value.delete(day)
  } else {
    busyDaysSet.value.add(day)
  }
  saveAvailability()
}

function getDayTooltip(day) {
  if (isPast(day)) return 'O\'tgan kun'
  if (isBusy(day)) return 'Usta ushbu kunda band'
  return 'Usta ushbu kunda bo\'sh (qabul qiladi)'
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
  loadAvailability()
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
  loadAvailability()
}

onMounted(() => {
  loadAvailability()
})
</script>

<style scoped>
.availability-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.cal-subtitle {
  color: var(--color-text-2);
  font-size: 0.85rem;
  margin: 2px 0 0 0;
}

.cal-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  padding: 4px 8px;
  border-radius: 12px;
}

.cal-nav-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.cal-nav-btn:hover {
  background: var(--color-card-hover);
  color: var(--color-primary-light);
}

.cal-current-month {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-text);
  min-width: 110px;
  text-align: center;
}

/* Legend */
.cal-legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 0.78rem;
  color: var(--color-text-2);
  background: var(--color-surface-2);
  padding: 8px 12px;
  border-radius: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot-free { background: #10B981; }
.dot-busy { background: #EF4444; }
.dot-today { background: var(--color-primary); box-shadow: 0 0 0 2px rgba(108,99,255,0.3); }

/* Calendar Grid */
.cal-grid-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-muted);
}

.cal-days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.cal-day {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  min-height: 52px;
  padding: 6px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  transition: all 0.15s;
  position: relative;
}

.cal-day.interactive {
  cursor: pointer;
}

.cal-day.interactive:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
}

.day-empty {
  background: transparent;
  border: none;
  pointer-events: none;
}

.day-num {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text);
}

.day-today {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.25);
}

.day-free {
  border-left: 3px solid #10B981;
}

.day-busy {
  background: rgba(239, 68, 68, 0.08);
  border-left: 3px solid #EF4444;
}

.day-past {
  opacity: 0.45;
  background: transparent;
  cursor: not-allowed;
}

.day-status-pill {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--color-muted);
}

.day-free .day-status-pill { color: #10B981; }
.day-busy .day-status-pill { color: #EF4444; }
</style>
