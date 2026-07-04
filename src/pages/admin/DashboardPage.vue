<template>
  <div class="space-y-8">
    <!-- Stat Cards -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="stat in statCards" :key="stat.label" class="card p-6 transition-all hover:shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-ink-soft">{{ stat.label }}</p>
            <h3 class="mt-1 text-3xl font-bold text-ink">{{ stat.value }}</h3>
          </div>
          <div :class="['flex h-12 w-12 items-center justify-center rounded-xl text-xl shadow-sm', stat.bgClass]">
            {{ stat.icon }}
          </div>
        </div>
        <div class="mt-4 flex items-center gap-2">
          <span :class="['text-xs font-bold', stat.trendUp ? 'text-emerald-600' : 'text-rose-600']">
            {{ stat.trendUp ? '↑' : '↓' }} {{ stat.trend }}
          </span>
          <span class="text-xs text-ink-soft">vs last month</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <!-- Main Activity / Health -->
      <div class="space-y-8 lg:col-span-2">
        <!-- Platform Health Card -->
        <div class="card overflow-hidden">
          <div class="border-b border-gray-50 bg-white px-6 py-4">
            <h3 class="font-display text-lg font-bold text-ink">Platform Status</h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div class="space-y-4">
                <div v-for="service in services" :key="service.name" class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-ink-soft">{{ service.name }}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-ink">{{ service.latency }}ms</span>
                    <span :class="['h-2 w-2 rounded-full', service.status === 'up' ? 'bg-brand-green' : 'bg-brand-rose']"></span>
                  </div>
                </div>
              </div>
              <div class="rounded-xl bg-surface p-4">
                <div class="mb-2 text-xs font-bold uppercase text-ink-soft">Server Load</div>
                <div class="flex items-end gap-1 h-24">
                   <div v-for="(h, i) in loadData" :key="i" 
                        :style="{ height: h + '%' }" 
                        class="flex-1 bg-brand-blue rounded-t-sm opacity-60 hover:opacity-100 transition-opacity">
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Audit Events -->
        <div class="card">
          <div class="flex items-center justify-between border-b border-gray-50 px-6 py-4">
            <h3 class="font-display text-lg font-bold text-ink">System Audit Trail</h3>
            <button class="text-xs font-bold text-brand-blue hover:underline" @click="router.push('/admin/audit-logs')">View Full Log</button>
          </div>
          <div class="divide-y divide-gray-50">
            <div v-for="log in recentLogs" :key="log.id" class="flex items-center gap-4 px-6 py-4 hover:bg-surface transition-colors">
              <div :class="['flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm', getLogBg(log.action)]">
                {{ getLogIcon(log.action) }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-ink">
                  <span class="text-brand-blue">{{ log.actor }}</span> {{ log.message }}
                </p>
                <p class="text-xs text-ink-soft">{{ log.time }} • {{ log.module }}</p>
              </div>
              <div class="text-right">
                <span class="badge-blue">{{ log.status }}</span>
              </div>
            </div>
          </div>
          <div v-if="recentLogs.length === 0" class="empty-state">
            No recent activity recorded.
          </div>
        </div>
      </div>

      <!-- Sidebar widgets -->
      <div class="space-y-8">
        <!-- Pending Invitations -->
        <div class="card p-6">
          <h3 class="mb-4 font-display text-lg font-bold text-ink text-brand-amber">Pending Invitations</h3>
          <div class="space-y-4">
             <div v-for="invite in pendingInvites" :key="invite.email" class="flex items-center justify-between">
                <div>
                   <p class="text-sm font-bold text-ink">{{ invite.name }}</p>
                   <p class="text-[11px] text-ink-soft">{{ invite.email }}</p>
                </div>
                <span class="text-[10px] font-bold text-ink-soft">{{ invite.days }}d left</span>
             </div>
             <button class="w-full btn-secondary !py-2 !text-xs" @click="router.push('/admin/teachers')">
                 Manage Invitations
             </button>
          </div>
        </div>

        <!-- Reports Shortcut -->
        <div class="group card relative overflow-hidden bg-brand-blue p-6 text-white transition-all hover:bg-blue-700">
          <div class="relative z-10">
            <h3 class="font-display text-lg font-bold">Generate Reports</h3>
            <p class="mt-1 text-xs opacity-80 font-medium">Download data for accounts, sessions, and audits.</p>
            <button class="mt-4 flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-bold transition-all group-hover:bg-white/30" @click="router.push('/admin/reports')">
              Open Report Center →
            </button>
          </div>
          <span class="absolute -bottom-4 -right-4 text-8xl opacity-10 grayscale group-hover:grayscale-0 transition-all">📊</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

const router = useRouter()
const adminStore = useAdminStore()

const statCards = [
  { label: 'Total Teachers', value: '42', icon: '👨‍🏫', bgClass: 'bg-blue-50 text-brand-blue', trend: '12%', trendUp: true },
  { label: 'Total Students', value: '1,280', icon: '🎓', bgClass: 'bg-emerald-50 text-emerald-600', trend: '5%', trendUp: true },
  { label: 'Active Sessions', value: '84', icon: '⚡', bgClass: 'bg-violet-50 text-brand-violet', trend: '2%', trendUp: false },
  { label: 'System Uptime', value: '99.9%', icon: '🛡️', bgClass: 'bg-brand-blue-soft text-brand-blue', trend: '0.1%', trendUp: true },
]

const services = [
  { name: 'Core API', status: 'up', latency: 42 },
  { name: 'Database Cluster', status: 'up', latency: 12 },
  { name: 'Media Storage', status: 'up', latency: 85 },
  { name: 'Notification Worker', status: 'up', latency: 156 },
]

const loadData = ref([20, 35, 45, 30, 25, 40, 55, 65, 50, 45, 60, 70, 75, 60, 50, 45, 30, 25, 35, 40])

const recentLogs = [
  { id: 1, actor: 'Admin (System)', message: 'Archived Section: Grade 6-A (2025)', action: 'archived', time: '2 mins ago', module: 'SectionRegistry', status: 'Success' },
  { id: 2, actor: 'SuperAdmin', message: 'Invited Teacher: Maria Clara', action: 'invited', time: '15 mins ago', module: 'TeacherConsole', status: 'Success' },
  { id: 3, actor: 'System', message: 'Backup generated successfully', action: 'backup', time: '1 hour ago', module: 'Maintenance', status: 'Success' },
  { id: 4, actor: 'Admin (System)', message: 'Suspended Account: stud_932', action: 'suspended', time: '3 hours ago', module: 'AccountMgmt', status: 'Success' },
]

const pendingInvites = [
  { name: 'Jose Rizal', email: 'j.rizal@school.edu', days: 2 },
  { name: 'Juan Luna', email: 'juan.luna@art.org', days: 1 },
]

function getLogIcon(action: string) {
  switch (action) {
    case 'archived': return '📦'
    case 'invited': return '✉️'
    case 'suspended': return '⛔'
    default: return '⚙️'
  }
}

function getLogBg(action: string) {
  switch (action) {
    case 'archived': return 'bg-rose-50 text-brand-rose'
    case 'invited': return 'bg-blue-50 text-brand-blue'
    case 'suspended': return 'bg-amber-50 text-brand-amber'
    default: return 'bg-gray-50 text-ink-soft'
  }
}

onMounted(() => {
  adminStore.fetchDashboardStats()
})
</script>

<style scoped>
.shadow-card {
  box-shadow: 0 4px 20px rgba(67, 97, 238, 0.08);
}
</style>
