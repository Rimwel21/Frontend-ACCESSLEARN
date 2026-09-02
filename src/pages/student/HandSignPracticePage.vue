<template>
  <div class="min-h-screen bg-white">
    <div class="border-b-[3px] border-brand-teal bg-brand-blue px-8 py-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="font-display text-[28px] font-black text-white">Learn the Sign for {{ targetWordLabel }}</h1>
          <p class="font-mono text-[11px] font-bold uppercase tracking-widest text-white">Handsign Practice</p>
        </div>
        <button
          type="button"
          class="border-[3px] border-brand-teal bg-white px-4 py-2 text-xs font-black"
          @click="goBack"
        >
          Back
        </button>
      </div>
    </div>

    <div class="grid gap-5 px-7 py-6 xl:grid-cols-[minmax(0,1fr)_330px]">
      <main class="space-y-5">
        <section class="border-[3px] border-brand-teal bg-brand-amber p-5">
          <div class="font-mono text-[10px] font-black uppercase tracking-widest">Word Practice</div>
          <h2 class="mt-2 font-display text-xl font-black">Try signing: {{ targetWordLabel }}</h2>
          <p class="mt-2 text-sm font-bold text-gray-700">
            Complete three attempts. The highest score will be saved as your practice result.
          </p>
        </section>

        <section v-if="loading" class="border-[3px] border-brand-teal bg-white p-5 text-sm font-black">
          Checking practice availability...
        </section>

        <section v-else-if="loadError" class="border-[3px] border-brand-rose bg-brand-rose/10 p-5 text-sm font-black text-red-700">
          {{ loadError }}
        </section>

        <section v-else-if="tutorial && !tutorial.can_practice" class="border-[3px] border-brand-teal bg-white p-5">
          <h2 class="font-display text-lg font-black">Practice recognition not available yet</h2>
          <p class="mt-2 text-sm font-bold text-gray-700">
            {{ tutorial.word }} is not trained in the word-recognition model yet.
          </p>
        </section>

        <section v-else class="border-[3px] border-brand-teal bg-white">
          <div class="border-b-[3px] border-brand-teal bg-brand-blue px-4 py-3">
            <h2 class="font-display text-sm font-black uppercase tracking-widest text-white">Camera / Sign Recognition Area</h2>
          </div>

          <div class="space-y-4 p-4">
            <div class="relative mx-auto aspect-[4/3] w-full max-w-[860px] overflow-hidden border-[3px] border-brand-teal bg-gray-100">
              <video ref="practiceVideoRef" class="h-full w-full -scale-x-100 object-cover" muted playsinline aria-label="Live word sign practice camera feed"></video>
              <canvas ref="practiceCanvasRef" hidden></canvas>

              <div v-if="!cameraOn" class="absolute inset-0 grid place-items-center bg-white/90 p-6 text-center">
                <button class="border-[3px] border-brand-teal bg-brand-amber px-5 py-3 text-xs font-black" type="button" @click="startCamera">
                  Start Practice Camera
                </button>
              </div>

              <div v-if="practiceBusy" class="absolute left-0 top-0 h-2 bg-[#22C55E]" :style="{ width: `${captureProgress}%` }"></div>
              <div v-if="practiceBusy" class="absolute left-3 top-3 border-[3px] border-brand-teal bg-white px-3 py-2 font-mono text-[10px] font-black uppercase">
                Capturing {{ captureProgress }}%
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="border-[3px] border-brand-teal bg-brand-amber px-4 py-2 text-xs font-black disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="cameraOn || practiceBusy"
                @click="startCamera"
              >
                Start Camera
              </button>
              <button
                type="button"
                class="border-[3px] border-brand-teal bg-white px-4 py-2 text-xs font-black disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="!cameraOn || practiceBusy"
                @click="stopCamera"
              >
                Stop Camera
              </button>
            </div>

            <p class="border-[3px] border-brand-teal bg-brand-blue-soft px-3 py-2 text-xs font-black">
              Recognized: {{ recognizedLabel }}
            </p>
            <p v-if="practiceMessage" class="border-[3px] border-brand-teal bg-brand-blue-soft px-3 py-2 text-xs font-black">
              {{ practiceMessage }}
            </p>
            <p v-if="practiceError" class="border-[3px] border-brand-rose bg-brand-rose/10 px-3 py-2 text-xs font-black text-red-700">
              {{ practiceError }}
            </p>
          </div>
        </section>
      </main>

      <aside class="h-fit border-[3px] border-brand-teal bg-white p-5">
        <div class="font-mono text-[10px] font-black uppercase tracking-widest text-ink-soft">Practice Attempts</div>
        <h2 class="mt-1 font-display text-lg font-black">Best of 3</h2>

        <div class="mt-4 space-y-3">
          <div
            v-for="(_, index) in attemptScores"
            :key="index"
            class="border-[3px] border-brand-teal bg-surface p-3"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="font-mono text-[10px] font-black uppercase tracking-widest text-ink-soft">Attempt {{ index + 1 }}</div>
                <div class="mt-1 text-sm font-black">{{ attemptScores[index] === null ? 'Not started' : `${attemptScores[index]}%` }}</div>
              </div>
              <button
                type="button"
                class="border-[3px] border-brand-teal bg-white px-3 py-2 text-xs font-black disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="!canRunAttempt(index)"
                @click="runPracticeAttempt(index)"
              >
                {{ index === nextAttemptIndex ? 'Run' : 'Wait' }}
              </button>
            </div>
          </div>
        </div>

        <div class="mt-4 border-[3px] border-brand-teal bg-white p-3">
          <div class="font-mono text-[10px] font-black uppercase tracking-widest text-ink-soft">Highest score</div>
          <div class="mt-1 font-display text-2xl font-black">{{ bestPracticeScore === null ? '-' : `${bestPracticeScore}%` }}</div>
        </div>

        <button
          type="button"
          class="mt-4 w-full border-[3px] border-brand-teal bg-brand-blue px-4 py-2.5 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!allAttemptsComplete || practiceSaving || Boolean(practiceResult)"
          @click="savePractice"
        >
          {{ practiceResult ? 'Practice Saved' : practiceSaving ? 'Saving...' : 'Save Practice Result' }}
        </button>

        <p v-if="practiceResult" class="mt-3 border-[3px] border-brand-teal bg-green-100 px-3 py-2 text-xs font-black">
          Practice saved. Best score: {{ practiceResult.highest_score }}%.
        </p>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getTutorialStatus,
  handsignErrorMessage,
  saveTutorialPracticeResult,
  scoreWordPracticeFrames,
} from '@/services/handsign'
import type { PracticeResultOut, TutorialStatus } from '@/types/handsign'

