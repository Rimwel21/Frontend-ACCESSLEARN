<template>
  <div class="flex h-screen overflow-hidden bg-white">
    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-20 bg-black/40 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'flex flex-col border-r-[3px] border-brand-teal bg-white transition-transform duration-300 z-30',
        'fixed inset-y-0 left-0 w-[260px] lg:sticky lg:top-0 lg:h-screen lg:w-[220px] lg:min-w-[220px] lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Sidebar top -->
      <div class="flex items-center justify-between px-3 pt-3 pb-1 lg:block">
        <RouterLink to="/student/dashboard" class="flex items-center gap-2 border-[3px] border-brand-teal px-3 py-2 text-xs font-black text-ink no-underline transition-colors hover:bg-brand-amber">
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Go Back
        </RouterLink>
        <!-- Close sidebar button (mobile) -->
        <button class="lg:hidden border-[2px] border-brand-teal p-1.5 text-ink" @click="sidebarOpen = false">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="px-3.5 py-2">
        <div class="font-mono text-[10px] uppercase tracking-widest text-gray-500">Module {{ moduleId }}</div>
        <div class="mt-0.5 font-display text-[13px] font-black leading-tight">{{ moduleData?.title || 'Learning module' }}</div>
      </div>

      <div class="px-3.5 py-2">
        <div class="h-[8px] overflow-hidden border-[2px] border-brand-teal bg-gray-200">
          <div class="h-full bg-green-500 transition-all" :style="{ width: progress.percent + '%' }" />
        </div>
        <div class="mt-1 font-mono text-[10px] text-gray-500">{{ progress.percent }}% Progress</div>
      </div>

      <div class="flex-1 space-y-2 overflow-y-auto px-3 py-2">
        <button
          v-if="hasAutoIntro"
          :class="[
            'flex w-full items-center gap-2.5 border-[2px] border-brand-teal px-3 py-2.5 text-left text-[13px] font-bold transition-all',
            isIntroActive ? 'bg-brand-blue text-white' : 'bg-white hover:bg-brand-blue-soft'
          ]"
         
          @click="selectIntro"
        >
          <span class="grid h-[20px] w-[20px] flex-shrink-0 place-items-center rounded-full border-[2px] border-current bg-white" />
          <span class="truncate">Introduction</span>
        </button>

        <button
          v-for="(topic, index) in topics"
          :key="topic.id"
          :disabled="!isTopicUnlocked(index)"
          :class="[
            'flex w-full items-center gap-2.5 border-[2px] border-brand-teal px-3 py-2.5 text-left text-[13px] font-bold transition-all',
            activeTopic?.id === topic.id ? 'bg-brand-blue text-white' : 'bg-white hover:bg-brand-blue-soft',
            !isTopicUnlocked(index) ? 'cursor-not-allowed opacity-50 hover:bg-white' : ''
          ]"
          :style="isTopicUnlocked(index) ? 'box-shadow:2px 2px 0 #000' : ''"
          @click="selectTopic(topic.id)"
        >
          <span :class="['grid h-[20px] w-[20px] flex-shrink-0 place-items-center rounded-full border-[2px] border-brand-teal text-[10px] font-black', completedIds.has(topic.id) ? 'bg-green-500 text-white' : 'bg-white text-ink']">
            {{ completedIds.has(topic.id) ? 'OK' : isTopicUnlocked(index) ? '' : 'L' }}
          </span>
          <span class="truncate">{{ topic.title || `Topic ${index + 1}` }}</span>
        </button>

        <button
          v-for="quiz in quizzes"
          :key="`quiz-${quiz.id}`"
          :disabled="!quizUnlocked"
          :class="[
            'flex w-full items-center gap-2.5 border-[2px] border-brand-teal px-3 py-2.5 text-left text-[12px] font-bold uppercase tracking-wide transition-all',
            activeQuiz?.id === quiz.id ? 'bg-brand-amber text-ink' : 'bg-white hover:bg-brand-amber',
            !quizUnlocked ? 'cursor-not-allowed opacity-45' : ''
          ]"
          :style="quizUnlocked ? 'box-shadow:2px 2px 0 #000' : ''"
          @click="selectQuiz(quiz.id)"
        >
          <span :class="['grid h-[20px] w-[20px] flex-shrink-0 place-items-center rounded-full border-[2px] border-brand-teal text-[10px] font-black', completedQuizIds.has(quiz.id) ? 'bg-green-500 text-white' : 'bg-white text-ink']">
            {{ completedQuizIds.has(quiz.id) ? 'OK' : 'Q' }}
          </span>
          <span class="truncate">{{ quiz.title }}</span>
        </button>
      </div>
    </aside>

    <main class="flex h-screen min-w-0 flex-1 flex-col overflow-hidden lg:ml-0">
      <!-- Top bar -->
      <header class="flex shrink-0 items-center gap-3 border-b-[3px] border-brand-teal bg-brand-teal px-4 py-4 sm:px-8 sm:py-5">
        <!-- Mobile sidebar toggle -->
        <button
          class="flex-shrink-0 rounded border-[2px] border-white/40 bg-white/20 p-1.5 text-white transition hover:bg-white/30 lg:hidden"
          @click="sidebarOpen = true"
          aria-label="Open module navigation"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <div class="min-w-0 flex-1">
          <h1 class="truncate font-display text-xl font-black leading-tight text-white sm:text-[28px]">{{ headerTitle }}</h1>
          <p class="mt-0.5 truncate font-display text-[12px] font-bold text-white/80 sm:text-[13px]">{{ headerDescription }}</p>
        </div>
        <!-- Timer badge (shown in header on all screens) -->
        <div
          v-if="quizTimerLabel"
          :class="[
            'flex flex-shrink-0 items-center gap-2 rounded-full border-[2px] px-3 py-1.5 font-mono text-[11px] font-black shadow transition-all',
            quizRemainingSeconds !== null && quizRemainingSeconds <= 60
              ? 'animate-pulse border-red-400 bg-red-50 text-red-600'
              : 'border-white/50 bg-white/20 text-white'
          ]"
          title="Time remaining"
        >
          <svg class="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9"/>
            <path stroke-linecap="round" d="M12 7v5l3 3"/>
          </svg>
          <span>{{ quizTimerLabel }}</span>
        </div>
      </header>

      <section class="min-h-0 flex-1 overflow-y-auto bg-white p-4 sm:p-7">
        <div v-if="content.loading" class="border-[3px] border-brand-teal bg-white p-8 text-center font-black">Loading learning content...</div>
        <div v-else-if="content.error" class="border-[3px] border-brand-teal bg-red-50 p-8 text-center font-black text-red-700">{{ content.error }}</div>
        <div v-else-if="topics.length === 0 && !isIntroActive" class="border-[3px] border-brand-teal bg-white p-10 text-center">
          <h2 class="font-display text-xl font-black">No learning materials are available for this module yet.</h2>
          <p class="mt-2 text-sm text-gray-500">Please check again after your teacher publishes content.</p>
        </div>

        <article v-else-if="isIntroActive" class="space-y-6">
          <div class="rounded-lg border-[2px] border-gray-200 bg-white p-6 text-sm leading-7 text-gray-700">
            {{ moduleData?.description || 'Introduction content will be available here.' }}
          </div>
          <div class="flex justify-end pt-4">
            <button
              class="border-[3px] border-brand-teal bg-brand-blue px-5 py-2.5 text-sm font-black text-white transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] disabled:opacity-50"
             
              :disabled="topics.length === 0"
              @click="goNext"
            >
              Start Topic 1
            </button>
          </div>
        </article>

        <article v-else-if="activeQuiz" class="space-y-5">
          <div class="border-[3px] border-brand-teal bg-brand-amber p-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="font-mono text-[10px] font-black uppercase tracking-widest">Quiz</div>
                <h2 class="mt-1 font-display text-xl font-black sm:text-2xl">{{ activeQuiz.title }}</h2>
                <p class="mt-2 text-sm text-gray-700">{{ activeQuiz.description }}</p>
              </div>
              <!-- Inline timer badge (supplements header badge) -->
              <div
                v-if="quizTimerLabel"
                :class="[
                  'flex shrink-0 items-center gap-2 rounded-xl border-[2px] px-3.5 py-2 font-mono text-[12px] font-black shadow-sm',
                  quizRemainingSeconds !== null && quizRemainingSeconds <= 60
                    ? 'animate-pulse border-brand-rose bg-brand-rose/10 text-brand-rose'
                    : 'border-brand-teal bg-white/70 text-ink'
                ]"
              >
                <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9"/>
                  <path stroke-linecap="round" d="M12 7v5l3 3"/>
                </svg>
                <span>{{ quizTimerLabel }}</span>
                <span class="hidden text-[10px] font-bold uppercase tracking-wide opacity-60 sm:block">remaining</span>
              </div>
            </div>
          </div>

          <div v-if="quizResult" class="border-[3px] border-brand-teal bg-green-50 p-4 font-black text-green-800">
            Score: {{ quizResult.score }} / {{ quizResult.total }}
          </div>

          <div v-for="(question, index) in activeQuiz.questions" :key="index" class="border-[3px] border-brand-teal bg-white p-5">
            <label class="block text-sm font-black">Question {{ index + 1 }}</label>
            <p class="mt-1 text-sm text-gray-700">{{ question.prompt }}</p>
            <input
              v-model="quizAnswers[String(index)]"
              class="mt-3 w-full border-[2px] border-brand-teal px-3 py-2 text-sm outline-none focus:bg-brand-blue-soft disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="quizLocked"
              placeholder="Your answer"
              @input="saveActiveQuizAnswers"
            />
          </div>

          <div class="flex justify-end">
            <button
              class="border-[3px] border-brand-teal bg-brand-blue px-5 py-2.5 text-sm font-black text-white transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="quizLocked || quizSubmitting"
              @click="submitActiveQuiz()"
            >
              {{ quizSubmitting ? 'Submitting…' : quizLocked ? 'Submitted' : 'Submit Quiz' }}
            </button>
          </div>
        </article>

        <article v-else-if="activeTopic" class="space-y-6">
          <div v-if="activeTopic.page_image_urls?.length" class="mx-auto grid max-w-4xl gap-6">
            <img
              v-for="(pageUrl, index) in activeTopic.page_image_urls"
              :key="`${activeTopic.id}-${index}`"
              :src="assetUrl(pageUrl)"
              alt=""
              class="w-full rounded border border-gray-200 bg-white shadow-sm"
            />
          </div>
          <div v-else class="prose max-w-none whitespace-pre-line text-[14px] leading-relaxed text-gray-700">{{ activeTopic.content }}</div>

          <div v-if="activeTopic.image_url" class="flex flex-col gap-5 lg:flex-row">
            <img :src="assetUrl(activeTopic.image_url)" alt="" class="h-[280px] w-full border-[3px] border-[#FF9F40] object-cover lg:w-[280px]" />
            <div class="flex-1 rounded-lg border-[2px] border-gray-200 bg-white p-5 text-[14px] leading-relaxed text-gray-700">
              {{ activeTopic.description }}
            </div>
          </div>

          <div class="flex items-center justify-between pt-4">
            <button
              class="border-[3px] border-brand-teal bg-white px-5 py-2.5 text-sm font-black transition-all hover:-translate-x-[1px] hover:-translate-y-[1px]"
             
              @click="goPrevious"
            >
              Previous
            </button>
            <span class="font-mono text-xs text-gray-400">Topic {{ activeIndex + 1 }} of {{ topics.length }}</span>
            <button
              class="border-[3px] border-brand-teal bg-brand-blue px-5 py-2.5 text-sm font-black text-white transition-all hover:-translate-x-[2px] hover:-translate-y-[2px]"
             
              @click="goNext"
            >
              {{ activeIndex === topics.length - 1 ? 'Finish Module' : 'Next Topic' }}
            </button>
          </div>
        </article>
      </section>
    </main>

    <Teleport to="body">
      <div
        v-if="pendingQuizId"
        class="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4 backdrop-blur-sm"
        @click.self="cancelQuizStart"
      >
        <section class="w-full max-w-sm border-[3px] border-brand-teal bg-white p-6 shadow-2xl">
          <div class="mb-1 font-mono text-[10px] font-black uppercase tracking-widest text-brand-teal">Quiz Confirmation</div>
          <h2 class="font-display text-xl font-black text-ink">Ready to Start?</h2>
          <p class="mt-3 text-sm leading-relaxed text-gray-600">
            This quiz has a time limit. The timer starts immediately after confirmation and cannot be paused or restarted.
            When time expires, the quiz submits automatically and unanswered questions remain unanswered.
          </p>
          <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="w-full border-[3px] border-brand-teal bg-white px-5 py-2.5 text-xs font-black text-ink transition-all hover:bg-surface sm:w-auto"
              @click="cancelQuizStart"
            >
              Cancel
            </button>
            <button
              type="button"
              class="w-full border-[3px] border-brand-teal bg-brand-blue px-5 py-2.5 text-xs font-black text-white transition-all hover:bg-brand-teal sm:w-auto"
              @click="confirmQuizStart"
            >
              Start Quiz
            </button>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { API_BASE_URL } from '@/lib/api'
