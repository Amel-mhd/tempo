<template>

  <main class="admin-hours-page">

    <section class="page-shell">



      <!-- HEADER -->

      <header class="topbar">

        <div>

          <p class="eyebrow">Suivi des vacations</p>

          <h1>Pointages</h1>

          <p class="subtitle">

            Consultez et gérez les vacations de vos employés.

          </p>

        </div>



        <button

          type="button"

          class="add-button"

          @click="openAddVacation"

        >

          + Ajouter une vacation

        </button>

      </header>



      <!-- AJOUT MANUEL -->

      <section

        v-if="showAddVacation"

        class="add-card"

      >

        <div class="add-header">

          <div>

            <p class="small-eyebrow">Administration</p>

            <h2>Ajouter une vacation</h2>

          </div>



          <button

            type="button"

            class="close-button"

            @click="closeAddVacation"

          >

            ×

          </button>

        </div>



        <p class="add-description">

          Ajoutez manuellement une vacation à un employé.

        </p>



        <!-- EMPLOYÉ -->

        <div class="form-field">

          <label>Employé</label>



          <select

            v-model="newEmployeeId"

            @change="onNewEmployeeChange"

          >

            <option value="">

              Sélectionner un employé

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



        <!-- POSTE -->

        <div

          v-if="newEmployeeId"

          class="form-field"

        >

          <label>Poste</label>



          <select

            v-model="newPostId"

            @change="onNewPostChange"

          >

            <option value="">

              Sélectionner un poste

            </option>



            <option

              v-for="assignment in availableAssignments"

              :key="assignment.post_id"

              :value="assignment.post_id"

            >

              {{ serviceLabel(assignment.post.service_type) }}

              ·

              {{ assignment.post.site_name }}

              —

              {{ formatMoney(effectiveRate(assignment)) }}

            </option>

          </select>



          <p

            v-if="

              newEmployeeId &&

              availableAssignments.length === 0

            "

            class="field-help error-text"

          >

            Cet employé n'a aucun poste affecté.

          </p>

        </div>



        <!-- DATE -->

        <div

          v-if="newPostId"

          class="form-field"

        >

          <label>Date de la vacation</label>



          <input

            v-model="newWorkDate"

            type="date"

          />

        </div>



        <!-- VACATION SÉCURITÉ -->

        <div

          v-if="

            selectedNewPost &&

            selectedNewPost.service_type === 'security'

          "

          class="form-field"

        >

          <label>Vacation</label>



          <div class="vacation-selector">

            <button

              type="button"

              class="vacation-choice"

              :class="{ active: newVacationType === 'midi' }"

              @click="newVacationType = 'midi'"

            >

              <span class="choice-icon">☀️</span>



              <span>

                <strong>Midi</strong>

                <small>11h45</small>

              </span>

            </button>



            <button

              type="button"

              class="vacation-choice"

              :class="{ active: newVacationType === 'soir' }"

              @click="newVacationType = 'soir'"

            >

              <span class="choice-icon">🌙</span>



              <span>

                <strong>Soir</strong>

                <small>18h45</small>

              </span>

            </button>

          </div>

        </div>



        <!-- VACATION MÉNAGE -->

        <div

          v-if="

            selectedNewPost &&

            selectedNewPost.service_type === 'cleaning'

          "

          class="cleaning-info"

        >

          <div class="cleaning-icon">

            ✨

          </div>



          <div>

            <span>Vacation</span>

            <strong>Journée · Ménage</strong>

          </div>

        </div>



        <!-- RÉCAP -->

        <div

          v-if="selectedAssignment"

          class="add-summary"

        >

          <div>

            <span>Poste</span>



            <strong>

              {{ serviceLabel(selectedAssignment.post.service_type) }}

              ·

              {{ selectedAssignment.post.site_name }}

            </strong>

          </div>



          <div>

            <span>Montant</span>



            <strong>

              {{ formatMoney(effectiveRate(selectedAssignment)) }}

            </strong>

          </div>

        </div>



        <p

          v-if="addVacationError"

          class="form-message error-message"

        >

          {{ addVacationError }}

        </p>



        <p

          v-if="addVacationSuccess"

          class="form-message success-message"

        >

          {{ addVacationSuccess }}

        </p>



        <div class="form-actions">

          <button

            type="button"

            class="cancel-button"

            @click="closeAddVacation"

          >

            Annuler

          </button>



          <button

            type="button"

            class="save-button"

            :disabled="addingVacation"

            @click="addVacation"

          >

            {{

              addingVacation

                ? 'Ajout...'

                : 'Ajouter la vacation'

            }}

          </button>

        </div>

      </section>



      <!-- RÉSUMÉ -->

      <section class="global-summary">

        <div>

          <span>Vacations</span>

          <strong>

            {{ validFilteredPunches.length }}

          </strong>

        </div>



        <div>

          <span>Montant</span>

          <strong>

            {{ formatMoney(totalAmount) }}

          </strong>

        </div>

      </section>



      <!-- FILTRES -->

      <section class="filters-card">

        <div class="filter-field">

          <label for="month">

            Mois

          </label>



          <input

            id="month"

            v-model="selectedMonth"

            type="month"

          />

        </div>



        <div class="filter-field">

          <label for="employee">

            Employé

          </label>



          <select

            id="employee"

            v-model="selectedEmployeeId"

          >

            <option value="">

              Tous les employés

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



        <div class="filter-field">

          <label for="post">

            Poste

          </label>



          <select

            id="post"

            v-model="selectedPostId"

          >

            <option value="">

              Tous les postes

            </option>



            <option

              v-for="post in posts"

              :key="post.id"

              :value="post.id"

            >

              {{ serviceLabel(post.service_type) }}

              ·

              {{ post.site_name }}

            </option>

          </select>

        </div>



        <div class="filter-field">

          <label for="status">

            Statut

          </label>



          <select

            id="status"

            v-model="selectedStatus"

          >

            <option value="">

              Tous les statuts

            </option>



            <option value="validated">

              Validé

            </option>



            <option value="contested">

              Contesté

            </option>

          </select>

        </div>

      </section>



      <!-- CHARGEMENT -->

      <section

        v-if="loading"

        class="state-card"

      >

        Chargement...

      </section>



      <!-- ERREUR -->

      <section

        v-else-if="errorMessage"

        class="state-card error"

      >

        {{ errorMessage }}

      </section>



      <!-- VIDE -->

      <section

        v-else-if="employeeSummaries.length === 0"

        class="state-card"

      >

        Aucune vacation enregistrée pour ce mois.

      </section>



      <!-- EMPLOYÉS -->

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



              <div class="employee-identity">

                <h2>

                  {{ employee.fullName }}

                </h2>



                <p>

                  {{ employee.postNames }}

                </p>

              </div>

            </div>



            <div class="employee-stats">

              <div>

                <span>Aujourd'hui</span>

                <strong>

                  {{ employee.todayLabel }}

                </strong>

              </div>



              <div>

                <span>Ce mois</span>

                <strong>

                  {{ employee.monthLabel }}

                </strong>

              </div>



              <div>

                <span>Montant</span>

                <strong>

                  {{ formatMoney(employee.totalAmount) }}

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



          <!-- DÉTAILS -->

          <div

            v-if="expandedEmployeeId === employee.id"

            class="details"

          >

            <article

              v-for="punch in employee.punches"

              :key="punch.id"

              class="punch-row"

              :class="{

                contested: punch.status === 'contested'

              }"

            >

              <div class="punch-top">

                <div>

                  <strong class="punch-date">

                    {{ formatDate(punch.work_date) }}

                  </strong>



                  <span class="punch-post">

                    {{ serviceLabel(punch.post.service_type) }}

                    ·

                    {{ punch.post.site_name }}

                  </span>

                </div>



                <span

                  class="status-badge"

                  :class="punch.status"

                >

                  {{ statusLabel(punch.status) }}

                </span>

              </div>



              <div class="vacation-line">

                <div class="vacation-name">

                  <span class="vacation-icon">

                    {{ vacationIcon(punch.vacation_type) }}

                  </span>



                  <div>

                    <span>

                      {{ punch.vacation_type === 'astreinte' ? 'Astreinte' : 'Vacation' }}

                    </span>



                    <strong v-if="punch.vacation_type !== 'astreinte'">

                      {{ vacationLabel(punch.vacation_type) }}

                    </strong>

                  </div>

                </div>



                <strong

                  class="rate"

                  :class="{

                    crossed: punch.status === 'contested'

                  }"

                >

                  {{ formatMoney(punch.applied_rate) }}

                </strong>

              </div>



              <div class="time-grid">

                <div>

                  <span>Prévu</span>



                  <strong>

                    {{

                      punch.scheduled_time

                        ? formatScheduledTime(

                            punch.scheduled_time

                          )

                        : '—'

                    }}

                  </strong>

                </div>



                <div>

                  <span>Enregistré</span>



                  <strong>

                    {{

                      punch.vacation_type === 'astreinte'

                        ? 'Automatique'

                        : formatPunchTime(punch.punched_at)

                    }}

                  </strong>

                </div>

              </div>



              <div

                v-if="punch.status === 'contested'"

                class="contested-message"

              >

                Cette vacation n'est pas comptabilisée dans le montant.

              </div>



              <div class="punch-actions">

                <button

                  v-if="

  punch.vacation_type !== 'astreinte' &&

  punch.status !== 'contested'