const route = useRoute()
const router = useRouter()

const tutorial = ref<TutorialStatus | null>(null)
const loading = ref(false)
const loadError = ref('')
const practiceVideoRef = ref<HTMLVideoElement | null>(null)
const practiceCanvasRef = ref<HTMLCanvasElement | null>(null)
const cameraOn = ref(false)
const practiceBusy = ref(false)
const practiceMessage = ref('')
const practiceError = ref('')
const captureProgress = ref(0)
const attemptScores = ref<(number | null)[]>([null, null, null])
const practiceSaving = ref(false)
const practiceResult = ref<PracticeResultOut | null>(null)
const recognizedWord = ref('')
let stream: MediaStream | null = null

const targetWord = computed(() => String(route.query.word || '').trim())
const targetWordLabel = computed(() => tutorial.value?.word || canonicalPreview(targetWord.value) || 'SIGN')
const activityId = computed(() => route.query.activityId ? Number(route.query.activityId) : null)
const nextAttemptIndex = computed(() => attemptScores.value.findIndex(score => score === null))
const allAttemptsComplete = computed(() => attemptScores.value.every((score): score is number => typeof score === 'number'))
const bestPracticeScore = computed(() => {
  const scores = attemptScores.value.filter((score): score is number => typeof score === 'number')
  return scores.length ? Math.max(...scores) : null
})
const recognizedLabel = computed(() => recognizedWord.value || 'Waiting for attempt')

onMounted(async () => {
  await loadTutorial()
  if (tutorial.value?.can_practice) {
    await nextTick()
    await startCamera()
  }
})

