<template>
  <main class="month-page">
    <!-- HEADER -->

    <header class="topbar">
      <div>
        <p class="eyebrow">Mon activité</p>
        <h1>Mon mois</h1>
        <p class="subtitle">
          {{ monthTitle }}
        </p>
      </div>
    </header>

    <!-- RÉSUMÉ -->

    <section class="summary-card">
      <div>
        <span>Heures travaillées</span>
        <strong>{{ totalWorked }}</strong>
      </div>

      <div>
        <span>Estimation</span>
        <strong>{{ estimatedSalary }} €</strong>
      </div>
    </section>

    <!-- CALENDRIER -->

    <section class="calendar-card">
      <div class="calendar-header">
        <button
          type="button"
          class="month-button"
          @click="previousMonth"
        >
          ‹
        </button>

        <h2>{{ monthTitle }}</h2>

        <button
          type="button"
          class="month-button"
          @click="nextMonth"
        >
          ›
        </button>
      </div>

      <div class="weekdays">
        <span>Lun</span>
        <span>Mar</span>
        <span>Mer</span>
        <span>Jeu</span>
        <span>Ven</span>
        <span>Sam</span>
        <span>Dim</span>
      </div>

      <div class="calendar-grid">
        <div
          v-for="day in calendarDays"
          :key="day.key"
          class="day"
          :class="{
            empty: day.day === null,
            worked: day.entry,
            selected: selectedDate === day.date,
          }"
          @click="selectDay(day)"
        >
          <template v-if="day.day !== null">
            <span>{{ day.day }}</span>

            <small v-if="day.entry">
              {{ formatShortTime(day.entry.workedMinutes) }}
            </small>

            <i v-if="day.entry"></i>
          </template>
        </div>
      </div>
    </section>

    <!-- JOUR SÉLECTIONNÉ -->

    <section
      v-if="selectedEntry"
      class="selected-card"
    >
      <div class="selected-header">
        <div>
          <p class="eyebrow">Détail</p>
          <h2>{{ formatDate(selectedEntry.date) }}</h2>
        </div>

        <strong>
          {{ formatWorkedTime(selectedEntry.workedMinutes) }}
        </strong>
      </div>

      <div class="timeline">
        <div>
          <span>Arrivée</span>
          <strong>{{ selectedEntry.startTime }}</strong>
        </div>

        <div>
          <span>Pause</span>
          <strong>
            {{ selectedEntry.pauseStart }}
            –
            {{ selectedEntry.pauseEnd }}
          </strong>
        </div>

        <div>
          <span>Départ</span>
          <strong>{{ selectedEntry.endTime }}</strong>
        </div>
      </div>
    </section>

    <!-- RÉCAP -->

    <section class="recap-card">
      <div class="recap-header">
        <div>
          <p class="eyebrow">Récapitulatif</p>
          <h2>Ce mois-ci</h2>
        </div>

        <span class="days-count">
          {{ monthEntries.length }}
          {{ monthEntries.length > 1 ? 'jours' : 'jour' }}
        </span>
      </div>

      <div v-if="monthEntries.length" class="stats">
        <div>
          <span>Total</span>
          <strong>{{ totalWorked }}</strong>
        </div>

        <div>
          <span>Moyenne / jour</span>
          <strong>{{ averagePerDay }}</strong>
        </div>
      </div>

      <div v-else class="empty-month">
        <span>◷</span>

        <p>
          Aucune journée enregistrée pour ce mois.
        </p>
      </div>
    </section>

    <!-- NAVIGATION -->

    <nav class="bottom-nav">
      <RouterLink to="/home" class="nav-item">
        <span>⌂</span>
        <small>Accueil</small>
      </RouterLink>

      <RouterLink to="/hours" class="nav-item">
        <span>◫</span>
        <small>Horaires</small>
      </RouterLink>

      <RouterLink to="/month" class="nav-item active">
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
import {
  computed,
  ref,
  onMounted,
} from 'vue'

import {
  getTimeEntries,
  type TimeEntry,
} from '../services/timeEntries'

import { supabase } from '../lib/supabase'

interface CalendarDay {
  key: string
  day: number | null
  date: string | null
  entry?: TimeEntry
}

/* -------------------------
   DONNÉES
------------------------- */

const entries = ref<TimeEntry[]>([])

/*
  Le taux horaire vient maintenant
  du profil Supabase de l'employée.
*/
const hourlyRate = ref(0)

/* -------------------------
   CHARGEMENT
------------------------- */

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const {
      data: profile,
      error,
    } = await supabase
      .from('profiles')
      .select('hourly_rate')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error(
        'Erreur récupération taux horaire :',
        error
      )
    }

    if (profile) {
      hourlyRate.value =
        Number(
          profile.hourly_rate ?? 0
        )
    }
  }

  entries.value =
    await getTimeEntries()
})

/* -------------------------
   DATE
------------------------- */

const today = new Date()

const displayedYear =
  ref(today.getFullYear())

const displayedMonth =
  ref(today.getMonth())

