/*
 * Copyright (C) 2024-2026 Luis Vilela Acuña <contacto@edumind.es>
 * Author: Luis Vilela Acuña
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useState } from 'react'
import { describirPantalla, describirFilas, dibujarEnTexto } from '../lib/describirPantalla'
import { useTextos } from '../hooks/usePreferencias'
import './MicrobitDisplay.css'

interface MicrobitDisplayProps {
  grid: number[][]
  buttons: {
    a: { state: string; pressed: boolean }
    b: { state: string; pressed: boolean }
  }
  onButtonPress: (button: 'a' | 'b') => void
  onButtonRelease: (button: 'a' | 'b') => void
}

const MicrobitDisplay: React.FC<MicrobitDisplayProps> = ({
  grid,
  buttons,
  onButtonPress,
  onButtonRelease,
}) => {
  const { t } = useTextos()
  const [verTexto, setVerTexto] = useState(false)
  const descripcion = describirPantalla(grid)

  /*
   * Los botones respondían solo al ratón, así que con teclado se podían
   * enfocar pero no pulsar. Ahora Espacio y Enter hacen lo mismo que el
   * dedo: mantener pulsado mientras la tecla está abajo.
   */
  const teclaPulsa = (boton: 'a' | 'b') => (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (!e.repeat) onButtonPress(boton)
    }
  }
  const teclaSuelta = (boton: 'a' | 'b') => (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onButtonRelease(boton)
    }
  }

  return (
    <div className="lme-card microbit-container">
      <div className="lme-card__badge">micro:bit Virtual</div>
      <h2 className="microbit-title">{t('sim.titulo')}</h2>

      {/*
        Lo que ocurre en la pantalla se anuncia en voz alta al cambiar: sin
        esto, ejecutar el código no producía ninguna señal para quien no ve
        la matriz.
      */}
      <p className="solo-lectores" aria-live="polite">{descripcion}</p>

      {/* Board visual representation */}
      <div className="microbit-board">
        {/* Button A */}
        <button
          className={`microbit-button microbit-button--a ${buttons.a.pressed ? 'pressed' : ''}`}
          onMouseDown={() => onButtonPress('a')}
          onMouseUp={() => onButtonRelease('a')}
          onMouseLeave={() => onButtonRelease('a')}
          onKeyDown={teclaPulsa('a')}
          onKeyUp={teclaSuelta('a')}
          aria-pressed={buttons.a.pressed}
          aria-label={`Botón A del micro:bit. Mantén pulsado Espacio para apretarlo.`}
        >
          A
        </button>

        {/* LED Matrix 5x5 */}
        <div className="led-matrix" role="img" aria-label={descripcion}>
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="led-row">
              {row.map((intensity, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`led-pixel ${intensity > 0 ? 'led-pixel--on' : ''}`}
                  data-testid={`led-${rowIndex}-${colIndex}`}
                  title={`Fila ${rowIndex + 1}, columna ${colIndex + 1}: ${intensity > 0 ? 'encendida' : 'apagada'}`}
                  style={{ opacity: intensity > 0 ? Math.max(intensity / 9, 0.55) : 1 }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Button B */}
        <button
          className={`microbit-button microbit-button--b ${buttons.b.pressed ? 'pressed' : ''}`}
          onMouseDown={() => onButtonPress('b')}
          onMouseUp={() => onButtonRelease('b')}
          onMouseLeave={() => onButtonRelease('b')}
          onKeyDown={teclaPulsa('b')}
          onKeyUp={teclaSuelta('b')}
          aria-pressed={buttons.b.pressed}
          aria-label={`Botón B del micro:bit. Mantén pulsado Espacio para apretarlo.`}
        >
          B
        </button>
      </div>

      <div className="microbit-lectura">
        <button
          type="button"
          className="microbit-lectura__btn"
          onClick={() => setVerTexto(!verTexto)}
          aria-expanded={verTexto}
        >
          {verTexto ? t('sim.ocultarTexto') : t('sim.leerTexto')}
        </button>

        {verTexto && (
          <div className="microbit-lectura__panel">
            <p className="microbit-lectura__resumen">{descripcion}</p>
            <ul className="microbit-lectura__filas">
              {describirFilas(grid).map((linea) => (
                <li key={linea}>{linea}</li>
              ))}
            </ul>
            <pre className="microbit-lectura__dibujo" aria-hidden="true">{dibujarEnTexto(grid)}</pre>
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className="microbit-status">
        <span className="status-dot"></span>
        <span className="status-text">{t('sim.activo')}</span>
      </div>
    </div>
  )
}

export default MicrobitDisplay
