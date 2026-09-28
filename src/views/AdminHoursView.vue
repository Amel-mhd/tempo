<template>
  <main class="admin-hours-page">
    <section class="page-shell">

      <!-- HEADER -->
      <header class="topbar">
        <p class="eyebrow">
          Suivi des vacations
        </p>

        <h1>Pointages</h1>

        <p class="subtitle">
          Consultez et gérez les vacations de vos employés.
        </p>
      </header>

      <!-- RÉSUMÉ -->
      <section class="global-summary">

        <div>
          <span>Vacations</span>

          <strong>
            {{ validFilteredPunches.length }}
          </strong>
        </div>

        <div>
          <span>Montant</span>

          <strong>
            {{ formatMoney(totalAmount) }}
          </strong>
        </div>

      </section>

      <!-- FILTRES -->
      <section class="filters-card">

        <!-- MOIS -->
        <div class="filter-field">
          <label for="month">
            Mois
          </label>

          <input
            id="month"
            v-model="selectedMonth"
            type="month"
          />
        </div>

        <!-- EMPLOYÉ -->
        <div class="filter-field">
          <label for="employee">
            Employé
          </label>

          <select
            id="employee"
            v-model="selectedEmployeeId"
          >
            <option value="">
              Tous les employés
            </option>

            <option
              v-for="employee in employees"
              :key="employee.id"
              :value="employee.id"
            >
              {{ employee.first_name }}
              {{ employee.last_name }}
            </option>
          </select>
        </div>

        <!-- POSTE -->
        <div class="filter-field">
          <label for="post">
            Poste
          </label>

          <select
            id="post"
            v-model="selectedPostId"
          >
            <option value="">
              Tous les postes
            </option>

            <option
              v-for="post in posts"
              :key="post.id"
              :value="post.id"
            >
              {{ serviceLabel(post.service_type) }}
              ·
              {{ post.site_name }}
            </option>
          </select>
        </div>

        <!-- STATUT -->
        <div class="filter-field">
          <label for="status">
            Statut
          </label>

          <select
            id="status"
            v-model="selectedStatus"
          >
            <option value="">
              Tous les statuts
            </option>

            <option value="validated">
              Validé
            </option>

            <option value="contested">
              Contesté
            </option>
          </select>
        </div>

      </section>

      <!-- CHARGEMENT -->
      <section
        v-if="loading"
        class="state-card"
      >
        Chargement...
      </section>

      <!-- ERREUR -->
      <section
        v-else-if="errorMessage"
        class="state-card error"
      >
        {{ errorMessage }}
      </section>

      <!-- AUCUN POINTAGE -->
      <section
        v-else-if="employeeSummaries.length === 0"
        class="state-card"
      >
        Aucune vacation enregistrée pour ce mois.
      </section>

      <!-- LISTE EMPLOYÉS -->
      <section
        v-else
        class="employee-list"
      >

        <article
          v-for="employee in employeeSummaries"
          :key="employee.id"
          class="employee-card"
        >

          <!-- RÉSUMÉ EMPLOYÉ -->
          <button
            type="button"
            class="employee-summary"
            @click="toggleEmployee(employee.id)"
          >

            <div class="employee-main">

              <div class="avatar">
                {{ employee.initial }}
              </div>

              <div class="employee-identity">

                <h2>
                  {{ employee.fullName }}
                </h2>

                <p>
                  {{ employee.postNames }}
                </p>

              </div>

            </div>

            <!-- STATISTIQUES -->
            <div class="employee-stats">

              <div>
                <span>
                  Aujourd'hui
                </span>

                <strong>
                  {{ employee.todayCount }}
                  vac.
                </strong>
              </div>

              <div>
                <span>
                  Ce mois
                </span>

                <strong>
                  {{ employee.validCount }}
                  vac.
                </strong>
              </div>

              <div>
                <span>
                  Montant
                </span>

                <strong>
                  {{ formatMoney(employee.totalAmount) }}
                </strong>
              </div>

            </div>

            <span class="arrow">
              {{
                expandedEmployeeId === employee.id
                  ? '⌃'
                  : '⌄'
              }}
            </span>

          </button>

          <!-- DÉTAILS -->
          <div
            v-if="expandedEmployeeId === employee.id"
            class="details"
          >

            <article
              v-for="punch in employee.punches"
              :key="punch.id"
              class="punch-row"
              :class="{
                contested:
                  punch.status === 'contested'
              }"
            >

              <!-- DATE / STATUT -->
              <div class="punch-top">

                <div>
                  <strong class="punch-date">
                    {{ formatDate(punch.work_date) }}
                  </strong>

                  <span class="punch-post">
                    {{ serviceLabel(punch.post.service_type) }}
                    ·
                    {{ punch.post.site_name }}
                  </span>
                </div>

                <span
                  class="status-badge"
                  :class="punch.status"
                >
                  {{ statusLabel(punch.status) }}
                </span>

              </div>

              <!-- VACATION -->
              <div class="vacation-line">

                <div class="vacation-name">

                  <span class="vacation-icon">
                    {{ vacationIcon(punch.vacation_type) }}
                  </span>

                  <div>
                    <span>
                      Vacation
                    </span>

                    <strong>
                      {{ vacationLabel(punch.vacation_type) }}
                    </strong>
                  </div>

                </div>

                <strong
                  class="rate"
                  :class="{
                    crossed:
                      punch.status === 'contested'
                  }"
                >
                  {{ formatMoney(punch.applied_rate) }}
                </strong>

              </div>

              <!-- HEURES -->
              <div class="time-grid">

                <div>
                  <span>
                    Prévu
                  </span>

                  <strong>
                    {{
                      punch.scheduled_time
                        ? formatScheduledTime(
                            punch.scheduled_time
                          )
                        : '—'
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Pointé
                  </span>

                  <strong>
                    {{ formatPunchTime(punch.punched_at) }}
                  </strong>
                </div>

              </div>

              <!-- CONTESTÉ -->
              <div
                v-if="punch.status === 'contested'"
                class="contested-message"
              >
                Cette vacation n'est pas comptabilisée dans le montant.
              </div>

              <!-- ACTION -->
              <div class="punch-actions">

                <button
                  v-if="punch.status !== 'contested'"
                  type="button"
                  class="contest-button"
                  :disabled="updatingPunchId === punch.id"
                  @click="contestPunch(punch)"
                >
                  {{
                    updatingPunchId === punch.id
                      ? 'Modification...'
                      : 'Contester la vacation'
                  }}
                </button>

                <button
                  v-else
                  type="button"
                  class="restore-button"
                  :disabled="updatingPunchId === punch.id"
                  @click="restorePunch(punch)"
                >
                  {{
                    updatingPunchId === punch.id
                      ? 'Modification...'
                      : 'Rétablir la vacation'
                  }}
                </button>

              </div>

            </article>

          </div>

        </article>

      </section>

    </section>

    <AdminBottomNav />
  </main>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue'

import {
  supabase,
} from '../lib/supabase'

import AdminBottomNav
  from '../components/AdminBottomNav.vue'

/* =========================
   TYPES
========================= */

type ServiceType =
  | 'security'
  | 'cleaning'

type VacationType =
  | 'midi'
  | 'soir'
  | 'jour'

type PunchStatus =
  | 'validated'
  | 'contested'

interface Employee {
  id: string
  first_name: string
  last_name: string
}

interface Post {
  id: string
  service_type: ServiceType
  site_name: string
}

interface Punch {
  id: string

  employee_id: string

  post_id: string

  vacation_type:
    VacationType

  work_date: string

  scheduled_time:
    string | null

  punched_at: string

  applied_rate: number

  status:
    PunchStatus

  post:
    Post
}

/* =========================
   DONNÉES
========================= */

const loading =
  ref(true)

const errorMessage =
  ref('')

const employees =
  ref<Employee[]>([])

const posts =
  ref<Post[]>([])

const punches =
  ref<Punch[]>([])

const expandedEmployeeId =
  ref<string | null>(null)

const updatingPunchId =
  ref<string | null>(null)

/* =========================
   FILTRES
========================= */

const now =
  new Date()

const selectedMonth =
  ref(
    `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}`
  )

const selectedEmployeeId =
  ref('')

const selectedPostId =
  ref('')

const selectedStatus =
  ref('')

/* =========================
   DATES DU MOIS
========================= */

const monthStart =
  computed(() => {
    return `${selectedMonth.value}-01`
  })

const monthEnd =
  computed(() => {

    const [
      year,
      month,
    ] =
      selectedMonth.value
        .split('-')
        .map(Number)

    const lastDay =
      new Date(
        year,
        month,
        0
      ).getDate()

    return `${selectedMonth.value}-${String(
      lastDay
    ).padStart(2, '0')}`
  })

/* =========================
   AUJOURD'HUI
   HEURE FRANÇAISE
========================= */

const today =
  computed(() => {

    const parts =
      new Intl.DateTimeFormat(
        'fr-FR',
        {
          timeZone:
            'Europe/Paris',

          year:
            'numeric',

          month:
            '2-digit',

          day:
            '2-digit',
        }
      )
        .formatToParts(
          new Date()
        )

    const year =
      parts.find(
        (part) =>
          part.type === 'year'
      )?.value

    const month =
      parts.find(
        (part) =>
          part.type === 'month'
      )?.value

    const day =
      parts.find(
        (part) =>
          part.type === 'day'
      )?.value

    return `${year}-${month}-${day}`
  })

/* =========================
   CHARGER LES DONNÉES
========================= */

const loadData =
  async () => {

    loading.value =
      true

    errorMessage.value =
      ''

    /* EMPLOYÉS */

    const {
      data: employeeData,
      error: employeeError,
    } =
      await supabase
        .from('employees')
        .select(`
          id,
          first_name,
          last_name
        `)
        .order(
          'first_name'
        )

    if (employeeError) {

      console.error(
        'Erreur employés :',
        employeeError
      )

      errorMessage.value =
        'Impossible de charger les employés.'

      loading.value =
        false

      return
    }

    employees.value =
      employeeData ?? []

    /* POSTES */

    const {
      data: postData,
      error: postError,
    } =
      await supabase
        .from('posts')
        .select(`
          id,
          service_type,
          site_name
        `)
        .eq(
          'active',
          true
        )
        .order(
          'site_name'
        )

    if (postError) {

      console.error(
        'Erreur postes :',
        postError
      )

      errorMessage.value =
        'Impossible de charger les postes.'

      loading.value =
        false

      return
    }

    posts.value =
      (postData ?? [])
        as Post[]

    /* POINTAGES */

    const {
      data: punchData,
      error: punchError,
    } =
      await supabase
        .from('punches')
        .select(`
          id,
          employee_id,
          post_id,
          vacation_type,
          work_date,
          scheduled_time,
          punched_at,
          applied_rate,
          status,
          post:posts (
            id,
            service_type,
            site_name
          )
        `)
        .gte(
          'work_date',
          monthStart.value
        )
        .lte(
          'work_date',
          monthEnd.value
        )
        .order(
          'work_date',
          {
            ascending:
              false,
          }
        )
        .order(
          'punched_at',
          {
            ascending:
              false,
          }
        )

    if (punchError) {

      console.error(
        'Erreur pointages :',
        punchError
      )

      errorMessage.value =
        'Impossible de charger les pointages.'

      loading.value =
        false

      return
    }

    punches.value =
      (punchData ?? [])
        .map(
          (punch: any) => {

            const post =
              Array.isArray(
                punch.post
              )
                ? punch.post[0]
                : punch.post

            return {
              ...punch,

              applied_rate:
                Number(
                  punch.applied_rate ??
                  0
                ),

              /*
                Si une ancienne ligne
                avait le statut
                "suspicious", on la
                traite simplement comme
                validée dans l'interface.
              */
              status:
                punch.status ===
                'contested'
                  ? 'contested'
                  : 'validated',

              post,
            }
          }
        )
        .filter(
          (punch) =>
            punch.post
        ) as Punch[]

    loading.value =
      false
  }

/* =========================
   FILTRER LES POINTAGES
========================= */

const filteredPunches =
  computed(() => {

    return punches.value.filter(
      (punch) => {

        if (
          selectedEmployeeId.value &&
          punch.employee_id !==
            selectedEmployeeId.value
        ) {
          return false
        }

        if (
          selectedPostId.value &&
          punch.post_id !==
            selectedPostId.value
        ) {
          return false
        }

        if (
          selectedStatus.value &&
          punch.status !==
            selectedStatus.value
        ) {
          return false
        }

        return true
      }
    )
  })

/* =========================
   POINTAGES COMPTABILISÉS
========================= */

const validFilteredPunches =
  computed(() => {

    return filteredPunches.value.filter(
      (punch) =>
        punch.status !==
        'contested'
    )
  })

/* =========================
   MONTANT TOTAL
========================= */

const totalAmount =
  computed(() => {

    return validFilteredPunches.value.reduce(
      (total, punch) => {

        return (
          total +
          Number(
            punch.applied_rate
          )
        )
      },
      0
    )
  })

/* =========================
   RÉCAP PAR EMPLOYÉ
========================= */

const employeeSummaries =
  computed(() => {

    return employees.value

      .filter(
        (employee) => {

          if (
            selectedEmployeeId.value &&
            employee.id !==
              selectedEmployeeId.value
          ) {
            return false
          }

          return true
        }
      )

      .map(
        (employee) => {

          const employeePunches =
            filteredPunches.value.filter(
              (punch) =>
                punch.employee_id ===
                employee.id
            )

          const validPunches =
            employeePunches.filter(
              (punch) =>
                punch.status !==
                'contested'
            )

          /* AUJOURD'HUI */

          const todayCount =
            validPunches.filter(
              (punch) =>
                punch.work_date ===
                today.value
            ).length

          /* MONTANT */

          const employeeAmount =
            validPunches.reduce(
              (total, punch) => {

                return (
                  total +
                  Number(
                    punch.applied_rate
                  )
                )
              },
              0
            )

          /* POSTES */

          const postNames =
            Array.from(
              new Set(
                employeePunches.map(
                  (punch) => {

                    return (
                      `${serviceLabel(
                        punch.post.service_type
                      )} · ${
                        punch.post.site_name
                      }`
                    )
                  }
                )
              )
            )

          return {
            id:
              employee.id,

            fullName:
              `${employee.first_name} ${employee.last_name}`,

            initial:
              employee.first_name
                ?.charAt(0)
                .toUpperCase() ||
              '?',

            todayCount,

            validCount:
              validPunches.length,

            totalAmount:
              employeeAmount,

            postNames:
              postNames.length
                ? postNames.join(
                    ' • '
                  )
                : 'Aucun poste',

            punches:
              employeePunches,
          }
        }
      )

      .filter(
        (employee) =>
          employee.punches.length >
          0
      )
  })

/* =========================
   OUVRIR / FERMER EMPLOYÉ
========================= */

const toggleEmployee = (
  employeeId: string
) => {

  expandedEmployeeId.value =
    expandedEmployeeId.value ===
    employeeId
      ? null
      : employeeId
}

/* =========================
   CONTESTER UNE VACATION
========================= */

const contestPunch =
  async (
    punch: Punch
  ) => {

    const confirmed =
      window.confirm(
        `Contester la vacation ${vacationLabel(
          punch.vacation_type
        )} du ${formatDate(
          punch.work_date
        )} ?`
      )

    if (!confirmed) {
      return
    }

    updatingPunchId.value =
      punch.id

    const {
      error,
    } =
      await supabase
        .from('punches')
        .update({
          status:
            'contested',
        })
        .eq(
          'id',
          punch.id
        )

    updatingPunchId.value =
      null

    if (error) {

      console.error(
        'Erreur contestation :',
        error
      )

      window.alert(
        'Impossible de contester cette vacation.'
      )

      return
    }

    punch.status =
      'contested'
  }

/* =========================
   RÉTABLIR UNE VACATION
========================= */

const restorePunch =
  async (
    punch: Punch
  ) => {

    const confirmed =
      window.confirm(
        `Rétablir la vacation ${vacationLabel(
          punch.vacation_type
        )} du ${formatDate(
          punch.work_date
        )} ?`
      )

    if (!confirmed) {
      return
    }

    updatingPunchId.value =
      punch.id

    const {
      error,
    } =
      await supabase
        .from('punches')
        .update({
          status:
            'validated',

          anomaly_reason:
            null,
        })
        .eq(
          'id',
          punch.id
        )

    updatingPunchId.value =
      null

    if (error) {

      console.error(
        'Erreur rétablissement :',
        error
      )

      window.alert(
        'Impossible de rétablir cette vacation.'
      )

      return
    }

    punch.status =
      'validated'
  }

/* =========================
   SERVICE
========================= */

const serviceLabel = (
  service:
    ServiceType
) => {

  return service ===
    'security'
      ? 'Sécurité'
      : 'Ménage'
}

/* =========================
   VACATION
========================= */

const vacationLabel = (
  vacation:
    VacationType
) => {

  if (
    vacation ===
    'midi'
  ) {
    return 'Midi'
  }

  if (
    vacation ===
    'soir'
  ) {
    return 'Soir'
  }

  return 'Journée'
}

const vacationIcon = (
  vacation:
    VacationType
) => {

  if (
    vacation ===
    'midi'
  ) {
    return '☀️'
  }

  if (
    vacation ===
    'soir'
  ) {
    return '🌙'
  }

  return '✨'
}

/* =========================
   STATUT
========================= */

const statusLabel = (
  status:
    PunchStatus
) => {

  if (
    status ===
    'contested'
  ) {
    return 'Contesté'
  }

  return 'Validé'
}

/* =========================
   ARGENT
========================= */

const formatMoney = (
  value: number
) => {

  return new Intl.NumberFormat(
    'fr-FR',
    {
      style:
        'currency',

      currency:
        'EUR',
    }
  ).format(
    Number(value)
  )
}

/* =========================
   DATE
========================= */

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
        weekday:
          'short',

        day:
          'numeric',

        month:
          'short',
      }
    ).format(
      value
    )

  return (
    formatted
      .charAt(0)
      .toUpperCase() +
    formatted.slice(1)
  )
}

