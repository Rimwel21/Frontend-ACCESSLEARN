import { apiFetch } from '@/lib/api'

export type DatasetSummary = {
  samples_required: number
  classes: Array<{ label: string; sample_count: number }>
  sample_requirement_options?: number[]
  label_requirements?: Array<{ week: string; label: string; samples_required: number }>
  weekly_labels: Record<string, string[]>
  weeks?: string[]
  training: {
    status: string
    message: string
    started_at?: string | null
    finished_at?: string | null
    processed_samples?: number
    total_samples?: number
    eligible_labels?: number
    trained_trees?: number
    total_trees?: number
  }
  readiness?: {
    can_train: boolean
    complete_labels: string[]
    incomplete_labels: Array<{ label: string; sample_count: number }>
    minimum_complete_labels: number
  }
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
  return apiFetch<{ week: string; labels: string[]; requirements: Record<string, number> }>(`/api/handsign/dataset/labels?${params}`)
}

export function updateDatasetLabelSampleRequirement(label: string, week: string, samplesRequired: number) {
  return apiFetch<{
    label: string
    week: string
    samples_required: number
    sample_count: number
    ready_to_train: boolean
    training?: DatasetSummary['training']
    training_message?: string
  }>('/api/handsign/dataset/labels/sample-requirement', {
    method: 'PATCH', body: JSON.stringify({ label, week, samples_required: samplesRequired }),
  })
}

export function uploadWordGestureSample(label: string, week: string, images: string[]) {
  return apiFetch<{ label: string; week?: string | null; sample_count: number; samples_required: number; ready_to_train: boolean }>('/api/handsign/admin/dataset/samples', {
    method: 'POST', body: JSON.stringify({ label, week, images }),
  })
}

export function trainWordGestureModel() {
  return apiFetch<DatasetSummary['training']>('/api/handsign/admin/dataset/train', { method: 'POST' })
}

export function stopWordGestureTraining() {
  return apiFetch<DatasetSummary['training']>('/api/handsign/admin/dataset/train/stop', { method: 'POST' })
}
