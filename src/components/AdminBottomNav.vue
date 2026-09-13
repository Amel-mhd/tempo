<template>
  <nav class="admin-bottom-nav">
    <RouterLink to="/admin" class="admin-nav-item">
      <svg class="admin-nav-icon" viewBox="0 0 24 24">
        <path d="M3 11.5L12 4l9 7.5" />
        <path d="M5 10.5V20h14v-9.5" />
      </svg>
      <span>Accueil</span>
    </RouterLink>

    <RouterLink to="/admin/heures" class="admin-nav-item">
      <svg class="admin-nav-icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3 2" />
      </svg>
      <span>Heures</span>
    </RouterLink>

    <RouterLink to="/admin/equipe" class="admin-nav-item">
      <svg class="admin-nav-icon" viewBox="0 0 24 24">
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3.5 19c.4-3.2 2.5-5 5.5-5s5.1 1.8 5.5 5" />
        <path d="M14 15c1-.8 2-1.1 3.2-1.1 2.2 0 3.8 1.4 4.1 4" />
      </svg>
      <span>Équipe</span>
    </RouterLink>

    <RouterLink to="/admin/profile" class="admin-nav-item">
      <svg class="admin-nav-icon" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c.5-4 3-6 7-6s6.5 2 7 6" />
      </svg>
      <span>Profil</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.admin-bottom-nav {
  position: fixed;
  left: 50%;
  bottom: 16px;
  z-index: 100;

  width: calc(100% - 30px);
  max-width: 520px;

  transform: translateX(-50%);

  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: stretch;

  padding: 8px;

  box-sizing: border-box;

  border: 1px solid #ebe4df;
  border-radius: 22px;

  background: rgba(255, 255, 255, 0.97);

  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.admin-nav-item {
  width: auto !important;
  min-width: 0 !important;
  max-width: none !important;

  flex: 1 1 0 !important;

  display: flex !important;
  flex-direction: column !important;

  align-items: center;
  justify-content: center;

  gap: 4px;

  min-height: 54px;

  margin: 0 !important;
  padding: 5px 0 !important;

  box-sizing: border-box;

  border-radius: 15px;

  color: #8b8581;

  text-decoration: none;
}

.admin-nav-icon {
  width: 19px;
  height: 19px;

  flex-shrink: 0;

  fill: none;
  stroke: currentColor;

  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.admin-nav-item span {
  display: block;

  margin: 0;
  padding: 0;

  font-size: 10px;
  line-height: 1;

  white-space: nowrap;
}

.admin-nav-item.router-link-exact-active {
  background: #f2e9e3;
  color: #17372f;
}
</style>