"

                  type="button"

                  class="contest-button"

                  :disabled="updatingPunchId === punch.id"

                  @click="contestPunch(punch)"

                >

                  {{

                    updatingPunchId === punch.id

                      ? 'Modification...'

                      : 'Contester la vacation'

                  }}

                </button>



                <button

                  v-else-if="punch.vacation_type !== 'astreinte'"

                  type="button"

                  class="restore-button"

                  :disabled="updatingPunchId === punch.id"

                  @click="restorePunch(punch)"

                >

                  {{

                    updatingPunchId === punch.id

                      ? 'Modification...'

                      : 'Rétablir la vacation'

                  }}

                </button>

              </div>

            </article>

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

  watch,

} from 'vue'



import { supabase } from '../lib/supabase'

import AdminBottomNav from '../components/AdminBottomNav.vue'



type ServiceType =

  | 'security'

  | 'cleaning'

  | 'on_call'



type VacationType =

  | 'midi'

  | 'soir'

  | 'jour'

  | 'astreinte'



type PunchStatus =

  | 'validated'

  | 'contested'



interface Employee {

  id: string

  first_name: string

  last_name: string

}



interface Post {

  id: string

  service_type: ServiceType

  site_name: string

  base_rate: number

}



interface EmployeePost {

  id: string

