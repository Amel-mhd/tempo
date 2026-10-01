<template>
  <main class="admin-month-page">
    <header class="topbar">
      <div>
        <p class="eyebrow">Administration</p>
        <h1>Calendrier</h1>
        <p class="subtitle">{{ monthTitle }}</p>
      </div>
    </header>

    <section class="summary-card">
      <div>
        <span>Vacations</span>
        <strong>{{ validMonthPunches.length }}</strong>
      </div>

      <div>
        <span>Astreintes</span>
        <strong>{{ monthOnCallDays }}</strong>
      </div>

      <div>
        <span>Montant</span>
        <strong>{{ formatMoney(monthTotalAmount) }}</strong>
      </div>
    </section>

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
        <button
          v-for="day in calendarDays"
          :key="day.key"
          type="button"
          class="day"
          :class="{
            empty: day.day === null,
            active: day.day !== null,
            worked: day.employeeCount > 0 || day.onCallCount > 0,
            selected: selectedDate === day.date,
          }"
          :disabled="day.day === null"
          @click="selectDay(day)"
        >
          <template v-if="day.day !== null">
            <span class="day-number">
              {{ day.day }}
            </span>

            <small v-if="day.employeeCount > 0">
              {{ day.employeeCount }}
              {{ day.employeeCount > 1 ? 'employés' : 'employé' }}
            </small>

            <small v-else-if="day.onCallCount > 0">
              {{ day.onCallCount }}
              {{ day.onCallCount > 1 ? 'astreintes' : 'astreinte' }}
            </small>

            <small v-else class="no-punch">
              Aucun
            </small>

            <i
              v-if="day.employeeCount > 0 || day.onCallCount > 0"
            ></i>
          </template>
        </button>
      </div>
    </section>

    <section
      v-if="selectedDate"
      class="selected-card"
    >
      <div class="selected-header">
        <div>
          <p class="eyebrow">Journée</p>
          <h2>{{ formatDate(selectedDate) }}</h2>
        </div>

        <div class="selected-total">
          <span>Total</span>
          <strong>
            {{ formatMoney(selectedDayAmount) }}
          </strong>
        </div>
      </div>

      <div class="day-stats">
        <div>
          <span>Employés</span>
          <strong>{{ selectedEmployeeNames.length }}</strong>
        </div>

        <div>
          <span>Vacations</span>
          <strong>{{ selectedValidPunches.length }}</strong>
        </div>

        <div>
          <span>Astreintes</span>
          <strong>{{ selectedOnCall.length }}</strong>
        </div>
      </div>

      <div class="employee-section">
        <div class="section-title">
          <div>
            <p class="eyebrow">Pointages</p>
            <h3>Ont pointé</h3>
          </div>

          <span class="count-badge">
            {{ selectedEmployeeNames.length }}
          </span>
        </div>

        <div
          v-if="selectedEmployeeNames.length > 0"
          class="names-list"
        >
          <div
            v-for="employee in selectedEmployeeNames"
            :key="employee.id"
            class="name-row"
          >
            <span class="avatar">
              {{ employee.initial }}
            </span>

            <strong>{{ employee.firstName }}</strong>

            <span class="check">✓</span>
          </div>
        </div>

        <div
          v-else
          class="empty-state"
        >
          Aucun pointage ce jour-là.
        </div>
      </div>

      <div class="employee-section">
        <div class="section-title">
          <div>
            <p class="eyebrow">Équipe</p>
            <h3>Aucun pointage</h3>
          </div>

          <span class="count-badge muted">
            {{ selectedNoPunchNames.length }}
          </span>
        </div>

        <div
          v-if="selectedNoPunchNames.length > 0"
          class="names-list"
        >
          <div
            v-for="employee in selectedNoPunchNames"
            :key="employee.id"
            class="name-row no-pointage"
          >
            <span class="avatar muted-avatar">
              {{ employee.initial }}
            </span>

            <strong>{{ employee.firstName }}</strong>

            <span class="dash">—</span>
          </div>
        </div>

        <div
          v-else
          class="empty-state"
        >
          Tous les employés ont un pointage.
        </div>
      </div>

      <div
        v-if="selectedOnCall.length > 0"
        class="employee-section"
      >
        <div class="section-title">
          <div>
            <p class="eyebrow">Automatique</p>
            <h3>Astreinte</h3>
          </div>

          <span class="count-badge">
            {{ selectedOnCall.length }}
          </span>
        </div>

        <div class="names-list">
          <div
            v-for="employee in selectedOnCall"
            :key="employee.id"
            class="name-row"
          >
            <span class="avatar">
              {{ employee.initial }}
            </span>

            <strong>{{ employee.firstName }}</strong>

            <span class="on-call-label">
              Astreinte
            </span>
          </div>
        </div>
      </div>
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
  useRouter,
} from 'vue-router'

