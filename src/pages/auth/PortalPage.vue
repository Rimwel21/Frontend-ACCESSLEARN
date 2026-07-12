<template>
  <main class="min-h-screen bg-gradient-to-br from-surface via-white to-brand-blue-soft/20 text-ink flex flex-col" role="main">

    <!-- Sticky Header -->
    <nav class="sticky top-0 z-50 w-full border-b border-gray-100/50 bg-white/80 backdrop-blur-xl shadow-sm" aria-label="Portal Navigation">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <RouterLink to="/" class="flex items-center gap-3 group">
          <div class="flex h-10 w-10 items-center justify-center rounded-[13px] bg-brand-blue font-black text-white text-sm shadow-lg shadow-brand-blue/20 group-hover:scale-105 transition-transform">AL</div>
          <div>
            <span class="font-display text-lg font-black tracking-tighter text-ink leading-none block">ACCESSLearn</span>
            <span class="text-[9px] font-bold text-brand-blue uppercase tracking-widest">Inclusive E-Learning</span>
          </div>
        </RouterLink>
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
            ACCESSLearn Portal
          </div>
          <h1 class="font-display text-5xl font-bold tracking-tighter text-ink sm:text-6xl leading-tight">
            Choose Your<br />
            <span class="text-brand-blue">Account Type</span>
          </h1>
          <p class="max-w-xl mx-auto text-base font-medium text-ink-soft leading-relaxed">
            Register or sign in as a student or teacher. Complete your profile and access your personalized learning dashboard.
          </p>
        </div>

        <!-- Portal Cards -->
        <div class="grid gap-6 md:grid-cols-2">
          <article
            v-for="option in options"
            :key="option.role"
            :class="['group relative overflow-hidden rounded-3xl border-2 bg-white p-8 shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 cursor-default', option.borderColor]"
          >
            <!-- Top accent line -->
            <div :class="['absolute top-0 left-0 right-0 h-1 rounded-t-3xl', option.gradient]"></div>

            <!-- Icon -->
            <div :class="['mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300', option.iconBg]">
              {{ option.icon }}
            </div>

            <!-- Badge -->
            <span :class="['badge mb-3', option.badgeClass]">{{ option.label }}</span>

            <!-- Content -->
            <h2 class="font-display text-2xl font-bold text-ink mt-1">{{ option.label }} Account</h2>
            <p class="mt-3 text-sm font-medium text-ink-soft leading-relaxed">{{ option.description }}</p>

            <!-- Features list -->
            <ul class="mt-5 space-y-2">
              <li v-for="feat in option.features" :key="feat" class="flex items-center gap-2.5 text-xs font-semibold text-ink-soft">
                <span :class="['flex h-4 w-4 items-center justify-center rounded-full text-[10px] flex-shrink-0', option.checkBg]">✓</span>
                {{ feat }}
              </li>
            </ul>

            <!-- CTA Buttons -->
            <div class="mt-8 flex flex-wrap gap-3">
              <RouterLink
                :to="`/register?role=${option.role}`"
                :class="['btn-primary flex-1 text-center !font-bold', option.btnClass]"
              >
                Register
              </RouterLink>
              <RouterLink
                :to="`/login?role=${option.role}`"
                class="btn-secondary flex-1 text-center !font-bold border border-gray-200 hover:border-gray-300"
              >
                Sign In
              </RouterLink>
            </div>
          </article>
        </div>

        <!-- Hidden Admin trigger area -->
        <div class="text-center">
          <p class="text-xs text-ink-soft/40 font-medium">
            Are you an administrator?
            <span
              class="cursor-pointer hover:text-ink-soft transition-colors"
              @click="handleAdminTrigger"
              aria-label="Hidden admin access"
            >
              Contact your system administrator.
            </span>
          </p>
        </div>

      </div>

      <div class="mt-4 text-center">
        <p class="text-xs text-ink-soft">
          System Administration? 
          <RouterLink to="/login?role=admin" class="font-bold text-brand-blue hover:underline">Log in as Admin</RouterLink>
        </p>
      </div>
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
