<template>
  <div class="min-h-screen bg-surface p-4 sm:p-7">
    <div class="mx-auto max-w-5xl">
      <button class="figma-button" @click="router.push('/student/activities')">Back to activities</button>
      <div v-if="loading" class="mt-5 card p-8 text-center font-bold">Loading support activity...</div>
      <div v-else-if="error" class="mt-5 status-error">{{ error }}</div>

      <template v-else-if="activity">
        <header class="mt-5 border-[3px] border-brand-teal bg-brand-amber p-5">
          <div class="font-mono text-[10px] font-black uppercase tracking-widest">Targeted Learning Support</div>
          <h1 class="mt-1 font-display text-2xl font-black">{{ activity.activity_title }}</h1>
          <p class="mt-2 text-sm font-semibold">{{ activity.activity_description }}</p>
          <p class="mt-2 text-xs font-bold text-ink-soft">Assigned review: Topics {{ activity.start_sort_order }}-{{ activity.end_sort_order }}<span v-if="activity.is_late"> · Submitted work will be marked late</span></p>
        </header>

        <section v-if="step === 'review'" class="mt-5 space-y-5">
          <article v-if="activeTopic" class="card p-5">
            <div class="mb-4 flex justify-between gap-3"><h2 class="font-display text-xl font-bold">{{ activeTopic.title }}</h2><span class="text-xs font-bold text-ink-soft">Topic {{ topicIndex + 1 }} of {{ activity.topics.length }}</span></div>
            <div v-if="activeTopic.page_image_urls?.length" class="grid gap-4"><img v-for="url in activeTopic.page_image_urls" :key="url" :src="assetUrl(url)" class="w-full rounded border" /></div>
            <p v-else class="whitespace-pre-line text-sm leading-7">{{ activeTopic.content }}</p>
            <div class="mt-5 flex justify-between gap-2"><button class="figma-button" :disabled="topicIndex === 0" @click="topicIndex--">Previous</button><button class="figma-primary" @click="nextTopic">{{ topicIndex === activity.topics.length - 1 ? 'Go to activity' : 'Next topic' }}</button></div>
          </article>
          <article v-else class="card p-5"><p class="text-sm">No review topics are available.</p><button class="figma-primary mt-4" @click="step = 'questions'">Go to activity</button></article>
        </section>

        <section v-else-if="activeQuestion" class="mt-5 space-y-4">
          <article class="card p-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div><p class="eyebrow">Signed question</p><h2 class="font-display text-xl font-bold">Question {{ questionIndex + 1 }} of {{ activity.questions.length }}</h2></div>
              <span class="badge badge-blue">One question at a time</span>
            </div>

            <video v-if="activeQuestion.sign_video_url" :src="assetUrl(activeQuestion.sign_video_url)" class="mt-4 aspect-video w-full rounded border bg-black object-contain" autoplay muted controls playsinline />
            <p v-else class="status-error mt-4">The teacher's signed question video is not available yet.</p>

            <div class="mt-5 grid gap-5 lg:grid-cols-2">
              <section class="overflow-hidden rounded border border-brand-teal/30 bg-white">
                <div class="flex items-center justify-between border-b border-brand-teal/20 px-4 py-3">
                  <p class="figma-label">Word gesture camera</p>
                  <span class="text-xs font-semibold text-ink-soft">{{ cameraOn ? 'Ready' : 'Camera off' }}</span>
                </div>
                <div class="relative aspect-video bg-black">
                  <video ref="wordVideoRef" class="h-full w-full -scale-x-100 object-cover" autoplay muted playsinline />
                  <canvas ref="wordCanvasRef" hidden />
                  <button v-if="!cameraOn" class="figma-primary absolute inset-0 m-auto h-fit" type="button" @click="startWordCamera">Start word-sign camera</button>
                  <div v-if="capturing" class="absolute inset-x-0 bottom-0 bg-black/70 px-3 py-2 text-center text-xs font-bold text-white">Capturing your complete sign: {{ captureProgress }}%</div>
                </div>
                <div class="flex justify-end p-3"><button class="figma-button" type="button" :disabled="!cameraOn || capturing" @click="stopWordCamera">Stop camera</button></div>
              </section>
              <section class="rounded border border-brand-teal/30 bg-brand-blue-soft/30 p-4">
                <p class="figma-label">Your word-sign answer</p>
                <p class="min-h-12 rounded border border-brand-teal/30 bg-white px-3 py-3 text-lg font-bold">{{ capturing ? 'Capturing your complete sign…' : 'Make the full sign shown in the question video.' }}</p>
                <p class="mt-2 text-xs font-semibold text-ink-soft">This checks your whole word gesture against the Admin Word Gesture dataset—not alphabet letters. Your answer is recorded even when it is not correct.</p>
                <div class="mt-4 flex flex-wrap gap-2">
                  <button class="figma-primary" type="button" :disabled="!cameraOn || checking || capturing" @click="checkCurrentAnswer">{{ checking ? 'Checking word sign...' : 'Record and check my word sign' }}</button>
                </div>
                <p v-if="currentCheck" :class="currentCheck.correct ? 'status-success' : 'status-error'" class="mt-4">
                  {{ currentCheck.correct ? 'Correct sign! Your answer has been recorded.' : "That word sign isn't correct. Your answer has still been recorded; you may continue." }}
                </p>
              </section>
            </div>
          </article>

          <div v-if="result" class="status-success">Submitted: {{ result.score }} correct answer{{ result.score === 1 ? '' : 's' }} / {{ result.total }}.</div>
          <div class="flex flex-wrap justify-between gap-2">
            <button class="figma-button" :disabled="questionIndex === 0" @click="goToQuestion(questionIndex - 1)">Previous question</button>
            <button v-if="questionIndex < activity.questions.length - 1" class="figma-primary" :disabled="!currentCheck" @click="goToQuestion(questionIndex + 1)">Next question</button>
            <button v-else class="figma-primary" :disabled="saving || Boolean(result) || !allQuestionsChecked" @click="submit">{{ saving ? 'Submitting...' : result ? 'Completed' : 'Submit activity' }}</button>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_BASE_URL, apiFetch } from '@/lib/api'

