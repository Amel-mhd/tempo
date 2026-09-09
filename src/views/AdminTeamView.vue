<template>
  <main class="admin-page">
    <header class="topbar">
      <div>
        <p class="eyebrow">Administration</p>
        <h1>Équipe</h1>
        <p class="subtitle">
          Gérez les employées, leurs sociétés et leurs heures.
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

    <section class="companies-section">
      <p class="eyebrow">Sociétés</p>
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



    <section class="employees-section">
      <div class="section-header">
        <div>
          <p class="eyebrow">Équipe</p>
          <h2>
            {{ selectedCompany?.name || 'Employées' }}
          </h2>
        </div>

        <button
          type="button"
          class="add-button"
          :disabled="!selectedCompanyId"
          @click="openCreateEmployee"
        >
          + Ajouter
        </button>
      </div>

      <div
        v-if="loading"
        class="empty-card"
      >
        Chargement...
      </div>

      <div
        v-else-if="employees.length === 0"
        class="empty-card"
      >
        <div class="empty-avatar">+</div>
        <strong>Aucune employée</strong>
        <p>
          Ajoutez la première employée de
          {{ selectedCompany?.name }}.
        </p>
      </div>

      <div v-else class="employees-list">
        <article
          v-for="employee in employees"
          :key="employee.id"
          class="employee-card"
        >
          <div class="employee-main">
            <div class="employee-avatar">
              {{ employee.first_name.charAt(0).toUpperCase() }}
            </div>

            <div class="employee-info">
              <h3>
                {{ employee.first_name }}
                {{ employee.last_name }}
              </h3>

              <p v-if="employee.phone">
                {{ formatPhone(employee.phone) }}
              </p>

              <span>
                {{ formatMoney(employee.hourly_rate) }}
                € / heure
              </span>

              <div class="employee-companies">
                <span
                  v-for="company in employeeCompanies(employee.id)"
                  :key="`${employee.id}-${company.id}`"
                  class="mini-company-badge"
                >
                  {{ company.name }}
                </span>
              </div>
            </div>
          </div>

          <div class="employee-month-summary">
            <div>
              <small>{{ selectedCompany?.name }}</small>
              <span>
                {{ employeeCompanyHours(employee.id, selectedCompanyId) }}
              </span>
            </div>

            <div class="employee-total">
              <small>Total toutes sociétés</small>
              <strong>
                {{ employeeAllCompaniesHours(employee.id) }}
              </strong>
            </div>
          </div>

          <div class="employee-salary-line">
            <span>Salaire estimé total</span>
            <strong>
              {{ employeeAllCompaniesSalary(employee.id) }} €
            </strong>
          </div>

          <div class="employee-actions">
            <button
              type="button"
              class="hours-button"
              @click="manageHours(employee)"
            >
              Gérer les heures
            </button>

            <button
              type="button"
              class="small-button"
              @click="openEditEmployee(employee)"
            >
              Modifier
            </button>

            <button
              type="button"
              class="small-button delete"
              @click="removeEmployee(employee)"
            >
              Supprimer
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- MODAL EMPLOYÉE -->
    <div
      v-if="showEmployeeModal"
      class="modal-backdrop"
      @click.self="closeEmployeeModal"
    >
      <section class="modal-card">
        <div class="modal-header">
          <div>
            <p class="eyebrow">
              {{ editingEmployee ? 'Modification' : 'Nouvelle employée' }}
            </p>

            <h2>
              {{
                editingEmployee
                  ? 'Modifier l’employée'
                  : 'Ajouter une employée'
              }}
            </h2>
          </div>

          <button
            type="button"
            class="close-button"
            @click="closeEmployeeModal"
          >
            ×
          </button>
        </div>

        <p
          v-if="!editingEmployee"
          class="form-help"
        >
          Si cette personne existe déjà dans une autre société,
          utilisez le même numéro de téléphone : Tempo la rattachera
          automatiquement au même profil.
        </p>

        <form
          class="employee-form"
          @submit.prevent="saveEmployee"
        >
          <label>
            <span>Prénom</span>
            <input
              v-model.trim="employeeForm.firstName"
              type="text"
              required
            />
          </label>

          <label>
            <span>Nom</span>
            <input
              v-model.trim="employeeForm.lastName"
              type="text"
              required
            />
          </label>

          <label>
            <span>Numéro de téléphone</span>
            <input
              v-model.trim="employeeForm.phone"
              type="tel"
              placeholder="06 12 34 56 78"
              required
            />
          </label>

          <label>
            <span>Taux horaire (€)</span>
            <input
              v-model.number="employeeForm.hourlyRate"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </label>

          <fieldset class="companies-fieldset">
            <legend>Sociétés de l’employée</legend>

            <label
              v-for="company in companies"
              :key="`employee-company-${company.id}`"
              class="company-check"
            >
              <input
                v-model="employeeForm.companyIds"
                type="checkbox"
                :value="company.id"
              />

              <span>{{ company.name }}</span>
            </label>
          </fieldset>

          <div
            v-if="employeeFormError"
            class="form-error"
          >
            {{ employeeFormError }}
          </div>

          <div class="modal-actions">
            <button
              type="button"
              class="cancel-button"
              @click="closeEmployeeModal"
            >
              Annuler
            </button>

            <button
              type="submit"
              class="save-button"
              :disabled="savingEmployee"
            >
              {{
                savingEmployee
                  ? 'Enregistrement...'
                  : editingEmployee
                    ? 'Enregistrer'
                    : 'Ajouter'
              }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <!-- MODAL GESTION DES HEURES -->
    <div
      v-if="showHoursModal"
      class="modal-backdrop"
      @click.self="closeHoursModal"
    >
      <section class="modal-card hours-modal">
        <div class="modal-header">
          <div>
            <p class="eyebrow">
              Horaires · {{ selectedMonthLabel }}
            </p>

            <h2>
              {{ selectedEmployee?.first_name }}
              {{ selectedEmployee?.last_name }}
            </h2>
          </div>

          <button
            type="button"
            class="close-button"
            @click="closeHoursModal"
          >
            ×
          </button>
        </div>

        <div class="hours-summary">
          <div>
            <span>Total toutes sociétés</span>
            <strong>{{ selectedEmployeeMonthHours }}</strong>
          </div>

          <div>
            <span>Salaire estimé</span>
            <strong>{{ selectedEmployeeMonthSalary }} €</strong>
          </div>
        </div>

        <div class="employee-company-breakdown">
          <article
            v-for="company in selectedEmployeeCompanies"
            :key="`breakdown-${company.id}`"
          >
            <span>{{ company.name }}</span>
            <strong>
              {{ employeeCompanyHours(selectedEmployee?.id || '', company.id) }}
            </strong>
          </article>
        </div>

        <button
          type="button"
          class="add-hours-button"
          @click="openCreateTimeEntry"
        >
          + Ajouter des heures
        </button>

        <div
          v-if="selectedEmployeeTimeEntries.length === 0"
          class="empty-card"
        >
          <strong>Aucune journée enregistrée</strong>
          <p>
            Ajoutez les premières heures de cette employée
            pour {{ selectedMonthLabel }}.
          </p>
        </div>

        <div
          v-else
          class="time-entry-list"
        >
          <article
            v-for="entry in selectedEmployeeTimeEntries"
            :key="entry.id"
            class="time-entry-card"
          >
            <div class="time-entry-top">
              <div>
                <strong>
                  {{ formatDate(entry.work_date) }}
                </strong>

                <p>
                  {{ formatTime(entry.start_time) }}
                  →
                  {{ formatTime(entry.end_time) }}
                </p>
              </div>

              <span class="worked-badge">
                {{ formatWorkedTime(entry.worked_minutes) }}
              </span>
            </div>

            <div class="entry-company">
              {{ companyName(entry.company_id) }}
            </div>

            <p
              v-if="entry.pause_start && entry.pause_end"
              class="pause-line"
            >
              Pause :
              {{ formatTime(entry.pause_start) }}
              →
              {{ formatTime(entry.pause_end) }}
            </p>

            <div class="time-entry-actions">
              <button
                type="button"
                class="small-button"
                @click="openEditTimeEntry(entry)"
              >
                Modifier
              </button>

              <button
                type="button"
                class="small-button delete"
                @click="removeTimeEntry(entry)"
              >
                Supprimer
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>

    <!-- MODAL AJOUT / MODIFICATION HEURES -->
    <div
      v-if="showTimeEntryModal"
      class="modal-backdrop higher-modal"
      @click.self="closeTimeEntryModal"
    >
      <section class="modal-card">
        <div class="modal-header">
          <div>
            <p class="eyebrow">
              {{ editingTimeEntry ? 'Modification' : 'Nouvelle journée' }}
            </p>

            <h2>
              {{
                editingTimeEntry
                  ? 'Modifier les heures'
                  : 'Ajouter des heures'
              }}
            </h2>
          </div>

          <button
            type="button"
            class="close-button"
            @click="closeTimeEntryModal"
          >
            ×
          </button>
        </div>

        <form
          class="employee-form"
          @submit.prevent="saveTimeEntry"
        >
          <label>
            <span>Société</span>
            <select
              v-model="timeForm.companyId"
              required
            >
              <option
                value=""
                disabled
              >
                Choisir une société
              </option>

              <option
                v-for="company in selectedEmployeeCompanies"
                :key="`time-company-${company.id}`"
                :value="company.id"
              >
                {{ company.name }}
              </option>
            </select>
          </label>

          <label>
            <span>Date</span>
            <input
              v-model="timeForm.date"
              type="date"
              required
            />
          </label>

          <div class="time-grid">
            <label>
              <span>Début</span>
              <input
                v-model="timeForm.startTime"
                type="time"
                required
              />
            </label>

            <label>
              <span>Fin</span>
              <input
                v-model="timeForm.endTime"
                type="time"
                required
              />
            </label>

            <label>
              <span>Début pause (optionnel)</span>
              <input
                v-model="timeForm.pauseStart"
                type="time"
              />
            </label>

            <label>
              <span>Fin pause (optionnel)</span>
              <input
                v-model="timeForm.pauseEnd"
                type="time"
              />
            </label>
          </div>

          <div class="calculated-hours">
            <span>Temps travaillé</span>
            <strong>{{ calculatedWorkedTime }}</strong>
          </div>

          <div
            v-if="timeFormError"
            class="form-error"
          >
            {{ timeFormError }}
          </div>

          <div class="modal-actions">
            <button
              type="button"
              class="cancel-button"
              @click="closeTimeEntryModal"
            >
              Annuler
            </button>

            <button
              type="submit"
              class="save-button"
              :disabled="savingTimeEntry"
            >
              {{
                savingTimeEntry
                  ? 'Enregistrement...'
                  : 'Enregistrer'
              }}
            </button>
          </div>
        </form>
      </section>
    </div>


    <nav class="admin-bottom-nav">
      <RouterLink to="/admin" class="admin-nav-item" exact-active-class="active">
        <span class="admin-nav-icon">⌂</span>
        <span>Accueil</span>
      </RouterLink>

      <RouterLink to="/admin/equipe" class="admin-nav-item" active-class="active">
        <span class="admin-nav-icon">♙♙</span>
        <span>Équipe</span>
      </RouterLink>

      <RouterLink to="/admin/profile" class="admin-nav-item" active-class="active">
        <span class="admin-nav-icon">♙</span>
        <span>Profil</span>
      </RouterLink>
    </nav>

  </main>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue'

import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

interface Company {
  id: string
  name: string
}

interface Employee {
  id: string
  first_name: string
  last_name: string
  phone: string | null
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
  start_time: string
  pause_start: string | null
  pause_end: string | null
  end_time: string
  worked_minutes: number
}

const router = useRouter()

const firstName = ref('')
const companies = ref<Company[]>([])
const allEmployees = ref<Employee[]>([])
const employeeCompanyLinks = ref<EmployeeCompany[]>([])
const monthEntries = ref<EmployeeTimeEntry[]>([])

const loading = ref(false)
const selectedCompanyId = ref('')

const now = new Date()
const selectedMonth = ref(
  `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}`
)

const showEmployeeModal = ref(false)
const editingEmployee = ref<Employee | null>(null)
const savingEmployee = ref(false)
const employeeFormError = ref('')

const employeeForm = ref({
  firstName: '',
  lastName: '',
  phone: '',
  hourlyRate: 0,
  companyIds: [] as string[],
})

const showHoursModal = ref(false)
const selectedEmployee = ref<Employee | null>(null)

const showTimeEntryModal = ref(false)
const editingTimeEntry = ref<EmployeeTimeEntry | null>(null)
const savingTimeEntry = ref(false)
const timeFormError = ref('')

const timeForm = ref({
  companyId: '',
  date: '',
  startTime: '09:00',
  pauseStart: '',
  pauseEnd: '',
  endTime: '18:00',
})

const selectedCompany = computed(() =>
  companies.value.find(
    (company) =>
      company.id === selectedCompanyId.value
  )
)

const selectedMonthLabel = computed(() => {
  const [year, month] =
    selectedMonth.value.split('-').map(Number)

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
    selectedMonth.value.split('-').map(Number)

  const lastDay =
    new Date(year, month, 0).getDate()

  return {
    start:
      `${year}-${String(month).padStart(2, '0')}-01`,
    end:
      `${year}-${String(month).padStart(2, '0')}-${String(
        lastDay
      ).padStart(2, '0')}`,
  }
})

const previousMonth = () => {
  const [year, month] =
    selectedMonth.value.split('-').map(Number)

  const date = new Date(year, month - 2, 1)

  selectedMonth.value =
    `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`
}

const nextMonth = () => {
  const [year, month] =
    selectedMonth.value.split('-').map(Number)

  const date = new Date(year, month, 1)

  selectedMonth.value =
    `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`
}

const formatMoney = (value: number) =>
  Number(value ?? 0)
    .toFixed(2)
    .replace('.', ',')

const formatWorkedTime = (minutes: number) => {
  const safeMinutes = Number(minutes ?? 0)
  const hours = Math.floor(safeMinutes / 60)
  const remainingMinutes = safeMinutes % 60

  if (remainingMinutes === 0) {
    return `${hours} h`
  }

  return `${hours} h ${String(
    remainingMinutes
  ).padStart(2, '0')}`
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(
    'fr-FR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
  ).format(
    new Date(`${date}T12:00:00`)
  )

const formatTime = (time: string | null) =>
  time ? time.slice(0, 5) : ''

const normalizePhone = (phone: string) =>
  phone.replace(/\D/g, '')

const formatPhone = (phone: string) => {
  const digits = normalizePhone(phone)

  if (digits.length !== 10) {
    return phone
  }

  return digits
    .match(/.{1,2}/g)
    ?.join(' ') ?? phone
}

const companyName = (companyId: string) =>
  companies.value.find(
    (company) => company.id === companyId
  )?.name ?? 'Société'

const employeeRate = (employeeId: string) =>
  allEmployees.value.find(
    (employee) => employee.id === employeeId
  )?.hourly_rate ?? 0

const minutesForEntries = (
  entries: EmployeeTimeEntry[]
) =>
  entries.reduce(
    (total, entry) =>
      total + Number(entry.worked_minutes ?? 0),
    0
  )

const salaryForEntries = (
  entries: EmployeeTimeEntry[]
) =>
  entries.reduce(
    (total, entry) =>
      total +
      (Number(entry.worked_minutes ?? 0) / 60) *
        employeeRate(entry.employee_id),
    0
  )

const employeeCompanies = (
  employeeId: string
) => {
  const ids =
    employeeCompanyLinks.value
      .filter(
        (link) =>
          link.employee_id === employeeId
      )
      .map((link) => link.company_id)

  return companies.value.filter(
    (company) => ids.includes(company.id)
  )
}

const selectedEmployeeCompanies = computed(() => {
  if (!selectedEmployee.value) {
    return []
  }

  return employeeCompanies(
    selectedEmployee.value.id
  )
})

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
      .map((link) => link.employee_id)

  return allEmployees.value
    .filter(
      (employee) =>
        employeeIds.includes(employee.id)
    )
    .sort((a, b) =>
      a.first_name.localeCompare(
        b.first_name,
        'fr'
      )
    )
})

