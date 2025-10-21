import { useState } from 'react'
import { useEffect } from 'react'
import { GAME_STATUS, GAME_MODES } from "./Juego"
import { getFancyTimeBySecs } from '../libs/myFunctions'
import ProgressBar from 'react-bootstrap/ProgressBar';
import { FiFlag as GiveUpIcon} from "react-icons/fi";
import { GrPowerReset as ResetIcon } from "react-icons/gr";
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import HintBtn from './HintBtn';

function StatsInfo({ waiting, totalGroups, qGuessedPairs, reset, hint, giveUp, gameStatus, hintActive, wasHintActive, gameMode, rogueFloor, setRogueFloor, timer, remainingHints, setRemainingHints}){
    const [timeInGame, setTimeInGame] = useState(0)
    const [progress, setProgress] = useState((qGuessedPairs / totalGroups) * 100)
    
    useEffect(() => {
        setTimeInGame(getFancyTimeBySecs(timer))
    }, [timer])

    useEffect(() => {
        setProgress((qGuessedPairs / totalGroups) * 100)
    }, [totalGroups, qGuessedPairs])

    return(
        <section className='statsInfo'>
            <p className="timer" style={{ width: '85px', opacity: gameStatus === GAME_STATUS.GIVEN_UP ? '0.4' : '1'}} >{timeInGame}</p>
            { !waiting ?
                <div className="customProgressBar" style={{ position: 'relative', width: '250px', opacity: gameStatus === GAME_STATUS.GIVEN_UP ? '0.4' : '1' }}>
                    <ProgressBar
                        striped={gameStatus === GAME_STATUS.GIVEN_UP}
                        animated={gameStatus !== GAME_STATUS.GIVEN_UP}
                        now={Math.max(4, progress)} 
                        className='progressBarComponent'
                        style={{ 
                            '--bs-progress-bar-bg': `hsl(${progress}, 55%, 55%)`,
                            '--bs-progress-font-size': '0.8rem',
                        }}
                    />
                    <div className='progressText'>
                        {`${Math.floor((qGuessedPairs / totalGroups) * 100)}%`}
                    </div>
                </div>
                :
                <div /* className='waiting' */>
                    <p>Da vuelta una ficha para empezar</p>
                    {/* <p>{animatedDots}</p> */}
                </div>
            }
            { gameStatus === GAME_STATUS.GIVEN_UP &&
                <p className='givenUpText' >¡Juego terminado!</p>
            }
            <div className='floorNControlsContainar'>
                { gameMode === GAME_MODES.ROGUE &&
                    <p className="timer" style={{ width: '85px' }} >{rogueFloor}</p>
                }
                <section className='controlsContainer'>
                    <HintBtn 
                        hasBadge={gameMode === GAME_MODES.ROGUE}
                        hint={hint} 
                        gameStatus={gameStatus} 
                        hintActive={hintActive} 
                        wasHintActive={wasHintActive}
                        remainingHints={remainingHints}
                        setRemainingHints={setRemainingHints}
                    />
                    { gameMode !== GAME_MODES.ROGUE && 
                        (gameStatus !== GAME_STATUS.STARTED ?
                            <button 
                                tabIndex={-1}
                                className="control" 
                                onClick={giveUp} 
                                disabled={gameStatus !== GAME_STATUS.STARTED} 
                            >
                                <GiveUpIcon />
                            </button>
                            :
                            <OverlayTrigger
                                delay={{ show: 700, hide: 0 }}
                                key='giveUpOverlay'
                                placement='top'
                                overlay={
                                    <Tooltip className="customTooltip" id='tooltip-top'>Rendirse</Tooltip>
                                }
                            >
                                <button 
                                    tabIndex={-1}
                                    className="control" 
                                    onClick={giveUp} 
                                    disabled={gameStatus !== GAME_STATUS.STARTED} 
                                >
                                    <GiveUpIcon />
                                </button>
                            </OverlayTrigger>
                        )
                    }
                    { gameStatus === GAME_STATUS.NOT_STARTED ?
                        <button 
                            tabIndex={-1}
                            className="control" 
                            onClick={() => {
                                if(gameMode !== GAME_MODES.ROGUE) reset()
                                else {
                                    if(rogueFloor === 1) reset({ wAnimation: true })
                                    else setRogueFloor(1)
                                    // reset({ wAnimation: evalResetAnimationByBtn(prevValuePairs, fichasPerGroup, GAME_RULES.ROGUE_BASE_GROUPS, GAME_RULES.CLASSIC_FPG) })
                                }
                            }}
                            disabled={gameMode !== GAME_MODES.ROGUE ? (gameStatus === GAME_STATUS.NOT_STARTED) : (gameStatus === GAME_STATUS.NOT_STARTED && rogueFloor === 1)}
                        >
                            <ResetIcon />
                        </button>
                        :
                        <OverlayTrigger
                            delay={{ show: 700, hide: 0 }}
                            key='resetOverlay'
                            placement='top'
                            overlay={
                                <Tooltip className="customTooltip" id='tooltip-top'>Regenerar tablero</Tooltip>
                            }
                        >
                            <button 
                                tabIndex={-1}
                                className="control" 
                                onClick={() => {
                                    if(gameMode !== GAME_MODES.ROGUE) reset()
                                    else {
                                        if(rogueFloor === 1) reset({ wAnimation: true })
                                        else setRogueFloor(1)
                                        // reset({ wAnimation: evalResetAnimationByBtn(prevValuePairs, fichasPerGroup, GAME_RULES.ROGUE_BASE_GROUPS, GAME_RULES.CLASSIC_FPG) })
                                    }
                                }}
                                disabled={gameMode !== GAME_MODES.ROGUE ? (gameStatus === GAME_STATUS.NOT_STARTED) : (gameStatus === GAME_STATUS.NOT_STARTED && rogueFloor === 1)}
                            >
                                <ResetIcon />
                            </button>
                        </OverlayTrigger>
                    }
                </section>
            </div>
        </section>
    )
}

export default StatsInfo