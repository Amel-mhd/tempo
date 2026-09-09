<template>
  <main class="profile-page">
    <header class="topbar">
      <div>
        <p class="eyebrow">Mon compte</p>
        <h1>Profil</h1>
        <p class="subtitle">Mes informations personnelles</p>
      </div>
    </header>

    <div class="avatar">
  {{ initial }}
</div>
 
<div class="identity">
  <h2>{{ firstName }} {{ lastName }}</h2>
  <p>{{ role === 'admin' ? 'Administratrice' : 'Employée' }}</p>
</div>

    <section class="info-card">
      <div class="info-row">
        <div>
          <span class="label">Adresse e-mail</span>
          <strong>{{ email }}</strong>
        </div>
      </div>

      <div class="info-row">
        <div>
          <span class="label">Taux horaire</span>
          <strong> {{ hourlyRate }} € / heure</strong>
        </div>
      </div>

      <div class="info-row">
  <div>
    <span class="label">Date d'arrivée</span>
    <strong>{{ formattedStartDate }}</strong>
  </div>
</div>
    </section>

    <section class="settings-card">
      <button type="button" class="setting-row">
        <div>
          <strong>Modifier mon mot de passe</strong>
          <span>Sécurité du compte</span>
        </div>

        <span class="arrow">›</span>
      </button>

      <button type="button" class="setting-row">
        <div>
          <strong>Contacter ma responsable</strong>
          <span>Une question sur mes horaires</span>
        </div>

        <span class="arrow">›</span>
      </button>
    </section>

    <button
      type="button"
      class="logout-button"
      @click="logout"
    >
      Se déconnecter
    </button>

    <nav class="bottom-nav">
      <RouterLink to="/home" class="nav-item">
        <span>⌂</span>
        <small>Accueil</small>
      </RouterLink>

      <RouterLink to="/hours" class="nav-item">
        <span>◫</span>
        <small>Horaires</small>
      </RouterLink>

      <RouterLink to="/month" class="nav-item">
        <span>▦</span>
        <small>Mon mois</small>
      </RouterLink>

      <RouterLink to="/profile" class="nav-item active">
        <span>○</span>
        <small>Profil</small>
      </RouterLink>
    </nav>
  </main>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
} from 'vue'

import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const role = ref('')
const hourlyRate = ref(0)
const startDate = ref('')

const loading = ref(true)

const initial = computed(() => {
  if (!firstName.value) {
    return '?'
  }

  return firstName.value
    .charAt(0)
    .toUpperCase()
})

const formattedStartDate = computed(() => {
  if (!startDate.value) {
    return 'Non renseignée'
  }

  const date = new Date(
    `${startDate.value}T12:00:00`
  )

  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  ).format(date)
})

onMounted(async () => {
  loading.value = true

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    loading.value = false
    await router.push('/')
    return
  }

  email.value = user.email ?? ''

  const {
    data: profile,
    error,
  } = await supabase
    .from('profiles')
    .select(`
      first_name,
      last_name,
      role,
      hourly_rate,
      start_date
    `)
    .eq('id', user.id)
    .single()

  if (error) {
    console.error(
      'Erreur récupération profil :',
      error
    )

    loading.value = false
    return
  }

  firstName.value =
    profile.first_name ?? ''

  lastName.value =
    profile.last_name ?? ''

  role.value =
    profile.role ?? 'employee'

  hourlyRate.value =
    Number(
      profile.hourly_rate ?? 0
    )

  startDate.value =
    profile.start_date ?? ''

  loading.value = false
})

const logout = async () => {
  const { error } =
    await supabase.auth.signOut()

  if (error) {
    console.error(
      'Erreur déconnexion :',
      error
    )
    return
  }

  await router.push('/')
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f7f1ec;
  color: #1d2c27;
  padding: 28px 20px 120px;
}

.topbar,
.profile-card,
.info-card,
.settings-card,
.logout-button {
  width: 100%;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

.topbar {
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 4px;

  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.2px;

  color: #9b8174;
}

.topbar h1 {
  margin: 0;
  font-size: 28px;
  color: #17372f;
}

.subtitle {
  margin: 5px 0 0;

  font-size: 14px;
  color: #7d7874;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 16px;

  padding: 20px;
  margin-bottom: 16px;

  background: #e8ddd5;
  border-radius: 24px;
}

.avatar {
  width: 62px;
  height: 62px;
  flex-shrink: 0;

  display: grid;
  place-items: center;

  border-radius: 50%;

  background: #17372f;
  color: white;

  font-size: 22px;
  font-weight: 700;
}

.identity h2 {
  margin: 0;
  font-size: 20px;
  color: #17372f;
}

.identity p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #7d746f;
}

.info-card,
.settings-card {
  background: white;
  border: 1px solid #ede5df;
  border-radius: 24px;

  margin-bottom: 16px;

  overflow: hidden;
}

.info-row {
  min-height: 72px;

  display: flex;
  align-items: center;

  padding: 0 20px;

  border-bottom: 1px solid #f0ebe7;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 12px;
  color: #99918c;
}

.info-row strong {
  font-size: 14px;
  color: #17372f;
}

.setting-row {
  width: 100%;
  min-height: 76px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  padding: 0 20px;

  border: none;
  border-bottom: 1px solid #f0ebe7;

  background: white;

  text-align: left;

  cursor: pointer;
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-row div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-row strong {
  font-size: 14px;
  color: #17372f;
}

.setting-row div span {
  font-size: 12px;
  color: #99918c;
}

.arrow {
  font-size: 26px;
  color: #a39a94;
}

.logout-button {
  display: block;

  min-height: 54px;

  border: 1px solid #ddc9c2;
  border-radius: 17px;

  background: #f5e8e3;

  color: #a24d3d;

  font-size: 14px;
  font-weight: 700;

  cursor: pointer;
}

.logout-button:hover {
  background: #efddd6;
}

.bottom-nav {
  position: fixed;
  left: 50%;
  bottom: 16px;

  width: calc(100% - 30px);
  max-width: 460px;

  transform: translateX(-50%);

  display: grid;
  grid-template-columns: repeat(4, 1fr);

  padding: 8px;

  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #ebe4df;
  border-radius: 22px;
}

.nav-item {
  min-height: 54px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;

  border: none;
  border-radius: 15px;

  background: transparent;
  color: #8b8581;

  text-decoration: none;
  cursor: pointer;
}

.nav-item span {
  font-size: 20px;
}

.nav-item small {
  font-size: 11px;
}

.nav-item.active {
  background: #f2e9e3;
  color: #17372f;
}
</style>