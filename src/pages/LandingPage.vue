<template>
  <div class="flex flex-col lg:flex-row min-h-screen bg-surface font-body w-full">
    
    <!-- Mobile Header (Visible only on small screens) -->
    <header class="lg:hidden flex items-center justify-between gap-3 px-4 py-2.5 border-b border-brand-teal/30 bg-white z-50">
      <div class="min-w-0">
        <img
          src="@/assets/signhear_logo.png"
          alt="SIGNHEAR - Sign Language Integrated Guidance for Hearing Education and Accessible Resources"
          class="h-10 w-auto max-w-[min(58vw,180px)] object-contain object-left sm:h-12"
        />
      </div>
      <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="text-ink-soft hover:text-ink">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>
    </header>

    <!-- Mobile Menu Overlay -->
    <div v-if="isMobileMenuOpen" class="fixed inset-0 bg-surface z-40 pt-20 px-6 lg:hidden flex flex-col space-y-3">
       <RouterLink to="/" @click="isMobileMenuOpen=false" class="flex items-center gap-3 border-l-[3px] border-brand-amber bg-brand-blue/[0.12] px-4 py-3 rounded-xl text-ink font-bold">Home</RouterLink>
       <RouterLink to="/portal" @click="isMobileMenuOpen=false" class="flex items-center gap-3 border-l-[3px] border-transparent px-4 py-3 rounded-xl text-brand-blue/80 font-bold hover:translate-x-1 hover:bg-brand-teal/[0.15] hover:text-brand-blue">Register</RouterLink>
       <RouterLink to="/portal" @click="isMobileMenuOpen=false" class="flex items-center gap-3 border-l-[3px] border-transparent px-4 py-3 rounded-xl text-brand-blue/80 font-bold hover:translate-x-1 hover:bg-brand-teal/[0.15] hover:text-brand-blue">Log in</RouterLink>
    </div>

    <!-- Sidebar (Desktop) -->
    <aside class="hidden lg:flex w-[260px] bg-surface/60 border-r border-brand-teal/30 flex-col justify-between shrink-0 relative z-20 shadow-[4px_0_24px_rgba(10,123,121,0.04)]">
      <div>
        <!-- Logo Area -->
        <div class="flex flex-col items-center px-6 pb-5 pt-7 text-center">
          <img
            src="@/assets/signhear_logo.png"
            alt="SIGNHEAR - Sign Language Integrated Guidance for Hearing Education and Accessible Resources"
            class="h-auto w-full max-w-[150px] object-contain xl:max-w-[165px]"
          />
        </div>

        <!-- Navigation -->
        <nav class="px-4 space-y-2">
          <a href="#" class="flex items-center gap-3 border-l-[3px] border-brand-amber bg-brand-blue/[0.12] px-4 py-3 rounded-xl text-brand-blue font-bold transition-all">
            <svg class="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Home
          </a>
          <RouterLink to="/portal" class="flex items-center gap-3 border-l-[3px] border-transparent px-4 py-3 rounded-xl text-brand-blue/80 font-bold hover:translate-x-1 hover:bg-brand-teal/[0.15] hover:text-brand-blue transition-all">
            <svg class="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
            Register
          </RouterLink>
          <RouterLink to="/portal" class="flex items-center gap-3 border-l-[3px] border-transparent px-4 py-3 rounded-xl text-brand-blue/80 font-bold hover:translate-x-1 hover:bg-brand-teal/[0.15] hover:text-brand-blue transition-all">
            <svg class="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            Log in
          </RouterLink>
        </nav>
      </div>

      <!-- Accessibility badge -->
      <div class="px-6 pb-8">
        <div class="rounded-xl border border-brand-teal/30 bg-white/70 px-4 py-3 text-center shadow-sm">
          <div class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue text-[11px] font-black leading-none text-white">
            WCAG<br />2.2
          </div>
          <p class="text-[10px] font-bold uppercase tracking-wide text-brand-blue">Compliant</p>
          <p class="mt-1 text-[10px] font-semibold leading-snug text-ink-soft">
            Readable, keyboard-friendly, accessible learning.
          </p>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col relative grid-bg h-full lg:overflow-y-auto overflow-x-hidden">
      
      <!-- Content Area -->
      <div class="flex min-h-full w-full max-w-[1280px] flex-1 flex-col justify-between gap-3 p-4 sm:p-5 lg:mx-auto lg:px-8 lg:py-4">
        <div class="space-y-3 lg:space-y-4">
        
        <!-- Hero Banner -->
        <div class="relative w-full max-w-[1160px] mx-auto rounded-[16px] gradient-brand shadow-xl overflow-hidden">
          <div class="grid items-stretch lg:grid-cols-[minmax(300px,0.82fr)_minmax(0,1fr)]">
            <div class="flex items-center justify-center bg-white/14 px-4 pt-4 sm:px-5 sm:pt-5 lg:min-h-[255px] xl:min-h-[280px] lg:p-0">
              <img
                src="@/assets/hero_illustration.png"
                alt="Students learning"
                class="aspect-[4/3] w-full max-w-[min(78vw,300px)] rounded-t-sm object-contain drop-shadow-2xl sm:max-w-[min(62vw,350px)] lg:aspect-auto lg:h-full lg:max-h-[280px] lg:max-w-[400px] lg:rounded-none"
              />
            </div>

            <div class="flex min-w-0 flex-col justify-center px-6 py-6 text-white sm:px-8 sm:py-7 lg:px-10 xl:px-12">
              <h2 class="font-display text-2xl sm:text-3xl lg:text-[32px] xl:text-[36px] font-extrabold mb-3 leading-[1.16] w-full text-shadow-sm tracking-tight text-white">
                Learning that adapts to every child, every ability, every classroom.
              </h2>
              <p class="text-surface text-[13px] sm:text-sm mb-5 max-w-[620px] font-medium leading-relaxed">
                AccessLearn combines audio lessons, sign-language videos, subtitles, and adaptive quizzes to create equitable learning in Philippine schools.
              </p>
              <div class="flex justify-center sm:justify-start">
                <RouterLink to="/portal" class="bg-brand-amber text-white px-9 py-3 rounded-full font-bold text-sm shadow-lg transition-all hover:scale-105 text-center min-w-40 hover:bg-gradient-to-r hover:from-brand-amber hover:to-brand-rose hover:shadow-[0_0_20px_rgba(244,163,99,0.4)]">Get Started</RouterLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature Cards -->
        <section id="features" class="relative z-20 mx-auto w-full max-w-[1160px] space-y-2" aria-labelledby="features-title">
          <div>
            <h2 id="features-title" class="font-display text-[22px] font-black leading-none text-ink">Features</h2>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          <!-- Card 1 -->
          <div class="bg-white rounded-xl p-4 lg:p-4 flex min-h-[188px] flex-col items-center text-center shadow-card border border-brand-teal/30 hover:-translate-y-2 hover:border-brand-amber hover:shadow-card-hover transition-all group">
            <div class="text-3xl lg:text-[32px] mb-2 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">🧏💬</div>
            <h3 class="font-bold text-ink text-[13px] lg:text-sm mb-2 leading-tight">Sign & Captions</h3>
            <p class="text-[10px] lg:text-[11px] text-ink-soft leading-relaxed font-medium">For hearing support learners.<br/> Each module includes sign‑language videos, subtitles, and transcript toggles.</p>
          </div>
          <!-- Card 2 -->
          <div class="bg-white rounded-xl p-4 lg:p-4 flex min-h-[188px] flex-col items-center text-center shadow-card border border-brand-teal/30 hover:-translate-y-2 hover:border-brand-amber hover:shadow-card-hover transition-all group">
            <div class="text-3xl lg:text-[32px] mb-2 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">🎯📚</div>
            <h3 class="font-bold text-ink text-[13px] lg:text-sm mb-2 leading-tight">Adaptive Activities</h3>
            <p class="text-[10px] lg:text-[11px] text-ink-soft leading-relaxed font-medium">Personalized interactive tasks.<br/> Adjust to each learner’s progress, ensuring engagement and mastery of skills.</p>
          </div>
          <!-- Card 3 -->
          <div class="bg-white rounded-xl p-4 lg:p-4 flex min-h-[188px] flex-col items-center text-center shadow-card border border-brand-teal/30 hover:-translate-y-2 hover:border-brand-amber hover:shadow-card-hover transition-all group">
            <div class="text-3xl lg:text-[32px] mb-2 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">✅⚙️</div>
            <h3 class="font-bold text-ink text-[13px] lg:text-sm mb-2 leading-tight">Adaptive Quizzes</h3>
            <p class="text-[10px] lg:text-[11px] text-ink-soft leading-relaxed font-medium">Smart assessments.<br/> Adapt difficulty based on performance, guiding learners toward review or advancement.</p>
          </div>
          <!-- Card 4 -->
          <div class="bg-white rounded-xl p-4 lg:p-4 flex min-h-[188px] flex-col items-center text-center shadow-card border border-brand-teal/30 hover:-translate-y-2 hover:border-brand-amber hover:shadow-card-hover transition-all group">
            <div class="text-3xl lg:text-[32px] mb-2 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">👩🏫📊</div>
            <h3 class="font-bold text-ink text-[13px] lg:text-sm mb-2 leading-tight">Teacher Dashboard</h3>
            <p class="text-[10px] lg:text-[11px] text-ink-soft leading-relaxed font-medium">Class insights.<br/> Track progress, scores, and upload new inclusive lessons.</p>
          </div>
          <!-- Card 5 -->
          <div class="bg-white rounded-xl p-4 lg:p-4 flex min-h-[188px] flex-col items-center text-center shadow-card border border-brand-teal/30 hover:-translate-y-2 hover:border-brand-amber hover:shadow-card-hover transition-all group sm:col-span-2 lg:col-span-1">
            <div class="text-3xl lg:text-[32px] mb-2 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">☁️💾</div>
            <h3 class="font-bold text-ink text-[13px] lg:text-sm mb-2 leading-tight">Offline‑Ready</h3>
            <p class="text-[10px] lg:text-[11px] text-ink-soft leading-relaxed font-medium">Low bandwidth support.<br/> Download lesson briefs for classrooms with limited connectivity.</p>
          </div>
          </div>
        </section>
        </div>

        <!-- Footer -->
        <div class="-mx-4 -mb-4 bg-surface px-4 py-3 sm:-mx-5 sm:-mb-5 sm:px-5 lg:-mx-8 lg:-mb-4 lg:px-8">
          <div class="system-footer mx-auto flex max-w-4xl flex-col items-center justify-center gap-1 text-center text-[10px] font-bold text-ink-soft sm:flex-row sm:flex-wrap sm:gap-x-3 sm:gap-y-1">
            <span>&copy; {{ new Date().getFullYear() }} ACCESSLearn Inc. | Philippine Schools Initiative</span>
            <span class="hidden text-ink-soft sm:inline" aria-hidden="true">|</span>
            <span class="inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-brand-blue">
              <span class="rounded bg-brand-blue px-1.5 py-0.5 text-[9px] font-black text-white">WCAG 2.2</span>
              Compliant: Accessible learning.
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const isMobileMenuOpen = ref(false)
</script>

<style scoped>
.grid-bg {
  background-color: #D3F2E9;
  background-image: 
    radial-gradient(circle at 90% 8%, rgba(244, 163, 99, 0.08), transparent 34rem),
    radial-gradient(circle at 82% 12%, rgba(10, 123, 121, 0.05), transparent 28rem),
    linear-gradient(rgba(124, 168, 161, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124, 168, 161, 0.2) 1px, transparent 1px);
  background-size: 32px 32px;
  background-position: -1px -1px;
}
.text-shadow-sm {
  text-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.system-footer {
  text-decoration-color: transparent;
  text-underline-offset: 5px;
}
.system-footer:hover {
  color: #0A7B79;
  text-decoration: underline;
  text-decoration-color: #F4A363;
}
</style>