const employeeCompanyHours = (
  employeeId: string,
  companyId: string
) =>
  formatWorkedTime(
    minutesForEntries(
      monthEntries.value.filter(
        (entry) =>
          entry.employee_id === employeeId &&
          entry.company_id === companyId
      )
    )
  )

const employeeAllCompaniesHours = (
  employeeId: string
) =>
  formatWorkedTime(
    minutesForEntries(
      monthEntries.value.filter(
        (entry) =>
          entry.employee_id === employeeId
      )
    )
  )

const employeeAllCompaniesSalary = (
  employeeId: string
) =>
  formatMoney(
    salaryForEntries(
      monthEntries.value.filter(
        (entry) =>
          entry.employee_id === employeeId
      )
    )
  )

const selectedEmployeeTimeEntries =
  computed(() => {
    if (!selectedEmployee.value) {
      return []
    }

    return monthEntries.value
      .filter(
        (entry) =>
          entry.employee_id ===
          selectedEmployee.value?.id
      )
      .sort(
        (a, b) =>
          b.work_date.localeCompare(
            a.work_date
          ) ||
          b.start_time.localeCompare(
            a.start_time
          )
      )
  })

const selectedEmployeeMonthMinutes =
  computed(() =>
    minutesForEntries(
      selectedEmployeeTimeEntries.value
    )
  )

