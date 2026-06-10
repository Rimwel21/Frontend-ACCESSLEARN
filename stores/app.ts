import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Module, Quiz, StudentProgress, Performer, RecentActivity } from '@/types'

// ── Mock Data ─────────────────────────────────────────────────────────────────

const mockModules: Module[] = [
  { id: 'm1', title: 'Module 1 — Scientific Method',    description: 'Introduction to scientific processes, hypothesis, and variables.',            contentType: 'Lesson',   week: 'Week 1', status: 'Published',   lastUpdated: '03-24-2025', estimatedTime: '20mins', required: true },
  { id: 'm2', title: 'Module 2 — Variables & Hypotheses', description: 'Deeper look at independent, dependent, and controlled variables.',           contentType: 'Lesson',   week: 'Week 2', status: 'Published',   lastUpdated: '03-24-2025', estimatedTime: '25mins', required: true },
  { id: 'm3', title: 'Module 3 — Data Collection',       description: 'Methods of collecting qualitative and quantitative data.',                   contentType: 'Activity', week: 'Week 3', status: 'Published',   lastUpdated: '03-24-2025', estimatedTime: '30mins', required: true },
  { id: 'm4', title: 'Module 4 — Data Analysis',         description: 'Statistical analysis and graph interpretation techniques.',                  contentType: 'Lesson',   week: 'Week 4', status: 'Published',   lastUpdated: '03-24-2025', estimatedTime: '35mins', required: false },
  { id: 'm5', title: 'Module 5 — Conclusions',           description: 'Drawing evidence-based conclusions and scientific reporting.',               contentType: 'Lesson',   week: 'Week 5', status: 'Published',   lastUpdated: '03-24-2025', estimatedTime: '20mins', required: true },
  { id: 'm6', title: 'Module 6 — Peer Review',           description: 'Understanding the peer review process in scientific research.',              contentType: 'Document', week: 'Week 6', status: 'Unpublished', lastUpdated: '03-24-2025', estimatedTime: '15mins', required: false },
  { id: 'm7', title: 'Module 7 — Lab Safety',            description: 'Laboratory safety rules and equipment identification.',                      contentType: 'Video',    week: 'Week 7', status: 'Unpublished', lastUpdated: '03-24-2025', estimatedTime: '18mins', required: true },
  { id: 'm8', title: 'Module 8 — Final Review',          description: 'Comprehensive review of all topics covered in the course.',                  contentType: 'Lesson',   week: 'Week 8', status: 'Published',   lastUpdated: '03-24-2025', estimatedTime: '40mins', required: true },
]

const mockQuizzes: Quiz[] = [
  { id: 'q1', title: 'Quiz 1 — Scientific Method', description: 'Test on scientific processes', type: 'Multiple Choice', week: 'Week 1', moduleId: 'm1', timeLimit: 10, attemptsAllowed: 2, shuffleQuestions: true, showAnswers: true, difficulty: 'Easy',   published: true,  date: '03-24-26',
    questions: [
      { id: 'qq1', text: 'Which best describes a hypothesis?', options: ['A proven fact', 'A testable prediction', 'A random guess', 'A conclusion'], correctIndex: 1 },
      { id: 'qq2', text: 'What is the control group?', options: ['Changed variable', 'Baseline group', 'Test group', 'Random group'], correctIndex: 1 },
      { id: 'qq3', text: 'Which variable does the researcher change?', options: ['Dependent', 'Controlled', 'Independent', 'Responding'], correctIndex: 2 },
    ]},
  { id: 'q2', title: 'Quiz 2 — Variables', description: 'Variables and hypotheses quiz', type: 'Multiple Choice', week: 'Week 2', moduleId: 'm2', timeLimit: 10, attemptsAllowed: 2, shuffleQuestions: false, showAnswers: true, difficulty: 'Medium', published: true,  date: '03-20-26',
    questions: [
      { id: 'qq4', text: 'What is quantitative data?', options: ['Word descriptions', 'Numerical measurements', 'Personal opinions', 'Visual only'], correctIndex: 1 },
      { id: 'qq5', text: 'Which graph shows change over time?', options: ['Pie chart', 'Bar graph', 'Line graph', 'Scatter plot'], correctIndex: 2 },
      { id: 'qq6', text: 'A valid conclusion is based on:', options: ['Opinion', 'Evidence', 'Single trial', 'Textbooks only'], correctIndex: 1 },
    ]},
  { id: 'q3', title: 'Activity 1 — Lab Report', description: 'Lab report activity', type: 'Mixed', week: 'Week 3', moduleId: 'm3', timeLimit: 30, attemptsAllowed: 1, shuffleQuestions: false, showAnswers: false, difficulty: 'Medium', published: true,  date: '03-15-26', questions: [] },
]

