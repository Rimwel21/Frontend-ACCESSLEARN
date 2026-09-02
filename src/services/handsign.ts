import axios from 'axios'
import { API_BASE_URL } from '@/lib/api'
import type {
  BackspaceCameraSessionResponse,
  CameraDetectionResponse,
  PracticeResultOut,
  PredictionResponse,
  SequenceScoreResponse,
  TutorialStatus,
  WordGestureSummary,
} from '@/types/handsign'

const handsignApi = axios.create({
  baseURL: `${API_BASE_URL}/api/handsign`,
  timeout: 30000,
})

handsignApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function checkHandsignHealth() {
  const response = await handsignApi.get<{ status: string; classes: string[]; word_gestures?: WordGestureSummary }>('/health')
  return response.data
}

export async function predictHandsignImage(image: string): Promise<PredictionResponse> {
  const response = await handsignApi.post<PredictionResponse>('/predict', { image })
  return response.data
}

export async function detectCameraFrame(sessionId: string, image: string): Promise<CameraDetectionResponse> {
  const response = await handsignApi.post<CameraDetectionResponse>('/detect', {
    session_id: sessionId,
    image,
  })
  return response.data
}

export async function resetCameraSession(sessionId: string): Promise<void> {
  await handsignApi.post('/reset', { session_id: sessionId })
}

export async function backspaceCameraSession(sessionId: string): Promise<BackspaceCameraSessionResponse> {
  const response = await handsignApi.post<BackspaceCameraSessionResponse>('/backspace', {
    session_id: sessionId,
  })
  return response.data
}

export async function getWordGestureSummary(): Promise<WordGestureSummary> {
  const response = await handsignApi.get<WordGestureSummary>('/word-gestures/summary')
  return response.data
}

export async function getTutorialStatus(word: string): Promise<TutorialStatus> {
  const response = await handsignApi.get<TutorialStatus>(`/tutorials/${encodeURIComponent(word)}`)
  return response.data
}

export async function uploadTutorialVideo(word: string, video: File): Promise<TutorialStatus> {
  const formData = new FormData()
  formData.append('video', video)
  const response = await handsignApi.post<TutorialStatus>(`/tutorials/${encodeURIComponent(word)}/video`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  })
  return response.data
}

export async function scoreWordPracticeFrames(word: string, images: string[]): Promise<SequenceScoreResponse> {
  const response = await handsignApi.post<SequenceScoreResponse>('/tutorials/practice/score-frames', {
    word,
    images,
  }, { timeout: 60000 })
  return response.data
}

export async function saveTutorialPracticeResult(activityId: number, word: string, attemptScores: number[]): Promise<PracticeResultOut> {
  const response = await handsignApi.post<PracticeResultOut>('/tutorials/practice/results', {
    activity_id: activityId,
    word,
    attempt_scores: attemptScores,
  })
  return response.data
}

export function tutorialVideoUrl(videoUrl: string | null | undefined) {
  if (!videoUrl) return ''
  return `${API_BASE_URL}${videoUrl}`
}

export function handsignErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') return 'Detection timed out. Please try again.'
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (!error.response) return 'Detection service is unavailable.'
  }
  return error instanceof Error ? error.message : 'Detection failed.'
}
