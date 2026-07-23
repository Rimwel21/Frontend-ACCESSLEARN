<template>
  <div class="flex min-h-screen w-full flex-col bg-surface font-body lg:flex-row">
    <header class="z-50 flex items-center justify-between gap-3 border-b border-brand-teal/30 bg-white px-4 py-2.5 lg:hidden">
      <img
        src="@/assets/signhear_logo.png"
        alt="SIGNHEAR - Sign Language Integrated Guidance for Hearing Education and Accessible Resources"
        class="h-10 w-auto max-w-[min(58vw,180px)] object-contain object-left sm:h-12"
      />
      <button
        type="button"
        class="text-ink-soft hover:text-ink"
        aria-label="Open navigation"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>

    <div v-if="isMobileMenuOpen" class="fixed inset-0 z-40 flex flex-col space-y-3 bg-surface px-6 pt-20 lg:hidden">
      <RouterLink to="/" class="flex items-center gap-3 rounded-xl border-l-[3px] border-brand-amber bg-brand-blue/[0.12] px-4 py-3 font-bold text-ink" @click="isMobileMenuOpen = false">Home</RouterLink>
      <RouterLink to="/portal" class="flex items-center gap-3 rounded-xl border-l-[3px] border-transparent px-4 py-3 font-bold text-brand-blue/80 hover:bg-brand-teal/[0.15] hover:text-brand-blue" @click="isMobileMenuOpen = false">Register</RouterLink>
      <RouterLink to="/portal" class="flex items-center gap-3 rounded-xl border-l-[3px] border-transparent px-4 py-3 font-bold text-brand-blue/80 hover:bg-brand-teal/[0.15] hover:text-brand-blue" @click="isMobileMenuOpen = false">Log in</RouterLink>
    </div>

    <aside class="relative z-20 hidden w-[220px] shrink-0 flex-col justify-between border-r border-brand-teal/30 bg-surface/60 shadow-[4px_0_24px_rgba(10,123,121,0.04)] lg:flex">
      <div>
        <div class="flex flex-col items-center px-5 pb-5 pt-6 text-center">
          <img
            src="@/assets/signhear_logo.png"
            alt="SIGNHEAR - Sign Language Integrated Guidance for Hearing Education and Accessible Resources"
            class="h-auto w-full max-w-[128px] object-contain xl:max-w-[140px]"
          />
        </div>

        <nav class="space-y-2 px-3">
          <a href="#" class="flex items-center gap-3 rounded-xl border-l-[3px] border-brand-amber bg-brand-blue/[0.12] px-4 py-3 font-bold text-brand-blue transition-all">
            <svg class="h-5 w-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </a>
          <RouterLink to="/portal" class="flex items-center gap-3 rounded-xl border-l-[3px] border-transparent px-4 py-3 font-bold text-brand-blue/80 transition-all hover:translate-x-1 hover:bg-brand-teal/[0.15] hover:text-brand-blue">
            <svg class="h-5 w-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Register
          </RouterLink>
          <RouterLink to="/portal" class="flex items-center gap-3 rounded-xl border-l-[3px] border-transparent px-4 py-3 font-bold text-brand-blue/80 transition-all hover:translate-x-1 hover:bg-brand-teal/[0.15] hover:text-brand-blue">
            <svg class="h-5 w-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Log in
          </RouterLink>
        </nav>
      </div>

      <div class="px-4 pb-5">
        <div class="rounded-xl border border-brand-teal/30 bg-white/70 px-3 py-3 text-center shadow-sm">
          <div class="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-brand-blue text-[10px] font-black leading-none text-white">
            WCAG<br />2.2
          </div>
          <p class="text-[10px] font-bold uppercase tracking-wide text-brand-blue">Compliant</p>
          <p class="mt-1 text-[10px] font-semibold leading-snug text-ink-soft">Readable, keyboard-friendly, accessible learning.</p>
        </div>
      </div>
    </aside>

    <main class="grid-bg relative flex h-full flex-1 flex-col overflow-x-hidden lg:min-h-screen">
      <div class="mx-auto flex w-full max-w-[1500px] flex-1 flex-col gap-3 p-4 sm:p-5 lg:px-8 lg:py-4">
        <div class="space-y-3 lg:space-y-4">
          <section class="relative mx-auto w-full max-w-[1450px] overflow-hidden rounded-[12px] shadow-xl gradient-brand">
            <div class="grid items-stretch lg:grid-cols-[minmax(430px,0.64fr)_minmax(0,1fr)]">
              <div class="flex items-center justify-center bg-white/14 px-4 pt-4 sm:px-5 sm:pt-5 lg:min-h-[390px] lg:p-0 xl:min-h-[425px]">
                <img
                  src="@/assets/hero_illustration.png"
                  alt="Students learning"
                  class="aspect-[4/3] w-full max-w-[min(78vw,300px)] rounded-t-sm object-contain drop-shadow-2xl sm:max-w-[min(62vw,350px)] lg:aspect-auto lg:h-full lg:max-h-[425px] lg:max-w-[520px] lg:rounded-none"
                />
              </div>

              <div class="flex min-w-0 flex-col justify-center px-6 py-6 text-white sm:px-8 sm:py-7 lg:px-12 xl:px-16">
                <h1 class="mb-4 w-full font-display text-2xl font-extrabold leading-[1.08] tracking-tight text-white text-shadow-sm sm:text-3xl lg:text-[42px] xl:text-[50px]">
                  Learning that adapts to every child, every ability, every classroom.
                </h1>
                <p class="mb-9 max-w-[740px] text-[13px] font-medium leading-relaxed text-surface sm:text-sm lg:text-[18px]">
                  AccessLearn combines audio lessons, sign-language videos, subtitles, and adaptive quizzes to create equitable learning in Philippine schools.
                </p>
                <div class="flex justify-center sm:justify-start">
                  <RouterLink to="/portal" class="min-w-52 rounded-full bg-brand-amber px-10 py-4 text-center text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-gradient-to-r hover:from-brand-amber hover:to-brand-rose hover:shadow-[0_0_20px_rgba(244,163,99,0.4)]">
                    Get Started
                  </RouterLink>
                </div>
              </div>
            </div>
          </section>

          <section id="features" class="relative z-20 mx-auto w-full max-w-[1450px] space-y-4" aria-labelledby="features-title">
            <h2 id="features-title" class="font-display text-[30px] font-black leading-none text-ink">Features</h2>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-7">
              <article v-for="feature in features" :key="feature.title" class="flex min-h-[290px] flex-col items-center rounded-xl border border-brand-teal/30 bg-white p-4 text-center shadow-card transition-all hover:-translate-y-2 hover:border-brand-amber hover:shadow-card-hover lg:p-8">
                <div class="mb-5 flex h-12 items-center justify-center text-3xl transition-transform lg:text-[48px]">
                  {{ feature.icon }}
                </div>
                <h3 class="mb-4 font-bold leading-tight text-ink text-[13px] lg:text-xl">{{ feature.title }}</h3>
                <p class="text-[10px] font-medium leading-relaxed text-ink-soft lg:text-[16px]">
                  {{ feature.summary }}<br />{{ feature.detail }}
                </p>
              </article>
            </div>
          </section>
        </div>

        <footer class="pb-1 pt-1 lg:pt-0">
          <div class="system-footer mx-auto flex max-w-4xl flex-col items-center justify-center gap-1 text-center text-[10px] font-semibold text-black sm:flex-row sm:flex-wrap sm:gap-x-2 sm:gap-y-1">
            <span>&copy; {{ new Date().getFullYear() }} ACCESSLearn Inc. | Philippine Schools Initiative</span>
            <span class="hidden text-black sm:inline" aria-hidden="true">|</span>
            <span class="inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-brand-blue">
              <span class="rounded bg-brand-blue px-1.5 py-0.5 text-[9px] font-black text-white">WCAG 2.2</span>
              Compliant: Accessible learning.
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
    icon: '🧏💬',
    title: 'Sign & Captions',
    summary: 'For hearing support learners.',
    detail: 'Each module includes sign-language videos, subtitles, and transcript toggles.',
  },
  {
    icon: '🎯📚',
    title: 'Adaptive Activities',
    summary: 'Personalized interactive tasks.',
    detail: "Adjust to each learner's progress, ensuring engagement and mastery of skills.",
  },
  {
    icon: '✅⚙️',
    title: 'Adaptive Quizzes',
    summary: 'Smart assessments.',
    detail: 'Adapt difficulty based on performance, guiding learners toward review or advancement.',
  },
  {
    icon: '👩‍🏫📊',
    title: 'Teacher Dashboard',
    summary: 'Class insights.',
    detail: 'Track progress, scores, and upload new inclusive lessons.',
  },
  {
    icon: '☁️💾',
    title: 'Offline-Ready',
    summary: 'Low bandwidth support.',
    detail: 'Download lesson briefs for classrooms with limited connectivity.',
  },
]
</script>

<style scoped>
.grid-bg {
  background-color: #d3f2e9;
  background-image:
    radial-gradient(circle at 90% 8%, rgba(244, 163, 99, 0.08), transparent 34rem),
    radial-gradient(circle at 82% 12%, rgba(10, 123, 121, 0.05), transparent 28rem),
    linear-gradient(rgba(124, 168, 161, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124, 168, 161, 0.2) 1px, transparent 1px);
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
  color: #0a7b79;
  text-decoration: underline;
  text-decoration-color: #f4a363;
}
</style>
