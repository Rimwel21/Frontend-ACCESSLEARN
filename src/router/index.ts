import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Landing', component: () => import('@/pages/LandingPage.vue') },
  { path: '/portal', name: 'Portal', component: () => import('@/pages/auth/PortalPage.vue') },
  { path: '/login', name: 'Login', component: () => import('@/pages/auth/AuthPage.vue') },
  { path: '/register', name: 'Register', component: () => import('@/pages/auth/AuthPage.vue') },
  { path: '/profile/setup', name: 'ProfileSetup', component: () => import('@/pages/auth/ProfileSetupPage.vue'), meta: { requiresAuth: true } },
  { path: '/forbidden', name: 'Forbidden', component: () => import('@/pages/auth/ForbiddenPage.vue') },

  {
    path: '/teacher',
    component: () => import('@/components/layout/TeacherLayout.vue'),
    meta: { requiresAuth: true, role: 'teacher' },
    children: [
      { path: '', redirect: '/teacher/dashboard' },
      { path: 'dashboard', name: 'TeacherDashboard', component: () => import('@/pages/teacher/DashboardPage.vue') },
      { path: 'class', name: 'ClassManagement', component: () => import('@/pages/teacher/ClassManagementPage.vue') },
      { path: 'modules', name: 'Modules', component: () => import('@/pages/teacher/ModulesPage.vue') },
      { path: 'modules/:moduleId/preview', name: 'ModulePreview', component: () => import('@/pages/teacher/ModulePreviewPage.vue') },
      { path: 'activities', name: 'TeacherActivities', component: () => import('@/pages/teacher/ActivitiesPage.vue') },
      { path: 'quizzes', name: 'Quizzes', component: () => import('@/pages/teacher/QuizzesPage.vue') },
    ],
  },

  {
    path: '/student',
    component: () => import('@/components/layout/StudentLayout.vue'),
    meta: { requiresAuth: true, role: 'student' },
    children: [
      { path: '', redirect: '/student/dashboard' },
      { path: 'dashboard', name: 'StudentDashboard', component: () => import('@/pages/student/DashboardPage.vue') },
      { path: 'quiz', name: 'StudentQuiz', component: () => import('@/pages/student/QuizPage.vue') },
      { path: 'activities', name: 'Activities', component: () => import('@/pages/student/ActivitiesPage.vue') },
      { path: 'activities/handsign', name: 'HandSignLanguage', component: () => import('@/pages/student/HandSignLanguagePage.vue') },
    ],
  },

  {
    path: '/admin',
    component: () => import('@/components/layout/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'AdminDashboard', component: () => import('@/pages/admin/DashboardPage.vue') },
      { path: 'accounts', name: 'AccountManagement', component: () => import('@/pages/admin/AccountManagementPage.vue') },
      { path: 'teachers', name: 'TeacherManagement', component: () => import('@/pages/admin/TeacherManagementPage.vue') },
      { path: 'students', name: 'StudentManagement', component: () => import('@/pages/admin/StudentManagementPage.vue') },
      { path: 'sections', name: 'SectionManagement', component: () => import('@/pages/admin/SectionManagementPage.vue') },
      { path: 'archive', name: 'AdminArchive', component: () => import('@/pages/admin/ArchivePage.vue') },
      { path: 'audit-logs', name: 'AuditLogs', component: () => import('@/pages/admin/AuditLogPage.vue') },
      { path: 'reports', name: 'AdminReports', component: () => import('@/pages/admin/ReportPage.vue') },
      { path: 'notifications', name: 'AdminNotifications', component: () => import('@/pages/admin/NotificationPage.vue') },
      { path: 'monitoring', name: 'SystemMonitoring', component: () => import('@/pages/admin/SystemMonitoringPage.vue') },
    ],
  },

  {
    path: '/student/modules/:moduleId',
    name: 'TopicViewer',
    component: () => import('@/pages/student/TopicViewerPage.vue'),
    meta: { requiresAuth: true, role: 'student' },
  },

  { path: '/admin/login', name: 'AdminLogin', component: () => import('@/pages/admin/AdminLoginPage.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

const roleRedirects: Record<string, string> = {
  admin: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
}

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: '/forbidden' }
  }

  if (to.meta.role && auth.role && to.meta.role !== auth.role) {
    return { path: roleRedirects[auth.role] || '/' }
  }

  if ((to.name === 'Login' || to.name === 'Register' || to.name === 'Landing') && auth.isAuthenticated) {
    return true
  }

  return true
})
