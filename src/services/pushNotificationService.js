/**
 * Nexsora Web Push & Browser Notifications Service
 */

class PushNotificationService {
  constructor() {
    this.supported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator
  }

  isSupported() {
    return this.supported
  }

  get permission() {
    if (!this.supported) return 'denied'
    return Notification.permission
  }

  async requestPermission() {
    if (!this.supported) return false

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (e) {
      console.warn('Notification permission request error:', e)
      return false
    }
  }

  /**
   * Display a browser notification via Service Worker
   */
  async showNotification({ title = 'Nexsora', body = '', url = '/chat', icon = '/favicon.svg' }) {
    if (!this.supported || this.permission !== 'granted') return

    try {
      const reg = await navigator.serviceWorker.ready
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon,
          badge: '/favicon.svg',
          tag: 'nexsora-' + Date.now(),
          renotify: true,
          data: { url },
          vibrate: [200, 100, 200]
        })
      } else {
        new Notification(title, { body, icon })
      }
    } catch (e) {
      console.warn('Show notification warning:', e)
    }
  }
}

export const pushNotificationService = new PushNotificationService()
