<template>
  <div class="flex h-screen overflow-hidden bg-white">

    <!-- Sidebar -->
    <aside class="w-[180px] min-w-[180px] flex flex-col bg-white border-r-[3px] border-black">
      <!-- Logo -->
      <div class="px-4 py-3.5 border-b-[3px] border-black bg-[#FFE135]">
        <div class="font-display font-black text-2xl leading-none tracking-tight">Learnify</div>
        <div class="font-mono text-[9px] tracking-[3px] uppercase text-gray-700 mt-0.5">LMS</div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-3 px-2.5">
        <div v-for="item in navItems" :key="item.label"
          @click="item.to ? router.push(item.to) : null"
          :class="[
            'flex items-center gap-2.5 px-3 py-2.5 mb-1.5 text-[13px] font-bold transition-all',
            item.to && route.path === item.to
              ? 'bg-[#1565FF] text-white border-[2px] border-black cursor-pointer'
              : item.to
                ? 'text-gray-700 hover:bg-gray-50 cursor-pointer'
                : 'text-gray-400 cursor-default',
          ]"
        >
          <span class="text-base w-5 text-center">{{ item.icon }}</span>
          {{ item.label }}
        </div>
      </nav>

      <div class="px-4 py-3 border-t-[3px] border-black font-mono text-[10px] text-gray-500">© 2025 Learnify</div>
    </aside>

    <!-- Main -->
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
import { RouterView, useRoute, useRouter } from 'vue-router'
const route  = useRoute()
const router = useRouter()

const navItems = [
  { to: '/student/dashboard',  label: 'Dashboard',  icon: '🏠' },
  { to: null,                  label: 'Videos',     icon: '▶️' },
  { to: null,                  label: 'Quizzes',    icon: '📋' },
  { to: '/student/activities', label: 'Activities', icon: '📂' },
]
</script>

<style scoped>
.page-enter-active, .page-leave-active { transition: opacity .18s, transform .18s; }
.page-enter-from { opacity: 0; transform: translateY(6px); }
.page-leave-to   { opacity: 0; }
</style>