import { useStudentContentStore } from '@/stores/studentContent'

const route = useRoute()
const content = useStudentContentStore()
const sidebarOpen = ref(false)
const activeTopicId = ref<number | null>(null)
const activeQuizId = ref<number | null>(null)
const pendingQuizId = ref<number | null>(null)
const quizAnswers = ref<Record<string, string>>({})
const quizResult = ref<{ score: number; total: number } | null>(null)
const quizRemainingSeconds = ref<number | null>(null)
const quizSubmitting = ref(false)
const quizTimeExpired = ref(false)
let quizTimer: number | null = null

const moduleId = computed(() => String(route.params.moduleId))
const moduleData = computed(() => content.currentModule)
const topics = computed(() => content.sortedTopics)
const progress = computed(() => content.progress)
const completedIds = computed(() => new Set(progress.value.completed_topic_ids))
const completedQuizIds = computed(() => new Set(progress.value.completed_quiz_ids))
const activeTopic = computed(() => activeTopicId.value ? topics.value.find(topic => topic.id === activeTopicId.value) ?? null : null)
const quizzes = computed(() => (moduleData.value?.assessments ?? []).filter(item => item.assessment_type === 'quiz'))
const activeQuiz = computed(() => quizzes.value.find(quiz => quiz.id === activeQuizId.value) ?? null)
const activeIndex = computed(() => activeTopic.value ? topics.value.findIndex(topic => topic.id === activeTopic.value?.id) : 0)
const quizUnlocked = computed(() => topics.value.length > 0 && progress.value.completed_topics >= topics.value.length)
const hasAutoIntro = computed(() => !isPagedMaterial(moduleData.value?.content_type))
const isIntroActive = computed(() => hasAutoIntro.value && !activeTopicId.value && !activeQuizId.value)
const headerTitle = computed(() => activeQuiz.value?.title || activeTopic.value?.title || moduleData.value?.title || 'Learning Content')
const headerDescription = computed(() => activeQuiz.value?.description || activeTopic.value?.description || moduleData.value?.description || 'Module description')
const quizLocked = computed(() => Boolean(quizResult.value) || quizTimeExpired.value || activeQuiz.value?.student_status === 'completed')
const quizTimerLabel = computed(() => {
  if (quizRemainingSeconds.value === null) return ''
  return formatQuizTime(quizRemainingSeconds.value)
})

