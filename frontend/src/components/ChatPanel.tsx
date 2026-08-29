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

import React, { isValidElement, useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import './ChatPanel.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatPanelProps {
  onSendMessage: (message: string) => void
  messages: Message[]
  isStreaming: boolean
  onInsertCode?: (code: string) => void
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  onSendMessage,
  messages,
  isStreaming,
  onInsertCode,
}) => {
  const [input, setInput] = useState('')
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isStreaming) {
      onSendMessage(input)
      setInput('')
    }
  }

  // Función auxiliar para extraer texto de children de forma recursiva
  const extractText = (children: React.ReactNode): string => {
    if (typeof children === 'string') {
      return children
    }
    if (typeof children === 'number') {
      return String(children)
    }
    if (Array.isArray(children)) {
      return children.map(extractText).join('')
    }
    if (isValidElement<{ children?: React.ReactNode }>(children) && children.props.children) {
      return extractText(children.props.children)
    }
    return String(children || '')
  }

  // Componente personalizado para bloques de código con botón de inserción
  const CodeBlock = ({
    inline,
    className,
    children,
    ...props
  }: React.ComponentPropsWithoutRef<'code'> & {
    inline?: boolean
    node?: unknown
  }) => {
    const match = /language-(\w+)/.exec(className || '')
    // Extraer correctamente todo el contenido del código
    const codeContent = extractText(children).replace(/\n$/, '')

    if (!inline && match) {
      return (
        <div className="code-block-wrapper">
          <div className="code-block-header">
            <span className="code-language">{match[1]}</span>
            {onInsertCode && (
              <button
                className="insert-code-button"
                onClick={() => onInsertCode(codeContent)}
                title="Insertar en el editor"
              >
                📋 Insertar código
              </button>
            )}
          </div>
          <pre className={className}>
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </div>
      )
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  }

  return (
    <div className="lme-card chat-panel-container">
      <div className="chat-header">
        <div className="lme-card__badge">Asistente IA</div>
        <h3>Tutor EDUmind</h3>
        <div className="ai-status">
          <span className={`status-indicator ${isStreaming ? 'thinking' : 'ready'}`}></span>
          <span className="status-label">{isStreaming ? 'Pensando...' : 'Listo'}</span>
        </div>
      </div>

      <div className="chat-messages" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="welcome-message">
            <p className="welcome-icon">🤖</p>
            <h4>¡Hola! Soy tu tutor de robótica</h4>
            <p>
              Pregúntame sobre micro:bit, Nezha, o pídeme que te ayude con tu código.
              Puedo explicarte conceptos, generar ejemplos y guiarte paso a paso. No necesito
              datos personales y rechazaré peticiones que no sean seguras o educativas.
            </p>
            <div className="quick-prompts">
              <button onClick={() => onSendMessage('¿Cómo hago parpadear un LED?')}>
                💡 ¿Cómo hago parpadear un LED?
              </button>
              <button onClick={() => onSendMessage('Explícame los sensores del micro:bit')}>
                🔬 Explícame los sensores
              </button>
              <button onClick={() => onSendMessage('Genera código para mostrar mi nombre')}>
                ⚡ Mostrar mi nombre en LEDs
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} className={`message message--${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  {msg.role === 'user' ? (
                    <div className="message-text">{msg.content}</div>
                  ) : (
                    <div className="message-text markdown-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          code: CodeBlock,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/*
              El modelo corre en local sobre CPU y tarda unos segundos en soltar
              la primera palabra. Sin esta burbuja el alumno se queda mirando un
              hueco vacío y cree que la app se ha colgado. Además aprovechamos la
              espera para recordarle por qué es local.
            */}
            {isStreaming && messages[messages.length - 1]?.role === 'user' && (
              <div className="message message--assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="message-thinking" aria-live="polite">
                    <span className="message-thinking__dots" aria-hidden="true">
                      <i></i><i></i><i></i>
                    </span>
                    <span className="message-thinking__note">
                      Pensando en este ordenador. Tu pregunta no sale de aquí.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          className="chat-input"
          placeholder="Escribe tu pregunta o solicitud..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isStreaming}
        />
        <button
          type="submit"
          className="edm-button edm-button--primary"
          disabled={!input.trim() || isStreaming}
        >
          Enviar
        </button>
      </form>
    </div>
  )
}

export default ChatPanel
