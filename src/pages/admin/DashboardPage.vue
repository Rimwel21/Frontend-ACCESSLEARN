<template>
  <div class="space-y-6">
    <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue to-brand-teal p-7 shadow-card">
      <div class="absolute inset-0 opacity-10" style="background-image:radial-gradient(circle,#fff 1px,transparent 1px);background-size:26px 26px;" />
      <div class="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="font-mono text-[11px] font-black uppercase tracking-[0.24em] text-white/75">SIGNHEAR Administrator</p>
          <h1 class="mt-2 font-display text-3xl font-bold leading-tight text-white">Welcome Back, Administrator!</h1>
          <p class="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-white/80">
            Manage teachers, monitor system activities, and oversee the SIGNHEAR platform.
          </p>
        </div>
        <button class="btn-secondary !rounded-xl !border-white/40 !bg-white/90 !text-brand-blue hover:!bg-white" @click="refreshDashboard">
          Refresh Dashboard
        </button>
      </div>
    </section>

    <div v-if="successMsg" class="status-success flex items-center justify-between px-4 py-3">
      <span>{{ successMsg }}</span>
      <button class="font-bold" @click="successMsg = ''">x</button>
    </div>
    <div v-if="errorMsg" class="status-error flex items-center justify-between px-4 py-3">
      <span>{{ errorMsg }}</span>
      <button class="font-bold" @click="errorMsg = ''">x</button>
    </div>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="stat in statCards" :key="stat.label" class="card-hover p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-[11px] font-black uppercase tracking-widest text-ink-soft">{{ stat.label }}</p>
            <div class="mt-2 font-display text-3xl font-bold text-ink">{{ stat.value }}</div>
            <p class="mt-1 text-xs font-medium text-ink-soft">{{ stat.description }}</p>
          </div>
          <div :class="['grid h-11 w-11 place-items-center rounded-xl text-sm font-black', stat.tone]">{{ stat.icon }}</div>
        </div>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
      <div class="card overflow-hidden">
        <div class="flex flex-col gap-3 border-b border-gray-50 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="font-display text-lg font-bold text-ink">Pending Verification Requests</h2>
            <p class="text-xs text-ink-soft">Teacher accounts waiting for administrator review.</p>
          </div>
          <button class="text-xs font-semibold text-brand-blue transition-all hover:text-brand-teal" @click="loadPendingAccounts">Refresh List</button>
        </div>

        <div v-if="loading" class="p-10 text-center text-sm font-bold text-ink-soft">Loading verification requests...</div>
        <div v-else-if="pendingAccounts.length === 0" class="p-12 text-center">
          <div class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-teal/10 text-brand-teal font-black">OK</div>
          <h3 class="mt-4 font-display text-xl font-bold text-ink">All Caught Up!</h3>
          <p class="mx-auto mt-2 max-w-md text-sm text-ink-soft">There are currently no teacher accounts waiting for verification.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="table-th">Teacher Name</th>
                <th class="table-th">Email</th>
                <th class="table-th">Date Registered</th>
                <th class="table-th">Status</th>
                <th class="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="teacher in pendingAccounts" :key="teacher.id" class="transition-colors hover:bg-surface/70">
                <td class="table-td font-bold text-ink">{{ teacherName(teacher) }}</td>
                <td class="table-td text-xs font-semibold text-ink-soft">{{ teacher.email }}</td>
                <td class="table-td text-xs font-mono text-ink-soft">{{ formatDateTime(teacher.created_at) }}</td>
                <td class="table-td"><span class="badge badge-amber">{{ teacher.verification_status }}</span></td>
                <td class="table-td">
                  <div class="flex flex-wrap justify-end gap-2">
                    <button class="rounded-lg bg-brand-green px-3 py-1.5 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-600" @click="approveAccount(teacher.id)">Verify</button>
                    <button class="rounded-lg bg-brand-rose px-3 py-1.5 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-rose-600" @click="blockAccount(teacher.id)">Block</button>
                    <button class="rounded-lg bg-brand-blue-soft px-3 py-1.5 text-xs font-bold text-brand-blue transition-all hover:-translate-y-0.5 hover:bg-brand-blue hover:text-white" @click="selectedTeacher = teacher">View Details</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <aside class="space-y-6">
        <div class="card overflow-hidden">
          <div class="border-b border-gray-50 bg-white px-5 py-4">
            <h2 class="font-display text-lg font-bold text-ink">Recent Activities</h2>
            <p class="text-xs text-ink-soft">Latest system events only.</p>
          </div>
          <div class="divide-y divide-gray-50">
            <div v-for="activity in recentActivities" :key="activity.id" class="grid grid-cols-[70px_1fr] gap-3 px-5 py-3">
              <div class="font-mono text-[11px] font-black text-brand-blue">{{ formatTime(activity.created_at) }}</div>
              <div class="text-sm font-semibold text-ink">{{ activityMessage(activity) }}</div>
            </div>
            <div v-if="recentActivities.length === 0" class="px-5 py-8 text-sm font-bold text-ink-soft">No recent activities yet.</div>
          </div>
          <button class="w-full border-t border-gray-50 px-5 py-3 text-left text-xs font-black text-brand-blue transition-all hover:bg-brand-blue-soft" @click="router.push('/admin/audit-log')">
            View Full Audit Log ->
          </button>
        </div>

        <div class="card p-5">
          <h2 class="font-display text-lg font-bold text-ink">Quick Actions</h2>
          <div class="mt-4 grid gap-3">
            <button class="btn-secondary justify-start !rounded-xl" @click="router.push('/admin/sections')">Manage Sections</button>
            <button class="btn-secondary justify-start !rounded-xl" @click="router.push('/admin/audit-log')">View Audit Log</button>
            <button class="btn-primary justify-start !rounded-xl" @click="scrollToRequests">Verify Accounts</button>
          </div>
        </div>
      </aside>
    </section>

    <div v-if="selectedTeacher" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm">
      <div class="auth-card !max-w-lg">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-[11px] font-black uppercase tracking-widest text-brand-blue">Teacher Verification</p>
            <h3 class="mt-1 font-display text-2xl font-bold text-ink">{{ teacherName(selectedTeacher) }}</h3>
          </div>
          <button class="text-2xl font-bold text-ink-soft hover:text-brand-rose" @click="selectedTeacher = null">x</button>
        </div>
        <dl class="mt-6 grid gap-3 text-sm">
          <div class="flex justify-between gap-4"><dt class="font-bold text-ink-soft">Email</dt><dd class="font-bold text-ink">{{ selectedTeacher.email }}</dd></div>
          <div class="flex justify-between gap-4"><dt class="font-bold text-ink-soft">Status</dt><dd><span class="badge badge-amber">{{ selectedTeacher.verification_status }}</span></dd></div>
          <div class="flex justify-between gap-4"><dt class="font-bold text-ink-soft">Registered</dt><dd class="font-mono text-xs text-ink">{{ formatDateTime(selectedTeacher.created_at) }}</dd></div>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch, ApiError } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { adminService } from '@/services/adminService'

