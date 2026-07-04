<template>
  <main class="min-h-screen bg-surface px-4 py-10 text-ink sm:px-6">
    <section class="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl content-center gap-8">
      <div class="max-w-3xl">
        <div class="flex items-center gap-3 mb-2 cursor-default select-none" @click="handleLogoClick">
          <div class="h-10 w-10 bg-brand-blue rounded-xl flex items-center justify-center text-white font-bold shadow-sm">AL</div>
          <p class="eyebrow !mb-0">ACCESS Learn Portal</p>
        </div>
        <h1 class="font-display text-5xl font-bold leading-none sm:text-6xl">Choose your account flow</h1>
        <p class="mt-5 max-w-2xl text-base leading-8 text-ink-soft">
          Register or login as a student or teacher, complete your profile, then continue into the learning dashboard.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <article v-for="option in options" :key="option.role" class="card p-6">
          <span :class="['role-pill', option.role === 'teacher' ? 'role-pill-teacher' : '']">{{ option.label }}</span>
          <h2 class="mt-5 font-display text-2xl font-bold">{{ option.label }} Account</h2>
          <p class="mt-2 text-sm leading-6 text-ink-soft">{{ option.description }}</p>
          <div class="mt-6 flex flex-wrap gap-3">
            <RouterLink :to="`/register?role=${option.role}`" class="btn-primary">Register</RouterLink>
            <RouterLink :to="`/login?role=${option.role}`" class="btn-secondary">Login</RouterLink>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()

const options = [
  {
    role: 'student',
    label: 'Student',
    description: 'Use a username to register and login. Student profiles include learner type and guardian details.',
  },
  {
    role: 'teacher',
    label: 'Teacher',
    description: 'Use an email address to register and login. Teacher profiles include contact details and class tools.',
  },
]

// Hidden Admin Triggers
const clickCount = ref(0)
let clickTimer: any = null

function handleLogoClick() {
  clickCount.value++
  
  if (clickTimer) clearTimeout(clickTimer)
  
  clickTimer = setTimeout(() => {
    clickCount.value = 0
  }, 3000)

  if (clickCount.value >= 5) {
    router.push('/admin/login')
  }
}

function handleKeydown(e: KeyboardEvent) {
  // Ctrl + Shift + A
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
    e.preventDefault()
    router.push('/admin/login')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (clickTimer) clearTimeout(clickTimer)
})
</script>
