<template>
  <main class="login-page">
    <TempoDecoration />

    <section class="content">
      <div class="brand">
        <h1 class="logo">
          Temp<span class="o">o<span class="needle"></span></span>
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

      <form class="login-form" @submit.prevent="login">
        <div class="field">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6H20V18H4V6Z"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <path
              d="M4 7L12 13L20 7"
              stroke="currentColor"
              stroke-width="1.6"
            />
          </svg>

          <input
            v-model="email"
            type="email"
            placeholder="Adresse e-mail"
            required
          />
        </div>

        <div class="field">
          <svg viewBox="0 0 24 24" fill="none">
            <rect
              x="6"
              y="10"
              width="12"
              height="10"
              rx="2"
              stroke="currentColor"
              stroke-width="1.6"
            />

            <path
              d="M8 10V7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7V10"
              stroke="currentColor"
              stroke-width="1.6"
            />
          </svg>

          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Mot de passe"
            required
          />

          <button
            type="button"
            class="eye-button"
            @click="showPassword = !showPassword"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M2.5 12C4.5 8.5 7.8 6.5 12 6.5C16.2 6.5 19.5 8.5 21.5 12C19.5 15.5 16.2 17.5 12 17.5C7.8 17.5 4.5 15.5 2.5 12Z"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <circle
                cx="12"
                cy="12"
                r="2.5"
                stroke="currentColor"
                stroke-width="1.5"
              />
            </svg>
          </button>
        </div>

        <button
  type="submit"
  class="login-button"
  :disabled="loading"
>
  <span>
    {{ loading ? 'Connexion...' : 'Se connecter' }}
  </span>

  <span v-if="!loading" class="arrow">
    →
  </span>
</button>

<p
  v-if="errorMessage"
  class="login-error"
>
  {{ errorMessage }}
</p>

        <a href="#" class="forgot">
          Mot de passe oublié ?
        </a>
      </form>

      <div class="motto">
        <span class="small-line"></span>

        <p>
          MIEUX ORGANISER AUJOURD’HUI<br />
          POUR UN DEMAIN PLUS SEREIN
        </p>
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

.eye-button {
  width: 34px;
  height: 34px;

  display: grid;
  place-items: center;

  padding: 0;

  border: none;
  background: transparent;

  color: #17372f;

  cursor: pointer;
}

.eye-button svg {
  width: 22px;
  height: 22px;
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