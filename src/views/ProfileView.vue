<template>
  <main class="profile-page">
    <!-- HEADER -->
    <header class="topbar">
      <div class="profile-title">
        <p class="eyebrow">Mon compte</p>
        <h1>Profil</h1>
        <p class="subtitle">
          Mes informations personnelles
        </p>
      </div>

      <div class="profile-identity">
        <div class="avatar">
          {{ initial }}
        </div>

        <div class="identity">
          <h2>
            {{ firstName }} {{ lastName }}
          </h2>

          <p>
            {{
              role === 'admin'
                ? 'Administratrice'
                : 'Employée'
            }}
          </p>
        </div>
      </div>
    </header>

    <!-- INFORMATIONS -->
    <section class="info-card">
      <div class="info-row">
        <div>
          <span class="label">
            Adresse e-mail
          </span>

          <strong>
            {{ email }}
          </strong>
        </div>
      </div>

      <div class="info-row">
        <div>
          <span class="label">
            Taux horaire
          </span>

          <strong>
            {{ hourlyRate }} € / heure
          </strong>
        </div>
      </div>

      <div class="info-row">
        <div>
          <span class="label">
            Date d'arrivée
          </span>

          <strong>
            {{ formattedStartDate }}
          </strong>
        </div>
      </div>
    </section>

   <!-- PARAMÈTRES -->
<section class="settings-card">
  <button
    type="button"
    class="setting-row"
    :disabled="resettingPassword"
    @click="resetPassword"
  >
    <div>
      <strong>
        Modifier mon mot de passe
      </strong>

      <span>
        Sécurité du compte
      </span>
    </div>

    <span class="arrow">›</span>
  </button>

  <p
    v-if="passwordMessage"
    class="password-message"
    :class="{ error: passwordError }"
  >
    {{ passwordMessage }}
  </p>

  <button
    type="button"
    class="setting-row"
  >
    <div>
      <strong>
        Contacter ma responsable
      </strong>

      <span>
        Une question sur mes horaires
      </span>
    </div>

    <span class="arrow">›</span>
  </button>
</section>

    <!-- DÉCONNEXION -->
    <button
      type="button"
      class="logout-button"
      @click="logout"
    >
      Se déconnecter
    </button>

  <EmployeeBottomNav />
  </main>
</template>





<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
} from 'vue'

import EmployeeBottomNav from '../components/EmployeeBottomNav.vue'
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
const resettingPassword = ref(false)
const passwordMessage = ref('')
const passwordError = ref(false)

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

const resetPassword = async () => {
  passwordMessage.value = ''
  passwordError.value = false
  resettingPassword.value = true

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    passwordMessage.value =
      'Impossible de récupérer ton adresse e-mail.'

    passwordError.value = true
    resettingPassword.value = false
    return
  }

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      user.email,
      {
  redirectTo:
    'https://tempo-am.netlify.app/reset-password',
}
)

  resettingPassword.value = false

  if (error) {
  console.error('ERREUR RESET :', error)

  if (error.message.includes('rate limit')) {
    passwordMessage.value =
      'Un e-mail a déjà été envoyé récemment. Réessayez dans quelques minutes.'
  } else {
    passwordMessage.value =
      'Impossible d’envoyer le mail de réinitialisation.'
  }

  passwordError.value = true
  return
}

  passwordMessage.value =
  'Un lien de réinitialisation vient de vous être envoyé par e-mail.'
}

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
* {
  box-sizing: border-box;
}

/* PAGE */

.profile-page {
  min-height: 100vh;
  padding: 28px 20px 120px;

  background: #f7f1ec;
  color: #1d2c27;
}

/* LARGEUR GÉNÉRALE */

.topbar,
.info-card,
.settings-card,
.logout-button {
  width: 100%;
  max-width: 480px;

  margin-left: auto;
  margin-right: auto;
}

/* HEADER */

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 16px;

  margin-bottom: 28px;
}

.profile-title {
  min-width: 0;
}

.eyebrow {
  margin: 0 0 4px;

  font-size: 11px;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 1.2px;

  color: #9b8174;
}

.topbar h1 {
  margin: 0;

  font-size: 28px;
  line-height: 1.1;

  color: #17372f;
}

.subtitle {
  margin: 5px 0 0;

  font-size: 13px;
  line-height: 1.3;

  color: #7d7874;
}

/* IDENTITÉ À DROITE */

