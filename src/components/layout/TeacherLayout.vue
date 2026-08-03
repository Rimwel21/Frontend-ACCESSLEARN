<template>
  <div class="teacher-ui min-h-screen bg-surface lg:flex lg:h-screen lg:overflow-hidden">
    <aside class="z-10 hidden w-[250px] min-w-[250px] flex-col border-r border-brand-teal/30 bg-surface/60 shadow-sm lg:flex">
      <div class="border-b border-brand-teal/30 bg-brand-blue-soft px-5 py-5">
        <div class="font-display text-2xl font-bold tracking-tight text-brand-blue">SIGNHEAR</div>
        <div class="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-soft">Teacher</div>
      </div>

      <button class="mx-3 my-3 flex items-center gap-2.5 rounded-xl border border-brand-teal/25 bg-white/75 p-3 text-left shadow-card hover:-translate-y-px hover:border-brand-amber" @click="router.push('/profile/setup')">
        <img v-if="profile.image?.file_url" :src="profile.image.file_url" alt="" class="h-9 w-9 flex-shrink-0 rounded-full object-cover" />
        <div v-else class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-teal text-base font-bold text-white">
          {{ profile.initial }}
        </div>
        <div class="min-w-0">
          <div class="truncate text-[13px] font-semibold text-ink">{{ profile.displayName }}</div>
          <div class="text-[11px] text-ink-soft">Instructor</div>
        </div>
      </button>

      <nav class="flex-1 px-3 py-1" aria-label="Teacher navigation">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" custom v-slot="{ isActive, navigate }">
          <button
            type="button"
            @click="navigate"
            :class="[
              'mb-1 flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-[14px] font-medium leading-snug transition-all',
              isActive
                ? 'bg-brand-blue/[0.12] text-brand-blue'
                : 'text-brand-blue/80 hover:bg-brand-teal/[0.15] hover:text-brand-blue',
            ]"
          >
            <svg
              class="h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path v-for="path in item.iconPaths" :key="path" :d="path" />
            </svg>
            <span class="min-w-0 flex-1">{{ item.label }}</span>
          </button>
        </RouterLink>
      </nav>

      <div class="border-t border-brand-teal/30 px-4 py-3.5">
        <button class="w-full rounded-lg bg-white/75 px-3 py-2 text-xs font-bold text-ink-soft transition-all hover:bg-brand-rose hover:text-white" @click="logout">
          Logout
        </button>
      </div>
    </aside>

    <div v-if="menuOpen" class="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      <button class="absolute inset-0 bg-ink/45" type="button" aria-label="Close navigation" @click="menuOpen = false"></button>
      <aside class="relative flex h-full w-[min(84vw,290px)] flex-col border-r border-brand-teal/30 bg-surface shadow-2xl">
        <div class="border-b border-brand-teal/30 bg-brand-blue-soft px-5 py-5">
          <div class="font-display text-2xl font-bold tracking-tight text-brand-blue">SIGNHEAR</div>
          <div class="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-soft">Teacher</div>
        </div>

        <button class="mx-3 my-3 flex items-center gap-2.5 rounded-xl border border-brand-teal/25 bg-white/75 p-3 text-left shadow-card hover:border-brand-amber" @click="goToProfile">
          <img v-if="profile.image?.file_url" :src="profile.image.file_url" alt="" class="h-9 w-9 flex-shrink-0 rounded-full object-cover" />
          <div v-else class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-teal text-base font-bold text-white">
            {{ profile.initial }}
          </div>
          <div class="min-w-0">
            <div class="truncate text-[13px] font-semibold text-ink">{{ profile.displayName }}</div>
            <div class="text-[11px] text-ink-soft">Instructor</div>
          </div>
        </button>

        <nav class="flex-1 px-2.5 py-1" aria-label="Teacher mobile navigation">
          <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" custom v-slot="{ isActive, navigate }">
            <button
              type="button"
              @click="() => { navigate(); menuOpen = false }"
              :class="[
                'mb-1 flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-[14px] font-medium leading-snug transition-all',
                isActive
                  ? 'bg-brand-blue/[0.12] text-brand-blue'
                  : 'text-brand-blue/80 hover:bg-brand-teal/[0.15] hover:text-brand-blue',
              ]"
            >
              <svg
                class="h-5 w-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path v-for="path in item.iconPaths" :key="path" :d="path" />
              </svg>
              <span class="min-w-0 flex-1">{{ item.label }}</span>
            </button>
          </RouterLink>
        </nav>

        <div class="border-t border-brand-teal/30 px-4 py-3.5">
          <button class="w-full rounded-lg bg-white/75 px-3 py-2 text-xs font-bold text-ink-soft transition-all hover:bg-brand-rose hover:text-white" @click="logout">
            Logout
          </button>
        </div>
      </aside>
    </div>

    <div class="flex min-w-0 flex-1 flex-col lg:h-screen lg:overflow-hidden">
      <header class="flex flex-shrink-0 flex-wrap items-center gap-3 border-b border-brand-teal/25 bg-white px-4 py-3.5 sm:px-6 lg:flex-nowrap lg:px-7">
        <button
          type="button"
          class="inline-flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-brand-teal/40 bg-white text-brand-blue shadow-sm transition-all hover:border-brand-amber hover:bg-brand-blue/[0.08] lg:hidden"
          aria-label="Open navigation"
          @click="menuOpen = true"
        >
          <span class="block h-0.5 w-5 rounded-full bg-current" aria-hidden="true"></span>
          <span class="block h-0.5 w-5 rounded-full bg-current" aria-hidden="true"></span>
          <span class="block h-0.5 w-5 rounded-full bg-current" aria-hidden="true"></span>
        </button>
        <span class="min-w-0 flex-1 font-display text-[18px] font-semibold text-ink">{{ currentTitle }}</span>
        <div class="flex w-auto items-center gap-2.5">
          <button class="flex-shrink-0 rounded-full border border-brand-teal bg-white px-3 py-2 text-xs font-bold text-brand-blue transition-all hover:border-brand-amber hover:bg-brand-rose hover:text-white" @click="router.push('/profile/setup')">
            Profile
          </button>
        </div>
      </header>

      <main class="scrollbar-thin flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
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
import { computed, onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const profile = useProfileStore()
const menuOpen = ref(false)

const navItems = [
  {
    to: '/teacher/dashboard',
    label: 'Home',
    iconPaths: ['m3 10.5 9-7 9 7', 'M5 9.5V20h14V9.5', 'M9.5 20v-6h5v6'],
  },
  {
    to: '/teacher/class',
    label: 'Class Management',
    iconPaths: ['M4 5.5h16', 'M6 5.5V18a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.5', 'M9 10h6', 'M9 14h4'],
  },
  {
    to: '/teacher/modules',
    label: 'Learning Materials',
    iconPaths: ['M5 4h9l5 5v11H5z', 'M14 4v5h5', 'M8 13h8', 'M8 17h5'],
  },
  {
    to: '/teacher/quizzes',
    label: 'Quizzes',
    iconPaths: ['M9 11a3 3 0 1 1 3 3v1', 'M12 19h.01', 'M4 4h16v16H4z'],
  },
  {
    to: '/teacher/activities',
    label: 'Activities',
    iconPaths: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3.5 6h.01', 'M3.5 12h.01', 'M3.5 18h.01'],
  },
]

const titleMap: Record<string, string> = {
  TeacherDashboard:  'Home',
  ClassManagement:   'Class Management',
  Modules:           'Learning Materials',
  TeacherActivities: 'Activities',
  Quizzes:           'Quizzes',
}

const currentTitle = computed(() => titleMap[route.name as string] ?? 'SIGNHEAR Teacher')

onMounted(() => {
  profile.fetchProfile().catch(() => null)
})

function goToProfile() {
  menuOpen.value = false
  router.push('/profile/setup')
}

function logout() {
  menuOpen.value = false
  auth.logout()
  profile.clear()
  router.push('/')
}
</script>

<style scoped>
.page-enter-active, .page-leave-active { transition: opacity .2s, transform .2s; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
