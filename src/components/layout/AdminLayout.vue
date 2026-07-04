<template>
  <div class="flex h-screen overflow-hidden bg-surface">
    <!-- Sidebar Overlay for Mobile -->
    <div v-if="isSidebarOpen" class="fixed inset-0 z-20 bg-ink/40 backdrop-blur-sm lg:hidden" @click="isSidebarOpen = false"></div>

    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 z-30 flex w-[240px] flex-col border-r border-gray-100 bg-white shadow-sm transition-transform duration-300 lg:static lg:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex items-center justify-between border-b border-gray-100 bg-brand-blue-soft px-6 py-5">
        <div>
          <div class="font-display text-2xl font-bold tracking-tight text-brand-blue">Omni Admin</div>
          <div class="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-soft">Control Center</div>
        </div>
        <button class="lg:hidden text-ink-soft" @click="isSidebarOpen = false">×</button>
      </div>

      <!-- Quick Profile -->
      <button class="mx-4 my-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-surface p-3 text-left transition-all hover:border-brand-blue/30" @click="router.push('/profile/setup')">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-violet text-base font-bold text-white shadow-sm">
          {{ profile.initial }}
        </div>
        <div class="min-w-0">
          <div class="truncate text-[13px] font-bold text-ink">{{ profile.displayName }}</div>
          <div class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-blue">
            <span class="h-1.5 w-1.5 rounded-full bg-brand-blue"></span>
            Administrator
          </div>
        </div>
      </button>

      <!-- Navigation -->
      <nav class="scrollbar-thin flex-1 overflow-y-auto px-3 py-1" aria-label="Admin navigation">
        <div v-for="group in navGroups" :key="group.title" class="mb-5">
          <div class="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-ink-soft/50">{{ group.title }}</div>
          <RouterLink v-for="item in group.items" :key="item.to" :to="item.to" custom v-slot="{ isActive, navigate }">
            <button
              type="button"
              @click="navigate"
              :class="[
                'mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-[13px] font-semibold transition-all',
                isActive
                  ? 'bg-brand-blue text-white shadow-md shadow-blue-200/50'
                  : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
              ]"
            >
              <span :class="['nav-icon-box flex-shrink-0 !h-4 !w-4', item.iconClass]" aria-hidden="true"></span>
              {{ item.label }}
            </button>
          </RouterLink>
        </div>
      </nav>

      <!-- Footer Actions -->
      <div class="border-t border-gray-100 px-4 py-4">
        <div class="mb-3 flex items-center justify-between px-2">
            <div class="flex flex-col">
                <span class="text-[10px] font-bold text-ink-soft">System Health</span>
                <span class="text-[11px] font-bold text-brand-green">Operational</span>
            </div>
            <div class="h-2 w-2 rounded-full bg-brand-green shadow-sm shadow-brand-green/30 animate-pulse"></div>
        </div>
        <button class="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 py-2.5 text-xs font-bold text-brand-rose transition-all hover:bg-brand-rose hover:text-white" @click="logout">
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <!-- Header -->
      <header class="flex flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 py-3 sm:px-8 sm:py-4">
        <div class="flex items-center gap-4">
            <button class="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-ink lg:hidden" @click="isSidebarOpen = true">
                ☰
            </button>
            <div class="flex flex-col">
                <nav class="mb-0.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-soft/40">
                  <RouterLink to="/admin/dashboard" class="hover:text-brand-blue">Admin</RouterLink>
                  <span v-for="(crumb, idx) in breadcrumbs" :key="idx" class="flex items-center gap-1.5">
                    <span>/</span>
                    <RouterLink :to="crumb.to" :class="idx === breadcrumbs.length - 1 ? 'text-brand-blue' : 'hover:text-brand-blue'">
                        {{ crumb.label }}
                    </RouterLink>
                  </span>
                </nav>
                <h1 class="font-display text-lg font-bold tracking-tight text-ink sm:text-xl">{{ currentTitle }}</h1>
            </div>
            <div v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-brand-blue border-t-transparent"></div>
        </div>
        
        <div class="flex items-center gap-4">
          <!-- Notification Bell -->
          <button class="relative rounded-full border border-gray-100 bg-surface p-2 text-ink-soft transition-all hover:bg-brand-blue-soft hover:text-brand-blue" @click="router.push('/admin/notifications')">
            <span class="nav-icon-box !h-5 !w-5 !border-0 bg-transparent">🔔</span>
            <span v-if="unreadNotifs > 0" class="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-rose text-[9px] font-bold text-white ring-2 ring-white">
              {{ unreadNotifs > 9 ? '9+' : unreadNotifs }}
            </span>
          </button>

          <div class="h-8 w-px bg-gray-100"></div>

          <!-- Date/Time or Search -->
          <div class="hidden text-right md:block">
            <div class="text-[11px] font-bold text-ink-soft uppercase tracking-wide">Current Session</div>
            <div class="text-[13px] font-bold text-ink">{{ sessionTime }}</div>
          </div>
        </div>
      </header>

      <!-- Main View -->
      <main class="scrollbar-thin flex-1 overflow-y-auto p-8">
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
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useAdminStore } from '@/stores/admin'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const profile = useProfileStore()
const adminStore = useAdminStore()

