import { useEffect, useState, useRef } from 'react'
import Tablero from './Tablero'
import Opciones from './Opciones'
import Stats from './Stats'
import { defineColumns, inicializarFichas, getGroupsNFichasPerG } from '../libs/myFunctions'
import { fireWin } from '../libs/confetti'
import { 
  FICHA_STATUS, 
  GAME_STATUS, 
  TIMINGS, 
  GAME_MODES, 
  GAME_RULES, 
  TABLERO_TYPES, 
  TIMER_INFO_STATUS
} from '../libs/gameConfig'

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
  const [realTimer, setRealTimer] = useState(0)
  const timeoutEsconderStatus = useRef(null)
  const timeoutLockBoard = useRef(null)
  const secondsInterval = useRef(null)
  const [timerInfo, setTimerInfo] = useState({ content: null, status: TIMER_INFO_STATUS.POSITIVE })
  // #endregion states

// #region useEffects
  useEffect(() => {
    reset({ wAnimation: false })
    if(selectedSize >= TABLERO_TYPES[gameMode].length) {
      localStorage.setItem('selectedSize', GAME_RULES.DEFAULT_TABLERO_SIZE)
    } else localStorage.setItem('selectedSize', selectedSize)
  }, [selectedSize])

  useEffect(() => {
    localStorage.setItem('gameMode', gameMode)
    clearTimeout(timeoutEsconderStatus.current)
    clearTimeout(timeoutLockBoard.current)
    // setTimer(gameMode === GAME_MODES.ROGUE ? TIMINGS.ROGUE_INITIAL_SECS : 0)
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

      resetTriggeredByModeChange.current = true
      if(totalGroups !== GAME_RULES.ROGUE_BASE_GROUPS || fichasPerGroup !== GAME_RULES.CLASSIC_FPG){
        setTotalGroups(GAME_RULES.ROGUE_BASE_GROUPS)
        prevValuePairs.current = GAME_RULES.ROGUE_BASE_GROUPS
        setFichasPerGroup(GAME_RULES.CLASSIC_FPG)
        prevFichasPerGroup.current = GAME_RULES.CLASSIC_FPG
      } else {
        resetTriggeredByModeChange.current = false
        reset({ wAnimation: evalResetAnimationFromBtn(prevValuePairs, fichasPerGroup, GAME_RULES.ROGUE_BASE_GROUPS, GAME_RULES.CLASSIC_FPG) })
      }
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
    switch (gameStatus) {
      case GAME_STATUS.STARTED:
        setShouldFichasAnimate(true)
        // setTimer(gameMode === GAME_MODES.ROGUE ? TIMINGS.ROGUE_INITIAL_SECS : 0)
        secondsInterval.current = setInterval(() => {
          setTimer(prev => gameMode === GAME_MODES.ROGUE ? Math.max(0, prev - 1) : Math.max(0, prev + 1))
          setRealTimer(prev => prev + 1)
          // realTimer.current += 1
        }, 1000)
        
        break
      case GAME_STATUS.WON:
        if(gameMode === GAME_MODES.ROGUE) {
          advanceRogueFloor()
        } else {
          fireWin()
        }
      break
      case GAME_STATUS.GIVEN_UP:
        setIsBoardLocked(true)
        let next = [...fichas]
        next.forEach(f => {
          f.status = FICHA_STATUS.ADIVINADA
          f.beingHinted = false
        })
        setFichas(next)
        setHintActive(false)
      break
    }
    return () => clearInterval(secondsInterval.current)
  }, [gameStatus])

  useEffect(() => {
    if(gameMode === GAME_MODES.ROGUE){
      // esto puede q si no cambian los nextGroups no funcione pq no genere el reset
      const nextGroups = calculateNextFloorSize(rogueFloor)
      resetTriggeredByFloor.current = true
      prevValuePairs.current = nextGroups
      setTotalGroups(nextGroups)
    }
  }, [rogueFloor])

  useEffect(() => {
    if(clicks % fichasPerGroup !== 0) return
    if(fichas.length === 0) return
    if(gameStatus === GAME_STATUS.GIVEN_UP) return
    const qGuessedPairs = fichas.filter(ficha => ficha.status === FICHA_STATUS.ADIVINADA).length / fichasPerGroup
    const attempts = clicks / fichasPerGroup
    setErrors(Math.max(0, attempts - qGuessedPairs))
  }, [clicks, fichas])

  useEffect(() => {
    if(gameMode !== GAME_MODES.ROGUE) return
    if(gameStatus !== GAME_STATUS.STARTED) return
    if(!realTimer) return
    if(timer <= 0) setGameStatus(GAME_STATUS.GIVEN_UP)
  }, [timer])


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
// #endregion useEffects

  const reset = ({ wAnimation, onlyFloor } = { wAnimation: true, onlyFloor: false }) => {
    if(onlyFloor) wAnimation = false
    clearTimeout(timeoutAdvanceFloor.current)
    clearTimeout(timeoutFlipAllFichas.current)
    clearTimeout(timeoutEsconderStatus.current)
    clearTimeout(timeoutLockBoard.current)
    clearInterval(secondsInterval.current)
    setIsBoardLocked(true)
    abiertasRef.current = []

    let nextFichasPerGroup = fichasPerGroup
    if(!onlyFloor){
      setRogueFloor(1)
      setRealTimer(0)
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
      setTimerInfo({ content: `+${GAME_RULES.ROGUE_TIME_INCREMENT}`, status: TIMER_INFO_STATUS.POSITIVE })
      setTimeout(() => {
        setTimerInfo({ ...timerInfo, content: null })
      }, TIMINGS.TIMER_INFO_ANIMATION)
    }
    
    if(fichas && fichas.length){
      let next = [...fichas]
      next.forEach(f => f.status = FICHA_STATUS.ESCONDIDA)
      setFichas(next)
    }
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

  const giveUp = () => {
    setGameStatus(GAME_STATUS.GIVEN_UP)
  }

  const advanceRogueFloor = () => {
    clearTimeout(timeoutAdvanceFloor.current)
    fireWin(1)
    timeoutAdvanceFloor.current = setTimeout(() => {
      setRogueFloor(prev => prev + 1)
    }, TIMINGS.FICHA_FLIP)
  }

  const evalResetAnimationFromBtn = (prevGroups, prevFichasPerG, nextGroups, nextFichasPerG) => {
    if(gameMode !== GAME_MODES.ROGUE) return true
    let willAnimate = false
    if(prevGroups * prevFichasPerG === nextGroups * nextFichasPerG) willAnimate = true
    return willAnimate
  }

  const calculateNextFloorSize = (floor) => {
    return Math.min(GAME_RULES.ROGUE_BASE_GROUPS + (floor - 1) * GAME_RULES.ROGUE_GROUPS_INCREMENT, GAME_RULES.MAX_TOTAL_PAIRS)
  }

  const sumarClick = () => {
    setClicks(prev => {
      if(prev === 0 && gameStatus === GAME_STATUS.NOT_STARTED) setGameStatus(GAME_STATUS.STARTED)
      return prev + 1
    })
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
        setTimer={setTimer}
        // realTimer={realTimer}
        setRealTimer={setRealTimer}
        secondsInterval={secondsInterval}
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
        gameMode={gameMode}
        rogueFloor={rogueFloor}
        setRogueFloor={setRogueFloor}
        timer={timer}
        remainingHints={remainingHints}
        setRemainingHints={setRemainingHints}
        realTimer={realTimer}
        timerInfo={timerInfo}
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
          timeoutEsconderStatus={timeoutEsconderStatus}
          timeoutLockBoard={timeoutLockBoard}
        />
      </div>
    </main>
  )
}

export default Juego