<template>
  <main class="signup-page">
    <section class="signup-card">
      <div class="brand">
        <p class="eyebrow">Tempo</p>
        <h1>Créer mon compte</h1>

        <p class="subtitle">
          Renseignez vos informations pour accéder à votre espace.
        </p>
      </div>

      <form
        class="signup-form"
        @submit.prevent="signup"
      >
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

        <p
          v-if="errorMessage"
          class="message error"
        >
          {{ errorMessage }}
        </p>

        <p
          v-if="successMessage"
          class="message success"
        >
          {{ successMessage }}
        </p>

        <button
          type="submit"
          class="signup-button"
          :disabled="loading"
        >
          {{
            loading
              ? 'Création...'
              : 'Créer mon compte'
          }}
        </button>
      </form>

      <div class="login-link">
        <span>Déjà un compte ?</span>

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

const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const loading = ref(false)

const errorMessage = ref('')
const successMessage = ref('')

const signup = async () => {
  errorMessage.value = ''
  successMessage.value = ''

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

  const {
    data,
    error,
  } = await supabase.auth.signUp({
    email: email.value.trim(),
    password: password.value,

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

  if (error) {
    console.error(error)

    errorMessage.value =
      error.message

    loading.value = false
    return
  }

  if (!data.user) {
    errorMessage.value =
      'Impossible de créer le compte.'

    loading.value = false
    return
  }

  loading.value = false

  /*
    Si Supabase demande une confirmation
    d'adresse e-mail.
  */
  if (!data.session) {
    successMessage.value =
      'Compte créé. Vérifiez votre adresse e-mail pour confirmer votre inscription.'

    return
  }

  await router.push('/home')
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

  background: rgba(
    255,
    255,
    255,
    0.92
  );

  box-shadow:
    0 18px 50px
    rgba(51, 43, 38, 0.08);
}

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

.signup-form {
  display: flex;
  flex-direction: column;

  gap: 16px;
}

.name-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;

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

  border: 1px solid #e3d9d3;
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

  background: white;

  box-shadow:
    0 0 0 3px
    rgba(23, 55, 47, 0.07);
}

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

.success {
  background: #e8f0eb;

  color: #245243;
}

.signup-button {
  width: 100%;
  height: 52px;

  margin-top: 4px;

  border: none;
  border-radius: 16px;

  background: #17372f;
  color: white;

  font: inherit;
  font-size: 14px;
  font-weight: 700;

  cursor: pointer;
}

.signup-button:hover {
  background: #20483d;
}

.signup-button:disabled {
  opacity: 0.6;

  cursor: not-allowed;
}

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