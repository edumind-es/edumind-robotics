# 🚀 EDUmind Robotics Lab - Mejoras Implementadas

## 📋 Tabla de Contenidos
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Problemas Identificados y Soluciones](#problemas-identificados-y-soluciones)
3. [Nueva Funcionalidad: Vibe Coding](#nueva-funcionalidad-vibe-coding)
4. [Mejoras en el Chat Educativo](#mejoras-en-el-chat-educativo)
5. [Arquitectura del Sistema](#arquitectura-del-sistema)
6. [Guía de Uso](#guía-de-uso)
7. [Documentación Técnica](#documentación-técnica)

---

## 🎯 Resumen Ejecutivo

EDUmind Robotics Lab es una plataforma educativa que combina **IA local (Phi3)**, **simulación de micro:bit**, y **robótica Nezha** para enseñar programación de forma interactiva.

### 🆕 Mejoras Recientes (Noviembre 2025)

#### ✨ **Modo Vibe Coding** 
Nuevo espacio dedicado con flujo optimizado: **IA → Código → Experimentación**

#### 🎨 **Chat Mejorado con Markdown**
Respuestas estructuradas y profesionales con resaltado de sintaxis

#### 📋 **Inserción Automática de Código**
Botones para copiar código desde el chat directamente al editor

#### 🤖 **Prompts Optimizados**
Sistema de instrucciones mejorado para que la IA genere código funcional

---

## 🔧 Problemas Identificados y Soluciones

### Problema 1: Código Cortado al Copiar ❌
**Síntoma:** Al copiar código desde el chat, faltaba `from microbit import *`

**Causa:** La función de extracción no manejaba estructuras complejas de ReactMarkdown

**Solución implementada:**
```typescript
// Función recursiva para extraer TODO el contenido
const extractText = (children: any): string => {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(extractText).join('')
  if (children?.props?.children) return extractText(children.props.children)
  return String(children || '')
}
```

**Resultado:** ✅ Código completo siempre

**Archivos modificados:**
- `frontend/src/components/ChatPanel.tsx` (líneas 39-56)

---

### Problema 2: Texto Plano en Respuestas ❌
**Síntoma:** Las respuestas de la IA no tenían formato, eran difíciles de leer

**Solución implementada:**
1. ✅ Integración de `react-markdown` + `remark-gfm` + `rehype-highlight`
2. ✅ Estilos CSS profesionales para markdown
3. ✅ Bloques de código con botón de inserción

**Archivos modificados:**
- `frontend/src/components/ChatPanel.tsx`
- `frontend/src/components/ChatPanel.css` (líneas 234-380)

**Resultado:**
```
Antes: "Usa display.show() para..."
Ahora: 
## Mostrar imágenes

Para mostrar imágenes:
- `display.show()` → Muestra en la matriz LED
- **Importante:** Usa `sleep()` para pausas
```

---

### Problema 3: Prompt de IA Poco Estructurado ❌
**Síntoma:** La IA generaba respuestas inconsistentes

**Solución implementada:**
Prompt mejorado con formato obligatorio:

```python
FORMATO DE RESPUESTA OBLIGATORIO - Usa siempre Markdown:
1. **Título claro** (## H2)
2. **Breve explicación** (1-2 párrafos)
3. **Pasos numerados**
4. **Código en bloques** con ```python
5. **Explicación con viñetas**
6. **Sugerencias de mejora**
```

**Archivos modificados:**
- `backend/app/services/lesson_engine.py` (líneas 240-297)

---

## ✨ Nueva Funcionalidad: Vibe Coding

### Concepto
Un espacio dedicado donde la IA genera código rápidamente y el usuario experimenta inmediatamente.

### Flujo de Trabajo
```
┌─────────────────────────────────────────────────┐
│ Usuario escribe objetivo                       │
│ "Hacer un corazón que parpadee"                │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ [⚡ Generar Código]                            │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ IA (Phi3) procesa y genera código             │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ Muestra código con previsualización            │
│ [👉 Usar este código]                         │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ Código insertado en Monaco Editor              │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ Usuario modifica (opcional)                     │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ [▶ Ejecutar código]                            │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ Simulador muestra resultado en matriz LED      │
│ + Interacción con botones A/B                   │
└─────────────────────────────────────────────────┘
```

### Componentes Creados

#### 1. `VibeCoding.tsx` (Componente Principal)
**Ubicación:** `frontend/src/components/VibeCoding.tsx`

**Responsabilidades:**
- Gestión de generación de código con IA
- Extracción de código desde respuestas
- Inserción en el editor
- Visualización del simulador
- Tips educativos

**Props:**
```typescript
interface VibeCodingProps {
  onExecute: (code: string) => void
  isExecuting: boolean
  simulatorState: any
  onButtonPress: (button: 'a' | 'b') => void
  onButtonRelease: (button: 'a' | 'b') => void
  onSendMessage: (message: string) => Promise<void>
  isStreaming: boolean
  messages: Message[]
}
```

#### 2. `VibeCoding.css` (Estilos)
**Ubicación:** `frontend/src/components/VibeCoding.css`

**Características:**
- Gradientes profesionales
- Animaciones suaves (fadeIn, fadeInDown)
- Layout responsive (Grid 2fr 1fr)
- Scrollbars personalizados
- Estados hover con feedback visual

### Layout de Vibe Coding

```
┌─────────────────────────────────────────────────────────────────┐
│                    ✨ Vibe Coding                              │
│                IA → Código → Experimentación                    │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────────────────┬────────────────────────────────┐
│ PANEL IZQUIERDO (2fr)          │ PANEL DERECHO (1fr)            │
├────────────────────────────────┼────────────────────────────────┤
│ ┌──────────────────────────┐   │ ┌──────────────────────────┐   │
│ │ 🤖 Generador IA          │   │ │ 🎮 Simulador             │   │
│ │ ¿Qué quieres crear?      │   │ │ micro:bit Virtual        │   │
│ │                          │   │ │                          │   │
│ │ [Textarea para objetivo] │   │ │  ┌──────────────────┐    │   │
│ │                          │   │ │  │   □□□□□         │    │   │
│ │ [⚡ Generar Código]      │   │ │  │   □□□□□  A   B  │    │   │
│ └──────────────────────────┘   │ │  │   □□□□□   O   O │    │   │
│                                │   │ │  │   □□□□□         │    │   │
│ ┌──────────────────────────┐   │ │  │   □□□□□         │    │   │
│ │ 💬 Última generación:    │   │ │  └──────────────────┘    │   │
│ │                          │   │ │                          │   │
│ │ ✅ Código generado       │   │ │  🌡️ Temperatura: 22°C    │   │
│ │ [Preview de código...]   │   │ │  💡 Luz: 128/255         │   │
│ │                          │   │ └──────────────────────────┘   │
│ │ [👉 Usar este código]   │   │                                │
│ └──────────────────────────┘   │ ┌──────────────────────────┐   │
│                                │   │ │ 💡 Tips Rápidos          │   │
│ ┌──────────────────────────┐   │ │ • Pide código a la IA    │   │
│ │ 💻 Editor de Código      │   │ │ • Usa "Usar código"      │   │
│ │ [Monaco Editor]          │   │ │ • Modifica a tu gusto    │   │
│ │                          │   │ │ • Ejecuta y prueba       │   │
│ │ [▶ Ejecutar código]     │   │ │ • Experimenta            │   │
│ └──────────────────────────┘   │ └──────────────────────────┘   │
└────────────────────────────────┴────────────────────────────────┘
```

### Características Especiales

#### 1. Extracción Inteligente de Código
```typescript
const handleInsertGenerated = () => {
  const lastAiMessage = messages.filter((m) => m.role === 'assistant').pop()
  if (lastAiMessage) {
    // Intenta múltiples patrones
    let codeMatch = lastAiMessage.content.match(/```python\n([\s\S]*?)```/)
    if (!codeMatch) {
      codeMatch = lastAiMessage.content.match(/```python([\s\S]*?)```/)
    }
    if (!codeMatch) {
      codeMatch = lastAiMessage.content.match(/```[\w]*\n([\s\S]*?)```/)
    }
    
    if (codeMatch) {
      setCurrentCode(codeMatch[1].trim())
    } else {
      alert('No se encontró código en el mensaje de la IA')
    }
  }
}
```

#### 2. Previsualización de Código
El sistema muestra automáticamente:
- ✅ Indicador visual cuando hay código
- 📝 Preview de las primeras 200 caracteres
- ⚠️ Advertencia si no se detectó código Python

#### 3. Prompt Optimizado para Vibe Coding
```typescript
const prompt = `Genera código MicroPython completo para micro:bit que logre: ${objetivo}

FORMATO REQUERIDO:
1. Escribe el código dentro de un bloque \`\`\`python
2. Incluye \`from microbit import *\` al inicio
3. Añade comentarios breves en español
4. El código debe ser completo y ejecutable
5. Opcionalmente, una breve explicación después del código

Objetivo: ${objetivo}`
```

---

## 🎨 Mejoras en el Chat Educativo

### Renderizado Markdown

**Antes:**
```
Puedes usar display.show() para mostrar imagenes. Ejemplo: display.show(Image.HEART)
```

**Ahora:**
```markdown
## Mostrar Imágenes

Puedes controlar la matriz de LEDs con estas funciones:

### Funciones principales:
- `display.show()` → Muestra imágenes o texto
- `sleep()` → Pausa la ejecución
- `display.clear()` → Limpia la pantalla

### Código ejemplo:
```python
from microbit import *

display.show(Image.HEART)
sleep(1000)
display.clear()
```

### ¿Cómo funciona?
- La función `show()` envía la imagen a los LEDs
- `sleep(1000)` espera 1 segundo
- `clear()` apaga todos los LEDs
```

### Estilos Markdown Implementados

**Títulos:**
- H1: 1.5rem, border-bottom cyan
- H2: 1.3rem, color cyan
- H3: 1.1rem, color cyan

**Listas:**
- Padding: 1.5rem
- Viñetas con margen: 0.3rem

**Código inline:**
- Background: rgba(0, 0, 0, 0.4)
- Color: #00ff88
- Border-radius: 4px

**Bloques de código:**
- Background gradient
- Header con lenguaje + botón insertar
- Syntax highlighting con rehype-highlight
- Scrollbar personalizado

### Botón "Insertar Código"

Cada bloque de código tiene:
```css
.insert-code-button {
  background: linear-gradient(135deg, #00ff88 0%, #00cc66 100%);
  color: #000;
  box-shadow: 0 2px 8px rgba(0, 255, 136, 0.3);
}

.insert-code-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.5);
}
```

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

#### Frontend
- **Framework:** React 18 + TypeScript
- **Estado:** Zustand
- **Editor:** Monaco Editor
- **Markdown:** react-markdown + remark-gfm + rehype-highlight
- **Estilos:** CSS3 custom (gradientes, animaciones)
- **Build:** Vite

#### Backend
- **Framework:** FastAPI (Python)
- **IA Local:** Ollama (Phi3)
- **Simulador:** Python (MicroPython emulator)
- **Servidor:** Uvicorn
- **Puerto:** 8002

#### Infraestructura
- **Web Server:** Nginx
- **Dominio:** robotics.edumind.es
- **SSL:** Let's Encrypt
- **Sistema:** Linux (systemd)

### Flujo de Datos

```
┌─────────────┐
│  Usuario    │
└──────┬──────┘
       │
       ↓ pregunta/objetivo
┌─────────────────────────────────┐
│   Frontend (React)              │
│   - App.tsx (routing)           │
│   - VibeCoding / ChatPanel      │
│   - CodeEditor                  │
│   - MicrobitDisplay             │
└──────────┬──────────────────────┘
           │
           ↓ HTTP/SSE
┌─────────────────────────────────┐
│   Backend API (FastAPI)         │
│   - /api/chat/message/stream    │
│   - /api/simulator/execute      │
│   - /api/simulator/button       │
└──────────┬──────────────────────┘
           │
           ├─→ Ollama (Phi3)
           │   - Genera respuestas
           │   - Streaming
           │
           └─→ Simulator Manager
               - code_executor.py
               - microbit_sim.py
               - nezha_sim.py
```

### Estructura de Archivos

```
edumind_robotics/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.tsx                    ← Routing principal
│   │   │   ├── VibeCoding.tsx            ← ✨ NUEVO
│   │   │   ├── VibeCoding.css            ← ✨ NUEVO
│   │   │   ├── ChatPanel.tsx             ← Mejorado con markdown
│   │   │   ├── ChatPanel.css             ← Estilos markdown añadidos
│   │   │   ├── CodeEditor.tsx            ← Soporte externalCode
│   │   │   └── MicrobitDisplay.tsx
│   │   ├── store/
│   │   │   └── useAppStore.ts
│   │   └── main.tsx
│   ├── dist/                              ← Build production
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── services/
│   │   │   ├── lesson_engine.py          ← Prompts mejorados
│   │   │   └── ollama_service.py
│   │   ├── simulator/
│   │   │   ├── code_executor.py          ← Ejecutor de código
│   │   │   ├── microbit_sim.py
│   │   │   └── nezha_sim.py
│   │   ├── routers/
│   │   │   ├── chat.py
│   │   │   └── simulator.py
│   │   └── main.py
│   └── requirements.txt
├── ops/
│   ├── nginx/
│   │   └── edumind-robotics.conf
│   └── systemd/
│       └── edumind-robotics.service
└── README.md                              ← Este archivo
```

---

## 📚 Guía de Uso

### Modo 1: Laboratorio (Lab)

**Para:** Aprendizaje conversacional, exploración guiada

**Flujo:**
1. Clic en "Abrir Laboratorio"
2. Pregunta al tutor en el chat
3. Recibe explicaciones con markdown estructurado
4. Clic en "📋 Insertar código" en cualquier bloque
5. Código aparece en el editor Monaco
6. Modifica y ejecuta
7. Ve resultados en simulador

**Ideal para:**
- Estudiantes que están aprendiendo conceptos
- Cuando necesitas explicaciones detalladas
- Experimentación libre con guía

### Modo 2: Vibe Coding ✨

**Para:** Generación rápida de código, experimentación directa

**Flujo:**
1. Clic en "✨ Vibe Coding"
2. Escribe objetivo en textarea
   - Ejemplo: "Hacer un dado digital"
3. Clic en "⚡ Generar Código"
4. Espera respuesta de Phi3 (3-10 segundos)
5. Ve preview del código generado
6. Clic en "👉 Usar este código"
7. Código insertado automáticamente
8. Modifica si quieres
9. Clic en "▶ Ejecutar código"
10. Prueba con botones A y B del simulador

**Ideal para:**
- Estudiantes que quieren probar ideas rápido
- Cuando tienes un objetivo claro
- Prototipado rápido

### Simulador micro:bit

#### Componentes Visibles
- **Matriz LED 5×5:** Muestra patrones y texto
- **Botón A (izquierda):** Interactivo, clic para presionar
- **Botón B (derecha):** Interactivo, clic para presionar
- **Indicador de estado:** Verde = activo

#### Sensores (Panel inferior)
- **🌡️ Temperatura:** 
  - Valor por defecto: 22°C
  - Se puede modificar vía API
  - `temperature()` en código
  
- **💡 Luz:** 
  - Valor por defecto: 128/255
  - Se puede modificar vía API
  - `display.read_light_level()` en código

**Nota:** Los valores de sensores son simulados. En Vibe Coding se muestran para referencia educativa.

### API del Simulador

#### Funciones disponibles en código

**Display:**
```python
display.show(Image.HEART)      # Mostrar imagen
display.show("Hola")            # Mostrar texto
display.scroll("Mensaje")       # Desplazar texto
display.clear()                 # Limpiar
display.set_pixel(x, y, valor) # Pixel individual (0-4, 0-4, 0-9)
display.get_pixel(x, y)         # Leer pixel
```

**Botones:**
```python
button_a.is_pressed()  # True si está presionado
button_b.is_pressed()  # True si está presionado
button_a.was_pressed() # True si fue presionado desde última vez
button_b.was_pressed() # True si fue presionado desde última vez
```

**Sensores:**
```python
temperature()           # Temperatura en °C
accelerometer.get_x()   # Aceleración eje X
accelerometer.get_y()   # Aceleración eje Y
accelerometer.get_z()   # Aceleración eje Z
compass.heading()       # Dirección en grados (0-359)
```

**Tiempo:**
```python
sleep(1000)      # Pausa 1 segundo (1000 ms)
running_time()   # Tiempo desde inicio en ms
```

**Imágenes predefinidas:**
```python
Image.HEART, Image.HAPPY, Image.SAD, Image.CONFUSED,
Image.ANGRY, Image.ASLEEP, Image.SURPRISED, Image.SILLY,
Image.FABULOUS, Image.MEH, Image.YES, Image.NO,
Image.CLOCK12, Image.ARROW_N, Image.ARROW_S, etc.
```

---

## 🔬 Documentación Técnica

### Componentes React

#### App.tsx
**Responsabilidad:** Routing entre Home, Lab, y Vibe Coding

**Estados:**
- `view`: 'home' | 'lab' | 'vibe'
- `externalCode`: string | undefined (para inserción de código)

**Hooks:**
```typescript
const {
  isSessionReady,      // Sesión de simulador lista
  simulatorState,      // Estado actual del micro:bit
  messages,            // Historial de chat
  isStreaming,         // IA generando respuesta
  isExecuting,         // Código ejecutándose
  initSession,         // Crear sesión
  executeCode,         // Ejecutar código en simulador
  sendChatMessage,     // Enviar mensaje a IA
  pressButton,         // Presionar botón A o B
  releaseButton,       // Soltar botón
} = useAppStore()
```

#### VibeCoding.tsx
**Props:**
```typescript
{
  onExecute: (code: string) => void          // Ejecutar en simulador
  isExecuting: boolean                        // Estado ejecución
  simulatorState: {                           // Estado simulador
    display: { grid: number[][] }
    buttons: { a: {...}, b: {...} }
    sensors: { temperature, light_level, accelerometer }
  }
  onButtonPress: (button: 'a' | 'b') => void
  onButtonRelease: (button: 'a' | 'b') => void
  onSendMessage: (message: string) => Promise<void>
  isStreaming: boolean
  messages: Message[]
}
```

**Estado interno:**
```typescript
const [currentCode, setCurrentCode] = useState<string>()  // Código a insertar
const [objective, setObjective] = useState<string>('')     // Objetivo usuario
```

**Métodos:**
- `handleGenerateCode()`: Envía prompt a IA
- `handleInsertGenerated()`: Extrae y inserta código

#### ChatPanel.tsx
**Mejoras implementadas:**
- Renderizado markdown con `ReactMarkdown`
- Función recursiva `extractText()` para código completo
- Componente personalizado `CodeBlock` con botón insertar
- Plugins: `remarkGfm`, `rehypeHighlight`

**Componente CodeBlock:**
```typescript
const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '')
  const codeContent = extractText(children).replace(/\n$/, '')

  if (!inline && match) {
    return (
      <div className="code-block-wrapper">
        <div className="code-block-header">
          <span className="code-language">{match[1]}</span>
          {onInsertCode && (
            <button onClick={() => onInsertCode(codeContent)}>
              📋 Insertar código
            </button>
          )}
        </div>
        <pre><code>{children}</code></pre>
      </div>
    )
  }
  return <code>{children}</code>
}
```

#### CodeEditor.tsx
**Mejoras:**
- Prop `externalCode?: string`
- useEffect que actualiza cuando `externalCode` cambia

```typescript
React.useEffect(() => {
  if (externalCode) {
    setCode(externalCode)
  }
}, [externalCode])
```

### Backend APIs

#### POST /api/chat/message/stream
**Request:**
```json
{
  "message": "¿Cómo hacer parpadear un LED?",
  "conversation_history": [...],
  "platform": "micro:bit",
  "language": "micropython",
  "difficulty": "beginner"
}
```

**Response:** Server-Sent Events (SSE)
```
data: ## Hacer parpadear un LED\n\n
data: Para lograr...
data: [DONE]
```

#### POST /api/simulator/execute
**Request:**
```json
{
  "session_id": "abc123",
  "code": "from microbit import *\ndisplay.show(Image.HEART)"
}
```

**Response:**
```json
{
  "success": true,
  "state": {
    "display": { "grid": [[...]] },
    "buttons": {...},
    "sensors": {...}
  },
  "error": null,
  "output_log": ["PRINT: Hello"],
  "error_log": []
}
```

#### POST /api/simulator/button
**Request:**
```json
{
  "session_id": "abc123",
  "button": "a",
  "action": "press"  // "press" o "release"
}
```

### Sistema de Prompts

#### lesson_engine.py
**Función:** `build_educational_context()`

**Sistema de instrucciones:**
1. Define rol del tutor
2. Especifica formato markdown obligatorio
3. Proporciona ejemplo completo
4. Lista directrices pedagógicas
5. Añade info específica de plataforma

**Ejemplo de prompt generado:**
```
Eres un tutor educativo especializado en robótica con micro:bit y Nezha.

CONTEXTO EDUCATIVO:
- Plataforma: micro:bit
- Lenguaje: micropython
- Nivel: beginner
- Objetivo del alumno: Hacer parpadear un LED

FORMATO DE RESPUESTA OBLIGATORIO - Usa siempre Markdown estructurado:

1. **Título claro** (## H2) describiendo el objetivo
2. **Breve explicación** del concepto (1-2 párrafos)
3. **Pasos numerados** para lograr el objetivo
4. **Código ejemplo** en bloques de código con ```python
5. **Explicación del código** con viñetas (bullet points)
6. **Sugerencias de mejora** o experimentación (opcional)

EJEMPLO DE FORMATO:
[... ejemplo completo ...]

DIRECTRICES PEDAGÓGICAS:
1. ✅ **Siempre usa Markdown** - Títulos, listas, negrita, código
2. ✅ **Código en bloques** - Usa ```python para que se pueda insertar
3. ✅ **Explicaciones concisas** - Frases cortas y claras
...

COMPONENTES DE MICRO:BIT:
- Matriz de LEDs 5x5
- 2 botones programables (A y B)
- Sensores: acelerómetro, brújula, temperatura, luz
...
```

### Simulador de Código

#### code_executor.py
**Clase:** `CodeExecutor`

**Seguridad:**
- Sandbox con `exec()` controlado
- Whitelist de funciones permitidas
- Validación de código peligroso
- Límite de longitud
- Timeout de ejecución

**API emulada:**
```python
safe_globals = {
    "__builtins__": {
        "print": safe_print,
        "range": range,
        "len": len,
        # ... más funciones seguras
    },
    "display": MicrobitAPI.display,
    "button_a": MicrobitAPI.button_a,
    "button_b": MicrobitAPI.button_b,
    # ... más componentes
    "Image": MicrobitImage,
}
```

**Proceso de ejecución:**
1. Validar código (no operaciones peligrosas)
2. Pre-procesar (eliminar imports, comentar)
3. Ejecutar con exec() en contexto seguro
4. Capturar outputs y errores
5. Actualizar estado del simulador
6. Retornar resultado

---

## 🚀 Despliegue

### Requisitos
- Python 3.10+
- Node.js 18+
- Ollama con modelo Phi3
- Nginx
- systemd

### Pasos de Despliegue

#### 1. Backend
```bash
cd /var/www/edumind_robotics/backend

# Activar entorno virtual
source ../venv/bin/activate

# Instalar dependencias (si no están)
pip install -r requirements.txt

# El servicio se ejecuta automáticamente con systemd
systemctl status edumind-robotics
```

#### 2. Frontend
```bash
cd /var/www/edumind_robotics/frontend

# Instalar dependencias (si faltan)
npm install

# Compilar para producción
npm run build

# Los archivos van a: dist/
# Nginx los sirve desde allí
```

#### 3. Verificar Servicios
```bash
# Backend
curl http://127.0.0.1:8002/api/simulator/sessions

# Ollama
curl http://localhost:11434/api/tags

# Frontend (acceso público)
curl https://robotics.edumind.es
```

### Configuración Nginx

**Archivo:** `/etc/nginx/sites-available/edumind-robotics.conf`

```nginx
server {
    listen 443 ssl http2;
    server_name robotics.edumind.es;

    # SSL
    ssl_certificate /etc/letsencrypt/live/robotics.edumind.es/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/robotics.edumind.es/privkey.pem;

    # Frontend
    root /var/www/edumind_robotics/frontend/dist;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api/ {
        proxy_pass http://127.0.0.1:8002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        
        # SSE important
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 360s;
    }
}
```

### Servicio Systemd

**Archivo:** `/etc/systemd/system/edumind-robotics.service`

```ini
[Unit]
Description=EDUmind Robotics Backend API
After=network.target
Wants=ollama.service

[Service]
Type=simple
User=nuevoadmin
Group=nuevoadmin
WorkingDirectory=/var/www/edumind_robotics/backend
Environment="PYTHONPATH=/home/nuevoadmin/.local/lib/python3.10/site-packages"
Environment="OLLAMA_HOST=127.0.0.1:11434"
ExecStart=/var/www/edumind_robotics/venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8002
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

### Comandos Útiles

```bash
# Reiniciar backend
kill -HUP $(pgrep -f "uvicorn app.main:app")
# o
systemctl restart edumind-robotics

# Ver logs backend
journalctl -u edumind-robotics -f

# Ver logs nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Compilar frontend
cd /var/www/edumind_robotics/frontend
npm run build

# Ver procesos
ps aux | grep uvicorn
ps aux | grep ollama

# Test API local
curl http://127.0.0.1:8002/api/simulator/sessions
curl -X POST http://127.0.0.1:8002/api/simulator/session/create \
  -H "Content-Type: application/json" \
  -d '{"platform":"micro:bit"}'
```

---

## 📊 Métricas y Rendimiento

### Tamaño de Build
- **Frontend JS:** ~596 KB (gzipped: ~187 KB)
- **Frontend CSS:** ~16 KB (gzipped: ~3.8 KB)
- **HTML:** ~0.6 KB

### Tiempos de Respuesta
- **Generación de código (Phi3):** 3-10 segundos
- **Ejecución de código:** <100ms
- **Streaming SSE:** Real-time
- **Carga inicial:** <2 segundos

### Recursos Backend
- **Memoria:** ~250 MB
- **CPU:** Bajo (~2-5%) en idle, alto (~80-100%) durante generación IA

---

## 🐛 Solución de Problemas

### Problema: "Botón 'Usar código' no funciona"
**Síntomas:** Al hacer clic, no pasa nada

**Diagnóstico:**
1. Abrir consola del navegador (F12)
2. Buscar errores en console.log
3. Verificar que hay código en el mensaje

**Soluciones:**
- La IA debe generar código con \`\`\`python
- Verificar regex de extracción en `VibeCoding.tsx:72-82`
- Ver logs: "Código extraído: ..."

### Problema: "Error 404 loader.js.map"
**Síntomas:** Error en consola del navegador

**Causa:** Archivos .map de desarrollo no en producción

**Solución:** Ignorar, no afecta funcionalidad
```bash
# O deshabilitar sourcemaps en vite.config.ts
build: {
  sourcemap: false
}
```

### Problema: "Código no se ejecuta"
**Síntomas:** Botón ejecutar no hace nada, simulador no cambia

**Diagnóstico:**
1. Ver consola navegador
2. Ver logs backend: `journalctl -u edumind-robotics -f`
3. Verificar sesión activa

**Soluciones:**
```javascript
// Verificar en consola del navegador
console.log('Session ready:', isSessionReady)
console.log('Simulator state:', simulatorState)

// Si no hay sesión
// Refrescar página o volver a Home y entrar
```

### Problema: "IA genera texto sin código"
**Síntomas:** Respuesta sin bloques \`\`\`python

**Causa:** Prompt no seguido correctamente por IA

**Solución:**
- Reintentar con objetivo más claro
- Ejemplo bueno: "Crear un contador de 0 a 9 en el display"
- Ejemplo malo: "Haz algo con LEDs"

### Problema: "Temperatura/Luz no cambian"
**Síntomas:** Valores estáticos 22°C, 128/255

**Explicación:** Son valores por defecto del simulador

**Cómo cambiarlos:**
```python
# Vía API (avanzado)
POST /api/simulator/sensor
{
  "session_id": "...",
  "sensor": "temperature",
  "value": 30
}

# O en código (futuro feature)
# Actualmente sensores son read-only desde código
```

---

## 🔮 Roadmap Futuro

### Corto Plazo (1-2 meses)
- [ ] Guardar códigos favoritos
- [ ] Historial de generaciones
- [ ] Compartir códigos (URL)
- [ ] Modo oscuro/claro
- [ ] Más ejemplos predefinidos

### Medio Plazo (3-6 meses)
- [ ] Soporte para Nezha
- [ ] Simulador 3D del robot
- [ ] Grabación de sesiones
- [ ] Challenges interactivos
- [ ] Sistema de logros

### Largo Plazo (6-12 meses)
- [ ] Multi-usuario colaborativo
- [ ] Integración con hardware real
- [ ] Más modelos de IA (Mistral, etc)
- [ ] App móvil
- [ ] Soporte para más plataformas (Arduino, ESP32)

---

## 🤝 Contribuir

### Código
1. Fork del repositorio
2. Crear rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Añadir nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Pull Request

### Reportar Bugs
- Usar consola del navegador para capturar errores
- Incluir pasos para reproducir
- Especificar navegador y versión

### Sugerencias
- Abrir issue en el repositorio
- Describir caso de uso
- Proponer solución si es posible

---

## 📄 Licencia

Proyecto educativo - Los Mundos Edufis

---

## 📞 Contacto

- **Web:** https://robotics.edumind.es
- **Email:** [contacto de Los Mundos Edufis]
- **Documentación:** Este README

---

## 🙏 Agradecimientos

- **Ollama:** Por hacer la IA local accesible
- **Phi3 (Microsoft):** Modelo educativo potente y rápido
- **micro:bit Foundation:** Por la plataforma educativa
- **Elecfreaks (Nezha):** Por el hardware robótico

---

## 📝 Changelog

### v2.0.0 (Noviembre 2025)
- ✨ **NUEVO:** Modo Vibe Coding
- ✨ **NUEVO:** Renderizado Markdown en chat
- ✨ **NUEVO:** Inserción automática de código
- 🐛 **FIX:** Código cortado al copiar
- 🐛 **FIX:** Extracción mejorada con función recursiva
- 🎨 **MEJORA:** Prompts optimizados para IA
- 🎨 **MEJORA:** UI/UX más intuitiva
- 📚 **DOCS:** README completo

### v1.0.0 (Initial Release)
- Simulador básico micro:bit
- Chat con IA (Phi3)
- Editor Monaco
- API REST + WebSocket

---

**Última actualización:** 17 Noviembre 2025
**Versión:** 2.0.0
**Estado:** ✅ Producción

