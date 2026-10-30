<template>
  <div class="flex h-screen flex-col overflow-hidden bg-white">
    <div class="shrink-0 border-b-[3px] border-brand-teal bg-brand-teal px-8 py-6">
      <button class="mb-4 border-[3px] border-brand-teal bg-white px-4 py-2 text-xs font-black" @click="router.push('/teacher/modules')">Back</button>
      <h1 class="font-display text-[32px] font-black text-white">{{ headerTitle }}</h1>
      <p class="mt-1 text-sm font-bold text-white/85">{{ headerDescription }}</p>
    </div>

    <div class="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[220px_1fr]">
      <aside class="border-b-[3px] border-brand-teal bg-white p-3 lg:h-full lg:overflow-y-auto lg:border-b-0 lg:border-r-[3px]">
        <div class="mb-3 font-mono text-[10px] uppercase tracking-widest text-gray-500">Student Preview</div>
        <button
          v-if="hasAutoIntro"
          :class="['mb-2 flex w-full items-center gap-2 border-[2px] border-brand-teal px-3 py-2.5 text-left text-xs font-black', isIntroActive ? 'bg-brand-blue text-white' : 'bg-white']"
         
          @click="activeTopicId = null"
        >
          <span class="h-4 w-4 rounded-full border-[2px] border-current bg-white" />
          Introduction
        </button>
        <button
          v-for="(topic, index) in topics"
          :key="topic.id"
          :class="['mb-2 flex w-full items-center gap-2 border-[2px] border-brand-teal px-3 py-2.5 text-left text-xs font-black', activeTopic?.id === topic.id ? 'bg-brand-blue text-white' : 'bg-white']"
         
          @click="activeTopicId = topic.id"
        >
          <span class="h-4 w-4 rounded-full border-[2px] border-current bg-white" />
          Topic {{ index + 1 }}
        </button>
        <div
          v-for="quiz in quizzes"
          :key="`quiz-${quiz.id}`"
          class="mb-2 flex w-full items-center gap-2 border-[2px] border-brand-teal bg-gray-50 px-3 py-2.5 text-left text-xs font-black uppercase tracking-wide opacity-70"
        >
          <span class="grid h-4 w-4 place-items-center rounded-full border-[2px] border-brand-teal text-[9px]">Q</span>
          {{ quiz.title }}
        </div>
      </aside>

      <main class="min-h-0 overflow-y-auto p-7">
        <div v-if="loading" class="border-[3px] border-brand-teal p-8 text-center font-black">Loading preview...</div>
        <div v-else-if="error" class="border-[3px] border-brand-teal bg-red-50 p-8 text-center font-black text-red-700">{{ error }}</div>
        <section v-if="!loading && !error && isPresentationProcessing" class="mb-6 overflow-hidden border-[3px] border-brand-amber bg-brand-amber/10">
          <div class="flex flex-wrap items-center justify-between gap-4 p-5">
            <div class="flex items-start gap-4">
              <div class="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full border-[3px] border-brand-teal bg-white"><span class="h-4 w-4 animate-spin rounded-full border-[3px] border-brand-teal border-t-transparent" /></div>
              <div><div class="font-mono text-[10px] font-black uppercase tracking-widest text-ink-soft">Preparing presentation</div><h2 class="mt-1 font-display text-lg font-black text-ink">Your PowerPoint slides are being generated</h2><p class="mt-1 max-w-2xl text-sm font-semibold text-ink-soft">The preview checks automatically while LibreOffice converts the file. You can keep this page open.</p></div>
            </div>
            <button class="figma-button shrink-0" type="button" @click="refreshPresentationNow">Refresh now</button>
          </div>
          <div class="grid border-t border-brand-amber/60 bg-white/60 text-xs font-bold text-ink-soft sm:grid-cols-3"><div class="border-b border-brand-amber/40 px-5 py-3 sm:border-b-0 sm:border-r">1. Reading slides</div><div class="border-b border-brand-amber/40 px-5 py-3 sm:border-b-0 sm:border-r">2. Creating preview images</div><div class="px-5 py-3">3. Opening teacher preview</div></div>
        </section>
        <section v-if="!loading && !error && checkpointBlocks.length" class="mb-6 border-[3px] border-brand-teal bg-brand-blue-soft p-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div class="font-mono text-[10px] font-black uppercase tracking-widest text-ink-soft">Formative checkpoints</div>
              <h2 class="mt-1 font-display text-lg font-black">Five questions after every 10 topics</h2>
              <p class="mt-1 max-w-3xl text-xs font-semibold text-ink-soft">Students submit each checkpoint to continue, regardless of their score. You are notified only after they complete every checkpoint in this material.</p>
            </div>
            <button class="figma-button" type="button" @click="checkpointsOpen = !checkpointsOpen">{{ checkpointsOpen ? 'Hide setup' : 'Set up checkpoints' }}</button>
          </div>
          <div v-if="checkpointsOpen" class="mt-4 grid gap-4">
            <article v-for="block in checkpointBlocks" :key="block.start" class="border-[2px] border-brand-teal bg-white p-4">
              <label class="figma-label">Topics {{ block.start }}–{{ block.end }} checkpoint title</label>
              <input v-model.trim="block.title" class="figma-input" />
              <div v-for="(question, questionIndex) in block.questions" :key="questionIndex" class="mt-3 grid gap-2 rounded border border-gray-200 p-3">
                <span class="text-xs font-black">Question {{ questionIndex + 1 }}</span>
                <input v-model.trim="question.prompt" class="figma-input" :placeholder="`Question ${questionIndex + 1} prompt`" />
                <input v-model.trim="question.answer" class="figma-input" placeholder="Correct answer" />
              </div>
            </article>
            <p v-if="checkpointError" class="status-error">{{ checkpointError }}</p>
            <div class="flex justify-end"><button class="figma-primary" type="button" :disabled="savingCheckpoints" @click="saveCheckpoints">{{ savingCheckpoints ? 'Saving…' : 'Save checkpoints' }}</button></div>
          </div>
        </section>
        <article v-if="!loading && !error && isIntroActive" class="rounded-lg border-[2px] border-gray-200 bg-white p-6 text-sm leading-7 text-gray-700">
          {{ moduleData?.description || 'Introduction content will be available here.' }}
        </article>
        <div v-else-if="!loading && !error && !activeTopic" class="border-[3px] border-brand-teal p-8 text-center">
          <h2 class="font-display text-xl font-black">No generated topics yet.</h2>
          <p class="mt-2 text-sm text-gray-500">Upload or replace the learning material file to generate student content.</p>
        </div>
        <article v-else-if="!loading && !error && !isPresentationProcessing && activeTopic" class="space-y-6">
          <section class="mx-auto max-w-6xl border-[3px] border-brand-teal bg-brand-blue-soft p-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div class="font-mono text-[10px] font-black uppercase tracking-widest text-ink-soft">Sign-language learning support</div>
                <h2 class="mt-1 font-display text-lg font-black">Add support for this topic</h2>
                <p class="mt-1 text-xs font-semibold text-ink-soft">This adds a separate lower-right video for students. It does not change the PPT slide or its content.</p>
              </div>
              <span class="badge badge-amber">{{ activeTopic.sign_videos?.length ?? 0 }} video{{ (activeTopic.sign_videos?.length ?? 0) === 1 ? '' : 's' }}</span>
            </div>
            <div class="mt-4 grid gap-3 md:grid-cols-3">
              <label><span class="figma-label">Focus area</span><select v-model="signFocusArea" class="figma-input"><option value="">Select focus area...</option><option v-for="focus in focusAreas" :key="focus.value" :value="focus.value">{{ focus.label }}</option></select></label>
              <label><span class="figma-label">Video title (optional)</span><input v-model.trim="signVideoTitle" class="figma-input" placeholder="Teacher sign explanation" /></label>
              <label><span class="figma-label">Record or upload video</span><input class="figma-input" type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" capture="user" @change="setSignVideoFile" /></label>
            </div>
            <div class="mt-3 flex flex-wrap items-center justify-between gap-3"><p v-if="signVideoError" class="status-error">{{ signVideoError }}</p><span v-else class="text-xs font-semibold text-ink-soft">Supported: Change in Matter, Photosynthesis, Force and Motion, and Water Cycle.</span><button class="figma-primary" type="button" :disabled="signVideoSaving" @click="uploadSignVideo">{{ signVideoSaving ? 'Saving…' : 'Save sign-language video' }}</button></div>
            <div v-if="activeTopic.sign_videos?.length" class="mt-4 grid gap-3 md:grid-cols-2">
              <article v-for="video in activeTopic.sign_videos" :key="video.id" class="border border-brand-teal bg-white p-3"><div class="flex items-start justify-between gap-3"><div><strong class="text-sm">{{ video.title }}</strong><p class="mt-1 text-xs font-semibold text-ink-soft">{{ focusLabel(video.focus_area) }}</p></div><button class="figma-button text-xs" type="button" @click="removeSignVideo(video.id)">Remove</button></div><video :src="assetUrl(video.video_url)" controls class="mt-3 aspect-video w-full bg-black" /></article>
            </div>
          </section>
          <!-- ===== PPTX Presentation-Card Layout ===== -->
          <template v-if="parsedPptxContent">
            <div class="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm md:p-8">
              <!-- Slide Badge -->
              <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div class="inline-block rounded-lg bg-teal-700 px-4 py-1.5 text-lg font-bold text-white shadow-sm">
                  {{ parsedPptxContent.badge || activeTopic.title }}
                </div>
                <div class="font-mono text-xs font-semibold text-slate-500">
                  Slide {{ activeIndex + 1 }} of {{ topics.length }}
                </div>
              </div>
              <!-- Content Grid -->
              <div class="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                <!-- Images (5 cols) -->
                <div
                  v-if="parsedPptxContent.image_urls?.length"
                  :class="['flex flex-col gap-3', parsedPptxContent.paragraphs?.length ? 'lg:col-span-5' : 'lg:col-span-12']"
                >
                  <div :class="parsedPptxContent.image_urls.length > 1 ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'">
                    <div
                      v-for="(imgUrl, i) in parsedPptxContent.image_urls"
                      :key="i"
                      :class="['relative flex items-center justify-center overflow-hidden rounded-xl border border-teal-100 bg-white p-2 shadow-sm', isImageHidden(imgUrl) ? 'opacity-45' : '']"
                    >
                      <button type="button" class="absolute right-3 top-3 z-10 border-2 border-brand-teal bg-white px-2 py-1 text-[10px] font-black" @click="setImageVisibility(imgUrl, !isImageHidden(imgUrl))">
                        {{ isImageHidden(imgUrl) ? 'Show to students' : 'Hide from students' }}
                      </button>
                      <img
                        :src="assetUrl(imgUrl)"
                        alt="Slide graphic"
                        class="max-h-[350px] w-full rounded-lg object-contain md:max-h-[420px]"
                      />
                    </div>
                  </div>
                </div>
                <!-- Text (7 cols) -->
                <div
                  :class="['flex flex-col gap-4', parsedPptxContent.image_urls?.length ? 'lg:col-span-7' : 'lg:col-span-12']"
                >
                  <div
                    v-for="(para, i) in parsedPptxContent.paragraphs"
                    :key="i"
                    class="rounded-xl border border-teal-100 border-l-4 border-l-teal-600 bg-white p-4 text-sm leading-relaxed text-slate-800 shadow-sm md:p-5 md:text-base"
                  >
                    {{ para }}
                  </div>
                  <div
                    v-if="!parsedPptxContent.paragraphs?.length"
                    class="rounded-xl border border-teal-100 bg-white p-6 text-center text-sm italic text-slate-500 shadow-sm"
                  >
                    No text content on this slide.
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- ===== Default Layout (PDF page images / plain text) ===== -->
          <template v-else>
            <div class="mx-auto max-w-6xl space-y-4">
              <div>
                <h2 class="font-display text-2xl font-black">{{ activeTopic.title }}</h2>
                <p class="mt-1 text-sm text-gray-500">{{ activeTopic.description }}</p>
              </div>
              <div v-if="activeTopic.page_image_urls?.length" class="mx-auto grid max-w-4xl gap-6">
                <div
                  v-for="(pageUrl, index) in activeTopic.page_image_urls"
                  :key="`${activeTopic.id}-${index}`"
                  :class="['relative', isImageHidden(pageUrl) ? 'opacity-45' : '']"
                >
                  <button type="button" class="absolute right-3 top-3 z-10 border-2 border-brand-teal bg-white px-2 py-1 text-[10px] font-black" @click="setImageVisibility(pageUrl, !isImageHidden(pageUrl))">
                    {{ isImageHidden(pageUrl) ? 'Show to students' : 'Hide from students' }}
                  </button>
                  <img :src="assetUrl(pageUrl)" alt="" class="w-full rounded-lg border border-slate-200 bg-white shadow-sm" />
                </div>
              </div>
              <div v-else class="whitespace-pre-line rounded-lg border-[2px] border-gray-200 bg-white p-5 text-sm leading-7 text-gray-700">
                {{ activeTopic.content }}
              </div>
            </div>
          </template>

          <!-- Navigation controls -->
          <div class="mx-auto flex max-w-6xl items-center justify-between pt-2">
            <button
              class="border-[3px] border-brand-teal bg-white px-4 py-2.5 text-xs font-black text-ink shadow-[2px_2px_0_#000] transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] sm:px-5 sm:text-sm"
              @click="goPrevious"
            >
              Previous
            </button>
            <span class="font-mono text-xs font-bold text-slate-500">
              Topic {{ activeIndex + 1 }} of {{ topics.length }}
            </span>
            <button
              class="border-[3px] border-brand-teal bg-brand-blue px-4 py-2.5 text-xs font-black text-white shadow-[2px_2px_0_#000] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] sm:px-5 sm:text-sm"
              @click="goNext"
            >
              {{ activeIndex === topics.length - 1 ? 'Last Topic' : 'Next Topic' }}
            </button>
          </div>
        </article>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_BASE_URL, apiFetch } from '@/lib/api'

