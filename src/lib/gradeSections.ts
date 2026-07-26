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
