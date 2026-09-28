<template>
  <main class="profile-page">

    <!-- HEADER -->
    <header class="topbar">

      <div class="profile-title">
        <p class="eyebrow">
          Mon compte
        </p>

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
            Employée
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

      <div
        v-if="phone"
        class="info-row"
      >
        <div>
          <span class="label">
            Téléphone
          </span>

          <strong>
            {{ phone }}
          </strong>
        </div>
      </div>

    </section>

    <!-- AFFECTATIONS -->
    <section class="assignments-section">

      <div class="section-title">

        <div>
          <p class="eyebrow">
            Travail
          </p>

          <h2>
            Mes affectations
          </h2>
        </div>

        <span
          v-if="assignments.length"
          class="assignment-count"
        >
          {{ assignments.length }}
        </span>

      </div>

      <!-- CHARGEMENT -->
      <div
        v-if="loading"
        class="empty-card"
      >
        Chargement...
      </div>

      <!-- AUCUNE -->
      <div
        v-else-if="assignments.length === 0"
        class="empty-card"
      >
        <div class="empty-icon">
          —
        </div>

        <strong>
          Aucune affectation
        </strong>

        <p>
          Aucun poste ne t'a encore été attribué.
        </p>
      </div>

      <!-- LISTE -->
      <div
        v-else
        class="assignment-list"
      >

        <article
          v-for="assignment in assignments"
          :key="assignment.post.id"
          class="assignment-card"
        >

          <div class="assignment-top">

            <div>

              <span
                class="service-badge"
                :class="assignment.post.service_type"
              >
                {{
                  serviceLabel(
                    assignment.post.service_type
                  )
                }}
              </span>

              <h3>
                {{ assignment.post.site_name }}
              </h3>

            </div>

            <strong class="rate">
              {{
                formatMoney(
                  effectiveRate(assignment)
                )
              }}
            </strong>

          </div>

          <div class="assignment-bottom">

            <!-- SÉCURITÉ -->
            <template
              v-if="
                assignment.post.service_type ===
                'security'
              "
            >
              <div class="vacation-info">
                <span>☀️ Midi</span>
                <strong>11h45</strong>
              </div>

              <div class="separator"></div>

              <div class="vacation-info">
                <span>🌙 Soir</span>
                <strong>18h45</strong>
              </div>
            </template>

            <!-- MÉNAGE -->
            <template v-else>
              <div class="cleaning-info">
                <span>✨</span>

                <div>
                  <strong>
                    Vacation ménage
                  </strong>

                  <small>
                    1 vacation par jour
                  </small>
                </div>
              </div>
            </template>

          </div>

        </article>

      </div>

    </section>

    <!-- PARAMÈTRES -->
    <section class="settings-section">

      <div class="section-title">
        <div>
          <p class="eyebrow">
            Compte
          </p>

          <h2>
            Paramètres
          </h2>
        </div>
      </div>

      <div class="settings-card">

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

          <span class="arrow">
            ›
          </span>

        </button>

        <p
          v-if="passwordMessage"
          class="password-message"
          :class="{
            error: passwordError
          }"
        >
          {{ passwordMessage }}
        </p>

      </div>

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
  computed,
  onMounted,
  ref,
} from 'vue'

import {
  useRouter,
} from 'vue-router'

import EmployeeBottomNav
  from '../components/EmployeeBottomNav.vue'

import {
  supabase,
} from '../lib/supabase'

type ServiceType =
  | 'security'
  | 'cleaning'

interface Post {
  id: string

  service_type:
    ServiceType

  site_name: string

  base_rate: number
}

interface Assignment {
  post_id: string

  custom_rate:
    number | null

  post: Post
}

const router =
  useRouter()

const firstName =
  ref('')

const lastName =
  ref('')

const email =
  ref('')

const phone =
  ref('')

const assignments =
  ref<Assignment[]>([])

const loading =
  ref(true)

const resettingPassword =
  ref(false)

const passwordMessage =
  ref('')

const passwordError =
  ref(false)

/* =========================
   INITIAL
========================= */

const initial =
  computed(() => {

    if (!firstName.value) {
      return '?'
    }

    return firstName.value
      .charAt(0)
      .toUpperCase()
  })

