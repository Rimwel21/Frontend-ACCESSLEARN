<template>
  <div class="flex h-screen overflow-hidden bg-surface">
    <!-- Sidebar -->
    <aside class="w-[200px] min-w-[200px] flex flex-col bg-white border-r border-gray-100 shadow-sm z-10">
      <!-- Logo -->
      <div class="px-5 py-5 border-b border-gray-100 bg-brand-blue-soft">
        <div class="font-display font-bold text-2xl text-brand-blue tracking-tight">Learnify</div>
        <div class="font-mono text-[10px] tracking-widest uppercase text-ink-soft mt-0.5">LMS</div>
      </div>

      <!-- User card -->
      <div class="mx-3 my-3 p-3 bg-brand-blue-soft rounded-xl flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue to-brand-violet flex items-center justify-center text-white text-base flex-shrink-0">
          👩‍🏫
        </div>
        <div>
          <div class="font-semibold text-[13px] text-ink">Ms. Rymuel</div>
          <div class="text-[11px] text-ink-soft">Instructor</div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-2.5 py-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          custom
          v-slot="{ isActive, navigate }"
        >
          <div
            @click="navigate"
            :class="[
              'flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[13.5px] font-medium mb-0.5 cursor-pointer transition-all',
              isActive
                ? 'bg-brand-blue text-white shadow-md shadow-blue-200'
                : 'text-ink-soft hover:bg-surface hover:text-ink',
            ]"
          >
            <span class="text-base w-5 text-center">{{ item.icon }}</span>
            {{ item.label }}
          </div>
        </RouterLink>
      </nav>

      <!-- Footer -->
      <div class="px-4 py-3.5 border-t border-gray-100 text-[11px] text-ink-soft font-mono tracking-wide">
        © 2025 Learnify
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Topbar -->
      <header class="bg-white border-b border-gray-100 px-7 py-3.5 flex items-center gap-3.5 flex-shrink-0">
        <span class="font-display font-semibold text-[18px] text-ink">{{ currentTitle }}</span>
        <div class="ml-auto flex items-center gap-2.5">
          <!-- Search -->
          <div class="flex items-center gap-2 bg-surface border border-gray-200 rounded-full px-4 py-2 w-56 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <span class="text-sm">🔍</span>
            <input class="border-0 bg-transparent outline-none text-sm font-body flex-1 text-ink" placeholder="Search…" />
          </div>
          <!-- Icon buttons -->
          <button class="w-9 h-9 rounded-full bg-surface border border-gray-200 flex items-center justify-center text-base hover:bg-brand-blue-soft hover:border-brand-blue transition-all relative">
            🔔
            <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-rose border-2 border-white"></span>
          </button>
          <button class="w-9 h-9 rounded-full bg-surface border border-gray-200 flex items-center justify-center text-base hover:bg-brand-blue-soft hover:border-brand-blue transition-all">💬</button>
          <button class="w-9 h-9 rounded-full bg-surface border border-gray-200 flex items-center justify-center text-base hover:bg-brand-blue-soft hover:border-brand-blue transition-all">👤</button>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto scrollbar-thin p-7">
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
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { to: '/teacher/dashboard', label: 'Dashboard',        icon: '🏠' },
  { to: '/teacher/class',     label: 'Class Management', icon: '📚' },
  { to: '/teacher/modules',   label: 'Modules',          icon: '📖' },
  { to: '/teacher/progress',  label: 'Progress',         icon: '📊' },
  { to: '/teacher/quizzes',   label: 'Quizzes',          icon: '📝' },
]

const titleMap: Record<string, string> = {
  TeacherDashboard: 'Dashboard',
  ClassManagement:  'Class Management',
  Modules:          'Learning Materials',
  UploadMaterial:   'Upload Learning Material',
  StudentProgress:  'Student Progress',
  StudentDetail:    'Student Detail',
  Quizzes:          'Quizzes / Activities',
  QuizCreator:      'Create Quiz',
}

const currentTitle = computed(() => titleMap[route.name as string] ?? 'Learnify LMS')
</script>

<style scoped>
.page-enter-active, .page-leave-active { transition: opacity .2s, transform .2s; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to   { opacity: 0; transform: translateY(-4px); }
</style>
