<template>



  <main class="admin-page">



    <section class="page-shell">







      <!-- HEADER -->



      <header class="topbar">



        <div>



          <p class="eyebrow">



            Administration



          </p>







          <h1>



            Bonjour {{ firstName }} 👋



          </h1>







          <p class="subtitle">



            Retrouvez l'activité en un coup d'œil.



          </p>



        </div>







        <RouterLink



          to="/admin/profile"



          class="profile-button"



        >



          <span class="profile-icon">



            {{ adminInitial }}



          </span>







          <span>



            Profil



          </span>



        </RouterLink>



      </header>







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







      <template v-else>







        <!-- TOTAL DU MOIS -->



<section class="today-card">







  <div class="today-header">



    <div>



      <p class="eyebrow light">



        Total du mois



      </p>







      <h2>



        {{ selectedMonthLabel }}



      </h2>



    </div>







    <span class="today-badge">



      {{ validMonthPunches.length }}



      vac.



    </span>



  </div>







  <div class="today-summary">







    <div>



      <span>



        Vacations



      </span>







      <strong>



        {{ validMonthPunches.length }}



      </strong>



    </div>







    <div>



      <span>



        Montant



      </span>







      <strong>



        {{ formatMoney(monthAmount) }}



      </strong>



    </div>







  </div>







  <RouterLink



    to="/admin/heures" 



    class="pointages-button"



  >



    <span>



      Voir les pointages



    </span>







    <span>



      →



    </span>



  </RouterLink>







</section>







        <!-- CHOIX DU MOIS -->



        <section class="month-section">







          <p class="eyebrow">



            Période



          </p>







          <div class="month-picker">







            <button



              type="button"



              class="month-arrow"



              @click="previousMonth"



            >



              ‹



            </button>







            <div>



              <span>



                Mois affiché



              </span>







              <strong>



                {{ selectedMonthLabel }}



              </strong>



            </div>







            <button



              type="button"



              class="month-arrow"



              @click="nextMonth"



            >



              ›



            </button>







          </div>







        </section>







        <!-- RÉSUMÉ DU MOIS -->



        <section class="month-section">







          <div class="section-heading">



            <p class="eyebrow">



              Vue globale



            </p>







            <h2>



              {{ selectedMonthLabel }}



            </h2>



          </div>







          <div class="month-summary">







            <article class="summary-card">



              <span>



                Vacations



              </span>







              <strong>



                {{ validMonthPunches.length }}



              </strong>



            </article>







            <article class="summary-card">



              <span>



                Montant total



              </span>







              <strong class="money">



                {{ formatMoney(monthAmount) }}



              </strong>



            </article>







          </div>







        </section>







        <!-- RÉPARTITION PAR POSTE -->



        <section class="posts-section">







          <div class="section-heading">



            <p class="eyebrow">



              Répartition



            </p>







            <h2>



              Par poste



            </h2>



          </div>







          <div class="post-list">







            <article



              v-for="post in postSummaries"



              :key="post.id"



              class="post-card"



            >







              <div class="post-left">







                <div



                  class="post-icon"



                  :class="post.service_type"



                >



                  {{



                    post.service_type === 'security'



                      ? '🛡️'



                      : '✨'



                  }}



                </div>







                <div class="post-info">







                  <strong>



                    {{ serviceLabel(post.service_type) }}



                  </strong>







                  <span>



                    {{ post.service_type === 'on_call'
                      ? '40 € / jour • automatique'
                      : post.site_name === 'Port-Saint-Louis'
                        ? 'Port-Saint-Louis • 15 € / heure'
                        : post.site_name }}



                  </span>







                </div>







              </div>







              <div class="post-right">







                <strong>



                  {{ post.vacationCount }}



                  {{ post.service_type === 'on_call' ? 'j.' : 'vac.' }}



                </strong>







                <span>



                  {{ formatMoney(post.amount) }}



                </span>







              </div>







            </article>







          </div>







          <div



            v-if="postSummaries.length === 0"



            class="empty-card"



          >



            Aucun poste disponible.



          </div>







        </section>







      </template>







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







import {



  supabase,



} from '../lib/supabase'







