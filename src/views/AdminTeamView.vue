<template>
  <main class="admin-page">
    <!-- HEADER -->
    <header class="topbar">
      <div>
        <p class="eyebrow">Administration</p>
        <h1>Équipe</h1>
        <p class="subtitle">
          Gérez les employés, leurs sociétés et leurs heures.
        </p>
      </div>
    </header>

    <!-- ACTIONS -->
    <section class="actions-section">
      <button
        type="button"
        class="primary-action"
        @click="toggleAddEmployee"
      >
        <span class="action-plus">+</span>
        Ajouter un employé
      </button>

      <button
        type="button"
        class="secondary-action"
        @click="toggleAddHours"
      >
        <span class="action-plus">+</span>
        Ajouter des heures
      </button>
    </section>

    <!-- AJOUT EMPLOYÉ -->
    <section
      v-if="showAddEmployee"
      class="form-card"
    >
      <div class="form-header">
        <div>
          <p class="small-eyebrow">Nouvel employé</p>
          <h2>Ajouter un employé</h2>
        </div>

        <button
          type="button"
          class="close-button"
          @click="closeAddEmployee"
        >
          ×
        </button>
      </div>

      <div class="field-grid">
        <div class="field">
          <label>Prénom</label>

          <input
            v-model="newFirstName"
            type="text"
            placeholder="Prénom"
          />
        </div>

        <div class="field">
          <label>Nom</label>

          <input
            v-model="newLastName"
            type="text"
            placeholder="Nom"
          />
        </div>
      </div>

      <div class="field">
        <label>Téléphone</label>

        <input
          v-model="newPhone"
          type="tel"
          placeholder="06 00 00 00 00"
        />
      </div>

      <div class="field">
        <label>Taux horaire</label>

        <div class="rate-field">
          <input
            v-model="newHourlyRate"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
          />

          <span>€ / heure</span>
        </div>
      </div>

      <div class="field">
        <label>Sociétés</label>

        <div class="companies-selector">
          <label
            v-for="company in companies"
            :key="company.id"
            class="company-option"
          >
            <input
              v-model="newCompanyIds"
              type="checkbox"
              :value="company.id"
            />

            <span>
              {{ company.name }}
            </span>
          </label>
        </div>
      </div>

      <p
        v-if="addEmployeeError"
        class="error-message"
      >
        {{ addEmployeeError }}
      </p>

      <div class="form-actions">
        <button
          type="button"
          class="cancel-button"
          @click="closeAddEmployee"
        >
          Annuler
        </button>

        <button
          type="button"
          class="save-button"
          :disabled="addingEmployee"
          @click="addEmployee"
        >
          {{
            addingEmployee
              ? 'Ajout...'
              : 'Ajouter'
          }}
        </button>
      </div>
    </section>

    <!-- AJOUT HEURES -->
    <section
      v-if="showAddHours"
      class="form-card"
    >
      <div class="form-header">
        <div>
          <p class="small-eyebrow">Heures</p>
          <h2>Ajouter des heures</h2>
        </div>

        <button
          type="button"
          class="close-button"
          @click="closeAddHours"
        >
          ×
        </button>
      </div>

      <div class="field">
        <label>Employée</label>

        <select
          v-model="hoursEmployeeId"
          @change="onHoursEmployeeChange"
        >
          <option value="">
            Choisir un employé
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

      <div class="field">
        <label>Société</label>

        <select
          v-model="hoursCompanyId"
          :disabled="availableHourCompanies.length === 0"
        >
          <option value="">
            Choisir une société
          </option>

          <option
            v-for="company in availableHourCompanies"
            :key="company.id"
            :value="company.id"
          >
            {{ company.name }}
          </option>
        </select>

        <span
          v-if="
            hoursEmployeeId &&
            availableHourCompanies.length === 0
          "
          class="field-help"
        >
          Cet employé n'a encore aucune société attribuée.
        </span>
      </div>

      <div class="field">
        <label>Date</label>

        <input
          v-model="hoursDate"
          type="date"
        />
      </div>

      <div class="field-grid">
        <div class="field">
          <label>Début</label>

          <input
            v-model="hoursStart"
            type="time"
          />
        </div>

        <div class="field">
          <label>Fin</label>

          <input
            v-model="hoursEnd"
            type="time"
          />
        </div>
      </div>

      <div class="field-grid">
        <div class="field">
          <label>Début de pause</label>

          <input
            v-model="hoursPauseStart"
            type="time"
          />
        </div>

        <div class="field">
          <label>Fin de pause</label>

          <input
            v-model="hoursPauseEnd"
            type="time"
          />
        </div>
      </div>

      <div
        v-if="workedMinutesPreview > 0"
        class="worked-preview"
      >
        <span>Temps travaillé</span>

        <strong>
          {{ formatMinutes(workedMinutesPreview) }}
        </strong>
      </div>

      <p
        v-if="addHoursError"
        class="error-message"
      >
        {{ addHoursError }}
      </p>

      <div class="form-actions">
        <button
          type="button"
          class="cancel-button"
          @click="closeAddHours"
        >
          Annuler
        </button>

        <button
          type="button"
          class="save-button"
          :disabled="addingHours"
          @click="addHours"
        >
          {{
            addingHours
              ? 'Ajout...'
              : 'Ajouter les heures'
          }}
        </button>
      </div>
    </section>

    <!-- ÉQUIPE -->
    <section class="team-section">
      <div class="section-head">
        <div>
          <h2>Employés</h2>

          <p>
            {{ filteredEmployees.length }}
            membre(s)
          </p>
        </div>
      </div>

      <!-- RECHERCHE -->
      <div class="search-box">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            cx="11"
            cy="11"
            r="7"
          />

          <line
            x1="16"
            y1="16"
            x2="21"
            y2="21"
          />
        </svg>

        <input
          v-model="searchQuery"
          type="search"
          placeholder="Rechercher une employée..."
        />
      </div>

      <!-- CHARGEMENT -->
      <div
        v-if="loading"
        class="empty-card"
      >
        Chargement...
      </div>

      <!-- VIDE -->
      <div
        v-else-if="filteredEmployees.length === 0"
        class="empty-card"
      >
        {{
          searchQuery
            ? 'Aucun employé trouvée.'
            : 'Aucun employé pour le moment.'
        }}
      </div>

      <!-- CARTES -->
      <div
        v-else
        class="employee-list"
      >
        <article
          v-for="employee in filteredEmployees"
          :key="employee.id"
          class="employee-card"
        >
          <!-- AFFICHAGE NORMAL -->
          <template v-if="editingId !== employee.id">
            <div class="employee-main">
              <div class="avatar">
                {{
                  employee.first_name
                    ?.charAt(0)
                    .toUpperCase()
                }}
              </div>

              <div class="employee-info">
                <h3>
                  {{ employee.first_name }}
                  {{ employee.last_name }}
                </h3>

                <p v-if="employee.phone">
                  {{ employee.phone }}
                </p>

                <strong>
                  {{
                    Number(
                      employee.hourly_rate || 0
                    ).toFixed(2)
                  }}
                  € / h
                </strong>
              </div>
            </div>

            <div class="company-list">
              <span
                v-for="company in employee.companies"
                :key="company.id"
                class="company-pill"
              >
                {{ company.name }}
              </span>

              <span
                v-if="employee.companies.length === 0"
                class="company-pill muted"
              >
                Aucune société
              </span>
            </div>

            <div class="card-actions">
              <button
                type="button"
                class="edit-button"
                @click="startEdit(employee)"
              >
                Modifier
              </button>

              <button
                type="button"
                class="delete-button"
                @click="deleteEmployee(employee.id)"
              >
                Supprimer
              </button>
            </div>
          </template>

          <!-- MODIFICATION -->
          <template v-else>
            <div class="edit-form">
              <div class="field-grid">
                <div class="field">
                  <label>Prénom</label>

                  <input
                    v-model="editFirstName"
                    type="text"
                  />
                </div>

                <div class="field">
                  <label>Nom</label>

                  <input
                    v-model="editLastName"
                    type="text"
                  />
                </div>
              </div>

              <div class="field">
                <label>Téléphone</label>

                <input
                  v-model="editPhone"
                  type="tel"
                />
              </div>

              <div class="field">
                <label>Taux horaire</label>

                <div class="rate-field">
                  <input
                    v-model="editHourlyRate"
                    type="number"
                    min="0"
                    step="0.01"
                  />

                  <span>€ / heure</span>
                </div>
              </div>

              <div class="field">
                <label>Sociétés</label>

                <div class="companies-selector">
                  <label
                    v-for="company in companies"
                    :key="company.id"
                    class="company-option"
                  >
                    <input
                      v-model="editCompanyIds"
                      type="checkbox"
                      :value="company.id"
                    />

                    <span>
                      {{ company.name }}
                    </span>
                  </label>
                </div>
              </div>

              <p
                v-if="editError"
                class="error-message"
              >
                {{ editError }}
              </p>

              <div class="edit-actions">
                <button
                  type="button"
                  class="cancel-button"
                  @click="cancelEdit"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  class="save-button"
                  :disabled="saving"
                  @click="saveEmployee(employee.id)"
                >
                  {{
                    saving
                      ? 'Enregistrement...'
                      : 'Enregistrer'
                  }}
                </button>
              </div>
            </div>
          </template>
        </article>
      </div>
    </section>

