<template>
  <div class="tempo-decoration" aria-hidden="true">
    <svg
      viewBox="0 0 430 820"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <!-- grand arc gauche -->
      <path
        d="M-130 110
           A270 270 0 0 1 10 560"
        fill="none"
        stroke="#c8795c"
        stroke-width="1.7"
      />

      <!-- masse beige gauche -->
      <path
        d="
          M0 255
          Q65 300 70 430
          Q70 540 0 585
          Z
        "
        fill="#ede3db"
      />

      <!-- arcs haut droite -->
      <path
        d="M235 -60
           A250 250 0 0 1 500 195"
        fill="none"
        stroke="#c8795c"
        stroke-width="1.7"
      />

      <path
        d="M295 -50
           A205 205 0 0 1 470 145"
        fill="none"
        stroke="#17372f"
        stroke-width="1.7"
      />

      <!-- cercle vert haut droite -->
      <circle
        cx="435"
        cy="128"
        r="44"
        fill="#17372f"
        opacity="0.9"
      />

      <!-- repères haut -->
      <line
        x1="286"
        y1="68"
        x2="303"
        y2="58"
        stroke="#c8795c"
        stroke-width="3"
        stroke-linecap="round"
      />

      <line
        x1="365"
        y1="95"
        x2="355"
        y2="116"
        stroke="#17372f"
        stroke-width="3"
        stroke-linecap="round"
      />

      <!-- masse verte bas gauche -->
      <path
        d="
          M0 820
          L0 585
          Q100 625 165 705
          Q210 760 230 820
          Z
        "
        fill="#17372f"
      />

      <!-- ligne fine parallèle -->
      <path
        d="M-15 565
           A320 320 0 0 1 220 820"
        fill="none"
        stroke="#17372f"
        stroke-width="1.5"
      />

      <!-- grand arc bas -->
      <path
        d="M30 820
           A330 330 0 0 1 425 640"
        fill="none"
        stroke="#c8795c"
        stroke-width="1.5"
      />

      <!-- masse beige bas droite -->
      <path
        d="
          M430 820
          L430 665
          Q370 695 330 740
          Q300 775 278 820
          Z
        "
        fill="#eaded5"
      />

      <!-- repères abstraits bas -->
      <line
        x1="230"
        y1="675"
        x2="230"
        y2="705"
        stroke="#17372f"
        stroke-width="3"
        stroke-linecap="round"
      />

      <line
        x1="175"
        y1="735"
        x2="197"
        y2="735"
        stroke="#17372f"
        stroke-width="3"
        stroke-linecap="round"
      />

      <line
        x1="230"
        y1="775"
        x2="230"
        y2="800"
        stroke="#c8795c"
        stroke-width="3"
        stroke-linecap="round"
      />

      <circle
        cx="330"
        cy="650"
        r="8"
        fill="#c8795c"
      />
    </svg>
  </div>
</template>

<style scoped>
.tempo-decoration {
  position: absolute;
  inset: 0;

  width: 100%;
  height: 100%;

  pointer-events: none;
  overflow: hidden;

  z-index: 0;
}

.tempo-decoration svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>