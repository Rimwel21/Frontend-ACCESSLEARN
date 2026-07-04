<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="font-display text-2xl font-bold text-ink">System Alerts</h2>
        <p class="text-sm text-ink-soft">Administrative logs for high-priority events that require manual intervention.</p>
      </div>
      <button class="btn-secondary !text-xs !py-2" @click="markAllAsRead">Mark all as read</button>
    </div>

    <!-- Notifications List -->
    <div class="card overflow-hidden shadow-card">
        <div v-if="notifications.length > 0" class="divide-y divide-gray-50">
            <div v-for="notif in notifications" :key="notif.id" :class="['flex items-start gap-5 p-6 transition-colors hover:bg-surface/30', !notif.is_read ? 'bg-brand-blue/5 border-l-4 border-brand-blue' : '']">
                <div :class="['flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-xl shadow-sm bg-white', getIconBg(notif.type)]">
                    {{ getIcon(notif.type) }}
                </div>
                <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-4 mb-1">
                         <h3 class="text-[15px] font-bold text-ink">{{ notif.title }}</h3>
                         <span class="text-[10px] font-bold text-ink-soft opacity-60 uppercase tracking-widest">{{ formatRelTime(notif.created_at) }}</span>
                    </div>
                    <p class="text-[13px] leading-relaxed text-ink-soft font-medium">{{ notif.description }}</p>
                    
                    <div class="mt-4 flex gap-3">
                        <button v-if="!notif.is_read" class="btn-primary !px-4 !py-1.5 !text-[11px] !font-bold" @click="notif.is_read = true">Mark Read</button>
                        <button class="btn-secondary !px-4 !py-1.5 !text-[11px] !font-bold !bg-white hover:!bg-brand-blue-soft hover:!text-brand-blue" @click="handleAction(notif)">{{ getActionLabel(notif.type) }}</button>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="empty-state py-20 border-0">
            <div class="text-3xl mb-3">🔕</div>
            <p class="text-sm font-semibold text-ink-soft italic">No system alerts to display.</p>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const notifications = ref([
    { id: 1, type: 'assignment', title: 'Teacher Assignment Required', description: 'Section "Grade 6-Zeta" has been created but no teacher is currently assigned. Class enrollment will be restricted.', is_read: false, created_at: new Date().toISOString() },
    { id: 2, type: 'security', title: 'Multiple Login Failures', description: 'Suspicious activity detected for account "admin_secondary". 5 failed login attempts from IP 203.115.14.92.', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, type: 'maintenance', title: 'Storage Reaching Capacity', description: 'Cloudinary storage is at 85% capacity. Consider upgrading or purging old assets.', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 4, type: 'account', title: 'Pending Account Approval', description: 'Teacher Maria Clara has successfully verified her email and is now waiting for section assignment.', is_read: true, created_at: new Date(Date.now() - 172800000).toISOString() }
])

function getIcon(type: string) {
    switch (type) {
        case 'assignment': return '👨‍🏫'
        case 'security': return '🛡️'
        case 'maintenance': return '⚙️'
        case 'account': return '👤'
        default: return '🔔'
    }
}

function getIconBg(type: string) {
    switch (type) {
        case 'assignment': return 'text-brand-blue'
        case 'security': return 'text-brand-rose'
        case 'maintenance': return 'text-brand-violet'
        case 'account': return 'text-brand-teal'
        default: return 'text-ink-soft'
    }
}

function getActionLabel(type: string) {
    switch (type) {
        case 'assignment': return 'Go to Registry'
        case 'security': return 'Block IP'
        case 'maintenance': return 'Cloud Console'
        case 'account': return 'Complete Setup'
        default: return 'Detail'
    }
}

function handleAction(notif: any) {
    alert(`Redirecting to action for: ${notif.title}`)
}

function markAllAsRead() {
    notifications.value.forEach(n => n.is_read = true)
}

function formatRelTime(date: string) {
    return '2m ago' // Mock
}
</script>
