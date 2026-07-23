import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { API_BASE_URL, apiFetch } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

type ModuleStatus = 'Published' | 'Unpublished'
type ActivityStatus = 'Not Started' | 'In Progress' | 'Overdue' | 'Finished'
type Difficulty = 'Easy' | 'Medium' | 'Hard'

interface Module {
  id: string
  title: string
  description: string
  status: ModuleStatus
  lastUpdated: string
  classId?: number | null
  contentType?: string | null
  week?: string | null
  behaviorRequired?: boolean
  fileName?: string | null
  fileType?: string | null
  fileSize?: number | null
  dueAt?: string | null
}

interface Performer {
  name: string
  initials: string
  gradient: string
  assignments: number
  quiz: number
  activities: number
  total: number
  avg: string
}

interface RecentActivity {
  id: string
  text: string
  time: string
  color: string
}

interface StudentRow {
  studentId: string
  studentName: string
  initials: string
  avatarGradient: string
  overallPercent: number
  activitiesCompleted: number
  activitiesTotal: number
  activityPercent: number
  learningMaterialsCompleted: number
  learningMaterialsInProgress: number
  learningMaterialsTotal: number
  status: 'Complete' | 'In Progress' | 'Needs Help'
  lastActivity: string
  quizActivity: string
}

interface DashboardSummary {
  totalStudents: number
  activeLearningMaterials: number
  averageQuizScore: number
}

export interface AssessmentQuestion {
  prompt: string
  answer?: string | null
}

export interface ActivitySubmission {
  id: number
  studentId: number
  studentName: string
  score?: number | null
  total?: number | null
  answers: Record<string, string>
  completedAt?: string | null
}

interface AssessmentSettings {
  classId?: number | null
  moduleId?: number | null
  topicId?: number | null
  category?: string | null
  week?: string | null
  timeLimit?: string | null
  attemptsAllowed?: number
  shuffleQuestions?: boolean
  showAnswersAfterSubmission?: boolean
  dueAt?: string | null
  questions?: AssessmentQuestion[]
  submissionsCount?: number
  submissions?: ActivitySubmission[]
}

export interface Quiz extends AssessmentSettings {
  id: string
  title: string
  description?: string
  module: string
  type: string
  difficulty: Difficulty
  date: string
}

export interface Activity extends AssessmentSettings {
  id: string
  title: string
  description: string
  module: string
  dueDate: string
  dueTime: string
  status: ActivityStatus
}

interface ClassInfo {
  id: string
  className: string
  subject: string
  gradeLevel: string
  section: string
  schoolYear?: string | null
  studentCount: number
  createdAt: string
}

interface ClassStudent {
  id: number
  accountId: number
  name: string
  username?: string | null
  email?: string | null
  gradeLevel: string
  section: string
  createdAt?: string | null
}

interface TeacherClassResponse {
  id: number
  teacher_id: number
  class_name: string
  subject: string
  grade_levels: { id: number; name: string }
  sections: { id: number; name: string; grade_level_id: number }
  school_year: string | null
  student_count: number
  created_at: string
  updated_at: string
}

interface ClassStudentResponse {
  id: number
  account_id: number
  name: string
  username?: string | null
  email?: string | null
  grade_level: { id: number; name: string }
  section: { id: number; name: string; grade_level_id: number }
  created_at?: string | null
}

interface TeacherModuleResponse {
  id: number
  teacher_id: number
  class_id: number | null
  title: string
  description: string
  content_type: string | null
  week: string | null
  status: ModuleStatus
  behavior_required: boolean
  file_name: string | null
  file_type: string | null
  file_size: number | null
  created_at: string
  updated_at: string
  due_at?: string | null
}

interface DashboardStudentProgressResponse {
  student_id: number
  student_name: string
  overall_percent: number
  activities_completed: number
  activities_total: number
  activity_percent?: number
  learning_materials_completed?: number
  learning_materials_in_progress?: number
  learning_materials_total?: number
  status: 'Complete' | 'In Progress' | 'Needs Help'
  last_activity: string | null
  quiz_activity: string | null
}

