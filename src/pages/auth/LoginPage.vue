<template>
  <main class="min-h-screen bg-[#f0f2f8] flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-md bg-white rounded-[24px] shadow-[0_8px_40px_rgba(15,23,42,0.10)] p-8">

      <!-- Back link -->
      <RouterLink to="/portal" class="inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue hover:text-blue-700 transition-colors mb-6">
        ← Back
      </RouterLink>

      <!-- Role badge -->
      <p class="text-[11px] font-black uppercase tracking-[0.22em] mb-1" :class="role === 'teacher' ? 'text-amber-600' : 'text-brand-blue'">
        {{ roleLabel }}
      </p>

      <!-- Title -->
      <h1 class="font-display text-[2rem] font-bold text-ink leading-tight mb-6">
        {{ roleLabel }} Login
      </h1>

      <form class="grid gap-4" @submit.prevent="submitLogin">

        <div>
          <label class="field-label" :for="role === 'teacher' ? 'email' : 'account'">
            {{ role === 'teacher' ? 'Email' : 'Username or email' }}
          </label>
          <input
            :id="role === 'teacher' ? 'email' : 'account'"
            v-model.trim="accountIdentityInput"
            class="input-field mt-2"
            :type="role === 'teacher' ? 'email' : 'text'"
            :autocomplete="role === 'teacher' ? 'email' : 'username'"
            :placeholder="role === 'teacher' ? 'teacher@school.edu' : 'Enter username or email'"
            minlength="3" maxlength="60" required
          />
        </div>

        <div>
          <label class="field-label" for="password">Password</label>
          <div class="mt-2 grid grid-cols-[1fr_auto] gap-2">
            <input id="password" v-model="password" class="input-field"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password" minlength="8" maxlength="30" required />
            <button type="button" class="btn-secondary rounded-lg" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <div class="flex justify-end text-sm">
          <button type="button" class="font-semibold text-brand-blue hover:text-blue-700 transition-colors" @click="handleForgotPassword">
            Forgot Password
          </button>
        </div>

        <div v-if="showPasswordReset" class="rounded-xl border border-brand-teal/30 bg-brand-teal/5 p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="font-display text-base font-bold text-ink">Reset Teacher Password</h2>
              <p class="mt-1 text-xs font-semibold text-ink-soft">Use the OTP sent to your teacher email.</p>
            </div>
            <button type="button" class="text-xs font-bold text-ink-soft hover:text-brand-rose" @click="closePasswordReset">Close</button>
          </div>

          <div class="mt-4 grid gap-3">
            <div>
              <label class="field-label" for="reset-email">Teacher Email</label>
              <input id="reset-email" v-model.trim="resetEmail" class="input-field mt-1" type="email" autocomplete="email" required />
            </div>

            <button
              type="button"
              class="btn-secondary justify-center rounded-lg"
              :disabled="auth.loading || resetStep !== 1"
              @click="requestPasswordResetOtp"
            >
              {{ auth.loading && resetStep === 1 ? 'Sending OTP...' : 'Send OTP' }}
            </button>

            <div v-if="resetStep >= 2" class="grid gap-3">
              <div>
                <label class="field-label" for="reset-otp">OTP Code</label>
                <input id="reset-otp" v-model.trim="resetOtp" class="input-field mt-1" inputmode="numeric" minlength="6" maxlength="6" placeholder="6-digit code" />
              </div>
              <button
                v-if="resetStep === 2"
                type="button"
                class="btn-secondary justify-center rounded-lg"
                :disabled="auth.loading"
                @click="verifyPasswordResetOtp"
              >
                {{ auth.loading ? 'Verifying...' : 'Verify OTP' }}
              </button>
            </div>

            <div v-if="resetStep >= 3" class="grid gap-3">
              <div>
                <label class="field-label" for="new-password">New Password</label>
                <input id="new-password" v-model="newPassword" class="input-field mt-1" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" minlength="8" maxlength="30" />
              </div>
              <div>
                <label class="field-label" for="confirm-password">Confirm New Password</label>
                <input id="confirm-password" v-model="confirmPassword" class="input-field mt-1" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" minlength="8" maxlength="30" />
              </div>
              <button type="button" class="btn-primary justify-center rounded-lg" :disabled="auth.loading" @click="confirmPasswordReset">
                {{ auth.loading ? 'Saving...' : 'Create New Password' }}
              </button>
            </div>

            <p v-if="resetMessage" class="status-success" role="status">{{ resetMessage }}</p>
            <p v-if="resetError" class="status-error" role="alert">{{ resetError }}</p>
          </div>
        </div>

        <div v-if="isPendingApproval" class="status-warning" role="status">
          <p class="font-bold">⏳ Account Pending Approval</p>
          <p class="mt-1 text-xs font-normal opacity-80">Your account is waiting for admin verification.</p>
        </div>

        <div v-else-if="isBlocked" class="status-error" role="alert">
          <p class="font-bold">🚫 Account Blocked</p>
          <p class="mt-1 text-xs font-normal opacity-80">Please contact support if you believe this is a mistake.</p>
        </div>

        <p v-else-if="auth.error" class="status-error" role="alert">{{ auth.error }}</p>

        <button type="submit" class="btn-primary w-full justify-center rounded-xl py-3 mt-1 text-sm font-bold" :disabled="auth.loading">
          {{ auth.loading ? 'Signing in...' : 'Login' }}
        </button>
      </form>

      <p class="mt-6 text-sm text-ink-soft">
        Need an account?
        <RouterLink :to="`/register?role=${role}`" class="font-bold text-brand-blue hover:text-blue-700 transition-colors">Create one</RouterLink>
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/lib/api'

