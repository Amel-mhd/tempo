<template>
  <main class="admin-hours-page">
    <section class="page-shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">Suivi des heures</p>
          <h1>Heures des employés</h1>
          <p class="subtitle">
            Consultez les heures par employé et par mois.
          </p>
        </div>
      </header>

      <section class="filters-card">
        <label for="month">
          Mois
        </label>

        <input
          id="month"
          v-model="selectedMonth"
          type="month"
        />
      </section>

      <section
        v-if="loading"
        class="state-card"
      >
        Chargement...
      </section>

      <section
        v-else-if="errorMessage"
        class="state-card error"
      >
        {{ errorMessage }}
      </section>

      <section
        v-else-if="employeeSummaries.length === 0"
        class="state-card"
      >
        Aucune heure enregistrée pour ce mois.
      </section>

      <section
        v-else
        class="employee-list"
      >
        <article
          v-for="employee in employeeSummaries"
          :key="employee.id"
          class="employee-card"
        >
          <button
            type="button"
            class="employee-summary"
            @click="toggleEmployee(employee.id)"
          >
            <div class="employee-main">
              <div class="avatar">
                {{ employee.initial }}
              </div>

              <div>
                <h2>
                  {{ employee.fullName }}
                </h2>

                <p>
                  {{ employee.companyNames }}
                </p>
              </div>
            </div>

            <div class="employee-stats">
              <div>
                <span>Aujourd'hui</span>
                <strong>
                  {{ formatMinutes(employee.todayMinutes) }}
                </strong>
              </div>

              <div>
                <span>Ce mois</span>
                <strong>
                  {{ formatMinutes(employee.monthMinutes) }}
                </strong>
              </div>

              <div>
                <span>Estimation</span>
                <strong>
                  {{ formatMoney(employee.estimatedSalary) }}
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

          <div
            v-if="expandedEmployeeId === employee.id"
            class="details"
          >
            <div
              v-for="entry in employee.entries"
              :key="entry.id"
              class="entry-row"
            >
              <div class="entry-date">
                <strong>
                  {{ formatDate(entry.work_date) }}
                </strong>

                <span>
                  {{ entry.company_name }}
                </span>
              </div>

              <div class="entry-hours">
                <span>
                  {{ formatTime(entry.start_time) }}
                  →
                  {{ formatTime(entry.end_time) }}
                </span>

                <small
                  v-if="entry.pause_start && entry.pause_end"
                >
                  Pause :
                  {{ formatTime(entry.pause_start) }}
                  →
                  {{ formatTime(entry.pause_end) }}
                </small>
              </div>

              <div class="entry-total">
                {{ formatMinutes(entry.worked_minutes) }}
              </div>
            </div>
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
} from 'vue'

import { supabase } from '../lib/supabase'
import AdminBottomNav from '../components/AdminBottomNav.vue'

type Employee = {
  id: string
  first_name: string
  last_name: string
  hourly_rate: number
}

type Company = {
  id: string
  name: string
}

type TimeEntry = {
  id: string
  employee_id: string
  company_id: string | null
  work_date: string
  start_time: string
  pause_start: string | null
  pause_end: string | null
  end_time: string
  worked_minutes: number
}

type EnrichedEntry = TimeEntry & {
  company_name: string
}

const loading = ref(true)
const errorMessage = ref('')

const employees = ref<Employee[]>([])
const companies = ref<Company[]>([])
const entries = ref<TimeEntry[]>([])

const expandedEmployeeId =
  ref<string | null>(null)

const now = new Date()

const selectedMonth = ref(
  `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}`
)

const today = computed(() => {
  return new Intl.DateTimeFormat(
    'en-CA',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }
  ).format(new Date())
})

const monthStart = computed(() => {
  return `${selectedMonth.value}-01`
})

