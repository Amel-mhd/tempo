<template>
  <main class="signup-page">
    <section class="signup-card">

      <!-- TITRE -->
      <div class="brand">
        <p class="eyebrow">
          Tempo
        </p>

        <h1>
          Créer mon compte
        </h1>

        <p class="subtitle">
          Renseignez vos informations pour accéder à votre espace.
        </p>
      </div>

      <!-- FORMULAIRE -->
      <form
        class="signup-form"
        @submit.prevent="signup"
      >

        <!-- PRÉNOM + NOM -->
        <div class="name-grid">

          <div class="field">
            <label for="firstName">
              Prénom
            </label>

            <input
              id="firstName"
              v-model="firstName"
              type="text"
              autocomplete="given-name"
              placeholder="Prénom"
              required
            />
          </div>

          <div class="field">
            <label for="lastName">
              Nom
            </label>

            <input
              id="lastName"
              v-model="lastName"
              type="text"
              autocomplete="family-name"
              placeholder="Nom"
              required
            />
          </div>

        </div>

        <!-- TÉLÉPHONE -->
        <div class="field">
          <label for="phone">
            Téléphone
          </label>

          <input
            id="phone"
            v-model="phone"
            type="tel"
            autocomplete="tel"
            placeholder="06 00 00 00 00"
          />
        </div>

        <!-- EMAIL -->
        <div class="field">
          <label for="email">
            Adresse e-mail
          </label>

          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="nom@exemple.fr"
            required
          />
        </div>

        <!-- MOT DE PASSE -->
        <div class="field">
          <label for="password">
            Mot de passe
          </label>

          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="new-password"
            placeholder="Au moins 6 caractères"
            minlength="6"
            required
          />
        </div>

        <!-- CONFIRMATION -->
        <div class="field">
          <label for="confirmPassword">
            Confirmer le mot de passe
          </label>

          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            placeholder="Retapez votre mot de passe"
            minlength="6"
            required
          />
        </div>

        <!-- ERREUR -->
        <p
          v-if="errorMessage"
          class="message error"
        >
          {{ errorMessage }}
        </p>

        <!-- BOUTON -->
        <button
          type="submit"
          class="signup-button"
          :disabled="loading"
        >
          {{
            loading
              ? 'Création du compte...'
              : 'Créer mon compte'
          }}
        </button>

      </form>

      <!-- CONNEXION -->
      <div class="login-link">
        <span>
          Déjà un compte ?
        </span>

        <RouterLink to="/">
          Se connecter
        </RouterLink>
      </div>

    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

/* =========================
   FORMULAIRE
========================= */

const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const email = ref('')

const password = ref('')
const confirmPassword = ref('')

const loading = ref(false)
const errorMessage = ref('')

/* =========================
   INSCRIPTION
========================= */

