<template>
  <main class="reset-page">
    <section class="reset-card">
      <div class="brand">Tempo</div>

      <p class="eyebrow">
        Sécurité
      </p>

      <h1>
        Nouveau mot de passe
      </h1>

      <p class="subtitle">
        Choisissez un nouveau mot de passe pour votre compte.
      </p>

      <form
        class="reset-form"
        @submit.prevent="updatePassword"
      >
        <label>
          Nouveau mot de passe
        </label>

        <div class="password-field">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Votre nouveau mot de passe"
            autocomplete="new-password"
          />

          <button
            type="button"
            class="eye-button"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? 'Masquer' : 'Afficher' }}
          </button>
        </div>

        <label>
          Confirmer le mot de passe
        </label>

        <div class="password-field">
          <input
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Confirmez votre mot de passe"
            autocomplete="new-password"
          />

          <button
            type="button"
            class="eye-button"
            @click="
              showConfirmPassword =
                !showConfirmPassword
            "
          >
            {{
              showConfirmPassword
                ? 'Masquer'
                : 'Afficher'
            }}
          </button>
        </div>

        <p
          v-if="message"
          class="message"
          :class="{ error: hasError }"
        >
          {{ message }}
        </p>

        <button
          type="submit"
          class="submit-button"
          :disabled="loading"
        >
          {{
            loading
              ? 'Modification...'
              : 'Enregistrer mon nouveau mot de passe'
          }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

const password = ref('')
const confirmPassword = ref('')

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const loading = ref(false)
const message = ref('')
const hasError = ref(false)

const updatePassword = async () => {
  message.value = ''
  hasError.value = false

  if (!password.value) {
    message.value =
      'Veuillez saisir un nouveau mot de passe.'

    hasError.value = true
    return
  }

  if (password.value.length < 6) {
    message.value =
      'Le mot de passe doit contenir au moins 6 caractères.'

    hasError.value = true
    return
  }

  if (
    password.value !==
    confirmPassword.value
  ) {
    message.value =
      'Les mots de passe ne correspondent pas.'

    hasError.value = true
    return
  }

  loading.value = true

  const { error } =
    await supabase.auth.updateUser({
      password: password.value,
    })

  loading.value = false

  if (error) {
    console.error(error)

    message.value =
      'Impossible de modifier le mot de passe.'

    hasError.value = true
    return
  }

  message.value =
    'Mot de passe modifié avec succès.'

  await supabase.auth.signOut()

  setTimeout(() => {
    router.push('/')
  }, 1200)
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.reset-page {
  min-height: 100vh;

  display: grid;
  place-items: center;

  padding: 24px;

  background: #f7f1ec;

  color: #1d2c27;
}

.reset-card {
  width: 100%;
  max-width: 430px;

  padding: 30px;

  border: 1px solid #ebe4df;
  border-radius: 28px;

  background: #ffffff;
}

.brand {
  margin-bottom: 28px;

  font-size: 20px;
  font-weight: 800;

  color: #17372f;
}

.eyebrow {
  margin: 0 0 6px;

  color: #9b8174;

  font-size: 11px;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 1.2px;
}

h1 {
  margin: 0;

  color: #17372f;

  font-size: 30px;
  line-height: 1.1;
}

.subtitle {
  margin: 10px 0 26px;

  color: #7d7874;

  font-size: 13px;
  line-height: 1.5;
}

.reset-form {
  display: flex;
  flex-direction: column;

  gap: 10px;
}

label {
  margin-top: 5px;

  color: #17372f;

  font-size: 12px;
  font-weight: 700;
}

.password-field {
  position: relative;
}

input {
  width: 100%;
  min-height: 54px;

  padding: 0 90px 0 15px;

  border: 1px solid #e6dfda;
  border-radius: 16px;

  background: #fbf8f5;

  color: #17372f;

  font: inherit;
  font-size: 14px;

  outline: none;
}

input:focus {
  border-color: #bba99d;
}

.eye-button {
  position: absolute;

  top: 50%;
  right: 12px;

  transform: translateY(-50%);

  border: none;

  background: transparent;

  color: #7d7874;

  font-size: 11px;
  font-weight: 700;

  cursor: pointer;
}

.message {
  margin: 8px 0 0;

  padding: 12px 14px;

  border-radius: 14px;

  background: #f1f7f3;

  color: #31594c;

  font-size: 12px;
  line-height: 1.4;
}

.message.error {
  background: #f9e7e3;
  color: #a84f40;
}

.submit-button {
  min-height: 54px;

  margin-top: 10px;

  border: none;
  border-radius: 17px;

  background: #17372f;

  color: #ffffff;

  font: inherit;
  font-size: 14px;
  font-weight: 700;

  cursor: pointer;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

@media (max-width: 480px) {
  .reset-page {
    padding: 16px;
  }

  .reset-card {
    padding: 24px 20px;
  }

  h1 {
    font-size: 27px;
  }
}
</style>