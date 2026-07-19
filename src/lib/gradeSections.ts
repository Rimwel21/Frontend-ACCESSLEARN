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
  name: string
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