  employee_id: string

  post_id: string

  custom_rate: number | null

  active: boolean

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

  status: PunchStatus

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



/* =========================

   DONNÉES

\========================= */



const loading = ref(true)

const errorMessage = ref('')



const employees = ref<Employee[]>([])

const posts = ref<Post[]>([])

const employeePosts = ref<EmployeePost[]>([])

const punches = ref<Punch[]>([])

const onCallAssignments = ref<OnCallAssignment[]>([])



const expandedEmployeeId =

  ref<string | null>(null)



const updatingPunchId =

  ref<string | null>(null)



/* =========================

   FILTRES

\========================= */



const now = new Date()



const selectedMonth = ref(

  `${now.getFullYear()}-${String(

    now.getMonth() + 1

  ).padStart(2, '0')}`

)



const selectedEmployeeId = ref('')

const selectedPostId = ref('')

const selectedStatus = ref('')



/* =========================

   AJOUT VACATION

\========================= */



const showAddVacation = ref(false)

const addingVacation = ref(false)



const newEmployeeId = ref('')

const newPostId = ref('')

const newWorkDate = ref('')

const newVacationType =

  ref<VacationType | ''>('')



const addVacationError = ref('')

const addVacationSuccess = ref('')



/* =========================

   DATE FRANCE

\========================= */



const getParisDate = () => {

  const parts =

    new Intl.DateTimeFormat(

      'fr-FR',

      {

        timeZone: 'Europe/Paris',

        year: 'numeric',

        month: '2-digit',

        day: '2-digit',

      }

    ).formatToParts(new Date())



  const year =

    parts.find(

      (part) => part.type === 'year'

    )?.value



  const month =

    parts.find(

      (part) => part.type === 'month'

    )?.value



  const day =

    parts.find(

      (part) => part.type === 'day'

    )?.value



  return `${year}-${month}-${day}`

}



const today = computed(() => getParisDate())



/* =========================

   MOIS

\========================= */



const monthStart =

  computed(() => {

    return `${selectedMonth.value}-01`

  })



const monthEnd =

