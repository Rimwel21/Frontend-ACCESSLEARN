<template>
  <div class="flex min-h-screen w-full flex-col bg-[#e8f5f0] font-body lg:flex-row">
    <!-- Mobile Header -->
    <header class="z-50 flex items-center justify-between gap-3 border-b border-[#a5d8cc] bg-white px-4 py-2.5 lg:hidden">
      <RouterLink to="/" class="flex items-center gap-2">
        <img
          src="@/assets/signhear_logo.png"
          alt="SIGNHEAR - Sign Language Integrated Guidance for Hearing Education and Accessible Resources"
          class="h-10 w-auto max-w-[min(58vw,180px)] object-contain object-left sm:h-12"
        />
      </RouterLink>
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

    <!-- Mobile Drawer -->
    <div v-if="isMobileMenuOpen" class="fixed inset-0 z-40 flex flex-col space-y-3 bg-[#e8f5f0] px-6 pt-20 lg:hidden">
      <RouterLink to="/" class="flex items-center gap-3 rounded-xl border-l-[3px] border-transparent px-4 py-3 font-bold text-[#5a8d82] hover:bg-[#c4e4da] hover:text-[#2d6e61]" @click="isMobileMenuOpen = false">Home</RouterLink>
      <RouterLink to="/about" class="flex items-center gap-3 rounded-xl border-l-[3px] border-[#f59e5b] bg-[#d7eef7] px-4 py-3 font-bold text-[#2d6e61]" @click="isMobileMenuOpen = false">About Us</RouterLink>
      <RouterLink to="/portal" class="flex items-center gap-3 rounded-xl border-l-[3px] border-transparent px-4 py-3 font-bold text-[#5a8d82] hover:bg-[#c4e4da] hover:text-[#2d6e61]" @click="isMobileMenuOpen = false">Register / Log in</RouterLink>
    </div>

    <!-- Desktop Sidebar -->
    <aside class="sticky top-0 z-20 hidden h-screen w-[240px] shrink-0 flex-col justify-between border-r border-[#a5d8cc]/80 bg-[#e2f3ee] shadow-[4px_0_24px_rgba(45,110,97,0.06)] lg:flex">
      <div>
        <div class="flex flex-col items-center px-6 pb-6 pt-8 text-center">
          <RouterLink to="/">
            <img
              src="@/assets/signhear_logo.png"
              alt="SIGNHEAR Logo"
              class="h-auto w-full max-w-[140px] object-contain xl:max-w-[160px]"
            />
          </RouterLink>
        </div>

        <nav class="space-y-3 px-4">
          <RouterLink to="/" class="flex items-center gap-3 pl-6 pr-4 py-3 font-semibold text-[#5a8d82] hover:text-[#2b7668] transition-all">
            <svg class="h-6 w-6 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </RouterLink>

          <div class="relative flex items-center">
            <span class="absolute left-0 w-1.5 h-8 bg-[#f59e5b] rounded-full z-10"></span>
            <RouterLink to="/about" class="flex w-full items-center gap-3 rounded-xl bg-[#cdeae0] pl-6 pr-4 py-3 font-semibold text-[#2b7668] transition-all">
              <svg class="h-6 w-6 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About Us
            </RouterLink>
          </div>

          <RouterLink to="/portal" class="flex items-center gap-3 pl-6 pr-4 py-3 font-semibold text-[#5a8d82] hover:text-[#2b7668] transition-all">
            <svg class="h-6 w-6 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Register / Log in
          </RouterLink>
        </nav>
      </div>

      <div class="px-5 pb-6">
        <div class="rounded-2xl border border-[#a5d8cc]/50 bg-white px-4 py-6 text-center shadow-[0_4px_12px_rgba(45,110,97,0.04)]">
          <div class="mx-auto mb-3 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-[#0a7b79] text-[10px] font-bold leading-none text-white shadow-sm">
            <span>WCAG</span>
            <span class="mt-0.5 text-xs">2.2</span>
          </div>
          <p class="text-xs font-bold uppercase tracking-wider text-[#0a7b79]">ACCESSIBLE LEARNING</p>
          <p class="mt-1.5 text-[11px] font-semibold leading-snug text-[#5a8d82]">Guided by WCAG 2.2 for inclusive education.</p>
        </div>
      </div>
    </aside>

    <!-- Main Content Grid -->
    <main class="grid-bg relative flex h-full flex-1 flex-col overflow-x-hidden lg:min-h-screen">
      <div class="mx-auto flex w-full max-w-[1350px] flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">

        <!-- Hero Title Banner -->
        <section class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2b7668] to-[#358071] p-6 sm:p-8 text-white shadow-md">
          <div class="relative z-10 max-w-3xl">
            <div class="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-emerald-100 backdrop-blur-sm mb-3">
              <span>🏫 Claro M. Recto Memorial Central School</span>
            </div>
            <h1 class="font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              SIGNHEAR
            </h1>
            <p class="mt-1 text-sm font-semibold text-[#ffd9b3] sm:text-base">
              Sign Language Integrated Guidance for Hearing Education and Accessible Resources
            </p>
            <p class="mt-3 text-xs sm:text-sm text-emerald-50/90 leading-relaxed">
              An Accessible and Inclusive E-Learning System for Intermediate Learners with Hearing Impairment
            </p>
          </div>
        </section>

        <!-- About & Our Purpose Split Row -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <!-- About SIGNHEAR -->
          <section class="flex flex-col justify-between rounded-2xl border border-[#a5d8cc]/60 bg-white p-6 shadow-sm">
            <div>
              <div class="mb-3 flex items-center gap-3">
                <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e2f3ee] text-xl">ℹ️</span>
                <h2 class="font-display text-xl font-bold text-[#2b7668]">About SIGNHEAR</h2>
              </div>
              <p class="text-xs sm:text-sm leading-relaxed text-[#4a6b63]">
                SIGNHEAR is a web-based e-learning system designed to support inclusive Science education for intermediate learners in Grades 4 to 6, particularly learners with hearing impairment. It provides accessible learning materials, visual learning resources, sign language-supported materials, interactive quizzes and activities, and foundational Sign Language Alphabet Recognition.
              </p>
            </div>
          </section>

          <!-- Our Purpose -->
          <section class="flex flex-col justify-between rounded-2xl border border-[#a5d8cc]/60 bg-white p-6 shadow-sm">
            <div>
              <div class="mb-3 flex items-center gap-3">
                <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fef3e7] text-xl">🎯</span>
                <h2 class="font-display text-xl font-bold text-[#2b7668]">Our Purpose</h2>
              </div>
              <p class="text-xs sm:text-sm leading-relaxed text-[#4a6b63]">
                SIGNHEAR aims to make Science learning more accessible and inclusive by providing learners with visual and sign-supported learning resources while helping teachers manage lessons, activities, assessments, and learner progress within one platform.
              </p>
            </div>
          </section>
        </div>

        <!-- Key Features Section -->
        <section class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🌟</span>
            <h2 class="font-display text-2xl font-bold text-[#2b7668]">What SIGNHEAR Provides</h2>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="feature in keyFeatures" :key="feature.title" class="flex flex-col rounded-xl border border-[#a5d8cc]/60 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#f59e5b] hover:shadow-md">
              <div class="mb-3 text-3xl">{{ feature.icon }}</div>
              <h3 class="mb-1.5 text-sm font-bold text-[#2b7668]">{{ feature.title }}</h3>
              <p class="text-xs text-[#5a8d82] leading-relaxed">{{ feature.description }}</p>
            </div>
          </div>
        </section>

        <!-- Who It Supports (3 Cards) -->
        <section class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="text-2xl">👥</span>
            <h2 class="font-display text-2xl font-bold text-[#2b7668]">Who It Supports</h2>
          </div>

          <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
            <!-- Learners -->
            <div class="rounded-2xl border-t-4 border-[#358071] bg-white p-6 shadow-sm border-x border-b border-[#a5d8cc]/50">
              <div class="mb-3 flex items-center gap-3">
                <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e2f3ee] text-2xl">🎒</span>
                <div>
                  <span class="text-[10px] font-extrabold uppercase tracking-wider text-[#358071]">For Students</span>
                  <h3 class="font-display text-lg font-bold text-[#2b7668]">Learners</h3>
                </div>
              </div>
              <p class="text-xs text-[#4a6b63] leading-relaxed">
                Access Science lessons, activities, quizzes, visual resources, and sign language-supported learning features.
              </p>
            </div>

            <!-- Teachers -->
            <div class="rounded-2xl border-t-4 border-[#f59e5b] bg-white p-6 shadow-sm border-x border-b border-[#a5d8cc]/50">
              <div class="mb-3 flex items-center gap-3">
                <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fef3e7] text-2xl">👩‍🏫</span>
                <div>
                  <span class="text-[10px] font-extrabold uppercase tracking-wider text-[#d07328]">For Educators</span>
                  <h3 class="font-display text-lg font-bold text-[#2b7668]">Science Teachers</h3>
                </div>
              </div>
              <p class="text-xs text-[#4a6b63] leading-relaxed">
                Manage learning materials, quizzes, activities, selected sections, and learner progress.
              </p>
            </div>

            <!-- Administrators -->
            <div class="rounded-2xl border-t-4 border-[#0a7b79] bg-white p-6 shadow-sm border-x border-b border-[#a5d8cc]/50">
              <div class="mb-3 flex items-center gap-3">
                <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e0f2f1] text-2xl">🛡️</span>
                <div>
                  <span class="text-[10px] font-extrabold uppercase tracking-wider text-[#0a7b79]">For School Admin</span>
                  <h3 class="font-display text-lg font-bold text-[#2b7668]">Administrators</h3>
                </div>
              </div>
              <p class="text-xs text-[#4a6b63] leading-relaxed">
                Manage official grade levels and sections, user accounts, system records, and audit logs.
              </p>
            </div>
          </div>
        </section>

        <!-- Inclusive Learning & Our Scope Side by Side -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <!-- Inclusive Learning -->
          <section class="rounded-2xl border border-[#a5d8cc]/60 bg-white p-6 shadow-sm">
            <div class="mb-3 flex items-center gap-3">
              <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e2f3ee] text-xl">🤝</span>
              <h2 class="font-display text-xl font-bold text-[#2b7668]">Inclusive Learning</h2>
            </div>
            <p class="text-xs sm:text-sm leading-relaxed text-[#4a6b63]">
              SIGNHEAR is designed to support learners with hearing impairment within a shared classroom learning environment. The system provides accessibility-oriented features while allowing regular learners to use the same core Science learning platform.
            </p>
          </section>

          <!-- Our Scope -->
          <section class="rounded-2xl border border-[#a5d8cc]/60 bg-white p-6 shadow-sm">
            <div class="mb-3 flex items-center gap-3">
              <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fef3e7] text-xl">🔍</span>
              <h2 class="font-display text-xl font-bold text-[#2b7668]">Our Scope & Limitations</h2>
            </div>
            <p class="text-xs sm:text-sm leading-relaxed text-[#4a6b63]">
              SIGNHEAR focuses on Science education for Grades 4 to 6. Its sign language component is limited to foundational Sign Language Alphabet learning, references, supported learning materials, and camera-based alphabet recognition. It does not provide full sign language translation or recognition of complete sign language sentences.
            </p>
          </section>
        </div>

        <!-- Technology & Accessibility Section -->
        <section class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="text-2xl">💻</span>
            <h2 class="font-display text-2xl font-bold text-[#2b7668]">Technology & Accessibility</h2>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-xl border border-[#a5d8cc]/60 bg-white p-5 shadow-sm">
              <div class="mb-2.5 text-2xl">⚡</div>
              <h3 class="mb-1 text-sm font-bold text-[#2b7668]">PWA Technology</h3>
              <p class="text-xs text-[#5a8d82] leading-relaxed">
                Developed as a modern web-based application with Progressive Web Application capabilities for limited offline access to selected learning content and supported synchronization.
              </p>
            </div>

            <div class="rounded-xl border border-[#a5d8cc]/60 bg-white p-5 shadow-sm">
              <div class="mb-2.5 text-2xl">♿</div>
              <h3 class="mb-1 text-sm font-bold text-[#2b7668]">WCAG 2.2-Oriented Design</h3>
              <p class="text-xs text-[#5a8d82] leading-relaxed">
                Designed following Web Content Accessibility Guidelines (WCAG 2.2) to provide readable text, high visual contrast, and keyboard-friendly interaction.
              </p>
            </div>

            <div class="rounded-xl border border-[#a5d8cc]/60 bg-white p-5 shadow-sm">
              <div class="mb-2.5 text-2xl">📖</div>
              <h3 class="mb-1 text-sm font-bold text-[#2b7668]">Visual Learning Content</h3>
              <p class="text-xs text-[#5a8d82] leading-relaxed">
                Structured visual learning content, diagrams, and resources tailored for intermediate learners in Science.
              </p>
            </div>

            <div class="rounded-xl border border-[#a5d8cc]/60 bg-white p-5 shadow-sm">
              <div class="mb-2.5 text-2xl">📷</div>
              <h3 class="mb-1 text-sm font-bold text-[#2b7668]">Camera Alphabet Recognition</h3>
              <p class="text-xs text-[#5a8d82] leading-relaxed">
                Interactive camera-based Sign Language Alphabet Recognition for practicing hand sign letters in real-time.
              </p>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="mt-auto pb-4 pt-6 border-t border-[#a5d8cc]/40">
          <div class="mx-auto flex flex-col items-center justify-center gap-2 text-center text-xs font-semibold text-[#2b7668]">
            <p class="font-bold text-[#2b7668] text-sm">SIGNHEAR</p>
            <p class="text-[#5a8d82]">Claro M. Recto Memorial Central School — Science Learning Platform</p>
            <p class="text-[11px] text-[#5a8d82]/80">&copy; 2026 SIGNHEAR. All rights reserved.</p>
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

const keyFeatures = [
  {
    icon: '📚',
    title: 'Accessible Science Lessons',
    description: 'Structured Science curriculum for Grades 4 to 6 designed with clear typography and visual support.',
  },
  {
    icon: '💡',
    title: 'Visual Science Diagrams',
    description: 'Illustrated Science lessons equipped with visual diagrams and key term breakdowns for hearing support.',
  },
  {
    icon: '🔤',
    title: 'Sign Language Alphabet Learning',
    description: 'Foundational Sign Language Alphabet guides and visual learning reference charts.',
  },
  {
    icon: '📷',
    title: 'Camera Alphabet Recognition',
    description: 'Camera-based Sign Language Alphabet Recognition for practicing hand signs directly in the browser.',
  },
  {
    icon: '🤟',
    title: 'Sign-Supported Materials',
    description: 'Visual aids and sign language-supported learning materials integrated across Science units.',
  },
  {
    icon: '🎯',
    title: 'Interactive Quizzes & Activities',
    description: 'Engaging learning activities and self-check quizzes to reinforce core Science concepts.',
  },
  {
    icon: '📊',
    title: 'Learner Progress Monitoring',
    description: 'Real-time tracking of student scores, activity submissions, and module accomplishments.',
  },
  {
    icon: '👩‍🏫',
    title: 'Teacher & Admin Management',
    description: 'Dashboards for teachers to manage classes and administrators to handle users, sections, and audit logs.',
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
</style>
