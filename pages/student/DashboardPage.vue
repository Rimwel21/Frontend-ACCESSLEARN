<template>
  <div>
    <!-- Hero -->
    <div class="gradient-brand px-8 py-7 flex items-center justify-between relative overflow-hidden">
      <div class="absolute inset-0 opacity-5" style="background-image:radial-gradient(circle,#fff 1px,transparent 1px);background-size:28px 28px;" />
      <div class="relative z-10">
        <h1 class="font-display text-3xl font-bold text-white mb-2">Welcome, Aguiluz! 👋</h1>
        <p class="text-yellow-300 font-mono text-xs tracking-widest">▶ READY TO STUDY?</p>
      </div>
      <div class="text-6xl relative z-10 animate-[float_3s_ease-in-out_infinite]">🧪📓</div>
    </div>

    <div class="p-6 space-y-6">
      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4">
        <div class="card p-4 flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-brand-blue-soft flex items-center justify-center text-lg">📘</div><div><div class="font-display text-xl font-bold">4</div><div class="text-xs text-ink-soft">Modules</div></div></div>
        <div class="card p-4 flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-lg">✅</div><div><div class="font-display text-xl font-bold">2</div><div class="text-xs text-ink-soft">Completed</div></div></div>
        <div class="card p-4 flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-lg">📝</div><div><div class="font-display text-xl font-bold">3</div><div class="text-xs text-ink-soft">Quizzes</div></div></div>
        <div class="card p-4 flex items-center gap-3"><div class="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-lg">⏰</div><div><div class="font-display text-xl font-bold">2</div><div class="text-xs text-ink-soft">Deadlines</div></div></div>
      </div>

      <div class="grid grid-cols-[1fr_200px] gap-5">
        <div class="space-y-5">
          <!-- Modules -->
          <div>
            <h2 class="font-display font-semibold text-base mb-3 flex items-center gap-2">Modules <span class="flex-1 h-0.5 bg-gray-100 rounded-full ml-2" /></h2>
            <div class="grid grid-cols-4 gap-3">
              <RouterLink v-for="(mod, i) in modules" :key="mod.id" :to="mod.locked ? '#' : '/student/topic'" :class="['card-hover overflow-hidden', mod.locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer']">
                <div :class="['h-24 flex items-center justify-center text-4xl border-b border-gray-100 relative', i === 0 ? 'bg-yellow-100' : 'bg-gray-50']">
                  {{ mod.locked ? '🔒' : mod.emoji }}
                  <span v-if="mod.locked" class="absolute bottom-1 right-1 bg-gray-800 text-white text-[8px] font-bold px-1.5 py-0.5 rounded font-mono">LOCKED</span>
                </div>
                <div class="p-3">
                  <div class="font-display text-[11px] font-semibold uppercase tracking-wide">{{ mod.title }}</div>
                  <div class="font-mono text-[9px] text-ink-soft mt-0.5">{{ mod.locked ? 'Complete prev.' : 'In Progress' }}</div>
                </div>
              </RouterLink>
            </div>
          </div>

          <!-- Progress -->
          <div>
            <h2 class="font-display font-semibold text-base mb-3 flex items-center gap-2">Continue Progress <span class="flex-1 h-0.5 bg-gray-100 rounded-full ml-2" /></h2>
            <div class="space-y-3">
              <RouterLink v-for="item in progressItems" :key="item.title" to="/student/topic" class="card-hover p-4 flex items-center gap-4 cursor-pointer block no-underline">
                <div :class="['w-10 h-10 rounded-xl border-2 border-gray-100 flex items-center justify-center text-lg flex-shrink-0', item.type === 'video' ? 'bg-yellow-100' : 'bg-brand-blue-soft']">
                  {{ item.type === 'video' ? '▶' : '📖' }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-sm">{{ item.title }}</div>
                  <div class="font-mono text-[10px] text-ink-soft mt-0.5">{{ item.subtitle }}</div>
                  <div class="flex items-center gap-2 mt-1.5">
                    <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div :class="['h-full rounded-full', item.type === 'video' ? 'bg-yellow-400' : 'bg-brand-blue']" :style="`width:${item.percent}%`" />
                    </div>
                    <span class="font-mono text-[10px] text-ink-soft whitespace-nowrap">{{ item.lesson }}</span>
                  </div>
                </div>
                <RouterLink to="/student/topic" class="btn-primary text-xs py-2 px-4">RESUME</RouterLink>
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- Right panel -->
        <div class="space-y-4">
          <!-- Calendar -->
          <div class="card">
            <div class="px-4 pt-4 pb-2 font-display font-semibold text-xs">📅 Sep 2025</div>
            <div class="px-3 pb-3">
              <div class="grid grid-cols-7 gap-0.5 text-center">
                <div v-for="d in ['M','T','W','T','F','S','S']" :key="d" class="text-[8px] font-semibold text-ink-soft py-1">{{ d }}</div>
                <div v-for="day in 30" :key="day" :class="['text-[10px] py-1 rounded cursor-pointer font-mono transition-colors', day === 10 ? 'bg-brand-blue text-white font-bold' : [11,12].includes(day) ? 'bg-brand-blue-soft text-brand-blue' : 'hover:bg-surface-2 text-ink']">{{ day }}</div>
              </div>
            </div>
          </div>

          <!-- Deadlines -->
          <div class="card p-4">
            <div class="font-display font-semibold text-xs border-b border-gray-100 pb-2 mb-3">Upcoming Deadlines</div>
            <div class="space-y-2">
              <div v-for="dl in deadlines" :key="dl.title" class="p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg hover:-translate-y-0.5 transition-transform cursor-pointer">
                <div class="text-xs font-semibold">{{ dl.title }}</div>
                <div class="font-mono text-[10px] text-ink-soft mt-0.5">📅 {{ dl.date }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

const modules = [
  { id: 1, title: 'Module 1', emoji: '📘', locked: false },
  { id: 2, title: 'Module 2', emoji: '📗', locked: true },
  { id: 3, title: 'Module 3', emoji: '📙', locked: true },
  { id: 4, title: 'Module 4', emoji: '📕', locked: true },
]
const progressItems = [
  { title: 'Science Topic', subtitle: 'starting ideas', lesson: 'Lesson 4 of 12', percent: 33, type: 'topic' },
  { title: 'Video Title',   subtitle: 'starting ideas', lesson: 'Video 5 of 13',  percent: 38, type: 'video' },
]
const deadlines = [
  { title: 'Quiz 1 – Science', date: 'Sep 12' },
  { title: 'Module 2 Essay',   date: 'Sep 15' },
  { title: 'Lab Report',       date: 'Sep 20' },
]
</script>

<style>
@keyframes float {
  0%,100% { transform: translateY(0) rotate(-3deg); }
  50%      { transform: translateY(-8px) rotate(3deg); }
}
</style>
