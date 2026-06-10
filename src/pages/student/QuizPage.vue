<template>
  <div class="flex h-full">
    <!-- Sidebar -->
    <aside class="w-44 border-r border-gray-100 bg-white flex flex-col flex-shrink-0">
      <RouterLink to="/student/dashboard" class="flex items-center gap-1.5 m-2.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-ink hover:bg-brand-blue-soft hover:border-brand-blue transition-all no-underline">← Go Back</RouterLink>
      <div class="px-3 py-2 border-b border-gray-100">
        <div class="text-[10px] font-mono uppercase tracking-widest text-ink-soft">Module 1</div>
        <div class="font-display font-semibold text-xs mt-0.5 leading-tight">Quiz Mode</div>
      </div>
      <div class="flex-1 px-2.5 py-2 space-y-1 overflow-y-auto scrollbar-thin">
        <div v-for="(q, i) in quizData" :key="i"
          @click="goToQuestion(i)"
          :class="['flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all',
            currentQ === i ? 'bg-brand-blue text-white' : 'hover:bg-surface text-ink-soft',
            submitted[i] ? (answers[i] === q.correct ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200') : ''
          ]"
        >
          <span :class="['w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
            submitted[i] ? (answers[i] === q.correct ? 'bg-brand-green text-white' : 'bg-brand-rose text-white') : 'bg-gray-200 text-ink-soft'
          ]">{{ i + 1 }}</span>
          Q{{ i + 1 }}
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="gradient-brand px-7 py-4 flex-shrink-0 relative overflow-hidden">
        <div class="absolute inset-0 opacity-5" style="background-image:radial-gradient(circle,#fff 1px,transparent 1px);background-size:28px 28px;" />
        <div class="relative z-10 flex items-center justify-between">
          <div>
            <h1 class="font-display text-xl font-bold text-white">Topic/Quiz Title</h1>
            <p class="font-mono text-xs text-yellow-300 mt-0.5 tracking-wide">Quiz Mode</p>
          </div>
          <div class="flex items-center gap-2">
            <button @click="mode = 'quiz'" :class="['px-4 py-2 rounded-full text-xs font-bold border transition-all', mode === 'quiz' ? 'bg-white text-brand-blue border-white' : 'bg-white/20 text-white border-white/40 hover:bg-white/30']">📝 Quiz Mode</button>
            <button @click="mode = 'sign'" :class="['px-4 py-2 rounded-full text-xs font-bold border transition-all', mode === 'sign' ? 'bg-white text-brand-blue border-white' : 'bg-white/20 text-white border-white/40 hover:bg-white/30']">🤟 Sign Language</button>
          </div>
        </div>
      </div>

      <!-- Quiz Mode -->
      <div v-if="mode === 'quiz'" class="flex-1 overflow-y-auto scrollbar-thin">
        <div class="flex h-full">
          <!-- Center panel -->
          <div class="flex-1 p-6 space-y-5">
            <!-- Progress row -->
            <div class="flex items-center gap-3">
              <span class="font-mono text-xs text-ink-soft whitespace-nowrap">Question {{ currentQ + 1 }} of {{ quizData.length }}</span>
              <div class="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                <div class="h-full bg-brand-green rounded-full transition-all" :style="`width:${((currentQ+1)/quizData.length)*100}%`" />
              </div>
              <span class="px-3 py-1 rounded-full border border-gray-200 bg-white font-mono text-xs font-bold">⏱ 10 min</span>
              <span :class="['px-3 py-1 rounded-full text-white font-bold text-xs', diffColor(currentQuiz.diff)]">{{ currentQuiz.diff }}</span>
            </div>

            <!-- Question box -->
            <div class="bg-surface rounded-xl p-5 border border-gray-100 min-h-32 text-sm leading-relaxed text-ink">
              {{ currentQuiz.q }}
            </div>

            <!-- Options -->
            <div class="grid grid-cols-2 gap-3">
              <button v-for="(opt, oi) in currentQuiz.opts" :key="oi"
                :disabled="!!submitted[currentQ]"
                @click="selectAnswer(oi)"
                :class="['flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left text-sm font-medium transition-all',
                  submitted[currentQ]
                    ? oi === currentQuiz.correct ? 'border-brand-green bg-emerald-50 text-emerald-700'
                    : oi === answers[currentQ] ? 'border-brand-rose bg-rose-50 text-rose-600'
                    : 'border-gray-100 bg-gray-50 opacity-50'
                  : answers[currentQ] === oi
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200 bg-white hover:border-brand-blue hover:bg-brand-blue-soft'
                ]"
              >
                <div class="w-7 h-7 rounded-lg border-2 border-current flex items-center justify-center font-display font-bold text-xs flex-shrink-0">
                  {{ String.fromCharCode(65 + oi) }}
                </div>
                {{ opt }}
              </button>
            </div>

            <!-- Feedback -->
            <div :class="['rounded-xl border-2 p-4 transition-all', submitted[currentQ] ? (answers[currentQ] === currentQuiz.correct ? 'border-brand-green bg-emerald-50' : 'border-brand-rose bg-rose-50') : 'border-gray-100 bg-surface']">
              <div class="font-display font-semibold text-sm mb-1">
                {{ submitted[currentQ] ? (answers[currentQ] === currentQuiz.correct ? '✅ Correct!' : '❌ Wrong') : 'Correct/Wrong' }}
              </div>
              <div class="text-xs text-ink-soft font-mono">
                {{ submitted[currentQ]
                  ? (answers[currentQ] === currentQuiz.correct ? currentQuiz.feedback.correct : currentQuiz.feedback.wrong)
                  : 'Comments/motivation will appear here after you answer.' }}
              </div>
            </div>

            <!-- Nav -->
            <div class="flex items-center justify-between">
              <button :disabled="currentQ === 0" @click="currentQ--" class="btn-secondary disabled:opacity-40">Previous</button>
              <button v-if="currentQ < quizData.length - 1" @click="currentQ++" class="btn-primary">Next</button>
              <button v-else @click="showResult = true" class="btn-primary">Finish →</button>
            </div>
          </div>

          <!-- Overview panel -->
          <div class="w-48 border-l border-gray-100 p-4 flex flex-col gap-4 bg-white">
            <div class="font-display font-semibold text-sm border-b border-gray-100 pb-2">Quiz Overview</div>
            <!-- Preview slots -->
            <div class="space-y-2">
              <div v-for="offset in [-1, 0, 1]" :key="offset"
                :class="['h-9 rounded-xl border-2 transition-all',
                  currentQ + offset === currentQ ? 'border-yellow-400 bg-yellow-50' :
                  submitted[currentQ + offset] ? (answers[currentQ + offset] === quizData[currentQ + offset]?.correct ? 'border-brand-green bg-emerald-50' : 'border-brand-rose bg-rose-50') :
                  'border-gray-200 bg-gray-50'
                ]"
              />
            </div>
            <!-- Number grid -->
            <div class="grid grid-cols-4 gap-1.5">
              <button v-for="(_, i) in quizData" :key="i"
                @click="goToQuestion(i)"
                :class="['h-8 rounded-lg border-2 text-xs font-bold transition-all',
                  i === currentQ ? 'border-brand-green bg-brand-green text-white' :
                  submitted[i] ? (answers[i] === quizData[i].correct ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-rose-300 bg-rose-50 text-rose-600') :
                  'border-gray-200 bg-gray-100 text-ink-soft hover:border-brand-blue hover:bg-brand-blue-soft'
                ]"
              >{{ i + 1 }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sign Language Mode -->
      <div v-else class="flex-1 flex flex-col overflow-hidden">
        <div class="flex-1 grid grid-cols-[200px_1fr_180px] overflow-hidden">
          <!-- Instructions -->
          <div class="border-r border-gray-100 p-4 overflow-y-auto scrollbar-thin bg-white">
            <div class="font-display font-semibold text-sm border-b border-gray-100 pb-2 mb-3 flex items-center gap-2">
              <div class="w-5 h-5 bg-gray-200 rounded border border-gray-300 flex-shrink-0" />
              Instructions
            </div>
            <div v-for="i in 4" :key="i" class="text-xs text-ink-soft leading-relaxed p-3 bg-surface rounded-xl mb-2 border border-gray-100">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmo.
            </div>
          </div>

          <!-- Camera -->
          <div class="relative bg-gray-900 flex items-center justify-center overflow-hidden">
            <div v-if="!cameraOn" class="flex flex-col items-center gap-3 text-white/50">
              <div class="text-6xl">📷</div>
              <p class="font-mono text-xs">Camera feed will appear here</p>
              <button @click="enableCamera" class="px-4 py-2 rounded-full bg-yellow-300 text-gray-900 font-bold text-xs hover:bg-yellow-400 transition-all">Enable Camera</button>
            </div>
            <template v-else>
              <video ref="videoRef" autoplay muted playsinline class="w-full h-full object-cover opacity-90" />
              <!-- Detection box -->
              <div class="absolute border-2 border-brand-green" style="left:25%;top:20%;width:50%;height:60%">
                <span class="absolute -top-6 left-0 bg-brand-green text-white font-display font-bold text-xs px-2 py-0.5 border-2 border-gray-900">{{ detectedSign }}</span>
              </div>
              <!-- Confidence -->
              <div class="absolute top-3 left-3 bg-black/70 text-white font-display font-bold text-2xl px-4 py-2 border-2 border-brand-green rounded">{{ confidence }}</div>
              <button @click="disableCamera" class="absolute bottom-3 right-3 px-3 py-1.5 bg-yellow-300 text-gray-900 font-bold text-xs rounded-full hover:bg-yellow-400 transition-all">📷 Camera Off</button>
            </template>
          </div>

          <!-- Right panels -->
          <div class="flex flex-col border-l border-gray-100 bg-white">
            <div class="flex-1 border-b border-gray-100 p-3 flex flex-col gap-2">
              <div class="font-display font-semibold text-xs border-b border-gray-100 pb-2">Sign Language</div>
              <div class="flex-1 bg-surface rounded-xl flex flex-wrap gap-1 p-2 overflow-hidden items-start content-start">
                <div v-for="letter in alphabet" :key="letter" class="w-6 h-6 bg-white border border-gray-200 rounded text-[9px] font-bold flex items-center justify-center hover:bg-yellow-100 cursor-pointer transition-colors text-ink">{{ letter }}</div>
              </div>
            </div>
            <div class="flex-1 p-3 flex flex-col gap-2">
              <div class="font-display font-semibold text-xs border-b border-gray-100 pb-2">Answer in Image</div>
              <div class="flex-1 bg-surface rounded-xl flex items-center justify-center text-5xl">{{ answerEmoji }}</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-100 px-5 py-3.5 bg-white flex items-center gap-4 flex-shrink-0">
          <div class="flex-1 min-w-0">
            <div class="font-display font-semibold text-sm mb-1">Question</div>
            <div class="text-xs text-ink-soft">{{ signQuestions[signIdx].q }}</div>
          </div>
          <div class="flex flex-col items-center gap-0.5 min-w-24">
            <input v-model="signAnswer" class="border-0 border-b-2 border-gray-900 bg-transparent font-display font-bold text-base text-center w-28 outline-none" placeholder="_ _ _ _" />
            <span class="font-mono text-[9px] text-ink-soft uppercase tracking-widest">Answer</span>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <button @click="signIdx > 0 && signIdx--" class="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold hover:border-brand-blue hover:text-brand-blue transition-all">Previous</button>
            <button @click="signIdx < signQuestions.length-1 && signIdx++" class="px-3 py-2 rounded-xl border border-gray-200 bg-gray-100 text-xs font-bold hover:bg-gray-200 transition-all">Skip</button>
            <button @click="signAnswer = ''" class="px-3 py-2 rounded-xl bg-yellow-300 text-gray-900 text-xs font-bold hover:bg-yellow-400 transition-all">Retry</button>
            <button @click="submitSign" class="px-3 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-blue-700 transition-all">Submit</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Result Modal -->
    <AppModal v-model="showResult" title="Quiz Complete!" confirm-label="Back to Dashboard" @confirm="() => router.push('/student/dashboard')">
      <div class="text-center py-4">
        <div class="text-6xl mb-4">{{ quizScore >= 5 ? '🏆' : '📚' }}</div>
        <div class="font-display text-2xl font-bold mb-2">{{ quizScore }} / {{ quizData.length }}</div>
        <div class="font-mono text-sm text-ink-soft">{{ quizScore >= 5 ? 'Great job! You passed.' : 'Keep studying — you can do better!' }}</div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppModal from '@/components/common/AppModal.vue'

const router = useRouter()

// ── Quiz data ──────────────────────────────────────────────
const quizData = [
  { q: 'Which best describes a hypothesis?', opts: ['A proven scientific fact', 'A testable prediction about variables', 'A conclusion after experiments', 'A random observation'], correct: 1, diff: 'Easy',   feedback: { correct: '✅ A hypothesis is a testable prediction.', wrong: '❌ A hypothesis is a testable prediction, not a fact.' } },
  { q: 'Which variable does the researcher deliberately change?', opts: ['Dependent variable', 'Controlled variable', 'Independent variable', 'Responding variable'], correct: 2, diff: 'Easy', feedback: { correct: '✅ The independent variable is the one manipulated.', wrong: '❌ The independent variable is the one changed by the researcher.' } },
  { q: 'What is the purpose of a control group?', opts: ['Introduce extra variables', 'Serve as a baseline', 'Repeat the experiment', 'Record observations'], correct: 1, diff: 'Medium', feedback: { correct: '✅ Control groups provide a baseline for comparison.', wrong: '❌ The control group serves as a comparison baseline.' } },
  { q: 'Which type of data consists of numerical measurements?', opts: ['Qualitative', 'Anecdotal', 'Quantitative', 'Observational'], correct: 2, diff: 'Easy', feedback: { correct: '✅ Quantitative data involves numbers.', wrong: '❌ Quantitative data consists of numerical measurements.' } },
  { q: 'What does a line graph best represent?', opts: ['Category comparison', 'Parts of a whole', 'Change over time', 'Distribution'], correct: 2, diff: 'Medium', feedback: { correct: '✅ Line graphs are ideal for trends over time.', wrong: '❌ Line graphs best show change over time.' } },
  { q: 'A valid conclusion must be based on:', opts: ['Personal opinion', 'Experimental evidence', 'Single trial results', 'Textbooks only'], correct: 1, diff: 'Easy', feedback: { correct: '✅ Conclusions must be grounded in evidence.', wrong: '❌ Valid conclusions always come from experimental evidence.' } },
  { q: 'Which step comes after forming a hypothesis?', opts: ['Draw conclusions', 'Conduct the experiment', 'Analyze data', 'Publish results'], correct: 1, diff: 'Medium', feedback: { correct: '✅ After the hypothesis, you conduct the experiment.', wrong: '❌ The next step after a hypothesis is conducting the experiment.' } },
  { q: 'What is peer review in science?', opts: ['Students grading each other', 'Scientists evaluating research', 'A teacher reviewing reports', 'Government approving funding'], correct: 1, diff: 'Hard', feedback: { correct: '✅ Peer review is scientists evaluating each other\'s work.', wrong: '❌ Peer review is when scientists evaluate each other\'s research.' } },
]

const currentQ   = ref(0)
const answers    = ref<Record<number, number>>({})
const submitted  = ref<Record<number, boolean>>({})
const showResult = ref(false)
const mode       = ref<'quiz' | 'sign'>('quiz')

const currentQuiz = computed(() => quizData[currentQ.value])
const quizScore   = computed(() => quizData.filter((q, i) => answers.value[i] === q.correct).length)

function selectAnswer(oi: number) {
  if (submitted.value[currentQ.value]) return
  answers.value[currentQ.value]   = oi
  submitted.value[currentQ.value] = true
}
function goToQuestion(i: number) { currentQ.value = i }
function diffColor(d: string) {
  return d === 'Easy' ? 'bg-brand-green' : d === 'Hard' ? 'bg-brand-rose' : 'bg-brand-amber'
}

// ── Sign Language ──────────────────────────────────────────
const cameraOn  = ref(false)
const videoRef  = ref<HTMLVideoElement | null>(null)
const signAnswer = ref('')
const signIdx   = ref(0)
const detectedSign = ref('Detected: 👍')
const confidence   = ref('80%')
const answerEmoji  = ref('🤟')
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
let stream: MediaStream | null = null
let detectionInterval: ReturnType<typeof setInterval> | null = null

const signQuestions = [
  { q: 'Show the sign for the letter A', answer: 'A', emoji: '✊' },
  { q: 'Show the sign for the letter B', answer: 'B', emoji: '✋' },
  { q: 'Show the sign for the letter C', answer: 'C', emoji: '🤙' },
]

async function enableCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true })
    if (videoRef.value) videoRef.value.srcObject = stream
    cameraOn.value = true
    const signs = ['👍','✌️','🤙','✊','🖐']
    const pcts  = ['72%','80%','65%','91%','88%']
    let i = 0
    detectionInterval = setInterval(() => {
      detectedSign.value = `Detected: ${signs[i % signs.length]}`
      confidence.value   = pcts[i % pcts.length]
      i++
    }, 1800)
  } catch { alert('Camera access denied.') }
}
function disableCamera() {
  stream?.getTracks().forEach(t => t.stop())
  cameraOn.value = false
  if (detectionInterval) clearInterval(detectionInterval)
}
function submitSign() {
  const ans     = signAnswer.value.trim().toUpperCase()
  const correct = signQuestions[signIdx.value].answer
  alert(ans === correct ? `✅ Correct! "${ans}" is right.` : `❌ Wrong. The answer was "${correct}".`)
  signAnswer.value = ''
}

onUnmounted(() => { disableCamera() })
</script>
