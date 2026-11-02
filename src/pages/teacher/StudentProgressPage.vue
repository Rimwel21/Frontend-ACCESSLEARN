<template>
  <div class="space-y-5">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="font-mono text-xs font-bold uppercase tracking-widest text-ink-soft">Teacher Progress</p>
        <h1 class="font-display text-3xl font-black">Activity Progress</h1>
        <p class="mt-1 text-sm text-ink-soft">Monitor every enrolled student, including unfinished drafts and students who have not started.</p>
      </div>
      <button class="btn-primary" type="button" :disabled="store.activityProgressLoading || !selectedActivityId" @click="refreshProgress">
        {{ store.activityProgressLoading ? 'Refreshing...' : 'Refresh Progress' }}
      </button>
    </header>

    <section class="card p-4">
      <div class="grid gap-3 md:grid-cols-2">
        <label class="text-xs font-black text-ink">
          Class
          <select v-model="selectedClassId" class="input-field mt-1 h-11">
            <option value="">Select class</option>
            <option v-for="cls in store.classes" :key="cls.id" :value="cls.id">{{ cls.className }} · {{ cls.gradeLevel }} {{ cls.section }}</option>
          </select>
        </label>
        <label class="text-xs font-black text-ink">
          Activity
          <select v-model="selectedActivityId" class="input-field mt-1 h-11">
            <option value="">Select activity</option>
            <option v-for="activity in classActivities" :key="activity.id" :value="activity.id">{{ activity.title }}</option>
          </select>
        </label>
      </div>
      <p v-if="store.activityProgressError" class="status-error mt-3" role="alert">{{ store.activityProgressError }}</p>
    </section>

    <template v-if="progress">
      <section class="rounded-xl border-[3px] border-brand-teal bg-brand-blue px-5 py-4 text-white">
        <p class="font-mono text-xs font-black uppercase tracking-widest">{{ progress.grade_level }} {{ progress.section }}</p>
        <div class="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div><h2 class="font-display text-2xl font-black">{{ progress.activity_title }}</h2><p class="text-sm font-bold">{{ progress.summary.total_students }} Students</p></div>
          <div class="text-right text-sm font-black">{{ progress.summary.started }} / {{ progress.summary.total_students }} Started · {{ progress.summary.started_percent }}%</div>
        </div>
      </section>

      <section class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <article v-for="card in summaryCards" :key="card.label" class="card p-4">
          <div class="font-mono text-[10px] font-black uppercase tracking-widest text-ink-soft">{{ card.label }}</div>
          <div class="mt-2 font-display text-3xl font-black">{{ card.value }}</div>
        </article>
      </section>

      <section class="grid gap-3 md:grid-cols-2">
        <div class="card p-4">
          <div class="flex justify-between text-xs font-black"><span>Started</span><span>{{ progress.summary.started }} / {{ progress.summary.total_students }}</span></div>
          <div class="mt-2 h-3 overflow-hidden rounded-full bg-gray-100"><div class="h-full bg-brand-blue" :style="{ width: `${progress.summary.started_percent}%` }"></div></div>
        </div>
        <div class="card p-4">
          <div class="flex justify-between text-xs font-black"><span>Submitted</span><span>{{ progress.summary.submitted }} / {{ progress.summary.total_students }} · {{ progress.summary.submitted_percent }}%</span></div>
          <div class="mt-2 h-3 overflow-hidden rounded-full bg-gray-100"><div class="h-full bg-brand-teal" :style="{ width: `${progress.summary.submitted_percent}%` }"></div></div>
        </div>
      </section>

      <section class="card p-4">
        <div class="grid gap-3 lg:grid-cols-[minmax(180px,1fr)_180px_210px_auto] lg:items-end">
          <label class="text-xs font-black">Search Student<input v-model="search" class="input-field mt-1 h-10" placeholder="Search student..." /></label>
          <label class="text-xs font-black">Status<select v-model="statusFilter" class="input-field mt-1 h-10"><option value="all">All Students</option><option v-for="status in statuses" :key="status" :value="status">{{ statusLabel(status) }}</option></select></label>
          <label class="text-xs font-black">Sort<select v-model="sortBy" class="input-field mt-1 h-10"><option value="name_asc">Student Name A-Z</option><option value="name_desc">Student Name Z-A</option><option value="progress_asc">Lowest Progress</option><option value="progress_desc">Highest Progress</option><option value="recent">Recently Active</option><option value="least_recent">Least Recently Active</option><option value="not_started">Not Started First</option><option value="in_progress">In Progress First</option><option value="submitted">Submitted First</option></select></label>
          <div class="text-right font-mono text-xs font-black">{{ filteredStudents.length }} Students</div>
        </div>
      </section>

      <section class="card hidden overflow-auto md:block">
        <table class="w-full min-w-[980px] border-collapse">
          <thead><tr><th class="table-th">#</th><th class="table-th">Student</th><th class="table-th">Status</th><th class="table-th">Answered</th><th class="table-th">Progress</th><th class="table-th">Last Saved</th><th class="table-th">Submitted</th><th class="table-th">Action</th></tr></thead>
          <tbody>
            <tr v-for="(student, index) in filteredStudents" :key="student.student_id" class="hover:bg-gray-50">
              <td class="table-td font-mono text-xs">{{ index + 1 }}</td>
              <td class="table-td"><div class="font-semibold">{{ student.student_name }}</div><div v-if="student.is_currently_working" class="mt-1 text-[11px] font-black text-brand-teal">Currently working</div></td>
              <td class="table-td"><span :class="statusBadge(student.status)">{{ statusLabel(student.status) }}</span></td>
              <td class="table-td font-mono text-xs">{{ student.answered_count }}/{{ student.total_questions }}</td>
              <td class="table-td w-44"><div class="h-2 overflow-hidden rounded-full bg-gray-100"><div class="h-full bg-brand-blue" :style="{ width: `${student.progress_percent}%` }"></div></div><div class="mt-1 font-mono text-[11px]">{{ student.progress_percent }}%</div></td>
              <td class="table-td text-xs">{{ formatSaved(student.last_saved_at) }}</td>
              <td class="table-td text-xs font-black">{{ student.submitted ? 'Yes' : 'No' }}</td>
              <td class="table-td"><button class="btn-secondary px-3 py-1.5 text-xs" type="button" @click="selectedStudent = student">View</button></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="space-y-3 md:hidden">
        <article v-for="student in filteredStudents" :key="student.student_id" class="card p-4">
          <div class="flex items-start justify-between gap-3"><div><h3 class="font-display text-lg font-black">{{ student.student_name }}</h3><p v-if="student.is_currently_working" class="text-xs font-black text-brand-teal">Currently working</p></div><span :class="statusBadge(student.status)">{{ statusLabel(student.status) }}</span></div>
          <dl class="mt-3 grid grid-cols-2 gap-2 text-xs"><div><dt class="text-ink-soft">Progress</dt><dd class="font-black">{{ student.answered_count }}/{{ student.total_questions }} · {{ student.progress_percent }}%</dd></div><div><dt class="text-ink-soft">Last Saved</dt><dd class="font-black">{{ formatSaved(student.last_saved_at) }}</dd></div><div><dt class="text-ink-soft">Submitted</dt><dd class="font-black">{{ student.submitted ? 'Yes' : 'No' }}</dd></div></dl>
          <button class="btn-secondary mt-3 w-full" type="button" @click="selectedStudent = student">View Progress</button>
        </article>
      </section>
    </template>

    <section v-else-if="!store.activityProgressLoading" class="card p-8 text-center text-sm font-semibold text-ink-soft">Select a class and activity to view every enrolled student.</section>

    <Teleport to="body">
      <div v-if="selectedStudent" class="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" role="dialog" aria-modal="true">
        <section class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
          <div class="flex items-start justify-between gap-3"><div><h2 class="font-display text-2xl font-black">{{ selectedStudent.student_name }}</h2><p class="text-sm text-ink-soft">{{ statusLabel(selectedStudent.status) }} · {{ selectedStudent.answered_count }}/{{ selectedStudent.total_questions }} answered</p></div><button class="btn-secondary" type="button" @click="selectedStudent = null">Close</button></div>
          <div class="mt-4 space-y-2">
            <article v-for="(question, index) in selectedActivity?.questions ?? []" :key="index" class="rounded-xl border border-gray-200 p-3">
              <div class="text-xs font-black">Question {{ index + 1 }} · {{ question.prompt }}</div>
              <div class="mt-1 text-sm" :class="selectedStudent.answers[String(index)] ? 'text-ink' : 'text-ink-soft'">{{ selectedStudent.answers[String(index)] || 'Not answered' }}</div>
            </article>
          </div>
          <p class="mt-4 text-xs font-semibold text-ink-soft">Read-only draft view. Teacher actions cannot change student answers.</p>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useTeacherStore, type ActivityProgressStudent } from '@/stores/teacher'

