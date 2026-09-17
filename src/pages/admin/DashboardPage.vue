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
      <article
        v-for="stat in statCards"
        :key="stat.label"
        :class="['card-hover p-5', stat.action ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-blue/30' : '']"
        :tabindex="stat.action ? 0 : -1"
        @click="handleStatCard(stat.action)"
        @keydown.enter.prevent="handleStatCard(stat.action)"
      >
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

    <section v-if="accountPanel" class="card overflow-hidden">
      <div class="flex flex-col gap-3 border-b border-gray-50 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="font-display text-lg font-bold text-ink">{{ accountPanel.title }}</h2>
          <p class="text-xs text-ink-soft">{{ accountPanel.subtitle }}</p>
        </div>
        <button class="text-xs font-bold text-ink-soft transition-all hover:text-brand-rose" @click="closeAccountPanel">Close</button>
      </div>

      <div v-if="accountPanelLoading" class="p-8 text-center text-sm font-bold text-ink-soft">Loading accounts...</div>
      <div v-else-if="accountPanelError" class="p-8 text-center">
        <p class="text-sm font-bold text-brand-rose">{{ accountPanelError }}</p>
        <button
          class="mt-3 rounded-full border border-brand-teal/40 px-4 py-2 text-xs font-bold text-brand-blue transition-all hover:bg-brand-blue-soft"
          @click="loadAccountPanel"
        >
          Try Again
        </button>
      </div>
      <div v-else-if="accountPanelItems.length === 0" class="p-8 text-center text-sm font-bold text-ink-soft">No accounts found.</div>
      <div v-else class="divide-y divide-gray-50">
        <div
          v-for="account in accountPanelItems"
          :key="account.id"
          class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="min-w-0">
            <div class="truncate text-sm font-bold text-ink">{{ accountDisplayName(account) }}</div>
            <div class="truncate text-xs font-semibold text-ink-soft">{{ accountSubtext(account) }}</div>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span :class="['badge', account.account_status === 'active' ? 'badge-green' : 'badge-red']">
              {{ formatStatus(account.account_status) }}
            </span>
            <button
              v-if="account.account_status !== 'archived'"
              class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition-all hover:border-brand-amber hover:bg-amber-100"
              :disabled="accountPanelLoading"
              @click="archiveDashboardAccount(account)"
            >
              Archive
            </button>
            <button
              v-else
              class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-all hover:border-emerald-500 hover:bg-emerald-100"
              :disabled="accountPanelLoading"
              @click="restoreDashboardAccount(account)"
            >
              Restore
            </button>
            <template v-if="accountPanel.kind === 'blocked'">
              <button
                class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-all hover:border-emerald-500 hover:bg-emerald-100"
                :disabled="accountPanelLoading"
                @click="unblockDashboardAccount(account)"
              >
                Unblock
              </button>
              <button
                v-if="account.account_status === 'archived'"
                class="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-brand-rose transition-all hover:border-brand-rose hover:bg-rose-100"
                :disabled="accountPanelLoading"
                @click="removeDashboardAccount(account)"
              >
                Remove
              </button>
            </template>
          </div>
        </div>
      </div>
      <div v-if="accountPanel && accountPanelTotal > accountPanelItems.length" class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-50 px-5 py-4">
        <p class="text-xs font-bold text-ink-soft">
          Showing {{ accountPanelItems.length }} of {{ accountPanelTotal }} accounts
        </p>
        <div class="flex items-center gap-2">
          <button
            class="rounded-full border border-brand-teal/40 px-3 py-1.5 text-xs font-bold text-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="accountPanelPage <= 1 || accountPanelLoading"
            @click="changeAccountPanelPage(accountPanelPage - 1)"
          >
            Previous
          </button>
          <span class="text-xs font-bold text-ink-soft">Page {{ accountPanelPage }} of {{ accountPanelTotalPages }}</span>
          <button
            class="rounded-full border border-brand-teal/40 px-3 py-1.5 text-xs font-bold text-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="accountPanelPage >= accountPanelTotalPages || accountPanelLoading"
            @click="changeAccountPanelPage(accountPanelPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
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
import type { AccountListOut } from '@/types/admin'

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
const accountPanel = ref<{ kind: 'blocked' | 'teachers' | 'students', title: string, subtitle: string } | null>(null)
const accountPanelItems = ref<AccountListOut[]>([])
const accountPanelLoading = ref(false)
const accountPanelError = ref('')
const accountPanelPage = ref(1)
const accountPanelTotal = ref(0)
const accountPanelPerPage = 25
const accountPanelTotalPages = computed(() => Math.max(Math.ceil(accountPanelTotal.value / accountPanelPerPage), 1))

