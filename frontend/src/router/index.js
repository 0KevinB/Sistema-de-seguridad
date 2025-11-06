import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/registro',
    name: 'Registro',
    component: () => import('../views/Registro.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/validar-cuenta',
    name: 'ValidarCuenta',
    component: () => import('../views/ValidarCuenta.vue')
  },
  {
    path: '/mfa',
    name: 'MFA',
    component: () => import('../views/MFA.vue')
  },
  {
    path: '/recuperar',
    name: 'Recuperar',
    component: () => import('../views/Recuperar.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: () => import('../views/ResetPassword.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: () => import('../views/Perfil.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/configurar-mfa',
    name: 'ConfigurarMFA',
    component: () => import('../views/ConfigurarMFA.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'auditoria',
        name: 'Auditoria',
        component: () => import('../views/admin/Auditoria.vue')
      },
      {
        path: 'sesiones',
        name: 'Sesiones',
        component: () => import('../views/admin/Sesiones.vue')
      },
      {
        path: 'estadisticas',
        name: 'Estadisticas',
        component: () => import('../views/admin/Estadisticas.vue')
      },
      {
        path: 'usuarios',
        name: 'Usuarios',
        component: () => import('../views/admin/Usuarios.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
