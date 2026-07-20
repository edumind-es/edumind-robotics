/*
 * Copyright (C) 2024-2025 EDUmind - Los Mundos Edufis
 * Author: Luis Vilela Acuña
 */

import { useEffect, useState } from 'react'
import './App.css'
import MicrobitDisplay from './components/MicrobitDisplay'
import CodeEditor from './components/CodeEditor'
import ChatPanel from './components/ChatPanel'
import VibeCoding from './components/VibeCoding'
import SensorPanel from './components/SensorPanel'
import ExamplesPanel from './components/ExamplesPanel'
import ExportPanel from './components/ExportPanel'
import ProjectsPanel from './components/ProjectsPanel'
import EDUmindFooter from './components/EDUmindFooter'
import NavBar from './components/NavBar'
import { useEinkMode } from './hooks/useEinkMode'
import { useAppStore } from './store/useAppStore'
import { checkAuth, loginUrl, type AuthState } from './lib/auth'

type View = 'home' | 'lab' | 'vibe'

interface PolicyStatus {
  ai?: {
    mode?: string
    privacy?: string
    ai_endpoint_local?: boolean
    model?: string
    prompts_persisted?: boolean
  }
}

function App() {
  const [view, setView] = useState<View>('home')
  const [externalCode, setExternalCode] = useState<string>()
  const [currentCode, setCurrentCode] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showSensors, setShowSensors] = useState(false)
  const [showProjects, setShowProjects] = useState(false)
  const [policyStatus, setPolicyStatus] = useState<PolicyStatus | null>(null)
  const [auth, setAuth] = useState<AuthState>({ status: 'checking' })

  /* Inicializar e-ink desde localStorage en el arranque */
  useEinkMode()

  const {
    isSessionReady,
    simulatorState,
    messages,
    isStreaming,
    isExecuting,
    initSession,
    executeCode,
    sendChatMessage,
    pressButton,
    releaseButton,
    updateSensor,
  } = useAppStore()

  const handleInsertCode = (code: string) => {
    setExternalCode(code)
    setCurrentCode(code)
    setTimeout(() => setExternalCode(undefined), 100)
  }

  const handleCodeChange = (code: string) => {
    setCurrentCode(code)
  }

  useEffect(() => {
    checkAuth().then(setAuth)
  }, [])

  useEffect(() => {
    if ((view === 'lab' || view === 'vibe') && !isSessionReady) {
      initSession()
    }
  }, [view, isSessionReady, initSession, auth.status])

  useEffect(() => {
    fetch('/api/system/policy')
      .then((response) => (response.ok ? response.json() : null))
      .then((policy) => setPolicyStatus(policy))
      .catch(() => setPolicyStatus(null))
  }, [])

  const aiLocal = policyStatus?.ai?.ai_endpoint_local !== false
  const aiModel = policyStatus?.ai?.model ?? 'modelo local'
  const promptsPersisted = policyStatus?.ai?.prompts_persisted === true

  if (auth.status === 'checking') {
    return (
      <main className="auth-gate" aria-live="polite">
        <div className="auth-gate__card">
          <p className="edm-kicker">EDUmind Robotics</p>
          <h1>Comprobando sesión segura</h1>
          <p>Conectando con la identidad EDUmind.</p>
        </div>
      </main>
    )
  }

  if (auth.status === 'anonymous') {
    return (
      <main className="auth-gate">
        <div className="auth-gate__card">
          <p className="edm-kicker">Laboratorio educativo protegido</p>
          <h1>EDUmind Robotics Lab</h1>
          <p>
            Inicia sesión directamente con EDUmind para acceder al simulador,
            al tutor de IA local y a las herramientas de exportación.
          </p>
          {new URLSearchParams(window.location.search).has('auth_error') && (
            <p className="auth-gate__error">No se pudo completar el acceso. Inténtalo de nuevo.</p>
          )}
          <a className="edm-button auth-gate__button" href={loginUrl()}>
            Entrar con EDUmind
          </a>
        </div>
      </main>
    )
  }

  const PolicyStrip = () => (
    <aside className={`policy-strip ${aiLocal ? 'policy-strip--ok' : 'policy-strip--warn'}`}>
      <strong>IA local y privacidad:</strong>{' '}
      {aiLocal ? 'Ollama local activo' : 'Revisar endpoint de IA'} · {aiModel} ·{' '}
      {promptsPersisted ? 'historial persistente' : 'sin persistir conversaciones'} · uso guiado para robótica educativa.
    </aside>
  )

  return (
    <>
      <NavBar
        currentView={view}
        onNavigate={(v) => setView(v)}
        isAiReady={aiLocal}
        isStreaming={isStreaming}
        user={auth.user}
      />

      {view === 'home' && (
        <main className="edm-app">
          <div className="edm-container">
            <header className="edm-hero">
              <p className="edm-kicker">Laboratorio virtual · NEZHA + micro:bit + Makey Makey</p>
              <h1>EDUmind Robotics Lab</h1>
              <p className="edm-subtitle">
                Aprende programación con micro:bit y Nezha mediante IA local
              </p>
              <PolicyStrip />
              <div className="edm-hero-actions">
                <button className="edm-button" type="button" onClick={() => setView('vibe')}>
                  ✨ Vibe Coding
                </button>
                <button className="edm-button" type="button" onClick={() => setView('lab')}>
                  🔬 Abrir Laboratorio
                </button>
                <button className="edm-button edm-button--ghost" type="button">
                  📚 Ver tutoriales
                </button>
              </div>
            </header>

            <section className="edm-grid" aria-label="Características">
              <article className="edm-card edm-card--cyan">
                <div className="edm-card__badge">Simulador</div>
                <h3>Laboratorio virtual</h3>
                <p>
                  Experimenta con micro:bit sin hardware físico. Matriz LED interactiva,
                  botones, sensores y control de Nezha en tiempo real.
                </p>
              </article>

              <article className="edm-card edm-card--lime">
                <div className="edm-card__badge">Asistente IA</div>
                <h3>Tutor educativo local</h3>
                <p>
                  Pregunta, aprende y genera código con IA ejecutándose en tu servidor.
                  Phi3 te guía paso a paso en tu aprendizaje.
                </p>
              </article>

              <article className="edm-card edm-card--pink">
                <div className="edm-card__badge">Editor</div>
                <h3>Código MicroPython</h3>
                <p>
                  Escribe y ejecuta código Python instantáneamente. Visualiza resultados
                  en el simulador y experimenta sin límites.
                </p>
              </article>

              <article className="edm-card edm-card--cyan">
                <div className="edm-card__badge">Nuevo</div>
                <h3>📚 Biblioteca de ejemplos</h3>
                <p>
                  15+ plantillas de código para micro:bit, Nezha y Makey Makey.
                  Aprende con ejemplos comentados en español.
                </p>
              </article>

              <article className="edm-card edm-card--lime">
                <div className="edm-card__badge">Nuevo</div>
                <h3>📤 Exportar a hardware</h3>
                <p>
                  Exporta tu código a .py o paquete ZIP listo para cargar en
                  micro:bit, Nezha o Makey Makey real.
                </p>
              </article>

              <article className="edm-card edm-card--pink">
                <div className="edm-card__badge">Nuevo</div>
                <h3>✨ Vibe Coding con IA</h3>
                <p>
                  Describe lo que quieres crear con tus palabras. La IA escribe
                  el código, tú lo lees, pruebas y modificas.
                </p>
              </article>
            </section>
          </div>
          <EDUmindFooter
            appName="EDUmind Robotics"
            version="1.0.0"
            hideNavigation={true}
          />
        </main>
      )}

      {view === 'vibe' && (
        <VibeCoding
          onExecute={executeCode}
          isExecuting={isExecuting}
          simulatorState={simulatorState}
          onButtonPress={pressButton}
          onButtonRelease={releaseButton}
          onSendMessage={sendChatMessage}
          isStreaming={isStreaming}
          messages={messages}
        />
      )}

      {view === 'lab' && (
        <main className="edm-app lab-view">
          <div className="lab-container">
            <header className="lab-header">
              <div className="lab-title">
                <h1>EDUmind Robotics Lab</h1>
                <p className="edm-kicker">Laboratorio Virtual</p>
                <PolicyStrip />
              </div>
              <div className="lab-header-actions">
                <button
                  className={`edm-button--small ${showProjects ? 'active' : ''}`}
                  type="button"
                  onClick={() => setShowProjects(!showProjects)}
                >
                  📁 Proyectos
                </button>
                <button
                  className={`edm-button--small ${showExamples ? 'active' : ''}`}
                  type="button"
                  onClick={() => setShowExamples(!showExamples)}
                >
                  📚 Ejemplos
                </button>
                <button
                  className={`edm-button--small ${showSensors ? 'active' : ''}`}
                  type="button"
                  onClick={() => setShowSensors(!showSensors)}
                >
                  🎛️ Sensores
                </button>
                <button
                  className={`edm-button--small ${showExport ? 'active' : ''}`}
                  type="button"
                  onClick={() => setShowExport(!showExport)}
                >
                  📤 Exportar
                </button>
              </div>
            </header>

            <div className="lab-layout">
              <div className="lab-main">
                <div className="lab-section">
                  <MicrobitDisplay
                    grid={simulatorState.display.grid}
                    buttons={simulatorState.buttons}
                    onButtonPress={pressButton}
                    onButtonRelease={releaseButton}
                  />
                </div>

                <div className="lab-section">
                  <CodeEditor
                    onExecute={executeCode}
                    isExecuting={isExecuting}
                    externalCode={externalCode}
                    onCodeChange={handleCodeChange}
                  />
                </div>

                {showSensors && (
                  <div className="lab-section">
                    <SensorPanel
                      sensors={simulatorState.sensors}
                      onUpdateSensor={updateSensor}
                    />
                  </div>
                )}
              </div>

              <div className="lab-sidebar">
                {showProjects && (
                  <div className="lab-panel-overlay">
                    <ProjectsPanel
                      currentCode={currentCode}
                      onLoadProject={handleInsertCode}
                      onClose={() => setShowProjects(false)}
                    />
                  </div>
                )}

                {showExamples && (
                  <div className="lab-panel-overlay">
                    <ExamplesPanel
                      onSelectExample={handleInsertCode}
                      onClose={() => setShowExamples(false)}
                    />
                  </div>
                )}

                {showExport && (
                  <div className="lab-panel-overlay">
                    <ExportPanel
                      code={currentCode}
                      onClose={() => setShowExport(false)}
                    />
                  </div>
                )}

                <ChatPanel
                  messages={messages}
                  isStreaming={isStreaming}
                  onSendMessage={sendChatMessage}
                  onInsertCode={handleInsertCode}
                />
              </div>
            </div>
          </div>
        </main>
      )}
    </>
  )
}

export default App
