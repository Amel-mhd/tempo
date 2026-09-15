<template>
  <main class="home-page">
    <section class="page-content">
      <!-- HEADER -->
      <header class="topbar">
        <div>
          <p class="eyebrow">Bonjour</p>
          <h1>{{ firstName || 'Bienvenue' }} 👋</h1>
          <p class="date">{{ todayLabel }}</p>
        </div>

        <RouterLink to="/profile" class="profile-button">
          {{ initial }}
        </RouterLink>
      </header>

      <!-- CARTE PRINCIPALE -->
      <section class="hero-card">
        <p class="hero-label">Aujourd’hui</p>

        <h2>{{ workedTimeLabel }}</h2>

        <p class="hero-subtitle">
          {{ todayEntry ? 'Temps travaillé enregistré' : 'Aucune heure enregistrée' }}
        </p>

        <div class="hero-line"></div>

        <div class="hero-times">
          <div>
            <span>Début</span>
            <strong>{{ form.startTime || '--:--' }}</strong>
          </div>

          <div>
            <span>Fin</span>
            <strong>{{ form.endTime || '--:--' }}</strong>
          </div>
        </div>
      </section>

      <!-- RÉSUMÉ DU MOIS -->
      <section class="summary-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Ce mois-ci</p>
            <h2>{{ currentMonthLabel }}</h2>
          </div>

          <RouterLink to="/month" class="see-more">
            Voir le mois →
          </RouterLink>
        </div>

        <div class="summary-grid">
          <article class="summary-card">
            <span>Heures</span>
            <strong>{{ monthWorkedLabel }}</strong>
          </article>

          <article class="summary-card">
            <span>Salaire estimé</span>
            <strong>{{ monthSalaryLabel }} €</strong>
          </article>
        </div>
      </section>

      <!-- HORAIRES DU JOUR -->
      <section class="hours-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Ma journée</p>
            <h2>Mes horaires</h2>
          </div>
        </div>

        <div class="hours-card">
          <div class="company-field">
            <label for="company">Société</label>

            <select
              id="company"
              v-model="selectedCompanyId"
              :disabled="companies.length <= 1"
            >
              <option
                v-if="companies.length === 0"
                value=""
              >
                Aucune société attribuée
              </option>

              <option
                v-for="company in companies"
                :key="company.id"
                :value="company.id"
              >
                {{ company.name }}
              </option>
            </select>

            <p
              v-if="companies.length === 0"
              class="company-help"
            >
              Demande à l’administratrice de t’attribuer une société.
            </p>
          </div>

          <div class="time-grid">
            <label>
              <span>Début</span>

              <input
                v-model="form.startTime"
                type="time"
              />
            </label>

            <label>
              <span>Fin</span>

              <input
                v-model="form.endTime"
                type="time"
              />
            </label>
          </div>

          <div class="pause-title">
            Pause
            <span>optionnel</span>
          </div>

          <div class="time-grid">
            <label>
              <span>Début pause</span>

              <input
                v-model="form.pauseStart"
                type="time"
              />
            </label>

            <label>
              <span>Fin pause</span>

              <input
                v-model="form.pauseEnd"
                type="time"
              />
            </label>
          </div>

          <div class="worked-preview">
            <span>Temps travaillé</span>
            <strong>{{ calculatedWorkedLabel }}</strong>
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

          <button
            type="button"
            class="save-button"
            :disabled="saving"
            @click="saveToday"
          >
            {{
              saving
                ? 'Enregistrement...'
                : todayEntry
                  ? 'Modifier mes horaires'
                  : 'Enregistrer mes horaires'
            }}
          </button>
        </div>
      </section>
    </section>

    <!-- NAVIGATION EMPLOYÉ -->
    <EmployeeBottomNav />
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
  RouterLink,
  useRouter,
} from 'vue-router'

import EmployeeBottomNav from '../components/EmployeeBottomNav.vue'
import { supabase } from '../lib/supabase'

interface Company {
  id: string
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
}

const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const hourlyRate = ref(0)

const companies = ref<Company[]>([])
const selectedCompanyId = ref('')

const todayEntry = ref<TimeEntry | null>(null)
const monthEntries = ref<TimeEntry[]>([])

const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const emptyForm = () => ({
  startTime: '',
  pauseStart: '',
  pauseEnd: '',
  endTime: '',
})

const form = ref(emptyForm())

const now = new Date()

const localDate = (
  date: Date
) => {
  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0')

  const day = String(
    date.getDate()
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const today = localDate(now)

const monthStart =
  `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}-01`

const lastDay = new Date(
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

const initial = computed(() => {
  return (
    firstName.value
      .charAt(0)
      .toUpperCase() || 'T'
  )
})

const todayLabel = computed(() => {
  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }
  ).format(now)
})

const currentMonthLabel = computed(() => {
  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      month: 'long',
      year: 'numeric',
    }
  ).format(now)
})

