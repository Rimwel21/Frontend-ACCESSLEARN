<template>
  <div class="space-y-5">
    <div class="flex items-end justify-between">
      <div>
        <Breadcrumb :crumbs="[{ label:'Class Management', to:'/teacher/class' }, { label:'Quizzes', to:'/teacher/quizzes' }, { label:'Create Quiz' }]" />
        <h2 class="font-display text-2xl font-bold">📝 Quiz</h2>
      </div>
      <div class="flex gap-2.5">
        <button @click="router.push('/teacher/quizzes')" class="btn-secondary">Cancel</button>
        <button @click="saveQuiz" class="btn-primary">💾 Save Quiz</button>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-5 items-start">
      <!-- Left -->
      <div class="space-y-5">
        <!-- Quiz Information -->
        <div class="card p-6">
          <h3 class="font-display font-semibold text-base border-b border-gray-100 pb-3 mb-4">Quiz Information</h3>
          <div class="space-y-4">
            <div><label class="block text-xs font-semibold text-ink-soft mb-1.5">Quiz Title</label><input v-model="form.title" class="input-field" placeholder="Enter quiz title…" /></div>
            <div><label class="block text-xs font-semibold text-ink-soft mb-1.5">Description</label><textarea v-model="form.description" rows="3" class="input-field resize-none" placeholder="Brief description…" /></div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-ink-soft mb-1.5">Quiz Type</label>
                <select v-model="form.type" class="input-field">
                  <option value="">Select type…</option>
                  <option>Multiple Choice</option><option>True/False</option>
                  <option>Short Answer</option><option>Mixed</option>
                </select>
              </div>
              <div><label class="block text-xs font-semibold text-ink-soft mb-1.5">Week</label><input v-model="form.week" class="input-field" placeholder="e.g. Week 3" /></div>
            </div>
          </div>
        </div>

        <!-- Quiz Settings -->
        <div class="card p-6">
          <h3 class="font-display font-semibold text-base border-b border-gray-100 pb-3 mb-4">Quiz Settings</h3>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div><label class="block text-xs font-semibold text-ink-soft mb-1.5">Time Limit (minutes)</label><input v-model.number="form.timeLimit" type="number" class="input-field" placeholder="e.g. 30" /></div>
              <div><label class="block text-xs font-semibold text-ink-soft mb-1.5">Attempts Allowed</label><input v-model.number="form.attemptsAllowed" type="number" class="input-field" placeholder="e.g. 2" /></div>
            </div>
            <label class="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-surface hover:bg-surface-2 transition-colors">
              <ToggleSwitch v-model="form.shuffleQuestions" />
              <div>
                <div class="font-semibold text-[13.5px]">Shuffle Questions</div>
                <div class="text-xs text-ink-soft">Randomize question order per student</div>
              </div>
            </label>
            <label class="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-surface hover:bg-surface-2 transition-colors">
              <ToggleSwitch v-model="form.showAnswers" />
              <div>
                <div class="font-semibold text-[13.5px]">Show Answers after Submission</div>
                <div class="text-xs text-ink-soft">Let students see correct answers</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Right: Questions -->
      <div class="card p-6 flex flex-col gap-4 sticky top-0">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 class="font-display font-semibold text-base">Questions</h3>
          <span class="badge badge-blue">{{ questions.length }} question{{ questions.length !== 1 ? 's' : '' }}</span>
        </div>

        <div class="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
          <div v-if="!questions.length" class="text-center py-10 text-ink-soft text-sm">
            No questions yet — click below to add one.
          </div>
          <div v-for="(q, qi) in questions" :key="q.id" class="bg-surface rounded-xl p-4 border border-gray-100">
            <div class="flex items-center gap-2 mb-3">
              <span class="bg-brand-blue text-white text-xs font-bold px-2.5 py-1 rounded-full">Q{{ qi + 1 }}</span>
              <input v-model="q.text" class="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-blue transition-all bg-white" placeholder="Enter your question…" />
              <button @click="removeQuestion(qi)" class="w-7 h-7 rounded-full bg-rose-100 text-brand-rose hover:bg-brand-rose hover:text-white flex items-center justify-center text-xs font-bold transition-all">✕</button>
            </div>
            <div class="space-y-2">
              <label v-for="(_, oi) in q.options" :key="oi" class="flex items-center gap-2 cursor-pointer">
                <input type="radio" :name="`correct-${qi}`" :value="oi" v-model="q.correctIndex" class="accent-brand-blue" />
                <input v-model="q.options[oi]" class="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-blue transition-all bg-white" :placeholder="`Option ${String.fromCharCode(65+oi)}`" />
              </label>
            </div>
            <div class="text-[10px] text-ink-soft mt-2 font-mono">● Select the radio button next to the correct answer</div>
          </div>
        </div>

        <button @click="addQuestion" class="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-brand-blue hover:border-brand-blue hover:bg-brand-blue-soft transition-all">
          ➕ Add Question
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import type { QuizQuestion } from '@/types'
import Breadcrumb  from '@/components/common/Breadcrumb.vue'
import ToggleSwitch from '@/components/common/ToggleSwitch.vue'

const router = useRouter()
const store  = useAppStore()

const form = ref({ title: '', description: '', type: '', week: '', timeLimit: 10, attemptsAllowed: 2, shuffleQuestions: true, showAnswers: true })
const questions = ref<QuizQuestion[]>([])

function addQuestion() {
  questions.value.push({ id: `q${Date.now()}`, text: '', options: ['', '', '', ''], correctIndex: 0 })
}
function removeQuestion(i: number) { questions.value.splice(i, 1) }

function saveQuiz() {
  if (!form.value.title.trim())   { alert('Please enter a quiz title.'); return }
  if (!questions.value.length)    { alert('Please add at least one question.'); return }
  store.addQuiz({
    title: form.value.title, description: form.value.description,
    type: form.value.type as any, week: form.value.week, moduleId: 'm1',
    timeLimit: form.value.timeLimit, attemptsAllowed: form.value.attemptsAllowed,
    shuffleQuestions: form.value.shuffleQuestions, showAnswers: form.value.showAnswers,
    difficulty: 'Easy', questions: questions.value, published: true,
    date: new Date().toLocaleDateString(),
  })
  router.push('/teacher/quizzes')
}
</script>
