<template>
  <div class="flex min-h-screen w-full flex-col bg-[#e8f5f0] font-body lg:flex-row">
    <header class="z-50 flex items-center justify-between gap-3 border-b border-[#a5d8cc] bg-white px-4 py-2.5 lg:hidden">
      <img
        src="@/assets/signhear_logo.png"
        alt="SIGNHEAR - Sign Language Integrated Guidance for Hearing Education and Accessible Resources"
        class="h-10 w-auto max-w-[min(58vw,180px)] object-contain object-left sm:h-12"
      />
      <button
        type="button"
        class="text-[#5a8d82] hover:text-[#2d6e61]"
        aria-label="Open navigation"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>

    <div v-if="isMobileMenuOpen" class="fixed inset-0 z-40 flex flex-col space-y-3 bg-[#e8f5f0] px-6 pt-20 lg:hidden">
      <RouterLink to="/" class="flex items-center gap-3 rounded-xl border-l-[3px] border-[#f59e5b] bg-[#d7eef7] px-4 py-3 font-bold text-[#2d6e61]" @click="isMobileMenuOpen = false">Home</RouterLink>
      <RouterLink to="/portal" class="flex items-center gap-3 rounded-xl border-l-[3px] border-transparent px-4 py-3 font-bold text-[#5a8d82] hover:bg-[#c4e4da] hover:text-[#2d6e61]" @click="isMobileMenuOpen = false">Register</RouterLink>
      <RouterLink to="/portal" class="flex items-center gap-3 rounded-xl border-l-[3px] border-transparent px-4 py-3 font-bold text-[#5a8d82] hover:bg-[#c4e4da] hover:text-[#2d6e61]" @click="isMobileMenuOpen = false">Log in</RouterLink>
    </div>

    <aside class="sticky top-0 z-20 hidden h-screen w-[240px] shrink-0 flex-col justify-between border-r border-[#a5d8cc]/80 bg-[#e2f3ee] shadow-[4px_0_24px_rgba(45,110,97,0.06)] lg:flex">
      <div>
        <div class="flex flex-col items-center px-6 pb-6 pt-8 text-center">
          <img
            src="@/assets/signhear_logo.png"
            alt="SIGNHEAR - Sign Language Integrated Guidance for Hearing Education and Accessible Resources"
            class="h-auto w-full max-w-[140px] object-contain xl:max-w-[160px]"
          />
        </div>

        <nav class="space-y-3 px-4">
          <div class="relative flex items-center">
            <span class="absolute left-0 w-1.5 h-8 bg-[#f59e5b] rounded-full z-10"></span>
            <RouterLink to="/" class="flex w-full items-center gap-3 rounded-xl bg-[#cdeae0] pl-6 pr-4 py-3 font-semibold text-[#2b7668] transition-all">
              <svg class="h-6 w-6 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </RouterLink>
          </div>

          <RouterLink to="/portal" class="flex items-center gap-3 pl-6 pr-4 py-3 font-semibold text-[#5a8d82] hover:text-[#2b7668] transition-all">
            <svg class="h-6 w-6 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Register
          </RouterLink>

          <RouterLink to="/portal" class="flex items-center gap-3 pl-6 pr-4 py-3 font-semibold text-[#5a8d82] hover:text-[#2b7668] transition-all">
            <svg class="h-6 w-6 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Log in
          </RouterLink>
        </nav>
      </div>

      <div class="px-5 pb-6">
        <div class="rounded-2xl border border-[#a5d8cc]/50 bg-white px-4 py-6 text-center shadow-[0_4px_12px_rgba(45,110,97,0.04)]">
          <div class="mx-auto mb-3 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-[#0a7b79] text-[10px] font-bold leading-none text-white shadow-sm">
            <span>WCAG</span>
            <span class="mt-0.5 text-xs">2.2</span>
          </div>
          <p class="text-xs font-bold uppercase tracking-wider text-[#0a7b79]">Compliant</p>
          <p class="mt-1.5 text-[11px] font-semibold leading-snug text-[#5a8d82]">Readable, keyboard-friendly, accessible learning.</p>
        </div>
      </div>
    </aside>

    <main class="grid-bg relative flex h-full flex-1 flex-col overflow-x-hidden lg:min-h-screen">
      <div class="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-3 p-3 sm:p-4 lg:px-6 lg:py-4">
        <div class="space-y-3 lg:space-y-4">
          <!-- Hero Section -->
          <section class="relative mx-auto w-full max-w-[1350px] overflow-hidden rounded-[20px] bg-[#358071] p-5 lg:p-6 shadow-md">
            <div class="grid items-center gap-6 lg:grid-cols-[auto_1fr] lg:gap-12">
              <!-- Left: White Frame for Image -->
              <div class="mx-auto flex items-center justify-center rounded-xl bg-white p-4 w-[220px] h-[220px] sm:w-[250px] sm:h-[250px] lg:w-[270px] lg:h-[270px] shrink-0 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                <img
                  src="@/assets/hero_illustration.png"
                  alt="Students learning"
                  class="h-full w-full object-contain"
                />
              </div>


              <!-- Right: Content -->
              <div class="flex flex-col justify-center text-white">
                <h1 class="mb-3 font-display text-2xl font-bold leading-tight lg:text-[28px] xl:text-[34px] text-white">
                  Learning that adapts to every child, every ability, every classroom.
                </h1>
                <p class="mb-4 max-w-[620px] text-xs leading-relaxed text-white/90 lg:text-[14px]">
                  SIGNHEAR combines audio lessons, sign-language videos, subtitles, and adaptive quizzes to create equitable learning in Philippine schools.
                </p>
                <div class="flex justify-center sm:justify-start">
                  <RouterLink to="/portal" class="min-w-[144px] rounded-full bg-[#f59e5b] px-6 py-2.5 text-center text-sm font-bold text-white shadow-[0_4px_12px_rgba(245,158,91,0.25)] transition-all hover:scale-[1.03] hover:bg-[#e08a47]">
                    Get Started
                  </RouterLink>
                </div>
              </div>
            </div>
          </section>

          <!-- Features Section -->
          <section id="features" class="relative z-20 mx-auto w-full max-w-[1350px] space-y-3" aria-labelledby="features-title">
            <h2 id="features-title" class="font-display text-2xl font-bold leading-none text-[#2b7668]">Features</h2>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
              <article v-for="feature in features" :key="feature.title" class="flex h-full min-h-[220px] flex-col items-center justify-start rounded-xl border border-[#a5d8cc]/60 bg-white p-4 text-center shadow-[0_4px_12px_rgba(45,110,97,0.02)] transition-all hover:-translate-y-1.5 hover:border-[#f59e5b] hover:shadow-[0_12px_24px_rgba(45,110,97,0.08)] lg:p-5">
                <div class="mb-3 flex items-center justify-center gap-2">
                  <span v-for="emoji in feature.icons" :key="emoji" class="text-2xl lg:text-[34px] select-none filter drop-shadow-sm">{{ emoji }}</span>
                </div>
                <h3 class="mb-2 text-[13px] lg:text-[15px] font-bold leading-snug text-[#2b7668]">{{ feature.title }}</h3>
                <p class="text-[10px] lg:text-[12px] font-medium leading-relaxed text-[#5a8d82]">
                  {{ feature.summary }} {{ feature.detail }}
                </p>
              </article>
            </div>
          </section>
        </div>

        <!-- Footer -->
        <footer class="mt-auto pb-3 pt-6">
          <div class="mx-auto flex flex-col items-center justify-center gap-1.5 text-center text-[11px] font-semibold text-[#2b7668] sm:flex-row sm:flex-wrap sm:gap-x-3">
            <span>&copy; {{ new Date().getFullYear() }} SIGNHEAR Inc. | Philippine Schools Initiative</span>
            <span class="hidden sm:inline text-[#2b7668]/45">|</span>
            <span class="inline-flex items-center gap-2">
              <span class="rounded bg-[#0a7b79] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">WCAG 2.2</span>
              <span class="text-[#2b7668]">Compliant: Accessible learning.</span>
            </span>
          </div>
        </footer>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const isMobileMenuOpen = ref(false)

