<template>
  <main class="admin-page">
    <header class="topbar">
      <div>
        <p class="eyebrow">Administration</p>
        <h1>Bonjour {{ firstName }} 👋</h1>
        <p class="subtitle">
          Retrouvez l’activité de vos sociétés en un coup d’œil.
        </p>
      </div>

      <RouterLink to="/admin/profile" class="profile-button">
        <span class="profile-icon">
          {{ firstName.charAt(0).toUpperCase() || 'N' }}
        </span>
        <span>Profil</span>
      </RouterLink>
    </header>

    <section class="month-section">
      <p class="eyebrow">Période</p>
      <div class="month-picker">
        <button type="button" class="month-arrow" @click="previousMonth">‹</button>
        <div>
          <span>Mois affiché</span>
          <strong>{{ selectedMonthLabel }}</strong>
        </div>
        <button type="button" class="month-arrow" @click="nextMonth">›</button>
      </div>
    </section>

    <section class="global-section">
      <div class="section-title">
        <div>
          <p class="eyebrow">Vue globale</p>
          <h2>Toutes les sociétés</h2>
        </div>
        <span class="global-badge">{{ companies.length }} sociétés</span>
      </div>

      <div class="global-summary">
        <article class="summary-card">
          <span>Heures cumulées</span>
          <strong>{{ allCompaniesHours }}</strong>
        </article>
        <article class="summary-card">
          <span>Salaires estimés</span>
          <strong>{{ allCompaniesSalary }} €</strong>
        </article>
      </div>

      <div class="company-overview-list">
        <article
          v-for="company in companies"
          :key="`overview-${company.id}`"
          class="company-overview-card"
        >
          <div>
            <strong>{{ company.name }}</strong>
            <span>
              {{ companyEmployeeCount(company.id) }}
              employée{{ companyEmployeeCount(company.id) > 1 ? 's' : '' }}
            </span>
          </div>

          <div class="company-overview-values">
            <strong>{{ companyHoursFor(company.id) }}</strong>
            <span>{{ companySalaryFor(company.id) }} €</span>
          </div>
        </article>
      </div>
    </section>

    <section class="companies-section">
      <p class="eyebrow">Détail</p>
      <h2>Choisir une société</h2>

      <div class="company-list">
        <button
          v-for="company in companies"
          :key="company.id"
          type="button"
          class="company-button"
          :class="{ active: selectedCompanyId === company.id }"
          @click="selectedCompanyId = company.id"
        >
          <span class="company-icon">{{ company.name.charAt(0) }}</span>
          <span>{{ company.name }}</span>
        </button>
      </div>
    </section>

    <section class="summary-grid">
      <article class="summary-card">
        <span>Employées</span>
        <strong>{{ employees.length }}</strong>
      </article>
      <article class="summary-card">
        <span>Heures ce mois</span>
        <strong>{{ companyHours }}</strong>
      </article>
      <article class="summary-card salary-card">
        <span>Salaires estimés</span>
        <strong>{{ companySalary }} €</strong>
      </article>
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
  RouterLink,
  useRouter,
} from 'vue-router'

import AdminBottomNav from '../components/AdminBottomNav.vue'
import { supabase } from '../lib/supabase'

interface Company {
  id: string
  name: string
}

interface Employee {
  id: string
  hourly_rate: number
}

interface EmployeeCompany {
  employee_id: string
  company_id: string
}

interface EmployeeTimeEntry {
  id: string
  employee_id: string
  company_id: string
  work_date: string
  worked_minutes: number
}

const router = useRouter()

const firstName = ref('')
const companies = ref<Company[]>([])
const allEmployees = ref<Employee[]>([])
const employeeCompanyLinks =
  ref<EmployeeCompany[]>([])
const monthEntries =
  ref<EmployeeTimeEntry[]>([])

const selectedCompanyId = ref('')

const now = new Date()

const selectedMonth = ref(
  `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}`
)

const selectedMonthLabel = computed(() => {
  const [year, month] =
    selectedMonth.value
      .split('-')
      .map(Number)

  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      month: 'long',
      year: 'numeric',
    }
  ).format(
    new Date(year, month - 1, 1)
  )
})

