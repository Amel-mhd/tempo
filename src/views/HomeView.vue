<template>
  <main class="home-page">
    <section class="page-content">

      <!-- HEADER -->
      <header class="topbar">
        <div>
          <p class="eyebrow">Bonjour</p>

          <h1>
            {{ firstName || 'Bienvenue' }} 👋
          </h1>

          <p class="date">
            {{ todayLabel }}
          </p>
        </div>

        <RouterLink
          to="/profile"
          class="profile-button"
        >
          {{ initial }}
        </RouterLink>
      </header>

      <!-- RÉSUMÉ -->
      <section class="hero-card">
        <p class="hero-label">
          Aujourd’hui
        </p>

        <h2>
          {{ todayPunches.length }}
          {{ todayPunches.length > 1 ? 'vacations' : 'vacation' }}
        </h2>

        <p class="hero-subtitle">
          {{
            todayPunches.length > 0
              ? 'Pointage enregistré'
              : 'Aucun pointage pour le moment'
          }}
        </p>

        <div class="hero-line"></div>

        <div class="hero-bottom">
          <span>Montant du jour</span>

          <strong>
            {{ formatMoney(todayAmount) }}
          </strong>
        </div>
      </section>

      <!-- VACATIONS DU JOUR -->
      <section class="vacations-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              Mes affectations
            </p>

            <h2>
              Mes vacations aujourd’hui
            </h2>
          </div>
        </div>

        <!-- CHARGEMENT -->
        <div
          v-if="loading"
          class="empty-card"
        >
          Chargement...
        </div>

        <!-- AUCUNE AFFECTATION -->
        <div
          v-else-if="assignments.length === 0"
          class="empty-card"
        >
          <div class="empty-icon">—</div>

          <strong>
            Aucune affectation
          </strong>

          <p>
            L’administratrice ne t’a encore
            attribué aucun poste.
          </p>
        </div>

        <!-- POSTES -->
        <div
          v-else
          class="assignment-list"
        >
          <article
            v-for="assignment in assignments"
            :key="assignment.post.id"
            class="assignment-card"
          >
            <!-- ENTÊTE POSTE -->
            <div class="assignment-header">
              <div>
                <span
                  class="service-badge"
                  :class="assignment.post.service_type"
                >
                  {{
                    serviceLabel(
                      assignment.post.service_type
                    )
                  }}
                </span>

                <h3>
                  {{ assignment.post.site_name }}
                </h3>
              </div>

              <div class="rate-badge">
                {{
                  formatMoney(
                    effectiveRate(assignment)
                  )
                }}
              </div>
            </div>

            <!-- SÉCURITÉ -->
            <div
              v-if="
                assignment.post.service_type ===
                'security'
              "
              class="shift-list"
            >
              <!-- MIDI -->
              <article
                class="shift-card"
                :class="{
                  completed:
                    hasPunched(
                      assignment.post.id,
                      'midi'
                    )
                }"
              >
                <div class="shift-left">
                  <div class="shift-icon">
                    ☀️
                  </div>

                  <div class="shift-info">
                    <span>Midi</span>

                    <strong>
                      11h45
                    </strong>

                    <small>
                      {{
                        formatMoney(
                          effectiveRate(assignment)
                        )
                      }}
                    </small>
                  </div>
                </div>

                <!-- DÉJÀ POINTÉ -->
                <div
                  v-if="
                    getPunch(
                      assignment.post.id,
                      'midi'
                    )
                  "
                  class="punched-state"
                >
                  <span>✓ Pointé</span>

                  <strong>
                    {{
                      punchTime(
                        getPunch(
                          assignment.post.id,
                          'midi'
                        )!
                      )
                    }}
                  </strong>
                </div>

                <!-- POINTER -->
                <button
                  v-else
                  type="button"
                  class="punch-button"
                  :disabled="
                    punchingKey ===
                    `${assignment.post.id}-midi`
                  "
                  @click="
                    punch(
                      assignment,
                      'midi'
                    )
                  "
                >
                  {{
                    punchingKey ===
                    `${assignment.post.id}-midi`
                      ? 'Pointage...'
                      : 'Pointer'
                  }}
                </button>
              </article>

              <!-- SOIR -->
              <article
                class="shift-card"
                :class="{
                  completed:
                    hasPunched(
                      assignment.post.id,
                      'soir'
                    )
                }"
              >
                <div class="shift-left">
                  <div class="shift-icon">
                    🌙
                  </div>

                  <div class="shift-info">
                    <span>Soir</span>

                    <strong>
                      18h45
                    </strong>

                    <small>
                      {{
                        formatMoney(
                          effectiveRate(assignment)
                        )
                      }}
                    </small>
                  </div>
                </div>

                <div
                  v-if="
                    getPunch(
                      assignment.post.id,
                      'soir'
                    )
                  "
                  class="punched-state"
                >
                  <span>✓ Pointé</span>

                  <strong>
                    {{
                      punchTime(
                        getPunch(
                          assignment.post.id,
                          'soir'
                        )!
                      )
                    }}
                  </strong>
                </div>

                <button
                  v-else
                  type="button"
                  class="punch-button"
                  :disabled="
                    punchingKey ===
                    `${assignment.post.id}-soir`
                  "
                  @click="
                    punch(
                      assignment,
                      'soir'
                    )
                  "
                >
                  {{
                    punchingKey ===
                    `${assignment.post.id}-soir`
                      ? 'Pointage...'
                      : 'Pointer'
                  }}
                </button>
              </article>
            </div>

            <!-- MÉNAGE -->
            <div
              v-else
              class="shift-list"
            >
              <article
                class="shift-card"
                :class="{
                  completed:
                    hasPunched(
                      assignment.post.id,
                      'jour'
                    )
                }"
              >
                <div class="shift-left">
                  <div class="shift-icon">
                    ✨
                  </div>

                  <div class="shift-info">
                    <span>
                      Vacation du jour
                    </span>

                    <strong>
                      Ménage
                    </strong>

                    <small>
                      {{
                        formatMoney(
                          effectiveRate(assignment)
                        )
                      }}
                    </small>
                  </div>
                </div>

                <div
                  v-if="
                    getPunch(
                      assignment.post.id,
                      'jour'
                    )
                  "
                  class="punched-state"
                >
                  <span>✓ Pointé</span>

                  <strong>
                    {{
                      punchTime(
                        getPunch(
                          assignment.post.id,
                          'jour'
                        )!
                      )
                    }}
                  </strong>
                </div>

                <button
                  v-else
                  type="button"
                  class="punch-button"
                  :disabled="
                    punchingKey ===
                    `${assignment.post.id}-jour`
                  "
                  @click="
                    punch(
                      assignment,
                      'jour'
                    )
                  "
                >
                  {{
                    punchingKey ===
                    `${assignment.post.id}-jour`
                      ? 'Pointage...'
                      : 'Pointer'
                  }}
                </button>
              </article>
            </div>
          </article>
        </div>

        <p
          v-if="errorMessage"
          class="message error"
        >
          {{ errorMessage }}
        </p>

        <p
          v-if="successMessage"
          class="message success"
        >
          {{ successMessage }}
        </p>
      </section>

      <!-- MOIS -->
      <section class="summary-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              Ce mois-ci
            </p>

            <h2>
              {{ currentMonthLabel }}
            </h2>
          </div>

          <RouterLink
            to="/month"
            class="see-more"
          >
            Voir le mois →
          </RouterLink>
        </div>

        <div class="summary-grid">
          <article class="summary-card">
            <span>Vacations</span>

            <strong>
              {{ validMonthPunches.length }}
            </strong>
          </article>

          <article class="summary-card">
            <span>Montant</span>

            <strong>
              {{ formatMoney(monthAmount) }}
            </strong>
          </article>
        </div>
      </section>

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