const selectedDate =
  ref<string | null>(null)

/* -------------------------
   ENTRÉES DU MOIS
------------------------- */

const monthEntries = computed(() => {
  return entries.value.filter(
    (entry) => {
      const [year, month] =
        entry.date
          .split('-')
          .map(Number)

      return (
        year ===
          displayedYear.value &&
        month - 1 ===
          displayedMonth.value
      )
    }
  )
})

/* -------------------------
   TOTAL
------------------------- */

const totalMinutes = computed(() => {
  return monthEntries.value.reduce(
    (total, entry) =>
      total +
      entry.workedMinutes,
    0
  )
})

const totalWorked = computed(() => {
  return formatWorkedTime(
    totalMinutes.value
  )
})

/* -------------------------
   SALAIRE ESTIMÉ
------------------------- */

const estimatedSalary = computed(() => {
  const hours =
    totalMinutes.value / 60

  return (
    hours *
    hourlyRate.value
  )
    .toFixed(2)
    .replace('.', ',')
})

/* -------------------------
   MOYENNE
------------------------- */

const averagePerDay = computed(() => {
  if (!monthEntries.value.length) {
    return '0 h'
  }

  return formatWorkedTime(
    Math.round(
      totalMinutes.value /
      monthEntries.value.length
    )
  )
})

/* -------------------------
   NOM DU MOIS
------------------------- */

const monthTitle = computed(() => {
  const date = new Date(
    displayedYear.value,
    displayedMonth.value,
    1
  )

  const value =
    new Intl.DateTimeFormat(
      'fr-FR',
      {
        month: 'long',
        year: 'numeric',
      }
    ).format(date)

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  )
})

/* -------------------------
   CALENDRIER
------------------------- */

const calendarDays =
  computed<CalendarDay[]>(() => {
    const result: CalendarDay[] = []

    const year =
      displayedYear.value

    const month =
      displayedMonth.value

    const firstDay =
      new Date(
        year,
        month,
        1
      )

    /*
      JavaScript :
      dimanche = 0
      lundi = 1

      Nous voulons lundi
      dans la première colonne.
    */
    const offset =
      (
        firstDay.getDay() +
        6
      ) % 7

    for (
      let i = 0;
      i < offset;
      i++
    ) {
      result.push({
        key: `empty-${i}`,
        day: null,
        date: null,
      })
    }

    const numberOfDays =
      new Date(
        year,
        month + 1,
        0
      ).getDate()

    for (
      let day = 1;
      day <= numberOfDays;
      day++
    ) {
      const date =
        createDateString(
          year,
          month,
          day
        )

      const entry =
        entries.value.find(
          (item) =>
            item.date === date
        )

      result.push({
        key: date,
        day,
        date,
        entry,
      })
    }

    return result
  })

/* -------------------------
   JOUR SÉLECTIONNÉ
------------------------- */

const selectedEntry =
  computed(() => {
    if (!selectedDate.value) {
      return undefined
    }

    return entries.value.find(
      (entry) =>
        entry.date ===
        selectedDate.value
    )
  })

const selectDay = (
  day: CalendarDay
) => {
  if (
    !day.entry ||
    !day.date
  ) {
    return
  }

  selectedDate.value =
    day.date
}

/* -------------------------
   CHANGER DE MOIS
------------------------- */

const previousMonth = () => {
  selectedDate.value = null

  if (
    displayedMonth.value === 0
  ) {
    displayedMonth.value = 11
    displayedYear.value--
  } else {
    displayedMonth.value--
  }
}

const nextMonth = () => {
  selectedDate.value = null

  if (
    displayedMonth.value === 11
  ) {
    displayedMonth.value = 0
    displayedYear.value++
  } else {
    displayedMonth.value++
  }
}

/* -------------------------
   UTILITAIRES
------------------------- */

const createDateString = (
  year: number,
  month: number,
  day: number
) => {
  const monthString =
    String(
      month + 1
    ).padStart(
      2,
      '0'
    )

  const dayString =
    String(day).padStart(
      2,
      '0'
    )

  return `${year}-${monthString}-${dayString}`
}

function formatWorkedTime(
  minutes: number
) {
  const hours =
    Math.floor(
      minutes / 60
    )

  const remainingMinutes =
    minutes % 60

  if (
    remainingMinutes === 0
  ) {
    return `${hours} h`
  }

  return `${hours} h ${String(
    remainingMinutes
  ).padStart(2, '0')}`
}

const formatShortTime = (
  minutes: number
) => {
  const hours =
    Math.floor(
      minutes / 60
    )

  const remainingMinutes =
    minutes % 60

  if (
    remainingMinutes === 0
  ) {
    return `${hours}h`
  }

  return `${hours}h${String(
    remainingMinutes
  ).padStart(2, '0')}`
}

const formatDate = (
  date: string
) => {
  const value =
    new Date(
      `${date}T12:00:00`
    )

  const formatted =
    new Intl.DateTimeFormat(
      'fr-FR',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }
    ).format(value)

  return (
    formatted
      .charAt(0)
      .toUpperCase() +
    formatted.slice(1)
  )
}
</script>

