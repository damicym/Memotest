import { useState } from 'react'
import { useEffect } from 'react'
import { GAME_STATUS, GAME_MODES, TIMER_INFO_STATUS } from "../libs/gameConfig"
import { getFancyTimeBySecs, getClockTimeBySecs } from '../libs/myFunctions'
import ProgressBar from 'react-bootstrap/ProgressBar';
import { FiFlag as GiveUpIcon} from "react-icons/fi";
import { GrPowerReset as ResetIcon } from "react-icons/gr";
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import HintBtn from './HintBtn';
import TimerIcon from './TimerIcon';
import floorIcon from '../assets/fc5.png';

function StatsInfo({ waiting, totalGroups, qGuessedPairs, reset, hint, giveUp, gameStatus, hintActive, wasHintActive, gameMode, rogueFloor, setRogueFloor, timer, remainingHints, setRemainingHints, realTimer, timerInfo }){
    const timeInGame = gameMode !== GAME_MODES.ROGUE ? getFancyTimeBySecs(timer) : getClockTimeBySecs(timer)
    const [progress, setProgress] = useState((qGuessedPairs / totalGroups) * 100)
    
    useEffect(() => {
        setProgress((qGuessedPairs / totalGroups) * 100)
    }, [totalGroups, qGuessedPairs])

    return(
        <section className='statsInfo'>
            <div className='timerContainer'>
                <div className='timerExtras'>
                    { timerInfo?.content &&
                        <span 
                            style={{
                                color: timerInfo.status === TIMER_INFO_STATUS.POSITIVE 
                                    ? 'var(--muyBien)' 
                                    : timerInfo.status === TIMER_INFO_STATUS.NEGATIVE
                                        ? 'var(--muyMal)' 
                                        : timerInfo.status === TIMER_INFO_STATUS.NEUTRAL
                                            && 'var(--light)',
                                fontWeight: timerInfo.status !== TIMER_INFO_STATUS.NEUTRAL ? '500' : '400'
                            }}
                        >
                            {timerInfo.content}
                        </span>
                    }
                    <TimerIcon 
                        // key={rogueFloor} <- solo cuando era con keyframes, ya no
                        type={gameStatus === GAME_STATUS.STARTED ? 'steps' : 'stopped'} 
                        seconds={realTimer} 
                        className='timerIcon' 
                        style={{ opacity: gameStatus === GAME_STATUS.GIVEN_UP ? '0.4' : '1'}}
                    />
                </div>
                <p className="timer withHole" style={{ width: '85px', opacity: gameStatus === GAME_STATUS.GIVEN_UP ? '0.4' : '1'}}>{timeInGame}</p>
            </div>
            { !waiting ?
                <div className="customProgressBar statsCenteredElement" style={{ opacity: gameStatus === GAME_STATUS.GIVEN_UP ? '0.4' : '1' }}>
                    <ProgressBar
                        striped={gameStatus === GAME_STATUS.GIVEN_UP}
                        animated={gameStatus !== GAME_STATUS.GIVEN_UP}
                        now={Math.max(4, progress)} 
                        className="progressBarComponent statsCenteredElement"
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
                <div /* className='waiting' */ className='statsCenteredElement'>
                    <p>Da vuelta una ficha para empezar</p>
                    {/* <p>{animatedDots}</p> */}
                </div>
            }
            { gameStatus === GAME_STATUS.GIVEN_UP &&
                <p className='givenUpText' >¡{gameMode !== GAME_MODES.ROGUE ? "Juego terminado" : "Perdiste"}!</p>
            }
            <div className='floorNControlsContainar'>
                { gameMode === GAME_MODES.ROGUE &&
                    <div className="floorDisplay" style={{ width: '85px', opacity: gameStatus === GAME_STATUS.GIVEN_UP ? '0.4' : '1'}}>
                        <img src={floorIcon} alt="floor icon"/>
                        <p>{rogueFloor}</p>
                    </div>
                }
                <section className='controlsContainer'>
                <div className='divisionLine' style={{left: gameMode !== GAME_MODES.ROGUE ? '-12.5px' : '-15px'}}></div>
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