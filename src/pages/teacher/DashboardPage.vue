<template>
  <div class="space-y-6">
    <div class="relative gradient-brand rounded-2xl p-8 flex items-center justify-between overflow-hidden">
      <div class="absolute inset-0 opacity-5" style="background-image:radial-gradient(circle,#fff 1px,transparent 1px);background-size:28px 28px;" />
      <div class="relative z-10">
        <h1 class="font-display text-3xl font-bold text-white leading-tight mb-2">Welcome, {{ profile.displayName }}!</h1>
        <p class="text-white/75 text-sm max-w-sm leading-relaxed">Let's start the day by learning something new. You have {{ store.atRiskStudents.length }} students that may need attention.</p>
        <RouterLink to="/teacher/class" class="mt-4 inline-block px-5 py-2 rounded-full border border-white/40 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold hover:bg-white/30 transition-all">
          View Class Management
        </RouterLink>
      </div>
      <div class="text-[64px] relative z-10" style="animation: float 4s ease-in-out infinite;">LMS</div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <div class="card-hover p-5 relative overflow-hidden">
        <div class="absolute w-20 h-20 rounded-full -top-5 -right-5 opacity-10 bg-brand-blue" />
        <div class="w-10 h-10 rounded-xl bg-brand-blue-soft flex items-center justify-center text-lg mb-3">TS</div>
        <div class="font-display text-3xl font-bold leading-none mb-1">{{ store.dashboardSummary.totalStudents }}</div>
        <div class="text-[12.5px] text-ink-soft font-medium">Total Students</div>
        <div class="text-[11px] font-mono mt-2 text-brand-green">Unique enrolled students</div>
      </div>
      <div class="card-hover p-5 relative overflow-hidden">
        <div class="absolute w-20 h-20 rounded-full -top-5 -right-5 opacity-10 bg-brand-violet" />
        <div class="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-lg mb-3">LM</div>
        <div class="font-display text-3xl font-bold leading-none mb-1">{{ store.dashboardSummary.activeLearningMaterials }}</div>
        <div class="text-[12.5px] text-ink-soft font-medium">Active Learning Materials</div>
        <div class="text-[11px] font-mono mt-2 text-brand-green">Published only</div>
      </div>
      <div class="card-hover p-5 relative overflow-hidden">
        <div class="absolute w-20 h-20 rounded-full -top-5 -right-5 opacity-10 bg-brand-teal" />
        <div class="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-lg mb-3">QS</div>
        <div class="font-display text-3xl font-bold leading-none mb-1">{{ store.dashboardSummary.averageQuizScore }}%</div>
        <div class="text-[12.5px] text-ink-soft font-medium">Avg. Quiz Score</div>
        <div class="text-[11px] font-mono mt-2 text-brand-green">Completed quizzes</div>
      </div>
    </div>

    <div class="grid grid-cols-[1fr_240px] gap-5">
      <div class="card">
        <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <span class="font-display font-semibold text-base">Student Progress</span>
          <div class="flex items-center gap-2">
            <select v-model="selectedProgressClassId" class="input-field h-8 min-w-40 py-1 text-xs" @change="loadDashboardSummary">
              <option value="">All classes</option>
              <option v-for="cls in store.classes" :key="cls.id" :value="cls.id">{{ cls.className }}</option>
            </select>
            <RouterLink to="/teacher/class" class="text-xs font-semibold text-brand-blue bg-brand-blue-soft px-3 py-1.5 rounded-full hover:bg-brand-blue hover:text-white transition-all">See All</RouterLink>
          </div>
        </div>
        <table class="w-full border-collapse">
          <thead>
            <tr>
              <th class="table-th">Student</th>
              <th class="table-th">Learning Material Progress</th>
              <th class="table-th">Activity</th>
              <th class="table-th">Quiz</th>
              <th class="table-th">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in store.students" :key="s.studentId" class="hover:bg-gray-50 transition-colors">
              <td class="table-td">
                <div class="flex items-center gap-2.5">
                  <div :class="`w-8 h-8 rounded-full bg-gradient-to-br ${s.avatarGradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`">{{ s.initials }}</div>
                  <span class="text-[13px] font-medium">{{ s.studentName }}</span>
                </div>
              </td>
              <td class="table-td w-40">
                <div class="flex items-center gap-2.5">
                  <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div :class="progressGradient(s.status)" class="h-full rounded-full transition-all" :style="{ width: s.overallPercent + '%' }" />
                  </div>
                  <span class="font-mono text-[11px] text-ink-soft min-w-[34px] text-right">{{ s.overallPercent }}%</span>
                </div>
                <div v-if="s.learningMaterialsTotal" class="mt-1 font-mono text-[11px] text-ink-soft">
                  {{ s.learningMaterialsCompleted }}/{{ s.learningMaterialsTotal }}
                  <span v-if="s.learningMaterialsInProgress">, {{ s.learningMaterialsInProgress }} in progress</span>
                </div>
              </td>
              <td class="table-td font-mono text-xs">
                <div>{{ s.activitiesCompleted }}/{{ s.activitiesTotal }}</div>
                <div class="mt-1 text-[11px] text-ink-soft">{{ s.activityPercent }}%</div>
              </td>
              <td class="table-td font-mono text-xs">{{ s.quizActivity }}</td>
              <td class="table-td"><span :class="statusBadge(s.status)">{{ s.status }}</span></td>
            </tr>
            <tr v-if="store.students.length === 0">
              <td colspan="5" class="table-td text-center text-ink-soft">No enrolled students yet.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-4">
        <div class="card">
          <div class="px-4 pt-4 pb-3 border-b border-gray-50 font-display font-semibold text-[13px]">{{ calendarTitle }}</div>
          <div class="p-3">
            <div class="flex justify-between items-center mb-2.5">
              <span class="font-display text-xs font-semibold">{{ calendarMonthYear }}</span>
            </div>
            <div class="grid grid-cols-7 gap-0.5 text-center">
              <div v-for="d in weekDays" :key="d" class="text-[8px] font-semibold text-ink-soft py-1">{{ d }}</div>
              <div v-for="blank in calendarLeadingBlanks" :key="`blank-${blank}`" />
              <div v-for="day in calendarDays" :key="day" :class="['text-[10px] py-1.5 rounded-md font-mono transition-colors', isToday(day) ? 'bg-brand-blue text-white font-bold' : 'hover:bg-brand-blue-soft text-ink']">{{ day }}</div>
            </div>
          </div>
        </div>

        <div class="card flex-1">
          <div class="px-4 pt-4 pb-3 border-b border-gray-50 font-display font-semibold text-[13px]">Recent Activity</div>
          <div class="p-4 flex flex-col gap-3">
            <div v-for="act in store.recentActivities" :key="act.id" class="flex items-start gap-2.5">
              <div :class="`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${act.color}`" />
              <div>
                <div class="text-xs leading-relaxed text-ink-soft">{{ act.text }}</div>
                <div class="text-[10px] font-mono text-gray-400 mt-0.5">{{ act.time }}</div>
              </div>
            </div>
            <div v-if="store.recentActivities.length === 0" class="text-xs text-ink-soft">No recent teacher uploads yet.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import { useTeacherStore } from '@/stores/teacher'