interface Post {
  id: string
  service_type: ServiceType
  site_name: string
  base_rate: number
  active: boolean
}

interface Assignment {
  post_id: string
  custom_rate: number | null
  post: Post
}

interface Punch {
  id: string
  employee_id: string
  post_id: string
  vacation_type: VacationType
  work_date: string
  scheduled_time: string | null
  punched_at: string
  applied_rate: number
  status:
    | 'validated'
    | 'suspicious'
    | 'contested'
  anomaly_reason: string | null
}

const router = useRouter()

const firstName = ref('')
const employeeId = ref('')

const assignments =
  ref<Assignment[]>([])

const monthPunches =
  ref<Punch[]>([])

const loading = ref(true)

const punchingKey =
  ref<string | null>(null)

const errorMessage = ref('')
const successMessage = ref('')

/* =========================
   DATES
========================= */

const now = new Date()

const localDate = (
  date: Date
) => {
  const year =
    date.getFullYear()

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, '0')

  const day =
    String(
      date.getDate()
    ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const today =
  localDate(now)

const monthStart =
  `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}-01`

const lastDay =
  new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate()

const monthEnd =
  `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}-${String(
    lastDay
  ).padStart(2, '0')}`

/* =========================
   LABELS
========================= */

const initial =
  computed(() => {
    return (
      firstName.value
        .charAt(0)
        .toUpperCase() || 'T'
    )
  })

const todayLabel =
  computed(() => {
    return new Intl.DateTimeFormat(
      'fr-FR',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }
    ).format(now)
  })

