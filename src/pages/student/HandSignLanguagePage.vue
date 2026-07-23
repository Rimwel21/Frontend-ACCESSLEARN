<template>
  <div class="min-h-screen bg-white">
    <div class="border-b-[3px] border-black bg-[#1565FF] px-8 py-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="font-display text-[28px] font-black text-white">Activity Viewer</h1>
          <p class="font-mono text-[11px] font-bold uppercase tracking-widest text-white">{{ activeActivity?.title || 'Standard and sign language modes' }}</p>
        </div>
        <button
          type="button"
          class="border-[3px] border-black bg-white px-4 py-2 text-xs font-black"
          style="box-shadow:3px 3px 0 #000"
          @click="router.push('/student/activities')"
        >
          Back
        </button>
      </div>
    </div>

    <div class="grid gap-5 px-7 py-6 xl:grid-cols-[minmax(0,1fr)_330px]">
      <div class="space-y-5">
        <SignLanguageToggle v-model="signLanguageMode" :disabled="isActivityCompleted" />

        <section v-if="content.loading" class="border-[3px] border-black bg-white p-5 text-sm font-black" style="box-shadow:4px 4px 0 #000">
          Loading activity...
        </section>

        <section v-else-if="content.error || !activeActivity" class="border-[3px] border-black bg-red-50 p-5 text-sm font-black text-red-700" style="box-shadow:4px 4px 0 #000">
          {{ content.error || 'Activity not found.' }}
        </section>

        <section v-else class="border-[3px] border-black bg-[#FFE135] p-5" style="box-shadow:4px 4px 0 #000">
          <div class="font-mono text-[10px] font-black uppercase tracking-widest">Question {{ activeQuestionIndex + 1 }} of {{ activeActivity.questions.length }}</div>
          <h2 class="mt-2 font-display text-xl font-black">{{ activeQuestion?.prompt }}</h2>
          <p class="mt-2 text-sm font-bold text-gray-700">{{ activeActivity.description }}</p>
        </section>

        <HandCamera
          v-if="signLanguageMode && activeActivity && !isActivityCompleted"
          v-model:video-ref="videoRef"
          v-model:canvas-ref="canvasRef"
          :detection="detection"
          :is-running="isRunning"
          :is-detecting="isDetecting"
          :error="error"
          :retry-message="retryMessage"
          @start="start"
        />

        <PredictionDisplay
          v-if="activeActivity"
          v-model:text-answer="textAnswer"
          :sign-mode="signLanguageMode"
          :answer="answer"
          :detection="detection"
          :disabled="isActivityCompleted"
        />

        <div v-if="activeActivity" class="flex flex-wrap gap-2">
          <button
            v-for="(_, index) in activeActivity.questions"
            :key="index"
            :class="[
              'border-[3px] border-black px-3 py-2 text-xs font-black',
              activeQuestionIndex === index ? 'bg-[#1565FF] text-white' : answers[String(index)] ? 'bg-green-200 text-black' : 'bg-white text-black'
            ]"
            style="box-shadow:3px 3px 0 #000"
            @click="selectQuestion(index)"
          >
            Q{{ index + 1 }}
          </button>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 border-[3px] border-black bg-white p-4" style="box-shadow:4px 4px 0 #000">
          <CameraControls
            v-if="signLanguageMode && !isActivityCompleted"
            :is-running="isRunning"
            @start="start"
            @stop="stop"
            @reset="reset"
            @backspace="backspace"
          />
          <button
            v-if="activeActivity && activeQuestionIndex < activeActivity.questions.length - 1"
            type="button"
            class="border-[3px] border-black bg-white px-5 py-2.5 text-xs font-black"
            style="box-shadow:3px 3px 0 #000"
            @click="nextQuestion"
          >
            Next Question
          </button>
          <button
            type="button"
            class="border-[3px] border-black bg-[#FFE135] px-5 py-2.5 text-xs font-black disabled:cursor-not-allowed disabled:opacity-60"
            style="box-shadow:3px 3px 0 #000"
            :disabled="isActivityCompleted"
            @click="submitAnswer"
          >
            {{ isActivityCompleted ? 'Submitted' : 'Submit Answer' }}
          </button>
        </div>
      </div>

      <aside class="space-y-5">
        <section class="border-[3px] border-black bg-white" style="box-shadow:5px 5px 0 #000">
          <div class="border-b-[3px] border-black bg-[#FFE135] px-4 py-3">
            <h2 class="font-display text-sm font-black uppercase tracking-widest">Reference</h2>
          </div>
          <div class="p-4">
            <img :src="sampleSigns" alt="Reference chart for alphabet hand signs" class="w-full border-[3px] border-black bg-white object-contain" />
          </div>
        </section>

        <section class="border-[3px] border-black bg-white p-4" style="box-shadow:5px 5px 0 #000">
          <h2 class="font-display text-sm font-black uppercase tracking-widest">Mode</h2>
          <dl class="mt-3 space-y-2 text-xs">
            <div class="flex justify-between gap-3">
              <dt class="font-black text-gray-500">Student type</dt>
              <dd class="text-right font-bold">{{ studentTypeLabel }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="font-black text-gray-500">Default</dt>
              <dd class="text-right font-bold">{{ defaultModeLabel }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="font-black text-gray-500">Current answer</dt>
              <dd class="max-w-[150px] truncate text-right font-bold">{{ currentAnswer || 'Empty' }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="font-black text-gray-500">Score</dt>
              <dd class="text-right font-bold">{{ scoreLabel }}</dd>
            </div>
          </dl>
          <p v-if="submitMessage" class="mt-4 border-[3px] border-black bg-[#D6E4FF] px-3 py-2 text-xs font-black">{{ submitMessage }}</p>
        </section>
      </aside>
    </div>

    <Teleport to="body">
      <div
        v-if="resultPopup"
        class="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4"
        @click.self="closeResultPopup"
      >
        <section class="w-full max-w-sm border-[3px] border-black bg-white p-5" style="box-shadow:6px 6px 0 #000">
          <div
            :class="[
              'border-[3px] border-black px-4 py-3 font-display text-lg font-black uppercase tracking-widest',
              resultPopup.isCorrect ? 'bg-green-200 text-black' : 'bg-[#FFE135] text-black'
            ]"
          >
            {{ resultPopup.title }}
          </div>
          <p class="mt-4 text-sm font-bold text-gray-700">{{ resultPopup.message }}</p>
          <button
            type="button"
            class="mt-5 w-full border-[3px] border-black bg-[#1565FF] px-4 py-2.5 text-xs font-black text-white"
            style="box-shadow:3px 3px 0 #000"
            @click="closeResultPopup"
          >
            OK
          </button>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HandCamera from '@/components/handsign/HandCamera.vue'
import PredictionDisplay from '@/components/handsign/PredictionDisplay.vue'
import SignLanguageToggle from '@/components/handsign/SignLanguageToggle.vue'
import CameraControls from '@/components/handsign/CameraControls.vue'
import { useHandSign } from '@/composables/useHandSign'
import { useProfileStore } from '@/stores/profile'
import { useStudentContentStore } from '@/stores/studentContent'
import sampleSigns from '@/assets/handsign/sample_signs.png'

const router = useRouter()
const route = useRoute()
const profile = useProfileStore()
const content = useStudentContentStore()
const {
  videoRef,
  canvasRef,
  detection,
  answer,
  isRunning,
  isDetecting,
  error,
  retryMessage,
  start,
  stop,
  reset,
  backspace,
} = useHandSign()

const signLanguageMode = ref(false)
const defaultWasApplied = ref(false)
const textAnswer = ref('')
const submitMessage = ref('')
const activeQuestionIndex = ref(0)
const answers = ref<Record<string, string>>({})
const result = ref<{ score: number; total: number } | null>(null)
const resultPopup = ref<{
  isCorrect: boolean
  title: string
  message: string
} | null>(null)

const activityId = computed(() => route.query.activityId ? Number(route.query.activityId) : null)
const activeActivity = computed(() => content.currentActivity)
const activeQuestion = computed(() => activeActivity.value?.questions[activeQuestionIndex.value] ?? null)
const isHearingImpaired = computed(() => {
  const data = profile.profile
  return Boolean(data && 'student_type' in data && data.student_type === 'hearing impaired')
})
const studentTypeLabel = computed(() => isHearingImpaired.value ? 'Student with Hearing Impairment' : 'Regular Student')
const defaultModeLabel = computed(() => isHearingImpaired.value ? 'Sign Language Mode on' : 'Text input')
const currentAnswer = computed(() => signLanguageMode.value ? answer.value : textAnswer.value)
const isActivityCompleted = computed(() => activeActivity.value?.student_status === 'completed')
const scoreLabel = computed(() => {
  if (result.value) return `${result.value.score} / ${result.value.total}`
  if (
    isActivityCompleted.value &&
    activeActivity.value?.student_score !== null &&
    activeActivity.value?.student_score !== undefined &&
    activeActivity.value?.student_total !== null &&
    activeActivity.value?.student_total !== undefined
  ) {
    return `${activeActivity.value.student_score} / ${activeActivity.value.student_total}`
  }
  return 'Not submitted'
})

watch(signLanguageMode, async (enabled) => {
  if (isActivityCompleted.value) {
    stop()
    return
  }
  submitMessage.value = ''
  if (enabled) {
    await nextTick()
    await start()
  } else {
    stop()
  }
})

onMounted(async () => {
  if (!profile.profile) {
    await profile.fetchProfile().catch(() => null)
  }
  if (activityId.value) {
    await content.fetchActivity(activityId.value)
  }
  if (isActivityCompleted.value) {
    stop()
    submitMessage.value = `Already submitted. Score: ${scoreLabel.value}`
  }
  if (!defaultWasApplied.value) {
    signLanguageMode.value = isHearingImpaired.value
    defaultWasApplied.value = true
  }
})

function selectQuestion(index: number) {
  saveCurrentAnswer()
  activeQuestionIndex.value = index
  textAnswer.value = answers.value[String(index)] ?? ''
  reset()
}

function nextQuestion() {
  if (!activeActivity.value) return
  saveCurrentAnswer()
  if (activeQuestionIndex.value < activeActivity.value.questions.length - 1) {
    selectQuestion(activeQuestionIndex.value + 1)
  }
}

async function submitAnswer() {
  saveCurrentAnswer()
  if (!activityId.value || !activeActivity.value) {
    submitMessage.value = 'Activity is not ready yet.'
    return
  }
  if (isActivityCompleted.value) {
    submitMessage.value = `Already submitted. Score: ${scoreLabel.value}`
    return
  }
  if (activeActivity.value.questions.some((_, index) => !answers.value[String(index)]?.trim())) {
    submitMessage.value = 'Answer every question before submitting.'
    return
  }

  const submittedMode = signLanguageMode.value ? 'Sign Language Mode' : 'Text Mode'
  const submitted = await content.submitActivity(activityId.value, answers.value).catch((err) => {
    submitMessage.value = err instanceof Error ? err.message : 'Unable to submit activity.'
    return null
  })
  if (!submitted) return
  result.value = { score: submitted.score, total: submitted.total }
  submitMessage.value = `Submitted. Score: ${submitted.score} / ${submitted.total}`
  stop()
  openResultPopup(submitted, submittedMode)
}

function saveCurrentAnswer() {
  const value = currentAnswer.value.trim()
  if (value) answers.value[String(activeQuestionIndex.value)] = value
}

function openResultPopup(submitted: { score: number; total: number }, submittedMode: string) {
  const isCorrect = submitted.total > 0 && submitted.score === submitted.total
  resultPopup.value = {
    isCorrect,
    title: isCorrect ? 'Correct' : 'Not correct',
    message: isCorrect
      ? `Your ${submittedMode} answer was submitted successfully. Score: ${submitted.score} / ${submitted.total}.`
      : `Your ${submittedMode} answer was submitted successfully, but it did not match the expected answer. Score: ${submitted.score} / ${submitted.total}.`,
  }
}

function closeResultPopup() {
  resultPopup.value = null
}
</script>
