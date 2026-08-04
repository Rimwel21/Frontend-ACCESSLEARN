const CACHE_VERSION = buildCacheVersion()
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`
const CURRENT_CACHES = [APP_SHELL_CACHE, RUNTIME_CACHE]
const APP_SHELL_FALLBACK = '/index.html'
const APP_SHELL = [APP_SHELL_FALLBACK, '/manifest.webmanifest', '/favicon.svg', '/icons.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then(cache => Promise.all(APP_SHELL.map(url => cacheFresh(cache, url))))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('signhear-') && !CURRENT_CACHES.includes(key))
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
    event.respondWith(networkFirstNavigation(request))
    return
  }

  if (isStaticAsset(request, url)) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE))
    return
  }

  if (isApiRequest(url)) return
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
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

async function cacheFresh(cache, url) {
  const response = await fetch(new Request(url, { cache: 'reload' }))
  if (response.ok) {
    await cache.put(url, response.clone())
  }
  return response
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(APP_SHELL_CACHE)
  try {
    const response = await fetch(request, { cache: 'no-store' })
    if (response.ok) {
      await cache.put(APP_SHELL_FALLBACK, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached

    const fallback = await cache.match(APP_SHELL_FALLBACK)
    if (fallback) return fallback

    return new Response('Offline. Please reconnect to load this page.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    })
  }
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

function isApiRequest(url) {
  return url.origin !== self.location.origin
    || url.pathname.startsWith('/auth/')
    || url.pathname.startsWith('/profile/')
    || url.pathname.startsWith('/student/')
    || url.pathname.startsWith('/teacher/')
    || url.pathname.startsWith('/admin/')
}

async function notifyClientsToSync() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true })
  clients.forEach(client => client.postMessage({ type: 'SYNC_PENDING_REQUESTS' }))
}

function buildCacheVersion() {
  const build = new URL(self.location.href).searchParams.get('build') || 'dev'
  return `signhear-${build.replace(/[^a-z0-9_-]/gi, '').slice(0, 64) || 'dev'}`
}
