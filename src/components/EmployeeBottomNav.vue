<template>
  <nav class="bottom-nav">
    <RouterLink to="/home" class="nav-item">
      <svg class="nav-icon" viewBox="0 0 24 24">
        <path d="M3 11.5L12 4l9 7.5" />
        <path d="M5 10.5V20h14v-9.5" />
      </svg>

      <small>Accueil</small>
    </RouterLink>

    <RouterLink to="/hours" class="nav-item">
      <svg class="nav-icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3 2" />
      </svg>

      <small>Heures</small>
    </RouterLink>

    <RouterLink to="/month" class="nav-item">
      <svg class="nav-icon" viewBox="0 0 24 24">
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 9h16" />
      </svg>

      <small>Mois</small>
    </RouterLink>

    <RouterLink to="/profile" class="nav-item">
      <svg class="nav-icon" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c.5-4 3-6 7-6s6.5 2 7 6" />
      </svg>

      <small>Profil</small>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;

  left: 50%;
  bottom: 16px;

  z-index: 50;

  width: calc(100% - 30px);
  max-width: 460px;

  transform: translateX(-50%);

  display: grid;
  grid-template-columns: repeat(4, 1fr);

  padding: 8px;

  border: 1px solid #ebe4df;
  border-radius: 22px;

  background: rgba(255, 255, 255, 0.96);

  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.nav-item {
  min-height: 54px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 3px;

  padding: 5px 2px;

  border-radius: 15px;

  background: transparent;

  color: #8b8581;

  text-decoration: none;
}

.nav-icon {
  width: 19px;
  height: 19px;

  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;

  stroke-linecap: round;
  stroke-linejoin: round;
}

.nav-item small {
  font-size: 10px;

  white-space: nowrap;
}

.nav-item.router-link-exact-active {
  background: #f2e9e3;

  color: #17372f;
}
</style>