interface PendingTeacher {
  id: number
  username?: string | null
  email: string
  role: string
  verification_status: string
  created_at: string
}

const auth = useAuthStore()
const router = useRouter()
const pendingAccounts = ref<PendingTeacher[]>([])
const activeTeachers = ref(0)
const activeStudents = ref(0)
const blockedAccounts = ref(0)
const approvedToday = ref(0)
const todaysLogins = ref(0)
const recentActivities = ref<any[]>([])
const loading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const selectedTeacher = ref<PendingTeacher | null>(null)

const statCards = computed(() => [
  { label: 'Pending Verification Requests', value: pendingAccounts.value.length, description: 'Teacher accounts waiting for review.', icon: 'VR', tone: 'bg-brand-amber/15 text-brand-amber' },
  { label: 'Approved Today', value: approvedToday.value, description: 'Accounts verified today.', icon: 'AP', tone: 'bg-brand-green/15 text-brand-green' },
  { label: 'Blocked Accounts', value: blockedAccounts.value, description: 'Accounts restricted from access.', icon: 'BL', tone: 'bg-brand-rose/15 text-brand-rose' },
  { label: 'Active Teachers', value: activeTeachers.value, description: 'Teacher accounts currently active.', icon: 'TR', tone: 'bg-brand-blue/10 text-brand-blue' },
  { label: 'Active Students', value: activeStudents.value, description: 'Student accounts currently active.', icon: 'ST', tone: 'bg-brand-teal/15 text-brand-teal' },
  { label: "Today's Logins", value: todaysLogins.value, description: 'Successful login events recorded today.', icon: 'LG', tone: 'bg-brand-violet/10 text-brand-violet' },
])