import AdminBottomNav



  from '../components/AdminBottomNav.vue'







/* =========================



   TYPES



========================= */







type ServiceType =



  | 'security'



  | 'cleaning'



  | 'on_call'







type PunchStatus =



  | 'validated'



  | 'contested'







interface Post {



  id: string



  service_type: ServiceType



  site_name: string



}







interface Punch {



  id: string



  employee_id: string



  post_id: string



  work_date: string



  applied_rate: number



  status: PunchStatus



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



   BASE



========================= */







const router = useRouter()







const loading = ref(true)



const errorMessage = ref('')







const firstName = ref('')







const posts = ref<Post[]>([])



const monthPunches = ref<Punch[]>([])



const onCallAssignments = ref<OnCallAssignment[]>([])







/* =========================



   MOIS



========================= */







const now = new Date()







const selectedMonth = ref(



  `${now.getFullYear()}-${String(



    now.getMonth() + 1



  ).padStart(2, '0')}`



)







const selectedMonthLabel =



  computed(() => {



    const [year, month] =



      selectedMonth.value



        .split('-')



        .map(Number)







    const label =



      new Intl.DateTimeFormat(



        'fr-FR',



        {



          month: 'long',



          year: 'numeric',



        }



      ).format(



        new Date(



          year,



          month - 1,



          1



        )



      )







    return (



      label.charAt(0).toUpperCase() +



      label.slice(1)



    )



  })







const monthBounds =



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







    return {



      start:



        `${year}-${String(



          month



        ).padStart(2, '0')}-01`,







      end:



        `${year}-${String(



          month



        ).padStart(



          2,



          '0'



        )}-${String(



          lastDay



        ).padStart(



          2,



          '0'



        )}`,



    }



  })







const previousMonth = () => {



  const [year, month] =



    selectedMonth.value



      .split('-')



      .map(Number)







  const date =



    new Date(



      year,



      month - 2,



      1



    )







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



    new Date(



      year,



      month,



      1



    )







  selectedMonth.value =



    `${date.getFullYear()}-${String(



      date.getMonth() + 1



    ).padStart(2, '0')}`



}







/* =========================



   ADMIN / OWNER



========================= */







const adminInitial =



  computed(() => {



    return (



      firstName.value



        ?.charAt(0)



        .toUpperCase() ||



      'A'



    )



  })







/* =========================



   VACATIONS VALIDES



========================= */







const validMonthPunches =



  computed(() => {



    return monthPunches.value.filter(



      (punch) =>



        punch.status !== 'contested'



    )



  })







/* =========================



   MONTANTS



========================= */







const parisToday = () => {



  return new Intl.DateTimeFormat('en-CA', {



    timeZone: 'Europe/Paris',



    year: 'numeric',



    month: '2-digit',



    day: '2-digit',



  }).format(new Date())



}







const dateToUtc = (date: string) => {



  const [year, month, day] = date.split('-').map(Number)



  return Date.UTC(year, month - 1, day)



}







const inclusiveDays = (start: string, end: string) => {



  return Math.floor((dateToUtc(end) - dateToUtc(start)) / 86400000) + 1



}







const onCallSummary = computed(() => {



  const { start, end } = monthBounds.value



  const today = parisToday()



  const effectiveMonthEnd = today < start ? null : today < end ? today : end



  if (!effectiveMonthEnd) return { days: 0, amount: 0 }



  return onCallAssignments.value.reduce(



    (summary, assignment) => {



      const overlapStart = assignment.started_on > start ? assignment.started_on : start



      const assignmentEnd = assignment.ended_on ?? effectiveMonthEnd



      const overlapEnd = assignmentEnd < effectiveMonthEnd ? assignmentEnd : effectiveMonthEnd



      if (overlapStart > overlapEnd) return summary



      const days = inclusiveDays(overlapStart, overlapEnd)



      summary.days += days



      summary.amount += days * Number(assignment.daily_rate)



      return summary



    },



    { days: 0, amount: 0 }



  )



})







const punchesAmount = computed(() => {



  return validMonthPunches.value.reduce(



    (total, punch) => total + Number(punch.applied_rate),



    0



  )



})







