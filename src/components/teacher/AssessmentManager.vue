<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="eyebrow">Class Management</p>
        <h1 class="font-display text-2xl font-bold">{{ listTitle }}</h1>
      </div>
      <button class="btn-primary" @click="openForm()">Add {{ title }}</button>
    </div>

    <div class="grid gap-3 md:grid-cols-3">
      <RouterLink
        to="/teacher/modules"
        :class="[
          'card p-4 no-underline transition hover:-translate-y-0.5',
          props.kind === 'quiz' || props.kind === 'activity' ? '' : 'border-2 border-brand-blue'
        ]"
      >
        <div class="flex items-center gap-3">
          <span class="grid h-10 w-10 place-items-center rounded-xl bg-brand-blue text-xs font-black text-white">LM</span>
          <div>
            <div class="font-display text-sm font-bold text-ink">Learning Materials</div>
            <div class="text-xs font-semibold text-ink-soft">Upload PDFs for student lessons</div>
          </div>
        </div>
      </RouterLink>
      <RouterLink
        to="/teacher/activities"
        :class="[
          'card p-4 no-underline transition hover:-translate-y-0.5',
          props.kind === 'activity' ? 'border-2 border-brand-blue' : ''
        ]"
      >
        <div class="flex items-center gap-3">
          <span class="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-xs font-black text-brand-violet">A</span>
          <div>
            <div class="font-display text-sm font-bold text-ink">Activities</div>
            <div class="text-xs font-semibold text-ink-soft">Create practice tasks</div>
          </div>
        </div>
      </RouterLink>
      <RouterLink
        to="/teacher/quizzes"
        :class="[
          'card p-4 no-underline transition hover:-translate-y-0.5',
          props.kind === 'quiz' ? 'border-2 border-brand-blue' : ''
        ]"
      >
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
        <input v-model="search" class="input-field max-w-sm" :placeholder="`Search ${listTitle.toLowerCase()} by title, type, module, week, or student...`" />
        <span class="text-xs font-semibold text-ink-soft">{{ filteredItems.length }} of {{ items.length }} shown</span>
        <span v-if="successMessage" class="status-success">{{ successMessage }}</span>
      </div>
    </div>

    <div v-if="loading" class="empty-state">Loading {{ listTitle.toLowerCase() }}...</div>
    <div v-else-if="filteredItems.length === 0" class="card p-12 text-center">
      <h2 class="font-display text-xl font-bold">No {{ listTitle.toLowerCase() }} have been created yet.</h2>
      <p class="mx-auto mt-2 max-w-md text-sm text-ink-soft">
        Create your first {{ title.toLowerCase() }} for the selected module.
      </p>
      <button class="btn-primary mt-5" @click="openForm()">Add {{ title }}</button>
    </div>

    <div v-else class="card overflow-hidden">
      <div class="hidden grid-cols-[minmax(240px,1.35fr)_minmax(160px,0.9fr)_90px_110px_110px_120px] gap-4 border-b border-gray-100 bg-surface px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft lg:grid">
        <div>{{ title }}</div>
        <div>{{ props.kind === 'quiz' ? 'Learning Material' : 'Type' }}</div>
        <div>Questions</div>
        <div>Created</div>
        <div>{{ props.kind === 'quiz' ? 'Updated' : 'Due' }}</div>
        <div class="text-right">Actions</div>
      </div>
      <article
        v-for="item in filteredCards"
        :key="item.id"
        class="grid gap-3 border-b border-gray-100 px-5 py-4 transition-colors last:border-b-0 hover:bg-gray-50/70 lg:grid-cols-[minmax(240px,1.35fr)_minmax(160px,0.9fr)_90px_110px_110px_120px] lg:items-center"
      >
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="truncate font-display text-base font-bold">{{ item.title }}</h2>
            <span class="badge-blue badge">{{ item.badge }}</span>
          </div>
          <p class="mt-1 line-clamp-2 text-sm text-ink-soft">{{ item.description }}</p>
          <div v-if="props.kind === 'activity' && item.submissions.length" class="mt-2 grid gap-1 border-t border-gray-100 pt-2 text-xs">
            <div class="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Submitted by</div>
            <div v-for="submission in item.submissions" :key="submission.id" class="min-w-0">
              <div class="flex items-center justify-between gap-3">
                <span class="truncate font-medium">{{ submission.studentName }}</span>
                <span class="font-mono text-ink-soft">{{ submission.score ?? 0 }}/{{ submission.total ?? 0 }}</span>
              </div>
              <div class="mt-0.5 truncate font-mono text-[11px] text-ink-soft">{{ formatSubmissionAnswers(submission.answers) }}</div>
            </div>
          </div>
        </div>
        <div class="text-sm text-ink-soft">
          <span class="font-semibold lg:hidden">{{ props.kind === 'quiz' ? 'Learning Material: ' : 'Type: ' }}</span>{{ item.module || 'Not set' }}
        </div>
        <div class="text-sm text-ink-soft">
          <span class="font-semibold lg:hidden">Questions: </span>{{ item.questionCount }}
        </div>
        <div class="text-sm text-ink-soft">
          <span class="font-semibold lg:hidden">Created: </span>{{ item.created }}
        </div>
        <div class="text-sm text-ink-soft">
          <span class="font-semibold lg:hidden">{{ props.kind === 'quiz' ? 'Updated: ' : 'Due: ' }}</span>{{ item.updated }}
          <div v-if="props.kind === 'activity'" class="mt-1 text-xs">Submissions {{ item.submissionCount }}</div>
        </div>
        <div class="flex justify-start lg:justify-end">
          <button class="figma-button" type="button" @click="openForm(item.source)">Edit</button>
        </div>
      </article>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showForm" class="fixed inset-0 z-50 overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm" @click.self="closeForm">
          <div class="mx-auto max-w-5xl rounded-lg bg-[#ededed] p-3 shadow-2xl">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 shadow-sm">
              <div>
                <h2 class="font-display text-base font-bold">{{ editingItem ? `Edit ${title}` : `Create ${title}` }}</h2>
                <p class="mt-0.5 text-xs font-semibold text-ink-soft">Set the class, schedule, and questions in one place.</p>
              </div>
              <button class="figma-button" @click="closeForm">Close</button>
            </div>
            <AssessmentDesigner :kind="kind" :title="title" :initial-assessment="editingItem" @saved="handleSaved" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AssessmentDesigner from '@/components/teacher/AssessmentDesigner.vue'
