<template>
  <div class="flex h-full">
    <!-- Sidebar topics -->
    <aside class="w-44 border-r border-gray-100 flex flex-col flex-shrink-0 bg-white">
      <RouterLink to="/student/dashboard" class="flex items-center gap-1.5 m-2.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-ink hover:bg-brand-blue-soft hover:border-brand-blue transition-all no-underline">← Go Back</RouterLink>
      <div class="px-3 py-2 border-b border-gray-100">
        <div class="text-[10px] font-mono uppercase tracking-widest text-ink-soft">Module 1</div>
        <div class="font-display font-semibold text-xs mt-0.5 leading-tight">Title ng module</div>
      </div>
      <div class="px-3 py-2 border-b border-gray-100">
        <div class="text-[10px] font-mono text-ink-soft uppercase tracking-wide mb-1">Progress</div>
        <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div class="h-full bg-brand-blue rounded-full transition-all" :style="`width:${progressPercent}%`" /></div>
        <div class="text-[9px] font-mono text-right text-ink-soft mt-0.5">{{ progressPercent }}%</div>
      </div>
      <button @click="currentView = 'intro'" :class="['mx-2.5 my-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all', currentView === 'intro' ? 'bg-brand-blue text-white' : 'bg-brand-blue-soft text-brand-blue']">Introduction</button>
      <div class="flex-1 overflow-y-auto px-2.5 py-1 space-y-1 scrollbar-thin">
        <div v-for="(topic, i) in topics" :key="topic.id"
          @click="canAccess(topic.id) ? loadTopic(i+1) : null"
          :class="['flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold relative transition-all',
            currentView === i+1 ? 'bg-brand-blue-soft border border-brand-blue/30 text-ink' : 'hover:bg-surface',
            !canAccess(topic.id) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
            completedTopics.has(topic.id) ? 'bg-gray-50' : ''
          ]"
        >
          <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] flex-shrink-0', completedTopics.has(topic.id) ? 'bg-brand-green border-brand-green text-white' : 'border-gray-300']">
            {{ completedTopics.has(topic.id) ? '✓' : '' }}
          </div>
          {{ topic.title }}
          <span v-if="topic.id === 2 || topic.id === 4" :class="['absolute right-1.5 top-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono', passedQuizzes.has(topic.id === 2 ? 'quiz1' : 'quiz2') ? 'bg-emerald-100 text-emerald-600' : 'bg-yellow-200 text-yellow-700']">
            {{ passedQuizzes.has(topic.id === 2 ? 'quiz1' : 'quiz2') ? '✓' : 'QUIZ' }}
          </span>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="gradient-brand px-7 py-5 flex items-center justify-between flex-shrink-0 relative overflow-hidden">
        <div class="absolute inset-0 opacity-5" style="background-image:radial-gradient(circle,#fff 1px,transparent 1px);background-size:28px 28px;" />
        <div class="relative z-10">
          <h1 class="font-display text-2xl font-bold text-white">{{ headerTitle }}</h1>
          <p class="font-mono text-xs text-yellow-300 mt-1 tracking-wide">{{ headerDesc }}</p>
        </div>
        <div class="text-5xl relative z-10 animate-[float_3s_ease-in-out_infinite]">{{ headerEmoji }}</div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto scrollbar-thin p-6">
        <!-- Intro view -->
        <template v-if="currentView === 'intro'">
          <p class="text-sm leading-relaxed border-l-4 border-brand-blue pl-4 mb-5 text-ink-soft">{{ introText }}</p>
          <div class="flex flex-col sm:flex-row gap-0 border border-gray-200 shadow-card rounded-xl overflow-hidden mb-5">
            <div class="sm:w-56 h-40 bg-gray-100 flex items-center justify-center text-6xl border-b sm:border-b-0 sm:border-r border-gray-200">🧬</div>
            <div class="flex-1 p-5 text-sm leading-relaxed text-ink-soft">{{ introText }}</div>
          </div>
          <div class="flex justify-end">
            <button @click="loadTopic(1)" class="btn-primary">Start Topic 1 →</button>
          </div>
        </template>

        <!-- Quiz view -->
        <template v-else-if="typeof currentView === 'string' && currentView.startsWith('quiz')">
          <div class="border border-gray-200 rounded-2xl overflow-hidden shadow-card mb-5">
            <div class="bg-yellow-300 border-b border-gray-200 px-5 py-4 flex items-center gap-3">
              <span class="bg-gray-900 text-yellow-300 font-mono text-[10px] font-bold px-2 py-1 rounded tracking-widest">QUIZ</span>
              <span class="font-display font-bold text-base">{{ activeQuiz?.label }}</span>
              <span class="ml-auto font-mono text-xs text-gray-600">3 Questions</span>
            </div>
            <div class="px-5 py-4 text-sm text-ink-soft bg-white" v-html="activeQuiz?.intro" />
          </div>

          <div v-for="(q, qi) in activeQuiz?.questions" :key="q.id" class="border border-gray-200 rounded-2xl overflow-hidden shadow-card mb-4">
            <div class="gradient-brand px-5 py-3 flex items-center gap-3">
              <span class="bg-yellow-300 text-gray-900 font-mono text-[10px] font-bold px-2.5 py-1 rounded">Q{{ qi+1 }}</span>
              <span class="font-semibold text-white text-sm">{{ q.text }}</span>
            </div>
            <div class="p-5 space-y-2.5 bg-white">
              <button v-for="(opt, oi) in q.options" :key="oi"
                :disabled="!!quizSubmitted[qi]"
                @click="selectOpt(qi, oi)"
                :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left text-sm font-medium transition-all',
                  quizSubmitted[qi]
                    ? oi === q.correctIndex ? 'border-brand-green bg-emerald-50'
                    : oi === (quizAnswers[qi] ?? -1) ? 'border-brand-rose bg-rose-50'
                    : 'border-gray-100 bg-gray-50 opacity-60'
                  : (quizAnswers[qi] === oi ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-brand-blue hover:bg-brand-blue-soft')
                ]"
              >
                <div class="w-7 h-7 rounded-lg border-2 border-current flex items-center justify-center font-display font-bold text-xs flex-shrink-0">{{ String.fromCharCode(65+oi) }}</div>
                {{ opt }}
              </button>
            </div>
            <div class="px-5 pb-4 flex items-center justify-between bg-white">
              <div v-if="quizSubmitted[qi]" :class="['text-xs font-mono px-3 py-1.5 rounded-lg', quizAnswers[qi] === q.correctIndex ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600']">
                {{ quizAnswers[qi] === q.correctIndex ? '✅ Correct!' : '❌ Incorrect — correct answer highlighted' }}
              </div>
              <button v-if="!quizSubmitted[qi]" :disabled="quizAnswers[qi] === undefined" @click="submitQ(qi, q.correctIndex, currentView as string)" class="btn-primary disabled:opacity-40 disabled:cursor-not-allowed ml-auto">Submit Answer</button>
            </div>
          </div>

          <!-- Score card -->
          <div v-if="quizAllAnswered" class="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-card-hover">
            <div :class="['px-6 py-5 flex items-center gap-4', quizPassed ? 'bg-emerald-50' : 'bg-yellow-50']">
              <span class="text-4xl">{{ quizPassed ? '🏆' : '📚' }}</span>
              <div>
                <div class="font-display text-xl font-bold">You scored {{ quizScore }} / {{ activeQuiz?.questions.length }}</div>
                <div class="font-mono text-xs text-ink-soft mt-1">{{ quizPassed ? 'Quiz passed! You can continue.' : 'Need at least 2/3 to pass. Try again!' }}</div>
              </div>
            </div>
            <div class="px-6 py-4 bg-white flex justify-center gap-3">
              <button v-if="quizPassed" @click="onQuizPass" class="btn-primary">{{ activeQuiz?.nextLabel }} →</button>
              <button v-else @click="retryQuiz" class="px-5 py-2.5 rounded-full bg-yellow-300 text-gray-900 font-semibold text-sm hover:-translate-y-px transition-all">↺ Retry Quiz</button>
            </div>
          </div>
        </template>

        <!-- Topic view -->
        <template v-else>
          <p class="text-sm leading-relaxed border-l-4 border-brand-blue pl-4 mb-5 text-ink-soft">{{ currentTopic?.content }}</p>
          <div class="flex flex-col sm:flex-row gap-0 border border-gray-200 shadow-card rounded-xl overflow-hidden mb-5">
            <div class="sm:w-56 h-40 bg-gray-100 flex items-center justify-center text-6xl border-b sm:border-b-0 sm:border-r border-gray-200">{{ currentTopic?.emoji }}</div>
            <div class="flex-1 p-5 text-sm leading-relaxed text-ink-soft">{{ currentTopic?.extra }}</div>
          </div>
          <div class="flex items-center justify-between">
            <button v-if="(currentView as number) > 1" @click="goBack" class="btn-secondary">← Previous</button>
            <span v-else class="flex-1" />
            <span class="font-mono text-xs text-ink-soft">Topic {{ currentView }} of {{ topics.length }}</span>
            <button @click="goNext" :class="(currentView as number) === 2 || (currentView as number) === 4 ? 'px-5 py-2.5 rounded-full bg-yellow-300 text-gray-900 font-semibold text-sm hover:-translate-y-px transition-all' : 'btn-primary'">
              {{ nextBtnLabel }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'

const introText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'

const topics = [
  { id: 1, title: 'Topic 1', desc: 'Introduction to the Scientific Method', emoji: '🧪',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    extra: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae.' },
  { id: 2, title: 'Topic 2', desc: 'Variables & Hypotheses', emoji: '📊',
    content: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
    extra: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint.' },
  { id: 3, title: 'Topic 3', desc: 'Data Collection & Analysis', emoji: '📈',
    content: 'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.',
    extra: 'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.' },
  { id: 4, title: 'Topic 4', desc: 'Conclusions & Reporting', emoji: '📝',
    content: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.',
    extra: 'Ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.' },
]

const quizBanks: Record<string, { id: string; label: string; intro: string; nextLabel: string; nextTopic: number | null; questions: { id: string; text: string; options: string[]; correctIndex: number }[] }> = {
  quiz1: {
    id: 'quiz1', label: 'Quiz — Topics 1 & 2',
    intro: 'You\'ve completed <strong>Topics 1 and 2</strong>. Answer all 3 questions to unlock Topic 3.',
    nextLabel: 'Continue to Topic 3', nextTopic: 3,
    questions: [
      { id: 'q1', text: 'Which best describes a hypothesis?', options: ['A proven fact', 'A testable prediction', 'A random guess', 'A conclusion'], correctIndex: 1 },
      { id: 'q2', text: 'What is the control group?', options: ['Changed variable', 'Baseline group', 'Test group', 'Random group'], correctIndex: 1 },
      { id: 'q3', text: 'Which variable does the researcher change?', options: ['Dependent', 'Controlled', 'Independent', 'Responding'], correctIndex: 2 },
    ],
  },
  quiz2: {
    id: 'quiz2', label: 'Quiz — Topics 3 & 4',
    intro: 'You\'ve completed <strong>Topics 3 and 4</strong>. Answer all 3 questions to finish the module.',
    nextLabel: 'Finish Module', nextTopic: null,
    questions: [
      { id: 'q4', text: 'What is quantitative data?', options: ['Word descriptions', 'Numerical measurements', 'Personal opinions', 'Visual only'], correctIndex: 1 },
      { id: 'q5', text: 'Which graph shows change over time?', options: ['Pie chart', 'Bar graph', 'Line graph', 'Scatter plot'], correctIndex: 2 },
      { id: 'q6', text: 'A valid conclusion is based on:', options: ['Opinion', 'Evidence', 'Single trial', 'Textbooks only'], correctIndex: 1 },
    ],
  },
}

const currentView    = ref<number | string>('intro')
const completedTopics = ref(new Set<number>())
const passedQuizzes  = ref(new Set<string>())
const quizAnswers    = ref<Record<number, number>>({})
const quizSubmitted  = ref<Record<number, boolean>>({})

const currentTopic = computed(() => typeof currentView.value === 'number' ? topics[currentView.value - 1] : null)
const activeQuiz   = computed(() => typeof currentView.value === 'string' && currentView.value.startsWith('quiz') ? quizBanks[currentView.value] : null)

const headerTitle = computed(() => {
  if (currentView.value === 'intro') return 'Title of topic'
  if (typeof currentView.value === 'string') return 'Test Your Knowledge'
  return currentTopic.value?.title ?? ''
})
const headerDesc = computed(() => {
  if (currentView.value === 'intro') return 'Description'
  if (typeof currentView.value === 'string') return activeQuiz.value?.label ?? ''
  return currentTopic.value?.desc ?? ''
})
const headerEmoji = computed(() => {
  if (typeof currentView.value === 'number') return currentTopic.value?.emoji ?? '🔬'
  if (typeof currentView.value === 'string' && currentView.value.startsWith('quiz')) return '📝✏️'
  return '🔬🧫'
})

const progressPercent = computed(() => Math.round((completedTopics.value.size / topics.length) * 100))

const nextBtnLabel = computed(() => {
  const v = currentView.value as number
  if (v === 2) return 'Test Your Knowledge 📝'
  if (v === 4) return 'Test Your Knowledge 📝'
  if (v === topics.length) return 'Finish Module ✓'
  return 'Next Topic →'
})

function canAccess(id: number) {
  if (id <= 2) return true
  return passedQuizzes.value.has('quiz1')
}

function loadTopic(idx: number) {
  currentView.value = idx
  quizAnswers.value = {}
  quizSubmitted.value = {}
}

function goBack() {
  const v = currentView.value as number
  if (v === 3) loadQuiz('quiz1')
  else loadTopic(v - 1)
}

function goNext() {
  const v = currentView.value as number
  if (v === 2) { completedTopics.value.add(2); loadQuiz('quiz1') }
  else if (v === 4) { completedTopics.value.add(4); loadQuiz('quiz2') }
  else { completedTopics.value.add(v); loadTopic(v + 1) }
}

function loadQuiz(id: string) {
  currentView.value = id
  quizAnswers.value = {}
  quizSubmitted.value = {}
}

// Quiz logic
function selectOpt(qi: number, oi: number) {
  if (quizSubmitted.value[qi]) return
  quizAnswers.value[qi] = oi
}
function submitQ(qi: number, _correct: number, _quizId: string) {
  quizSubmitted.value[qi] = true
}

const quizAllAnswered = computed(() => {
  if (!activeQuiz.value) return false
  return activeQuiz.value.questions.every((_, i) => quizSubmitted.value[i])
})
const quizScore = computed(() => {
  if (!activeQuiz.value) return 0
  return activeQuiz.value.questions.filter((q, i) => quizAnswers.value[i] === q.correctIndex).length
})
const quizPassed = computed(() => quizScore.value >= 2)

function onQuizPass() {
  const id = currentView.value as string
  passedQuizzes.value.add(id)
  const next = activeQuiz.value?.nextTopic
  if (next) loadTopic(next)
  else currentView.value = 'done'
}
function retryQuiz() {
  const id = currentView.value as string
  loadQuiz(id)
}
</script>

<style>
@keyframes float {
  0%,100% { transform: translateY(0) rotate(-4deg); }
  50%      { transform: translateY(-8px) rotate(4deg); }
}
</style>