const monthAmount = computed(() => {



  return punchesAmount.value + onCallSummary.value.amount



})







/* =========================
   RÉPARTITION PAR POSTE
========================= */


const postSummaries = computed(() => {

  return posts.value.map((post) => {


    if (post.service_type === 'on_call') {


      return { ...post, vacationCount: onCallSummary.value.days, amount: onCallSummary.value.amount }

    }



    const postPunches = validMonthPunches.value.filter((punch) => punch.post_id === post.id)



    const amount = postPunches.reduce((total, punch) => total + Number(punch.applied_rate), 0)



    return { ...post, vacationCount: postPunches.length, amount }



  })



})







/* =========================



   FORMATAGE



========================= */







const serviceLabel = (service: ServiceType) => {



  if (service === 'security') return 'Sécurité'



  if (service === 'cleaning') return 'Ménage'



  if (service === 'on_call') return 'Astreinte'



  return service



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



    Number(value ?? 0)



  )



}







/* =========================



   CHARGEMENT DES DONNÉES



========================= */







const loadData = async () => {



  loading.value = true



  errorMessage.value = ''







  const {



    start,



    end,



  } = monthBounds.value







  try {



    const [



      postsResult,



      punchesResult,



      onCallResult,



    ] =



      await Promise.all([



        supabase



          .from('posts')



          .select(`



            id,



            service_type,



            site_name



          `)



          .eq(



            'active',



            true



          )



          .order(



            'site_name'



          ),







        supabase



          .from('punches')



          .select(`



            id,



            employee_id,



            post_id,



            work_date,



            applied_rate,



            status



          `)



          .gte(



            'work_date',



            start



          )



          .lte(



            'work_date',



            end



          ),



        supabase



          .from('on_call_assignments')



          .select(`



            id,



            employee_id,



            post_id,



            daily_rate,



            started_on,



            ended_on



          `)



          .lte('started_on', end)



          .or(`ended_on.is.null,ended_on.gte.${start}`),



      ])







    if (postsResult.error) {



      console.error(



        'Erreur postes :',



        postsResult.error



      )







      errorMessage.value =



        'Impossible de charger les postes.'







      return



    }







    if (punchesResult.error) {



      console.error(



        'Erreur pointages :',



        punchesResult.error



      )







      errorMessage.value =



        'Impossible de charger les pointages.'







      return



    }







    if (onCallResult.error) {



      console.error('Erreur astreintes :', onCallResult.error)



      errorMessage.value = 'Impossible de charger les astreintes.'



      return



    }







    posts.value = (postsResult.data ?? []) as Post[]







    monthPunches.value = (punchesResult.data ?? []).map(



  (punch: any) => ({



    ...punch,



    applied_rate: Number(punch.applied_rate ?? 0),



    status:



      punch.status === 'contested'



        ? 'contested'



        : 'validated',



  })



) as Punch[]







    onCallAssignments.value = (onCallResult.data ?? []).map(



      (assignment: any) => ({



        ...assignment,



        daily_rate: Number(assignment.daily_rate ?? 0),



      })



    ) as OnCallAssignment[]



  } catch (error) {



    console.error(



      'Erreur chargement dashboard :',



      error



    )







    errorMessage.value =



      'Une erreur est survenue pendant le chargement.'



  } finally {



    loading.value = false



  }



}







/* =========================



   CHANGEMENT DE MOIS



========================= */







watch(



  selectedMonth,



  async () => {



    await loadData()



  }



)







/* =========================



   DÉMARRAGE



========================= */