async function refreshDashboard() {
  await Promise.all([loadPendingAccounts(), loadAccountStats(), loadRecentActivities()])
}

async function loadPendingAccounts() {
  loading.value = true
  errorMsg.value = ''
  try {
    pendingAccounts.value = await apiFetch<PendingTeacher[]>('/admin/teachers/pendings', { token: auth.token })
  } catch (err) {
    errorMsg.value = err instanceof ApiError ? err.message : 'Failed to fetch pending teacher accounts.'
  } finally {
    loading.value = false
  }
}

async function loadAccountStats() {
  try {
    const [teachers, students, inactive, suspended] = await Promise.all([
      adminService.getAccounts({ role: 'teacher', status: 'active', page: 1, per_page: 1 }),
      adminService.getAccounts({ role: 'student', status: 'active', page: 1, per_page: 1 }),
      adminService.getAccounts({ status: 'inactive', page: 1, per_page: 1 }),
      adminService.getAccounts({ status: 'suspended', page: 1, per_page: 1 }),
    ])
    activeTeachers.value = teachers.total
    activeStudents.value = students.total
    blockedAccounts.value = inactive.total + suspended.total
  } catch {
    activeTeachers.value = 0
    activeStudents.value = 0
  }
}

async function loadRecentActivities() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const res = await adminService.getAuditLogs({ page: 1, per_page: 10 })
    recentActivities.value = res.items
    todaysLogins.value = res.items.filter((log: any) => log.action === 'login' && new Date(log.created_at) >= today).length
    approvedToday.value = res.items.filter((log: any) => ['activated', 'verified'].includes(log.action) && new Date(log.created_at) >= today).length
  } catch {
    recentActivities.value = []
  }
}

async function approveAccount(teacherId: number) {
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const res = await apiFetch<{ message: string }>(`/admin/teachers/${teacherId}/approve`, { method: 'PATCH', token: auth.token })
    pendingAccounts.value = pendingAccounts.value.filter(account => account.id !== teacherId)
    approvedToday.value += 1
    successMsg.value = res.message || 'Teacher verified successfully.'
  } catch (err) {
    errorMsg.value = err instanceof ApiError ? err.message : 'Failed to verify account.'
  }
}

async function blockAccount(teacherId: number) {
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const res = await apiFetch<{ message: string }>(`/admin/teachers/${teacherId}/block`, { method: 'PATCH', token: auth.token })
    pendingAccounts.value = pendingAccounts.value.filter(account => account.id !== teacherId)
    blockedAccounts.value += 1
    successMsg.value = res.message || 'Teacher blocked successfully.'
  } catch (err) {
    errorMsg.value = err instanceof ApiError ? err.message : 'Failed to block account.'
  }
}

function teacherName(teacher: PendingTeacher) {
  return teacher.username || teacher.email.split('@')[0] || 'Teacher'
}

function activityMessage(activity: any) {
  return activity.message || `${activity.role || 'System'} ${activity.action || 'updated'} ${activity.module || 'record'}.`
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function scrollToRequests() {
  document.querySelector('table')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

onMounted(refreshDashboard)
</script>
