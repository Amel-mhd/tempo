import {
  createRouter,
  createWebHistory,
} from 'vue-router'

import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import MonthView from '../views/MonthView.vue'
import HoursView from '../views/HoursView.vue'
import ProfileView from '../views/ProfileView.vue'

import AdminHomeView from '../views/AdminHomeView.vue'
import AdminTeamView from '../views/AdminTeamView.vue'
import AdminProfileView from '../views/AdminProfileView.vue'

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
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: {
        role: 'employee',
      },
    },

    {
      path: '/month',
      name: 'month',
      component: MonthView,
      meta: {
        role: 'employee',
      },
    },

    {
      path: '/hours',
      name: 'hours',
      component: HoursView,
      meta: {
        role: 'employee',
      },
    },

    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: {
        role: 'employee',
      },
    },

    {
      path: '/admin',
      name: 'admin',
      component: AdminHomeView,
      meta: {
        role: 'admin',
      },
    },
    {
  path: '/admin/profile',
  name: 'admin-profile',
  component: AdminProfileView,
  meta: {
    role: 'admin',
  },
},
{
  path: '/admin/equipe',
  name: 'admin-team',
  component: AdminTeamView,
  meta: { role: 'admin' },
},
  ],
})

router.beforeEach(async (to) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  /* -------------------------
     PAS CONNECTÉ
  ------------------------- */

  if (!session) {
    if (to.path !== '/') {
      return '/'
    }

    return true
  }

  /* -------------------------
     UTILISATEUR CONNECTÉ
  ------------------------- */

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

  /* -------------------------
     PAGE LOGIN
  ------------------------- */

  if (to.path === '/') {
    if (role === 'admin') {
      return '/admin'
    }

    return '/home'
  }

  /* -------------------------
     ADMIN
  ------------------------- */

  if (
    to.meta.role === 'admin' &&
    role !== 'admin'
  ) {
    return '/home'
  }

  /* -------------------------
     EMPLOYÉ
  ------------------------- */

  if (
    to.meta.role === 'employee' &&
    role === 'admin'
  ) {
    return '/admin'
  }

  return true
})

export default router