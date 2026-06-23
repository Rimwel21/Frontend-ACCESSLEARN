<template>
  <div class="space-y-5">
    <div class="flex items-end justify-between">
      <div>
        <nav class="flex items-center gap-1.5 text-xs font-mono mb-1">
          <span @click="router.push('/teacher/class')" class="text-ink-soft hover:text-brand-blue cursor-pointer transition-colors">Class Management</span>
          <span class="text-gray-300">›</span>
          <span class="text-ink font-semibold">Quizzes/Activities</span>
        </nav>
        <h2 class="font-display text-2xl font-bold">🧪 Quizzes / Activities</h2>
      </div>
      <div class="flex gap-2.5">
        <button class="btn-primary">📝 Create Quiz</button>
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
        <div><div class="font-display text-2xl font-bold">{{ store.quizzes.length }}</div><div class="text-xs text-ink-soft font-medium">Published</div></div>
      </div>
      <div class="card p-5 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center text-xl">📬</div>
        <div><div class="font-display text-2xl font-bold">3</div><div class="text-xs text-ink-soft font-medium">Total Submissions</div></div>
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
          <tr v-for="q in store.quizzes" :key="q.id" class="hover:bg-gray-50 transition-colors">
            <td class="table-td font-medium">{{ q.title }}</td>
            <td class="table-td text-ink-soft text-xs">{{ q.module }}</td>
            <td class="table-td"><span class="badge badge-blue">{{ q.type }}</span></td>
            <td class="table-td"><span :class="diffBadge(q.difficulty)">{{ q.difficulty }}</span></td>
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
import { useRouter } from 'vue-router'
import { useTeacherStore } from '@/stores/teacher'

const router = useRouter()
const store  = useTeacherStore()

function diffBadge(d: string) {
  return d === 'Easy' ? 'badge badge-green' : d === 'Hard' ? 'badge badge-red' : 'badge badge-amber'
}
</script>
