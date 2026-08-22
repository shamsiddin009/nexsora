/**
 * Nexsora Telegram Mini App (WebApp) Integration Service
 */

class TelegramWebAppService {
  constructor() {
    this.tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null
    this.isInsideTelegram = !!(this.tg && this.tg.initData)
  }

  init() {
    if (!this.tg) return

    try {
      // 1. Expand WebApp to full screen
      this.tg.ready()
      this.tg.expand()

      // 2. Enable closing confirmation to prevent accidental swipe-down exits
      if (this.tg.enableClosingConfirmation) {
        this.tg.enableClosingConfirmation()
      }

      // 3. Set header color to match Nexsora branding
      if (this.tg.setHeaderColor) {
        this.tg.setHeaderColor('#6C63FF')
      }

      // 4. Listen for theme change
      if (this.tg.onEvent) {
        this.tg.onEvent('themeChanged', () => {
          this.applyTelegramTheme()
        })
      }

      this.applyTelegramTheme()
    } catch (e) {
      console.warn('Telegram WebApp init warning:', e)
    }
  }

  get user() {
    return this.tg?.initDataUnsafe?.user || null
  }

  get language() {
    return this.user?.language_code || 'uz'
  }

  applyTelegramTheme() {
    if (!this.tg) return
    const isDark = this.tg.colorScheme === 'dark'
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark-theme')
      } else {
        document.documentElement.classList.remove('dark-theme')
      }
    }
  }

  /**
   * Triggers haptic feedback vibration on mobile devices
   * Types: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
   */
  hapticImpact(style = 'light') {
    try {
      this.tg?.HapticFeedback?.impactOccurred(style)
    } catch (e) {}
  }

  /**
   * Notification vibration
   * Types: 'error' | 'success' | 'warning'
   */
  hapticNotification(type = 'success') {
    try {
      this.tg?.HapticFeedback?.notificationOccurred(type)
    } catch (e) {}
  }

  hapticSelection() {
    try {
      this.tg?.HapticFeedback?.selectionChanged()
    } catch (e) {}
  }

  close() {
    try {
      this.tg?.close()
    } catch (e) {}
  }
}

export const telegramWebApp = new TelegramWebAppService()