const selectedEmployeeMonthHours =
  computed(() =>
    formatWorkedTime(
      selectedEmployeeMonthMinutes.value
    )
  )

const selectedEmployeeMonthSalary =
  computed(() => {
    if (!selectedEmployee.value) {
      return '0,00'
    }

    return formatMoney(
      (selectedEmployeeMonthMinutes.value /
        60) *
        selectedEmployee.value.hourly_rate
    )
  })

const loadData = async () => {
  loading.value = true

  const { start, end } =
    monthBounds.value

  const [
    employeesResult,
    linksResult,
    entriesResult,
  ] = await Promise.all([
    supabase
      .from('employees')
      .select(`
        id,
        first_name,
        last_name,
        phone,
        hourly_rate
      `),

    supabase
      .from('employee_companies')
      .select(`
        employee_id,
        company_id
      `),

    supabase
      .from('employee_time_entries')
      .select('*')
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
    (employeesResult.data ?? []).map(
      (employee) => ({
        ...employee,
        hourly_rate:
          Number(
            employee.hourly_rate ?? 0
          ),
      })
    )

  employeeCompanyLinks.value =
    linksResult.data ?? []

  monthEntries.value =
    (entriesResult.data ?? []).map(
      (entry) => ({
        ...entry,
        worked_minutes:
          Number(
            entry.worked_minutes ?? 0
          ),
      })
    )

  loading.value = false
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
  } = await supabase.auth.getUser()

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
    console.error(companiesError)
    return
  }

  companies.value =
    companiesData ?? []

  if (companies.value.length > 0) {
    selectedCompanyId.value =
      companies.value[0].id
  }

  await loadData()
})

