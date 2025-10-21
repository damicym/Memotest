import { getRandomIcon } from "./icons"
import { FICHA_STATUS, GAME_MODES, GAME_RULES, TABLERO_TYPES } from "../components/Juego"
import { TbCircleNumber1Filled as OneIcon, TbCircleNumber2Filled as TwoIcon, TbCircleNumber3Filled as ThreeIcon, TbCircleNumber4Filled as FourIcon, TbCircleNumber5Filled as FiveIcon, TbCircleNumber6Filled as SixIcon } from "react-icons/tb";
export const numberIcons = [OneIcon, TwoIcon, ThreeIcon, FourIcon, FiveIcon, SixIcon]

export function splitCamelCase(str) {
    return str.replace(/([A-Z])/g, ' $1').trim()
}

// export function deleteExtraWords(str, qWords, maxChars) {
//     const words = str.split(" ")
//     let auxStr = words.slice(0, qWords).join(" ")
//     if(auxStr.length > maxChars) {
//         auxStr = words[0]
//         auxStr = auxStr.slice(0, maxChars) + '\n' + auxStr.slice(maxChars)
//     }
//     return auxStr
// }

export function deleteExtraWords(str, qWords, charsPerWord) {
    const words = str.split(" ")
    const validWords = words
        .filter(w => w.length <= charsPerWord)
        .slice(0, qWords)
    if(validWords.length) return validWords.join(" ")
    else return words[0]
}

export function separarNumerosYPalabras(texto) {
    return texto.replace(/([a-zA-Z])(\d)|(\d)([a-zA-Z])/g, '$1$3 $2$4');
}

export function getReadableRGB() {
    let r, g, b, L
    const min = 50
    const max = 180
    do {
        r = Math.floor(Math.random() * 256)
        g = Math.floor(Math.random() * 256)
        b = Math.floor(Math.random() * 256)
        L = 0.299 * r + 0.587 * g + 0.114 * b
    } while (L < min || L > max)
    return `rgba(${r}, ${g}, ${b}, 1)`
}
export function generarError(num, error = 0){
    const errPerc = (Math.random() * 2 * error) - error
    return num + num * errPerc / 100
}
export function getRandomHSL(alpha = 1){
    const hue = Math.floor(Math.random() * 360)
    return `hsla(${hue}, ${generarError(50, 40)}%, ${generarError(40)}%, ${Number(alpha)})`
}

export function hslaStringToRgba(hslaStr) {
  // Extraer números con regex
  const match = hslaStr.match(/hsla?\(\s*([\d.]+),\s*([\d.]+)%?,\s*([\d.]+)%?,?\s*([\d.]*)\s*\)/i)
  if(!match) {
    throw new Error("Formato HSLA inválido: " + hslaStr)
  }

  let h = parseFloat(match[1])
  let s = parseFloat(match[2])
  let l = parseFloat(match[3])
  let a = match[4] === "" ? 1 : parseFloat(match[4])

  // Normalizar porcentajes
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = h / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))

  let r = 0, g = 0, b = 0

  if(0 <= hp && hp < 1) [r, g, b] = [c, x, 0]
  else if(1 <= hp && hp < 2) [r, g, b] = [x, c, 0]
  else if(2 <= hp && hp < 3) [r, g, b] = [0, c, x]
  else if(3 <= hp && hp < 4) [r, g, b] = [0, x, c]
  else if(4 <= hp && hp < 5) [r, g, b] = [x, 0, c]
  else if(5 <= hp && hp < 6) [r, g, b] = [c, 0, x]

  const m = l - c / 2
  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)
  
  return `rgb(${r}, ${g}, ${b})`
}

export function hslaToHex(hslaStr) {
  // Regex para capturar valores de h, s, l, a
  const match = hslaStr.match(/hsla?\(\s*([\d.]+),\s*([\d.]+)%?,\s*([\d.]+)%?(?:,\s*([\d.]+))?\s*\)/i)
  if(!match) {
    throw new Error("Formato HSLA inválido: " + hslaStr)
  }

  let h = parseFloat(match[1])
  let s = parseFloat(match[2]) / 100
  let l = parseFloat(match[3]) / 100
  // alpha está en match[4], pero lo ignoramos

  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = h / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))

  let r = 0, g = 0, b = 0

  if(0 <= hp && hp < 1) [r, g, b] = [c, x, 0]
  else if(1 <= hp && hp < 2) [r, g, b] = [x, c, 0]
  else if(2 <= hp && hp < 3) [r, g, b] = [0, c, x]
  else if(3 <= hp && hp < 4) [r, g, b] = [0, x, c]
  else if(4 <= hp && hp < 5) [r, g, b] = [x, 0, c]
  else if(5 <= hp && hp < 6) [r, g, b] = [c, 0, x]

  const m = l - c / 2
  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  // Convertir a hex con padding
  const toHex = (val) => val.toString(16).padStart(2, "0").toUpperCase()
  let color = `#${toHex(r)}${toHex(g)}${toHex(b)}`
  if(color?.length!=7) {
    console.log("Revisar color:" + color)
  }
  return color
}

