<template>

  <main class="admin-page">

    <!-- HEADER -->

    <header class="topbar">

      <div>

        <p class="eyebrow">Administration</p>

        <h1>Équipe</h1>

        <p class="subtitle">

          Gérez les employés et leurs affectations.

        </p>

      </div>

    </header>

    <!-- AJOUT EMPLOYÉ -->

    <section class="actions-section">

      <button

        type="button"

        class="primary-action"

        @click="toggleAddEmployee"

      >

        <span class="action-plus">+</span>

        Ajouter un employé

      </button>

    </section>

    <!-- FORMULAIRE AJOUT -->

    <section

      v-if="showAddEmployee"

      class="form-card"

    >

      <div class="form-header">

        <div>

          <p class="small-eyebrow">

            Nouvel employé

          </p>

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

      <!-- AFFECTATIONS -->

      <div class="field">

        <label>Affectations</label>

        <p class="field-help">

          Sélectionnez les postes auxquels cet employé

          est autorisé.

        </p>

        <div class="posts-selector">

          <article

            v-for="post in posts"

            :key="post.id"

            class="post-option"

            :class="{

              selected: newPostIds.includes(post.id)

            }"

          >

            <label class="post-main">

              <input

                v-model="newPostIds"

                type="checkbox"

                :value="post.id"

              />

              <span class="custom-checkbox">

                ✓

              </span>

              <div class="post-info">

                <strong>

                  {{ serviceLabel(post.service_type) }}

                </strong>

                <span>

                  {{ post.site_name }}

                </span>

                <small>{{ postScheduleLabel(post) }}</small>

              </div>

              <div class="base-rate">

                {{ isPortSaintLouisPost(post) ? '15,00 € / h' : formatMoney(post.base_rate) }}

              </div>

            </label>

            <!-- TARIF PERSONNALISÉ -->

            <div

              v-if="newPostIds.includes(post.id) && !isPortSaintLouisPost(post)"

              class="custom-rate-box"

            >

              <label>

                Tarif personnalisé

                <span>(optionnel)</span>

              </label>

              <div class="money-input">

                <input

                  v-model="newCustomRates[post.id]"

                  type="number"

                  min="0"

                  step="0.01"

                  :placeholder="String(post.base_rate)"

                />

                <span>€</span>

              </div>

              <small>

                Laissez vide pour utiliser

                {{ isPortSaintLouisPost(post) ? '15,00 € / h' : formatMoney(post.base_rate) }}.

              </small>

            </div>

          </article>

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

          placeholder="Rechercher un employé..."

        />

      </div>

      <div

        v-if="loading"

        class="empty-card"

      >

        Chargement...

      </div>

      <div

        v-else-if="filteredEmployees.length === 0"

        class="empty-card"

      >

        {{

          searchQuery

            ? 'Aucun employé trouvé.'

            : 'Aucun employé pour le moment.'

        }}

      </div>

      <!-- CARTES EMPLOYÉS -->

      <div

        v-else

        class="employee-list"

      >

        <article

          v-for="employee in filteredEmployees"

          :key="employee.id"

          class="employee-card"

        >

          <!-- AFFICHAGE -->

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

                <span class="employee-status">

                  Employé

                </span>

              </div>

            </div>

            <!-- POSTES DE L'EMPLOYÉ -->

            <div

              v-if="employee.assignments.length > 0"

              class="assignment-list"

            >

              <div

                v-for="assignment in employee.assignments"

                :key="assignment.post_id"

                class="assignment-pill"

              >

                <div>

                  <strong>

                    {{

                      serviceLabel(

                        assignment.post.service_type

                      )

                    }}

                  </strong>

                  <span>

                    {{ assignment.post.site_name }}

                  </span>

                </div>

                <b>

                  {{ isPortSaintLouisPost(assignment.post) ? '15,00 € / h' : formatMoney(assignment.custom_rate ?? assignment.post.base_rate) }}

                </b>

              </div>

            </div>

            <div

              v-else

              class="no-assignment"

            >

              Aucune affectation

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

              <div class="edit-title">

                <p class="small-eyebrow">

                  Modification

                </p>

                <h3>

                  {{ employee.first_name }}

                  {{ employee.last_name }}

                </h3>

              </div>

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

                <label>Affectations</label>

                <p class="field-help">

                  Cochez tous les postes autorisés

                  pour cet employé.

                </p>

                <div class="posts-selector">

                  <article

                    v-for="post in posts"

                    :key="post.id"

                    class="post-option"

                    :class="{

                      selected:

                        editPostIds.includes(post.id)

                    }"

                  >

                    <label class="post-main">

                      <input

                        v-model="editPostIds"

                        type="checkbox"

                        :value="post.id"

                      />

                      <span class="custom-checkbox">

                        ✓

                      </span>

                      <div class="post-info">

                        <strong>

                          {{

                            serviceLabel(

                              post.service_type

                            )

                          }}

                        </strong>

                        <span>

                          {{ post.site_name }}

                        </span>

                        <small>{{ postScheduleLabel(post) }}</small>

                      </div>

                      <div class="base-rate">

                        {{ isPortSaintLouisPost(post) ? '15,00 € / h' : formatMoney(post.base_rate) }}

                      </div>

                    </label>

                    <div

                      v-if="editPostIds.includes(post.id) && !isPortSaintLouisPost(post)"

                      class="custom-rate-box"

                    >

                      <label>

                        Tarif personnalisé

                        <span>(optionnel)</span>

                      </label>

                      <div class="money-input">

                        <input

                          v-model="

                            editCustomRates[post.id]

                          "

                          type="number"

                          min="0"

                          step="0.01"

                          :placeholder="

                            String(post.base_rate)

                          "

                        />

                        <span>€</span>

                      </div>

                      <small>

                        Tarif normal :

                        {{ isPortSaintLouisPost(post) ? '15,00 € / h' : formatMoney(post.base_rate) }}

                      </small>

                    </div>

                  </article>

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

  computed,

  onMounted,

  ref,

} from 'vue'

