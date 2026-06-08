# EDUmind Robotics Lab 🤖

Plataforma educativa con IA local para aprender programación con micro:bit y Nezha.

![Estado](https://img.shields.io/badge/estado-funcional-success)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/frontend-React-61DAFB)
![IA](https://img.shields.io/badge/IA-Phi3%20(Ollama)-purple)

---

## 🎯 Descripción

**EDUmind Robotics Lab** es una aplicación web educativa que permite a estudiantes aprender programación de microcontroladores (micro:bit y Nezha) mediante:

- **Simulador virtual** - Experimenta sin hardware físico
- **Asistente IA local** - Tutor educativo con Phi3 vía Ollama
- **Editor de código** - Monaco Editor con ejecución en tiempo real
- **Chat interactivo** - Aprende dialogando con la IA

---

## ✨ Características Principales

### 🎮 Simulador Virtual

- Matriz LED 5x5 animada
- Botones A y B interactivos
- Sensores emulados (temperatura, acelerómetro, brújula)
- Control de motores y servos Nezha
- Ejecución de código MicroPython en sandbox seguro

### 🤖 Asistente IA

- Modelo Phi3 corriendo localmente con Ollama
- Respuestas en streaming
- Contexto educativo especializado
- Generación de código
- Explicaciones paso a paso

### 💻 Editor de Código

- Monaco Editor (mismo que VS Code)
- Syntax highlighting para Python
- Ejecución instantánea
- Feedback visual de resultados

---

## 🏗️ Arquitectura

```
edumind_robotics/
│
├── backend/                 # FastAPI + Python
│   ├── app/
│   │   ├── main.py         # Entry point
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # Ollama + Lessons
│   │   ├── simulator/      # micro:bit + Nezha simulators
│   │   └── models/         # Pydantic schemas
│   │
│   └── requirements.txt
│
├── frontend/               # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── store/         # Zustand state management
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   └── package.json
│
└── README.md              # Este archivo
```

---

## 🚀 Instalación y Uso

### Requisitos Previos

- Python 3.10+
- Node.js 18+
- Ollama instalado con modelo Phi3

```bash
# Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Descargar modelo Phi3
ollama pull phi3
```

### 1. Configurar Backend

```bash
cd backend

# Instalar dependencias
pip3 install --user -r requirements.txt

# Iniciar servidor
PYTHONPATH=/home/nuevoadmin/.local/lib/python3.10/site-packages \
  PORT=8002 python3 -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --reload
```

**Backend predeterminado:** `http://localhost:8002`
**Documentación API:** `http://localhost:8002/api/docs`

### 2. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

**Frontend disponible en:** `http://localhost:5173`

---

## 📚 Documentación de Fases

Cada fase tiene su documentación detallada:

- [FASE1_CHAT_IA_COMPLETADA.md](backend/FASE1_CHAT_IA_COMPLETADA.md) - Chat Engine + Ollama
- [FASE3_SIMULADOR_COMPLETADA.md](FASE3_SIMULADOR_COMPLETADA.md) - Simuladores Backend
- [FASE4_FRONTEND_COMPLETADA.md](FASE4_FRONTEND_COMPLETADA.md) - Frontend React

---

## 🎓 Ejemplo de Uso

### 1. Abrir el Laboratorio

Accede a `http://localhost:5173` y haz click en **"Abrir Laboratorio"**

### 2. Escribir Código

```python
from microbit import *

# Mostrar un corazón
display.show(Image.HEART)
sleep(1000)

# Parpadear
for i in range(5):
    display.clear()
    sleep(200)
    display.show(Image.HEART)
    sleep(200)
```

### 3. Ejecutar

Click en **"▶ Ejecutar código"** y ve la animación en la matriz LED virtual.

### 4. Preguntar a la IA

En el chat, pregunta:
- "¿Cómo uso el acelerómetro?"
- "Genera código para un contador"
- "Explica qué hace `display.scroll()`"

---

## 🔌 API Endpoints

### Simulador

```
POST   /api/simulator/session/create   # Crear sesión
GET    /api/simulator/session/{id}     # Estado de sesión
POST   /api/simulator/execute          # Ejecutar código
POST   /api/simulator/button           # Presionar botón
DELETE /api/simulator/session/{id}     # Eliminar sesión
```

### Chat IA

```
POST   /api/chat/stream                # Chat con streaming
POST   /api/chat/generate-code         # Generar código
POST   /api/chat/explain-code          # Explicar código
```

### Lecciones

```
GET    /api/lessons                    # Listar lecciones
GET    /api/lessons/{id}               # Detalle de lección
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Test del simulador
python3 test_simulator.py

# Test del chat
python3 test_chat.py
```

### Ejemplos de Output

```
✅ PRUEBA 1: Simulador de micro:bit
   ✅ Sesión creada: abc-123
   ✅ Código ejecutado exitosamente
   📊 Display state: [0,1,0,1,0], [1,1,1,1,1], ...

✅ PRUEBA 2: Chat con IA
   ✅ Respuesta recibida (streaming)
   ✅ Código generado correctamente
```

---

## 🎨 Diseño

La aplicación sigue el **estilo EDUmind/LME** con:

- Cards con variantes de color (cyan, lime, pink)
- Dark theme para el laboratorio
- Gradientes y animaciones suaves
- Layout responsive
- Badges y etiquetas visuales

---

## 📊 Estado del Proyecto

| Fase | Estado | Descripción |
|------|--------|-------------|
| Fase 1 | ✅ Completada | Chat Engine + IA (Ollama + Phi3) |
| Fase 2 | ❌ Pendiente | Generadores de código + Validadores |
| Fase 3 | ✅ Completada | Simulador Backend (micro:bit + Nezha) |
| Fase 4 | ✅ Completada | Frontend Interactivo React |

---

## 🛠️ Tecnologías

**Backend:**
- FastAPI 0.115+
- Python 3.10
- Uvicorn (ASGI server)
- Ollama API (IA local)
- Pydantic (validación)

**Frontend:**
- React 18
- TypeScript
- Vite (build tool)
- Monaco Editor
- Zustand (state)
- Axios (HTTP)

**IA:**
- Ollama
- Modelo Phi3 (3.8B parámetros)
- Streaming SSE

---

## 🔒 Seguridad

El simulador ejecuta código en un **sandbox seguro**:

- Imports restringidos (solo microbit)
- Sin acceso al sistema de archivos
- Sin ejecución de comandos shell
- Sin acceso a red
- Validación de código antes de ejecutar

Para desplegar con HTTPS, firewall y servicios enlazados a loopback, sigue la guía `SECURITY_HARDENING.md`.

---

## 🌐 Despliegue

### Desarrollo

```bash
# Terminal 1: Backend
cd backend && ./start_server.sh

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Producción

```bash
# Backend con Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker

# Frontend build
cd frontend && npm run build
```

---

## 🤝 Contribuir

Este proyecto es parte de la suite educativa EDUmind.

Para contribuir:
1. Fork el repositorio
2. Crea una rama feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

## 📝 Licencia

Proyecto educativo desarrollado para Los Mundos EDUFis.

---

## 📞 Soporte

Para preguntas o problemas:
- Revisa la documentación en `/docs`
- Consulta los archivos `FASE*_COMPLETADA.md`
- Verifica logs en consola del navegador
- Revisa API docs en `/api/docs`

---

## 🎉 Créditos

**Desarrollado con:**
- FastAPI + Python
- React + TypeScript
- Ollama + Phi3
- Monaco Editor
- Zustand

**Estilo de diseño:** EDUmind/LME

---

**¡Feliz aprendizaje con EDUmind Robotics! 🚀🤖**