/* =========================
   HEURE PRÉVUE
========================= */

const formatScheduledTime = (
  time: string
) => {

  return time
    .slice(0, 5)
    .replace(
      ':',
      'h'
    )
}

/* =========================
   HEURE RÉELLE
========================= */

const formatPunchTime = (
  timestamp: string
) => {

  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      hour:
        '2-digit',

      minute:
        '2-digit',

      hour12:
        false,

      timeZone:
        'Europe/Paris',
    }
  )
    .format(
      new Date(
        timestamp
      )
    )
    .replace(
      ':',
      'h'
    )
}

/* =========================
   CHANGEMENT DE MOIS
========================= */

watch(
  selectedMonth,
  async () => {

    expandedEmployeeId.value =
      null

    await loadData()
  }
)

/* =========================
   DÉMARRAGE
========================= */

onMounted(
  async () => {
    await loadData()
  }
)
</script>

<style scoped>
* {
  box-sizing: border-box;
}

/* PAGE */

.admin-hours-page {
  min-height: 100vh;

  padding:
    28px
    18px
    120px;

  background:
    #f7f1ec;

  color:
    #1d2c27;
}

.page-shell {
  width: 100%;

  max-width:
    560px;

  margin:
    0 auto;
}

/* HEADER */

.topbar {
  margin-bottom:
    20px;
}