onMounted(async () => {
  await content.fetchModule(moduleId.value)
  activeTopicId.value = hasAutoIntro.value ? null : topics.value[0]?.id ?? null
})

onBeforeUnmount(() => {
  clearQuizTimer()
})

watch(topics, value => {
  if (!isIntroActive.value && !activeTopicId.value && value.length) activeTopicId.value = value[0].id
})

async function selectTopic(topicId: number) {
  const index = topics.value.findIndex(topic => topic.id === topicId)
  if (index < 0 || !isTopicUnlocked(index)) return
  clearQuizTimer()
  quizTimeExpired.value = false
  pendingQuizId.value = null
  activeQuizId.value = null
  quizResult.value = null
  activeTopicId.value = topicId
  if (!completedIds.value.has(topicId)) {
    await content.markTopic(moduleId.value, topicId, 'in_progress')
  }
}

function isTopicUnlocked(index: number) {
  if (index <= 0) return true
  const previous = topics.value[index - 1]
  return Boolean(previous && completedIds.value.has(previous.id))
}

function selectIntro() {
  clearQuizTimer()
  quizTimeExpired.value = false
  pendingQuizId.value = null
  activeTopicId.value = hasAutoIntro.value ? null : topics.value[0]?.id ?? null
  activeQuizId.value = null
  quizResult.value = null
}

