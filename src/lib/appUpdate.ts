const PENDING_BUILD_KEY = 'signhear:pending-build-signature'
const RELOAD_ATTEMPT_KEY = 'signhear:update-reload-signature'
const CHECK_INTERVAL_MS = 15 * 60 * 1000
const BUILD_CHECK_PARAM = 'signhear_build_check'
const CONTROLLER_CHANGE_TIMEOUT_MS = 5000

let currentBuildSignature = getCurrentBuildSignature()
let checking = false
let applyingUpdate = false

export function setupAppUpdateChecks() {
  if (import.meta.env.DEV) {
    void clearDevelopmentServiceWorker()
    return
  }

  clearAppliedBuildMarker()
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

  const registration = await navigator.serviceWorker.register(serviceWorkerUrl(currentBuildSignature), {
    updateViaCache: 'none',
  }).catch(() => null)

  if (!registration) return

  await registration.update().catch(() => null)
}

async function checkForUpdatedBuild() {
  if (checking || !navigator.onLine) return
  checking = true

  try {
    const response = await fetch(cacheBustedIndexUrl(), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    })

    if (!response.ok) return

    const latestSignature = getBuildSignatureFromHtml(await response.text())
    if (!latestSignature || latestSignature === currentBuildSignature) return

    if (sessionStorage.getItem(RELOAD_ATTEMPT_KEY) === latestSignature) return

    sessionStorage.setItem(PENDING_BUILD_KEY, latestSignature)
    await updateServiceWorkerForBuild(latestSignature)
    sessionStorage.setItem(RELOAD_ATTEMPT_KEY, latestSignature)
    window.location.replace(cacheBustedCurrentUrl(latestSignature))
  } catch {
    // Update checks should never interrupt offline-capable app startup.
  } finally {
    checking = false
  }
}

async function updateServiceWorkerForBuild(buildSignature: string) {
  if (!('serviceWorker' in navigator) || applyingUpdate) return
  applyingUpdate = true

  try {
    const controllerChange = waitForControllerChange()
    const registration = await navigator.serviceWorker.register(serviceWorkerUrl(buildSignature), {
      updateViaCache: 'none',
    }).catch(() => null)

    await registration?.update().catch(() => null)
    const pendingWorker = registration?.waiting || registration?.installing
    pendingWorker?.postMessage({ type: 'SKIP_WAITING' })
    await controllerChange
  } finally {
    applyingUpdate = false
  }
}

function clearAppliedBuildMarker() {
  const pendingSignature = sessionStorage.getItem(PENDING_BUILD_KEY)
  if (pendingSignature && pendingSignature === currentBuildSignature) {
    sessionStorage.removeItem(PENDING_BUILD_KEY)
    sessionStorage.removeItem(RELOAD_ATTEMPT_KEY)
  }
  if (new URL(window.location.href).searchParams.has(BUILD_CHECK_PARAM)) {
    const cleanUrl = new URL(window.location.href)
    cleanUrl.searchParams.delete(BUILD_CHECK_PARAM)
    window.history.replaceState(window.history.state, '', `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`)
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

function cacheBustedIndexUrl() {
  const url = new URL('/index.html', window.location.origin)
  url.searchParams.set(BUILD_CHECK_PARAM, String(Date.now()))
  return url.toString()
}

function cacheBustedCurrentUrl(buildSignature: string) {
  const url = new URL(window.location.href)
  url.searchParams.set(BUILD_CHECK_PARAM, encodeBuildSignature(buildSignature))
  return url.toString()
}

function serviceWorkerUrl(buildSignature: string) {
  const url = new URL('/sw.js', window.location.origin)
  url.searchParams.set('build', encodeBuildSignature(buildSignature || 'dev'))
  return url.pathname + url.search
}

function waitForControllerChange() {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return Promise.resolve()
  }

  return new Promise<void>((resolve) => {
    let resolved = false
    const finish = () => {
      if (resolved) return
      resolved = true
      navigator.serviceWorker.removeEventListener('controllerchange', finish)
      resolve()
    }

    navigator.serviceWorker.addEventListener('controllerchange', finish)
    window.setTimeout(finish, CONTROLLER_CHANGE_TIMEOUT_MS)
  })
}

function encodeBuildSignature(buildSignature: string) {
  let hash = 0
  for (let index = 0; index < buildSignature.length; index += 1) {
    hash = Math.imul(31, hash) + buildSignature.charCodeAt(index) | 0
  }
  return Math.abs(hash).toString(36)
}
