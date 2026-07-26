import { API_BASE_URL } from '@/lib/api'
import {
  countPendingRequests,
  getPendingRequests,
  queuePendingRequest,
  removePendingRequest,
  updatePendingRequest,
  type PendingRequest,
} from '@/lib/offlineDb'

const SYNC_EVENT = 'signhear-sync-state'

export type SyncStatus = 'idle' | 'syncing' | 'complete' | 'failed'

export interface SyncState {
  status: SyncStatus
  pending: number
  message: string
}

function emitSyncState(state: SyncState) {
  window.dispatchEvent(new CustomEvent<SyncState>(SYNC_EVENT, { detail: state }))
}

export function onSyncState(listener: (state: SyncState) => void) {
  const wrapped = (event: Event) => listener((event as CustomEvent<SyncState>).detail)
  window.addEventListener(SYNC_EVENT, wrapped)
  return () => window.removeEventListener(SYNC_EVENT, wrapped)
}

export async function queueStudentMutation(path: string, method: string, body: unknown, token?: string | null) {
  const serializedBody = JSON.stringify(body ?? {})
  const dedupeKey = `${method}:${path}:${serializedBody}`
  await queuePendingRequest({
    dedupeKey,
    path,
    method,
    body: serializedBody,
    token,
  })
  await requestBackgroundSync()
  emitSyncState({
    status: 'idle',
    pending: await countPendingRequests(),
    message: 'Saved offline. It will sync when internet returns.',
  })
}

async function requestBackgroundSync() {
  const registration = await navigator.serviceWorker?.ready.catch(() => null)
  const sync = registration && 'sync' in registration
    ? (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync
    : null
  await sync?.register('signhear-sync').catch(() => null)
}

export async function syncPendingRequests() {
  if (!navigator.onLine) {
    emitSyncState({
      status: 'idle',
      pending: await countPendingRequests(),
      message: 'Offline mode. Work is saved on this device.',
    })
    return
  }

  const requests = await getPendingRequests()
  if (requests.length === 0) {
    emitSyncState({ status: 'complete', pending: 0, message: 'All offline work is synced.' })
    return
  }

  emitSyncState({ status: 'syncing', pending: requests.length, message: 'Syncing offline work...' })

  for (const request of requests) {
    await syncOneRequest(request)
  }

  const pending = await countPendingRequests()
  emitSyncState({
    status: pending ? 'failed' : 'complete',
    pending,
    message: pending ? 'Some offline work could not sync yet.' : 'Offline work synced successfully.',
  })
}

async function syncOneRequest(request: PendingRequest) {
  if (!request.id) return

  try {
    const headers = new Headers({ 'Content-Type': 'application/json' })
    const token = request.token ?? localStorage.getItem('access_token')
    if (token) headers.set('Authorization', `Bearer ${token}`)

    const response = await fetch(`${API_BASE_URL}${request.path}`, {
      method: request.method,
      headers,
      body: request.body,
      cache: 'no-store',
    })

    if (response.ok || response.status === 409) {
      await removePendingRequest(request.id)
      return
    }

    await updatePendingRequest({ ...request, attempts: request.attempts + 1 })
  } catch {
    await updatePendingRequest({ ...request, attempts: request.attempts + 1 })
  }
}