<AdminBottomNav />
  </main>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
} from 'vue'

import AdminBottomNav from '../components/AdminBottomNav.vue'
import { supabase } from '../lib/supabase'

type Company = {
  id: string
  name: string
}

type Employee = {
  id: string
  auth_user_id: string | null
  first_name: string
  last_name: string
  phone: string | null
  hourly_rate: number
  companies: Company[]
}

/* =========================
   DONNÉES
========================= */

const employees = ref<Employee[]>([])
const companies = ref<Company[]>([])

const loading = ref(true)
const saving = ref(false)

const searchQuery = ref('')

/* =========================
   RECHERCHE
========================= */

const filteredEmployees = computed(() => {
  const search =
    searchQuery.value
      .trim()
      .toLowerCase()

  if (!search) {
    return employees.value
  }

  return employees.value.filter(
    (employee) => {
      const fullName =
        `${employee.first_name} ${employee.last_name}`
          .toLowerCase()

      return fullName.includes(search)
    }
  )
})

/* =========================
   CHARGER SOCIÉTÉS
========================= */

const loadCompanies = async () => {
  const {
    data,
    error,
  } = await supabase
    .from('companies')
    .select('id, name')
    .order('name')

  if (error) {
    console.error(
      'Erreur chargement sociétés :',
      error
    )

    return
  }

  companies.value = data ?? []
}