.eyebrow {
  margin:
    0
    0
    5px;

  color:
    #9b8174;

  font-size:
    10px;

  font-weight:
    700;

  text-transform:
    uppercase;

  letter-spacing:
    1.2px;
}

h1 {
  margin: 0;

  color:
    #17372f;

  font-family:
    Georgia,
    'Times New Roman',
    serif;

  font-size:
    30px;

  font-weight:
    400;
}

.subtitle {
  margin:
    7px
    0
    0;

  color:
    #7d7874;

  font-size:
    12px;

  line-height:
    1.4;
}

/* RÉSUMÉ */

.global-summary {
  display:
    grid;

  grid-template-columns:
    repeat(2, 1fr);

  margin-bottom:
    15px;

  overflow:
    hidden;

  border-radius:
    20px;

  background:
    #17372f;

  color:
    white;
}

.global-summary div {
  padding:
    17px
    14px;
}

.global-summary div + div {
  border-left:
    1px solid
    rgba(
      255,
      255,
      255,
      0.14
    );
}

.global-summary span {
  display:
    block;

  margin-bottom:
    5px;

  font-size:
    9px;

  opacity:
    0.65;
}

.global-summary strong {
  font-size:
    16px;
}

/* FILTRES */

.filters-card {
  display:
    grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap:
    12px;

  margin-bottom:
    16px;

  padding:
    16px;

  border:
    1px solid
    #ebe4df;

  border-radius:
    20px;

  background:
    white;
}

