<template>
  <div class="min-h-screen bg-surface">
    <div class="space-y-5 px-5 py-5 xl:px-7">
      <div>
        <div class="flex min-w-0 items-center gap-3 border-[3px] border-brand-teal bg-white px-4 py-3 shadow-card transition-all focus-within:border-brand-blue focus-within:shadow-card-hover focus-within:ring-2 focus-within:ring-brand-blue/25">
          <svg class="h-5 w-5 flex-shrink-0 text-brand-blue" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
          </svg>
          <input v-model="search" type="search" placeholder="Search lesson, quiz, activities" class="min-w-0 flex-1 border-0 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-ink-soft" />
          <button v-if="hasSearch" type="button" class="border-[2px] border-brand-teal px-3 py-1 text-[10px] font-black text-brand-blue transition-all hover:border-brand-rose hover:bg-brand-rose hover:text-white" @click="search = ''">
            CLEAR
          </button>
          <span v-else class="text-xs font-black text-ink-soft">SEARCH</span>
        </div>

        <section v-if="hasSearch" class="mt-3 border-[3px] border-brand-teal bg-white shadow-card">
          <div class="flex items-center justify-between border-b-[3px] border-brand-teal/30 bg-brand-blue-soft px-4 py-2.5">
            <h2 class="font-display text-xs font-black uppercase tracking-widest text-brand-blue">Search Results</h2>
            <span class="font-mono text-[10px] font-black text-ink-soft">{{ searchResults.length }} found</span>
          </div>
          <div v-if="searchResults.length === 0" class="p-4 text-sm font-bold text-ink-soft">
            No lessons, quizzes, or activities match "{{ search.trim() }}".
          </div>
          <div v-else class="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-4">
            <button
              v-for="result in searchResults"
              :key="result.id"
              type="button"
              class="min-w-0 border-[2px] border-brand-teal bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-brand-amber hover:shadow-card-hover"
              @click="openSearchResult(result)"
            >
              <span class="inline-flex border border-brand-teal bg-surface px-2 py-0.5 font-mono text-[9px] font-black uppercase text-brand-blue">{{ result.type }}</span>
              <div class="mt-2 truncate text-sm font-black text-ink">{{ result.title }}</div>
              <div class="mt-1 truncate font-mono text-[10px] text-ink-soft">{{ result.meta }}</div>
            </button>
          </div>
        </section>
      </div>

      <div class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_250px]">
        <div class="min-w-0 space-y-6">
          <section class="border-[3px] border-brand-teal bg-gradient-to-br from-brand-blue to-brand-teal px-6 py-5 shadow-card">
            <div class="flex min-h-[88px] items-center">
              <div>
                <h1 class="font-display text-[28px] font-black leading-tight text-white md:text-[32px]">Welcome, {{ welcomeName }}!</h1>
                <p class="font-mono text-[11px] tracking-widest text-surface">READY TO STUDY?</p>
              </div>
            </div>
          </section>

          <section>
            <div class="mb-4 flex items-center gap-3">
              <h2 class="font-display text-sm font-black uppercase tracking-widest">Modules</h2>
              <div class="h-[2.5px] flex-1 bg-brand-teal/40" />
            </div>
            <div v-if="content.loading" class="border-[3px] border-brand-teal bg-white p-6 text-sm font-black shadow-card">Loading modules...</div>
            <div v-else-if="filteredModules.length === 0" class="border-[3px] border-brand-teal bg-white p-8 text-center shadow-card">
              <h3 class="font-display text-lg font-black">{{ hasSearch ? 'No modules match your search.' : 'No learning materials are available yet.' }}</h3>
              <p class="mt-2 text-sm text-ink-soft">{{ hasSearch ? 'Try searching by lesson, quiz, activity, or module title.' : 'Published teacher uploads will appear here automatically.' }}</p>
            </div>
            <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <article
                v-for="module in filteredModules.slice(0, 4)"
                :key="module.id"
                class="cursor-pointer overflow-hidden border-[3px] border-brand-teal bg-white shadow-card transition-all hover:-translate-y-2 hover:border-brand-amber hover:shadow-card-hover"
                @click="router.push(`/student/modules/${module.id}`)"
              >
                <div class="flex h-[96px] items-center justify-center bg-brand-amber text-sm font-black uppercase tracking-widest text-white">Module</div>
                <div class="border-t-[3px] border-brand-teal/30 bg-white p-2.5">
                  <div class="flex items-center gap-1.5">
                    <div class="truncate font-display text-[11px] font-black uppercase tracking-wide">{{ module.title }}</div>
                    <span v-if="module.behavior_required" class="border border-brand-teal bg-surface px-1 font-mono text-[8px] font-black uppercase text-brand-blue hover:bg-brand-rose hover:text-white">Required</span>
                  </div>
                  <div class="mt-0.5 truncate font-mono text-[9px] text-ink-soft">{{ module.topics.length }} topics | {{ module.file_name || 'Learning material' }}</div>
                </div>
              </article>
            </div>
          </section>

          <section>
            <div class="mb-4 flex items-center gap-3">
              <h2 class="font-display text-sm font-black uppercase tracking-widest">Continue Progress</h2>
              <div class="h-[2.5px] flex-1 bg-brand-teal/40" />
            </div>
            <div v-if="filteredProgressModules.length === 0" class="border-[3px] border-brand-teal bg-white p-6 text-sm font-black shadow-card">{{ hasSearch ? 'No progress items match your search.' : 'Start a module to track your progress here.' }}</div>
            <div v-else class="space-y-3">
              <article v-for="module in filteredProgressModules.slice(0, 3)" :key="module.id" class="flex flex-wrap items-center gap-4 border-[3px] border-brand-teal bg-white p-4 shadow-card transition-all hover:-translate-y-2 hover:border-brand-amber hover:shadow-card-hover sm:flex-nowrap">
                <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center border-[3px] border-brand-teal bg-surface text-xs font-black text-brand-blue">LM</div>
                <div class="min-w-[180px] flex-1">
                  <div class="text-[15px] font-black">{{ module.title }}</div>
                  <div class="mt-0.5 flex flex-wrap items-center gap-2">
                    <span class="truncate font-mono text-[10px] text-ink-soft">{{ module.description }}</span>
                    <span v-if="module.behavior_required" class="border-[2px] border-brand-teal bg-surface px-1.5 py-0.5 font-mono text-[9px] font-black uppercase text-brand-blue hover:bg-brand-rose hover:text-white">Required</span>
                  </div>
                  <div class="mt-2 flex items-center gap-2.5">
                    <div class="h-[11px] flex-1 overflow-hidden border-[2px] border-brand-teal bg-surface">
                      <div class="h-full bg-brand-blue" :style="{ width: `${content.progressByModule[module.id]?.percent ?? 0}%` }" />
                    </div>
                    <span class="whitespace-nowrap font-mono text-[10px] font-bold text-ink">{{ content.progressByModule[module.id]?.percent ?? 0 }}%</span>
                  </div>
                </div>
                <button class="ml-auto flex-shrink-0 border-[3px] border-brand-teal bg-brand-amber px-4 py-2.5 text-[12px] font-black text-white shadow-card transition-all hover:-translate-y-1 hover:bg-gradient-to-r hover:from-brand-amber hover:to-brand-rose hover:shadow-[0_0_20px_rgba(244,163,99,0.4)]" @click="router.push(`/student/modules/${module.id}`)">RESUME</button>
              </article>
            </div>
          </section>
        </div>

        <aside class="grid gap-5 lg:block lg:space-y-5">
          <section class="border-[3px] border-brand-teal bg-white shadow-card">
            <div class="flex items-center justify-between border-b-[3px] border-brand-teal/30 bg-brand-amber px-3 py-2 text-white">
              <button class="font-black" type="button" @click="calendarOffset -= 1">&lt;</button>
              <div class="text-center">
                <div class="font-display text-sm font-black">{{ calendarTitle }}</div>
                <div class="font-mono text-[9px] uppercase tracking-widest text-white/85">{{ calendarYear }}</div>
              </div>
              <button class="font-black" type="button" @click="calendarOffset += 1">&gt;</button>
            </div>
            <div class="grid grid-cols-7 gap-1 p-3 text-center font-mono text-[10px]">
              <div v-for="day in weekDays" :key="day" class="font-black text-ink-soft">{{ day }}</div>
              <div v-for="blank in calendarLeadingBlanks" :key="`blank-${blank}`" />
              <div
                v-for="day in calendarDays"
                :key="day"
                :class="['grid h-7 place-items-center border border-transparent font-bold transition-all', isToday(day) ? 'border-brand-blue bg-brand-blue text-white' : 'text-ink hover:bg-surface']"
              >
                {{ day }}
              </div>
            </div>
          </section>

          <section class="min-h-[220px] border-[3px] border-brand-teal bg-white shadow-card">
            <div class="border-b-[3px] border-brand-teal/30 bg-brand-blue px-4 py-3">
              <h2 class="font-display text-sm font-black uppercase tracking-widest text-white">Upcoming Deadlines</h2>
            </div>
            <div class="space-y-3 p-4">
              <button
                v-for="deadline in filteredDeadlines"
                :key="deadline.id"
                type="button"
                class="group w-full border-[2px] border-brand-teal bg-white p-3 text-left transition-all hover:-translate-y-1 hover:border-brand-amber hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                @click="openDeadline(deadline)"
              >
                <div class="text-xs font-black">{{ deadline.title }}</div>
                <div class="mt-1 flex items-center justify-between gap-2 font-mono text-[10px] font-bold text-ink-soft">
                  <span>{{ deadline.item_type }} | {{ formatDeadline(deadline.due_at) }}</span>
                  <span class="text-brand-blue opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100">OPEN</span>
                </div>
              </button>
              <div v-if="filteredDeadlines.length === 0" class="text-xs font-bold text-ink-soft">{{ hasSearch ? 'No deadlines match your search.' : 'No deadlines yet.' }}</div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import { useStudentContentStore } from '@/stores/studentContent'

