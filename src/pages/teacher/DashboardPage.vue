<template>
  <div class="space-y-6">
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1f5f54] via-[#2d7568] to-[#3f8176] p-6 shadow-card sm:p-8">
      <div class="absolute inset-0 opacity-5" style="background-image:radial-gradient(circle,#fff 1px,transparent 1px);background-size:28px 28px;" />
      <div class="relative z-10 max-w-xl">
        <h1 class="mb-2 font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">Welcome, {{ profile.displayName }}!</h1>
        <p class="max-w-lg text-base font-semibold leading-relaxed text-white/90">Let's start the day by learning something new. You have {{ store.atRiskStudents.length }} students that may need attention.</p>
        <RouterLink to="/teacher/class" class="mt-5 inline-block rounded-full border border-white/70 bg-white px-5 py-2.5 text-sm font-bold text-brand-blue shadow-sm transition-all hover:bg-brand-amber hover:text-white">
          View Class Management
        </RouterLink>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <div class="card-hover p-5 relative overflow-hidden">
        <div class="absolute w-20 h-20 rounded-full -top-5 -right-5 opacity-10 bg-brand-blue" />
        <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue-soft text-brand-blue">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path stroke-linecap="round" stroke-linejoin="round" d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" /><path stroke-linecap="round" stroke-linejoin="round" d="M22 21v-2a4 4 0 0 0-3-3.87" /><path stroke-linecap="round" stroke-linejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        </div>
        <div class="mb-1 font-display text-4xl font-extrabold leading-none text-ink">{{ store.dashboardSummary.totalStudents }}</div>
        <div class="text-sm font-bold text-ink">Total Students</div>
        <div class="mt-2 font-mono text-xs font-semibold text-ink-soft">Unique enrolled students</div>
      </div>
      <div class="card-hover p-5 relative overflow-hidden">
        <div class="absolute w-20 h-20 rounded-full -top-5 -right-5 opacity-10 bg-brand-violet" />
        <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-brand-blue">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 19.5V5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2" /><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h6" /></svg>
        </div>
        <div class="mb-1 font-display text-4xl font-extrabold leading-none text-ink">{{ store.dashboardSummary.activeLearningMaterials }}</div>
        <div class="text-sm font-bold text-ink">Active Learning Materials</div>
        <div class="mt-2 font-mono text-xs font-semibold text-ink-soft">Published only</div>
      </div>
      <div class="card-hover p-5 relative overflow-hidden">
        <div class="absolute w-20 h-20 rounded-full -top-5 -right-5 opacity-10 bg-brand-teal" />
        <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-brand-blue">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 11a3 3 0 1 1 3 3v1" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 19h.01" /><path stroke-linecap="round" stroke-linejoin="round" d="M4 4h16v16H4z" /></svg>
        </div>
        <div class="mb-1 font-display text-4xl font-extrabold leading-none text-ink">{{ store.dashboardSummary.averageQuizScore }}%</div>
        <div class="text-sm font-bold text-ink">Avg. Quiz Score</div>
        <div class="mt-2 font-mono text-xs font-semibold text-ink-soft">Completed quizzes</div>
      </div>
    </div>

    <section class="card overflow-hidden">
      <div class="flex flex-col gap-4 border-b border-gray-50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div class="flex items-center gap-2">
            <span class="grid h-9 w-9 place-items-center rounded-xl bg-brand-rose/10 text-brand-rose">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 17h.01" /><path stroke-linecap="round" stroke-linejoin="round" d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
            </span>
            <h2 class="font-display text-lg font-extrabold text-ink">Guidance Summary</h2>
          </div>
          <p class="mt-1 text-sm font-semibold text-ink-soft">Students needing intervention based on current progress, activity completion, and quiz status.</p>
        </div>
        <div class="grid grid-cols-3 gap-2 text-center sm:min-w-[360px]">
          <div class="rounded-xl bg-brand-rose/10 px-3 py-2">
            <div class="font-display text-2xl font-extrabold text-brand-rose">{{ guidanceStudents.length }}</div>
            <div class="font-mono text-[10px] font-bold uppercase text-ink-soft">Needs Guidance</div>
          </div>
          <div class="rounded-xl bg-brand-amber/15 px-3 py-2">
            <div class="font-display text-2xl font-extrabold text-brand-blue">{{ keepImprovingStudents.length }}</div>
            <div class="font-mono text-[10px] font-bold uppercase text-ink-soft">Keep Improving</div>
          </div>
          <div class="rounded-xl bg-brand-blue-soft px-3 py-2">
            <div class="font-display text-2xl font-extrabold text-brand-blue">{{ affectedClassCount }}</div>
            <div class="font-mono text-[10px] font-bold uppercase text-ink-soft">Class Scope</div>
          </div>
        </div>
      </div>

      <div class="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div class="space-y-3">
          <article
            v-for="student in priorityStudents"
            :key="`guidance-${student.studentId}`"
            class="flex flex-col gap-3 rounded-xl border border-gray-100 bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex min-w-0 items-center gap-3">
              <div :class="`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${student.avatarGradient} text-xs font-bold text-white`">{{ student.initials }}</div>
              <div class="min-w-0">
                <div class="truncate text-sm font-extrabold text-ink">{{ student.studentName }}</div>
                <div class="mt-0.5 text-xs font-semibold text-ink-soft">{{ dashboardClassContext }} | {{ student.lastActivity }}</div>
              </div>
            </div>
            <div class="min-w-0 sm:w-64">
              <div class="flex items-center justify-between gap-3">
                <span :class="statusBadge(student.status)">{{ statusLabel(student.status) }}</span>
                <span class="font-mono text-xs font-bold text-ink">{{ student.overallPercent }}%</span>
              </div>
              <p class="mt-1 truncate text-xs font-semibold text-ink-soft" :title="guidanceReason(student)">{{ guidanceReason(student) }}</p>
            </div>
          </article>
          <div v-if="priorityStudents.length === 0" class="rounded-xl border border-gray-100 bg-surface p-4 text-sm font-semibold text-ink-soft">
            No students currently flagged for guidance in this dashboard view.
          </div>
        </div>

        <div class="space-y-3">
          <RouterLink to="/teacher/records" class="flex items-center justify-between rounded-xl border border-brand-teal/30 bg-white px-4 py-3 text-sm font-bold text-brand-blue transition-all hover:border-brand-amber hover:bg-brand-blue-soft">
            View Student Records
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
          </RouterLink>
          <RouterLink to="/teacher/class" class="flex items-center justify-between rounded-xl border border-brand-teal/30 bg-white px-4 py-3 text-sm font-bold text-brand-blue transition-all hover:border-brand-amber hover:bg-brand-blue-soft">
            Open Class Management
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
          </RouterLink>
          <p class="rounded-xl bg-brand-blue-soft px-4 py-3 text-xs font-semibold text-ink-soft">
            Tip: filter by class to narrow the summary to one grade and section.
          </p>
        </div>
      </div>
    </section>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_240px]">
      <div class="card min-w-0 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span class="font-display text-lg font-extrabold text-ink">Student Progress</span>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select v-model="selectedProgressClassId" class="input-field h-9 min-w-0 py-1 text-xs sm:w-52" @change="loadDashboardSummary">
              <option value="">All classes</option>
              <option v-for="cls in store.classes" :key="cls.id" :value="cls.id">{{ cls.className }}</option>
            </select>
            <RouterLink to="/teacher/records" class="inline-flex h-9 items-center justify-center rounded-full bg-brand-blue px-4 text-xs font-semibold text-white transition-all hover:bg-brand-teal">
              See All
            </RouterLink>
          </div>
        </div>
        <div class="scrollbar-thin max-h-[calc(100vh-19rem)] min-h-[240px] overflow-auto">
          <table class="w-full min-w-[720px] border-collapse">
            <thead class="sticky top-0 z-10 bg-surface shadow-sm">
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
                    <span class="text-sm font-bold text-ink">{{ s.studentName }}</span>
                  </div>
                </td>
                <td class="table-td w-40">
                  <div class="flex items-center gap-2.5">
                    <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div :class="progressGradient(s.status)" class="h-full rounded-full transition-all" :style="{ width: s.overallPercent + '%' }" />
                    </div>
                    <span class="min-w-[34px] text-right font-mono text-xs font-bold text-ink">{{ s.overallPercent }}%</span>
                  </div>
                  <div v-if="s.learningMaterialsTotal" class="mt-1 font-mono text-xs font-semibold text-ink-soft">
                    {{ s.learningMaterialsCompleted }}/{{ s.learningMaterialsTotal }}
                    <span v-if="s.learningMaterialsInProgress">, {{ s.learningMaterialsInProgress }} in progress</span>
                  </div>
                </td>
                <td class="table-td font-mono text-sm font-bold text-ink">
                  <div>{{ s.activitiesCompleted }}/{{ s.activitiesTotal }}</div>
                  <div class="mt-1 text-xs font-semibold text-ink-soft">{{ s.activityPercent }}%</div>
                </td>
                <td class="table-td font-mono text-sm font-bold text-ink">{{ s.quizActivity }}</td>
                <td class="table-td"><span :class="statusBadge(s.status)">{{ statusLabel(s.status) }}</span></td>
              </tr>
              <tr v-if="store.students.length === 0">
                <td colspan="5" class="table-td text-center text-ink-soft">No enrolled students yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <div class="card">
          <div class="border-b border-gray-100 px-4 pb-3 pt-4 font-display text-sm font-extrabold text-ink">{{ calendarTitle }}</div>
          <div class="p-3">
            <div class="grid grid-cols-7 gap-0.5 text-center">
              <div v-for="d in weekDays" :key="d" class="py-1 text-[10px] font-extrabold text-ink">{{ d }}</div>
              <div v-for="blank in calendarLeadingBlanks" :key="`blank-${blank}`" />
              <div v-for="day in calendarDays" :key="day" :class="['rounded-md py-1.5 font-mono text-xs font-bold transition-colors', isToday(day) ? 'bg-brand-blue text-white shadow-sm' : 'text-ink hover:bg-brand-blue-soft']">{{ day }}</div>
            </div>
          </div>
        </div>

        <div class="card flex-1">
          <div class="flex items-center justify-between gap-3 border-b border-gray-50 px-4 pb-3 pt-4">
            <span class="font-display text-[13px] font-semibold">Recent Activity</span>
          </div>
          <div class="scrollbar-thin flex max-h-64 flex-col gap-3 overflow-y-auto p-4">
            <div v-for="act in store.recentActivities" :key="act.id" class="flex items-start gap-2.5">
              <div :class="`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${act.color}`" />
              <div>
                <div class="text-sm font-semibold leading-relaxed text-ink">{{ act.text }}</div>
                <div class="mt-0.5 font-mono text-xs font-semibold text-ink-soft">{{ act.time }}</div>
              </div>
            </div>
            <div v-if="store.recentActivities.length === 0" class="text-sm font-semibold text-ink-soft">No recent teacher uploads yet.</div>
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
const calendarDays = computed(() => new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate())
const calendarLeadingBlanks = computed(() => {
  const sundayBased = new Date(today.getFullYear(), today.getMonth(), 1).getDay()
  return sundayBased === 0 ? 6 : sundayBased - 1
})
const selectedProgressClass = computed(() => store.classes.find(cls => cls.id === selectedProgressClassId.value) ?? null)
const dashboardClassContext = computed(() => {
  const cls = selectedProgressClass.value
  if (!cls) return 'All assigned classes'
  return `${cls.className} | ${cls.gradeLevel} - ${cls.section}`
})
const guidanceStudents = computed(() => store.students.filter(student => statusLabel(student.status) === 'Needs Guidance'))
const keepImprovingStudents = computed(() => store.students.filter(student => statusLabel(student.status) === 'Keep Improving'))
const priorityStudents = computed(() => [
  ...guidanceStudents.value,
  ...keepImprovingStudents.value,
].slice(0, 5))
const affectedClassCount = computed(() => selectedProgressClass.value ? 1 : store.classes.length)

