import { apiFetch } from '@/lib/api'

export type DatasetSummary = {
  samples_required: number
  classes: Array<{ label: string; sample_count: number }>
  weekly_labels: Record<string, string[]>
  training: { status: string; message: string; started_at?: string | null; finished_at?: string | null }
}

export function getDatasetSummary() {
  return apiFetch<DatasetSummary>('/api/handsign/admin/dataset')
}

export function uploadWordGestureSample(label: string, week: string, images: string[]) {
  return apiFetch<{ label: string; week?: string | null; sample_count: number; ready_to_train: boolean }>('/api/handsign/admin/dataset/samples', {
    method: 'POST', body: JSON.stringify({ label, week, images }),
  })
}

export function trainWordGestureModel() {
  return apiFetch<DatasetSummary['training']>('/api/handsign/admin/dataset/train', { method: 'POST' })
}
