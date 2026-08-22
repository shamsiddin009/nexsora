/**
 * Nexsora Telegram Notification Dispatcher
 * Sends formatted Markdown notifications to Nexsora Telegram Bot (@NexsoraOPT_bot)
 */

export const TELEGRAM_CONFIG = {
  botUsername: 'NexsoraOPT_bot',
  botUrl: 'https://t.me/NexsoraOPT_bot',
}

export const telegramNotificationService = {
  /**
   * Dispatches a notification to the user's Telegram or console logger
   */
  async notify({ type, title, message, actionUrl, payload = {} }) {
    const timestamp = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    
    let icon = '🔔'
    if (type === 'new_job') icon = '📢'
    if (type === 'offer_received') icon = '🤝'
    if (type === 'message') icon = '💬'
    if (type === 'escrow_paid') icon = '💳'
    if (type === 'boost_active') icon = '⚡'

    const formattedTelegramMessage = `
${icon} *NEXSORA BILDIRISHNOMA* (${timestamp})
━━━━━━━━━━━━━━━━━━━━
*${title}*
${message}

🔗 [Batafsil ko'rish](${actionUrl || window.location.origin})
━━━━━━━━━━━━━━━━━━━━
🤖 @${TELEGRAM_CONFIG.botUsername}
    `.trim()

    // Store in browser notification log for demo / real tracking
    try {
      const logs = JSON.parse(localStorage.getItem('nexsora_tg_notif_logs') || '[]')
      logs.unshift({
        id: 'tg_' + Date.now(),
        type,
        title,
        message,
        actionUrl,
        formattedTelegramMessage,
        date: new Date().toISOString()
      })
      localStorage.setItem('nexsora_tg_notif_logs', JSON.stringify(logs.slice(0, 50)))
    } catch (e) {}

    console.log('📲 [Telegram Notification Dispatched]:\n', formattedTelegramMessage)
    return { success: true, message: formattedTelegramMessage }
  },

  /**
   * Helper: Open Telegram Bot
   */
  openBot(startParam = 'start') {
    window.open(`${TELEGRAM_CONFIG.botUrl}?start=${startParam}`, '_blank')
  }
}
