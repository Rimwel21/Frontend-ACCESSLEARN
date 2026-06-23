<template>
  <div class="flex h-screen overflow-hidden bg-white">

    <!-- Sidebar -->
    <aside class="w-[200px] min-w-[200px] border-r-[3px] border-black flex flex-col bg-white">

      <!-- Go Back -->
      <RouterLink to="/student/dashboard"
        class="flex items-center gap-2 mx-3 mt-3 mb-2 px-3 py-2 border-[3px] border-black font-black text-xs hover:bg-[#FFE135] transition-colors no-underline text-black"
        style="box-shadow:3px 3px 0 #000">
        ← Go Back
      </RouterLink>

      <!-- Module info -->
      <div class="px-3.5 py-2">
        <div class="font-mono text-[10px] uppercase tracking-widest text-gray-500">Module 1</div>
        <div class="font-display font-black text-[13px] mt-0.5 leading-tight">Title ng module</div>
      </div>

      <!-- Progress -->
      <div class="px-3.5 py-2">
        <div class="h-[8px] bg-gray-200 border-[2px] border-black overflow-hidden">
          <div class="h-full bg-green-500 transition-all" :style="{ width: progressPercent + '%' }" />
        </div>
        <div class="font-mono text-[10px] text-gray-500 mt-1">Progress</div>
      </div>

      <!-- Introduction button -->
      <button @click="loadIntro"
        :class="['mx-3 my-2 px-3 py-2.5 border-[3px] border-black font-black text-xs transition-all text-center',
          currentView === 'intro' ? 'bg-[#1565FF] text-white' : 'bg-[#D6E4FF] text-black hover:bg-[#1565FF] hover:text-white']"
        style="box-shadow:3px 3px 0 #000">
        Introduction
      </button>

      <!-- Topic / Quiz list -->
      <div class="flex-1 overflow-y-auto px-3 py-1 space-y-2 scrollbar-thin">
        <template v-for="(entry, idx) in sidebarEntries" :key="idx">

          <!-- Topic row -->
          <div v-if="entry.kind === 'topic'"
            @click="canAccessTopic(entry.topic.id) ? loadTopic(entry.topic.id) : null"
            :class="['flex items-center gap-2.5 px-3 py-2.5 border-[2px] border-black font-bold text-[13px] transition-all',
              currentView === entry.topic.id ? 'bg-[#D6E4FF] border-[#1565FF]' :
              completedTopics.has(entry.topic.id) ? 'bg-white' : 'bg-white',
              !canAccessTopic(entry.topic.id) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:-translate-x-[1px] hover:-translate-y-[1px]'
            ]"
            :style="canAccessTopic(entry.topic.id) ? 'box-shadow:2px 2px 0 #000' : ''"
          >
            <div :class="['w-[20px] h-[20px] rounded-full border-[2px] border-black flex items-center justify-center text-[10px] font-black flex-shrink-0',
              completedTopics.has(entry.topic.id) ? 'bg-green-500 text-white border-green-500' : 'bg-white']">
              {{ completedTopics.has(entry.topic.id) ? '✓' : '' }}
            </div>
            {{ entry.topic.title }}
          </div>

          <!-- Quiz row -->
          <div v-else
            @click="canAccessQuiz(entry.quizId) ? loadQuiz(entry.quizId) : null"
            :class="['flex items-center gap-2.5 px-3 py-2.5 border-[2px] border-black font-bold text-[12px] font-mono uppercase tracking-wide transition-all',
              currentView === entry.quizId ? 'bg-[#FFE135] border-black' :
              passedQuizzes.has(entry.quizId) ? 'bg-green-100 border-green-400' : 'bg-gray-50',
              !canAccessQuiz(entry.quizId) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:-translate-x-[1px] hover:-translate-y-[1px]'
            ]"
            :style="canAccessQuiz(entry.quizId) ? 'box-shadow:2px 2px 0 #000' : ''"
          >
            <span class="text-sm">{{ passedQuizzes.has(entry.quizId) ? '✅' : '📝' }}</span>
            {{ quizBanks[entry.quizId].shortLabel }}
          </div>

        </template>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">

      <!-- Header -->
      <div class="bg-[#7B8FF0] border-b-[3px] border-black px-8 py-6 flex items-center justify-between flex-shrink-0 relative overflow-hidden"
        style="background: linear-gradient(135deg, #6C7FF2, #8B9EF5);">
        <div class="relative z-10">
          <h1 class="font-display font-black text-[32px] text-white leading-tight">{{ headerTitle }}</h1>
          <p class="font-display font-bold text-[13px] text-white/80 mt-1.5">{{ headerDesc }}</p>
        </div>
        <div class="text-5xl relative z-10 flex items-center gap-2" style="animation:float 3s ease-in-out infinite">
          {{ headerEmoji }}
        </div>
      </div>

      <!-- Content area -->
      <div class="flex-1 overflow-y-auto p-7 bg-white scrollbar-thin">

        <!-- ── INTRO / TOPIC VIEW ── -->
        <template v-if="currentView === 'intro' || typeof currentView === 'number'">
          <p class="text-[14px] leading-relaxed text-gray-700 mb-6">{{ activeContent.text }}</p>

          <div class="flex gap-5 mb-6">
            <img :src="activeContent.image" class="w-[280px] h-[280px] object-cover border-[3px] border-[#FF9F40] flex-shrink-0" />
            <div class="flex-1 p-5 border-[2px] border-gray-200 rounded-lg bg-white text-[14px] leading-relaxed text-gray-700">
              {{ activeContent.extra }}
            </div>
          </div>

          <div class="flex items-center justify-between">
            <button v-if="typeof currentView === 'number' && currentView > 1" @click="goBack"
              class="border-[3px] border-black bg-white font-black text-sm px-5 py-2.5 hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
              style="box-shadow:3px 3px 0 #000">
              ← Previous
            </button>
            <span v-else class="font-mono text-xs text-gray-400">{{ currentView === 'intro' ? 'Introduction' : `Topic ${currentView} of ${topics.length}` }}</span>

            <button @click="goNext"
              :class="['border-[3px] border-black font-black text-sm px-5 py-2.5 hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all',
                shouldGateNext ? 'bg-[#FFE135] text-black' : 'bg-[#1565FF] text-white']"
              style="box-shadow:4px 4px 0 #000">
              {{ nextBtnLabel }}
            </button>
          </div>
        </template>

        <!-- ── QUIZ VIEW ── -->
        <template v-else-if="typeof currentView === 'string' && currentView.startsWith('quiz')">
          <div class="border-[3px] border-black mb-5 overflow-hidden" style="box-shadow:5px 5px 0 #000">
            <div class="bg-[#FFE135] border-b-[3px] border-black px-5 py-4 flex items-center gap-3">
              <span class="bg-black text-[#FFE135] font-mono text-[10px] font-black px-2 py-1 tracking-widest">QUIZ</span>
              <span class="font-display font-black text-base">{{ activeQuiz?.label }}</span>
              <span class="ml-auto font-mono text-xs text-gray-600">3 Questions</span>
            </div>
            <div class="px-5 py-4 bg-white text-sm text-gray-600" v-html="activeQuiz?.intro" />
          </div>

          <div v-for="(q, qi) in activeQuiz?.questions" :key="q.id"
            class="border-[3px] border-black mb-4 overflow-hidden" style="box-shadow:4px 4px 0 #000">
            <div class="bg-[#1565FF] border-b-[3px] border-black px-5 py-3 flex items-center gap-3">
              <span class="bg-[#FFE135] text-black font-mono text-[10px] font-black px-2.5 py-1 border-[2px] border-black">Q{{ qi+1 }}</span>
              <span class="font-black text-white text-sm">{{ q.text }}</span>
            </div>
            <div class="p-5 space-y-2.5 bg-white">
              <button v-for="(opt, oi) in q.options" :key="oi"
                :disabled="!!quizSubmitted[qi]"
                @click="selectOpt(qi, oi)"
                :class="['w-full flex items-center gap-3 px-4 py-3 border-[3px] border-black text-left text-sm font-bold transition-all',
                  quizSubmitted[qi]
                    ? oi === q.correctIndex ? 'bg-green-200 border-green-600'
                    : oi === (quizAnswers[qi] ?? -1) ? 'bg-red-200 border-red-500'
                    : 'bg-gray-50 opacity-50 border-gray-200'
                  : quizAnswers[qi] === oi
                    ? 'bg-[#FFE135] border-black'
                    : 'bg-white hover:bg-[#D6E4FF] hover:-translate-x-[1px] hover:-translate-y-[1px]'
                ]"
                :style="!quizSubmitted[qi] && quizAnswers[qi] !== oi ? 'box-shadow:2px 2px 0 #000' : ''"
              >
                <div class="w-7 h-7 border-[2px] border-black flex items-center justify-center font-black text-xs flex-shrink-0 bg-white">
                  {{ String.fromCharCode(65+oi) }}
                </div>
                {{ opt }}
              </button>
            </div>
            <div class="px-5 pb-4 bg-white flex items-center justify-between">
              <div v-if="quizSubmitted[qi]"
                :class="['font-mono text-xs font-bold px-3 py-2 border-[2px] border-black',
                  quizAnswers[qi] === q.correctIndex ? 'bg-green-200' : 'bg-red-200']">
                {{ quizAnswers[qi] === q.correctIndex ? '✅ Correct!' : '❌ Incorrect — correct answer highlighted' }}
              </div>
              <button v-if="!quizSubmitted[qi]"
                :disabled="quizAnswers[qi] === undefined"
                @click="submitQ(qi)"
                class="ml-auto border-[3px] border-black bg-[#1565FF] text-white font-black text-xs px-4 py-2 hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style="box-shadow:3px 3px 0 #000">
                Submit Answer
              </button>
            </div>
          </div>

          <!-- Score card -->
          <div v-if="quizAllAnswered"
            class="border-[3px] border-black overflow-hidden mt-4" style="box-shadow:6px 6px 0 #000">
            <div :class="['px-6 py-5 border-b-[3px] border-black flex items-center gap-4', quizPassed ? 'bg-green-200' : 'bg-[#FFE135]']">
              <span class="text-4xl">{{ quizPassed ? '🏆' : '📚' }}</span>
              <div>
                <div class="font-display font-black text-xl">You scored {{ quizScore }} / {{ activeQuiz?.questions.length }}</div>
                <div class="font-mono text-xs text-gray-600 mt-1">{{ quizPassed ? 'Quiz passed! You can now continue.' : 'You need at least 2/3 to pass. Try again!' }}</div>
              </div>
            </div>
            <div class="px-6 py-4 bg-white flex justify-center gap-3">
              <button v-if="quizPassed" @click="onQuizPass"
                class="border-[3px] border-black bg-[#1565FF] text-white font-black text-sm px-6 py-2.5 hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all"
                style="box-shadow:4px 4px 0 #000">
                {{ activeQuiz?.nextLabel }} →
              </button>
              <button v-else @click="retryQuiz"
                class="border-[3px] border-black bg-[#FFE135] text-black font-black text-sm px-6 py-2.5 hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all"
                style="box-shadow:4px 4px 0 #000">
                ↺ Retry Quiz
              </button>
            </div>
          </div>
        </template>

        <!-- ── MODULE COMPLETE ── -->
        <template v-else-if="currentView === 'done'">
          <div class="text-center py-16">
            <div class="text-6xl mb-4" style="animation:float 3s ease-in-out infinite">🎉</div>
            <h2 class="font-display font-black text-3xl mb-2">Module Complete!</h2>
            <p class="font-mono text-sm text-gray-500 mb-6">You've finished all topics and quizzes.</p>
            <RouterLink to="/student/dashboard"
              class="inline-block border-[3px] border-black bg-[#1565FF] text-white font-black text-sm px-6 py-3 hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all no-underline"
              style="box-shadow:4px 4px 0 #000">
              ← Back to Dashboard
            </RouterLink>
          </div>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'

