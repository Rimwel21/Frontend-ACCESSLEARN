<template>
  <div class="min-h-screen bg-white">
    <div class="border-b-[3px] border-brand-teal bg-brand-blue px-8 py-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="font-display text-[28px] font-black text-white">Activity Viewer</h1>
          <p class="font-mono text-[11px] font-bold uppercase tracking-widest text-white">{{ activeActivity?.title || 'Sign Language Alphabet Reference' }}</p>
        </div>
        <button
          type="button"
          class="border-[3px] border-brand-teal bg-white px-4 py-2 text-xs font-black"
          @click="router.push('/student/activities')"
        >
          Back
        </button>
      </div>
    </div>

    <div class="grid gap-5 px-7 py-6 xl:grid-cols-[minmax(0,1fr)_330px]">
      <div class="space-y-5">
        <SignLanguageToggle v-if="activeActivity" v-model="signLanguageMode" :disabled="isActivityCompleted" />

        <section v-if="content.loading" class="border-[3px] border-brand-teal bg-white p-5 text-sm font-black">
          Loading activity...
        </section>

        <section v-else-if="content.error || (!activeActivity && !isAlphabetOnly)" class="border-[3px] border-brand-teal bg-red-50 p-5 text-sm font-black text-red-700">
          {{ content.error || 'Activity not found.' }}
        </section>

        <section v-else-if="isAlphabetOnly" class="border-[3px] border-brand-teal bg-brand-amber p-5">
          <div class="font-mono text-[10px] font-black uppercase tracking-widest">Offline-ready reference</div>
          <h2 class="mt-2 font-display text-xl font-black">Sign Language Alphabet</h2>
          <p class="mt-2 text-sm font-bold text-gray-700">
            Review the alphabet hand signs using the reference chart. This page remains available offline after it has been opened once.
          </p>
        </section>

        <section v-else-if="activeActivity" class="border-[3px] border-brand-teal bg-brand-amber p-5">
          <div class="flex items-center justify-between gap-2 font-mono text-[10px] font-black uppercase tracking-widest">
            <span>Question {{ activeQuestionIndex + 1 }} of {{ activeActivity.questions.length }}</span>
            <span v-if="activeQuestionParsed.type !== 'identification'" class="rounded border border-black/20 bg-black/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider">
              {{ activeQuestionParsed.type === 'multiple_choice' ? 'Multiple Choice' : 'True or False' }}
            </span>
          </div>
          <h2 class="mt-2 font-display text-xl font-black">{{ activeQuestion?.prompt }}</h2>

          <!-- Display choices for Multiple Choice or True / False -->
          <div v-if="activeQuestionParsed.choices.length" class="mt-4 grid gap-2.5 sm:grid-cols-2">
            <button
              v-for="choice in activeQuestionParsed.choices"
              :key="choice.letter"
              type="button"
              :disabled="isActivityCompleted"
              :class="[
                'flex items-center gap-3 border-[2.5px] border-brand-teal p-3 text-left font-black transition-all',
                isSelectedChoice(choice)
                  ? 'bg-brand-blue text-white shadow-[2px_2px_0_#000]'
                  : 'bg-white text-ink hover:bg-brand-blue-soft',
                isActivityCompleted ? 'cursor-not-allowed opacity-60' : ''
              ]"
              @click="selectChoice(choice)"
            >
              <span
                v-if="activeQuestionParsed.type === 'multiple_choice'"
                :class="[
                  'grid h-6 w-6 shrink-0 place-items-center rounded-full border-[2px] border-current text-xs font-black',
                  isSelectedChoice(choice)
                    ? 'bg-white text-brand-blue'
                    : 'bg-surface text-ink'
                ]"
              >
                {{ choice.letter }}
              </span>
              <span class="text-sm font-bold">{{ choice.text }}</span>
            </button>
          </div>

          <p v-if="activeActivity.description" class="mt-3 text-xs font-bold text-gray-700/80 border-t border-black/10 pt-2">
            {{ activeActivity.description }}
          </p>
        </section>

        <section v-if="activeActivity && !isActivityCompleted" class="grid gap-3 border-[3px] border-brand-teal bg-white p-4 shadow-card sm:grid-cols-3">
          <div class="border-[2px] border-brand-teal bg-surface p-3">
            <div class="text-xs font-black text-brand-blue">1. Review</div>
            <p class="mt-1 text-[11px] font-bold text-ink-soft">Read the prompt and inspect the answer choices.</p>
          </div>
          <div class="border-[2px] border-brand-teal bg-surface p-3">
            <div class="text-xs font-black text-brand-blue">2. Respond</div>
            <p class="mt-1 text-[11px] font-bold text-ink-soft">Use text input or Sign Language Mode for your answer.</p>
          </div>
          <div class="border-[2px] border-brand-teal bg-surface p-3">
            <div class="text-xs font-black text-brand-blue">3. Confirm</div>
            <p class="mt-1 text-[11px] font-bold text-ink-soft">Answered question buttons turn green before submission.</p>
          </div>
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
              'border-[3px] border-brand-teal px-3 py-2 text-xs font-black',
              activeQuestionIndex === index ? 'bg-brand-blue text-white' : answers[String(index)] ? 'bg-green-200 text-ink' : 'bg-white text-ink'
            ]"
            @click="selectQuestion(index)"
          >
            Q{{ index + 1 }}
          </button>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 border-[3px] border-brand-teal bg-white p-4">
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
            class="border-[3px] border-brand-teal bg-white px-5 py-2.5 text-xs font-black"
            @click="nextQuestion"
          >
            Next Question
          </button>
          <button
            type="button"
            class="border-[3px] border-brand-teal bg-brand-amber px-5 py-2.5 text-xs font-black disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isActivityCompleted"
            @click="submitAnswer"
          >
            {{ isActivityCompleted ? 'Submitted' : 'Submit Answer' }}
          </button>
        </div>

        <section v-if="shouldShowTutorialStatus" class="border-[3px] border-brand-teal bg-white p-4">
          <div class="font-mono text-[10px] font-black uppercase tracking-widest text-ink-soft">After Activity</div>
          <h2 class="mt-1 font-display text-lg font-black">Learn the sign for {{ canonicalTutorialWord }}</h2>

          <div v-if="tutorialLoading" class="mt-3 border-[3px] border-brand-teal bg-brand-blue-soft px-3 py-2 text-xs font-black">
            Checking tutorial availability...
          </div>
          <div v-else-if="tutorialError" class="mt-3 border-[3px] border-brand-rose bg-brand-rose/10 px-3 py-2 text-xs font-black text-red-700">
            {{ tutorialError }}
          </div>
          <template v-else-if="tutorial">
            <div class="mt-3 grid gap-2 sm:grid-cols-3">
              <div class="border-[3px] border-brand-teal bg-surface p-3">
                <div class="font-mono text-[10px] font-black uppercase tracking-widest text-ink-soft">Tutorial</div>
                <div class="mt-1 text-sm font-black">{{ tutorial.has_video ? 'Available' : 'Not available yet' }}</div>
              </div>
              <div class="border-[3px] border-brand-teal bg-surface p-3">
                <div class="font-mono text-[10px] font-black uppercase tracking-widest text-ink-soft">Practice</div>
                <div class="mt-1 text-sm font-black">{{ tutorial.can_practice ? 'Available' : 'Not available yet' }}</div>
              </div>
              <div class="border-[3px] border-brand-teal bg-surface p-3">
                <div class="font-mono text-[10px] font-black uppercase tracking-widest text-ink-soft">Samples</div>
                <div class="mt-1 text-sm font-black">{{ tutorial.reference_count }}</div>
              </div>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                class="border-[3px] border-brand-teal bg-brand-blue px-4 py-2 text-xs font-black text-white"
                @click="openTutorialModal"
              >
                Watch Tutorial
              </button>
              <button
                v-if="tutorial.can_practice"
                type="button"
                class="border-[3px] border-brand-teal bg-brand-amber px-4 py-2 text-xs font-black"
                @click="goToPractice"
              >
                Try It Now
              </button>
            </div>

            <p v-if="!tutorial.has_video" class="mt-3 border-[3px] border-brand-teal bg-brand-amber/25 px-3 py-2 text-xs font-black">
              Tutorial not available yet.
            </p>
            <p v-if="!tutorial.can_practice" class="mt-3 border-[3px] border-brand-teal bg-surface px-3 py-2 text-xs font-black text-ink-soft">
              Practice recognition not available yet.
            </p>
          </template>
        </section>

        <div v-if="isAlphabetOnly" class="overflow-hidden border-[3px] border-brand-teal bg-white">
          <img :src="sampleSigns" alt="Sign language alphabet chart" class="w-full object-contain" />
        </div>
      </div>

      <aside class="h-fit border-[3px] border-brand-teal bg-white p-5">
        <div class="font-mono text-[10px] font-black uppercase tracking-widest text-ink-soft">Learner Mode</div>
        <h2 class="mt-1 font-display text-lg font-black">{{ studentTypeLabel }}</h2>
        <dl class="mt-4 space-y-3 text-sm">
          <div class="flex justify-between gap-3">
            <dt class="font-black text-gray-500">Default</dt>
            <dd class="text-right font-bold">{{ defaultModeLabel }}</dd>
          </div>
          <div v-if="activeActivity" class="flex justify-between gap-3">
            <dt class="font-black text-gray-500">Status</dt>
            <dd class="text-right font-bold">{{ activeActivity.student_status }}</dd>
          </div>
          <div v-if="activeActivity" class="flex justify-between gap-3">
            <dt class="font-black text-gray-500">Score</dt>
            <dd class="text-right font-bold">{{ scoreLabel }}</dd>
          </div>
          <div v-if="tutorial" class="flex justify-between gap-3">
            <dt class="font-black text-gray-500">Practice</dt>
            <dd class="text-right font-bold">{{ tutorial.can_practice ? 'Available' : 'Unavailable' }}</dd>
          </div>
        </dl>
        <p v-if="isAlphabetOnly" class="mt-4 border-[3px] border-brand-teal bg-brand-blue-soft px-3 py-2 text-xs font-black">Available offline after first visit.</p>
        <p v-else-if="submitMessage" class="mt-4 border-[3px] border-brand-teal bg-brand-blue-soft px-3 py-2 text-xs font-black">{{ submitMessage }}</p>
      </aside>
    </div>

    <Teleport to="body">
      <div v-if="resultPopup" class="fixed inset-0 z-40 grid place-items-center bg-black/40 px-4 py-6">
        <div class="w-full max-w-md border-[3px] border-brand-teal bg-white p-5 shadow-[8px_8px_0_rgba(0,0,0,0.15)]">
          <div :class="['inline-flex border-[3px] border-brand-teal px-3 py-1 font-mono text-[10px] font-black uppercase tracking-widest', resultPopup.isCorrect ? 'bg-green-200' : 'bg-brand-amber']">
            Activity Result
          </div>
          <h2 class="mt-3 font-display text-2xl font-black">{{ resultPopup.title }}</h2>
          <p class="mt-4 text-sm font-bold text-gray-700">{{ resultPopup.message }}</p>
          <p v-if="canonicalTutorialWord" class="mt-3 border-[3px] border-brand-teal bg-brand-blue-soft px-3 py-2 text-xs font-black">
            Next: Learn the sign for {{ canonicalTutorialWord }}.
          </p>
          <button
            type="button"
            class="mt-5 w-full border-[3px] border-brand-teal bg-brand-blue px-4 py-2.5 text-xs font-black text-white"
            @click="closeResultPopup"
          >
            Continue
          </button>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="tutorialModalOpen" class="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4 py-6" role="dialog" aria-modal="true">
        <div class="max-h-[92vh] w-full max-w-3xl overflow-y-auto border-[3px] border-brand-teal bg-white shadow-[8px_8px_0_rgba(0,0,0,0.18)]">
          <div class="flex items-center justify-between gap-3 border-b-[3px] border-brand-teal bg-brand-blue px-4 py-3">
            <h2 class="font-display text-lg font-black text-white">Learn the Sign for {{ canonicalTutorialWord }}</h2>
            <button type="button" class="border-[3px] border-brand-teal bg-white px-3 py-1.5 text-xs font-black" @click="closeTutorialModal">
              Close
            </button>
          </div>

          <div class="space-y-4 p-4">
            <video
              v-if="resolvedTutorialVideoUrl"
              ref="tutorialVideoRef"
              class="aspect-video max-h-[58vh] w-full border-[3px] border-brand-teal bg-black object-contain"
              :src="resolvedTutorialVideoUrl"
              controls
              playsinline
            ></video>
            <div v-else class="border-[3px] border-brand-teal bg-brand-amber/25 px-4 py-6 text-center text-sm font-black">
              Tutorial not available yet.
            </div>

            <div class="flex flex-wrap justify-end gap-2">
              <button type="button" class="border-[3px] border-brand-teal bg-white px-5 py-2.5 text-xs font-black" @click="replayTutorial">
                Try Again
              </button>
              <button type="button" class="border-[3px] border-brand-teal bg-brand-amber px-5 py-2.5 text-xs font-black" @click="goToPractice">
                Next
              </button>
            </div>
          </div>
        </div>
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
import { getTutorialStatus, handsignErrorMessage, tutorialVideoUrl } from '@/services/handsign'
import { useProfileStore } from '@/stores/profile'
import { useStudentContentStore } from '@/stores/studentContent'
import sampleSigns from '@/assets/handsign/sample_signs.png'
import type { TutorialStatus } from '@/types/handsign'

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
const resultPopup = ref<{ isCorrect: boolean; title: string; message: string } | null>(null)
const tutorial = ref<TutorialStatus | null>(null)
const tutorialLoading = ref(false)
const tutorialError = ref('')
const tutorialModalOpen = ref(false)
const openTutorialAfterResult = ref(false)
const tutorialVideoRef = ref<HTMLVideoElement | null>(null)