.filter-field {
  display:
    flex;

  flex-direction:
    column;
}

.filter-field label {
  margin-bottom:
    6px;

  color:
    #17372f;

  font-size:
    10px;

  font-weight:
    700;
}

.filter-field input,
.filter-field select {
  width:
    100%;

  min-height:
    44px;

  padding:
    0 11px;

  border:
    1px solid
    #e5ddd8;

  border-radius:
    12px;

  background:
    #faf7f4;

  color:
    #17372f;

  font:
    inherit;

  font-size:
    11px;
}

/* ÉTATS */

.state-card {
  padding:
    20px;

  border:
    1px solid
    #ebe4df;

  border-radius:
    20px;

  background:
    white;

  color:
    #7d7874;

  font-size:
    12px;
}

.state-card.error {
  background:
    #f9e7e3;

  color:
    #a84f40;
}

/* LISTE */

.employee-list {
  display:
    flex;

  flex-direction:
    column;

  gap:
    13px;
}

/* CARTE EMPLOYÉ */

.employee-card {
  overflow:
    hidden;

  border:
    1px solid
    #ebe4df;

  border-radius:
    23px;

  background:
    white;
}

.employee-summary {
  width:
    100%;

  display:
    flex;

  flex-direction:
    column;

  gap:
    14px;

  padding:
    17px;

  border:
    none;

  background:
    transparent;

  text-align:
    left;

  font-family:
    inherit;

  cursor:
    pointer;
}

