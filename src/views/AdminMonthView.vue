<template>
  <main class="admin-month-page">
    <section class="month-content">
      <header class="page-header">
        <p class="eyebrow">Vue mensuelle</p>
        <h1>Calendrier</h1>
        <p class="subtitle">Consultez les pointages de vos employés jour par jour.</p>
      </header>
      <section class="month-selector">
        <button type="button" class="month-arrow" @click="previousMonth" aria-label="Mois précédent">‹</button>
        <div class="month-name">{{ monthLabel }}</div>
        <button type="button" class="month-arrow" @click="nextMonth" aria-label="Mois suivant">›</button>
      </section>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <section class="calendar-card">
        <div class="weekdays">
          <span v-for="day in weekDays" :key="day">{{ day }}</span>
        </div>
        <div v-if="loading" class="loading-state">Chargement du calendrier...</div>
        <div v-else class="calendar-grid">
          <button
            v-for="cell in calendarCells"
            :key="cell.key"
            type="button"
            class="day-cell"
            :class="{
              empty: !cell.date,
              active: cell.date && cell.hasPunches,
              inactive: cell.date && !cell.hasPunches,
              selected: cell.date && selectedDate === cell.date,
              today: cell.date && cell.date === todayParis,
            }"
            :disabled="!cell.date"
            @click="cell.date && selectDay(cell.date)"
          >
            <template v-if="cell.date">
              <span class="day-number">{{ cell.day }}</span>
              <span class="day-state">
                {{ cell.hasPunches ? `${cell.totalVacations} vacation${cell.totalVacations > 1 ? 's' : ''}` : 'Aucun pointage' }}
              </span>
            </template>
          </button>
        </div>
      </section>
      <section v-if="selectedDate" class="day-details">
        <div class="details-heading">
          <div>
            <p class="eyebrow">Détail de la journée</p>
            <h2>{{ selectedDateLabel }}</h2>
          </div>
          <button type="button" class="close-details" @click="selectedDate = null" aria-label="Fermer">×</button>
        </div>
        <div v-if="selectedGroups.length" class="site-groups">
        <section v-for="group in selectedGroups" :key="group.key" class="site-group">
          <header class="site-heading">
            <div>
              <span class="site-category">{{ group.service }}</span>
              <h3>{{ group.site }}</h3>
            </div>
            <span class="site-count">{{ group.items.length }} {{ group.isOnCall ? 'astreinte' : 'pointage' }}{{ group.items.length > 1 ? 's' : '' }}</span>
          </header>
          <div class="site-entries">
            <article v-for="item in group.items" :key="item.id" class="site-entry">
              <div class="employee-avatar">{{ item.firstName.charAt(0).toUpperCase() }}</div>
              <div class="site-entry-main">
                <strong>{{ item.firstName }}</strong>
                <span v-if="item.isOnCall">Journée d'astreinte</span>
                <span v-else-if="item.punch && isPortSaintLouisPunch(item.punch)">
                  Vacation ménage · Pointé à {{ formatPunchTime(item.punch.punched_at) }}
                </span>
                <span v-else-if="item.punch">
                  {{ vacationLabel(item.punch.vacation_type) }} · Pointé à {{ formatPunchTime(item.punch.punched_at) }}
                </span>
              </div>
              <strong class="vacation-price">{{ formatMoney(item.amount) }}</strong>
            </article>
          </div>
        </section>
      </div>
      <div v-else class="empty-day">
          <div class="empty-icon">○</div>
          <strong>Aucun pointage</strong>
          <span>Aucun employé n'a pointé ce jour.</span>
        </div>
      </section>
    </section>
    <AdminBottomNav />
  </main>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { supabase } from '../lib/supabase'
