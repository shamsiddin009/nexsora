/**
 * Nexsora Multi-Gateway Payment Engine
 * Supports Click Up, Payme, Uzum Bank and Internal Escrow Wallet
 */

export const PAYMENT_PROVIDERS = {
  CLICK: 'click',
  PAYME: 'payme',
  UZUM: 'uzum',
  WALLET: 'wallet'
}

// Configurable via environment or platform settings
export const PAYMENT_CONFIG = {
  click: {
    serviceId: import.meta.env.VITE_CLICK_SERVICE_ID || '34281',
    merchantId: import.meta.env.VITE_CLICK_MERCHANT_ID || '25190',
    merchantUserId: import.meta.env.VITE_CLICK_MERCHANT_USER_ID || '38910',
    endpoint: 'https://my.click.uz/services/pay'
  },
  payme: {
    merchantId: import.meta.env.VITE_PAYME_MERCHANT_ID || '64a938c1a7d88921e23f0012',
    endpoint: 'https://checkout.paycom.uz'
  },
  uzum: {
    merchantId: import.meta.env.VITE_UZUM_MERCHANT_ID || 'uzum_nexsora_live',
    endpoint: 'https://www.uzumbank.uz/pay'
  }
}

export const paymentService = {
  /**
   * Generates a Click Up payment redirect URL
   */
  getClickUrl({ orderId, amount, returnUrl = window.location.origin }) {
    const params = new URLSearchParams({
      service_id: PAYMENT_CONFIG.click.serviceId,
      merchant_id: PAYMENT_CONFIG.click.merchantId,
      amount: String(amount),
      transaction_param: String(orderId),
      return_url: returnUrl
    })
    return `${PAYMENT_CONFIG.click.endpoint}?${params.toString()}`
  },

  /**
   * Generates a Payme checkout redirect URL with Base64 encoded payload
   */
  getPaymeUrl({ orderId, amount, returnUrl = window.location.origin }) {
    // Payme accepts amount in tiyins (1 UZS = 100 tiyins)
    const amountInTiyin = Math.round(amount * 100)
    
    // Format: m=MERCHANT_ID;ac.order_id=ORDER_ID;a=AMOUNT;c=RETURN_URL
    const rawData = `m=${PAYMENT_CONFIG.payme.merchantId};ac.order_id=${orderId};a=${amountInTiyin};c=${encodeURIComponent(returnUrl)}`
    
    let base64Data = ''
    try {
      base64Data = btoa(unescape(encodeURIComponent(rawData)))
    } catch (e) {
      base64Data = btoa(rawData)
    }

    return `${PAYMENT_CONFIG.payme.endpoint}/${base64Data}`
  },

  /**
   * Generates an Uzum Bank payment link
   */
  getUzumUrl({ orderId, amount, returnUrl = window.location.origin }) {
    const params = new URLSearchParams({
      merchant_id: PAYMENT_CONFIG.uzum.merchantId,
      order_id: String(orderId),
      amount: String(amount),
      callback: returnUrl
    })
    return `${PAYMENT_CONFIG.uzum.endpoint}?${params.toString()}`
  },

  /**
   * Process a payment (Direct checkout or simulator)
   */
  async processPayment({ provider, amount, title, type = 'topup', orderId }) {
    const transactionId = orderId || 'tx_' + Date.now()
    const returnUrl = `${window.location.origin}/dashboard?payment=success&tx=${transactionId}`

    if (provider === PAYMENT_PROVIDERS.CLICK) {
      const url = this.getClickUrl({ orderId: transactionId, amount, returnUrl })
      return { success: true, redirectUrl: url, transactionId }
    }

    if (provider === PAYMENT_PROVIDERS.PAYME) {
      const url = this.getPaymeUrl({ orderId: transactionId, amount, returnUrl })
      return { success: true, redirectUrl: url, transactionId }
    }

    if (provider === PAYMENT_PROVIDERS.UZUM) {
      const url = this.getUzumUrl({ orderId: transactionId, amount, returnUrl })
      return { success: true, redirectUrl: url, transactionId }
    }

    return { success: true, transactionId, simulated: true }
  }
}
