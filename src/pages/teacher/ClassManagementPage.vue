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
            @click="store.selectClass(cls.id)"
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

        <div class="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_280px]">
          <div class="space-y-4">
            <div class="card p-5">
              <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 class="font-display text-base font-semibold">Students</h3>
                  <p class="text-xs text-ink-soft">Automatically enrolled from matching grade level and section.</p>
                </div>
                <button class="figma-button" @click="store.fetchClassStudents(store.selectedClass!.id)">Refresh</button>
              </div>

              <div v-if="store.classStudentsLoading" class="text-sm text-ink-soft">Loading students...</div>
              <div v-else-if="store.classStudents.length === 0" class="text-sm text-ink-soft">No matching students found yet.</div>
              <div v-else class="overflow-x-auto">
                <table class="w-full min-w-[980px] text-left text-xs">
                  <thead class="border-b border-gray-100 text-ink-soft">
                    <tr>
                      <th class="px-2 py-2 font-semibold first:pl-0">Name</th>
                      <th class="px-2 py-2 font-semibold">Student ID</th>
                      <th class="px-2 py-2 font-semibold">Email</th>
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
                      <td class="max-w-[190px] px-2 py-2 text-ink-soft">
                        <span class="block truncate" :title="student.email || 'No email'">{{ student.email || 'No email' }}</span>
                      </td>
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

          </div>

          <div class="min-w-0 space-y-4">
            <RouterLink
              v-for="section in sections"
              :key="section.title"
              :to="section.to"
              class="card-hover flex min-h-[92px] items-center gap-3 p-4"
            >
              <span :class="`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white ${section.badgeClass}`">{{ section.badge }}</span>
              <span class="min-w-0">
                <span class="block font-display text-sm font-semibold text-ink">{{ section.title }}</span>
                <span class="mt-1 block text-xs leading-snug text-ink-soft">{{ section.description }}</span>
              </span>
            </RouterLink>
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTeacherStore } from '@/stores/teacher'
import { fetchGradeLevelOptions, type GradeLevelOption } from '@/lib/gradeSections'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const store = useTeacherStore()
const auth = useAuthStore()

const subjectOptions = ['Science']
const showAddClass = ref(false)
const newClass = ref(defaultClassForm())
const deleteTargetId = ref<string | null>(null)
const gradeLevels = ref<GradeLevelOption[]>([])

const classModules = computed(() => store.modules.filter(module => module.classId === Number(store.selectedClassId)))

const sections = computed(() => [
  {
    badge: 'LM',
    title: 'Learning Materials',
    description: 'Upload PDF, PowerPoint, or DOCX files for student lessons',
    badgeClass: 'bg-brand-blue',
    to: '/teacher/modules',
  },
  {
    badge: 'A',
    title: 'Activities',
    description: 'Create practice tasks',
    badgeClass: 'bg-brand-teal',
    to: '/teacher/activities',
  },
  {
    badge: 'Q',
    title: 'Quizzes',
    description: 'Build scored checks',
    badgeClass: 'bg-brand-rose',
    to: '/teacher/quizzes',
  },
])

onMounted(async () => {
  await Promise.allSettled([
    loadGradeLevels(),
    store.fetchClasses(),
    store.fetchModules(),
  ])
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

function gradeLabel(value: string) {
  return value
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
