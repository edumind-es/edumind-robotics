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

import React, { useState } from 'react'
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

const MakeyMakeyDisplay: React.FC<MakeyMakeyDisplayProps> = ({
    pins = {
        0: { state: 'released', is_touched: false, touch_count: 0 },
        1: { state: 'released', is_touched: false, touch_count: 0 },
        2: { state: 'released', is_touched: false, touch_count: 0 }
    },
    onPinTouch,
    onPinRelease
}) => {
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
            </div>

            <div className="makey-board">
                <div className="makey-ground">
                    <span>⏚ TIERRA</span>
                    <div className="ground-wire"></div>
                </div>

                <div className="makey-pins">
                    {[0, 1, 2].map(pin => (
                        <div
                            key={pin}
                            className={`makey-pin ${pins[pin]?.is_touched ? 'touched' : ''}`}
                            onMouseDown={() => handleTouchStart(pin)}
                            onMouseUp={() => handleTouchEnd(pin)}
                            onMouseLeave={() => handleTouchEnd(pin)}
                            onTouchStart={() => handleTouchStart(pin)}
                            onTouchEnd={() => handleTouchEnd(pin)}
                        >
                            <div className="pin-touch-zone">
                                <div className="pin-icon">
                                    {pin === 0 && '🍌'}
                                    {pin === 1 && '🥄'}
                                    {pin === 2 && '🧱'}
                                </div>
                                <div className="pin-label">Pin {pin}</div>
                                <div className="pin-note">{activeNotes[pin]}</div>
                            </div>
                            <div className="pin-count">×{pins[pin]?.touch_count || 0}</div>
                        </div>
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
