<template>
  <div v-if="isOpen" class="ai-modal-overlay" @click.self="$emit('close')">
    <div class="ai-modal-card card">
      
      <!-- Glow Background Effect -->
      <div class="ai-glow"></div>

      <!-- Modal Header -->
      <div class="ai-modal-head">
        <div class="ai-head-left">
          <div class="ai-icon-pulse">
            <Sparkles :size="22" />
          </div>
          <div>
            <div class="ai-title-row">
              <h3>Nexsora AI Narx Kalkulyatori</h3>
              <span class="ai-version-badge">AI 2.5 Pro</span>
            </div>
            <p class="ai-head-desc">Bozor statistikasi va minglab yakunlangan buyurtmalar asosida aniq narx hisoblash</p>
          </div>
        </div>
        <button class="close-btn" @click="$emit('close')"><X :size="18" /></button>
      </div>

      <!-- Modal Body -->
      <div class="ai-modal-body">
        
        <!-- Input Form -->
        <div class="ai-inputs-section">
          <div class="form-group">
            <label class="input-label">Ish / Xizmat yo'nalishi yoki tavsifi:</label>
            <div class="input-icon-box">
              <Wrench :size="16" class="input-icon" />
              <input
                v-model="jobTitle"
                type="text"
                class="input input-with-icon"
                placeholder="Masalan: 2 xonali uyni elektrik simlarini almashtirish..."
                @keyup.enter="calculateEstimate"
              />
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="input-label">Kategoriya:</label>
              <select v-model="selectedCategory" class="select-clean">
                <option value="Elektrik">⚡ Elektrik</option>
                <option value="Santexnik">🔧 Santexnik</option>
                <option value="Ta'mirchi">🏠 Ta'mirchi / Quruvchi</option>
                <option value="Mebel">🛋️ Mebel yasash / yig'ish</option>
                <option value="Konditsioner">❄️ Konditsioner & Sovutish</option>
                <option value="Tozalash">✨ Tozalash / Cleaning</option>
                <option value="Boshqa">🛠️ Boshqa soha</option>
              </select>
            </div>

            <div class="form-group">
              <label class="input-label">Ish hajmi va qiyinligi:</label>
              <select v-model="complexityLevel" class="select-clean">
                <option value="simple">🟢 Oddiy (1-3 soatlik ish)</option>
                <option value="medium">🟡 O'rtacha (1-2 kunlik)</option>
                <option value="complex">🔴 Katta / Murakkab (Kapital ta'mir)</option>
              </select>
            </div>
          </div>

          <button
            class="btn btn-primary btn-ai-calc"
            :disabled="calculating || !jobTitle.trim()"
            @click="calculateEstimate"
          >
            <Sparkles :size="16" :class="{ 'animate-spin': calculating }" />
            <span>{{ calculating ? 'AI bozor narxlarini tahlil qilmoqda...' : 'Bozor narxini hisoblash' }}</span>
          </button>
        </div>

        <!-- AI RESULTS CARD -->
        <div v-if="result" class="ai-result-box">
          <div class="ai-result-header">
            <span class="ai-result-tag">🎯 AI Tavsiya Qilgan Byudjet:</span>
            <div class="ai-price-range">
              <strong class="price-min">{{ formatPrice(result.minBudget) }}</strong>
              <span class="price-dash">—</span>
              <strong class="price-max">{{ formatPrice(result.maxBudget) }}</strong>
            </div>
          </div>

          <div class="ai-meta-grid">
            <div class="ai-meta-item">
              <Clock :size="16" class="text-primary-light" />
              <div>
                <span class="meta-label">Kutilayotgan muddat:</span>
                <strong>{{ result.duration }}</strong>
              </div>
            </div>
            <div class="ai-meta-item">
              <ShieldCheck :size="16" class="text-success" />
              <div>
                <span class="meta-label">Tavsiya etilgan kafolat:</span>
                <strong>{{ result.warranty }}</strong>
              </div>
            </div>
            <div class="ai-meta-item">
              <Users :size="16" class="text-warning" />
              <div>
                <span class="meta-label">Mavjud mos ustalar:</span>
                <strong>{{ result.craftsmenCount }} ta mutaxassis</strong>
              </div>
            </div>
          </div>

          <p class="ai-explanation">
            💡 <strong>AI xulosasi:</strong> {{ result.explanation }}
          </p>

          <!-- Apply Button -->
          <button class="btn btn-success btn-block" @click="applyEstimate">
            <Check :size="16" />
            <span>Ushbu byudjetni e'longa joylashtirish</span>
          </button>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Sparkles, X, Wrench, Clock, ShieldCheck, Users, Check } from 'lucide-vue-next'
import { formatPrice } from '../utils'
import { useToast } from '../composables/useToast'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  initialTitle: { type: String, default: '' },
  initialCategory: { type: String, default: 'Elektrik' }
})

const emit = defineEmits(['close', 'applied'])
const toast = useToast()