import AdminBottomNav
  from '../components/AdminBottomNav.vue'

import {
  supabase,
} from '../lib/supabase'

type PunchStatus =
  | 'validated'
  | 'contested'
  | 'suspicious'

interface Employee {
  id: string
  first_name: string
  active: boolean
}

interface Punch {
  id: string
  employee_id: string
  work_date: string
  applied_rate: number
  status: PunchStatus
}

interface OnCallAssignment {
  id: string
  employee_id: string
  daily_rate: number
  started_on: string
  ended_on: string | null
}

interface CalendarDay {
  key: string
  day: number | null
  date: string | null
  employeeCount: number
  onCallCount: number
}

interface EmployeeDisplay {
  id: string
  firstName: string
  initial: string
}

const router = useRouter()

const employees = ref<Employee[]>([])
const punches = ref<Punch[]>([])
const onCallAssignments =
  ref<OnCallAssignment[]>([])

const today = new Date()

const displayedYear =
  ref(today.getFullYear())

const displayedMonth =
  ref(today.getMonth())

const selectedDate =
  ref<string | null>(null)

/* =========================
   MOIS
========================= */

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
      value.charAt(0).toUpperCase() +
      value.slice(1)
    )
  })

/* =========================
   EMPLOYÉS
========================= */

const activeEmployees =
  computed(() =>
    employees.value.filter(
      (employee) => employee.active
    )
  )

/* =========================
   POINTAGES
========================= */

const monthPunches =
  computed(() =>
    punches.value.filter((punch) => {
      const [year, month] =
        punch.work_date
          .split('-')
          .map(Number)

      return (
        year === displayedYear.value &&
        month - 1 === displayedMonth.value
      )
    })
  )

const validMonthPunches =
  computed(() =>
    monthPunches.value.filter(
      (punch) =>
        punch.status !== 'contested'
    )
  )

/* =========================
   ASTREINTES
========================= */

const isOnCallOnDate = (
  assignment: OnCallAssignment,
  date: string
) => {
  if (date < assignment.started_on) {
    return false
  }

  if (
    assignment.ended_on &&
    date > assignment.ended_on
  ) {
    return false
  }

  return true
}

const onCallForDate = (
  date: string
) => {
  return onCallAssignments.value.filter(
    (assignment) =>
      isOnCallOnDate(
        assignment,
        date
      )
  )
}

const monthOnCallDays =
  computed(() => {
    const numberOfDays =
      new Date(
        displayedYear.value,
        displayedMonth.value + 1,
        0
      ).getDate()

    let total = 0

    for (
      let day = 1;
      day <= numberOfDays;
      day++
    ) {
      const date =
        createDateString(
          displayedYear.value,
          displayedMonth.value,
          day
        )

      total +=
        onCallForDate(date).length
    }

    return total
  })

const monthOnCallAmount =
  computed(() => {
    const numberOfDays =
      new Date(
        displayedYear.value,
        displayedMonth.value + 1,
        0
      ).getDate()

    let total = 0

    for (
      let day = 1;
      day <= numberOfDays;
      day++
    ) {
      const date =
        createDateString(
          displayedYear.value,
          displayedMonth.value,
          day
        )

      total +=
        onCallForDate(date).reduce(
          (sum, assignment) =>
            sum +
            Number(
              assignment.daily_rate ?? 0
            ),
          0
        )
    }

    return total
  })

/* =========================
   TOTAL MOIS
========================= */

const monthPunchAmount =
  computed(() =>
    validMonthPunches.value.reduce(
      (total, punch) =>
        total +
        Number(
          punch.applied_rate ?? 0
        ),
      0
    )
  )

const monthTotalAmount =
  computed(
    () =>
      monthPunchAmount.value +
      monthOnCallAmount.value
  )

/* =========================
   CALENDRIER
========================= */

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
        employeeCount: 0,
        onCallCount: 0,
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

      const employeeIds =
        new Set(
          punches.value
            .filter(
              (punch) =>
                punch.work_date === date
            )
            .map(
              (punch) =>
                punch.employee_id
            )
        )

      result.push({
        key: date,
        day,
        date,
        employeeCount:
          employeeIds.size,
        onCallCount:
          onCallForDate(date).length,
      })
    }

    return result
  })

/* =========================
   JOUR SÉLECTIONNÉ
========================= */

