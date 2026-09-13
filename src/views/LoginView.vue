<template>
  <main class="login-page">
    <TempoDecoration />

    <section class="content">
      <div class="brand">
        <h1 class="logo">
          Temp<span class="o">
            o
            <span class="needle"></span>
          </span>
        </h1>

        <p>VOTRE TEMPS COMPTE</p>
      </div>

      <div class="welcome">
        <h2>Bienvenue !</h2>

        <p>
          Connectez-vous pour accéder<br />
          à votre espace.
        </p>
      </div>

     <form
  class="login-form"
  @submit.prevent="login"
>
  <!-- EMAIL -->
  <div class="field">
    <label for="email">
      Adresse e-mail
    </label>

    <input
      id="email"
      v-model="email"
      type="email"
      placeholder="nom@exemple.fr"
      autocomplete="email"
      required
    />
  </div>

  <!-- MOT DE PASSE -->
  <div class="field">
    <label for="password">
      Mot de passe
    </label>

    <div class="password-field">
      <input
        id="password"
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        placeholder="Votre mot de passe"
        autocomplete="current-password"
        required
      />

      <button
        type="button"
        class="eye-button"
        aria-label="Afficher ou masquer le mot de passe"
        @click="showPassword = !showPassword"
      >
        <svg
          v-if="!showPassword"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
          />

          <circle
            cx="12"
            cy="12"
            r="3"
          />
        </svg>

        <svg
          v-else
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
          />

          <circle
            cx="12"
            cy="12"
            r="3"
          />

          <line
            x1="4"
            y1="4"
            x2="20"
            y2="20"
          />
        </svg>
      </button>
    </div>
  </div>

  <!-- ERREUR -->
  <p
    v-if="errorMessage"
    class="error-message"
  >
    {{ errorMessage }}
  </p>

  <!-- CONNEXION -->
  <button
    type="submit"
    class="login-button"
    :disabled="loading"
  >
    {{ loading ? 'Connexion...' : 'Se connecter' }}
  </button>
</form>

      <div class="signup-link">
        <span>Pas encore de compte ?</span>

        <RouterLink to="/signup">
          Créer mon compte
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TempoDecoration from '../components/TempoDecoration.vue'
import { supabase } from '../lib/supabase'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const router = useRouter()

const login = async () => {
  errorMessage.value = ''
  loading.value = true

  const { error } =
    await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

  if (error) {
    console.error(error)

    errorMessage.value =
      'Adresse e-mail ou mot de passe incorrect.'

    loading.value = false
    return
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    errorMessage.value =
      'Impossible de récupérer le compte.'

    loading.value = false
    return
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error(profileError)

    errorMessage.value =
      'Profil utilisateur introuvable.'

    loading.value = false
    return
  }

  loading.value = false

  if (profile.role === 'admin') {
    await router.push('/admin')
  } else {
    await router.push('/home')
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;

  .login-error {
  margin: 2px 0 0;

  text-align: center;
  font-size: 12px;

  color: #b14f42;
}

.signup-link {
  display: flex;
  justify-content: center;
  gap: 5px;

  margin-top: 18px;

  font-size: 12px;

  color: #8b8581;
}

.signup-link a {
  font-weight: 700;

  color: #a85f49;

  text-decoration: none;
}

.login-button:disabled {
  opacity: 0.65;
  cursor: wait;
}

  position: relative;
  overflow: hidden;

  display: flex;
  justify-content: center;

  padding: 34px 22px 42px;

  background: #faf6f2;
}

.content {
  width: 100%;
  max-width: 390px;

  position: relative;
  z-index: 2;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand {
  margin-top: 20px;
  text-align: center;
}

.logo {
  margin: 0;

  font-family: Georgia, 'Times New Roman', serif;
  font-size: 74px;
  line-height: 0.95;
  font-weight: 400;

  color: #17372f;
}

.o {
  position: relative;
  display: inline-block;
}

.needle {
  position: absolute;

  width: 2px;
  height: 18px;

  left: 49%;
  top: 49%;

  background: #c8795c;

  transform-origin: bottom center;
  transform: translate(-50%, -100%) rotate(45deg);

  border-radius: 10px;
}

.brand p {
  margin: 16px 0 0;

  font-size: 10px;
  letter-spacing: 4px;

  color: #415850;
}

.welcome {
  margin-top: 64px;
  text-align: center;
}

.welcome h2 {
  margin: 0;

  font-family: Georgia, 'Times New Roman', serif;
  font-size: 34px;
  font-weight: 400;

  color: #17372f;
}

.welcome p {
  margin: 10px 0 0;

  font-size: 15px;
  line-height: 1.5;

  color: #666966;
}

.login-form {
  width: 100%;

  margin-top: 30px;

  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  width: 100%;
  min-height: 59px;

  display: flex;
  align-items: center;
  gap: 14px;

  padding: 0 18px;

  background: rgba(255, 255, 255, 0.65);

  border: 1px solid #d9cec7;
  border-radius: 21px;
}

.field > svg {
  width: 21px;
  height: 21px;

  flex-shrink: 0;

  color: #17372f;
}

.field input {
  flex: 1;
  min-width: 0;

  border: none;
  outline: none;

  background: transparent;

  font-family: inherit;
  font-size: 15px;

  color: #17372f;
}

.field input::placeholder {
  color: #97918d;
}

.password-field {
  position: relative;
  width: 100%;
}

.password-field input {
  width: 100%;
  padding-right: 52px;
}

.field label {
  white-space: nowrap;
}

.eye-button {
  position: absolute;

  top: 50%;
  right: 16px;

  transform: translateY(-50%);

  width: 30px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  border: 0;

  background: transparent;
  color: #17372f;

  cursor: pointer;
}

.eye-button svg {
  width: 20px;
  height: 20px;

  display: block;

  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.login-button {
  width: 100%;
  min-height: 59px;

  margin-top: 2px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;

  border: none;
  border-radius: 22px;

  background: #17372f;
  color: white;

  font-family: Georgia, 'Times New Roman', serif;
  font-size: 17px;

  cursor: pointer;
}

.login-button:hover {
  background: #214a40;
}

.arrow {
  font-family: Arial, sans-serif;
  font-size: 24px;
  font-weight: 300;
}

.forgot {
  align-self: center;

  margin-top: 8px;

  font-size: 12px;

  color: #43554f;

  text-decoration: underline;
  text-underline-offset: 3px;
}

.motto {
  margin-top: auto;

  padding-top: 70px;
  padding-bottom: 118px;

  text-align: center;
}

.small-line {
  display: block;

  width: 28px;
  height: 2px;

  margin: 0 auto 17px;

  background: #c8795c;
}

.motto p {
  margin: 0;

  font-size: 9px;
  line-height: 1.8;
  letter-spacing: 2.5px;

  color: #486058;
}

@media (max-height: 760px) {
  .welcome {
    margin-top: 38px;
  }

  .motto {
    padding-top: 40px;
    padding-bottom: 85px;
  }
}

@media (max-width: 390px) {
  .logo {
    font-size: 66px;
  }

  .brand p {
    font-size: 9px;
    letter-spacing: 3px;
  }
}
</style>