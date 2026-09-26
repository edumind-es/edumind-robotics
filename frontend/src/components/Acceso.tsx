/*
 * Copyright (C) 2024-2026 Luis Vilela Acuña <contacto@edumind.es>
 * Author: Luis Vilela Acuña
 *
 * Panel "Cómo aprendo mejor".
 *
 * Está escrito desde el lado del alumno: nadie tiene que saber qué es el
 * contraste WCAG ni la protanopia para elegir. Cada opción dice qué le pasa
 * a la pantalla, y el cambio se ve al instante detrás del panel.
 */
import React, { useEffect, useRef } from 'react'
import {
  TUTOR_SIN_SOPORTE,
  TUTOR_LENTO,
  TRADUCCION_SIN_REVISAR,
  type Preferencias,
} from '../hooks/usePreferencias'
import { IDIOMAS, traducir, type Idioma } from '../i18n/textos'
import './Acceso.css'

interface AccesoProps {
  preferencias: Preferencias
  cambiar: <C extends keyof Preferencias>(clave: C, valor: Preferencias[C]) => void
  restablecer: () => void
  onCerrar: () => void
  eink: boolean
  setEink: (valor: boolean) => void
}

interface Opcion<T> {
  valor: T
  etiqueta: string
  ayuda?: string
}

