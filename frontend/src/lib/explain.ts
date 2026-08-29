/*
 * Copyright (C) 2024-2025 EDUmind - Los Mundos Edufis
 * Author: Luis Vilela Acuña
 *
 * Cliente del tutor para "explícame esta línea".
 *
 * Va contra /api/chat/explain-code/stream, que devuelve SSE: cada fragmento
 * llega como una línea `data: <json>`. Se emite según llega para que el alumno
 * empiece a leer a los pocos segundos en vez de mirar una pantalla quieta.
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

/* El backend serializa cada fragmento como JSON para no romper el formato SSE
   con saltos de línea; si algún trozo no viniera codificado, se usa tal cual. */
function decodificar(dato: string): string {
  try {
    const valor = JSON.parse(dato)
    return typeof valor === 'string' ? valor : dato
  } catch {
    return dato
  }
}

export interface OpcionesExplicacion {
  code: string
  focusLine: number
  language?: string
  platform?: string
  signal?: AbortSignal
  /* Se llama con el texto acumulado cada vez que llega un fragmento. */
  onChunk: (textoAcumulado: string) => void
}

export async function explainLine({
  code,
  focusLine,
  language = 'micropython',
  platform = 'micro:bit',
  signal,
  onChunk,
}: OpcionesExplicacion): Promise<void> {
  const respuesta = await fetch(`${API_BASE}/chat/explain-code/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      code,
      language,
      platform,
      focus_line: focusLine,
    }),
  })

  if (!respuesta.ok || !respuesta.body) {
    throw new Error(`El tutor no respondió (${respuesta.status})`)
  }

  const lector = respuesta.body.getReader()
  const decodificador = new TextDecoder()
  let acumulado = ''
  let resto = ''

  for (;;) {
    const { done, value } = await lector.read()
    if (done) break

    /* Un fragmento de red puede cortar una línea SSE por la mitad: se guarda
       el resto y se une al siguiente trozo. */
    resto += decodificador.decode(value, { stream: true })
    const lineas = resto.split('\n')
    resto = lineas.pop() ?? ''

    for (const linea of lineas) {
      if (!linea.startsWith('data: ')) continue
      const dato = linea.slice(6)
      if (dato === '[DONE]') continue
      acumulado += decodificar(dato)
      onChunk(acumulado)
    }
  }
}