const resetEmployeeForm = () => {
  employeeForm.value = {
    firstName: '',
    lastName: '',
    phone: '',
    hourlyRate: 0,
    companyIds:
      selectedCompanyId.value
        ? [selectedCompanyId.value]
        : [],
  }

  employeeFormError.value = ''
}

const openCreateEmployee = () => {
  editingEmployee.value = null
  resetEmployeeForm()
  showEmployeeModal.value = true
}

const openEditEmployee = (
  employee: Employee
) => {
  editingEmployee.value = employee

  employeeForm.value = {
    firstName:
      employee.first_name,
    lastName:
      employee.last_name,
    phone:
      employee.phone ?? '',
    hourlyRate:
      employee.hourly_rate,
    companyIds:
      employeeCompanies(employee.id)
        .map(
          (company) => company.id
        ),
  }

  employeeFormError.value = ''
  showEmployeeModal.value = true
}

const closeEmployeeModal = () => {
  showEmployeeModal.value = false
  editingEmployee.value = null
  resetEmployeeForm()
}

const saveEmployeeLinks = async (
  employeeId: string,
  companyIds: string[]
) => {
  const { error: deleteError } =
    await supabase
      .from('employee_companies')
      .delete()
      .eq('employee_id', employeeId)

  if (deleteError) {
    throw deleteError
  }

  const { error: insertError } =
    await supabase
      .from('employee_companies')
      .insert(
        companyIds.map(
          (companyId) => ({
            employee_id: employeeId,
            company_id: companyId,
          })
        )
      )

  if (insertError) {
    throw insertError
  }
}

