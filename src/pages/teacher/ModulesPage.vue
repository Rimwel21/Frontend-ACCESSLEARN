<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="eyebrow">Class Management</p>
        <h1 class="font-display text-2xl font-bold">Learning Materials</h1>
      </div>
      <button class="btn-primary" @click="openForm()">Add Learning Material</button>
    </div>

    <div class="grid gap-3 md:grid-cols-3">
      <RouterLink to="/teacher/modules" class="card border-2 border-brand-blue p-4 no-underline">
        <div class="flex items-center gap-3">
          <span class="grid h-10 w-10 place-items-center rounded-xl bg-brand-blue text-xs font-black text-white">LM</span>
          <div>
            <div class="font-display text-sm font-bold text-ink">Learning Materials</div>
            <div class="text-xs font-semibold text-ink-soft">Upload PDFs for student lessons</div>
          </div>
        </div>
      </RouterLink>
      <RouterLink to="/teacher/activities" class="card p-4 no-underline transition hover:-translate-y-0.5">
        <div class="flex items-center gap-3">
          <span class="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-xs font-black text-brand-violet">A</span>
          <div>
            <div class="font-display text-sm font-bold text-ink">Activities</div>
            <div class="text-xs font-semibold text-ink-soft">Create practice tasks</div>
          </div>
        </div>
      </RouterLink>
      <RouterLink to="/teacher/quizzes" class="card p-4 no-underline transition hover:-translate-y-0.5">
        <div class="flex items-center gap-3">
          <span class="grid h-10 w-10 place-items-center rounded-xl bg-cyan-100 text-xs font-black text-brand-blue">Q</span>
          <div>
            <div class="font-display text-sm font-bold text-ink">Quizzes</div>
            <div class="text-xs font-semibold text-ink-soft">Build scored checks</div>
          </div>
        </div>
      </RouterLink>
    </div>

    <div class="card p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <input v-model="search" class="input-field max-w-sm" placeholder="Search by title, class, week, status, or file..." />
        <span class="text-xs font-semibold text-ink-soft">{{ filteredMaterials.length }} of {{ store.modules.length }} shown</span>
        <span v-if="successMessage" class="status-success">{{ successMessage }}</span>
      </div>
    </div>

    <div v-if="store.modulesLoading" class="empty-state">Loading learning materials...</div>
    <div v-else-if="filteredMaterials.length === 0" class="card p-12 text-center">
      <h2 class="font-display text-xl font-bold">No learning materials have been added yet.</h2>
      <p class="mx-auto mt-2 max-w-md text-sm text-ink-soft">Add PDFs, PowerPoint decks, or Word documents for the selected module.</p>
      <button class="btn-primary mt-5" @click="openForm()">Add Learning Material</button>
    </div>
    <div v-else class="card overflow-hidden">
      <div class="hidden grid-cols-[minmax(240px,1.4fr)_minmax(170px,1fr)_110px_120px_minmax(180px,1fr)_220px] gap-4 border-b border-gray-100 bg-surface px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft lg:grid">
        <div>Material</div>
        <div>Class</div>
        <div>Type</div>
        <div>Week</div>
        <div>File</div>
        <div class="text-right">Actions</div>
      </div>
      <article
        v-for="material in filteredMaterials"
        :key="material.id"
        class="grid gap-3 border-b border-gray-100 px-5 py-4 last:border-b-0 lg:grid-cols-[minmax(240px,1.4fr)_minmax(170px,1fr)_110px_120px_minmax(180px,1fr)_220px] lg:items-center"
      >
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="truncate font-display text-base font-bold">{{ material.title }}</h2>
            <span :class="material.status === 'Published' ? 'badge-green' : 'badge-amber'" class="badge">{{ material.status }}</span>
          </div>
          <p class="mt-1 line-clamp-2 text-sm text-ink-soft">{{ material.description }}</p>
        </div>
        <div class="text-sm font-semibold text-ink-soft">
          <span class="lg:hidden">Class: </span>{{ classNameFor(material.classId) }}
        </div>
        <div class="text-sm text-ink-soft">
          <span class="lg:hidden">Type: </span>{{ material.contentType || 'Material' }}
        </div>
        <div class="text-sm text-ink-soft">
          <span class="lg:hidden">Week: </span>{{ material.week || 'Not set' }}
        </div>
        <div class="min-w-0 text-sm text-ink-soft">
          <div class="truncate">{{ material.fileName || 'No file' }}</div>
          <div class="mt-0.5 text-xs">{{ formatFileSize(material.fileSize) }}</div>
        </div>
        <div class="flex flex-wrap justify-start gap-2 lg:justify-end">
          <button class="figma-button" @click="router.push(`/teacher/modules/${material.id}/preview`)">Preview</button>
          <button class="figma-button" :disabled="!material.fileName" @click="downloadMaterial(material)">Download</button>
          <button class="figma-button" @click="openForm(material)">Edit</button>
          <button class="figma-button border-red-300 text-red-700" @click="deleteMaterial(material.id)">Delete</button>
        </div>
      </article>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showForm" class="fixed inset-0 z-50 overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm" @click.self="closeForm">
          <div class="mx-auto max-w-6xl rounded-lg bg-[#ededed] p-3 shadow-2xl">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 shadow-sm">
              <div>
                <h2 class="font-display text-base font-bold">{{ editingMaterialId ? 'Edit Learning Material' : 'Upload Learning Materials' }}</h2>
                <p class="mt-0.5 text-xs font-semibold text-ink-soft">Fill in the details, attach a PDF, then save it for the selected class.</p>
              </div>
              <div class="flex gap-2">
                <button class="figma-button" @click="closeForm">Cancel</button>
                <button class="figma-primary" :disabled="store.moduleSaving" @click="submitMaterial">
                  {{ store.moduleSaving ? 'Saving...' : editingMaterialId ? 'Save Changes' : 'Publish' }}
                </button>
              </div>
            </div>

            <div class="figma-shell">
              <section class="figma-panel">
                <div class="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 class="figma-card-title mb-1">Material Details</h3>
                    <p class="text-xs font-semibold text-ink-soft">These fields control how students and teachers find the material.</p>
                  </div>
                  <span class="rounded-full bg-[#D6E4FF] px-3 py-1 text-[11px] font-bold text-[#315ed8]">Required</span>
                </div>
                <div class="grid gap-4">
                  <div><label class="figma-label">Title</label><input v-model.trim="form.title" class="figma-input" placeholder="e.g. Separating mixtures" /></div>
                  <div><label class="figma-label">Description</label><textarea v-model.trim="form.description" class="figma-input min-h-24 resize-y" placeholder="Briefly describe what students will learn." /></div>
                  <div>
                    <label class="figma-label">Class</label>
                    <select v-model="form.classId" class="figma-input">
                      <option value="">Select class...</option>
                      <option v-for="cls in store.classes" :key="cls.id" :value="cls.id">
                        {{ cls.className }} - {{ cls.subject }}
                      </option>
                    </select>
                  </div>
                  <div class="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label class="figma-label">Content Type</label>
                      <select v-model="form.contentType" class="figma-input">
                        <option value="">Select content type...</option>
                        <option v-for="type in contentTypeOptions" :key="type" :value="type">{{ type }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="figma-label">Week</label>
                      <select v-model="form.week" class="figma-input">
                        <option value="">Select week...</option>
                        <option v-for="week in learningWeekOptions" :key="week" :value="week">{{ week }}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              <section class="figma-panel flex min-h-72 flex-col justify-between">
                <div>
                  <h3 class="figma-card-title mb-1">Upload File</h3>
                  <p class="text-xs font-semibold text-ink-soft">PDF files are parsed into readable topics after saving.</p>
                </div>
                <label
                  :class="[
                    'mt-4 grid min-h-52 cursor-pointer place-items-center rounded-md border-2 border-dashed p-6 text-center transition hover:border-[#5d7ee7] hover:bg-white',
                    isDraggingFile ? 'border-[#5d7ee7] bg-white' : 'border-gray-300 bg-surface/70'
                  ]"
                  @dragenter.prevent="isDraggingFile = true"
                  @dragover.prevent="isDraggingFile = true"
                  @dragleave.prevent="isDraggingFile = false"
                  @drop.prevent="onFileDrop"
                >
                  <input class="sr-only" type="file" accept=".pdf" @change="onFileChange" />
                  <span class="text-sm font-bold">{{ editingMaterialId ? 'Choose a new file to replace the current upload' : 'Drop your PDF here' }}</span>
                  <span class="figma-button">Browse File</span>
                  <span v-if="fileName" class="max-w-full truncate text-xs font-semibold text-ink-soft">{{ fileName }}</span>
                  <span v-else class="text-xs font-semibold text-ink-soft">PDF only</span>
                </label>
              </section>
            </div>

            <section class="mt-2 grid gap-2 lg:grid-cols-[minmax(220px,0.9fr)_minmax(220px,0.9fr)_minmax(260px,1.2fr)]">
              <div class="figma-panel">
                <h3 class="figma-card-title">Additional Settings</h3>
                <div class="grid gap-3">
                  <div>
                    <label class="figma-label">Status</label>
                    <select v-model="form.status" class="figma-input">
                      <option value="Unpublished">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                  <div>
                    <label class="figma-label">Due Date</label>
                    <input v-model="form.releaseDate" class="figma-input" type="date" />
                  </div>
                </div>
              </div>
              <div class="figma-panel">
                <h3 class="figma-card-title">Behavior</h3>
                <label class="flex items-center gap-2 text-xs font-bold"><input v-model="form.behaviorRequired" type="checkbox" class="accent-green-500" /> Mark as required</label>
                <p class="mt-2 text-xs font-semibold text-ink-soft">Required materials appear in student progress tracking.</p>
              </div>
              <div class="figma-panel">
                <h3 class="figma-card-title">Review</h3>
                <dl class="grid gap-2 text-xs">
                  <div class="flex justify-between gap-3"><dt class="font-bold text-ink-soft">Class</dt><dd class="text-right font-semibold">{{ selectedClassLabel }}</dd></div>
                  <div class="flex justify-between gap-3"><dt class="font-bold text-ink-soft">Week</dt><dd class="text-right font-semibold">{{ form.week || 'Not set' }}</dd></div>
                  <div class="flex justify-between gap-3"><dt class="font-bold text-ink-soft">File</dt><dd class="max-w-44 truncate text-right font-semibold">{{ fileName || 'No file selected' }}</dd></div>
                </dl>
              </div>
            </section>

            <p v-if="formError" class="status-error mt-3" role="alert">{{ formError }}</p>
            <p v-if="store.moduleError" class="status-error mt-3" role="alert">{{ store.moduleError }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { learningWeekOptions } from '@/constants/learning'
import { useTeacherStore } from '@/stores/teacher'

const allowedExtensions = ['.pdf']
const contentTypeOptions = ['PDF']
const store = useTeacherStore()
const router = useRouter()
const search = ref('')
const showForm = ref(false)
const formError = ref('')
const successMessage = ref('')
const selectedFile = ref<File | null>(null)
const fileName = ref('')
const isDraggingFile = ref(false)
const form = ref(defaultForm())
const editingMaterialId = ref<string | null>(null)

const normalizedSearch = computed(() => search.value.trim().toLowerCase())
const filteredMaterials = computed(() => store.modules.filter(material => {
  if (!normalizedSearch.value) return true
  return [
    material.title,
    material.description,
    classNameFor(material.classId),
    material.contentType,
    material.week,
    material.status,
    material.fileName,
    formatFileSize(material.fileSize),
  ].some(value => String(value ?? '').toLowerCase().includes(normalizedSearch.value))
}))
const selectedClassLabel = computed(() => classNameFor(form.value.classId ? Number(form.value.classId) : null))

onMounted(() => {
  store.fetchClasses()
  store.fetchModules()
})

function defaultForm() {
  return {
    title: '',
    description: '',
    classId: store.selectedClassId ?? '',
    contentType: contentTypeOptions[0] ?? '',
    week: '',
    status: 'Unpublished' as 'Published' | 'Unpublished',
    releaseDate: '',
    behaviorRequired: true,
  }
}

function openForm(material?: {
  id: string
  title: string
  description: string
  classId?: number | null
  contentType?: string | null
  week?: string | null
  status: 'Published' | 'Unpublished'
  behaviorRequired?: boolean
  fileName?: string | null
  dueAt?: string | null
}) {
  editingMaterialId.value = material?.id ?? null
  form.value = material ? {
    title: material.title,
    description: material.description,
    classId: material.classId ? String(material.classId) : '',
    contentType: contentTypeOptions.includes(material.contentType ?? '') ? material.contentType ?? '' : contentTypeOptions[0] ?? '',
    week: material.week ?? '',
    status: material.status,
    releaseDate: toDateInputValue(material.dueAt),
    behaviorRequired: material.behaviorRequired ?? true,
  } : defaultForm()
  selectedFile.value = null
  fileName.value = material?.fileName ?? ''
  formError.value = ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingMaterialId.value = null
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  setSelectedFile(file, input)
}

function onFileDrop(event: DragEvent) {
  isDraggingFile.value = false
  const file = event.dataTransfer?.files?.[0] ?? null
  setSelectedFile(file)
}

function setSelectedFile(file: File | null, input?: HTMLInputElement) {
  selectedFile.value = null
  fileName.value = ''

  if (!file) return

  const lowerName = file.name.toLowerCase()
  const isAllowed = allowedExtensions.some(extension => lowerName.endsWith(extension))
  if (!isAllowed) {
    formError.value = 'Unsupported file type. Upload PDF files only.'
    if (input) input.value = ''
    return
  }

  selectedFile.value = file
  fileName.value = file.name
  formError.value = ''
}

async function submitMaterial() {
  formError.value = ''
  successMessage.value = ''

  if (!form.value.title || !form.value.description || !form.value.classId || !form.value.contentType || !form.value.week) {
    formError.value = 'Please complete the material details.'
    return
  }

  if (!editingMaterialId.value && !selectedFile.value) {
    formError.value = 'Please select a PDF file.'
    return
  }

  try {
    if (editingMaterialId.value) {
      await store.updateModule(editingMaterialId.value, {
        title: form.value.title,
        description: form.value.description,
        classId: Number(form.value.classId),
        contentType: form.value.contentType,
        week: form.value.week,
        status: form.value.status,
        behaviorRequired: form.value.behaviorRequired,
        dueAt: toApiDateTime(form.value.releaseDate),
      })
      if (selectedFile.value) {
        await store.replaceModuleFile(editingMaterialId.value, selectedFile.value)
      }
    } else {
      await store.addModule({
        title: form.value.title,
        description: form.value.description,
        classId: Number(form.value.classId),
        contentType: form.value.contentType,
        week: form.value.week,
        status: form.value.status,
        behaviorRequired: form.value.behaviorRequired,
        dueAt: toApiDateTime(form.value.releaseDate),
        file: selectedFile.value,
      })
    }
    await store.fetchModules()
    successMessage.value = editingMaterialId.value ? 'Learning material updated successfully.' : 'Learning material published successfully.'
    closeForm()
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'Unable to save learning material.'
  }
}

function formatFileSize(size?: number | null) {
  if (!size) return 'Not available'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function classNameFor(classId?: number | null) {
  if (!classId) return 'Not assigned'
  const cls = store.classes.find(item => item.id === String(classId))
  return cls ? `${cls.className} - ${cls.subject}` : `Class #${classId}`
}

async function downloadMaterial(material: { id: string; fileName?: string | null }) {
  try {
    await store.downloadModuleFile(material.id, material.fileName)
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'Unable to download material.'
  }
}

async function deleteMaterial(id: string) {
  await store.deleteModule(id)
  successMessage.value = 'Learning material deleted.'
}

function toApiDateTime(value: string) {
  return value ? `${value}T23:59:00` : null
}

function toDateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : ''
}
</script>