/* IDENTITÉ */

.employee-main {
  display:
    flex;

  align-items:
    center;

  gap:
    11px;
}

.avatar {
  width:
    40px;

  height:
    40px;

  flex-shrink:
    0;

  display:
    grid;

  place-items:
    center;

  border-radius:
    50%;

  background:
    #17372f;

  color:
    white;

  font-size:
    15px;

  font-weight:
    700;
}

.employee-identity {
  min-width:
    0;
}

.employee-main h2 {
  margin:
    0;

  color:
    #17372f;

  font-size:
    15px;
}

.employee-main p {
  margin:
    3px
    0
    0;

  color:
    #918984;

  font-size:
    9px;

  line-height:
    1.4;
}

/* STATS EMPLOYÉ */

.employee-stats {
  display:
    grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap:
    7px;
}

.employee-stats div {
  padding:
    10px
    8px;

  border-radius:
    13px;

  background:
    #f8f3ef;
}

.employee-stats span {
  display:
    block;

  margin-bottom:
    4px;

  color:
    #948b85;

  font-size:
    8px;
}

.employee-stats strong {
  color:
    #17372f;

  font-size:
    11px;
}

.arrow {
  align-self:
    flex-end;

  color:
    #9b8174;

  font-size:
    17px;
}

/* DÉTAILS */

