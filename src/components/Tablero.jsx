import Ficha from './Ficha'
import { FICHA_STATUS, GAME_MODES, GAME_STATUS, TIMINGS } from '../libs/gameConfig'
import { useEffect, useState, useRef } from 'react'
import { toOneShapeNColor, fireIcon } from '../libs/confetti'

export const ERROR_TYPES = Object.freeze({
    NONE: -1,
    MISMATCH: 0,
    ORDER: 1,
})

function Tablero({ fichas, setFichas, columns, isBoardLocked, setIsBoardLocked, sumarClick, shouldFichasAnimate, shapesNColors, setShapesNColors, gameStatusRef, fichasPerGroup, gameMode, abiertasRef, timeoutEsconderStatus, timeoutLockBoard }) {
    const [timeToShine, setTimeToShine] = useState(false)

    useEffect(() => {
        let timeout
        setTimeToShine(true)
        timeout = setTimeout(() => setTimeToShine(false), TIMINGS.SHINE_DURATION)

        const interval = setInterval(() => {
            setTimeToShine(true)
            timeout = setTimeout(() => {
                setTimeToShine(false)
            }, TIMINGS.SHINE_DURATION)
        }, TIMINGS.SHINE_CYCLE)

        return () => {
            clearInterval(interval)
            clearTimeout(timeout)
        }
    }, [])

    // cuando tocas una ficha, 
    // - si es la primera y es la primera vez q la tocan // 2da condicion evaluada en toOneShapeNColor
    // sumup: toOneShapeNColor(ficha/*checkear*/, shapesNColors, setShapesNColors)
    // 1. crear una shape y guardarla en un estado
    // 2. con un identidicador de groupId
    // - si es la segunda y está bien,
    // 1. buscar su shape en el estado con su groupId
    // 2. hacer confetti con esa shape
    const esconderDsps = (abiertas, errType = ERROR_TYPES.MISMATCH) => {
        clearTimeout(timeoutEsconderStatus.current)
        clearTimeout(timeoutLockBoard.current)
        abiertasRef.current = []

        setIsBoardLocked(true)
        let next = [...fichas]
        abiertas.forEach(f => f.status = errType === ERROR_TYPES.MISMATCH ? FICHA_STATUS.ERROR : FICHA_STATUS.ORDER_ERROR)
        setFichas(next)
        timeoutEsconderStatus.current = setTimeout(() => {
            abiertas.forEach(f =>
                f.status = gameStatusRef.current === GAME_STATUS.GIVEN_UP ? FICHA_STATUS.ADIVINADA : FICHA_STATUS.ESCONDIDA
            )
            setFichas(next)
        }, TIMINGS.BEFORE_HIDING_FICHA)
        timeoutLockBoard.current = setTimeout(() => {
            setIsBoardLocked(false)
        }, TIMINGS.BEFORE_HIDING_FICHA)
    }

    const handleClickFicha = (e, key) => {
        if(isBoardLocked) return
        const fichaActual = fichas.find(f => f.id === key)
        if(!fichaActual) return
        if(fichaActual.status !== FICHA_STATUS.ESCONDIDA) return
        let errType = ERROR_TYPES.NONE
        sumarClick()
        let next = [...fichas]
        fichaActual.status = FICHA_STATUS.MOSTRADA
        abiertasRef.current.push(fichaActual)
        
        // ver si está en el orden correcto
        if(gameMode === GAME_MODES.SEQUENCE) {
            const estaEnOrden = abiertasRef.current.every((f, i) => f.order === i + 1)
            if(!estaEnOrden) errType = ERROR_TYPES.ORDER
        }
        // decidir si puso las todas bien
        if(abiertasRef.current.length === fichasPerGroup) {
            const allSameGroup = abiertasRef.current.every(f => f.groupId === abiertasRef.current[0].groupId)

            if(allSameGroup) {
                if(errType === ERROR_TYPES.NONE){
                    abiertasRef.current.forEach(f => f.status = FICHA_STATUS.ADIVINADA)
                    abiertasRef.current = []
                    let shape = shapesNColors.find(s => s.groupId === fichaActual.groupId)
                    fireIcon(shape, e.clientY, e.clientX, window.innerHeight, window.innerWidth)
                }
            } else errType = ERROR_TYPES.MISMATCH

        } else toOneShapeNColor(fichaActual, shapesNColors, setShapesNColors)

        if(errType !== ERROR_TYPES.NONE) esconderDsps(abiertasRef.current, errType)
        setFichas(next)
    }

    return (
        <section className='tablero'
            style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, min(110px, ${100 / columns}vw)))`
            }}
        >
            {
                fichas?.map((ficha, index) => (
                    <Ficha
                        key={index}
                        ficha={ficha}
                        handleClick={handleClickFicha}
                        lockState={isBoardLocked}
                        shouldFichasAnimate={shouldFichasAnimate}
                        timeToShine={timeToShine}
                    />
                ))
            }
        </section>
    )
}

export default Tablero