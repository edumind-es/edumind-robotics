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

import React, { useRef, useState } from 'react'
/* Configura Monaco para servirse desde el propio centro, no desde un CDN.
   Debe importarse antes que el editor. */
import '../lib/monaco'
import Editor from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import { explainLine } from '../lib/explain'
import './CodeEditor.css'

interface CodeEditorProps {
  onExecute: (code: string) => void
  isExecuting: boolean
  defaultCode?: string
  externalCode?: string
  onCodeChange?: (code: string) => void
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  onExecute,
  isExecuting,
  /*
   * El ejemplo anterior terminaba en display.clear(), así que el simulador
   * devolvía la pantalla apagada y el alumno pulsaba "Ejecutar" y no veía
   * nada: indistinguible de que estuviera roto. El programa debe acabar en un
   * estado visible.
   */
  defaultCode = `from microbit import *

# Pulsa "Ejecutar código" y mira la pantalla del micro:bit.
# Prueba a cambiar HEART por HAPPY, SAD o YES.
display.show(Image.HEART)
`,
  externalCode,
  onCodeChange,
}) => {
  const [code, setCode] = useState(defaultCode)

  /* Línea donde está el cursor: es la que el alumno mira ahora mismo. */
  const [lineaActual, setLineaActual] = useState(1)
  const [explicacion, setExplicacion] = useState('')
  const [lineaExplicada, setLineaExplicada] = useState<number | null>(null)
  const [explicando, setExplicando] = useState(false)
  const [errorExplicacion, setErrorExplicacion] = useState('')
  const abortarRef = useRef<AbortController | null>(null)

  const textoLinea = (code.split('\n')[lineaActual - 1] ?? '').trim()
  const lineaVacia = textoLinea === '' || textoLinea.startsWith('#')

  const handleExplicar = async () => {
    /* Si el alumno pide otra línea mientras llega la anterior, se cancela la
       primera: en local cada petición ocupa la CPU y encolarlas alarga la
       espera de todos. */
    abortarRef.current?.abort()
    const controlador = new AbortController()
    abortarRef.current = controlador

    setExplicando(true)
    setErrorExplicacion('')
    setExplicacion('')
    setLineaExplicada(lineaActual)

    try {
      await explainLine({
        code,
        focusLine: lineaActual,
        signal: controlador.signal,
        onChunk: setExplicacion,
      })
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setErrorExplicacion('No se pudo pedir la explicación. Inténtalo otra vez.')
      }
    } finally {
      if (abortarRef.current === controlador) {
        setExplicando(false)
      }
    }
  }

  // Actualizar código cuando se reciba código externo
  React.useEffect(() => {
    if (externalCode) {
      setCode(externalCode)
      onCodeChange?.(externalCode)
    }
  }, [externalCode, onCodeChange])

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || ''
    setCode(newCode)
    onCodeChange?.(newCode)
  }

  const handleExecute = () => {
    if (!isExecuting) {
      onExecute(code)
    }
  }

  return (
    <div className="lme-card code-editor-container">
      <div className="code-editor-header">
        <div className="lme-card__badge">Editor</div>
        <h3>Código MicroPython</h3>
        <div className="code-editor-actions">
          <button
            className="edm-button edm-button--ghost explain-button"
            type="button"
            data-testid="explain-line"
            onClick={handleExplicar}
            disabled={explicando || lineaVacia}
            title={
              lineaVacia
                ? 'Pon el cursor sobre una línea de código'
                : `Explicar la línea ${lineaActual}`
            }
          >
            {explicando ? '💡 Pensando…' : `💡 Explícame la línea ${lineaActual}`}
          </button>
          <button
            className="edm-button edm-button--primary"
            type="button"
            data-testid="execute-code"
            onClick={handleExecute}
            disabled={isExecuting}
          >
            {isExecuting ? '▶ Ejecutando...' : '▶ Ejecutar código'}
          </button>
        </div>
      </div>

      <div className="code-editor-wrapper">
        <Editor
          height="400px"
          defaultLanguage="python"
          value={code}
          onChange={handleCodeChange}
          onMount={(editor) => {
            /* Seguimos el cursor para saber qué línea está mirando el alumno:
               así el botón siempre dice el número que tiene delante. */
            setLineaActual(editor.getPosition()?.lineNumber ?? 1)
            editor.onDidChangeCursorPosition((evento) => {
              setLineaActual(evento.position.lineNumber)
            })
          }}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
          }}
        />
      </div>

      {(explicando || explicacion || errorExplicacion) && (
        <section className="explain-panel" aria-live="polite">
          <header className="explain-panel__head">
            <span className="explain-panel__badge">Línea {lineaExplicada}</span>
            <code className="explain-panel__code">
              {(code.split('\n')[(lineaExplicada ?? 1) - 1] ?? '').trim()}
            </code>
            <button
              className="explain-panel__close"
              type="button"
              onClick={() => {
                abortarRef.current?.abort()
                setExplicacion('')
                setErrorExplicacion('')
                setExplicando(false)
              }}
              aria-label="Cerrar la explicación"
            >
              ✕
            </button>
          </header>

          {errorExplicacion ? (
            <p className="explain-panel__error">{errorExplicacion}</p>
          ) : explicacion ? (
            <div className="explain-panel__body markdown-content">
              <ReactMarkdown>{explicacion}</ReactMarkdown>
            </div>
          ) : (
            <p className="explain-panel__waiting">
              <span className="explain-panel__dots" aria-hidden="true">
                <i></i><i></i><i></i>
              </span>
              Pensando en este ordenador. Tu código no sale de aquí.
            </p>
          )}
        </section>
      )}

      <div className="code-editor-tips">
        <p className="tip-text">
          💡 <strong>Tip:</strong> Usa <code>display.show()</code> para mostrar en los LEDs,{' '}
          <code>sleep()</code> para pausas, y <code>button_a.is_pressed()</code> para botones.
        </p>
      </div>
    </div>
  )
}

export default CodeEditor