onBeforeUnmount(() => {
  stopCamera()
})

async function loadTutorial() {
  if (!targetWord.value) {
    loadError.value = 'Practice word is missing.'
    return
  }

  loading.value = true
  loadError.value = ''
  try {
    tutorial.value = await getTutorialStatus(targetWord.value)
  } catch (err) {
    loadError.value = handsignErrorMessage(err)
  } finally {
    loading.value = false
  }
}

async function startCamera() {
  if (cameraOn.value || !tutorial.value?.can_practice) return
  try {
    practiceError.value = ''
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user',
      },
      audio: false,
    })
    if (!practiceVideoRef.value) {
      stopCamera()
      practiceError.value = 'Practice camera is not ready yet. Please try again.'
      return
    }
    practiceVideoRef.value.srcObject = stream
    await practiceVideoRef.value.play()
    cameraOn.value = true
    practiceMessage.value = 'Practice camera is ready.'
  } catch {
    practiceError.value = 'Camera permission is required for word practice.'
    stopCamera()
  }
}

function stopCamera() {
  stream?.getTracks().forEach(track => track.stop())
  stream = null
  cameraOn.value = false
  if (practiceVideoRef.value) practiceVideoRef.value.srcObject = null
}

function canRunAttempt(index: number) {
  return Boolean(tutorial.value?.can_practice)
    && !practiceBusy.value
    && !practiceResult.value
    && index === nextAttemptIndex.value
}

async function runPracticeAttempt(index: number) {
  if (!tutorial.value?.can_practice || !canRunAttempt(index)) return
  practiceError.value = ''
  practiceBusy.value = true
  captureProgress.value = 0

  try {
    if (!cameraOn.value) {
      await startCamera()
    }
    if (!cameraOn.value) return

    practiceMessage.value = `Attempt ${index + 1}: get ready.`
    await wait(900)
    const images = await captureAttemptFrames()
    practiceMessage.value = `Attempt ${index + 1}: scoring your sign.`
    const score = await scoreWordPracticeFrames(tutorial.value.word, images)
    attemptScores.value[index] = score.score
    recognizedWord.value = score.score > 0 ? score.target_word : ''
    practiceMessage.value = `Attempt ${index + 1} score: ${score.score}%.`

    if (allAttemptsComplete.value) {
      await savePractice()
    }
  } catch (err) {
    practiceError.value = handsignErrorMessage(err)
  } finally {
    practiceBusy.value = false
    captureProgress.value = 0
  }
}

async function captureAttemptFrames() {
  const images: string[] = []
  const targetFrames = 40
  const delayMs = 100

  while (images.length < targetFrames) {
    const image = captureFrameDataUrl()
    if (image) images.push(image)
    captureProgress.value = Math.round((images.length / targetFrames) * 100)
    practiceMessage.value = `Capturing attempt frames: ${images.length}/${targetFrames}`
    await wait(delayMs)
  }

  return images
}

function captureFrameDataUrl() {
  const video = practiceVideoRef.value
  const canvas = practiceCanvasRef.value
  if (!video || !canvas || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return null

  const maxWidth = 640
  const scale = Math.min(1, maxWidth / video.videoWidth)
  canvas.width = Math.round(video.videoWidth * scale)
  canvas.height = Math.round(video.videoHeight * scale)
  const context = canvas.getContext('2d')
  if (!context) return null
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.72)
}

async function savePractice() {
  if (!activityId.value || !tutorial.value || !allAttemptsComplete.value) return
  practiceSaving.value = true
  practiceError.value = ''
  try {
    const scores = attemptScores.value.filter((score): score is number => typeof score === 'number')
    practiceResult.value = await saveTutorialPracticeResult(activityId.value, tutorial.value.word, scores)
    practiceMessage.value = `Practice saved. Highest score: ${practiceResult.value.highest_score}%.`
  } catch (err) {
    practiceError.value = handsignErrorMessage(err)
  } finally {
    practiceSaving.value = false
  }
}

function goBack() {
  router.push({
    name: 'HandSignLanguage',
    query: activityId.value ? { activityId: String(activityId.value) } : undefined,
  })
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

function wait(ms: number) {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}
</script>
