import { apiFetch } from '@/lib/api'

export interface GradeLevelOption {
  id: number
  name: string
}

export interface SectionOption {
  id: number
  name: string
  grade_level_id: number
}

export interface CreatedSection {
  id: number
  name: string
  grade_level_id: number
  grade_level: {
    name: string
  }
}

export function fetchGradeLevelOptions(token?: string | null) {
  return apiFetch<GradeLevelOption[]>('/academic/grade-levels', { token })
}

export function fetchSectionOptions(gradeLevelId: number, token?: string | null) {
  return apiFetch<SectionOption[]>(`/academic/sections?grade_level_id=${gradeLevelId}`, { token })
}

export function fetchPublicGradeLevelOptions() {
  return apiFetch<GradeLevelOption[]>('/academic/public/grade-levels')
}

export function fetchPublicSectionOptions(gradeLevelId: number) {
  return apiFetch<SectionOption[]>(`/academic/public/sections?grade_level_id=${gradeLevelId}`)
}

export function createAdminSection(
  payload: { name: string; grade_level_id: number },
  token?: string | null,
) {
  return apiFetch<CreatedSection>('/section/create/admin', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
}

export function updateAdminSection(
  sectionId: number,
  payload: { name: string },
  token?: string | null,
) {
  return apiFetch<CreatedSection>(`/section/${sectionId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  })
}

export function deleteAdminSection(sectionId: number, token?: string | null) {
  return apiFetch<{ message: string }>(`/section/${sectionId}`, {
    method: 'DELETE',
    token,
  })
}

export function findGradeLevelIdByName(
  gradeLevels: GradeLevelOption[],
  name: string | null | undefined,
) {
  return gradeLevels.find(gradeLevel => gradeLevel.name === name)?.id ?? null
}

export function findSectionIdByName(
  sections: SectionOption[],
  name: string | null | undefined,
) {
  return sections.find(section => section.name === name)?.id ?? null
}

// ── Teacher Assign Actions ──────────────────────────────────────────────────

export interface SectionWithTeacher {
  id: number
  name: string
  grade_level_id: number
  grade_level_name: string
  teacher_id: number | null
  teacher_name: string | null
  student_count: number
}

export function fetchSectionsWithTeacherInfo(token?: string | null) {
  return apiFetch<SectionWithTeacher[]>('/section/with-teacher', { token })
}

export function assignTeacherToHiSection(
  sectionId: number,
  teacherId: number,
  token?: string | null,
) {
  return apiFetch<{ id: number; message: string }>(
    `/section/${sectionId}/assign-teacher?teacher_id=${teacherId}`,
    {
      method: 'PATCH',
      token,
    },
  )
}

export function unassignTeacherFromHiSection(sectionId: number, token?: string | null) {
  return apiFetch<{ message: string }>(`/section/${sectionId}/unassign-teacher`, {
    method: 'DELETE',
    token,
  })
}

export interface TeacherAccountItem {
  id: number
  full_name: string
  email: string
  role: string
  account_status: string
}

export interface TeacherListResponse {
  total: number
  page: number
  per_page: number
  items: TeacherAccountItem[]
}

export function fetchTeachersForAssignment(token?: string | null) {
  return apiFetch<TeacherListResponse>(
    '/admin/accounts?role=teacher&status=active&per_page=100',
    { token },
  )
}

// ── Section Student Roster & Transfer ────────────────────────────────────────

export interface SectionStudent {
  id: number
  account_id: number
  name: string
  student_type: string
  grade_level_id: number
  grade_level_name: string | null
  section_id: number
  section_name: string | null
  account_status: string | null
}

export function fetchSectionStudents(sectionId: number, token?: string | null) {
  return apiFetch<SectionStudent[]>(`/section/${sectionId}/students`, { token })
}

export function transferStudent(
  studentProfileId: number,
  gradeLevelId: number,
  sectionId: number,
  token?: string | null,
) {
  return apiFetch<{ success: boolean; message: string }>(
    `/section/transfer-student/${studentProfileId}`,
    {
      method: 'PATCH',
      token,
      body: JSON.stringify({ grade_level_id: gradeLevelId, section_id: sectionId }),
    },
  )
}