const signup = async () => {
  errorMessage.value = ''

  /* Vérification mot de passe */

  if (
    password.value !==
    confirmPassword.value
  ) {
    errorMessage.value =
      'Les mots de passe ne correspondent pas.'

    return
  }

  if (password.value.length < 6) {
    errorMessage.value =
      'Le mot de passe doit contenir au moins 6 caractères.'

    return
  }

  loading.value = true

  try {

    /* =========================
       CRÉATION DU COMPTE
    ========================= */

    const {
      data,
      error,
    } = await supabase.auth.signUp({
      email:
        email.value
          .trim()
          .toLowerCase(),

      password:
        password.value,

      options: {
        data: {
          first_name:
            firstName.value.trim(),

          last_name:
            lastName.value.trim(),

          phone:
            phone.value.trim(),
        },
      },
    })

    /* =========================
       ERREUR SUPABASE
    ========================= */

    if (error) {
      console.error(
        'Erreur inscription :',
        error
      )

      if (
        error.message
          .toLowerCase()
          .includes('already')
      ) {
        errorMessage.value =
          'Un compte existe déjà avec cette adresse e-mail.'
      } else {
        errorMessage.value =
          error.message
      }

      return
    }

    /* =========================
       VÉRIFICATION UTILISATEUR
    ========================= */

    if (!data.user) {
      errorMessage.value =
        'Impossible de créer le compte.'

      return
    }

    /* =========================
       CONNEXION AUTOMATIQUE
    ========================= */

    if (!data.session) {
      errorMessage.value =
        'Votre compte a été créé, mais la connexion automatique a échoué. Essayez de vous connecter.'

      return
    }

    /* =========================
       REDIRECTION
    ========================= */

    await router.push('/home')

  } catch (error) {

    console.error(
      'Erreur inscription :',
      error
    )

    errorMessage.value =
      'Une erreur est survenue. Veuillez réessayer.'

  } finally {

    loading.value = false
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.signup-page {
  min-height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 30px 20px;

  background:
    radial-gradient(
      circle at top right,
      #e5d5ca 0,
      transparent 35%
    ),
    #f7f1ec;

  color: #17372f;
}

.signup-card {
  width: 100%;
  max-width: 440px;

  padding: 30px 24px;

  border: 1px solid #ece2dc;
  border-radius: 28px;

  background:
    rgba(
      255,
      255,
      255,
      0.92
    );

  box-shadow:
    0 18px 50px
    rgba(
      51,
      43,
      38,
      0.08
    );
}

/* TITRE */

.brand {
  margin-bottom: 28px;
}

.eyebrow {
  margin: 0 0 7px;

  font-size: 11px;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 1.5px;

  color: #b16f58;
}

h1 {
  margin: 0;

  font-size: 30px;
  line-height: 1.1;

  color: #17372f;
}

.subtitle {
  margin: 10px 0 0;

  max-width: 330px;

  font-size: 13px;
  line-height: 1.5;

  color: #817a75;
}

/* FORMULAIRE */

.signup-form {
  display: flex;
  flex-direction: column;

  gap: 16px;
}

.name-grid {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;

  gap: 7px;
}

.field label {
  font-size: 12px;
  font-weight: 700;

  color: #41534d;
}

.field input {
  width: 100%;
  height: 50px;

  padding: 0 15px;

  border:
    1px solid
    #e3d9d3;

  border-radius: 15px;

  outline: none;

  background: #fbf9f7;

  color: #17372f;

  font: inherit;
  font-size: 14px;

  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background 0.2s;
}

.field input::placeholder {
  color: #aaa19c;
}

.field input:focus {
  border-color: #9bafa7;

  background: #fff;

  box-shadow:
    0 0 0 3px
    rgba(
      23,
      55,
      47,
      0.07
    );
}

/* MESSAGE */

.message {
  margin: 0;

  padding: 11px 13px;

  border-radius: 13px;

  font-size: 12px;
  line-height: 1.4;
}

.error {
  background: #f8e8e3;
  color: #a24d3d;
}

/* BOUTON */

.signup-button {
  width: 100%;
  height: 52px;

  margin-top: 4px;

  border: none;
  border-radius: 16px;

  background: #17372f;
  color: #fff;

  font: inherit;
  font-size: 14px;
  font-weight: 700;

  cursor: pointer;

  transition:
    background 0.2s,
    opacity 0.2s;
}

.signup-button:hover:not(:disabled) {
  background: #20483d;
}

.signup-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* CONNEXION */

.login-link {
  display: flex;
  justify-content: center;

  gap: 5px;

  margin-top: 23px;

  font-size: 12px;

  color: #8b8581;
}

.login-link a {
  font-weight: 700;

  color: #a85f49;

  text-decoration: none;
}

/* MOBILE */

@media (max-width: 390px) {
  .signup-page {
    padding: 20px 15px;
  }

  .signup-card {
    padding: 26px 18px;

    border-radius: 24px;
  }

  .name-grid {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 27px;
  }
}
</style>