import { useTeacherStore } from '@/stores/teacher'
import type { Activity, Quiz } from '@/stores/teacher'

const props = defineProps<{
  kind: 'quiz' | 'activity'
  title: string
}>()

const store = useTeacherStore()
const search = ref('')
const showForm = ref(false)
const loading = ref(false)
const successMessage = ref('')
const editingItem = ref<Quiz | Activity | null>(null)

const listTitle = computed(() => props.kind === 'quiz' ? 'Quizzes' : 'Activities')
const items = computed(() => props.kind === 'quiz' ? store.quizzes : store.activities)
const normalizedSearch = computed(() => search.value.trim().toLowerCase())
const filteredItems = computed(() => items.value.filter(item => matchesAssessmentSearch(item)))
const filteredCards = computed(() => filteredItems.value.map(item => {
  if ('type' in item) {
    return {
      id: item.id,
      title: item.title,
      description: item.description ?? '',
      module: item.module,
      badge: item.type,
      questionCount: item.questions?.length ?? 0,
      created: item.createdAt ?? 'Not set',
      updated: item.date,
      submissionCount: 0,
      submissions: [],
      source: item,
    }
  }

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    module: item.module,
    badge: item.status,
    questionCount: item.questions?.length ?? 0,
    created: item.createdAt ?? 'Not set',
    updated: item.dueDate || 'Not set',
    submissionCount: item.submissionsCount ?? 0,
    submissions: item.submissions ?? [],
    source: item,
  }
}))

onMounted(async () => {
  loading.value = true
  try {
    if (props.kind === 'quiz') await store.fetchModules()
    await store.fetchAssessments(props.kind)
  } finally {
    loading.value = false
  }
})

function openForm(item: Quiz | Activity | null = null) {
  successMessage.value = ''
  editingItem.value = item
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingItem.value = null
}

function handleSaved(mode: 'created' | 'updated') {
  successMessage.value = `${props.title} ${mode} successfully.`
  closeForm()
}

function formatSubmissionAnswers(answers: Record<string, string>) {
  const values = Object.values(answers).filter(Boolean)
  return values.length ? values.join(' / ') : 'No answer text'
}

function matchesAssessmentSearch(item: Quiz | Activity) {
  if (!normalizedSearch.value) return true
  const submissions = 'submissions' in item ? item.submissions ?? [] : []
  return [
    item.title,
    item.description,
    item.module,
    item.category,
    item.week,
    item.createdAt,
    'type' in item ? item.type : item.status,
    'dueDate' in item ? item.dueDate : item.date,
    ...submissions.flatMap(submission => [
      submission.studentName,
      `${submission.score ?? 0}/${submission.total ?? 0}`,
      formatSubmissionAnswers(submission.answers),
    ]),
  ].some(value => String(value ?? '').toLowerCase().includes(normalizedSearch.value))
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