type SearchResultType = 'Module' | 'Lesson' | 'Quiz' | 'Activity'

interface DashboardSearchResult {
  id: string
  type: SearchResultType
  title: string
  meta: string
  moduleId?: number | null
  activityId?: number | null
}

const router = useRouter()
const profile = useProfileStore()
const content = useStudentContentStore()
const search = ref('')
const calendarOffset = ref(0)

const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const viewedDate = computed(() => {
  const date = new Date()
  date.setMonth(date.getMonth() + calendarOffset.value)
  return date
})
const calendarTitle = computed(() => viewedDate.value.toLocaleString('default', { month: 'long' }))
const calendarYear = computed(() => viewedDate.value.getFullYear())
const calendarDays = computed(() => new Date(calendarYear.value, viewedDate.value.getMonth() + 1, 0).getDate())
const calendarLeadingBlanks = computed(() => new Date(calendarYear.value, viewedDate.value.getMonth(), 1).getDay())

const welcomeName = computed(() => profile.profile?.name ?? 'Student')
const normalizedSearch = computed(() => search.value.trim().toLowerCase())
const hasSearch = computed(() => normalizedSearch.value.length > 0)
const filteredModules = computed(() => content.modules.filter(module => matchesModule(module)))
const filteredProgressModules = computed(() => content.modules.filter(module => matchesModule(module)))
const filteredDeadlines = computed(() => content.deadlines.filter(deadline =>
  !hasSearch.value || matchesText(deadline.title, deadline.item_type)
))
const searchResults = computed<DashboardSearchResult[]>(() => {
  if (!hasSearch.value) return []

  const results: DashboardSearchResult[] = []
  for (const module of content.modules) {
    if (matchesText(module.title, module.description, module.file_name, module.week, module.content_type)) {
      results.push({
        id: `module-${module.id}`,
        type: 'Module',
        title: module.title,
        meta: module.file_name || module.description || 'Learning material',
        moduleId: module.id,
      })
    }

    for (const topic of module.topics) {
      if (matchesText(topic.title, topic.description, topic.content, module.title)) {
        results.push({
          id: `lesson-${topic.id}`,
          type: 'Lesson',
          title: topic.title || `Lesson ${topic.sort_order}`,
          meta: module.title,
          moduleId: module.id,
        })
      }
    }

    for (const assessment of module.assessments) {
      if (assessment.assessment_type === 'quiz' && matchesText(assessment.title, assessment.description, assessment.category, module.title)) {
        results.push({
          id: `quiz-${assessment.id}`,
          type: 'Quiz',
          title: assessment.title,
          meta: module.title,
          moduleId: module.id,
        })
      }
    }
  }

  for (const activity of content.activities) {
    if (matchesText(activity.title, activity.description, activity.category, activity.assessment_type)) {
      results.push({
        id: `activity-${activity.id}`,
        type: 'Activity',
        title: activity.title,
        meta: activity.category || 'Activity',
        activityId: activity.id,
      })
    }
  }

  return results.slice(0, 8)
})

