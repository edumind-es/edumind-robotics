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
import axios from 'axios'
import './ExportPanel.css'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

interface ExportPanelProps {
    code: string
    projectName?: string
    onClose?: () => void
}

type ExportFormat = 'micropython' | 'makecode' | 'scratch' | 'hardware-bundle'
type HardwareTarget = 'microbit_v1' | 'microbit_v2' | 'nezha' | 'makey_makey'

const ExportPanel: React.FC<ExportPanelProps> = ({
    code,
    projectName = 'EDUmind_Project',
    onClose
}) => {
    const [exporting, setExporting] = useState(false)
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null)
    const [showInstructions, setShowInstructions] = useState(false)
    const [instructions, setInstructions] = useState('')
    const [hardwareTarget, setHardwareTarget] = useState<HardwareTarget>('microbit_v2')

    const formats = [
        {
            id: 'micropython' as ExportFormat,
            title: '🐍 MicroPython',
            description: 'Archivo .py para cargar con mu-editor',
            extension: '.py',
            icon: '📄'
        },
        {
            id: 'makecode' as ExportFormat,
            title: '🧩 MakeCode',
            description: 'Proyecto JSON para makecode.microbit.org',
            extension: '.json',
            icon: '📦'
        },
        {
            id: 'scratch' as ExportFormat,
            title: '🐱 Scratch 3.0',
            description: 'Proyecto .sb3 con extensión micro:bit',
            extension: '.sb3',
            icon: '🎮'
        },
        {
            id: 'hardware-bundle' as ExportFormat,
            title: '🔌 Paquete hardware real',
            description: 'ZIP con main.py, perfil, ajustes y guía de carga',
            extension: '.zip',
            icon: '🧰'
        }
    ]

    const handleExport = async (format: ExportFormat) => {
        setExporting(true)
        setSelectedFormat(format)

        try {
            const response = await axios.post(
                `${API_BASE}/export/${format}`,
                {
                    code,
                    project_name: projectName,
                    hardware_target: hardwareTarget,
                    settings: {
                        safe_motor_speed: 40,
                        motor_ports: { left: 1, right: 2 },
                        servo_ports: { default: 1 },
                        touch_pins: [0, 1, 2],
                    },
                },
                { responseType: 'blob' }
            )

            // Get filename from content-disposition header or use default
            const contentDisposition = response.headers['content-disposition']
            let filename = `${projectName}.${format === 'micropython' ? 'py' : format === 'makecode' ? 'json' : format === 'scratch' ? 'sb3' : 'zip'}`
            if (contentDisposition) {
                const match = contentDisposition.match(/filename=(.+)/)
                if (match) filename = match[1]
            }

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', filename)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

        } catch (error) {
            console.error('Error exporting:', error)
            alert('Error al exportar el código')
        } finally {
            setExporting(false)
            setSelectedFormat(null)
        }
    }

    const loadInstructions = async () => {
        try {
            const response = await axios.get(`${API_BASE}/export/instructions`)
            setInstructions(response.data.instructions)
            setShowInstructions(true)
        } catch (error) {
            console.error('Error loading instructions:', error)
        }
    }

    return (
        <div className="export-panel">
            <div className="export-panel__header">
                <h3>📤 Exportar Código</h3>
                {onClose && (
                    <button className="close-btn" onClick={onClose}>×</button>
                )}
            </div>

            <div className="export-panel__content">
                <p className="export-info">
                    Exporta tu código para usar en hardware real o en otras plataformas.
                </p>

                <label className="hardware-target">
                    <span>Hardware objetivo</span>
                    <select
                        value={hardwareTarget}
                        onChange={(event) => setHardwareTarget(event.target.value as HardwareTarget)}
                    >
                        <option value="microbit_v2">micro:bit v2</option>
                        <option value="microbit_v1">micro:bit v1</option>
                        <option value="nezha">Nezha + micro:bit</option>
                        <option value="makey_makey">Makey Makey / pines táctiles</option>
                    </select>
                </label>

                <div className="export-formats">
                    {formats.map((format) => (
                        <button
                            key={format.id}
                            className={`export-format-btn ${selectedFormat === format.id ? 'exporting' : ''}`}
                            onClick={() => handleExport(format.id)}
                            disabled={exporting || !code.trim()}
                        >
                            <span className="format-icon">{format.icon}</span>
                            <div className="format-info">
                                <strong>{format.title}</strong>
                                <span>{format.description}</span>
                            </div>
                            {selectedFormat === format.id && exporting && (
                                <span className="export-spinner">⏳</span>
                            )}
                        </button>
                    ))}
                </div>

                {!code.trim() && (
                    <p className="export-warning">
                        ⚠️ Escribe código antes de exportar
                    </p>
                )}

                <button
                    className="instructions-btn"
                    onClick={loadInstructions}
                >
                    ❓ ¿Cómo cargo el código al micro:bit?
                </button>
            </div>

            {/* Instructions Modal */}
            {showInstructions && (
                <div className="instructions-overlay" onClick={() => setShowInstructions(false)}>
                    <div className="instructions-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="instructions-header">
                            <h3>📖 Instrucciones</h3>
                            <button onClick={() => setShowInstructions(false)}>×</button>
                        </div>
                        <div className="instructions-content">
                            <pre>{instructions}</pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ExportPanel
