/**
  Telegram Notification Dispatcher Service
  Sends automated alerts to users' Telegram via Nexsora Bot (@NexsoraOPT_bot)
 */

export const TELEGRAM_CONFIG = {
  botUsername: import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'NexsoraOPT_bot',
  botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '8881393508:AAGM2zhdst1GLFNfplK2NuUfgNsWgKh43Ko',
}

function getBaseUrl() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'https://nexsora.uz'
}

export async function sendTelegramNotification(telegramIdOrUsername, message) {
  if (!telegramIdOrUsername || !message) return false

  const cleanTarget = String(telegramIdOrUsername).replace(/^@/, '').trim()
  
  // If a Bot Token is set and target is numeric chat_id, dispatch via Telegram Bot API
  if (TELEGRAM_CONFIG.botToken && /^\d+$/.test(cleanTarget)) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cleanTarget,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: false,
        })
      })
      const data = await response.json()
      return data?.ok === true
    } catch (e) {
      console.warn('Telegram API send failed:', e)
    }
  }

  // Log notification locally for development
  console.log(`[Telegram Alert for @${cleanTarget}]:\n${message}`)
  return true
}

export async function sendOtpToTelegramChat(chatId, otpCode) {
  const message = `🔐 <b>Nexsora Tasdiqlash Kodi:</b> <code>${otpCode}</code>\n\nUshbu kodni saytda kiriting. Kod muddati: 3 daqiqa.\n\n⚠️ <i>Xavfsizlik uchun kodni hech kimga bermang!</i>`
  return await sendTelegramNotification(chatId, message)
}

export function formatJobAlert(job, clientName, isMatchedSpecialty = false) {
  const base = getBaseUrl()
  const budget = (job.budget_max || job.budget_min)
    ? `${new Intl.NumberFormat('uz-UZ').format(job.budget_max || job.budget_min)} so'm`
    : 'Kelishilgan'

  const snippet = job.description
    ? `\n\n📝 <i>"${job.description.slice(0, 110)}${job.description.length > 110 ? '...' : ''}"</i>`
    : ''

  const header = isMatchedSpecialty
    ? `👷 <b>[USTA UCHUN] SIZNING SOHANGIZGA MOS YANGI BUYURTMA!</b>`
    : `👷 <b>[USTA UCHUN] BIRJADA YANGI BUYURTMA!</b>`

  return `${header}\n\n` +
    `📌 <b>${job.title}</b>\n` +
    `📂 Kategoriya: <b>${job.category || 'Umumiy'}</b>\n` +
    `💰 Mo'ljallangan byudjet: <b>${budget}</b>\n` +
    `📍 Manzil: <b>${job.city || 'Toshkent'}</b>\n` +
    `👤 Buyurtmachi: <b>${clientName || 'Mijoz'}</b>` +
    snippet + `\n\n` +
    `👉 <a href="${base}/jobs/${job.id}">Taklif yuborish uchun bosing</a>`
}

export function formatOfferAlert(jobTitle, ustaName, priceText, durationDays, jobId) {
  const base = getBaseUrl()
  return `👤 <b>[MIJOZ UCHUN] E'LONINGIZGA USTADAN YANGI TAKLIF KELDI!</b>\n\n` +
    `📌 E'loningiz: <b>${jobTitle || 'Buyurtma'}</b>\n` +
    `👷 Taklif yuborgan usta: <b>${ustaName || 'Usta'}</b>\n` +
    `💰 Taklif narxi: <b>${priceText}</b>\n` +
    `⏱️ Bajarish muddati: <b>${durationDays} kun</b>\n\n` +
    `👉 <a href="${base}/jobs/${jobId}">Taklifni ko'rish va qabul qilish</a>`
}

export function formatClientJobConfirmation(job) {
  const base = getBaseUrl()
  const budget = (job.budget_max || job.budget_min)
    ? `${new Intl.NumberFormat('uz-UZ').format(job.budget_max || job.budget_min)} so'm`
    : 'Kelishilgan'

  return `👤 <b>[MIJOZ UCHUN] E'LONINGIZ BIRJAGA JOYLASHTIRILDI!</b>\n\n` +
    `📌 E'lon: <b>${job.title}</b>\n` +
    `📂 Kategoriya: <b>${job.category || 'Umumiy'}</b>\n` +
    `💰 Byudjet: <b>${budget}</b>\n` +
    `📍 Hudud: <b>${job.city || 'Toshkent'}</b>\n\n` +
    `📢 <i>E'loningiz birjaga chiqdi. Ustalardan yangi taklif tushishi bilan bot sizga xabar beradi!</i>\n\n` +
    `👉 <a href="${base}/jobs/${job.id}">E'loningizni ko'rish</a>`
}

export function formatRevisionAlert(jobTitle, clientName, chatId) {
  const base = getBaseUrl()
  return `🔄 <b>[USTA UCHUN] Qayta Ko'rib Chiqish So'rovi!</b>\n\n👤 Mijoz ${clientName} "<b>${jobTitle}</b>" ishidagi kamchiliklarni to'g'irlashni so'radi.\n\n👉 <a href="${base}/chat/${chatId}">Tafsilotlarni ko'rish</a>`
}
