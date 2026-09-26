# EDUmind Robotics Lab

Plataforma de robótica educativa: el alumnado programa y simula robots desde el navegador, sin necesidad de hardware. Backend en FastAPI, frontend en React y flujos de aprendizaje asistidos por IA que corre en local.

> Los modelos de IA se ejecutan en el servidor que aloja la app (Ollama en local), no en un servicio externo. Nada de lo que escribe el alumnado sale de ahí. La app no lleva analítica ni carga nada de terceros: ver [PRIVACIDAD.md](PRIVACIDAD.md).

## Arrancar en local

Frontend:

```bash
cd frontend
npm ci
npm run build
```

Backend:

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

Copia `.env.example` a `.env` y rellénalo. Los valores del ejemplo son marcadores: genera secretos nuevos para cualquier despliegue real.

## Pruebas

```bash
cd backend && pytest             # 38 pruebas de API, simulador, guardarraíles de IA, .hex y SSO
cd frontend && npm run lint      # ESLint
cd frontend && npm run build     # compilación con TypeScript
cd frontend && npm run test:e2e  # 3 pruebas Playwright (flujo del laboratorio y PWA sin conexión)
```

La integración continua (`.github/workflows/ci.yml`) pasa lint, build y pytest en cada PR y no despliega nada.

## Cómo modificarlo

Todo está pensado para tocarse sin conocer el proyecto entero:

- **Añadir una plantilla de código**: `backend/app/services/code_generator.py`, diccionario `templates` (id, título, dificultad, plataforma, código y explicación). Las plantillas se ejecutan en el simulador en las pruebas (`backend/tests/test_templates_execute.py`), así que si la nueva falla, lo verás en `pytest`.
- **Añadir una lección**: `backend/app/services/lesson_engine.py`, diccionario `lessons`. La referencia de la API que se pasa al modelo está al final del mismo fichero.
- **Añadir o revisar un idioma**: textos de la interfaz en `frontend/src/i18n/textos.ts`; instrucciones del tutor por idioma en `backend/app/services/idiomas.py`.
- **Cambiar el modelo de IA**: `OLLAMA_MODEL` en `backend/.env` (por defecto `qwen2.5:3b`). El backend rechaza cualquier `OLLAMA_BASE_URL` que no sea local: está hecho a propósito.
- **Desactivar el inicio de sesión (SSO)**: `AUTHENTIK_ENABLED=false` en `backend/.env`. Sin SSO la app es de acceso libre y no muestra ningún dato de usuario.
- **Añadir un simulador de hardware**: `backend/app/simulator/` (un fichero por placa: `microbit_sim.py`, `nezha_sim.py`, `mbot_sim.py`, `makey_makey_sim.py`) y su vista en `frontend/src/components/`.
- **Cambiar la apariencia**: los colores y tipografías son variables CSS del sistema Lámina (`frontend/public/vendor/lamina-v1.css`, `frontend/src/styles/edumind-theme.css`). Las tipografías se sirven desde `frontend/public/fuentes/`.
- **Compilar**: `cd frontend && npm ci && npm run build` deja el sitio en `frontend/dist/`; el backend arranca con `uvicorn app.main:app` desde `backend/`.

## Hecho con IA

Este recurso se ha desarrollado con *vibe coding* con asistencia de IA (Claude Code y ChatGPT), siguiendo la [política de IA de EDUmind](https://edumind.es/es/legal/ia). Lo que ha comprobado el autor:

- Las {nb} pruebas automáticas del backend (API, simulador, guardarraíles del tutor, generación del .hex y SSO) y las {ne} pruebas de extremo a extremo con Playwright pasan en la integración continua de cada PR.
- Las licencias del material ajeno (tipografías, firmware, bibliotecas) están revisadas y listadas en [CREDITS.md](CREDITS.md).
- Los textos que ve el alumnado (plantillas, explicaciones, instrucciones de carga en el hardware) están revisados; las exportaciones a MakeCode y Scratch siguen marcadas como experimentales porque no se han probado en esos editores.
- La app se ha ejecutado en navegador de escritorio (Chrome, Firefox) y en tableta; el envío por USB requiere Chrome o Edge (WebUSB).

Además, en tiempo de ejecución la app usa un modelo de IA local (Ollama) como tutor: es la función central, y está descrita en la página «Pedagogía» de la propia app.

## Privacidad y créditos

- [PRIVACIDAD.md](PRIVACIDAD.md): qué guarda el navegador, qué guarda el servidor y durante cuánto tiempo.
- [CREDITS.md](CREDITS.md): tipografías, firmware y bibliotecas de terceros con sus licencias.
- [DECISIONES.md](DECISIONES.md): por qué la app funciona como funciona.
- [CHANGELOG.md](CHANGELOG.md): historial de versiones.

## Colaborar

Se puede colaborar **sin programar**: contar cómo te ha ido en clase, reportar un fallo, revisar los textos o traducir. Todo el proyecto está en español. Empieza por [CONTRIBUTING.md](CONTRIBUTING.md) y el [código de conducta](CODE_OF_CONDUCT.md).

¿Un fallo de seguridad? No abras un issue público: ver [SECURITY.md](SECURITY.md).

Este repositorio es una *release saneada* para revisión y auditoría: no incluye secretos, configuración de despliegue ni datos de aula. Ver [OPEN_SOURCE_RELEASE.md](OPEN_SOURCE_RELEASE.md).

## Licencia

Licencia doble **AGPL-3.0-or-later** *o* **EUPL-1.2**, a elección de quien la reutilice. Ver [LICENSE](LICENSE) y [NOTICE](NOTICE).

EDUmind® es marca registrada en España (OEPM). El código es libre; la marca y los logotipos no se ceden con él — ver [TRADEMARKS.md](TRADEMARKS.md).

Por **Luis Vilela Acuña** · EDUmind® — maestro de Educación Física.