const store = useTeacherStore()
const selectedClassId = ref('')
const selectedActivityId = ref('')
const search = ref('')
const statusFilter = ref('all')
const sortBy = ref('name_asc')
const selectedStudent = ref<ActivityProgressStudent | null>(null)
let refreshTimer: number | null = null
const progress = computed(() => store.activityProgress)
const statuses = ['not_started', 'in_progress', 'draft_complete', 'submitted', 'graded', 'late', 'missing']
const classActivities = computed(() => store.activities.filter(activity => !selectedClassId.value || String(activity.classId ?? '') === selectedClassId.value))
const selectedActivity = computed(() => store.activities.find(activity => activity.id === selectedActivityId.value))
const summaryCards = computed(() => progress.value ? [
  { label: 'Total Students', value: progress.value.summary.total_students },
  { label: 'Not Started', value: progress.value.summary.not_started },
  { label: 'In Progress', value: progress.value.summary.in_progress },
  { label: 'Draft Complete', value: progress.value.summary.draft_complete },
  { label: 'Submitted', value: progress.value.summary.submitted },
  { label: 'Missing', value: progress.value.summary.missing },
] : [])
const filteredStudents = computed(() => {
  const query = search.value.trim().toLowerCase()
  const rows = [...(progress.value?.students ?? [])].filter(student =>
    (!query || student.student_name.toLowerCase().includes(query))
    && (statusFilter.value === 'all' || student.status === statusFilter.value),
  )
  const dateValue = (value?: string | null) => value ? new Date(value).getTime() : 0
  if (sortBy.value === 'name_desc') rows.sort((a, b) => b.student_name.localeCompare(a.student_name))
  else if (sortBy.value === 'progress_asc') rows.sort((a, b) => a.progress_percent - b.progress_percent)
  else if (sortBy.value === 'progress_desc') rows.sort((a, b) => b.progress_percent - a.progress_percent)
  else if (sortBy.value === 'recent') rows.sort((a, b) => dateValue(b.last_saved_at) - dateValue(a.last_saved_at))
  else if (sortBy.value === 'least_recent') rows.sort((a, b) => dateValue(a.last_saved_at) - dateValue(b.last_saved_at))
  else if (sortBy.value === 'not_started') rows.sort((a, b) => Number(b.status === 'not_started') - Number(a.status === 'not_started'))
  else if (sortBy.value === 'in_progress') rows.sort((a, b) => Number(b.status === 'in_progress') - Number(a.status === 'in_progress'))
  else if (sortBy.value === 'submitted') rows.sort((a, b) => Number(b.submitted) - Number(a.submitted))
  else rows.sort((a, b) => a.student_name.localeCompare(b.student_name))
  return rows
})