const store = useTeacherStore()
const profile = useProfileStore()
const today = new Date()
const selectedProgressClassId = ref('')
const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const calendarTitle = computed(() => today.toLocaleString('default', { month: 'long', year: 'numeric' }))
const calendarMonthYear = computed(() => today.toLocaleString('default', { month: 'short', year: 'numeric' }))
const calendarDays = computed(() => new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate())
const calendarLeadingBlanks = computed(() => {
  const sundayBased = new Date(today.getFullYear(), today.getMonth(), 1).getDay()
  return sundayBased === 0 ? 6 : sundayBased - 1
})

onMounted(async () => {
  await Promise.allSettled([
    profile.fetchProfile(),
    store.fetchClasses(),
    store.fetchDashboardSummary(),
    store.fetchRecentActivities(),
    store.fetchModules(),
  ])
})

function loadDashboardSummary() {
  store.fetchDashboardSummary(selectedProgressClassId.value || null)
}

function isToday(day: number) {
  return day === today.getDate()
}

function progressGradient(status: string) {
  if (status === 'Complete') return 'bg-gradient-to-r from-brand-teal to-brand-green'
  if (status === 'Needs Help') return 'bg-gradient-to-r from-brand-rose to-orange-400'
  return 'bg-gradient-to-r from-brand-blue to-brand-violet'
}

function statusBadge(status: string) {
  if (status === 'Complete') return 'badge badge-green'
  if (status === 'Needs Help') return 'badge badge-red'
  return 'badge badge-blue'
}
</script>

<style>
@keyframes float {
  0%,100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-10px) rotate(3deg); }
}
</style>