const selectedDayPunches =
  computed(() => {
    if (!selectedDate.value) {
      return []
    }

    return punches.value.filter(
      (punch) =>
        punch.work_date ===
        selectedDate.value
    )
  })

const selectedValidPunches =
  computed(() =>
    selectedDayPunches.value.filter(
      (punch) =>
        punch.status !== 'contested'
    )
  )

const selectedOnCallAssignments =
  computed(() => {
    if (!selectedDate.value) {
      return []
    }

    return onCallForDate(
      selectedDate.value
    )
  })

const selectedEmployeeNames =
  computed<EmployeeDisplay[]>(() => {
    const ids =
      new Set(
        selectedDayPunches.value.map(
          (punch) =>
            punch.employee_id
        )
      )

    return activeEmployees.value
      .filter(
        (employee) =>
          ids.has(employee.id)
      )
      .map(toEmployeeDisplay)
      .sort(
        (a, b) =>
          a.firstName.localeCompare(
            b.firstName,
            'fr'
          )
      )
  })

const selectedNoPunchNames =
  computed<EmployeeDisplay[]>(() => {
    const ids =
      new Set(
        selectedDayPunches.value.map(
          (punch) =>
            punch.employee_id
        )
      )

    return activeEmployees.value
      .filter(
        (employee) =>
          !ids.has(employee.id)
      )
      .map(toEmployeeDisplay)
      .sort(
        (a, b) =>
          a.firstName.localeCompare(
            b.firstName,
            'fr'
          )
      )
  })

const selectedOnCall =
  computed<EmployeeDisplay[]>(() => {
    const ids =
      new Set(
        selectedOnCallAssignments.value.map(
          (assignment) =>
            assignment.employee_id
        )
      )

    return employees.value
      .filter(
        (employee) =>
          ids.has(employee.id)
      )
      .map(toEmployeeDisplay)
  })

const selectedDayAmount =
  computed(() => {
    const punchAmount =
      selectedValidPunches.value.reduce(
        (total, punch) =>
          total +
          Number(
            punch.applied_rate ?? 0
          ),
        0
      )

    const onCallAmount =
      selectedOnCallAssignments.value.reduce(
        (total, assignment) =>
          total +
          Number(
            assignment.daily_rate ?? 0
          ),
        0
      )

    return (
      punchAmount +
      onCallAmount
    )
  })

const selectDay = (
  day: CalendarDay
) => {
  if (!day.date) {
    return
  }

  selectedDate.value =
    day.date
}

/* =========================
   MOIS PRÉCÉDENT / SUIVANT
========================= */

const previousMonth = () => {
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
  if (
    displayedMonth.value === 11
  ) {
    displayedMonth.value = 0
    displayedYear.value++
  } else {
    displayedMonth.value++
  }
}

/* =========================
   SUPABASE
========================= */

const loadData = async () => {
  const {
    data: { user },
  } =
    await supabase.auth.getUser()

  if (!user) {
    await router.push('/')
    return
  }

  const [
    employeesResult,
    punchesResult,
    onCallResult,
  ] =
    await Promise.all([
      supabase
        .from('employees')
        .select(`
          id,
          first_name,
          active
        `),

      supabase
        .from('punches')
        .select(`
          id,
          employee_id,
          work_date,
          applied_rate,
          status
        `),

      supabase
        .from('on_call_assignments')
        .select(`
          id,
          employee_id,
          daily_rate,
          started_on,
          ended_on
        `),
    ])

  if (employeesResult.error) {
    console.error(
      employeesResult.error
    )
  }

  if (punchesResult.error) {
    console.error(
      punchesResult.error
    )
  }

  if (onCallResult.error) {
    console.error(
      onCallResult.error
    )
  }

  employees.value =
    (employeesResult.data ?? [])
      .map((employee: any) => ({
        id: employee.id,
        first_name:
          employee.first_name ?? '',
        active:
          employee.active ?? true,
      }))

  punches.value =
    (punchesResult.data ?? [])
      .map((punch: any) => ({
        ...punch,
        applied_rate:
          Number(
            punch.applied_rate ?? 0
          ),
      })) as Punch[]

  onCallAssignments.value =
    (onCallResult.data ?? [])
      .map(
        (assignment: any) => ({
          ...assignment,
          daily_rate:
            Number(
              assignment.daily_rate ??
              0
            ),
        })
      ) as OnCallAssignment[]
}

/* =========================
   UTILITAIRES
========================= */

