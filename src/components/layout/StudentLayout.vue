<template>
  <div class="min-h-screen bg-surface lg:flex lg:h-screen lg:overflow-hidden">
    <aside class="hidden w-[180px] min-w-[180px] flex-col border-r-[3px] border-brand-teal/30 bg-surface/60 lg:flex">
      <div class="border-b-[3px] border-brand-teal/30 bg-brand-blue-soft px-4 py-3.5">
        <div class="font-display text-2xl font-black leading-none tracking-tight text-brand-blue">SIGNHEAR</div>
        <div class="mt-0.5 font-mono text-[9px] uppercase tracking-[3px] text-ink-soft">Student</div>
      </div>

      <button class="mx-2.5 mt-3 flex items-center gap-2 border-[2px] border-brand-teal/30 bg-white/75 p-2 text-left shadow-card hover:-translate-y-px hover:border-brand-amber" @click="router.push('/profile/setup')">
        <img v-if="profile.image?.file_url" :src="profile.image.file_url" alt="" class="h-9 w-9 rounded-full object-cover" />
        <div v-else class="grid h-9 w-9 place-items-center rounded-full bg-brand-blue text-sm font-black text-white">
          {{ profile.initial }}
        </div>
        <div class="min-w-0">
          <div class="truncate text-xs font-black text-ink">{{ profile.displayName }}</div>
          <div class="text-[10px] font-bold text-ink-soft">Student</div>
        </div>
      </button>

      <nav class="flex-1 px-2.5 py-3" aria-label="Student navigation">
        <button
          v-for="item in navItems"
          :key="item.label"
          type="button"
          @click="item.to ? router.push(item.to) : null"
          :class="[
            'mb-1.5 flex w-full items-center gap-2.5 border-l-[3px] px-3 py-2.5 text-left text-[13px] font-bold transition-all',
            item.to && route.path === item.to
              ? 'border-brand-amber bg-brand-blue/[0.12] text-brand-blue'
              : item.to
                ? 'border-transparent text-brand-blue/80 hover:translate-x-1 hover:bg-brand-teal/[0.15] hover:text-brand-blue'
                : 'cursor-default border-transparent text-ink-soft',
          ]"
        >
          <span :class="['h-5 w-5 flex-shrink-0 border-[2px] border-current bg-current/10', item.iconClass]" aria-hidden="true"></span>
          {{ item.label }}
        </button>
      </nav>

      <div class="border-t-[3px] border-brand-teal/30 px-4 py-3">
        <button class="w-full border-[2px] border-brand-teal/40 bg-white px-3 py-2 text-xs font-bold text-ink-soft hover:border-brand-rose hover:bg-brand-rose hover:text-white" @click="logout">
          Logout
        </button>
      </div>
    </aside>

    <div v-if="menuOpen" class="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      <button class="absolute inset-0 bg-ink/45" type="button" aria-label="Close navigation" @click="menuOpen = false"></button>
      <aside class="relative flex h-full w-[min(84vw,280px)] flex-col border-r-[3px] border-brand-teal/30 bg-surface shadow-2xl">
        <div class="border-b-[3px] border-brand-teal/30 bg-brand-blue-soft px-4 py-3.5">
          <div class="font-display text-2xl font-black leading-none tracking-tight text-brand-blue">SIGNHEAR</div>
          <div class="mt-0.5 font-mono text-[9px] uppercase tracking-[3px] text-ink-soft">Student</div>
        </div>

        <button class="mx-2.5 mt-3 flex items-center gap-2 border-[2px] border-brand-teal/30 bg-white/75 p-2 text-left shadow-card hover:border-brand-amber" @click="goToProfile">
          <img v-if="profile.image?.file_url" :src="profile.image.file_url" alt="" class="h-9 w-9 rounded-full object-cover" />
          <div v-else class="grid h-9 w-9 place-items-center rounded-full bg-brand-blue text-sm font-black text-white">
            {{ profile.initial }}
          </div>
          <div class="min-w-0">
            <div class="truncate text-xs font-black text-ink">{{ profile.displayName }}</div>
            <div class="text-[10px] font-bold text-ink-soft">Student</div>
          </div>
        </button>

        <nav class="flex-1 px-2.5 py-3" aria-label="Student mobile navigation">
          <button
            v-for="item in navItems"
            :key="item.label"
            type="button"
            @click="goToNav(item.to)"
            :class="[
              'mb-1.5 flex w-full items-center gap-2.5 border-l-[3px] px-3 py-2.5 text-left text-[13px] font-bold transition-all',
              item.to && route.path === item.to
                ? 'border-brand-amber bg-brand-blue/[0.12] text-brand-blue'
                : item.to
                  ? 'border-transparent text-brand-blue/80 hover:bg-brand-teal/[0.15] hover:text-brand-blue'
                  : 'cursor-default border-transparent text-ink-soft',
            ]"
          >
            <span :class="['h-5 w-5 flex-shrink-0 border-[2px] border-current bg-current/10', item.iconClass]" aria-hidden="true"></span>
            {{ item.label }}
          </button>
        </nav>

        <div class="border-t-[3px] border-brand-teal/30 px-4 py-3">
          <button class="w-full border-[2px] border-brand-teal/40 bg-white px-3 py-2 text-xs font-bold text-ink-soft hover:border-brand-rose hover:bg-brand-rose hover:text-white" @click="logout">
            Logout
          </button>
        </div>
      </aside>
    </div>

    <div class="flex min-w-0 flex-1 flex-col lg:h-screen lg:overflow-hidden">
      <header class="flex items-center gap-3 border-b-[3px] border-brand-teal/25 bg-white px-4 py-3 lg:hidden">
        <button
          type="button"
          class="inline-flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center gap-1.5 border-[2px] border-brand-teal/40 bg-white text-brand-blue shadow-sm transition-all hover:border-brand-amber hover:bg-brand-blue/[0.08]"
          aria-label="Open navigation"
          @click="menuOpen = true"
        >
          <span class="block h-0.5 w-5 rounded-full bg-current" aria-hidden="true"></span>
          <span class="block h-0.5 w-5 rounded-full bg-current" aria-hidden="true"></span>
          <span class="block h-0.5 w-5 rounded-full bg-current" aria-hidden="true"></span>
        </button>
        <div class="min-w-0">
          <div class="truncate font-display text-lg font-black text-brand-blue">SIGNHEAR</div>
          <div class="font-mono text-[9px] uppercase tracking-[3px] text-ink-soft">Student</div>
        </div>
      </header>

      <main class="scrollbar-thin flex-1 overflow-y-auto">
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
import { onMounted, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const profile = useProfileStore()
const menuOpen = ref(false)

const navItems = [
  { to: '/student/dashboard', label: 'Home', iconClass: 'rounded-full' },
  { to: '/student/quiz', label: 'Quizzes', iconClass: 'rounded' },
  { to: '/student/activities', label: 'Activities', iconClass: 'rounded-sm' },
]

onMounted(() => {
  profile.fetchProfile().catch(() => null)
})

function goToProfile() {
  menuOpen.value = false
  router.push('/profile/setup')
}

function goToNav(to?: string) {
  if (!to) return
  menuOpen.value = false
  router.push(to)
}

function logout() {
  menuOpen.value = false
  auth.logout()
  profile.clear()
  router.push('/')
}
</script>

<style scoped>
.page-enter-active, .page-leave-active { transition: opacity .18s, transform .18s; }
.page-enter-from { opacity: 0; transform: translateY(6px); }
.page-leave-to { opacity: 0; }
</style>
