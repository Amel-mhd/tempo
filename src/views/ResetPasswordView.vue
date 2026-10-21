<template>
  <main class="reset-page">
    <section class="reset-card">
      <h1>Tempo</h1>
      <h2>Nouveau mot de passe</h2>
      <p class="intro">Choisissez un nouveau mot de passe pour votre compte.</p>
      <p v-if="checking" class="info">Vérification du lien...</p>
      <form v-else-if="canReset && !completed" @submit.prevent="updatePassword">
        <label for="new-password">Nouveau mot de passe</label>
        <input id="new-password" v-model="password" type="password" autocomplete="new-password" minlength="8" required />
        <label for="confirm-password">Confirmer le mot de passe</label>
        <input id="confirm-password" v-model="confirmation" type="password" autocomplete="new-password" minlength="8" required />
        <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
        <button :disabled="loading" type="submit">{{ loading ? 'Enregistrement...' : 'Enregistrer le mot de passe' }}</button>
      </form>
      <p v-if="!checking && !canReset && !completed" class="error" role="alert">{{ errorMessage || 'Ce lien est invalide ou a expiré. Demandez un nouveau lien depuis la page de connexion.' }}</p>
      <p v-if="completed" class="success" role="status">Votre mot de passe a été modifié. Vous pouvez vous reconnecter.</p>
      <RouterLink class="back-link" to="/login">Retour à la connexion</RouterLink>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { supabase } from '../lib/supabase'

const password = ref('')
const confirmation = ref('')
const loading = ref(false)
const checking = ref(true)
const canReset = ref(false)
const completed = ref(false)
const errorMessage = ref('')

const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') {
    canReset.value = true
    checking.value = false
    errorMessage.value = ''
  }
})

onMounted(async () => {
  // Supabase traite le lien de récupération à l'ouverture de la page.
  // Une session existante seule ne doit pas autoriser un changement depuis cette page.
  const url = new URL(window.location.href)
  const hasRecoveryToken = url.hash.includes('type=recovery') || url.searchParams.get('type') === 'recovery' || url.searchParams.has('token_hash') || url.searchParams.has('code')
  if (!hasRecoveryToken) {
    checking.value = false
    return
  }
  if (url.searchParams.has('token_hash')) {
    const token_hash = url.searchParams.get('token_hash')!
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: 'recovery' })
    if (error) { errorMessage.value = 'Ce lien est invalide ou a expiré.'; checking.value = false; return }
    canReset.value = true
    checking.value = false
    return
  }
  // Pour les liens PKCE ou hash, laisser le client Supabase finaliser l'authentification.
  setTimeout(() => { checking.value = false }, 2000)
})
onUnmounted(() => authListener.subscription.unsubscribe())

const updatePassword = async () => {
  if (!canReset.value || loading.value) return
  errorMessage.value = ''
  if (password.value.length < 8) { errorMessage.value = 'Le mot de passe doit contenir au moins 8 caractères.'; return }
  if (password.value !== confirmation.value) { errorMessage.value = 'Les mots de passe ne correspondent pas.'; return }
  loading.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: password.value })
    if (error) { errorMessage.value = 'Impossible de modifier le mot de passe. Demandez un nouveau lien.'; return }
    completed.value = true
    canReset.value = false
    await supabase.auth.signOut()
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Une erreur est survenue. Réessayez.'
  } finally { loading.value = false }
}
</script>

<style scoped>
.reset-page { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #faf6f2; color: #17372f; }
.reset-card { width: 100%; max-width: 420px; padding: 28px 24px; border: 1px solid #e5dcd5; border-radius: 24px; background: white; box-shadow: 0 12px 35px rgba(23,55,47,.06); }
h1 { margin: 0 0 26px; font-family: Georgia,serif; font-size: 42px; font-weight: 400; text-align: center; }
h2 { margin: 0; font-family: Georgia,serif; font-size: 25px; font-weight: 400; }
.intro,.info { color: #6b706d; font-size: 13px; line-height: 1.6; }
form { display: flex; flex-direction: column; gap: 12px; margin-top: 25px; }
label { font-size: 13px; font-weight: 600; }
input { width: 100%; min-height: 52px; padding: 0 14px; border: 1px solid #d9cec7; border-radius: 15px; font: inherit; }
button { min-height: 53px; margin-top: 10px; border: 0; border-radius: 16px; background: #17372f; color: #fff; font: inherit; cursor: pointer; }
button:disabled { opacity: .6; }
.error { color: #b14f42; font-size: 12px; line-height: 1.5; }
.success { color: #176044; font-size: 13px; line-height: 1.6; }
.back-link { display: block; margin-top: 22px; color: #a85f49; font-size: 13px; text-align: center; }
</style>