.details {
  border-top:
    1px solid
    #eee7e2;
}

.punch-row {
  padding:
    16px
    17px;

  border-bottom:
    1px solid
    #f1ebe7;
}

.punch-row:last-child {
  border-bottom:
    none;
}

.punch-row.contested {
  background:
    #fcf8f7;
}

/* DATE */

.punch-top {
  display:
    flex;

  align-items:
    flex-start;

  justify-content:
    space-between;

  gap:
    12px;
}

.punch-top > div {
  display:
    flex;

  flex-direction:
    column;

  gap:
    3px;
}

.punch-date {
  color:
    #17372f;

  font-size:
    11px;
}

.punch-post {
  color:
    #9b8174;

  font-size:
    9px;
}

/* STATUT */

.status-badge {
  flex-shrink:
    0;

  padding:
    5px
    8px;

  border-radius:
    999px;

  font-size:
    8px;

  font-weight:
    700;
}

.status-badge.validated {
  background:
    #e5f0e9;

  color:
    #416b56;
}

.status-badge.contested {
  background:
    #f8e2df;

  color:
    #a84f40;
}

/* VACATION */

.vacation-line {
  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    15px;

  margin-top:
    13px;
}

.vacation-name {
  display:
    flex;

  align-items:
    center;

  gap:
    9px;
}