<style scoped>
.month-page {
  min-height: 100vh;

  padding: 28px 20px 115px;

  background: #f7f1ec;
  color: #1d2c27;
}

.topbar,
.summary-card,
.calendar-card,
.selected-card,
.recap-card {
  width: 100%;
  max-width: 480px;

  margin-left: auto;
  margin-right: auto;
}

/* HEADER */

.topbar {
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 4px;

  font-size: 11px;
  font-weight: 700;

  letter-spacing: 1.2px;
  text-transform: uppercase;

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

/* SUMMARY */

.summary-card {
  display: grid;
  grid-template-columns: 1fr 1fr;

  margin-bottom: 16px;

  overflow: hidden;

  background: #e8ddd5;

  border-radius: 22px;
}

.summary-card div {
  padding: 18px;
}

.summary-card div + div {
  border-left:
    1px solid rgba(23, 55, 47, 0.12);
}

.summary-card span {
  display: block;

  margin-bottom: 5px;

  font-size: 11px;

  color: #77716d;
}

.summary-card strong {
  font-size: 21px;

  color: #17372f;
}

/* CALENDRIER */

.calendar-card,
.selected-card,
.recap-card {
  padding: 20px;

  margin-bottom: 16px;

  background: white;

  border: 1px solid #ede5df;
  border-radius: 24px;
}

.calendar-header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  margin-bottom: 20px;
}

.calendar-header h2 {
  margin: 0;

  font-size: 17px;

  color: #17372f;
}

.month-button {
  width: 38px;
  height: 38px;

  display: grid;
  place-items: center;

  padding: 0;

  border: none;
  border-radius: 50%;

  background: #f3ece7;

  color: #17372f;

  font-size: 23px;

  cursor: pointer;
}

.weekdays,
.calendar-grid {
  display: grid;

  grid-template-columns: repeat(7, 1fr);

  gap: 6px;
}

.weekdays {
  margin-bottom: 8px;
}

.weekdays span {
  text-align: center;

  font-size: 10px;
  font-weight: 600;

  color: #a29a94;
}

.day {
  position: relative;

  min-height: 53px;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  border-radius: 13px;

  background: #faf8f6;

  cursor: default;
}

.day > span {
  font-size: 12px;
  font-weight: 600;

  color: #716d69;
}

.day small {
  margin-top: 3px;

  font-size: 8px;

  color: #7b6d66;
}

.day i {
  position: absolute;

  bottom: 4px;

  width: 4px;
  height: 4px;

  border-radius: 50%;

  background: #c86449;
}

.day.worked {
  background: #f1e3dc;

  cursor: pointer;
}

.day.worked > span {
  color: #17372f;
}

.day.selected {
  background: #17372f;
}

.day.selected span,
.day.selected small {
  color: white;
}

.day.selected i {
  background: #d99a80;
}

.day.empty {
  background: transparent;
}

/* JOUR */

.selected-header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 15px;

  margin-bottom: 18px;
}

.selected-header h2 {
  margin: 0;

  font-size: 16px;

  color: #17372f;
}

.selected-header > strong {
  font-size: 18px;

  color: #c86449;
}

.timeline {
  display: grid;

  grid-template-columns: repeat(3, 1fr);

  padding-top: 16px;

  border-top: 1px solid #f0ebe7;
}

.timeline div {
  text-align: center;
}

.timeline div + div {
  border-left: 1px solid #eee7e2;
}

.timeline span {
  display: block;

  margin-bottom: 5px;

  font-size: 10px;

  color: #9b928c;
}

.timeline strong {
  font-size: 12px;

  color: #17372f;
}

/* RÉCAP */

.recap-header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 15px;

  margin-bottom: 18px;
}

.recap-header h2 {
  margin: 0;

  font-size: 18px;

  color: #17372f;
}

.days-count {
  padding: 7px 10px;

  border-radius: 999px;

  background: #f2e9e3;

  font-size: 11px;
  font-weight: 600;

  color: #755f54;
}

.stats {
  display: grid;

  grid-template-columns: 1fr 1fr;
}

.stats div + div {
  padding-left: 20px;

  border-left: 1px solid #eee7e2;
}

.stats span {
  display: block;

  margin-bottom: 5px;

  font-size: 11px;

  color: #99918c;
}

.stats strong {
  font-size: 18px;

  color: #17372f;
}

.empty-month {
  padding: 20px 0;

  text-align: center;

  color: #918983;
}

.empty-month span {
  display: block;

  margin-bottom: 8px;

  font-size: 28px;

  color: #c86449;
}

.empty-month p {
  margin: 0;

  font-size: 13px;
}

/* NAV */

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

@media (max-width: 380px) {
  .month-page {
    padding-left: 14px;
    padding-right: 14px;
  }

  .calendar-card {
    padding-left: 14px;
    padding-right: 14px;
  }

  .calendar-grid,
  .weekdays {
    gap: 4px;
  }

  .day {
    min-height: 49px;
  }
}
</style>