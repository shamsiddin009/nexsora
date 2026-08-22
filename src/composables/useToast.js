import { ref } from 'vue'

const toasts = ref([])
let idCounter = 0

export function useToast() {
  function addToast({ title, message, type = 'info', duration = 4000 }) {
    const id = ++idCounter
    const toast = { id, title, message, type }
    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  function removeToast(id) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  function success(title, message) {
    addToast({ title, message, type: 'success' })
  }

  function error(title, message) {
    addToast({ title, message, type: 'error' })
  }

  function warning(title, message) {
    addToast({ title, message, type: 'warning' })
  }

  function info(title, message) {
    addToast({ title, message, type: 'info' })
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}
