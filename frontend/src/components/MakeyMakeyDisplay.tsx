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
import { useTextos } from '../hooks/usePreferencias'
import './MakeyMakeyDisplay.css'

interface WindowWithWebkitAudio extends Window {
    webkitAudioContext?: typeof AudioContext
}

interface MakeyMakeyDisplayProps {
    pins: {
        [key: number]: {
            state: string
            is_touched: boolean
            touch_count: number
        }
    }
    onPinTouch: (pin: number) => void
    onPinRelease: (pin: number) => void
}

/* Qué se conecta a cada pin, para poder nombrarlo en voz alta. */
const OBJETOS: Record<number, string> = {
    0: 'una banana',
    1: 'una cuchara',
    2: 'un trozo de plastilina',
}

const MakeyMakeyDisplay: React.FC<MakeyMakeyDisplayProps> = ({
    pins = {
        0: { state: 'released', is_touched: false, touch_count: 0 },
        1: { state: 'released', is_touched: false, touch_count: 0 },
        2: { state: 'released', is_touched: false, touch_count: 0 }
    },
    onPinTouch,
    onPinRelease
}) => {
    const { t } = useTextos()
    const [activeNotes] = useState(['Do', 'Re', 'Mi'])

    const handleTouchStart = (pin: number) => {
        onPinTouch(pin)
        // Play sound effect
        playNote(pin)
    }

    const handleTouchEnd = (pin: number) => {
        onPinRelease(pin)
    }

    const playNote = (pin: number) => {
        const frequencies = [261.63, 293.66, 329.63] // C4, D4, E4
        const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext
        if (!AudioContextClass) return

        const audioContext = new AudioContextClass()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = frequencies[pin]
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
    }

    return (
        <div className="makey-makey-display">
            <div className="makey-header">
                <h3>🎹 Makey Makey</h3>
                <span className="makey-subtitle">Toca los pines conductores</span>
                <span className="makey-clon">{t('makey.tambien')}</span>
            </div>

            <div className="makey-board">
                <div className="makey-ground">
                    <span>⏚ TIERRA</span>
                    <div className="ground-wire"></div>
                </div>

                <div className="makey-pins">
                    {[0, 1, 2].map(pin => (
                        /*
                          Eran <div> con eventos de ratón: no se podían enfocar
                          ni activar con teclado, así que el Makey Makey quedaba
                          fuera del alcance de quien no usa ratón. Ahora son
                          botones de verdad y responden a Espacio y Enter.
                        */
                        <button
                            key={pin}
                            type="button"
                            className={`makey-pin ${pins[pin]?.is_touched ? 'touched' : ''}`}
                            aria-pressed={Boolean(pins[pin]?.is_touched)}
                            aria-label={`Pin ${pin}, ${OBJETOS[pin]}. Tocado ${pins[pin]?.touch_count || 0} veces. Mantén pulsado Espacio para tocarlo.`}
                            onMouseDown={() => handleTouchStart(pin)}
                            onMouseUp={() => handleTouchEnd(pin)}
                            onMouseLeave={() => handleTouchEnd(pin)}
                            onTouchStart={() => handleTouchStart(pin)}
                            onTouchEnd={() => handleTouchEnd(pin)}
                            onKeyDown={(e) => {
                                if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                                    e.preventDefault()
                                    handleTouchStart(pin)
                                }
                            }}
                            onKeyUp={(e) => {
                                if (e.key === ' ' || e.key === 'Enter') {
                                    e.preventDefault()
                                    handleTouchEnd(pin)
                                }
                            }}
                        >
                            <div className="pin-touch-zone">
                                <div className="pin-icon" aria-hidden="true">
                                    {pin === 0 && '🍌'}
                                    {pin === 1 && '🥄'}
                                    {pin === 2 && '🧱'}
                                </div>
                                <div className="pin-label">Pin {pin}</div>
                                <div className="pin-note">{activeNotes[pin]}</div>
                            </div>
                            <div className="pin-count" aria-hidden="true">×{pins[pin]?.touch_count || 0}</div>
                        </button>
                    ))}
                </div>

                <div className="makey-chip">
                    <span>MAKEY MAKEY</span>
                </div>
            </div>

            <div className="makey-instructions">
                <p>
                    💡 <strong>Tip:</strong> Conecta objetos conductores (frutas, agua, plastilina)
                    a los pines para crear instrumentos musicales o controles de juego.
                </p>
            </div>
        </div>
    )
}

export default MakeyMakeyDisplay
