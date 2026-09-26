# Historial de cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

## [1.0.1] — 2026-09-26

Corrección tras la evaluación VCER del 2026-09-25 (de «No recomendable,
60 %» a la banda «Recomendable»).

### Eliminado
- Analítica Matomo que se cargaba al abrir la app.
- Tipografías pedidas a Google Fonts en `index.html` (ya se sirven en local).
- Restos de la plantilla `create-vite` (`vite.svg`, `react.svg`).
- Enlace «Proponer Deporte» del pie, heredado de otra app.

### Añadido
- Al repo público, las funciones que ya corrían en producción: panel de
  ajustes de accesibilidad, envío por USB (`hex_builder` + firmware
  MicroPython), simulador mBot, TeclaTecla, `idiomas.py`, textos i18n,
  «Leer la pantalla en texto» y las tipografías locales.
- `CREDITS.md`, `OFL.txt`, `PRIVACIDAD.md`, `DECISIONES.md` y este historial.
- Secciones «Cómo modificarlo» y «Hecho con IA» en el README.
- Nombre accesible en los deslizadores de sensores, los filtros de
  ejemplos y los botones de cerrar; destino `#contenido` en todas las
  vistas; `main` y `h1` en Vibe Coding.

### Corregido
- Instrucciones de carga al micro:bit: el `.py` no se arrastra a la
  unidad MICROBIT (solo acepta `.hex`); se explica el envío por USB y
  Mu/Thonny.
- Plantillas Nezha: aviso de que la librería `nezha` solo existe en el
  simulador.
- Exportaciones a MakeCode y Scratch marcadas como experimentales.
- Las lecciones ya no anuncian JavaScript.
- Contraste de la barra, los botones principales, las etiquetas de
  dificultad y el pie (≥ 4,5:1).
- `COPYRIGHT` y `AUTHORS` coherentes con la licencia doble.
- Cabecera de `fuentes.css`: acredita a los autores de las cuatro
  tipografías y su licencia OFL.

## [1.0.0] — 2026-08-31

Primera versión pública desplegada en robotics.edumind.es.