const saveEmployee = async () => {
  employeeFormError.value = ''

  if (
    employeeForm.value.companyIds.length === 0
  ) {
    employeeFormError.value =
      'Choisissez au moins une société.'
    return
  }

  const normalizedPhone =
    normalizePhone(
      employeeForm.value.phone
    )

  if (!normalizedPhone) {
    employeeFormError.value =
      'Le numéro de téléphone est obligatoire.'
    return
  }

  savingEmployee.value = true

  try {
    if (editingEmployee.value) {
      const { error } = await supabase
        .from('employees')
        .update({
          first_name:
            employeeForm.value.firstName,
          last_name:
            employeeForm.value.lastName,
          phone:
            normalizedPhone,
          hourly_rate:
            Number(
              employeeForm.value.hourlyRate
            ),
        })
        .eq(
          'id',
          editingEmployee.value.id
        )

      if (error) {
        throw error
      }

      await saveEmployeeLinks(
        editingEmployee.value.id,
        employeeForm.value.companyIds
      )
    } else {
      const existingEmployee =
        allEmployees.value.find(
          (employee) =>
            employee.phone &&
            normalizePhone(
              employee.phone
            ) === normalizedPhone
        )

      if (existingEmployee) {
        const mergedCompanyIds =
          Array.from(
            new Set([
              ...employeeCompanies(
                existingEmployee.id
              ).map(
                (company) => company.id
              ),
              ...employeeForm.value.companyIds,
            ])
          )

        const { error } = await supabase
          .from('employees')
          .update({
            first_name:
              employeeForm.value.firstName,
            last_name:
              employeeForm.value.lastName,
            hourly_rate:
              Number(
                employeeForm.value.hourlyRate
              ),
          })
          .eq(
            'id',
            existingEmployee.id
          )

        if (error) {
          throw error
        }

        await saveEmployeeLinks(
          existingEmployee.id,
          mergedCompanyIds
        )
      } else {
        const {
          data,
          error,
        } = await supabase
          .from('employees')
          .insert({
            first_name:
              employeeForm.value.firstName,
            last_name:
              employeeForm.value.lastName,
            phone:
              normalizedPhone,
            hourly_rate:
              Number(
                employeeForm.value.hourlyRate
              ),
          })
          .select('id')
          .single()

        if (error || !data) {
          throw error ??
            new Error(
              'Employée non créée'
            )
        }

        await saveEmployeeLinks(
          data.id,
          employeeForm.value.companyIds
        )
      }
    }

    savingEmployee.value = false
    closeEmployeeModal()
    await loadData()
  } catch (error) {
    console.error(error)

    employeeFormError.value =
      'Impossible d’enregistrer cette employée.'

    savingEmployee.value = false
  }
}