interface Topic {
  id: number
  title: string
  description?: string | null
  content: string
  page_image_urls: string[]
  hidden_image_urls?: string[]
  sort_order: number
  sign_videos?: Array<{ id: number; focus_area: string; title: string; video_url: string }>
}

interface ModuleDetail {
  id: number
  title: string
  description: string
  content_type?: string | null
  file_name?: string | null
  file_type?: string | null
  material_processing_status?: string
  topics: Topic[]
  checkpoints: Array<{
    id: number
    start_sort_order: number
    end_sort_order: number
    title: string
    questions: Array<{ prompt: string; answer?: string | null; question_type?: string; options?: string[] }>
  }>
  assessments: Array<{ id: number; assessment_type: string; title: string; description: string }>
}

const route = useRoute()
const router = useRouter()
const moduleData = ref<ModuleDetail | null>(null)
const activeTopicId = ref<number | null>(null)
const loading = ref(false)
const error = ref('')
const checkpointsOpen = ref(false)
const savingCheckpoints = ref(false)
const checkpointError = ref('')
const checkpointBlocks = ref<Array<{ start: number; end: number; title: string; questions: Array<{ prompt: string; answer: string }> }>>([])
const signFocusArea = ref('')
const signVideoTitle = ref('')
const signVideoFile = ref<File | null>(null)
const signVideoSaving = ref(false)
const signVideoError = ref('')
let presentationRefreshTimer: number | null = null
let presentationRefreshAttempts = 0
let presentationRefreshInFlight = false
const presentationRefreshLimit = 24

