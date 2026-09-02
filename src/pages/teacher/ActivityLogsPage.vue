<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="font-display text-3xl font-bold text-ink">Activity Logs</h1>
        <p class="mt-1 max-w-2xl text-sm text-ink-soft">View the full recent activity history without stretching the Home dashboard.</p>
      </div>
      <button class="btn-primary" type="button" :disabled="store.activityLogsLoading" @click="loadLogs">
        {{ store.activityLogsLoading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <section class="card p-4">
      <div class="grid gap-3 md:grid-cols-[160px_minmax(180px,1fr)_auto] md:items-end">
        <div>
          <label class="figma-label" for="log-type">Type</label>
          <select id="log-type" v-model="filters.type" class="input-field h-10">
            <option value="">All</option>
            <option value="material">Learning Materials</option>
            <option value="quiz">Quizzes</option>
            <option value="activity">Activities</option>
          </select>
        </div>
        <div>
          <label class="figma-label" for="log-search">Search</label>
          <input id="log-search" v-model="filters.search" class="input-field h-10" placeholder="Search activity text" />
        </div>
        <button class="btn-secondary h-10" type="button" @click="clearFilters">Clear</button>
      </div>
      <p v-if="store.activityLogsError" class="status-error mt-3" role="alert">{{ store.activityLogsError }}</p>
    </section>

    <section class="card overflow-hidden">
      <div class="border-b border-gray-50 px-5 py-4">
        <h2 class="font-display text-base font-semibold">Recent Activity History</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] border-collapse">
          <thead>
            <tr>
              <th class="table-th">Date</th>
              <th class="table-th">Type</th>
              <th class="table-th">Activity</th>
              <th class="table-th">When</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredLogs" :key="item.id" class="transition-colors hover:bg-gray-50">
              <td class="table-td font-mono text-xs">{{ formatDate(item.occurredAt) }}</td>
              <td class="table-td"><span :class="typeBadge(item.activityType)">{{ typeLabel(item.activityType) }}</span></td>
              <td class="table-td text-sm text-ink-soft">{{ item.text }}</td>
              <td class="table-td font-mono text-xs text-ink-soft">{{ item.time }}</td>
            </tr>
            <tr v-if="store.activityLogsLoading">
              <td colspan="4" class="table-td text-center text-ink-soft">Loading activity logs...</td>
            </tr>
            <tr v-if="!store.activityLogsLoading && filteredLogs.length === 0">
              <td colspan="4" class="table-td text-center text-ink-soft">No activity logs found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useTeacherStore } from '@/stores/teacher'

const store = useTeacherStore()
const filters = reactive({
  type: '',
  search: '',
})

const filteredLogs = computed(() => {
  const query = filters.search.trim().toLowerCase()
  return store.activityLogs.filter(item => {
    const matchesType = !filters.type || item.activityType === filters.type
    const matchesSearch = !query || item.text.toLowerCase().includes(query)
    return matchesType && matchesSearch
  })
})

onMounted(loadLogs)

function loadLogs() {
  return store.fetchActivityLogs(50)
}

function clearFilters() {
  filters.type = ''
  filters.search = ''
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleString()
}

function typeLabel(type: string) {
  if (type === 'material') return 'Material'
  if (type === 'quiz') return 'Quiz'
  if (type === 'activity') return 'Activity'
  return type || 'Activity'
}

function typeBadge(type: string) {
  if (type === 'quiz') return 'badge badge-blue'
  if (type === 'activity') return 'badge badge-green'
  return 'badge badge-red'
}
</script>
