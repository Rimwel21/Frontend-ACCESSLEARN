<template>
  <main class="auth-page">
    <section class="auth-card">
      <RouterLink to="/" class="auth-back">Back home</RouterLink>
      <p class="eyebrow">{{ role }}</p>
      <h1 class="auth-title">{{ roleLabel }} Register</h1>

      <!-- ─── Student Registration (single step, unchanged) ─── -->
      <template v-if="role === 'student'">
        <form class="form-stack" @submit.prevent="submitStudentRegister">
          <label class="field-label" for="username">Username</label>
          <input id="username" v-model.trim="username" class="input-field" type="text" autocomplete="username" minlength="5" maxlength="50" required />

          <label class="field-label" for="password">Password</label>
          <div class="grid grid-cols-[1fr_auto] gap-2">
            <input id="password" v-model="password" class="input-field" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" minlength="8" maxlength="30" required />
            <button type="button" class="btn-secondary rounded-lg" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>

          <p v-if="message" class="status-success" role="status">{{ message }}</p>
          <p v-if="validationError" class="status-error" role="alert">{{ validationError }}</p>
          <p v-if="auth.error" class="status-error" role="alert">{{ auth.error }}</p>

          <button type="submit" class="btn-primary w-full justify-center rounded-lg" :disabled="auth.loading">
            {{ auth.loading ? 'Registering...' : 'Create account' }}
          </button>
        </form>
      </template>

      <!-- ─── Teacher Registration (3-step OTP wizard) ─── -->
      <template v-else>
        <!-- Step indicators -->
        <div class="mb-6 flex items-center gap-2">
          <div v-for="s in 3" :key="s" class="flex items-center gap-2">
            <span
              :class="[
                'inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all',
                step >= s
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-surface-2 text-ink-soft',
              ]"
            >{{ s }}</span>
            <span
              v-if="s < 3"
              :class="[
                'h-0.5 w-6 rounded-full transition-all',
                step > s ? 'bg-brand-blue' : 'bg-surface-2',
              ]"
            />
          </div>
          <span class="ml-2 text-xs font-semibold text-ink-soft">{{ stepLabel }}</span>
        </div>

        <!-- Step 1: Request OTP -->
        <form v-if="step === 1" class="form-stack" @submit.prevent="submitRequestOtp">
          <label class="field-label" for="email">Email</label>
          <input id="email" v-model.trim="email" class="input-field" type="email" autocomplete="email" minlength="5" maxlength="50" required />
          <p class="text-xs text-ink-soft leading-relaxed">
            A 6-digit verification code will be sent to your email address.
          </p>

          <p v-if="auth.error" class="status-error" role="alert">{{ auth.error }}</p>

          <button type="submit" class="btn-primary w-full justify-center rounded-lg" :disabled="auth.loading">
            {{ auth.loading ? 'Sending OTP...' : 'Send Verification Code' }}
          </button>
        </form>

        <!-- Step 2: Verify OTP -->
        <form v-else-if="step === 2" class="form-stack" @submit.prevent="submitVerifyOtp">
          <div class="status-success" role="status">
            <p>OTP sent to <strong>{{ email }}</strong></p>
            <p class="mt-1 text-xs font-normal opacity-75">The code expires in 5 minutes.</p>
          </div>

          <label class="field-label" for="otp">Verification Code</label>
          <input
            id="otp"
            v-model.trim="otp"
            class="input-field text-center font-mono text-lg tracking-[0.3em]"
            type="text"
            inputmode="numeric"
            pattern="[0-9]{6}"
            minlength="6"
            maxlength="6"
            placeholder="000000"
            required
          />

          <p v-if="auth.error" class="status-error" role="alert">{{ auth.error }}</p>

          <button type="submit" class="btn-primary w-full justify-center rounded-lg" :disabled="auth.loading">
            {{ auth.loading ? 'Verifying...' : 'Verify Code' }}
          </button>

          <button type="button" class="btn-secondary w-full justify-center rounded-lg text-xs" @click="goBackToStep1">
            Use a different email
          </button>
        </form>

        <!-- Step 3: Create Account -->
        <form v-else class="form-stack" @submit.prevent="submitTeacherRegister">
          <div class="status-success" role="status">
            Email verified successfully! Now create your password.
          </div>

          <label class="field-label">Email</label>
          <input class="input-field bg-surface-2 cursor-not-allowed" type="email" :value="email" disabled />

          <label class="field-label" for="teacher-password">Password</label>
          <div class="grid grid-cols-[1fr_auto] gap-2">
            <input id="teacher-password" v-model="password" class="input-field" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" minlength="8" maxlength="30" required />
            <button type="button" class="btn-secondary rounded-lg" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>

          <p v-if="validationError" class="status-error" role="alert">{{ validationError }}</p>
          <p v-if="auth.error" class="status-error" role="alert">{{ auth.error }}</p>
          <p v-if="message" class="status-success" role="status">{{ message }}</p>

          <button v-if="!registrationComplete" type="submit" class="btn-primary w-full justify-center rounded-lg" :disabled="auth.loading">
            {{ auth.loading ? 'Creating account...' : 'Create account' }}
          </button>

          <RouterLink v-if="registrationComplete" :to="`/login?role=teacher`" class="btn-primary w-full justify-center rounded-lg text-center">
            Go to Login
          </RouterLink>
        </form>
      </template>

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
const otp = ref('')
const showPassword = ref(false)
const message = ref('')
const validationError = ref('')
const registrationComplete = ref(false)

// Teacher wizard step (1 = request OTP, 2 = verify OTP, 3 = create account)
const step = ref(1)

const roleLabel = computed(() => role.value === 'student' ? 'Student' : 'Teacher')

const stepLabel = computed(() => {
  if (step.value === 1) return 'Email Verification'
  if (step.value === 2) return 'Enter Code'
  return 'Create Account'
})

function goBackToStep1() {
  step.value = 1
  otp.value = ''
  auth.error = ''
}

// ─── Student Registration (unchanged logic) ───
async function submitStudentRegister() {
  validationError.value = ''
  message.value = ''
  auth.error = ''

  if (!/^[A-Z]/.test(username.value)) {
    validationError.value = 'Username must start with an uppercase letter.'
    return
  }

  if (password.value.toLowerCase() === username.value.toLowerCase()) {
    validationError.value = 'Password must not be the same as username.'
    return
  }

  try {
    await auth.register({
      role: 'student',
      email: null,
      username: username.value,
      password: password.value,
    })

    message.value = 'Account created. You can now login.'
    password.value = ''
  } catch {
    // auth store owns the error
  }
}

// ─── Teacher Step 1: Request OTP ───
async function submitRequestOtp() {
  auth.error = ''

  try {
    await auth.requestTeacherOtp(email.value)
    step.value = 2
  } catch {
    // auth store owns the error
  }
}

// ─── Teacher Step 2: Verify OTP ───
async function submitVerifyOtp() {
  auth.error = ''

  try {
    await auth.verifyTeacherOtp(email.value, otp.value)
    step.value = 3
  } catch {
    // auth store owns the error
  }
}

// ─── Teacher Step 3: Create Account ───
async function submitTeacherRegister() {
  validationError.value = ''
  message.value = ''
  auth.error = ''

  try {
    await auth.register({
      role: 'teacher',
      email: email.value,
      username: null,
      password: password.value,
    })

    message.value = 'Account created! Please wait for admin approval before logging in.'
    registrationComplete.value = true
    password.value = ''
  } catch {
    // auth store owns the error
  }
}
</script>
