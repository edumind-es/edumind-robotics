# 📝 Changelog - EDUmind Robotics Lab

## [2.0.0] - 2025-11-17

### ✨ Nuevas Funcionalidades

#### Modo Vibe Coding
- **Nuevo modo dedicado** para generación rápida de código
- Flujo optimizado: IA → Código → Experimentación
- Interfaz con dos paneles (Generador + Simulador)
- Extracción inteligente de código con múltiples patrones
- Previsualización de código antes de insertar
- Feedback visual claro (código detectado / no detectado)

### 🐛 Correcciones

#### Problema: Código Cortado al Copiar
- **Solución:** Función recursiva `extractText()` en ChatPanel
- **Resultado:** Código completo siempre, incluyendo imports
- **Archivos:** `ChatPanel.tsx:39-56`

#### Problema: Texto Plano sin Formato
- **Solución:** Integración react-markdown + plugins
- **Resultado:** Markdown con resaltado de sintaxis
- **Archivos:** `ChatPanel.tsx`, `ChatPanel.css:234-380`

#### Problema: Botón "Usar código" no funcionaba
- **Solución:** Múltiples regex para extracción robusta
- **Resultado:** Detección de código con alerts informativos
- **Archivos:** `VibeCoding.tsx:67-96`

### 🎨 Mejoras UI/UX

- Bloques de código con header (lenguaje + botón insertar)
- Gradientes y animaciones profesionales
- Estilos markdown: títulos, listas, code inline
- Scrollbars personalizados
- Estados hover con feedback visual
- Layout responsive

### 🤖 Mejoras en IA

#### Prompts Optimizados
- Formato obligatorio con markdown estructurado
- Ejemplos completos en el prompt
- Directrices pedagógicas claras
- Instrucciones específicas para bloques de código

**Archivo:** `lesson_engine.py:240-297`

### 📚 Documentación

- **README_MEJORAS_VIBECODING.md:** Documentación completa
- **CHANGELOG.md:** Este archivo
- Arquitectura del sistema
- Guía de uso detallada
- Solución de problemas
- API reference

### 🔧 Cambios Técnicos

#### Dependencias Nuevas
```json
{
  "react-markdown": "^9.0.0",
  "remark-gfm": "^4.0.0",
  "rehype-highlight": "^7.0.0"
}
```

#### Archivos Nuevos
- `frontend/src/components/VibeCoding.tsx`
- `frontend/src/components/VibeCoding.css`
- `README_MEJORAS_VIBECODING.md`
- `CHANGELOG.md`

#### Archivos Modificados
- `frontend/src/App.tsx` - Routing para Vibe Coding
- `frontend/src/components/ChatPanel.tsx` - Markdown + extractText()
- `frontend/src/components/ChatPanel.css` - Estilos markdown
- `frontend/src/components/CodeEditor.tsx` - Soporte externalCode
- `backend/app/services/lesson_engine.py` - Prompts mejorados

### 📊 Métricas

- **Build Frontend:** 597 KB JS (188 KB gzip)
- **CSS:** 17 KB (4 KB gzip)
- **Tiempo de build:** ~1.8s
- **Módulos:** 564

---

## [1.0.0] - Initial Release

### Funcionalidades Iniciales
- Simulador micro:bit básico
- Chat con IA (Phi3 via Ollama)
- Editor Monaco
- API REST + SSE
- Laboratorio interactivo

---

**Formato:** [Semantic Versioning](https://semver.org/)
**Tipos de cambios:**
- ✨ Nuevas funcionalidades
- 🐛 Correcciones de bugs
- 🎨 Mejoras UI/UX
- 🤖 Mejoras en IA
- 📚 Documentación
- 🔧 Cambios técnicos
