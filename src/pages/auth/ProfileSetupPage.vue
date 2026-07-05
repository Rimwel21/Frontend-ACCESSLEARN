<template>
  <main class="auth-page">
    <section class="auth-card max-w-3xl">
      <p class="eyebrow">{{ auth.role }}</p>
      <h1 class="auth-title">{{ roleLabel }} Profile Setup</h1>

      <div v-if="profile.loading" class="empty-state">Loading your existing profile...</div>

      <form v-else class="form-stack" @submit.prevent="submitProfile">
        <div class="grid gap-4 md:grid-cols-2">
          <template v-if="auth.role === 'student'">
            <div>
              <label class="field-label" for="name">Name</label>
              <input id="name" v-model.trim="studentForm.name" class="input-field" required />
            </div>
            <div>
              <label class="field-label" for="student-type">Student Type</label>
              <select id="student-type" v-model="studentForm.student_type" class="input-field" required>
                <option value="">Select type</option>
                <option value="regular">Regular</option>
                <option value="hearing impaired">Hearing Impaired</option>
              </select>
            </div>
            <div>
              <label class="field-label" for="guardian">Guardian Name</label>
              <input id="guardian" v-model.trim="studentForm.guardians_name" class="input-field" />
            </div>
            <div>
              <label class="field-label" for="guardian-contact">Guardian Contact</label>
              <input id="guardian-contact" v-model.trim="studentForm.guardians_contact_no" class="input-field" />
            </div>
            <div class="md:col-span-2">
              <label class="field-label" for="student-address">Address</label>
              <textarea id="student-address" v-model.trim="studentForm.address" class="input-field min-h-24 resize-y" />
            </div>
          </template>

          <template v-else>
            <div>
              <label class="field-label" for="teacher-name">Name</label>
              <input id="teacher-name" v-model.trim="teacherForm.name" class="input-field" required />
            </div>
            <div>
              <label class="field-label" for="teacher-contact">Contact Number</label>
              <input id="teacher-contact" v-model.trim="teacherForm.contact_no" class="input-field" placeholder="09xxxxxxxxx" required />
            </div>
            <div>
              <label class="field-label" for="teacher-age">Age</label>
              <input id="teacher-age" v-model.number="teacherForm.age" type="number" min="18" max="100" class="input-field" required />
            </div>
            <div>
              <label class="field-label" for="teacher-sex">Sex</label>
              <select id="teacher-sex" v-model="teacherForm.sex" class="input-field" required>
                <option value="">Select sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="field-label">Grade Levels You Handle</label>
              <div class="grid grid-cols-2 gap-2 mt-2 sm:grid-cols-4">
                <label v-for="level in gradeLevels" :key="level.value" class="flex items-center gap-2 p-2 rounded-md border border-gray-100 hover:bg-surface cursor-pointer">
                  <input type="checkbox" :value="level.value" v-model="teacherForm.grade_level_handles" class="h-4 w-4 rounded border-gray-300 text-brand-blue" />
                  <span class="text-xs font-semibold">{{ level.label }}</span>
                </label>
              </div>
            </div>
            <div class="md:col-span-2">
              <label class="field-label" for="teacher-address">Address</label>
              <textarea id="teacher-address" v-model.trim="teacherForm.address" class="input-field min-h-24 resize-y" placeholder="Home address..." required />
            </div>
          </template>
        </div>

        <div>
          <label class="field-label" for="profile-image">Profile Image</label>
          <input id="profile-image" class="input-field" type="file" accept="image/png,image/jpeg,image/webp" @change="previewImage" />
        </div>

        <div class="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3">
          <img v-if="previewUrl" :src="previewUrl" alt="Profile preview" class="h-16 w-16 rounded-full object-cover" />
          <div v-else class="grid h-16 w-16 place-items-center rounded-full bg-brand-blue text-xl font-bold text-white">
            {{ profile.initial }}
          </div>
          <p class="text-sm text-ink-soft">Image upload runs after the profile is saved.</p>
        </div>

        <p v-if="profile.error" class="status-error" role="alert">{{ profile.error }}</p>
        <p v-if="message" class="status-success" role="status">{{ message }}</p>

        <button type="submit" class="btn-primary w-full justify-center rounded-lg" :disabled="profile.saving">
          {{ profile.saving ? 'Saving...' : profile.profile ? 'Update profile' : 'Save profile' }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'

const router = useRouter()
const auth = useAuthStore()
const profile = useProfileStore()

const imageFile = ref<File | null>(null)
const previewUrl = ref('')
const message = ref('')

const studentForm = ref({
  name: '',
  student_type: '',
  guardians_name: '',
  guardians_contact_no: '',
  address: '',
})

const teacherForm = ref({
  name: '',
  contact_no: '',
  age: 25,
  sex: '',
  grade_level_handles: [] as string[],
  address: '',
})

const gradeLevels = [
  { label: 'Kindergarten', value: 'kindergarten' },
  { label: 'Grade 1', value: 'grade_1' },
  { label: 'Grade 2', value: 'grade_2' },
  { label: 'Grade 3', value: 'grade_3' },
  { label: 'Grade 4', value: 'grade_4' },
  { label: 'Grade 5', value: 'grade_5' },
  { label: 'Grade 6', value: 'grade_6' },
]

const roleLabel = computed(() => auth.role === 'student' ? 'Student' : 'Teacher')

onMounted(async () => {
  const existing = await profile.fetchProfile()
  
  // Try to load pending info from registration if no existing profile
  const pendingStr = localStorage.getItem('pending_profile')
  const pending = pendingStr ? JSON.parse(pendingStr) : null

  if (existing) {
    if (auth.role === 'student' && 'student_type' in existing) {
      studentForm.value = {
        name: existing.name ?? '',
        student_type: existing.student_type ?? '',
        guardians_name: existing.guardians_name ?? '',
        guardians_contact_no: existing.guardians_contact_no ?? '',
        address: existing.address ?? '',
      }
    }

    if (auth.role === 'teacher' && 'contact_no' in existing) {
      const t = existing as any
      teacherForm.value = {
        name: t.name ?? '',
        contact_no: t.contact_no ?? '',
        age: t.age ?? 25,
        sex: t.sex ?? '',
        grade_level_handles: t.grade_level_handles ?? [],
        address: t.address ?? '',
      }
    }
  } else if (pending) {
    // Bootstrap from registration data
    if (auth.role === 'student') {
      studentForm.value.name = pending.fullName || ''
    } else {
      teacherForm.value.name = pending.fullName || ''
      teacherForm.value.contact_no = pending.contactNo || ''
    }
    // Clear pending after use
    localStorage.removeItem('pending_profile')
  }

  previewUrl.value = profile.image?.file_url ?? ''
})

function previewImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  imageFile.value = file

  if (previewUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = file ? URL.createObjectURL(file) : profile.image?.file_url ?? ''
}

async function submitProfile() {
  const payload = auth.role === 'student'
    ? normalizeStudentPayload()
    : teacherForm.value

  await profile.saveProfile(payload, imageFile.value)
  message.value = 'Profile saved. Opening dashboard...'

  setTimeout(() => {
    router.push(auth.role === 'student' ? '/student/dashboard' : '/teacher/class')
  }, 500)
}

function normalizeStudentPayload() {
  return {
    ...studentForm.value,
    guardians_name: studentForm.value.guardians_name || null,
    guardians_contact_no: studentForm.value.guardians_contact_no || null,
    address: studentForm.value.address || null,
  }
}
</script>
