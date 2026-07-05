<template>
  <div class="landing-page min-h-screen bg-white text-ink font-body">
    <!-- Navigation Bar -->
    <nav class="sticky top-0 z-[100] w-full border-b border-gray-100/50 bg-white/70 backdrop-blur-xl transition-all duration-500" :class="{ 'shadow-xl shadow-brand-blue/5 border-b-brand-blue/10': scrolled }">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <!-- Logo -->
        <div class="flex items-center gap-3 cursor-pointer select-none group" @click="handleLogoClick">
          <div class="flex h-11 w-11 items-center justify-center rounded-[14px] bg-brand-blue font-bold text-white shadow-xl shadow-brand-blue/20 transition-transform group-hover:scale-110 active:scale-95">AL</div>
          <div class="flex flex-col">
            <span class="font-display text-xl font-black tracking-tighter text-ink leading-none">ACCESSLearn</span>
            <span class="text-[9px] font-bold text-brand-blue uppercase tracking-widest mt-0.5">Inclusive E-Learning</span>
          </div>
        </div>
        
        <!-- Desktop Nav -->
        <div class="hidden items-center gap-10 lg:flex">
          <div class="flex items-center gap-8">
            <a v-for="link in navLinks" :key="link.href" :href="link.href" class="text-sm font-bold text-ink-soft hover:text-brand-blue transition-all relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-brand-blue after:transition-all hover:after:w-full">{{ link.label }}</a>
          </div>
          <div class="h-6 w-px bg-gray-100"></div>
          <div class="flex items-center gap-4">
            <RouterLink to="/login" class="text-sm font-bold text-ink hover:text-brand-blue transition-colors">Sign In</RouterLink>
            <RouterLink to="/register" class="btn-primary !px-7 !py-2.5 !text-xs !uppercase !tracking-widest">Get Started</RouterLink>
          </div>
        </div>
        
        <!-- Mobile Toggle -->
        <button class="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-surface-2 text-ink active:scale-90 transition-transform" @click="isMenuOpen = !isMenuOpen">
          <span class="text-xl" v-if="!isMenuOpen">☰</span>
          <span class="text-xl" v-else>✕</span>
        </button>
      </div>
      
      <!-- Mobile Menu -->
      <transition name="slide-down">
        <div v-if="isMenuOpen" class="absolute top-full left-0 w-full border-t border-gray-100 bg-white p-6 shadow-2xl lg:hidden">
          <div class="flex flex-col gap-6">
            <a v-for="link in navLinks" :key="link.href" :href="link.href" class="text-lg font-bold text-ink" @click="isMenuOpen = false">{{ link.label }}</a>
            <hr class="border-gray-50" />
            <div class="grid gap-3">
              <RouterLink to="/login" class="btn-secondary !py-4 text-center" @click="isMenuOpen = false">Login</RouterLink>
              <RouterLink to="/register" class="btn-primary !py-4 text-center" @click="isMenuOpen = false">Create Account</RouterLink>
            </div>
          </div>
        </div>
      </transition>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="relative overflow-hidden bg-surface pt-4 pb-20 lg:pt-8 lg:pb-24">
      <div class="mx-auto max-w-7xl px-6">
        <div class="grid items-center gap-16 lg:grid-cols-2">
          <div class="relative z-10 space-y-8 animate-fade-in-up">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue-soft/30 rounded-full border border-brand-blue/10">
              <span class="flex h-2 w-2 rounded-full bg-brand-blue animate-pulse"></span>
              <span class="text-[10px] font-black text-brand-blue uppercase tracking-widest">Now supporting Grades K-6</span>
            </div>
            
            <h1 class="font-display text-6xl font-bold leading-[0.95] text-ink sm:text-7xl xl:text-8xl tracking-tighter">
              Learning Made <br />
              <span class="text-brand-blue relative">
                Accessible
                <svg class="absolute -bottom-2 left-0 w-full h-3 text-brand-yellow/40" viewBox="0 0 200 20" fill="currentColor"><path d="M0,10 Q50,0 100,10 T200,10" /></svg>
              </span>
            </h1>
            
            <p class="max-w-xl text-lg md:text-xl font-medium leading-relaxed text-ink-soft">
              ACCESSLearn empowers intermediate learners with hearing impairment through interactive lessons, real-time tracking, and inclusive digital tools.
            </p>
            
            <div class="flex flex-wrap gap-5">
              <RouterLink to="/register" class="btn-primary !px-10 !py-4.5 !text-base shadow-2xl shadow-brand-blue/30">Start Learning Now</RouterLink>
              <a href="#features" class="btn-secondary !px-10 !py-4.5 !text-base hover:bg-gray-50 border border-gray-100">Explore Features</a>
            </div>

            <!-- Stats Mini -->
            <div class="pt-2 flex items-center gap-10">
               <div class="flex flex-col">
                 <span class="text-3xl font-black text-ink leading-none">100%</span>
                 <span class="text-[10px] font-black text-ink-soft uppercase tracking-widest mt-1">Accessible</span>
               </div>
               <div class="h-10 w-px bg-gray-100/60 lg:block hidden"></div>
               <div class="flex flex-col">
                 <span class="text-3xl font-black text-ink leading-none">K-6</span>
                 <span class="text-[10px] font-black text-ink-soft uppercase tracking-widest mt-1">Curriculum</span>
               </div>
            </div>
          </div>
          
          <div class="relative lg:block">
            <div class="image-wrapper relative z-10 overflow-hidden rounded-[3rem] border-[12px] border-white shadow-2xl animate-float">
              <img src="@/assets/hero_classroom.png" alt="Inclusive Classroom" class="h-full w-full object-cover transform transition-transform duration-1000 hover:scale-105" />
            </div>
            
            <!-- Orbs -->
            <div class="absolute -bottom-10 -right-10 -z-10 h-72 w-72 rounded-full bg-brand-blue-soft/40 blur-3xl"></div>
            <div class="absolute top-10 -left-20 -z-10 h-48 w-48 rounded-full bg-brand-yellow/20 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="bg-white py-24 lg:py-40 relative">
      <div class="mx-auto max-w-7xl px-6">
        <div class="grid lg:grid-cols-2 gap-20 items-center">
          <div class="space-y-6">
            <span class="eyebrow">The Mission</span>
            <h2 class="font-display text-5xl font-bold text-ink tracking-tight">A Platform for inclusive Digital Education</h2>
            <p class="text-lg text-ink-soft leading-relaxed">
              Developed to bridge the gap in digital learning, ACCESSLearn ensures that no student is left behind. Our adaptive platform provides the framework for teachers to deliver high-quality modules tailored to the specific needs of diverse learners.
            </p>
            <ul class="space-y-4 pt-4">
               <li v-for="item in ['Organized digital curriculum', 'Real-time performance analytics', 'Simplified communication tools']" :key="item" class="flex items-center gap-3">
                 <div class="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-[10px]">✓</div>
                 <span class="font-bold text-sm text-ink-soft">{{ item }}</span>
               </li>
            </ul>
          </div>
          
          <div class="grid grid-cols-2 gap-4 animate-stagger-fade">
             <div class="card p-8 bg-surface border-0 space-y-4 mt-12">
                <span class="text-3xl">📁</span>
                <h4 class="font-bold text-brand-blue">Resource Center</h4>
                <p class="text-xs text-ink-soft font-medium">Teachers can upload and centralize all learning materials.</p>
             </div>
             <div class="card p-8 bg-surface border-0 space-y-4">
                <span class="text-3xl">🧩</span>
                <h4 class="font-bold text-brand-violet">Interactive Quizzes</h4>
                <p class="text-xs text-ink-soft font-medium">Engaging assessments with automated feedback loops.</p>
             </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Container -->
    <section id="features" class="bg-surface py-24 lg:py-40">
      <div class="mx-auto max-w-7xl px-6">
        <!-- Student Side -->
        <div class="mb-32">
          <div class="flex flex-col items-center text-center mb-16 space-y-4">
            <span class="eyebrow bg-brand-blue/10 px-4 py-1.5 rounded-full">For Students</span>
            <h2 class="text-4xl font-display font-bold text-ink">Learn at your own pace</h2>
          </div>
          <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="f in studentFeatures" :key="f.title" class="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm transition-all hover:shadow-xl hover:shadow-gray-200/50 hover:border-brand-blue/10 hover:-translate-y-2 group">
              <div class="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl mb-8 shadow-sm bg-brand-blue-soft group-hover:bg-brand-blue group-hover:text-white transition-all">{{ f.icon }}</div>
              <h3 class="font-bold text-ink text-xl mb-3">{{ f.title }}</h3>
              <p class="text-xs leading-relaxed text-ink-soft font-medium">{{ f.description }}</p>
            </div>
          </div>
        </div>
        
        <!-- Teacher Side -->
        <div>
          <div class="flex flex-col items-center text-center mb-16 space-y-4">
            <span class="eyebrow bg-brand-violet/10 text-brand-violet px-4 py-1.5 rounded-full">For Teachers</span>
            <h2 class="text-4xl font-display font-bold text-ink">Teach more effectively</h2>
          </div>
          <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="f in teacherFeatures" :key="f.title" class="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm transition-all hover:shadow-xl hover:shadow-gray-200/50 hover:border-brand-blue/10 hover:-translate-y-2 group">
              <div class="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl mb-8 shadow-sm bg-violet-100 text-brand-violet group-hover:bg-brand-violet group-hover:text-white transition-all">{{ f.icon }}</div>
              <h3 class="font-bold text-ink text-xl mb-3">{{ f.title }}</h3>
              <p class="text-xs leading-relaxed text-ink-soft font-medium">{{ f.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Accessibility Highlights -->
    <section class="bg-ink py-32 overflow-hidden relative">
       <div class="absolute inset-0 bg-brand-blue/5"></div>
       <div class="mx-auto max-w-7xl px-6 relative z-10">
          <div class="grid lg:grid-cols-5 gap-16 items-center">
             <div class="lg:col-span-2 space-y-8">
               <span class="eyebrow text-blue-400">Inclusivity focus</span>
               <h2 class="text-5xl font-display font-bold text-white leading-tight">Designed for the Silent Learner</h2>
               <p class="text-blue-100/60 leading-relaxed font-medium">Unlike generic systems, ACCESSLearn builds accessibility directly into the curriculum flow, not as an afterthought.</p>
               <RouterLink to="/register" class="btn-primary !bg-white !text-brand-blue hover:!bg-gray-100 flex items-center justify-center gap-2 group w-fit">
                 <span>Sign Up Today</span>
                 <span class="group-hover:translate-x-2 transition-transform">➡️</span>
               </RouterLink>
             </div>
             
             <div class="lg:col-span-3 grid sm:grid-cols-2 gap-4">
                <div v-for="item in accessRows" :key="item.title" class="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4 hover:border-white/20 transition-all group">
                   <div class="h-10 w-10 flex items-center justify-center rounded-xl bg-white/10 text-xl">{{ item.icon }}</div>
                   <h4 class="font-bold text-white group-hover:text-brand-blue transition-colors">{{ item.title }}</h4>
                   <p class="text-[11px] font-medium text-white/50 leading-relaxed">{{ item.desc }}</p>
                </div>
             </div>
          </div>
       </div>
    </section>

    <!-- Choose Portal Section -->
    <section class="py-32 bg-white flex items-center justify-center overflow-hidden">
       <div class="mx-auto max-w-5xl px-6">
          <div class="text-center mb-20">
             <h2 class="text-5xl font-display font-bold text-ink">Ready to Start?</h2>
             <p class="text-ink-soft font-medium mt-4">Select the portal you wish to enter</p>
          </div>
          
          <div class="grid md:grid-cols-2 gap-12">
             <!-- Card Student -->
             <div class="group relative">
                <div class="absolute -inset-2 bg-gradient-to-r from-brand-blue to-brand-teal rounded-[2rem] opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500"></div>
                <div class="card p-12 border-2 border-gray-100 hover:border-brand-blue transition-all relative z-10 bg-white">
                   <span class="text-5xl block mb-6 transition-transform group-hover:scale-125 duration-500">🎒</span>
                   <h3 class="text-3xl font-display font-bold text-ink underline decoration-brand-blue/30 decoration-4 mb-4">Student Portal</h3>
                   <p class="text-sm text-ink-soft mb-8 font-medium">Explore lessons, complete quizzes, and watch your skills grow every day.</p>
                   <RouterLink to="/login?role=student" class="btn-primary w-full py-4 text-center rounded-2xl">Enter Student Portal</RouterLink>
                </div>
             </div>
             
             <!-- Card Teacher -->
             <div class="group relative">
                <div class="absolute -inset-2 bg-gradient-to-r from-brand-amber to-brand-rose rounded-[2rem] opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500"></div>
                <div class="card p-12 border-2 border-gray-100 hover:border-brand-amber transition-all relative z-10 bg-white">
                   <span class="text-5xl block mb-6 transition-transform group-hover:scale-125 duration-500">🏫</span>
                   <h3 class="text-3xl font-display font-bold text-ink underline decoration-brand-amber/30 decoration-4 mb-4">Teacher Portal</h3>
                   <p class="text-sm text-ink-soft mb-8 font-medium">Manage classroom resources, monitor progress, and inspire your students.</p>
                   <RouterLink to="/login?role=teacher" class="btn-primary !bg-brand-amber hover:!bg-amber-600 w-full py-4 text-center rounded-2xl shadow-xl shadow-brand-amber/10">Enter Teacher Portal</RouterLink>
                </div>
             </div>
          </div>
       </div>
    </section>

    <!-- Footer -->
    <footer class="bg-surface py-24 border-t border-gray-100">
       <div class="mx-auto max-w-7xl px-6">
          <div class="grid gap-16 lg:grid-cols-4">
             <div class="lg:col-span-2 space-y-6">
                <div class="flex items-center gap-3">
                   <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue font-bold text-white shadow-sm">AL</div>
                   <span class="font-display font-bold text-xl">ACCESSLearn</span>
                </div>
                <p class="max-w-md text-sm text-ink-soft leading-loose font-medium">
                   Empowering intermediate learners and teachers through a unified, accessible, and organized e-learning ecosystem tailored for Philippine basic education.
                </p>
             </div>
             
             <div>
                <h5 class="text-xs font-black uppercase tracking-widest text-ink mb-6">Explore</h5>
                <ul class="space-y-4">
                   <li v-for="l in navLinks" :key="l.href">
                     <a :href="l.href" class="text-sm font-bold text-ink-soft hover:text-brand-blue transition-colors">{{ l.label }}</a>
                   </li>
                </ul>
             </div>
             
             <div>
                <h5 class="text-xs font-black uppercase tracking-widest text-ink mb-6">Contact</h5>
                <ul class="space-y-4 text-sm font-bold text-ink-soft leading-relaxed">
                   <li>support@accesslearn.edu.ph</li>
                   <li>+63 (02) 812-3456</li>
                   <li>DepEd Compliant Center</li>
                </ul>
             </div>
          </div>
          
          <div class="mt-20 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
             <p class="text-[10px] font-black uppercase tracking-widest text-ink-soft/40">© 2026 ACCESSLearn. For Inclusive Classrooms.</p>
             <div class="flex items-center gap-8">
                <a href="#" class="text-[10px] font-black uppercase tracking-widest text-ink-soft/40 hover:text-brand-blue">Privacy Policy</a>
                <a href="#" class="text-[10px] font-black uppercase tracking-widest text-ink-soft/40 hover:text-brand-blue">Terms</a>
             </div>
          </div>
       </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const isMenuOpen = ref(false)
const scrolled = ref(false)

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'Portal', href: '/portal' },
]

