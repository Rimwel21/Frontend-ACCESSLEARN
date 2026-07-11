<template>
  <div class="landing-page min-h-screen bg-white text-ink font-body overflow-x-hidden" id="home">

    <!-- ===================== NAVIGATION ===================== -->
    <nav
      class="sticky top-0 z-[100] w-full border-b bg-white/85 backdrop-blur-xl transition-all duration-300"
      :class="scrolled ? 'border-gray-100 shadow-md shadow-brand-blue/5' : 'border-gray-100/50'"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <!-- Logo -->
        <div class="flex items-center gap-2 cursor-pointer select-none group" @click="scrollToTop">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1565FF] font-sans font-black text-white text-base shadow-sm">
            AL
          </div>
          <span class="font-display text-2xl font-bold tracking-tight text-ink">ACCESSLearn</span>
        </div>

        <!-- Desktop Nav -->
        <div class="hidden items-center gap-8 lg:flex">
          <div class="flex items-center gap-8">
            <a
              href="#home"
              @click.prevent="scrollToTop"
              class="text-sm font-bold text-ink hover:text-[#1565FF] transition-colors"
            >
              Home
            </a>
            <a
              href="#about"
              @click.prevent="scrollTo('#about')"
              class="text-sm font-bold text-ink-soft hover:text-[#1565FF] transition-colors"
            >
              About
            </a>
            <a
              href="#features"
              @click.prevent="scrollTo('#features')"
              class="text-sm font-bold text-ink-soft hover:text-[#1565FF] transition-colors"
            >
              Features
            </a>
          </div>
          <RouterLink
            to="/login"
            class="rounded-full bg-[#1565FF] px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/10 cursor-pointer border-0"
          >
            Login
          </RouterLink>
        </div>

        <!-- Mobile Toggle -->
        <button
          class="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-surface-2 text-ink active:scale-90 transition-transform border-none cursor-pointer"
          @click="isMenuOpen = !isMenuOpen"
          aria-label="Toggle navigation menu"
          :aria-expanded="isMenuOpen"
        >
          <span class="text-xl leading-none">{{ isMenuOpen ? '✕' : '☰' }}</span>
        </button>
      </div>

      <!-- Mobile Menu -->
      <Transition name="slide-down">
        <div v-if="isMenuOpen" class="absolute top-full left-0 w-full border-t border-gray-100 bg-white p-6 shadow-2xl lg:hidden" role="menu">
          <div class="flex flex-col gap-5">
            <a
              href="#home"
              class="text-base font-bold text-ink"
              @click.prevent="scrollToTop(); isMenuOpen = false"
            >Home</a>
            <a
              href="#about"
              class="text-base font-bold text-ink"
              @click.prevent="scrollTo('#about'); isMenuOpen = false"
            >About</a>
            <a
              href="#features"
              class="text-base font-bold text-ink"
              @click.prevent="scrollTo('#features'); isMenuOpen = false"
            >Features</a>
            <hr class="border-gray-100" />
            <div class="grid gap-3">
              <RouterLink to="/login" class="btn-primary !bg-[#1565FF] !py-3.5 text-center font-bold" @click="isMenuOpen = false">Login</RouterLink>
            </div>
          </div>
        </div>
      </Transition>
    </nav>

    <!-- ===================== HERO SECTION ===================== -->
    <section id="hero" class="relative overflow-hidden bg-white pt-16 pb-24 lg:pt-20 lg:pb-32">
      <!-- Glow decoration behind the classroom card -->
      <div class="pointer-events-none absolute right-10 top-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-amber-200/40 via-yellow-100/20 to-transparent blur-3xl -z-10"></div>

      <div class="relative mx-auto max-w-7xl px-6">
        <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

          <!-- Left: Content -->
          <div class="space-y-8 animate-fade-in-up">
            <!-- Heading -->
            <h1 class="font-display text-[46px] sm:text-[54px] lg:text-[62px] font-bold leading-[1.1] text-ink tracking-tight">
              Learning Made<br />
              Accessible for <span class="text-[#1565FF]">Every<br />Classroom</span>
            </h1>

            <!-- Description -->
            <p class="max-w-lg text-base font-medium leading-relaxed text-ink-soft">
              ACCESSLearn helps students learn through interactive lessons, engaging activities, quizzes, and accessibility-focused learning tools while giving teachers an organized platform to manage learning materials and monitor student progress.
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-wrap gap-4">
              <RouterLink
                to="/login"
                class="rounded-full bg-[#1565FF] px-8 py-3.5 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 cursor-pointer border-0"
              >
                Login Now
              </RouterLink>
              <a
                href="#features"
                @click.prevent="scrollTo('#features')"
                class="rounded-full bg-[#F0F2F6] px-8 py-3.5 text-sm font-bold text-ink hover:bg-gray-200 transition-all cursor-pointer border-0"
              >
                Explore Features
              </a>
            </div>
          </div>

          <!-- Right: Classroom Image with heavy border and shadow -->
          <div class="relative flex items-center justify-center lg:justify-end">
            <div class="relative w-full max-w-lg">
              <!-- Rounded photo Card -->
              <div class="relative overflow-hidden rounded-[32px] border-[12px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
                <img
                  src="@/assets/hero_classroom.png"
                  alt="ACCESSLearn classroom group work"
                  class="w-full h-auto object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ===================== STATS SECTION ===================== -->
    <section class="py-16 bg-white border-y border-gray-100">
      <div class="mx-auto max-w-7xl px-6">
        <div class="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div
            v-for="(stat, i) in statsCards"
            :key="stat.label"
            class="group relative overflow-hidden rounded-2xl bg-surface p-6 text-center hover:bg-brand-blue-soft/30 transition-all duration-300 border border-gray-100 hover:border-brand-blue/20 hover:-translate-y-1 hover:shadow-card"
          >
            <div class="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{{ stat.icon }}</div>
            <div class="font-display text-3xl font-black text-ink leading-none">{{ stat.value }}</div>
            <div class="text-xs font-bold text-ink-soft uppercase tracking-wider mt-2">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== ABOUT SECTION ===================== -->
    <section id="about" class="py-24 bg-surface">
      <div class="mx-auto max-w-7xl px-6">
        <div class="grid gap-16 items-center lg:grid-cols-2">
          <!-- Left: Visual -->
          <div class="relative">
            <div class="grid grid-cols-2 gap-4">
              <div v-for="card in aboutCards" :key="card.title" :class="['rounded-2xl p-5 border text-center flex flex-col items-center gap-3 hover:-translate-y-1 transition-all duration-300', card.bg]">
                <span class="text-3xl">{{ card.icon }}</span>
                <span class="text-sm font-bold text-ink">{{ card.title }}</span>
              </div>
            </div>
          </div>
          <!-- Right: Content -->
          <div class="space-y-6">
            <div class="inline-flex items-center gap-2 rounded-full bg-brand-blue-soft px-4 py-1.5 text-[11px] font-black text-brand-blue uppercase tracking-widest">
              About ACCESSLearn
            </div>
            <h2 class="font-display text-4xl font-bold tracking-tighter text-ink leading-tight">
              Built for Inclusive Education
            </h2>
            <p class="text-base font-medium text-ink-soft leading-relaxed">
              ACCESSLearn supports inclusive education with engaging lessons, interactive activities, classroom management tools, and accessibility-focused features for intermediate learners.
            </p>
            <p class="text-base font-medium text-ink-soft leading-relaxed">
              Designed specifically for the Philippine educational setting, our platform empowers teachers and students alike — with special attention to learners with hearing impairment.
            </p>
            <div class="flex flex-wrap gap-3 pt-2">
              <RouterLink to="/register" class="btn-primary !px-7 !py-3 !font-bold">Join ACCESSLearn</RouterLink>
              <RouterLink to="/portal" class="btn-secondary !px-7 !py-3 !font-bold border border-gray-200">Go to Portal</RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== FEATURES SECTION ===================== -->
    <section id="features" class="py-24 bg-white">
      <div class="mx-auto max-w-7xl px-6">
        <div class="text-center space-y-4 mb-16">
          <div class="inline-flex items-center gap-2 rounded-full bg-brand-blue-soft px-4 py-1.5 text-[11px] font-black text-brand-blue uppercase tracking-widest">Platform Features</div>
          <h2 class="font-display text-4xl font-bold tracking-tighter text-ink">Everything You Need to Learn</h2>
          <p class="max-w-xl mx-auto text-base font-medium text-ink-soft">A complete suite of tools designed for inclusive, engaging, and effective education.</p>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="feature in features"
            :key="feature.title"
            :class="['group relative overflow-hidden rounded-2xl border p-6 hover:-translate-y-2 hover:shadow-card-hover transition-all duration-300 cursor-default', feature.bg, feature.border]"
          >
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-sm bg-white group-hover:scale-110 transition-transform duration-300">{{ feature.icon }}</div>
            <h3 class="font-display text-base font-bold text-ink mb-2">{{ feature.title }}</h3>
            <p class="text-xs font-medium text-ink-soft leading-relaxed">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== WHY CHOOSE SECTION ===================== -->
    <section class="py-24 bg-gradient-to-br from-brand-blue via-brand-violet to-brand-teal relative overflow-hidden">
      <!-- Background pattern -->
      <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 30px 30px;"></div>

      <div class="relative mx-auto max-w-7xl px-6">
        <div class="text-center space-y-4 mb-16">
          <h2 class="font-display text-4xl font-bold tracking-tighter text-white">Why Choose ACCESSLearn?</h2>
          <p class="max-w-xl mx-auto text-base font-medium text-white/70">Designed with purpose — built for every Filipino learner.</p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="reason in whyChoose"
            :key="reason.title"
            class="group rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-5 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
          >
            <div class="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">{{ reason.icon }}</div>
            <h3 class="font-bold text-white text-sm mb-1">{{ reason.title }}</h3>
            <p class="text-xs text-white/60 leading-relaxed">{{ reason.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== HOW IT WORKS ===================== -->
    <section class="py-24 bg-white">
      <div class="mx-auto max-w-7xl px-6">
        <div class="text-center space-y-4 mb-16">
          <div class="inline-flex items-center gap-2 rounded-full bg-brand-blue-soft px-4 py-1.5 text-[11px] font-black text-brand-blue uppercase tracking-widest">How It Works</div>
          <h2 class="font-display text-4xl font-bold tracking-tighter text-ink">Get Started in 4 Easy Steps</h2>
        </div>
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative">
          <!-- Connecting line (hidden on mobile) -->
          <div class="absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-brand-blue via-brand-violet to-brand-teal hidden lg:block"></div>
          <div
            v-for="(step, i) in howItWorks"
            :key="step.title"
            class="relative flex flex-col items-center text-center space-y-4 group"
          >
            <div :class="['relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl shadow-lg font-black group-hover:scale-110 transition-transform duration-300 border-4 border-white', step.bg]">
              {{ step.icon }}
            </div>
            <div class="absolute -top-1 -right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-white text-[10px] font-black shadow-md">{{ i + 1 }}</div>
            <div>
              <h3 class="font-display text-base font-bold text-ink mb-1">{{ step.title }}</h3>
              <p class="text-xs font-medium text-ink-soft leading-relaxed max-w-[180px] mx-auto">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== ACCESSIBILITY SECTION ===================== -->
    <section id="accessibility" class="py-24 bg-surface">
      <div class="mx-auto max-w-7xl px-6">
        <div class="grid gap-16 items-center lg:grid-cols-2">
          <!-- Left: Content -->
          <div class="space-y-6">
            <div class="inline-flex items-center gap-2 rounded-full bg-brand-green/10 px-4 py-1.5 text-[11px] font-black text-brand-green uppercase tracking-widest border border-brand-green/20">♿ Accessibility First</div>
            <h2 class="font-display text-4xl font-bold tracking-tighter text-ink leading-tight">Designed for Every Learner</h2>
            <p class="text-base font-medium text-ink-soft leading-relaxed">
              ACCESSLearn promotes inclusive education with accessibility features for all students, especially learners with hearing impairment. We follow WCAG 2.2 standards to ensure every student can access quality education.
            </p>
            <ul class="space-y-3">
              <li v-for="item in accessibilityList" :key="item" class="flex items-center gap-3 text-sm font-semibold text-ink">
                <span class="flex h-5 w-5 items-center justify-center rounded-full bg-brand-green/15 text-brand-green text-xs flex-shrink-0">✓</span>
                {{ item }}
              </li>
            </ul>
          </div>
          <!-- Right: Cards -->
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="card in accessibilityCards"
              :key="card.title"
              class="rounded-2xl bg-white border border-gray-100 p-5 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3"
            >
              <span class="text-3xl">{{ card.icon }}</span>
              <h3 class="font-bold text-sm text-ink">{{ card.title }}</h3>
              <p class="text-xs text-ink-soft leading-relaxed">{{ card.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== CTA BANNER ===================== -->
    <section class="py-20 bg-gradient-to-r from-brand-blue to-brand-violet relative overflow-hidden">
      <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 24px 24px;"></div>
      <div class="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
      <div class="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>

      <div class="relative mx-auto max-w-4xl px-6 text-center space-y-8">
        <div class="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-[11px] font-black text-white uppercase tracking-widest border border-white/20">Start Today</div>
        <h2 class="font-display text-4xl font-bold tracking-tighter text-white sm:text-5xl leading-tight">
          Start Your Inclusive Learning<br />Journey Today
        </h2>
        <p class="max-w-2xl mx-auto text-base font-medium text-white/75 leading-relaxed">
          Join ACCESSLearn and experience an accessible, engaging, and modern learning environment designed for teachers and students.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <RouterLink
            to="/register"
            class="rounded-full bg-white px-8 py-4 text-sm font-black text-brand-blue shadow-2xl shadow-black/20 hover:-translate-y-1 hover:shadow-black/30 transition-all duration-300"
          >
            Register Now →
          </RouterLink>
          <RouterLink
            to="/login"
            class="rounded-full border-2 border-white/40 bg-white/10 px-8 py-4 text-sm font-black text-white hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
          >
            Sign In
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ===================== FOOTER ===================== -->
    <footer class="bg-ink text-white/80" role="contentinfo">
      <div class="mx-auto max-w-7xl px-6 py-16">
        <div class="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">

          <!-- Brand column -->
          <div class="lg:col-span-2 space-y-5">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-[14px] bg-brand-blue font-black text-white text-sm shadow-xl shadow-brand-blue/30">AL</div>
              <div>
                <span class="font-display text-xl font-black tracking-tighter text-white leading-none block">ACCESSLearn</span>
                <span class="text-[9px] font-bold text-brand-blue uppercase tracking-widest">Inclusive E-Learning</span>
              </div>
            </div>
            <p class="text-sm text-white/50 leading-relaxed max-w-sm">
              An accessible e-learning platform for intermediate learners with hearing impairment. Empowering every student and teacher through inclusive digital education.
            </p>
            <div class="flex items-center gap-3 text-white/40 text-xs font-bold">
              <span>WCAG 2.2 Compliant</span>
              <span>•</span>
              <span>SPED-Friendly</span>
              <span>•</span>
              <span>PH Schools</span>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="space-y-4">
            <h3 class="text-xs font-black text-white uppercase tracking-widest">Quick Links</h3>
            <ul class="space-y-2.5">
              <li v-for="link in footerQuickLinks" :key="link.label">
                <a :href="link.href" class="text-sm text-white/50 hover:text-white transition-colors font-medium" @click.prevent="link.to ? $router.push(link.to) : scrollTo(link.href)">{{ link.label }}</a>
              </li>
            </ul>
          </div>

          <!-- System Links -->
          <div class="space-y-4">
            <h3 class="text-xs font-black text-white uppercase tracking-widest">System</h3>
            <ul class="space-y-2.5">
              <li v-for="link in footerSystemLinks" :key="link.label">
                <a :href="link.href" class="text-sm text-white/50 hover:text-white transition-colors font-medium">{{ link.label }}</a>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-xs text-white/30 font-medium">© 2025 ACCESSLearn. All Rights Reserved.</p>
          <p class="text-xs text-white/30 font-medium">Built with ♥ for Filipino Learners</p>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const scrolled = ref(false)
const isMenuOpen = ref(false)

function handleScroll() {
  scrolled.value = window.scrollY > 20
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollTo(hash: string) {
  isMenuOpen.value = false
  const id = hash.replace('#', '')
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// ─── Data ─────────────────────────────────────────────────────────

const navLinks = [
  { id: 'home', label: 'Home', href: '#home', action: scrollToTop },
  { id: 'about', label: 'About', href: '#about', action: null },
  { id: 'features', label: 'Features', href: '#features', action: null },
  { id: 'portal', label: 'Portal', href: '/portal', action: () => router.push('/portal') },
]

const heroStats = [
  { value: '100%', label: 'Accessible' },
  { value: 'K–6', label: 'Grade Levels' },
  { value: '∞', label: 'Learning Content' },
]

const statsCards = [
  { icon: '📚', value: '100+', label: 'Learning Activities' },
  { icon: '🎯', value: '50+', label: 'Interactive Lessons' },
  { icon: '♿', value: '10+', label: 'Accessibility Features' },
  { icon: '🏫', label: 'Inclusive Classroom Support', value: '✓' },
]

const aboutCards = [
  { icon: '👨‍🏫', title: 'Teacher Dashboard', bg: 'bg-brand-blue-soft/40 border-brand-blue/20' },
  { icon: '🎓', title: 'Student Portal', bg: 'bg-brand-green/10 border-brand-green/20' },
  { icon: '📊', title: 'Progress Monitoring', bg: 'bg-brand-amber/10 border-brand-amber/20' },
  { icon: '🔐', title: 'Admin Control', bg: 'bg-brand-violet/10 border-brand-violet/20' },
]

const features = [
  { icon: '📖', title: 'Interactive Lessons', desc: 'Engaging lesson modules designed for diverse learning styles and needs.', bg: 'bg-brand-blue-soft/30', border: 'border-brand-blue/20' },
  { icon: '🎮', title: 'Gamified Learning', desc: 'Points, badges, and achievements to motivate learners every step of the way.', bg: 'bg-brand-amber/10', border: 'border-brand-amber/20' },
  { icon: '🎬', title: 'Accessible Video Lessons', desc: 'Video content with subtitles and captions for learners with hearing impairment.', bg: 'bg-brand-teal/10', border: 'border-brand-teal/20' },
  { icon: '🖥️', title: 'Teacher Dashboard', desc: 'Full classroom oversight with module management and student tracking tools.', bg: 'bg-brand-violet/10', border: 'border-brand-violet/20' },
  { icon: '🎓', title: 'Student Dashboard', desc: 'Personalized learning hub with progress tracking and lesson history.', bg: 'bg-brand-green/10', border: 'border-brand-green/20' },
  { icon: '♿', title: 'Accessibility Features', desc: 'Sign language support, visual aids, and keyboard-friendly navigation.', bg: 'bg-brand-rose/10', border: 'border-brand-rose/20' },
  { icon: '📈', title: 'Progress Monitoring', desc: 'Real-time performance analytics and classroom achievement reporting.', bg: 'bg-brand-amber/10', border: 'border-brand-amber/20' },
  { icon: '📡', title: 'Offline Support', desc: 'Download lesson briefs for classrooms with limited internet connectivity.', bg: 'bg-brand-blue-soft/30', border: 'border-brand-blue/20' },
]

const whyChoose = [
  { icon: '🌍', title: 'Inclusive Learning', desc: 'Every student can access and participate regardless of learning differences.' },
  { icon: '🎯', title: 'Interactive Lessons', desc: 'Hands-on activities, quizzes, and games keep learners actively engaged.' },
  { icon: '♿', title: 'Accessibility Support', desc: 'Built with WCAG 2.2 compliance and hearing-impairment support in mind.' },
  { icon: '📊', title: 'Student Progress Tracking', desc: 'Live dashboard to monitor and celebrate every student milestone.' },
  { icon: '👩‍🏫', title: 'Teacher Management Tools', desc: 'Create classes, assign modules, and track classroom performance easily.' },
  { icon: '📱', title: 'Responsive Design', desc: 'Works perfectly on desktops, tablets, and mobile devices at any screen size.' },
  { icon: '😊', title: 'Child-Friendly Interface', desc: 'Bright, intuitive, and fun UI designed with young learners in mind.' },
  { icon: '🔒', title: 'Secure Environment', desc: 'Role-based access and data privacy built into every layer of the system.' },
]

const howItWorks = [
  { icon: '✍️', title: 'Register', desc: 'Create your Teacher or Student account in minutes.', bg: 'bg-brand-blue-soft' },
  { icon: '🔑', title: 'Login', desc: 'Securely sign in with your credentials and land on your dashboard.', bg: 'bg-brand-amber/20' },
  { icon: '📚', title: 'Learn', desc: 'Access lessons, quizzes, activities, and accessible video content.', bg: 'bg-brand-green/20' },
  { icon: '📈', title: 'Track Progress', desc: 'Monitor achievements and classroom performance in real time.', bg: 'bg-brand-violet/15' },
]

const accessibilityCards = [
  { icon: '📝', title: 'Subtitles & Captions', desc: 'All video content includes subtitles for learners with hearing impairment.' },
  { icon: '👁️', title: 'Visual Learning', desc: 'Rich imagery, diagrams, and infographics support visual-first learners.' },
  { icon: '🖖', title: 'Interactive Activities', desc: 'Hands-on quizzes and activities replace passive content consumption.' },
  { icon: '🧭', title: 'Accessible Navigation', desc: 'Keyboard-friendly and screen reader-compatible navigation throughout.' },
  { icon: '📱', title: 'Responsive Design', desc: 'Optimized layout for every device — from tablet to laptop to phone.' },
  { icon: '🤝', title: 'Support System', desc: 'Teachers and admin can provide personalized support to every learner.' },
]

const accessibilityList = [
  'Full keyboard navigation support',
  'ARIA labels and semantic HTML throughout',
  'Sufficient contrast ratios for all text',
  'Subtitles on all video content',
  'Screen reader compatible interface',
]

const footerQuickLinks = [
  { label: 'Home', href: '#home', to: null },
  { label: 'About', href: '#about', to: null },
  { label: 'Features', href: '#features', to: null },
  { label: 'Portal', href: '/portal', to: '/portal' },
  { label: 'Sign In', href: '/login', to: '/login' },
  { label: 'Register', href: '/register', to: '/register' },
]

const footerSystemLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms & Conditions', href: '#' },
  { label: 'Contact Us', href: '#' },
  { label: 'Admin Login', href: '/admin/login' },
]
</script>

<style scoped>
/* Slide-down animation for mobile menu */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* Hero fade-in-up animation */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.7s ease-out forwards;
}

/* Float animations for hero badge cards */
@keyframes floatSlow {
  0%, 100% { transform: translateY(0px) rotate(-1deg); }
  50%       { transform: translateY(-10px) rotate(1deg); }
}
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(1deg); }
  50%       { transform: translateY(-8px) rotate(-1deg); }
}
.animate-float-slow { animation: floatSlow 5s ease-in-out infinite; }
.animate-float      { animation: float 4s ease-in-out infinite; }
</style>
