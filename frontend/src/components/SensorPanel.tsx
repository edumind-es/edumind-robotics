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

import React, { useState, useEffect } from 'react'
import './SensorPanel.css'

interface SensorPanelProps {
    sensors: {
        temperature: number
        light_level: number
        accelerometer: { x: number; y: number; z: number }
    }
    onUpdateSensor: (sensor: string, value: number | { x: number; y: number; z: number }) => void
}

const SensorPanel: React.FC<SensorPanelProps> = ({ sensors, onUpdateSensor }) => {
    const [localTemp, setLocalTemp] = useState(sensors.temperature)
    const [localLight, setLocalLight] = useState(sensors.light_level)
    const [localAccel, setLocalAccel] = useState(sensors.accelerometer)

    // Sync with props
    useEffect(() => {
        setLocalTemp(sensors.temperature)
        setLocalLight(sensors.light_level)
        setLocalAccel(sensors.accelerometer)
    }, [sensors])

    const handleTempChange = (value: number) => {
        setLocalTemp(value)
        onUpdateSensor('temperature', value)
    }

    const handleLightChange = (value: number) => {
        setLocalLight(value)
        onUpdateSensor('light_level', value)
    }

    const handleAccelChange = (axis: 'x' | 'y' | 'z', value: number) => {
        const newAccel = { ...localAccel, [axis]: value }
        setLocalAccel(newAccel)
        onUpdateSensor('accelerometer', newAccel)
    }

    return (
        <div className="sensor-panel">
            <div className="sensor-panel__header">
                <div className="lme-card__badge">Sensores</div>
                <h3>Control de Sensores</h3>
            </div>

            <div className="sensor-panel__content">
                {/* Temperatura */}
                <div className="sensor-item">
                    <div className="sensor-item__header">
                        <span className="sensor-item__icon">🌡️</span>
                        <span className="sensor-item__name">Temperatura</span>
                        <span className="sensor-item__value">{localTemp}°C</span>
                    </div>
                    <input
                        type="range"
                        min="-5"
                        max="50"
                        value={localTemp}
                        onChange={(e) => handleTempChange(parseInt(e.target.value))}
                        className="sensor-slider sensor-slider--temp"
                    />
                    <div className="sensor-item__range">
                        <span>-5°C</span>
                        <span>50°C</span>
                    </div>
                </div>

                {/* Nivel de luz */}
                <div className="sensor-item">
                    <div className="sensor-item__header">
                        <span className="sensor-item__icon">💡</span>
                        <span className="sensor-item__name">Nivel de luz</span>
                        <span className="sensor-item__value">{localLight}/255</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="255"
                        value={localLight}
                        onChange={(e) => handleLightChange(parseInt(e.target.value))}
                        className="sensor-slider sensor-slider--light"
                    />
                    <div className="sensor-item__range">
                        <span>Oscuro</span>
                        <span>Brillante</span>
                    </div>
                </div>

                {/* Acelerómetro */}
                <div className="sensor-item sensor-item--accel">
                    <div className="sensor-item__header">
                        <span className="sensor-item__icon">📐</span>
                        <span className="sensor-item__name">Acelerómetro</span>
                    </div>

                    <div className="accel-axes">
                        <div className="accel-axis">
                            <label>X:</label>
                            <input
                                type="range"
                                min="-2000"
                                max="2000"
                                value={localAccel.x}
                                onChange={(e) => handleAccelChange('x', parseInt(e.target.value))}
                                className="sensor-slider sensor-slider--accel-x"
                            />
                            <span className="accel-value">{localAccel.x}mg</span>
                        </div>

                        <div className="accel-axis">
                            <label>Y:</label>
                            <input
                                type="range"
                                min="-2000"
                                max="2000"
                                value={localAccel.y}
                                onChange={(e) => handleAccelChange('y', parseInt(e.target.value))}
                                className="sensor-slider sensor-slider--accel-y"
                            />
                            <span className="accel-value">{localAccel.y}mg</span>
                        </div>

                        <div className="accel-axis">
                            <label>Z:</label>
                            <input
                                type="range"
                                min="-2000"
                                max="2000"
                                value={localAccel.z}
                                onChange={(e) => handleAccelChange('z', parseInt(e.target.value))}
                                className="sensor-slider sensor-slider--accel-z"
                            />
                            <span className="accel-value">{localAccel.z}mg</span>
                        </div>
                    </div>
                </div>

                {/* Indicador visual de inclinación */}
                <div className="tilt-indicator">
                    <div
                        className="tilt-ball"
                        style={{
                            transform: `translate(${localAccel.x / 40}px, ${localAccel.y / 40}px)`
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default SensorPanel
