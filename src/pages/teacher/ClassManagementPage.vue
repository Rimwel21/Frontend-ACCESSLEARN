<template>
  <div class="space-y-6">
    <!-- Header banner -->
    <div class="gradient-brand rounded-2xl px-7 py-5 flex items-center justify-between">
      <div>
        <h2 class="font-display text-2xl font-bold text-white">📚 Class Management</h2>
        <p class="text-white/75 text-sm mt-1">Manage modules, track progress, and create quizzes</p>
      </div>
      <button class="px-5 py-2.5 rounded-full border border-white/40 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold hover:bg-white/30 transition-all">+ New Class</button>
    </div>

    <!-- Stats strip -->
    <div class="grid grid-cols-3 gap-4">
      <div class="card p-5 flex items-center gap-4">
        <span class="text-3xl">👥</span>
        <div><div class="font-display text-2xl font-bold">48</div><div class="text-xs text-ink-soft font-medium">Total Students</div></div>
      </div>
      <div class="card p-5 flex items-center gap-4">
        <span class="text-3xl">📘</span>
        <div><div class="font-display text-2xl font-bold">{{ store.publishedModules.length }}</div><div class="text-xs text-ink-soft font-medium">Active Modules</div></div>
      </div>
      <div class="card p-5 flex items-center gap-4">
        <span class="text-3xl">📈</span>
        <div class="flex-1">
          <div class="font-display text-2xl font-bold">74%</div>
          <div class="text-xs text-ink-soft font-medium mb-2">Avg. Progress</div>
          <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div class="h-full gradient-brand rounded-full" style="width:74%" /></div>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="grid grid-cols-[1fr_210px] gap-5">
      <!-- Section cards -->
      <div class="space-y-4">
        <div v-for="section in sections" :key="section.title" class="card-hover cursor-pointer" @click="router.push(section.to)">
          <div class="flex">
            <div :class="`w-1.5 flex-shrink-0 rounded-l-xl ${section.accent}`" />
            <div class="flex-1 p-5">
              <h3 class="font-display text-base font-semibold mb-2">{{ section.title }}</h3>
              <p class="text-sm text-ink-soft leading-relaxed">{{ section.description }}</p>
              <div class="flex items-center justify-between mt-4">
                <div class="flex gap-4">
                  <span v-for="meta in section.meta" :key="meta" class="text-[11.5px] text-ink-soft">{{ meta }}</span>
                </div>
                <button :class="`text-white text-xs font-bold px-4 py-2 rounded-full ${section.btnClass}`">{{ section.btnLabel }} →</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side -->
      <div class="space-y-4">
        <!-- Quick actions -->
        <div class="card p-4">
          <div class="font-display text-[13px] font-semibold mb-3">⚡ Quick Actions</div>
          <div class="space-y-2">
            <button @click="router.push('/teacher/modules/new')" class="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all">➕ Add Module</button>
            <button @click="router.push('/teacher/quizzes/new')" class="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl gradient-violet text-white text-[13px] font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all">📝 Create Quiz</button>
            <button class="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl gradient-teal text-white text-[13px] font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all">📣 Announce</button>
          </div>
        </div>

        <!-- Recent activities -->
        <div class="card p-4 flex-1">
          <div class="font-display text-[13px] font-semibold mb-3">🕐 Recent Activities</div>
          <div class="space-y-3">
            <div v-for="act in store.recentActivities" :key="act.text" class="flex items-start gap-2.5 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
              <div :class="`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${act.color}`" />
              <div>
                <div class="text-xs text-ink-soft leading-relaxed">{{ act.text }}</div>
                <div class="text-[10px] font-mono text-gray-400 mt-0.5">{{ act.time }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
const router = useRouter()
const store  = useAppStore()

const sections = [
  {
    title: '📖 Modules / Learning Materials',
    description: 'Manage and organize all learning modules, upload materials, set deadlines, and track completion rates.',
    accent: 'bg-gradient-to-b from-brand-blue to-brand-violet',
    btnClass: 'bg-gradient-to-r from-brand-blue to-brand-violet',
    btnLabel: 'Manage', to: '/teacher/modules',
    meta: [`📘 ${useAppStore().modules.length} modules`, `✅ ${useAppStore().publishedModules.length} published`],
  },
  {
    title: '📊 Students Progress',
    description: 'Monitor individual and class-wide progress, view completion rates, and identify students who need extra support.',
    accent: 'bg-gradient-to-b from-brand-teal to-brand-green',
    btnClass: 'bg-gradient-to-r from-brand-teal to-brand-green',
    btnLabel: 'View', to: '/teacher/progress',
    meta: ['👥 48 students', `⚠️ ${useAppStore().atRiskStudents.length} at risk`],
  },
  {
    title: '🧪 Quizzes / Activities',
    description: 'Create, schedule, and review quizzes. Track scores and generate performance reports for each assessment.',
    accent: 'bg-gradient-to-b from-brand-amber to-brand-rose',
    btnClass: 'bg-gradient-to-r from-brand-amber to-brand-rose',
    btnLabel: 'Review', to: '/teacher/quizzes',
    meta: [`📝 ${useAppStore().quizzes.length} quizzes`, `⏳ 3 pending`],
  },
]
</script>
