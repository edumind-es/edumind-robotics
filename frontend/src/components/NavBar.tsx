/*
 * Copyright (C) 2024-2025 EDUmind - Los Mundos Edufis
 * Author: Luis Vilela Acuña
 *
 * NavBar persistente — navegación, estado IA y toggle e-ink
 */

import React, { useState } from 'react'
import { useEinkMode } from '../hooks/useEinkMode'
import './NavBar.css'

type View = 'home' | 'lab' | 'vibe'

interface NavBarProps {
  currentView: View
  onNavigate: (view: View) => void
  isAiReady: boolean
  isStreaming: boolean
}

const NAV_LINKS: { view: View; label: string; icon: string }[] = [
  { view: 'home', label: 'Inicio', icon: '🏠' },
  { view: 'lab', label: 'Laboratorio', icon: '🔬' },
  { view: 'vibe', label: 'Vibe Coding', icon: '✨' },
]

const NavBar: React.FC<NavBarProps> = ({ currentView, onNavigate, isAiReady, isStreaming }) => {
  const { eink, setEink } = useEinkMode()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="edm-navbar" aria-label="Navegación principal">
      <div className="edm-navbar__inner">
        {/* Brand */}
        <button
          className="edm-navbar__brand"
          onClick={() => { onNavigate('home'); setMenuOpen(false) }}
          aria-label="EDUmind Robotics — Inicio"
        >
          <span className="edm-navbar__logo-icon">⚙</span>
          <span className="edm-navbar__logo-text">
            <span className="edm-navbar__logo-edu">EDU</span>
            <span className="edm-navbar__logo-mind">mind</span>
            <span className="edm-navbar__logo-sub">Robotics</span>
          </span>
        </button>

        {/* Links desktop */}
        <ul className={`edm-navbar__links ${menuOpen ? 'edm-navbar__links--open' : ''}`} role="list">
          {NAV_LINKS.map(({ view, label, icon }) => (
            <li key={view}>
              <button
                className={`edm-navbar__link ${currentView === view ? 'edm-navbar__link--active' : ''}`}
                onClick={() => { onNavigate(view); setMenuOpen(false) }}
                aria-current={currentView === view ? 'page' : undefined}
              >
                <span className="edm-navbar__link-icon">{icon}</span>
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Controles */}
        <div className="edm-navbar__controls">
          {/* Estado IA */}
          <div className="edm-navbar__ai-status" title={isStreaming ? 'IA pensando...' : isAiReady ? 'IA local activa' : 'IA no disponible'}>
            <span className={`edm-navbar__ai-dot ${isStreaming ? 'edm-navbar__ai-dot--thinking' : isAiReady ? 'edm-navbar__ai-dot--ok' : 'edm-navbar__ai-dot--off'}`} />
            <span className="edm-navbar__ai-label">
              {isStreaming ? 'IA activa' : 'IA local'}
            </span>
          </div>

          {/* Toggle e-ink */}
          <button
            className={`edm-navbar__eink-btn ${eink ? 'edm-navbar__eink-btn--active' : ''}`}
            onClick={() => setEink(!eink)}
            title={eink ? 'Desactivar modo e-ink' : 'Activar modo e-ink (menos luz azul)'}
            aria-pressed={eink}
          >
            {eink ? '📖 E-Ink' : '🖥️ Normal'}
          </button>

          {/* Hamburger móvil */}
          <button
            className="edm-navbar__burger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
