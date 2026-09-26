# Créditos y material ajeno

EDUmind Robotics Lab es obra de Luis Vilela Acuña (EDUmind®) y se publica
con licencia doble AGPL-3.0-or-later / EUPL-1.2 (ver [LICENSE](LICENSE)).
Este fichero recoge todo lo que NO es obra propia y con qué licencia se usa.

## Tipografías (SIL Open Font License 1.1)

Se sirven desde `frontend/public/fuentes/` para que el navegador del
alumnado no tenga que pedirlas a Google. El texto de la licencia está en
[`frontend/public/fuentes/OFL.txt`](frontend/public/fuentes/OFL.txt).

| Tipografía | Autoría | Origen |
|---|---|---|
| Atkinson Hyperlegible | Braille Institute of America | https://brailleinstitute.org/freefont |
| Bricolage Grotesque | Mathieu Triay | https://github.com/ateliertriay/bricolage |
| Poppins | Indian Type Foundry (Jonny Pinhorn, Ninad Kale) | https://github.com/itfoundry/Poppins |
| IBM Plex Mono | IBM (Mike Abbink, Bold Monday) | https://github.com/IBM/plex |

Los subconjuntos `.woff2` (latin y latin-ext) se obtuvieron de las copias
publicadas en Google Fonts y se sirven sin modificar.

## Firmware de micro:bit (MIT)

`backend/app/firmware/micropython-microbit-v1.1.1.hex` es el runtime
oficial de MicroPython para micro:bit v1, con licencia MIT.
Copyright (c) 2013-2023 Damien P. George y colaboradores; port para
micro:bit de la Fundación micro:bit y colaboradores.
https://github.com/bbcmicrobit/micropython

El servicio `backend/app/services/hex_builder.py` reproduce el formato de
`uflash` (Nicholas H. Tollervey, MIT) para añadir el programa del alumnado
al runtime; no incluye código de `uflash`.

## Bibliotecas principales

Frontend (`frontend/package.json`):

| Biblioteca | Licencia | Para qué |
|---|---|---|
| React, React DOM | MIT | interfaz |
| Monaco Editor, @monaco-editor/react | MIT | editor de código (servido en local) |
| react-markdown, remark-gfm, rehype-highlight | MIT | respuestas del tutor con formato |
| highlight.js (vía rehype-highlight) | BSD-3-Clause | resaltado de sintaxis |
| zustand | MIT | estado de la app |
| axios | MIT | llamadas al backend |
| Vite, TypeScript, ESLint, Playwright (desarrollo) | MIT / Apache-2.0 | compilación, lint y pruebas |

Backend (`backend/requirements.txt`):

| Biblioteca | Licencia | Para qué |
|---|---|---|
| FastAPI, Starlette | MIT | API y WebSocket |
| Uvicorn | BSD-3-Clause | servidor ASGI |
| Pydantic | MIT | validación de datos |
| httpx | BSD-3-Clause | cliente de Ollama |
| python-jose | MIT | validación de JWT del SSO opcional |
| python-multipart, python-dotenv | Apache-2.0 / BSD-3-Clause | utilidades |

## Modelo de IA

El tutor usa `qwen2.5:3b` (Alibaba Cloud, licencia Apache-2.0) servido por
Ollama (MIT) en el propio servidor. Ni el modelo ni Ollama van en este
repositorio: se instalan en el servidor que ejecute la app.

## Sistema visual

`frontend/public/vendor/lamina-v1.css` es el sistema Lámina de EDUmind
(obra propia, misma licencia que el resto del código). EDUmind® es marca
registrada y no se cede con el código: ver [TRADEMARKS.md](TRADEMARKS.md).

## Iconos y sonidos

Los iconos de la PWA (`frontend/public/icons/`) son propios. No hay
imágenes, audio ni vídeo de terceros: los iconos de la interfaz son emoji
del sistema y los sonidos de TeclaTecla se sintetizan con WebAudio.
