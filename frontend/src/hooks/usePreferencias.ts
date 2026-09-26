/*
 * Copyright (C) 2024-2026 Luis Vilela Acuña <contacto@edumind.es>
 * Author: Luis Vilela Acuña
 *
 * Preferencias de acceso: "Cómo aprendo mejor".
 *
 * Cada alumno accede a la información de una forma distinta. En lugar de un
 * único modo "accesible" aparte —que siempre acaba siendo la versión pobre—,
 * estas preferencias modifican la app entera. Se guardan como atributos en
 * <html> para que el CSS reaccione sin que ningún componente tenga que saber
 * nada, y se recuerdan en el navegador de quien las eligió.
 *
 * Ninguna preferencia viaja al servidor: son del alumno y de su equipo.
 */
import { useCallback, useEffect, useState } from 'react'
import { IDIOMAS, traducir, type Idioma } from '../i18n/textos'

export type { Idioma }

export type Texto = 'normal' | 'grande' | 'enorme'
export type Fuente = 'normal' | 'legible'
export type Contraste = 'normal' | 'alto'
export type ColorLeds = 'rojo' | 'ambar' | 'blanco'
export type Movimiento = 'normal' | 'reducido'
export type Explicacion = 'sencillo' | 'normal' | 'detalle'
export type Editor = 'completo' | 'sencillo'

/* Lenguas en las que el tutor responde con calidad suficiente. En euskera
   ningún modelo que quepa en este servidor da un resultado aceptable, así
   que se dice en voz alta en lugar de servir algo ininteligible. */
export const TUTOR_SIN_SOPORTE: Idioma[] = ['eu']
/* Lenguas que necesitan el modelo grande: responde bien pero más despacio. */
export const TUTOR_LENTO: Idioma[] = ['gl', 'ca']
/*
 * Lenguas cuya interfaz se tradujo con ayuda de IA y ningún hablante nativo
 * ha revisado todavía. Se advierte antes de que un alumno lea algo raro y
 * piense que el raro es él.
 */
export const TRADUCCION_SIN_REVISAR: Idioma[] = ['eu', 'zh']

export interface Preferencias {
  texto: Texto
  fuente: Fuente
  contraste: Contraste
  leds: ColorLeds
  movimiento: Movimiento
  /* Modo calma: esconde lo accesorio y deja una sola cosa en pantalla. */
  calma: boolean
  /* Cuánto detalle da el tutor. No es "más fácil": es otra manera de contarlo. */
  explicacion: Explicacion
  /*
   * Monaco es un editor profesional: dibuja solo las líneas visibles, tiene
   * autocompletado que salta solo y decenas de atajos. Para quien usa lector
   * de pantalla o necesita una interfaz predecible, eso es ruido. El editor
   * sencillo es un campo de texto normal: menos potente, mucho más llevadero.
   */
  editor: Editor
  idioma: Idioma
}

export const PREFERENCIAS_POR_DEFECTO: Preferencias = {
  texto: 'normal',
  fuente: 'normal',
  contraste: 'normal',
  leds: 'rojo',
  movimiento: 'normal',
  calma: false,
  explicacion: 'normal',
  editor: 'completo',
  idioma: 'es',
}

const CLAVE = 'edumind-preferencias'

/* Un solo sitio donde se decide qué atributo lleva cada preferencia. */
function aplicar(p: Preferencias) {
  const html = document.documentElement
  html.dataset.texto = p.texto
  html.dataset.fuente = p.fuente
  html.dataset.contraste = p.contraste
  html.dataset.leds = p.leds
  html.dataset.movimiento = p.movimiento
  html.dataset.calma = p.calma ? 'si' : 'no'
  html.dataset.explicacion = p.explicacion
  html.dataset.editor = p.editor
  html.dataset.idioma = p.idioma
  /* El atributo lang hace que el lector de pantalla use la voz y la
     pronunciación correctas, y que el navegador corte las palabras bien. */
  html.setAttribute('lang', IDIOMAS[p.idioma].htmlLang)
}

function leer(): Preferencias {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (!guardado) {
      /* Si el sistema operativo ya pide menos movimiento, se respeta de
         entrada: quien lo configuró no debería tener que repetirlo aquí. */
      const menosMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      return { ...PREFERENCIAS_POR_DEFECTO, movimiento: menosMovimiento ? 'reducido' : 'normal' }
    }
    return { ...PREFERENCIAS_POR_DEFECTO, ...JSON.parse(guardado) }
  } catch {
    return PREFERENCIAS_POR_DEFECTO
  }
}

/*
 * Las preferencias son de la sesión entera, no de un componente: el panel las
 * cambia y el editor, el simulador y el tutor tienen que enterarse. Por eso el
 * estado vive en el módulo y los componentes se suscriben. (Con useState por
 * componente, cada uno tenía su copia y el panel no afectaba a nadie más.)
 */
let estado: Preferencias | null = null
const oyentes = new Set<(p: Preferencias) => void>()

function actual(): Preferencias {
  if (!estado) {
    estado = leer()
    aplicar(estado)
  }
  return estado
}

function publicar(nuevo: Preferencias) {
  estado = nuevo
  aplicar(nuevo)
  try {
    localStorage.setItem(CLAVE, JSON.stringify(nuevo))
  } catch {
    /* Navegador sin almacenamiento: valen para esta sesión. */
  }
  oyentes.forEach((avisar) => avisar(nuevo))
}

export function usePreferencias() {
  const [preferencias, setPreferencias] = useState<Preferencias>(actual)

  useEffect(() => {
    oyentes.add(setPreferencias)
    /* Por si algo cambió entre el primer pintado y la suscripción. */
    setPreferencias(actual())
    return () => {
      oyentes.delete(setPreferencias)
    }
  }, [])

  const cambiar = useCallback(
    <C extends keyof Preferencias>(clave: C, valor: Preferencias[C]) =>
      publicar({ ...actual(), [clave]: valor }),
    [],
  )

  const restablecer = useCallback(() => publicar(PREFERENCIAS_POR_DEFECTO), [])

  return { preferencias, cambiar, restablecer }
}

/* Traduce con la lengua elegida ahora mismo. */
export function useTextos() {
  const { preferencias } = usePreferencias()
  const t = useCallback(
    (clave: string) => traducir(preferencias.idioma, clave),
    [preferencias.idioma],
  )
  return { t, idioma: preferencias.idioma }
}

/* Lectura suelta para quien solo necesita consultar, no modificar. */
export function idiomaActual(): Idioma {
  const valor = document.documentElement.dataset.idioma
  return (valor && valor in IDIOMAS ? valor : 'es') as Idioma
}

export function nivelExplicacion(): Explicacion {
  const valor = document.documentElement.dataset.explicacion
  return valor === 'sencillo' || valor === 'detalle' ? valor : 'normal'
}