const SCIENCE_IMG = 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=400&fit=crop'

const introText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
const introExtra = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

interface Topic {
  id: number
  title: string
  desc: string
  emoji: string
  text: string
  extra: string
}

const topics: Topic[] = [
  { id: 1, title: 'Topic 1', desc: 'Introduction to the Scientific Method', emoji: '🧪🔬',
    text: introText, extra: introExtra },
  { id: 2, title: 'Topic 2', desc: 'Variables & Hypotheses', emoji: '📊🧬',
    text: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
    extra: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident similique sunt in culpa qui officia deserunt mollitia animi.' },
  { id: 3, title: 'Topic 3', desc: 'Data Collection & Analysis', emoji: '📈🔍',
    text: 'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus.',
    extra: 'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.' },
  { id: 4, title: 'Topic 4', desc: 'Conclusions & Reporting', emoji: '📝✅',
    text: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. Lorem ipsum dolor sit amet consectetur adipiscing elit.',
    extra: 'Ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam nisi ut aliquid ex ea commodi consequatur.' },
]

interface QuizQuestion {
  id: string
  text: string
  options: string[]
  correctIndex: number
}
interface QuizBank {
  id: string
  shortLabel: string
  label: string
  intro: string
  nextLabel: string
  nextTopic: number | null
  questions: QuizQuestion[]
}

const quizBanks: Record<string, QuizBank> = {
  quiz1: {
    id: 'quiz1', shortLabel: 'Quiz 1', label: 'Quiz — Topics 1 & 2',
    intro: 'You\'ve completed <strong>Topics 1 and 2</strong>. Answer all 3 questions to unlock Topic 3.',
    nextLabel: 'Continue to Topic 3', nextTopic: 3,
    questions: [
      { id: 'q1', text: 'Which best describes a hypothesis?', options: ['A proven fact', 'A testable prediction', 'A random guess', 'A conclusion'], correctIndex: 1 },
      { id: 'q2', text: 'What is the control group?', options: ['Changed variable', 'Baseline group', 'Test group', 'Random group'], correctIndex: 1 },
      { id: 'q3', text: 'Which variable does the researcher change?', options: ['Dependent', 'Controlled', 'Independent', 'Responding'], correctIndex: 2 },
    ],
  },
  quiz2: {
    id: 'quiz2', shortLabel: 'Quiz 2', label: 'Quiz — Topics 3 & 4',
    intro: 'You\'ve completed <strong>Topics 3 and 4</strong>. Answer all 3 questions to finish the module.',
    nextLabel: 'Finish Module', nextTopic: null,
    questions: [
      { id: 'q4', text: 'What is quantitative data?', options: ['Word descriptions', 'Numerical measurements', 'Personal opinions', 'Visual only'], correctIndex: 1 },
      { id: 'q5', text: 'Which graph shows change over time?', options: ['Pie chart', 'Bar graph', 'Line graph', 'Scatter plot'], correctIndex: 2 },
      { id: 'q6', text: 'A valid conclusion is based on:', options: ['Opinion', 'Evidence', 'Single trial', 'Textbooks only'], correctIndex: 1 },
    ],
  },
}

// Sidebar list: Topic1, Topic2, Quiz1, Topic3, Topic4, Quiz2
type SidebarEntry =
  | { kind: 'topic'; topic: Topic }
  | { kind: 'quiz'; quizId: string }

const sidebarEntries: SidebarEntry[] = [
  { kind: 'topic', topic: topics[0] },
  { kind: 'topic', topic: topics[1] },
  { kind: 'quiz',  quizId: 'quiz1' },
  { kind: 'topic', topic: topics[2] },
  { kind: 'topic', topic: topics[3] },
  { kind: 'quiz',  quizId: 'quiz2' },
]

// ── STATE ──
const currentView     = ref<number | string>('intro')
const completedTopics = ref(new Set<number>())
const passedQuizzes   = ref(new Set<string>())
const quizAnswers     = ref<Record<number, number>>({})
const quizSubmitted   = ref<Record<number, boolean>>({})

const currentTopic = computed(() => typeof currentView.value === 'number' ? topics[currentView.value - 1] : null)
const activeQuiz    = computed(() => typeof currentView.value === 'string' && currentView.value.startsWith('quiz') ? quizBanks[currentView.value] : null)

const activeContent = computed(() => {
  if (currentView.value === 'intro') {
    return { text: introText, extra: introExtra, image: SCIENCE_IMG }
  }
  const t = currentTopic.value
  return { text: t?.text ?? '', extra: t?.extra ?? '', image: SCIENCE_IMG }
})

const headerTitle = computed(() => {
  if (currentView.value === 'intro' || currentView.value === 'done') return 'Title of topic'
  if (typeof currentView.value === 'string') return 'Test Your Knowledge'
  return currentTopic.value?.title ?? ''
})
const headerDesc = computed(() => {
  if (currentView.value === 'intro') return 'Description'
  if (typeof currentView.value === 'string' && currentView.value.startsWith('quiz')) return activeQuiz.value?.label ?? ''
  return currentTopic.value?.desc ?? ''
})
const headerEmoji = computed(() => {
  if (typeof currentView.value === 'number') return currentTopic.value?.emoji ?? '🔬'
  if (typeof currentView.value === 'string' && currentView.value.startsWith('quiz')) return '📝✏️'
  return '🔬🧫'
})

const progressPercent = computed(() => Math.round((completedTopics.value.size / topics.length) * 100))

const shouldGateNext = computed(() => {
  const v = currentView.value
  return v === 2 || v === 4
})
const nextBtnLabel = computed(() => {
  const v = currentView.value
  if (v === 'intro') return 'Start Topic 1 →'
  if (v === 2 || v === 4) return 'Test Your Knowledge 📝'
  if (v === topics.length) return 'Finish Module ✓'
  return 'Next Topic →'
})

function canAccessTopic(id: number) {
  if (id <= 2) return true
  return passedQuizzes.value.has('quiz1')
}
function canAccessQuiz(quizId: string) {
  if (quizId === 'quiz1') return completedTopics.value.has(2)
  if (quizId === 'quiz2') return completedTopics.value.has(4)
  return false
}

function loadIntro() {
  currentView.value = 'intro'
}
function loadTopic(id: number) {
  currentView.value = id
  quizAnswers.value = {}
  quizSubmitted.value = {}
}
function goBack() {
  const v = currentView.value as number
  if (v === 3) loadQuiz('quiz1')
  else loadTopic(v - 1)
}
function goNext() {
  const v = currentView.value
  if (v === 'intro') { loadTopic(1); return }
  const idx = v as number
  if (idx === 2) { completedTopics.value.add(2); loadQuiz('quiz1') }
  else if (idx === 4) { completedTopics.value.add(4); loadQuiz('quiz2') }
  else if (idx === topics.length) { completedTopics.value.add(idx); currentView.value = 'done' }
  else { completedTopics.value.add(idx); loadTopic(idx + 1) }
}
function loadQuiz(id: string) {
  currentView.value = id
  quizAnswers.value = {}
  quizSubmitted.value = {}
}
function selectOpt(qi: number, oi: number) {
  if (quizSubmitted.value[qi]) return
  quizAnswers.value[qi] = oi
}
function submitQ(qi: number) {
  if (quizAnswers.value[qi] === undefined) return
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
  passedQuizzes.value.add(currentView.value as string)
  const next = activeQuiz.value?.nextTopic
  if (next) loadTopic(next)
  else currentView.value = 'done'
}
function retryQuiz() { loadQuiz(currentView.value as string) }
</script>

<style>
@keyframes float {
  0%,100% { transform: translateY(0) rotate(-4deg); }
  50%      { transform: translateY(-8px) rotate(4deg); }
}
</style>
