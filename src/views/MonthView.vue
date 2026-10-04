<template>
  <main class="month-page">
    <!-- HEADER -->
    <header class="topbar">
      <div>
        <p class="eyebrow">
          Mon activité
        </p>
        <h1>Mon mois</h1>
        <p class="subtitle">
          {{ monthTitle }}
        </p>
      </div>
    </header>
    <!-- RÉSUMÉ -->
    <section class="summary-card">
      <div>
        <span>Vacations</span>
        <strong>
          {{ validMonthPunches.length }}
        </strong>
      </div>
      <div>
        <span>Montant</span>
        <strong>
          {{ formatMoney(totalAmount) }}
        </strong>
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
        <h2>
          {{ monthTitle }}
        </h2>
        <button
          type="button"
          class="month-button"
          @click="nextMonth"
        >
          ›
        </button>
      </div>
      <!-- JOURS SEMAINE -->
      <div class="weekdays">
        <span>Lun</span>
        <span>Mar</span>
        <span>Mer</span>
        <span>Jeu</span>
        <span>Ven</span>
        <span>Sam</span>
        <span>Dim</span>
      </div>
      <!-- CALENDRIER -->
      <div class="calendar-grid">
        <div
          v-for="day in calendarDays"
          :key="day.key"
          class="day"
          :class="{
            empty:
              day.day === null,
            worked:
              day.punches.length > 0 || day.onCall,
            selected:
              selectedDate === day.date
          }"
          @click="selectDay(day)"
        >
          <template
            v-if="day.day !== null"
          >
            <span>
              {{ day.day }}
            </span>
            <small
              v-if="
                day.punches.length > 0 || day.onCall
              "
            >
              {{
                day.punches.length
              }}
              vac.
            </small>
            <i
              v-if="
                day.punches.length > 0
              "
            ></i>
          </template>
        </div>
      </div>
    </section>
    <!-- JOUR SÉLECTIONNÉ -->
    <section
      v-if="
        selectedDate &&
        (selectedDayPunches.length > 0 || selectedIsOnCall)
      "
      class="selected-card"
    >
      <div class="selected-header">
        <div>
          <p class="eyebrow">
            Détail
          </p>
          <h2>
            {{ formatDate(selectedDate) }}
          </h2>
        </div>
        <div class="selected-total">
          <span>
            {{
              selectedValidPunches.length
            }}
            {{
              selectedValidPunches.length > 1
                ? 'vacations'
                : 'vacation'
            }}
          </span>
          <strong>
            {{
              formatMoney(
                selectedDayAmount
              )
            }}
          </strong>
        </div>
      </div>
      <!-- VACATIONS DU JOUR -->
      <div class="day-vacations">
        <article
          v-for="
            punch in selectedDayPunches
          "
          :key="punch.id"
          class="vacation-row"
          :class="{
            contested:
              punch.status ===
              'contested'
          }"
        >
          <div class="vacation-main">
            <div
              class="vacation-icon"
            >
              {{
                vacationIcon(
                  punch.vacation_type
                )
              }}
            </div>
            <div>
              <strong>
                {{
                  vacationLabel(
                    punch.vacation_type
                  )
                }}
              </strong>
              <span>
                {{
                  serviceLabel(
                    punch.post.service_type
                  )
                }}
                •
                {{ punch.post.site_name }}
              </span>
            </div>
          </div>
          <div class="vacation-rate">
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
          <!-- HEURES -->
          <div class="times">
            <div
              v-if="
                punch.scheduled_time
              "
            >
              <span>Prévu</span>
              <strong>
                {{
                  formatScheduledTime(
                    punch.scheduled_time
                  )
                }}
              </strong>
            </div>
            <div>
              <span>Pointé</span>
              <strong>
                {{
                  formatPunchTime(
                    punch.punched_at
                  )
                }}
              </strong>
            </div>
          </div>
          <p
            v-if="
              punch.status ===
              'contested'
            "
            class="contest-message"
          >
            Cette vacation n'est pas
            comptabilisée.
          </p>
          <p
            v-else-if="
              punch.status ===
              'suspicious'
            "
            class="warning-message"
          >
            Pointage à vérifier.
          </p>
        </article>
      <article v-if="selectedIsOnCall" class="vacation-row oncall-row">
        <div class="vacation-main"><div class="vacation-icon">📞</div><div><strong>Astreinte</strong><span>40,00 € par jour · automatique</span></div></div>
        <div class="vacation-rate"><strong>{{ formatMoney(selectedOnCallAmount) }}</strong><span class="status validated">Automatique</span></div>
      </article>
    </div>
    </section>
    <!-- RÉCAP -->
    <section class="recap-card">
      <div class="recap-header">
        <div>
          <p class="eyebrow">
            Récapitulatif
          </p>
          <h2>
            {{ monthTitle }}
          </h2>
        </div>
        <span class="days-count">
          {{ workedDays }}
          {{
            workedDays > 1
              ? 'jours'
              : 'jour'
          }}
        </span>
      </div>
      <div
        v-if="
          monthPunches.length > 0 ||
        monthOnCallAmount > 0
        "
        class="stats"
      >
        <div>
          <span>
            Vacations
          </span>
          <strong>
            {{
              validMonthPunches.length
            }}
          </strong>
        </div>
        <div>
          <span>
            Total
          </span>
          <strong>
            {{
              formatMoney(
                totalAmount
              )
            }}
          </strong>
        </div>
      </div>
      <div
        v-else
        class="empty-month"
      >
        <span>◷</span>
        <p>
          Aucune vacation enregistrée
          pour ce mois.
        </p>
      </div>
    </section>
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
  service_type:
    ServiceType
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
interface OnCallAssignment {
  id: string
  employee_id: string
  post_id: string
  daily_rate: number
  started_on: string
  ended_on: string | null
}
interface CalendarDay {
  key: string
  day:
    number | null
  date:
    string | null
  punches: Punch[]
  onCall: boolean
}
const router =
  useRouter()