export function shuffle(array) {
    let arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

export function defineColumns(groups, fichasPerGroup) {
    const totales = groups * fichasPerGroup
    if(Math.sqrt(totales) === Math.ceil(Math.sqrt(totales))) return Math.sqrt(totales)
    else {
        for (let i = 0; i < totales; i++) {
            if(totales % i === 0 && totales / i < i) return i
        }
    }
}

export function isPrimeOrBanned(n, banned = []) {
    if(n < 2) return false
    if(banned.includes(n)) return true
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if(n % i === 0) return false
    }
    return true;
}

export function getClosestNotPrimeOrBanned(n, direction = 'up', banned = []) {
    do {
        if(direction === 'up') n++
        else n--;
    } while (isPrimeOrBanned(n, banned))
    return n;
}

export function getFancyTimeBySecs(initSecs) {
    const hours = Math.floor(initSecs / 3600)
    const minutes = Math.floor((initSecs % 3600) / 60)
    const seconds = initSecs % 60
    let facyTime
    
    if(hours) facyTime = `${hours}h+`
    else if(minutes) facyTime = `${minutes}m ${seconds}s`
    else facyTime = `${seconds}s`
    return facyTime
}

export function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function getHslaWError(colorOffset, totalSections, currentSection){
    const colorSection = 360 / totalSections * currentSection
    const colorErrorPerc = 360 / totalSections * currentSection * 5 / 100
    const colorError = (Math.random() * 2 * colorErrorPerc) - colorErrorPerc
    const colorHue = Math.min(359, (colorSection + colorError + colorOffset))
    return `hsla(${colorHue}, 40%, 40%, 1)`
}

export function getFancyModeName(modeName){
    return modeName === GAME_MODES.CLASSIC ? 'Clásico' : modeName === GAME_MODES.SEQUENCE ? 'Secuencia' : modeName === GAME_MODES.ROGUE ? 'Roguelike' : 'Modo no seleccionado'
}

export function inicializarFichas(totalGroups, fichasPerGroup, gameMode, suffle = true) {
    let auxFichas = []
    let keyCounter = 0
    const colorOffset = Math.random() * 360 / totalGroups
    // por c/grupo
    for(let index = 0; index < totalGroups; index++){
        // definir info de fichas del grupo
        const fichaAppearance = getRandomIcon()
        const colorFinal = getHslaWError(colorOffset, totalGroups, index)
        // agregar fichas del grupo
        for (let fichaOfGroup = 0; fichaOfGroup < fichasPerGroup; fichaOfGroup++) {
            auxFichas.push({ 
                id: keyCounter++, 
                groupId: index, 
                name: gameMode === GAME_MODES.CLASSIC ? fichaAppearance.name : null, 
                Icon: fichaAppearance.Icon,
                order: gameMode === GAME_MODES.SEQUENCE ? fichaOfGroup + 1 : null, // empieza en 1
                SecondaryIcon: gameMode === GAME_MODES.SEQUENCE ? numberIcons[fichaOfGroup] : null,
                color: colorFinal, 
                status: FICHA_STATUS.ESCONDIDA, 
                beingHinted: false 
            })
        }
    }
    if(suffle) auxFichas = shuffle(auxFichas)
    return auxFichas
}

export function getGroupsNFichasPerG(gameMode, sizeIndex){
    if(gameMode === GAME_MODES.ROGUE) {
        return {
        groups: GAME_RULES.ROGUE_BASE_GROUPS,
        fichasPerGroup: GAME_RULES.CLASSIC_FPG
        }
    } else {
        if(sizeIndex >= TABLERO_TYPES[gameMode].length) {
          sizeIndex = GAME_RULES.DEFAULT_TABLERO_SIZE
        }
        return {
            groups: TABLERO_TYPES[gameMode][sizeIndex].groups, 
            fichasPerGroup: TABLERO_TYPES[gameMode][sizeIndex].fichasPerGroup
        }
    }
}
