# EDUmind Robotics - Plan de Producto EdTech Local First

Fecha base: 2026-05-27

## Vision

EDUmind Robotics debe funcionar como laboratorio de robotica educativa con IA local para alumnado y profesorado. El producto no debe vender "magia": debe convertir el uso de IA en una experiencia transparente donde el alumnado entienda que:

- la IA propone, pero el alumno decide, prueba y depura;
- el simulador permite experimentar antes del hardware real;
- el codigo se puede leer, modificar, exportar y explicar;
- la privacidad y la seguridad pedagogica son parte del aprendizaje.

## Principios no negociables

- Offline first donde sea viable: la app debe cargar interfaz, ejemplos, editor y simulador desde cache PWA.
- Local first por defecto: la IA usa Ollama local y bloquea endpoints remotos salvo autorizacion explicita.
- Privacy first: no se piden datos personales, no se persisten conversaciones por defecto y se minimiza el historial enviado al modelo.
- Human in the loop: toda generacion de codigo requiere lectura, insercion voluntaria, ejecucion en simulador y revision del alumno/docente.
- Transparencia: la interfaz debe indicar si la IA es local, que modelo se usa y que limites tiene.
- Seguridad educativa: se rechazan peticiones de abuso, evasion, robo de datos, ocultacion de actividad o acciones fuera del ambito de robotica segura.

## Arquitectura objetivo

### Frontend

- React + TypeScript + Vite.
- PWA con cache de shell, ejemplos, estilos y assets.
- Estado local para proyectos, sesiones de simulador y preferencias.
- Sin dependencias de servicios externos para el flujo basico.
- Mensajes honestos sobre IA local, limites del simulador y exportacion a hardware.

### Backend

- FastAPI local o de servidor escolar.
- Ollama en `localhost` como proveedor IA por defecto.
- Endpoints separados para:
  - chat educativo,
  - generacion y explicacion de codigo,
  - simulador,
  - exportacion,
  - politica/transparencia de sistema.
- Guardrails previos a IA para rechazar peticiones fuera de alcance.
- Logs operativos sin prompts completos ni datos personales.

### Simulador

- micro:bit: matriz 5x5, botones, sensores, pines tactiles, imagenes y texto.
- Nezha: motores, servos, sensores basicos y estado visual.
- Makey Makey: entradas tactiles, musica simulada y ejemplos.
- Ejecucion acotada: bucles infinitos transformados o limitados, sleeps no bloqueantes y sandbox sin `open`, `eval`, `exec`, `os` ni red.

### Datos

- Modo anonimo/local por defecto.
- Sin cuentas obligatorias para laboratorio individual.
- Si se implementan aulas o seguimiento:
  - consentimiento y roles claros,
  - pseudonimizacion para alumnado,
  - retencion definida,
  - exportacion/borrado de datos,
  - autorizacion backend por recurso.

## Compatibilidad

### Sistemas operativos objetivo

- Linux: Debian/Ubuntu para servidor y escritorio.
- Windows 10/11: navegador moderno y, si aplica, instalacion local con Ollama.
- macOS actual: navegador moderno y Ollama local.
- ChromeOS: uso por navegador con backend local de aula o servidor escolar.

### Navegadores objetivo

- Chromium/Chrome/Edge actual.
- Firefox ESR y actual.
- Safari actual en macOS/iPadOS para uso frontend; la IA local dependera de servidor accesible.

### Hardware educativo

- micro:bit v1/v2 como objetivo principal de MicroPython.
- Kit Nezha compatible con micro:bit.
- Makey Makey o entradas tactiles equivalentes.
- Funcionamiento sin hardware mediante simulador.

## Fases de estabilizacion

### Fase 0 - Gobierno tecnico

- Documentar arquitectura real y objetivo.
- Definir politicas local-first/privacy-first.
- Bloquear secretos en repo.
- Estabilizar build frontend y pruebas backend.

Estado 2026-05-27:

