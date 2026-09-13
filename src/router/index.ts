import {
  createRouter,
  createWebHistory,
} from 'vue-router'

import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'

import HomeView from '../views/HomeView.vue'
import MonthView from '../views/MonthView.vue'
import HoursView from '../views/HoursView.vue'
import ProfileView from '../views/ProfileView.vue'

import AdminHomeView from '../views/AdminHomeView.vue'
import AdminTeamView from '../views/AdminTeamView.vue'
import AdminProfileView from '../views/AdminProfileView.vue'
import AdminHoursView from '../views/AdminHoursView.vue'

import { supabase } from '../lib/supabase'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },

    {
      path: '/signup',
      name: 'signup',
      component: SignupView,
    },

    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
    },

    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { role: 'employee' },
    },

    {
      path: '/month',
      name: 'month',
      component: MonthView,
      meta: { role: 'employee' },
    },

    {
      path: '/hours',
      name: 'hours',
      component: HoursView,
      meta: { role: 'employee' },
    },

    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { role: 'employee' },
    },

    {
      path: '/admin',
      name: 'admin',
      component: AdminHomeView,
      meta: { role: 'admin' },
    },
    {
  path: '/admin/heures',
  name: 'admin-hours',
  component: AdminHoursView,
  meta: { role: 'admin' },
},
    {
      path: '/admin/equipe',
      name: 'admin-team',
      component: AdminTeamView,
      meta: { role: 'admin' },
    },

    {
      path: '/admin/profile',
      name: 'admin-profile',
      component: AdminProfileView,
      meta: { role: 'admin' },
    },
  ],
})

router.beforeEach(async (to) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    const publicRoutes = [
      '/',
      '/signup',
      '/reset-password',
    ]

    if (!publicRoutes.includes(to.path)) {
      return '/'
    }

    return true
  }

  const user = session.user

  const {
    data: profile,
    error,
  } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    console.error(
      'Impossible de récupérer le rôle :',
      error
    )

    await supabase.auth.signOut()
    return '/'
  }

  const role = profile.role

  // On laisse toujours passer la page de réinitialisation
  if (to.path === '/reset-password') {
    return true
  }

  if (to.path === '/') {
    if (role === 'admin') {
      return '/admin'
    }

    return '/home'
  }

  if (
    to.meta.role === 'admin' &&
    role !== 'admin'
  ) {
    return '/home'
  }

  if (
    to.meta.role === 'employee' &&
    role === 'admin'
  ) {
    return '/admin'
  }

  return true
})

export default router