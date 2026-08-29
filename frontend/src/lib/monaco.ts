/*
 * Copyright (C) 2024-2025 EDUmind - Los Mundos Edufis
 * Author: Luis Vilela Acuña
 *
 * Monaco servido desde el propio centro.
 *
 * Por defecto, @monaco-editor/react descarga el editor (3,5 MB) desde
 * cdn.jsdelivr.net. Eso significaba que el navegador de cada alumno hacía
 * peticiones a un tercero para poder escribir código, y que sin internet no
 * había editor: un centro con cortafuegos se quedaba sin laboratorio.
 *
 * Contradecía además lo que la propia app promete en su página de Pedagogía.
 * Aquí se le dice al cargador que use la copia local que viaja en el paquete.
 */
import * as monaco from 'monaco-editor'
import { loader } from '@monaco-editor/react'
import editorWorker from 'monaco-editor/editor/editor.worker.js?worker'

/*
 * Monaco delega en un worker el trabajo pesado del editor. Solo hacemos falta
 * el genérico: los workers de lenguaje son para TypeScript, CSS, HTML y JSON,
 * y aquí se escribe MicroPython.
 */
window.MonacoEnvironment = {
  getWorker: () => new editorWorker(),
}

loader.config({ monaco })

export default monaco
