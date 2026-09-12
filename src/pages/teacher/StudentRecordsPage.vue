<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="font-display text-3xl font-bold text-ink">Student Records</h1>
        <p class="mt-1 max-w-2xl text-sm text-ink-soft">Review activity, quiz, learning material, and Handsign practice performance without crowding the Home dashboard.</p>
      </div>
      <button class="btn-primary" type="button" :disabled="store.studentRecordsLoading" @click="loadRecords">
        {{ store.studentRecordsLoading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <div class="grid gap-4 md:grid-cols-4">
      <div class="card p-5">
        <div class="text-[11px] font-mono uppercase tracking-widest text-ink-soft">Students</div>
        <div class="mt-2 font-display text-3xl font-bold">{{ store.studentRecords.length }}</div>
      </div>
      <div class="card p-5">
        <div class="text-[11px] font-mono uppercase tracking-widest text-ink-soft">Completed Records</div>
        <div class="mt-2 font-display text-3xl font-bold">{{ completedAssessmentCount }}</div>
      </div>
      <div class="card p-5">
        <div class="text-[11px] font-mono uppercase tracking-widest text-ink-soft">Handsign Practices</div>
        <div class="mt-2 font-display text-3xl font-bold">{{ handsignPracticeCount }}</div>
      </div>
      <div class="card p-5">
        <div class="text-[11px] font-mono uppercase tracking-widest text-ink-soft">Avg. Practice</div>
        <div class="mt-2 font-display text-3xl font-bold">{{ averageHandsignScore }}%</div>
      </div>
    </div>

    <section class="card p-4">
      <div class="grid gap-3 lg:grid-cols-[minmax(180px,1fr)_160px_160px_minmax(180px,1fr)_auto] lg:items-end">
        <div>
          <label class="figma-label" for="records-class">Class</label>
          <select id="records-class" v-model="filters.classId" class="input-field h-10" @change="loadRecords">
            <option value="">All classes</option>
            <option v-for="cls in store.classes" :key="cls.id" :value="cls.id">{{ cls.className }}</option>
          </select>
        </div>
        <div>
          <label class="figma-label" for="records-type">Type</label>
          <select id="records-type" v-model="filters.assessmentType" class="input-field h-10" @change="loadRecords">
            <option value="">All</option>
            <option value="activity">Activities</option>
            <option value="quiz">Quizzes</option>
          </select>
        </div>
        <div>
          <label class="figma-label" for="records-status">Status</label>
          <select id="records-status" v-model="filters.status" class="input-field h-10" @change="loadRecords">
            <option value="">All</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="Needs Help">Needs Help</option>
          </select>
        </div>
        <div>
          <label class="figma-label" for="records-search">Search Student</label>
          <input id="records-search" v-model="filters.search" class="input-field h-10" placeholder="Student name" @keyup.enter="loadRecords" />
        </div>
        <button class="btn-secondary h-10" type="button" @click="loadRecords">Apply</button>
      </div>
      <p v-if="store.studentRecordsError" class="status-error mt-3" role="alert">{{ store.studentRecordsError }}</p>
    </section>

    <section class="card min-w-0 overflow-hidden">
      <div class="border-b border-gray-50 px-5 py-4">
        <h2 class="font-display text-base font-semibold">Full Student Progress</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[980px] border-collapse">
          <thead>
            <tr>
              <th class="table-th">Student</th>
              <th class="table-th">Class</th>
              <th class="table-th">Learning Materials</th>
              <th class="table-th">Activities</th>
              <th class="table-th">Latest Quiz</th>
              <th class="table-th">Handsign</th>
              <th class="table-th">Status</th>
              <th class="table-th">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in store.studentRecords" :key="record.studentId" class="transition-colors hover:bg-gray-50">
              <td class="table-td">
                <div class="flex items-center gap-2.5">
                  <div :class="`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${record.avatarGradient} text-xs font-bold text-white`">{{ record.initials }}</div>
                  <div class="min-w-0">
                    <div class="truncate text-[13px] font-semibold">{{ record.studentName }}</div>
                    <div class="text-[11px] text-ink-soft">Last: {{ record.lastActivity }}</div>
                  </div>
                </div>
              </td>
              <td class="table-td text-xs">{{ classLabel(record) }}</td>
              <td class="table-td w-48">
                <div class="flex items-center gap-2.5">
                  <div class="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div class="h-full rounded-full bg-gradient-to-r from-brand-teal to-brand-green" :style="{ width: record.overallPercent + '%' }"></div>
                  </div>
                  <span class="min-w-[34px] text-right font-mono text-[11px] text-ink-soft">{{ record.overallPercent }}%</span>
                </div>
                <div class="mt-1 font-mono text-[11px] text-ink-soft">{{ record.learningMaterialsCompleted }}/{{ record.learningMaterialsTotal }}</div>
              </td>
              <td class="table-td font-mono text-xs">
                <div>{{ record.activitiesCompleted }}/{{ record.activitiesTotal }}</div>
                <div class="mt-1 text-[11px] text-ink-soft">{{ record.activityPercent }}%</div>
              </td>
              <td class="table-td text-xs">{{ record.quizActivity }}</td>
              <td class="table-td font-mono text-xs">
                <div>{{ record.handsignPractice.length }} practice{{ record.handsignPractice.length === 1 ? '' : 's' }}</div>
                <div class="mt-1 text-[11px] text-ink-soft">Best {{ bestPracticeScore(record) }}</div>
              </td>
              <td class="table-td"><span :class="statusBadge(record.status)">{{ record.status }}</span></td>
              <td class="table-td">
                <button class="btn-secondary px-3 py-1.5 text-xs" type="button" @click="selectedRecord = record">View Details</button>
              </td>
            </tr>
            <tr v-if="!store.studentRecordsLoading && store.studentRecords.length === 0">
              <td colspan="8" class="table-td text-center text-ink-soft">No student records found.</td>
            </tr>
            <tr v-if="store.studentRecordsLoading">
              <td colspan="8" class="table-td text-center text-ink-soft">Loading student records...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="selectedRecord" class="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4 py-6" role="dialog" aria-modal="true">
        <section class="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
          <div class="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 class="font-display text-2xl font-bold text-ink">{{ selectedRecord.studentName }}</h2>
              <p class="mt-1 text-sm text-ink-soft">{{ classLabel(selectedRecord) }} - {{ selectedRecord.status }}</p>
            </div>
            <button class="btn-secondary" type="button" @click="selectedRecord = null">Close</button>
          </div>

          <div class="mt-5 grid gap-4 lg:grid-cols-2">
            <div>
              <h3 class="font-display text-base font-semibold">Activities and Quizzes</h3>
              <div class="mt-3 space-y-3">
                <div v-for="item in selectedRecord.assessments" :key="`${item.assessmentType}-${item.assessmentId}`" class="rounded-xl border border-gray-100 bg-surface p-4">
                  <div class="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div class="text-sm font-semibold text-ink">{{ item.title }}</div>
                      <div class="mt-0.5 font-mono text-[11px] uppercase text-ink-soft">{{ item.assessmentType }} - {{ item.status }}</div>
                    </div>
                    <span class="badge badge-blue">{{ scoreText(item.score, item.total) }}</span>
                  </div>
                  <div class="mt-3 grid gap-2 text-xs text-ink-soft sm:grid-cols-2">
                    <div><span class="font-semibold text-ink">Expected:</span> {{ item.expectedAnswers.join(', ') || 'No answer key' }}</div>
                    <div><span class="font-semibold text-ink">Submitted:</span> {{ formatAnswers(item.answers) }}</div>
                    <div><span class="font-semibold text-ink">Completed:</span> {{ formatDate(item.completedAt) }}</div>
                    <div><span class="font-semibold text-ink">Submission:</span> {{ item.submissionType || 'Manual' }}</div>
                  </div>
                  <div class="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                    <span class="text-xs font-semibold text-ink-soft">Retake access: {{ retakeAccessLabel(item.retakeStatus) }}</span>
                    <button
                      class="figma-button px-3 py-1.5 text-xs"
                      type="button"
                      :disabled="retakeSavingKey === retakeKey(selectedRecord.studentId, item.assessmentId)"
                      @click="setRetakeAccess(selectedRecord.studentId, item, 'approved')"
                    >
                      Allow Retake
                    </button>
                    <button
                      class="figma-button px-3 py-1.5 text-xs"
                      type="button"
                      :disabled="retakeSavingKey === retakeKey(selectedRecord.studentId, item.assessmentId)"
                      @click="setRetakeAccess(selectedRecord.studentId, item, 'rejected')"
                    >
                      Disable Retake
                    </button>
                  </div>
                </div>
                <div v-if="selectedRecord.assessments.length === 0" class="rounded-xl border border-gray-100 bg-surface p-4 text-sm text-ink-soft">No submitted activities or quizzes yet.</div>
              </div>
            </div>

            <div>
              <h3 class="font-display text-base font-semibold">Handsign Tutorial Practice</h3>
              <div class="mt-3 space-y-3">
                <div v-for="practice in selectedRecord.handsignPractice" :key="practice.id" class="rounded-xl border border-gray-100 bg-surface p-4">
                  <div class="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div class="text-sm font-semibold text-ink">{{ practice.activityTitle || `Activity #${practice.activityId}` }}</div>
                      <div class="mt-0.5 font-mono text-[11px] uppercase text-ink-soft">Word: {{ practice.word }}</div>
                    </div>
                    <span class="badge badge-green">Best {{ practice.highestScore }}%</span>
                  </div>
                  <div class="mt-3 text-xs text-ink-soft">
                    Attempts: {{ practice.attemptScores.map(score => `${score}%`).join(', ') || 'No attempts' }}
                  </div>
                  <div class="mt-1 text-xs text-ink-soft">Completed: {{ formatDate(practice.completedAt) }}</div>
                </div>
                <div v-if="selectedRecord.handsignPractice.length === 0" class="rounded-xl border border-gray-100 bg-surface p-4 text-sm text-ink-soft">No Handsign practice record yet.</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useTeacherStore, type StudentAssessmentRecord, type StudentRecord } from '@/stores/teacher'

const store = useTeacherStore()
const selectedRecord = ref<StudentRecord | null>(null)
const retakeSavingKey = ref<string | null>(null)
const filters = reactive({
  classId: '',
  assessmentType: '',
  status: '',
  search: '',
})

const completedAssessmentCount = computed(() => store.studentRecords.reduce((total, record) => (
  total + record.assessments.filter(item => item.status === 'completed').length
), 0))
const handsignPracticeCount = computed(() => store.studentRecords.reduce((total, record) => total + record.handsignPractice.length, 0))
const averageHandsignScore = computed(() => {
  const scores = store.studentRecords.flatMap(record => record.handsignPractice.map(item => item.highestScore))
  if (!scores.length) return 0
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
})

onMounted(async () => {
  await Promise.allSettled([
    store.fetchClasses(),
    loadRecords(),
  ])
})

function loadRecords() {
  return store.fetchStudentRecords({
    classId: filters.classId || null,
    assessmentType: filters.assessmentType || null,
    status: filters.status || null,
    search: filters.search || null,
  })
}

function classLabel(record: StudentRecord) {
  return [record.gradeLevel, record.section].filter(Boolean).join(' - ') || 'No class'
}

function bestPracticeScore(record: StudentRecord) {
  const scores = record.handsignPractice.map(item => item.highestScore)
  return scores.length ? `${Math.max(...scores)}%` : '-'
}

function scoreText(score?: number | null, total?: number | null) {
  if (score === null || score === undefined || total === null || total === undefined) return 'No score'
  return `${score}/${total}`
}

function formatAnswers(answers: Record<string, string>) {
  const values = Object.values(answers || {}).filter(Boolean)
  return values.length ? values.join(', ') : 'No answer'
}

function formatDate(value?: string | null) {
  if (!value) return 'Not completed'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not completed'
  return date.toLocaleDateString()
}

function retakeKey(studentId: string, assessmentId: number) {
  return `${studentId}:${assessmentId}`
}

function retakeAccessLabel(status?: string | null) {
  if (status === 'approved') return 'Allowed'
  if (status === 'rejected') return 'Disabled'
  if (status === 'consumed') return 'Used'
  return 'Not set'
}

async function setRetakeAccess(studentId: string, item: StudentAssessmentRecord, action: 'approved' | 'rejected') {
  const key = retakeKey(studentId, item.assessmentId)
  retakeSavingKey.value = key
  try {
    await store.setRetakeAccess(item.assessmentId, studentId, action)
    await loadRecords()
    if (selectedRecord.value) {
      selectedRecord.value = store.studentRecords.find(record => record.studentId === selectedRecord.value?.studentId) ?? null
    }
  } finally {
    retakeSavingKey.value = null
  }
}

function statusBadge(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'complete' || normalized === 'completed') return 'badge badge-green'
  if (normalized === 'needs help') return 'badge badge-red'
  return 'badge badge-blue'
}
</script>