const monthBounds = computed(() => {
  const [year, month] =
    selectedMonth.value
      .split('-')
      .map(Number)

  const lastDay =
    new Date(year, month, 0)
      .getDate()

  return {
    start:
      `${year}-${String(month)
        .padStart(2, '0')}-01`,

    end:
      `${year}-${String(month)
        .padStart(2, '0')}-${String(
          lastDay
        ).padStart(2, '0')}`,
  }
})

const previousMonth = () => {
  const [year, month] =
    selectedMonth.value
      .split('-')
      .map(Number)

  const date =
    new Date(year, month - 2, 1)

  selectedMonth.value =
    `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`
}

const nextMonth = () => {
  const [year, month] =
    selectedMonth.value
      .split('-')
      .map(Number)

  const date =
    new Date(year, month, 1)

  selectedMonth.value =
    `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`
}

const formatMoney = (value: number) =>
  Number(value ?? 0)
    .toFixed(2)
    .replace('.', ',')

const formatWorkedTime = (
  minutes: number
) => {
  const safeMinutes =
    Number(minutes ?? 0)

  const hours =
    Math.floor(safeMinutes / 60)

  const remainingMinutes =
    safeMinutes % 60

  if (remainingMinutes === 0) {
    return `${hours} h`
  }

  return `${hours} h ${String(
    remainingMinutes
  ).padStart(2, '0')}`
}

const employeeRate = (
  employeeId: string
) =>
  allEmployees.value.find(
    (employee) =>
      employee.id === employeeId
  )?.hourly_rate ?? 0

const minutesForEntries = (
  entries: EmployeeTimeEntry[]
) =>
  entries.reduce(
    (total, entry) =>
      total +
      Number(
        entry.worked_minutes ?? 0
      ),
    0
  )

const salaryForEntries = (
  entries: EmployeeTimeEntry[]
) =>
  entries.reduce(
    (total, entry) =>
      total +
      (
        Number(
          entry.worked_minutes ?? 0
        ) / 60
      ) *
        employeeRate(
          entry.employee_id
        ),
    0
  )

const employees = computed(() => {
  if (!selectedCompanyId.value) {
    return []
  }

  const employeeIds =
    employeeCompanyLinks.value
      .filter(
        (link) =>
          link.company_id ===
          selectedCompanyId.value
      )
      .map(
        (link) =>
          link.employee_id
      )

  return allEmployees.value.filter(
    (employee) =>
      employeeIds.includes(
        employee.id
      )
  )
})

const companyEntries = computed(() =>
  monthEntries.value.filter(
    (entry) =>
      entry.company_id ===
      selectedCompanyId.value
  )
)

const companyHours = computed(() =>
  formatWorkedTime(
    minutesForEntries(
      companyEntries.value
    )
  )
)

const companySalary = computed(() =>
  formatMoney(
    salaryForEntries(
      companyEntries.value
    )
  )
)

const allCompaniesHours = computed(() =>
  formatWorkedTime(
    minutesForEntries(
      monthEntries.value
    )
  )
)

const allCompaniesSalary =
  computed(() =>
    formatMoney(
      salaryForEntries(
        monthEntries.value
      )
    )
  )

const companyEmployeeCount = (
  companyId: string
) =>
  new Set(
    employeeCompanyLinks.value
      .filter(
        (link) =>
          link.company_id ===
          companyId
      )
      .map(
        (link) =>
          link.employee_id
      )
  ).size

const companyHoursFor = (
  companyId: string
) =>
  formatWorkedTime(
    minutesForEntries(
      monthEntries.value.filter(
        (entry) =>
          entry.company_id ===
          companyId
      )
    )
  )

const companySalaryFor = (
  companyId: string
) =>
  formatMoney(
    salaryForEntries(
      monthEntries.value.filter(
        (entry) =>
          entry.company_id ===
          companyId
      )
    )
  )