import AdminBottomNav from '../components/AdminBottomNav.vue'

import { supabase } from '../lib/supabase'

type Post = {

  id: string

  service_type:

    | 'security'

    | 'cleaning'

    | 'on_call'

  site_name: string

  base_rate: number

  active: boolean

}

type Assignment = {

  post_id: string

  custom_rate: number | null

  post: Post

}

type Employee = {

  id: string

  auth_user_id: string | null

  first_name: string

  last_name: string

  phone: string | null

  assignments: Assignment[]

}

/* =========================

   DONNÉES

========================= */

const employees = ref<Employee[]>([])

const posts = ref<Post[]>([])

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

   FORMAT

========================= */

const isPortSaintLouisPost = (post: Post) =>
  post.service_type === 'cleaning' &&
  post.site_name === 'Port-Saint-Louis'

const postScheduleLabel = (post: Post) => {
  if (isPortSaintLouisPost(post)) return '15 € / heure • Mercredi 2 h • Dimanche 1 h'
  if (post.service_type === 'security') return 'Midi 11h45 • Soir 18h45'
  if (post.service_type === 'on_call') return '40 € / jour • automatique'
  return '1 vacation par jour'
}

const serviceLabel = (

  service: string

) => {

  if (service === 'security') {

    return 'Sécurité'

  }

  if (service === 'cleaning') {

    return 'Ménage'

  }

  if (service === 'on_call') {

    return 'Astreinte'

  }

  return service

}

const formatMoney = (

  value: number

) => {

  return `${Number(value).toFixed(2)} €`

}

/* =========================

   CHARGER LES POSTES

========================= */

const loadPosts = async () => {

  const {

    data,

    error,

  } = await supabase

    .from('posts')

    .select(`

      id,

      service_type,

      site_name,

      base_rate,

      active

    `)

    .eq('active', true)

    .order('site_name')

  if (error) {

    console.error(

      'Erreur chargement postes :',

      error

    )

    return

  }

  posts.value =

    (data ?? []).map((post) => ({

      ...post,

      base_rate:

        Number(post.base_rate ?? 0),

    })) as Post[]

}

