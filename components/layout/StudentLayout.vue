<template>
  <div class="flex h-screen overflow-hidden bg-surface">
    <aside class="w-[176px] min-w-[176px] flex flex-col bg-white border-r border-gray-100 shadow-sm z-10">
      <div class="px-4 py-4 border-b border-gray-100 bg-yellow-300">
        <div class="font-display font-bold text-xl tracking-tight">Learnify</div>
        <div class="font-mono text-[9px] tracking-widest uppercase text-gray-600 mt-0.5">LMS</div>
      </div>
      <nav class="flex-1 py-2 px-2.5">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" custom v-slot="{ isActive, navigate }">
          <div
            @click="navigate"
            :class="[
              'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-semibold mb-0.5 cursor-pointer transition-all',
              isActive ? 'bg-brand-blue text-white shadow-md' : 'text-ink-soft hover:bg-surface hover:text-ink',
            ]"
          >
            <span class="text-base w-5 text-center">{{ item.icon }}</span>
            {{ item.label }}
          </div>
        </RouterLink>
      </nav>
      <div class="px-4 py-3 border-t border-gray-100 text-[10px] text-ink-soft font-mono">© 2025 Learnify</div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <main class="flex-1 overflow-y-auto scrollbar-thin">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
const route = useRoute()
const navItems = [
  { to: '/student/dashboard', label: 'Dashboard',  icon: '🏠' },
  { to: '/student/topic',     label: 'Videos',     icon: '▶️' },
  { to: '/student/quiz',      label: 'Quizzes',    icon: '📋' },
]
</script>

<style scoped>
.page-enter-active, .page-leave-active { transition: opacity .18s, transform .18s; }
.page-enter-from { opacity: 0; transform: translateY(6px); }
.page-leave-to   { opacity: 0; }
</style>