/* =========================
   TARIFS
========================= */

const effectiveRate = (
  assignment: Assignment
) => {

  return (
    assignment.custom_rate ??
    assignment.post.base_rate
  )
}

const formatMoney = (
  value: number
) => {

  return (
    Number(value)
      .toFixed(2)
      .replace('.', ',') +
    ' €'
  )
}

const serviceLabel = (
  service: ServiceType
) => {

  return service ===
    'security'
      ? 'Sécurité'
      : 'Ménage'
}

/* =========================
   CHARGEMENT
========================= */

const loadProfile =
  async () => {

    loading.value = true

    const {
      data: { user },
    } =
      await supabase.auth.getUser()

    if (!user) {
      loading.value = false

      await router.push('/')

      return
    }

    email.value =
      user.email ?? ''

    /*
      Profil général
    */

    const {
      data: profile,
      error: profileError,
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
      profileError ||
      !profile
    ) {
      console.error(
        'Erreur profil :',
        profileError
      )

      loading.value = false
      return
    }

    firstName.value =
      profile.first_name ?? ''

    lastName.value =
      profile.last_name ?? ''

    /*
      Fiche employé
    */

    const {
      data: employee,
      error: employeeError,
    } =
      await supabase
        .from('employees')
        .select(`
          id,
          first_name,
          last_name,
          phone
        `)
        .eq(
          'auth_user_id',
          user.id
        )
        .maybeSingle()

    if (employeeError) {
      console.error(
        'Erreur employé :',
        employeeError
      )

      loading.value = false
      return
    }

    if (!employee) {
      assignments.value = []

      loading.value = false
      return
    }

    /*
      On préfère les infos
      de la fiche employé.
    */

    firstName.value =
      employee.first_name ??
      firstName.value

    lastName.value =
      employee.last_name ??
      lastName.value

    phone.value =
      employee.phone ?? ''

    /*
      Affectations de l'employé
    */

    const {
      data: links,
      error: linksError,
    } =
      await supabase
        .from('employee_posts')
        .select(`
          post_id,
          custom_rate
        `)
        .eq(
          'employee_id',
          employee.id
        )
        .eq(
          'active',
          true
        )

    if (linksError) {
      console.error(
        'Erreur affectations :',
        linksError
      )

      loading.value = false
      return
    }

    const postIds =
      (links ?? []).map(
        (link) =>
          link.post_id
      )

    if (
      postIds.length === 0
    ) {
      assignments.value = []

      loading.value = false
      return
    }

    /*
      Informations des postes
    */

    const {
      data: posts,
      error: postsError,
    } =
      await supabase
        .from('posts')
        .select(`
          id,
          service_type,
          site_name,
          base_rate
        `)
        .in(
          'id',
          postIds
        )
        .eq(
          'active',
          true
        )

    if (postsError) {
      console.error(
        'Erreur postes :',
        postsError
      )

      loading.value = false
      return
    }

    assignments.value =
      (links ?? [])
        .map((link) => {

          const post =
            (posts ?? []).find(
              (item) =>
                item.id ===
                link.post_id
            )

          if (!post) {
            return null
          }

          return {
            post_id:
              link.post_id,

            custom_rate:
              link.custom_rate === null
                ? null
                : Number(
                    link.custom_rate
                  ),

            post: {
              ...post,

              base_rate:
                Number(
                  post.base_rate ??
                  0
                ),
            },
          }
        })
        .filter(
          (
            item
          ): item is Assignment =>
            item !== null
        )

    loading.value = false
  }

/* =========================
   MOT DE PASSE
========================= */