const mockStudents: StudentProgress[] = [
  {
    studentId: 's1', studentName: 'Penagrin, Aguiluz Emmanuelle O.', initials: 'FE',
    avatarGradient: 'from-brand-blue to-brand-violet',
    overallPercent: 95, activitiesCompleted: 12, activitiesTotal: 12, modulesInProgress: 1, lastActivity: '03-24-26', status: 'Complete',
    moduleProgress: [
      { moduleId: 'm1', moduleTitle: 'Module 1 — Scientific Method',    overallPercent: 100, lessonsCompleted: 4, lessonsTotal: 4, quizzesCompleted: 4, quizzesTotal: 4, status: 'Complete' },
      { moduleId: 'm2', moduleTitle: 'Module 2 — Variables & Hypotheses', overallPercent: 100, lessonsCompleted: 4, lessonsTotal: 4, quizzesCompleted: 4, quizzesTotal: 4, status: 'Complete' },
      { moduleId: 'm3', moduleTitle: 'Module 3 — Data Collection',       overallPercent: 40,  lessonsCompleted: 2, lessonsTotal: 4, quizzesCompleted: 0, quizzesTotal: 4, status: 'In Progress' },
    ],
    activityLog: [
      { id: 'a1', action: 'Completed Lesson', module: 'Module 1', details: 'Lesson 2', date: '03-24-26' },
      { id: 'a2', action: 'Submitted Quiz',   module: 'Module 1', details: 'Quiz 1 — Score: 9/10', date: '03-22-26' },
      { id: 'a3', action: 'Started Lesson',   module: 'Module 3', details: 'Lesson 1', date: '03-20-26' },
      { id: 'a4', action: 'Completed Activity', module: 'Module 2', details: 'Activity 1 — Lab Report', date: '03-18-26' },
    ],
  },
  {
    studentId: 's2', studentName: 'Nugajin, Rymuel', initials: 'NR',
    avatarGradient: 'from-cyan-500 to-cyan-700',
    overallPercent: 88, activitiesCompleted: 10, activitiesTotal: 12, modulesInProgress: 2, lastActivity: '03-22-26', status: 'In Progress',
    moduleProgress: [
      { moduleId: 'm1', moduleTitle: 'Module 1 — Scientific Method',      overallPercent: 100, lessonsCompleted: 4, lessonsTotal: 4, quizzesCompleted: 4, quizzesTotal: 4, status: 'Complete' },
      { moduleId: 'm2', moduleTitle: 'Module 2 — Variables & Hypotheses', overallPercent: 75,  lessonsCompleted: 3, lessonsTotal: 4, quizzesCompleted: 2, quizzesTotal: 4, status: 'In Progress' },
    ],
    activityLog: [
      { id: 'a5', action: 'Completed Quiz', module: 'Module 2', details: 'Quiz 2 — Score: 8/10', date: '03-22-26' },
    ],
  },
  {
    studentId: 's3', studentName: 'Dimaculangan, Dominhar', initials: 'DD',
    avatarGradient: 'from-amber-400 to-rose-500',
    overallPercent: 72, activitiesCompleted: 8, activitiesTotal: 12, modulesInProgress: 2, lastActivity: '03-20-26', status: 'In Progress',
    moduleProgress: [
      { moduleId: 'm1', moduleTitle: 'Module 1 — Scientific Method', overallPercent: 80, lessonsCompleted: 4, lessonsTotal: 4, quizzesCompleted: 2, quizzesTotal: 4, status: 'In Progress' },
    ],
    activityLog: [],
  },
  {
    studentId: 's4', studentName: 'Santos, Carla M.', initials: 'SC',
    avatarGradient: 'from-emerald-400 to-teal-500',
    overallPercent: 45, activitiesCompleted: 5, activitiesTotal: 12, modulesInProgress: 1, lastActivity: '03-15-26', status: 'Needs Help',
    moduleProgress: [
      { moduleId: 'm1', moduleTitle: 'Module 1 — Scientific Method', overallPercent: 45, lessonsCompleted: 2, lessonsTotal: 4, quizzesCompleted: 1, quizzesTotal: 4, status: 'In Progress' },
    ],
    activityLog: [],
  },
]