async function selectQuiz(quizId: number) {
  if (!quizUnlocked.value) return
  const quiz = quizzes.value.find(item => item.id === quizId)
  if (!quiz) return
  if (quiz.student_status === 'completed' || quiz.student_started_at || !hasQuizTimer(quiz)) {
    await openQuiz(quizId)
    return
  }
  pendingQuizId.value = quizId
}

function cancelQuizStart() {
  pendingQuizId.value = null
}

async function confirmQuizStart() {
  if (!pendingQuizId.value) return
  const quizId = pendingQuizId.value
  pendingQuizId.value = null
  await openQuiz(quizId)
}

async function openQuiz(quizId: number) {
  clearQuizTimer()
  quizTimeExpired.value = false
  activeQuizId.value = quizId
  activeTopicId.value = null
  const selectedQuiz = quizzes.value.find(quiz => quiz.id === quizId)
  quizAnswers.value = { ...(selectedQuiz?.student_answers ?? {}) }
  quizResult.value = null
  const timer = await content.startQuiz(moduleId.value, quizId).catch(() => null)
  if (!timer) return
  if (timer.completed) {
    quizTimeExpired.value = timer.expired
    quizResult.value = { score: timer.score ?? 0, total: timer.total ?? 0 }
    return
  }
  if (timer.time_limit_seconds) {
    startQuizTimer(timer.remaining_seconds ?? timer.time_limit_seconds)
  }
}