/* =========================

   CHARGER LES EMPLOYÉS

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

      phone

    `)

    .order('first_name')

  if (employeeError) {

    console.error(

      'Erreur employés :',

      employeeError

    )

    loading.value = false

    return

  }

  const {

    data: assignmentData,

    error: assignmentError,

  } = await supabase

    .from('employee_posts')

    .select(`

      employee_id,

      post_id,

      custom_rate,

      active

    `)

    .eq('active', true)

  if (assignmentError) {

    console.error(

      'Erreur affectations :',

      assignmentError

    )

    loading.value = false

    return

  }

  employees.value =

    (employeeData ?? []).map(

      (employee) => {

        const employeeAssignments =

          (assignmentData ?? [])

            .filter(

              (assignment) =>

                assignment.employee_id ===

                employee.id

            )

            .map((assignment) => {

              const post =

                posts.value.find(

                  (item) =>

                    item.id ===

                    assignment.post_id

                )

              if (!post) {

                return null

              }

              return {

                post_id:

                  assignment.post_id,

                custom_rate:

                  assignment.custom_rate ===

                  null

                    ? null

                    : Number(

                        assignment.custom_rate

                      ),

                post,

              }

            })

            .filter(

              (

                assignment

              ): assignment is Assignment =>

                assignment !== null

            )

        return {

          id: employee.id,

          auth_user_id:

            employee.auth_user_id,

          first_name:

            employee.first_name,

          last_name:

            employee.last_name,

          phone:

            employee.phone,

          assignments:

            employeeAssignments,

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

const newPostIds =

  ref<string[]>([])

const newCustomRates =

  ref<Record<string, string | number>>({})

const addingEmployee = ref(false)

const addEmployeeError = ref('')

const toggleAddEmployee = () => {

  showAddEmployee.value =

    !showAddEmployee.value

}

const closeAddEmployee = () => {

  showAddEmployee.value = false

  newFirstName.value = ''

  newLastName.value = ''

  newPhone.value = ''

  newPostIds.value = []

  newCustomRates.value = {}

  addEmployeeError.value = ''

}

const getCustomRate = (

  values: Record<string, string | number>,

  postId: string

): number | null => {

  const value = values[postId]

  if (

    value === undefined ||

    value === null ||

    value === ''

  ) {

    return null

  }

  const numberValue = Number(value)

  if (

    Number.isNaN(numberValue) ||

    numberValue < 0

  ) {

    return null

  }

  return numberValue

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

  if (newPostIds.value.length === 0) {

    addEmployeeError.value =

      'Attribuez au moins un poste à cet employé.'

    return

  }

  addingEmployee.value = true

  /*

    hourly_rate reste temporairement à 0

    uniquement parce que l'ancienne colonne

    existe encore dans ta table employees.

    Elle ne sera PLUS utilisée pour les calculs.

  */

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

        newPhone.value.trim() || null,

      hourly_rate: 0,

      company_id: null,

    })

    .select('id')

    .single()

  if (

    error ||

    !employee

  ) {

    console.error(error)

    addEmployeeError.value =

      'Impossible d’ajouter cet employé.'

    addingEmployee.value = false

    return

  }

  const assignments =

    newPostIds.value.map(

      (postId) => ({

        employee_id: employee.id,

        post_id: postId,

        custom_rate: isPortSaintLouisPost(posts.value.find((post) => post.id === postId)!) ? null : getCustomRate(newCustomRates.value, postId),

        active: true,

      })

    )

  const {

    error: assignmentError,

  } = await supabase

    .from('employee_posts')

    .insert(assignments)

  if (assignmentError) {

    console.error(assignmentError)

    /*

      Si l'affectation échoue,

      on supprime l'employé créé pour

      éviter un salarié incomplet.

    */

    await supabase

      .from('employees')

      .delete()

      .eq('id', employee.id)

    addEmployeeError.value =

      'Impossible d’enregistrer les affectations.'

    addingEmployee.value = false

    return

  }

  addingEmployee.value = false

  closeAddEmployee()

  await loadEmployees()

}

