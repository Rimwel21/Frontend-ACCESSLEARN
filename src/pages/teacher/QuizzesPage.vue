<template>
  <div class="space-y-5">
    <div class="flex items-end justify-between">
      <div>
        <Breadcrumb :crumbs="[{ label:'Class Management', to:'/teacher/class' }, { label:'Quizzes/Activities' }]" />
        <h2 class="font-display text-2xl font-bold">🧪 Quizzes / Activities</h2>
      </div>
      <div class="flex gap-2.5">
        <RouterLink to="/teacher/quizzes/new" class="btn-primary">📝 Create Quiz</RouterLink>
        <button class="px-5 py-2.5 rounded-full gradient-violet text-white text-sm font-semibold hover:-translate-y-px transition-all">🎯 Create Activity</button>
      </div>
    </div>

    <div class="gradient-amber rounded-xl px-6 py-3.5">
      <p class="text-white text-sm">Create, schedule, and review all quizzes and class activities</p>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="card p-5 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-xl">📝</div>
        <div><div class="font-display text-2xl font-bold">{{ store.quizzes.length }}</div><div class="text-xs text-ink-soft font-medium">Total Quizzes</div></div>
      </div>
      <div class="card p-5 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">✅</div>
        <div><div class="font-display text-2xl font-bold">{{ store.publishedQuizzes.length }}</div><div class="text-xs text-ink-soft font-medium">Published</div></div>
      </div>
      <div class="card p-5 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center text-xl">📬</div>
        <div><div class="font-display text-2xl font-bold">3</div><div class="text-xs text-ink-soft font-medium">Total Submissions</div></div>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 w-60 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        <span class="text-sm">🔍</span>
        <input v-model="search" class="border-0 bg-transparent outline-none text-sm font-body flex-1" placeholder="Search Quiz…" />
      </div>
      <div class="flex gap-2">
        <button v-for="tab in tabs" :key="tab" @click="activeTab = tab"
          :class="['text-xs font-semibold px-4 py-2 rounded-full border transition-all',
            activeTab === tab ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-ink-soft border-gray-200 hover:border-brand-blue hover:text-brand-blue']">
          {{ tab }}
        </button>
      </div>
    </div>

    <div class="card overflow-hidden">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="table-th">Quiz/Activity</th>
            <th class="table-th">Module</th>
            <th class="table-th">Type</th>
            <th class="table-th">Difficulty</th>
            <th class="table-th">Date</th>
            <th class="table-th">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="q in filtered" :key="q.id" class="hover:bg-gray-50 transition-colors">
            <td class="table-td font-medium">{{ q.title }}</td>
            <td class="table-td text-ink-soft text-xs font-mono">{{ q.moduleId }}</td>
            <td class="table-td"><span class="badge badge-blue">{{ q.type }}</span></td>
            <td class="table-td">
              <span :class="diffBadge(q.difficulty)">{{ q.difficulty }}</span>
            </td>
            <td class="table-td font-mono text-xs">{{ q.date }}</td>
            <td class="table-td">
              <div class="flex gap-2">
                <button class="text-xs px-3 py-1.5 rounded-lg bg-brand-blue text-white hover:bg-blue-700 transition-all">View</button>
                <button class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-brand-blue hover:text-brand-blue transition-all">✏️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAppStore } from '@/stores/app'
import Breadcrumb from '@/components/common/Breadcrumb.vue'

const store     = useAppStore()
const search    = ref('')
const activeTab = ref('All')
const tabs      = ['All', 'Quizzes', 'Activities']

const filtered = computed(() => store.quizzes.filter(q =>
  !search.value || q.title.toLowerCase().includes(search.value.toLowerCase())
))
function diffBadge(d: string) {
  return d === 'Easy' ? 'badge badge-green' : d === 'Hard' ? 'badge badge-red' : 'badge badge-amber'
}
</script>