const toEmployeeDisplay = (
  employee: Employee
): EmployeeDisplay => {
  const firstName =
    employee.first_name ||
    'Employé'

  return {
    id: employee.id,
    firstName,
    initial:
      firstName
        .charAt(0)
        .toUpperCase(),
  }
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

  return `${year}-${monthString}-${dayString}`
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

watch(
  [
    displayedYear,
    displayedMonth,
  ],
  () => {
    selectedDate.value = null
  }
)

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

.admin-month-page {
  min-height: 100vh;
  padding: 28px 20px 115px;
  background: #f7f1ec;
  color: #1d2c27;
}

.topbar,
.summary-card,
.calendar-card,
.selected-card {
  width: 100%;
  max-width: 720px;
  margin-left: auto;
  margin-right: auto;
}

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
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 29px;
  font-weight: 400;
  color: #17372f;
}

.subtitle {
  margin: 5px 0 0;
  font-size: 13px;
  color: #7d7874;
}

.summary-card {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
    rgba(255, 255, 255, 0.15);
}

.summary-card span {
  display: block;
  margin-bottom: 5px;
  font-size: 10px;
  opacity: 0.65;
}

.summary-card strong {
  font-size: 18px;
}

.calendar-card,
.selected-card {
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #ede5df;
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
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 18px;
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
  gap: 7px;
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
  min-height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 5px 2px;
  border: none;
  border-radius: 13px;
  background: #faf8f6;
  font-family: inherit;
  cursor: pointer;
}

.day-number {
  font-size: 13px;
  font-weight: 700;
  color: #716d69;
}

.day small {
  font-size: 8px;
  color: #8c8580;
}

.day .no-punch {
  color: #aaa29d;
}

.day i {
  position: absolute;
  bottom: 5px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #4f765f;
}

.day.worked {
  background: #dcebe2;
}

.day.worked .day-number {
  color: #285442;
}

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

.day.empty {
  background: transparent;
  cursor: default;
}

.selected-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 18px;
}

.selected-header h2 {
  margin: 0;
  font-size: 18px;
  color: #17372f;
}

.selected-total {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
}

.selected-total span {
  font-size: 9px;
  color: #928984;
}

.selected-total strong {
  font-size: 18px;
  color: #c86449;
}

.day-stats {
  display: grid;
  grid-template-columns:
    repeat(3, 1fr);
  margin-bottom: 24px;
  padding: 15px 0;
  border-top: 1px solid #eee7e2;
  border-bottom: 1px solid #eee7e2;
}

.day-stats div {
  text-align: center;
}

.day-stats div + div {
  border-left: 1px solid #eee7e2;
}

.day-stats span {
  display: block;
  margin-bottom: 4px;
  font-size: 9px;
  color: #99918c;
}

.day-stats strong {
  font-size: 17px;
  color: #17372f;
}

.employee-section + .employee-section {
  margin-top: 25px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 11px;
}

.section-title h3 {
  margin: 0;
  font-size: 15px;
  color: #17372f;
}

.count-badge {
  min-width: 27px;
  height: 27px;
  display: grid;
  place-items: center;
  padding: 0 8px;
  border-radius: 999px;
  background: #e4efe8;
  color: #3f6852;
  font-size: 10px;
  font-weight: 700;
}

.count-badge.muted {
  background: #f2eeeb;
  color: #8c8580;
}

.names-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.name-row {
  min-height: 50px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 12px;
  border: 1px solid #eee7e2;
  border-radius: 15px;
  background: #faf8f6;
}

.name-row strong {
  flex: 1;
  font-size: 12px;
  color: #17372f;
}

.avatar {
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: #dcebe2;
  color: #285442;
  font-size: 11px;
  font-weight: 700;
}

.muted-avatar {
  background: #eee9e5;
  color: #817a75;
}

.check {
  color: #4f765f;
  font-weight: 700;
}

.dash {
  color: #aaa29d;
}

.no-pointage {
  background: #fcfbfa;
}

.on-call-label {
  padding: 5px 8px;
  border-radius: 999px;
  background: #f2e9e3;
  color: #755f54;
  font-size: 9px;
  font-weight: 700;
}

.empty-state {
  padding: 18px;
  border-radius: 15px;
  background: #faf8f6;
  text-align: center;
  font-size: 11px;
  color: #918983;
}

@media (max-width: 520px) {
  .admin-month-page {
    padding-left: 14px;
    padding-right: 14px;
  }

  .summary-card div {
    padding: 15px 10px;
  }

  .summary-card strong {
    font-size: 15px;
  }

  .calendar-card,
  .selected-card {
    padding-left: 14px;
    padding-right: 14px;
  }

  .calendar-grid,
  .weekdays {
    gap: 4px;
  }

  .day {
    min-height: 60px;
  }

  .day small {
    font-size: 7px;
  }
}
</style>