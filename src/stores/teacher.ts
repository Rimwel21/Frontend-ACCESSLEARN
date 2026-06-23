import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Module {
  id: string
  title: string
  description: string
  status: 'Published' | 'Unpublished'
  lastUpdated: string
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
  status: 'Complete' | 'In Progress' | 'Needs Help'
  lastActivity: string
}

interface Quiz {
  id: string
  title: string
  module: string
  type: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  date: string
}

interface Activity {
  id: string
  title: string
  description: string
  module: string
  dueDate: string
  dueTime: string
  status: 'Not Started' | 'In Progress' | 'Overdue' | 'Finished'
}

interface ClassInfo {
  id: string
  gradeLevel: string
  section: string
  studentCount: number
  createdAt: string
}

export const useTeacherStore = defineStore('teacher', () => {
  const teacherName = ref('Ms. Rymuel')

  const modules = ref<Module[]>([
    { id: 'm1', title: 'Module 1 — Scientific Method',     description: 'Introduction to scientific processes, hypothesis, and variables.',  status: 'Published',   lastUpdated: '03-24-2025' },
    { id: 'm2', title: 'Module 2 — Variables & Hypotheses', description: 'Deeper look at independent, dependent, and controlled variables.',  status: 'Published',   lastUpdated: '03-24-2025' },
    { id: 'm3', title: 'Module 3 — Data Collection',        description: 'Methods of collecting qualitative and quantitative data.',          status: 'Published',   lastUpdated: '03-24-2025' },
    { id: 'm4', title: 'Module 4 — Data Analysis',          description: 'Statistical analysis and graph interpretation techniques.',         status: 'Published',   lastUpdated: '03-24-2025' },
    { id: 'm5', title: 'Module 5 — Conclusions',            description: 'Drawing evidence-based conclusions and scientific reporting.',       status: 'Published',   lastUpdated: '03-24-2025' },
    { id: 'm6', title: 'Module 6 — Peer Review',            description: 'Understanding the peer review process in scientific research.',     status: 'Unpublished', lastUpdated: '03-24-2025' },
    { id: 'm7', title: 'Module 7 — Lab Safety',             description: 'Laboratory safety rules and equipment identification.',              status: 'Unpublished', lastUpdated: '03-24-2025' },
    { id: 'm8', title: 'Module 8 — Final Review',           description: 'Comprehensive review of all topics covered in the course.',         status: 'Published',   lastUpdated: '03-24-2025' },
  ])

  const performers = ref<Performer[]>([
    { name: 'Penagrin, Aguiluz Emmanuelle O.', initials: 'FE', gradient: 'from-brand-blue to-brand-violet', assignments: 80, quiz: 183, activities: 80, total: 343, avg: '95%' },
    { name: 'Nugajin, Rymuel',                 initials: 'NR', gradient: 'from-cyan-500 to-cyan-700',       assignments: 80, quiz: 180, activities: 80, total: 340, avg: '92%' },
    { name: 'Dimaculangan, Dominhar',          initials: 'DD', gradient: 'from-amber-400 to-rose-500',      assignments: 80, quiz: 153, activities: 80, total: 313, avg: '84%' },
    { name: 'Santos, Carla M.',                initials: 'SC', gradient: 'from-emerald-400 to-teal-500',    assignments: 78, quiz: 170, activities: 75, total: 323, avg: '88%' },
  ])

  const recentActivities = ref<RecentActivity[]>([
    { text: 'Penagrin submitted Quiz 2', time: '2 min ago',  color: 'bg-brand-green' },
    { text: 'Module 3 published',        time: '1 hr ago',   color: 'bg-brand-blue' },
    { text: 'Santos missed Activity 4',  time: '3 hr ago',   color: 'bg-brand-amber' },
    { text: 'New student enrolled',      time: 'Yesterday',  color: 'bg-brand-violet' },
  ])

  const students = ref<StudentRow[]>([
    { studentId: 's1', studentName: 'Penagrin, Aguiluz Emmanuelle O.', initials: 'FE', avatarGradient: 'from-brand-blue to-brand-violet', overallPercent: 95, activitiesCompleted: 12, activitiesTotal: 12, status: 'Complete',    lastActivity: '03-24-26' },
    { studentId: 's2', studentName: 'Nugajin, Rymuel',                 initials: 'NR', avatarGradient: 'from-cyan-500 to-cyan-700',       overallPercent: 88, activitiesCompleted: 10, activitiesTotal: 12, status: 'In Progress', lastActivity: '03-22-26' },
    { studentId: 's3', studentName: 'Dimaculangan, Dominhar',          initials: 'DD', avatarGradient: 'from-amber-400 to-rose-500',      overallPercent: 72, activitiesCompleted: 8,  activitiesTotal: 12, status: 'In Progress', lastActivity: '03-20-26' },
    { studentId: 's4', studentName: 'Santos, Carla M.',                initials: 'SC', avatarGradient: 'from-emerald-400 to-teal-500',    overallPercent: 45, activitiesCompleted: 5,  activitiesTotal: 12, status: 'Needs Help',  lastActivity: '03-15-26' },
  ])

  const quizzes = ref<Quiz[]>([
    { id: 'q1', title: 'Quiz 1 — Scientific Method', module: 'Module 1', type: 'Multiple Choice', difficulty: 'Easy',   date: '03-24-26' },
    { id: 'q2', title: 'Quiz 2 — Variables',         module: 'Module 2', type: 'Multiple Choice', difficulty: 'Medium', date: '03-20-26' },
    { id: 'q3', title: 'Activity 1 — Lab Report',    module: 'Module 3', type: 'Mixed',            difficulty: 'Medium', date: '03-15-26' },
  ])

  const activities = ref<Activity[]>([
    { id: 'a1', title: 'Lab Report — Acids & Bases', description: 'Document your observations from the acid-base titration experiment.', module: 'Module 3', dueDate: '05-10-2026', dueTime: '1:00 PM', status: 'Overdue' },
    { id: 'a2', title: 'Group Presentation',         description: 'Prepare a 5-minute presentation summarizing your group\'s findings.',  module: 'Module 2', dueDate: '05-20-2026', dueTime: '1:59 PM', status: 'In Progress' },
    { id: 'a3', title: 'Peer Review Worksheet',       description: 'Review a classmate\'s hypothesis and provide written feedback.',       module: 'Module 6', dueDate: '05-20-2026', dueTime: '1:59 PM', status: 'Not Started' },
    { id: 'a4', title: 'Data Analysis Exercise',      description: 'Analyze the provided dataset and create two charts.',                  module: 'Module 4', dueDate: '05-20-2026', dueTime: '1:59 PM', status: 'Finished' },
  ])

  // ── Classes ──────────────────────────────────────────────
  // Starts empty — teacher must create a class before Modules/Activities/Quizzes show data
  const classes = ref<ClassInfo[]>([])
  const selectedClassId = ref<string | null>(null)

  const selectedClass = computed(() =>
    classes.value.find(c => c.id === selectedClassId.value) ?? null
  )
  const hasClasses = computed(() => classes.value.length > 0)

  function addClass(gradeLevel: string, section: string) {
    const newClass: ClassInfo = {
      id: `c${Date.now()}`,
      gradeLevel,
      section,
      studentCount: 0,
      createdAt: new Date().toLocaleDateString(),
    }
    classes.value.push(newClass)
    selectedClassId.value = newClass.id
    return newClass
  }
  function selectClass(id: string) {
    selectedClassId.value = id
  }
  function deleteClass(id: string) {
    classes.value = classes.value.filter(c => c.id !== id)
    if (selectedClassId.value === id) selectedClassId.value = null
  }

  const publishedModules   = computed(() => modules.value.filter(m => m.status === 'Published'))
  const unpublishedModules = computed(() => modules.value.filter(m => m.status === 'Unpublished'))
  const atRiskStudents     = computed(() => students.value.filter(s => s.status === 'Needs Help'))

  function addModule(m: Omit<Module, 'id' | 'lastUpdated'>) {
    modules.value.unshift({ ...m, id: `m${Date.now()}`, lastUpdated: new Date().toLocaleDateString() })
  }
  function deleteModule(id: string) {
    modules.value = modules.value.filter(m => m.id !== id)
  }

  function addActivity(a: Omit<Activity, 'id'>) {
    activities.value.unshift({ ...a, id: `a${Date.now()}` })
  }
  function updateActivity(id: string, updates: Partial<Activity>) {
    const idx = activities.value.findIndex(a => a.id === id)
    if (idx !== -1) activities.value[idx] = { ...activities.value[idx], ...updates }
  }
  function deleteActivity(id: string) {
    activities.value = activities.value.filter(a => a.id !== id)
  }

  return {
    teacherName, modules, performers, recentActivities, students, quizzes, activities,
    classes, selectedClassId, selectedClass, hasClasses,
    publishedModules, unpublishedModules, atRiskStudents,
    addModule, deleteModule, addActivity, updateActivity, deleteActivity,
    addClass, selectClass, deleteClass,
  }
})