import AdminBottomNav from '../components/AdminBottomNav.vue'
type Employee = {
  id: string
  first_name?: string | null
  firstname?: string | null
  name?: string | null
}
type Punch = {
  id: string
  employee_id: string
  post_id: string
  vacation_type: string
  work_date: string
  punched_at: string
  applied_rate: number | string | null
  status: 'validated' | 'contested' | string
}
type Post = {
  id: string
  service_type: string
  site_name: string
}
type OnCallAssignment = {
  id: string
  employee_id: string
  started_on: string
  ended_on: string | null
}
type CalendarCell = {
  key: string
  date: string | null
  day: number | null
  hasPunches: boolean
  totalVacations: number
}
type DayGroupItem = {
  id: string
  firstName: string
  punch: Punch | null
  isOnCall: boolean
  amount: number
}
type DayGroup = {
  key: string
  site: string
  service: string
  isOnCall: boolean
  items: DayGroupItem[]
}
const weekDays = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.']
const employees = ref<Employee[]>([])
const punches = ref<Punch[]>([])
const posts = ref<Post[]>([])
const onCallAssignments = ref<OnCallAssignment[]>([])
const loading = ref(true)
const errorMessage = ref('')
const selectedDate = ref<string | null>(null)
const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth())
const parisDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Paris',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const todayParis = parisDateFormatter.format(new Date())
const toDateKey = (year: number, month: number, day: number) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
const monthStart = computed(() => toDateKey(currentYear.value, currentMonth.value, 1))
const monthEnd = computed(() => {
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  return toDateKey(currentYear.value, currentMonth.value, lastDay)
})
const monthLabel = computed(() => {
  const label = new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(currentYear.value, currentMonth.value, 1))
  return label.charAt(0).toUpperCase() + label.slice(1)
})
const firstNameOf = (employee: Employee) => {
  const value = employee.first_name || employee.firstname || employee.name || 'Employé'
  return value.trim().split(/\s+/)[0] || 'Employé'
}
const isOnCallOnDate = (employeeId: string, date: string) => {
  if (date > todayParis) return false
  return onCallAssignments.value.some(assignment => {
    if (assignment.employee_id !== employeeId) return false
    if (assignment.started_on > date) return false
    if (assignment.ended_on && assignment.ended_on < date) return false
    return true
  })
}
const validatedPunchesForDate = (date: string) => {
  return punches.value.filter(punch => punch.work_date === date && punch.status !== 'contested')
}
const totalForDate = (date: string) => validatedPunchesForDate(date).length
const hasActivityForDate = (date: string) => {
  if (totalForDate(date) > 0) return true
  if (date > todayParis) return false
  return employees.value.some(employee => isOnCallOnDate(employee.id, date))
}
const calendarCells = computed<CalendarCell[]>(() => {
  const cells: CalendarCell[] = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const mondayOffset = (firstDay.getDay() + 6) % 7
  for (let i = 0; i < mondayOffset; i += 1) {
    cells.push({ key: `empty-start-${i}`, date: null, day: null, hasPunches: false, totalVacations: 0 })
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = toDateKey(currentYear.value, currentMonth.value, day)
    cells.push({
      key: date,
      date,
      day,
      hasPunches: hasActivityForDate(date),
      totalVacations: totalForDate(date),
    })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ key: `empty-end-${cells.length}`, date: null, day: null, hasPunches: false, totalVacations: 0 })
  }
  return cells
})
const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return ''
  const [year, month, day] = selectedDate.value.split('-').map(Number)
  const label = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
  return label.charAt(0).toUpperCase() + label.slice(1)
})
const selectedGroups = computed<DayGroup[]>(() => {
  if (!selectedDate.value) return []
  const date = selectedDate.value
  const groups = new Map<string, DayGroup>()
  const employeeNames = new Map(employees.value.map(employee => [employee.id, firstNameOf(employee)]))

  for (const punch of validatedPunchesForDate(date)) {
    const post = posts.value.find(item => item.id === punch.post_id)
    const service = post?.service_type === 'cleaning' ? 'Ménage'
      : post?.service_type === 'security' ? 'Sécurité' : 'Autre'
    const site = post?.site_name || 'Site inconnu'
    const key = `${service}:${site}`
    if (!groups.has(key)) groups.set(key, { key, site, service, isOnCall: false, items: [] })
    groups.get(key)!.items.push({
      id: punch.id,
      firstName: employeeNames.get(punch.employee_id) || 'Employé',
      punch,
      isOnCall: false,
      amount: Number(punch.applied_rate ?? 0),
    })
  }

  for (const employee of employees.value) {
    if (!isOnCallOnDate(employee.id, date)) continue
    const key = 'astreinte'
    if (!groups.has(key)) groups.set(key, {
      key, site: 'Astreinte', service: 'Astreinte', isOnCall: true, items: [],
    })
    groups.get(key)!.items.push({
      id: `astreinte-${employee.id}-${date}`,
      firstName: firstNameOf(employee),
      punch: null,
      isOnCall: true,
      amount: 40,
    })
  }

  return [...groups.values()]
    .map(group => ({
      ...group,
      items: group.items.sort((a, b) => a.firstName.localeCompare(b.firstName, 'fr')),
    }))
    .sort((a, b) => Number(a.isOnCall) - Number(b.isOnCall)
      || a.site.localeCompare(b.site, 'fr')
      || a.service.localeCompare(b.service, 'fr'))
})

const postForPunch = (punch: Punch) =>
  posts.value.find(item => item.id === punch.post_id)
const isPortSaintLouisPunch = (punch: Punch) =>
  postForPunch(punch)?.site_name === 'Port-Saint-Louis'