/* =========================
   CHARGER EMPLOYÉES
========================= */

const loadEmployees = async () => {
  loading.value = true

  const {
    data: employeeData,
    error: employeeError,
  } = await supabase
    .from('employees')
    .select(`
      id,
      auth_user_id,
      first_name,
      last_name,
      phone,
      hourly_rate
    `)
    .order('first_name')

  if (employeeError) {
    console.error(employeeError)

    loading.value = false
    return
  }

  const {
    data: relations,
    error: relationsError,
  } = await supabase
    .from('employee_companies')
    .select(`
      employee_id,
      company_id
    `)

  if (relationsError) {
    console.error(relationsError)

    loading.value = false
    return
  }

  employees.value =
    (employeeData ?? []).map(
      (employee) => {
        const companyIds =
          (relations ?? [])
            .filter(
              (relation) =>
                relation.employee_id ===
                employee.id
            )
            .map(
              (relation) =>
                relation.company_id
            )

        const employeeCompanies =
          companies.value.filter(
            (company) =>
              companyIds.includes(
                company.id
              )
          )

        return {
          ...employee,

          hourly_rate:
            Number(
              employee.hourly_rate ?? 0
            ),

          companies:
            employeeCompanies,
        }
      }
    )

  loading.value = false
}

/* =========================
   AJOUT EMPLOYÉ
========================= */

