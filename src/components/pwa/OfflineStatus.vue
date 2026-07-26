<template>
  <div class="fixed bottom-4 left-4 z-[70] max-w-[calc(100vw-2rem)]">
    <div
      v-if="visible"
      :class="[
        'rounded-lg border px-4 py-3 text-xs font-bold shadow-card',
        online ? 'border-brand-teal bg-white text-brand-blue' : 'border-brand-amber bg-brand-amber text-white',
      ]"
      role="status"
      aria-live="polite"
    >
      <div>{{ title }}</div>
      <div v-if="message" class="mt-1 font-medium opacity-80">{{ message }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { countPendingRequests } from '@/lib/offlineDb'
import { onSyncState, syncPendingRequests, type SyncState } from '@/lib/offlineSync'

const online = ref(navigator.onLine)
const pending = ref(0)
const syncState = ref<SyncState>({ status: 'idle', pending: 0, message: '' })
const recentlyChanged = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | null = null
let removeSyncListener: (() => void) | null = null

const visible = computed(() => !online.value || pending.value > 0 || syncState.value.status === 'syncing' || recentlyChanged.value)
const title = computed(() => {
  if (!online.value) return 'Offline Mode'
  if (syncState.value.status === 'syncing') return 'Syncing'
  if (pending.value > 0) return `${pending.value} item${pending.value === 1 ? '' : 's'} pending sync`
  if (recentlyChanged.value) return 'Back Online'
  return 'Online'
})
const message = computed(() => {
  if (!online.value) return 'Student learning work is saved on this device.'
  return syncState.value.message
})

onMounted(() => {
  refreshPending()
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage)
  removeSyncListener = onSyncState((state) => {
    syncState.value = state
    pending.value = state.pending
    markRecentlyChanged()
  })
  if (online.value) syncPendingRequests()
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage)
  removeSyncListener?.()
  if (hideTimer) clearTimeout(hideTimer)
})

function handleOnline() {
  online.value = true
  markRecentlyChanged()
  syncPendingRequests()
}

function handleOffline() {
  online.value = false
  markRecentlyChanged()
  refreshPending()
}

function handleServiceWorkerMessage(event: MessageEvent) {
  if (event.data?.type === 'SYNC_PENDING_REQUESTS') {
    syncPendingRequests()
  }
}

function markRecentlyChanged() {
  recentlyChanged.value = true
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    recentlyChanged.value = false
  }, 4500)
}

async function refreshPending() {
  pending.value = await countPendingRequests().catch(() => 0)
}
</script>