const loadData = async () => {
  const { start, end } =
    monthBounds.value

  const [
    employeesResult,
    linksResult,
    entriesResult,
  ] = await Promise.all([
    supabase
      .from('employees')
      .select('id, hourly_rate'),

    supabase
      .from('employee_companies')
      .select(
        'employee_id, company_id'
      ),

    supabase
      .from('all_employee_time_entries')
      .select(
        'id, employee_id, company_id, work_date, worked_minutes'
      )
      .gte('work_date', start)
      .lte('work_date', end),
  ])

  if (employeesResult.error) {
    console.error(
      'Erreur employées :',
      employeesResult.error
    )
  }

  if (linksResult.error) {
    console.error(
      'Erreur rattachements :',
      linksResult.error
    )
  }

  if (entriesResult.error) {
    console.error(
      'Erreur heures :',
      entriesResult.error
    )
  }

  allEmployees.value =
    (employeesResult.data ?? [])
      .map((employee) => ({
        id: employee.id,
        hourly_rate:
          Number(
            employee.hourly_rate ?? 0
          ),
      }))

  employeeCompanyLinks.value =
    linksResult.data ?? []

  monthEntries.value =
    (entriesResult.data ?? [])
      .map((entry) => ({
        ...entry,
        worked_minutes:
          Number(
            entry.worked_minutes ?? 0
          ),
      }))
}

watch(
  selectedMonth,
  async () => {
    await loadData()
  }
)

onMounted(async () => {
  const {
    data: { user },
  } =
    await supabase.auth.getUser()

  if (!user) {
    await router.push('/')
    return
  }

  const {
    data: adminProfile,
    error: adminError,
  } = await supabase
    .from('profiles')
    .select('first_name, role')
    .eq('id', user.id)
    .single()

  if (
    adminError ||
    !adminProfile ||
    adminProfile.role !== 'admin'
  ) {
    await router.push('/home')
    return
  }

  firstName.value =
    adminProfile.first_name ?? ''

  const {
    data: companiesData,
    error: companiesError,
  } = await supabase
    .from('companies')
    .select('id, name')
    .order('name')

  if (companiesError) {
    console.error(
      companiesError
    )
    return
  }

  companies.value =
    companiesData ?? []

  if (
    companies.value.length > 0
  ) {
    selectedCompanyId.value =
      companies.value[0].id
  }

  await loadData()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.admin-page {
  min-height: 100vh;
  padding: 28px 20px 110px;
  background: #f7f1ec;
  color: #17372f;
}

.topbar,
.month-section,
.global-section,
.companies-section,
.summary-grid,
.employees-section {
  width: 100%;
  max-width: 520px;
  margin-left: auto;
  margin-right: auto;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 22px;
}

.eyebrow {
  margin: 0 0 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #9b8174;
}

.topbar h1,
.month-section h2,
.global-section h2,
.companies-section h2,
.section-header h2,
.modal-header h2 {
  margin: 0;
  color: #17372f;
}

.topbar h1 {
  font-size: 28px;
}

.subtitle {
  margin: 5px 0 0;
  font-size: 13px;
  color: #7d7874;
}

.profile-button {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 10px 6px 6px;
  border-radius: 999px;
  background: #17372f;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.profile-icon {
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f1e3dc;
  color: #17372f;
  font-size: 13px;
  font-weight: 800;
}

.month-section {
  margin-bottom: 20px;
}

.month-picker {
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  gap: 10px;
  padding: 11px;
  border: 1px solid #e8ddd6;
  border-radius: 20px;
  background: #fff;
}

.month-picker > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.month-picker span {
  font-size: 10px;
  color: #8c8580;
}

.month-picker strong {
  text-transform: capitalize;
  font-size: 15px;
}

.month-arrow {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 14px;
  background: #f1e3dc;
  color: #17372f;
  font-size: 27px;
  cursor: pointer;
}

.global-section {
  padding: 18px;
  margin-bottom: 22px;
  border-radius: 24px;
  background: #17372f;
  color: #fff;
}

.section-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.global-section .eyebrow {
  color: #d7bfb3;
}

.global-section h2 {
  color: #fff;
  font-size: 21px;
}

.global-badge {
  padding: 6px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.11);
  font-size: 10px;
}

.global-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin-bottom: 12px;
}

.global-summary .summary-card {
  border: 1px solid #e1cec2;
  background: #fff;
}

.global-summary .summary-card span {
  color: #806e65;
}

.global-summary .summary-card strong {
  color: #17372f;
}

.company-overview-list {
  display: grid;
  gap: 8px;
}

