<template>
  <main class="profile-page">
    <header class="profile-header">
      <p class="eyebrow">Administration</p>
      <h1>Mon profil</h1>
      <p class="subtitle">Gérez votre compte administrateur Tempo.</p>
    </header>

    <section class="profile-card">
      <div class="avatar">{{ initial }}</div>

      <div class="identity">
        <h2>{{ fullName }}</h2>
        <span>Administratrice</span>
      </div>

      <div class="info-list">
        <article>
          <span>Adresse e-mail</span>
          <strong>{{ email || '—' }}</strong>
        </article>

        <article>
          <span>Rôle</span>
          <strong>Administratrice</strong>
        </article>
      </div>
    </section>

    <section class="settings-card">
      <p class="eyebrow">Compte</p>

      <button type="button" class="setting-button" @click="changePassword">
        <span>Modifier mon mot de passe</span>
        <strong>›</strong>
      </button>

      <button type="button" class="logout-button" @click="logout">
        Se déconnecter
      </button>
    </section>

    <nav class="admin-bottom-nav">
      <RouterLink to="/admin" class="admin-nav-item" exact-active-class="active">
        <span class="admin-nav-icon">⌂</span>
        <span>Accueil</span>
      </RouterLink>

      <RouterLink to="/admin/equipe" class="admin-nav-item" active-class="active">
        <span class="admin-nav-icon">♙♙</span>
        <span>Équipe</span>
      </RouterLink>

      <RouterLink to="/admin/profile" class="admin-nav-item" active-class="active">
        <span class="admin-nav-icon">♙</span>
        <span>Profil</span>
      </RouterLink>
    </nav>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const firstName = ref('')
const lastName = ref('')
const email = ref('')

const fullName = computed(() => {
  const value = `${firstName.value} ${lastName.value}`.trim()
  return value || 'Administratrice Tempo'
})

const initial = computed(() =>
  (firstName.value || email.value || 'A').charAt(0).toUpperCase()
)

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    await router.push('/')
    return
  }

  email.value = user.email ?? ''

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('first_name, last_name, role')
    .eq('id', user.id)
    .single()

  if (error || !profile || profile.role !== 'admin') {
    await router.push('/home')
    return
  }

  firstName.value = profile.first_name ?? ''
  lastName.value = profile.last_name ?? ''
})

const changePassword = async () => {
  if (!email.value) return

  const { error } = await supabase.auth.resetPasswordForEmail(email.value)

  if (error) {
    console.error(error)
    window.alert('Impossible d’envoyer l’e-mail pour le moment.')
    return
  }

  window.alert('Un e-mail de réinitialisation vient d’être envoyé.')
}

const logout = async () => {
  await supabase.auth.signOut()
  await router.push('/')
}
</script>

<style scoped>
* { box-sizing: border-box; }

.profile-page {
  min-height: 100vh;
  padding: 28px 20px 110px;
  background: #f7f1ec;
  color: #17372f;
}

.profile-header,
.profile-card,
.settings-card {
  width: 100%;
  max-width: 520px;
  margin-left: auto;
  margin-right: auto;
}

.profile-header { margin-bottom: 22px; }

.eyebrow {
  margin: 0 0 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #9b8174;
}

.profile-header h1 {
  margin: 0;
  font-size: 28px;
  color: #17372f;
}

.subtitle {
  margin: 5px 0 0;
  font-size: 13px;
  color: #7d7874;
}

.profile-card,
.settings-card {
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #ede5df;
  border-radius: 24px;
  background: #fff;
}

.avatar {
  width: 70px;
  height: 70px;
  margin: 0 auto 12px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #17372f;
  color: #fff;
  font-size: 27px;
  font-weight: 800;
}

.identity {
  text-align: center;
  margin-bottom: 20px;
}

.identity h2 {
  margin: 0 0 4px;
  font-size: 21px;
}

.identity span {
  font-size: 12px;
  color: #8c8580;
}

.info-list {
  display: grid;
  gap: 9px;
}

.info-list article {
  padding: 13px 14px;
  border-radius: 14px;
  background: #f7f1ec;
}

.info-list span {
  display: block;
  margin-bottom: 4px;
  font-size: 10px;
  color: #8c8580;
}

.info-list strong {
  font-size: 13px;
  color: #17372f;
}

.setting-button,
.logout-button {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.setting-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;
  border: 1px solid #e5dbd4;
  background: #f7f1ec;
  color: #17372f;
}

.setting-button strong { font-size: 22px; }

.logout-button {
  border: 0;
  background: #c66b50;
  color: #fff;
}

.admin-bottom-nav {
  position: fixed;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%);
  z-index: 90;
  width: calc(100% - 28px);
  max-width: 490px;
  height: 68px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  padding: 7px;
  border: 1px solid #e4d8d0;
  border-radius: 22px;
  background: #fff;
  box-shadow:
    0 8px 30px rgba(23, 55, 47, 0.10),
    0 2px 8px rgba(23, 55, 47, 0.05);
}

.admin-nav-item {
  height: 54px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border-radius: 16px;
  color: #9a918c;
  text-decoration: none;
  font-size: 10px;
  font-weight: 600;
}

.admin-nav-icon {
  font-size: 19px;
  line-height: 1;
}

.admin-nav-item.active {
  background: #17372f;
  color: #fff;
}

@media (max-width: 420px) {
  .profile-page {
    padding-left: 14px;
    padding-right: 14px;
  }

  .profile-header h1 {
    font-size: 24px;
  }
}
</style>
