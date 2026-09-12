<template>
  <div class="space-y-6">
    <div class="gradient-brand rounded-2xl px-5 py-5 sm:px-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="font-display text-2xl font-bold text-white">Class Management</h2>
        <p class="text-white/75 text-sm mt-1">
          {{ store.selectedClass ? `${store.selectedClass.className} - ${store.selectedClass.subject}` : 'Create a class to get started' }}
        </p>
      </div>
      <button @click="showAddClass = true" class="w-full rounded-full border border-white/40 bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30 sm:w-auto">
        New Class
      </button>
    </div>

    <div v-if="store.classesLoading" class="empty-state">Loading classes...</div>

    <div v-else-if="!store.hasClasses" class="card flex flex-col items-center px-5 py-12 text-center sm:p-14">
      <h3 class="font-display text-xl font-bold mb-2">No classes yet</h3>
      <p class="text-sm text-ink-soft max-w-sm mb-6">Create your first class to start adding modules, activities, and quizzes for your students.</p>
      <button @click="showAddClass = true" class="btn-primary">Create Your First Class</button>
      <p v-if="store.classError" class="status-error mt-4">{{ store.classError }}</p>
    </div>

    <template v-else>
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-display text-base font-semibold text-ink-soft">Your Classes</h3>
          <p v-if="store.classError" class="status-error">{{ store.classError }}</p>
        </div>
        <div class="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
          <div
            v-for="cls in store.classes"
            :key="cls.id"
            @click="selectClass(cls.id)"
            :class="['card-hover relative min-h-[142px] cursor-pointer border-2 p-4 transition-all', store.selectedClassId === cls.id ? 'border-brand-blue bg-brand-blue-soft/20' : 'border-transparent']"
          >
            <button @click.stop="confirmDeleteClass(cls.id)" class="absolute top-2 right-2 w-6 h-6 rounded-full hover:bg-rose-50 text-gray-300 hover:text-brand-rose flex items-center justify-center text-xs transition-all">x</button>
            <div class="mb-2 flex min-w-0 items-start justify-between gap-3 pr-5">
              <div class="min-w-0 font-display text-sm font-bold text-ink">{{ cls.className }}</div>
              <span v-if="store.selectedClassId === cls.id" class="shrink-0 rounded-full bg-brand-blue px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Active</span>
            </div>
            <div class="text-xs text-ink-soft mt-1">{{ cls.subject }}</div>
            <div class="text-xs text-ink-soft mt-1">{{ gradeLabel(cls.gradeLevel) }} - Section {{ cls.section }}</div>
            <div class="text-[11px] font-mono text-gray-400 mt-2">{{ cls.studentCount }} students</div>
          </div>

          <button
            @click="showAddClass = true"
            class="flex min-h-[142px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 text-ink-soft transition-all hover:border-brand-blue hover:bg-brand-blue-soft/30 hover:text-brand-blue"
          >
            <span class="text-xl font-bold">+</span>
            <span class="text-xs font-semibold">Add Class</span>
          </button>
        </div>
      </div>

      <template v-if="store.selectedClass">
        <div class="grid gap-4 md:grid-cols-3">
          <div class="card p-5">
            <div class="font-display text-2xl font-bold">{{ store.selectedClass.studentCount }}</div>
            <div class="text-xs text-ink-soft font-medium">Total Students</div>
          </div>
          <div class="card p-5">
            <div class="font-display text-2xl font-bold">{{ classModules.length }}</div>
            <div class="text-xs text-ink-soft font-medium">Class Materials</div>
          </div>
          <div class="card p-5">
            <div class="font-display text-2xl font-bold">{{ store.selectedClass.schoolYear || 'Not set' }}</div>
            <div class="text-xs text-ink-soft font-medium">School Year</div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="card p-5">
              <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 class="font-display text-base font-semibold">Total Students</h3>
                  <p class="text-xs text-ink-soft">Automatically enrolled from matching grade level and section.</p>
                </div>
                <button class="figma-button" @click="refreshClassData">Refresh</button>
              </div>

              <div v-if="store.classStudentsLoading" class="text-sm text-ink-soft">Loading students...</div>
              <div v-else-if="store.classStudents.length === 0" class="text-sm text-ink-soft">No matching students found yet.</div>
              <div v-else class="overflow-x-auto">
                <table class="w-full min-w-[820px] text-left text-xs">
                  <thead class="border-b border-gray-100 text-ink-soft">
                    <tr>
                      <th class="px-2 py-2 font-semibold first:pl-0">Name</th>
                      <th class="px-2 py-2 font-semibold">Student ID</th>
                      <th class="px-2 py-2 font-semibold">Guardian</th>
                      <th class="px-2 py-2 font-semibold">Contact</th>
                      <th class="px-2 py-2 font-semibold">Grade</th>
                      <th class="px-2 py-2 font-semibold">Section</th>
                      <th class="px-2 py-2 font-semibold last:pr-0">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="student in store.classStudents" :key="student.id" class="border-b border-gray-50 last:border-0">
                      <td class="max-w-[170px] px-2 py-2 font-semibold text-ink first:pl-0">
                        <span class="block truncate" :title="student.name">{{ student.name }}</span>
                      </td>
                      <td class="px-2 py-2 text-ink-soft">{{ student.username || student.accountId }}</td>
                      <td class="max-w-[170px] px-2 py-2 text-ink-soft">
                        <span class="block truncate" :title="student.guardiansName || 'Not set'">{{ student.guardiansName || 'Not set' }}</span>
                      </td>
                      <td class="px-2 py-2 text-ink-soft">{{ student.guardiansContactNo || 'Not set' }}</td>
                      <td class="px-2 py-2 text-ink-soft">{{ gradeLabel(student.gradeLevel) }}</td>
                      <td class="px-2 py-2 text-ink-soft">{{ student.section }}</td>
                      <td class="px-2 py-2 text-ink-soft last:pr-0">{{ student.createdAt || 'Not available' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
          </div>

          <div class="card overflow-hidden">
            <div class="px-5 py-5">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 class="font-display text-2xl font-bold text-ink">Student Records</h3>
                  <p class="mt-1 max-w-2xl text-sm text-ink-soft">Review activity, quiz, learning material, and Handsign practice performance without crowding the Home dashboard.</p>
                </div>
                <button class="btn-primary" type="button" :disabled="store.studentRecordsLoading" @click="loadClassRecords">
                  {{ store.studentRecordsLoading ? 'Loading...' : 'Refresh' }}
                </button>
              </div>

              <div class="mt-5 grid gap-4 md:grid-cols-4">
                <div class="card p-5 shadow-none ring-1 ring-gray-100">
                  <div class="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Students</div>
                  <div class="mt-2 font-display text-3xl font-bold">{{ store.studentRecords.length }}</div>
                </div>
                <div class="card p-5 shadow-none ring-1 ring-gray-100">
                  <div class="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Completed Records</div>
                  <div class="mt-2 font-display text-3xl font-bold">{{ completedAssessmentCount }}</div>
                </div>
                <div class="card p-5 shadow-none ring-1 ring-gray-100">
                  <div class="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Handsign Practices</div>
                  <div class="mt-2 font-display text-3xl font-bold">{{ handsignPracticeCount }}</div>
                </div>
                <div class="card p-5 shadow-none ring-1 ring-gray-100">
                  <div class="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Avg. Practice</div>
                  <div class="mt-2 font-display text-3xl font-bold">{{ averageHandsignScore }}%</div>
                </div>
              </div>
            </div>

            <section class="mx-5 mb-5 rounded-xl border border-gray-100 bg-white p-4">
              <div class="grid gap-3 lg:grid-cols-[minmax(180px,1fr)_160px_160px_minmax(180px,1fr)_auto] lg:items-end">
                <div>
                  <label class="figma-label" for="class-records-class">Class</label>
                  <select id="class-records-class" v-model="recordFilters.classId" class="input-field h-10" @change="loadClassRecords">
                    <option value="">All classes</option>
                    <option v-for="cls in store.classes" :key="cls.id" :value="cls.id">{{ cls.className }}</option>
                  </select>
                </div>
                <div>
                  <label class="figma-label" for="class-records-type">Type</label>
                  <select id="class-records-type" v-model="recordFilters.assessmentType" class="input-field h-10" @change="loadClassRecords">
                    <option value="">All</option>
                    <option value="activity">Activities</option>
                    <option value="quiz">Quizzes</option>
                  </select>
                </div>
                <div>
                  <label class="figma-label" for="class-records-status">Status</label>
                  <select id="class-records-status" v-model="recordFilters.status" class="input-field h-10" @change="loadClassRecords">
                    <option value="">All</option>
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="Needs Help">Needs Help</option>
                  </select>
                </div>
                <div>
                  <label class="figma-label" for="class-records-search">Search Student</label>
                  <input id="class-records-search" v-model="recordFilters.search" class="input-field h-10" placeholder="Student name" @keyup.enter="loadClassRecords" />
                </div>
                <button class="btn-secondary h-10" type="button" @click="loadClassRecords">Apply</button>
              </div>
              <p v-if="store.studentRecordsError" class="status-error mt-3" role="alert">{{ store.studentRecordsError }}</p>
            </section>

            <div class="border-b border-gray-50 px-5 py-4">
              <h3 class="font-display text-base font-semibold">Full Student Progress</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[980px] border-collapse text-left">
                <thead class="bg-surface text-ink-soft">
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
                      <button class="btn-secondary px-3 py-1.5 text-xs" type="button" @click="toggleSelectedRecord(record)">
                        {{ selectedRecord?.studentId === record.studentId ? 'Hide Details' : 'View Details' }}
                      </button>
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

            <section v-if="selectedRecord" class="border-t border-gray-100 p-5">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 class="font-display text-xl font-bold text-ink">{{ selectedRecord.studentName }}</h3>
                  <p class="mt-1 text-sm text-ink-soft">{{ classLabel(selectedRecord) }} - {{ selectedRecord.status }}</p>
                </div>
                <button class="btn-secondary px-3 py-1.5 text-xs" type="button" @click="selectedRecord = null">Close</button>
              </div>

              <div class="mt-5 grid gap-4 lg:grid-cols-2">
                <div>
                  <h4 class="font-display text-base font-semibold">Activities and Quizzes</h4>
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
                  <h4 class="font-display text-base font-semibold">Handsign Tutorial Practice</h4>
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
        </div>
      </template>
    </template>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddClass" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeClassModal">
          <div class="absolute inset-0 bg-ink/40 backdrop-blur-sm" @click="closeClassModal" />
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 class="font-display font-bold text-lg">Create New Class</h3>
              <button @click="closeClassModal" class="w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center text-ink-soft hover:text-ink transition-all text-lg">x</button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <div>
                <label class="block text-xs font-semibold text-ink-soft mb-1.5">Class Name</label>
                <input v-model.trim="newClass.className" class="input-field" placeholder="e.g. Grade 6 Science" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-ink-soft mb-1.5">Subject</label>
                <select v-model="newClass.subject" class="input-field">
                  <option value="">Select subject...</option>
                  <option v-for="subject in subjectOptions" :key="subject" :value="subject">{{ subject }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-ink-soft mb-1.5">Grade Level</label>
                <select v-model.number="newClass.gradeLevelId" class="input-field">
                  <option :value="null">Select grade level...</option>
                  <option v-for="g in gradeLevels" :key="g.id" :value="g.id">{{ g.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-ink-soft mb-1.5">Section</label>
                <input v-model.trim="newClass.section" class="input-field" placeholder="e.g. A, Rizal, Sampaguita" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-ink-soft mb-1.5">School Year</label>
                <input v-model.trim="newClass.schoolYear" class="input-field" placeholder="e.g. 2026-2027" />
              </div>
              <p v-if="store.classError" class="status-error">{{ store.classError }}</p>
            </div>
            <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button @click="closeClassModal" class="btn-secondary">Cancel</button>
              <button @click="createClass" class="btn-primary" :disabled="store.classSaving">
                {{ store.classSaving ? 'Creating...' : 'Create Class' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteTargetId" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="deleteTargetId = null">
          <div class="absolute inset-0 bg-ink/40 backdrop-blur-sm" @click="deleteTargetId = null" />
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
            <h3 class="font-display font-bold text-base mb-2">Delete this class?</h3>
            <p class="text-sm text-ink-soft mb-5">This removes the class container. Content linked to it may no longer be available to students.</p>
            <div class="flex justify-center gap-3">
              <button @click="deleteTargetId = null" class="btn-secondary">Cancel</button>
              <button @click="performDelete" class="px-5 py-2.5 rounded-full bg-brand-rose text-white font-semibold text-sm hover:bg-red-600 transition-all">Delete</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useTeacherStore } from '@/stores/teacher'
import type { StudentAssessmentRecord, StudentRecord } from '@/stores/teacher'
import { fetchGradeLevelOptions, type GradeLevelOption } from '@/lib/gradeSections'
import { useAuthStore } from '@/stores/auth'

const store = useTeacherStore()
const auth = useAuthStore()

const subjectOptions = ['Science']
const showAddClass = ref(false)
const newClass = ref(defaultClassForm())
const deleteTargetId = ref<string | null>(null)
const gradeLevels = ref<GradeLevelOption[]>([])
const selectedRecord = ref<StudentRecord | null>(null)
const retakeSavingKey = ref<string | null>(null)
const recordFilters = reactive({
  classId: '',
  assessmentType: '',
  status: '',
  search: '',
})

const classModules = computed(() => store.modules.filter(module => module.classId === Number(store.selectedClassId)))

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
    loadGradeLevels(),
    store.fetchClasses(),
    store.fetchModules(),
  ])
  await loadClassRecords()
})

watch(() => store.selectedClassId, (classId) => {
  if (classId && !recordFilters.classId) recordFilters.classId = classId
  void loadClassRecords()
})

function defaultClassForm() {
  return {
    className: '',
    subject: '',
    gradeLevelId: null as number | null,
    section: '',
    schoolYear: '',
  }
}

async function createClass() {
  if (!newClass.value.className || !newClass.value.subject || !newClass.value.gradeLevelId || !newClass.value.section) {
    alert('Please complete the class details.')
    return
  }

  try {
    await store.addClass({
      className: newClass.value.className,
      subject: newClass.value.subject,
      gradeLevelId: newClass.value.gradeLevelId,
      section: newClass.value.section,
      schoolYear: newClass.value.schoolYear || null,
    })
    closeClassModal()
  } catch {
    // Store owns the visible error message.
  }
}

function closeClassModal() {
  showAddClass.value = false
  newClass.value = defaultClassForm()
}

function confirmDeleteClass(id: string) {
  deleteTargetId.value = id
}

async function performDelete() {
  if (deleteTargetId.value) await store.deleteClass(deleteTargetId.value)
  deleteTargetId.value = null
}

async function selectClass(id: string) {
  await store.selectClass(id)
  recordFilters.classId = id
  await loadClassRecords()
}

async function refreshClassData() {
  if (!store.selectedClass) return
  await Promise.allSettled([
    store.fetchClassStudents(store.selectedClass.id),
    loadClassRecords(),
  ])
}

async function loadClassRecords() {
  await store.fetchStudentRecords({
    classId: recordFilters.classId || null,
    assessmentType: recordFilters.assessmentType || null,
    status: recordFilters.status || null,
    search: recordFilters.search || null,
  })
  if (selectedRecord.value) {
    selectedRecord.value = store.studentRecords.find(record => record.studentId === selectedRecord.value?.studentId) ?? null
  }
}

function gradeLabel(value: string) {
  return value
}

function classLabel(record: StudentRecord) {
  return [record.gradeLevel, record.section].filter(Boolean).join(' - ') || 'No class'
}

function bestPracticeScore(record: StudentRecord) {
  const scores = record.handsignPractice.map(item => item.highestScore)
  return scores.length ? `${Math.max(...scores)}%` : '-'
}

function statusBadge(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'complete' || normalized === 'completed') return 'badge badge-green'
  if (normalized === 'needs help') return 'badge badge-red'
  return 'badge badge-blue'
}

function toggleSelectedRecord(record: StudentRecord) {
  selectedRecord.value = selectedRecord.value?.studentId === record.studentId ? null : record
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
    await loadClassRecords()
  } finally {
    retakeSavingKey.value = null
  }
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

async function loadGradeLevels() {
  if (!auth.token) return
  gradeLevels.value = await fetchGradeLevelOptions(auth.token)
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity .2s; }
.modal-enter-active .relative, .modal-leave-active .relative { transition: transform .2s, opacity .2s; }
.modal-enter-from { opacity: 0; }
.modal-enter-from .relative { transform: scale(.95); opacity: 0; }
.modal-leave-to { opacity: 0; }
</style>