- Documento de producto creado en `docs/PRODUCTO_PRODUCCION_EDTECH.md`.
- Guardrails local-first/privacy-first implementados y cubiertos por tests.
- Pruebas antiguas de chat, API y simulador convertidas a pytest real con `TestClient`.
- `npm run lint`, `npm run build` y `python3 -m pytest -q` quedan verdes.
- Queda deuda no bloqueante: warnings de deprecacion de FastAPI/Pydantic para migracion posterior.

### Fase 1 - IA educativa segura

- Guardrails previos a IA.
- Prompt de sistema con marco pedagogico y privacidad.
- Endpoint `/api/system/policy`.
- Transparencia visible en UI.
- Registro operativo sin contenido sensible.

Estado 2026-05-27:

- Endpoint `/api/system/policy` disponible.
- Endpoint `/api/ready` disponible para despliegue y monitorizacion.
- Servicio activo verificado en `127.0.0.1:8002`.
- Smoke script operativo en `ops/smoke_release.sh`.
- `ops/systemd/edumind-robotics.service` fija Ollama local y `EDUMIND_ALLOW_REMOTE_AI=false`.
- `ops/nginx/edumind-robotics.conf` incluye CSP, bloqueo de ocultos/backups y backend solo por loopback.
- `nginx -t` del sistema queda pendiente de ejecutar con privilegios por permisos sobre `/etc/nginx`.

### Fase 2 - Offline y local first

- Revisar service worker y estrategia de cache.
- Persistencia local opcional de proyectos.
- Export/import local de proyectos.
- Modo degradado sin IA: ejemplos, simulador, editor y documentacion siguen disponibles.

Estado 2026-05-27:

- Service worker actualizado a estrategia cache-first de navegacion con `index.html` como fallback de SPA.
- Panel `Mis Proyectos` conectado en el laboratorio.
- Guardado local de proyectos en `localStorage` sin cuentas ni backend.
- Exportacion/importacion de proyectos en JSON desde navegador.
- Flujo principal sin IA sigue disponible: editor, ejemplos, simulador, sensores, exportacion y proyectos locales.
- Verificado con `npm run lint`, `npm run build` y smoke activo.

### Fase 3 - Simulador robusto

- Ampliar cobertura de APIs micro:bit frecuentes.
- Tests unitarios para ejemplos oficiales.
- Tests de regresion para codigo generado por IA.
- Mensajes de error comprensibles para alumnado.

Estado 2026-05-27:

- El ejecutor local soporta `random`, `math`, `display.read_light_level()` y `accelerometer.was_gesture("shake")`.
- El ejecutor local soporta plantillas Nezha mediante `from nezha import *`, `Nezha()`, `motor`, `servo`, `ultrasonic` y `line_sensor`.
- El gestor de sesiones conecta el ejecutor con el simulador Nezha real de la sesion.
- Nueva prueba `backend/tests/test_templates_execute.py`: ejecuta todas las plantillas del catalogo contra el simulador.
- Verificacion manual en servicio activo: codigo Nezha actualiza motor y servo en `/api/simulator/session/{id}`.
- Estado de regresion: 15/15 plantillas ejecutan sin error en el subset local.

## Auditoria de progreso hasta final de Fase 3

Fecha: 2026-05-27

### Evidencia tecnica

- Backend: `python3 -m pytest -q` -> 16 passed.
- Frontend: `npm run lint` -> verde.
- Frontend: `npm run build` -> verde, con aviso no bloqueante de chunk grande.
- Smoke release: `ops/smoke_release.sh` -> OK.
- Servicio activo: `127.0.0.1:8002`.
- Readiness: `/api/ready` -> `ready: true`.
- Politica: `/api/system/policy` -> IA local, prompts no persistidos y guardrails activos.

### Capacidades cerradas

- Gobierno tecnico verificable.
- IA local-first con bloqueo de endpoint remoto accidental.
- Transparencia visible en UI y endpoint de politica.
- Pruebas reales de API, chat, guardrails, simulador y plantillas.
- Proyectos locales sin backend.
- Export/import JSON local.
- PWA mas resiliente para navegacion offline despues de primera carga.
- Simulador capaz de ejecutar biblioteca completa de ejemplos actuales.