const vacationLabel = (type: string) => {
  if (type === 'midi') return 'Vacation midi'
  if (type === 'soir') return 'Vacation soir'
  if (type === 'jour') return 'Vacation journée'
  return 'Vacation'
}
const formatPunchTime = (value: string) => {
  if (!value) return '--:--'
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
const formatMoney = (value: number | string | null) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(value || 0))
}
const selectDay = (date: string) => {
  selectedDate.value = date
}
const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value -= 1
  } else {
    currentMonth.value -= 1
  }
}
const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value += 1
  } else {
    currentMonth.value += 1
  }
}
const loadMonth = async () => {
  loading.value = true
  errorMessage.value = ''
  selectedDate.value = null
  const [employeesResult, punchesResult, postsResult, onCallResult] = await Promise.all([
    supabase.from('employees').select('*').order('first_name', { ascending: true }),
    supabase
      .from('punches')
      .select('id, employee_id, post_id, vacation_type, work_date, punched_at, applied_rate, status')
      .gte('work_date', monthStart.value)
      .lte('work_date', monthEnd.value),
    supabase
      .from('posts')
      .select('id, service_type, site_name'),
    supabase
      .from('on_call_assignments')
      .select('id, employee_id, started_on, ended_on')
      .lte('started_on', monthEnd.value)
      .or(`ended_on.is.null,ended_on.gte.${monthStart.value}`),
  ])
  if (employeesResult.error || punchesResult.error || postsResult.error || onCallResult.error) {
    console.error(employeesResult.error || punchesResult.error || postsResult.error || onCallResult.error)
    errorMessage.value = 'Impossible de charger le calendrier.'
    loading.value = false
    return
  }
  employees.value = (employeesResult.data || []) as Employee[]
  punches.value = (punchesResult.data || []) as Punch[]
  posts.value = (postsResult.data || []) as Post[]
  onCallAssignments.value = (onCallResult.data || []) as OnCallAssignment[]
  loading.value = false
}
watch([currentYear, currentMonth], loadMonth)
onMounted(loadMonth)
</script>
<style scoped>
.admin-month-page {
  min-height: 100vh;
  padding-bottom: 92px;
  background: #f7f1ec;
  color: #17372f;
}
.month-content {
  width: min(100% - 28px, 760px);
  margin: 0 auto;
  padding: 30px 0 22px;
}
.page-header { margin-bottom: 22px; }
.eyebrow { margin: 0 0 5px; color: #b46c55; font-size: 9px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; }
h1, h2 { margin: 0; font-family: Georgia, 'Times New Roman', serif; font-weight: 400; color: #17372f; }
h1 { font-size: 34px; }
h2 { font-size: 21px; }
.subtitle { margin: 7px 0 0; color: #8d8580; font-size: 11px; }
.month-selector {
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  margin-bottom: 14px;
  padding: 7px;
  border: 1px solid #eee4dd;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(23, 55, 47, .05);
}
.month-arrow { height: 40px; border: 0; border-radius: 12px; background: transparent; color: #17372f; font-size: 26px; cursor: pointer; }
.month-arrow:hover { background: #f7f1ec; }
.month-name { text-align: center; font-family: Georgia, 'Times New Roman', serif; font-size: 17px; }
.calendar-card { overflow: hidden; border: 1px solid #eee4dd; border-radius: 22px; background: #fff; box-shadow: 0 10px 30px rgba(23, 55, 47, .05); }
.weekdays { display: grid; grid-template-columns: repeat(7, 1fr); padding: 14px 8px 9px; color: #8d8580; font-size: 8px; font-weight: 800; text-align: center; text-transform: uppercase; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; padding: 7px; }
.day-cell { position: relative; min-width: 0; min-height: 82px; padding: 10px 5px 8px; border: 0; border-radius: 14px; font: inherit; text-align: center; cursor: pointer; transition: transform .15s ease, box-shadow .15s ease; }
.day-cell.inactive { background: #efedeb; color: #8e8985; }
.day-cell.active { background: #dcebe3; color: #17372f; }
.day-cell.active:hover, .day-cell.inactive:hover { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(23, 55, 47, .08); }
.day-cell.selected { outline: 2px solid #17372f; outline-offset: -2px; }
.day-cell.today::after { content: ''; position: absolute; top: 7px; right: 7px; width: 5px; height: 5px; border-radius: 50%; background: #b46c55; }
.day-cell.empty { background: transparent; cursor: default; }
.day-number { display: block; font-size: 15px; font-weight: 800; }
.day-state { display: block; margin-top: 11px; overflow: hidden; font-size: 7px; font-weight: 700; line-height: 1.25; text-overflow: ellipsis; }
.loading-state { padding: 55px 20px; color: #8d8580; font-size: 11px; text-align: center; }
.error-message { margin: 0 0 12px; padding: 11px 13px; border-radius: 12px; background: #fff5f3; color: #a84f40; font-size: 10px; }
.day-details { margin-top: 14px; padding: 20px; border: 1px solid #eee4dd; border-radius: 22px; background: #fff; box-shadow: 0 10px 30px rgba(23, 55, 47, .05); }
.details-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 15px; }
.close-details { width: 34px; height: 34px; flex: 0 0 auto; border: 0; border-radius: 50%; background: #f7f1ec; color: #17372f; font-size: 20px; cursor: pointer; }
.employee-list { display: flex; flex-direction: column; gap: 8px; }
.employee-card { overflow: hidden; border-radius: 15px; background: #f8f4f0; }
.employee-row { width: 100%; display: grid; grid-template-columns: 38px 1fr auto 20px; align-items: center; gap: 10px; padding: 11px 12px; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.employee-row:hover { background: #f2ebe5; }
.employee-avatar { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 12px; background: #dcebe3; color: #17372f; font-family: Georgia, 'Times New Roman', serif; font-size: 16px; }
.employee-name { font-size: 12px; font-weight: 800; }
.employee-name small { display: block; margin-top: 3px; color: #9b938e; font-size: 8px; font-weight: 500; }
.employee-count { min-width: 82px; text-align: right; }
.employee-count strong { margin-right: 4px; color: #17372f; font-size: 14px; }
.employee-count span { color: #77706b; font-size: 9px; }
.employee-count small { display: block; margin-top: 3px; color: #b46c55; font-size: 8px; font-weight: 700; }
.empty-day { display: flex; flex-direction: column; align-items: center; padding: 25px 10px; color: #8d8580; text-align: center; }
.empty-icon { width: 42px; height: 42px; display: grid; place-items: center; margin-bottom: 9px; border-radius: 50%; background: #efedeb; font-size: 22px; }
.empty-day strong { color: #17372f; font-size: 11px; }
.empty-day span { margin-top: 4px; font-size: 9px; }
.employee-chevron { color: #8d8580; font-size: 20px; transition: transform .2s ease; }
.employee-chevron.open { transform: rotate(90deg); }
.employee-day-details { display: flex; flex-direction: column; gap: 7px; padding: 0 12px 12px 60px; }
.vacation-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 12px; border: 1px solid #e7ddd6; border-radius: 12px; background: #fff; }
.vacation-main { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.vacation-main strong { color: #17372f; font-size: 10px; }
.vacation-main span { color: #8d8580; font-size: 8px; }
.vacation-price { flex: 0 0 auto; color: #17372f; font-size: 11px; font-weight: 800; }
.on-call-row { border-color: #ead5cc; background: #fff8f5; }
/* Regroupement automatique des pointages par société / site */
.site-groups { display: flex; flex-direction: column; gap: 13px; }
.site-group { overflow: hidden; border: 1px solid #e9e2db; border-radius: 16px; background: #f8f4f0; }
.site-heading { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 14px; }
.site-category { display: block; color: #b46c55; font-size: 9px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; }
.site-heading h3 { margin: 3px 0 0; color: #17372f; font-family: Georgia, 'Times New Roman', serif; font-size: 17px; font-weight: 500; }
.site-count { flex: 0 0 auto; border-radius: 999px; padding: 7px 10px; background: #dcebe3; color: #17372f; font-size: 10px; font-weight: 800; }
.site-entries { display: flex; flex-direction: column; gap: 1px; padding: 0 9px 9px; }
.site-entry { display: flex; align-items: center; gap: 10px; padding: 11px 9px; border-radius: 11px; background: #fff; }
.site-entry .employee-avatar { flex: 0 0 36px; width: 36px; height: 36px; }
.site-entry-main { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 4px; }
.site-entry-main strong { color: #17372f; font-size: 12px; }
.site-entry-main span { color: #8d8580; font-size: 10px; line-height: 1.35; }
.site-entry .vacation-price { font-size: 11px; white-space: nowrap; }
@media (max-width: 560px) {
  .month-content { width: min(100% - 20px, 760px); padding-top: 22px; }
  h1 { font-size: 30px; }
  .calendar-grid { gap: 3px; padding: 5px; }
  .day-cell { min-height: 68px; padding: 8px 2px 6px; border-radius: 11px; }
  .day-number { font-size: 13px; }
  .day-state { margin-top: 8px; font-size: 6px; }
  .weekdays { padding-inline: 5px; font-size: 7px; }
  .day-details { padding: 16px; }
}
</style>
