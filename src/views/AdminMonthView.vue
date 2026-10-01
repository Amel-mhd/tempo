<template>
  <main class="maintenance-page">
    <section class="maintenance-card">

      <div class="maintenance-icon">
        🛠️
      </div>

      <p class="eyebrow">
        Calendrier
      </p>

      <h1>En maintenance</h1>

      <p class="description">
        Le calendrier est actuellement en cours
        de mise à jour.
      </p>

      <p class="small-text">
        Cette fonctionnalité sera bientôt disponible.
      </p>

    </section>

    <AdminBottomNav />
  </main>
</template>

<script setup lang="ts">
import AdminBottomNav from '../components/AdminBottomNav.vue'
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.maintenance-page {
  min-height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;

  padding:
    30px
    20px
    115px;

  background: #f7f1ec;

  color: #17372f;
}

.maintenance-card {
  width: 100%;
  max-width: 420px;

  padding: 40px 25px;

  border: 1px solid #eadfd8;
  border-radius: 26px;

  background: #fff;

  text-align: center;
}

.maintenance-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 72px;
  height: 72px;

  margin:
    0
    auto
    22px;

  border-radius: 22px;

  background: #f1e3dc;

  font-size: 32px;
}

.eyebrow {
  margin:
    0
    0
    7px;

  color: #b46c55;

  font-size: 9px;
  font-weight: 800;

  letter-spacing: 1.4px;

  text-transform: uppercase;
}

h1 {
  margin:
    0
    0
    12px;

  font-family:
    Georgia,
    'Times New Roman',
    serif;

  font-size: 30px;
  font-weight: 400;
}

.description {
  margin:
    0
    auto;

  max-width: 280px;

  color: #756f6b;

  font-size: 12px;
  line-height: 1.6;
}

.small-text {
  margin:
    18px
    0
    0;

  color: #aaa19b;

  font-size: 9px;
}
</style>