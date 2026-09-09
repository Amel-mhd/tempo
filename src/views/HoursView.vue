<template>
  <main class="hours-page">
    <header class="topbar">
      <div>
        <p class="eyebrow">Historique</p>
        <h1>Mes horaires</h1>
        <p class="subtitle">Retrouve toutes tes journées enregistrées</p>
      </div>
    </header>

    <section class="filter-card">
      <button
        v-for="filter in filters"
        :key="filter"
        type="button"
        class="filter-button"
        :class="{ active: selectedFilter === filter }"
        @click="selectedFilter = filter"
      >
        {{ filter }}
      </button>
    </section>

    <section v-if="filteredEntries.length > 0" class="hours-card">
      <article
        v-for="entry in filteredEntries"
        :key="entry.id"
        class="hour-entry"
      >
        <div class="date-box">
          <strong>{{ getDay(entry.date) }}</strong>
          <span>{{ getMonth(entry.date) }}</span>
        </div>

        <div class="entry-content">
          <div class="entry-top">
            <div>
              <h2>{{ formatDate(entry.date) }}</h2>

              <p>
                {{ entry.startTime }} → {{ entry.endTime }}
              </p>
            </div>

            <span class="status validated">
              Enregistré
            </span>
          </div>

          <div class="entry-bottom">
            <span>
              Pause :
              {{ getPauseDuration(entry.pauseStart, entry.pauseEnd) }}
            </span>

            <strong>
              {{ formatWorkedTime(entry.workedMinutes) }}
            </strong>
          </div>
        </div>

        <button
          type="button"
          class="delete-button"
          @click="removeEntry(entry.id)"
          aria-label="Supprimer la journée"
        >
          ×
        </button>
      </article>
    </section>

    <section v-else class="empty-card">
      <div class="empty-icon">
        ◷
      </div>

      <h2>Aucune journée</h2>

      <p>
        Tes journées enregistrées apparaîtront ici.
      </p>

      <RouterLink to="/home" class="add-button">
        Saisir mes horaires
      </RouterLink>
    </section>

    <nav class="bottom-nav">
      <RouterLink to="/home" class="nav-item">
        <span>⌂</span>
        <small>Accueil</small>
      </RouterLink>

      <RouterLink to="/hours" class="nav-item active">
        <span>◫</span>
        <small>Horaires</small>
      </RouterLink>

      <RouterLink to="/month" class="nav-item">
        <span>▦</span>
        <small>Mon mois</small>
      </RouterLink>

      <RouterLink to="/profile" class="nav-item">
        <span>○</span>
        <small>Profil</small>
      </RouterLink>
    </nav>
  </main>
</template>

<script setup lang="ts">
import { computed, 
ref,
onMounted,
 } from 'vue'

import {
  getTimeEntries,
  deleteTimeEntry,
  type TimeEntry,
} from '../services/timeEntries'

const selectedFilter = ref('Tous')

const filters = ['Tous']

const entries = ref<TimeEntry[]>([])

onMounted(async () => {
  entries.value = await getTimeEntries()
})

const filteredEntries = computed(() => {
  return [...entries.value].sort((a, b) =>
    b.date.localeCompare(a.date)
  )
})

const formatWorkedTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} h`
  }

  return `${hours} h ${remainingMinutes
    .toString()
    .padStart(2, '0')}`
}

const getPauseDuration = (
  pauseStart: string,
  pauseEnd: string
) => {
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)

    return hours * 60 + minutes
  }

  const duration =
    toMinutes(pauseEnd) - toMinutes(pauseStart)

  return formatWorkedTime(duration)
}

const formatDate = (date: string) => {
  const value = new Date(`${date}T12:00:00`)

  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(value)
}

const getDay = (date: string) => {
  return date.split('-')[2]
}

const getMonth = (date: string) => {
  const value = new Date(`${date}T12:00:00`)

  return new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
  })
    .format(value)
    .replace('.', '')
    .toUpperCase()
}
const removeEntry = async (id: string) => {
  const confirmed = window.confirm(
    'Supprimer cette journée ?'
  )

  if (!confirmed) {
    return
  }

  await deleteTimeEntry(id)

  entries.value = await getTimeEntries()
}
</script>

<style scoped>
.hours-page {
  min-height: 100vh;

  padding: 28px 20px 110px;

  background: #f7f1ec;
  color: #1d2c27;
}

.topbar,
.filter-card,
.hours-card,
.empty-card {
  width: 100%;
  max-width: 480px;

  margin-left: auto;
  margin-right: auto;
}

.topbar {
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 4px;

  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.2px;

  color: #9b8174;
}

.topbar h1 {
  margin: 0;

  font-size: 28px;

  color: #17372f;
}

.subtitle {
  margin: 5px 0 0;

  font-size: 14px;

  color: #7d7874;
}

.filter-card {
  display: flex;

  gap: 8px;

  margin-bottom: 16px;
}

.filter-button {
  min-height: 40px;

  padding: 0 16px;

  border: none;
  border-radius: 999px;

  background: white;
  color: #746e6a;

  font-weight: 600;

  cursor: pointer;
}

.filter-button.active {
  background: #17372f;
  color: white;
}

.hours-card {
  display: flex;
  flex-direction: column;

  gap: 12px;
}

.hour-entry {
  position: relative;

  display: flex;

  gap: 14px;

  padding: 16px 42px 16px 16px;

  background: white;

  border: 1px solid #ede5df;
  border-radius: 22px;
}

.date-box {
  width: 52px;
  height: 58px;

  flex-shrink: 0;

  border-radius: 15px;

  background: #f1e3dc;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.date-box strong {
  font-size: 19px;

  color: #17372f;
}

.date-box span {
  margin-top: 1px;

  font-size: 10px;
  letter-spacing: 1px;

  color: #8a7970;
}

.entry-content {
  flex: 1;
  min-width: 0;
}

.entry-top {
  display: flex;

  justify-content: space-between;

  gap: 10px;
}

.entry-top h2 {
  margin: 0;

  font-size: 14px;

  text-transform: capitalize;

  color: #17372f;
}

.entry-top p {
  margin: 4px 0 0;

  font-size: 12px;

  color: #99918c;
}

.status {
  height: fit-content;

  padding: 5px 8px;

  border-radius: 999px;

  font-size: 10px;
  font-weight: 700;

  white-space: nowrap;
}

.status.validated {
  background: #e9f2ec;
  color: #4f765f;
}

.entry-bottom {
  margin-top: 14px;
  padding-top: 12px;

  border-top: 1px solid #f0ebe7;

  display: flex;

  justify-content: space-between;

  gap: 12px;
}

.entry-bottom span {
  font-size: 11px;

  color: #8e8782;
}

.entry-bottom strong {
  font-size: 14px;

  color: #17372f;
}

.delete-button {
  position: absolute;

  top: 10px;
  right: 12px;

  width: 27px;
  height: 27px;

  display: grid;
  place-items: center;

  padding: 0;

  border: none;
  border-radius: 50%;

  background: transparent;

  color: #b09f96;

  font-size: 20px;
  line-height: 1;

  cursor: pointer;
}

.delete-button:hover {
  background: #f7ece7;

  color: #a24d3d;
}

.empty-card {
  padding: 42px 25px;

  background: white;

  border: 1px solid #ede5df;
  border-radius: 24px;

  text-align: center;
}

.empty-icon {
  width: 62px;
  height: 62px;

  margin: 0 auto 18px;

  display: grid;
  place-items: center;

  border-radius: 50%;

  background: #f1e3dc;

  color: #17372f;

  font-size: 30px;
}

.empty-card h2 {
  margin: 0;

  font-size: 19px;

  color: #17372f;
}

.empty-card p {
  margin: 8px 0 22px;

  font-size: 13px;
  line-height: 1.5;

  color: #8c8580;
}

.add-button {
  min-height: 48px;

  padding: 0 22px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 16px;

  background: #17372f;

  color: white;

  font-size: 13px;
  font-weight: 700;

  text-decoration: none;
}

.bottom-nav {
  position: fixed;

  left: 50%;
  bottom: 16px;

  width: calc(100% - 30px);
  max-width: 460px;

  transform: translateX(-50%);

  display: grid;
  grid-template-columns: repeat(4, 1fr);

  padding: 8px;

  background: rgba(255, 255, 255, 0.96);

  border: 1px solid #ebe4df;
  border-radius: 22px;
}

.nav-item {
  min-height: 54px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 3px;

  border: none;
  border-radius: 15px;

  background: transparent;

  color: #8b8581;

  text-decoration: none;

  cursor: pointer;
}

.nav-item span {
  font-size: 20px;
}

.nav-item small {
  font-size: 11px;
}

.nav-item.active {
  background: #f2e9e3;

  color: #17372f;
}
</style>