import { useEffect, useState, useRef } from 'react'
import Tablero from './Tablero'
import Opciones from './Opciones'
import Stats from './Stats'
import { defineColumns, inicializarFichas, getGroupsNFichasPerG } from '../libs/myFunctions'
import { fireWin } from '../libs/confetti'

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

export const TIMINGS = Object.freeze({
  BEFORE_HIDING_FICHA: 0.95 * 1000,
  EXTRA_TIME: 0.3 * 1000,
  FICHA_FLIP: 0.5 * 1000,
  HINT_COOLDOWN: 2 * 1000,
  HINT_DURATION: 1.6 * 1000,
  BETWEEN_ANIMATED_DOTS: 0.6 * 1000,
  SHINE_DURATION: 4 * 1000,
  BETWEEN_FICHA_SHINE: 0.8 * 1000,
  SHINE_CYCLE: 4.6 * 1000,  // suma de los 2 anteriores
  BETWEEN_WIN_CONFETTI: 0.5 * 1000,
  GAME_MODE_CHANGE: 0.2 * 1000,
  ROGUE_INITIAL_SECS: 2 * 60
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
      { name: "Chico", groups: 6, fichasPerGroup: 2 }, 
      { name: "Mediano", groups: 14, fichasPerGroup: 2 }, 
      { name: "Grande", groups: 24, fichasPerGroup: 2 },
    ],
    [ // rogue

    ],
    [ // sequence
    { name: "Chico", groups: 6, fichasPerGroup: 2 }, 
    { name: "Mediano", groups: 10, fichasPerGroup: 2 }, 
    { name: "Grande", groups: 12, fichasPerGroup: 3 }, 
    ]
])

