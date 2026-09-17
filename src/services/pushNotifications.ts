import { apiFetch } from '@/lib/api'

export type PushNotificationStatus =
  | 'idle'
  | 'enabled'
  | 'unsupported'
  | 'not-configured'
  | 'permission-denied'
  | 'failed'

interface PushConfig {
  enabled: boolean
  public_key?: string | null
}

export async function getPushNotificationStatus(): Promise<PushNotificationStatus> {
  if (!isPushSupported()) return 'unsupported'
  if (Notification.permission === 'denied') return 'permission-denied'

  const config = await getPushConfig()
  if (!config.enabled || !config.public_key) return 'not-configured'

  if (Notification.permission !== 'granted') return 'idle'

  const registration = await ensureServiceWorkerRegistration()
  const subscription = await registration.pushManager.getSubscription()
  return subscription ? 'enabled' : 'idle'
}

export async function enableStudentPushNotifications(): Promise<PushNotificationStatus> {
  if (!isPushSupported()) return 'unsupported'

  const config = await getPushConfig()
  if (!config.enabled || !config.public_key) return 'not-configured'

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return 'permission-denied'

  const registration = await ensureServiceWorkerRegistration()
  const existingSubscription = await registration.pushManager.getSubscription()
  const subscription = existingSubscription ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(config.public_key),
  })

  await apiFetch('/notifications/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription.toJSON()),
  })

  return 'enabled'
}

function isPushSupported() {
  return 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window
}

async function getPushConfig() {
  try {
    return await apiFetch<PushConfig>('/notifications/push/config')
  } catch {
    return { enabled: false }
  }
}

async function ensureServiceWorkerRegistration() {
  const registration = await navigator.serviceWorker.getRegistration()
  if (registration) return registration

  return navigator.serviceWorker.register('/sw.js?build=push')
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = `${base64String}${padding}`.replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index)
  }

  return outputArray
}