.vacation-icon {
  width:
    34px;

  height:
    34px;

  display:
    grid;

  place-items:
    center;

  border-radius:
    10px;

  background:
    #f7f1ec;

  font-size:
    15px;
}

.vacation-name > div {
  display:
    flex;

  flex-direction:
    column;

  gap:
    2px;
}

.vacation-name span {
  color:
    #99918c;

  font-size:
    8px;
}

.vacation-name strong {
  color:
    #17372f;

  font-size:
    11px;
}

/* TARIF */

.rate {
  color:
    #c86449;

  font-size:
    14px;
}

.rate.crossed {
  color:
    #a9a09a;

  text-decoration:
    line-through;
}

/* HEURES */

.time-grid {
  display:
    grid;

  grid-template-columns:
    repeat(2, 1fr);

  margin-top:
    12px;

  padding:
    11px
    0;

  border-top:
    1px solid
    #f0ebe7;

  border-bottom:
    1px solid
    #f0ebe7;
}

.time-grid div {
  display:
    flex;

  flex-direction:
    column;

  gap:
    3px;
}

.time-grid div + div {
  padding-left:
    15px;

  border-left:
    1px solid
    #eee7e2;
}

.time-grid span {
  color:
    #99918c;

  font-size:
    8px;

  text-transform:
    uppercase;
}

.time-grid strong {
  color:
    #17372f;

  font-size:
    11px;
}

/* CONTESTÉ */

.contested-message {
  margin-top:
    10px;

  padding:
    9px
    10px;

  border-radius:
    10px;

  background:
    #f9e8e5;

  color:
    #a84f40;

  font-size:
    9px;

  line-height:
    1.4;
}

/* ACTIONS */

.punch-actions {
  margin-top:
    11px;
}

.contest-button,
.restore-button {
  width:
    100%;

  min-height:
    38px;

  border-radius:
    11px;

  font-family:
    inherit;

  font-size:
    10px;

  font-weight:
    700;

  cursor:
    pointer;
}

.contest-button {
  border:
    1px solid
    #e5c6bf;

  background:
    #fbefec;

  color:
    #a84f40;
}

.restore-button {
  border:
    1px solid
    #bfd5c8;

  background:
    #edf5f0;

  color:
    #31594c;
}

.contest-button:disabled,
.restore-button:disabled {
  opacity:
    0.5;

  cursor:
    wait;
}

/* MOBILE */

@media (
  max-width: 400px
) {

  .admin-hours-page {
    padding-left:
      14px;

    padding-right:
      14px;
  }

  .filters-card {
    grid-template-columns:
      1fr;
  }

  .global-summary {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .employee-stats {
    grid-template-columns:
      repeat(3, 1fr);
  }
}
</style>