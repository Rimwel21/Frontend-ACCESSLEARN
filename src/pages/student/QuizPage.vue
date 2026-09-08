<template>
  <div class="min-h-screen bg-surface">
    <div class="border-b-[3px] border-brand-teal bg-gradient-to-r from-brand-blue to-brand-teal px-4 py-5 shadow-card sm:px-8 sm:py-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="font-display text-2xl font-black text-white sm:text-[28px]">Quizzes</h1>
          <p class="mt-1 font-mono text-[11px] font-bold uppercase tracking-widest text-white/85">Assigned classroom quizzes</p>
        </div>
        <button
          class="border-[3px] border-brand-teal bg-white px-4 py-2 text-xs font-black text-brand-blue shadow-card transition-all hover:-translate-y-1 hover:border-brand-amber hover:shadow-card-hover"
          @click="content.fetchModules()"
        >
          Refresh
        </button>
      </div>
    </div>

    <div class="px-4 py-5 sm:px-7 sm:py-6">
      <div class="grid items-start gap-5 xl:grid-cols-[1fr_240px]">
        <div>
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 class="font-display text-sm font-black uppercase tracking-widest">Assigned Quizzes</h2>
            <RouterLink to="/student/dashboard" class="border-[3px] border-brand-teal bg-white px-4 py-2 text-xs font-black text-brand-blue shadow-card transition-all hover:-translate-y-1 hover:border-brand-amber hover:shadow-card-hover">
              Dashboard
            </RouterLink>
          </div>

          <div v-if="content.loading" class="border-[3px] border-brand-teal bg-white p-6 text-sm font-black shadow-card">
            Loading quizzes...
          </div>
          <div v-else-if="content.error" class="border-[3px] border-brand-rose bg-brand-rose/10 p-6 text-sm font-black text-brand-rose shadow-card">
            {{ content.error }}
          </div>
          <div v-else-if="quizzes.length === 0" class="border-[3px] border-brand-teal bg-white p-8 text-center shadow-card">
            <h2 class="font-display text-lg font-black">No quizzes assigned yet.</h2>
            <p class="mt-2 text-sm text-ink-soft">Quizzes created by your teacher will appear here when they are attached to your learning materials.</p>
          </div>

          <div v-else class="space-y-3">
            <button
              v-for="quiz in quizzes"
              :key="quiz.id"
              type="button"
              :class="[
                'flex w-full flex-wrap items-center gap-3 border-[3px] bg-white p-4 text-left shadow-card transition-all hover:-translate-y-1 hover:border-brand-amber hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-brand-blue/30 sm:flex-nowrap sm:gap-4',
                selectedQuizId === quiz.id ? 'border-brand-amber ring-2 ring-brand-amber/30' : 'border-brand-teal',
              ]"
              @click="openQuiz(quiz)"
            >
              <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center border-[3px] border-brand-teal bg-brand-blue-soft text-xs font-black text-brand-blue">
                QZ
              </div>

              <div class="min-w-0 flex-1">
                <div class="text-[14px] font-black">{{ quiz.title }}</div>
                <div class="mt-0.5 truncate font-mono text-[11px] text-ink-soft">{{ quiz.description || 'Quiz assessment' }}</div>
                <div class="mt-1 font-mono text-[10px] font-bold text-ink-soft">{{ quiz.moduleTitle }}{{ quiz.dueAt ? ` | Due ${formatDeadline(quiz.dueAt)}` : '' }}</div>
              </div>

              <div class="ml-auto flex items-center gap-3">
                <span :class="['border-[2px] border-brand-teal px-2.5 py-1.5 font-mono text-[10px] font-black', statusStyle(quiz.status)]">
                  {{ quiz.status }}
                </span>
                <svg class="h-4 w-4 flex-shrink-0 text-ink-soft" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
              </div>
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <div class="border-[3px] border-brand-teal bg-white shadow-card">
            <div class="border-b-[3px] border-brand-teal/30 bg-brand-blue px-3.5 py-2.5">
              <span class="font-display text-[12px] font-black uppercase tracking-wide text-white">Assigned</span>
            </div>
            <div class="p-3 text-xs font-bold text-ink-soft">
              {{ quizzes.length }} quiz{{ quizzes.length === 1 ? '' : 'zes' }}
            </div>
          </div>

          <div class="border-[3px] border-brand-teal bg-white shadow-card">
            <div class="border-b-[3px] border-brand-teal/30 bg-brand-blue px-3.5 py-2.5">
              <span class="font-display text-[12px] font-black uppercase tracking-wide text-white">Completed</span>
            </div>
            <div class="p-3 text-xs font-bold text-ink-soft">
              {{ completedCount }} completed
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useStudentContentStore } from '@/stores/studentContent'

type QuizStatus = 'Finished' | 'In Progress' | 'Not Started'

interface QuizRow {
  id: number
  moduleId: number
  moduleTitle: string
  title: string
  description: string
  dueAt?: string | null
  status: QuizStatus
}

const router = useRouter()
const route = useRoute()
const content = useStudentContentStore()
const selectedQuizId = computed(() => route.query.deadlineId ? Number(route.query.deadlineId) : null)

const quizzes = computed<QuizRow[]>(() => content.modules.flatMap(module =>
  module.assessments
    .filter(assessment => assessment.assessment_type === 'quiz')
    .map(assessment => ({
      id: assessment.id,
      moduleId: assessment.module_id ?? module.id,
      moduleTitle: module.title,
      title: assessment.title,
      description: assessment.description,
      dueAt: assessment.due_at,
      status: assessment.student_status === 'completed'
        ? 'Finished'
        : assessment.student_started_at
          ? 'In Progress'
          : 'Not Started',
    }))
))

const completedCount = computed(() => quizzes.value.filter(quiz => quiz.status === 'Finished').length)

onMounted(() => {
  content.fetchModules()
})

function openQuiz(quiz: QuizRow) {
  router.push({
    path: `/student/modules/${quiz.moduleId}`,
    query: { quizId: String(quiz.id) },
  })
}

function statusStyle(status: QuizStatus) {
  switch (status) {
    case 'In Progress': return 'bg-brand-amber/25 text-brand-blue'
    case 'Finished': return 'bg-brand-teal/15 text-brand-teal'
    case 'Not Started': return 'bg-surface text-ink-soft'
    default: return 'bg-white'
  }
}

function formatDeadline(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
