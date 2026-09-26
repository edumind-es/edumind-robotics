/*
 * Copyright (C) 2024-2026 Luis Vilela Acuña <contacto@edumind.es>
 * Author: Luis Vilela Acuña
 *
 * Traduce la matriz de 5x5 LEDs a palabras.
 *
 * El simulador es el corazón de la app y hasta ahora solo existía como
 * imagen: un alumno ciego o con baja visión no recibía nada de él. Y no es
 * solo cuestión de lectores de pantalla — poder leer la pantalla en texto
 * ayuda también a quien necesita comprobar el resultado sin fiarse de un
 * puñado de puntitos rojos pequeños.
 */

/* Figuras que el alumnado usa una y otra vez en clase. Reconocerlas permite
   decir "un corazón" en lugar de recitar veinticinco casillas. */
const FIGURAS: { nombre: string; patron: string }[] = [
  { nombre: 'un corazón', patron: '0101011111111110111000100' },
  { nombre: 'un corazón pequeño', patron: '0000001010011100010000000' },
  { nombre: 'una cara contenta', patron: '0000001010000001000101110' },
  { nombre: 'una sonrisa', patron: '0000000000000001000101110' },
  { nombre: 'una cara triste', patron: '0000001010000000111010001' },
  { nombre: 'una cara confusa', patron: '0000001010000000101010101' },
  { nombre: 'una cara enfadada', patron: '1000101010000001111110101' },
  { nombre: 'una cara dormida', patron: '0000011011000000111000000' },
  { nombre: 'una cara sorprendida', patron: '0101000000001000101000100' },
  { nombre: 'una cara de burla', patron: '1000100000111110010100111' },
  { nombre: 'una marca de acierto', patron: '0000000001000101010001000' },
  { nombre: 'una equis', patron: '1000101010001000101010001' },
  { nombre: 'una diana', patron: '0111010001101011000101110' },
  { nombre: 'un cuadrado', patron: '1111110001100011000111111' },
  { nombre: 'un cuadrado pequeño', patron: '0000001110010100111000000' },
  { nombre: 'un rombo', patron: '0010001010100010101000100' },
  { nombre: 'un rombo pequeño', patron: '0000000100010100010000000' },
  { nombre: 'un triángulo', patron: '0000000100010101111100000' },
  { nombre: 'un tablero de ajedrez', patron: '0101010101010101010101010' },
  { nombre: 'un pato', patron: '0110011100011110111000000' },
  { nombre: 'una casa', patron: '0010001110111110111001010' },
  { nombre: 'un fantasma', patron: '1111110101111111111110101' },
  { nombre: 'un paraguas', patron: '0111011111001001010001100' },
  { nombre: 'una serpiente', patron: '1100011011010100111000000' },
  { nombre: 'una espada', patron: '0010000100001000111000100' },
  { nombre: 'un árbol de Navidad', patron: '0010001110001000111011111' },
  { nombre: 'una flecha hacia arriba', patron: '0010001110101010010000100' },
  { nombre: 'una flecha hacia abajo', patron: '0010000100101010111000100' },
  { nombre: 'una flecha hacia la derecha', patron: '0010000010111110001000100' },
  { nombre: 'una flecha hacia la izquierda', patron: '0010001000111110100000100' },
]

function aPatron(grid: number[][]): string {
  return grid.map((fila) => fila.map((v) => (v > 0 ? '1' : '0')).join('')).join('')
}

export function contarEncendidos(grid: number[][]): number {
  return grid.reduce((total, fila) => total + fila.filter((v) => v > 0).length, 0)
}

/*
 * Descripción corta, pensada para leerse en voz alta sin cansar. Es la que
 * anuncia el lector de pantalla cuando la pantalla cambia.
 */
export function describirPantalla(grid: number[][]): string {
  const encendidos = contarEncendidos(grid)
  if (encendidos === 0) return 'La pantalla del micro:bit está apagada.'

  const figura = FIGURAS.find((f) => f.patron === aPatron(grid))
  if (figura) {
    return `La pantalla del micro:bit muestra ${figura.nombre}, con ${encendidos} luces encendidas.`
  }

  if (encendidos === 1) {
    const fila = grid.findIndex((f) => f.some((v) => v > 0))
    const columna = grid[fila].findIndex((v) => v > 0)
    return `La pantalla del micro:bit tiene una sola luz encendida, en la fila ${fila + 1}, columna ${columna + 1}.`
  }

  return `La pantalla del micro:bit tiene ${encendidos} de 25 luces encendidas.`
}

/*
 * Descripción larga: fila por fila. Es la que se despliega cuando el alumno
 * pide "leer la pantalla", y permite reconstruir el dibujo mentalmente.
 */
export function describirFilas(grid: number[][]): string[] {
  return grid.map((fila, i) => {
    const encendidas = fila
      .map((v, j) => (v > 0 ? j + 1 : 0))
      .filter((n) => n > 0)
    if (encendidas.length === 0) return `Fila ${i + 1}: apagada.`
    if (encendidas.length === 5) return `Fila ${i + 1}: entera encendida.`
    return `Fila ${i + 1}: luces ${encendidas.join(', ')}.`
  })
}

/* Dibujo en caracteres: se ve en texto plano y se copia y pega. */
export function dibujarEnTexto(grid: number[][]): string {
  return grid.map((fila) => fila.map((v) => (v > 0 ? '#' : '·')).join(' ')).join('\n')
}
