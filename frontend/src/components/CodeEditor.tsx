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

import React, { useState } from 'react'
import Editor from '@monaco-editor/react'
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
  defaultCode = `from microbit import *

# Tu código aquí
display.show(Image.HEART)
sleep(1000)
display.clear()
`,
  externalCode,
  onCodeChange,
}) => {
  const [code, setCode] = useState(defaultCode)

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

      <div className="code-editor-wrapper">
        <Editor
          height="400px"
          defaultLanguage="python"
          value={code}
          onChange={handleCodeChange}
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
