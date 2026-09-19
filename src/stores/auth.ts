import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ApiError, apiFetch } from '@/lib/api'

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

interface OfflineLoginRecord {
  version: 1
  identity: string
  role: Role
  user: CurrentUserResponse
  salt: string
  passwordHash: string
  iterations: number
  createdAt: string
  updatedAt: string
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

const OFFLINE_LOGIN_KEY = 'offline_login_records_v1'
const OFFLINE_HASH_ITERATIONS = 120_000

function normalizeIdentity(identity?: string | null) {
  return (identity ?? '').trim().toLowerCase()
}

function offlineRecordKey(role: Role, identity: string) {
  return `${role}:${normalizeIdentity(identity)}`
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = ''
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

function base64ToBytes(value: string) {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false
  let diff = 0
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return diff === 0
}

async function hashOfflinePassword(password: string, salt: string, iterations = OFFLINE_HASH_ITERATIONS) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Offline login is not supported by this browser.')
  }

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: base64ToBytes(salt),
      iterations,
      hash: 'SHA-256',
    },
    key,
    256,
  )
  return bytesToBase64(new Uint8Array(bits))
}

function randomSalt() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return bytesToBase64(bytes)
}

function readOfflineLoginRecords() {
  const raw = localStorage.getItem(OFFLINE_LOGIN_KEY)
  if (!raw) return {} as Record<string, OfflineLoginRecord>
  try {
    return JSON.parse(raw) as Record<string, OfflineLoginRecord>
  } catch {
    localStorage.removeItem(OFFLINE_LOGIN_KEY)
    return {} as Record<string, OfflineLoginRecord>
  }
}

function writeOfflineLoginRecord(record: OfflineLoginRecord) {
  const records = readOfflineLoginRecords()
  records[offlineRecordKey(record.role, record.identity)] = record
  localStorage.setItem(OFFLINE_LOGIN_KEY, JSON.stringify(records))
}

function findOfflineLoginRecord(role: Role, identity: string) {
  return readOfflineLoginRecords()[offlineRecordKey(role, identity)] ?? null
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

  async function requestStudentPasswordResetOtp(username: string) {
    loading.value = true
    error.value = ''

    try {
      return await apiFetch<TeacherOtpResponse>('/otp/student/password-reset/request', {
        method: 'POST',
        body: JSON.stringify({ username, role: 'student' }),
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send student password reset OTP'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function verifyStudentPasswordResetOtp(username: string, otp: string) {
    loading.value = true
    error.value = ''

    try {
      return await apiFetch<{ message: string }>('/otp/student/password-reset/verify', {
        method: 'POST',
        body: JSON.stringify({ username, otp, role: 'student' }),
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Student OTP verification failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function confirmStudentPasswordReset(username: string, otp: string, newPassword: string) {
    loading.value = true
    error.value = ''

    try {
      return await apiFetch<{ message: string }>('/otp/student/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({ username, otp, new_password: newPassword, role: 'student' }),
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Student password reset failed'
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
    const loginIdentity = selectedRole === 'teacher' || selectedRole === 'admin'
      ? normalizeIdentity(payload.email ?? payload.username)
      : normalizeIdentity(payload.username ?? payload.email)

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
      await cacheOfflineLogin(payload.password, loginIdentity, currentUser)

      return {
        ...data,
        profile_completed: profileCompleted.value,
      }
    } catch (err) {
      try {
        const offlineSession = await tryOfflineLogin(payload.password, loginIdentity, selectedRole, err)
        if (offlineSession) return offlineSession
      } catch (offlineErr) {
        error.value = offlineErr instanceof Error ? offlineErr.message : 'Offline login failed'
        throw offlineErr
      }

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
    localStorage.removeItem('offline_trusted_user')
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

    if (token.value.startsWith('offline-session:')) {
      const cachedUser = getCachedTrustedUser()
      if (cachedUser) {
        setTrustedUserState(cachedUser, { persist: false })
        return cachedUser
      }
      logout()
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
        const cachedUser = getCachedTrustedUser()
        if (err instanceof ApiError && err.status === 0 && cachedUser?.role === 'student') {
          setTrustedUserState(cachedUser, { persist: false })
          return cachedUser
        }
        logout()
        throw err
      })
      .finally(() => {
        hydrationRequest = null
      })

    return hydrationRequest
  }

  function setTrustedUserState(user: CurrentUserResponse, options: { persist?: boolean } = {}) {
    role.value = user.role
    currentUser.value = user
    accountIdentity.value = user.username ?? user.email ?? ''
    profileCompleted.value = user.role === 'admin' ? true : user.profile_completed
    hydrated.value = true
    localStorage.setItem('account_identity', accountIdentity.value)
    if (options.persist !== false) {
      localStorage.setItem('offline_trusted_user', JSON.stringify(user))
    }
    localStorage.removeItem('role')
    localStorage.removeItem('profile_completed')
  }

  function clearTrustedUserState() {
    role.value = null
    currentUser.value = null
    accountIdentity.value = ''
    profileCompleted.value = false
  }

  function getCachedTrustedUser() {
    const raw = localStorage.getItem('offline_trusted_user')
    if (!raw) return null
    try {
      return JSON.parse(raw) as CurrentUserResponse
    } catch {
      localStorage.removeItem('offline_trusted_user')
      return null
    }
  }

  async function cacheOfflineLogin(password: string, identity: string, user: CurrentUserResponse | null) {
    if (!user || !identity || user.role === 'admin') return

    try {
      const existing = findOfflineLoginRecord(user.role, identity)
      const salt = existing?.salt ?? randomSalt()
      const now = new Date().toISOString()
      const record: OfflineLoginRecord = {
        version: 1,
        identity,
        role: user.role,
        user,
        salt,
        passwordHash: await hashOfflinePassword(password, salt),
        iterations: OFFLINE_HASH_ITERATIONS,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      }
      writeOfflineLoginRecord(record)
    } catch {
      // Offline login is a convenience feature. Online login must not fail if the
      // browser blocks local credential caching.
    }
  }

  async function tryOfflineLogin(
    password: string,
    identity: string,
    selectedRole: Role,
    originalError: unknown,
  ) {
    const canUseOfflineFallback = !navigator.onLine || (originalError instanceof ApiError && originalError.status === 0)
    if (!canUseOfflineFallback || !identity || selectedRole === 'admin') return null

    const record = findOfflineLoginRecord(selectedRole, identity)
    if (!record) return null

    const passwordHash = await hashOfflinePassword(password, record.salt, record.iterations)
    if (!safeEqual(passwordHash, record.passwordHash)) {
      throw new Error('Invalid offline credentials')
    }

    const offlineToken = `offline-session:${record.role}:${record.user.id}:${Date.now()}`
    token.value = offlineToken
    tokenType.value = 'offline'
    localStorage.setItem('access_token', offlineToken)
    localStorage.setItem('token_type', 'offline')
    localStorage.setItem('selectedRole', record.role)
    setTrustedUserState(record.user, { persist: false })

    return {
      access_token: offlineToken,
      token_type: 'offline',
      profile_completed: record.user.role === 'admin' ? true : record.user.profile_completed,
    }
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
    requestStudentPasswordResetOtp,
    verifyStudentPasswordResetOtp,
    confirmStudentPasswordReset,
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