const showAddEmployee = ref(false)

const newFirstName = ref('')
const newLastName = ref('')
const newPhone = ref('')
const newHourlyRate = ref<number | string>(0)

const newCompanyIds =
  ref<string[]>([])

const addingEmployee = ref(false)
const addEmployeeError = ref('')

const toggleAddEmployee = () => {
  showAddEmployee.value =
    !showAddEmployee.value

  showAddHours.value = false
}

const closeAddEmployee = () => {
  showAddEmployee.value = false

  newFirstName.value = ''
  newLastName.value = ''
  newPhone.value = ''
  newHourlyRate.value = 0
  newCompanyIds.value = []

  addEmployeeError.value = ''
}

const addEmployee = async () => {
  addEmployeeError.value = ''

  if (
    !newFirstName.value.trim() ||
    !newLastName.value.trim()
  ) {
    addEmployeeError.value =
      'Le prénom et le nom sont obligatoires.'

    return
  }

  const rate =
    Number(newHourlyRate.value)

  if (
    Number.isNaN(rate) ||
    rate < 0
  ) {
    addEmployeeError.value =
      'Le taux horaire est invalide.'

    return
  }

  addingEmployee.value = true

  const {
    data: employee,
    error,
  } = await supabase
    .from('employees')
    .insert({
      first_name:
        newFirstName.value.trim(),

      last_name:
        newLastName.value.trim(),

      phone:
        newPhone.value.trim() ||
        null,

      hourly_rate:
        rate,

      company_id:
        newCompanyIds.value[0] ??
        null,
    })
    .select('id')
    .single()

  if (
    error ||
    !employee
  ) {
    console.error(error)

    addEmployeeError.value =
      'Impossible d’ajouter cette employée.'

    addingEmployee.value = false
    return
  }

  if (
    newCompanyIds.value.length > 0
  ) {
    const rows =
      newCompanyIds.value.map(
        (companyId) => ({
          employee_id:
            employee.id,

          company_id:
            companyId,
        })
      )

    const {
      error: companyError,
    } = await supabase
      .from('employee_companies')
      .insert(rows)

    if (companyError) {
      console.error(companyError)
    }
  }

  addingEmployee.value = false

  closeAddEmployee()

  await loadEmployees()
}

/* =========================
   MODIFICATION EMPLOYÉ
========================= */

const editingId = ref<string | null>(null)

const editFirstName = ref('')
const editLastName = ref('')
const editPhone = ref('')

const editHourlyRate =
  ref<number | string>(0)

const editCompanyIds =
  ref<string[]>([])

const editError = ref('')

const startEdit = (
  employee: Employee
) => {
  editingId.value = employee.id

  editFirstName.value =
    employee.first_name

  editLastName.value =
    employee.last_name

  editPhone.value =
    employee.phone ?? ''

  editHourlyRate.value =
    employee.hourly_rate

  editCompanyIds.value =
    employee.companies.map(
      (company) => company.id
    )

  editError.value = ''
}

const cancelEdit = () => {
  editingId.value = null

  editFirstName.value = ''
  editLastName.value = ''
  editPhone.value = ''
  editHourlyRate.value = 0
  editCompanyIds.value = []

  editError.value = ''
}