const resetPassword =
  async () => {

    passwordMessage.value = ''
    passwordError.value = false

    resettingPassword.value =
      true

    const {
      data: { user },
    } =
      await supabase.auth.getUser()

    if (!user?.email) {

      passwordMessage.value =
        'Impossible de récupérer ton adresse e-mail.'

      passwordError.value =
        true

      resettingPassword.value =
        false

      return
    }

    const {
      error,
    } =
      await supabase.auth
        .resetPasswordForEmail(
          user.email,
          {
            redirectTo:
              'https://tempo-am.netlify.app/reset-password',
          }
        )

    resettingPassword.value =
      false

    if (error) {

      console.error(
        'ERREUR RESET :',
        error
      )

      if (
        error.message.includes(
          'rate limit'
        )
      ) {
        passwordMessage.value =
          'Un e-mail a déjà été envoyé récemment. Réessayez dans quelques minutes.'
      } else {
        passwordMessage.value =
          'Impossible d’envoyer le mail de réinitialisation.'
      }

      passwordError.value =
        true

      return
    }

    passwordMessage.value =
      'Un lien de réinitialisation vient de vous être envoyé par e-mail.'
  }

/* =========================
   DÉCONNEXION
========================= */

const logout =
  async () => {

    const {
      error,
    } =
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

/* =========================
   DÉMARRAGE
========================= */

onMounted(
  async () => {
    await loadProfile()
  }
)
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.profile-page {
  min-height: 100vh;

  padding:
    28px
    20px
    120px;

  background: #f7f1ec;

  color: #1d2c27;
}

.topbar,
.info-card,
.assignments-section,
.settings-section,
.logout-button {
  width: 100%;
  max-width: 520px;

  margin-left: auto;
  margin-right: auto;
}

/* HEADER */

.topbar {
  display: flex;

  justify-content: space-between;
  align-items: center;

  gap: 16px;

  margin-bottom: 25px;
}

.profile-title {
  min-width: 0;
}

.eyebrow {
  margin: 0 0 4px;

  font-size: 10px;
  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 1.2px;

  color: #9b8174;
}

.topbar h1 {
  margin: 0;

  font-family:
    Georgia,
    'Times New Roman',
    serif;

  font-size: 29px;
  font-weight: 400;

  color: #17372f;
}

.subtitle {
  margin: 5px 0 0;

  font-size: 12px;

  color: #7d7874;
}

/* IDENTITÉ */

.profile-identity {
  flex-shrink: 0;

  display: flex;
  align-items: center;

  gap: 9px;

  padding: 8px 10px;

  border:
    1px solid #ede5df;

  border-radius: 18px;

  background: white;
}

.avatar {
  width: 42px;
  height: 42px;

  flex-shrink: 0;

  display: grid;
  place-items: center;

  border-radius: 50%;

  background: #17372f;

  color: white;

  font-size: 17px;
  font-weight: 700;
}

.identity {
  min-width: 0;

  display: flex;
  flex-direction: column;

  gap: 2px;
}

.identity h2 {
  max-width: 105px;

  margin: 0;

  overflow: hidden;

  white-space: nowrap;

  text-overflow: ellipsis;

  font-size: 12px;

  color: #17372f;
}

.identity p {
  margin: 0;

  font-size: 9px;

  color: #8b8581;
}

/* INFORMATIONS */

.info-card {
  margin-bottom: 27px;

  overflow: hidden;

  border:
    1px solid #ede5df;

  border-radius: 22px;

  background: white;
}

.info-row {
  min-height: 70px;

  display: flex;
  align-items: center;

  padding:
    0
    20px;

  border-bottom:
    1px solid #f0ebe7;
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
  font-size: 10px;

  color: #99918c;
}

.info-row strong {
  overflow-wrap: anywhere;

  font-size: 13px;

  color: #17372f;
}

/* TITRES SECTIONS */

.assignments-section,
.settings-section {
  margin-bottom: 27px;
}

.section-title {
  display: flex;

  align-items: flex-end;
  justify-content: space-between;

  gap: 15px;

  margin-bottom: 12px;
}

.section-title h2 {
  margin: 0;

  font-family:
    Georgia,
    'Times New Roman',
    serif;

  font-size: 21px;
  font-weight: 400;

  color: #17372f;
}

.assignment-count {
  min-width: 28px;
  height: 28px;

  display: grid;
  place-items: center;

  padding: 0 8px;

  border-radius: 999px;

  background: #17372f;

  color: white;

  font-size: 10px;
  font-weight: 700;
}

/* AFFECTATIONS */

.assignment-list {
  display: flex;
  flex-direction: column;

  gap: 10px;
}

.assignment-card {
  padding: 16px;

  border:
    1px solid #ede5df;

  border-radius: 20px;

  background: white;
}

.assignment-top {
  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  gap: 12px;
}

.service-badge {
  display: inline-flex;

  margin-bottom: 6px;

  padding:
    4px
    7px;

  border-radius: 999px;

  font-size: 8px;
  font-weight: 800;

  text-transform: uppercase;

  letter-spacing: 0.5px;
}

.service-badge.security {
  background: #e7eeea;

  color: #17372f;
}

.service-badge.cleaning {
  background: #f6e8e2;

  color: #a85f49;
}

.assignment-card h3 {
  margin: 0;

  font-size: 13px;

  color: #17372f;
}

.rate {
  flex-shrink: 0;

  font-size: 13px;

  color: #a85f49;
}

.assignment-bottom {
  display: flex;

  align-items: center;

  margin-top: 13px;

  padding-top: 12px;

  border-top:
    1px solid #f0ebe7;
}

.vacation-info {
  flex: 1;

  display: flex;
  flex-direction: column;

  gap: 3px;
}

.vacation-info span {
  font-size: 9px;

  color: #8c8580;
}

.vacation-info strong {
  font-size: 12px;

  color: #17372f;
}

.separator {
  width: 1px;
  height: 30px;

  margin:
    0
    20px;

  background: #eee6e1;
}

.cleaning-info {
  display: flex;

  align-items: center;

  gap: 9px;
}

.cleaning-info > span {
  width: 34px;
  height: 34px;

  display: grid;
  place-items: center;

  border-radius: 10px;

  background: #f7f1ec;
}

.cleaning-info > div {
  display: flex;
  flex-direction: column;

  gap: 2px;
}

.cleaning-info strong {
  font-size: 11px;

  color: #17372f;
}

.cleaning-info small {
  font-size: 9px;

  color: #928b86;
}

/* AUCUNE AFFECTATION */

.empty-card {
  padding: 25px;

  border:
    1px solid #ede5df;

  border-radius: 20px;

  background: white;

  text-align: center;
}

.empty-icon {
  width: 38px;
  height: 38px;

  display: grid;
  place-items: center;

  margin:
    0
    auto
    9px;

  border-radius: 50%;

  background: #f2ece8;

  color: #9b8174;
}

.empty-card strong {
  display: block;

  font-size: 12px;

  color: #17372f;
}

.empty-card p {
  margin:
    5px
    0
    0;

  font-size: 10px;

  color: #8c8580;
}

/* PARAMÈTRES */

.settings-card {
  overflow: hidden;

  border:
    1px solid #ede5df;

  border-radius: 22px;

  background: white;
}

.setting-row {
  width: 100%;
  min-height: 74px;

  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 16px;

  padding:
    0
    20px;

  border: none;

  border-bottom:
    1px solid #f0ebe7;

  background: white;

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
  font-size: 13px;

  color: #17372f;
}

.setting-row div span {
  font-size: 11px;

  color: #99918c;
}

.arrow {
  flex-shrink: 0;

  font-size: 25px;

  color: #a39a94;
}

.setting-row:disabled {
  opacity: 0.6;

  cursor: wait;
}

/* MESSAGE MOT DE PASSE */

.password-message {
  margin: 0;

  padding:
    14px
    20px;

  border-bottom:
    1px solid #e8e1dc;

  background: #f3f8f5;

  color: #31594c;

  font-size: 11px;

  line-height: 1.5;
}

.password-message.error {
  background: #f9e7e3;

  color: #a84f40;
}

/* DÉCONNEXION */

.logout-button {
  display: block;

  min-height: 52px;

  border:
    1px solid #ddc9c2;

  border-radius: 17px;

  background: #f5e8e3;

  color: #a24d3d;

  font-family: inherit;

  font-size: 13px;
  font-weight: 700;

  cursor: pointer;
}

/* MOBILE */

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
    max-width: 140px;

    font-size: 10px;
  }

  .profile-identity {
    padding: 7px 8px;
  }

  .avatar {
    width: 38px;
    height: 38px;
  }

  .identity h2 {
    max-width: 80px;

    font-size: 10px;
  }

  .separator {
    margin:
      0
      14px;
  }
}
</style>