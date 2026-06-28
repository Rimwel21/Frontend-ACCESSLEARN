<template>
  <main class="auth-page">
    <section class="auth-card">
      <RouterLink to="/" class="auth-back">Back home</RouterLink>
      <p class="eyebrow">{{ role }}</p>
      <h1 class="auth-title">{{ roleLabel }} Register</h1>

      <form class="form-stack" @submit.prevent="submitRegister">
        <label class="field-label" for="role">Role</label>
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
          <input id="password" v-model="password" class="input-field" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" minlength="8" maxlength="30" required />
          <button type="button" class="btn-secondary rounded-lg" @click="showPassword = !showPassword">
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>

        <p v-if="message" class="status-success" role="status">{{ message }}</p>
        <p v-if="auth.error" class="status-error" role="alert">{{ auth.error }}</p>

        <button type="submit" class="btn-primary w-full justify-center rounded-lg" :disabled="auth.loading">
          {{ auth.loading ? 'Registering...' : 'Create account' }}
        </button>
      </form>

      <p class="mt-5 text-sm text-ink-soft">
        Already registered?
        <RouterLink :to="`/login?role=${role}`" class="font-bold text-brand-blue">Go to login</RouterLink>
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

type Role = 'student' | 'teacher'

const route = useRoute()
const auth = useAuthStore()

const requestedRole = route.query.role === 'student' ? 'student' : 'teacher'
const role = ref<Role>(requestedRole)
const email = ref('')
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const message = ref('')

const roleLabel = computed(() => role.value === 'student' ? 'Student' : 'Teacher')

async function submitRegister() {
  const isTeacher = role.value === 'teacher'

  await auth.register({
    role: role.value,
    email: isTeacher ? email.value : null,
    username: isTeacher ? null : username.value,
    password: password.value,
  })

  message.value = 'Account created. You can now login.'
  password.value = ''
}
</script>
