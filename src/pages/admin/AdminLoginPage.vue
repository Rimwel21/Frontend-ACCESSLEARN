<template>
  <main class="auth-page bg-surface-2/30">
    <section class="auth-card border-t-4 border-brand-blue animate-scale-in">
      <RouterLink to="/" class="auth-back flex items-center gap-2">
        <span class="text-lg">←</span> Back home
      </RouterLink>
      
      <div class="mb-8 mt-4 flex items-center gap-3">
        <div class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-brand-teal/20">
          <img
            src="@/assets/signhear_icon_logo.png"
            alt="SIGNHEAR"
            class="h-full w-full object-contain"
            style="transform: scale(1.85)"
          />
        </div>
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue">Security Gateway</p>
          <h1 class="font-display text-2xl font-bold text-ink">SIGNHEAR Admin Login</h1>
        </div>
      </div>

      <form class="form-stack" @submit.prevent="handleLogin">
        <div>
          <label class="field-label" for="email">Admin Email</label>
          <input id="email" v-model.trim="email" class="input-field mt-1.5" type="email" placeholder="admin@signhear.edu.ph" required />
        </div>

        <div>
          <label class="field-label" for="password">Security Password</label>
          <div class="relative mt-1.5">
            <input id="password" v-model="password" class="input-field pr-12" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" required />
            <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-blue hover:text-blue-700" @click="showPassword = !showPassword">
              {{ showPassword ? 'HIDE' : 'SHOW' }}
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between py-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" class="rounded border-gray-300 text-brand-blue focus:ring-brand-blue h-4 w-4" />
            <span class="text-xs font-semibold text-ink-soft">Trust this device</span>
          </label>
          <button type="button" class="text-xs font-bold text-brand-blue hover:underline" @click="handleForgotPassword">
            Forgot Password?
          </button>
        </div>

        <p v-if="errorMsg" class="status-error flex items-center gap-2 animate-wiggle" role="alert">
          <span>⚠️</span> {{ errorMsg }}
        </p>

        <button type="submit" class="btn-primary w-full justify-center !py-3 rounded-xl mt-4 shadow-blue-200" :disabled="loading">
          {{ loading ? 'Securing Session...' : 'Authenticate' }}
        </button>
      </form>

      <div class="mt-8 p-4 bg-brand-blue/5 rounded-2xl border border-brand-blue/10">
        <p class="text-[10px] leading-relaxed text-brand-blue font-bold uppercase tracking-wide text-center">
          Authorized personnel only. All access attempts are logged and audited in compliance with security policy SEC-932.
        </p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''

  try {
    await auth.login(
      {
        email: email.value,
        password: password.value,
      },
      'admin',
    )
    router.push('/admin/dashboard')
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : 'Invalid administrative credentials or unauthorized access.'
  } finally {
    loading.value = false
  }
}

function handleForgotPassword() {
    alert('Administrative password reset requires System Administrator approval. Please contact the IT department.')
}
</script>

<style scoped>
.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}
.animate-wiggle {
  animation: wiggle 0.4s ease-in-out;
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes wiggle {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
</style>