const minutesFromTime = (
  time: string
) => {
  if (!time) {
    return 0
  }

  const [hours, minutes] =
    time.split(':').map(Number)

  return hours * 60 + minutes
}

const calculatedWorkedMinutes =
  computed(() => {
    if (
      !form.value.startTime ||
      !form.value.endTime
    ) {
      return 0
    }

    const start =
      minutesFromTime(
        form.value.startTime
      )

    const end =
      minutesFromTime(
        form.value.endTime
      )

    if (end <= start) {
      return 0
    }

    let pause = 0

    if (
      form.value.pauseStart ||
      form.value.pauseEnd
    ) {
      if (
        !form.value.pauseStart ||
        !form.value.pauseEnd
      ) {
        return 0
      }

      const pauseStart =
        minutesFromTime(
          form.value.pauseStart
        )

      const pauseEnd =
        minutesFromTime(
          form.value.pauseEnd
        )

      if (
        pauseEnd <= pauseStart ||
        pauseStart < start ||
        pauseEnd > end
      ) {
        return 0
      }

      pause =
        pauseEnd - pauseStart
    }

    return Math.max(
      0,
      end - start - pause
    )
  })

const formatMinutes = (
  minutes: number
) => {
  const hours =
    Math.floor(minutes / 60)

  const remaining =
    minutes % 60

  if (remaining === 0) {
    return `${hours} h`
  }

  return `${hours} h ${String(
    remaining
  ).padStart(2, '0')}`
}

const calculatedWorkedLabel =
  computed(() =>
    formatMinutes(
      calculatedWorkedMinutes.value
    )
  )

const workedTimeLabel =
  computed(() => {
    if (!todayEntry.value) {
      return '0 h'
    }

    return formatMinutes(
      Number(
        todayEntry.value.worked_minutes ??
        0
      )
    )
  })

const monthMinutes =
  computed(() =>
    monthEntries.value.reduce(
      (total, entry) =>
        total +
        Number(
          entry.worked_minutes ?? 0
        ),
      0
    )
  )

const monthWorkedLabel =
  computed(() =>
    formatMinutes(
      monthMinutes.value
    )
  )

const monthSalary =
  computed(() =>
    (
      monthMinutes.value /
      60 *
      hourlyRate.value
    )
  )

const monthSalaryLabel =
  computed(() =>
    monthSalary.value
      .toFixed(2)
      .replace('.', ',')
  )

const syncTodayEntry = () => {
  if (!selectedCompanyId.value) {
    todayEntry.value = null
    form.value = emptyForm()
    return
  }

  todayEntry.value =
    monthEntries.value.find(
      (entry) =>
        entry.work_date === today &&
        entry.company_id ===
          selectedCompanyId.value
    ) ?? null

  if (!todayEntry.value) {
    form.value = emptyForm()
    return
  }

  form.value = {
    startTime:
      todayEntry.value
        .start_time
        ?.slice(0, 5) ?? '',

    pauseStart:
      todayEntry.value
        .pause_start
        ?.slice(0, 5) ?? '',

    pauseEnd:
      todayEntry.value
        .pause_end
        ?.slice(0, 5) ?? '',

    endTime:
      todayEntry.value
        .end_time
        ?.slice(0, 5) ?? '',
  }
}

const loadCompanies = async (
  userId: string
) => {
  const {
    data: employee,
    error: employeeError,
  } = await supabase
    .from('employees')
    .select('id')
    .eq('auth_user_id', userId)
    .maybeSingle()

  if (employeeError) {
    console.error(employeeError)
    companies.value = []
    selectedCompanyId.value = ''
    return
  }

  if (!employee) {
    companies.value = []
    selectedCompanyId.value = ''
    return
  }

  const {
    data: links,
    error: linksError,
  } = await supabase
    .from('employee_companies')
    .select('company_id')
    .eq('employee_id', employee.id)

  if (linksError) {
    console.error(linksError)
    companies.value = []
    selectedCompanyId.value = ''
    return
  }

  const companyIds =
    (links ?? []).map(
      (link) => link.company_id
    )

  if (companyIds.length === 0) {
    companies.value = []
    selectedCompanyId.value = ''
    return
  }

  const {
    data: companyRows,
    error: companiesError,
  } = await supabase
    .from('companies')
    .select('id, name')
    .in('id', companyIds)
    .order('name')

  if (companiesError) {
    console.error(companiesError)
    companies.value = []
    selectedCompanyId.value = ''
    return
  }

  companies.value =
    (companyRows ?? []) as Company[]

  const stillExists =
    companies.value.some(
      (company) =>
        company.id ===
        selectedCompanyId.value
    )

  if (!stillExists) {
    selectedCompanyId.value =
      companies.value[0]?.id ?? ''
  }
}