const studentFeatures = [
  { icon: '🎥', title: 'Video Lessons', description: 'Watch interactive video content with baked-in captions and subtitles.' },
  { icon: '🧩', title: 'Smart Quizzes', description: 'Test your knowledge with multiple choice and interactive drag-drop games.' },
  { icon: '📊', title: 'My Progress', description: 'Visualize your learning growth through high-contrast progress charts.' },
  { icon: '👐', title: 'Sign Support', description: 'Learning modules include hand-sign visual aids for hearing support.' }
]

const teacherFeatures = [
  { icon: '☁️', title: 'Bulk Upload', description: 'Upload multiple PDFs and videos directly to your digital classroom library.' },
  { icon: '📈', title: 'Analytics', description: 'Identify struggling students early with real-time participation metrics.' },
  { icon: '📂', title: 'Module Control', description: 'Publish or archive modules according to your weekly syllabus flow.' },
  { icon: '📨', title: 'Secure Login', description: 'Protected teacher-only credentialing with administrative monitoring.' }
]

const accessRows = [
  { icon: '💬', title: 'Subtitles', desc: 'Auto-sync captions for every video module.' },
  { icon: '🔤', title: 'Big Typography', desc: 'Optimized font sizes for easier reading.' },
  { icon: '⚡', title: 'Fast Actions', desc: 'Minimal keyboard steps for platform navigation.' },
  { icon: '🎨', title: 'Contrast', desc: 'Compliant color ratios for better visibility.' }
]

function handleScroll() {
  scrolled.value = window.scrollY > 20
}

// Hidden Admin Triggers
const clickCount = ref(0)
let clickTimer: any = null

function handleLogoClick() {
  clickCount.value++
  if (clickTimer) clearTimeout(clickTimer)
  clickTimer = setTimeout(() => { clickCount.value = 0 }, 3000)
  if (clickCount.value >= 5) router.push('/admin/login')
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (clickTimer) clearTimeout(clickTimer)
})
</script>

<style scoped>
.landing-page {
  scroll-behavior: smooth;
}

.landing-page {
  scroll-behavior: smooth;
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-10px) rotate(1deg); }
  66% { transform: translateY(5px) rotate(-1deg); }
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.4s ease;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
