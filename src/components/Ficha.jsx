import { PiSealQuestionBold as HiddenIcon} from "react-icons/pi"
import { useEffect, useState } from 'react'
import { FICHA_STATUS } from '../libs/gameConfig'

function Ficha({ ficha, handleClick, lockState, shouldFichasAnimate, timeToShine }){
    const [showShadow, setShowShadow] = useState(true)

    const { id, name, Icon, SecondaryIcon, color, status, beingHinted } = ficha
    const alphaColor = color.replace('1)', '0.5)')

    useEffect(() => {
        if(status === FICHA_STATUS.ESCONDIDA) {
            setShowShadow(true)
        } else {
            setShowShadow(false)
        }
    }, [status])

    const handleInnerTransitionStart = () => {
        if(status === FICHA_STATUS.ESCONDIDA) {
            setShowShadow(true)
        } else {
            setShowShadow(false)
        }
    }

    const getAnimationClass = () => {
        if(beingHinted && (status === FICHA_STATUS.ERROR /* || status === FICHA_STATUS.ORDER_ERROR */)) return 'hinted-and-error'
        if(beingHinted) return 'hinted'
        if(status === FICHA_STATUS.ERROR /* || status === FICHA_STATUS.ORDER_ERROR */) return 'error'
        return ''
    }

    return (
        <div 
            onClick={(e) => handleClick(e, id)}
            className={`ficha ${getAnimationClass()}`}
            style={{
                '--hint-color': color,
                transition: 'all 0.4s',
                cursor: status === FICHA_STATUS.ESCONDIDA && !lockState  ? 'pointer' : 'auto',
                filter: showShadow ? 'drop-shadow(0px 0px 1px var(--dark))' : 'none',
                transform: status === FICHA_STATUS.MOSTRADA || status === FICHA_STATUS.ERROR || status === FICHA_STATUS.ORDER_ERROR ? 'scale(1.05)' : 'scale(1)',
            }}
        >
            <div className="ficha-inner"
                onTransitionStart={handleInnerTransitionStart}
                style={{
                    transition: shouldFichasAnimate ? 'transform 0.5s ease' : 'none',
                    ...(status === FICHA_STATUS.MOSTRADA || status === FICHA_STATUS.ERROR || status === FICHA_STATUS.ORDER_ERROR || status === FICHA_STATUS.ADIVINADA ) && shouldFichasAnimate
                    ? { transform: 'rotateY(180deg)' } 
                    : { transform: 'none' }
                }}
            >
                <div className="ficha-back"
                    style={{
                        borderColor: 'gray', 
                        backgroundColor: 'lightgray', 
                    }}
                >
                    <div className="svg-container">
                        <HiddenIcon color='gray' size='40'></HiddenIcon> 
                    </div>
                </div>
                <div className={`ficha-front ${status === FICHA_STATUS.ADIVINADA && timeToShine ? 'adivinada' : ''}`}
                    style={{
                        borderColor: alphaColor, 
                        backgroundColor: 'var(--light)'
                    }}
                >
                    { SecondaryIcon &&
                        <div className={`order-icon-container ${status === FICHA_STATUS.ORDER_ERROR ? 'orderError' : ''}`}>
                            <SecondaryIcon color={color} size='35'></SecondaryIcon>
                        </div>
                    }
                    <div className="svg-container">
                        {/* <SecondaryIcon color={color} size='30'></SecondaryIcon> */}
                        <Icon color={color} size='40'></Icon>
                    </div>
                    { name && name.length &&
                        <p style={{color: color}}>{name}</p>
                    }
                </div>
            </div>

        </div>
    )
}

export default Ficha