onMounted(() => {
  if (!profile.profile) {
    profile.fetchProfile().catch(() => null)
  }
  loadDashboard()
})

function isToday(day: number) {
  const today = new Date()
  return day === today.getDate()
    && viewedDate.value.getMonth() === today.getMonth()
    && calendarYear.value === today.getFullYear()
}

function loadDashboard() {
  content.fetchModules()
    .then(() => content.fetchActivities())
    .then(() => content.fetchDeadlines())
    .catch(() => null)
}

function matchesModule(module: typeof content.modules[number]) {
  return !hasSearch.value || matchesText(
    module.title,
    module.description,
    module.file_name,
    module.week,
    module.content_type,
    ...module.topics.flatMap(topic => [topic.title, topic.description, topic.content]),
    ...module.assessments.flatMap(assessment => [assessment.title, assessment.description, assessment.category, assessment.assessment_type])
  )
}

function matchesText(...values: Array<string | number | null | undefined>) {
  if (!hasSearch.value) return true
  return values.some(value => String(value ?? '').toLowerCase().includes(normalizedSearch.value))
}

function openSearchResult(result: DashboardSearchResult) {
  if (result.type === 'Activity' && result.activityId) {
    router.push({
      name: 'HandSignLanguage',
      query: { activityId: String(result.activityId) },
    })
    return
  }

  if (result.moduleId) {
    router.push(`/student/modules/${result.moduleId}`)
  }
}

function openDeadline(deadline: typeof content.deadlines[number]) {
  const itemType = deadline.item_type.toLowerCase()
  if (itemType === 'activity' && deadline.assessment_id) {
    router.push({
      name: 'Activities',
      query: { deadlineId: String(deadline.assessment_id) },
    })
    return
  }

  if (itemType === 'quiz' && deadline.assessment_id) {
    router.push({
      name: 'StudentQuiz',
      query: {
        deadlineId: String(deadline.assessment_id),
        moduleId: deadline.module_id ? String(deadline.module_id) : undefined,
      },
    })
    return
  }

  if (deadline.module_id) {
    router.push(`/student/modules/${deadline.module_id}`)
  }
}

function formatDeadline(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
