<template>

  <main class="hours-page">

    <!-- HEADER -->

    <header class="topbar">

      <div>

        <p class="eyebrow">

          Historique

        </p>

        <h1>Mes vacations</h1>

        <p class="subtitle">

          Retrouve toutes tes vacations pointées

        </p>

      </div>

    </header>

    <!-- RÉSUMÉ -->

    <section class="summary-card">

      <div>

        <span>Vacations</span>

        <strong>{{ validPunches.length }}</strong>

      </div>

      <div class="summary-separator"></div>

      <div>

        <span>Montant</span>

        <strong>

          {{ formatMoney(totalAmount) }}

        </strong>

      </div>

    </section>

    <!-- FILTRES -->

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

          active:

            selectedFilter === filter.id

        }"

        @click="

          selectedFilter = filter.id

        "

      >

        {{ filter.name }}

      </button>

    </section>

    <!-- CHARGEMENT -->

    <section

      v-if="loading"

      class="empty-card"

    >

      <p>

        Chargement des vacations...

      </p>

    </section>

    <!-- LISTE -->

    <section

      v-else-if="

        filteredPunches.length > 0

      "

      class="vacations-list"

    >

      <article

        v-for="punch in filteredPunches"

        :key="punch.id"

        class="vacation-card"

        :class="{

          contested:

            punch.status === 'contested'

        }"

      >

        <!-- DATE -->

        <div class="date-box">

          <strong>

            {{ getDay(punch.work_date) }}

          </strong>

          <span>

            {{ getMonth(punch.work_date) }}

          </span>

        </div>

        <!-- CONTENU -->

        <div class="vacation-content">

          <div class="vacation-top">

            <div>

              <h2>

                {{

                  serviceLabel(

                    punch.post.service_type

                  )

                }}

              </h2>

              <div class="site-name">

                {{ punch.post.site_name }}

              </div>

            </div>

            <span

              class="status"

              :class="punch.status"

            >

              {{

                getStatusLabel(

                  punch.status

                )

              }}

            </span>

          </div>

          <!-- TYPE VACATION -->

          <div class="vacation-details">

            <div>

              <span class="detail-label">
                {{ isPortSaintLouisPunch(punch) ? 'Durée' : 'Vacation' }}
              </span>
              <strong>
                {{
                  isPortSaintLouisPunch(punch)
                    ? portSaintLouisHours(punch.work_date)
                    : vacationLabel(punch.vacation_type)
                }}
              </strong>

            </div>

            <div v-if="isPortSaintLouisPunch(punch)">
              <span class="detail-label">Tarif</span>
              <strong>15,00 € / h</strong>
            </div>

            <div v-else-if="punch.scheduled_time">
              <span class="detail-label">Prévu</span>
              <strong>{{ formatScheduledTime(punch.scheduled_time) }}</strong>
            </div>

            <div>

              <span class="detail-label">

                Pointé

              </span>

              <strong>

                {{

                  formatPunchTime(

                    punch.punched_at

                  )

                }}

              </strong>

            </div>

          </div>

          <!-- BAS -->

          <div class="vacation-bottom">

            <div>

              <span>

                {{ formatDate(punch.work_date) }}

              </span>

              <small

                v-if="

                  punch.status ===

                  'contested'

                "

              >

                Cette vacation n'est pas

                comptabilisée.

              </small>

              <small

                v-else-if="

                  punch.status ===

                  'suspicious'

                "

              >

                Pointage à vérifier

              </small>

            </div>

            <strong

              :class="{

                crossed:

                  punch.status ===

                  'contested'

              }"

            >

              {{

                formatMoney(

                  punch.applied_rate

                )

              }}

            </strong>

          </div>

        </div>

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

      <h2>

        Aucune vacation

      </h2>

      <p>

        Tes vacations pointées

        apparaîtront ici.

      </p>

      <RouterLink

        to="/home"

        class="add-button"

      >

        Pointer une vacation

      </RouterLink>

    </section>

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

import EmployeeBottomNav

  from '../components/EmployeeBottomNav.vue'

import {

  supabase,

} from '../lib/supabase'

type ServiceType =

  | 'security'

  | 'cleaning'

type VacationType =

  | 'midi'

  | 'soir'

  | 'jour'

type PunchStatus =

  | 'validated'

  | 'suspicious'

  | 'contested'

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

  anomaly_reason:

    string | null

  post: Post

}

interface Filter {

  id: string

  name: string

}

const router =

  useRouter()

const punches =

  ref<Punch[]>([])

const loading =

  ref(true)

const selectedFilter =

  ref('all')

/* =========================

   FILTRES

========================= */

const filters =

  computed<Filter[]>(() => {

    const posts =

      new Map<

        string,

        string

      >()

    punches.value.forEach(

      (punch) => {

        if (

          punch.post_id &&

          punch.post

        ) {

          posts.set(

            punch.post_id,

            punch.post.site_name

          )

        }

      }

    )

    return [

      {

        id: 'all',

        name: 'Toutes',

      },

      ...Array.from(

        posts.entries()

      ).map(

        ([id, name]) => ({

          id,

          name,

        })

      ),

    ]

  })