.profile-identity {
  flex-shrink: 0;

  display: flex;
  align-items: center;

  gap: 9px;

  padding: 8px 10px;

  border: 1px solid #ede5df;
  border-radius: 18px;

  background: #ffffff;
}

/* AVATAR */

.avatar {
  width: 42px;
  height: 42px;

  flex-shrink: 0;

  display: grid;
  place-items: center;

  border-radius: 50%;

  background: #17372f;
  color: #ffffff;

  font-size: 17px;
  font-weight: 700;
}

/* NOM + RÔLE */

.identity {
  min-width: 0;

  display: flex;
  flex-direction: column;

  gap: 2px;
}

.identity h2 {
  margin: 0;

  max-width: 100px;

  overflow: hidden;

  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;

  white-space: nowrap;
  text-overflow: ellipsis;

  color: #17372f;
}

.identity p {
  margin: 0;

  font-size: 10px;
  line-height: 1.2;

  color: #8b8581;
}

/* CARTE INFORMATIONS */

.info-card {
  margin-bottom: 16px;

  overflow: hidden;

  border: 1px solid #ede5df;
  border-radius: 24px;

  background: #ffffff;
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
  min-width: 0;

  display: flex;
  flex-direction: column;

  gap: 4px;
}

.label {
  font-size: 11px;

  color: #99918c;
}

.info-row strong {
  overflow-wrap: anywhere;

  font-size: 14px;
  font-weight: 700;

  color: #17372f;
}

/* PARAMÈTRES */

.settings-card {
  margin-bottom: 16px;

  overflow: hidden;

  border: 1px solid #ede5df;
  border-radius: 24px;

  background: #ffffff;
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

  background: #ffffff;

  font-family: inherit;
  text-align: left;

  cursor: pointer;
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-row > div {
  min-width: 0;

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
  line-height: 1.3;

  color: #99918c;
}

.arrow {
  flex-shrink: 0;

  font-size: 26px;
  line-height: 1;

  color: #a39a94;
}

/* DÉCONNEXION */

.logout-button {
  display: block;

  min-height: 54px;

  border: 1px solid #ddc9c2;
  border-radius: 17px;

  background: #f5e8e3;

  color: #a24d3d;

  font-family: inherit;
  font-size: 14px;
  font-weight: 700;

  cursor: pointer;
}

.logout-button:hover {
  background: #efddd6;
}

/* NAVIGATION DU BAS */

/* PETITS TÉLÉPHONES */

@media (max-width: 390px) {
  .profile-page {
    padding-left: 15px;
    padding-right: 15px;
  }

  .topbar {
    gap: 10px;
  }

  .topbar h1 {
    font-size: 26px;
  }

  .subtitle {
    max-width: 145px;

    font-size: 11px;
  }

  .profile-identity {
    gap: 7px;

    padding: 7px 8px;
  }

  .avatar {
    width: 38px;
    height: 38px;

    font-size: 15px;
  }

  .identity h2 {
    max-width: 82px;

    font-size: 11px;
  }

  .identity p {
    font-size: 9px;
  }

  .info-row {
    padding: 0 17px;
  }

  .setting-row {
    padding: 0 17px;
  }
}

/* TRÈS PETITS TÉLÉPHONES */

@media (max-width: 340px) {
  .profile-identity {
    padding: 6px;
  }

  .identity {
    display: none;
  }

  .subtitle {
    max-width: 130px;
  }
}

/* BOUTON MOT DE PASSE DÉSACTIVÉ */

.setting-row:disabled {
  opacity: 0.6;
  cursor: wait;
}

/* NOTIFICATION MOT DE PASSE */

.password-message {
  margin: 0;
  padding: 14px 20px;

  display: flex;
  align-items: center;

  border-top: 1px solid #e8e1dc;

  background: #f3f8f5;
  color: #31594c;

  font-size: 12px;
  line-height: 1.5;
  font-weight: 600;
}

.password-message::before {
  content: '✓';

  width: 20px;
  height: 20px;
  flex-shrink: 0;

  display: grid;
  place-items: center;

  margin-right: 8px;

  border-radius: 50%;

  background: #17372f;
  color: white;

  font-size: 11px;
  font-weight: 700;
}

.password-message.error {
  background: #f9e7e3;
  color: #a84f40;
}

.password-message.error::before {
  content: '!';
  background: #a84f40;
}

</style>