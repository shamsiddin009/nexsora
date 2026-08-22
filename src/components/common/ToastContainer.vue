<template>
  <div class="toast-container" aria-live="polite" aria-atomic="true">
    <transition-group name="toast-fade" tag="div" class="toast-wrapper">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        :class="['toast-item', `toast-${toast.type}`]"
      >
        <div class="toast-icon">
          <CheckCircle2 v-if="toast.type === 'success'" :size="20" class="icon-success" />
          <AlertCircle v-else-if="toast.type === 'error'" :size="20" class="icon-error" />
          <AlertTriangle v-else-if="toast.type === 'warning'" :size="20" class="icon-warning" />
          <Info v-else :size="20" class="icon-info" />
        </div>

        <div class="toast-content">
          <h4 v-if="toast.title" class="toast-title">{{ toast.title }}</h4>
          <p class="toast-message">{{ toast.message }}</p>
        </div>

        <button @click="removeToast(toast.id)" class="toast-close" title="Yopish">
          <X :size="16" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToast } from '../../composables/useToast'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  max-width: 400px;
  width: calc(100vw - 48px);
  pointer-events: none;
}

.toast-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast-item {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--bg-card, #ffffff);
  color: var(--text-main, #111827);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color, #e5e7eb);
  backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-title {
  margin: 0 0 2px 0;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.2;
}

.toast-message {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.9;
  line-height: 1.4;
}

.toast-content {
  flex: 1;
}

.toast-close {
  background: transparent;
  border: none;
  color: var(--text-muted, #6b7280);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.2s;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.06);
}

.toast-success {
  border-left: 4px solid #10b981;
}
.icon-success { color: #10b981; }

.toast-error {
  border-left: 4px solid #ef4444;
}
.icon-error { color: #ef4444; }

.toast-warning {
  border-left: 4px solid #f59e0b;
}
.icon-warning { color: #f59e0b; }

.toast-info {
  border-left: 4px solid #6366f1;
}
.icon-info { color: #6366f1; }

/* Transitions */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
