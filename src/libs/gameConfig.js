export const FICHA_STATUS = Object.freeze({
  ORDER_ERROR: -2,
  ERROR: -1,
  ESCONDIDA: 0,
  MOSTRADA: 1,
  ADIVINADA: 2
})

export const GAME_STATUS = Object.freeze({
  NOT_STARTED: 0,
  STARTED: 1,
  WON: 2,
  GIVEN_UP: 3
})

export const TIMER_INFO_STATUS = Object.freeze({
  POSITIVE: 0,
  NEGATIVE: 1,
  NEUTRAL: 2
})

export const TIMINGS = Object.freeze({
  BEFORE_HIDING_FICHA: 0.95 * 1000,
  EXTRA_TIME: 0.3 * 1000,
  FICHA_FLIP: 0.5 * 1000,
  HINT_COOLDOWN: 2 * 1000,
  HINT_DURATION: 1.6 * 1000,
  BETWEEN_ANIMATED_DOTS: 0.6 * 1000,
  SHINE_DURATION: 4 * 1000,
  BETWEEN_FICHA_SHINE: 0.8 * 1000,
  get SHINE_CYCLE() {
    return this.SHINE_DURATION + this.BETWEEN_FICHA_SHINE
  },
  BETWEEN_WIN_CONFETTI: 0.5 * 1000,
  GAME_MODE_CHANGE: 0.2 * 1000,
  ROGUE_INITIAL_SECS: 2 * 60,
  TIMER_INFO_ANIMATION: 1.8  * 1000
})

export const GAME_MODES = Object.freeze({
  CLASSIC: 0,
  ROGUE: 1,
  SEQUENCE: 2,
})

export const GAME_MODES_DESCRIPTIONS = Object.freeze([
  // classic
  "Memotest sin nada nuevo: Encontrá los pares de fichas que coincidan en ícono y color. Podés usar pistas.",
  // rogue
  "El tiempo va en tu contra! Completá tantos tableros como puedas.\nCada vez será más difícil, así que aprobechá los beneficios que te ofrezca el tablero.",
  // sequence
  "Encontrá secuencias de fichas: Ya no solo importa que coincidan, sino también el orden en el que las das vuelta. Podés usar pistas.",
  // extras | error
  "Parece que se ha producido un error al determinar el modo de juego :(",
  // extras | beta
  "Esto es una beta. Próximamente habrá nuevos modos, desafíos diarios y leaderbaord de jugadores",
])

export const GAME_RULES = Object.freeze({
  DEFAULT_TABLERO_SIZE: 1,
  MIN_TOTAL_PAIRS: 4,
  MAX_TOTAL_PAIRS: 50,
  EXCLUDED_Q_PAIRS: [34, 38, 46],
  CLASSIC_FPG: 2,
  ROGUE_BASE_GROUPS: 4,
  ROGUE_GROUPS_INCREMENT: 4,
  ROGUE_TIME_INCREMENT: 20,
  ROGUE_INITIAL_HINTS: 3
})

export const TABLERO_TYPES = Object.freeze([
  [ // classic
    { name: "Chico", groups: 6, fichasPerGroup: GAME_RULES.CLASSIC_FPG },
    { name: "Mediano", groups: 14, fichasPerGroup: GAME_RULES.CLASSIC_FPG },
    { name: "Grande", groups: 24, fichasPerGroup: GAME_RULES.CLASSIC_FPG },
  ],
  [ // rogue

  ],
  [ // sequence
    { name: "Chico", groups: 6, fichasPerGroup: GAME_RULES.CLASSIC_FPG },
    { name: "Mediano", groups: 10, fichasPerGroup: GAME_RULES.CLASSIC_FPG },
    { name: "Grande", groups: 12, fichasPerGroup: 3 },
  ]
])
