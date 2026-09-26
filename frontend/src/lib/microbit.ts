/*
 * Copyright (C) 2024-2026 Luis Vilela Acuña <contacto@edumind.es>
 * Author: Luis Vilela Acuña
 *
 * Enviar el programa a un micro:bit de verdad.
 *
 * Hay dos formas de hacerlo desde un navegador y aquí se usa la segura:
 *
 * 1. WebUSB + DAPLink escribe la memoria flash directamente. Es lo que hace
 *    el editor oficial, pero implementar mal ese protocolo deja la placa sin
 *    arrancar, y sin una placa delante no se puede comprobar. NO se hace.
 *
 * 2. El micro:bit se monta como una unidad USB llamada MICROBIT. Al copiar
 *    un .hex ahí, es el gestor de arranque de la propia placa quien lo
 *    valida y lo instala: si el fichero estuviera mal, lo rechaza y no pasa
 *    nada. Es lo que se hace aquí, con la API de acceso a ficheros para que
 *    el alumno lo guarde de una vez, sin pasar por la carpeta de descargas.
 *
 * WebUSB se usa solo para RECONOCER la placa (leer su identificador), que es
 * una operación de lectura y no puede estropear nada.
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

/* Identificadores USB del micro:bit (ARM mbed / DAPLink). */
const FABRICANTE_ARM = 0x0d28
const PRODUCTO_DAPLINK = 0x0204

export type EstadoEnvio =
  | { fase: 'inactivo' }
  | { fase: 'generando' }
  | { fase: 'guardando' }
  | { fase: 'listo'; nombre: string }
  | { fase: 'error'; mensaje: string }

export function navegadorSoportaUSB(): boolean {
  return typeof navigator !== 'undefined' && 'usb' in navigator
}

export function navegadorSoportaGuardar(): boolean {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window
}

/*
 * Pide al usuario que elija su micro:bit y devuelve cómo se llama.
 * Solo lee: no escribe nada en la placa.
 */
export async function reconocerPlaca(): Promise<string> {
  if (!navegadorSoportaUSB()) {
    throw new Error(
      'Este navegador no puede hablar con la placa. Prueba con Chrome o Edge.',
    )
  }
  const usb = (navigator as Navigator & { usb: UsbMinimo }).usb
  const placa = await usb.requestDevice({
    filters: [{ vendorId: FABRICANTE_ARM, productId: PRODUCTO_DAPLINK }],
  })
  return placa.productName || 'micro:bit'
}

/* Pide al backend el .hex con el programa dentro. */
export async function generarHex(codigo: string, nombre = 'edumind'): Promise<Blob> {
  const respuesta = await fetch(`${API_BASE}/export/hex`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: codigo, project_name: nombre }),
  })

  if (respuesta.status === 413) {
    const { detail } = await respuesta.json()
    throw new Error(detail)
  }
  if (!respuesta.ok) {
    throw new Error('No se pudo preparar el programa para la placa.')
  }
  return respuesta.blob()
}

/*
 * Guarda el .hex donde diga el alumno. Si elige la unidad MICROBIT, la placa
 * se reinicia sola con el programa nuevo.
 */
export async function enviarAlMicrobit(
  codigo: string,
  nombre = 'edumind',
): Promise<string> {
  const hex = await generarHex(codigo, nombre)
  const nombreFichero = `${nombre}.hex`

  if (navegadorSoportaGuardar()) {
    const elegir = (window as unknown as { showSaveFilePicker: GuardarComo })
      .showSaveFilePicker
    const destino = await elegir({
      suggestedName: nombreFichero,
      types: [
        {
          description: 'Programa para micro:bit',
          accept: { 'application/octet-stream': ['.hex'] },
        },
      ],
    })
    const escritor = await destino.createWritable()
    await escritor.write(hex)
    await escritor.close()
    return destino.name
  }

  /* Sin esa API (Firefox, Safari) se descarga y el alumno lo arrastra. */
  const url = URL.createObjectURL(hex)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreFichero
  enlace.click()
  URL.revokeObjectURL(url)
  return nombreFichero
}

/* Tipos mínimos: TypeScript no trae WebUSB ni el selector de guardado. */
interface UsbMinimo {
  requestDevice(opciones: {
    filters: { vendorId: number; productId?: number }[]
  }): Promise<{ productName?: string }>
}

type GuardarComo = (opciones: {
  suggestedName: string
  types: { description: string; accept: Record<string, string[]> }[]
}) => Promise<{
  name: string
  createWritable(): Promise<{
    write(dato: Blob): Promise<void>
    close(): Promise<void>
  }>
}>
