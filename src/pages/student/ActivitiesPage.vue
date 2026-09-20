<template>
  <div class="flex min-h-screen flex-col bg-surface lg:h-full lg:min-h-0 lg:overflow-hidden">
    <div class="border-b-[3px] border-brand-teal bg-gradient-to-r from-brand-blue to-brand-teal px-4 py-5 shadow-card sm:px-8 sm:py-6">
      <h1 class="flex items-center gap-3 font-display text-2xl font-black text-white sm:text-[28px]">
        <svg class="h-7 w-7 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" /></svg>
        Activities
      </h1>
    </div>

    <div class="min-h-0 flex-1 px-4 py-5 sm:px-7 sm:py-6">
      <div class="grid h-full min-h-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div class="flex min-h-0 flex-col">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 class="font-display text-sm font-black uppercase tracking-widest">Assigned Activities</h2>
            <button
              class="border-[3px] border-brand-teal bg-white px-4 py-2 text-xs font-black text-brand-blue shadow-card transition-all hover:-translate-y-1 hover:border-brand-amber hover:shadow-card-hover"
              @click="content.fetchActivities()"
            >
              <span class="inline-flex items-center gap-2">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 0 1-15.5 6.3L3 16" /><path stroke-linecap="round" stroke-linejoin="round" d="M3 21v-5h5" /><path stroke-linecap="round" stroke-linejoin="round" d="M3 12a9 9 0 0 1 15.5-6.3L21 8" /><path stroke-linecap="round" stroke-linejoin="round" d="M21 3v5h-5" /></svg>
                Refresh
              </span>
            </button>
          </div>

          <div v-if="content.loading" class="border-[3px] border-brand-teal bg-white p-6 text-sm font-black shadow-card">
            Loading activities...
          </div>
          <div v-else-if="content.error" class="border-[3px] border-brand-rose bg-brand-rose/10 p-6 text-sm font-black text-brand-rose shadow-card">
            {{ content.error }}
          </div>
          <div v-else-if="activities.length === 0" class="border-[3px] border-brand-teal bg-white p-8 text-center shadow-card">
            <h2 class="font-display text-lg font-black">No activities assigned yet.</h2>
            <p class="mt-2 text-sm text-ink-soft">Activities created by your teacher will appear here when they belong to your enrolled class.</p>
          </div>

          <div v-else class="scrollbar-thin space-y-3 xl:max-h-[calc(100vh-11rem)] xl:overflow-y-auto xl:pr-2">
            <div
              v-for="act in paginatedActivities"
              :key="act.id"
              :class="[
                'flex cursor-pointer flex-wrap items-center gap-3 border-[3px] bg-white p-4 shadow-card transition-all hover:-translate-y-1 hover:border-brand-amber hover:shadow-card-hover sm:flex-nowrap sm:gap-4',
                selectedActivityId === act.id ? 'border-brand-amber ring-2 ring-brand-amber/30' : 'border-brand-teal',
              ]"
              @click="openActivity(act)"
            >
              <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center border-[3px] border-brand-teal bg-brand-blue-soft text-xs font-black text-brand-blue">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" /></svg>
              </div>

              <div class="min-w-0 flex-1">
                <div class="text-[14px] font-black">{{ act.title }}</div>
                <div class="mt-0.5 truncate font-mono text-[11px] text-ink-soft">{{ act.description }}</div>
                <div class="mt-1 font-mono text-[10px] font-bold text-ink-soft">{{ act.category || 'Activity' }}</div>
              </div>

              <div class="flex items-center gap-3 ml-auto">
                <div class="text-right">
                  <div class="font-mono text-[11px] font-bold text-ink">{{ act.timeLimit || 'No time limit' }}</div>
                </div>
                <span :class="['border-[2px] border-brand-teal px-2.5 py-1.5 font-mono text-[10px] font-black', statusStyle(act.status)]">
                  {{ act.status }}
                </span>
                <svg class="h-4 w-4 flex-shrink-0 text-ink-soft" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
              </div>
            </div>
            <PaginationControls
              v-model:current-page="activityPage"
              :total-items="activities.length"
              :page-size="activityPageSize"
            />
          </div>
        </div>

        <aside class="space-y-4 xl:sticky xl:top-0 xl:self-start">
          <div class="border-[3px] border-brand-teal bg-white shadow-card">
            <div class="border-b-[3px] border-brand-teal/30 bg-brand-blue px-3.5 py-2.5">
              <span class="font-display text-[12px] font-black uppercase tracking-wide text-white">In Progress</span>
            </div>
            <div class="scrollbar-thin max-h-52 space-y-2 overflow-y-auto p-3">
              <div v-if="inProgress.length === 0" class="text-xs font-bold text-ink-soft">No activities in progress.</div>
              <button
                v-for="act in inProgress"
                :key="`progress-${act.id}`"
                class="block w-full truncate border-[2px] border-brand-teal bg-white px-2 py-1.5 text-left text-[11px] font-black text-brand-blue hover:bg-brand-blue-soft"
                @click="openActivity(act)"
              >
                {{ act.title }}
              </button>
            </div>
          </div>

          <div class="border-[3px] border-brand-teal bg-white shadow-card">
            <div class="border-b-[3px] border-brand-teal/30 bg-brand-blue px-3.5 py-2.5">
              <span class="font-display text-[12px] font-black uppercase tracking-wide text-white">Assigned</span>
            </div>
            <div class="scrollbar-thin max-h-52 overflow-y-auto p-3">
              <div class="text-xs font-bold text-ink-soft">{{ activities.length }} activity{{ activities.length === 1 ? '' : 'ies' }}</div>
              <button v-for="act in activities.filter(activity => activity.status === 'Not Started')" :key="`assigned-${act.id}`" class="mt-2 block w-full truncate border-[2px] border-brand-teal bg-white px-2 py-1.5 text-left text-[11px] font-black text-brand-blue hover:bg-brand-blue-soft" @click="openActivity(act)">
                {{ act.title }}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PaginationControls from '@/components/common/PaginationControls.vue'