/* =========================

   MODIFICATION

========================= */

const editingId =

  ref<string | null>(null)

const editFirstName = ref('')

const editLastName = ref('')

const editPhone = ref('')

const editPostIds =

  ref<string[]>([])

const editCustomRates =

  ref<Record<string, string | number>>({})

const editError = ref('')

const startEdit = (

  employee: Employee

) => {

  editingId.value =

    employee.id

  editFirstName.value =

    employee.first_name

  editLastName.value =

    employee.last_name

  editPhone.value =

    employee.phone ?? ''

  editPostIds.value =

    employee.assignments.map(

      (assignment) =>

        assignment.post_id

    )

  const rates:

    Record<string, string | number> = {}

  employee.assignments.forEach(

    (assignment) => {

      if (

        assignment.custom_rate !== null

      ) {

        rates[assignment.post_id] =

          assignment.custom_rate

      }

    }

  )

  editCustomRates.value = rates

  editError.value = ''

}

const cancelEdit = () => {

  editingId.value = null

  editFirstName.value = ''

  editLastName.value = ''

  editPhone.value = ''

  editPostIds.value = []

  editCustomRates.value = {}

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

  if (editPostIds.value.length === 0) {

    editError.value =

      'Attribuez au moins un poste à cet employé.'

    return

  }

  saving.value = true

  const onCallPost = posts.value.find(

    (post) => post.service_type === 'on_call'

)

  if (onCallPost) {

    const wantsOnCall =

      editPostIds.value.includes(onCallPost.id)

    const { data: activeOnCall, error: onCallError } =

      await supabase

        .from('on_call_assignments')

        .select('id')

        .eq('employee_id', employeeId)

        .eq('post_id', onCallPost.id)

        .is('ended_on', null)

        .maybeSingle()

    if (onCallError) {

      console.error(onCallError)

      editError.value =

        'Impossible de vérifier l’astreinte.'

      saving.value = false

      return

    }

    if (wantsOnCall && !activeOnCall) {

      const customRate = getCustomRate(

        editCustomRates.value,

        onCallPost.id

      )

      const { error: startError } = await supabase

        .from('on_call_assignments')

        .insert({

          employee_id: employeeId,

          post_id: onCallPost.id,

          daily_rate:

            customRate ?? onCallPost.base_rate,

        })

      if (startError) {

        console.error(startError)

        editError.value =

          'Impossible de démarrer l’astreinte.'

        saving.value = false

        return

      }

    }

    if (!wantsOnCall && activeOnCall) {

      const today = new Intl.DateTimeFormat(

        'en-CA',

        {

          timeZone: 'Europe/Paris',

          year: 'numeric',

          month: '2-digit',

          day: '2-digit',

        }

      ).format(new Date())

      const { error: stopError } = await supabase

        .from('on_call_assignments')

        .update({

          ended_on: today,

        })

        .eq('id', activeOnCall.id)

      if (stopError) {

        console.error(stopError)

        editError.value =

          'Impossible d’arrêter l’astreinte.'

        saving.value = false

        return

      }

    }

}

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

        editPhone.value.trim() || null,

    })

    .eq('id', employeeId)

  if (employeeError) {

    console.error(employeeError)

    editError.value =

      'Impossible de modifier cet employé.'

    saving.value = false

    return

  }

  /*

    On supprime les anciennes affectations

    puis on recrée celles cochées.

  */

  const {

    error: deleteError,

  } = await supabase

    .from('employee_posts')

    .delete()

    .eq('employee_id', employeeId)

  if (deleteError) {

    console.error(deleteError)

    editError.value =

      'Impossible de modifier les affectations.'

    saving.value = false

    return

  }

  const assignments =

    editPostIds.value.map(

      (postId) => ({

        employee_id: employeeId,

        post_id: postId,

        custom_rate: isPortSaintLouisPost(posts.value.find((post) => post.id === postId)!) ? null : getCustomRate(editCustomRates.value, postId),

        active: true,

      })

    )

  const {

    error: insertError,

  } = await supabase

    .from('employee_posts')

    .insert(assignments)

  if (insertError) {

    console.error(insertError)

    editError.value =

      'Impossible d’enregistrer les affectations.'

    saving.value = false

    return

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

      'Impossible de supprimer cet employé.'

    )

    return

  }

  await loadEmployees()

}

