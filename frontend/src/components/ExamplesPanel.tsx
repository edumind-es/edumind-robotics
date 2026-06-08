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

import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import './ExamplesPanel.css'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

interface Template {
    id: string
    title: string
    description: string
    difficulty: string
    platform: string
    code: string
    tags: string[]
    explanation: string
}

interface ExamplesPanelProps {
    onSelectExample: (code: string) => void
    onClose?: () => void
}

const ExamplesPanel: React.FC<ExamplesPanelProps> = ({ onSelectExample, onClose }) => {
    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<{ platform?: string; difficulty?: string }>({})
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const loadTemplates = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filter.platform) params.append('platform', filter.platform)
            if (filter.difficulty) params.append('difficulty', filter.difficulty)

            const response = await axios.get(`${API_BASE}/code/templates?${params}`)
            setTemplates(response.data.templates)
        } catch (error) {
            console.error('Error loading templates:', error)
        } finally {
            setLoading(false)
        }
    }, [filter])

    useEffect(() => {
        loadTemplates()
    }, [loadTemplates])

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadTemplates()
            return
        }

        setLoading(true)
        try {
            const response = await axios.get(`${API_BASE}/code/templates/search/${encodeURIComponent(searchQuery)}`)
            setTemplates(response.data.templates)
        } catch (error) {
            console.error('Error searching templates:', error)
        } finally {
            setLoading(false)
        }
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return '#00ff88'
            case 'intermediate': return '#ffd700'
            case 'advanced': return '#ff3366'
            default: return '#00d9ff'
        }
    }

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return '🌱 Principiante'
            case 'intermediate': return '🌿 Intermedio'
            case 'advanced': return '🌳 Avanzado'
            default: return difficulty
        }
    }

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'microbit': return '🔲'
            case 'nezha': return '🤖'
            case 'makey_makey': return '🎹'
            default: return '💻'
        }
    }

    const handleSelectTemplate = (template: Template) => {
        setSelectedTemplate(template)
    }

    const handleUseCode = () => {
        if (selectedTemplate) {
            onSelectExample(selectedTemplate.code)
            setSelectedTemplate(null)
            if (onClose) onClose()
        }
    }

    return (
        <div className="examples-panel">
            <div className="examples-panel__header">
                <div className="examples-panel__title">
                    <h3>📚 Biblioteca de Ejemplos</h3>
                    {onClose && (
                        <button className="close-btn" onClick={onClose}>×</button>
                    )}
                </div>

                {/* Search */}
                <div className="examples-search">
                    <input
                        type="text"
                        placeholder="Buscar ejemplos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch}>🔍</button>
                </div>

                {/* Filters */}
                <div className="examples-filters">
                    <select
                        value={filter.platform || ''}
                        onChange={(e) => setFilter({ ...filter, platform: e.target.value || undefined })}
                    >
                        <option value="">Todas las plataformas</option>
                        <option value="microbit">🔲 micro:bit</option>
                        <option value="nezha">🤖 Nezha</option>
                        <option value="makey_makey">🎹 Makey Makey</option>
                    </select>

                    <select
                        value={filter.difficulty || ''}
                        onChange={(e) => setFilter({ ...filter, difficulty: e.target.value || undefined })}
                    >
                        <option value="">Todos los niveles</option>
                        <option value="beginner">🌱 Principiante</option>
                        <option value="intermediate">🌿 Intermedio</option>
                        <option value="advanced">🌳 Avanzado</option>
                    </select>
                </div>
            </div>

            <div className="examples-panel__content">
                {loading ? (
                    <div className="examples-loading">
                        <div className="spinner"></div>
                        <p>Cargando ejemplos...</p>
                    </div>
                ) : templates.length === 0 ? (
                    <div className="examples-empty">
                        <p>No se encontraron ejemplos</p>
                    </div>
                ) : (
                    <div className="examples-grid">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                className={`example-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                                onClick={() => handleSelectTemplate(template)}
                            >
                                <div className="example-card__header">
                                    <span className="example-platform">{getPlatformIcon(template.platform)}</span>
                                    <h4>{template.title}</h4>
                                </div>
                                <p className="example-description">{template.description}</p>
                                <div className="example-meta">
                                    <span
                                        className="example-difficulty"
                                        style={{ color: getDifficultyColor(template.difficulty) }}
                                    >
                                        {getDifficultyLabel(template.difficulty)}
                                    </span>
                                </div>
                                <div className="example-tags">
                                    {template.tags.slice(0, 3).map((tag) => (
                                        <span key={tag} className="example-tag">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Preview modal */}
            {selectedTemplate && (
                <div className="example-preview-overlay" onClick={() => setSelectedTemplate(null)}>
                    <div className="example-preview" onClick={(e) => e.stopPropagation()}>
                        <div className="example-preview__header">
                            <h3>{selectedTemplate.title}</h3>
                            <button onClick={() => setSelectedTemplate(null)}>×</button>
                        </div>
                        <div className="example-preview__content">
                            <p className="example-preview__description">{selectedTemplate.description}</p>

                            <div className="example-preview__code">
                                <pre><code>{selectedTemplate.code}</code></pre>
                            </div>

                            <div className="example-preview__explanation">
                                <h4>💡 Explicación:</h4>
                                <p>{selectedTemplate.explanation}</p>
                            </div>
                        </div>
                        <div className="example-preview__actions">
                            <button className="cancel-btn" onClick={() => setSelectedTemplate(null)}>
                                Cancelar
                            </button>
                            <button className="use-btn" onClick={handleUseCode}>
                                👉 Usar este código
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ExamplesPanel
