const DB_NAME = 'signhear-offline'
const DB_VERSION = 1
const CACHE_STORE = 'apiCache'
const QUEUE_STORE = 'pendingRequests'

export interface CachedResponse<T = unknown> {
  key: string
  data: T
  updatedAt: string
}

export interface PendingRequest {
  id?: number
  dedupeKey: string
  path: string
  method: string
  body?: string
  token?: string | null
  createdAt: string
  attempts: number
}

function openOfflineDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, { keyPath: 'key' })
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const queue = db.createObjectStore(QUEUE_STORE, { keyPath: 'id', autoIncrement: true })
        queue.createIndex('dedupeKey', 'dedupeKey', { unique: true })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function runStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
) {
  return openOfflineDb().then(db => new Promise<T>((resolve, reject) => {
    const tx = db.transaction(storeName, mode)
    const store = tx.objectStore(storeName)
    const request = action(store)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  }))
}

export function cacheApiResponse<T>(key: string, data: T) {
  const item: CachedResponse<T> = { key, data, updatedAt: new Date().toISOString() }
  return runStore<IDBValidKey>(CACHE_STORE, 'readwrite', store => store.put(item))
}

export async function getCachedApiResponse<T>(key: string) {
  const result = await runStore<CachedResponse<T> | undefined>(CACHE_STORE, 'readonly', store => store.get(key))
  return result?.data ?? null
}

export async function queuePendingRequest(request: Omit<PendingRequest, 'createdAt' | 'attempts'>) {
  const existing = await findPendingByDedupeKey(request.dedupeKey)
  if (existing?.id) return existing.id

  const item: PendingRequest = {
    ...request,
    createdAt: new Date().toISOString(),
    attempts: 0,
  }
  return runStore<IDBValidKey>(QUEUE_STORE, 'readwrite', store => store.add(item))
}

export function getPendingRequests() {
  return runStore<PendingRequest[]>(QUEUE_STORE, 'readonly', store => store.getAll())
}

export function removePendingRequest(id: number) {
  return runStore<undefined>(QUEUE_STORE, 'readwrite', store => store.delete(id))
}

export function updatePendingRequest(request: PendingRequest) {
  return runStore<IDBValidKey>(QUEUE_STORE, 'readwrite', store => store.put(request))
}

export function countPendingRequests() {
  return runStore<number>(QUEUE_STORE, 'readonly', store => store.count())
}

function findPendingByDedupeKey(dedupeKey: string) {
  return openOfflineDb().then(db => new Promise<PendingRequest | undefined>((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readonly')
    const request = tx.objectStore(QUEUE_STORE).index('dedupeKey').get(dedupeKey)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  }))
}
