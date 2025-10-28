import { useEffect, useState } from "react";
import { GAME_MODES, GAME_RULES, TABLERO_TYPES } from "../libs/gameConfig"
import { PiSlidersHorizontal as SliderIcon } from "react-icons/pi";
import Modal from 'react-bootstrap/Modal';

export const PAIRS_CHANGE_ORIGINS = Object.freeze({
  SLIDER: 0,
  BUTTON: 1
})

function SizeSelector({ gameMode, totalGroups, handlePairsChange, selectedSize, setSelectedSize }){
    const [modalShow, setModalShow] = useState(false)
    const [pairsChangeOrigin, setPairsChangeOrigin] = useState(PAIRS_CHANGE_ORIGINS.BUTTON)
    const options = TABLERO_TYPES[gameMode]

    useEffect(()  =>{
        if(pairsChangeOrigin === PAIRS_CHANGE_ORIGINS.SLIDER) setSelectedSize(options.length)
    }, [pairsChangeOrigin])

    useEffect(() => {
        setPairsChangeOrigin(PAIRS_CHANGE_ORIGINS.BUTTON)
    }, [gameMode])

    return (
        <>
            <div className="selectorAllContainer">
                <section className="selectorBtnContainer">
                    { gameMode !== GAME_MODES.ROGUE ? (
                        <>
                            {options.map((opt, index) => {
                                // const FichasPerGIcon = gameMode === GAME_MODES.SEQUENCE ? numberIcons[opt.fichasPerGroup - 1] : null
                                return(
                                    <button 
                                        tabIndex={-1} 
                                        key={index} 
                                        className={`selectorBtn ${index === selectedSize ? 'selected' : ''}`} 
                                        onClick={() => {
                                            setPairsChangeOrigin(PAIRS_CHANGE_ORIGINS.BUTTON)
                                            setSelectedSize(index)
                                            handlePairsChange(opt.groups, opt.fichasPerGroup)
                                        }}
                                    >
                                        <span>{opt.name}</span>
                                        {/* { FichasPerGIcon &&
                                            <FichasPerGIcon></FichasPerGIcon>
                                        } */}
                                    </button>
                                )
                            })}
                            <button 
                                tabIndex={-1} 
                                key={options.length} 
                                onClick={() => setModalShow(true)} 
                                className={`selectorBtn ${ selectedSize === options.length ? 'selected' : ''}`}
                            >
                                Personalizado
                            </button>
                        </>
                    ) : ( <button className="selectorBtn">Configurar partida</button> )
                    }
                </section>
            </div>
            <Modal
                show={modalShow}
                onHide={() => setModalShow(false)}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                    Opciones
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <div className="campo">
                        <label>Pares de fichas ({totalGroups})</label>
                        <input 
                            tabIndex={-1} 
                            onChange={ (e) => { 
                                setPairsChangeOrigin(PAIRS_CHANGE_ORIGINS.SLIDER)
                                handlePairsChange(e.target.value) 
                            }} 
                            value={totalGroups}
                            type='range' 
                            min={GAME_RULES.MIN_TOTAL_PAIRS} 
                            step="1" 
                            max={GAME_RULES.MAX_TOTAL_PAIRS}
                        ></input>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default SizeSelector