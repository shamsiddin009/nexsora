<script setup>
import { ref, computed, watch } from 'vue'
import { Coins, Plus, Minus, X, Check } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: null
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '0'
  },
  suffix: {
    type: String,
    default: "so'm"
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 1000000000
  },
  step: {
    type: Number,
    default: 50000
  },
  quickPresets: {
    type: Array,
    default: () => [50000, 100000, 500000, 1000000, 2000000]
  },
  showQuickPresets: {
    type: Boolean,
    default: true
  },
  showSteppers: {
    type: Boolean,
    default: true
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `curr-input-${Math.random().toString(36).substr(2, 9)}`
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus'])

// Format raw number with spaces: 1500000 -> 1 500 000
function formatNumberWithSpaces(num) {
  if (num === null || num === undefined || num === '') return ''
  const str = String(num).replace(/\D/g, '')
  if (!str) return ''
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// Internal display value
const displayValue = ref(formatNumberWithSpaces(props.modelValue))
const isFocused = ref(false)

watch(() => props.modelValue, (newVal) => {
  if (!isFocused.value || !displayValue.value) {
    displayValue.value = formatNumberWithSpaces(newVal)
  }
})

function handleInput(e) {
  const raw = e.target.value.replace(/\D/g, '')
  if (!raw) {
    displayValue.value = ''
    emit('update:modelValue', null)
    return
  }
  
  let num = parseInt(raw, 10)
  if (num > props.max) num = props.max
  
  displayValue.value = formatNumberWithSpaces(num)
  emit('update:modelValue', num)
}

function handleBlur(e) {
  isFocused.value = false
  if (props.modelValue !== null && props.modelValue !== undefined) {
    displayValue.value = formatNumberWithSpaces(props.modelValue)
  }
  emit('blur', e)
}

function handleFocus(e) {
  isFocused.value = true
  emit('focus', e)
}

function increment() {
  if (props.disabled) return
  const current = Number(props.modelValue) || 0
  const next = Math.min(props.max, current + props.step)
  displayValue.value = formatNumberWithSpaces(next)
  emit('update:modelValue', next)
  emit('change', next)
}

function decrement() {
  if (props.disabled) return
  const current = Number(props.modelValue) || 0
  const next = Math.max(props.min, current - props.step)
  displayValue.value = formatNumberWithSpaces(next)
  emit('update:modelValue', next)
  emit('change', next)
}

function applyPreset(amount) {
  if (props.disabled) return
  displayValue.value = formatNumberWithSpaces(amount)
  emit('update:modelValue', amount)
  emit('change', amount)
}

function addPresetAmount(amount) {
  if (props.disabled) return
  const current = Number(props.modelValue) || 0
  const next = Math.min(props.max, current + amount)
  displayValue.value = formatNumberWithSpaces(next)
  emit('update:modelValue', next)
  emit('change', next)
}

function clearValue() {
  if (props.disabled) return
  displayValue.value = ''
  emit('update:modelValue', null)
  emit('change', null)
}

// Preset formatting helper
function formatPresetLabel(num) {
  if (num >= 1000000) {
    const m = num / 1000000
    return `+${m} mln`
  }
  if (num >= 1000) {
    const k = num / 1000
    return `+${k} ming`
  }
  return `+${num}`
}
</script>

<template>
  <div class="currency-input-component" :class="{ 'has-error': error, 'is-disabled': disabled, 'is-focused': isFocused }">
    <label v-if="label" :for="id" class="input-label">
      <span>{{ label }}</span>
      <span v-if="required" class="required-star">*</span>
    </label>

    <div class="input-container-box">
      <!-- Icon Prefix -->
      <div class="input-prefix">
        <Coins :size="18" class="prefix-icon" />
      </div>

      <!-- Main Number Text Field -->
      <input
        :id="id"
        type="text"
        inputmode="numeric"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        autocomplete="off"
        class="styled-number-input"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- Clear action -->
      <button
        v-if="modelValue && !disabled"
        type="button"
        class="clear-btn"
        title="Tozalash"
        aria-label="Tozalash"
        @click="clearValue"
      >
        <X :size="15" />
      </button>

      <!-- Suffix Badge -->
      <div v-if="suffix" class="currency-suffix">
        {{ suffix }}
      </div>

      <!-- Stepper Controls -->
      <div v-if="showSteppers" class="steppers-wrapper">
        <button
          type="button"
          class="stepper-btn"
          :disabled="disabled || (modelValue && modelValue <= min)"
          title="Kamaytirish"
          aria-label="Kamaytirish"
          @click="decrement"
        >
          <Minus :size="14" />
        </button>
        <button
          type="button"
          class="stepper-btn"
          :disabled="disabled || (modelValue && modelValue >= max)"
          title="Oshirish"
          aria-label="Oshirish"
          @click="increment"
        >
          <Plus :size="14" />
        </button>
      </div>
    </div>

    <!-- Quick Preset Buttons -->
    <div v-if="showQuickPresets && quickPresets.length" class="quick-presets-row">
      <button
        v-for="preset in quickPresets"
        :key="preset"
        type="button"
        class="preset-chip"
        @click="addPresetAmount(preset)"
      >
        {{ formatPresetLabel(preset) }}
      </button>
    </div>

    <!-- Error or Hint message -->
    <p v-if="error" class="input-error-msg">{{ error }}</p>
    <p v-else-if="hint" class="input-hint-msg">{{ hint }}</p>
  </div>
</template>

<style scoped>
.currency-input-component {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-main);
}

.required-star {
  color: #ef4444;
}

.input-container-box {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-input, var(--bg-card, #ffffff));
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  padding: 2px 8px 2px 14px;
  transition: var(--transition-smooth);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.is-focused .input-container-box {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.has-error .input-container-box {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.is-disabled .input-container-box {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--bg-card-hover);
}

.input-prefix {
  display: flex;
  align-items: center;
  color: var(--primary);
  margin-right: 10px;
  flex-shrink: 0;
}

.styled-number-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main);
  font-family: var(--font-sans);
  min-width: 0;
  letter-spacing: 0.02em;
}

.styled-number-input:focus {
  outline: none;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--border-color);
  color: var(--text-muted);
  border: none;
  cursor: pointer;
  padding: 0;
  margin-right: 6px;
  transition: var(--transition-smooth);
}

.clear-btn:hover {
  background: var(--accent-rose, #ef4444);
  color: #ffffff;
}

.currency-suffix {
  padding: 4px 10px;
  background: var(--primary-light, rgba(99, 102, 241, 0.1));
  color: var(--primary);
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-right: 6px;
  user-select: none;
}

.steppers-wrapper {
  display: flex;
  align-items: center;
  gap: 3px;
  border-left: 1px solid var(--border-color);
  padding-left: 6px;
}

.stepper-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-main);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.stepper-btn:hover:not(:disabled) {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
}

.stepper-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.quick-presets-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.preset-chip {
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px dashed var(--border-color);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-smooth);
  user-select: none;
}

.preset-chip:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
  transform: translateY(-1px);
}

.input-error-msg {
  font-size: 0.8rem;
  color: #ef4444;
  margin: 0;
}

.input-hint-msg {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}
</style>
