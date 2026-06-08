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
import './Achievements.css'

/* eslint-disable react-refresh/only-export-components */

export interface Achievement {
    id: string
    title: string
    description: string
    icon: string
    points: number
    unlocked: boolean
    unlockedAt?: string
    category: 'code' | 'explore' | 'master'
}

const ACHIEVEMENTS_KEY = 'edumind_robotics_achievements'

// Define all achievements
const ALL_ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
    // Code achievements
    { id: 'first_code', title: 'Primer Código', description: 'Ejecuta tu primer programa', icon: '🎉', points: 10, category: 'code' },
    { id: 'ten_runs', title: 'Practicante', description: 'Ejecuta 10 programas', icon: '🏃', points: 25, category: 'code' },
    { id: 'hundred_runs', title: 'Experto', description: 'Ejecuta 100 programas', icon: '🏆', points: 100, category: 'code' },
    { id: 'no_errors', title: 'Sin Errores', description: 'Ejecuta 5 programas sin errores seguidos', icon: '✨', points: 50, category: 'code' },
    { id: 'use_loop', title: 'Loop Master', description: 'Usa un bucle while en tu código', icon: '🔄', points: 15, category: 'code' },
    { id: 'use_function', title: 'Funcional', description: 'Define tu primera función', icon: '📦', points: 20, category: 'code' },

    // Explore achievements
    { id: 'use_buttons', title: 'Botones', description: 'Usa button_a o button_b', icon: '🔘', points: 10, category: 'explore' },
    { id: 'use_display', title: 'Artista LED', description: 'Crea un patrón en la matriz LED', icon: '💡', points: 15, category: 'explore' },
    { id: 'use_sensors', title: 'Sensor Detective', description: 'Lee datos del acelerómetro', icon: '📐', points: 20, category: 'explore' },
    { id: 'use_music', title: 'Músico', description: 'Genera sonido con music.play()', icon: '🎵', points: 25, category: 'explore' },
    { id: 'save_project', title: 'Organizador', description: 'Guarda tu primer proyecto', icon: '💾', points: 15, category: 'explore' },
    { id: 'use_templates', title: 'Explorador', description: 'Carga un ejemplo de la biblioteca', icon: '📚', points: 10, category: 'explore' },

    // Master achievements
    { id: 'nezha_motors', title: 'Robot Driver', description: 'Controla los motores de Nezha', icon: '🤖', points: 30, category: 'master' },
    { id: 'makey_makey', title: 'Inventor', description: 'Crea un instrumento con Makey Makey', icon: '🎹', points: 35, category: 'master' },
    { id: 'export_code', title: 'Compartidor', description: 'Exporta tu código a otro formato', icon: '📤', points: 20, category: 'master' },
    { id: 'ai_help', title: 'Aprendiz IA', description: 'Pide ayuda al asistente de IA', icon: '🤖', points: 15, category: 'master' },
]

interface AchievementsProps {
    onClose?: () => void
}

// Export function to unlock achievements from other components
export const unlockAchievement = (achievementId: string): Achievement | null => {
    const stored = localStorage.getItem(ACHIEVEMENTS_KEY)
    const achievements: Achievement[] = stored ? JSON.parse(stored) :
        ALL_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false }))

    const achievement = achievements.find(a => a.id === achievementId)
    if (!achievement || achievement.unlocked) return null

    achievement.unlocked = true
    achievement.unlockedAt = new Date().toISOString()

    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements))

    return achievement
}

// Export function to check achievement status
export const checkAchievement = (achievementId: string): boolean => {
    const stored = localStorage.getItem(ACHIEVEMENTS_KEY)
    if (!stored) return false
    const achievements: Achievement[] = JSON.parse(stored)
    return achievements.find(a => a.id === achievementId)?.unlocked || false
}

const Achievements: React.FC<AchievementsProps> = ({ onClose }) => {
    const [achievements, setAchievements] = useState<Achievement[]>([])
    const [filter, setFilter] = useState<'all' | 'code' | 'explore' | 'master'>('all')

    useEffect(() => {
        const stored = localStorage.getItem(ACHIEVEMENTS_KEY)
        if (stored) {
            setAchievements(JSON.parse(stored))
        } else {
            const initial = ALL_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false }))
            setAchievements(initial)
            localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(initial))
        }
    }, [])

    const filtered = filter === 'all'
        ? achievements
        : achievements.filter(a => a.category === filter)

    const totalPoints = achievements
        .filter(a => a.unlocked)
        .reduce((sum, a) => sum + a.points, 0)

    const unlockedCount = achievements.filter(a => a.unlocked).length

    return (
        <div className="achievements">
            <div className="achievements__header">
                <h3>🏆 Logros</h3>
                {onClose && <button className="close-btn" onClick={onClose}>×</button>}
            </div>

            <div className="achievements__stats">
                <div className="stat">
                    <span className="stat-value">{unlockedCount}/{achievements.length}</span>
                    <span className="stat-label">Logros</span>
                </div>
                <div className="stat">
                    <span className="stat-value">{totalPoints}</span>
                    <span className="stat-label">Puntos</span>
                </div>
                <div className="stat">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="achievements__filters">
                {(['all', 'code', 'explore', 'master'] as const).map(cat => (
                    <button
                        key={cat}
                        className={filter === cat ? 'active' : ''}
                        onClick={() => setFilter(cat)}
                    >
                        {cat === 'all' && '📋 Todos'}
                        {cat === 'code' && '💻 Código'}
                        {cat === 'explore' && '🔍 Explorar'}
                        {cat === 'master' && '🎓 Maestría'}
                    </button>
                ))}
            </div>

            <div className="achievements__list">
                {filtered.map(achievement => (
                    <div
                        key={achievement.id}
                        className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                    >
                        <span className="achievement-icon">{achievement.icon}</span>
                        <div className="achievement-info">
                            <h4>{achievement.title}</h4>
                            <p>{achievement.description}</p>
                        </div>
                        <div className="achievement-points">
                            +{achievement.points}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Achievements