function Grupo<T extends string>({
  titulo,
  descripcion,
  nombre,
  opciones,
  valor,
  onCambio,
}: {
  titulo: string
  descripcion: string
  nombre: string
  opciones: Opcion<T>[]
  valor: T
  onCambio: (v: T) => void
}) {
  return (
    <fieldset className="acceso-grupo">
      <legend className="acceso-grupo__titulo">{titulo}</legend>
      <p className="acceso-grupo__desc">{descripcion}</p>
      <div className="acceso-opciones">
        {opciones.map((o) => (
          <label
            key={o.valor}
            className={`acceso-opcion ${valor === o.valor ? 'acceso-opcion--activa' : ''}`}
          >
            <input
              type="radio"
              name={nombre}
              value={o.valor}
              checked={valor === o.valor}
              onChange={() => onCambio(o.valor)}
            />
            <span className="acceso-opcion__etiqueta">{o.etiqueta}</span>
            {o.ayuda && (
              <span className="acceso-opcion__ayuda">{o.ayuda}</span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

const Acceso: React.FC<AccesoProps> = ({
  preferencias,
  cambiar,
  restablecer,
  onCerrar,
  eink,
  setEink,
}) => {
  const t = (clave: string) => traducir(preferencias.idioma, clave)
  const panelRef = useRef<HTMLDivElement>(null)
  const cerrarRef = useRef<HTMLButtonElement>(null)

  /* Al abrirse, el foco entra en el panel; al pulsar Escape, se cierra.
     Quien navega con teclado no debe quedarse atrapado ni perdido. */
  useEffect(() => {
    cerrarRef.current?.focus()
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', alPulsar)
    return () => document.removeEventListener('keydown', alPulsar)
  }, [onCerrar])

  return (
    <div className="acceso-fondo" onClick={onCerrar}>
      <div
        className="acceso-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="acceso-titulo"
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="acceso-cabecera">
          <div>
            <p className="edm-kicker">{t('acceso.kicker')}</p>
            <h2 id="acceso-titulo">{t('acceso.titulo')}</h2>
          </div>
          <button
            className="acceso-cerrar"
            type="button"
            onClick={onCerrar}
            ref={cerrarRef}
            aria-label={t('acceso.cerrar')}
          >
            ✕
          </button>
        </header>

        <p className="acceso-intro">
{t('acceso.intro')}
        </p>

        <div className="acceso-cuerpo">
          <Grupo
            titulo={t('acceso.idioma')}
            descripcion={t('acceso.idiomaDesc')}
            nombre="idioma"
            valor={preferencias.idioma}
            onCambio={(v) => cambiar('idioma', v as Idioma)}
            opciones={(Object.keys(IDIOMAS) as Idioma[]).map((clave) => ({
              valor: clave,
              etiqueta: IDIOMAS[clave].nombre,
            }))}
          />

          {/* Se dice en voz alta lo que el tutor puede y no puede hacer en
              cada lengua, en lugar de servir un texto ininteligible. */}
          {TUTOR_SIN_SOPORTE.includes(preferencias.idioma) && (
            <p className="acceso-aviso" role="note">{t('idioma.avisoTutor')}</p>
          )}
          {TUTOR_LENTO.includes(preferencias.idioma) && (
            <p className="acceso-aviso" role="note">{t('idioma.avisoLento')}</p>
          )}
          {TRADUCCION_SIN_REVISAR.includes(preferencias.idioma) && (
            <p className="acceso-aviso acceso-aviso--traduccion" role="note">
              {t('idioma.avisoTraduccion')}
            </p>
          )}

          <Grupo
            titulo="Tamaño de la letra"
            descripcion="Si te cuesta leer, hazla más grande. Todo crece a la vez."
            nombre="texto"
            valor={preferencias.texto}
            onCambio={(v) => cambiar('texto', v)}
            opciones={[
              { valor: 'normal', etiqueta: 'Normal' },
              { valor: 'grande', etiqueta: 'Grande' },
              { valor: 'enorme', etiqueta: 'Muy grande' },
            ]}
          />

          <Grupo
            titulo="Tipo de letra"
            descripcion="La letra fácil separa mejor las letras que se parecen, como la l y la I."
            nombre="fuente"
            valor={preferencias.fuente}
            onCambio={(v) => cambiar('fuente', v)}
            opciones={[
              { valor: 'normal', etiqueta: 'Normal' },
              { valor: 'legible', etiqueta: 'Letra fácil', ayuda: 'Más separada y aireada' },
            ]}
          />

          <Grupo
            titulo="Colores"
            descripcion="Si no distingues bien los colores o te molesta el brillo."
            nombre="contraste"
            valor={preferencias.contraste}
            onCambio={(v) => cambiar('contraste', v)}
            opciones={[
              { valor: 'normal', etiqueta: 'Normales' },
              { valor: 'alto', etiqueta: 'Muy marcados', ayuda: 'Negro sobre blanco, bordes gruesos' },
            ]}
          />

          <Grupo
            titulo="Luz de la pantalla del micro:bit"
            descripcion="El rojo sobre negro es difícil de ver para mucha gente. Elige el que veas mejor."
            nombre="leds"
            valor={preferencias.leds}
            onCambio={(v) => cambiar('leds', v)}
            opciones={[
              { valor: 'rojo', etiqueta: 'Rojo', ayuda: 'Como la placa real' },
              { valor: 'ambar', etiqueta: 'Ámbar' },
              { valor: 'blanco', etiqueta: 'Blanco', ayuda: 'El que más se ve' },
            ]}
          />

          <Grupo
            titulo="Movimiento"
            descripcion="Las cosas que se mueven pueden marear o distraer."
            nombre="movimiento"
            valor={preferencias.movimiento}
            onCambio={(v) => cambiar('movimiento', v)}
            opciones={[
              { valor: 'normal', etiqueta: 'Normal' },
              { valor: 'reducido', etiqueta: 'Quieto', ayuda: 'Sin animaciones' },
            ]}
          />

          <Grupo
            titulo="Cómo te lo explica el tutor"
            descripcion="No es más fácil ni más difícil: es contarlo de otra manera."
            nombre="explicacion"
            valor={preferencias.explicacion}
            onCambio={(v) => cambiar('explicacion', v)}
            opciones={[
              { valor: 'sencillo', etiqueta: 'Muy claro', ayuda: 'Frases cortas, sin palabras raras' },
              { valor: 'normal', etiqueta: 'Normal' },
              { valor: 'detalle', etiqueta: 'Con detalle', ayuda: 'Más por qué y más ejemplos' },
            ]}
          />

          <Grupo
            titulo="Editor de código"
            descripcion="El editor completo tiene ayudas que aparecen solas. El sencillo es un campo de texto normal, más fácil de usar con teclado o lector de pantalla."
            nombre="editor"
            valor={preferencias.editor}
            onCambio={(v) => cambiar('editor', v)}
            opciones={[
              { valor: 'completo', etiqueta: 'Completo', ayuda: 'Con colores y ayudas' },
              { valor: 'sencillo', etiqueta: 'Sencillo', ayuda: 'Campo de texto, sin sorpresas' },
            ]}
          />

          <fieldset className="acceso-grupo">
            <legend className="acceso-grupo__titulo">Menos cosas en pantalla</legend>
            <p className="acceso-grupo__desc">
              Esconde adornos y avisos para dejar solo lo que estás haciendo.
            </p>
            <label className="acceso-interruptor">
              <input
                type="checkbox"
                checked={preferencias.calma}
                onChange={(e) => cambiar('calma', e.target.checked)}
              />
              <span>Modo calma</span>
            </label>
            <label className="acceso-interruptor">
              <input
                type="checkbox"
                checked={eink}
                onChange={(e) => setEink(e.target.checked)}
              />
              <span>Modo papel (menos luz azul)</span>
            </label>
          </fieldset>
        </div>

        <footer className="acceso-pie">
          <button className="edm-button edm-button--ghost" type="button" onClick={restablecer}>
            {t('acceso.restablecer')}
          </button>
          <button className="edm-button" type="button" onClick={onCerrar}>
            {t('acceso.listo')}
          </button>
        </footer>
      </div>
    </div>
  )
}

export default Acceso
