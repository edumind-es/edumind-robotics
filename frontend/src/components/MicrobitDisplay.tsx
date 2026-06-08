/*
 * Copyright (C) 2024-2025 EDUmind - Los Mundos Edufis
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

import React from 'react'
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
  return (
    <div className="lme-card microbit-container">
      <div className="lme-card__badge">micro:bit Virtual</div>
      <h3 className="microbit-title">Simulador</h3>

      {/* Board visual representation */}
      <div className="microbit-board">
        {/* Button A */}
        <button
          className={`microbit-button microbit-button--a ${buttons.a.pressed ? 'pressed' : ''}`}
          onMouseDown={() => onButtonPress('a')}
          onMouseUp={() => onButtonRelease('a')}
          onMouseLeave={() => onButtonRelease('a')}
        >
          A
        </button>

        {/* LED Matrix 5x5 */}
        <div className="led-matrix">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="led-row">
              {row.map((intensity, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="led-pixel"
                  data-testid={`led-${rowIndex}-${colIndex}`}
                  style={{
                    opacity: intensity / 9,
                    backgroundColor: intensity > 0 ? '#ff3333' : '#1a1a1a',
                  }}
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
        >
          B
        </button>
      </div>

      {/* Status indicator */}
      <div className="microbit-status">
        <span className="status-dot"></span>
        <span className="status-text">Simulador activo</span>
      </div>
    </div>
  )
}

export default MicrobitDisplay