const saveEmployee = async (
  employeeId: string
) => {
  editError.value = ''

  if (
    !editFirstName.value.trim() ||
    !editLastName.value.trim()
  ) {
    editError.value =
      'Le prénom et le nom sont obligatoires.'

    return
  }

  const hourlyRate =
    Number(editHourlyRate.value)

  if (
    Number.isNaN(hourlyRate) ||
    hourlyRate < 0
  ) {
    editError.value =
      'Le taux horaire est invalide.'

    return
  }

  saving.value = true

  const {
    error: employeeError,
  } = await supabase
    .from('employees')
    .update({
      first_name:
        editFirstName.value.trim(),

      last_name:
        editLastName.value.trim(),

      phone:
        editPhone.value.trim() ||
        null,

      hourly_rate:
        hourlyRate,

      company_id:
        editCompanyIds.value[0] ??
        null,
    })
    .eq('id', employeeId)

  if (employeeError) {
    console.error(employeeError)

    editError.value =
      'Impossible de modifier cette employée.'

    saving.value = false
    return
  }

  const {
    error: deleteError,
  } = await supabase
    .from('employee_companies')
    .delete()
    .eq(
      'employee_id',
      employeeId
    )

  if (deleteError) {
    console.error(deleteError)

    editError.value =
      'Impossible de modifier les sociétés.'

    saving.value = false
    return
  }

  if (
    editCompanyIds.value.length > 0
  ) {
    const rows =
      editCompanyIds.value.map(
        (companyId) => ({
          employee_id:
            employeeId,

          company_id:
            companyId,
        })
      )

    const {
      error: insertError,
    } = await supabase
      .from('employee_companies')
      .insert(rows)

    if (insertError) {
      console.error(insertError)

      editError.value =
        'Impossible d’enregistrer les sociétés.'

      saving.value = false
      return
    }
  }

  saving.value = false

  cancelEdit()

  await loadEmployees()
}

/* =========================
   SUPPRESSION
========================= */

const deleteEmployee = async (
  employeeId: string
) => {
  const employee =
    employees.value.find(
      (item) =>
        item.id === employeeId
    )

  if (!employee) return

  const confirmed =
    window.confirm(
      `Supprimer ${employee.first_name} ${employee.last_name} de l'équipe ?`
    )

  if (!confirmed) return

  const {
    error,
  } = await supabase
    .from('employees')
    .delete()
    .eq('id', employeeId)

  if (error) {
    console.error(error)

    window.alert(
      'Impossible de supprimer cette employée.'
    )

    return
  }

  await loadEmployees()
}

/* =========================
   AJOUT HEURES
========================= */

const showAddHours = ref(false)

const hoursEmployeeId = ref('')
const hoursCompanyId = ref('')
const hoursDate = ref('')

const hoursStart = ref('')
const hoursEnd = ref('')

const hoursPauseStart = ref('')
const hoursPauseEnd = ref('')

const addingHours = ref(false)
const addHoursError = ref('')

const availableHourCompanies =
  computed(() => {
    const employee =
      employees.value.find(
        (item) =>
          item.id ===
          hoursEmployeeId.value
      )

    return employee?.companies ?? []
  })

const toggleAddHours = () => {
  showAddHours.value =
    !showAddHours.value

  showAddEmployee.value = false
}

const closeAddHours = () => {
  showAddHours.value = false

  hoursEmployeeId.value = ''
  hoursCompanyId.value = ''
  hoursDate.value = ''

  hoursStart.value = ''
  hoursEnd.value = ''

  hoursPauseStart.value = ''
  hoursPauseEnd.value = ''

  addHoursError.value = ''
}

const onHoursEmployeeChange = () => {
  hoursCompanyId.value = ''

  if (
    availableHourCompanies.value.length === 1
  ) {
    hoursCompanyId.value =
      availableHourCompanies.value[0].id
  }
}

const timeToMinutes = (
  time: string
) => {
  if (!time) return 0

  const [hours, minutes] =
    time.split(':').map(Number)

  return (
    hours * 60 +
    minutes
  )
}

const workedMinutesPreview =
  computed(() => {
    if (
      !hoursStart.value ||
      !hoursEnd.value
    ) {
      return 0
    }

    const start =
      timeToMinutes(
        hoursStart.value
      )

    const end =
      timeToMinutes(
        hoursEnd.value
      )

    let total =
      end - start

    if (
      hoursPauseStart.value &&
      hoursPauseEnd.value
    ) {
      const pauseStart =
        timeToMinutes(
          hoursPauseStart.value
        )

      const pauseEnd =
        timeToMinutes(
          hoursPauseEnd.value
        )

      total -=
        pauseEnd - pauseStart
    }

    return Math.max(
      total,
      0
    )
  })