const statCards = computed(() => [
  { label: 'Pending Verification Requests', value: pendingAccounts.value.length, description: 'Teacher accounts waiting for review.', icon: 'VR', tone: 'bg-brand-amber/15 text-brand-amber', action: 'pending' },
  { label: 'Approved Today', value: approvedToday.value, description: 'Accounts verified today.', icon: 'AP', tone: 'bg-brand-green/15 text-brand-green', action: '' },
  { label: 'Blocked Accounts', value: blockedAccounts.value, description: 'Accounts restricted from access.', icon: 'BL', tone: 'bg-brand-rose/15 text-brand-rose', action: 'blocked' },
  { label: 'Teachers', value: activeTeachers.value, description: 'Teacher accounts recorded in the system.', icon: 'TR', tone: 'bg-brand-blue/10 text-brand-blue', action: 'teachers' },
  { label: 'Students', value: activeStudents.value, description: 'Student accounts recorded in the system.', icon: 'ST', tone: 'bg-brand-teal/15 text-brand-teal', action: 'students' },
  { label: "Today's Logins", value: todaysLogins.value, description: 'Successful login events recorded today.', icon: 'LG', tone: 'bg-brand-violet/10 text-brand-violet', action: '' },
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
    const [allTeachers, allStudents] = await Promise.all([
      adminService.getAccounts({ role: 'teacher', page: 1, per_page: 1 }),
      adminService.getAccounts({ role: 'student', page: 1, per_page: 1 }),
    ])
    activeTeachers.value = allTeachers.total
    activeStudents.value = allStudents.total

    const [inactive, suspended, archived] = await Promise.all([
      adminService.getAccounts({ status: 'inactive', page: 1, per_page: 1 }).catch(() => ({ total: 0 })),
      adminService.getAccounts({ status: 'suspended', page: 1, per_page: 1 }).catch(() => ({ total: 0 })),
      adminService.getAccounts({ status: 'archived', page: 1, per_page: 1 }).catch(() => ({ total: 0 })),
    ])
    blockedAccounts.value = inactive.total + suspended.total + archived.total
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
    todaysLogins.value = res.items.filter((log: any) => ['login', 'logged_in'].includes(log.action) && new Date(log.created_at) >= today).length
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

function handleStatCard(action: string) {
  if (!action) return
  if (action === 'pending') {
    scrollToRequests()
    return
  }
  openAccountPanel(action as 'blocked' | 'teachers' | 'students')
}

async function openAccountPanel(kind: 'blocked' | 'teachers' | 'students') {
  accountPanel.value = {
    kind,
    title: kind === 'blocked' ? 'Blocked Accounts' : kind === 'teachers' ? 'Teachers' : 'Students',
    subtitle: kind === 'blocked'
      ? 'Accounts restricted from access. Unblock or remove them here.'
      : kind === 'teachers'
        ? 'Teacher accounts recorded in the system.'
        : 'Student accounts recorded in the system.',
  }
  accountPanelPage.value = 1
  await loadAccountPanel()
}

async function loadAccountPanel() {
  if (!accountPanel.value) return
  accountPanelLoading.value = true
  accountPanelError.value = ''
  errorMsg.value = ''
  try {
    if (accountPanel.value.kind === 'blocked') {
      const [suspended, inactive, archived] = await Promise.all([
        withAccountTimeout(adminService.getAccounts({ status: 'suspended', page: accountPanelPage.value, per_page: accountPanelPerPage })),
        withAccountTimeout(adminService.getAccounts({ status: 'inactive', page: accountPanelPage.value, per_page: accountPanelPerPage })),
        withAccountTimeout(adminService.getAccounts({ status: 'archived', page: accountPanelPage.value, per_page: accountPanelPerPage })),
      ])
      accountPanelItems.value = [...suspended.items, ...inactive.items, ...archived.items]
      accountPanelTotal.value = suspended.total + inactive.total + archived.total
      return
    }

    const role = accountPanel.value.kind === 'teachers' ? 'teacher' : 'student'
    const all = await withAccountTimeout(adminService.getAccounts({ role, page: accountPanelPage.value, per_page: accountPanelPerPage }))
    accountPanelItems.value = all.items
    accountPanelTotal.value = all.total
  } catch (err) {
    accountPanelItems.value = []
    accountPanelTotal.value = 0
    accountPanelError.value = err instanceof Error ? err.message : 'Failed to load accounts.'
  } finally {
    accountPanelLoading.value = false
  }
}

function closeAccountPanel() {
  accountPanel.value = null
  accountPanelItems.value = []
  accountPanelError.value = ''
  accountPanelPage.value = 1
  accountPanelTotal.value = 0
}

function withAccountTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
  let timeoutId: number | undefined
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error('Account list is taking too long to load. Restart the backend server, then try again.')), timeoutMs)
  })
  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId) window.clearTimeout(timeoutId)
  })
}