const focusAreas = [
  { value: 'change_in_matter', label: 'Change in Matter' },
  { value: 'photosynthesis', label: 'Plant Processes / Photosynthesis' },
  { value: 'force_and_motion', label: 'Force and Motion' },
  { value: 'water_cycle', label: 'Water Cycle' },
]

const SLIDE_MARKER = /^-{2,}\s*Slide\s*\d+\s*-{2,}$/i
const topics = computed(() => {
  const seen = new Set<string>()
  return [...(moduleData.value?.topics ?? [])]
    .filter(t => {
      if (SLIDE_MARKER.test(t.title ?? '')) return false
      if (t.title.toLowerCase() === 'introduction') return false
      const key = (t.title ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => a.sort_order - b.sort_order)
})
const hasAutoIntro = computed(() => !isPagedMaterial(moduleData.value?.content_type))
const quizzes = computed(() => (moduleData.value?.assessments ?? []).filter(item => item.assessment_type === 'quiz'))
const activeTopic = computed(() => activeTopicId.value ? topics.value.find(topic => topic.id === activeTopicId.value) ?? null : null)
const activeIndex = computed(() => activeTopic.value ? topics.value.findIndex(t => t.id === activeTopic.value?.id) : 0)
const isIntroActive = computed(() => hasAutoIntro.value && !activeTopicId.value)
const headerTitle = computed(() => activeTopic.value?.title || moduleData.value?.title || 'Module Preview')
const headerDescription = computed(() => activeTopic.value?.description || moduleData.value?.description || '')
const isPresentationProcessing = computed(() => {
  const module = moduleData.value
  if (!module) return false
  if (module.material_processing_status === 'processing') return true
  const isPresentation = /\.(ppt|pptx)$/i.test(module.file_name ?? '')
    || /presentation|powerpoint/i.test(module.file_type ?? '')
    || /pptx?/i.test(module.content_type ?? '')
  const hasPresentationTopic = (module.topics ?? []).some(topic =>
    (topic.page_image_urls ?? []).some(url => /\/static\/presentation_slides\/.*\.png$/i.test(url))
    || isStructuredPptxTopic(topic.content)
  )
  return isPresentation && !hasPresentationTopic
})

// Parse PPTX JSON slide content — same logic as TopicViewerPage
const parsedPptxContent = computed(() => {
  if (!activeTopic.value) return null
  try {
    const parsed = JSON.parse(activeTopic.value.content ?? '')
    if (parsed?.type === 'pptx_slide') return parsed as { badge: string; paragraphs: string[]; image_urls: string[] }
  } catch {}
  return null
})

onMounted(async () => {
  loading.value = true
  try {
    moduleData.value = await apiFetch<ModuleDetail>(`/teacher/modules/${route.params.moduleId}`)
    activeTopicId.value = hasAutoIntro.value ? null : topics.value[0]?.id ?? null
    hydrateCheckpoints()
    startPresentationRefresh()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load preview.'
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => stopPresentationRefresh())

watch(isPresentationProcessing, processing => {
  if (processing) startPresentationRefresh()
  else {
    stopPresentationRefresh()
    if (!activeTopicId.value && topics.value.length) activeTopicId.value = topics.value[0].id
  }
})

function startPresentationRefresh() {
  if (!isPresentationProcessing.value || presentationRefreshTimer !== null) return
  presentationRefreshAttempts = 0
  presentationRefreshTimer = window.setInterval(async () => {
    if (presentationRefreshInFlight || document.visibilityState !== 'visible') return
    presentationRefreshInFlight = true
    try {
      const previousTopicId = activeTopicId.value
      moduleData.value = await apiFetch<ModuleDetail>(`/teacher/modules/${route.params.moduleId}`)
      if (previousTopicId && topics.value.some(topic => topic.id === previousTopicId)) activeTopicId.value = previousTopicId
      presentationRefreshAttempts += 1
    } catch {
      // Keep the existing preview visible; the next refresh can recover from a transient request error.
    } finally {
      presentationRefreshInFlight = false
    }
    if (!isPresentationProcessing.value || presentationRefreshAttempts >= presentationRefreshLimit) {
      stopPresentationRefresh()
      if (!activeTopicId.value && topics.value.length) activeTopicId.value = topics.value[0].id
    }
  }, 5000)
}

function stopPresentationRefresh() {
  if (presentationRefreshTimer !== null) {
    window.clearInterval(presentationRefreshTimer)
    presentationRefreshTimer = null
  }
  presentationRefreshInFlight = false
}

async function refreshPresentationNow() {
  if (presentationRefreshInFlight) return
  presentationRefreshInFlight = true
  try {
    moduleData.value = await apiFetch<ModuleDetail>(`/teacher/modules/${route.params.moduleId}`)
    if (!isPresentationProcessing.value && !activeTopicId.value && topics.value.length) activeTopicId.value = topics.value[0].id
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to refresh the presentation preview.'
  } finally { presentationRefreshInFlight = false }
}

function isStructuredPptxTopic(content?: string | null) {
  try { return JSON.parse(content ?? '').type === 'pptx_slide' } catch { return false }
}

function assetUrl(url?: string | null) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API_BASE_URL}${url}`
}

function isImageHidden(url: string) {
  return Boolean(activeTopic.value?.hidden_image_urls?.includes(url))
}

async function setImageVisibility(imageUrl: string, hidden: boolean) {
  if (!activeTopic.value) return
  try {
    const updated = await apiFetch<Topic>(`/teacher/modules/${route.params.moduleId}/topics/${activeTopic.value.id}/image-visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ image_url: imageUrl, hidden }),
    })
    const index = moduleData.value?.topics.findIndex(topic => topic.id === updated.id) ?? -1
    if (moduleData.value && index >= 0) moduleData.value.topics[index] = { ...moduleData.value.topics[index], ...updated }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to update image visibility.'
  }
}