const formatMinutes = (
  minutes: number
) => {
  const hours =
    Math.floor(
      minutes / 60
    )

  const remaining =
    minutes % 60

  if (remaining === 0) {
    return `${hours} h`
  }

  return `${hours} h ${remaining
    .toString()
    .padStart(2, '0')}`
}

const addHours = async () => {
  addHoursError.value = ''

  if (
    !hoursEmployeeId.value ||
    !hoursCompanyId.value ||
    !hoursDate.value ||
    !hoursStart.value ||
    !hoursEnd.value
  ) {
    addHoursError.value =
      'Remplissez les informations obligatoires.'

    return
  }

  if (
    hoursPauseStart.value &&
    !hoursPauseEnd.value
  ) {
    addHoursError.value =
      'Indiquez la fin de la pause.'

    return
  }

  if (
    !hoursPauseStart.value &&
    hoursPauseEnd.value
  ) {
    addHoursError.value =
      'Indiquez le début de la pause.'

    return
  }

  if (
    workedMinutesPreview.value <= 0
  ) {
    addHoursError.value =
      'Les horaires sont invalides.'

    return
  }

  addingHours.value = true

  const {
    error,
  } = await supabase
    .from('employee_time_entries')
    .insert({
      employee_id:
        hoursEmployeeId.value,

      company_id:
        hoursCompanyId.value,

      work_date:
        hoursDate.value,

      start_time:
        hoursStart.value,

      pause_start:
        hoursPauseStart.value ||
        null,

      pause_end:
        hoursPauseEnd.value ||
        null,

      end_time:
        hoursEnd.value,

      worked_minutes:
        workedMinutesPreview.value,
    })

  if (error) {
    console.error(error)

    addHoursError.value =
      'Impossible d’ajouter les heures.'

    addingHours.value = false
    return
  }

  addingHours.value = false

  closeAddHours()

  window.alert(
    'Les heures ont bien été ajoutées.'
  )
}

/* =========================
   CHARGEMENT
========================= */

