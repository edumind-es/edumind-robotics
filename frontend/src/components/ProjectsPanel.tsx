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

import React, { useRef, useState, useEffect } from 'react'
import './ProjectsPanel.css'

interface Project {
    id: string
    name: string
    code: string
    createdAt: string
    updatedAt: string
    platform: 'microbit' | 'nezha' | 'makey_makey'
}

interface ProjectsPanelProps {
    currentCode: string
    onLoadProject: (code: string) => void
    onClose?: () => void
}

const STORAGE_KEY = 'edumind_robotics_projects'

const ProjectsPanel: React.FC<ProjectsPanelProps> = ({
    currentCode,
    onLoadProject,
    onClose
}) => {
    const [projects, setProjects] = useState<Project[]>([])
    const [newProjectName, setNewProjectName] = useState('')
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [showSaveModal, setShowSaveModal] = useState(false)
    const importInputRef = useRef<HTMLInputElement>(null)

    // Load projects from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                setProjects(JSON.parse(stored))
            } catch (e) {
                console.error('Error loading projects:', e)
            }
        }
    }, [])

    // Save projects to localStorage
    const saveToStorage = (updatedProjects: Project[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects))
        setProjects(updatedProjects)
    }

    const handleSaveProject = () => {
        if (!newProjectName.trim()) return

        const newProject: Project = {
            id: `proj_${Date.now()}`,
            name: newProjectName.trim(),
            code: currentCode,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            platform: 'microbit'
        }

        saveToStorage([newProject, ...projects])
        setNewProjectName('')
        setShowSaveModal(false)
    }

    const handleUpdateProject = (project: Project) => {
        const updated = projects.map(p =>
            p.id === project.id
                ? { ...p, code: currentCode, updatedAt: new Date().toISOString() }
                : p
        )
        saveToStorage(updated)
    }

    const handleDeleteProject = (id: string) => {
        if (confirm('¿Eliminar este proyecto?')) {
            saveToStorage(projects.filter(p => p.id !== id))
            if (selectedProject?.id === id) {
                setSelectedProject(null)
            }
        }
    }

    const handleLoadProject = (project: Project) => {
        onLoadProject(project.code)
        setSelectedProject(project)
        if (onClose) onClose()
    }

    const handleExportProjects = () => {
        const payload = {
            type: 'edumind-robotics-projects',
            version: 1,
            exportedAt: new Date().toISOString(),
            projects,
        }
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `edumind-robotics-proyectos-${new Date().toISOString().slice(0, 10)}.json`
        link.click()
        URL.revokeObjectURL(url)
    }

    const handleImportProjects = async (file: File | undefined) => {
        if (!file) return

        try {
            const text = await file.text()
            const payload = JSON.parse(text)
            const importedProjects = Array.isArray(payload.projects) ? payload.projects : []
            const safeProjects: Project[] = importedProjects
                .filter((project: Partial<Project>) => project.name && project.code)
                .map((project: Partial<Project>) => ({
                    id: `proj_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                    name: String(project.name).slice(0, 80),
                    code: String(project.code),
                    createdAt: project.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    platform: ['microbit', 'nezha', 'makey_makey'].includes(String(project.platform))
                        ? project.platform as Project['platform']
                        : 'microbit',
                }))

            saveToStorage([...safeProjects, ...projects])
        } catch (error) {
            console.error('Error importing projects:', error)
            alert('No se pudo importar el archivo de proyectos.')
        } finally {
            if (importInputRef.current) {
                importInputRef.current.value = ''
            }
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="projects-panel">
            <div className="projects-panel__header">
                <h3>💾 Mis Proyectos</h3>
                {onClose && (
                    <button className="close-btn" onClick={onClose}>×</button>
                )}
            </div>

            <div className="projects-panel__actions">
                <button
                    className="save-new-btn"
                    onClick={() => setShowSaveModal(true)}
                >
                    ➕ Guardar proyecto actual
                </button>
                <div className="projects-panel__secondary-actions">
                    <button type="button" onClick={handleExportProjects} disabled={projects.length === 0}>
                        Exportar JSON
                    </button>
                    <button type="button" onClick={() => importInputRef.current?.click()}>
                        Importar JSON
                    </button>
                    <input
                        ref={importInputRef}
                        type="file"
                        accept="application/json,.json"
                        onChange={(event) => handleImportProjects(event.target.files?.[0])}
                        hidden
                    />
                </div>
            </div>

            <div className="projects-panel__list">
                {projects.length === 0 ? (
                    <div className="projects-empty">
                        <p>No hay proyectos guardados</p>
                        <small>Guarda tu código para continuar más tarde</small>
                    </div>
                ) : (
                    projects.map(project => (
                        <div
                            key={project.id}
                            className={`project-item ${selectedProject?.id === project.id ? 'active' : ''}`}
                        >
                            <div className="project-item__info" onClick={() => handleLoadProject(project)}>
                                <span className="project-name">{project.name}</span>
                                <span className="project-date">{formatDate(project.updatedAt)}</span>
                            </div>
                            <div className="project-item__actions">
                                <button
                                    className="update-btn"
                                    onClick={() => handleUpdateProject(project)}
                                    title="Actualizar con código actual"
                                >
                                    🔄
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDeleteProject(project.id)}
                                    title="Eliminar"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Save Modal */}
            {showSaveModal && (
                <div className="save-modal-overlay" onClick={() => setShowSaveModal(false)}>
                    <div className="save-modal" onClick={e => e.stopPropagation()}>
                        <h4>Guardar proyecto</h4>
                        <input
                            type="text"
                            placeholder="Nombre del proyecto..."
                            value={newProjectName}
                            onChange={e => setNewProjectName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSaveProject()}
                            autoFocus
                        />
                        <div className="save-modal__actions">
                            <button onClick={() => setShowSaveModal(false)}>Cancelar</button>
                            <button
                                onClick={handleSaveProject}
                                disabled={!newProjectName.trim()}
                                className="primary"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProjectsPanel
