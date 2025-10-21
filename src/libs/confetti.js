import confetti from 'canvas-confetti'
import { randomInRange, hslaToHex } from './myFunctions'
import { getPathFromIcon } from './icons'
import { TIMINGS } from '../components/Juego'

// para usar colores diferenetes para formas diferenetes hacer 2 confetti() en el mismo fire
// usar un canvas propio si queres limitar donde aparece el confetti

// #region test
const pumpkin = confetti.shapeFromPath({
  path: 'M449.4 142c-5 0-10 .3-15 1a183 183 0 0 0-66.9-19.1V87.5a17.5 17.5 0 1 0-35 0v36.4a183 183 0 0 0-67 19c-4.9-.6-9.9-1-14.8-1C170.3 142 105 219.6 105 315s65.3 173 145.7 173c5 0 10-.3 14.8-1a184.7 184.7 0 0 0 169 0c4.9.7 9.9 1 14.9 1 80.3 0 145.6-77.6 145.6-173s-65.3-173-145.7-173zm-220 138 27.4-40.4a11.6 11.6 0 0 1 16.4-2.7l54.7 40.3a11.3 11.3 0 0 1-7 20.3H239a11.3 11.3 0 0 1-9.6-17.5zM444 383.8l-43.7 17.5a17.7 17.7 0 0 1-13 0l-37.3-15-37.2 15a17.8 17.8 0 0 1-13 0L256 383.8a17.5 17.5 0 0 1 13-32.6l37.3 15 37.2-15c4.2-1.6 8.8-1.6 13 0l37.3 15 37.2-15a17.5 17.5 0 0 1 13 32.6zm17-86.3h-82a11.3 11.3 0 0 1-6.9-20.4l54.7-40.3a11.6 11.6 0 0 1 16.4 2.8l27.4 40.4a11.3 11.3 0 0 1-9.6 17.5z',
  matrix: [0.020491803278688523, 0, 0, 0.020491803278688523, -7.172131147540983, -5.9016393442622945]
})

const valuesTest = {
  angle: randomInRange(0, 180),
  decay: 0.9, // velocidad con la que pierden energia
  // ticks: 80,
  scalar: 2, // tamaño
  spread: 180, // angulo con el q se van para los costados
  particleCount: 100,
  origin: { y: 0/* , x: 0 */},
  startVelocity: -35,
  gravity: 0.8, // peso
  // drift: randomInRange(-4, 4), // viento
}

export function fireTest(){
  confetti({
    ...valuesTest,
    // shapes: [pumpkin],
    // colors: ['#ff9a00', '#ff7400', '#ff4d00']
  })
}
// #endregion test

// #region multipleIcons
const iconsFireParams = {
  scalar: 4,
  particleCount: 10,
  origin: { y: 0/* , x: 0 */},
  startVelocity: -35,
  // spread y drift en la llamada
}
// const winShapeMatrix = []

export function fireShapesWColors(shapesNColors){
  if(!shapesNColors || !shapesNColors.length) return
  shapesNColors.forEach(shapeNColor => {
    confetti({
      ...iconsFireParams,
      spread: randomInRange(170, 190),
      drift: randomInRange(-1, 1),
      shapes: [shapeNColor.shape],
      colors: [shapeNColor.color]
    })
  })
}

export async function toShapesNColors(fichas, callback){
  let shapesNColors = fichas.map(ficha => {
    const shapeFromIcon = confetti.shapeFromPath({
      path: getPathFromIcon(ficha.Icon),
      // matrix: winShapeMatrix,
    })
    return { shape: shapeFromIcon, color: ficha.color }
  })
  if(typeof callback === 'function') {
    callback(shapesNColors) //setShapesNColors(shapesNColors)
  }
}
// #endregion multipleIcons

// #region oneIcon
const oneIconFireParams = {
  scalar: 5,
  spread: 45,
  decay: 0.9,
  particleCount: 3,
  startVelocity: -20,
  ticks: 40
}