onMounted(async () => {
  await loadCompanies()
  await loadEmployees()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.admin-page {
  min-height: 100vh;

  padding:
    28px 20px
    120px;

  background: #f7f1ec;

  color: #17372f;
}

/* LARGEUR */

.topbar,
.actions-section,
.form-card,
.team-section {
  width: 100%;
  max-width: 520px;

  margin-left: auto;
  margin-right: auto;
}

/* HEADER */

.topbar {
  margin-bottom: 22px;
}

.eyebrow,
.small-eyebrow {
  margin: 0 0 4px;

  font-size: 11px;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 1.2px;

  color: #9b8174;
}

.topbar h1 {
  margin: 0;

  font-size: 30px;

  color: #17372f;
}

.subtitle {
  margin: 6px 0 0;

  font-size: 13px;

  color: #7d7874;
}

/* BOUTONS DU HAUT */

.actions-section {
  display: grid;
  grid-template-columns:
    repeat(2, 1fr);

  gap: 12px;

  margin-bottom: 24px;
}

.primary-action,
.secondary-action {
  min-height: 54px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 8px;

  border-radius: 17px;

  font: inherit;
  font-size: 13px;
  font-weight: 700;

  cursor: pointer;
}

.primary-action {
  border: none;

  background: #17372f;
  color: white;
}

.secondary-action {
  border:
    1px solid #ddc2b6;

  background: #f6e9e3;

  color: #a24d3d;
}

.action-plus {
  font-size: 23px;
  font-weight: 400;
}

/* FORMULAIRES */

.form-card {
  margin-bottom: 24px;

  padding: 22px;

  border:
    1px solid #eadfd8;

  border-radius: 24px;

  background: white;
}

.form-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 20px;

  margin-bottom: 20px;
}

.form-header h2 {
  margin: 0;

  font-size: 21px;

  color: #17372f;
}

.close-button {
  width: 36px;
  height: 36px;

  flex-shrink: 0;

  display: grid;
  place-items: center;

  padding: 0;

  border: none;
  border-radius: 50%;

  background: #f4efec;

  color: #746d69;

  font-size: 22px;

  cursor: pointer;
}

/* CHAMPS */

.field-grid {
  display: grid;
  grid-template-columns:
    repeat(2, 1fr);

  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;

  gap: 7px;

  margin-bottom: 15px;
}

.field label {
  font-size: 11px;
  font-weight: 700;

  color: #52605b;
}

.field input,
.field select {
  width: 100%;
  min-height: 48px;

  padding: 0 14px;

  border:
    1px solid #e3d9d3;

  border-radius: 14px;

  outline: none;

  background: #fbf8f6;

  color: #17372f;

  font: inherit;
  font-size: 13px;
}

.field input:focus,
.field select:focus {
  border-color: #9bafa7;

  background: white;

  box-shadow:
    0 0 0 3px
    rgba(23, 55, 47, 0.06);
}

.field-help {
  font-size: 11px;

  color: #9a7970;
}

/* TAUX */

.rate-field {
  position: relative;
}

.rate-field input {
  padding-right: 90px;
}

.rate-field span {
  position: absolute;

  top: 50%;
  right: 14px;

  transform:
    translateY(-50%);

  font-size: 11px;

  color: #8b8581;
}

/* SOCIÉTÉS */

.companies-selector {
  display: flex;
  flex-wrap: wrap;

  gap: 8px;
}

.company-option {
  position: relative;

  display: inline-flex;

  cursor: pointer;
}

.company-option input {
  position: absolute;

  opacity: 0;

  pointer-events: none;
}

.company-option span {
  min-height: 36px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding:
    0 12px;

  border:
    1px solid #e1d7d1;

  border-radius: 999px;

  background: #fbf8f6;

  font-size: 11px;
  font-weight: 600;

  color: #706a66;
}

.company-option input:checked + span {
  border-color: #17372f;

  background: #17372f;

  color: white;
}

/* TEMPS TRAVAILLÉ */

.worked-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 15px;

  padding: 14px 16px;

  border-radius: 15px;

  background: #eef2ef;
}

.worked-preview span {
  font-size: 12px;

  color: #75807c;
}

.worked-preview strong {
  font-size: 14px;

  color: #17372f;
}

/* ACTION FORMULAIRE */

.form-actions,
.edit-actions {
  display: flex;

  gap: 10px;
}

.cancel-button,
.save-button {
  min-height: 45px;

  padding:
    0 18px;

  border-radius: 14px;

  font: inherit;
  font-size: 12px;
  font-weight: 700;

  cursor: pointer;
}

.cancel-button {
  flex: 1;

  border:
    1px solid #ddd4ce;

  background: white;

  color: #69625e;
}

.save-button {
  flex: 2;

  border: none;

  background: #17372f;

  color: white;
}

.save-button:disabled {
  opacity: 0.55;

  cursor: not-allowed;
}

.error-message {
  margin:
    0 0 15px;

  padding:
    11px 13px;

  border-radius: 13px;

  background: #f8e8e3;

  font-size: 12px;

  color: #a24d3d;
}

/* SECTION ÉQUIPE */

.team-section {
  display: flex;
  flex-direction: column;

  gap: 15px;
}

.section-head h2 {
  margin: 0;

  font-size: 24px;

  color: #17372f;
}

.section-head p {
  margin:
    4px 0 0;

  font-size: 12px;

  color: #8c8580;
}

/* RECHERCHE */

.search-box {
  position: relative;

  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;

  left: 15px;

  width: 18px;
  height: 18px;

  fill: none;
  stroke: #8b8581;
  stroke-width: 1.8;
  stroke-linecap: round;

  pointer-events: none;
}

.search-box input {
  width: 100%;
  min-height: 50px;

  padding:
    0 16px
    0 45px;

  border:
    1px solid #e4d9d3;

  border-radius: 17px;

  outline: none;

  background: white;

  color: #17372f;

  font: inherit;
  font-size: 13px;
}

