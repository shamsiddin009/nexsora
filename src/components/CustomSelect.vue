<template>
  <div class="custom-select-wrapper" ref="selectRef" :class="{ 'is-open': isOpen, 'has-error': error, 'is-disabled': disabled }">
    <!-- Trigger Button -->
    <button
      type="button"
      class="select-trigger"
      :class="[`trigger-${size || 'md'}`, { 'is-active': isOpen, 'has-value': !!selectedOption }]"
      @click="toggleDropdown"
      :disabled="disabled"
      :aria-expanded="isOpen"
    >
      <div class="trigger-left">
        <!-- Leading Icon -->
        <div v-if="leadingIcon || selectedOption?.icon" class="trigger-icon-box">
          <span v-if="selectedOption?.icon && isEmoji(selectedOption.icon)" class="trigger-emoji">
            {{ selectedOption.icon }}
          </span>
          <component
            v-else-if="selectedOption?.icon"
            :is="selectedOption.icon"
            :size="17"
            class="trigger-icon-svg"
          />
          <component
            v-else-if="leadingIconComponent"
            :is="leadingIconComponent"
            :size="17"
            class="trigger-icon-svg"
          />
          <span v-else-if="leadingIcon && isEmoji(leadingIcon)" class="trigger-emoji">
            {{ leadingIcon }}
          </span>
        </div>

        <!-- Label / Placeholder -->
        <span v-if="selectedOption" class="selected-label">
          {{ selectedOption.label || selectedOption.value }}
        </span>
        <span v-else class="placeholder-text">
          {{ placeholder || 'Tanlang...' }}
        </span>
      </div>

      <!-- Right Chevron Indicator -->
      <div class="trigger-right">
        <button
          v-if="clearable && selectedOption && !disabled"
          type="button"
          class="clear-val-btn"
          @click.stop="clearSelection"
          title="Tozalash"
        >
          <X :size="14" />
        </button>
        <ChevronDown :size="16" class="chevron-arrow" :class="{ 'rotate-180': isOpen }" />
      </div>
    </button>

    <!-- Dropdown Menu -->
    <transition name="select-dropdown-anim">
      <div v-if="isOpen" class="dropdown-popover">
        <!-- Search Input (if searchable and enough options) -->
        <div v-if="shouldShowSearch" class="dropdown-search-box">
          <Search :size="15" class="search-icon" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder || 'Qidirish...'"
            class="dropdown-search-input"
            @click.stop
            @keydown.down.prevent="navigateHighlight(1)"
            @keydown.up.prevent="navigateHighlight(-1)"
            @keydown.enter.prevent="selectHighlighted"
            @keydown.esc="closeDropdown"
          />
          <button v-if="searchQuery" type="button" class="clear-search-btn" @click.stop="searchQuery = ''">
            <X :size="13" />
          </button>
        </div>

        <!-- Options List -->
        <div class="options-list-scroll" ref="optionsListRef">
          <div v-if="filteredOptions.length === 0" class="no-options">
            <span>Mos variant topilmadi</span>
          </div>

          <div
            v-for="(opt, idx) in filteredOptions"
            :key="opt.value"
            class="option-item"
            :class="{
              'is-selected': isSelected(opt.value),
              'is-highlighted': highlightedIndex === idx
            }"
            @click="selectOption(opt)"
            @mouseenter="highlightedIndex = idx"
          >
            <!-- Option Icon/Emoji -->
            <div v-if="opt.icon" class="option-icon-box">
              <span v-if="isEmoji(opt.icon)" class="option-emoji">{{ opt.icon }}</span>
              <component v-else :is="opt.icon" :size="16" />
            </div>

            <!-- Option Text & Description -->
            <div class="option-content">
              <span class="option-title">{{ opt.label || opt.value }}</span>
              <span v-if="opt.desc" class="option-desc">{{ opt.desc }}</span>
            </div>

            <!-- Selected Checkmark -->
            <div v-if="isSelected(opt.value)" class="check-indicator">
              <Check :size="15" />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ChevronDown, Search, Check, X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: [String, Number, Array, Object],
    default: ''
  },
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Tanlang'
  },
  leadingIcon: {
    type: [Object, Function, String],
    default: null
  },
  searchable: {
    type: Boolean,
    default: true
  },
  searchPlaceholder: {
    type: String,
    default: 'Qidirish...'
  },
  size: {
    type: String,
    default: 'md' // 'sm', 'md', 'lg'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: [Boolean, String],
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const selectRef = ref(null)
const searchInputRef = ref(null)
const optionsListRef = ref(null)

const leadingIconComponent = computed(() => {
  if (typeof props.leadingIcon === 'object' || typeof props.leadingIcon === 'function') {
    return props.leadingIcon
  }
  return null
})

function isEmoji(str) {
  if (typeof str !== 'string') return false
  return /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(str)
}

// Normalize options to { value, label, icon, desc, color }
const normalizedOptions = computed(() => {
  return props.options.map(item => {
    if (typeof item === 'string' || typeof item === 'number') {
      return { value: item, label: String(item), icon: null, desc: null }
    }
    return {
      value: item.value ?? item.id ?? item.name,
      label: item.label ?? item.name ?? item.title ?? String(item.value),
      icon: item.icon ?? null,
      desc: item.desc ?? item.description ?? null,
      color: item.color ?? null
    }
  })
})

const shouldShowSearch = computed(() => {
  if (!props.searchable) return false
  return normalizedOptions.value.length > 5
})

const selectedOption = computed(() => {
  return normalizedOptions.value.find(opt => opt.value === props.modelValue) || null
})

const filteredOptions = computed(() => {
  if (!searchQuery.value.trim()) return normalizedOptions.value
  const q = searchQuery.value.toLowerCase().trim()
  return normalizedOptions.value.filter(opt => {
    const labelMatch = (opt.label || '').toLowerCase().includes(q)
    const valMatch = String(opt.value || '').toLowerCase().includes(q)
    const descMatch = (opt.desc || '').toLowerCase().includes(q)
    return labelMatch || valMatch || descMatch
  })
})

function isSelected(val) {
  return props.modelValue === val
}

function toggleDropdown() {
  if (props.disabled) return
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

function openDropdown() {
  isOpen.value = true
  searchQuery.value = ''
  highlightedIndex.value = -1

  nextTick(() => {
    if (props.searchable && searchInputRef.value) {
      searchInputRef.value.focus()
    }
  })
}

function closeDropdown() {
  isOpen.value = false
  searchQuery.value = ''
  highlightedIndex.value = -1
}

function selectOption(opt) {
  emit('update:modelValue', opt.value)
  emit('change', opt.value)
  closeDropdown()
}

function clearSelection() {
  emit('update:modelValue', '')
  emit('change', '')
}

function navigateHighlight(step) {
  const len = filteredOptions.value.length
  if (len === 0) return
  let next = highlightedIndex.value + step
  if (next < 0) next = len - 1
  if (next >= len) next = 0
  highlightedIndex.value = next
}

function selectHighlighted() {
  if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
    selectOption(filteredOptions.value[highlightedIndex.value])
  }
}

function handleClickOutside(event) {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.custom-select-wrapper {
  position: relative;
  width: 100%;
  user-select: none;
}

/* Trigger Button */
.select-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 0 16px;
  color: var(--color-text);
  cursor: pointer;
  outline: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
}

.trigger-sm {
  height: 38px;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 0.82rem;
}

.trigger-md {
  height: 48px;
  font-size: 0.92rem;
}

.trigger-lg {
  height: 54px;
  font-size: 1rem;
  border-radius: 16px;
}

.select-trigger:hover:not(:disabled) {
  border-color: var(--color-primary-light);
  background: var(--color-surface);
  box-shadow: 0 4px 14px rgba(108, 99, 255, 0.1);
}

.select-trigger.is-active {
  border-color: var(--color-primary);
  background: var(--color-surface);
  box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.2), 0 4px 18px rgba(108, 99, 255, 0.15);
}

.select-trigger:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.has-error .select-trigger {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.15);
}

.trigger-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
  text-align: left;
}

.trigger-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-primary-light);
}

.trigger-emoji {
  font-size: 1.15rem;
  line-height: 1;
}

.trigger-icon-svg {
  color: var(--color-primary-light);
}

.selected-label {
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.placeholder-text {
  color: var(--color-muted);
  font-weight: 500;
}

.trigger-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.clear-val-btn {
  background: transparent;
  border: none;
  color: var(--color-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s ease;
}

.clear-val-btn:hover {
  color: var(--color-text);
  background: var(--color-surface-2);
}

.chevron-arrow {
  color: var(--color-text-2);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.rotate-180 {
  transform: rotate(180deg);
  color: var(--color-primary-light);
}

/* Dropdown Popover */
.dropdown-popover {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 100%;
  width: max-content;
  max-width: 320px;
  background: var(--color-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: var(--shadow-lg), 0 12px 36px rgba(0, 0, 0, 0.18);
  padding: 8px;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 320px;
  overflow: hidden;
}

/* Search Box inside Popover */
.dropdown-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 6px 12px;
  margin-bottom: 4px;
}

.search-icon {
  color: var(--color-muted);
  flex-shrink: 0;
}

.dropdown-search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.85rem;
  color: var(--color-text);
  padding: 2px 0;
}

.dropdown-search-input::placeholder {
  color: var(--color-muted);
}

.clear-search-btn {
  background: transparent;
  border: none;
  color: var(--color-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Options List */
.options-list-scroll {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-right: 2px;
}

.options-list-scroll::-webkit-scrollbar {
  width: 5px;
}

.options-list-scroll::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 10px;
}

.no-options {
  padding: 20px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-muted);
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.option-item:hover, .option-item.is-highlighted {
  background: var(--color-surface-2);
}

.option-item.is-selected {
  background: rgba(108, 99, 255, 0.12);
}

.option-icon-box {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--color-surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
}

.option-emoji {
  font-size: 1.05rem;
}

.option-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.option-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
}

.option-desc {
  font-size: 0.72rem;
  color: var(--color-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.check-indicator {
  color: var(--color-primary-light);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: auto;
}

/* Animations */
.select-dropdown-anim-enter-active,
.select-dropdown-anim-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.select-dropdown-anim-enter-from,
.select-dropdown-anim-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
