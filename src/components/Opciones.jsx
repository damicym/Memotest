import { useState, useEffect } from "react";
import { isPrimeOrBanned, getClosestNotPrimeOrBanned, getFancyModeName } from "../libs/myFunctions"
import { GAME_RULES, GAME_MODES, GAME_MODES_DESCRIPTIONS, TIMINGS } from "../libs/gameConfig"
import { FaInfoCircle as InfoIcon } from "react-icons/fa";
import { LiaExchangeAltSolid as ChangeModeIcon } from "react-icons/lia";
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import SizeSelector from "./SizeSelector";

function Opciones({ totalGroups, setTotalGroups, prevValuePairs, gameMode, setGameMode, selectedSize, setSelectedSize, setFichasPerGroup, prevFichasPerGroup, setTimer, setRealTimer, secondsInterval }){
    const [animationClass, setAnimationClass] = useState("");
    const [isAnimating, setIsAnimating] = useState(false);
    const [fancyTitle, setFancyTitle] = useState(getFancyModeName(gameMode))

    const handlePairsChange = (newGroups, newFichasPerG = GAME_RULES.CLASSIC_FPG) => {
        let expectedNumber = Number(newGroups)
        const direction = expectedNumber > prevValuePairs.current ? "up" : "down"
        if(!isPrimeOrBanned(expectedNumber, GAME_RULES.EXCLUDED_Q_PAIRS)) {
            if(expectedNumber < GAME_RULES.MIN_TOTAL_PAIRS) expectedNumber = GAME_RULES.MIN_TOTAL_PAIRS
            setTotalGroups(expectedNumber)
            setFichasPerGroup(newFichasPerG)
            prevFichasPerGroup.current = newFichasPerG
        }
        else {
            expectedNumber = getClosestNotPrimeOrBanned(expectedNumber, direction, GAME_RULES.EXCLUDED_Q_PAIRS)
            if(expectedNumber < GAME_RULES.MIN_TOTAL_PAIRS) expectedNumber = GAME_RULES.MIN_TOTAL_PAIRS
            setTotalGroups(expectedNumber)
            setFichasPerGroup(newFichasPerG)
            prevFichasPerGroup.current = newFichasPerG
        }
        prevValuePairs.current = expectedNumber
    }

    const changeMode = () => {
        if(isAnimating) return
        clearInterval(secondsInterval.current)
        setRealTimer(0)
        setTimer(gameMode === GAME_MODES.CLASSIC ? TIMINGS.ROGUE_INITIAL_SECS : 0)
        setIsAnimating(true)
        setAnimationClass("slide-exit")
        setGameMode(prev => {
            switch (prev){
                case GAME_MODES.CLASSIC: return GAME_MODES.SEQUENCE
                break
                case GAME_MODES.ROGUE: return GAME_MODES.SEQUENCE
                break
                case GAME_MODES.SEQUENCE: return GAME_MODES.CLASSIC
                break
                default: return GAME_MODES.CLASSIC
            }
        })
        setTimeout(() => {
            setAnimationClass("slide-enter")
            setIsAnimating(false)
        }, TIMINGS.GAME_MODE_CHANGE)
        // setAnimationClass("")
    }

    useEffect(() => {
        setTimeout(() => {
            setFancyTitle(getFancyModeName(gameMode))
        }, TIMINGS.GAME_MODE_CHANGE)
    }, [gameMode])

    return (
        <section className='opciones'>
            <div className="gameMode">
                <div className="modesBtnContainer">
                    {/* <button tabIndex={-1} className="modeBtn" onClick={() => setModalShow(true)} ><ModeSettingsIcon></ModeSettingsIcon></button> */}
                    <button disabled={isAnimating} tabIndex={-1} className="modeBtn" onClick={changeMode}><ChangeModeIcon></ChangeModeIcon></button>
                </div>
                <div className="titleContainer">
                    <div className={`title ${animationClass}`}>
                        <h1>{fancyTitle}</h1>
                        <div className="modeInfo">
                            <OverlayTrigger
                                delay={{ show: 75, hide: 0 }}
                                key='infoTitleOverlay'
                                placement='right'
                                overlay={
                                    <Tooltip className="customTooltip" id='tooltip-right'>{ GAME_MODES_DESCRIPTIONS[gameMode] }</Tooltip>
                                }
                            >
                                    <InfoIcon size={20}></InfoIcon>
                            </OverlayTrigger>
                        </div>
                    </div>
                </div>
            </div>
            <SizeSelector
                gameMode={gameMode} 
                totalGroups={totalGroups}
                handlePairsChange={handlePairsChange} 
                isAnimating={isAnimating} 
                selectedSize={selectedSize} 
                setSelectedSize={setSelectedSize}
            />
        </section>
    )
}

export default Opciones