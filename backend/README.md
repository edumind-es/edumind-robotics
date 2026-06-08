# EDUmind Robotics - Backend API

Sistema de aprendizaje de programación asistida por IA local para micro:bit y Nezha.

## 🚀 Características Implementadas

### ✅ Fase 1: Motor de Chat Educativo (COMPLETADA)

- **Integración con Ollama (Phi3)**: Chat educativo con IA local
- **Streaming de respuestas**: Las respuestas de la IA aparecen en tiempo real
- **Motor de lecciones**: Catálogo de 4 lecciones y 3 retos creativos
- **Generación de código**: Crea código MicroPython/JavaScript basado en objetivos
- **Explicación de código**: La IA explica código paso a paso de forma pedagógica
- **Contexto educativo**: Sistema de prompts especializados para enseñanza

## 📋 Requisitos

- Python 3.10+
- Ollama con modelo Phi3 instalado
- Dependencias: ver `requirements.txt`

## 🔧 Instalación

```bash
# 1. Instalar dependencias
cd /var/www/edumind_robotics/backend
pip3 install --user -r requirements.txt

# 2. Asegurar que Ollama está corriendo
ollama serve

# 3. Verificar que Phi3 está disponible
ollama list
```

## 🏃 Ejecutar el Servidor

### Opción 1: Script de inicio (recomendado)
```bash
./start_server.sh
```

### Opción 2: Comando directo
```bash
export PYTHONPATH=/home/nuevoadmin/.local/lib/python3.10/site-packages
PORT=8002 python3 -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --reload
```

> **Nota:** El backend se publica en el puerto `8002` por defecto (el mismo que usa el servicio systemd). Cambia la variable `PORT` si necesitas otro.

El servidor estará disponible en:
- **API**: http://localhost:8002
- **Documentación interactiva**: http://localhost:8002/api/docs
- **ReDoc**: http://localhost:8002/api/redoc

## 📚 Endpoints Disponibles

### Health & Status
- `GET /api/health` - Estado del sistema y disponibilidad de Ollama
- `GET /api/models` - Lista de modelos Ollama disponibles

### Chat Educativo
- `POST /api/chat/message/stream` - Chat con IA (streaming)
- `POST /api/chat/message` - Chat con IA (sin streaming)
- `POST /api/chat/generate-code/stream` - Generar código (streaming)
- `POST /api/chat/explain-code/stream` - Explicar código (streaming)

### Lecciones y Retos
- `GET /api/lessons/` - Listar todas las lecciones
- `GET /api/lessons/{lesson_id}` - Obtener lección específica
- `GET /api/lessons/challenges/` - Listar retos creativos
- `GET /api/lessons/challenges/{challenge_id}` - Obtener reto específico

## 💬 Ejemplo de Uso: Chat con Streaming

```python
import httpx
import asyncio

async def chat_with_ai():
    url = "http://localhost:8002/api/chat/message/stream"

    payload = {
        "message": "¿Cómo hacer parpadear un LED en micro:bit?",
        "platform": "micro:bit",
        "language": "micropython",
        "difficulty": "beginner"
    }

    async with httpx.AsyncClient() as client:
        async with client.stream("POST", url, json=payload) as response:
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    content = line[6:]
                    if content == "[DONE]":
                        break
                    print(content, end="", flush=True)

asyncio.run(chat_with_ai())
```

## 🧪 Pruebas

```bash
# Ejecutar script de prueba completo
python3 test_chat.py
```

Este script prueba:
1. Chat educativo con streaming
2. Generación de código con explicación

## 📂 Estructura del Proyecto

```
backend/
├── app/
│   ├── main.py                 # Aplicación principal FastAPI
│   ├── models/
│   │   └── schemas.py          # Modelos Pydantic (validación)
│   ├── routers/
│   │   ├── chat.py             # Endpoints de chat con IA
│   │   └── lessons.py          # Endpoints de lecciones
│   └── services/
│       ├── ollama_service.py   # Integración con Ollama
│       └── lesson_engine.py    # Motor de lecciones educativas
├── requirements.txt
├── start_server.sh             # Script de inicio
├── test_chat.py                # Script de pruebas
└── README.md                   # Este archivo
```

## 🎯 Lecciones Disponibles

### micro:bit
1. **Fundamentos de micro:bit** (Beginner)
   - Hacer parpadear un LED
   - Detectar pulsación de botones
   - Mostrar texto en la pantalla
   - Leer el sensor de temperatura

2. **Sensores y actuadores** (Intermediate)
   - Usar el acelerómetro
   - Crear una brújula digital
   - Medir nivel de luz ambiental

### Nezha
3. **Iniciación con Nezha** (Beginner)
   - Controlar motores DC
   - Usar servomotores
   - Sensor ultrasónico de distancia

4. **Proyectos con Nezha** (Intermediate)
   - Robot seguidor de línea
   - Robot esquiva obstáculos

## 🔄 Próximos Pasos

### Fase 2: Generación y Validación
- [ ] Generadores específicos para MicroPython y JavaScript
- [ ] Validadores de sintaxis
- [ ] Exportador para archivos .hex (micro:bit)
- [ ] Exportador para Nezha

### Fase 3: Simulación
- [ ] Simulador visual de micro:bit
- [ ] Simulador de Nezha
- [ ] Emulación de sensores
- [ ] Sandbox de ejecución de código

### Fase 4: Frontend
- [ ] Interfaz de chat con React
- [ ] Editor de código Monaco
- [ ] Integración con simulador
- [ ] PWA con soporte offline

## 🐛 Troubleshooting

### Ollama no está disponible
```bash
# Verificar que Ollama está corriendo
curl http://localhost:11434/api/tags

# Si no responde, iniciarlo:
ollama serve
```

### Error de módulos Python
```bash
# Reinstalar dependencias
pip3 install --user -r requirements.txt
```

### Puerto 8002 en uso
```bash
# Cambiar puerto en start_server.sh o en el comando uvicorn
# Por ejemplo, usar puerto 8010:
python3 -m uvicorn app.main:app --port 8010
```

## 📝 Notas Técnicas

- **Modelo IA**: Phi3 (2.2 GB) - Optimizado para educación
- **Streaming**: Implementado con Server-Sent Events (SSE)
- **Context educativo**: Prompts especializados según plataforma y nivel
- **Validación**: Pydantic para validación de datos
- **CORS**: Habilitado para desarrollo (ajustar en producción)

## 🤝 Contribuir

Este proyecto está en desarrollo activo. Para contribuir:

1. Revisa los próximos pasos en este README
2. Crea una rama para tu feature
3. Implementa siguiendo el estilo del código existente
4. Prueba con `test_chat.py`
5. Documenta tus cambios

## 📄 Licencia

[Especificar licencia del proyecto]

---

**Versión**: 1.0.0
**Estado**: ✅ Fase 1 Completada
**Última actualización**: 2025-11-11
