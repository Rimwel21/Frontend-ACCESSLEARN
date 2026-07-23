<template>
  <div class="figma-page">
    <div class="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div class="figma-title">{{ title }}</div>
        <p class="mt-1 text-xs font-semibold text-ink-soft">Organize details, availability, and scoring questions before saving.</p>
      </div>
      <span class="rounded-full bg-[#D6E4FF] px-3 py-1 text-[11px] font-bold text-[#315ed8]">{{ form.questions.length }} question{{ form.questions.length === 1 ? '' : 's' }}</span>
    </div>

    <div class="grid gap-2 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)]">
      <div class="grid gap-2">
        <section class="figma-panel">
          <div class="mb-4">
            <h2 class="figma-card-title mb-1">{{ title }} Information</h2>
            <p class="text-xs font-semibold text-ink-soft">Choose the class and context students will see.</p>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="figma-label" for="assessment-title">{{ title }} Title</label>
              <input id="assessment-title" v-model.trim="form.title" class="figma-input" />
            </div>
            <div class="sm:col-span-2">
              <label class="figma-label" for="assessment-description">Description</label>
              <textarea id="assessment-description" v-model.trim="form.description" class="figma-input min-h-20 resize-y" />
            </div>
            <div>
              <label class="figma-label" for="assessment-type">{{ title }} Type</label>
              <input id="assessment-type" v-model.trim="form.category" class="figma-input" />
            </div>
            <div>
              <label class="figma-label" for="assessment-week">Week</label>
              <select id="assessment-week" v-model="form.week" class="figma-input">
                <option value="">Select week...</option>
                <option v-for="week in learningWeekOptions" :key="week" :value="week">{{ week }}</option>
              </select>
            </div>
            <div>
              <label class="figma-label" for="assessment-due-date">Due Date</label>
              <input id="assessment-due-date" v-model="form.dueDate" class="figma-input" type="date" />
            </div>
            <div>
              <label class="figma-label" for="assessment-class">Target Class</label>
              <select id="assessment-class" v-model="form.classId" class="figma-input" @change="selectClass">
                <option value="">Select grade and section</option>
                <option v-for="cls in store.classes" :key="cls.id" :value="cls.id">
                  {{ cls.className }} - {{ gradeLabel(cls.gradeLevel) }} Section {{ cls.section }}
                </option>
              </select>
            </div>
            <div v-if="props.kind === 'quiz'">
              <label class="figma-label" for="assessment-module">Learning Material</label>
              <select id="assessment-module" v-model.number="form.moduleId" class="figma-input" :disabled="!form.classId" @change="loadTopics()">
                <option :value="null">Select a material</option>
                <option v-for="module in availableModules" :key="module.id" :value="Number(module.id)">
                  {{ module.title }} - {{ classNameFor(module.classId) }}
                </option>
              </select>
            </div>
            <div v-if="props.kind === 'quiz'">
              <label class="figma-label" for="assessment-topic">Topic</label>
              <select id="assessment-topic" v-model.number="form.topicId" class="figma-input" :disabled="topics.length === 0">
                <option :value="null">Whole module</option>
                <option v-for="topic in topics" :key="topic.id" :value="topic.id">
                  {{ topic.title }}
                </option>
              </select>
            </div>
          </div>
        </section>

        <section class="figma-panel">
          <div class="mb-4">
            <h2 class="figma-card-title mb-1">{{ title }} Settings</h2>
            <p class="text-xs font-semibold text-ink-soft">Control attempt behavior and answer visibility.</p>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="figma-label" for="time-limit">Time Limit</label>
              <input id="time-limit" v-model.trim="form.timeLimit" class="figma-input" />
            </div>
            <div>
              <label class="figma-label" for="attempts">Attempts Allowed</label>
              <input id="attempts" v-model.number="form.attemptsAllowed" class="figma-input" min="1" type="number" />
            </div>
            <label class="flex items-center gap-2 text-xs font-bold sm:col-span-2">
              <input v-model="form.shuffleQuestions" type="checkbox" class="accent-green-500" />
              Shuffle Questions
            </label>
            <label class="flex items-center gap-2 text-xs font-bold sm:col-span-2">
              <input v-model="form.showAnswersAfterSubmission" type="checkbox" class="accent-green-500" />
              Show Answers after Submission
            </label>
          </div>
        </section>
      </div>

      <section class="figma-panel">
        <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="figma-card-title mb-1">Questions</h2>
            <p class="text-xs font-semibold text-ink-soft">Add clear prompts and exact answers for automatic scoring.</p>
          </div>
          <button class="figma-button" type="button" @click="addQuestion">Add Question</button>
        </div>
        <div class="rounded-md bg-gray-100 p-3">
          <div class="grid gap-3">
            <div v-for="(question, index) in form.questions" :key="index" class="grid gap-2 rounded-md border border-gray-200 bg-white p-3">
              <div class="flex items-center justify-between gap-2">
                <label class="figma-label mb-0">Question {{ index + 1 }}</label>
                <button
                  class="figma-button flex-shrink-0"
                  type="button"
                  :disabled="form.questions.length === 1"
                  @click="removeQuestion(index)"
                >
                  Remove
                </button>
              </div>
              <input v-model.trim="question.prompt" class="figma-input min-w-0 bg-white" :placeholder="`Prompt for question ${index + 1}`" />
              <input v-model.trim="question.answer" class="figma-input bg-white" placeholder="Correct answer (optional)" />
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="mt-3 flex items-center justify-end gap-3">
      <p v-if="error" class="status-error mr-auto" role="alert">{{ error }}</p>
      <p v-if="success" class="status-success mr-auto" role="status">{{ success }}</p>
      <button class="figma-primary" :disabled="saving" @click="saveAssessment">
        {{ saving ? 'Saving...' : `${isEditing ? 'Update' : 'Save'} ${title}` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { learningWeekOptions } from '@/constants/learning'
import { apiFetch } from '@/lib/api'
import { useTeacherStore } from '@/stores/teacher'
import type { Activity, Quiz } from '@/stores/teacher'

const props = defineProps<{
  kind: 'quiz' | 'activity'
  title: string
  initialAssessment?: Quiz | Activity | null
}>()
const emit = defineEmits<{
  saved: [mode: 'created' | 'updated']
}>()

const store = useTeacherStore()
const error = ref('')
const success = ref('')

function blankForm() {
  return {
  classId: '',
  moduleId: null as number | null,
  topicId: null as number | null,
  title: '',
  description: '',
  category: '',
  week: '',
  dueDate: '',
  timeLimit: '',
  attemptsAllowed: 1,
  shuffleQuestions: true,
  showAnswersAfterSubmission: true,
  questions: [
    { prompt: '', answer: '' },
  ],
  }
}

const form = ref(blankForm())
const topics = ref<Array<{ id: number; title: string }>>([])

const saving = computed(() => props.kind === 'quiz' ? store.quizSaving : store.activitySaving)
const isEditing = computed(() => Boolean(props.initialAssessment))

onMounted(async () => {
  await Promise.all([
    store.fetchClasses(),
    store.fetchModules(),
  ])
  hydrateForm()
})

const availableModules = computed(() => store.modules.filter(module => form.value.classId && module.classId === Number(form.value.classId)))

function addQuestion() {
  form.value.questions.push({ prompt: '', answer: '' })
}

function removeQuestion(index: number) {
  if (form.value.questions.length === 1) return
  form.value.questions.splice(index, 1)
}

async function loadTopics(resetTopic = true) {
  topics.value = []
  if (resetTopic) form.value.topicId = null
  if (!form.value.moduleId) return
  const detail = await apiFetch<{ topics: Array<{ id: number; title: string }> }>(`/teacher/modules/${form.value.moduleId}`)
  topics.value = detail.topics
}

function selectClass() {
  store.selectedClassId = form.value.classId || null
  form.value.moduleId = null
  form.value.topicId = null
  topics.value = []
}

async function saveAssessment() {
  error.value = ''
  success.value = ''

  if (!form.value.title || !form.value.description || !form.value.category || !form.value.week || !form.value.classId || (props.kind === 'quiz' && !form.value.moduleId)) {
    error.value = `Please complete the ${props.title.toLowerCase()} information.`
    return
  }

  const questions = form.value.questions.filter(question => question.prompt.trim())

  if (questions.length === 0) {
    error.value = 'Add at least one question.'
    return
  }

  if (props.kind === 'quiz') {
    const payload = {
      title: form.value.title,
      classId: Number(form.value.classId),
      moduleId: form.value.moduleId,
      topicId: form.value.topicId,
      description: form.value.description,
      quizType: form.value.category,
      week: form.value.week,
      timeLimit: form.value.timeLimit,
      attemptsAllowed: form.value.attemptsAllowed,
      shuffleQuestions: form.value.shuffleQuestions,
      showAnswersAfterSubmission: form.value.showAnswersAfterSubmission,
      questions,
      dueAt: toApiDateTime(form.value.dueDate),
    }

    if (props.initialAssessment) {
      await store.updateQuiz(props.initialAssessment.id, payload)
    } else {
      await store.addQuiz(payload)
    }
  } else {
    const payload = {
      title: form.value.title,
      classId: Number(form.value.classId),
      moduleId: null,
      topicId: null,
      description: form.value.description,
      activityType: form.value.category,
      week: form.value.week,
      timeLimit: form.value.timeLimit,
      attemptsAllowed: form.value.attemptsAllowed,
      shuffleQuestions: form.value.shuffleQuestions,
      showAnswersAfterSubmission: form.value.showAnswersAfterSubmission,
      questions,
      dueAt: toApiDateTime(form.value.dueDate),
    }

    if (props.initialAssessment) {
      await store.updateActivity(props.initialAssessment.id, payload)
    } else {
      await store.addActivity(payload)
    }
  }

  const mode = props.initialAssessment ? 'updated' : 'created'
  success.value = `${props.title} ${mode} successfully.`
  emit('saved', mode)
}

watch(() => props.initialAssessment, () => {
  hydrateForm()
}, { deep: true })

async function hydrateForm() {
  error.value = ''
  success.value = ''

  const assessment = props.initialAssessment
  if (!assessment) {
    form.value = blankForm()
    topics.value = []
    return
  }

  const module = assessment.moduleId
    ? store.modules.find(item => Number(item.id) === assessment.moduleId)
    : null
  const inferredClassId = assessment.classId ?? module?.classId ?? ''

  form.value = {
    classId: inferredClassId ? String(inferredClassId) : '',
    moduleId: assessment.moduleId ?? null,
    topicId: assessment.topicId ?? null,
    title: assessment.title,
    description: assessment.description ?? '',
    category: assessment.category ?? ('type' in assessment ? assessment.type : assessment.module) ?? '',
    week: assessment.week ?? '',
    dueDate: toDateInput(assessment.dueAt),
    timeLimit: assessment.timeLimit ?? ('dueTime' in assessment ? assessment.dueTime : '') ?? '',
    attemptsAllowed: assessment.attemptsAllowed ?? 1,
    shuffleQuestions: assessment.shuffleQuestions ?? true,
    showAnswersAfterSubmission: assessment.showAnswersAfterSubmission ?? true,
    questions: assessment.questions?.length
      ? assessment.questions.map(question => ({
          prompt: question.prompt,
          answer: question.answer ?? '',
        }))
      : [{ prompt: '', answer: '' }],
  }

  if (props.kind === 'quiz' && form.value.moduleId) {
    await loadTopics(false)
  }
}

function classNameFor(classId?: number | null) {
  if (!classId) return 'No class'
  const cls = store.classes.find(item => item.id === String(classId))
  return cls ? cls.className : `Class #${classId}`
}

function gradeLabel(value: string) {
  return value
}

function toApiDateTime(value: string) {
  return value ? `${value}T23:59:00` : null
}

function toDateInput(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}
</script>