const removeEmployee = async (
  employee: Employee
) => {
  const confirmed =
    window.confirm(
      `Supprimer ${employee.first_name} ${employee.last_name} ? Toutes ses heures de toutes les sociétés seront également supprimées.`
    )

  if (!confirmed) {
    return
  }

  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', employee.id)

  if (error) {
    console.error(error)
    return
  }

  await loadData()
}

const manageHours = (
  employee: Employee
) => {
  selectedEmployee.value = employee
  showHoursModal.value = true
}

const closeHoursModal = () => {
  showHoursModal.value = false
  selectedEmployee.value = null
}

const resetTimeForm = () => {
  const [year, month] =
    selectedMonth.value.split('-').map(Number)

  const current = new Date()
  const isCurrentMonth =
    current.getFullYear() === year &&
    current.getMonth() + 1 === month

  const day =
    isCurrentMonth
      ? current.getDate()
      : 1

  const defaultCompany =
    selectedEmployee.value &&
    employeeCompanies(
      selectedEmployee.value.id
    ).some(
      (company) =>
        company.id ===
        selectedCompanyId.value
    )
      ? selectedCompanyId.value
      : selectedEmployeeCompanies.value[0]
          ?.id ?? ''

  timeForm.value = {
    companyId:
      defaultCompany,
    date:
      `${year}-${String(month).padStart(
        2,
        '0'
      )}-${String(day).padStart(
        2,
        '0'
      )}`,
    startTime: '09:00',
    pauseStart: '',
    pauseEnd: '',
    endTime: '18:00',
  }

  timeFormError.value = ''
}

const openCreateTimeEntry = () => {
  editingTimeEntry.value = null
  resetTimeForm()
  showTimeEntryModal.value = true
}

