// ── User / Auth ──────────────────────────────────────────
export type Role = 'teacher' | 'student'

export interface User {
  id: string
  name: string
  role: Role
  avatar?: string
}

// ── Module ───────────────────────────────────────────────
export type ModuleStatus = 'Published' | 'Unpublished'

export interface Module {
  id: string
  title: string
  description: string
  contentType: string
  week: string
  status: ModuleStatus
  lastUpdated: string
  estimatedTime: string
  required: boolean
}

// ── Topic ────────────────────────────────────────────────
export interface Topic {
  id: string
  moduleId: string
  title: string
  description: string
  content: string
  extra: string
  emoji: string
}

// ── Quiz ─────────────────────────────────────────────────
export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type QuizType   = 'Multiple Choice' | 'True/False' | 'Short Answer' | 'Mixed'

export interface QuizQuestion {
  id: string
  text: string
  options: string[]
  correctIndex: number
}

export interface Quiz {
  id: string
  title: string
  description: string
  type: QuizType
  week: string
  moduleId: string
  timeLimit: number
  attemptsAllowed: number
  shuffleQuestions: boolean
  showAnswers: boolean
  difficulty: Difficulty
  questions: QuizQuestion[]
  published: boolean
  date: string
}

// ── Student Progress ─────────────────────────────────────
export interface ModuleProgress {
  moduleId: string
  moduleTitle: string
  overallPercent: number
  lessonsCompleted: number
  lessonsTotal: number
  quizzesCompleted: number
  quizzesTotal: number
  status: 'Complete' | 'In Progress' | 'Not Started'
}

export interface ActivityLog {
  id: string
  action: string
  module: string
  details: string
  date: string
}

export interface StudentProgress {
  studentId: string
  studentName: string
  initials: string
  avatarGradient: string
  overallPercent: number
  activitiesCompleted: number
  activitiesTotal: number
  modulesInProgress: number
  lastActivity: string
  status: 'Complete' | 'In Progress' | 'Needs Help'
  moduleProgress: ModuleProgress[]
  activityLog: ActivityLog[]
}

// ── Teacher Dashboard ────────────────────────────────────
export interface Performer {
  name: string
  initials: string
  gradient: string
  assignments: number
  quiz: number
  activities: number
  total: number
  avg: string
}

export interface RecentActivity {
  text: string
  time: string
  color: string
}

// ── Breadcrumb ───────────────────────────────────────────
export interface Breadcrumb {
  label: string
  view?: string
}