async function goPrevious() {
  if (activeIndex.value <= 0) {
    if (hasAutoIntro.value) selectIntro()
    return
  }
  const previous = topics.value[activeIndex.value - 1]
  await selectTopic(previous.id)
}

async function goNext() {
  if (isIntroActive.value) {
    const first = topics.value[0]
    if (first) await selectTopic(first.id)
    return
  }
  if (!activeTopic.value) return
  await content.markTopic(moduleId.value, activeTopic.value.id, 'completed')
  if (activeIndex.value >= topics.value.length - 1) {
    if (quizzes.value.length) await selectQuiz(quizzes.value[0].id)
    return
  }
  const next = topics.value[activeIndex.value + 1]
  await selectTopic(next.id)
}

async function submitActiveQuiz(autoSubmit = false) {
  if (!activeQuiz.value) return
  if (quizSubmitting.value || (quizLocked.value && !autoSubmit)) return
  quizSubmitting.value = true
  try {
    const result = await content.submitQuiz(moduleId.value, activeQuiz.value.id, quizAnswers.value)
    if (result) quizResult.value = { score: result.score, total: result.total }
    clearQuizTimer()
  } finally {
    quizSubmitting.value = false
  }
}

function saveActiveQuizAnswers() {
  if (!activeQuiz.value || quizLocked.value) return
  void content.saveQuizAnswers(moduleId.value, activeQuiz.value.id, quizAnswers.value).catch(() => null)
}

function assetUrl(url?: string | null) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API_BASE_URL}${url}`
}

function isPagedMaterial(contentType?: string | null) {
  return contentType === 'PDF' || contentType === 'PPT'
}

function startQuizTimer(initialRemainingSeconds: number) {
  if (initialRemainingSeconds <= 0) {
    quizRemainingSeconds.value = 0
    quizTimeExpired.value = true
    void submitActiveQuiz(true)
    return
  }

  const updateRemaining = () => {
    const remaining = Math.max(0, (quizRemainingSeconds.value ?? initialRemainingSeconds) - 1)
    quizRemainingSeconds.value = remaining
    if (remaining === 0) {
      clearQuizTimer()
      quizTimeExpired.value = true
      void submitActiveQuiz(true)
    }
  }

  quizRemainingSeconds.value = initialRemainingSeconds
  quizTimer = window.setInterval(updateRemaining, 1000)
}

function clearQuizTimer() {
  if (quizTimer !== null) {
    window.clearInterval(quizTimer)
    quizTimer = null
  }
  quizRemainingSeconds.value = null
}

function formatQuizTime(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function hasQuizTimer(quiz: { time_limit_seconds?: number | null; time_limit?: string | null }) {
  return Boolean(quiz.time_limit_seconds && quiz.time_limit_seconds > 0) || Boolean(quiz.time_limit)
}
</script>
