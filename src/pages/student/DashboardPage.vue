<template>
  <div class="min-h-screen bg-surface">
    <div class="space-y-5 px-5 py-5 xl:px-7">
      <div class="min-w-0">
        <section class="relative border-[3px] border-brand-teal bg-white shadow-card">
          <div class="flex items-center gap-3 px-4 py-3">
            <svg class="h-5 w-5 flex-shrink-0 text-brand-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35" />
              <circle cx="11" cy="11" r="7" />
            </svg>
            <input
              v-model="search"
              class="min-w-0 flex-1 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-ink-soft"
              type="search"
              placeholder="Search lesson, quiz, activities..."
              aria-label="Search lesson, quiz, activities"
            />
            <button
              type="button"
              class="hidden border-l border-brand-teal/30 pl-4 font-mono text-xs font-black uppercase tracking-wider text-brand-blue transition hover:text-brand-amber sm:block"
              @click="searchResults[0] ? openSearchResult(searchResults[0]) : null"
            >
              Search
            </button>
          </div>

          <div
            v-if="hasSearch"
            class="absolute left-0 right-0 top-[calc(100%+6px)] z-30 border-[3px] border-brand-teal bg-white p-2 shadow-card-hover"
          >
            <button
              v-for="result in searchResults"
              :key="result.id"
              type="button"
              class="flex w-full items-center gap-3 border-b border-brand-teal/15 px-3 py-2 text-left last:border-b-0 hover:bg-brand-blue-soft"
              @click="openSearchResult(result)"
            >
              <span class="grid h-8 w-8 place-items-center border-[2px] border-brand-teal bg-brand-blue-soft font-mono text-[10px] font-black text-brand-blue">
                {{ result.type.slice(0, 2).toUpperCase() }}
              </span>
              <span class="min-w-0">
                <span class="block truncate text-sm font-black text-ink">{{ result.title }}</span>
                <span class="block truncate text-xs font-semibold text-ink-soft">{{ result.type }} | {{ result.meta }}</span>
              </span>
            </button>
            <div v-if="searchResults.length === 0" class="px-3 py-2 text-sm font-bold text-ink-soft">
              No matching lesson, quiz, or activity found.
            </div>
          </div>
        </section>

        <!-- Main Content Area -->
        <div class="min-w-0 space-y-6">
          <!-- Welcome Banner with Module Stats -->
          <section class="border-[3px] border-brand-teal bg-gradient-to-br from-brand-blue via-brand-teal to-brand-blue p-6 text-white shadow-card">
            <div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 class="font-display text-[26px] font-black leading-tight text-white md:text-[30px]">Welcome, {{ welcomeName }}!</h1>
                <p class="mt-1 font-mono text-[11px] font-bold tracking-widest text-white/90">MY LEARNING DASHBOARD</p>
              </div>
              <!-- Quick Category Counter Badges -->
              <div class="flex flex-wrap gap-2 font-mono text-xs">
                <button
                  type="button"
                  class="flex items-center gap-1.5 border-[2px] border-white bg-white/10 px-3 py-1.5 font-bold transition hover:bg-white hover:text-ink"
                  @click="activeTab = 'new'"
                >
                  <span class="inline-block h-2 w-2 rounded-full bg-amber-400" />
                  <span>{{ newModules.length }} New</span>
                </button>
                <button
                  type="button"
                  class="flex items-center gap-1.5 border-[2px] border-white bg-white/10 px-3 py-1.5 font-bold transition hover:bg-white hover:text-ink"
                  @click="activeTab = 'in_progress'"
                >
                  <span class="inline-block h-2 w-2 rounded-full bg-sky-300" />
                  <span>{{ inProgressModules.length }} In Progress</span>
                </button>
                <button
                  type="button"
                  class="flex items-center gap-1.5 border-[2px] border-white bg-white/10 px-3 py-1.5 font-bold transition hover:bg-white hover:text-ink"
                  @click="activeTab = 'finished'"
                >
                  <span class="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                  <span>{{ finishedModules.length }} Finished</span>
                </button>
              </div>
            </div>
          </section>

          <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
            <section class="border-[3px] border-brand-teal bg-white shadow-card xl:order-2">
              <div class="flex items-center justify-between border-b-[3px] border-brand-teal/30 bg-brand-amber px-3 py-2 text-white">
                <button type="button" class="grid h-7 w-7 place-items-center font-black hover:bg-white/15" aria-label="Previous month" @click="calendarOffset--">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m15 18-6-6 6-6" /></svg>
                </button>
                <div class="text-center">
                  <h2 class="font-display text-sm font-black">{{ calendarTitle }}</h2>
                  <p class="font-mono text-[10px] font-bold">{{ calendarYear }}</p>
                </div>
                <button type="button" class="grid h-7 w-7 place-items-center font-black hover:bg-white/15" aria-label="Next month" @click="calendarOffset++">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" /></svg>
                </button>
              </div>
              <div class="grid grid-cols-7 gap-1 p-3 text-center font-mono text-[11px] font-black text-brand-blue">
                <div v-for="day in weekDays" :key="day" class="py-1">{{ day }}</div>
                <div v-for="blank in calendarLeadingBlanks" :key="`blank-${blank}`" aria-hidden="true"></div>
                <div
                  v-for="day in calendarDays"
                  :key="day"
                  :class="[
                    'grid aspect-square place-items-center',
                    isToday(day) ? 'bg-brand-blue text-white' : 'text-ink hover:bg-brand-blue-soft'
                  ]"
                >
                  {{ day }}
                </div>
              </div>
            </section>

            <section class="border-[3px] border-brand-teal bg-white shadow-card xl:order-1">
              <div class="flex items-center gap-2 border-b-[3px] border-brand-teal/30 bg-brand-blue px-4 py-3">
                <svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3M4 11h16M5 5h14v16H5z" /></svg>
                <h2 class="font-display text-sm font-black uppercase tracking-widest text-white">Upcoming Deadlines</h2>
              </div>
              <div class="scrollbar-thin flex gap-3 overflow-x-auto p-3 xl:block xl:space-y-2">
                <button
                  v-for="deadline in filteredDeadlines"
                  :key="deadline.id"
                  type="button"
                  class="min-w-[210px] border-[2px] border-brand-teal bg-surface p-3 text-left transition hover:border-brand-amber xl:w-full xl:min-w-0"
                  @click="openDeadline(deadline)"
                >
                  <div class="text-xs font-black">{{ deadline.title }}</div>
                  <div class="mt-1 font-mono text-[10px] font-bold text-ink-soft">{{ deadline.item_type }} | {{ formatDeadline(deadline.due_at) }}</div>
                </button>
                <div v-if="filteredDeadlines.length === 0" class="text-xs font-bold text-ink-soft">No upcoming deadlines.</div>
              </div>
            </section>
          </div>

          <!-- Module Layout Navigation Tabs -->
          <section>
            <div class="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-brand-teal pb-3">
              <div class="flex flex-wrap items-center gap-2">
                <button
                  :class="[
                    'border-[2.5px] border-brand-teal px-3.5 py-1.5 font-display text-xs font-black uppercase tracking-wider transition-all shadow-sm',
                    activeTab === 'all'
                      ? 'bg-brand-teal text-white shadow-card-hover -translate-y-0.5'
                      : 'bg-white text-ink hover:bg-brand-blue-soft'
                  ]"
                  @click="activeTab = 'all'"
                >
                  All Modules ({{ allFilteredModules.length }})
                </button>

                <button
                  :class="[
                    'border-[2.5px] border-brand-teal px-3.5 py-1.5 font-display text-xs font-black uppercase tracking-wider transition-all shadow-sm',
                    activeTab === 'new'
                      ? 'bg-brand-amber text-white shadow-card-hover -translate-y-0.5'
                      : 'bg-white text-ink hover:bg-brand-amber/10'
                  ]"
                  @click="activeTab = 'new'"
                >
                  <svg class="mr-1 inline h-3.5 w-3.5 align-[-2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" /></svg> New Uploads ({{ newModules.length }})
                </button>

                <button
                  :class="[
                    'border-[2.5px] border-brand-teal px-3.5 py-1.5 font-display text-xs font-black uppercase tracking-wider transition-all shadow-sm',
                    activeTab === 'in_progress'
                      ? 'bg-brand-blue text-white shadow-card-hover -translate-y-0.5'
                      : 'bg-white text-ink hover:bg-brand-blue-soft'
                  ]"
                  @click="activeTab = 'in_progress'"
                >
                  <svg class="mr-1 inline h-3.5 w-3.5 align-[-2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v5l3 2" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 3a9 9 0 1 0 9 9" /></svg> In Progress ({{ inProgressModules.length }})
                </button>

                <button
                  :class="[
                    'border-[2.5px] border-brand-teal px-3.5 py-1.5 font-display text-xs font-black uppercase tracking-wider transition-all shadow-sm',
                    activeTab === 'finished'
                      ? 'bg-emerald-600 text-white shadow-card-hover -translate-y-0.5'
                      : 'bg-white text-ink hover:bg-emerald-50'
                  ]"
                  @click="activeTab = 'finished'"
                >
                  <svg class="mr-1 inline h-3.5 w-3.5 align-[-2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M20 6 9 17l-5-5" /></svg> Finished & Review ({{ finishedModules.length }})
                </button>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="content.loading" class="mt-4 border-[3px] border-brand-teal bg-white p-6 text-sm font-black shadow-card">
              Loading learning modules...
            </div>

            <!-- Empty State -->
            <div v-else-if="displayedModules.length === 0" class="mt-4 border-[3px] border-brand-teal bg-white p-8 text-center shadow-card">
              <h3 class="font-display text-lg font-black text-ink">
                {{ getEmptyStateTitle() }}
              </h3>
              <p class="mt-2 text-sm font-medium text-ink-soft">
                {{ getEmptyStateMessage() }}
              </p>
            </div>

            <!-- Organized Modules Grid / List -->
            <div v-else class="mt-5 space-y-8">
              <!-- SECTION 1: NEW UPLOADS -->
              <div v-if="(activeTab === 'all' || activeTab === 'new') && newModules.length > 0" class="space-y-3">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center gap-1 border-[2px] border-brand-teal bg-brand-amber px-2.5 py-0.5 font-display text-[11px] font-black uppercase tracking-wider text-white">
                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" /></svg> NEW UPLOADS
                  </span>
                  <span class="font-mono text-xs font-bold text-ink-soft">Recently added lessons ready for you</span>
                  <div class="h-[2px] flex-1 bg-brand-teal/30" />
                </div>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <article
                    v-for="module in newModules"
                    :key="`new-${module.id}`"
                    class="group flex flex-col justify-between border-[3px] border-brand-teal bg-white p-4 shadow-card transition-all hover:-translate-y-1 hover:border-brand-amber hover:shadow-card-hover"
                  >
                    <div>
                      <div class="flex items-start justify-between gap-2">
                        <span class="border border-brand-teal bg-amber-100 px-2 py-0.5 font-mono text-[9px] font-black uppercase text-amber-900">
                          NEW UPLOAD
                        </span>
                        <span v-if="module.file_type || module.content_type" class="font-mono text-[10px] font-bold text-ink-soft uppercase">
                          {{ module.file_type || module.content_type }}
                        </span>
                      </div>

                      <h4 class="mt-2 font-display text-base font-black leading-snug text-ink group-hover:text-brand-blue">
                        {{ module.title }}
                      </h4>
                      <p class="mt-1 line-clamp-2 text-xs text-ink-soft">
                        {{ module.description || 'No description provided.' }}
                      </p>

                      <div class="mt-3 flex items-center gap-3 font-mono text-[11px] text-ink-soft">
                        <span class="inline-flex items-center gap-1"><svg class="h-3.5 w-3.5 text-brand-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 19.5V5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2" /><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h6" /></svg> {{ module.topics.length }} topics</span>
                        <span v-if="module.assessments.length > 0" class="inline-flex items-center gap-1"><svg class="h-3.5 w-3.5 text-brand-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 11a3 3 0 1 1 3 3v1" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 19h.01" /><path stroke-linecap="round" stroke-linejoin="round" d="M4 4h16v16H4z" /></svg> {{ module.assessments.length }} quizzes</span>
                      </div>
                    </div>

                    <div class="mt-4 border-t border-brand-teal/20 pt-3">
                      <button
                        type="button"
                        class="w-full border-[2.5px] border-brand-teal bg-brand-amber py-2 text-center font-display text-xs font-black uppercase tracking-wider text-white transition hover:bg-brand-rose"
                        @click="router.push(`/student/modules/${module.id}`)"
                      >
                        Start Lesson
                      </button>
                    </div>
                  </article>
                </div>
              </div>

              <!-- SECTION 2: IN PROGRESS -->
              <div v-if="(activeTab === 'all' || activeTab === 'in_progress') && inProgressModules.length > 0" class="space-y-3">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center gap-1 border-[2px] border-brand-teal bg-brand-blue px-2.5 py-0.5 font-display text-[11px] font-black uppercase tracking-wider text-white">
                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v5l3 2" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 3a9 9 0 1 0 9 9" /></svg> IN PROGRESS
                  </span>
                  <span class="font-mono text-xs font-bold text-ink-soft">Keep going where you left off</span>
                  <div class="h-[2px] flex-1 bg-brand-teal/30" />
                </div>

                <div class="space-y-3">
                  <article
                    v-for="module in inProgressModules"
                    :key="`progress-${module.id}`"
                    class="flex flex-wrap items-center gap-4 border-[3px] border-brand-teal bg-white p-4 shadow-card transition-all hover:-translate-y-1 hover:border-brand-blue hover:shadow-card-hover sm:flex-nowrap"
                  >
                    <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center border-[3px] border-brand-teal bg-brand-blue-soft font-display text-sm font-black text-brand-blue">
                      {{ getModulePercent(module.id) }}%
                    </div>

                    <div class="min-w-[200px] flex-1">
                      <div class="flex items-center gap-2">
                        <h4 class="font-display text-base font-black text-ink">{{ module.title }}</h4>
                        <span v-if="module.behavior_required" class="border border-brand-teal bg-surface px-1.5 py-0.5 font-mono text-[9px] font-black uppercase text-brand-blue">Required</span>
                      </div>
                      <p class="mt-0.5 line-clamp-1 font-mono text-xs text-ink-soft">{{ module.description }}</p>

                      <!-- Progress Bar -->
                      <div class="mt-2 flex items-center gap-3">
                        <div class="h-[10px] flex-1 overflow-hidden border-[2px] border-brand-teal bg-surface">
                          <div class="h-full bg-brand-blue transition-all duration-300" :style="{ width: `${getModulePercent(module.id)}%` }" />
                        </div>
                        <span class="whitespace-nowrap font-mono text-xs font-bold text-ink">{{ getModulePercent(module.id) }}% Completed</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      class="ml-auto flex-shrink-0 border-[3px] border-brand-teal bg-brand-amber px-5 py-2.5 font-display text-xs font-black uppercase tracking-wider text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-brand-rose"
                      @click="router.push(`/student/modules/${module.id}`)"
                    >
                      Continue
                    </button>
                  </article>
                </div>
              </div>

              <!-- SECTION 3: FINISHED & REVIEW -->
              <div v-if="(activeTab === 'all' || activeTab === 'finished') && finishedModules.length > 0" class="space-y-3">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center gap-1 border-[2px] border-brand-teal bg-emerald-600 px-2.5 py-0.5 font-display text-[11px] font-black uppercase tracking-wider text-white">
                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M20 6 9 17l-5-5" /></svg> FINISHED & REVIEW
                  </span>
                  <span class="font-mono text-xs font-bold text-emerald-800">Completed modules stay available for view and review</span>
                  <div class="h-[2px] flex-1 bg-emerald-600/30" />
                </div>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <article
                    v-for="module in finishedModules"
                    :key="`finished-${module.id}`"
                    class="group flex flex-col justify-between border-[3px] border-emerald-600 bg-emerald-50/40 p-4 shadow-card transition-all hover:-translate-y-1 hover:border-emerald-700 hover:shadow-card-hover"
                  >
                    <div>
                      <div class="flex items-center justify-between">
                        <span class="inline-flex items-center gap-1 border border-emerald-600 bg-emerald-100 px-2 py-0.5 font-mono text-[9px] font-black uppercase text-emerald-800">
                          <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M20 6 9 17l-5-5" /></svg> COMPLETED
                        </span>
                        <span class="font-mono text-[10px] font-bold text-emerald-700">100% DONE</span>
                      </div>

                      <h4 class="mt-2 font-display text-base font-black text-ink group-hover:text-emerald-700">
                        {{ module.title }}
                      </h4>
                      <p class="mt-1 line-clamp-2 text-xs text-ink-soft">
                        {{ module.description || 'Completed learning module.' }}
                      </p>

                      <div class="mt-3 flex items-center gap-2 border-t border-emerald-600/20 pt-2 font-mono text-[10px] font-semibold text-emerald-800">
                        <span class="inline-flex items-center gap-1"><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 19.5V5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2" /></svg> Review slides & notes</span>
                        <span>|</span>
                        <span>Quiz completed</span>
                      </div>
                    </div>

                    <div class="mt-4">
                      <button
                        type="button"
                        class="w-full border-[2.5px] border-emerald-700 bg-emerald-600 py-2 text-center font-display text-xs font-black uppercase tracking-wider text-white transition hover:bg-emerald-700"
                        @click="router.push(`/student/modules/${module.id}`)"
                      >
                        Review Lesson
                      </button>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>
        </div>

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
type ModuleTab = 'all' | 'new' | 'in_progress' | 'finished'

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
const activeTab = ref<ModuleTab>('all')

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

