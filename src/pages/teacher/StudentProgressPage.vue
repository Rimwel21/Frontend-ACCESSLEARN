<template>
  <div class="space-y-5">
    <div class="flex items-end justify-between">
      <div>
        <Breadcrumb :crumbs="[{ label:'Class Management', to:'/teacher/class' }, { label:'Student Progress' }]" />
        <h2 class="font-display text-2xl font-bold">📊 Student Progress</h2>
      </div>
      <button class="btn-primary">📤 Export Report</button>
    </div>

    <div class="gradient-teal rounded-xl px-6 py-3.5">
      <p class="text-white text-sm">Monitor individual and class-wide learning progress</p>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="card p-5 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-cyan-100 flex items-center justify-center text-xl">👥</div>
        <div><div class="font-display text-2xl font-bold">{{ store.students.length }}</div><div class="text-xs text-ink-soft font-medium">Total Students</div></div>
      </div>
      <div class="card p-5 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">🏆</div>
        <div><div class="font-display text-2xl font-bold">{{ store.passedStudents.length }}</div><div class="text-xs text-ink-soft font-medium">Passed</div></div>
      </div>
      <div class="card p-5 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center text-xl">⚠️</div>
        <div><div class="font-display text-2xl font-bold">{{ store.atRiskStudents.length }}</div><div class="text-xs text-ink-soft font-medium">Needs Help</div></div>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 w-60 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        <span class="text-sm">🔍</span>
        <input v-model="search" class="border-0 bg-transparent outline-none text-sm font-body flex-1" placeholder="Search Students…" />
      </div>
    </div>

    <div class="card overflow-hidden">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="table-th">Student</th>
            <th class="table-th">Overall Progress</th>
            <th class="table-th">Module</th>
            <th class="table-th">Activity</th>
            <th class="table-th">Last Activity</th>
            <th class="table-th">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filtered" :key="s.studentId" class="hover:bg-gray-50 transition-colors">
            <td class="table-td">
              <div class="flex items-center gap-2.5">
                <div :class="`w-8 h-8 rounded-full bg-gradient-to-br ${s.avatarGradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`">{{ s.initials }}</div>
                <span class="text-[13px] font-medium">{{ s.studentName }}</span>
              </div>
            </td>
            <td class="table-td w-44">
              <ProgressBar :percent="s.overallPercent" :gradient-class="progressGradient(s.status)" />
            </td>
            <td class="table-td font-mono text-xs">{{ s.activitiesCompleted }}/{{ s.activitiesTotal }}</td>
            <td class="table-td">
              <span :class="statusBadge(s.status)">{{ s.status }}</span>
            </td>
            <td class="table-td font-mono text-xs">{{ s.lastActivity }}</td>
            <td class="table-td">
              <button @click="viewStudent(s.studentId)" class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-blue text-white hover:bg-blue-700 transition-all">View</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'

const router = useRouter()
const store  = useAppStore()
const search = ref('')

const filtered = computed(() =>
  store.students.filter(s => !search.value || s.studentName.toLowerCase().includes(search.value.toLowerCase()))
)

function progressGradient(status: string) {
  if (status === 'Complete')    return 'bg-gradient-to-r from-brand-teal to-brand-green'
  if (status === 'Needs Help')  return 'bg-gradient-to-r from-brand-rose to-orange-400'
  return 'bg-gradient-to-r from-brand-blue to-brand-violet'
}
function statusBadge(status: string) {
  if (status === 'Complete')   return 'badge badge-green'
  if (status === 'Needs Help') return 'badge badge-red'
  return 'badge badge-blue'
}
function viewStudent(id: string) {
  store.selectStudent(id)
  router.push(`/teacher/progress/${id}`)
}
</script>