function focusLabel(value: string) { return focusAreas.find(item => item.value === value)?.label ?? value }
function setSignVideoFile(event: Event) { signVideoFile.value = (event.target as HTMLInputElement).files?.[0] ?? null }

async function uploadSignVideo() {
  if (!activeTopic.value || !signFocusArea.value || !signVideoFile.value) {
    signVideoError.value = 'Choose a focus area and a sign-language video first.'
    return
  }
  signVideoError.value = ''
  signVideoSaving.value = true
  try {
    const form = new FormData()
    form.append('focus_area', signFocusArea.value)
    if (signVideoTitle.value) form.append('title', signVideoTitle.value)
    form.append('video', signVideoFile.value)
    const response = await fetch(`${API_BASE_URL}/teacher/modules/${route.params.moduleId}/topics/${activeTopic.value.id}/sign-videos`, {
      method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}` }, body: form,
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload.detail || 'Unable to save the sign-language video.')
    const current = activeTopic.value.sign_videos ?? []
    activeTopic.value.sign_videos = [...current.filter(video => video.focus_area !== payload.focus_area), payload]
    signVideoTitle.value = ''
    signVideoFile.value = null
  } catch (err) {
    signVideoError.value = err instanceof Error ? err.message : 'Unable to save the sign-language video.'
  } finally { signVideoSaving.value = false }
}

async function removeSignVideo(signVideoId: number) {
  if (!activeTopic.value || !confirm('Remove this sign-language video?')) return
  signVideoError.value = ''
  try {
    await apiFetch(`/teacher/modules/${route.params.moduleId}/topics/${activeTopic.value.id}/sign-videos/${signVideoId}`, { method: 'DELETE' })
    activeTopic.value.sign_videos = (activeTopic.value.sign_videos ?? []).filter(video => video.id !== signVideoId)
  } catch (err) { signVideoError.value = err instanceof Error ? err.message : 'Unable to remove the sign-language video.' }
}

function hydrateCheckpoints() {
  const existing = new Map((moduleData.value?.checkpoints ?? []).map(item => [item.start_sort_order, item]))
  const highestTopic = Math.max(0, ...topics.value.map(topic => topic.sort_order))
  checkpointBlocks.value = Array.from({ length: Math.floor(highestTopic / 10) }, (_, index) => {
    const start = index * 10 + 1
    const end = start + 9
    const saved = existing.get(start)
    return {
      start,
      end,
      title: saved?.title ?? `Topics ${start}–${end} Checkpoint`,
      questions: Array.from({ length: 5 }, (_, questionIndex) => ({
        prompt: saved?.questions[questionIndex]?.prompt ?? '',
        answer: saved?.questions[questionIndex]?.answer ?? '',
      })),
    }
  })
}

async function saveCheckpoints() {
  checkpointError.value = ''
  if (checkpointBlocks.value.some(block => !block.title || block.questions.some(question => !question.prompt || !question.answer))) {
    checkpointError.value = 'Each checkpoint needs a title and five complete questions with correct answers.'
    return
  }
  savingCheckpoints.value = true
  try {
    await apiFetch(`/teacher/modules/${route.params.moduleId}/checkpoints`, {
      method: 'PUT',
      body: JSON.stringify(checkpointBlocks.value.map(block => ({
        start_sort_order: block.start,
        end_sort_order: block.end,
        title: block.title,
        questions: block.questions.map(question => ({ prompt: question.prompt, answer: question.answer, question_type: 'identification', options: [] })),
      }))),
    })
    moduleData.value = await apiFetch<ModuleDetail>(`/teacher/modules/${route.params.moduleId}`)
    hydrateCheckpoints()
    checkpointsOpen.value = false
  } catch (err) {
    checkpointError.value = err instanceof Error ? err.message : 'Unable to save checkpoints.'
  } finally {
    savingCheckpoints.value = false
  }
}

function isPagedMaterial(contentType?: string | null) {
  // Only PDF uses page-image rendering (no auto-intro tab).
  // PPTX/PPT uses the structured slide card layout.
  return contentType === 'PDF'
}

function goPrevious() {
  if (activeIndex.value <= 0) {
    if (hasAutoIntro.value) activeTopicId.value = null
    return
  }
  activeTopicId.value = topics.value[activeIndex.value - 1]?.id ?? null
}

function goNext() {
  if (isIntroActive.value) {
    activeTopicId.value = topics.value[0]?.id ?? null
    return
  }
  if (activeIndex.value < topics.value.length - 1) {
    activeTopicId.value = topics.value[activeIndex.value + 1]?.id ?? null
  }
}
</script>