const mockPerformers: Performer[] = [
  { name: 'Penagrin, Aguiluz Emmanuelle O.', initials: 'FE', gradient: 'from-brand-blue to-brand-violet', assignments: 80, quiz: 183, activities: 80, total: 343, avg: '95%' },
  { name: 'Nugajin, Rymuel',                 initials: 'NR', gradient: 'from-cyan-500 to-cyan-700',       assignments: 80, quiz: 180, activities: 80, total: 340, avg: '92%' },
  { name: 'Dimaculangan, Dominhar',          initials: 'DD', gradient: 'from-amber-400 to-rose-500',      assignments: 80, quiz: 153, activities: 80, total: 313, avg: '84%' },
  { name: 'Santos, Carla M.',                initials: 'SC', gradient: 'from-emerald-400 to-teal-500',    assignments: 78, quiz: 170, activities: 75, total: 323, avg: '88%' },
]

const mockRecentActivities: RecentActivity[] = [
  { text: 'Penagrin submitted Quiz 2',  time: '2 min ago',  color: 'bg-brand-green' },
  { text: 'Module 3 published',         time: '1 hr ago',   color: 'bg-brand-blue' },
  { text: 'Santos missed Activity 4',   time: '3 hr ago',   color: 'bg-brand-amber' },
  { text: 'New student enrolled',       time: 'Yesterday',  color: 'bg-brand-violet' },
]

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAppStore = defineStore('app', () => {
  // State
  const modules     = ref<Module[]>(mockModules)
  const quizzes     = ref<Quiz[]>(mockQuizzes)
  const students    = ref<StudentProgress[]>(mockStudents)
  const performers  = ref<Performer[]>(mockPerformers)
  const recentActivities = ref<RecentActivity[]>(mockRecentActivities)
  const selectedStudentId = ref<string | null>(null)

  // Computed
  const publishedModules   = computed(() => modules.value.filter(m => m.status === 'Published'))
  const unpublishedModules = computed(() => modules.value.filter(m => m.status === 'Unpublished'))
  const publishedQuizzes   = computed(() => quizzes.value.filter(q => q.published))
  const passedStudents     = computed(() => students.value.filter(s => s.status === 'Complete' || s.overallPercent >= 75))
  const atRiskStudents     = computed(() => students.value.filter(s => s.status === 'Needs Help'))
  const selectedStudent    = computed(() => students.value.find(s => s.studentId === selectedStudentId.value) ?? null)

  // Actions
  function addModule(m: Omit<Module, 'id' | 'lastUpdated'>) {
    modules.value.unshift({ ...m, id: `m${Date.now()}`, lastUpdated: new Date().toLocaleDateString() })
  }
  function updateModule(id: string, updates: Partial<Module>) {
    const idx = modules.value.findIndex(m => m.id === id)
    if (idx !== -1) modules.value[idx] = { ...modules.value[idx], ...updates }
  }
  function deleteModule(id: string) {
    modules.value = modules.value.filter(m => m.id !== id)
  }
  function addQuiz(q: Omit<Quiz, 'id'>) {
    quizzes.value.unshift({ ...q, id: `q${Date.now()}` })
  }
  function selectStudent(id: string) {
    selectedStudentId.value = id
  }

  return {
    modules, quizzes, students, performers, recentActivities, selectedStudentId,
    publishedModules, unpublishedModules, publishedQuizzes,
    passedStudents, atRiskStudents, selectedStudent,
    addModule, updateModule, deleteModule, addQuiz, selectStudent,
  }
})
