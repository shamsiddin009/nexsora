// Nexsora Service Worker v1.0
// Handles: offline caching, push notifications, background sync

const CACHE_NAME = 'nexsora-v1'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg'
]

// ─── Install: cache static shell ─────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// ─── Activate: clean up old caches ───────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// ─── Fetch: Network First, fallback to cache ─────────────────────────────────
self.addEventListener('fetch', (event) => {
  // Skip non-GET and external requests
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith(self.location.origin)) return

  // Skip Supabase API calls — always fresh
  if (event.request.url.includes('supabase.co')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses (HTML, JS, CSS, images)
        if (response && response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => {
        // Offline fallback
        return caches.match(event.request).then((cached) => {
          if (cached) return cached
          // For navigation requests return root (SPA fallback)
          if (event.request.mode === 'navigate') {
            return caches.match('/')
          }
        })
      })
  )
})

// ─── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'Nexsora', body: 'Sizga yangi xabar bor!', url: '/chat' }

  try {
    if (event.data) data = { ...data, ...event.data.json() }
  } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'nexsora-notification',
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: data.url },
      actions: [
        { action: 'open', title: "Ko'rish" },
        { action: 'dismiss', title: 'Yopish' }
      ]
    })
  )
})

// ─── Notification Click ───────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'

  if (event.action === 'dismiss') return

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      // Open new window
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