const activityId = computed(() => route.query.activityId ? Number(route.query.activityId) : null)
const isAlphabetOnly = computed(() => !activityId.value)
const activeActivity = computed(() => content.currentActivity)
const activeQuestion = computed(() => activeActivity.value?.questions[activeQuestionIndex.value] ?? null)

function parseQuestionOptions(rawAnswer?: string | null) {
  if (!rawAnswer) return { type: 'identification', choices: [] as { letter: string; text: string }[] }
  const up = rawAnswer.trim().toUpperCase()
  if (up === 'TRUE' || up === 'FALSE') {
    return {
      type: 'true_false',
      choices: [
        { letter: 'TRUE', text: 'True' },
        { letter: 'FALSE', text: 'False' },
      ],
    }
  }
  if (rawAnswer.includes('CORRECT:') && rawAnswer.includes('|')) {
    const parts = rawAnswer.split('|')
    const choices: { letter: string; text: string }[] = []
    for (const part of parts) {
      if (part.includes(':')) {
        const colonIdx = part.indexOf(':')
        const k = part.slice(0, colonIdx).trim()
        const v = part.slice(colonIdx + 1).trim()
        if (k !== 'CORRECT' && k) {
          choices.push({ letter: k, text: v })
        }
      }
    }
    if (choices.length >= 2) {
      return { type: 'multiple_choice', choices }
    }
  }
  return { type: 'identification', choices: [] as { letter: string; text: string }[] }
}