.search-box input:focus {
  border-color: #9bafa7;

  box-shadow:
    0 0 0 3px
    rgba(23, 55, 47, 0.06);
}

/* LISTE CARTES */

.employee-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* CARTE */

.employee-card {
  min-width: 0;

  display: flex;
  flex-direction: column;

  padding: 20px 18px;

  border:
    1px solid #eadfd8;

  border-radius: 24px;

  background: white;

  box-shadow:
    0 8px 25px
    rgba(62, 48, 42, 0.04);
}

.employee-main {
  display: flex;
  align-items: center;

  gap: 13px;
}

.avatar {
  width: 48px;
  height: 48px;

  flex-shrink: 0;

  display: grid;
  place-items: center;

  border-radius: 50%;

  background: #17372f;

  color: white;

  font-size: 17px;
  font-weight: 700;
}

.employee-info {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.employee-info h3 {
  margin: 0;

  font-size: 16px;

  color: #17372f;
}

.employee-info p {
  margin:
    4px 0 0;

  font-size: 11px;

  color: #8b8581;
}

.employee-info strong {
  margin-top: 4px;

  font-size: 13px;

  color: #a85f49;
}

/* PASTILLES */

.company-list {
  display: flex;
  flex-wrap: wrap;

  gap: 7px;

  margin-top: 15px;
}

.company-pill {
  padding:
    6px 10px;

  border-radius: 999px;

  background: #efe6df;

  font-size: 10px;
  font-weight: 700;

  color: #17372f;
}

.company-pill.muted {
  background: #f2efed;

  color: #99918c;
}

/* BOUTONS CARTE */

.card-actions {
  display: flex;

  gap: 8px;

  margin-top: 18px;
}

.edit-button,
.delete-button {
  min-height: 42px;

  padding:
    0 14px;

  border-radius: 14px;

  font: inherit;
  font-size: 11px;
  font-weight: 700;

  cursor: pointer;
}

.edit-button {
  flex: 2;

  border: none;

  background: #17372f;

  color: white;
}

.delete-button {
  flex: 1;

  border:
    1px solid #e3c9bf;

  background: #f8ebe6;

  color: #a24d3d;
}

/* MODIFICATION */

.edit-form {
  width: 100%;

  display: flex;
  flex-direction: column;

  gap: 2px;
}

/* VIDE */

.empty-card {
  padding: 30px;

  border:
    1px solid #eadfd8;

  border-radius: 22px;

  background: white;

  text-align: center;

  font-size: 13px;

  color: #8b8581;
}

/* NAV BAS */

.bottom-nav {
  position: fixed;

  left: 50%;
  bottom: 16px;

  z-index: 50;

  width:
    calc(100% - 30px);

  max-width: 460px;

  transform:
    translateX(-50%);

  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  padding: 8px;

  border:
    1px solid #ebe4df;

  border-radius: 22px;

  background:
    rgba(
      255,
      255,
      255,
      0.96
    );

  box-shadow:
    0 10px 35px
    rgba(49, 38, 33, 0.08);

  backdrop-filter:
    blur(12px);
}

.nav-item {
  min-height: 54px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 3px;

  border-radius: 15px;

  color: #8b8581;

  text-decoration: none;
}

.nav-item span {
  font-size: 19px;
}

.nav-item small {
  font-size: 10px;
}

.nav-item.active {
  background: #f2e9e3;

  color: #17372f;
}

/* TELEPHONE */

@media (max-width: 600px) {
  .admin-page {
    padding:
      24px 15px
      115px;
  }

  .actions-section {
    grid-template-columns: 1fr;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  /*
    IMPORTANT :
    SUR TÉLÉPHONE LES CARTES
    SONT UNE SOUS L'AUTRE.
  */
  .employee-list {
    display: flex;
    flex-direction: column;

    gap: 14px;

    width: 100%;

    overflow: visible;
  }

  .employee-card {
    width: 100%;

    flex-shrink: 0;
  }

  .card-actions {
    flex-direction: column;
  }

  .edit-button,
  .delete-button {
    width: 100%;
  }
}
</style>