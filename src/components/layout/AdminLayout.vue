<template>
  <div class="admin-ui min-h-screen bg-surface lg:flex lg:h-screen lg:overflow-hidden">
    <aside class="z-10 hidden w-[200px] min-w-[200px] flex-col border-r border-brand-teal/30 bg-surface/60 shadow-sm lg:flex">
      <div class="border-b border-brand-teal/30 bg-brand-blue-soft px-5 py-5">
        <div class="font-display text-2xl font-bold tracking-tight text-brand-blue">SIGNHEAR</div>
        <div class="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-soft">Admin Console</div>
      </div>

      <div class="mx-3 my-3 flex items-center gap-2.5 rounded-xl border border-brand-teal/25 bg-white/75 p-3 text-left shadow-card">
        <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-teal text-base font-bold text-white">
          A
        </div>
        <div class="min-w-0">
          <div class="truncate text-[13px] font-semibold text-ink">Administrator</div>
          <div class="truncate text-[10px] text-ink-soft">{{ auth.accountIdentity }}</div>
        </div>
      </div>

      <nav class="flex-1 px-2.5 py-1" aria-label="Admin navigation">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" custom v-slot="{ isActive, navigate }">
          <button
            type="button"
            @click="navigate"
            :class="[
              'mb-0.5 flex w-full items-center gap-2.5 rounded-lg border-l-[3px] px-3.5 py-2.5 text-left text-[13.5px] font-medium transition-all',
              isActive
                ? 'border-brand-amber bg-brand-blue/[0.12] text-brand-blue'
                : 'border-transparent text-brand-blue/80 hover:translate-x-1 hover:bg-brand-teal/[0.15] hover:text-brand-blue',
            ]"
          >
            <span :class="['nav-icon-box', item.iconClass]" aria-hidden="true"></span>
            {{ item.label }}
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
          <div class="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-soft">Admin Console</div>
        </div>

        <div class="mx-3 my-3 flex items-center gap-2.5 rounded-xl border border-brand-teal/25 bg-white/75 p-3 text-left shadow-card">
          <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-teal text-base font-bold text-white">
            A
          </div>
          <div class="min-w-0">
            <div class="truncate text-[13px] font-semibold text-ink">Administrator</div>
            <div class="truncate text-[10px] text-ink-soft">{{ auth.accountIdentity }}</div>
          </div>
        </div>

        <nav class="flex-1 px-2.5 py-1" aria-label="Admin mobile navigation">
          <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" custom v-slot="{ isActive, navigate }">
            <button
              type="button"
              @click="() => { navigate(); menuOpen = false }"
              :class="[
                'mb-0.5 flex w-full items-center gap-2.5 rounded-lg border-l-[3px] px-3.5 py-2.5 text-left text-[13.5px] font-medium transition-all',
                isActive
                  ? 'border-brand-amber bg-brand-blue/[0.12] text-brand-blue'
                  : 'border-transparent text-brand-blue/80 hover:bg-brand-teal/[0.15] hover:text-brand-blue',
              ]"
            >
              <span :class="['nav-icon-box', item.iconClass]" aria-hidden="true"></span>
              {{ item.label }}
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
      <header class="flex flex-shrink-0 items-center gap-3.5 border-b border-brand-teal/25 bg-white px-4 py-3.5 sm:px-6 lg:px-7">
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
        <span class="font-display text-[18px] font-semibold text-ink">{{ currentTitle }}</span>
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
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const menuOpen = ref(false)

const navItems = [
  { to: '/admin/dashboard', label: 'Admin Dashboard', iconClass: 'rounded-full' },
  { to: '/admin/sections', label: 'Section Management', iconClass: 'rounded-sm' },
  { to: '/admin/audit-log', label: 'Audit Log', iconClass: 'rounded' },
]

const titleMap: Record<string, string> = {
  AdminDashboard: 'Admin Dashboard',
  AdminSections: 'Section Management',
  AdminAuditLog: 'Audit Log',
}

const currentTitle = computed(() => titleMap[route.name as string] ?? 'SIGNHEAR Admin')

function logout() {
  menuOpen.value = false
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
.page-enter-active, .page-leave-active { transition: opacity .2s, transform .2s; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
