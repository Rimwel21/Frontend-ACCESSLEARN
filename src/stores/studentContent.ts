import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

export interface LearningTopic {
  id: number
  module_id: number
  title: string
  description?: string | null
  content: string
  image_url?: string | null
  page_image_urls: string[]
  sort_order: number
}

export interface StudentModule {
  id: number
  title: string
  description: string
  content_type?: string | null
  week?: string | null
  file_name?: string | null
  file_type?: string | null
  file_size?: number | null
  updated_at: string
  topics: LearningTopic[]
  assessments: StudentAssessment[]
}

export interface StudentAssessment {
  id: number
  module_id?: number | null
  topic_id?: number | null
  assessment_type: 'quiz' | 'activity'
  title: string
  description: string
  category?: string | null
  time_limit?: string | null
  questions: Array<{ prompt: string; answer?: string | null }>
}

interface ProgressResponse {
  completed_topic_ids: number[]
  completed_quiz_ids: number[]
  total_topics: number
  completed_topics: number
  total_quizzes: number
  completed_quizzes: number
  percent: number
}

export const useStudentContentStore = defineStore('studentContent', () => {
  const modules = ref<StudentModule[]>([])
  const currentModule = ref<StudentModule | null>(null)
  const progressByModule = ref<Record<number, ProgressResponse>>({})
  const progress = ref<ProgressResponse>({
    completed_topic_ids: [],
    completed_quiz_ids: [],
    total_topics: 0,
    completed_topics: 0,
    total_quizzes: 0,
    completed_quizzes: 0,
    percent: 0,
  })
  const loading = ref(false)
  const error = ref('')

  const sortedTopics = computed(() => [...(currentModule.value?.topics ?? [])].sort((a, b) => a.sort_order - b.sort_order))

  async function fetchModules() {
    const auth = useAuthStore()
    if (!auth.token) return
    loading.value = true
    error.value = ''
    try {
      modules.value = await apiFetch<StudentModule[]>('/student/modules/', { token: auth.token })
      await fetchAllProgress()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load modules'
    } finally {
      loading.value = false
    }
  }

  async function fetchModule(id: string | number) {
    const auth = useAuthStore()
    if (!auth.token) return
    loading.value = true
    error.value = ''
    try {
      currentModule.value = await apiFetch<StudentModule>(`/student/modules/${id}`, { token: auth.token })
      await fetchProgress(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load module'
    } finally {
      loading.value = false
    }
  }

  async function fetchProgress(id: string | number) {
    const auth = useAuthStore()
    if (!auth.token) return
    progress.value = await apiFetch<ProgressResponse>(`/student/modules/${id}/progress`, { token: auth.token })
    progressByModule.value[Number(id)] = progress.value
  }

  async function fetchAllProgress() {
    const auth = useAuthStore()
    if (!auth.token) return
    const pairs = await Promise.all(modules.value.map(async module => {
      const item = await apiFetch<ProgressResponse>(`/student/modules/${module.id}/progress`, { token: auth.token })
      return [module.id, item] as const
    }))
    progressByModule.value = Object.fromEntries(pairs)
  }

  async function markTopic(moduleId: string | number, topicId: number, status: 'started' | 'in_progress' | 'completed') {
    const auth = useAuthStore()
    if (!auth.token) return
    progress.value = await apiFetch<ProgressResponse>(`/student/modules/${moduleId}/topics/${topicId}/progress`, {
      method: 'POST',
      token: auth.token,
      body: JSON.stringify({ status }),
    })
  }

  async function submitQuiz(moduleId: string | number, quizId: number, answers: Record<string, string>) {
    const auth = useAuthStore()
    if (!auth.token) return null
    const result = await apiFetch<{ score: number; total: number; progress: ProgressResponse }>(`/student/modules/${moduleId}/quizzes/${quizId}/submit`, {
      method: 'POST',
      token: auth.token,
      body: JSON.stringify({ answers }),
    })
    progress.value = result.progress
    return result
  }

  return { modules, currentModule, progress, progressByModule, sortedTopics, loading, error, fetchModules, fetchModule, fetchProgress, fetchAllProgress, markTopic, submitQuiz }
})
