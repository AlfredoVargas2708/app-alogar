import AdminView from '@/views/AdminView.vue'
import Home from '@/views/HomeView.vue'
import Login from '@/views/LoginView.vue'
import { useUserStore, type UserRole } from '@/stores/userStore'
import { createRouter, createWebHistory } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    role?: UserRole
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '',
      redirect: '/login',
    },
    {
      path: '/login',
      component: Login,
    },
    {
      path: '/home',
      component: Home,
      meta: { role: 'empleado' },
    },
    {
      path: '/admin',
      component: AdminView,
      meta: { role: 'admin' },
    },
  ],
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  const requiredRole = to.meta.role

  if (!requiredRole) {
    return true
  }

  if (!userStore.userData) {
    return { path: '/login' }
  }

  const userRole = userStore.userData.role ?? userStore.userData.user_role

  if (!userRole) {
    return { path: '/login' }
  }

  // Solo la vista de administración exige rol admin;
  // un admin también puede acceder al punto de venta (/home)
  if (requiredRole === 'admin' && userRole !== 'admin') {
    return { path: '/home' }
  }

  return true
})

export default router
