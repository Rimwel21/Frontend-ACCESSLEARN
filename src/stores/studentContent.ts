import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ApiError, apiFetch } from '@/lib/api'
import { queueStudentMutation } from '@/lib/offlineSync'
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
  due_at?: string | null
  file_name?: string | null
  file_type?: string | null
  file_size?: number | null
  behavior_required?: boolean
  updated_at: string
  topics: LearningTopic[]
  assessments: StudentAssessment[]
}

export interface StudentAssessment {
  id: number
  class_id?: number | null
  module_id?: number | null
  topic_id?: number | null
  assessment_type: 'quiz' | 'activity'
  title: string
  description: string
  category?: string | null
  week?: string | null
  time_limit?: string | null
  time_limit_seconds?: number | null
  due_at?: string | null
  questions: Array<{ prompt: string; answer?: string | null }>
  student_status?: string | null
  student_score?: number | null
  student_total?: number | null
  student_completed_at?: string | null
  student_started_at?: string | null
  student_expires_at?: string | null
  student_remaining_seconds?: number | null
  student_submission_type?: string | null
  student_answers?: Record<string, string>
}

export interface StudentDeadline {
  id: string
  title: string
  item_type: string
  due_at: string
  module_id?: number | null
  assessment_id?: number | null
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

interface QuizStartResponse {
  started_at: string | null
  time_limit_seconds: number | null
  expires_at?: string | null
  remaining_seconds?: number | null
  expired: boolean
  completed: boolean
  score?: number | null
  total?: number | null
  submission_type?: string | null
  progress?: ProgressResponse
}

export const useStudentContentStore = defineStore('studentContent', () => {
  const modules = ref<StudentModule[]>([])
  const activities = ref<StudentAssessment[]>([])
  const currentActivity = ref<StudentAssessment | null>(null)
  const currentModule = ref<StudentModule | null>(null)
  const deadlines = ref<StudentDeadline[]>([])
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
    modules.value = []
    progressByModule.value = {}
    try {
      modules.value = await apiFetch<StudentModule[]>('/student/modules/', { token: auth.token })
      await fetchAllProgress()
      await fetchDeadlines()
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
    currentModule.value = null
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
    try {
      progress.value = await apiFetch<ProgressResponse>(`/student/modules/${id}/progress`, { token: auth.token })
      progressByModule.value[Number(id)] = progress.value
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) {
        progress.value = progressByModule.value[Number(id)] ?? buildProgressFromModule(currentModule.value)
        progressByModule.value[Number(id)] = progress.value
        return
      }
      throw err
    }
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
    const path = `/student/modules/${moduleId}/topics/${topicId}/progress`
    try {
      progress.value = await apiFetch<ProgressResponse>(path, {
        method: 'POST',
        token: auth.token,
        body: JSON.stringify({ status }),
      })
      progressByModule.value[Number(moduleId)] = progress.value
      if (status === 'completed') await fetchDeadlines()
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 0) throw err
      await queueStudentMutation(path, 'POST', { status }, auth.token)
      progress.value = applyLocalTopicProgress(Number(moduleId), topicId, status)
      progressByModule.value[Number(moduleId)] = progress.value
      await fetchDeadlines()
    }
  }

