/*
 * Copyright (C) 2024-2026 Luis Vilela Acuña <contacto@edumind.es>
 * Author: Luis Vilela Acuña
 */

import { Suspense, lazy, useEffect, useState } from 'react'
import './App.css'
import './styles/preferencias.css'
import Acceso from './components/Acceso'
import {
  usePreferencias,
  useTextos,
  TRADUCCION_SIN_REVISAR,
} from './hooks/usePreferencias'
import MicrobitDisplay from './components/MicrobitDisplay'

import SensorPanel from './components/SensorPanel'
/* Las gráficas existían sin usarse: muestran cómo evoluciona cada sensor en
   el tiempo, que es justo lo que hace falta para entender un sensor. */
import SensorGraphs from './components/SensorGraphs'
import ExamplesPanel from './components/ExamplesPanel'
import ExportPanel from './components/ExportPanel'
import ProjectsPanel from './components/ProjectsPanel'
import EDUmindFooter from './components/EDUmindFooter'
import NavBar from './components/NavBar'
import { useEinkMode } from './hooks/useEinkMode'
import { useAppStore } from './store/useAppStore'
import { checkAuth, loginUrl, type AuthState } from './lib/auth'

/*
 * Vibe Coding y Pedagogía no hacen falta para abrir la app: se cargan cuando
 * el alumno entra en ellas. Así la primera pantalla pesa bastante menos, que
 * es lo que se sufre en el wifi de un colegio.
 */
const VibeCoding = lazy(() => import('./components/VibeCoding'))
/* El editor arrastra Monaco y el chat arrastra el resaltado de sintaxis:
   334 kB que la portada no necesita para nada. */
const CodeEditor = lazy(() => import('./components/CodeEditor'))
const ChatPanel = lazy(() => import('./components/ChatPanel'))
const Pedagogia = lazy(() => import('./components/Pedagogia'))

/* Mensaje mientras llega el trozo de código de la vista. */
const Cargando = () => (
  <main className="edm-app" id="contenido" aria-live="polite">
    <div className="edm-container">
      <p className="edm-kicker">Cargando…</p>
    </div>
  </main>
)


type View = 'home' | 'lab' | 'vibe' | 'pedagogia'

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

  /* Preferencias de acceso: gobiernan tipografía, contraste, movimiento,
     color de los LEDs y el nivel de explicación del tutor. */
  const { preferencias, cambiar, restablecer } = usePreferencias()
  const { t } = useTextos()
  const [mostrarAcceso, setMostrarAcceso] = useState(false)
  const { eink, setEink } = useEinkMode()

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
      <strong>{t('politica.titulo')}</strong>{' '}
      {aiLocal ? t('politica.ok') : t('politica.warn')} · {aiModel} ·{' '}
      {promptsPersisted ? '' : t('politica.sinHistorial')} · {t('politica.uso')}
    </aside>
  )

  return (
    <>
      <a className="saltar-al-contenido" href="#contenido">{t('nav.saltar')}</a>
      <NavBar
        currentView={view}
        onNavigate={(v) => setView(v)}
        isAiReady={aiLocal}
        isStreaming={isStreaming}
        user={'user' in auth ? auth.user : null}
        onAbrirAcceso={() => setMostrarAcceso(true)}
      />

      {mostrarAcceso && (
        <Acceso
          preferencias={preferencias}
          cambiar={cambiar}
          restablecer={restablecer}
          onCerrar={() => setMostrarAcceso(false)}
          eink={eink}
          setEink={setEink}
        />
      )}

      {view === 'pedagogia' && (
        <Suspense fallback={<Cargando />}>
          <Pedagogia aiModel={aiModel} aiLocal={aiLocal} onStart={() => setView('lab')} />
        </Suspense>
      )}

      {view === 'home' && (
        <main className="edm-app" id="contenido">
          <div className="edm-container">
            <header className="edm-hero">
              <p className="edm-kicker">{t('home.kicker')}</p>
              <h1>EDUmind Robotics Lab</h1>
              <p className="edm-subtitle">
                {t('home.subtitulo')}
              </p>
              <PolicyStrip />
              <div className="edm-hero-actions">
                <button className="edm-button" type="button" onClick={() => setView('vibe')}>
                  ✨ {t('home.vibe')}
                </button>
                <button className="edm-button" type="button" onClick={() => setView('lab')}>
                  🔬 {t('home.abrirLab')}
                </button>
                <button
                  className="edm-button edm-button--ghost"
                  type="button"
                  onClick={() => setView('pedagogia')}
                >
                  📚 {t('home.porQueLocal')}
                </button>
              </div>
            </header>

            <section className="edm-grid" aria-label="Características">
              <article className="edm-card edm-card--cyan">
                <div className="edm-card__badge">{t('card.sim')}</div>
                <h3>{t('card.simT')}</h3>
                <p>
{t('card.simD')}
                </p>
              </article>

              <article className="edm-card edm-card--lime">
                <div className="edm-card__badge">{t('card.ia')}</div>
                <h3>{t('card.iaT')}</h3>
                <p>
{t('card.iaD')}
                </p>
              </article>

              <article className="edm-card edm-card--pink">
                <div className="edm-card__badge">{t('card.ed')}</div>
                <h3>{t('card.edT')}</h3>
                <p>
{t('card.edD')}
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
          {/* Aviso permanente: quien llegue con la lengua ya guardada no
              abrirá el panel de ajustes y nunca vería el aviso de allí. */}
          {TRADUCCION_SIN_REVISAR.includes(preferencias.idioma) && (
            <p className="aviso-traduccion" role="note" lang={preferencias.idioma}>
              {t('idioma.avisoTraduccion')}
            </p>
          )}

          <EDUmindFooter
            appName="EDUmind Robotics"
            version="1.0.0"
            hideNavigation={true}
          />
        </main>
      )}

      {view === 'vibe' && (
        <Suspense fallback={<Cargando />}>
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
        </Suspense>
      )}

      {view === 'lab' && (
        <Suspense fallback={<Cargando />}>
        <main className="edm-app lab-view" id="contenido">
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
                    <SensorGraphs sensors={simulatorState.sensors} />
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
        </Suspense>
      )}
    </>
  )
}

export default App
