<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <h2 class="font-display text-2xl font-bold text-ink">Audit Log</h2>
        <p class="text-sm text-ink-soft">View-only activity monitoring for administrators, teachers, and students.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button class="btn-secondary !text-xs" @click="fetchLogs">Refresh</button>
      </div>
    </div>

    <div v-if="errorMsg" class="status-error flex items-center justify-between px-4 py-3">
      <span>{{ errorMsg }}</span>
      <button class="font-bold" @click="errorMsg = ''">x</button>
    </div>

    <section class="card p-4">
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <input v-model.trim="filters.search" class="input-field xl:col-span-2" placeholder="Search user, role, activity" @input="debouncedFetch" />
        <select v-model="filters.role" class="input-field" @change="fetchLogs">
          <option value="">All Roles</option>
          <option value="admin">Administrator</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>
        <select v-model="filters.activityType" class="input-field" @change="fetchLogs">
          <option value="">All Activity Types</option>
          <option v-for="type in activityTypes" :key="type" :value="type">{{ type }}</option>
        </select>
        <select v-model="filters.status" class="input-field" @change="fetchLogs">
          <option value="">All Statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
        <div class="grid gap-2 sm:grid-cols-2 xl:col-span-1">
          <label class="space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-widest text-ink-soft">From</span>
            <input v-model="filters.date_from" class="input-field" type="date" @change="fetchLogs" />
          </label>
          <label class="space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-widest text-ink-soft">To</span>
            <input v-model="filters.date_to" class="input-field" type="date" @change="fetchLogs" />
          </label>
        </div>
      </div>
    </section>

    <section class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] border-collapse">
          <thead>
            <tr class="bg-surface">
              <th class="table-th">Date & Time</th>
              <th class="table-th">User</th>
              <th class="table-th">Role</th>
              <th class="table-th">Activity</th>
              <th class="table-th">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="log in filteredLogs" :key="log.id" class="transition-colors hover:bg-surface/70">
              <td class="table-td">
                <div class="font-mono text-xs font-bold text-ink">{{ formatDate(log.created_at) }}</div>
                <div class="font-mono text-[11px] text-ink-soft">{{ formatTime(log.created_at) }}</div>
              </td>
              <td class="table-td font-bold text-ink">{{ logUser(log) }}</td>
              <td class="table-td"><span class="badge badge-blue">{{ roleLabel(log.role) }}</span></td>
              <td class="table-td">
                <div class="text-sm font-bold text-ink">{{ activityLabel(log) }}</div>
                <div class="mt-0.5 text-[11px] font-semibold text-ink-soft">{{ log.module }}</div>
              </td>
              <td class="table-td"><span :class="['badge', log.status === 'success' ? 'badge-green' : 'badge-red']">{{ log.status }}</span></td>
            </tr>
            <tr v-if="!loading && filteredLogs.length === 0">
              <td colspan="5" class="px-6 py-16 text-center text-sm font-bold text-ink-soft">No audit log records yet. New admin actions will appear here.</td>
            </tr>
            <tr v-if="loading">
              <td colspan="5" class="px-6 py-16 text-center text-sm font-bold text-ink-soft">Loading audit records...</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-3 border-t border-gray-50 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-[11px] font-bold uppercase tracking-widest text-ink-soft">
          Showing {{ filteredLogs.length }} of {{ totalLogs }} records
        </div>
        <div class="flex gap-2">
          <button class="btn-secondary !px-4 !py-2 !text-xs" :disabled="filters.page === 1" @click="changePage(-1)">Previous</button>
          <button class="btn-secondary !px-4 !py-2 !text-xs" :disabled="filteredLogs.length < filters.per_page" @click="changePage(1)">Next</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ApiError } from '@/lib/api'
import { adminService } from '@/services/adminService'

const logs = ref<any[]>([])
const totalLogs = ref(0)
const loading = ref(false)
const errorMsg = ref('')
const filters = ref({
  search: '',
  role: '',
  activityType: '',
  status: '',
  date_from: '',
  date_to: '',
  page: 1,
  per_page: 25,
})

const activityTypes = [
  'Login',
  'Logout',
  'Registration',
  'Verification',
  'Lesson Upload',
  'Quiz Submission',
  'Account Update',
  'Section Management',
  'Blocking',
  'Other',
]

const filteredLogs = computed(() => {
  const status = filters.value.status
  const type = filters.value.activityType.toLowerCase()
  return logs.value.filter(log => {
    const matchesStatus = !status || log.status === status
    const matchesType = !type || `${log.module} ${log.action} ${log.affected_record || ''}`.toLowerCase().includes(type.split(' ')[0])
    return matchesStatus && matchesType
  })
})

async function fetchLogs() {
  loading.value = true
  errorMsg.value = ''
  try {
    const params: Record<string, string | number> = {
      page: filters.value.page,
      per_page: filters.value.per_page,
    }
    if (filters.value.search) params.search = filters.value.search
    if (filters.value.role) params.actor_role = filters.value.role
    if (filters.value.date_from) params.date_from = filters.value.date_from
    if (filters.value.date_to) params.date_to = filters.value.date_to

    const res = await adminService.getAuditLogs(params)
    logs.value = res.items
    totalLogs.value = res.total
  } catch (err) {
    errorMsg.value = err instanceof ApiError ? err.message : 'Failed to load audit logs.'
    logs.value = []
    totalLogs.value = 0
  } finally {
    loading.value = false
  }
}

function changePage(delta: number) {
  filters.value.page = Math.max(1, filters.value.page + delta)
  fetchLogs()
}

let debounceTimer: ReturnType<typeof setTimeout>
function debouncedFetch() {
  clearTimeout(debounceTimer)
  filters.value.page = 1
  debounceTimer = setTimeout(fetchLogs, 350)
}

function logUser(log: any) {
  return log.affected_record || (log.user_id ? `User #${log.user_id}` : 'System')
}

function roleLabel(role?: string) {
  if (role === 'admin') return 'Administrator'
  if (role === 'teacher') return 'Teacher'
  if (role === 'student') return 'Student'
  return 'System'
}

function activityLabel(log: any) {
  const action = String(log.action || 'activity').replace(/_/g, ' ')
  return action.charAt(0).toUpperCase() + action.slice(1)
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

onMounted(fetchLogs)
</script>
