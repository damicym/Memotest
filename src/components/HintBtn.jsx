import { GAME_STATUS } from "../libs/gameConfig"
import { AiOutlineBulb as HintIcon } from "react-icons/ai";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

function HintBtn({ hasBadge, hint, gameStatus, hintActive, wasHintActive, remainingHints }){
    return (
        <>
            { gameStatus !== GAME_STATUS.STARTED || hintActive || remainingHints <= 0 ?
                <div className="hintBtnContainer">
                    <button 
                        tabIndex={-1}
                        className={`control ${hintActive ? 'loadingHint' : wasHintActive.current && gameStatus === GAME_STATUS.STARTED && remainingHints > 0 ? 'bounce' : ''}`} 
                        onClick={hint} 
                        disabled={gameStatus !== GAME_STATUS.STARTED || hintActive || remainingHints <= 0} 
                    >
                        <HintIcon />
                    </button>
                    { hasBadge &&
                        <span 
                            style={{
                                filter: gameStatus !== GAME_STATUS.STARTED || hintActive || remainingHints <= 0 ? 'brightness(0.9)' : 'none',
                                pointerEvents: gameStatus !== GAME_STATUS.STARTED || hintActive || remainingHints <= 0 ? 'none' : 'auto'
                            }}
                            onClick={hint}
                            className="hintBadge">{remainingHints}
                        </span>
                    }
                </div>
                : 
                <OverlayTrigger
                    delay={{ show: 700, hide: 0 }}
                    key='hintOverlay'
                    placement='top'
                    overlay={
                        <Tooltip className="customTooltip" id='tooltip-top'>Usar una pista</Tooltip>
                    }
                >
                    <div className="hintBtnContainer">
                        <button 
                            tabIndex={-1}
                            className={`control ${hintActive ? 'loadingHint' : wasHintActive.current && gameStatus === GAME_STATUS.STARTED && remainingHints > 0 ? 'bounce' : ''}`} 
                            onClick={hint} 
                            disabled={gameStatus !== GAME_STATUS.STARTED || hintActive  || remainingHints <= 0} 
                        >
                            <HintIcon />
                        </button>
                        { hasBadge &&
                            <span 
                                style={{
                                    filter: remainingHints <= 0 ? 'brightness(0.9)' : 'none',
                                    pointerEvents: gameStatus !== GAME_STATUS.STARTED || hintActive || remainingHints <= 0 ? 'none' : 'auto'
                                }}
                                onClick={hint}
                                className="hintBadge">{remainingHints}
                            </span>
                        }
                    </div>
                </OverlayTrigger>
            }
        </>
    )
}

export default HintBtn