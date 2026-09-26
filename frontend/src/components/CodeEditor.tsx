/*
 * Copyright (C) 2024-2026 Luis Vilela Acuña <contacto@edumind.es>
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
import { enviarAlMicrobit, navegadorSoportaGuardar, type EstadoEnvio } from '../lib/microbit'
import { usePreferencias, useTextos } from '../hooks/usePreferencias'
import { useAppStore } from '../store/useAppStore'
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
  const { preferencias } = usePreferencias()
  const { t } = useTextos()
  /*
   * Los errores de ejecución estaban en el store y no se pintaban en ningún
   * sitio: el alumno cambiaba una línea, el programa fallaba y la pantalla
   * se quedaba con el dibujo anterior, sin decir nada. Es peor que un error
   * feo: parece que la app no hace caso.
   */
  const executionErrors = useAppStore((s) => s.executionErrors)
  const executionOutput = useAppStore((s) => s.executionOutput)
  const editorSencillo = preferencias.editor === 'sencillo'
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const [envio, setEnvio] = useState<EstadoEnvio>({ fase: 'inactivo' })

  const handleEnviarPlaca = async () => {
    setEnvio({ fase: 'generando' })
    try {
      const nombre = await enviarAlMicrobit(code, 'edumind')
      setEnvio({ fase: 'listo', nombre })
    } catch (error) {
      /* Si el alumno cierra el diálogo de guardar no es un fallo: se vuelve
         al estado inicial sin darle un susto. */
      if ((error as Error).name === 'AbortError') {
        setEnvio({ fase: 'inactivo' })
        return
      }
      setEnvio({ fase: 'error', mensaje: (error as Error).message })
    }
  }

  /* Línea donde está el cursor: es la que el alumno mira ahora mismo. */
  const [lineaActual, setLineaActual] = useState(1)
  const [explicacion, setExplicacion] = useState('')
  const [lineaExplicada, setLineaExplicada] = useState<number | null>(null)
  const [explicando, setExplicando] = useState(false)
  const [errorExplicacion, setErrorExplicacion] = useState('')
  const abortarRef = useRef<AbortController | null>(null)

  /* En el campo de texto no hay API de cursor: la línea se deduce contando
     los saltos que hay antes de la posición del cursor. */
  const actualizarLineaDesdeArea = () => {
    const area = areaRef.current
    if (!area) return
    const hasta = area.value.slice(0, area.selectionStart)
    setLineaActual(hasta.split('\n').length)
  }

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
        setErrorExplicacion(t('editor.errorExplicacion'))
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
        <h2>{t('editor.titulo')}</h2>
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
            {explicando ? `💡 ${t('editor.pensando')}` : `💡 ${t('editor.explicar')} ${lineaActual}`}
          </button>
          <button
            className="edm-button edm-button--ghost"
            type="button"
            data-testid="send-microbit"
            onClick={handleEnviarPlaca}
            disabled={envio.fase === 'generando'}
            title={t('usb.ayuda')}
          >
            {envio.fase === 'generando' ? `🔌 ${t('usb.enviando')}` : `🔌 ${t('usb.enviar')}`}
          </button>
          <button
            className="edm-button edm-button--primary"
            type="button"
            data-testid="execute-code"
            onClick={handleExecute}
            disabled={isExecuting}
          >
            {isExecuting ? `▶ ${t('editor.ejecutando')}` : `▶ ${t('editor.ejecutar')}`}
          </button>
        </div>
      </div>

      {editorSencillo ? (
        <div className="editor-sencillo">
          <label htmlFor="editor-sencillo-campo" className="editor-sencillo__etiqueta">
            {t('editor.etiquetaCampo')}
          </label>
          <textarea
            id="editor-sencillo-campo"
            ref={areaRef}
            className="editor-sencillo__campo"
            value={code}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            rows={14}
            onChange={(e) => {
              handleCodeChange(e.target.value)
              actualizarLineaDesdeArea()
            }}
            onKeyUp={actualizarLineaDesdeArea}
            onClick={actualizarLineaDesdeArea}
            aria-describedby="editor-sencillo-ayuda"
          />
          <p id="editor-sencillo-ayuda" className="editor-sencillo__ayuda">
            Estás en la línea {lineaActual} de {code.split('\n').length}. El
            tabulador sale del campo; para sangrar, escribe cuatro espacios.
          </p>
        </div>
      ) : (
      <div className="code-editor-wrapper">
        <Editor
          height="400px"
          defaultLanguage="python"
          value={code}
          onChange={handleCodeChange}
          beforeMount={(monaco) => {
            /* vs-dark pinta los comentarios en #608b4e (4,2:1 sobre #1e1e1e).
               Los comentarios son justo lo que más lee el alumnado. */
            monaco.editor.defineTheme('edumind-oscuro', {
              base: 'vs-dark',
              inherit: true,
              rules: [{ token: 'comment', foreground: '7cb26a' }],
              colors: {},
            })
          }}
          onMount={(editor) => {
            /* Seguimos el cursor para saber qué línea está mirando el alumno:
               así el botón siempre dice el número que tiene delante. */
            setLineaActual(editor.getPosition()?.lineNumber ?? 1)
            editor.onDidChangeCursorPosition((evento) => {
              setLineaActual(evento.position.lineNumber)
            })
          }}
          theme="edumind-oscuro"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
            /*
              Monaco solo activa su modo accesible completo si "detecta" un
              lector de pantalla, y esa detección falla a menudo. Forzarlo
              hace que exponga el contenido real en lugar de un lienzo.
            */
            accessibilitySupport: 'on',
            /* Se anunciaba como "Editor content", en inglés y sin decir qué
               contiene. */
            ariaLabel:
              'Editor de código MicroPython para micro:bit. Pulsa Escape para salir del editor con el tabulador.',
            accessibilityPageSize: 100,
            /* Sin esto, autocompletar salta solo mientras el alumno escribe:
               para quien usa lector de pantalla es una interrupción constante. */
            quickSuggestions: false,
            suggestOnTriggerCharacters: false,
            /* Un editor de aula no necesita minimapa ni lentes de código. */
            codeLens: false,
            renderLineHighlight: 'all',
          }}
        />
      </div>
      )}

      {executionErrors.length > 0 && (
        <div className="ejecucion ejecucion--error" role="alert">
          <p className="ejecucion__titulo">{t('ejec.error')}</p>
          <pre className="ejecucion__detalle">{executionErrors.join('\n')}</pre>
        </div>
      )}

      {executionErrors.length === 0 && executionOutput.length > 0 && (
        <div className="ejecucion ejecucion--salida" aria-live="polite">
          <p className="ejecucion__titulo">{t('ejec.salida')}</p>
          <pre className="ejecucion__detalle">{executionOutput.join('\n')}</pre>
        </div>
      )}

      {(envio.fase === 'listo' || envio.fase === 'error') && (
        <p
          className={`envio-placa envio-placa--${envio.fase}`}
          role="status"
          aria-live="polite"
        >
          {envio.fase === 'listo'
            ? `${t('usb.listo')}${navegadorSoportaGuardar() ? '' : ` ${t('usb.sinSoporte')}`}`
            : envio.mensaje}
        </p>
      )}

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
              aria-label={t('editor.cerrarExplicacion')}
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
              {t('chat.esperandoCodigo')}
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