const currentMonthLabel =
  computed(() => {
    return new Intl.DateTimeFormat(
      'fr-FR',
      {
        month: 'long',
        year: 'numeric',
      }
    ).format(now)
  })

const serviceLabel = (
  service: ServiceType
) => {
  return service === 'security'
    ? 'Sécurité'
    : 'Ménage'
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

const effectiveRate = (
  assignment: Assignment
) => {
  return (
    assignment.custom_rate ??
    assignment.post.base_rate
  )
}

/* =========================
   POINTAGES
========================= */

const validMonthPunches =
  computed(() => {
    return monthPunches.value.filter(
      (punch) =>
        punch.status !== 'contested'
    )
  })

const todayPunches =
  computed(() => {
    return validMonthPunches.value.filter(
      (punch) =>
        punch.work_date === today
    )
  })

const todayAmount =
  computed(() => {
    return todayPunches.value.reduce(
      (total, punch) =>
        total +
        Number(
          punch.applied_rate ?? 0
        ),
      0
    )
  })

const monthAmount =
  computed(() => {
    return validMonthPunches.value.reduce(
      (total, punch) =>
        total +
        Number(
          punch.applied_rate ?? 0
        ),
      0
    )
  })

const getPunch = (
  postId: string,
  vacationType: VacationType
) => {
  return monthPunches.value.find(
    (punch) =>
      punch.post_id === postId &&
      punch.vacation_type ===
        vacationType &&
      punch.work_date === today
  )
}

const hasPunched = (
  postId: string,
  vacationType: VacationType
) => {
  return Boolean(
    getPunch(
      postId,
      vacationType
    )
  )
}

const punchTime = (
  punch: Punch
) => {
  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Paris',
    }
  ).format(
    new Date(punch.punched_at)
  )
}

/* =========================
   CHARGEMENT
========================= */

