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
              'https\://tempo-am.netlify.app/reset-password',
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