const features = [
  {
    icons: ['🧏', '💬'],
    title: 'Sign & Captions',
    summary: 'For hearing support learners.',
    detail: 'Each module includes sign-language videos, subtitles, and transcript toggles.',
  },
  {
    icons: ['🎯', '📚'],
    title: 'Adaptive Activities',
    summary: 'Personalized interactive tasks.',
    detail: "Adjust to each learner's progress, ensuring engagement and mastery of skills.",
  },
  {
    icons: ['✅', '⚙️'],
    title: 'Adaptive Quizzes',
    summary: 'Smart assessments.',
    detail: 'Adapt difficulty based on performance, guiding learners toward review or advancement.',
  },
  {
    icons: ['👩', '🏫', '📊'],
    title: 'Teacher Dashboard',
    summary: 'Class insights.',
    detail: 'Track progress, scores, and upload new inclusive lessons.',
  },
  {
    icons: ['☁️', '💾'],
    title: 'Offline-Ready',
    summary: 'Low bandwidth support.',
    detail: 'Download lesson briefs for classrooms with limited connectivity.',
  },
]
</script>

<style scoped>
.grid-bg {
  background-color: #e8f5f0;
  background-image:
    radial-gradient(circle at 85% 10%, rgba(245, 158, 91, 0.06), transparent 30rem),
    radial-gradient(circle at 78% 15%, rgba(45, 110, 97, 0.04), transparent 25rem),
    linear-gradient(rgba(165, 216, 204, 0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(165, 216, 204, 0.3) 1px, transparent 1px);
  background-position: -1px -1px;
  background-size: 32px 32px;
}

.text-shadow-sm {
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.system-footer {
  text-decoration-color: transparent;
  text-underline-offset: 5px;
}

.system-footer:hover {
  color: #2d6e61;
  text-decoration: underline;
  text-decoration-color: #f59e5b;
}
</style>
