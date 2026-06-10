import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/teacher/dashboard' },

  {
    path: '/teacher',
    component: () => import('@/components/layout/TeacherLayout.vue'),
    children: [
      { path: '',             redirect: '/teacher/dashboard' },
      { path: 'dashboard',   name: 'TeacherDashboard',  component: () => import('@/pages/teacher/DashboardPage.vue') },
      { path: 'class',       name: 'ClassManagement',   component: () => import('@/pages/teacher/ClassManagementPage.vue') },
      { path: 'modules',     name: 'Modules',           component: () => import('@/pages/teacher/ModulesPage.vue') },
      { path: 'modules/new', name: 'UploadMaterial',    component: () => import('@/pages/teacher/UploadMaterialPage.vue') },
      { path: 'progress',    name: 'StudentProgress',   component: () => import('@/pages/teacher/StudentProgressPage.vue') },
      { path: 'progress/:id',name: 'StudentDetail',     component: () => import('@/pages/teacher/StudentDetailPage.vue') },
      { path: 'quizzes',     name: 'Quizzes',           component: () => import('@/pages/teacher/QuizzesPage.vue') },
      { path: 'quizzes/new', name: 'QuizCreator',       component: () => import('@/pages/teacher/QuizCreatorPage.vue') },
    ],
  },

  {
    path: '/student',
    component: () => import('@/components/layout/StudentLayout.vue'),
    children: [
      { path: '',          redirect: '/student/dashboard' },
      { path: 'dashboard', name: 'StudentDashboard', component: () => import('@/pages/student/DashboardPage.vue') },
      { path: 'topic',     name: 'TopicViewer',      component: () => import('@/pages/student/TopicViewerPage.vue') },
      { path: 'quiz',      name: 'QuizPage',         component: () => import('@/pages/student/QuizPage.vue') },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