/* =========================

   CHARGEMENT

========================= */

onMounted(async () => {

  await loadPosts()

  await loadEmployees()

})

</script>

<style scoped>

* {

  box-sizing: border-box;

}

.profile-page,

.admin-page {

  min-height: 100vh;

}

.admin-page {

  padding: 28px 20px 120px;

  background: #f7f1ec;

  color: #17372f;

}

.topbar,

.actions-section,

.form-card,

.team-section {

  width: 100%;

  max-width: 520px;

  margin-left: auto;

  margin-right: auto;

}

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

.actions-section {

  margin-bottom: 24px;

}

.primary-action {

  width: 100%;

  min-height: 54px;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  border: none;

  border-radius: 17px;

  background: #17372f;

  color: white;

  font: inherit;

  font-size: 13px;

  font-weight: 700;

  cursor: pointer;

}

.action-plus {

  font-size: 23px;

  font-weight: 400;

}

.form-card {

  margin-bottom: 24px;

  padding: 22px;

  border: 1px solid #eadfd8;

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

.field-grid {

  display: grid;

  grid-template-columns: repeat(2, 1fr);

  gap: 12px;

}

.field {

  display: flex;

  flex-direction: column;

  gap: 7px;

  margin-bottom: 15px;

}

.field > label {

  font-size: 11px;

  font-weight: 700;

  color: #52605b;

}

.field input {

  width: 100%;

  min-height: 48px;

  padding: 0 14px;

  border: 1px solid #e3d9d3;

  border-radius: 14px;

  outline: none;

  background: #fbf8f6;

  color: #17372f;

  font: inherit;

  font-size: 13px;

}

.field input:focus {

  border-color: #9bafa7;

  background: white;

  box-shadow:

    0 0 0 3px

    rgba(23, 55, 47, 0.06);

}

.field-help {

  margin: -2px 0 8px;

  font-size: 11px;

  line-height: 1.5;

  color: #9a918b;

}

/* POSTES */

.posts-selector {

  display: flex;

  flex-direction: column;

  gap: 10px;

}

.post-option {

  overflow: hidden;

  border: 1px solid #e4dad4;

  border-radius: 18px;

  background: #fbf8f6;

  transition: 0.2s ease;

}

.post-option.selected {

  border-color: #17372f;

  background: #f4f7f5;

}

.post-main {

  display: flex;

  align-items: center;

  gap: 11px;

  padding: 14px;

  cursor: pointer;

}

.post-main > input {

  position: absolute;

  opacity: 0;

  pointer-events: none;

}

.custom-checkbox {

  width: 24px;

  height: 24px;

  flex-shrink: 0;

  display: grid;

  place-items: center;

  border: 1px solid #d8cdc7;

  border-radius: 8px;

  background: white;

  color: transparent;

  font-size: 13px;

  font-weight: 800;

}

.post-option.selected .custom-checkbox {

  border-color: #17372f;

  background: #17372f;

  color: white;

}

.post-info {

  min-width: 0;

  flex: 1;

  display: flex;

  flex-direction: column;

  gap: 2px;

}

.post-info strong {

  font-size: 13px;

  color: #17372f;

}

.post-info span {

  font-size: 11px;

  color: #756f6b;

}

.post-info small {

  margin-top: 2px;

  font-size: 10px;

  color: #a05e4c;

}

.base-rate {

  flex-shrink: 0;

  padding: 6px 9px;

  border-radius: 10px;

  background: #efe6df;

  font-size: 11px;

  font-weight: 800;

  color: #17372f;

}

/* TARIF PERSONNALISÉ */

.custom-rate-box {

  padding: 12px 14px 14px;

  border-top: 1px solid #e4dad4;

  background: white;

}

.custom-rate-box > label {

  display: block;

  margin-bottom: 7px;

  font-size: 10px;

  font-weight: 700;

  color: #52605b;

}

.custom-rate-box > label span {

  font-weight: 400;

  color: #9a918b;

}

.money-input {

  position: relative;

}

.money-input input {

  min-height: 42px;

  padding-right: 40px;

}

.money-input span {

  position: absolute;

  right: 14px;

  top: 50%;

  transform: translateY(-50%);

  font-size: 12px;

  font-weight: 700;

  color: #8b8581;

}

.custom-rate-box small {

  display: block;

  margin-top: 6px;

  font-size: 10px;

  color: #9a918b;

}

/* BOUTONS */

.form-actions,

.edit-actions {

  display: flex;

  gap: 10px;

}

.cancel-button,

.save-button {

  min-height: 45px;

  padding: 0 18px;

  border-radius: 14px;

  font: inherit;

  font-size: 12px;

  font-weight: 700;

  cursor: pointer;

}

.cancel-button {

  flex: 1;

  border: 1px solid #ddd4ce;

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

  margin: 0 0 15px;

  padding: 11px 13px;

  border-radius: 13px;

  background: #f8e8e3;

  font-size: 12px;

  color: #a24d3d;

}

/* ÉQUIPE */

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

  margin: 4px 0 0;

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

  padding: 0 16px 0 45px;

  border: 1px solid #e4d9d3;

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

.employee-list {

  display: flex;

  flex-direction: column;

  gap: 14px;

}

.employee-card {

  min-width: 0;

  display: flex;

  flex-direction: column;

  padding: 20px 18px;

  border: 1px solid #eadfd8;

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

  margin: 4px 0 0;

  font-size: 11px;

  color: #8b8581;

}

.employee-status {

  margin-top: 4px;

  font-size: 10px;

  font-weight: 700;

  color: #a85f49;

}

/* AFFECTATIONS */

.assignment-list {

  display: flex;

  flex-direction: column;

  gap: 7px;

  margin-top: 16px;

}

.assignment-pill {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 12px;

  padding: 11px 12px;

  border-radius: 14px;

  background: #f5f0ec;

}

.assignment-pill div {

  display: flex;

  flex-direction: column;

  gap: 2px;

}

.assignment-pill strong {

  font-size: 11px;

  color: #17372f;

}

.assignment-pill span {

  font-size: 10px;

  color: #8b8581;

}

.assignment-pill b {

  flex-shrink: 0;

  font-size: 12px;

  color: #a85f49;

}

.no-assignment {

  margin-top: 15px;

  padding: 10px 12px;

  border-radius: 12px;

  background: #f2efed;

  font-size: 11px;

  color: #99918c;

}

/* ACTIONS CARTE */

.card-actions {

  display: flex;

  gap: 8px;

  margin-top: 18px;

}

.edit-button,

.delete-button {

  min-height: 42px;

  padding: 0 14px;

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

  border: 1px solid #e3c9bf;

  background: #f8ebe6;

  color: #a24d3d;

}

.edit-form {

  width: 100%;

  display: flex;

  flex-direction: column;

}

.edit-title {

  margin-bottom: 18px;

}

.edit-title h3 {

  margin: 0;

  font-size: 18px;

  color: #17372f;

}

.empty-card {

  padding: 30px;

  border: 1px solid #eadfd8;

  border-radius: 22px;

  background: white;

  text-align: center;

  font-size: 13px;

  color: #8b8581;

}

/* MOBILE */

@media (max-width: 600px) {

  .admin-page {

    padding:

      24px 15px

      115px;

  }

  .field-grid {

    grid-template-columns: 1fr;

  }

  .employee-list {

    width: 100%;

  }

  .employee-card {

    width: 100%;

  }

  .card-actions {

    flex-direction: column;

  }

  .edit-button,

  .delete-button {

    width: 100%;

  }

  .post-main {

    align-items: flex-start;

  }

  .base-rate {

    margin-top: 1px;

  }

}

</style>