interface Topic { id: number; title: string; content: string; page_image_urls?: string[] }
interface SupportQuestion { prompt_type?: 'text' | 'sign_video'; sign_video_url?: string | null }
interface Activity { activity_title: string; activity_description: string; start_sort_order: number; end_sort_order: number; status: string; score?: number | null; total?: number | null; is_late: boolean; topics: Topic[]; questions: SupportQuestion[] }

const route = useRoute()
const router = useRouter()
const activity = ref<Activity | null>(null)
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const checking = ref(false)
const step = ref<'review' | 'questions'>('review')
const topicIndex = ref(0)
const questionIndex = ref(0)
const answers = ref<Record<string, string>>({})
const checks = ref<Record<string, { correct: boolean }>>({})
const result = ref<{ score: number; total: number } | null>(null)
const wordVideoRef = ref<HTMLVideoElement | null>(null)
const wordCanvasRef = ref<HTMLCanvasElement | null>(null)
const cameraOn = ref(false)
const capturing = ref(false)
const captureProgress = ref(0)
let wordStream: MediaStream | null = null
const activeTopic = computed(() => activity.value?.topics[topicIndex.value] ?? null)
const activeQuestion = computed(() => activity.value?.questions[questionIndex.value] ?? null)
const currentCheck = computed(() => checks.value[String(questionIndex.value)] ?? null)
const allQuestionsChecked = computed(() => {
  const currentActivity = activity.value
  if (!currentActivity) return false
  return currentActivity.questions.every((_, index) => Boolean(checks.value[String(index)]))
})
onMounted(async () => {
  try {
    const loaded = await apiFetch<Activity>(`/student/remediation-activities/${route.params.targetId}`)
    activity.value = loaded
    if (loaded.status === 'completed') result.value = { score: loaded.score ?? 0, total: loaded.total ?? 0 }
  } catch (err) { error.value = err instanceof Error ? err.message : 'Unable to load support activity.' }
  finally { loading.value = false }
})

onBeforeUnmount(stopWordCamera)

function assetUrl(url?: string | null) { return !url || url.startsWith('http') ? url ?? '' : `${API_BASE_URL}${url}` }
function nextTopic() { if (!activity.value || topicIndex.value >= activity.value.topics.length - 1) step.value = 'questions'; else topicIndex.value++ }
async function goToQuestion(index: number) { questionIndex.value = index }
async function startWordCamera() {
  if (cameraOn.value) return
  error.value = ''
  try {
    wordStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
    if (!wordVideoRef.value) throw new Error('Camera preview is not ready.')
    wordVideoRef.value.srcObject = wordStream
    await wordVideoRef.value.play()
    cameraOn.value = true
  } catch {
    error.value = 'Camera permission is required to record your word sign.'
    stopWordCamera()
  }
}
function stopWordCamera() {
  wordStream?.getTracks().forEach(track => track.stop())
  wordStream = null
  cameraOn.value = false
  if (wordVideoRef.value) wordVideoRef.value.srcObject = null
}
async function checkCurrentAnswer() {
  checking.value = true
  capturing.value = true
  captureProgress.value = 0
  error.value = ''
  try {
    const images = await captureWordFrames()
    const checked = await apiFetch<{ correct: boolean }>(`/student/remediation-activities/${route.params.targetId}/questions/${questionIndex.value}/word-check`, { method: 'POST', body: JSON.stringify({ images }) })
    answers.value = { ...answers.value, [String(questionIndex.value)]: checked.correct ? '__WORD_GESTURE_CORRECT__' : '__WORD_GESTURE_INCORRECT__' }
    checks.value = { ...checks.value, [String(questionIndex.value)]: checked }
  } catch (err) { error.value = err instanceof Error ? err.message : 'Unable to check your signed answer.' }
  finally { checking.value = false; capturing.value = false; captureProgress.value = 0 }
}
async function captureWordFrames() {
  const images: string[] = []
  const targetFrames = 40
  while (images.length < targetFrames) {
    const image = captureFrameDataUrl()
    if (image) images.push(image)
    captureProgress.value = Math.round((images.length / targetFrames) * 100)
    await new Promise(resolve => window.setTimeout(resolve, 100))
  }
  return images
}
function captureFrameDataUrl() {
  const video = wordVideoRef.value
  const canvas = wordCanvasRef.value
  if (!video || !canvas || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return null
  const scale = Math.min(1, 640 / video.videoWidth)
  canvas.width = Math.round(video.videoWidth * scale)
  canvas.height = Math.round(video.videoHeight * scale)
  const context = canvas.getContext('2d')
  if (!context) return null
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.72)
}
async function submit() {
  if (!activity.value || !allQuestionsChecked.value) return
  saving.value = true
  try { result.value = await apiFetch<{ score: number; total: number }>(`/student/remediation-activities/${route.params.targetId}/submit`, { method: 'POST', body: JSON.stringify({ answers: answers.value }) }) }
  catch (err) { error.value = err instanceof Error ? err.message : 'Unable to submit activity.' }
  finally { saving.value = false }
}
</script>