onMounted(async () => {
  await Promise.allSettled([
    profile.fetchProfile(),
    store.fetchClasses(),
    store.fetchDashboardSummary(),
    store.fetchRecentActivities(5),
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
  if (status === 'Excellent') return 'bg-gradient-to-r from-brand-teal to-brand-green'
  if (status === 'Good Progress') return 'bg-gradient-to-r from-brand-blue to-brand-violet'
  if (status === 'Keep Improving') return 'bg-gradient-to-r from-orange-300 to-orange-500'
  if (status === 'Needs Guidance' || status === 'Needs Help') return 'bg-gradient-to-r from-brand-rose to-orange-400'
  return 'bg-gradient-to-r from-brand-blue to-brand-violet'
}

function statusBadge(status: string) {
  if (status === 'Excellent') return 'badge badge-green'
  if (status === 'Good Progress') return 'badge badge-blue'
  if (status === 'Keep Improving') return 'badge badge-amber'
  if (status === 'Needs Guidance' || status === 'Needs Help') return 'badge badge-red'
  return 'badge badge-blue'
}

function statusLabel(status: string) {
  return status === 'Needs Help' ? 'Needs Guidance' : status
}

function guidanceReason(student: { overallPercent: number; activityPercent: number; quizActivity: string; learningMaterialsCompleted: number; learningMaterialsTotal: number }) {
  if (student.overallPercent < 50) return 'Overall progress is below 50%.'
  if (student.activityPercent < 50) return 'Activity completion needs support.'
  if (student.quizActivity === 'No quiz yet') return 'No completed quiz record yet.'
  if (student.learningMaterialsTotal && student.learningMaterialsCompleted < student.learningMaterialsTotal) return 'Learning materials are still incomplete.'
  return 'Teacher review recommended.'
}
</script>

<style>
@keyframes float {
  0%,100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-10px) rotate(3deg); }
}
</style>
