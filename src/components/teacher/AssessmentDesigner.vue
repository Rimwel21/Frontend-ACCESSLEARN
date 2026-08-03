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
          </div>
        </section>

        <section class="figma-panel">
          <div class="mb-4">
            <h2 class="figma-card-title mb-1">{{ props.kind === 'quiz' ? 'Quiz Timer' : `${title} Settings` }}</h2>
            <p class="text-xs font-semibold text-ink-soft">{{ props.kind === 'quiz' ? 'Choose if this quiz has a countdown, then set the duration and unit.' : 'Control attempt behavior and answer visibility.' }}</p>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div v-if="props.kind === 'quiz'" class="sm:col-span-2">
              <label class="flex items-center gap-2 text-xs font-bold">
                <input v-model="form.timerEnabled" type="checkbox" class="accent-green-500" />
                Enable Quiz Timer
              </label>
              <div class="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px]">
                <div>
                  <label class="figma-label" for="time-limit-duration">Duration</label>
                  <input
                    id="time-limit-duration"
                    v-model.number="form.timeLimitValue"
                    class="figma-input"
                    inputmode="numeric"
                    min="1"
                    step="1"
                    type="number"
                    :disabled="!form.timerEnabled"
                    placeholder="Enter number"
                    @input="sanitizeTimerDuration"
                    @keydown="blockInvalidNumberInput"
                  />
                </div>
                <div>
                  <label class="figma-label" for="time-limit-unit">Unit</label>
                  <select id="time-limit-unit" v-model="form.timeLimitUnit" class="figma-input" :disabled="!form.timerEnabled">
                    <option value="hours">Hours</option>
                    <option value="minutes">Minutes</option>
                    <option value="seconds">Seconds</option>
                  </select>
                </div>
              </div>
              <p v-if="!form.timerEnabled" class="mt-2 text-[11px] font-semibold text-ink-soft">Timer disabled: students can answer without a countdown.</p>
            </div>
            <div v-if="props.kind !== 'quiz'">
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
  title: '',
  description: '',
  category: '',
  week: '',
  dueDate: '',
  timerEnabled: false,
  timeLimitValue: null as number | null,
  timeLimitUnit: 'minutes' as 'seconds' | 'minutes' | 'hours',
  attemptsAllowed: 1,
  shuffleQuestions: true,
  showAnswersAfterSubmission: true,
  questions: [
    { prompt: '', answer: '' },
  ],
  }
}

const form = ref(blankForm())

const saving = computed(() => props.kind === 'quiz' ? store.quizSaving : store.activitySaving)
const isEditing = computed(() => Boolean(props.initialAssessment))

onMounted(async () => {
  await store.fetchClasses()
  hydrateForm()
})

function addQuestion() {
  form.value.questions.push({ prompt: '', answer: '' })
}

function removeQuestion(index: number) {
  if (form.value.questions.length === 1) return
  form.value.questions.splice(index, 1)
}

function selectClass() {
  store.selectedClassId = form.value.classId || null
}

async function saveAssessment() {
  error.value = ''
  success.value = ''

  if (!form.value.title || !form.value.description || !form.value.category || !form.value.week || !form.value.classId) {
    error.value = `Please complete the ${props.title.toLowerCase()} information.`
    return
  }

  const questions = form.value.questions.filter(question => question.prompt.trim())

  if (questions.length === 0) {
    error.value = 'Add at least one question.'
    return
  }

  if (props.kind === 'quiz') {
    const timeLimitSeconds = composeTimeLimitSeconds()
    if (form.value.timerEnabled && !timeLimitSeconds) {
      error.value = 'Enter a positive whole-number quiz time limit.'
      return
    }

    const payload = {
      title: form.value.title,
      classId: Number(form.value.classId),
      description: form.value.description,
      quizType: form.value.category,
      week: form.value.week,
      timeLimitSeconds,
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
    return
  }

  const module = assessment.moduleId
    ? store.modules.find(item => Number(item.id) === assessment.moduleId)
    : null
  const inferredClassId = assessment.classId ?? module?.classId ?? ''

  form.value = {
    classId: inferredClassId ? String(inferredClassId) : '',
    title: assessment.title,
    description: assessment.description ?? '',
    category: assessment.category ?? ('type' in assessment ? assessment.type : assessment.module) ?? '',
    week: assessment.week ?? '',
    dueDate: toDateInput(assessment.dueAt),
    ...parseTimeLimit(assessment.timeLimitSeconds, assessment.timeLimit ?? ('dueTime' in assessment ? assessment.dueTime : '') ?? ''),
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

function composeTimeLimitSeconds() {
  if (!form.value.timerEnabled) return null
  const value = Number(form.value.timeLimitValue)
  if (!Number.isInteger(value) || value <= 0) return null
  if (form.value.timeLimitUnit === 'hours') return value * 3600
  if (form.value.timeLimitUnit === 'minutes') return value * 60
  return value
}

function parseTimeLimit(seconds?: number | null, value?: string | null) {
  const fallback = {
    timerEnabled: false,
    timeLimitValue: null as number | null,
    timeLimitUnit: 'minutes' as 'seconds' | 'minutes' | 'hours',
  }
  if (seconds && Number.isInteger(seconds) && seconds > 0) {
    if (seconds % 3600 === 0) return { timerEnabled: true, timeLimitValue: seconds / 3600, timeLimitUnit: 'hours' as const }
    if (seconds % 60 === 0) return { timerEnabled: true, timeLimitValue: seconds / 60, timeLimitUnit: 'minutes' as const }
    return { timerEnabled: true, timeLimitValue: seconds, timeLimitUnit: 'seconds' as const }
  }
  if (!value) return fallback

  const match = value.trim().toLowerCase().match(/^(\d+)\s*(second|seconds|minute|minutes|hour|hours|s|m|h)?$/)
  if (!match) return fallback

  const amount = Number(match[1])
  if (!Number.isInteger(amount) || amount <= 0) return fallback

  const unit = match[2] ?? 'minutes'
  if (unit.startsWith('h')) return { timerEnabled: true, timeLimitValue: amount, timeLimitUnit: 'hours' as const }
  if (unit.startsWith('s')) return { timerEnabled: true, timeLimitValue: amount, timeLimitUnit: 'seconds' as const }
  return { timerEnabled: true, timeLimitValue: amount, timeLimitUnit: 'minutes' as const }
}

function blockInvalidNumberInput(event: KeyboardEvent) {
  if (['e', 'E', '+', '-', '.'].includes(event.key)) {
    event.preventDefault()
  }
}

function sanitizeTimerDuration() {
  const value = Number(form.value.timeLimitValue)
  if (!Number.isFinite(value) || value <= 0) {
    form.value.timeLimitValue = null
    return
  }
  form.value.timeLimitValue = Math.floor(value)
}
</script>
