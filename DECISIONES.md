# Decisiones de diseño

> Redactado a posteriori el 2026-09-26, a partir de los comentarios del
> código, los mensajes de commit y la página «Pedagogía» de la app.

## Local-first: la IA corre en el servidor de la app, no en la nube

El tutor usa Ollama con un modelo pequeño (`qwen2.5:3b`) en el mismo
servidor. El backend **rechaza** cualquier `OLLAMA_BASE_URL` que no sea
local (`ollama_service.py`). Motivo: el chat recibe texto libre de menores;
que no salga a ningún proveedor externo es una condición, no una
preferencia. Coste asumido: respuestas más lentas (unos 13 tokens/s en
CPU); por eso el tutor se limita a 200 palabras y la interfaz muestra una
burbuja de espera que explica que «está pensando en este ordenador».

## Sin cuentas, sin datos personales, sin analítica

No se pide nombre ni clase. Proyectos, historial, logros y preferencias se
guardan en `localStorage` del dispositivo. El SSO (Authentik) es opcional,
para profesorado, y apagado en la instancia pública. La analítica Matomo
que se cargaba al abrir se retiró en la v1.0.1: aunque era autoalojada y
sin cookies, enviaba datos del navegador del alumnado fuera de la app.

## Nada se carga de terceros

Monaco (editor), las tipografías y el CSS Lámina se sirven desde el propio
sitio. Antes las tipografías se pedían a Google Fonts: cada alumno enviaba
su IP a Google para leer la pantalla y sin internet la app perdía Atkinson
Hyperlegible, que está justamente para dislexia y baja visión.

## El tutor explica, no resuelve

Los guardarraíles (`ai_guardian.py`) y el prompt del sistema
(`lesson_engine.py`) empujan al modelo a explicar el código y a dar la
referencia real de la API de micro:bit, no a escribir programas completos
sin más. Es una decisión pedagógica: entender el código, no solo obtenerlo.

## Simulador en el servidor

El código MicroPython se ejecuta en un simulador propio en el backend
(`backend/app/simulator/`) y el estado llega por WebSocket. Permite
probar sin hardware y controlar qué puede hacer el código del alumnado.
La librería `nezha` del simulador no existe en un Nezha real; las
plantillas lo avisan.

## Paso a hardware real sin depender de internet

`hex_builder.py` reproduce el formato de `uflash` y lleva dentro el runtime
de MicroPython, para generar un `.hex` que la placa arranca de verdad y
enviarlo por WebUSB. Las exportaciones a MakeCode y Scratch existen pero
están marcadas como experimentales hasta que alguien las compruebe en esos
editores.

## Accesibilidad como parte del diseño

Panel de ajustes (tamaño de texto, tipografía Atkinson Hyperlegible,
contraste, LEDs, menos movimiento), «Saltar al contenido», «Leer la
pantalla en texto» para lectores de pantalla, modo e-ink, y contraste
mínimo 4,5:1 con los tokens «deep» del sistema Lámina.

## Todo en español y con licencia doble

Código, comentarios, commits y documentación en español: quien enseña en
España debe poder leer el código que usa en clase. Licencia
AGPL-3.0-or-later OR EUPL-1.2: la EUPL es la licencia que las
administraciones públicas europeas ya conocen; la AGPL obliga a publicar
el código de la versión que corre. La marca EDUmind® no se cede.

## Release saneada

El repo público no incluye secretos, configuración de despliegue ni datos
de aula, y se sincroniza por contenido desde el árbol de trabajo del autor.
Cada versión desplegada lleva su etiqueta (`v1.0.x`) para que el código
que corre sea obtenible, como exige la AGPL.
