import { useState, useRef } from 'react'
import { useEffect } from 'react'
import { GAME_STATUS, GAME_MODES, TIMINGS } from "../libs/gameConfig"
import StatsInfo from './StatsInfo';

function Stats({ totalGroups, qGuessedPairs, reset, hint, giveUp, gameStatus, hintActive, wasHintActive, gameMode, rogueFloor, setRogueFloor, timer, remainingHints, setRemainingHints, realTimer, timerInfo }){
    const [animatedDots, setAnimatedDots] = useState("...")
    const animatedDotsInterval = useRef(null)

    // const [FichasPerGIcon, setFichasPerGIcon] = useState(null)
    // useEffect(() => {
    //     setFichasPerGIcon(gameMode === GAME_MODES.SEQUENCE ? numberIcons[fichasPerGroup - 1] : null)
    // }, [fichasPerGroup])

    useEffect(() => {
        if (gameStatus !== GAME_STATUS.NOT_STARTED || gameMode === GAME_MODES.ROGUE) {
            clearInterval(animatedDotsInterval.current)
            return
        }
        animatedDotsInterval.current = setInterval(() => {
            setAnimatedDots(prev => {
            if (prev === "...") return "."
            if (prev === ".") return ".."
            if (prev === "..") return "..."
            return "...";
            })
        }, TIMINGS.BETWEEN_ANIMATED_DOTS)
        return () => clearInterval(animatedDotsInterval.current)
    }, [gameStatus, gameMode])

    return (
       <section className='stats' style={{ display: gameStatus === GAME_STATUS.NOT_STARTED ? 'flex' : 'grid'}}>
        { gameStatus === GAME_STATUS.NOT_STARTED ? 
            gameMode !== GAME_MODES.ROGUE ?
                <div className='waiting'>
                    <p>Esperando a que empieces a jugar para mostrar estadísticas</p>
                    <p>{animatedDots}</p>
                </div>
                :
                <StatsInfo 
                    waiting={true} 
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
                />
            :  
            <StatsInfo 
                waiting={false} 
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
        }
            
       </section>
    )
}

export default Stats