const loadData = async () => {
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
      last_name,
      hourly_rate,
      role
    `)
    .eq('id', user.id)
    .single()

  if (
    profileError ||
    !profile
  ) {
    console.error(
      profileError
    )

    await supabase.auth.signOut()
    await router.push('/')

    return
  }

  if (
    profile.role === 'admin'
  ) {
    await router.push('/admin')
    return
  }

  firstName.value =
    profile.first_name ?? ''

  lastName.value =
    profile.last_name ?? ''

  hourlyRate.value =
    Number(
      profile.hourly_rate ?? 0
    )

  await loadCompanies(user.id)

  const {
    data: entries,
    error: entriesError,
  } = await supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', user.id)
    .gte(
      'work_date',
      monthStart
    )
    .lte(
      'work_date',
      monthEnd
    )
    .order(
      'work_date',
      {
        ascending: false,
      }
    )

  if (entriesError) {
    console.error(
      entriesError
    )

    return
  }

  monthEntries.value =
    (entries ?? []).map(
      (entry) => ({
        ...entry,
        worked_minutes:
          Number(
            entry.worked_minutes ??
            0
          ),
      })
    )

  syncTodayEntry()
}

const saveToday = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!selectedCompanyId.value) {
    errorMessage.value =
      'Aucune société ne t’a été attribuée.'

    return
  }

  if (
    !form.value.startTime ||
    !form.value.endTime
  ) {
    errorMessage.value =
      'Renseigne ton heure de début et de fin.'

    return
  }

  const start =
    minutesFromTime(
      form.value.startTime
    )

  const end =
    minutesFromTime(
      form.value.endTime
    )

  if (end <= start) {
    errorMessage.value =
      'L’heure de fin doit être après l’heure de début.'

    return
  }

  if (
    Boolean(
      form.value.pauseStart
    ) !==
    Boolean(
      form.value.pauseEnd
    )
  ) {
    errorMessage.value =
      'Renseigne le début et la fin de la pause, ou laisse les deux champs vides.'

    return
  }

  if (
    form.value.pauseStart &&
    form.value.pauseEnd
  ) {
    const pauseStart =
      minutesFromTime(
        form.value.pauseStart
      )

    const pauseEnd =
      minutesFromTime(
        form.value.pauseEnd
      )

    if (
      pauseEnd <= pauseStart ||
      pauseStart < start ||
      pauseEnd > end
    ) {
      errorMessage.value =
        'Les horaires de pause ne sont pas valides.'

      return
    }
  }

  if (
    calculatedWorkedMinutes.value <=
    0
  ) {
    errorMessage.value =
      'Les horaires renseignés ne sont pas valides.'

    return
  }

  saving.value = true

  const {
    data: { user },
  } =
    await supabase.auth.getUser()

  if (!user) {
    saving.value = false
    await router.push('/')
    return
  }

  const payload = {
    user_id: user.id,
    company_id:
      selectedCompanyId.value,
    work_date: today,
    start_time:
      form.value.startTime,
    pause_start:
      form.value.pauseStart ||
      null,
    pause_end:
      form.value.pauseEnd ||
      null,
    end_time:
      form.value.endTime,
    worked_minutes:
      calculatedWorkedMinutes.value,
    status: 'pending',
  }

  let error = null

  if (todayEntry.value) {
    const result =
      await supabase
        .from('time_entries')
        .update(payload)
        .eq(
          'id',
          todayEntry.value.id
        )

    error = result.error
  } else {
    const result =
      await supabase
        .from('time_entries')
        .insert(payload)

    error = result.error
  }

  saving.value = false

  if (error) {
    console.error(error)

    errorMessage.value =
      'Impossible d’enregistrer les horaires.'

    return
  }

  successMessage.value =
    'Tes horaires ont bien été enregistrés.'

  await loadData()
}

watch(
  selectedCompanyId,
  () => {
    errorMessage.value = ''
    successMessage.value = ''
    syncTodayEntry()
  }
)

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
  color: #fff;

  font-size: 17px;
  font-weight: 700;

  text-decoration: none;
}

.hero-card {
  padding: 24px;

  border-radius: 28px;

  background: #17372f;
  color: #fff;
}

.hero-label {
  margin: 0 0 7px;

  font-size: 11px;

  color: #d6c2b9;
}

.hero-card h2 {
  margin: 0;

  font-family:
    Georgia,
    'Times New Roman',
    serif;

  font-size: 43px;
  font-weight: 400;
}

.hero-subtitle {
  margin: 5px 0 0;

  font-size: 12px;

  color: #c8d1cd;
}

.hero-line {
  height: 1px;

  margin: 22px 0 17px;

  background:
    rgba(
      255,
      255,
      255,
      0.15
    );
}

.hero-times {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 15px;
}

.hero-times div {
  display: flex;

  flex-direction: column;

  gap: 3px;
}

.hero-times span {
  font-size: 10px;

  color: #c8d1cd;
}

.hero-times strong {
  font-size: 16px;
}

.summary-section,
.hours-section {
  margin-top: 29px;
}

.section-heading {
  display: flex;

  align-items: flex-end;
  justify-content: space-between;

  gap: 15px;

  margin-bottom: 13px;
}

.section-heading h2 {
  margin: 0;

  font-family:
    Georgia,
    'Times New Roman',
    serif;

  font-size: 22px;
  font-weight: 400;
}

.see-more {
  padding-bottom: 2px;

  color: #755e53;

  font-size: 11px;

  text-decoration: none;
}

.summary-grid {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 11px;
}

.summary-card {
  padding: 18px;

  border:
    1px solid
    #eadfd8;

  border-radius: 20px;

  background: #fff;
}

.summary-card span {
  display: block;

  margin-bottom: 7px;

  color: #8b8580;

  font-size: 11px;
}

.summary-card strong {
  font-size: 20px;

  color: #17372f;
}

.hours-card {
  padding: 20px;

  border:
    1px solid
    #eadfd8;

  border-radius: 24px;

  background: #fff;
}

.company-field {
  margin-bottom: 20px;
}

.company-field label {
  display: block;

  margin-bottom: 6px;

  font-size: 10px;

  color: #817b76;
}

.company-field select {
  width: 100%;
  min-height: 49px;

  padding: 0 12px;

  border:
    1px solid
    #ddd2ca;

  border-radius: 14px;

  outline: none;

  background: #faf7f4;

  font-family: inherit;

  color: #17372f;
}

.company-field select:disabled {
  opacity: 1;
  cursor: default;
}

.company-help {
  margin: 8px 2px 0;

  font-size: 10px;

  color: #a84f40;
}

.time-grid {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 11px;
}

.time-grid label {
  min-width: 0;
}

.time-grid label span {
  display: block;

  margin-bottom: 6px;

  font-size: 10px;

  color: #817b76;
}

.time-grid input {
  width: 100%;
  min-height: 49px;

  padding: 0 12px;

  border:
    1px solid
    #ddd2ca;

  border-radius: 14px;

  outline: none;

  background: #faf7f4;

  font-family: inherit;

  color: #17372f;
}

.pause-title {
  margin:
    20px
    0
    10px;

  font-size: 13px;
  font-weight: 700;
}

.pause-title span {
  margin-left: 5px;

  font-size: 9px;
  font-weight: 400;

  color: #9b938d;
}

.worked-preview {
  display: flex;

  justify-content: space-between;
  align-items: center;

  margin-top: 20px;

  padding: 14px 15px;

  border-radius: 15px;

  background: #f1e3dc;
}

.worked-preview span {
  font-size: 11px;
}

.worked-preview strong {
  font-size: 16px;
}

.save-button {
  width: 100%;
  min-height: 54px;

  margin-top: 16px;

  border: 0;
  border-radius: 17px;

  background: #c66b50;
  color: #fff;

  font-family: inherit;

  font-size: 14px;
  font-weight: 700;

  cursor: pointer;
}

.save-button:disabled {
  opacity: 0.6;

  cursor: wait;
}

.message {
  margin:
    14px
    0
    0;

  padding: 11px 13px;

  border-radius: 12px;

  font-size: 11px;
}

.error {
  background: #f9e7e3;

  color: #a84f40;
}

.success {
  background: #eaf2ed;

  color: #305f4e;
}
/* ===== CORRECTION HORAIRES SUR MOBILE ===== */

/* HORAIRES EN COLONNE - MÊME LARGEUR QUE SOCIÉTÉ */

.time-grid {
  display: flex !important;
  flex-direction: column !important;
  width: 100% !important;
  gap: 16px !important;
}

.time-grid label {
  display: block !important;
  width: 100% !important;
  min-width: 0 !important;
}

.time-grid input[type="time"] {
  display: block !important;
  width: 100% !important;
  min-width: 100% !important;
  max-width: 100% !important;

  min-height: 49px;

  padding: 0 12px;

  box-sizing: border-box !important;

  border: 1px solid #ddd2ca;
  border-radius: 14px;

  background: #faf7f4;
  color: #17372f;

  font-family: inherit;
}
</style>