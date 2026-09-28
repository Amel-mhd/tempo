<template>
  <main class="profile-page">

    <section class="page-shell">

      <!-- HEADER -->
      <header class="profile-header">
        <p class="eyebrow">
          Administration
        </p>

        <h1>
          Mon profil
        </h1>

        <p class="subtitle">
          Gérez votre compte administrateur Tempo.
        </p>
      </header>

      <!-- PROFIL -->
      <section class="profile-card">

        <div class="avatar">
          {{ initial }}
        </div>

        <div class="identity">
          <h2>
            {{ fullName }}
          </h2>

          <span class="role-badge">
            Administratrice
          </span>
        </div>

        <div class="info-list">

          <article>
            <span>
              Prénom
            </span>

            <strong>
              {{ firstName || '—' }}
            </strong>
          </article>

          <article>
            <span>
              Nom
            </span>

            <strong>
              {{ lastName || '—' }}
            </strong>
          </article>

          <article class="full-info">
            <span>
              Adresse e-mail
            </span>

            <strong>
              {{ email || '—' }}
            </strong>
          </article>

          <article class="full-info">
            <span>
              Rôle
            </span>

            <strong>
              Administratrice
            </strong>
          </article>

        </div>

      </section>

      <!-- COMPTE -->
      <section class="settings-card">

        <div class="settings-title">
          <p class="eyebrow">
            Compte
          </p>

          <h2>
            Paramètres
          </h2>
        </div>

        <button
          type="button"
          class="setting-button"
          :disabled="sendingPasswordEmail"
          @click="changePassword"
        >
          <div>
            <strong>
              Modifier mon mot de passe
            </strong>

            <span>
              Recevoir un lien par e-mail
            </span>
          </div>

          <span class="arrow">
            ›
          </span>
        </button>

        <p
          v-if="successMessage"
          class="success-message"
        >
          {{ successMessage }}
        </p>

        <p
          v-if="errorMessage"
          class="error-message"
        >
          {{ errorMessage }}
        </p>

        <button
          type="button"
          class="logout-button"
          @click="logout"
        >
          Se déconnecter
        </button>

      </section>

    </section>

    <AdminBottomNav />

  </main>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import {
  supabase,
} from '../lib/supabase'

import AdminBottomNav
  from '../components/AdminBottomNav.vue'

const router =
  useRouter()

const firstName =
  ref('')

const lastName =
  ref('')

const email =
  ref('')

const sendingPasswordEmail =
  ref(false)

const successMessage =
  ref('')

const errorMessage =
  ref('')

/* =========================
   NOM COMPLET
========================= */

const fullName =
  computed(() => {

    const value =
      `${firstName.value} ${lastName.value}`
        .trim()

    return (
      value ||
      'Administratrice Tempo'
    )
  })

/* =========================
   INITIALE
========================= */

const initial =
  computed(() => {

    return (
      firstName.value ||
      email.value ||
      'A'
    )
      .charAt(0)
      .toUpperCase()
  })

/* =========================
   CHARGEMENT DU PROFIL
========================= */

onMounted(
  async () => {

    const {
      data: {
        user,
      },
    } =
      await supabase.auth
        .getUser()

    if (!user) {
      await router.push('/')
      return
    }

    email.value =
      user.email ?? ''

    const {
      data: profile,
      error,
    } =
      await supabase
        .from('profiles')
        .select(`
          first_name,
          last_name,
          role
        `)
        .eq(
          'id',
          user.id
        )
        .single()

    if (
      error ||
      !profile ||
      profile.role !== 'admin'
    ) {
      await router.push('/home')
      return
    }

    firstName.value =
      profile.first_name ?? ''

    lastName.value =
      profile.last_name ?? ''
  }
)

/* =========================
   MOT DE PASSE
========================= */

const changePassword =
  async () => {

    if (
      !email.value ||
      sendingPasswordEmail.value
    ) {
      return
    }

    sendingPasswordEmail.value =
      true

    successMessage.value =
      ''

    errorMessage.value =
      ''

    const {
      error,
    } =
      await supabase.auth
        .resetPasswordForEmail(
          email.value,
          {
            redirectTo:
              `${window.location.origin}/reset-password`,
          }
        )

    if (error) {

      console.error(
        'Erreur mot de passe :',
        error
      )

      errorMessage.value =
        'Impossible d’envoyer l’e-mail pour le moment.'

      sendingPasswordEmail.value =
        false

      return
    }

    successMessage.value =
      'Un e-mail de réinitialisation vient de vous être envoyé.'

    sendingPasswordEmail.value =
      false
  }