  async function submitQuiz(moduleId: string | number, quizId: number, answers: Record<string, string>) {
    const auth = useAuthStore()
    if (!auth.token) return null
    const path = `/student/modules/${moduleId}/quizzes/${quizId}/submit`
    try {
      const result = await apiFetch<{ score: number; total: number; submission_type?: string | null; progress: ProgressResponse }>(path, {
        method: 'POST',
        token: auth.token,
        body: JSON.stringify({ answers }),
      })
      progress.value = result.progress
      progressByModule.value[Number(moduleId)] = progress.value
      markModuleAssessmentCompleted(moduleId, quizId, result.score, result.total)
      await fetchDeadlines()
      return result
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 0) throw err
      await queueStudentMutation(path, 'POST', { answers }, auth.token)
      const quiz = currentModule.value?.assessments.find(item => item.id === quizId)
      const result = gradeAssessment(quiz, answers)
      progress.value = applyLocalQuizProgress(Number(moduleId), quizId)
      progressByModule.value[Number(moduleId)] = progress.value
      markModuleAssessmentCompleted(moduleId, quizId, result.score, result.total)
      await fetchDeadlines()
      return { ...result, progress: progress.value, offline: true }
    }
  }

  async function startQuiz(moduleId: string | number, quizId: number) {
    const auth = useAuthStore()
    if (!auth.token) return null
    const result = await apiFetch<QuizStartResponse>(`/student/modules/${moduleId}/quizzes/${quizId}/start`, {
      method: 'POST',
      token: auth.token,
    })
    if (result.progress) {
      progress.value = result.progress
      progressByModule.value[Number(moduleId)] = progress.value
    }
    if (result.completed) {
      markModuleAssessmentCompleted(moduleId, quizId, result.score ?? 0, result.total ?? 0)
      await fetchDeadlines()
    }
    return result
  }

  async function saveQuizAnswers(moduleId: string | number, quizId: number, answers: Record<string, string>) {
    const auth = useAuthStore()
    if (!auth.token) return null
    return apiFetch<{ detail: string }>(`/student/modules/${moduleId}/quizzes/${quizId}/answers`, {
      method: 'POST',
      token: auth.token,
      body: JSON.stringify({ answers }),
    })
  }

  async function fetchActivities() {
    const auth = useAuthStore()
    if (!auth.token) return
    loading.value = true
    error.value = ''
    activities.value = []
    try {
      activities.value = await apiFetch<StudentAssessment[]>('/student/activities/', { token: auth.token })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load activities'
    } finally {
      loading.value = false
    }
  }

  async function fetchActivity(id: string | number) {
    const auth = useAuthStore()
    if (!auth.token) return
    loading.value = true
    error.value = ''
    currentActivity.value = null
    try {
      currentActivity.value = await apiFetch<StudentAssessment>(`/student/activities/${id}`, { token: auth.token })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load activity'
    } finally {
      loading.value = false
    }
  }

  async function submitAssessment(moduleId: string | number, assessmentId: number, answers: Record<string, string>) {
    const auth = useAuthStore()
    if (!auth.token) return null
      const result = await apiFetch<{ score: number; total: number; submission_type?: string | null; progress: ProgressResponse }>(`/student/modules/${moduleId}/assessments/${assessmentId}/submit`, {
      method: 'POST',
      token: auth.token,
      body: JSON.stringify({ answers }),
    })
    progress.value = result.progress
    progressByModule.value[Number(moduleId)] = progress.value
    await fetchDeadlines()
    return result
  }

  async function submitActivity(activityId: string | number, answers: Record<string, string>) {
    const auth = useAuthStore()
    if (!auth.token) return null
    const path = `/student/activities/${activityId}/submit`
    let result: { score: number; total: number }
    try {
      result = await apiFetch<{ score: number; total: number }>(path, {
        method: 'POST',
        token: auth.token,
        body: JSON.stringify({ answers }),
      })
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 0) throw err
      await queueStudentMutation(path, 'POST', { answers }, auth.token)
      result = gradeAssessment(currentActivity.value, answers)
    }
    const completedAt = new Date().toISOString()
    activities.value = activities.value.map(activity => activity.id === Number(activityId)
      ? {
          ...activity,
          student_status: 'completed',
          student_score: result.score,
          student_total: result.total,
          student_completed_at: completedAt,
        }
      : activity)
    if (currentActivity.value?.id === Number(activityId)) {
      currentActivity.value = {
        ...currentActivity.value,
        student_status: 'completed',
        student_score: result.score,
        student_total: result.total,
        student_completed_at: completedAt,
      }
    }
    await fetchDeadlines()
    return result
  }

  function buildProgressFromModule(module: StudentModule | null): ProgressResponse {
    return {
      completed_topic_ids: [],
      completed_quiz_ids: [],
      total_topics: module?.topics.length ?? 0,
      completed_topics: 0,
      total_quizzes: module?.assessments.filter(item => item.assessment_type === 'quiz').length ?? 0,
      completed_quizzes: 0,
      percent: 0,
    }
  }

  function applyLocalTopicProgress(moduleId: number, topicId: number, status: 'started' | 'in_progress' | 'completed') {
    const module = currentModule.value?.id === moduleId
      ? currentModule.value
      : modules.value.find(item => item.id === moduleId) ?? null
    const base = progressByModule.value[moduleId] ?? buildProgressFromModule(module)
    const completedTopicIds = new Set(base.completed_topic_ids)
    if (status === 'completed') completedTopicIds.add(topicId)

    return normalizeProgress({
      ...base,
      total_topics: module?.topics.length ?? base.total_topics,
      total_quizzes: module?.assessments.filter(item => item.assessment_type === 'quiz').length ?? base.total_quizzes,
      completed_topic_ids: [...completedTopicIds],
    })
  }

  function applyLocalQuizProgress(moduleId: number, quizId: number) {
    const module = currentModule.value?.id === moduleId
      ? currentModule.value
      : modules.value.find(item => item.id === moduleId) ?? null
    const base = progressByModule.value[moduleId] ?? buildProgressFromModule(module)
    const completedQuizIds = new Set(base.completed_quiz_ids)
    completedQuizIds.add(quizId)

    return normalizeProgress({
      ...base,
      total_topics: module?.topics.length ?? base.total_topics,
      total_quizzes: module?.assessments.filter(item => item.assessment_type === 'quiz').length ?? base.total_quizzes,
      completed_quiz_ids: [...completedQuizIds],
    })
  }

  function normalizeProgress(item: ProgressResponse): ProgressResponse {
    const total = item.total_topics + item.total_quizzes
    const completedTopics = item.completed_topic_ids.length
    const completedQuizzes = item.completed_quiz_ids.length
    const completed = completedTopics + completedQuizzes
    return {
      ...item,
      completed_topics: completedTopics,
      completed_quizzes: completedQuizzes,
      percent: total ? Math.round((completed / total) * 100) : 0,
    }
  }

  function gradeAssessment(assessment: StudentAssessment | null | undefined, answers: Record<string, string>) {
    const questions = assessment?.questions ?? []
    const total = questions.length
    const score = questions.reduce((sum, question, index) => {
      const expected = String(question.answer ?? '').trim().toLowerCase()
      const submitted = String(answers[String(index)] ?? '').trim().toLowerCase()
      return expected && submitted === expected ? sum + 1 : sum
    }, 0)
    return { score, total }
  }

  async function fetchDeadlines() {
    const now = Date.now()
    const moduleDeadlines = modules.value
      .filter(module => module.due_at && new Date(module.due_at).getTime() >= now)
      .map(module => ({
        id: `module-${module.id}`,
        title: module.title,
        item_type: 'Learning Material',
        due_at: module.due_at as string,
        module_id: module.id,
        assessment_id: null,
      }))

    const moduleAssessmentDeadlines = modules.value.flatMap(module =>
      module.assessments
        .filter(assessment => assessment.due_at && new Date(assessment.due_at).getTime() >= now)
        .map(assessment => ({
          id: `${assessment.assessment_type}-${assessment.id}`,
          title: assessment.title,
          item_type: assessment.assessment_type === 'quiz' ? 'Quiz' : 'Activity',
          due_at: assessment.due_at as string,
          module_id: assessment.module_id ?? module.id,
          assessment_id: assessment.id,
        }))
    )

    const activityDeadlines = activities.value
      .filter(activity => activity.due_at && new Date(activity.due_at).getTime() >= now)
      .map(activity => ({
        id: `activity-${activity.id}`,
        title: activity.title,
        item_type: 'Activity',
        due_at: activity.due_at as string,
        module_id: activity.module_id ?? null,
        assessment_id: activity.id,
      }))

    deadlines.value = [...moduleDeadlines, ...moduleAssessmentDeadlines, ...activityDeadlines]
      .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
  }

  function markModuleAssessmentCompleted(moduleId: string | number, assessmentId: number, score: number, total: number) {
    if (currentModule.value?.id !== Number(moduleId)) return
    currentModule.value = {
      ...currentModule.value,
      assessments: currentModule.value.assessments.map(assessment => assessment.id === assessmentId
        ? {
            ...assessment,
            student_status: 'completed',
            student_score: score,
            student_total: total,
            student_completed_at: new Date().toISOString(),
          }
        : assessment),
    }
  }

  return {
    modules, activities, currentActivity, currentModule, deadlines, progress, progressByModule, sortedTopics, loading, error,
    fetchModules, fetchModule, fetchActivities, fetchActivity, fetchProgress, fetchAllProgress,
    fetchDeadlines, markTopic, startQuiz, saveQuizAnswers, submitQuiz, submitAssessment, submitActivity,
  }
})
