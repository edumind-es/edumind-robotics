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

import React, { useState, useEffect, useRef } from 'react'
import './SensorGraphs.css'

interface SensorData {
    timestamp: number
    temperature: number
    light_level: number
    accelerometer: { x: number; y: number; z: number }
}

interface SensorGraphsProps {
    sensors: {
        temperature: number
        light_level: number
        accelerometer: { x: number; y: number; z: number }
    }
    onClose?: () => void
}

const MAX_DATA_POINTS = 50

const SensorGraphs: React.FC<SensorGraphsProps> = ({ sensors, onClose }) => {
    const [history, setHistory] = useState<SensorData[]>([])
    const [activeGraph, setActiveGraph] = useState<'temperature' | 'light' | 'accelerometer'>('temperature')
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { temperature, light_level, accelerometer } = sensors

    // Record sensor data
    useEffect(() => {
        const newData: SensorData = {
            timestamp: Date.now(),
            temperature,
            light_level,
            accelerometer,
        }

        setHistory(prev => [...prev, newData].slice(-MAX_DATA_POINTS))
    }, [
        temperature,
        light_level,
        accelerometer,
    ])

    // Draw graph
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || history.length < 2) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const width = canvas.width
        const height = canvas.height
        const padding = 30

        // Clear
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
        ctx.fillRect(0, 0, width, height)

        // Get data based on active graph
        let data: number[] = []
        let minVal = 0
        let maxVal = 100
        let color = '#00d9ff'
        let label = ''

        if (activeGraph === 'temperature') {
            data = history.map(h => h.temperature)
            minVal = -10
            maxVal = 50
            color = '#ff6b35'
            label = 'Temperatura (°C)'
        } else if (activeGraph === 'light') {
            data = history.map(h => h.light_level)
            minVal = 0
            maxVal = 255
            color = '#ffd700'
            label = 'Luz (0-255)'
        } else {
            // Accelerometer magnitude
            data = history.map(h =>
                Math.sqrt(h.accelerometer.x ** 2 + h.accelerometer.y ** 2 + h.accelerometer.z ** 2)
            )
            minVal = 0
            maxVal = 3000
            color = '#00ff88'
            label = 'Acelerómetro (mg)'
        }

        // Draw grid
        ctx.strokeStyle = 'rgba(0, 217, 255, 0.1)'
        ctx.lineWidth = 1
        for (let i = 0; i <= 4; i++) {
            const y = padding + (height - 2 * padding) * i / 4
            ctx.beginPath()
            ctx.moveTo(padding, y)
            ctx.lineTo(width - padding, y)
            ctx.stroke()
        }

        // Draw axis labels
        ctx.fillStyle = '#888'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'right'
        for (let i = 0; i <= 4; i++) {
            const y = padding + (height - 2 * padding) * i / 4
            const value = maxVal - (maxVal - minVal) * i / 4
            ctx.fillText(value.toFixed(0), padding - 5, y + 3)
        }

        // Draw data line
        if (data.length > 1) {
            ctx.strokeStyle = color
            ctx.lineWidth = 2
            ctx.beginPath()

            const xStep = (width - 2 * padding) / (MAX_DATA_POINTS - 1)

            data.forEach((value, i) => {
                const x = padding + i * xStep
                const normalizedValue = (value - minVal) / (maxVal - minVal)
                const y = height - padding - normalizedValue * (height - 2 * padding)

                if (i === 0) {
                    ctx.moveTo(x, y)
                } else {
                    ctx.lineTo(x, y)
                }
            })

            ctx.stroke()

            // Draw current value
            const lastValue = data[data.length - 1]
            ctx.fillStyle = color
            ctx.font = 'bold 14px sans-serif'
            ctx.textAlign = 'left'
            ctx.fillText(`${lastValue.toFixed(1)}`, width - padding + 5, height / 2)
        }

        // Draw label
        ctx.fillStyle = color
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(label, width / 2, 15)

    }, [history, activeGraph])

    return (
        <div className="sensor-graphs">
            <div className="sensor-graphs__header">
                <h3>📊 Gráficas de Sensores</h3>
                {onClose && <button className="close-btn" onClick={onClose}>×</button>}
            </div>

            <div className="sensor-graphs__tabs">
                <button
                    className={activeGraph === 'temperature' ? 'active' : ''}
                    onClick={() => setActiveGraph('temperature')}
                >
                    🌡️ Temp
                </button>
                <button
                    className={activeGraph === 'light' ? 'active' : ''}
                    onClick={() => setActiveGraph('light')}
                >
                    💡 Luz
                </button>
                <button
                    className={activeGraph === 'accelerometer' ? 'active' : ''}
                    onClick={() => setActiveGraph('accelerometer')}
                >
                    📐 Accel
                </button>
            </div>

            <div className="sensor-graphs__canvas">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={200}
                />
            </div>

            <div className="sensor-graphs__stats">
                <div className="stat">
                    <span className="stat-label">Temp:</span>
                    <span className="stat-value temp">{sensors.temperature}°C</span>
                </div>
                <div className="stat">
                    <span className="stat-label">Luz:</span>
                    <span className="stat-value light">{sensors.light_level}</span>
                </div>
                <div className="stat">
                    <span className="stat-label">Accel:</span>
                    <span className="stat-value accel">
                        {Math.sqrt(
                            sensors.accelerometer.x ** 2 +
                            sensors.accelerometer.y ** 2 +
                            sensors.accelerometer.z ** 2
                        ).toFixed(0)}mg
                    </span>
                </div>
            </div>
        </div>
    )
}

export default SensorGraphs
