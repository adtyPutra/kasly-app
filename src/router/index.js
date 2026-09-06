import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from '../stores/auth.js'

import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import ReportsView from '../views/ReportsView.vue'
import ActivitiesView from '../views/ActivitiesView.vue'
import UsersView from '../views/UsersView.vue'
import KasPembayaranView from '../views/KasPembayaranView.vue'
import AnggotaView from '../views/AnggotaView.vue'

const routes = [
  { path: '/login', component: LoginView, meta: { public: true } },

  // Shared (Admin + Bendahara)
  { path: '/', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/members', component: AnggotaView, meta: { requiresAuth: true } },
  { path: '/reports', component: ReportsView, meta: { requiresAuth: true } },

  // Bendahara only
  { path: '/kas', component: KasPembayaranView, meta: { requiresAuth: true, requiresBendahara: true } },
  { path: '/keuangan', component: () => import('../views/KeuanganView.vue'), meta: { requiresAuth: true, requiresBendahara: true } },
  { path: '/activities', component: ActivitiesView, meta: { requiresAuth: true, requiresBendahara: true } },

  // Admin only
  { path: '/users', component: UsersView, meta: { requiresAuth: true, requiresAdmin: true } },

  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const user = getCurrentUser()
  if (to.meta.requiresAuth && !user) {
    next('/login')
  } else if (to.meta.requiresAdmin && user?.role !== 'admin') {
    next('/')
  } else if (to.meta.requiresBendahara && user?.role !== 'bendahara' && user?.role !== 'admin') {
    next('/')
  } else if (to.path === '/login' && user) {
    next('/')
  } else {
    next()
  }
})

export default router