onMounted(async () => {



  loading.value = true



  errorMessage.value = ''







  try {



    const {



      data: {



        user,



      },



      error: userError,



    } =



      await supabase.auth



        .getUser()







    if (



      userError ||



      !user



    ) {



      await router.push('/')



      return



    }







    const {



      data: adminProfile,



      error: adminError,



    } =



      await supabase



        .from('profiles')



        .select(`



          first_name,



          role



        `)



        .eq(



          'id',



          user.id



        )



        .single()







    if (



      adminError ||



      !adminProfile



    ) {



      console.error(



        'Erreur profil :',



        adminError



      )







      await supabase.auth



        .signOut()







      await router.push('/')







      return



    }







    const hasAdminAccess =



      adminProfile.role === 'admin' ||



      adminProfile.role === 'owner'







    if (!hasAdminAccess) {



      await router.push('/home')



      return



    }







    firstName.value =



      adminProfile.first_name ??



      ''







    await loadData()



  } catch (error) {



    console.error(



      'Erreur initialisation admin :',



      error



    )







    errorMessage.value =



      'Impossible de charger le tableau de bord.'







    loading.value = false



  }



})



</script>







<style scoped>



* {



  box-sizing:



    border-box;



}







/* PAGE */







.admin-page {



  min-height:



    100vh;







  padding:



    28px



    18px



    120px;







  background:



    #f7f1ec;







  color:



    #17372f;



}







.page-shell {



  width:



    100%;







  max-width:



    540px;







  margin:



    0 auto;



}







/* HEADER */







.topbar {



  display:



    flex;







  justify-content:



    space-between;







  align-items:



    flex-start;







  gap:



    15px;







  margin-bottom:



    22px;



}







.eyebrow {



  margin:



    0



    0



    5px;







  color:



    #9b8174;







  font-size:



    10px;







  font-weight:



    700;







  letter-spacing:



    1.2px;







  text-transform:



    uppercase;



}







.eyebrow.light {



  color:



    #d9c6bc;



}







h1,



h2,



p {



  margin-top:



    0;



}







h1 {



  margin-bottom:



    0;







  color:



    #17372f;







  font-family:



    Georgia,



    'Times New Roman',



    serif;







  font-size:



    28px;







  font-weight:



    400;



}







.subtitle {



  max-width:



    300px;







  margin:



    6px



    0



    0;







  color:



    #7d7874;







  font-size:



    12px;







  line-height:



    1.4;



}







/* PROFIL */







.profile-button {



  flex-shrink:



    0;







  display:



    flex;







  align-items:



    center;







  gap:



    7px;







  padding:



    6px



    10px



    6px



    6px;







  border-radius:



    999px;







  background:



    #17372f;







  color:



    white;







  font-size:



    11px;







  font-weight:



    700;







  text-decoration:



    none;



}







.profile-icon {



  width:



    30px;







  height:



    30px;







  display:



    grid;







  place-items:



    center;







  border-radius:



    50%;







  background:



    #f1e3dc;







  color:



    #17372f;







  font-weight:



    800;



}







/* ÉTATS */







.state-card {



  padding:



    20px;







  border:



    1px solid



    #ebe4df;







  border-radius:



    20px;







  background:



    white;







  color:



    #7d7874;







  font-size:



    12px;



}







.state-card.error {



  background:



    #f9e7e3;







  color:



    #a84f40;



}







/* AUJOURD'HUI */







.today-card {



  margin-bottom:



    22px;







  padding:



    19px;







  border-radius:



    24px;







  background:



    #17372f;







  color:



    white;



}







.today-header {



  display:



    flex;







  justify-content:



    space-between;







  align-items:



    flex-start;







  gap:



    15px;







  margin-bottom:



    15px;



}







.today-card h2 {



  margin:



    0;







  color:



    white;







  font-family:



    Georgia,



    'Times New Roman',



    serif;







  font-size:



    20px;







  font-weight:



    400;



}







.today-badge {



  padding:



    6px



    9px;







  border-radius:



    999px;







  background:



    rgba(



      255,



      255,



      255,



      0.12



    );







  font-size:



    10px;



}







.today-summary {



  display:



    grid;







  grid-template-columns:



    repeat(2, 1fr);







  gap:



    9px;



}







.today-summary div {



  padding:



    14px;







  border-radius:



    15px;







  background:



    white;







  color:



    #17372f;



}







.today-summary span {



  display:



    block;







  margin-bottom:



    5px;







  color:



    #8c7b72;







  font-size:



    9px;



}







.today-summary strong {



  font-size:



    18px;



}







