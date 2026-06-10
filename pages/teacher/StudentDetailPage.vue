<template>
  <div v-if="student" class="space-y-5">
    <!-- Header -->
    <div class="gradient-brand rounded-2xl px-7 py-5 flex items-center justify-between">
      <div>
        <button @click="router.push('/teacher/progress')" class="mb-3 px-4 py-1.5 rounded-full border border-white/40 bg-white/20 text-white text-xs font-semibold hover:bg-white/30 transition-all">← Back to Student Progress</button>
        <h2 class="font-display text-2xl font-bold text-white">{{ student.studentName }}</h2>
        <p class="text-white/70 text-xs mt-1">Student Progress Overview</p>
      </div>
      <div class="flex gap-2">
        <button class="w-9 h-9 rounded-full bg-white/20 border border-white/40 text-white flex items-center justify-center hover:bg-white/30 transition-all">💬</button>
        <button class="w-9 h-9 rounded-full bg-white/20 border border-white/40 text-white flex items-center justify-center hover:bg-white/30 transition-all">👤</button>
      </div>
    </div>

    <!-- Top stats -->
    <div class="grid grid-cols-[1fr_160px_160px] gap-4">
      <div class="card p-5">
        <div class="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-3">Overall Progress</div>
        <div class="flex items-center gap-4">
          <ProgressBar :percent="student.overallPercent" class="flex-1" />
          <span class="font-display text-2xl font-bold text-brand-blue">{{ student.overallPercent }}%</span>
        </div>
      </div>
      <div class="card p-5 text-center">
        <div class="font-display text-3xl font-bold">{{ student.activitiesCompleted }}/{{ student.activitiesTotal }}</div>
        <div class="text-xs text-ink-soft font-medium mt-1">Activity Completed</div>
      </div>
      <div class="card p-5 text-center">
        <div class="font-display text-3xl font-bold">{{ student.modulesInProgress }}</div>
        <div class="text-xs text-ink-soft font-medium mt-1">Modules in Progress</div>
      </div>
    </div>

    <!-- Module Progress table -->
    <div class="card overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-50 font-display font-semibold text-base">Module Progress</div>
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="table-th">Module</th>
            <th class="table-th">Overall Progress</th>
            <th class="table-th">Lessons Completed</th>
            <th class="table-th">Quizzes Completed</th>
            <th class="table-th">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="mp in student.moduleProgress" :key="mp.moduleId" class="hover:bg-gray-50 transition-colors">
            <td class="table-td font-medium">{{ mp.moduleTitle }}</td>
            <td class="table-td w-48">
              <ProgressBar :percent="mp.overallPercent" :gradient-class="mpGradient(mp.status)" />
            </td>
            <td class="table-td font-mono text-xs">{{ mp.lessonsCompleted }}/{{ mp.lessonsTotal }}</td>
            <td class="table-td font-mono text-xs">{{ mp.quizzesCompleted }}/{{ mp.quizzesTotal }}</td>
            <td class="table-td">
              <span :class="mp.status === 'Complete' ? 'badge badge-green' : mp.status === 'In Progress' ? 'badge badge-blue' : 'badge badge-amber'">{{ mp.status }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Recent Activity table -->
    <div class="card overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-50 font-display font-semibold text-base">Recent Activity</div>
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="table-th">Activity</th>
            <th class="table-th">Module</th>
            <th class="table-th">Details</th>
            <th class="table-th">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in student.activityLog" :key="log.id" class="hover:bg-gray-50 transition-colors">
            <td class="table-td">{{ log.action }}</td>
            <td class="table-td text-ink-soft">{{ log.module }}</td>
            <td class="table-td text-ink-soft">{{ log.details }}</td>
            <td class="table-td font-mono text-xs">{{ log.date }}</td>
          </tr>
          <tr v-if="!student.activityLog.length">
            <td colspan="4" class="table-td text-center text-ink-soft py-8">No activity yet.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div v-else class="text-center py-20 text-ink-soft">Student not found.</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import ProgressBar from '@/components/common/ProgressBar.vue'

const route  = useRoute()
const router = useRouter()
const store  = useAppStore()

const student = computed(() => store.students.find(s => s.studentId === route.params.id))

function mpGradient(status: string) {
  if (status === 'Complete')   return 'bg-gradient-to-r from-brand-teal to-brand-green'
  if (status === 'In Progress') return 'bg-gradient-to-r from-brand-blue to-brand-violet'
  return 'bg-gradient-to-r from-brand-amber to-brand-rose'
}
</script>
