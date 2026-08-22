import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBookmarkStore = defineStore('bookmarks', () => {
  // ─── State ───────────────────────────────────────────────────────────────────
  const bookmarkedServices = ref(JSON.parse(localStorage.getItem('nexsora_bookmarks_services') || '[]'))
  const bookmarkedJobs = ref(JSON.parse(localStorage.getItem('nexsora_bookmarks_jobs') || '[]'))

  // ─── Getters ─────────────────────────────────────────────────────────────────
  const totalBookmarks = computed(() => bookmarkedServices.value.length + bookmarkedJobs.value.length)

  function isServiceBookmarked(id) {
    return bookmarkedServices.value.some(s => s.id === id)
  }

  function isJobBookmarked(id) {
    return bookmarkedJobs.value.some(j => j.id === id)
  }

  // ─── Actions ─────────────────────────────────────────────────────────────────
  function toggleService(service) {
    const idx = bookmarkedServices.value.findIndex(s => s.id === service.id)
    if (idx === -1) {
      bookmarkedServices.value.push({ ...service, savedAt: Date.now() })
    } else {
      bookmarkedServices.value.splice(idx, 1)
    }
    _saveServices()
    return idx === -1 // true = added, false = removed
  }

  function toggleJob(job) {
    const idx = bookmarkedJobs.value.findIndex(j => j.id === job.id)
    if (idx === -1) {
      bookmarkedJobs.value.push({ ...job, savedAt: Date.now() })
    } else {
      bookmarkedJobs.value.splice(idx, 1)
    }
    _saveJobs()
    return idx === -1
  }

  function removeService(id) {
    bookmarkedServices.value = bookmarkedServices.value.filter(s => s.id !== id)
    _saveServices()
  }

  function removeJob(id) {
    bookmarkedJobs.value = bookmarkedJobs.value.filter(j => j.id !== id)
    _saveJobs()
  }

  function clearAll() {
    bookmarkedServices.value = []
    bookmarkedJobs.value = []
    localStorage.removeItem('nexsora_bookmarks_services')
    localStorage.removeItem('nexsora_bookmarks_jobs')
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────
  function _saveServices() {
    localStorage.setItem('nexsora_bookmarks_services', JSON.stringify(bookmarkedServices.value))
  }
  function _saveJobs() {
    localStorage.setItem('nexsora_bookmarks_jobs', JSON.stringify(bookmarkedJobs.value))
  }

  return {
    bookmarkedServices,
    bookmarkedJobs,
    totalBookmarks,
    isServiceBookmarked,
    isJobBookmarked,
    toggleService,
    toggleJob,
    removeService,
    removeJob,
    clearAll,
  }
})