const monthEnd = computed(() => {
  const [
    year,
    month,
  ] = selectedMonth.value
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

const loadData = async () => {
  loading.value = true
  errorMessage.value = ''

  const {
    data: employeeData,
    error: employeeError,
  } = await supabase
    .from('employees')
    .select(`
      id,
      first_name,
      last_name,
      hourly_rate
    `)
    .order('first_name')

  if (employeeError) {
    console.error(employeeError)

    errorMessage.value =
      'Impossible de charger les employés.'

    loading.value = false
    return
  }

  employees.value =
    (employeeData ?? []).map(
      (employee) => ({
        ...employee,
        hourly_rate:
          Number(
            employee.hourly_rate ?? 0
          ),
      })
    )

  const {
    data: companyData,
    error: companyError,
  } = await supabase
    .from('companies')
    .select('id, name')

  if (companyError) {
    console.error(companyError)
  }

  companies.value =
    companyData ?? []

  const {
    data: entryData,
    error: entryError,
  } = await supabase
    .from('all_employee_time_entries')
    .select(`
      id,
      employee_id,
      company_id,
      work_date,
      start_time,
      pause_start,
      pause_end,
      end_time,
      worked_minutes
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
        ascending: false,
      }
    )
    .order(
      'start_time',
      {
        ascending: true,
      }
    )

  if (entryError) {
    console.error(entryError)

    errorMessage.value =
      'Impossible de charger les heures.'

    loading.value = false
    return
  }

  entries.value =
    entryData ?? []

  loading.value = false
}

const employeeSummaries =
  computed(() => {
    return employees.value
      .map((employee) => {
        const employeeEntries =
          entries.value
            .filter(
              (entry) =>
                entry.employee_id ===
                employee.id
            )
            .map<EnrichedEntry>(
              (entry) => ({
                ...entry,

                company_name:
                  companies.value.find(
                    (company) =>
                      company.id ===
                      entry.company_id
                  )?.name ??
                  'Société inconnue',
              })
            )

        const monthMinutes =
          employeeEntries.reduce(
            (
              total,
              entry
            ) =>
              total +
              Number(
                entry.worked_minutes ??
                  0
              ),
            0
          )

        const todayMinutes =
          employeeEntries
            .filter(
              (entry) =>
                entry.work_date ===
                today.value
            )
            .reduce(
              (
                total,
                entry
              ) =>
                total +
                Number(
                  entry.worked_minutes ??
                    0
                ),
              0
            )

        const companyNames =
          Array.from(
            new Set(
              employeeEntries.map(
                (entry) =>
                  entry.company_name
              )
            )
          )

        return {
          id: employee.id,

          fullName:
            `${employee.first_name} ${employee.last_name}`,

          initial:
            employee.first_name
              ?.charAt(0)
              .toUpperCase() || '?',

          monthMinutes,

          todayMinutes,

          estimatedSalary:
            (monthMinutes / 60) *
            employee.hourly_rate,

          companyNames:
            companyNames.length > 0
              ? companyNames.join(', ')
              : 'Aucune société',

          entries:
            employeeEntries,
        }
      })
      .filter(
        (employee) =>
          employee.entries.length > 0
      )
  })

const toggleEmployee = (
  employeeId: string
) => {
  expandedEmployeeId.value =
    expandedEmployeeId.value ===
    employeeId
      ? null
      : employeeId
}

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

const formatMoney = (
  value: number
) => {
  return new Intl.NumberFormat(
    'fr-FR',
    {
      style: 'currency',
      currency: 'EUR',
    }
  ).format(value)
}

const formatDate = (
  date: string
) => {
  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }
  ).format(
    new Date(
      `${date}T12:00:00`
    )
  )
}

const formatTime = (
  time: string
) => {
  return time.slice(0, 5)
}

onMounted(loadData)
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.admin-hours-page {
  min-height: 100vh;
  padding: 28px 18px 120px;

  background: #f7f1ec;
  color: #1d2c27;
}

.page-shell {
  width: 100%;
  max-width: 520px;

  margin: 0 auto;
}

.topbar {
  margin-bottom: 22px;
}

.eyebrow {
  margin: 0 0 5px;

  color: #9b8174;

  font-size: 11px;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 1.2px;
}

h1 {
  margin: 0;

  color: #17372f;

  font-size: 30px;
  line-height: 1.1;
}

.subtitle {
  margin: 7px 0 0;

  color: #7d7874;

  font-size: 13px;
  line-height: 1.4;
}

.filters-card {
  margin-bottom: 16px;
  padding: 16px;

  border: 1px solid #ebe4df;
  border-radius: 20px;

  background: #ffffff;
}

.filters-card label {
  display: block;

  margin-bottom: 7px;

  color: #17372f;

  font-size: 12px;
  font-weight: 700;
}

.filters-card input {
  width: 100%;
  min-height: 48px;

  padding: 0 13px;

  border: 1px solid #e5ddd8;
  border-radius: 14px;

  background: #faf7f4;

  color: #17372f;

  font: inherit;
}

.state-card {
  padding: 20px;

  border: 1px solid #ebe4df;
  border-radius: 20px;

  background: #ffffff;

  color: #7d7874;

  font-size: 13px;
}

.state-card.error {
  background: #f9e7e3;
  color: #a84f40;
}

.employee-list {
  display: flex;
  flex-direction: column;

  gap: 14px;
}

.employee-card {
  overflow: hidden;

  border: 1px solid #ebe4df;
  border-radius: 23px;

  background: #ffffff;
}

.employee-summary {
  width: 100%;

  display: flex;
  flex-direction: column;

  gap: 16px;

  padding: 18px;

  border: none;

  background: transparent;

  text-align: left;

  cursor: pointer;
}

.employee-main {
  display: flex;
  align-items: center;

  gap: 12px;
}

.avatar {
  width: 42px;
  height: 42px;

  flex-shrink: 0;

  display: grid;
  place-items: center;

  border-radius: 50%;

  background: #17372f;
  color: #ffffff;

  font-size: 16px;
  font-weight: 700;
}

.employee-main h2 {
  margin: 0;

  color: #17372f;

  font-size: 16px;
}

.employee-main p {
  margin: 4px 0 0;

  color: #918984;

  font-size: 11px;
}

.employee-stats {
  display: grid;
  grid-template-columns:
    repeat(3, 1fr);

  gap: 8px;
}

.employee-stats div {
  padding: 11px 9px;

  border-radius: 14px;

  background: #f8f3ef;
}

.employee-stats span {
  display: block;

  margin-bottom: 4px;

  color: #948b85;

  font-size: 9px;
}

.employee-stats strong {
  color: #17372f;

  font-size: 13px;
}

.arrow {
  align-self: flex-end;

  color: #9b8174;

  font-size: 18px;
}

.details {
  border-top:
    1px solid #eee7e2;
}

.entry-row {
  display: grid;
  grid-template-columns:
    1fr auto;

  gap: 8px 12px;

  padding: 15px 18px;

  border-bottom:
    1px solid #f1ebe7;
}

.entry-row:last-child {
  border-bottom: none;
}

.entry-date {
  display: flex;
  flex-direction: column;

  gap: 3px;
}

.entry-date strong {
  color: #17372f;

  font-size: 12px;
}

.entry-date span {
  color: #9b8174;

  font-size: 10px;
}

.entry-hours {
  display: flex;
  flex-direction: column;

  gap: 3px;

  color: #605b57;

  font-size: 11px;
}

.entry-hours small {
  color: #9b938e;

  font-size: 9px;
}

.entry-total {
  grid-row: span 2;

  align-self: center;

  color: #17372f;

  font-size: 13px;
  font-weight: 700;
}

@media (max-width: 380px) {
  .admin-hours-page {
    padding-left: 14px;
    padding-right: 14px;
  }

  .employee-stats {
    grid-template-columns:
      1fr;
  }
}
</style>