/* =========================
   DÉCONNEXION
========================= */

const logout =
  async () => {

    await supabase.auth
      .signOut()

    await router.push('/')
  }
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.profile-page {
  min-height: 100vh;

  padding:
    28px
    18px
    120px;

  background:
    #f7f1ec;

  color:
    #17372f;
}

.page-shell {
  width: 100%;
  max-width: 520px;

  margin:
    0 auto;
}

/* HEADER */

.profile-header {
  margin-bottom: 22px;
}

.eyebrow {
  margin:
    0
    0
    4px;

  color:
    #9b8174;

  font-size:
    10px;

  font-weight:
    700;

  letter-spacing:
    1.2px;

  text-transform:
    uppercase;
}

.profile-header h1 {
  margin: 0;

  color:
    #17372f;

  font-family:
    Georgia,
    'Times New Roman',
    serif;

  font-size:
    28px;

  font-weight:
    400;
}

.subtitle {
  margin:
    5px
    0
    0;

  color:
    #7d7874;

  font-size:
    12px;
}

/* CARDS */

.profile-card,
.settings-card {
  padding: 20px;

  margin-bottom: 16px;

  border:
    1px solid
    #ede5df;

  border-radius:
    24px;

  background:
    #fff;
}

/* AVATAR */

.avatar {
  width: 72px;
  height: 72px;

  margin:
    0 auto
    12px;

  display: grid;

  place-items:
    center;

  border-radius:
    50%;

  background:
    #17372f;

  color:
    #fff;

  font-size:
    27px;

  font-weight:
    800;
}

/* IDENTITÉ */

.identity {
  margin-bottom: 21px;

  text-align:
    center;
}

.identity h2 {
  margin:
    0
    0
    7px;

  color:
    #17372f;

  font-size:
    21px;
}

.role-badge {
  display:
    inline-block;

  padding:
    5px
    9px;

  border-radius:
    999px;

  background:
    #edf2ef;

  color:
    #456258;

  font-size:
    9px;

  font-weight:
    700;
}

/* INFORMATIONS */

.info-list {
  display:
    grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap:
    9px;
}

.info-list article {
  min-width: 0;

  padding:
    13px
    14px;

  border-radius:
    14px;

  background:
    #f7f1ec;
}

.info-list .full-info {
  grid-column:
    1 / -1;
}

.info-list span {
  display:
    block;

  margin-bottom:
    4px;

  color:
    #8c8580;

  font-size:
    9px;
}

.info-list strong {
  display:
    block;

  overflow-wrap:
    anywhere;

  color:
    #17372f;

  font-size:
    12px;
}

/* PARAMÈTRES */

.settings-title {
  margin-bottom:
    12px;
}

.settings-title h2 {
  margin: 0;

  color:
    #17372f;

  font-size:
    19px;
}

.setting-button,
.logout-button {
  width:
    100%;

  border-radius:
    14px;

  font:
    inherit;

  cursor:
    pointer;
}

.setting-button {
  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    15px;

  padding:
    14px;

  border:
    1px solid
    #e5dbd4;

  background:
    #f7f1ec;

  color:
    #17372f;

  text-align:
    left;
}

.setting-button > div {
  display:
    flex;

  flex-direction:
    column;

  gap:
    3px;
}

.setting-button strong {
  font-size:
    11px;
}

.setting-button div span {
  color:
    #8c8580;

  font-size:
    9px;
}

.setting-button .arrow {
  color:
    #17372f;

  font-size:
    23px;
}

.setting-button:disabled {
  opacity:
    0.6;

  cursor:
    not-allowed;
}

/* MESSAGES */

.success-message,
.error-message {
  margin:
    10px
    0
    0;

  padding:
    10px
    12px;

  border-radius:
    12px;

  font-size:
    10px;

  line-height:
    1.4;
}

.success-message {
  background:
    #e4efe8;

  color:
    #315b49;
}

.error-message {
  background:
    #f8e4df;

  color:
    #a54e3b;
}

/* DÉCONNEXION */

.logout-button {
  margin-top:
    14px;

  padding:
    14px;

  border:
    0;

  background:
    #c66b50;

  color:
    #fff;

  font-weight:
    700;
}

/* MOBILE */

@media (
  max-width: 600px
) {

  .profile-page {
    padding:
      24px
      15px
      115px;
  }

  .profile-header h1 {
    font-size:
      24px;
  }
}
</style>