export function formatPrice(amount) {
  if (!amount) return '0 so\'m'
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m'
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Hozirgina'
  if (diffMins < 60) return `${diffMins} daqiqa oldin`
  if (diffHours < 24) return `${diffHours} soat oldin`
  if (diffDays < 7) return `${diffDays} kun oldin`
  return formatDate(dateStr)
}

export function generateUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function toDeterministicUuid(str) {
  if (!str) return generateUuid()
  const cleanStr = String(str).trim()
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanStr)) {
    return cleanStr.toLowerCase()
  }
  let hash1 = 0, hash2 = 0
  for (let i = 0; i < cleanStr.length; i++) {
    const ch = cleanStr.charCodeAt(i)
    hash1 = ((hash1 << 5) - hash1) + ch
    hash1 = hash1 & hash1
    hash2 = ((hash2 << 7) - hash2) + ch + i
    hash2 = hash2 & hash2
  }
  const h1 = Math.abs(hash1).toString(16).padStart(8, '0').slice(0, 8)
  const h2 = Math.abs(hash2).toString(16).padStart(8, '0').slice(0, 8)
  const h3 = Math.abs((hash1 ^ hash2)).toString(16).padStart(8, '0').slice(0, 8)
  const h4 = Math.abs((hash1 + hash2)).toString(16).padStart(8, '0').slice(0, 8)
  return `${h1}-${h2.slice(0, 4)}-4${h2.slice(4, 7)}-a${h3.slice(0, 3)}-${h4.slice(0, 12).padEnd(12, '0')}`
}

export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusLabel(status) {
  const labels = {
    open: 'Ochiq',
    negotiating: 'Kelishilmoqda',
    in_progress: 'Bajarilmoqda',
    revision: "Ko'rib chiqilmoqda",
    completed: 'Topshirildi',
    cancelled: 'Bekor qilindi',
  }
  return labels[status] || status
}

export function getStatusColor(status) {
  const colors = {
    open: 'var(--color-success)',
    negotiating: 'var(--color-warning)',
    in_progress: 'var(--color-primary)',
    revision: '#FA8231',
    completed: 'var(--color-muted)',
    cancelled: 'var(--color-error)',
  }
  return colors[status] || 'var(--color-muted)'
}

export const JOB_CATEGORIES = [
  'Quruvchi & Brigada',
  'G\'isht teruvchi',
  'Betonchi & Poydevor',
  'Tom yopuvchi',
  'Suvoqchi & Malyar',
  'Kafelchi & Plitochnik',
  'Fasadchi',
  'Santexnik',
  'Elektrik',
  'Duradgor & Mebel',
  'Konditsioner',
  'Temirchi & Svarka',
  'Tozalovchi',
  'Boshqa',
]

export const CATEGORY_OPTIONS = [
  { value: 'Quruvchi & Brigada', label: 'Quruvchi & Brigada', icon: '🏗️', desc: 'Noldan kalitgacha bino qurilishi va jamoalar' },
  { value: 'G\'isht teruvchi', label: 'G\'isht teruvchi', icon: '🧱', desc: 'G\'isht, gazoblok, shlakoblok va devor terish' },
  { value: 'Betonchi & Poydevor', label: 'Betonchi & Poydevor', icon: '🪵', desc: 'Fundament quyish, armatura va monolit' },
  { value: 'Tom yopuvchi', label: 'Tom yopuvchi (Krovlya)', icon: '🏠', desc: 'Tom, chordoq, profnastil va cherepitsa' },
  { value: 'Suvoqchi & Malyar', label: 'Suvoqchi & Malyar', icon: '🎨', desc: 'Suvoq, gipsokarton, shpaklyovka va bo\'yash' },
  { value: 'Kafelchi & Plitochnik', label: 'Kafelchi & Plitochnik', icon: '🔲', desc: 'Kafel, marmar, granit va plitka terish' },
  { value: 'Fasadchi', label: 'Fasadchi & Tashqi bezak', icon: '🏛️', desc: 'Travertin, termo-panel, alyukobond' },
  { value: 'Santexnik', label: 'Santexnik', icon: '🔧', desc: 'Suv quvurlari, issiq pol va montaj' },
  { value: 'Elektrik', label: 'Elektrik', icon: '⚡', desc: 'Simlar, avtomat va elektr ta\'minoti' },
  { value: 'Duradgor & Mebel', label: 'Duradgor & Mebel', icon: '🪚', desc: 'Eshik, rom va mebel yig\'ish' },
  { value: 'Konditsioner', label: 'Konditsioner', icon: '❄️', desc: 'O\'rnatish, ta\'mirlash va freon' },
  { value: 'Temirchi & Svarka', label: 'Temirchi & Svarka', icon: '🔨', desc: 'Darvoza, panjara va metall konstruksiya' },
  { value: 'Tozalovchi', label: 'Tozalovchi', icon: '🧹', desc: 'Qurilishdan keyingi tozalash va cleaning' },
  { value: 'Boshqa', label: 'Boshqa xizmatlar', icon: '✨', desc: 'Boshqa turdagi mutaxassisliklar' },
]


export const UZ_CITIES = [
  'Toshkent',
  'Samarqand',
  'Buxoro',
  'Namangan',
  'Andijon',
  'Farg\'ona',
  'Nukus',
  'Qarshi',
  'Jizzax',
  'Urganch',
  'Termiz',
  'Navoi',
  'Guliston',
  'Sirdaryo',
]

export const TASHKENT_DISTRICTS = [
  'Yunusobod',
  'Chilonzor',
  'Mirzo Ulug\'bek',
  'Yashnobod',
  'Mirobod',
  'Shayxontohur',
  'Yakkasaroy',
  'Olmazor',
  'Uchtepa',
  'Sergeli',
  'Yangihayot',
  'Bektemir',
]

export const DISTRICT_OPTIONS = TASHKENT_DISTRICTS.map(d => ({
  value: d,
  label: `${d} tumani`,
  icon: '🏙️',
  desc: `Toshkent shahri, ${d} tumani`
}))

export const RATING_OPTIONS = [
  { value: '4.5', label: '4.5+ ⭐ A\'lo reyting', icon: '⭐' },
  { value: '4.0', label: '4.0+ ⭐ Yaxshi reyting', icon: '⭐' },
  { value: '3.0', label: '3.0+ ⭐ O\'rtacha reyting', icon: '⭐' },
]

export const CITY_OPTIONS = UZ_CITIES.map(city => ({
  value: city,
  label: city,
  icon: '📍',
  desc: `${city} shahri va atrofi`
}))

export function getCategoryIcon(catName) {
  const found = CATEGORY_OPTIONS.find(c => c.value === catName)
  return found?.icon || '🛠️'
}

export function debounce(fn, delay = 300) {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}


