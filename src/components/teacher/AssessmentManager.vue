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

    <div v-else class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="item in filteredCards" :key="item.id" class="card p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="font-display text-lg font-bold">{{ item.title }}</h2>
            <p class="mt-1 line-clamp-2 text-sm text-ink-soft">{{ item.description }}</p>
          </div>
          <span class="badge-blue badge">{{ item.badge }}</span>
        </div>
        <dl class="mt-4 grid gap-2 text-xs text-ink-soft">
          <div class="flex justify-between gap-3"><dt class="font-bold">{{ props.kind === 'quiz' ? 'Module' : 'Type' }}</dt><dd>{{ item.module || 'Not set' }}</dd></div>
          <div class="flex justify-between gap-3"><dt class="font-bold">Questions</dt><dd>{{ item.questionCount }}</dd></div>
          <div class="flex justify-between gap-3"><dt class="font-bold">{{ props.kind === 'quiz' ? 'Updated' : 'Due' }}</dt><dd>{{ item.updated }}</dd></div>
          <div v-if="props.kind === 'activity'" class="flex justify-between gap-3"><dt class="font-bold">Submissions</dt><dd>{{ item.submissionCount }}</dd></div>
        </dl>
        <div v-if="props.kind === 'activity' && item.submissions.length" class="mt-4 border-t border-gray-100 pt-3">
          <div class="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-soft">Submitted by</div>
          <div class="grid gap-1.5">
            <div v-for="submission in item.submissions" :key="submission.id" class="text-xs">
              <div class="flex items-center justify-between gap-3">
                <span class="truncate font-semibold">{{ submission.studentName }}</span>
                <span class="font-mono">{{ submission.score ?? 0 }}/{{ submission.total ?? 0 }}</span>
              </div>
              <div class="mt-0.5 truncate font-mono text-[11px] text-ink-soft">{{ formatSubmissionAnswers(submission.answers) }}</div>
            </div>
          </div>
        </div>
        <div class="mt-4 flex justify-end">
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