const isSidebarOpen = ref(false)
const loading = computed(() => adminStore.loading)
const unreadNotifs = ref(3) // Mock for now

const sessionTime = ref(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
let timer: any

const navGroups = [
  {
    title: 'Core Monitoring',
    items: [
      { to: '/admin/dashboard',   label: 'Dashboard',   iconClass: 'bg-brand-blue/10' },
      { to: '/admin/audit-logs',  label: 'Audit Logs',  iconClass: 'bg-brand-violet/10' },
      { to: '/admin/reports',     label: 'System Reports', iconClass: 'bg-brand-teal/10' },
    ]
  },
  {
    title: 'Management',
    items: [
      { to: '/admin/accounts',    label: 'All Accounts',   iconClass: 'bg-brand-amber/10' },
      { to: '/admin/teachers',    label: 'Teacher Console', iconClass: 'bg-brand-blue/10' },
      { to: '/admin/students',    label: 'Student Console', iconClass: 'bg-brand-teal/10' },
      { to: '/admin/sections',    label: 'Section Registry', iconClass: 'bg-brand-violet/10' },
    ]
  },
  {
    title: 'System',
    items: [
      { to: '/admin/archive',     label: 'Vault (Archive)', iconClass: 'bg-brand-rose/10' },
      { to: '/admin/monitoring',  label: 'System Health',   iconClass: 'bg-brand-green/10' },
    ]
  }
]

const titleMap: Record<string, string> = {
    'admin-dashboard': 'Omni Overview',
    'admin-accounts': 'Account Registry',
    'admin-teachers': 'Teacher Console',
    'admin-students': 'Student placement',
    'admin-sections': 'Section Registry',
    'admin-archive': 'Archive Vault',
    'admin-audit': 'System Audit Trail',
    'admin-reports': 'Report Center',
    'admin-notifications': 'System Alerts',
    'admin-monitoring': 'Infrastructure Health'
}

const currentTitle = computed(() => titleMap[route.name as string] ?? 'Admin Center')

const breadcrumbs = computed(() => {
    const paths = route.path.split('/').filter(p => p && p !== 'admin')
    return paths.map((p, idx) => {
        const to = '/admin/' + paths.slice(0, idx + 1).join('/')
        const label = p.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        return { label, to }
    })
})

onMounted(() => {
  timer = setInterval(() => {
    sessionTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})

function logout() {
  auth.logout()
  profile.clear()
  router.push('/')
}
</script>

<style scoped>
.page-enter-active, .page-leave-active { transition: opacity .25s ease, transform .25s ease; }
.page-enter-from { opacity: 0; transform: translateY(12px); }
.page-leave-to { opacity: 0; transform: translateY(-8px); }

.nav-icon-box {
  @apply flex items-center justify-center border-0 bg-transparent;
}

::-webkit-scrollbar {
  width: 5px;
}
::-webkit-scrollbar-track {
  @apply bg-transparent;
}
::-webkit-scrollbar-thumb {
  @apply bg-gray-200 rounded-full hover:bg-gray-300;
}
</style>
