import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

/**
 * Generates and manages a referral code for the current user.
 * Code is derived from the user's ID so it's always consistent.
 */
export function useReferral() {
  const authStore = useAuthStore()

  const referralCode = computed(() => {
    const uid = authStore.user?.id || ''
    if (!uid) return null
    // Take first 8 chars of UUID, uppercase — e.g. "NEX-3F7A2C1B"
    const short = uid.replace(/-/g, '').slice(0, 8).toUpperCase()
    return `NEX-${short}`
  })

  const referralLink = computed(() => {
    if (!referralCode.value) return ''
    return `${window.location.origin}/register?ref=${referralCode.value}`
  })

  const referralStats = computed(() => {
    const key = `nexsora_referrals_${authStore.user?.id || 'guest'}`
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}')
      return {
        invited: data.invited || 0,
        earned: data.earned || 0,
        pending: data.pending || 0,
      }
    } catch {
      return { invited: 0, earned: 0, pending: 0 }
    }
  })

  function copyReferralLink() {
    if (!referralLink.value) return false
    navigator.clipboard.writeText(referralLink.value).catch(() => {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = referralLink.value
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    })
    return true
  }

  function getRefCodeFromUrl() {
    const params = new URLSearchParams(window.location.search)
    return params.get('ref') || null
  }

  return {
    referralCode,
    referralLink,
    referralStats,
    copyReferralLink,
    getRefCodeFromUrl,
  }
}