.pointages-button {



  display:



    flex;







  align-items:



    center;







  justify-content:



    space-between;







  margin-top:



    12px;







  padding:



    12px



    14px;







  border-radius:



    14px;







  background:



    #c66b50;







  color:



    white;







  font-size:



    11px;







  font-weight:



    700;







  text-decoration:



    none;



}







/* PÉRIODE */







.month-section {



  margin-bottom:



    23px;



}







.month-picker {



  display:



    grid;







  grid-template-columns:



    44px



    1fr



    44px;







  align-items:



    center;







  gap:



    10px;







  padding:



    10px;







  border:



    1px solid



    #e8ddd6;







  border-radius:



    20px;







  background:



    white;



}







.month-picker > div {



  display:



    flex;







  flex-direction:



    column;







  align-items:



    center;







  gap:



    2px;



}







.month-picker span {



  color:



    #8c8580;







  font-size:



    9px;



}







.month-picker strong {



  color:



    #17372f;







  font-size:



    14px;







  text-transform:



    capitalize;



}







.month-arrow {



  width:



    44px;







  height:



    44px;







  border:



    0;







  border-radius:



    14px;







  background:



    #f1e3dc;







  color:



    #17372f;







  font-size:



    26px;







  cursor:



    pointer;



}







/* TITRES */







.section-heading {



  margin-bottom:



    12px;



}







.section-heading h2 {



  margin:



    0;







  color:



    #17372f;







  font-size:



    20px;



}







/* RÉSUMÉ MOIS */







.month-summary {



  display:



    grid;







  grid-template-columns:



    repeat(2, 1fr);







  gap:



    10px;



}







.summary-card {



  padding:



    18px;







  border:



    1px solid



    #ebe4df;







  border-radius:



    20px;







  background:



    white;



}







.summary-card span {



  display:



    block;







  margin-bottom:



    6px;







  color:



    #8c8580;







  font-size:



    9px;



}







.summary-card strong {



  color:



    #17372f;







  font-size:



    21px;



}







.summary-card .money {



  color:



    #c66b50;



}







/* POSTES */







.posts-section {



  margin-bottom:



    25px;



}







.post-list {



  display:



    grid;







  gap:



    9px;



}







.post-card {



  display:



    flex;







  align-items:



    center;







  justify-content:



    space-between;







  gap:



    12px;







  padding:



    14px;







  border:



    1px solid



    #ebe4df;







  border-radius:



    18px;







  background:



    white;



}







.post-left {



  min-width:



    0;







  display:



    flex;







  align-items:



    center;







  gap:



    11px;



}







.post-icon {



  width:



    40px;







  height:



    40px;







  flex-shrink:



    0;







  display:



    grid;







  place-items:



    center;







  border-radius:



    12px;







  background:



    #f1e3dc;







  font-size:



    16px;



}







.post-icon.cleaning {



  background:



    #e8efe9;



}







.post-info {



  min-width:



    0;







  display:



    flex;







  flex-direction:



    column;







  gap:



    3px;



}







.post-info strong {



  color:



    #17372f;







  font-size:



    12px;



}







.post-info span {



  color:



    #8c8580;







  font-size:



    9px;



}







.post-right {



  flex-shrink:



    0;







  display:



    flex;







  flex-direction:



    column;







  align-items:



    flex-end;







  gap:



    3px;



}







.post-right strong {



  color:



    #17372f;







  font-size:



    11px;



}







.post-right span {



  color:



    #c66b50;







  font-size:



    11px;







  font-weight:



    700;



}







/* VIDE */







.empty-card {



  padding:



    18px;







  border:



    1px solid



    #ebe4df;







  border-radius:



    18px;







  background:



    white;







  color:



    #8c8580;







  font-size:



    11px;







  text-align:



    center;



}







/* MOBILE */







@media (



  max-width: 400px



) {







  .admin-page {



    padding-left:



      14px;







    padding-right:



      14px;



  }







  h1 {



    font-size:



      24px;



  }







  .profile-button > span:last-child {



    display:



      none;



  }







  .profile-button {



    padding:



      5px;



  }







  .month-summary {



    grid-template-columns:



      repeat(2, 1fr);



  }



}



</style>