const RELOAD_MARKER_KEY = 'signhear:last-applied-build-signature'
const CHECK_INTERVAL_MS = 15 * 60 * 1000

let currentBuildSignature = getCurrentBuildSignature()
let checking = false

export function setupAppUpdateChecks() {
  if (import.meta.env.DEV) {
    void clearDevelopmentServiceWorker()
    return
  }

  void registerServiceWorker()
  void checkForUpdatedBuild()

  window.addEventListener('focus', () => {
    void checkForUpdatedBuild()
  })

  window.addEventListener('online', () => {
    void checkForUpdatedBuild()
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void checkForUpdatedBuild()
    }
  })

  window.setInterval(() => {
    void checkForUpdatedBuild()
  }, CHECK_INTERVAL_MS)
}

async function clearDevelopmentServiceWorker() {
  if (!('serviceWorker' in navigator)) return

  const registrations = await navigator.serviceWorker.getRegistrations().catch(() => [])
  await Promise.all(registrations.map(registration => registration.unregister()))

  if ('caches' in window) {
    const keys = await caches.keys().catch(() => [])
    await Promise.all(
      keys
        .filter(key => key.startsWith('signhear-'))
        .map(key => caches.delete(key))
    )
  }
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return

  const hadController = Boolean(navigator.serviceWorker.controller)
  let refreshingForController = false

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || refreshingForController) return
    refreshingForController = true
    window.location.reload()
  })

  const registration = await navigator.serviceWorker.register('/sw.js', {
    updateViaCache: 'none',
  }).catch(() => null)

  if (!registration) return

  await registration.update().catch(() => null)
}

async function checkForUpdatedBuild() {
  if (checking || !navigator.onLine) return
  checking = true

  try {
    const response = await fetch('/index.html', {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    })

    if (!response.ok) return

    const latestSignature = getBuildSignatureFromHtml(await response.text())
    if (!latestSignature || latestSignature === currentBuildSignature) return

    const lastAppliedSignature = sessionStorage.getItem(RELOAD_MARKER_KEY)
    if (lastAppliedSignature === latestSignature) {
      currentBuildSignature = latestSignature
      return
    }

    sessionStorage.setItem(RELOAD_MARKER_KEY, latestSignature)
    window.location.reload()
  } catch {
    // Update checks should never interrupt offline-capable app startup.
  } finally {
    checking = false
  }
}

function getCurrentBuildSignature() {
  const urls = [
    ...Array.from(document.querySelectorAll<HTMLScriptElement>('script[type="module"][src]')).map(item => item.src),
    ...Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]')).map(item => item.href),
  ]

  return normalizeBuildUrls(urls).join('|')
}

function getBuildSignatureFromHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const urls = [
    ...Array.from(doc.querySelectorAll<HTMLScriptElement>('script[type="module"][src]')).map(item => item.getAttribute('src') ?? ''),
    ...Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]')).map(item => item.getAttribute('href') ?? ''),
  ]

  return normalizeBuildUrls(urls).join('|')
}

function normalizeBuildUrls(urls: string[]) {
  return urls
    .filter(Boolean)
    .map(url => new URL(url, window.location.origin))
    .filter(url => url.origin === window.location.origin)
    .map(url => `${url.pathname}${url.search}`)
    .sort()
}