const loadPunches = async () => {
  if (!employeeId.value) {
    monthPunches.value = []
    return
  }

  const {
    data,
    error,
  } = await supabase
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
      anomaly_reason
    `)
    .eq(
      'employee_id',
      employeeId.value
    )
    .gte(
      'work_date',
      monthStart
    )
    .lte(
      'work_date',
      monthEnd
    )
    .order(
      'punched_at',
      {
        ascending: false,
      }
    )

  if (error) {
    console.error(error)

    errorMessage.value =
      'Impossible de charger les pointages.'

    return
  }

  monthPunches.value =
    (data ?? []).map(
      (punch) => ({
        ...punch,

        applied_rate:
          Number(
            punch.applied_rate ?? 0
          ),
      })
    ) as Punch[]
}

const loadData = async () => {
  loading.value = true
  errorMessage.value = ''

  const {
    data: { user },
  } =
    await supabase.auth.getUser()

  if (!user) {
    await router.push('/')
    return
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from('profiles')
    .select(`
      first_name,
      role
    `)
    .eq('id', user.id)
    .single()

  if (
    profileError ||
    !profile
  ) {
    console.error(profileError)

    await supabase.auth.signOut()
    await router.push('/')

    return
  }

  if (profile.role === 'admin') {
    await router.push('/admin')
    return
  }

  firstName.value =
    profile.first_name ?? ''

  /*
    On retrouve l'employé lié
    au compte connecté.
  */

  const {
    data: employee,
    error: employeeError,
  } = await supabase
    .from('employees')
    .select(`
      id,
      first_name
    `)
    .eq(
      'auth_user_id',
      user.id
    )
    .maybeSingle()

  if (employeeError) {
    console.error(employeeError)

    errorMessage.value =
      'Impossible de charger ton profil employé.'

    loading.value = false
    return
  }

  if (!employee) {
    assignments.value = []
    monthPunches.value = []
    loading.value = false
    return
  }

  employeeId.value =
    employee.id

  /*
    On récupère les affectations
    décidées par l'admin.
  */

  const {
    data: links,
    error: linksError,
  } = await supabase
    .from('employee_posts')
    .select(`
      post_id,
      custom_rate
    `)
    .eq(
      'employee_id',
      employee.id
    )
    .eq(
      'active',
      true
    )

  if (linksError) {
    console.error(linksError)

    errorMessage.value =
      'Impossible de charger tes affectations.'

    loading.value = false
    return
  }

  const postIds =
    (links ?? []).map(
      (link) =>
        link.post_id
    )

  if (postIds.length === 0) {
    assignments.value = []

    await loadPunches()

    loading.value = false
    return
  }

  const {
    data: postRows,
    error: postsError,
  } = await supabase
    .from('posts')
    .select(`
      id,
      service_type,
      site_name,
      base_rate,
      active
    `)
    .in(
      'id',
      postIds
    )
    .eq(
      'active',
      true
    )

  if (postsError) {
    console.error(postsError)

    errorMessage.value =
      'Impossible de charger les postes.'

    loading.value = false
    return
  }

  assignments.value =
    (links ?? [])
      .map((link) => {
        const post =
          (postRows ?? []).find(
            (item) =>
              item.id ===
              link.post_id
          )

        if (!post) {
          return null
        }

        return {
          post_id:
            link.post_id,

          custom_rate:
            link.custom_rate === null
              ? null
              : Number(
                  link.custom_rate
                ),

          post: {
            ...post,

            base_rate:
              Number(
                post.base_rate ?? 0
              ),
          },
        }
      })
      .filter(
        (
          assignment
        ): assignment is Assignment =>
          assignment !== null
      )

  await loadPunches()

  loading.value = false
}

/* =========================
   POINTER
========================= */

const punch = async (
  assignment: Assignment,
  vacationType: VacationType
) => {
  errorMessage.value = ''
  successMessage.value = ''

  const key =
    `${assignment.post.id}-${vacationType}`

  if (
    hasPunched(
      assignment.post.id,
      vacationType
    )
  ) {
    errorMessage.value =
      'Cette vacation a déjà été pointée.'

    return
  }

  punchingKey.value = key

  const {
    data,
    error,
  } = await supabase.rpc(
    'punch_vacation',
    {
      p_post_id:
        assignment.post.id,

      p_vacation_type:
        vacationType,
    }
  )

  punchingKey.value = null

  if (error) {
    console.error(error)

    if (
      error.message.includes(
        'ALREADY_PUNCHED'
      )
    ) {
      errorMessage.value =
        'Cette vacation a déjà été pointée.'
    } else if (
      error.message.includes(
        'POST_NOT_AUTHORIZED'
      )
    ) {
      errorMessage.value =
        'Tu n’es pas autorisé à pointer sur ce poste.'
    } else {
      errorMessage.value =
        'Impossible d’enregistrer le pointage.'
    }

    await loadPunches()
    return
  }

  await loadPunches()

  const returnedPunch =
    Array.isArray(data)
      ? data[0]
      : data

  const time =
    returnedPunch?.punched_at
      ? punchTime(
          returnedPunch as Punch
        )
      : ''

  successMessage.value =
    time
      ? `Pointage enregistré à ${time}.`
      : 'Pointage enregistré.'
}

/* =========================
   DÉMARRAGE
========================= */

onMounted(async () => {
  await loadData()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.home-page {
  min-height: 100vh;

  padding:
    28px
    20px
    110px;

  background: #f7f1ec;
  color: #17372f;
}

.page-content {
  width: 100%;
  max-width: 520px;

  margin: 0 auto;
}

/* HEADER */

.topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 15px;

  margin-bottom: 26px;
}

.eyebrow {
  margin: 0 0 4px;

  font-size: 10px;
  font-weight: 700;

  letter-spacing: 1.5px;
  text-transform: uppercase;

  color: #a08173;
}

.topbar h1 {
  margin: 0;

  font-family:
    Georgia,
    'Times New Roman',
    serif;

  font-size: 30px;
  font-weight: 400;

  color: #17372f;
}

.date {
  margin: 5px 0 0;

  font-size: 12px;
  text-transform: capitalize;

  color: #817b76;
}

.profile-button {
  width: 45px;
  height: 45px;

  flex-shrink: 0;

  display: grid;
  place-items: center;

  border-radius: 50%;

  background: #17372f;
  color: white;

  text-decoration: none;

  font-size: 14px;
  font-weight: 800;
}

/* HERO */

.hero-card {
  padding: 24px;

  margin-bottom: 30px;

  border-radius: 26px;

  background: #17372f;
  color: white;

  box-shadow:
    0 14px 35px
    rgba(23, 55, 47, 0.12);
}

.hero-label {
  margin: 0 0 8px;

  font-size: 10px;
  font-weight: 700;

  letter-spacing: 1.3px;
  text-transform: uppercase;

  opacity: 0.65;
}

.hero-card h2 {
  margin: 0;

  font-family:
    Georgia,
    'Times New Roman',
    serif;

  font-size: 31px;
  font-weight: 400;
}

.hero-subtitle {
  margin: 5px 0 0;

  font-size: 11px;

  opacity: 0.7;
}

.hero-line {
  height: 1px;

  margin: 20px 0 15px;

  background:
    rgba(255, 255, 255, 0.15);
}

.hero-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;
}

.hero-bottom span {
  font-size: 11px;

  opacity: 0.65;
}

.hero-bottom strong {
  font-size: 16px;
}

/* SECTIONS */

.vacations-section,
.summary-section {
  margin-bottom: 30px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  gap: 15px;

  margin-bottom: 14px;
}

.section-heading h2 {
  margin: 0;

  font-family:
    Georgia,
    'Times New Roman',
    serif;

  font-size: 22px;
  font-weight: 400;

  color: #17372f;
}

.see-more {
  flex-shrink: 0;

  padding-bottom: 2px;

  text-decoration: none;

  font-size: 10px;
  font-weight: 700;

  color: #a85f49;
}

/* AFFECTATIONS */

.assignment-list {
  display: flex;
  flex-direction: column;

  gap: 14px;
}

.assignment-card {
  padding: 18px;

  border:
    1px solid #eadfd8;

  border-radius: 24px;

  background: white;

  box-shadow:
    0 8px 25px
    rgba(62, 48, 42, 0.035);
}

.assignment-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 12px;

  margin-bottom: 15px;
}

.service-badge {
  display: inline-flex;

  padding: 5px 8px;

  margin-bottom: 7px;

  border-radius: 999px;

  font-size: 9px;
  font-weight: 800;

  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.service-badge.security {
  background: #e7eeea;
  color: #17372f;
}

.service-badge.cleaning {
  background: #f6e8e2;
  color: #a85f49;
}

.assignment-header h3 {
  margin: 0;

  font-size: 15px;

  color: #17372f;
}

.rate-badge {
  flex-shrink: 0;

  padding: 7px 9px;

  border-radius: 11px;

  background: #f5efe9;

  font-size: 11px;
  font-weight: 800;

  color: #a85f49;
}

/* VACATIONS */

.shift-list {
  display: flex;
  flex-direction: column;

  gap: 9px;
}

.shift-card {
  min-height: 82px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding: 12px;

  border:
    1px solid #ebe3de;

  border-radius: 17px;

  background: #fbf8f6;
}

.shift-card.completed {
  border-color: #cad8d0;

  background: #f0f5f2;
}

.shift-left {
  min-width: 0;

  display: flex;
  align-items: center;

  gap: 10px;
}

.shift-icon {
  width: 38px;
  height: 38px;

  flex-shrink: 0;

  display: grid;
  place-items: center;

  border-radius: 12px;

  background: white;

  font-size: 17px;
}

.shift-info {
  min-width: 0;

  display: flex;
  flex-direction: column;

  gap: 1px;
}

.shift-info span {
  font-size: 10px;
  font-weight: 700;

  text-transform: uppercase;

  color: #8c8580;
}

.shift-info strong {
  font-size: 16px;

  color: #17372f;
}

.shift-info small {
  margin-top: 1px;

  font-size: 9px;

  color: #a85f49;
}

/* BOUTON POINTER */

.punch-button {
  min-width: 83px;
  min-height: 40px;

  flex-shrink: 0;

  padding: 0 13px;

  border: none;
  border-radius: 13px;

  background: #17372f;
  color: white;

  font: inherit;
  font-size: 10px;
  font-weight: 800;

  text-transform: uppercase;
  letter-spacing: 0.4px;

  cursor: pointer;
}

.punch-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* DÉJÀ POINTÉ */

.punched-state {
  flex-shrink: 0;

  display: flex;
  flex-direction: column;

  align-items: flex-end;

  gap: 2px;
}

.punched-state span {
  font-size: 9px;
  font-weight: 800;

  text-transform: uppercase;

  color: #46715f;
}

.punched-state strong {
  font-size: 13px;

  color: #17372f;
}

/* RÉSUMÉ MOIS */

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(2, 1fr);

  gap: 10px;
}

.summary-card {
  padding: 17px;

  border:
    1px solid #eadfd8;

  border-radius: 19px;

  background: white;
}

.summary-card span {
  display: block;

  margin-bottom: 6px;

  font-size: 10px;

  color: #8c8580;
}

.summary-card strong {
  font-size: 18px;

  color: #17372f;
}

/* VIDE */

.empty-card {
  padding: 28px 20px;

  border:
    1px solid #eadfd8;

  border-radius: 22px;

  background: white;

  text-align: center;
}

.empty-icon {
  width: 42px;
  height: 42px;

  display: grid;
  place-items: center;

  margin: 0 auto 10px;

  border-radius: 50%;

  background: #f2ece8;

  color: #9b8174;
}

.empty-card strong {
  display: block;

  font-size: 13px;

  color: #17372f;
}

.empty-card p {
  max-width: 280px;

  margin:
    5px auto 0;

  font-size: 11px;
  line-height: 1.5;

  color: #8c8580;
}

/* MESSAGES */

.message {
  margin: 12px 0 0;

  padding: 11px 13px;

  border-radius: 13px;

  font-size: 11px;
}

.message.error {
  background: #f8e8e3;

  color: #a24d3d;
}

.message.success {
  background: #e7f0eb;

  color: #35614f;
}

/* MOBILE */

@media (max-width: 600px) {
  .home-page {
    padding:
      24px
      15px
      110px;
  }

  .topbar h1 {
    font-size: 27px;
  }

  .hero-card h2 {
    font-size: 28px;
  }

  .shift-card {
    padding: 11px;
  }

  .punch-button {
    min-width: 76px;

    padding:
      0 10px;

    font-size: 9px;
  }
}
</style>