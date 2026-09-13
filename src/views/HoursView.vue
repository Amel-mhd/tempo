<template>
  <main class="hours-page">
    <header class="topbar">
      <div>
        <p class="eyebrow">Historique</p>
        <h1>Mes horaires</h1>
        <p class="subtitle">
          Retrouve toutes tes journées enregistrées
        </p>
      </div>
    </header>

    <!-- FILTRES SOCIÉTÉS -->
    <section
      v-if="filters.length > 1"
      class="filter-card"
    >
      <button
        v-for="filter in filters"
        :key="filter.id"
        type="button"
        class="filter-button"
        :class="{
          active: selectedFilter === filter.id
        }"
        @click="selectedFilter = filter.id"
      >
        {{ filter.name }}
      </button>
    </section>

    <!-- CHARGEMENT -->
    <section
      v-if="loading"
      class="empty-card"
    >
      <p>Chargement des horaires...</p>
    </section>

    <!-- LISTE -->
    <section
      v-else-if="filteredEntries.length > 0"
      class="hours-card"
    >
      <article
        v-for="entry in filteredEntries"
        :key="entry.id"
        class="hour-entry"
      >
        <div class="date-box">
          <strong>
            {{ getDay(entry.work_date) }}
          </strong>

          <span>
            {{ getMonth(entry.work_date) }}
          </span>
        </div>

        <div class="entry-content">
          <div class="entry-top">
            <div>
              <h2>
                {{ formatDate(entry.work_date) }}
              </h2>

              <!-- SOCIÉTÉ -->
              <div class="company-name">
                {{ getCompanyName(entry) }}
              </div>

              <p>
                {{ formatTime(entry.start_time) }}
                →
                {{ formatTime(entry.end_time) }}
              </p>
            </div>

            <span
              class="status"
              :class="entry.status"
            >
              {{ getStatusLabel(entry.status) }}
            </span>
          </div>

          <div class="entry-bottom">
            <span>
              Pause :
              {{
                getPauseDuration(
                  entry.pause_start,
                  entry.pause_end
                )
              }}
            </span>

            <strong>
              {{
                formatWorkedTime(
                  entry.worked_minutes
                )
              }}
            </strong>
          </div>
        </div>

        <button
          type="button"
          class="delete-button"
          aria-label="Supprimer les horaires"
          @click="removeEntry(entry.id)"
        >
          ×
        </button>
      </article>
    </section>

    <!-- VIDE -->
    <section
      v-else
      class="empty-card"
    >
      <div class="empty-icon">
        ◷
      </div>

      <h2>Aucune journée</h2>

      <p>
        Tes journées enregistrées apparaîtront ici.
      </p>

      <RouterLink
        to="/home"
        class="add-button"
      >
        Saisir mes horaires
      </RouterLink>
    </section>

    <!-- NAVBAR -->
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
  RouterLink,
  useRouter,
} from 'vue-router'

import EmployeeBottomNav from '../components/EmployeeBottomNav.vue'
import { supabase } from '../lib/supabase'

interface Company {
  id?: string
  name: string
}

interface TimeEntry {
  id: string
  user_id: string
  company_id: string | null
  work_date: string
  start_time: string
  pause_start: string | null
  pause_end: string | null
  end_time: string
  worked_minutes: number
  status: string
  company: Company | null
}

interface Filter {
  id: string
  name: string
}

const router = useRouter()

const entries = ref<TimeEntry[]>([])

const loading = ref(true)

const selectedFilter = ref('all')

const filters = computed<Filter[]>(() => {
  const companies = new Map<string, string>()

  entries.value.forEach((entry) => {
    if (
      entry.company_id &&
      entry.company?.name
    ) {
      companies.set(
        entry.company_id,
        entry.company.name
      )
    }
  })

  return [
    {
      id: 'all',
      name: 'Toutes',
    },

    ...Array.from(
      companies.entries()
    ).map(([id, name]) => ({
      id,
      name,
    })),
  ]
})

const filteredEntries = computed(() => {
  const list =
    selectedFilter.value === 'all'
      ? entries.value
      : entries.value.filter(
          (entry) =>
            entry.company_id ===
            selectedFilter.value
        )

  return [...list].sort((a, b) => {
    const dateCompare =
      b.work_date.localeCompare(
        a.work_date
      )

    if (dateCompare !== 0) {
      return dateCompare
    }

    return (
      b.start_time ?? ''
    ).localeCompare(
      a.start_time ?? ''
    )
  })
})

