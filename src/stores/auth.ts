import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { apiFetch } from '@/lib/api'

type Role = 'student' | 'teacher' | 'admin'

interface RegisterPayload {
  username?: string | null
  email?: string | null
  password: string
  role: Exclude<Role, 'admin'>
  full_name?: string
  student_lrn?: string
  grade_level_id?: number
  section_id?: number
  accessibility_profile?: string
  profile_image?: string | null
  guardians_name?: string | null
  guardians_contact_no?: string | null
}

export interface LoginPayload {
  username?: string | null
  email?: string | null
  password: string
  role?: Role
}

interface AccountResponse {
  id: number
  username: string | null
  email: string | null
  role: Role
  created_at: string
  updated_at: string
}

interface TokenResponse {
  access_token: string
  token_type: string
  profile_completed: boolean
}

interface CurrentUserResponse {
  id: number
  username: string | null
  email: string | null
  role: Role
  profile_completed: boolean
  account_status: string | null
}

interface TeacherOtpResponse {
  message: string
  delivery?: 'sent' | 'failed'
  debug_otp?: string
  detail?: string
}

function isRole(value: unknown): value is Role {
  return value === 'student' || value === 'teacher' || value === 'admin'
}

function roleLabel(value: Role) {
  if (value === 'student') return 'Student'
  if (value === 'teacher') return 'Teacher'
  return 'Admin'
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('access_token'))
  const tokenType = ref(localStorage.getItem('token_type') ?? 'bearer')
  const role = ref<Role | null>(null)
  const currentUser = ref<CurrentUserResponse | null>(null)
  const accountIdentity = ref(localStorage.getItem('account_identity') ?? '')
  const profileCompleted = ref(false)
  const hydrated = ref(!token.value)
  const loading = ref(false)
  const error = ref('')
  const otpVerified = ref(false)
  let hydrationRequest: Promise<CurrentUserResponse | null> | null = null

  const isAuthenticated = computed(() => Boolean(token.value))
  const authorizationHeader = computed(() =>
    token.value ? `${tokenType.value} ${token.value}` : ''
  )

  async function requestTeacherOtp(email: string) {
    loading.value = true
    error.value = ''

    try {
      const data = await apiFetch<TeacherOtpResponse>('/otp/teacher/request', {
        method: 'POST',
        body: JSON.stringify({ email, role: 'teacher' }),
      })
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send OTP'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function verifyTeacherOtp(email: string, otp: string) {
    loading.value = true
    error.value = ''

    try {
      const data = await apiFetch<{ message: string }>('/otp/teacher/verify', {
        method: 'POST',
        body: JSON.stringify({ email, otp, role: 'teacher' }),
      })
      otpVerified.value = true
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'OTP verification failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function requestTeacherPasswordResetOtp(email: string) {
    loading.value = true
    error.value = ''

    try {
      return await apiFetch<TeacherOtpResponse>('/otp/teacher/password-reset/request', {
        method: 'POST',
        body: JSON.stringify({ email, role: 'teacher' }),
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send password reset OTP'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function verifyTeacherPasswordResetOtp(email: string, otp: string) {
    loading.value = true
    error.value = ''

    try {
      return await apiFetch<{ message: string }>('/otp/teacher/password-reset/verify', {
        method: 'POST',
        body: JSON.stringify({ email, otp, role: 'teacher' }),
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'OTP verification failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function confirmTeacherPasswordReset(email: string, otp: string, newPassword: string) {
    loading.value = true
    error.value = ''

    try {
      return await apiFetch<{ message: string }>('/otp/teacher/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({ email, otp, new_password: newPassword, role: 'teacher' }),
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Password reset failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function requestAdminPasswordResetOtp(email: string) {
    loading.value = true
    error.value = ''

    try {
      return await apiFetch<{ message: string }>('/otp/admin/password-reset/request', {
        method: 'POST',
        body: JSON.stringify({ email, role: 'admin' }),
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send admin password reset OTP'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function verifyAdminPasswordResetOtp(email: string, otp: string) {
    loading.value = true
    error.value = ''

    try {
      return await apiFetch<{ message: string }>('/otp/admin/password-reset/verify', {
        method: 'POST',
        body: JSON.stringify({ email, otp, role: 'admin' }),
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Admin OTP verification failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function confirmAdminPasswordReset(email: string, otp: string, newPassword: string) {
    loading.value = true
    error.value = ''

    try {
      return await apiFetch<{ message: string }>('/otp/admin/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({ email, otp, new_password: newPassword, role: 'admin' }),
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Admin password reset failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterPayload) {
    loading.value = true
    error.value = ''

    try {
      const account = await apiFetch<AccountResponse>('/auth/account/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      localStorage.setItem('selectedRole', payload.role)
      return account
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function login(payload: LoginPayload, selectedRole: Role) {
    loading.value = true
    error.value = ''

    try {
      const data = await apiFetch<TokenResponse>('/auth/account/login', {
        method: 'POST',
        body: JSON.stringify({ ...payload, role: selectedRole }),
      })

      token.value = data.access_token
      tokenType.value = data.token_type
      hydrated.value = false

      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('token_type', data.token_type)

      const currentUser = await hydrateCurrentUser({ force: true })
      const actualRole = currentUser?.role

      if (!isRole(actualRole)) {
        logout()
        throw new Error('Unable to verify account role. Please try again.')
      }

      if (actualRole !== selectedRole) {
        logout()
        throw new Error(`This account belongs to ${roleLabel(actualRole)}. Please use the ${roleLabel(actualRole)} login.`)
      }

      localStorage.setItem('selectedRole', actualRole)

      return {
        ...data,
        profile_completed: profileCompleted.value,
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    tokenType.value = 'bearer'
    role.value = null
    accountIdentity.value = ''
    profileCompleted.value = false
    hydrated.value = true
    hydrationRequest = null
    otpVerified.value = false
    localStorage.removeItem('access_token')
    localStorage.removeItem('token_type')
    localStorage.removeItem('role')
    localStorage.removeItem('selectedRole')
    localStorage.removeItem('account_identity')
    localStorage.removeItem('profile_completed')
    localStorage.removeItem('profile_data')
    localStorage.removeItem('profile_image')
    localStorage.removeItem('teacher_pending_email')
    localStorage.removeItem('teacher_otp_expires_at')
    localStorage.removeItem('teacher_verified_email')
    localStorage.removeItem('teacher_register_step')
  }

  function setProfileCompleted(completed: boolean) {
    profileCompleted.value = completed
  }

  async function hydrateCurrentUser(options: { force?: boolean } = {}) {
    if (!token.value) {
      clearTrustedUserState()
      hydrated.value = true
      return null
    }

    if (hydrated.value && !options.force) {
      return currentUser.value
    }

    if (hydrationRequest && !options.force) {
      return hydrationRequest
    }

    hydrationRequest = apiFetch<CurrentUserResponse>('/auth/me', { token: token.value })
      .then((currentUser) => {
        setTrustedUserState(currentUser)
        return currentUser
      })
      .catch((err) => {
        logout()
        throw err
      })
      .finally(() => {
        hydrationRequest = null
      })

    return hydrationRequest
  }

  function setTrustedUserState(user: CurrentUserResponse) {
    role.value = user.role
    currentUser.value = user
    accountIdentity.value = user.username ?? user.email ?? ''
    profileCompleted.value = user.role === 'admin' ? true : user.profile_completed
    hydrated.value = true
    localStorage.setItem('account_identity', accountIdentity.value)
    localStorage.removeItem('role')
    localStorage.removeItem('profile_completed')
  }

  function clearTrustedUserState() {
    role.value = null
    currentUser.value = null
    accountIdentity.value = ''
    profileCompleted.value = false
  }

  return {
    token,
    tokenType,
    role,
    currentUser,
    accountIdentity,
    profileCompleted,
    hydrated,
    loading,
    error,
    otpVerified,
    isAuthenticated,
    authorizationHeader,
    requestTeacherOtp,
    verifyTeacherOtp,
    requestTeacherPasswordResetOtp,
    verifyTeacherPasswordResetOtp,
    confirmTeacherPasswordReset,
    requestAdminPasswordResetOtp,
    verifyAdminPasswordResetOtp,
    confirmAdminPasswordReset,
    register,
    login,
    hydrateCurrentUser,
    logout,
    setProfileCompleted,
  }
})

