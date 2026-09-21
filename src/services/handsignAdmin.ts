import { apiFetch } from '@/lib/api'

export type DatasetSummary = {
  samples_required: number
  classes: Array<{ label: string; sample_count: number }>
  weekly_labels: Record<string, string[]>
  weeks?: string[]
  training: { status: string; message: string; started_at?: string | null; finished_at?: string | null }
}

export function getDatasetSummary() {
  return apiFetch<DatasetSummary>('/api/handsign/admin/dataset')
}

export function addDatasetLabel(label: string, week: string) {
  return apiFetch<{ label: string; week: string; created: boolean }>('/api/handsign/admin/dataset/labels', {
    method: 'POST', body: JSON.stringify({ label, week }),
  })
}

export function addDatasetWeek(week: string) {
  return apiFetch<{ week: string; created: boolean }>('/api/handsign/admin/dataset/weeks', {
    method: 'POST', body: JSON.stringify({ week }),
  })
}

export function getDatasetLabelsForWeek(week: string) {
  const params = new URLSearchParams({ week })
  return apiFetch<{ week: string; labels: string[] }>(`/api/handsign/dataset/labels?${params}`)
}

export function uploadWordGestureSample(label: string, week: string, images: string[]) {
  return apiFetch<{ label: string; week?: string | null; sample_count: number; ready_to_train: boolean }>('/api/handsign/admin/dataset/samples', {
    method: 'POST', body: JSON.stringify({ label, week, images }),
  })
}

export function trainWordGestureModel() {
  return apiFetch<DatasetSummary['training']>('/api/handsign/admin/dataset/train', { method: 'POST' })
}