### Riesgos pendientes

- Migrar FastAPI `on_event` a lifespan y Pydantic `Config` a `ConfigDict`.
- Reducir bundle principal con code splitting para eliminar warning de Vite.
- Ampliar QA PWA/E2E desde Chromium a Edge, Firefox y Safari cuando la matriz de entorno este disponible.
- Ejecutar `nginx -t` con privilegios en el servidor y recargar Nginx si procede.
- Definir persistencia local avanzada con IndexedDB si los proyectos crecen en numero/tamano.
- Llevar Playwright a CI con artefactos de trazas/screenshot en fallos.

### Fase 4 - Aula, transferencia y seguimiento opcional

- Roles docente/alumno si se activa persistencia.
- Proyectos compartibles con caducidad.
- Revision docente sin invadir privacidad.
- Politica de retencion y borrado.
- Transferencia controlada desde simulador a hardware real.

Estado 2026-05-27:

- Se mantiene el modo anonimo/local como base: no hay cuentas obligatorias ni seguimiento nominal.
- La transferencia aula/hardware se resuelve con paquetes ZIP locales sin nube.
- Nuevo endpoint `/api/export/hardware-bundle`.
- El paquete incluye:
  - `main.py` con codigo MicroPython;
  - `hardware_settings.py` con puertos, velocidad segura y supervision;
  - `hardware_profile.json` para auditoria docente/herramientas;
  - `README_HARDWARE.md` con instrucciones de carga y seguridad.
- Perfiles soportados:
  - `microbit_v1`;
  - `microbit_v2`;
  - `nezha`;
  - `makey_makey`.
- La UI permite seleccionar hardware objetivo antes de exportar.
- No se exportan datos personales ni se requiere servicio externo.

### Fase 5 - QA multiplataforma y funcionalidad EdTech profesional

- Matriz navegador/SO.
- Pruebas PWA offline.
- Pruebas E2E de flujo: pedir ayuda, insertar codigo, ejecutar, depurar, exportar.
- Accesibilidad WCAG AA en rutas principales.
- Exportacion docente/alumno hacia hardware real.

Estado 2026-05-27:

- Test backend de paquete hardware real incorporado en `backend/tests/test_api.py`.
- Verificacion en servicio activo del ZIP de hardware real:
  - `POST /api/export/hardware-bundle`;
  - respuesta `application/zip`;
  - contiene `main.py`, `hardware_settings.py`, `hardware_profile.json`, `README_HARDWARE.md`.
- `python3 -m pytest -q` -> 17 passed.
- `npm run lint` -> verde.
- `npm run build` -> verde, con warning no bloqueante de chunk grande.
- `ops/smoke_release.sh` -> OK.
- QA de navegador real con Playwright incorporado en `frontend/e2e`.
- `npm run test:e2e` -> 6 passed:
  - flujo alumno en Chromium escritorio y movil: pedir ayuda a IA local, insertar codigo y ejecutar en simulador;
  - flujo docente en Chromium escritorio y movil: cargar ejemplo, guardar proyecto local y exportar paquete hardware real;
  - PWA offline en Chromium escritorio y movil: primera visita online, service worker activo y recarga offline.
- Configuracion estable en `frontend/playwright.config.ts` con ejecucion secuencial para evitar interferencias de service worker/cache.
- Flujos E2E de producto bloquean service workers cuando usan mocks locales de API; la prueba PWA los habilita para validar navegador real.
- Ajustes responsive aplicados para evitar solapes en movil: chat, paneles, cierre de paneles y overflow horizontal.
- Streaming SSE endurecido: los chunks se envian como JSON en `data:` y el frontend mantiene compatibilidad con texto plano, preservando bloques de codigo multilínea generados por la IA.
- Queda pendiente ampliar matriz real a Edge/Firefox/Safari y ejecucion manual o CI en Windows/macOS/Linux.

