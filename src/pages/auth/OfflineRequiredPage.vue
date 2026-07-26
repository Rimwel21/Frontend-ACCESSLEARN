<template>
  <main class="grid min-h-screen place-items-center bg-surface px-5">
    <section class="auth-card text-center">
      <p class="font-mono text-[11px] font-bold uppercase tracking-widest text-brand-blue">Internet Required</p>
      <h1 class="mt-2 font-display text-3xl font-bold text-ink">This area is unavailable offline.</h1>
      <p class="mt-3 text-sm leading-relaxed text-ink-soft">
        Teacher and administrator tools require a live connection. Student learning pages can continue offline when previously opened.
      </p>
      <RouterLink class="btn-primary mt-6 inline-flex" to="/student/dashboard">Go to Student Learning</RouterLink>
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