import { useStudentContentStore } from '@/stores/studentContent'

type ActivityStatus = 'In Progress' | 'Not Started' | 'Finished'

interface ActivityRow {
  id: number
  title: string
  description: string
  category?: string | null
  timeLimit?: string | null
  startedAt?: string | null
  status: ActivityStatus
}

const router = useRouter()
const route = useRoute()
const content = useStudentContentStore()
const selectedActivityId = computed(() => route.query.deadlineId ? Number(route.query.deadlineId) : null)
const activityPage = ref(1)
const activityPageSize = 6

const activities = computed<ActivityRow[]>(() => content.activities.map(assessment => ({
  id: assessment.id,
  title: assessment.title,
  description: assessment.description,
  category: assessment.category,
  timeLimit: assessment.time_limit,
  startedAt: assessment.student_started_at,
  status: assessment.student_status === 'completed'
    ? 'Finished'
    : (assessment.student_status === 'in_progress' || assessment.student_started_at ? 'In Progress' : 'Not Started'),
})))

const inProgress = computed(() => activities.value.filter(activity => activity.status === 'In Progress'))
const paginatedActivities = computed(() => {
  const start = (activityPage.value - 1) * activityPageSize
  return activities.value.slice(start, start + activityPageSize)
})

watch(() => activities.value.length, () => {
  activityPage.value = 1
})

onMounted(() => {
  content.fetchActivities()
})

function openActivity(activity: ActivityRow) {
  router.push({
    name: 'HandSignLanguage',
    query: {
      activityId: String(activity.id),
    },
  })
}

function statusStyle(status: ActivityStatus) {
  switch (status) {
    case 'In Progress': return 'bg-brand-amber/25 text-brand-blue'
    case 'Finished': return 'bg-brand-teal/15 text-brand-teal'
    case 'Not Started': return 'bg-surface text-ink-soft'
    default: return 'bg-white'
  }
}
</script>
