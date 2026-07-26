const CACHE_VERSION = 'signhear-v1'
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`
const API_CACHE = `${CACHE_VERSION}-api`
const APP_SHELL = ['/', '/manifest.webmanifest', '/favicon.svg', '/icons.svg']
const CACHEABLE_API_PATHS = ['/student/modules', '/student/activities', '/profile']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => !key.startsWith(CACHE_VERSION))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, APP_SHELL_CACHE, '/'))
    return
  }

  if (isStaticAsset(request, url)) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE))
    return
  }

  if (isCacheableApi(url)) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE))
  }
})

self.addEventListener('sync', (event) => {
  if (event.tag === 'signhear-sync') {
    event.waitUntil(notifyClientsToSync())
  }
})

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch {
    return (await cache.match(request)) || (await cache.match(fallbackUrl))
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const fresh = fetch(request)
    .then(response => {
      if (response.ok) cache.put(request, response.clone())
      return response
    })
    .catch(() => cached)

  return cached || fresh
}

function isStaticAsset(request, url) {
  return request.destination === 'script'
    || request.destination === 'style'
    || request.destination === 'font'
    || request.destination === 'image'
    || request.destination === 'video'
    || request.destination === 'document'
    || url.pathname.startsWith('/assets/')
    || url.pathname.startsWith('/static/')
}

function isCacheableApi(url) {
  return CACHEABLE_API_PATHS.some(path => url.pathname.startsWith(path))
}

async function notifyClientsToSync() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true })
  clients.forEach(client => client.postMessage({ type: 'SYNC_PENDING_REQUESTS' }))
}