type Role = 'student' | 'teacher'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const role = ref<Role>(route.query.role === 'teacher' ? 'teacher' : 'student')
const accountIdentityInput = ref('')
const password = ref('')
const showPassword = ref(false)
const isPendingApproval = ref(false)
const isBlocked = ref(false)
const showPasswordReset = ref(false)
const resetStep = ref(1)
const resetEmail = ref('')
const resetOtp = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const resetMessage = ref('')
const resetError = ref('')

const roleLabel = computed(() => role.value === 'teacher' ? 'Teacher' : 'Student')

function handleForgotPassword() {
  showPasswordReset.value = true
  resetEmail.value = accountIdentityInput.value.includes('@') ? accountIdentityInput.value : resetEmail.value
  resetMessage.value = ''
  resetError.value = ''
  auth.error = ''
}

function closePasswordReset() {
  showPasswordReset.value = false
  resetStep.value = 1
  resetOtp.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  resetMessage.value = ''
  resetError.value = ''
}

async function requestPasswordResetOtp() {
  resetMessage.value = ''
  resetError.value = ''
  const email = resetEmail.value.trim()
  if (!email) {
    resetError.value = 'Enter your teacher email.'
    return
  }

  try {
    const data = await auth.requestTeacherPasswordResetOtp(email)
    resetStep.value = 2
    resetMessage.value = data.delivery === 'failed'
      ? 'OTP email could not be delivered. Please check the mail configuration and try again.'
      : data.message || 'OTP sent. Check your email.'
  } catch (err) {
    resetError.value = err instanceof Error ? err.message : 'Failed to send OTP.'
  }
}

async function verifyPasswordResetOtp() {
  resetMessage.value = ''
  resetError.value = ''
  if (!/^\d{6}$/.test(resetOtp.value)) {
    resetError.value = 'OTP must be exactly 6 digits.'
    return
  }

  try {
    const data = await auth.verifyTeacherPasswordResetOtp(resetEmail.value.trim(), resetOtp.value)
    resetStep.value = 3
    resetMessage.value = data.message || 'OTP verified. Enter your new password.'
  } catch (err) {
    resetError.value = err instanceof Error ? err.message : 'OTP verification failed.'
  }
}

async function confirmPasswordReset() {
  resetMessage.value = ''
  resetError.value = ''
  if (newPassword.value.length < 8) {
    resetError.value = 'Password must be at least 8 characters.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    resetError.value = 'Passwords do not match.'
    return
  }

  try {
    const data = await auth.confirmTeacherPasswordReset(resetEmail.value.trim(), resetOtp.value, newPassword.value)
    password.value = newPassword.value
    accountIdentityInput.value = resetEmail.value.trim()
    resetMessage.value = data.message || 'Password reset successfully.'
    resetStep.value = 1
    resetOtp.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err) {
    resetError.value = err instanceof Error ? err.message : 'Password reset failed.'
  }
}

async function submitLogin() {
  isPendingApproval.value = false
  isBlocked.value = false
  auth.error = ''
  resetMessage.value = ''
  resetError.value = ''
  const accountIdentity = accountIdentityInput.value.trim()
  const isEmailLogin = accountIdentity.includes('@')

  try {
    const data = await auth.login({
      email: role.value === 'teacher' || isEmailLogin ? accountIdentity : null,
      username: role.value === 'student' && !isEmailLogin ? accountIdentity : null,
      password: password.value,
    }, role.value)

    if (!data.profile_completed) {
      router.push('/profile/setup')
      return
    }

    router.push(role.value === 'teacher' ? '/teacher/class' : '/student/dashboard')
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      if (err.message.toLowerCase().includes('admin approval') || err.message.toLowerCase().includes('wait for admin')) {
        isPendingApproval.value = true
        auth.error = ''
        return
      }
      if (err.message.toLowerCase().includes('blocked')) {
        isBlocked.value = true
        auth.error = ''
        return
      }
    }
  }
}
</script>