interface TeacherDashboardSummaryResponse {
  total_students: number
  active_learning_materials: number
  average_quiz_score: number
  student_progress: DashboardStudentProgressResponse[]
}

interface TeacherAssessmentResponse {
  id: number
  teacher_id: number
  class_id: number | null
  module_id: number | null
  topic_id: number | null
  assessment_type: 'quiz' | 'activity'
  title: string
  description: string
  category: string | null
  week: string | null
  time_limit: string | null
  attempts_allowed: number
  shuffle_questions: boolean
  show_answers_after_submission: boolean
  questions: AssessmentQuestion[]
  submissions_count?: number
  submissions?: Array<{
    id: number
    student_id: number
    student_name: string
    score?: number | null
    total?: number | null
    answers?: Record<string, string>
    completed_at?: string | null
  }>
  created_at: string
  updated_at: string
  due_at?: string | null
}

interface RecentActivityResponse {
  id: string
  text: string
  occurred_at: string
  activity_type: 'material' | 'quiz' | 'activity' | string
}

export const useTeacherStore = defineStore('teacher', () => {
  const teacherName = ref('Ms. Rymuel')
  const modules = ref<Module[]>([])
  const quizzes = ref<Quiz[]>([])
  const activities = ref<Activity[]>([])
  const dashboardSummary = ref<DashboardSummary>({
    totalStudents: 0,
    activeLearningMaterials: 0,
    averageQuizScore: 0,
  })

  const modulesLoading = ref(false)
  const moduleSaving = ref(false)
  const moduleError = ref('')
  const quizSaving = ref(false)
  const quizError = ref('')
  const activitySaving = ref(false)
  const activityError = ref('')
  const classesLoading = ref(false)
  const classSaving = ref(false)
  const classError = ref('')
  const classStudents = ref<ClassStudent[]>([])
  const classStudentsLoading = ref(false)

  const performers = ref<Performer[]>([
    { name: 'Penagrin, Aguiluz Emmanuelle O.', initials: 'FE', gradient: 'from-brand-blue to-brand-violet', assignments: 80, quiz: 183, activities: 80, total: 343, avg: '95%' },
    { name: 'Nugajin, Rymuel', initials: 'NR', gradient: 'from-cyan-500 to-cyan-700', assignments: 80, quiz: 180, activities: 80, total: 340, avg: '92%' },
    { name: 'Dimaculangan, Dominhar', initials: 'DD', gradient: 'from-amber-400 to-rose-500', assignments: 80, quiz: 153, activities: 80, total: 313, avg: '84%' },
    { name: 'Santos, Carla M.', initials: 'SC', gradient: 'from-emerald-400 to-teal-500', assignments: 78, quiz: 170, activities: 75, total: 323, avg: '88%' },
  ])

  const recentActivities = ref<RecentActivity[]>([])

  const students = ref<StudentRow[]>([])

  const classes = ref<ClassInfo[]>([])
  const selectedClassId = ref<string | null>(null)

  const selectedClass = computed(() => classes.value.find(c => c.id === selectedClassId.value) ?? null)
  const hasClasses = computed(() => classes.value.length > 0)
  const publishedModules = computed(() => modules.value.filter(m => m.status === 'Published'))
  const unpublishedModules = computed(() => modules.value.filter(m => m.status === 'Unpublished'))
  const atRiskStudents = computed(() => students.value.filter(s => s.status === 'Needs Help'))

  async function fetchClasses() {
    const auth = useAuthStore()
    if (!auth.token) return
    classesLoading.value = true
    classError.value = ''

    try {
      const data = await apiFetch<TeacherClassResponse[]>('/teacher/classes/', { token: auth.token })
      classes.value = data.map(mapClassResponse)
      if (!selectedClassId.value && classes.value.length) {
        selectedClassId.value = classes.value[0].id
        await fetchClassStudents(selectedClassId.value)
      } else if (selectedClassId.value && !classes.value.some(c => c.id === selectedClassId.value)) {
        selectedClassId.value = classes.value[0]?.id ?? null
        classStudents.value = []
      }
    } catch (err) {
      classError.value = err instanceof Error ? err.message : 'Unable to load classes'
    } finally {
      classesLoading.value = false
    }
  }

  async function addClass(payload: {
    className: string
    subject: string
    gradeLevelId: number
    sectionId: number
    schoolYear?: string | null
  }) {
    const auth = useAuthStore()
    if (!auth.token) throw new Error('Please login first')
    classSaving.value = true
    classError.value = ''

    try {
      const saved = await apiFetch<TeacherClassResponse>('/teacher/classes/', {
        method: 'POST',
        token: auth.token,
        body: JSON.stringify({
          class_name: payload.className,
          subject: payload.subject,
          grade_level_id: payload.gradeLevelId,
          section_id: payload.sectionId,
          school_year: payload.schoolYear || null,
        }),
      })
      const mapped = mapClassResponse(saved)
      classes.value.unshift(mapped)
      selectedClassId.value = mapped.id
      await fetchClassStudents(mapped.id)
      return mapped
    } catch (err) {
      classError.value = err instanceof Error ? err.message : 'Unable to create class'
      throw err
    } finally {
      classSaving.value = false
    }
  }

  async function selectClass(id: string) {
    selectedClassId.value = id
    await fetchClassStudents(id)
  }

  async function deleteClass(id: string) {
    const auth = useAuthStore()
    const original = classes.value
    classes.value = classes.value.filter(c => c.id !== id)
    if (selectedClassId.value === id) {
      selectedClassId.value = classes.value[0]?.id ?? null
      classStudents.value = []
    }
    if (!auth.token) return

    try {
      await apiFetch(`/teacher/classes/${id}`, { method: 'DELETE', token: auth.token })
      if (selectedClassId.value) await fetchClassStudents(selectedClassId.value)
    } catch (err) {
      classes.value = original
      classError.value = err instanceof Error ? err.message : 'Unable to delete class'
    }
  }

  async function fetchClassStudents(id: string) {
    const auth = useAuthStore()
    if (!auth.token) return
    classStudentsLoading.value = true
    classError.value = ''

    try {
      const data = await apiFetch<ClassStudentResponse[]>(`/teacher/classes/${id}/students`, { token: auth.token })
      classStudents.value = data.map(mapClassStudentResponse)
      const target = classes.value.find(cls => cls.id === id)
      if (target) target.studentCount = classStudents.value.length
    } catch (err) {
      classError.value = err instanceof Error ? err.message : 'Unable to load students'
    } finally {
      classStudentsLoading.value = false
    }
  }

  async function fetchModules() {
    const auth = useAuthStore()
    if (!auth.token) return
    modulesLoading.value = true
    moduleError.value = ''

    try {
      const data = await apiFetch<TeacherModuleResponse[]>('/teacher/modules/', { token: auth.token })
      modules.value = data.map(mapModuleResponse)
    } catch (err) {
      moduleError.value = err instanceof Error ? err.message : 'Unable to load materials'
    } finally {
      modulesLoading.value = false
    }
  }

  async function addModule(module: Omit<Module, 'id' | 'lastUpdated'> & { file?: File | null }) {
    const auth = useAuthStore()
    moduleSaving.value = true
    moduleError.value = ''

    try {
      if (!auth.token) throw new Error('Please login first')

      const saved = module.file
        ? await uploadModule(module, auth.token)
        : await apiFetch<TeacherModuleResponse>('/teacher/modules/', {
            method: 'POST',
            token: auth.token,
            body: JSON.stringify({
              title: module.title,
              description: module.description,
              content_type: module.contentType,
              week: module.week,
              status: module.status,
              behavior_required: module.behaviorRequired ?? true,
              class_id: module.classId ?? null,
              due_at: module.dueAt ?? null,
            }),
          })
      modules.value.unshift(mapModuleResponse(saved))
      return saved
    } catch (err) {
      moduleError.value = err instanceof Error ? err.message : 'Unable to create material'
      throw err
    } finally {
      moduleSaving.value = false
    }
  }

  async function deleteModule(id: string) {
    const auth = useAuthStore()
    const original = modules.value
    modules.value = modules.value.filter(m => m.id !== id)
    if (!auth.token) return

    try {
      await apiFetch(`/teacher/modules/${id}`, { method: 'DELETE', token: auth.token })
    } catch (err) {
      modules.value = original
      moduleError.value = err instanceof Error ? err.message : 'Unable to delete material'
    }
  }

  async function updateModule(id: string, updates: Partial<Module>) {
    const auth = useAuthStore()
    if (!auth.token) throw new Error('Please login first')
    const saved = await apiFetch<TeacherModuleResponse>(`/teacher/modules/${id}`, {
      method: 'PATCH',
      token: auth.token,
      body: JSON.stringify({
        title: updates.title,
        description: updates.description,
        content_type: updates.contentType,
        week: updates.week,
        status: updates.status,
        behavior_required: updates.behaviorRequired,
        class_id: updates.classId ?? null,
        due_at: updates.dueAt ?? null,
      }),
    })
    const mapped = mapModuleResponse(saved)
    modules.value = modules.value.map(module => module.id === id ? mapped : module)
    return saved
  }

  async function replaceModuleFile(id: string, file: File) {
    const auth = useAuthStore()
    if (!auth.token) throw new Error('Please login first')
    const formData = new FormData()
    formData.append('material_file', file)
    const saved = await apiFetch<TeacherModuleResponse>(`/teacher/modules/${id}/replace-file`, {
      method: 'PUT',
      token: auth.token,
      body: formData,
    })
    const mapped = mapModuleResponse(saved)
    modules.value = modules.value.map(module => module.id === id ? mapped : module)
    return saved
  }

  async function downloadModuleFile(id: string, fileName?: string | null) {
    const auth = useAuthStore()
    if (!auth.token) throw new Error('Please login first')
    const response = await fetch(`${API_BASE_URL}/teacher/modules/${id}/download`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    if (!response.ok) throw new Error('Unable to download file')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || 'learning-material'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function fetchDashboardSummary(classId?: string | null) {
    const auth = useAuthStore()
    if (!auth.token) return
    try {
      const query = classId ? `?class_id=${encodeURIComponent(classId)}` : ''
      const data = await apiFetch<TeacherDashboardSummaryResponse>(`/teacher/classes/dashboard-summary${query}`, { token: auth.token })
      dashboardSummary.value = {
        totalStudents: data.total_students,
        activeLearningMaterials: data.active_learning_materials,
        averageQuizScore: data.average_quiz_score,
      }
      students.value = data.student_progress.map(mapDashboardStudentResponse)
    } catch (err) {
      classError.value = err instanceof Error ? err.message : 'Unable to load student progress'
    }
  }

  async function fetchRecentActivities() {
    const auth = useAuthStore()
    if (!auth.token) return
    try {
      const data = await apiFetch<RecentActivityResponse[]>('/teacher/classes/recent-activities', { token: auth.token })
      recentActivities.value = data.map(mapRecentActivityResponse)
    } catch {
      recentActivities.value = []
    }
  }

  async function fetchAssessments(type: 'quiz' | 'activity') {
    const auth = useAuthStore()
    if (!auth.token) return

    if (type === 'quiz' && modules.value.length === 0) {
      await fetchModules()
    }

    const data = await apiFetch<TeacherAssessmentResponse[]>(`/teacher/assessments/${type}`, { token: auth.token })
    if (type === 'quiz') quizzes.value = data.map(assessment => mapQuizResponse(assessment, modules.value))
    else activities.value = data.map(mapActivityResponse)
  }

  async function addQuiz(payload: {
    classId?: number | null
    moduleId?: number | null
    topicId?: number | null
    title: string
    description: string
    quizType: string
    week: string
    timeLimit: string
    attemptsAllowed: number
    shuffleQuestions: boolean
    showAnswersAfterSubmission: boolean
    questions: AssessmentQuestion[]
    dueAt?: string | null
  }) {
    const auth = useAuthStore()
    quizSaving.value = true
    quizError.value = ''

    try {
      if (!auth.token) throw new Error('Please login first')
      const saved = await apiFetch<TeacherAssessmentResponse>('/teacher/assessments/', {
        method: 'POST',
        token: auth.token,
        body: JSON.stringify({
          assessment_type: 'quiz',
          class_id: payload.classId ?? null,
          module_id: payload.moduleId ?? null,
          topic_id: payload.topicId ?? null,
          title: payload.title,
          description: payload.description,
          category: payload.quizType,
          week: payload.week,
          time_limit: payload.timeLimit,
          attempts_allowed: payload.attemptsAllowed,
          shuffle_questions: payload.shuffleQuestions,
          show_answers_after_submission: payload.showAnswersAfterSubmission,
          questions: payload.questions,
          due_at: payload.dueAt ?? null,
        }),
      })
      quizzes.value.unshift(mapQuizResponse(saved, modules.value))
      return saved
    } catch (err) {
      quizError.value = err instanceof Error ? err.message : 'Unable to create quiz'
      throw err
    } finally {
      quizSaving.value = false
    }
  }

  async function addActivity(payload: {
    classId?: number | null
    moduleId?: number | null
    topicId?: number | null
    title: string
    description: string
    activityType: string
    week: string
    timeLimit: string
    attemptsAllowed: number
    shuffleQuestions: boolean
    showAnswersAfterSubmission: boolean
    questions: AssessmentQuestion[]
    dueAt?: string | null
  } | Omit<Activity, 'id'>) {
    const auth = useAuthStore()
    activitySaving.value = true
    activityError.value = ''

    try {
      if (!auth.token) {
        const localPayload = payload as Omit<Activity, 'id'>
        activities.value.unshift({ ...localPayload, id: `a${Date.now()}` })
        return
      }

      const formPayload = payload as {
        classId?: number | null
        moduleId?: number | null
        topicId?: number | null
        title: string
        description: string
        activityType?: string
        week?: string
        timeLimit?: string
        attemptsAllowed?: number
        shuffleQuestions?: boolean
        showAnswersAfterSubmission?: boolean
        questions?: AssessmentQuestion[]
        dueAt?: string | null
      }

      const saved = await apiFetch<TeacherAssessmentResponse>('/teacher/assessments/', {
        method: 'POST',
        token: auth.token,
        body: JSON.stringify({
          assessment_type: 'activity',
          class_id: formPayload.classId ?? null,
          module_id: null,
          topic_id: null,
          title: formPayload.title,
          description: formPayload.description,
          category: formPayload.activityType ?? 'Activity',
          week: formPayload.week ?? '',
          time_limit: formPayload.timeLimit ?? '',
          attempts_allowed: formPayload.attemptsAllowed ?? 1,
          shuffle_questions: formPayload.shuffleQuestions ?? true,
          show_answers_after_submission: formPayload.showAnswersAfterSubmission ?? true,
          questions: formPayload.questions ?? [],
          due_at: formPayload.dueAt ?? null,
        }),
      })
      activities.value.unshift(mapActivityResponse(saved))
      await fetchDashboardSummary()
      return saved
    } catch (err) {
      activityError.value = err instanceof Error ? err.message : 'Unable to create activity'
      throw err
    } finally {
      activitySaving.value = false
    }
  }

  async function updateQuiz(id: string, payload: {
    classId?: number | null
    moduleId?: number | null
    topicId?: number | null
    title: string
    description: string
    quizType: string
    week: string
    timeLimit: string
    attemptsAllowed: number
    shuffleQuestions: boolean
    showAnswersAfterSubmission: boolean
    questions: AssessmentQuestion[]
    dueAt?: string | null
  }) {
    const auth = useAuthStore()
    quizSaving.value = true
    quizError.value = ''

    try {
      if (!auth.token) throw new Error('Please login first')
      const saved = await apiFetch<TeacherAssessmentResponse>(`/teacher/assessments/${id}`, {
        method: 'PATCH',
        token: auth.token,
        body: JSON.stringify({
          class_id: payload.classId ?? null,
          module_id: payload.moduleId ?? null,
          topic_id: payload.topicId ?? null,
          title: payload.title,
          description: payload.description,
          category: payload.quizType,
          week: payload.week,
          time_limit: payload.timeLimit,
          attempts_allowed: payload.attemptsAllowed,
          shuffle_questions: payload.shuffleQuestions,
          show_answers_after_submission: payload.showAnswersAfterSubmission,
          questions: payload.questions,
          due_at: payload.dueAt ?? null,
        }),
      })
      const mapped = mapQuizResponse(saved, modules.value)
      quizzes.value = quizzes.value.map(quiz => quiz.id === id ? mapped : quiz)
      return saved
    } catch (err) {
      quizError.value = err instanceof Error ? err.message : 'Unable to update quiz'
      throw err
    } finally {
      quizSaving.value = false
    }
  }

  async function updateActivity(id: string, payload: {
    classId?: number | null
    moduleId?: number | null
    topicId?: number | null
    title: string
    description: string
    activityType: string
    week: string
    timeLimit: string
    attemptsAllowed: number
    shuffleQuestions: boolean
    showAnswersAfterSubmission: boolean
    questions: AssessmentQuestion[]
    dueAt?: string | null
  }) {
    const auth = useAuthStore()
    activitySaving.value = true
    activityError.value = ''

    try {
      if (!auth.token) throw new Error('Please login first')
      const saved = await apiFetch<TeacherAssessmentResponse>(`/teacher/assessments/${id}`, {
        method: 'PATCH',
        token: auth.token,
        body: JSON.stringify({
          class_id: payload.classId ?? null,
          module_id: null,
          topic_id: null,
          title: payload.title,
          description: payload.description,
          category: payload.activityType,
          week: payload.week,
          time_limit: payload.timeLimit,
          attempts_allowed: payload.attemptsAllowed,
          shuffle_questions: payload.shuffleQuestions,
          show_answers_after_submission: payload.showAnswersAfterSubmission,
          questions: payload.questions,
          due_at: payload.dueAt ?? null,
        }),
      })
      const mapped = mapActivityResponse(saved)
      activities.value = activities.value.map(activity => activity.id === id ? mapped : activity)
      await fetchDashboardSummary()
      return saved
    } catch (err) {
      activityError.value = err instanceof Error ? err.message : 'Unable to update activity'
      throw err
    } finally {
      activitySaving.value = false
    }
  }

<<<<<<< HEAD
  async function deleteActivity(id: string) {
    const auth = useAuthStore()
    const original = activities.value
    activities.value = activities.value.filter(a => a.id !== id)
    if (!auth.token) return

    try {
      await apiFetch(`/teacher/assessments/${id}`, { method: 'DELETE', token: auth.token })
      await fetchDashboardSummary()
=======
  async function deleteQuiz(id: string) {
    const auth = useAuthStore()
    const original = quizzes.value
    quizError.value = ''
    quizzes.value = quizzes.value.filter(quiz => quiz.id !== id)

    try {
      if (!auth.token) throw new Error('Please login first')
      await apiFetch<{ detail: string }>(`/teacher/assessments/${id}`, {
        method: 'DELETE',
        token: auth.token,
      })
      await fetchRecentActivities()
    } catch (err) {
      quizzes.value = original
      quizError.value = err instanceof Error ? err.message : 'Unable to delete quiz'
      throw err
    }
  }

  async function deleteActivity(id: string) {
    const auth = useAuthStore()
    const original = activities.value
    activityError.value = ''
    activities.value = activities.value.filter(activity => activity.id !== id)

    try {
      if (!auth.token) throw new Error('Please login first')
      await apiFetch<{ detail: string }>(`/teacher/assessments/${id}`, {
        method: 'DELETE',
        token: auth.token,
      })
      await fetchRecentActivities()
>>>>>>> f99820c2a9f52096d745c228f19d693b9767d948
    } catch (err) {
      activities.value = original
      activityError.value = err instanceof Error ? err.message : 'Unable to delete activity'
      throw err
    }
  }

  return {
    teacherName, modules, performers, recentActivities, students, quizzes, activities, dashboardSummary,
    classes, selectedClassId, selectedClass, hasClasses,
    modulesLoading, moduleSaving, moduleError, quizSaving, quizError, activitySaving, activityError,
    classesLoading, classSaving, classError, classStudents, classStudentsLoading,
    publishedModules, unpublishedModules, atRiskStudents,
    fetchModules, addModule, updateModule, replaceModuleFile, downloadModuleFile, deleteModule, fetchDashboardSummary, fetchRecentActivities, fetchAssessments, addQuiz, updateQuiz, deleteQuiz, addActivity, updateActivity, deleteActivity,
    fetchClasses, addClass, selectClass, deleteClass, fetchClassStudents,
  }
})

function mapClassResponse(cls: TeacherClassResponse): ClassInfo {
  return {
    id: String(cls.id),
    className: cls.class_name,
    subject: cls.subject,
    gradeLevel: cls.grade_levels?.name ?? '',
    section: cls.sections?.name ?? '',
    schoolYear: cls.school_year,
    studentCount: cls.student_count,
    createdAt: new Date(cls.created_at).toLocaleDateString(),
  }
}

function mapClassStudentResponse(student: ClassStudentResponse): ClassStudent {
  return {
    id: student.id,
    accountId: student.account_id,
    name: student.name,
    username: student.username,
    email: student.email,
    gradeLevel: student.grade_level?.name ?? '',
    section: student.section?.name ?? '',
    createdAt: student.created_at ? new Date(student.created_at).toLocaleDateString() : null,
  }
}

function mapModuleResponse(module: TeacherModuleResponse): Module {
  return {
    id: String(module.id),
    title: module.title,
    description: module.description,
    status: module.status,
    lastUpdated: new Date(module.updated_at).toLocaleDateString(),
    classId: module.class_id,
    contentType: module.content_type,
    week: module.week,
    behaviorRequired: module.behavior_required,
    fileName: module.file_name,
    fileType: module.file_type,
    fileSize: module.file_size,
    dueAt: module.due_at ?? null,
  }
}

function uploadModule(module: Omit<Module, 'id' | 'lastUpdated'> & { file?: File | null }, token: string) {
  const formData = new FormData()
  formData.append('title', module.title)
  formData.append('description', module.description)
  formData.append('content_type', module.contentType ?? '')
  formData.append('week', module.week ?? '')
  formData.append('status_value', module.status)
  formData.append('behavior_required', String(module.behaviorRequired ?? true))
  if (module.dueAt) formData.append('due_at', module.dueAt)
  if (module.classId) formData.append('class_id', String(module.classId))
  if (module.file) formData.append('material_file', module.file)

  return apiFetch<TeacherModuleResponse>('/teacher/modules/upload', {
    method: 'POST',
    token,
    body: formData,
  })
}

function mapDashboardStudentResponse(student: DashboardStudentProgressResponse): StudentRow {
  return {
    studentId: String(student.student_id),
    studentName: student.student_name,
    initials: initialsFor(student.student_name),
    avatarGradient: gradientFor(student.student_id),
    overallPercent: student.overall_percent,
    activitiesCompleted: student.activities_completed,
    activitiesTotal: student.activities_total,
    activityPercent: student.activity_percent ?? 0,
    learningMaterialsCompleted: student.learning_materials_completed ?? 0,
    learningMaterialsInProgress: student.learning_materials_in_progress ?? 0,
    learningMaterialsTotal: student.learning_materials_total ?? 0,
    status: student.status,
    lastActivity: student.last_activity ? new Date(student.last_activity).toLocaleDateString() : 'No activity',
    quizActivity: student.quiz_activity ?? 'No quiz yet',
  }
}

function mapRecentActivityResponse(activity: RecentActivityResponse): RecentActivity {
  return {
    id: activity.id,
    text: activity.text,
    time: relativeTime(activity.occurred_at),
    color: activityColor(activity.activity_type),
  }
}

function relativeTime(value: string) {
  const timestamp = new Date(value).getTime()
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function activityColor(type: string) {
  if (type === 'quiz') return 'bg-brand-blue'
  if (type === 'activity') return 'bg-brand-violet'
  return 'bg-brand-green'
}

function initialsFor(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('') || 'ST'
}

function gradientFor(id: number) {
  const gradients = [
    'from-brand-blue to-brand-violet',
    'from-cyan-500 to-cyan-700',
    'from-amber-400 to-rose-500',
    'from-emerald-400 to-teal-500',
  ]
  return gradients[id % gradients.length]
}

function mapQuizResponse(assessment: TeacherAssessmentResponse, availableModules: Module[] = []): Quiz {
  const material = assessment.module_id
    ? availableModules.find(module => Number(module.id) === assessment.module_id)
    : null
  return {
    id: String(assessment.id),
    title: assessment.title,
    description: assessment.description,
    module: material?.title ?? 'No learning material',
    classId: assessment.class_id,
    moduleId: assessment.module_id,
    topicId: assessment.topic_id,
    category: assessment.category,
    week: assessment.week,
    timeLimit: assessment.time_limit,
    attemptsAllowed: assessment.attempts_allowed,
    shuffleQuestions: assessment.shuffle_questions,
    showAnswersAfterSubmission: assessment.show_answers_after_submission,
    dueAt: assessment.due_at ?? null,
    type: assessment.category ?? 'Quiz',
    difficulty: 'Medium',
    date: new Date(assessment.updated_at).toLocaleDateString(),
    questions: assessment.questions,
  }
}

function mapActivityResponse(assessment: TeacherAssessmentResponse): Activity {
  const submissions = (assessment.submissions ?? []).map(mapActivitySubmissionResponse)
  return {
    id: String(assessment.id),
    title: assessment.title,
    description: assessment.description,
    module: assessment.category ?? 'Activity',
    classId: assessment.class_id,
    moduleId: assessment.module_id,
    topicId: assessment.topic_id,
    category: assessment.category,
    week: assessment.week,
    timeLimit: assessment.time_limit,
    attemptsAllowed: assessment.attempts_allowed,
    shuffleQuestions: assessment.shuffle_questions,
    showAnswersAfterSubmission: assessment.show_answers_after_submission,
    dueAt: assessment.due_at ?? null,
    dueDate: assessment.due_at ? new Date(assessment.due_at).toLocaleDateString() : '',
    dueTime: assessment.time_limit ?? '',
    status: (assessment.submissions_count ?? submissions.length) > 0 ? 'Finished' : 'Not Started',
    questions: assessment.questions,
    submissionsCount: assessment.submissions_count ?? submissions.length,
    submissions,
  }
}

function mapActivitySubmissionResponse(submission: {
  id: number
  student_id: number
  student_name: string
  score?: number | null
  total?: number | null
  answers?: Record<string, string>
  completed_at?: string | null
}): ActivitySubmission {
  return {
    id: submission.id,
    studentId: submission.student_id,
    studentName: submission.student_name,
    score: submission.score,
    total: submission.total,
    answers: submission.answers ?? {},
    completedAt: submission.completed_at ?? null,
  }
}