export async function toOneShapeNColor(ficha, prevShapesNColors, callback){
  if(prevShapesNColors.find(shape => shape.groupId === ficha.groupId)) return
  const shapeFromIcon = confetti.shapeFromPath({
    path: getPathFromIcon(ficha.Icon),
  })
  let shapeNColor = { groupId: ficha.groupId, shape: shapeFromIcon, color: hslaToHex(ficha.color) }
  if(typeof callback === 'function') {
    callback(prev => [...prev, shapeNColor])
  }
}

export function fireIcon(shapeNColor, posY, posX, totalY, totalX){
  if(!shapeNColor) {
    console.log('undefined')
    return
  }
  const yOrigin = posY / totalY // de 0 a 1 en base a la pantalla
  const xOrigin = posX / totalX // de 0 a 1 en base a la pantalla
  confetti({
    ...oneIconFireParams,
    origin: {y: yOrigin, x: xOrigin},
    shapes: [shapeNColor.shape],
    colors: [shapeNColor.color],
    angle: 45
  })
  confetti({
    ...oneIconFireParams,
    origin: {y: yOrigin, x: xOrigin},
    shapes: [shapeNColor.shape],
    colors: [shapeNColor.color],
    angle: 90
  })
  confetti({
    ...oneIconFireParams,
    origin: {y: yOrigin, x: xOrigin},
    shapes: [shapeNColor.shape],
    colors: [shapeNColor.color],
    angle: 135
  })
  confetti({
    ...oneIconFireParams,
    origin: {y: yOrigin, x: xOrigin},
    shapes: [shapeNColor.shape],
    colors: [shapeNColor.color],
    angle: 180
  })
  confetti({
    ...oneIconFireParams,
    origin: {y: yOrigin, x: xOrigin},
    shapes: [shapeNColor.shape],
    colors: [shapeNColor.color],
    angle: 225
  })
  confetti({
    ...oneIconFireParams,
    origin: {y: yOrigin, x: xOrigin},
    shapes: [shapeNColor.shape],
    colors: [shapeNColor.color],
    angle: 270
  })
  confetti({
    ...oneIconFireParams,
    origin: {y: yOrigin, x: xOrigin},
    shapes: [shapeNColor.shape],
    colors: [shapeNColor.color],
    angle: 315
  })
  confetti({
    ...oneIconFireParams,
    origin: {y: yOrigin, x: xOrigin},
    shapes: [shapeNColor.shape],
    colors: [shapeNColor.color],
    angle: 360
  })
}
// #endregion oneIcon

// #region win
const winFireParams = {
  scalar: 1.8,
  spread: 160,
  particleCount: 300,
  gravity: 0.7,
}

export async function fireWin(winFiresQ = 3){
  let countWinFiresQ = 0
  confetti({
    ...winFireParams,
    angle: randomInRange(170, 190),
    decay: randomInRange(0.93, 0.95),
    startVelocity: randomInRange(-25, -35),
    origin: { y: 0, x: 0},
  })
  confetti({
    ...winFireParams,
    angle: randomInRange(-10, 10),
    decay: randomInRange(0.93, 0.95),
    startVelocity: randomInRange(-25, -35),
    origin: { x: 1, y: 0 },
  })
  countWinFiresQ++
  if(countWinFiresQ >= winFiresQ) return
  const winFireInterval = setInterval(() => {
    confetti({
      ...winFireParams,
      angle: randomInRange(170, 190),
      decay: randomInRange(0.93, 0.95),
      startVelocity: randomInRange(-25, -35),
      origin: { y: 0, x: 0},
    })
    confetti({
      ...winFireParams,
      angle: randomInRange(-10, 10),
      decay: randomInRange(0.93, 0.95),
      startVelocity: randomInRange(-25, -35),
      origin: { x: 1, y: 0 },
    })

    countWinFiresQ++
    if(countWinFiresQ >= winFiresQ) clearInterval(winFireInterval)
  }, TIMINGS.BETWEEN_WIN_CONFETTI)
}
// #endregion win