const openEditTimeEntry = (
  entry: EmployeeTimeEntry
) => {
  editingTimeEntry.value = entry

  timeForm.value = {
    companyId:
      entry.company_id,
    date:
      entry.work_date,
    startTime:
      formatTime(
        entry.start_time
      ),
    pauseStart:
      formatTime(
        entry.pause_start
      ),
    pauseEnd:
      formatTime(
        entry.pause_end
      ),
    endTime:
      formatTime(
        entry.end_time
      ),
  }

  timeFormError.value = ''
  showTimeEntryModal.value = true
}

const closeTimeEntryModal = () => {
  showTimeEntryModal.value = false
  editingTimeEntry.value = null
  timeFormError.value = ''
}

const minutesFromTime = (
  value: string
) => {
  const [hours, minutes] =
    value.split(':').map(Number)

  return hours * 60 + minutes
}

const calculatedWorkedMinutes =
  computed(() => {
    if (
      !timeForm.value.startTime ||
      !timeForm.value.endTime
    ) {
      return 0
    }

    const start =
      minutesFromTime(
        timeForm.value.startTime
      )

    const end =
      minutesFromTime(
        timeForm.value.endTime
      )

    if (end <= start) {
      return 0
    }

    let pauseMinutes = 0

    if (
      timeForm.value.pauseStart &&
      timeForm.value.pauseEnd
    ) {
      const pauseStart =
        minutesFromTime(
          timeForm.value.pauseStart
        )

      const pauseEnd =
        minutesFromTime(
          timeForm.value.pauseEnd
        )

      if (
        pauseEnd <= pauseStart ||
        pauseStart < start ||
        pauseEnd > end
      ) {
        return 0
      }

      pauseMinutes =
        pauseEnd - pauseStart
    }

    return Math.max(
      0,
      end - start - pauseMinutes
    )
  })

const calculatedWorkedTime =
  computed(() =>
    formatWorkedTime(
      calculatedWorkedMinutes.value
    )
  )

const saveTimeEntry = async () => {
  if (!selectedEmployee.value) {
    return
  }

  if (
    !timeForm.value.companyId ||
    !timeForm.value.date ||
    !timeForm.value.startTime ||
    !timeForm.value.endTime
  ) {
    timeFormError.value =
      'La société, la date, le début et la fin sont obligatoires.'
    return
  }

  const hasPauseStart =
    Boolean(
      timeForm.value.pauseStart
    )

  const hasPauseEnd =
    Boolean(
      timeForm.value.pauseEnd
    )

  if (hasPauseStart !== hasPauseEnd) {
    timeFormError.value =
      'Renseignez le début et la fin de la pause, ou laissez les deux champs vides.'
    return
  }

  if (
    calculatedWorkedMinutes.value <= 0
  ) {
    timeFormError.value =
      'Les horaires renseignés ne sont pas valides.'
    return
  }

  savingTimeEntry.value = true
  timeFormError.value = ''

  const payload = {
    employee_id:
      selectedEmployee.value.id,
    company_id:
      timeForm.value.companyId,
    work_date:
      timeForm.value.date,
    start_time:
      timeForm.value.startTime,
    pause_start:
      timeForm.value.pauseStart ||
      null,
    pause_end:
      timeForm.value.pauseEnd ||
      null,
    end_time:
      timeForm.value.endTime,
    worked_minutes:
      calculatedWorkedMinutes.value,
  }

  const query =
    editingTimeEntry.value
      ? supabase
          .from(
            'employee_time_entries'
          )
          .update(payload)
          .eq(
            'id',
            editingTimeEntry.value.id
          )
      : supabase
          .from(
            'employee_time_entries'
          )
          .insert(payload)

  const { error } = await query

  if (error) {
    console.error(error)

    timeFormError.value =
      'Impossible d’enregistrer cette journée.'

    savingTimeEntry.value = false
    return
  }

  savingTimeEntry.value = false
  closeTimeEntryModal()
  await loadData()
}

const removeTimeEntry = async (
  entry: EmployeeTimeEntry
) => {
  const confirmed =
    window.confirm(
      `Supprimer les heures du ${formatDate(entry.work_date)} à ${companyName(entry.company_id)} ?`
    )

  if (!confirmed) {
    return
  }

  const { error } = await supabase
    .from('employee_time_entries')
    .delete()
    .eq('id', entry.id)

  if (error) {
    console.error(error)
    return
  }

  await loadData()
}
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