function Juego() {
// #region states
  const [isFirstRender, setIsFirstRender] = useState(true)
  const [gameMode, setGameMode] = useState(() => {
    const saved = localStorage.getItem('gameMode')
    return saved !== null ? Number(saved) : GAME_MODES.CLASSIC
  })
  const [selectedSize, setSelectedSize] = useState(() => {
    const saved = localStorage.getItem('selectedSize')
    return saved !== null ? Number(saved) : GAME_RULES.DEFAULT_TABLERO_SIZE
  })

  const { groups: newGroups, fichasPerGroup: newFichasPerGroup } = getGroupsNFichasPerG(gameMode, selectedSize)
  const [totalGroups, setTotalGroups] = useState(newGroups)
  const prevValuePairs = useRef(newGroups)
  const [fichasPerGroup, setFichasPerGroup] = useState(newFichasPerGroup)
  const prevFichasPerGroup = useRef(newFichasPerGroup)

  const [fichas, setFichas] = useState([])
  const [columns, setColumns] = useState(0)
  const [isBoardLocked, setIsBoardLocked] = useState(false)
  const [clicks, setClicks] = useState(0)
  const [errors, setErrors] = useState(0)
  const [qGuessedPairs, setQGuessedPairs] = useState(0)

  const [hintActive, setHintActive] = useState(false)
  const wasHintActive = useRef(false)
  const [usedHints, setUsedHints] = useState(0)
  const [shouldFichasAnimate, setShouldFichasAnimate] = useState(true)

  const [shapesNColors, setShapesNColors] = useState([])
  const timeoutFlipAllFichas = useRef(null)
  const resetTriggeredByModeChange = useRef(false)
  const resetTriggeredByFloor = useRef(false)
  const abiertasRef = useRef([])
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.NOT_STARTED)
  const gameStatusRef = useRef(gameStatus)
  const [rogueFloor, setRogueFloor] = useState(1)
  const [timer, setTimer] = useState(gameMode === GAME_MODES.ROGUE ? TIMINGS.ROGUE_INITIAL_SECS : 0)
  const [remainingHints, setRemainingHints] = useState(GAME_RULES.ROGUE_INITIAL_HINTS)
  const timeoutAdvanceFloor = useRef(null)
  // #endregion states

  useEffect(() => {
    reset({ wAnimation: false })
    if(selectedSize >= TABLERO_TYPES[gameMode].length) {
      localStorage.setItem('selectedSize', GAME_RULES.DEFAULT_TABLERO_SIZE)
    } else localStorage.setItem('selectedSize', selectedSize)
  }, [selectedSize])

  useEffect(() => {
    localStorage.setItem('gameMode', gameMode)
    if(gameMode === GAME_MODES.CLASSIC){
      document.documentElement.classList.add('classic-mode')
      document.documentElement.classList.remove('sequence-mode')
      document.documentElement.classList.remove('rogue-mode')
    } else if(gameMode === GAME_MODES.SEQUENCE){
      document.documentElement.classList.add('sequence-mode')
      document.documentElement.classList.remove('classic-mode')
      document.documentElement.classList.remove('rogue-mode')
    } else if(gameMode === GAME_MODES.ROGUE){
      document.documentElement.classList.add('rogue-mode')
      document.documentElement.classList.remove('classic-mode')
      document.documentElement.classList.remove('sequence-mode')

      setTotalGroups(GAME_RULES.ROGUE_BASE_GROUPS)
      prevValuePairs.current = GAME_RULES.ROGUE_BASE_GROUPS
      setFichasPerGroup(GAME_RULES.CLASSIC_FPG)
      prevFichasPerGroup.current = GAME_RULES.CLASSIC_FPG
    }
    if(isFirstRender) {
      setIsFirstRender(false)
      return
    }
    if(gameMode !== GAME_MODES.ROGUE){
      let nextSize = selectedSize
      if(selectedSize >= TABLERO_TYPES[gameMode].length) {
        nextSize = GAME_RULES.DEFAULT_TABLERO_SIZE
        setSelectedSize(GAME_RULES.DEFAULT_TABLERO_SIZE)
      }
  
      const { groups: newTotal, fichasPerGroup: newFichasPerGroup} = getGroupsNFichasPerG(gameMode, nextSize)
      prevValuePairs.current = newTotal
      resetTriggeredByModeChange.current = true
      setTotalGroups(newTotal)
      setFichasPerGroup(newFichasPerGroup)
      if(newTotal * newFichasPerGroup === totalGroups * prevFichasPerGroup.current) reset()
      else if(newTotal === totalGroups ) reset({ wAnimation: false })
      prevFichasPerGroup.current = newFichasPerGroup
    } else {
      resetTriggeredByModeChange.current = true
      reset({ wAnimation: evalResetAnimationByBtn(prevValuePairs, fichasPerGroup, GAME_RULES.ROGUE_BASE_GROUPS, GAME_RULES.CLASSIC_FPG) })
    }
  }, [gameMode])

  useEffect(() => {
    if(resetTriggeredByModeChange.current) {
      resetTriggeredByModeChange.current = false
      reset({ wAnimation: false })
      return
    }
    else if(resetTriggeredByFloor.current){
      resetTriggeredByFloor.current = false
      if(rogueFloor === 1) reset({ wAnimation: false, onlyFloor: false })
      else reset({ wAnimation: false, onlyFloor: true })
      return
    }
    if(gameMode !== GAME_MODES.ROGUE) reset({ wAnimation: false })
  }, [totalGroups])

  useEffect(() => {
    if(fichas.length > 0 && gameStatus !== GAME_STATUS.GIVEN_UP) {
      const qGuessedPairs = fichas.filter(ficha => ficha.status === FICHA_STATUS.ADIVINADA).length / fichasPerGroup
      setQGuessedPairs(qGuessedPairs)
    }
  }, [fichas])

  useEffect(() => {
    if(qGuessedPairs === totalGroups) setGameStatus(GAME_STATUS.WON)
  }, [qGuessedPairs])

  useEffect(() => {
    gameStatusRef.current = gameStatus
    wasHintActive.current = false
    let secondsInterval
    if(gameStatus === GAME_STATUS.STARTED){
      setShouldFichasAnimate(true)
      // setTimer(gameMode === GAME_MODES.ROGUE ? TIMINGS.ROGUE_INITIAL_SECS : 0)
      secondsInterval = setInterval(() => {
        setTimer(prev => gameMode === GAME_MODES.ROGUE ? Math.max(0, prev - 1) : Math.max(0, prev + 1))
      }, 1000)
    }
    else if(gameStatus === GAME_STATUS.GIVEN_UP){
      setIsBoardLocked(true)
      let next = [...fichas]
      next.forEach(f => {
        f.status = FICHA_STATUS.ADIVINADA
        f.beingHinted = false
      })
      setFichas(next)
      setHintActive(false)
    }
    else if(gameStatus === GAME_STATUS.WON){
      if(gameMode === GAME_MODES.ROGUE) {
        advanceRogueFloor()
      } else {
        fireWin()
      }
    }
    return () => clearInterval(secondsInterval)
  }, [gameStatus])

  useEffect(() => {
    if(gameMode === GAME_MODES.ROGUE){
      const nextGroups = calculateNextFloorSize(rogueFloor)
      resetTriggeredByFloor.current = true
      prevValuePairs.current = nextGroups
      setTotalGroups(nextGroups)
    }
  }, [rogueFloor])

  const evalResetAnimationByBtn = (prevGroups, prevFichasPerG, nextGroups, nextFichasPerG) => {
    if(gameMode !== GAME_MODES.ROGUE) return true
    let willAnimate = false
    if(prevGroups * prevFichasPerG === nextGroups * nextFichasPerG) willAnimate = true
    return willAnimate
  }

  const advanceRogueFloor = () => {
    clearTimeout(timeoutAdvanceFloor.current)
    fireWin(1)
    timeoutAdvanceFloor.current = setTimeout(() => {
      setRogueFloor(prev => prev + 1)
    }, TIMINGS.FICHA_FLIP)
  }

  const calculateNextFloorSize = (floor) => {
    return Math.min(GAME_RULES.ROGUE_BASE_GROUPS + (floor - 1) * GAME_RULES.ROGUE_GROUPS_INCREMENT, GAME_RULES.MAX_TOTAL_PAIRS)
  }

  useEffect(() => {
    if(clicks % fichasPerGroup !== 0) return
    if(fichas.length === 0) return
    if(gameStatus === GAME_STATUS.GIVEN_UP) return
    const qGuessedPairs = fichas.filter(ficha => ficha.status === FICHA_STATUS.ADIVINADA).length / fichasPerGroup
    const attempts = clicks / fichasPerGroup
    setErrors(Math.max(0, attempts - qGuessedPairs))
  }, [clicks, fichas])

  const sumarClick = () => {
    setClicks(prev => {
      if(prev === 0 && gameStatus === GAME_STATUS.NOT_STARTED) setGameStatus(GAME_STATUS.STARTED)
      return prev + 1
    })
  }

  const reset = ({ wAnimation, onlyFloor } = { wAnimation: true, onlyFloor: false }) => {
    if(onlyFloor) wAnimation = false
    clearTimeout(timeoutAdvanceFloor.current)
    clearTimeout(timeoutFlipAllFichas.current)
    setIsBoardLocked(true)
    abiertasRef.current = []

    let nextFichasPerGroup = fichasPerGroup
    if(!onlyFloor){
      setTimer(gameMode === GAME_MODES.ROGUE ? TIMINGS.ROGUE_INITIAL_SECS : 0)
      setRemainingHints(GAME_RULES.ROGUE_INITIAL_HINTS)
      setUsedHints(0)
      setErrors(0)
      setGameStatus(GAME_STATUS.NOT_STARTED)
      wasHintActive.current = false
      if(selectedSize >= TABLERO_TYPES[gameMode].length) {
        nextFichasPerGroup = GAME_RULES.CLASSIC_FPG
      } else nextFichasPerGroup = getGroupsNFichasPerG(gameMode, selectedSize).fichasPerGroup
    } else {
      setGameStatus(GAME_STATUS.STARTED)
      setTimer(prev => prev + GAME_RULES.ROGUE_TIME_INCREMENT)
    }
    
    let next = [...fichas]
    next.forEach(f => f.status = FICHA_STATUS.ESCONDIDA)
    setFichas(next)
    setShapesNColors(prev => prev.length > 0 ? [] : prev)
    setClicks(0)
    setColumns(defineColumns(totalGroups, nextFichasPerGroup))
    setQGuessedPairs(0)
    setHintActive(false)

    const fichasInit = () => {
      setFichas(inicializarFichas(totalGroups, nextFichasPerGroup, gameMode, /* false */))
      setIsBoardLocked(false)
    }

    if(!wAnimation) {
      setShouldFichasAnimate(false)
      fichasInit()
    } else {
      setShouldFichasAnimate(true)
      timeoutFlipAllFichas.current = setTimeout(fichasInit, TIMINGS.FICHA_FLIP)
    }
  }
  // que cuando se resetee por cambio de totalParis
  // no se animen las fichas
  // sí se deberian animar cuando:
  // la primera vez que se toca, durante el juego, cuando se resetea desde el btn

  const hint = () => {
    if(!fichas || fichas.length === 0) return
    const candidatas = fichas.filter(ficha => ficha.status !== FICHA_STATUS.ADIVINADA)
    if(candidatas.length === 0) return
    if(remainingHints <= 0) return

    if(gameMode === GAME_MODES.ROGUE) setRemainingHints(prev => prev -1)
    setUsedHints(prev => prev + 1)
    setHintActive(true)

    const elegida = candidatas[Math.floor(Math.random() * candidatas.length)]
    const groupIdElegido = elegida.groupId
    
    let next = [...fichas]
    const elegidas = next.filter(f => f.groupId === groupIdElegido)
    elegidas.forEach(f => f.beingHinted = true)
    setFichas(next)
  }

  useEffect(() => {
    if(!hintActive) return
    wasHintActive.current = true

    const updateHintActiveTimer = setTimeout(() => { 
      setHintActive(false) 
    }, TIMINGS.HINT_COOLDOWN)

    const removeClassTimer = setTimeout(() => {
      let next = [...fichas]
      next.forEach(f => f.beingHinted = false)
      setFichas(next)
    }, TIMINGS.HINT_DURATION)

    return () => {
      clearTimeout(removeClassTimer)
      clearTimeout(updateHintActiveTimer)
    }
  }, [hintActive])

  const giveUp = () => {
    setGameStatus(GAME_STATUS.GIVEN_UP)
  }

  return (
    <main className="juego">
      <Opciones
        totalGroups={totalGroups} 
        setTotalGroups={setTotalGroups} 
        prevValuePairs={prevValuePairs}
        gameMode={gameMode}
        setGameMode={setGameMode}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        setFichasPerGroup={setFichasPerGroup}
        prevFichasPerGroup={prevFichasPerGroup}
      />
      <Stats
        totalGroups={totalGroups}
        qGuessedPairs={qGuessedPairs}
        reset={reset} 
        hint={hint}
        giveUp={giveUp}
        gameStatus={gameStatus}
        hintActive={hintActive}
        wasHintActive={wasHintActive}
        fichasPerGroup={fichasPerGroup}
        gameMode={gameMode}
        prevValuePairs={prevValuePairs.current}
        evalResetAnimationByBtn={evalResetAnimationByBtn}
        rogueFloor={rogueFloor}
        setRogueFloor={setRogueFloor}
        timer={timer}
        remainingHints={remainingHints}
        setRemainingHints={setRemainingHints}
      />
      <div className='tableroContainer'>
        <Tablero 
          fichas={fichas}
          setFichas={setFichas}
          columns={columns}
          isBoardLocked={isBoardLocked}
          setIsBoardLocked={setIsBoardLocked}
          sumarClick={sumarClick}
          shouldFichasAnimate={shouldFichasAnimate}
          shapesNColors={shapesNColors}
          setShapesNColors={setShapesNColors}
          gameStatusRef={gameStatusRef}
          fichasPerGroup={fichasPerGroup}
          gameMode={gameMode}
          abiertasRef={abiertasRef}
        />
      </div>
    </main>
  )
}

export default Juego