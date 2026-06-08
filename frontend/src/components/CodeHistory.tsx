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
import './CodeHistory.css'

/* eslint-disable react-refresh/only-export-components */

interface HistoryEntry {
    id: string
    code: string
    timestamp: string
    output?: string
    success: boolean
}

interface CodeHistoryProps {
    onLoadCode: (code: string) => void
    onClose?: () => void
}

const HISTORY_KEY = 'edumind_robotics_history'
const MAX_HISTORY = 20

// Export para que otros componentes puedan añadir al historial
export const addToHistory = (code: string, output: string, success: boolean) => {
    const stored = localStorage.getItem(HISTORY_KEY)
    let history: HistoryEntry[] = stored ? JSON.parse(stored) : []

    const entry: HistoryEntry = {
        id: `hist_${Date.now()}`,
        code,
        timestamp: new Date().toISOString(),
        output: output.substring(0, 200), // Limitar output
        success
    }

    history = [entry, ...history].slice(0, MAX_HISTORY)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

const CodeHistory: React.FC<CodeHistoryProps> = ({ onLoadCode, onClose }) => {
    const [history, setHistory] = useState<HistoryEntry[]>(() => {
        const stored = localStorage.getItem(HISTORY_KEY)
        return stored ? JSON.parse(stored) : []
    })
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const handleClearHistory = () => {
        if (confirm('¿Eliminar todo el historial?')) {
            localStorage.removeItem(HISTORY_KEY)
            setHistory([])
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) return 'Hoy'
        if (date.toDateString() === yesterday.toDateString()) return 'Ayer'
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    }

    const getCodePreview = (code: string) => {
        const lines = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'))
        return lines.slice(0, 2).join(' • ').substring(0, 50) + '...'
    }

    return (
        <div className="code-history">
            <div className="code-history__header">
                <h3>📜 Historial de ejecuciones</h3>
                <div className="header-actions">
                    {history.length > 0 && (
                        <button className="clear-btn" onClick={handleClearHistory}>
                            🗑️ Limpiar
                        </button>
                    )}
                    {onClose && (
                        <button className="close-btn" onClick={onClose}>×</button>
                    )}
                </div>
            </div>

            <div className="code-history__list">
                {history.length === 0 ? (
                    <div className="history-empty">
                        <p>No hay ejecuciones recientes</p>
                    </div>
                ) : (
                    history.map(entry => (
                        <div
                            key={entry.id}
                            className={`history-item ${entry.success ? 'success' : 'error'}`}
                        >
                            <div
                                className="history-item__header"
                                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                            >
                                <span className="history-status">
                                    {entry.success ? '✓' : '✗'}
                                </span>
                                <span className="history-preview">{getCodePreview(entry.code)}</span>
                                <span className="history-time">
                                    {formatDate(entry.timestamp)} {formatTime(entry.timestamp)}
                                </span>
                            </div>

                            {expandedId === entry.id && (
                                <div className="history-item__expanded">
                                    <pre><code>{entry.code}</code></pre>
                                    {entry.output && (
                                        <div className="history-output">
                                            <strong>Output:</strong> {entry.output}
                                        </div>
                                    )}
                                    <button
                                        className="load-btn"
                                        onClick={() => onLoadCode(entry.code)}
                                    >
                                        📋 Cargar en editor
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default CodeHistory