  computed(() => {

    const [year, month] =

      selectedMonth.value

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



/* =========================

   AFFECTATIONS POUR AJOUT

\========================= */



const availableAssignments =

  computed(() => {

    if (!newEmployeeId.value) {

      return []

    }



    return employeePosts.value.filter(

      (assignment) =>

        assignment.employee_id ===

          newEmployeeId.value &&

        assignment.active

    )

  })



const selectedAssignment =

  computed(() => {

    if (

      !newEmployeeId.value ||

      !newPostId.value

    ) {

      return null

    }



    return (

      employeePosts.value.find(

        (assignment) =>

          assignment.employee_id ===

            newEmployeeId.value &&

          assignment.post_id ===

            newPostId.value &&

          assignment.active

      ) ?? null

    )

  })



const selectedNewPost =

  computed(() => {

    return selectedAssignment.value?.post ?? null

  })



const effectiveRate = (

  assignment: EmployeePost

) => {

  return Number(

    assignment.custom_rate ??

      assignment.post.base_rate ??

      0

  )

}



/* =========================

   OUVRIR AJOUT

\========================= */



const openAddVacation = () => {

  showAddVacation.value = true



  newEmployeeId.value = ''

  newPostId.value = ''

  newWorkDate.value = getParisDate()

  newVacationType.value = ''



  addVacationError.value = ''

  addVacationSuccess.value = ''

}



const closeAddVacation = () => {

  showAddVacation.value = false



  newEmployeeId.value = ''

  newPostId.value = ''

  newVacationType.value = ''



  addVacationError.value = ''

  addVacationSuccess.value = ''

}



const onNewEmployeeChange = () => {

  newPostId.value = ''

  newVacationType.value = ''



  addVacationError.value = ''

  addVacationSuccess.value = ''

}



const onNewPostChange = () => {

  addVacationError.value = ''

  addVacationSuccess.value = ''



  if (!selectedNewPost.value) {

    newVacationType.value = ''

    return

  }



  if (

    selectedNewPost.value.service_type ===

    'cleaning'

  ) {

    newVacationType.value = 'jour'

  } else {

    newVacationType.value = ''

  }

}



/* =========================

   AJOUTER VACATION

\========================= */



const addVacation = async () => {

  addVacationError.value = ''

  addVacationSuccess.value = ''



  if (!newEmployeeId.value) {

    addVacationError.value =

      'Sélectionnez un employé.'

    return

  }



  if (!selectedAssignment.value) {

    addVacationError.value =

      'Sélectionnez un poste affecté à cet employé.'

    return

  }



  if (!newWorkDate.value) {

    addVacationError.value =

      'Sélectionnez une date.'

    return

  }



  if (!newVacationType.value) {

    addVacationError.value =

      'Sélectionnez une vacation.'

    return

  }



  const post =

    selectedAssignment.value.post



  let scheduledTime: string | null =

    null



  if (post.service_type === 'security') {

    if (newVacationType.value === 'midi') {

      scheduledTime = '11:45:00'

    } else if (

      newVacationType.value === 'soir'

    ) {

      scheduledTime = '18:45:00'

    } else {

      addVacationError.value =

        'Vacation de sécurité invalide.'

      return

    }

  }



  if (

    post.service_type === 'cleaning' &&

    newVacationType.value !== 'jour'

  ) {

    addVacationError.value =

      'Vacation de ménage invalide.'

    return

  }



  const rate =

    effectiveRate(

      selectedAssignment.value

    )



  addingVacation.value = true



  const { error } =

    await supabase

      .from('punches')

      .insert({

        employee_id:

          newEmployeeId.value,



        post_id:

          newPostId.value,



        vacation_type:

          newVacationType.value,



        work_date:

          newWorkDate.value,



        scheduled_time:

          scheduledTime,



        // Date réelle de création par l'admin.

        punched_at:

          new Date().toISOString(),



        applied_rate:

          rate,



        status:

          'validated',



        anomaly_reason:

          null,

      })



  addingVacation.value = false



  if (error) {

    console.error(

      'Erreur ajout vacation :',

      error

    )



    if (

      error.code === '23505'

    ) {

      addVacationError.value =

        'Cette vacation existe déjà pour cet employé, ce poste et cette date.'

    } else {

      addVacationError.value =

        "Impossible d'ajouter la vacation."

    }



    return

  }



  addVacationSuccess.value =

    'Vacation ajoutée avec succès.'



  /*

    On affiche automatiquement

    le mois de la vacation ajoutée.

  */

  selectedMonth.value =

    newWorkDate.value.slice(0, 7)



  await loadData()



  setTimeout(() => {

    closeAddVacation()

  }, 800)

}



/* =========================

   CHARGEMENT

\========================= */



const loadData = async () => {

  loading.value = true

  errorMessage.value = ''



  /* EMPLOYÉS */



  const {

    data: employeeData,

    error: employeeError,

  } =

    await supabase

      .from('employees')

      .select(`

        id,

        first_name,

        last_name

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

    (employeeData ?? []) as Employee[]



  /* POSTES */



  const {

    data: postData,

    error: postError,

  } =

    await supabase

      .from('posts')

      .select(`

        id,

        service_type,

        site_name,

        base_rate

      `)

      .eq('active', true)

      .order('site_name')



  if (postError) {

    console.error(postError)



    errorMessage.value =

      'Impossible de charger les postes.'



    loading.value = false

    return

  }



  posts.value =

    (postData ?? []).map(

      (post: any) => ({

        ...post,

        base_rate:

          Number(post.base_rate ?? 0),

      })

    ) as Post[]



  /* AFFECTATIONS */



  const {

    data: assignmentData,

    error: assignmentError,

  } =

    await supabase

      .from('employee_posts')

      .select(`

        id,

        employee_id,

        post_id,

        custom_rate,

        active,

        post:posts (

          id,

          service_type,

          site_name,

          base_rate

        )

      `)

      .eq('active', true)



  if (assignmentError) {

    console.error(

      'Erreur affectations :',

      assignmentError

    )



    errorMessage.value =

      'Impossible de charger les affectations.'



    loading.value = false

    return

  }



  employeePosts.value =

    (assignmentData ?? [])

      .map((assignment: any) => {

        const post =

          Array.isArray(assignment.post)

            ? assignment.post[0]

            : assignment.post



        if (!post) {

          return null

        }



        return {

          id:

            assignment.id,



          employee_id:

            assignment.employee_id,



          post_id:

            assignment.post_id,



          custom_rate:

            assignment.custom_rate === null

              ? null

              : Number(

                  assignment.custom_rate

                ),



          active:

            assignment.active,



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

        ): assignment is EmployeePost =>

          assignment !== null

      )



      /* ASTREINTES */



const {

  data: onCallData,

  error: onCallError,

} = await supabase

  .from('on_call_assignments')

  .select(`

    id,

    employee_id,

    post_id,

    daily_rate,

    started_on,

    ended_on

  `)

  .lte('started_on', monthEnd.value)

  .or(`ended_on.is.null,ended_on.gte.${monthStart.value}`)



if (onCallError) {

  console.error(

    'Erreur astreintes :',

    onCallError

  )



  errorMessage.value =

    'Impossible de charger les astreintes.'



  loading.value = false

  return

}



onCallAssignments.value =

  (onCallData ?? []).map(

    (assignment: any) => ({

      ...assignment,

      daily_rate: Number(

        assignment.daily_rate ?? 0

      ),

    })

  ) as OnCallAssignment[]



  /* POINTAGES */



  const {

    data: punchData,

    error: punchError,

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

        post:posts (

          id,

          service_type,

          site_name,

          base_rate

        )

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

        'punched_at',

        {

          ascending: false,

        }

      )



  if (punchError) {

    console.error(

      'Erreur pointages :',

      punchError

    )



    errorMessage.value =

      'Impossible de charger les pointages.'



    loading.value = false

    return

  }



  punches.value =

    (punchData ?? [])

      .map((punch: any) => {

        const post =

          Array.isArray(punch.post)

            ? punch.post[0]

            : punch.post



        return {

          ...punch,



          applied_rate:

            Number(

              punch.applied_rate ?? 0

            ),



          status:

            punch.status === 'contested'

              ? 'contested'

              : 'validated',



          post: post

            ? {

                ...post,



                base_rate:

                  Number(

                    post.base_rate ?? 0

                  ),

              }

            : null,

        }

      })

      .filter(

        (punch: any) =>

          punch.post !== null

      ) as Punch[]



  loading.value = false

}



const dateToUtc = (date: string) => {

  const [year, month, day] =

    date.split('-').map(Number)



  return new Date(

    Date.UTC(year, month - 1, day)

  )

}



const formatUtcDate = (date: Date) => {

  return date.toISOString().slice(0, 10)

}



const onCallPunches = computed<Punch[]>(() => {

  const result: Punch[] = []



  const todayDate = today.value



  for (const assignment of onCallAssignments.value) {

    const post = posts.value.find(

      (item) => item.id === assignment.post_id

    )



    if (!post) continue



    const start =

      assignment.started_on > monthStart.value

        ? assignment.started_on

        : monthStart.value



    const assignmentEnd =

      assignment.ended_on ?? todayDate



    let end =

      assignmentEnd < monthEnd.value

        ? assignmentEnd

        : monthEnd.value



    // Ne jamais créer des jours futurs

    if (end > todayDate) {

      end = todayDate

    }



    if (start > end) continue



    const current = dateToUtc(start)

    const last = dateToUtc(end)



    while (current <= last) {

      const workDate =

        formatUtcDate(current)



      result.push({

        id:

          `on-call-${assignment.id}-${workDate}`,



        employee_id:

          assignment.employee_id,



        post_id:

          assignment.post_id,



        vacation_type:

          'astreinte',



        work_date:

          workDate,



        scheduled_time:

          null,



        punched_at:

          `${workDate}T00:00:00+02:00`,



        applied_rate:

          assignment.daily_rate,



        status:

          'validated',



        post,

      })



      current.setUTCDate(

        current.getUTCDate() + 1

      )

    }

  }



  return result

})



/* =========================

   FILTRAGE

\========================= */



const filteredPunches =

  computed(() => {

    return [

        ...punches.value,

        ...onCallPunches.value,

    ].filter(

      (punch) => {

        if (

          selectedEmployeeId.value &&

          punch.employee_id !==

            selectedEmployeeId.value

        ) {

          return false

        }



        if (

          selectedPostId.value &&

          punch.post_id !==

            selectedPostId.value

        ) {

          return false

        }



        if (

          selectedStatus.value &&

          punch.status !==

            selectedStatus.value

        ) {

          return false

        }



        return true

      }

    )

  })



const validFilteredPunches =

  computed(() => {

    return filteredPunches.value.filter(

      (punch) =>

        punch.status !== 'contested'

    )

  })



const totalAmount =

  computed(() => {

    return validFilteredPunches.value.reduce(

      (total, punch) =>

        total +

        Number(punch.applied_rate),

      0

    )

  })



/* =========================

   RÉCAP EMPLOYÉS

\========================= */



const employeeSummaries =

  computed(() => {

    return employees.value

      .filter((employee) => {

        if (

          selectedEmployeeId.value &&

          employee.id !==

            selectedEmployeeId.value

        ) {

          return false

        }



        return true

      })



      .map((employee) => {

        const employeePunches =

          filteredPunches.value.filter(

            (punch) =>

              punch.employee_id ===

              employee.id

          )



        const validPunches =

          employeePunches.filter(

            (punch) =>

              punch.status !==

              'contested'

          )



        const vacationPunches =

          validPunches.filter(

            (punch) =>

              punch.vacation_type !== 'astreinte'

          )



        const onCallPunchesForEmployee =

          validPunches.filter(

            (punch) =>

              punch.vacation_type === 'astreinte'

          )



        const todayVacationCount =

          vacationPunches.filter(

            (punch) =>

              punch.work_date === today.value

          ).length



        const todayOnCallCount =

          onCallPunchesForEmployee.filter(

            (punch) =>

              punch.work_date === today.value

          ).length



        const todayLabel =

          todayOnCallCount > 0 && todayVacationCount === 0

            ? `${todayOnCallCount} astreinte${todayOnCallCount > 1 ? 's' : ''}`

            : todayOnCallCount > 0

              ? `${todayVacationCount} vac. • ${todayOnCallCount} astreinte${todayOnCallCount > 1 ? 's' : ''}`

              : `${todayVacationCount} vac.`



        const monthLabel =

          onCallPunchesForEmployee.length > 0 && vacationPunches.length === 0

            ? `${onCallPunchesForEmployee.length} j. astreinte`

            : onCallPunchesForEmployee.length > 0

              ? `${vacationPunches.length} vac. • ${onCallPunchesForEmployee.length} j. astreinte`

              : `${vacationPunches.length} vac.`



        const employeeAmount =

          validPunches.reduce(

            (total, punch) =>

              total +

              Number(

                punch.applied_rate

              ),

            0

          )



        const assignedPosts =

          employeePosts.value.filter(

            (assignment) =>

              assignment.employee_id ===

              employee.id &&

              assignment.active

          )



        const postNames =

          assignedPosts.map(

            (assignment) =>

              `${serviceLabel(

                assignment.post.service_type

              )} · ${

                assignment.post.site_name

              }`

          )



        return {

          id:

            employee.id,



          fullName:

            `${employee.first_name} ${employee.last_name}`,



          initial:

            employee.first_name

              ?.charAt(0)

              .toUpperCase() || '?',



          todayCount:

            todayVacationCount + todayOnCallCount,



          validCount:

            validPunches.length,



          todayLabel,



          monthLabel,



          totalAmount:

            employeeAmount,



          postNames:

            postNames.length

              ? postNames.join(' • ')

              : 'Aucun poste',



          punches:

            employeePunches,

        }

      })



      .filter(

        (employee) =>

          employee.punches.length > 0

      )

  })



/* =========================

   EMPLOYÉ

\========================= */



const toggleEmployee = (

  employeeId: string

) => {

  expandedEmployeeId.value =

    expandedEmployeeId.value ===

    employeeId

      ? null

      : employeeId

}



/* =========================

   CONTESTER

\========================= */



const contestPunch =

  async (

    punch: Punch

  ) => {

    const confirmed =

      window.confirm(

        `Contester la vacation ${vacationLabel(

          punch.vacation_type

        )} du ${formatDate(

          punch.work_date

        )} ?`

      )



    if (!confirmed) {

      return

    }



    updatingPunchId.value =

      punch.id



    const { error } =

      await supabase

        .from('punches')

        .update({

          status:

            'contested',

        })

        .eq(

          'id',

          punch.id

        )



    updatingPunchId.value =

      null



    if (error) {

      console.error(error)



      window.alert(

        'Impossible de contester cette vacation.'

      )



      return

    }



    punch.status =

      'contested'

  }



/* =========================

   RÉTABLIR

\========================= */



const restorePunch =

  async (

    punch: Punch

  ) => {

    const confirmed =

      window.confirm(

        `Rétablir la vacation ${vacationLabel(

          punch.vacation_type

        )} du ${formatDate(

          punch.work_date

        )} ?`

      )



    if (!confirmed) {

      return

    }



    updatingPunchId.value =

      punch.id



    const { error } =

      await supabase

        .from('punches')

        .update({

          status:

            'validated',



          anomaly_reason:

            null,

        })

        .eq(

          'id',

          punch.id

        )



    updatingPunchId.value =

      null



    if (error) {

      console.error(error)



      window.alert(

        'Impossible de rétablir cette vacation.'

      )



      return

    }



    punch.status =

      'validated'

  }



/* =========================

   FORMATAGE

\========================= */



const serviceLabel = (

  service: ServiceType

) => {

  if (service === 'security') {

    return 'Sécurité'

  }



  if (service === 'cleaning') {

    return 'Ménage'

  }



  return 'Astreinte'

}



const vacationLabel = (

  vacation: VacationType

) => {

  if (vacation === 'midi') {

    return 'Midi'

  }



  if (vacation === 'soir') {

    return 'Soir'

  }



  if (vacation === 'astreinte') {

  return 'Astreinte'

}



  return 'Journée'

}



const vacationIcon = (

  vacation: VacationType

) => {

  if (vacation === 'midi') {

    return '☀️'

  }



  if (vacation === 'soir') {

    return '🌙'

  }



  if (vacation === 'astreinte') {

  return '📞'

}



  return '✨'

}



const statusLabel = (

  status: PunchStatus

) => {

  return status === 'contested'

    ? 'Contesté'

    : 'Validé'

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

  ).format(

    Number(value)

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

        weekday: 'short',

        day: 'numeric',

        month: 'short',

      }

    ).format(value)



  return (

    formatted

      .charAt(0)

      .toUpperCase() +

    formatted.slice(1)

  )

}



const formatScheduledTime = (

  time: string

) => {

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

      timeZone: 'Europe/Paris',

    }

  )

    .format(

      new Date(timestamp)

    )

    .replace(':', 'h')

}



/* =========================

   CHANGEMENT MOIS

\========================= */



watch(

  selectedMonth,

  async () => {

    expandedEmployeeId.value =

      null



    await loadData()

  }

)



/* =========================

   DÉMARRAGE

\========================= */



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



.admin-hours-page {

  min-height: 100vh;

  padding: 28px 18px 120px;

  background: #f7f1ec;

  color: #1d2c27;

}



.page-shell {

  width: 100%;

  max-width: 560px;

  margin: 0 auto;

}



/* HEADER */



.topbar {

  display: flex;

  flex-direction: column;

  gap: 15px;

  margin-bottom: 20px;

}



.eyebrow,

.small-eyebrow {

  margin: 0 0 5px;

  color: #9b8174;

  font-size: 10px;

  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 1.2px;

}



h1 {

  margin: 0;

  color: #17372f;

  font-family: Georgia, 'Times New Roman', serif;

  font-size: 30px;

  font-weight: 400;

}



.subtitle {

  margin: 7px 0 0;

  color: #7d7874;

  font-size: 12px;

  line-height: 1.4;

}



.add-button {

  width: 100%;

  min-height: 50px;

  border: 0;

  border-radius: 16px;

  background: #c66b50;

  color: white;

  font: inherit;

  font-size: 13px;

  font-weight: 700;

  cursor: pointer;

}



/* AJOUT */



.add-card {

  margin-bottom: 18px;

  padding: 20px;

  border: 1px solid #e6ddd7;

  border-radius: 24px;

  background: white;

}



.add-header {

  display: flex;

  align-items: flex-start;

  justify-content: space-between;

}



.add-header h2 {

  margin: 0;

  color: #17372f;

  font-family: Georgia, 'Times New Roman', serif;

  font-size: 22px;

  font-weight: 400;

}



.close-button {

  width: 34px;

  height: 34px;

  border: 0;

  border-radius: 50%;

  background: #f5efeb;

  color: #17372f;

  font-size: 21px;

  cursor: pointer;

}



.add-description {

  margin: 8px 0 20px;

  color: #8d8580;

  font-size: 11px;

}



.form-field {

  display: flex;

  flex-direction: column;

  gap: 7px;

  margin-top: 15px;

}



.form-field label {

  color: #17372f;

  font-size: 11px;

  font-weight: 700;

}



.form-field select,

.form-field input {

  width: 100%;

  min-height: 50px;

  padding: 0 13px;

  border: 1px solid #e5ddd8;

  border-radius: 14px;

  outline: none;

  background: #faf7f4;

  color: #17372f;

  font: inherit;

  font-size: 12px;

}



.field-help {

  margin: 2px 0 0;

  font-size: 10px;

}



.error-text {

  color: #a84f40;

}



.vacation-selector {

  display: grid;

  grid-template-columns: repeat(2, 1fr);

  gap: 10px;

}



.vacation-choice {

  display: flex;

  align-items: center;

  gap: 10px;

  min-height: 68px;

  padding: 12px;

  border: 1px solid #e5ddd8;

  border-radius: 16px;

  background: #faf7f4;

  color: #17372f;

  text-align: left;

  cursor: pointer;

}



.vacation-choice.active {

  border-color: #17372f;

  background: #e8efeb;

}



.choice-icon {

  font-size: 20px;

}



.vacation-choice strong,

.vacation-choice small {

  display: block;

}



.vacation-choice strong {

  font-size: 12px;

}



.vacation-choice small {

  margin-top: 3px;

  color: #8c837e;

  font-size: 10px;

}



.cleaning-info {

  display: flex;

  align-items: center;

  gap: 11px;

  margin-top: 15px;

  padding: 14px;

  border-radius: 16px;

  background: #f5efeb;

}



.cleaning-icon {

  font-size: 22px;

}



.cleaning-info span,

.cleaning-info strong {

  display: block;

}



.cleaning-info span {

  margin-bottom: 3px;

  color: #8d8580;

  font-size: 9px;

}



.cleaning-info strong {

  color: #17372f;

  font-size: 12px;

}



.add-summary {

  display: grid;

  grid-template-columns: 1fr auto;

  gap: 15px;

  margin-top: 18px;

  padding: 14px;

  border-radius: 16px;

  background: #17372f;

  color: white;

}



.add-summary span,

.add-summary strong {

  display: block;

}



.add-summary span {

  margin-bottom: 4px;

  font-size: 9px;

  opacity: 0.65;

}



.add-summary strong {

  font-size: 11px;

}



.add-summary div:last-child {

  text-align: right;

}



.form-message {

  margin: 14px 0 0;

  padding: 11px 13px;

  border-radius: 13px;

  font-size: 11px;

}



.error-message {

  background: #f9e7e3;

  color: #a84f40;

}



.success-message {

  background: #e7f1eb;

  color: #31594c;

}



.form-actions {

  display: grid;

  grid-template-columns: 1fr 1.4fr;

  gap: 10px;

  margin-top: 18px;

}



.cancel-button,

.save-button {

  min-height: 48px;

  border: 0;

  border-radius: 14px;

  font: inherit;

  font-size: 11px;

  font-weight: 700;

  cursor: pointer;

}



.cancel-button {

  background: #f1ebe7;

  color: #665d58;

}



.save-button {

  background: #17372f;

  color: white;

}



.save-button:disabled {

  opacity: 0.6;

  cursor: wait;

}



/* RÉSUMÉ */



.global-summary {

  display: grid;

  grid-template-columns: repeat(2, 1fr);

  margin-bottom: 15px;

  overflow: hidden;

  border-radius: 20px;

  background: #17372f;

  color: white;

}



.global-summary div {

  padding: 17px 14px;

}



.global-summary div + div {

  border-left: 1px solid rgba(255, 255, 255, 0.14);

}



.global-summary span {

  display: block;

  margin-bottom: 5px;

  font-size: 9px;

  opacity: 0.65;

}



.global-summary strong {

  font-size: 16px;

}



/* FILTRES */



.filters-card {

  display: grid;

  grid-template-columns: repeat(2, 1fr);

  gap: 12px;

  margin-bottom: 16px;

  padding: 16px;

  border: 1px solid #ebe4df;

  border-radius: 20px;

  background: white;

}



.filter-field {

  display: flex;

  flex-direction: column;

}



.filter-field label {

  margin-bottom: 6px;

  color: #17372f;

  font-size: 10px;

  font-weight: 700;

}



.filter-field input,

.filter-field select {

  width: 100%;

  min-height: 44px;

  padding: 0 11px;

  border: 1px solid #e5ddd8;

  border-radius: 12px;

  background: #faf7f4;

  color: #17372f;

  font: inherit;

  font-size: 11px;

}



/* ÉTATS */



.state-card {

  padding: 20px;

  border: 1px solid #ebe4df;

  border-radius: 20px;

  background: white;

  color: #7d7874;

  font-size: 12px;

}



.state-card.error {

  background: #f9e7e3;

  color: #a84f40;

}



/* EMPLOYÉS */



.employee-list {

  display: flex;

  flex-direction: column;

  gap: 13px;

}



.employee-card {

  overflow: hidden;

  border: 1px solid #ebe4df;

  border-radius: 23px;

  background: white;

}



.employee-summary {

  width: 100%;

  display: flex;

  flex-direction: column;

  gap: 14px;

  padding: 17px;

  border: none;

  background: transparent;

  text-align: left;

  font-family: inherit;

  cursor: pointer;

}



.employee-main {

  display: flex;

  align-items: center;

  gap: 11px;

}



.avatar {

  width: 40px;

  height: 40px;

  flex-shrink: 0;

  display: grid;

  place-items: center;

  border-radius: 50%;

  background: #17372f;

  color: white;

  font-size: 15px;

  font-weight: 700;

}



.employee-identity {

  min-width: 0;

}



.employee-main h2 {

  margin: 0;

  color: #17372f;

  font-size: 15px;

}



.employee-main p {

  margin: 3px 0 0;

  color: #918984;

  font-size: 9px;

  line-height: 1.4;

}



.employee-stats {

  display: grid;

  grid-template-columns: repeat(3, 1fr);

  gap: 7px;

}



.employee-stats div {

  padding: 10px 8px;

  border-radius: 13px;

  background: #f8f3ef;

}



.employee-stats span {

  display: block;

  margin-bottom: 4px;

  color: #9b938d;

  font-size: 8px;

}



.employee-stats strong {

  color: #17372f;

  font-size: 10px;

}



.arrow {

  align-self: center;

  color: #9b938d;

  font-size: 14px;

}



/* DÉTAILS */



.details {

  padding: 0 13px 13px;

}



.punch-row {

  margin-top: 10px;

  padding: 15px;

  border: 1px solid #eee5df;

  border-radius: 18px;

  background: #fcfaf8;

}



.punch-row.contested {

  border-color: #e5b8ae;

  background: #fff5f3;

}



.punch-top {

  display: flex;

  justify-content: space-between;

  gap: 12px;

}



.punch-date {

  display: block;

  color: #17372f;

  font-size: 12px;

}



.punch-post {

  display: block;

  margin-top: 3px;

  color: #918984;

  font-size: 9px;

}



.status-badge {

  height: fit-content;

  padding: 5px 8px;

  border-radius: 20px;

  font-size: 8px;

  font-weight: 700;

}



.status-badge.validated {

  background: #e4efe8;

  color: #31594c;

}



.status-badge.contested {

  background: #f5d8d2;

  color: #a84f40;

}



.vacation-line {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 12px;

  margin-top: 14px;

}



.vacation-name {

  display: flex;

  align-items: center;

  gap: 9px;

}



.vacation-icon {

  font-size: 18px;

}



.vacation-name span:not(.vacation-icon) {

  display: block;

  color: #9b938d;

  font-size: 8px;

}



.vacation-name strong {

  display: block;

  margin-top: 2px;

  color: #17372f;

  font-size: 11px;

}



.rate {

  color: #17372f;

  font-size: 13px;

}



.rate.crossed {

  color: #a84f40;

  text-decoration: line-through;

}



.time-grid {

  display: grid;

  grid-template-columns: repeat(2, 1fr);

  gap: 8px;

  margin-top: 13px;

}



.time-grid div {

  padding: 10px;

  border-radius: 12px;

  background: #f3eeea;

}



.time-grid span,

.time-grid strong {

  display: block;

}



.time-grid span {

  margin-bottom: 3px;

  color: #9b938d;

  font-size: 8px;

}



.time-grid strong {

  color: #17372f;

  font-size: 10px;

}



.contested-message {

  margin-top: 11px;

  padding: 10px;

  border-radius: 12px;

  background: #f7dfda;

  color: #9c4f43;

  font-size: 9px;

}



.punch-actions {

  margin-top: 12px;

}



.contest-button,

.restore-button {

  width: 100%;

  min-height: 40px;

  border-radius: 12px;

  font: inherit;

  font-size: 10px;

  font-weight: 700;

  cursor: pointer;

}



.contest-button {

  border: 1px solid #e1b0a6;

  background: transparent;

  color: #a84f40;

}



.restore-button {

  border: 0;

  background: #17372f;

  color: white;

}



.contest-button:disabled,

.restore-button:disabled {

  opacity: 0.55;

  cursor: wait;

}



@media (max-width: 480px) {

  .admin-hours-page {

    padding: 22px 14px 115px;

  }



  .filters-card {

    grid-template-columns: 1fr;

  }



  .add-card {

    padding: 17px;

  }



  .vacation-selector {

    grid-template-columns: 1fr 1fr;

  }



  .employee-stats {

    grid-template-columns: repeat(3, 1fr);

  }

}

</style>