const punches =
  ref<Punch[]>([])
const onCallAssignments = ref<OnCallAssignment[]>([])
const loading =
  ref(false)
/* =========================
   DATE
\\========================= */
const today =
  new Date()
const displayedYear =
  ref(
    today.getFullYear()
  )
const displayedMonth =
  ref(
    today.getMonth()
  )
const selectedDate =
  ref<string | null>(
    null
  )
/* =========================
   MOIS
\\========================= */
const monthTitle =
  computed(() => {
    const date =
      new Date(
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
      value
        .charAt(0)
        .toUpperCase() +
      value.slice(1)
    )
  })
/* =========================
   POINTAGES DU MOIS
\\========================= */
const monthPunches =
  computed(() => {
    return punches.value.filter(
      (punch) => {
        const [
          year,
          month,
        ] =
          punch.work_date
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
/*
  Les vacations contestées
  restent visibles mais ne
  comptent pas dans le salaire.
*/
const validMonthPunches =
  computed(() => {
    return monthPunches.value.filter(
      (punch) =>
        punch.status !==
        'contested'
    )
  })
const monthOnCallAmount = computed(() => {
  const year = displayedYear.value
  const month = displayedMonth.value
  const days = new Date(year, month + 1, 0).getDate()
  let total = 0
  for (let day = 1; day <= days; day++) total += onCallRateForDate(createDateString(year, month, day))
  return total
})
/* =========================
   TOTAL
\\========================= */
const totalAmount =
  computed(() => {
    const vacationsTotal = validMonthPunches.value.reduce(
      (total, punch) =>
        total +
        Number(
          punch.applied_rate ?? 0
        ),
      0
    )
    return vacationsTotal + monthOnCallAmount.value
  })
/* =========================
   JOURS TRAVAILLÉS
\\========================= */
const workedDays =
  computed(() => {
    const dates =
      new Set(
        validMonthPunches.value.map(
          (punch) =>
            punch.work_date
        )
      )
    const year = displayedYear.value
    const month = displayedMonth.value
    const days = new Date(year, month + 1, 0).getDate()
    for (let day = 1; day <= days; day++) {
      const date = createDateString(year, month, day)
      if (isOnCallDate(date)) dates.add(date)
    }
    return dates.size
  })
/* =========================
   CALENDRIER
\\========================= */
const calendarDays =
  computed<CalendarDay[]>(
    () => {
      const result:
        CalendarDay[] = []
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
        JS :
        dimanche = 0
        lundi = 1
        On commence par lundi.
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
          key:
            `empty-${i}`,
          day: null,
          date: null,
          punches: [],
        onCall: false,
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
        const dayPunches =
          punches.value.filter(
            (punch) =>
              punch.work_date ===
              date
          )
        result.push({
          key: date,
          day,
          date,
          punches:
            dayPunches,
          onCall: isOnCallDate(date),
        })
      }
      return result
    }
  )
/* =========================
   JOUR SÉLECTIONNÉ
\\========================= */
const selectedDayPunches =
  computed(() => {
    if (
      !selectedDate.value
    ) {
      return []
    }
    return punches.value
      .filter(
        (punch) =>
          punch.work_date ===
          selectedDate.value
      )
      .sort(
        (a, b) =>
          a.punched_at.localeCompare(
            b.punched_at
          )
      )
  })
const selectedValidPunches =
  computed(() => {
    return selectedDayPunches.value.filter(
      (punch) =>
        punch.status !==
        'contested'
    )
  })
const selectedIsOnCall = computed(() => isOnCallDate(selectedDate.value))
const selectedOnCallAmount = computed(() => onCallRateForDate(selectedDate.value))
const selectedDayAmount =
  computed(() => {
    const vacationsTotal = selectedValidPunches.value.reduce(
      (total, punch) =>
        total +
        Number(
          punch.applied_rate ?? 0
        ),
      0
    )
    return vacationsTotal + selectedOnCallAmount.value
  })
const selectDay = (
  day: CalendarDay
) => {
  if (
    !day.date ||
    day.punches.length === 0 && !day.onCall
  ) {
    return
  }
  selectedDate.value =
    day.date
}
/* =========================
   CHANGER DE MOIS
\\========================= */
const previousMonth =
  () => {
    selectedDate.value =
      null
    if (
      displayedMonth.value ===
      0
    ) {
      displayedMonth.value =
        11
      displayedYear.value--
    } else {
      displayedMonth.value--
    }
  }
const nextMonth =
  () => {
    selectedDate.value =
      null
    if (
      displayedMonth.value ===
      11
    ) {
      displayedMonth.value =
        0
      displayedYear.value++
    } else {
      displayedMonth.value++
    }
  }
/* =========================
   CHARGEMENT SUPABASE
\\========================= */
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
      Retrouver l'employé
      connecté.
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
      Récupérer toutes ses
      vacations.
    */
    const { data: onCallData, error: onCallError } = await supabase
    .from('on_call_assignments')
    .select('id, employee_id, post_id, daily_rate, started_on, ended_on')
    .eq('employee_id', employee.id)
    .order('started_on', { ascending: true })
  if (onCallError) {
    console.error(onCallError)
    onCallAssignments.value = []
  } else {
    onCallAssignments.value = (onCallData ?? []).map((a: any) => ({ ...a, daily_rate: Number(a.daily_rate ?? 40) })) as OnCallAssignment[]
  }
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
   UTILITAIRES
\\========================= */
const parisToday = () => {
  const parts =
    new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone: 'Europe/Paris',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }
    ).formatToParts(new Date())
  const get = (type: string) =>
    parts.find(
      (part) => part.type === type
    )?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}
const onCallAssignmentForDate = (
  date: string | null
) => {
  if (!date || date > parisToday()) {
    return null
  }
  return (
    onCallAssignments.value.find(
      (assignment) =>
        assignment.started_on <= date &&
        (
          assignment.ended_on === null ||
          assignment.ended_on >= date
        )
    ) ?? null
  )
}
const isOnCallDate = (
  date: string | null
) => {
  return Boolean(
    onCallAssignmentForDate(date)
  )
}
const onCallRateForDate = (
  date: string | null
) => {
  const assignment =
    onCallAssignmentForDate(date)
  return assignment
    ? Number(assignment.daily_rate ?? 40)
    : 0
}
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
  return (
    `${year}-${monthString}-${dayString}`
  )
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
  if (
    type === 'midi'
  ) {
    return 'Midi'
  }
  if (
    type === 'soir'
  ) {
    return 'Soir'
  }
  return 'Journée'
}
const vacationIcon = (
  type:
    VacationType
) => {
  if (
    type === 'midi'
  ) {
    return '☀️'
  }
  if (
    type === 'soir'
  ) {
    return '🌙'
  }
  return '✨'
}
const formatScheduledTime = (
  time:
    string | null
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
const getStatusLabel = (
  status:
    PunchStatus
) => {
  if (
    status ===
    'validated'
  ) {
    return 'Validé'
  }
  if (
    status ===
    'suspicious'
  ) {
    return 'À vérifier'
  }
  return 'Contesté'
}
/*
  Si on change de mois,
  on enlève la sélection.
*/
watch(
  [
    displayedYear,
    displayedMonth,
  ],
  () => {
    selectedDate.value =
      null
  }
)
/* =========================
   DÉMARRAGE
\\========================= */
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
.month-page {
  min-height: 100vh;
  padding:
    28px
    20px
    115px;
  background: #f7f1ec;
  color: #1d2c27;
}
.topbar,
.summary-card,
.calendar-card,
.selected-card,
.recap-card {
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
  letter-spacing: 1.2px;
  text-transform: uppercase;
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
/* SUMMARY */
.summary-card {
  display: grid;
  grid-template-columns:
    1fr 1fr;
  margin-bottom: 16px;
  overflow: hidden;
  border-radius: 22px;
  background: #17372f;
  color: white;
}
.summary-card div {
  padding: 19px;
}
.summary-card div + div {
  border-left:
    1px solid
    rgba(
      255,
      255,
      255,
      0.15
    );
}
.summary-card span {
  display: block;
  margin-bottom: 5px;
  font-size: 10px;
  opacity: 0.65;
}
.summary-card strong {
  font-size: 20px;
}
/* CALENDRIER */
.calendar-card,
.selected-card,
.recap-card {
  padding: 20px;
  margin-bottom: 16px;
  border:
    1px solid #ede5df;
  border-radius: 24px;
  background: white;
}
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.calendar-header h2 {
  margin: 0;
  font-family:
    Georgia,
    'Times New Roman',
    serif;
  font-size: 17px;
  font-weight: 400;
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
  grid-template-columns:
    repeat(7, 1fr);
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
  min-height: 55px;
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
/* JOUR SÉLECTIONNÉ */
.selected-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 18px;
}
.selected-header h2 {
  margin: 0;
  font-size: 16px;
  color: #17372f;
}
.selected-total {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.selected-total span {
  font-size: 9px;
  color: #928984;
}
.selected-total strong {
  font-size: 18px;
  color: #c86449;
}
/* VACATIONS DU JOUR */
.day-vacations {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.vacation-row {
  padding: 13px;
  border:
    1px solid #eee7e2;
  border-radius: 17px;
  background: #faf8f6;
}
.vacation-row\.contested {
  opacity: 0.65;
}
.vacation-main {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-right: 85px;
  position: relative;
}
.vacation-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: white;
  font-size: 16px;
}
.vacation-main > div:last-child {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.vacation-main strong {
  font-size: 12px;
  color: #17372f;
}
.vacation-main span {
  font-size: 9px;
  color: #8c8580;
}
/* PRIX + STATUT */
.vacation-rate {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 11px;
}
.vacation-rate > strong {
  font-size: 15px;
  color: #17372f;
}
.vacation-rate strong.crossed {
  text-decoration:
    line-through;
  color: #99918c;
}
.status {
  padding:
    4px
    7px;
  border-radius: 999px;
  font-size: 8px;
  font-weight: 700;
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
/* HEURES */
.times {
  display: grid;
  grid-template-columns:
    repeat(2, 1fr);
  margin-top: 11px;
  padding-top: 10px;
  border-top:
    1px solid #eee7e2;
}
.times div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.times div + div {
  padding-left: 15px;
  border-left:
    1px solid #eee7e2;
}
.times span {
  font-size: 8px;
  text-transform: uppercase;
  color: #99918c;
}
.times strong {
  font-size: 11px;
  color: #17372f;
}
.contest-message,
.warning-message {
  margin:
    9px
    0
    0;
  padding-top: 8px;
  border-top:
    1px solid #eee7e2;
  font-size: 9px;
}
.contest-message {
  color: #a34f43;
}
.warning-message {
  color: #9d6c51;
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
  padding:
    7px
    10px;
  border-radius: 999px;
  background: #f2e9e3;
  font-size: 10px;
  font-weight: 600;
  color: #755f54;
}
.stats {
  display: grid;
  grid-template-columns:
    1fr 1fr;
}
.stats div + div {
  padding-left: 20px;
  border-left:
    1px solid #eee7e2;
}
.stats span {
  display: block;
  margin-bottom: 5px;
  font-size: 10px;
  color: #99918c;
}
.stats strong {
  font-size: 18px;
  color: #17372f;
}
/* VIDE */
.empty-month {
  padding:
    20px
    0;
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
  font-size: 12px;
}
/* MOBILE */
@media (
  max-width: 380px
) {
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
  position: relative;
  min-height: 55px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  /* NON TRAVAILLÉ = ROUGE */
  background: #f8e3e0;
  cursor: default;
}
.day > span {
  font-size: 12px;
  font-weight: 600;
  color: #9b5148;
}
.day small {
  margin-top: 3px;
  font-size: 8px;
  color: #527162;
}
.day i {
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #4f765f;
}
/* TRAVAILLÉ = VERT */
.day.worked {
  background: #dcebe2;
  cursor: pointer;
}
.day.worked > span {
  color: #285442;
}
.day.worked small {
  color: #4f765f;
}
/* JOUR SÉLECTIONNÉ = VERT FONCÉ */
.day.selected {
  background: #17372f;
}
.day.selected span,
.day.selected small {
  color: white;
}
.day.selected i {
  background: white;
}
/* CASES HORS DU MOIS */
.day.empty {
  background: transparent;
}
}
.oncall-row { border-color: #d9e5df; background: #f6faf8; }
</style>
