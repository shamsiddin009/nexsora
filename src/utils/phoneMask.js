/**
  Uzbekistan Phone Mask Helper (+998 XX XXX-XX-XX)
 */

export function formatUzbekPhone(value) {
  if (!value) return '+998 '
  
  // Extract digits
  let digits = value.replace(/\D/g, '')

  // Ensure prefix 998
  if (!digits.startsWith('998')) {
    if (digits.startsWith('9') || digits.startsWith('8')) {
      digits = '998' + digits
    } else {
      digits = '998' + digits
    }
  }

  // Cap length to 12 digits (998 + 9 digits)
  digits = digits.slice(0, 12)

  let formatted = '+' + digits.slice(0, 3)

  if (digits.length > 3) {
    formatted += ' ' + digits.slice(3, 5)
  }
  if (digits.length > 5) {
    formatted += ' ' + digits.slice(5, 8)
  }
  if (digits.length > 8) {
    formatted += '-' + digits.slice(8, 10)
  }
  if (digits.length > 10) {
    formatted += '-' + digits.slice(10, 12)
  }

  return formatted
}

export function isValidUzbekPhone(phone) {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 12 && digits.startsWith('998')
}
