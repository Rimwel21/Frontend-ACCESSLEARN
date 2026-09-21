import { apiFetch } from '@/lib/api'

export function getTeacherActivityWeeks() {
  return apiFetch<{ weeks: string[] }>('/teacher/assessments/activity-weeks')
}

export function addTeacherActivityWeek(week: string) {
  return apiFetch<{ week: string; created: boolean }>('/teacher/assessments/activity-weeks', {
    method: 'POST',
    body: JSON.stringify({ week }),
  })
}
