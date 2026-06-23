import { createRouter, createMemoryHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/teacher/class' },

  {
    path: '/teacher',
    component: () => import('@/components/layout/TeacherLayout.vue'),
    children: [
      { path: '',            redirect: '/teacher/dashboard' },
      { path: 'dashboard',   name: 'TeacherDashboard', component: () => import('@/pages/teacher/DashboardPage.vue') },
      { path: 'class',       name: 'ClassManagement',  component: () => import('@/pages/teacher/ClassManagementPage.vue') },
      { path: 'modules',     name: 'Modules',          component: () => import('@/pages/teacher/ModulesPage.vue') },
      { path: 'activities',  name: 'TeacherActivities', component: () => import('@/pages/teacher/ActivitiesPage.vue') },
      { path: 'quizzes',     name: 'Quizzes',          component: () => import('@/pages/teacher/QuizzesPage.vue') },
    ],
  },

  // Dashboard keeps the student sidebar layout
  {
    path: '/student',
    component: () => import('@/components/layout/StudentLayout.vue'),
    children: [
      { path: '',           redirect: '/student/dashboard' },
      { path: 'dashboard',  name: 'StudentDashboard', component: () => import('@/pages/student/DashboardPage.vue') },
      { path: 'activities', name: 'Activities',       component: () => import('@/pages/student/ActivitiesPage.vue') },
    ],
  },

  // Topic viewer renders full-screen, no sidebar — only its own Go Back button
  {
    path: '/student/topic',
    name: 'TopicViewer',
    component: () => import('@/pages/student/TopicViewerPage.vue'),
  },

  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