.company-overview-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border: 1px solid #e1cec2;
  border-radius: 14px;
  background: #fff;
  color: #17372f;
}

.company-overview-card > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.company-overview-card span {
  font-size: 10px;
  color: #806e65;
}

.company-overview-values {
  text-align: right;
}

.companies-section {
  margin-bottom: 24px;
}

.companies-section h2 {
  margin-bottom: 14px;
  font-size: 20px;
}

.company-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
}

.company-button {
  min-width: 0;
  padding: 15px 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  border: 1px solid #e7ddd6;
  border-radius: 18px;
  background: #fff;
  color: #17372f;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.company-button.active {
  border-color: #17372f;
  background: #17372f;
  color: #fff;
}

.company-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f1e3dc;
  color: #17372f;
  font-weight: 700;
}

.company-button.active .company-icon {
  background: #f7f1ec;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 25px;
}

.summary-card {
  padding: 18px;
  border: 1px solid #ede5df;
  border-radius: 20px;
  background: #fff;
}

.salary-card {
  grid-column: 1 / -1;
}

.summary-card span {
  display: block;
  margin-bottom: 6px;
  font-size: 11px;
  color: #8c8580;
}

.summary-card strong {
  font-size: 22px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 15px;
  margin-bottom: 14px;
}

.section-header h2 {
  font-size: 21px;
}

.add-button {
  padding: 11px 15px;
  border: 0;
  border-radius: 14px;
  background: #c66b50;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.add-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-card {
  padding: 30px 20px;
  border: 1px solid #ede5df;
  border-radius: 20px;
  background: #fff;
  text-align: center;
  color: #8b8581;
}

.empty-card strong {
  display: block;
  margin-bottom: 5px;
  color: #17372f;
}

.empty-card p {
  margin: 0;
  font-size: 12px;
}

.empty-avatar {
  width: 44px;
  height: 44px;
  margin: 0 auto 12px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f1e3dc;
  color: #17372f;
  font-size: 20px;
}

.employee-card {
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #ede5df;
  border-radius: 21px;
  background: #fff;
}

.employee-main {
  display: flex;
  align-items: center;
  gap: 13px;
}

.employee-avatar {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f1e3dc;
  font-size: 18px;
  font-weight: 700;
}

.employee-info {
  min-width: 0;
}

.employee-info h3 {
  margin: 0;
  font-size: 15px;
}

.employee-info p {
  margin: 3px 0;
  font-size: 12px;
  color: #8e8782;
}

.employee-info > span {
  font-size: 11px;
  color: #755f54;
}

.employee-companies {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 7px;
}

.mini-company-badge {
  padding: 4px 7px;
  border-radius: 999px;
  background: #edf2ef;
  color: #17372f !important;
  font-size: 9px !important;
  font-weight: 700;
}

.employee-month-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 13px;
}

.employee-month-summary > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 11px 12px;
  border-radius: 13px;
  background: #f7f1ec;
}

.employee-month-summary small {
  font-size: 9px;
  color: #8c8580;
}

.employee-month-summary span,
.employee-month-summary strong {
  font-size: 13px;
}

.employee-total {
  text-align: right;
}

.employee-salary-line {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 8px;
  padding: 9px 11px;
  border-radius: 12px;
  background: #f1e3dc;
  font-size: 11px;
}

.employee-actions {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 7px;
  margin-top: 14px;
}

.hours-button,
.small-button {
  padding: 9px 10px;
  border-radius: 11px;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
}

.hours-button {
  border: 0;
  background: #17372f;
  color: #fff;
}

.small-button {
  border: 1px solid #ded4cd;
  background: #fff;
  color: #17372f;
}

.small-button.delete {
  color: #b34f3d;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  padding: 20px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(23, 55, 47, 0.35);
}

.higher-modal {
  z-index: 200;
}

.modal-card {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 22px;
  border-radius: 26px 26px 18px 18px;
  background: #fdfaf7;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 16px;
}

.modal-header h2 {
  font-size: 22px;
}

.close-button {
  width: 35px;
  height: 35px;
  border: 0;
  border-radius: 50%;
  background: #efe5df;
  color: #17372f;
  font-size: 23px;
  cursor: pointer;
}

