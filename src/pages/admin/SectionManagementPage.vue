<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="font-display text-2xl font-bold text-ink">Section Management</h2>
        <p class="text-sm text-ink-soft">Create, search, edit, and delete Grade 1 to Grade 6 sections.</p>
      </div>
      <button class="btn-secondary" @click="loadAllSections">Refresh Sections</button>
    </div>

    <div v-if="successMsg" class="status-success flex items-center justify-between px-4 py-3">
      <span>{{ successMsg }}</span>
      <button class="font-bold" @click="successMsg = ''">x</button>
    </div>
    <div v-if="errorMsg" class="status-error flex items-center justify-between px-4 py-3">
      <span>{{ errorMsg }}</span>
      <button class="font-bold" @click="errorMsg = ''">x</button>
    </div>

    <section class="grid gap-6 xl:grid-cols-[minmax(320px,0.75fr)_minmax(0,1.25fr)]">
      <form class="card p-5" @submit.prevent="submitSection">
        <div class="mb-5">
          <p class="text-[11px] font-black uppercase tracking-widest text-brand-blue">Create Section</p>
          <h3 class="mt-1 font-display text-xl font-bold text-ink">{{ editingSection ? 'Edit Section' : 'New Section' }}</h3>
        </div>

        <div class="form-stack">
          <div>
            <label class="field-label" for="section-name">Section Name</label>
            <input id="section-name" v-model.trim="sectionForm.name" class="input-field mt-1" placeholder="Section A" required @input="handleSectionNameInput" />
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

      <div class="card p-5">
        <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-[11px] font-black uppercase tracking-widest text-brand-teal">Existing Sections</p>
            <h3 class="mt-1 font-display text-xl font-bold text-ink">{{ filteredSections.length }} section{{ filteredSections.length === 1 ? '' : 's' }}</h3>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <input v-model.trim="filters.search" class="input-field" placeholder="Search section name" />
            <select v-model.number="filters.grade_level_id" class="input-field">
              <option :value="null">All Grade Levels</option>
              <option v-for="grade in gradeLevels" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="empty-state">Loading sections...</div>
        <div v-else-if="filteredSections.length === 0" class="empty-state">No sections match your search.</div>
        <div v-else class="space-y-5">
          <section v-for="group in groupedSections" :key="group.grade.id" class="rounded-2xl border border-brand-teal/20 bg-surface/40 p-4">
            <div class="mb-3 flex items-center justify-between gap-3">
              <h4 class="font-display text-lg font-bold text-brand-blue">{{ group.grade.name }}</h4>
              <span class="badge badge-blue">{{ group.sections.length }} section{{ group.sections.length === 1 ? '' : 's' }}</span>
            </div>
            <div class="grid gap-3 md:grid-cols-2">
              <article v-for="section in group.sections" :key="section.id" class="card-hover p-4">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h5 class="font-bold text-ink">{{ section.name }}</h5>
                    <p class="mt-1 text-xs font-semibold text-ink-soft">{{ group.grade.name }}</p>
                  </div>
                  <div class="flex gap-2">
                    <button class="rounded-lg bg-brand-blue-soft px-3 py-1.5 text-xs font-bold text-brand-blue transition-all hover:-translate-y-0.5 hover:bg-brand-blue hover:text-white" @click="startEdit(section)">Edit</button>
                    <button class="rounded-lg bg-brand-rose/10 px-3 py-1.5 text-xs font-bold text-brand-rose transition-all hover:-translate-y-0.5 hover:bg-brand-rose hover:text-white" @click="sectionToDelete = section">Delete</button>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </section>

    <div v-if="sectionToDelete" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm">
      <div class="auth-card !max-w-md">
        <h3 class="font-display text-xl font-bold text-ink">Delete Section?</h3>
        <p class="mt-3 text-sm leading-relaxed text-ink-soft">
          This will delete {{ sectionToDelete.name }}. Sections already used by students or teacher classes cannot be deleted.
        </p>
        <div class="mt-6 flex gap-3">
          <button class="btn-secondary flex-1" @click="sectionToDelete = null">Cancel</button>
          <button class="btn-primary flex-1 !bg-brand-rose hover:!bg-rose-600" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ApiError } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import {
  createAdminSection,
  deleteAdminSection,
  fetchGradeLevelOptions,
  fetchSectionOptions,
  updateAdminSection,
  type GradeLevelOption,
  type SectionOption,
} from '@/lib/gradeSections'

const auth = useAuthStore()
const gradeLevels = ref<GradeLevelOption[]>([])
const sections = ref<SectionOption[]>([])
const loading = ref(false)
const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const editingSection = ref<SectionOption | null>(null)
const sectionToDelete = ref<SectionOption | null>(null)
const filters = ref({ search: '', grade_level_id: null as number | null })
const sectionForm = ref({ name: '', grade_level_id: null as number | null })

const filteredSections = computed(() => {
  const search = filters.value.search.toLowerCase()
  return sections.value.filter(section => {
    const grade = gradeLevels.value.find(item => item.id === section.grade_level_id)
    const matchesGrade = !filters.value.grade_level_id || section.grade_level_id === filters.value.grade_level_id
    const matchesSearch = !search || section.name.toLowerCase().includes(search) || grade?.name.toLowerCase().includes(search)
    return matchesGrade && matchesSearch
  })
})

const groupedSections = computed(() => gradeLevels.value
  .map(grade => ({
    grade,
    sections: filteredSections.value.filter(section => section.grade_level_id === grade.id),
  }))
  .filter(group => group.sections.length > 0)
)

const editingGradeName = computed(() => {
  if (!editingSection.value) return ''
  return gradeLevels.value.find(grade => grade.id === editingSection.value?.grade_level_id)?.name ?? 'Selected grade'
})

function normalizeSectionName(value: string) {
  const normalized = value.trimStart().replace(/\s+/g, ' ')
  if (!normalized) return ''
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

function handleSectionNameInput(event: Event) {
  sectionForm.value.name = normalizeSectionName((event.target as HTMLInputElement).value)
}

function hasDuplicate(name: string, gradeLevelId: number, sectionId?: number) {
  return sections.value.some(section =>
    section.id !== sectionId &&
    section.grade_level_id === gradeLevelId &&
    section.name.toLowerCase() === name.toLowerCase()
  )
}

async function loadAllSections() {
  loading.value = true
  errorMsg.value = ''
  try {
    gradeLevels.value = await fetchGradeLevelOptions(auth.token)
    const results = await Promise.all(gradeLevels.value.map(grade => fetchSectionOptions(grade.id, auth.token)))
    sections.value = results.flat()
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

  if (!name) {
    errorMsg.value = 'Section name is required.'
    return
  }
  if (!gradeLevelId) {
    errorMsg.value = 'Grade level is required.'
    return
  }
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

function startEdit(section: SectionOption) {
  editingSection.value = section
  sectionForm.value = { name: section.name, grade_level_id: section.grade_level_id }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function resetForm() {
  editingSection.value = null
  sectionForm.value = { name: '', grade_level_id: null }
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

onMounted(loadAllSections)
</script>
