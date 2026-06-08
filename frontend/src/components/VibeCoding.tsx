/*
 * Copyright (C) 2024-2025 EDUmind - Los Mundos Edufis
 * Author: Luis Vilela Acuña
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import CodeEditor from './CodeEditor'
import MicrobitDisplay from './MicrobitDisplay'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './VibeCoding.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface SimulatorState {
  display: { grid: number[][] }
  buttons: {
    a: { state: string; pressed: boolean }
    b: { state: string; pressed: boolean }
  }
  sensors: {
    temperature: number
    light_level: number
    accelerometer: { x: number; y: number; z: number }
  }
}

type HardwareType = 'microbit' | 'nezha' | 'makey'
type Step = 1 | 2 | 3 | 4 | 5

interface VibeCodingProps {
  onExecute: (code: string) => void
  isExecuting: boolean
  simulatorState: SimulatorState
  onButtonPress: (button: 'a' | 'b') => void
  onButtonRelease: (button: 'a' | 'b') => void
  onSendMessage: (message: string) => Promise<void>
  isStreaming: boolean
  messages: Message[]
}

const HARDWARE_INFO: Record<HardwareType, { label: string; icon: string; color: string; promptHint: string }> = {
  microbit: {
    label: 'micro:bit',
    icon: '🔬',
    color: '#00d9ff',
    promptHint: 'Ej: hacer parpadear los LEDs, mostrar mi nombre, detectar temperatura...',
  },
  nezha: {
    label: 'Nezha Robot',
    icon: '🤖',
    color: '#00ff88',
    promptHint: 'Ej: mover los motores hacia adelante, hacer girar las ruedas, parar el robot...',
  },
  makey: {
    label: 'Makey Makey',
    icon: '🎹',
    color: '#ff9900',
    promptHint: 'Ej: tocar una nota al tocar la banana, crear un piano con frutas, controlar un juego...',
  },
}

const HARDWARE_PLATFORM: Record<HardwareType, string> = {
  microbit: 'micro:bit',
  nezha: 'Nezha',
  makey: 'Makey Makey',
}

const STEP_INFO: Record<Step, { title: string; icon: string; desc: string }> = {
  1: { title: 'Imagina', icon: '💭', desc: '¿Qué quieres crear?' },
  2: { title: 'IA crea', icon: '⚡', desc: 'La IA escribe el código' },
  3: { title: 'Lee', icon: '👀', desc: 'Entiende qué hace' },
  4: { title: 'Prueba', icon: '▶', desc: 'Ejecuta en el simulador' },
  5: { title: 'Modifica', icon: '✏️', desc: 'Cambia lo que quieras' },
}

const QUICK_IDEAS: Record<HardwareType, string[]> = {
  microbit: [
    'Mostrar un corazón que parpadee',
    'Crear un dado digital',
    'Mostrar la temperatura',
    'Dibujar una carita feliz',
    'Contar cuántas veces presiono el botón A',
  ],
  nezha: [
    'Mover el robot hacia adelante 2 segundos',
    'Hacer girar el robot en círculos',
    'Parar el robot cuando detecte un obstáculo',
    'Mover el servo 90 grados',
    'Hacer que el robot zigzaguee',
  ],
  makey: [
    'Reproducir una nota al tocar la banana',
    'Crear un piano con 5 frutas',
    'Hacer sonar una alarma',
    'Controlar un personaje con verduras',
    'Tocar una melodía sencilla',
  ],
}

function extractCode(content: string): string | null {
  const patterns = [
    /```python\n([\s\S]*?)```/,
    /```python([\s\S]*?)```/,
    /```micropython\n([\s\S]*?)```/,
    /```[\w]*\n([\s\S]*?)```/,
  ]
  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match) return match[1].trim()
  }
  return null
}

function extractExplanation(content: string): string {
  // Quitar bloques de código para mostrar solo la explicación
  return content.replace(/```[\s\S]*?```/g, '').trim()
}

const VibeCoding: React.FC<VibeCodingProps> = ({
  onExecute,
  isExecuting,
  simulatorState,
  onButtonPress,
  onButtonRelease,
  onSendMessage,
  isStreaming,
  messages,
}) => {
  const [hardware, setHardware] = useState<HardwareType>('microbit')
  const [step, setStep] = useState<Step>(1)
  const [objective, setObjective] = useState('')
  const [currentCode, setCurrentCode] = useState<string>()
  const [codeInserted, setCodeInserted] = useState(false)
  const [executedOnce, setExecutedOnce] = useState(false)

  const responseRef = useRef<HTMLDivElement>(null)

  const lastAiMessage = messages.filter((m) => m.role === 'assistant').pop()
  const extractedCode = lastAiMessage ? extractCode(lastAiMessage.content) : null
  const explanation = lastAiMessage ? extractExplanation(lastAiMessage.content) : ''

  // Scroll automático dentro del área de respuesta IA
  useEffect(() => {
    if (responseRef.current && isStreaming) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight
    }
  }, [lastAiMessage?.content, isStreaming])

  // Avanzar paso automáticamente cuando la IA termina de responder
  useEffect(() => {
    if (!isStreaming && lastAiMessage && step === 2) {
      setStep(3)
    }
  }, [isStreaming, lastAiMessage, step])

  const handleGenerate = useCallback(async () => {
    if (!objective.trim() || isStreaming) return
    setStep(2)
    setCodeInserted(false)
    setExecutedOnce(false)

    const platform = HARDWARE_PLATFORM[hardware]
    const prompt = `Eres un tutor de robótica para alumnos de 7 a 12 años.
Genera código MicroPython para ${platform}.

OBJETIVO DEL ALUMNO: ${objective}

INSTRUCCIONES:
1. Incluye el código en un bloque \`\`\`python ... \`\`\`
2. Añade comentarios breves en español dentro del código
3. Después del código, explica en 2-3 frases sencillas qué hace cada parte, usando palabras que entiendan niños de primaria
4. Usa un tono amigable y animador

AHORA genera el código para: ${objective}`

    await onSendMessage(prompt)
    setObjective('')
  }, [objective, isStreaming, hardware, onSendMessage])

  const handleInsertCode = useCallback(() => {
    if (!extractedCode) return
    setCurrentCode(extractedCode)
    setCodeInserted(true)
    setStep(4)
  }, [extractedCode])

  const handleExecute = useCallback(
    (code: string) => {
      onExecute(code)
      setExecutedOnce(true)
      if (step === 4) setStep(5)
    },
    [onExecute, step],
  )

  const handleNewIdea = useCallback(() => {
    setStep(1)
    setCodeInserted(false)
    setExecutedOnce(false)
    setObjective('')
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div className="vc-root">
      {/* Selector de hardware */}
      <div className="vc-hardware-bar">
        {(Object.keys(HARDWARE_INFO) as HardwareType[]).map((hw) => (
          <button
            key={hw}
            className={`vc-hw-btn ${hardware === hw ? 'vc-hw-btn--active' : ''}`}
            style={hardware === hw ? { '--hw-color': HARDWARE_INFO[hw].color } as React.CSSProperties : {}}
            onClick={() => setHardware(hw)}
          >
            <span className="vc-hw-icon">{HARDWARE_INFO[hw].icon}</span>
            <span className="vc-hw-label">{HARDWARE_INFO[hw].label}</span>
          </button>
        ))}
      </div>

      {/* Indicador de pasos */}
      <div className="vc-steps" aria-label="Pasos del proceso">
        {([1, 2, 3, 4, 5] as Step[]).map((s) => (
          <div key={s} className={`vc-step ${step === s ? 'vc-step--active' : ''} ${step > s ? 'vc-step--done' : ''}`}>
            <div className="vc-step-circle">
              {step > s ? '✓' : STEP_INFO[s].icon}
            </div>
            <div className="vc-step-text">
              <span className="vc-step-title">{STEP_INFO[s].title}</span>
              <span className="vc-step-desc">{STEP_INFO[s].desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Layout principal */}
      <div className="vc-layout">
        {/* Columna izquierda: flujo pedagógico */}
        <div className="vc-left">

          {/* Paso 1: ¿Qué quieres crear? */}
          <div className={`vc-card vc-card--idea ${step === 1 ? 'vc-card--active' : ''}`}>
            <div className="vc-card-header">
              <span className="vc-card-step">Paso 1</span>
              <h3>💭 ¿Qué quieres crear?</h3>
              <p className="vc-card-hint">
                Escríbelo con tus palabras. La IA lo convierte en código para{' '}
                <strong style={{ color: HARDWARE_INFO[hardware].color }}>
                  {HARDWARE_INFO[hardware].icon} {HARDWARE_INFO[hardware].label}
                </strong>
              </p>
            </div>

            <textarea
              className="vc-textarea"
              placeholder={HARDWARE_INFO[hardware].promptHint}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              rows={3}
            />

            <button
              className="vc-btn vc-btn--generate"
              onClick={handleGenerate}
              disabled={!objective.trim() || isStreaming}
            >
              {isStreaming ? (
                <><span className="vc-spinner" />Generando código...</>
              ) : (
                <>⚡ Generar con IA</>
              )}
            </button>

            {/* Ideas rápidas */}
            <div className="vc-quick-ideas">
              <span className="vc-quick-ideas-label">Ideas para empezar:</span>
              <div className="vc-quick-ideas-list">
                {QUICK_IDEAS[hardware].slice(0, 3).map((idea) => (
                  <button
                    key={idea}
                    className="vc-idea-chip"
                    onClick={() => setObjective(idea)}
                    disabled={isStreaming}
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pasos 2-3: Respuesta de la IA */}
          {(step >= 2 || lastAiMessage) && (
            <div className={`vc-card vc-card--response ${step === 2 || step === 3 ? 'vc-card--active' : ''}`}>
              <div className="vc-card-header">
                <span className="vc-card-step">Paso 2 → 3</span>
                <h3>
                  {isStreaming ? (
                    <><span className="vc-dot-pulse" />La IA está escribiendo tu código...</>
                  ) : extractedCode ? (
                    <>✅ ¡Código listo! Lee qué hace</>
                  ) : (
                    <>🤔 La IA ha respondido</>
                  )}
                </h3>
                {!isStreaming && (
                  <p className="vc-card-hint">
                    La Inteligencia Artificial ha leído lo que pediste y ha escrito instrucciones en
                    MicroPython — un lenguaje que entienden los robots y microcontroladores.
                    <strong> Léelo antes de usarlo.</strong>
                  </p>
                )}
              </div>

              {/* Área de respuesta IA: grande y visible */}
              <div className="vc-response-area" ref={responseRef}>
                {lastAiMessage ? (
                  <div className="vc-response-content">
                    {extractedCode && (
                      <div className="vc-code-block">
                        <div className="vc-code-header">
                          <span className="vc-code-lang">python</span>
                          <span className="vc-code-label">Código generado</span>
                        </div>
                        <pre className="vc-code-pre"><code>{extractedCode}</code></pre>
                      </div>
                    )}
                    {explanation && (
                      <div className="vc-explanation">
                        <div className="vc-explanation-label">💬 La IA explica:</div>
                        <div className="vc-explanation-text">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {explanation}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                    {!extractedCode && isStreaming && (
                      <div className="vc-streaming-text">{lastAiMessage.content}</div>
                    )}
                  </div>
                ) : isStreaming ? (
                  <div className="vc-thinking">
                    <div className="vc-thinking-dots">
                      <span /><span /><span />
                    </div>
                    <p>La IA está pensando...</p>
                  </div>
                ) : null}
              </div>

              {extractedCode && !isStreaming && (
                <button
                  className="vc-btn vc-btn--insert"
                  onClick={handleInsertCode}
                >
                  👉 Usar este código en el editor
                </button>
              )}
            </div>
          )}

          {/* Paso 4-5: Editor */}
          {(codeInserted || step >= 4) && (
            <div className={`vc-card vc-card--editor ${step === 4 || step === 5 ? 'vc-card--active' : ''}`}>
              <div className="vc-card-header">
                <span className="vc-card-step">Paso 4 → 5</span>
                <h3>
                  {executedOnce ? '✏️ Modifica y experimenta' : '▶ Prueba en el simulador'}
                </h3>
                <p className="vc-card-hint">
                  {executedOnce
                    ? '¡El código funciona! Ahora puedes cambiarlo: modifica números, textos o instrucciones. La IA cometió errores? Corrígelos tú.'
                    : 'Pulsa "Ejecutar" para ver qué hace el código en el simulador virtual. No se conecta a ningún robot físico todavía.'}
                </p>
              </div>
              <CodeEditor
                onExecute={handleExecute}
                isExecuting={isExecuting}
                externalCode={currentCode}
              />
            </div>
          )}

          {/* Paso 5: ¡Enhorabuena! */}
          {executedOnce && (
            <div className="vc-card vc-card--congrats">
              <div className="vc-congrats-inner">
                <div className="vc-congrats-emoji">🎉</div>
                <h3>¡Lo has conseguido!</h3>
                <p>
                  Has pedido a la IA que cree código, lo has leído, lo has cargado en el editor
                  y lo has ejecutado en el simulador. Eso es exactamente lo que hacen los
                  programadores de robots en el mundo real.
                </p>
                <div className="vc-congrats-actions">
                  <button className="vc-btn vc-btn--new" onClick={handleNewIdea}>
                    💡 Crear otra cosa
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha: simulador + info pedagógica */}
        <div className="vc-right">
          <div className="vc-card vc-card--simulator">
            <div className="vc-card-header">
              <span className="vc-card-step">Simulador</span>
              <h3>{HARDWARE_INFO[hardware].icon} {HARDWARE_INFO[hardware].label} Virtual</h3>
              <p className="vc-card-hint">
                Este es el robot virtual. Cuando ejecutes el código, verás aquí lo que pasaría
                en el robot real.
              </p>
            </div>
            <MicrobitDisplay
              grid={simulatorState.display.grid}
              buttons={simulatorState.buttons}
              onButtonPress={onButtonPress}
              onButtonRelease={onButtonRelease}
            />
            <div className="vc-sensors">
              <div className="vc-sensor-row">
                <span>🌡️ Temperatura</span>
                <strong>{simulatorState.sensors.temperature}°C</strong>
              </div>
              <div className="vc-sensor-row">
                <span>💡 Luz</span>
                <strong>{simulatorState.sensors.light_level}/255</strong>
              </div>
            </div>
          </div>

          {/* Burbuja pedagógica: explica qué hace la IA */}
          <div className="vc-card vc-card--explainer">
            <h4>🧠 ¿Qué hace la IA?</h4>
            <div className="vc-explainer-steps">
              <div className="vc-explainer-item">
                <span className="vc-explainer-num">1</span>
                <span>Lee lo que escribiste y busca palabras clave</span>
              </div>
              <div className="vc-explainer-item">
                <span className="vc-explainer-num">2</span>
                <span>Busca en su memoria ejemplos similares que conoce</span>
              </div>
              <div className="vc-explainer-item">
                <span className="vc-explainer-num">3</span>
                <span>Escribe código MicroPython siguiendo las reglas del lenguaje</span>
              </div>
              <div className="vc-explainer-item">
                <span className="vc-explainer-num">4</span>
                <span>Puede equivocarse — por eso <strong>tú decides</strong> si el código es correcto</span>
              </div>
            </div>
            <div className="vc-explainer-footer">
              <strong>Recuerda:</strong> la IA propone, tú decides y aprendes.
            </div>
          </div>

          {/* Atajos de teclado */}
          <div className="vc-card vc-card--tips">
            <h4>⌨️ Atajos</h4>
            <ul className="vc-tips-list">
              <li><kbd>Enter</kbd> en el cuadro de texto → Generar código</li>
              <li>Botones <strong>A</strong> y <strong>B</strong> del micro:bit → clic en el simulador</li>
              <li>Puedes editar el código generado antes de ejecutarlo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VibeCoding