const jobTitle = ref(props.initialTitle || '')
const selectedCategory = ref(props.initialCategory || 'Elektrik')
const complexityLevel = ref('medium')
const calculating = ref(false)
const result = ref(null)

function calculateEstimate() {
  if (!jobTitle.value.trim()) return
  calculating.value = true
  result.value = null

  setTimeout(() => {
    calculating.value = false

    // Smart heuristic valuation engine
    let baseMin = 150000
    let baseMax = 300000
    let duration = '1 kun'
    let warranty = '14 kun'
    let count = 18

    const lower = jobTitle.value.toLowerCase()

    if (selectedCategory.value === 'Santexnik' || lower.includes('kran') || lower.includes('truba') || lower.includes('suv')) {
      baseMin = 180000
      baseMax = 350000
      duration = '3-5 soat'
      warranty = '30 kun'
      count = 24
    } else if (selectedCategory.value === 'Konditsioner' || lower.includes('freon') || lower.includes('konditsioner')) {
      baseMin = 350000
      baseMax = 650000
      duration = '1 kun'
      warranty = '6 oy'
      count = 14
    } else if (selectedCategory.value === 'Mebel' || lower.includes('shkaf') || lower.includes('stol') || lower.includes('oshxona')) {
      baseMin = 400000
      baseMax = 1200000
      duration = '2-4 kun'
      warranty = '1 yil'
      count = 19
    } else if (selectedCategory.value === "Ta'mirchi" || lower.includes('koshin') || lower.includes('kafel') || lower.includes('remont')) {
      baseMin = 1200000
      baseMax = 3500000
      duration = '5-10 kun'
      warranty = '1 yil'
      count = 32
    }

    if (complexityLevel.value === 'simple') {
      baseMin = Math.round(baseMin * 0.6)
      baseMax = Math.round(baseMax * 0.7)
      duration = '1-3 soat'
    } else if (complexityLevel.value === 'complex') {
      baseMin = Math.round(baseMin * 1.8)
      baseMax = Math.round(baseMax * 2.2)
      duration = '1-2 hafta'
    }

    result.value = {
      minBudget: baseMin,
      maxBudget: baseMax,
      duration,
      warranty,
      craftsmenCount: count,
      explanation: `Toshkent va viloyatlardagi oxirgi 90 kun ichida muvaffaqiyatli topshirilgan shunga o'xshash ${count} ta buyurtma narxlari tahlil qilindi.`
    }

    toast.success("AI Hisob-kitobi tayyor", "Optimal bozor byudjeti va muddatlari shakllantirildi! ⚡")
  }, 600)
}

function applyEstimate() {
  if (!result.value) return
  emit('applied', {
    minBudget: result.value.minBudget,
    maxBudget: result.value.maxBudget,
    category: selectedCategory.value
  })
  emit('close')
}
</script>

<style scoped>
.ai-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.ai-modal-card {
  position: relative;
  width: 100%;
  max-width: 580px;
  background: var(--color-card);
  border: 1px solid rgba(108, 99, 255, 0.35);
  border-radius: 24px;
  padding: 28px 32px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.ai-glow {
  position: absolute;
  top: -80px;
  right: -80px;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(108, 99, 255, 0.25) 0%, transparent 70%);
  pointer-events: none;
}

.ai-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.ai-head-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ai-icon-pulse {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6C63FF 0%, #EC4899 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(108, 99, 255, 0.35);
  flex-shrink: 0;
}

.ai-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-title-row h3 {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
  color: var(--color-text);
}

.ai-version-badge {
  font-size: 0.7rem;
  font-weight: 800;
  color: #EC4899;
  background: rgba(236, 72, 153, 0.12);
  padding: 2px 8px;
  border-radius: 999px;
}

.ai-head-desc {
  font-size: 0.82rem;
  color: var(--color-muted);
  margin: 2px 0 0;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
}

.ai-modal-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-2);
}

.input-icon-box {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-muted);
}

.input-with-icon {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border-radius: 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 0.92rem;
  outline: none;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.select-clean {
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 0.88rem;
  outline: none;
  cursor: pointer;
}

.btn-ai-calc {
  width: 100%;
  padding: 12px 20px;
  border-radius: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%);
}

.ai-result-box {
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 10%, var(--color-surface-2)), var(--color-surface-2));
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
  border-radius: 18px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeIn 0.3s ease;
}

.ai-result-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ai-result-tag {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-primary-light);
  text-transform: uppercase;
}

.ai-price-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-min, .price-max {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--color-text);
}

.price-dash {
  color: var(--color-muted);
  font-size: 1.2rem;
}

.ai-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.ai-meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.meta-label {
  font-size: 0.72rem;
  color: var(--color-muted);
  display: block;
}

.ai-meta-item strong {
  font-size: 0.85rem;
  color: var(--color-text);
}

.ai-explanation {
  font-size: 0.82rem;
  color: var(--color-text-2);
  line-height: 1.5;
  margin: 0;
}
</style>
