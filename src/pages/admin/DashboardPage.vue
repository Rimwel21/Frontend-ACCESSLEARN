<template>
  <div class="space-y-8">
    <!-- Educational Stat Cards -->
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
      <!-- Main Activity / Status -->
      <div class="space-y-8 lg:col-span-2">
        <!-- Enrollment Distribution -->
        <div class="card overflow-hidden">
          <div class="border-b border-gray-50 bg-white px-6 py-4 flex items-center justify-between">
            <h3 class="font-display text-lg font-bold text-ink">Account Status Overview</h3>
            <span class="text-[10px] font-bold text-brand-blue uppercase tracking-widest px-3 py-1 bg-brand-blue/5 rounded-md">Live Pulse</span>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div class="space-y-5">
                <div v-for="item in accountStatus" :key="item.label" class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-bold text-ink-soft">{{ item.label }}</span>
                    <span class="text-sm font-bold text-ink">{{ item.count }}</span>
                  </div>
                  <div class="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
                    <div :style="{ width: item.percent + '%' }" :class="['h-full transition-all duration-1000', item.color]"></div>
                  </div>
                </div>
              </div>
              <div class="rounded-2xl bg-surface p-6 flex flex-col justify-center items-center text-center">
                 <div class="relative h-24 w-24 mb-4">
                    <svg class="h-full w-full rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" class="stroke-gray-100" stroke-width="3"></circle>
                      <circle cx="18" cy="18" r="16" fill="none" class="stroke-brand-blue" stroke-width="3" stroke-dasharray="85, 100" stroke-linecap="round"></circle>
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                       <span class="text-xl font-bold text-ink">85%</span>
                    </div>
                 </div>
                 <div class="text-[11px] font-bold text-ink-soft uppercase tracking-widest">Global Activation Rate</div>
                 <p class="mt-2 text-xs text-ink-soft leading-relaxed">Percentage of invited staff who completed their profile setup.</p>
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
        </div>
      </div>

      <!-- Sidebar widgets -->
      <div class="space-y-8">
        <!-- Quick Stats Breakdown -->
        <div class="card p-6 bg-gradient-to-br from-brand-blue via-brand-violet to-brand-blue bg-[length:200%_200%] animate-gradient-slow text-white">
          <h3 class="font-display text-lg font-bold mb-4">Quick Breakdown</h3>
          <div class="grid grid-cols-2 gap-4">
             <div class="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <div class="text-[10px] font-bold uppercase opacity-60">Active Teachers</div>
                <div class="text-xl font-bold">38 / 42</div>
             </div>
             <div class="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <div class="text-[10px] font-bold uppercase opacity-60">Active Students</div>
                <div class="text-xl font-bold">1.1k / 1.2k</div>
             </div>
             <div class="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <div class="text-[10px] font-bold uppercase opacity-60">Total Sections</div>
                <div class="text-xl font-bold">24</div>
             </div>
             <div class="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <div class="text-[10px] font-bold uppercase opacity-60">Archive Vault</div>
                <div class="text-xl font-bold">156</div>
             </div>
          </div>
        </div>

        <!-- Pending Invitations -->
        <div class="card p-6">
          <h3 class="mb-4 font-display text-lg font-bold text-brand-amber">Pending Invitations</h3>
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

        <!-- System Alerts Summary -->
        <div class="card">
           <div class="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 class="font-display text-sm font-bold text-ink">System Alerts</h3>
              <span class="h-5 w-5 rounded-full bg-brand-rose text-[9px] font-bold text-white flex items-center justify-center">3</span>
           </div>
           <div class="p-4 space-y-3">
              <div v-for="alert in alerts" :key="alert.id" class="p-3 bg-red-50/50 rounded-xl border border-red-100 flex items-start gap-3">
                 <span class="text-sm">⚠️</span>
                 <div class="min-w-0 flex-1">
                    <div class="text-xs font-bold text-red-700 truncate">{{ alert.title }}</div>
                    <div class="text-[10px] text-red-600/70 mt-0.5">{{ alert.time }}</div>
                 </div>
              </div>
           </div>
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
  { label: 'Total Sections', value: '24', icon: '📁', bgClass: 'bg-violet-50 text-brand-violet', trend: '0%', trendUp: true },
  { label: 'Pending Invites', value: '8', icon: '✉️', bgClass: 'bg-amber-50 text-brand-amber', trend: '2', trendUp: false },
]

const accountStatus = [
  { label: 'Active Personnel', count: 38, percent: 85, color: 'bg-brand-blue' },
  { label: 'Pending Activation', count: 4, percent: 15, color: 'bg-brand-amber' },
  { label: 'Inactive / Suspended', count: 2, percent: 5, color: 'bg-brand-rose' },
]

const recentLogs = [
  { id: 1, actor: 'Admin (System)', message: 'Archived Section: Kinder-B (2025)', action: 'archived', time: '2 mins ago', module: 'SectionRegistry', status: 'Success' },
  { id: 2, actor: 'SuperAdmin', message: 'Invited Teacher: Maria Clara', action: 'invited', time: '15 mins ago', module: 'TeacherConsole', status: 'Success' },
  { id: 3, actor: 'System', message: 'Backup generated successfully', action: 'backup', time: '1 hour ago', module: 'Maintenance', status: 'Success' },
  { id: 4, actor: 'Admin (System)', message: 'Suspended Account: stud_932', action: 'suspended', time: '3 hours ago', module: 'AccountMgmt', status: 'Success' },
]

const pendingInvites = [
  { name: 'Jose Rizal', email: 'j.rizal@school.edu', days: 2 },
  { name: 'Juan Luna', email: 'juan.luna@art.org', days: 1 },
]

const alerts = [
  { id: 1, title: 'Failed Login Peak detected', time: '4 mins ago' },
  { id: 2, title: 'Database connection delay', time: '12 mins ago' },
  { id: 3, title: 'Report generation failure', time: '1 hour ago' },
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
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animate-gradient-slow {
  animation: gradient 8s ease infinite;
}
.shadow-card {
  box-shadow: 0 4px 20px rgba(67, 97, 238, 0.08);
}
</style>