.form-help {
  margin: -5px 0 16px;
  padding: 11px 12px;
  border-radius: 13px;
  background: #f1e7e1;
  color: #755f54;
  font-size: 11px;
  line-height: 1.45;
}

.employee-form {
  display: grid;
  gap: 14px;
}

.employee-form label > span,
.companies-fieldset legend {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
}

.employee-form input,
.employee-form select {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #ded4cd;
  border-radius: 14px;
  outline: none;
  background: #fff;
  color: #17372f;
  font: inherit;
}

.companies-fieldset {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  border: 0;
}

.company-check {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 12px;
  border: 1px solid #e7ddd6;
  border-radius: 13px;
  background: #fff;
}

.company-check input {
  width: 18px;
  height: 18px;
  margin: 0;
}

.company-check span {
  margin: 0 !important;
}

.time-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.calculated-hours {
  display: flex;
  justify-content: space-between;
  padding: 13px 14px;
  border-radius: 14px;
  background: #efe5df;
}

.form-error {
  padding: 10px 12px;
  border-radius: 12px;
  background: #f8e4df;
  color: #a54e3b;
  font-size: 12px;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.cancel-button,
.save-button {
  padding: 13px;
  border-radius: 14px;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
}

.cancel-button {
  border: 1px solid #ded4cd;
  background: #fff;
  color: #17372f;
}

.save-button {
  border: 0;
  background: #17372f;
  color: #fff;
}

.hours-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.hours-summary > div {
  padding: 14px;
  border-radius: 15px;
  background: #f1e7e1;
}

.hours-summary span {
  display: block;
  margin-bottom: 5px;
  font-size: 10px;
  color: #8c8580;
}

.employee-company-breakdown {
  display: grid;
  gap: 7px;
  margin-bottom: 14px;
}

.employee-company-breakdown article {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 11px;
  border: 1px solid #e7ddd6;
  border-radius: 12px;
  background: #fff;
  font-size: 11px;
}

.add-hours-button {
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: 0;
  border-radius: 14px;
  background: #c66b50;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.time-entry-card {
  padding: 14px;
  margin-bottom: 10px;
  border: 1px solid #e7ddd6;
  border-radius: 17px;
  background: #fff;
}

.time-entry-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.time-entry-top p,
.pause-line {
  margin: 4px 0 0;
  font-size: 12px;
  color: #847d78;
}

.entry-company {
  display: inline-block;
  margin-top: 8px;
  padding: 5px 8px;
  border-radius: 9px;
  background: #edf2ef;
  font-size: 10px;
  font-weight: 700;
}

.worked-badge {
  height: fit-content;
  padding: 6px 9px;
  border-radius: 10px;
  background: #edf2ef;
  font-size: 11px;
  font-weight: 700;
}

.time-entry-actions {
  display: flex;
  justify-content: flex-end;
  gap: 7px;
  margin-top: 12px;
}

@media (max-width: 420px) {
  .admin-page {
    padding-left: 14px;
    padding-right: 14px;
  }

  .topbar h1 {
    font-size: 24px;
  }

  .global-summary,
  .hours-summary,
  .employee-month-summary {
    grid-template-columns: 1fr 1fr;
  }

  .time-grid {
    grid-template-columns: 1fr;
  }

  .employee-actions {
    grid-template-columns: 1fr 1fr;
  }

  .hours-button {
    grid-column: 1 / -1;
  }
}

/* =========================
   NAVBAR ADMIN
========================= */

.admin-bottom-nav {
  position: fixed;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%);
  z-index: 90;
  width: calc(100% - 28px);
  max-width: 490px;
  height: 68px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  padding: 7px;
  border: 1px solid #e4d8d0;
  border-radius: 22px;
  background: #fff;
  box-shadow:
    0 8px 30px rgba(23, 55, 47, 0.10),
    0 2px 8px rgba(23, 55, 47, 0.05);
}

.admin-nav-item {
  height: 54px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border-radius: 16px;
  color: #9a918c;
  text-decoration: none;
  font-size: 10px;
  font-weight: 600;
}

.admin-nav-icon {
  font-size: 19px;
  line-height: 1;
}

.admin-nav-item.active {
  background: #17372f;
  color: #fff;
}

</style>