const activeQuestionParsed = computed(() => parseQuestionOptions(activeQuestion.value?.answer))

function isSelectedChoice(choice: { letter: string; text: string }) {
  const current = (answers.value[String(activeQuestionIndex.value)] || currentAnswer.value || textAnswer.value || '').trim().toUpperCase()
  const letter = choice.letter.trim().toUpperCase()
  const text = choice.text.trim().toUpperCase()
  return current === letter || current === text
}

function selectChoice(choice: { letter: string; text: string }) {
  if (isActivityCompleted.value) return
  textAnswer.value = choice.letter
  answers.value[String(activeQuestionIndex.value)] = choice.letter
}

function saveCurrentAnswer() {
  const ans = (currentAnswer.value || textAnswer.value || '').trim()
  if (ans) {
    answers.value[String(activeQuestionIndex.value)] = ans
  }
}
const isHearingImpaired = computed(() => {
  const data = profile.profile
  return Boolean(data && 'student_type' in data && data.student_type === 'hearing impaired')
})
const studentTypeLabel = computed(() => isHearingImpaired.value ? 'Student with Hearing Impairment' : 'Regular Student')
const defaultModeLabel = computed(() => isHearingImpaired.value ? 'Sign Language Mode on' : 'Text input')
const currentAnswer = computed(() => signLanguageMode.value ? answer.value : textAnswer.value)
const isActivityCompleted = computed(() => activeActivity.value?.student_status === 'completed')
const expectedTutorialAnswer = computed(() => activeActivity.value?.questions.find(question => question.answer?.trim())?.answer?.trim() ?? '')
const canonicalTutorialWord = computed(() => tutorial.value?.word ?? canonicalPreview(expectedTutorialAnswer.value))
const shouldShowTutorialStatus = computed(() => Boolean(activeActivity.value && isActivityCompleted.value && expectedTutorialAnswer.value))
const resolvedTutorialVideoUrl = computed(() => tutorialVideoUrl(tutorial.value?.video_url))
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
    hydrateSubmittedAnswers()
  }
  if (isActivityCompleted.value) {
    stop()
    submitMessage.value = `Already submitted. Score: ${scoreLabel.value}`
    await loadTutorial(false)
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
  void reset()
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
  await loadTutorial(true)
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
  if (openTutorialAfterResult.value) {
    openTutorialAfterResult.value = false
    void openTutorialModal()
  }
}