/* =========================

   VACATIONS VALIDES

========================= */

const validPunches =

  computed(() => {

    return punches.value.filter(

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

    return validPunches.value.reduce(

      (total, punch) =>

        total +

        Number(

          punch.applied_rate ?? 0

        ),

      0

    )

  })

/* =========================

   LISTE FILTRÉE

========================= */

const filteredPunches =

  computed(() => {

    const list =

      selectedFilter.value ===

      'all'

        ? punches.value

        : punches.value.filter(

            (punch) =>

              punch.post_id ===

              selectedFilter.value

          )

    return [...list].sort(

      (a, b) => {

        const dateCompare =

          b.work_date.localeCompare(

            a.work_date

          )

        if (

          dateCompare !== 0

        ) {

          return dateCompare

        }

        return (

          b.punched_at ?? ''

        ).localeCompare(

          a.punched_at ?? ''

        )

      }

    )

  })

/* =========================

   CHARGEMENT

========================= */

const loadPunches =

  async () => {

    loading.value = true

    const {

      data: { user },

    } =

      await supabase.auth.getUser()

    if (!user) {

      loading.value = false

      await router.push('/')

      return

    }

    /*

      On récupère l'employé

      correspondant au compte.

    */

    const {

      data: employee,

      error: employeeError,

    } =

      await supabase

        .from('employees')

        .select('id')

        .eq(

          'auth_user_id',

          user.id

        )

        .maybeSingle()

    if (employeeError) {

      console.error(

        employeeError

      )

      loading.value = false

      return

    }

    if (!employee) {

      punches.value = []

      loading.value = false

      return

    }

    /*

      Puis ses vacations.

    */

    const {

      data,

      error,

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

          anomaly_reason,

          post:posts (

            id,

            service_type,

            site_name

          )

        `)

        .eq(

          'employee_id',

          employee.id

        )

        .order(

          'work_date',

          {

            ascending: false,

          }

        )

        .order(

          'punched_at',

          {

            ascending: false,

          }

        )

    loading.value = false

    if (error) {

      console.error(error)

      return

    }

    punches.value =

      (data ?? []).map(

        (punch: any) => ({

          ...punch,

          applied_rate:

            Number(

              punch.applied_rate ??

              0

            ),

          post:

            Array.isArray(

              punch.post

            )

              ? punch.post[0]

              : punch.post,

        })

      ) as Punch[]

  }

/* =========================

   AFFICHAGE

========================= */

const isPortSaintLouisPunch = (punch: Punch) =>
  punch.post?.site_name === 'Port-Saint-Louis'

const portSaintLouisHours = (date: string) => {
  const day = new Date(`${date}T12:00:00`).getDay()
  if (day === 3) return '2 h'
  if (day === 0) return '1 h'
  return '—'
}

const serviceLabel = (

  service:

    ServiceType

) => {

  return service ===

    'security'

      ? 'Sécurité'

      : 'Ménage'

}

const vacationLabel = (

  type:

    VacationType

) => {

  if (type === 'midi') {

    return 'Midi'

  }

  if (type === 'soir') {

    return 'Soir'

  }

  return 'Journée'

}

const formatMoney = (

  value: number

) => {

  return (

    Number(value)

      .toFixed(2)

      .replace('.', ',') +

    ' €'

  )

}

const formatScheduledTime = (

  time: string | null

) => {

  if (!time) {

    return '—'

  }

  return time

    .slice(0, 5)

    .replace(':', 'h')

}

const formatPunchTime = (

  timestamp: string

) => {

  return new Intl.DateTimeFormat(

    'fr-FR',

    {

      hour: '2-digit',

      minute: '2-digit',

      hour12: false,

      timeZone:

        'Europe/Paris',

    }

  )

    .format(

      new Date(timestamp)

    )

    .replace(':', 'h')

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

const getStatusLabel = (

  status:

    PunchStatus

) => {

  if (

    status === 'validated'

  ) {

    return 'Validé'

  }

  if (

    status === 'suspicious'

  ) {

    return 'À vérifier'

  }

  if (

    status === 'contested'

  ) {

    return 'Contesté'

  }

  return 'Enregistré'

}

/* =========================

   DÉMARRAGE

========================= */

onMounted(

  async () => {

    await loadPunches()

  }

)

</script>

<style scoped>

* {

  box-sizing: border-box;

}

.hours-page {

  min-height: 100vh;

  padding:

    28px

    20px

    110px;

  background: #f7f1ec;

  color: #1d2c27;

}

.topbar,

.summary-card,

.filter-card,

.vacations-list,

.empty-card {

  width: 100%;

  max-width: 520px;

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

  text-transform: uppercase;

  letter-spacing: 1.3px;

  color: #9b8174;

}

.topbar h1 {

  margin: 0;

  font-family:

    Georgia,

    'Times New Roman',

    serif;

  font-size: 29px;

  font-weight: 400;

  color: #17372f;

}

.subtitle {

  margin: 5px 0 0;

  font-size: 13px;

  color: #7d7874;

}

/* RÉSUMÉ */

.summary-card {

  display: grid;

  grid-template-columns:

    1fr auto 1fr;

  align-items: center;

  margin-bottom: 18px;

  padding: 18px 20px;

  border-radius: 20px;

  background: #17372f;

  color: white;

}

.summary-card > div:not(

  .summary-separator

) {

  display: flex;

  flex-direction: column;

  gap: 4px;

}

.summary-card > div:last-child {

  text-align: right;

}

.summary-card span {

  font-size: 10px;

  opacity: 0.65;

}

.summary-card strong {

  font-size: 18px;

}

.summary-separator {

  width: 1px;

  height: 35px;

  margin: 0 20px;

  background:

    rgba(

      255,

      255,

      255,

      0.15

    );

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

  min-height: 39px;

  flex-shrink: 0;

  padding: 0 15px;

  border: none;

  border-radius: 999px;

  background: white;

  color: #746e6a;

  font: inherit;

  font-size: 11px;

  font-weight: 700;

  cursor: pointer;

}

.filter-button.active {

  background: #17372f;

  color: white;

}

/* LISTE */

.vacations-list {

  display: flex;

  flex-direction: column;

  gap: 11px;

}

.vacation-card {

  display: flex;

  gap: 13px;

  padding: 15px;

  border:

    1px solid #ede5df;

  border-radius: 22px;

  background: white;

}

.vacation-card.contested {

  opacity: 0.65;

}

/* DATE */

.date-box {

  width: 52px;

  height: 58px;

  flex-shrink: 0;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  border-radius: 15px;

  background: #f1e3dc;

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

/* CONTENU */

.vacation-content {

  min-width: 0;

  flex: 1;

}

.vacation-top {

  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  gap: 8px;

}

.vacation-top h2 {

  margin: 0;

  font-size: 14px;

  color: #17372f;

}

.site-name {

  width: fit-content;

  margin-top: 5px;

  padding: 4px 7px;

  border-radius: 999px;

  background: #f1e3dc;

  color: #8c5c4b;

  font-size: 9px;

  font-weight: 700;

}

/* STATUS */

.status {

  flex-shrink: 0;

  padding: 5px 7px;

  border-radius: 999px;

  font-size: 9px;

  font-weight: 700;

  white-space: nowrap;

}

.status.validated {

  background: #e9f2ec;

  color: #4f765f;

}

.status.suspicious {

  background: #f7eee5;

  color: #9d6c51;

}

.status.contested {

  background: #f8e6e3;

  color: #a34f43;

}

/* DETAILS */

.vacation-details {

  display: grid;

  grid-template-columns:

    repeat(3, 1fr);

  gap: 6px;

  margin-top: 13px;

  padding: 11px;

  border-radius: 14px;

  background: #faf7f5;

}

.vacation-details > div {

  min-width: 0;

  display: flex;

  flex-direction: column;

  gap: 3px;

}

.detail-label {

  font-size: 8px;

  text-transform: uppercase;

  color: #9c948f;

}

.vacation-details strong {

  font-size: 11px;

  color: #17372f;

}

/* BAS */

.vacation-bottom {

  display: flex;

  align-items: flex-end;

  justify-content: space-between;

  gap: 10px;

  margin-top: 12px;

  padding-top: 11px;

  border-top:

    1px solid #f0ebe7;

}

.vacation-bottom > div {

  display: flex;

  flex-direction: column;

  gap: 3px;

}

.vacation-bottom span {

  font-size: 9px;

  text-transform: capitalize;

  color: #918984;

}

.vacation-bottom small {

  font-size: 9px;

  color: #a34f43;

}

.vacation-bottom > strong {

  flex-shrink: 0;

  font-size: 15px;

  color: #17372f;

}

.vacation-bottom strong.crossed {

  text-decoration:

    line-through;

  color: #99918c;

}

/* VIDE */

.empty-card {

  padding: 40px 25px;

  border:

    1px solid #ede5df;

  border-radius: 24px;

  background: white;

  text-align: center;

}

.empty-icon {

  width: 60px;

  height: 60px;

  margin:

    0

    auto

    17px;

  display: grid;

  place-items: center;

  border-radius: 50%;

  background: #f1e3dc;

  color: #17372f;

  font-size: 28px;

}

.empty-card h2 {

  margin: 0;

  font-size: 18px;

  color: #17372f;

}

.empty-card p {

  margin: 8px 0 21px;

  font-size: 12px;

  line-height: 1.5;

  color: #8c8580;

}

.add-button {

  min-height: 46px;

  padding: 0 20px;

  display: inline-flex;

  align-items: center;

  justify-content: center;

  border-radius: 15px;

  background: #17372f;

  color: white;

  font-size: 12px;

  font-weight: 700;

  text-decoration: none;

}

@media (

  max-width: 600px

) {

  .hours-page {

    padding:

      24px

      15px

      110px;

  }

  .vacation-card {

    padding: 13px;

  }

  .date-box {

    width: 47px;

    height: 54px;

  }

  .vacation-details {

    gap: 4px;

    padding: 10px 8px;

  }

  .vacation-details strong {

    font-size: 10px;

  }

}

</style>