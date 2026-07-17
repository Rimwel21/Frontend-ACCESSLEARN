<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="eyebrow">Class Management</p>
        <h1 class="font-display text-2xl font-bold">Learning Materials</h1>
      </div>
      <button class="btn-primary" @click="openForm()">Add Learning Material</button>
    </div>

    <div class="card p-4">
      <div class="flex flex-wrap items-center gap-3">
        <input v-model="search" class="input-field max-w-sm" placeholder="Search learning materials..." />
        <span v-if="successMessage" class="status-success">{{ successMessage }}</span>
      </div>
    </div>

    <div v-if="store.modulesLoading" class="empty-state">Loading learning materials...</div>
    <div v-else-if="filteredMaterials.length === 0" class="card p-12 text-center">
      <h2 class="font-display text-xl font-bold">No learning materials have been added yet.</h2>
      <p class="mx-auto mt-2 max-w-md text-sm text-ink-soft">Add PDFs, PowerPoint decks, or Word documents for the selected module.</p>
      <button class="btn-primary mt-5" @click="openForm()">Add Learning Material</button>
    </div>
    <div v-else class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="material in filteredMaterials" :key="material.id" class="card p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="font-display text-lg font-bold">{{ material.title }}</h2>
            <p class="mt-1 line-clamp-2 text-sm text-ink-soft">{{ material.description }}</p>
          </div>
          <span :class="material.status === 'Published' ? 'badge-green' : 'badge-amber'" class="badge">{{ material.status }}</span>
        </div>
        <dl class="mt-4 grid gap-2 text-xs text-ink-soft">
          <div class="flex justify-between gap-3"><dt class="font-bold">Class</dt><dd>{{ classNameFor(material.classId) }}</dd></div>
          <div class="flex justify-between gap-3"><dt class="font-bold">Type</dt><dd>{{ material.contentType || 'Material' }}</dd></div>
          <div class="flex justify-between gap-3"><dt class="font-bold">Week</dt><dd>{{ material.week || 'Not set' }}</dd></div>
          <div class="flex justify-between gap-3"><dt class="font-bold">File</dt><dd class="truncate">{{ material.fileName || 'No file' }}</dd></div>
          <div class="flex justify-between gap-3"><dt class="font-bold">Size</dt><dd>{{ formatFileSize(material.fileSize) }}</dd></div>
        </dl>
        <div class="mt-4 flex flex-wrap gap-2">
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
          <div class="mx-auto max-w-5xl rounded-lg bg-[#ededed] p-3 shadow-2xl">
            <div class="mb-2 flex items-center justify-between">
              <h2 class="text-sm font-bold">{{ editingMaterialId ? 'Edit Learning Material' : 'Upload Learning Materials' }}</h2>
              <div class="flex gap-2">
                <button class="figma-button" @click="closeForm">Cancel</button>
                <button class="figma-primary" :disabled="store.moduleSaving" @click="submitMaterial">
                  {{ store.moduleSaving ? 'Saving...' : editingMaterialId ? 'Save Changes' : 'Publish' }}
                </button>
              </div>
            </div>

            <div class="figma-shell">
              <section class="figma-panel">
                <h3 class="figma-card-title">Material Details</h3>
                <div class="grid gap-3">
                  <div><label class="figma-label">Title</label><input v-model.trim="form.title" class="figma-input" /></div>
                  <div><label class="figma-label">Description</label><input v-model.trim="form.description" class="figma-input" /></div>
                  <div>
                    <label class="figma-label">Class</label>
                    <select v-model="form.classId" class="figma-input">
                      <option value="">Select class...</option>
                      <option v-for="cls in store.classes" :key="cls.id" :value="cls.id">
                        {{ cls.className }} - {{ cls.subject }}
                      </option>
                    </select>
                  </div>
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
              </section>

              <section class="figma-panel flex min-h-72 items-center justify-center">
                <label class="grid cursor-pointer place-items-center gap-3 text-center">
                  <input class="sr-only" type="file" accept=".pdf" @change="onFileChange" />
                  <span class="text-sm font-bold">{{ editingMaterialId ? 'Choose a new file to replace the current upload' : 'Drag and drop your files here' }}<br />or</span>
                  <span class="figma-button">Browse File</span>
                  <span v-if="fileName" class="text-xs font-semibold text-ink-soft">{{ fileName }}</span>
                </label>
              </section>
            </div>

            <section class="mt-2 grid gap-2 lg:grid-cols-3">
              <div class="figma-panel">
                <h3 class="figma-card-title">Additional Settings</h3>
                <label class="figma-label">Status</label>
                <select v-model="form.status" class="figma-input">
                  <option value="Unpublished">Draft</option>
                  <option value="Published">Published</option>
                </select>
                <label class="figma-label mt-3">Due Date</label>
                <input v-model="form.releaseDate" class="figma-input" type="date" />
              </div>
              <div class="figma-panel">
                <h3 class="figma-card-title">Behavior</h3>
                <label class="flex items-center gap-2 text-xs font-bold"><input v-model="form.behaviorRequired" type="checkbox" class="accent-green-500" /> Mark as required</label>
              </div>
              <div class="figma-panel flex flex-col items-center justify-center text-center">
                <div class="grid h-12 w-12 place-items-center rounded-full border-[2px] border-black bg-[#D6E4FF] text-xs font-black">LM</div>
                <h3 class="mt-3 font-display text-sm font-bold">Material Preview</h3>
                <p class="mt-1 max-w-48 text-xs font-semibold text-ink-soft">Selected files are parsed into readable topics for students after saving.</p>
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
const form = ref(defaultForm())
const editingMaterialId = ref<string | null>(null)

const filteredMaterials = computed(() => store.modules.filter(material =>
  !search.value || material.title.toLowerCase().includes(search.value.toLowerCase())
))

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
  selectedFile.value = null
  fileName.value = ''

  if (!file) return

  const lowerName = file.name.toLowerCase()
  const isAllowed = allowedExtensions.some(extension => lowerName.endsWith(extension))
  if (!isAllowed) {
    formError.value = 'Unsupported file type. Upload PDF files only.'
    input.value = ''
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
