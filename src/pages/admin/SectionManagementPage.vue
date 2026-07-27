<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 class="font-display text-2xl font-bold text-ink">Section Management</h2>
        <p class="mt-1 text-sm text-ink-soft max-w-2xl">
          Create sections, view enrolled students, and transfer learners to another Grade Level and Section.
        </p>
      </div>
      <button class="btn-secondary shrink-0" @click="loadAllSections">Refresh</button>
    </div>

    <!-- Alert Messages -->
    <div v-if="successMsg" class="status-success flex items-center justify-between gap-2 px-4 py-3">
      <span>{{ successMsg }}</span>
      <button class="font-bold shrink-0" @click="successMsg = ''">×</button>
    </div>
    <div v-if="errorMsg" class="status-error flex items-center justify-between gap-2 px-4 py-3">
      <span>{{ errorMsg }}</span>
      <button class="font-bold shrink-0" @click="errorMsg = ''">×</button>
    </div>

    <!-- Main Grid: Create Form + Section List -->
    <section class="grid gap-6 xl:grid-cols-[minmax(300px,0.75fr)_minmax(0,1.25fr)]">
      <!-- Create / Edit Section Form -->
      <form class="card p-5 h-fit" @submit.prevent="submitSection">
        <div class="mb-5">
          <p class="text-[11px] font-black uppercase tracking-widest text-brand-blue">
            {{ editingSection ? 'Editing Section' : 'Create Section' }}
          </p>
          <h3 class="mt-1 font-display text-xl font-bold text-ink">
            {{ editingSection ? 'Edit Section' : 'New Section' }}
          </h3>
        </div>

        <div class="form-stack">
          <div>
            <label class="field-label" for="section-name">Section Name</label>
            <input
              id="section-name"
              v-model.trim="sectionForm.name"
              class="input-field mt-1"
              placeholder="Section A"
              required
              @input="handleSectionNameInput"
            />
          </div>
          <div v-if="!editingSection">
            <label class="field-label" for="grade-level">Grade Level</label>
            <select id="grade-level" v-model.number="sectionForm.grade_level_id" class="input-field mt-1" required>
              <option :value="null" disabled>Select grade level</option>
              <option v-for="grade in gradeLevels" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
            </select>
          </div>
          <div v-else class="rounded-xl border border-brand-teal/30 bg-surface/70 px-4 py-3">
            <p class="text-[11px] font-black uppercase tracking-widest text-ink-soft">Grade Level</p>
            <p class="mt-1 font-semibold text-ink">{{ editingGradeName }}</p>
            <p class="mt-1 text-xs text-ink-soft">Editing only changes the section name.</p>
          </div>
          <div class="flex gap-3">
            <button class="btn-primary flex-1 justify-center" type="submit" :disabled="saving">
              {{ saving ? 'Saving...' : editingSection ? 'Save Changes' : 'Create Section' }}
            </button>
            <button v-if="editingSection" class="btn-secondary" type="button" @click="resetForm">Cancel</button>
          </div>
        </div>
      </form>

      <!-- Sections List Panel -->
      <div class="card p-5">
        <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-[11px] font-black uppercase tracking-widest text-brand-teal">Existing Sections</p>
            <h3 class="mt-1 font-display text-xl font-bold text-ink">
              {{ filteredSections.length }} section{{ filteredSections.length === 1 ? '' : 's' }}
            </h3>
          </div>
          <div class="grid gap-2 sm:grid-cols-2">
            <input v-model.trim="filters.search" class="input-field" placeholder="Search section name" />
            <select v-model.number="filters.grade_level_id" class="input-field">
              <option :value="null">All Grade Levels</option>
              <option v-for="grade in gradeLevels" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="empty-state py-10">Loading sections...</div>
        <div v-else-if="filteredSections.length === 0" class="empty-state py-10">No sections match your search.</div>
        <div v-else class="space-y-5">
          <section v-for="group in groupedSections" :key="group.grade.id" class="rounded-2xl border border-brand-teal/20 bg-surface/40 p-4">
            <div class="mb-3 flex items-center justify-between gap-3">
              <h4 class="font-display text-lg font-bold text-brand-blue">{{ group.grade.name }}</h4>
              <span class="badge badge-blue">{{ group.sections.length }}</span>
            </div>
            <div class="grid gap-3 md:grid-cols-2">
              <article
                v-for="sec in group.sections"
                :key="sec.id"
                class="card-hover p-4 flex flex-col gap-3"
              >
                <!-- Section Info -->
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <h5 class="font-bold text-ink text-base leading-tight">{{ sec.name }}</h5>
                    <p class="text-xs text-ink-soft mt-0.5">{{ group.grade.name }}</p>
                  </div>
                  <span class="text-xs font-mono text-ink-soft shrink-0">
                    {{ sec.student_count }} student{{ sec.student_count === 1 ? '' : 's' }}
                  </span>
                </div>

                <!-- Action Buttons -->
                <div class="pt-2 border-t border-brand-teal/10 flex flex-wrap gap-1.5">
                  <button
                    class="rounded-xl border border-brand-blue/30 hover:border-brand-blue bg-white px-2.5 py-1.5 text-xs font-bold text-brand-blue transition-all hover:bg-brand-blue/5"
                    @click="openViewStudents(sec)"
                  >
                    👥 View Users
                  </button>
                  <button
                    class="rounded-xl bg-brand-blue-soft px-2.5 py-1.5 text-xs font-bold text-brand-blue transition-all hover:bg-brand-blue hover:text-white"
                    @click="startEdit(sec)"
                  >
                    Edit
                  </button>
                  <button
                    class="rounded-xl bg-brand-rose/10 px-2.5 py-1.5 text-xs font-bold text-brand-rose transition-all hover:bg-brand-rose hover:text-white"
                    @click="sectionToDelete = sec"
                  >
                    Delete
                  </button>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </section>

    <!-- ══ DELETE CONFIRM MODAL ══════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="sectionToDelete" class="modal-backdrop" @click.self="sectionToDelete = null">
        <div class="modal-card max-w-md w-full">
          <h3 class="font-display text-xl font-bold text-ink">Delete Section?</h3>
          <p class="mt-3 text-sm leading-relaxed text-ink-soft">
            This will permanently delete <strong>{{ sectionToDelete.name }}</strong>.
            Sections with assigned teachers or enrolled students cannot be deleted.
          </p>
          <div class="mt-6 flex gap-3">
            <button class="btn-secondary flex-1" @click="sectionToDelete = null">Cancel</button>
            <button class="btn-primary flex-1 !bg-brand-rose hover:!bg-rose-600" @click="confirmDelete">Delete</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Assign Teacher modal removed (teachers self-select sections) -->

    <!-- ══ CLASSROOM MEMBERS MODAL ═══════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="rosterModal.open" class="modal-backdrop" @click.self="rosterModal.open = false">
        <div class="modal-card max-w-3xl w-full max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-start justify-between gap-4 mb-4">
            <div>
              <p class="text-[11px] font-black uppercase tracking-widest text-brand-teal">Classroom Users</p>
              <h3 class="mt-1 font-display text-xl font-bold text-ink">
                {{ rosterModal.section?.grade_level_name }} – {{ rosterModal.section?.name }}
              </h3>
            </div>
            <button class="shrink-0 w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center text-ink-soft hover:text-ink text-lg" @click="rosterModal.open = false">×</button>
          </div>

          <!-- Student List -->
          <div class="overflow-y-auto flex-1 -mx-1 px-1">
            <div v-if="rosterModal.loading" class="empty-state py-10">Loading users...</div>
            <div v-else-if="rosterModal.students.length === 0" class="empty-state py-10">
              No users enrolled in this section yet.
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="student in rosterModal.students"
                :key="student.id"
                class="rounded-2xl border border-brand-teal/15 bg-surface/60 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-violet flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {{ student.name.slice(0, 2).toUpperCase() }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-ink text-sm truncate">{{ student.name }}</p>
                      <p class="text-xs text-ink-soft">
                        <span :class="studentTypeBadge(student.student_type)" class="text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {{ formatStudentType(student.student_type) }}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink-soft sm:text-right sm:grid-cols-1 shrink-0">
                  <span>{{ student.grade_level_name }}</span>
                  <span>{{ student.section_name }}</span>
                  <span :class="statusColor(student.account_status)">{{ formatStatus(student.account_status) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-brand-teal/10 flex justify-end">
            <button class="btn-secondary" @click="rosterModal.open = false">Close</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ApiError } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import {
  createAdminSection,
  deleteAdminSection,
  fetchGradeLevelOptions,
  fetchSectionOptions,
  updateAdminSection,
  fetchSectionsWithTeacherInfo,
  fetchSectionStudents,
  type GradeLevelOption,
  type SectionWithTeacher,
  type SectionStudent,
} from '@/lib/gradeSections'

// ── State ─────────────────────────────────────────────────────────────────────

const auth = useAuthStore()
const gradeLevels = ref<GradeLevelOption[]>([])
const sections = ref<SectionWithTeacher[]>([])
const loading = ref(false)
const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const editingSection = ref<SectionWithTeacher | null>(null)
const sectionToDelete = ref<SectionWithTeacher | null>(null)
const filters = ref({ search: '', grade_level_id: null as number | null })
const sectionForm = ref({ name: '', grade_level_id: null as number | null })

// ── Classroom Members (Roster) Modal ─────────────────────────────────────────
const rosterModal = reactive({
  open: false,
  loading: false,
  section: null as SectionWithTeacher | null,
  students: [] as SectionStudent[],
})


// ── Computed ──────────────────────────────────────────────────────────────────

const filteredSections = computed(() => {
  const search = filters.value.search.toLowerCase()
  return sections.value.filter(sec => {
    const matchesGrade = !filters.value.grade_level_id || sec.grade_level_id === filters.value.grade_level_id
    const matchesSearch =
      !search ||
      sec.name.toLowerCase().includes(search) ||
      sec.grade_level_name.toLowerCase().includes(search) ||
      (sec.teacher_name != null && sec.teacher_name.toLowerCase().includes(search))
    return matchesGrade && matchesSearch
  })
})

const groupedSections = computed(() =>
  gradeLevels.value
    .map(grade => ({
      grade,
      sections: filteredSections.value.filter(s => s.grade_level_id === grade.id),
    }))
    .filter(g => g.sections.length > 0),
)

const editingGradeName = computed(() =>
  editingSection.value
    ? (gradeLevels.value.find(g => g.id === editingSection.value?.grade_level_id)?.name ?? 'Selected grade')
    : '',
)

// ── Section form helpers ──────────────────────────────────────────────────────

function normalizeSectionName(value: string) {
  const n = value.trimStart().replace(/\s+/g, ' ')
  return n ? n.charAt(0).toUpperCase() + n.slice(1) : ''
}

function handleSectionNameInput(e: Event) {
  sectionForm.value.name = normalizeSectionName((e.target as HTMLInputElement).value)
}

function hasDuplicate(name: string, gradeLevelId: number, sectionId?: number) {
  return sections.value.some(
    s =>
      s.id !== sectionId &&
      s.grade_level_id === gradeLevelId &&
      s.name.toLowerCase() === name.toLowerCase(),
  )
}

function startEdit(sec: SectionWithTeacher) {
  editingSection.value = sec
  sectionForm.value = { name: sec.name, grade_level_id: sec.grade_level_id }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function resetForm() {
  editingSection.value = null
  sectionForm.value = { name: '', grade_level_id: null }
}

// ── Data Loading ─────────────────────────────────────────────────────────────

async function loadAllSections() {
  loading.value = true
  errorMsg.value = ''
  try {
    gradeLevels.value = await fetchGradeLevelOptions(auth.token)
    sections.value = await fetchSectionsWithTeacherInfo(auth.token)
  } catch (err) {
    errorMsg.value = err instanceof ApiError ? err.message : 'Failed to load sections.'
  } finally {
    loading.value = false
  }
}

async function submitSection() {
  const name = normalizeSectionName(sectionForm.value.name)
  const gradeLevelId = editingSection.value?.grade_level_id ?? sectionForm.value.grade_level_id
  successMsg.value = ''
  errorMsg.value = ''
  sectionForm.value.name = name

  if (!name) { errorMsg.value = 'Section name is required.'; return }
  if (!gradeLevelId) { errorMsg.value = 'Grade level is required.'; return }
  if (hasDuplicate(name, gradeLevelId, editingSection.value?.id)) {
    errorMsg.value = 'This section already exists for the selected grade level.'
    return
  }

  saving.value = true
  try {
    if (editingSection.value) {
      await updateAdminSection(editingSection.value.id, { name }, auth.token)
      successMsg.value = 'Section updated successfully.'
    } else {
      await createAdminSection({ name, grade_level_id: gradeLevelId }, auth.token)
      successMsg.value = 'Section created successfully.'
    }
    resetForm()
    await loadAllSections()
  } catch (err) {
    errorMsg.value = err instanceof ApiError ? err.message : 'Failed to save section.'
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!sectionToDelete.value) return
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await deleteAdminSection(sectionToDelete.value.id, auth.token)
    successMsg.value = 'Section deleted successfully.'
    sectionToDelete.value = null
    await loadAllSections()
  } catch (err) {
    errorMsg.value = err instanceof ApiError ? err.message : 'Failed to delete section.'
  }
}



// ── View Students (Roster) ────────────────────────────────────────────────────

async function openViewStudents(sec: SectionWithTeacher) {
  rosterModal.section = sec
  rosterModal.students = []
  rosterModal.open = true
  rosterModal.loading = true
  try {
    rosterModal.students = await fetchSectionStudents(sec.id, auth.token)
  } catch (err) {
    errorMsg.value = err instanceof ApiError ? err.message : 'Failed to load students.'
    rosterModal.open = false
  } finally {
    rosterModal.loading = false
  }
}


// ── UI Helpers ────────────────────────────────────────────────────────────────

function formatStudentType(type: string) {
  return type === 'hearing impaired' ? 'Learner with HI' : 'Regular Student'
}

function studentTypeBadge(type: string) {
  return type === 'hearing impaired'
    ? 'bg-brand-violet/15 text-brand-violet'
    : 'bg-brand-teal/15 text-brand-teal'
}

function formatStatus(status: string | null) {
  if (!status) return 'Unknown'
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function statusColor(status: string | null) {
  if (status === 'active') return 'text-emerald-600 font-semibold'
  if (status === 'suspended' || status === 'archived') return 'text-brand-rose font-semibold'
  return 'text-ink-soft'
}

onMounted(loadAllSections)
</script>

<style scoped>
.modal-backdrop {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm;
}
.modal-card {
  @apply relative bg-white rounded-3xl shadow-2xl p-6 overflow-y-auto;
}
</style>