// Helper: Get progress percentage for module
function getModulePercent(moduleId: number): number {
  return content.progressByModule[moduleId]?.percent ?? 0
}

// All modules matching search filter
const allFilteredModules = computed(() => content.modules.filter(module => matchesModule(module)))

// Categorized Module Collections
const newModules = computed(() => allFilteredModules.value.filter(module => getModulePercent(module.id) === 0))
const inProgressModules = computed(() => allFilteredModules.value.filter(module => {
  const pct = getModulePercent(module.id)
  return pct > 0 && pct < 100
}))
const finishedModules = computed(() => allFilteredModules.value.filter(module => getModulePercent(module.id) === 100))

// Displayed Modules based on Active Tab
const displayedModules = computed(() => {
  if (activeTab.value === 'new') return newModules.value
  if (activeTab.value === 'in_progress') return inProgressModules.value
  if (activeTab.value === 'finished') return finishedModules.value
  return allFilteredModules.value
})

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

function getEmptyStateTitle() {
  if (hasSearch.value) return `No modules match "${search.value.trim()}"`
  if (activeTab.value === 'new') return 'No new module uploads available'
  if (activeTab.value === 'in_progress') return 'No modules currently in progress'
  if (activeTab.value === 'finished') return 'No finished modules yet'
  return 'No learning materials available'
}

function getEmptyStateMessage() {
  if (hasSearch.value) return 'Try searching for another lesson, quiz, or keyword.'
  if (activeTab.value === 'new') return 'Check back later for newly published lessons from your teacher.'
  if (activeTab.value === 'in_progress') return 'Start a new upload module to track your progress here.'
  if (activeTab.value === 'finished') return 'Complete all topics and quizzes in a module to unlock review mode!'
  return 'Published teacher uploads will appear here automatically.'
}
</script>