onMounted(async () => {
  await Promise.all([store.fetchClasses(), store.fetchAssessments('activity')])
  selectedClassId.value = store.selectedClassId ?? store.classes[0]?.id ?? ''
  selectFirstActivity()
  refreshTimer = window.setInterval(() => void refreshProgress(), 15000)
})
onBeforeUnmount(() => { if (refreshTimer !== null) window.clearInterval(refreshTimer) })
watch(selectedClassId, () => selectFirstActivity())
watch(selectedActivityId, () => void refreshProgress())

function selectFirstActivity() { selectedActivityId.value = classActivities.value[0]?.id ?? '' }
function refreshProgress() { return selectedActivityId.value ? store.fetchActivityProgress(selectedActivityId.value) : Promise.resolve(null) }
function statusLabel(status: string) { return status.split('_').map(value => value.charAt(0).toUpperCase() + value.slice(1)).join(' ') }
function statusBadge(status: string) {
  if (['submitted', 'graded'].includes(status)) return 'badge badge-green'
  if (status === 'draft_complete') return 'badge badge-blue'
  if (status === 'in_progress') return 'badge badge-amber'
  if (['missing', 'late'].includes(status)) return 'badge badge-red'
  return 'badge'
}
function formatSaved(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  const today = new Date()
  if (date.toDateString() === today.toDateString()) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>
