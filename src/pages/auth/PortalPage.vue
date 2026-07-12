<template>
  <main class="min-h-screen bg-gradient-to-br from-surface via-white to-brand-blue-soft/20 text-ink flex flex-col" role="main">

    <!-- Sticky Header -->
    <nav class="sticky top-0 z-50 w-full border-b border-gray-100/50 bg-white/80 backdrop-blur-xl shadow-sm" aria-label="Portal Navigation">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <div class="flex items-center gap-3">
          <button type="button" @click="handleAdminTrigger" class="flex h-10 w-10 items-center justify-center rounded-[13px] bg-brand-blue font-black text-white text-sm shadow-lg shadow-brand-blue/20 transition-transform hover:scale-105" aria-label="Hidden admin login">
            AL
          </button>
          <RouterLink to="/" class="flex flex-col text-left">
            <span class="font-display text-lg font-black tracking-tighter text-ink leading-none block">ACCESSLearn</span>
            <span class="text-[9px] font-bold text-brand-blue uppercase tracking-widest">Inclusive E-Learning</span>
          </RouterLink>
        </div>
        <RouterLink to="/" class="text-sm font-bold text-ink-soft hover:text-brand-blue transition-colors flex items-center gap-1.5">
          ← Back to Home
        </RouterLink>
      </div>
    </nav>

    <!-- Main Content -->
    <section class="flex-1 flex items-center py-16 px-4 sm:px-6">
      <div class="mx-auto w-full max-w-5xl space-y-12">

        <!-- Header -->
        <div class="text-center space-y-5">
          <div class="inline-flex items-center gap-2 rounded-full bg-brand-blue-soft/50 px-4 py-1.5 text-[11px] font-black text-brand-blue uppercase tracking-widest border border-brand-blue/20">
            <span class="flex h-2 w-2 rounded-full bg-brand-blue animate-pulse"></span>
            ACCESSLearn Access
          </div>
          <h1 class="font-display text-5xl font-bold tracking-tighter text-ink sm:text-6xl leading-tight">
            Find the right<br />
            <span class="text-brand-blue">Student or Teacher flow</span>
          </h1>
          <p class="max-w-xl mx-auto text-base font-medium text-ink-soft leading-relaxed">
            Choose the right path for your role to register or log in with the correct access options.
          </p>
        </div>

        <!-- Access Cards -->
        <div class="grid gap-6 md:grid-cols-2">
          <article class="group relative overflow-hidden rounded-3xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50 p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300">
            <div class="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-brand-blue"></div>
            <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-lg">🎒</div>
            <p class="text-xs font-bold uppercase tracking-[0.3em] text-brand-blue">Student Access</p>
            <h2 class="mt-4 font-display text-3xl font-bold text-ink">Join lessons and activities</h2>
            <p class="mt-3 text-sm leading-6 text-ink-soft">Register or sign in to begin inclusive learning, audio support, and adaptive quizzes.</p>
            <div class="mt-6 flex flex-wrap gap-3">
              <RouterLink to="/register?role=student" class="rounded-full bg-brand-blue px-5 py-3 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5">Student Register</RouterLink>
              <RouterLink to="/login?role=student" class="rounded-full border border-brand-blue/20 bg-white px-5 py-3 text-sm font-bold text-brand-blue transition-transform hover:-translate-y-0.5">Student Login</RouterLink>
            </div>
          </article>

          <article class="group relative overflow-hidden rounded-3xl border-2 border-orange-100 bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300">
            <div class="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-amber-400"></div>
            <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-lg">👩‍🏫</div>
            <p class="text-xs font-bold uppercase tracking-[0.3em] text-amber-700">Teacher Access</p>
            <h2 class="mt-4 font-display text-3xl font-bold text-ink">Manage your classroom</h2>
            <p class="mt-3 text-sm leading-6 text-ink-soft">Create your teacher account or sign in to track lessons, students, and classroom progress.</p>
            <div class="mt-6 flex flex-wrap gap-3">
              <RouterLink to="/register?role=teacher" class="rounded-full bg-amber-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5">Teacher Register</RouterLink>
              <RouterLink to="/login?role=teacher" class="rounded-full border border-amber-200 bg-white px-5 py-3 text-sm font-bold text-amber-700 transition-transform hover:-translate-y-0.5">Teacher Login</RouterLink>
            </div>
          </article>
        </div>

      </div>
    </section>
    </section>

  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const clickCount = ref(0)
let clickTimer: any = null

function handleAdminTrigger() {
  clickCount.value++
  clearTimeout(clickTimer)
  clickTimer = setTimeout(() => (clickCount.value = 0), 2000)
  if (clickCount.value >= 5) {
    clickCount.value = 0
    router.push('/admin/login')
  }
}

const options = [
  {
    role: 'student',
    label: 'Student',
    icon: '🎓',
    description: 'Access your personalised learning dashboard, complete lessons, quizzes, and activities designed for intermediate learners.',
    features: [
      'Register using a username',
      'Access interactive lessons & quizzes',
      'Track your learning progress',
      'Accessibility features included',
    ],
    iconBg: 'bg-brand-blue-soft',
    gradient: 'gradient-brand',
    borderColor: 'border-gray-100 hover:border-brand-blue/30',
    badgeClass: 'badge-blue',
    btnClass: '',
    checkBg: 'bg-brand-blue/10 text-brand-blue',
  },
  {
    role: 'teacher',
    label: 'Teacher',
    icon: '👩‍🏫',
    description: 'Manage your class, upload learning materials, create quizzes, monitor student progress, and deliver inclusive lessons.',
    features: [
      'Register using an email address',
      'Manage classes and lesson modules',
      'Track student performance',
      'Admin-assigned classroom sections',
    ],
    iconBg: 'bg-brand-amber/20',
    gradient: 'gradient-amber',
    borderColor: 'border-gray-100 hover:border-brand-amber/40',
    badgeClass: 'badge-amber',
    btnClass: '!bg-brand-amber hover:!bg-amber-500',
    checkBg: 'bg-brand-amber/10 text-brand-amber',
  },
]
</script>
