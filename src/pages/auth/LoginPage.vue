<template>
  <main class="auth-page">
    <section class="auth-card">
      <RouterLink to="/" class="auth-back">Back home</RouterLink>
      <p class="eyebrow">{{ role }}</p>
      <h1 class="auth-title">{{ roleLabel }} Login</h1>

      <form class="form-stack" @submit.prevent="submitLogin">
        <label class="field-label" for="role">Login as</label>
        <select id="role" v-model="role" class="input-field">
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>

        <template v-if="role === 'teacher'">
          <label class="field-label" for="email">Email</label>
          <input id="email" v-model.trim="email" class="input-field" type="email" autocomplete="email" minlength="5" maxlength="50" required />
        </template>

        <template v-else>
          <label class="field-label" for="username">Username</label>
          <input id="username" v-model.trim="username" class="input-field" type="text" autocomplete="username" minlength="5" maxlength="50" required />
        </template>

        <label class="field-label" for="password">Password</label>
        <div class="grid grid-cols-[1fr_auto] gap-2">
          <input id="password" v-model="password" class="input-field" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" minlength="8" maxlength="30" required />
          <button type="button" class="btn-secondary rounded-lg" @click="showPassword = !showPassword">
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>

        <p v-if="auth.error" class="status-error" role="alert">{{ auth.error }}</p>

        <button type="submit" class="btn-primary w-full justify-center rounded-lg" :disabled="auth.loading">
          {{ auth.loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p class="mt-5 text-sm text-ink-soft">
        Need an account?
        <RouterLink :to="`/register?role=${role}`" class="font-bold text-brand-blue">Create one</RouterLink>
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

type Role = 'student' | 'teacher'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const requestedRole = route.query.role === 'student' ? 'student' : 'teacher'
const role = ref<Role>(requestedRole)
const email = ref('')
const username = ref('')
const password = ref('')
const showPassword = ref(false)

const roleLabel = computed(() => role.value === 'student' ? 'Student' : 'Teacher')

async function submitLogin() {
  const isTeacher = role.value === 'teacher'

  try {
    const data = await auth.login({
      email: isTeacher ? email.value : null,
      username: isTeacher ? null : username.value,
      password: password.value,
    }, role.value)

    if (!data.profile_completed) {
      router.push('/profile/setup')
      return
    }

    router.push(isTeacher ? '/teacher/class' : '/student/dashboard')
  } catch {
    // The auth store owns the visible error message.
  }
}
</script>
