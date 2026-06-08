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
import './NezhaRobot.css'

interface NezhaRobotProps {
    motors: {
        m1: number  // -100 to 100
        m2: number
        m3: number
        m4: number
    }
    servos: {
        s1: number  // 0 to 180
        s2: number
    }
    sensors: {
        ultrasonic: number  // Distance in cm
        line_follower: boolean[]  // [left, right]
        color: string
    }
    onMotorChange: (motor: string, speed: number) => void
    onServoChange: (servo: string, angle: number) => void
}

const NezhaRobot: React.FC<NezhaRobotProps> = ({
    motors = { m1: 0, m2: 0, m3: 0, m4: 0 },
    servos = { s1: 90, s2: 90 },
    sensors = { ultrasonic: 50, line_follower: [false, false], color: 'none' },
    onMotorChange,
    onServoChange
}) => {
    const [activeTab, setActiveTab] = useState<'motors' | 'sensors'>('motors')

    const getWheelRotation = (speed: number) => {
        return speed > 0 ? 'rotating-forward' : speed < 0 ? 'rotating-backward' : ''
    }

    const getMotorColor = (speed: number) => {
        if (speed === 0) return '#333'
        return speed > 0 ? '#00ff88' : '#ff3366'
    }

    return (
        <div className="nezha-robot">
            <div className="nezha-header">
                <h3>🤖 Nezha Robot</h3>
                <div className="nezha-tabs">
                    <button
                        className={activeTab === 'motors' ? 'active' : ''}
                        onClick={() => setActiveTab('motors')}
                    >
                        ⚡ Motores
                    </button>
                    <button
                        className={activeTab === 'sensors' ? 'active' : ''}
                        onClick={() => setActiveTab('sensors')}
                    >
                        📡 Sensores
                    </button>
                </div>
            </div>

            <div className="nezha-visualization">
                {/* Robot body */}
                <div className="robot-body">
                    {/* Ultrasonic sensor */}
                    <div className="ultrasonic-sensor">
                        <div className="ultrasonic-eyes">
                            <span className="eye">👁️</span>
                            <span className="eye">👁️</span>
                        </div>
                        <div className="ultrasonic-value">{sensors.ultrasonic}cm</div>
                    </div>

                    {/* Main chassis */}
                    <div className="chassis">
                        <div className="cpu">NEZHA</div>
                        <div className="ports">
                            <span className="port">M1</span>
                            <span className="port">M2</span>
                            <span className="port">S1</span>
                            <span className="port">S2</span>
                        </div>
                    </div>

                    {/* Wheels */}
                    <div className="wheels">
                        <div
                            className={`wheel left ${getWheelRotation(motors.m1)}`}
                            style={{ borderColor: getMotorColor(motors.m1) }}
                        >
                            <span>{Math.abs(motors.m1)}%</span>
                        </div>
                        <div
                            className={`wheel right ${getWheelRotation(motors.m2)}`}
                            style={{ borderColor: getMotorColor(motors.m2) }}
                        >
                            <span>{Math.abs(motors.m2)}%</span>
                        </div>
                    </div>

                    {/* Line followers */}
                    <div className="line-followers">
                        <div className={`line-sensor ${sensors.line_follower[0] ? 'active' : ''}`}>L</div>
                        <div className={`line-sensor ${sensors.line_follower[1] ? 'active' : ''}`}>R</div>
                    </div>
                </div>
            </div>

            {activeTab === 'motors' && (
                <div className="nezha-controls">
                    <div className="motor-control">
                        <label>Motor 1 (M1)</label>
                        <input
                            type="range"
                            min="-100"
                            max="100"
                            value={motors.m1}
                            onChange={(e) => onMotorChange('m1', parseInt(e.target.value))}
                        />
                        <span className="motor-value" style={{ color: getMotorColor(motors.m1) }}>
                            {motors.m1}%
                        </span>
                    </div>
                    <div className="motor-control">
                        <label>Motor 2 (M2)</label>
                        <input
                            type="range"
                            min="-100"
                            max="100"
                            value={motors.m2}
                            onChange={(e) => onMotorChange('m2', parseInt(e.target.value))}
                        />
                        <span className="motor-value" style={{ color: getMotorColor(motors.m2) }}>
                            {motors.m2}%
                        </span>
                    </div>
                    <div className="servo-control">
                        <label>Servo 1 (S1)</label>
                        <input
                            type="range"
                            min="0"
                            max="180"
                            value={servos.s1}
                            onChange={(e) => onServoChange('s1', parseInt(e.target.value))}
                        />
                        <span className="servo-value">{servos.s1}°</span>
                    </div>
                </div>
            )}

            {activeTab === 'sensors' && (
                <div className="nezha-sensors">
                    <div className="sensor-item">
                        <span className="sensor-icon">📏</span>
                        <span className="sensor-name">Ultrasónico</span>
                        <span className="sensor-value">{sensors.ultrasonic} cm</span>
                    </div>
                    <div className="sensor-item">
                        <span className="sensor-icon">➖</span>
                        <span className="sensor-name">Seguidor línea</span>
                        <span className="sensor-value">
                            L: {sensors.line_follower[0] ? '⚫' : '⚪'}
                            R: {sensors.line_follower[1] ? '⚫' : '⚪'}
                        </span>
                    </div>
                    <div className="sensor-item">
                        <span className="sensor-icon">🎨</span>
                        <span className="sensor-name">Sensor color</span>
                        <span className="sensor-value">{sensors.color || 'ninguno'}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NezhaRobot