const loadEntries = async () => {
  loading.value = true

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    loading.value = false
    await router.push('/')
    return
  }

  const {
    data,
    error,
  } = await supabase
    .from('time_entries')
    .select(`
      id,
      user_id,
      company_id,
      work_date,
      start_time,
      pause_start,
      pause_end,
      end_time,
      worked_minutes,
      status,
      company:companies (
        name
      )
    `)
    .eq('user_id', user.id)
    .order(
      'work_date',
      {
        ascending: false,
      }
    )
    .order(
      'start_time',
      {
        ascending: false,
      }
    )

  loading.value = false

  if (error) {
    console.error(error)
    return
  }

  entries.value =
    (data ?? []) as unknown as TimeEntry[]
}

const formatWorkedTime = (
  minutes: number
) => {
  const hours =
    Math.floor(minutes / 60)

  const remainingMinutes =
    minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} h`
  }

  return `${hours} h ${String(
    remainingMinutes
  ).padStart(2, '0')}`
}

const formatTime = (
  time: string | null
) => {
  if (!time) {
    return '--:--'
  }

  return time.slice(0, 5)
}

const getPauseDuration = (
  pauseStart: string | null,
  pauseEnd: string | null
) => {
  if (
    !pauseStart ||
    !pauseEnd
  ) {
    return 'Aucune'
  }

  const toMinutes = (
    time: string
  ) => {
    const [hours, minutes] =
      time
        .slice(0, 5)
        .split(':')
        .map(Number)

    return (
      hours * 60 +
      minutes
    )
  }

  const duration =
    toMinutes(pauseEnd) -
    toMinutes(pauseStart)

  if (duration <= 0) {
    return 'Aucune'
  }

  return formatWorkedTime(duration)
}

const formatDate = (
  date: string
) => {
  const value =
    new Date(
      `${date}T12:00:00`
    )

  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }
  ).format(value)
}

const getDay = (
  date: string
) => {
  return date.split('-')[2]
}

const getMonth = (
  date: string
) => {
  const value =
    new Date(
      `${date}T12:00:00`
    )

  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      month: 'short',
    }
  )
    .format(value)
    .replace('.', '')
    .toUpperCase()
}

const getCompanyName = (
  entry: TimeEntry
) => {
  return (
    entry.company?.name ??
    'Société non renseignée'
  )
}

const getStatusLabel = (
  status: string
) => {
  if (status === 'validated') {
    return 'Validé'
  }

  if (status === 'rejected') {
    return 'Refusé'
  }

  return 'Enregistré'
}

const removeEntry = async (
  id: string
) => {
  const confirmed =
    window.confirm(
      'Supprimer ces horaires ?'
    )

  if (!confirmed) {
    return
  }

  const {
    error,
  } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(error)

    window.alert(
      'Impossible de supprimer ces horaires.'
    )

    return
  }

  await loadEntries()
}

onMounted(async () => {
  await loadEntries()
})
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

/* FILTRES */

.filter-card {
  display: flex;

  gap: 8px;

  margin-bottom: 16px;

  overflow-x: auto;

  scrollbar-width: none;
}

.filter-card::-webkit-scrollbar {
  display: none;
}

.filter-button {
  min-height: 40px;

  flex-shrink: 0;

  padding: 0 16px;

  border: none;
  border-radius: 999px;

  background: white;
  color: #746e6a;

  font-family: inherit;

  font-weight: 600;

  cursor: pointer;
}

.filter-button.active {
  background: #17372f;
  color: white;
}

/* LISTE */

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
  margin: 5px 0 0;

  font-size: 12px;

  color: #99918c;
}

/* SOCIÉTÉ */

.company-name {
  width: fit-content;

  margin-top: 6px;

  padding: 4px 8px;

  border-radius: 999px;

  background: #f1e3dc;

  color: #8c5c4b;

  font-size: 10px;
  font-weight: 700;
}

/* STATUT */

.status {
  height: fit-content;

  flex-shrink: 0;

  padding: 5px 8px;

  border-radius: 999px;

  font-size: 10px;
  font-weight: 700;

  white-space: nowrap;
}

.status.pending {
  background: #f7eee5;

  color: #9d6c51;
}

.status.validated {
  background: #e9f2ec;

  color: #4f765f;
}

.status.rejected {
  background: #f8e6e3;

  color: #a34f43;
}

/* BAS CARTE */

.entry-bottom {
  margin-top: 14px;

  padding-top: 12px;

  border-top:
    1px solid
    #f0ebe7;

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

/* SUPPRIMER */

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

/* VIDE */

.empty-card {
  padding: 42px 25px;

  background: white;

  border:
    1px solid
    #ede5df;

  border-radius: 24px;

  text-align: center;
}

.empty-icon {
  width: 62px;
  height: 62px;

  margin:
    0
    auto
    18px;

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

</style>