### Fase 6 - UX EdTech, design system y VibeCoding pedagogico

- Resolver bug critico de scroll: la respuesta de la IA desplazaba toda la pantalla, no solo el contenedor de mensajes.
- Ampliar zona VibeCoding al mismo nivel pedagogico que la zona Lab.
- Unificar el design system visual en todas las vistas.
- Implementar modo e-ink opt-in global.
- Crear navegacion persistente entre vistas.

Estado 2026-05-27:

- Bug de scroll corregido en `ChatPanel.tsx`: `scrollIntoView` sustituido por `scrollTop` directo sobre el contenedor ref. El scroll ahora queda contenido dentro del panel de chat.
- `ChatPanel.css`: altura minima ampliada a `clamp(520px, 65vh, 820px)`, fuentes subidas a 1.05rem, input ampliado. Adecuado para alumnado de 7 a 12 anos.
- `VibeCoding.tsx` reescrito con flujo pedagógico de 5 pasos: Imagina, IA crea, Lee, Prueba, Modifica.
  - Selector de hardware: micro:bit, Nezha, Makey Makey con sugerencias especificas por plataforma.
  - Area de respuesta IA sin truncado (hasta 480px con scroll interno).
  - Explicacion separada de codigo (bloque verde) y texto pedagogico (burbuja azul).
  - Ideas rapidas contextuales por hardware.
  - Burbuja explicativa de que hace la IA, en lenguaje adaptado a 7-12 anos.
  - Avance automatico de paso cuando la IA termina de responder.
  - Pantalla de felicitacion al ejecutar el codigo por primera vez.
- `NavBar.tsx` nueva: navbar sticky en todas las vistas con logo animado EDUmind, links de navegacion, indicador de estado IA (verde/amarillo/gris), toggle e-ink.
- `hooks/useEinkMode.ts`: hook que aplica `class="eink"` al `<html>` y persiste en localStorage.
- `edumind-theme.css` reescrito: variables CSS globales para toda la app (--edm-font-head Orbitron, --edm-font-body Nunito, paleta oscura premium, soporte e-ink).
- `App.css` unificado: home page migrada al tema oscuro premium, eliminada la inconsistencia claro/oscuro entre vistas.
- `index.html`: Google Fonts Orbitron 700/800 + Nunito 400/600/700/800 cargadas con preconnect.
- `npm run lint` verde. `npm run build` verde. Warning de chunk grande preexistente y no bloqueante.

## Criterios de aceptacion para release estable

- `npm run build` verde.
- `python3 -m pytest -q` verde con pruebas async reales, no saltadas.
- `python3 backend/tests/test_api.py` verde contra servicio activo.
- `/api/health` y `/api/system/policy` verdes.
- La app carga offline despues de una primera visita.
- El simulador ejecuta todos los ejemplos de biblioteca sin romper la UI.
- La IA local rechaza peticiones maliciosas y reconduce a alternativas educativas.
- No hay `.env`, claves, dumps ni credenciales en repo.
- Nginx expone solo HTTPS y backend queda en loopback.
- Procedimiento de backup, restore y rollback documentado.
- Exportacion a hardware real produce paquete ZIP verificable para micro:bit/Nezha/Makey Makey.
- VibeCoding muestra flujo pedagogico completo de 5 pasos para los tres tipos de hardware.
- El scroll del chat no desplaza la pagina: queda contenido dentro del panel.
- NavBar persistente visible en todas las vistas con toggle e-ink funcional.

## Riesgos pendientes

- Mantener warnings de FastAPI/Pydantic como deuda tecnica de migracion, no como bloqueo funcional.
- La PWA ya esta validada en Chromium escritorio/movil; falta ampliar a Edge, Firefox y Safari.
- La persistencia de proyectos locales debe decidir formato y politica de borrado.
- La ejecucion de codigo debe seguir ampliandose con APIs micro:bit comunes sin relajar sandbox.
- Si se habilita IA remota, requiere consentimiento, contrato de tratamiento y aviso claro en UI.