async function loadTutorial(openWhenVideoExists: boolean) {
  tutorial.value = null
  tutorialError.value = ''
  openTutorialAfterResult.value = false

  if (!expectedTutorialAnswer.value) {
    tutorialError.value = 'Tutorial not available yet.'
    return
  }

  tutorialLoading.value = true
  try {
    tutorial.value = await getTutorialStatus(expectedTutorialAnswer.value)
    openTutorialAfterResult.value = Boolean(openWhenVideoExists && tutorial.value)
    if (openTutorialAfterResult.value && !resultPopup.value) {
      openTutorialAfterResult.value = false
      await openTutorialModal()
    }
  } catch (err) {
    tutorialError.value = handsignErrorMessage(err)
  } finally {
    tutorialLoading.value = false
  }
}

async function openTutorialModal() {
  if (!tutorial.value) return
  tutorialModalOpen.value = true
  await nextTick()
  replayTutorial()
}

function closeTutorialModal() {
  tutorialModalOpen.value = false
  if (tutorialVideoRef.value) {
    tutorialVideoRef.value.pause()
  }
}

function replayTutorial() {
  const video = tutorialVideoRef.value
  if (!video) return
  video.currentTime = 0
  void video.play().catch(() => null)
}

function goToPractice() {
  closeTutorialModal()
  router.push({
    name: 'HandSignPractice',
    query: {
      activityId: activityId.value ? String(activityId.value) : undefined,
      word: canonicalTutorialWord.value,
    },
  })
}

function hydrateSubmittedAnswers() {
  const submitted = activeActivity.value?.student_answers ?? {}
  answers.value = { ...submitted }
  textAnswer.value = answers.value[String(activeQuestionIndex.value)] ?? ''
}

function canonicalPreview(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/_/g, ' ')
    .replace(/[^A-Z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+/g, '_')
}
</script>