async function changeAccountPanelPage(page: number) {
  accountPanelPage.value = Math.min(Math.max(page, 1), accountPanelTotalPages.value)
  await loadAccountPanel()
}

async function unblockDashboardAccount(account: AccountListOut) {
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await adminService.updateAccountStatus(account.id, 'active', 'Account unblocked by administrator')
    successMsg.value = 'Account unblocked.'
    await Promise.all([loadAccountStats(), loadAccountPanel()])
  } catch (err) {
    errorMsg.value = err instanceof ApiError ? err.message : 'Failed to unblock account.'
  }
}

async function archiveDashboardAccount(account: AccountListOut) {
  if (!confirm(`Archive ${accountDisplayName(account)}? The account will no longer be able to log in, but records will be kept.`)) return
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await adminService.updateAccountStatus(account.id, 'archived', 'Account archived by administrator')
    successMsg.value = 'Account archived. Records are preserved.'
    await Promise.all([loadAccountStats(), loadAccountPanel()])
  } catch (err) {
    errorMsg.value = err instanceof ApiError ? err.message : 'Failed to archive account.'
  }
}

async function restoreDashboardAccount(account: AccountListOut) {
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await adminService.updateAccountStatus(account.id, 'active', 'Account restored by administrator')
    successMsg.value = 'Account restored.'
    await Promise.all([loadAccountStats(), loadAccountPanel()])
  } catch (err) {
    errorMsg.value = err instanceof ApiError ? err.message : 'Failed to restore account.'
  }
}

async function removeDashboardAccount(account: AccountListOut) {
  if (!confirm(`Remove ${accountDisplayName(account)}? This permanently deletes the account.`)) return
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await adminService.deleteAccount(account.id)
    successMsg.value = 'Account removed.'
    await Promise.all([loadAccountStats(), loadAccountPanel()])
  } catch (err) {
    errorMsg.value = err instanceof ApiError ? err.message : 'Failed to remove account.'
  }
}

function accountDisplayName(account: AccountListOut) {
  return account.full_name || account.name || account.username || account.email || `Account #${account.id}`
}

function accountSubtext(account: AccountListOut) {
  const details = [
    account.email || account.username,
    account.grade_level,
    account.section_name ? `Section ${account.section_name}` : '',
  ].filter(Boolean)
  return details.join(' | ') || account.role
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

function formatStatus(status: string) {
  return status.replace(/_/g, ' ').toUpperCase()
}

function scrollToRequests() {
  document.querySelector('table')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

onMounted(refreshDashboard)
</script>
