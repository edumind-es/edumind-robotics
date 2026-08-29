/*
 * Copyright (C) 2024-2025 EDUmind - Los Mundos Edufis
 * Author: Luis Vilela Acuña
 *
 * Pedagogía — el porqué de la app: IA local, comprensión frente a copia,
 * y un FAQ de consulta para docentes y familias.
 */

import React from 'react'
import './Pedagogia.css'

interface PedagogiaProps {
  /* Modelo realmente en uso, leído de /api/system/policy. */
  aiModel: string
  /* true si el endpoint de IA es local; pinta la promesa de privacidad. */
  aiLocal: boolean
  onStart: () => void
}

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: '¿Los datos de mis alumnos salen del centro?',
    a: (
      <>
        No. El modelo se ejecuta en el servidor de EDUmind y las preguntas se
        procesan ahí mismo. No hay cuenta de OpenAI, ni de Google, ni de ningún
        tercero: no existe un contrato de encargado de tratamiento que firmar
        porque no hay nadie a quien ceder los datos. La app además rechaza por
        código cualquier intento de apuntar la IA a un servidor remoto.
      </>
    ),
  },
  {
    q: '¿Por qué tarda unos segundos en responder?',
    a: (
      <>
        Porque piensa aquí, no en un centro de datos. Un servicio en la nube
        reparte tu pregunta entre miles de tarjetas gráficas; nosotros usamos un
        procesador. Esa espera de unos segundos es exactamente el precio de que
        la pregunta de un menor no viaje a ninguna parte. Nos ha parecido un
        precio justo, y hemos ajustado el tutor para que responda corto y al
        grano en lugar de soltar parrafadas.
      </>
    ),
  },
  {
    q: '¿No estaré enseñando a mis alumnos a que la máquina les haga el trabajo?',
    a: (
      <>
        Ese es justo el riesgo que esta app está diseñada para evitar. El tutor
        no entrega un programa terminado y en silencio: explica qué hace cada
        línea, por qué funciona y cómo comprobarlo en el simulador. El objetivo
        no es que el alumno obtenga código, sino que sepa leerlo. Un alumno que
        no entiende lo que ha pegado no ha aprendido nada, y el tutor está
        instruido para no dejarlo en ese punto.
      </>
    ),
  },
  {
    q: '¿Necesito hardware para usarla?',
    a: (
      <>
        No para empezar. El laboratorio simula la matriz de LEDs 5×5, los
        botones y los sensores del micro:bit, y los motores del Nezha. Un aula
        sin placas puede trabajar el curso entero; cuando llegue el hardware, el
        mismo código funciona sin cambios.
      </>
    ),
  },
  {
    q: '¿Se guarda lo que escriben los alumnos?',
    a: (
      <>
        Las conversaciones no se persisten. Puedes comprobarlo tú mismo: la
        franja de privacidad que aparece en la app lee el estado real del
        servidor, no un texto decorativo que hayamos escrito nosotros.
      </>
    ),
  },
  {
    q: '¿Puedo saber qué está costando entender a mi grupo?',
    a: (
      <>
        Todavía no. Es la siguiente pieza prevista: un registro de uso para que
        el docente vea qué conceptos atascan a su clase. Se hará con
        identificación del profesorado, nunca del alumnado, y sin abrir la
        puerta a ningún tercero.
      </>
    ),
  },
]

const Pedagogia: React.FC<PedagogiaProps> = ({ aiModel, aiLocal, onStart }) => {
  return (
    <main className="edm-app pedagogia">
      <div className="edm-container">
        <header className="edm-hero">
          <p className="edm-kicker">La pedagogía detrás del laboratorio</p>
          <h1>Entender el código, no solo obtenerlo</h1>
          <p className="edm-subtitle">
            Por qué este laboratorio usa una IA que corre en el propio centro,
            responde despacio y explica línea a línea.
          </p>
        </header>

        <section className="pedagogia__section" aria-labelledby="ped-porque">
          <h2 id="ped-porque">La diferencia entre copiar y comprender</h2>
          <p>
            Una IA que escribe el programa entero deja al alumno con un texto que
            funciona y que no sabe leer. Aquí el tutor trabaja al revés: parte de
            lo que el alumno quiere conseguir, propone el código mínimo que lo
            logra y se detiene en qué hace cada instrucción y cómo verificarla en
            el simulador.
          </p>
          <p>
            La programación con micro:bit y Nezha tiene una ventaja rara en el
            aula: el resultado se <em>ve</em>. Un LED que parpadea o un motor que
            gira es una hipótesis comprobada en dos segundos. El tutor está para
            acompañar ese ciclo de probar, fallar y entender, no para saltárselo.
          </p>
        </section>

        <section className="pedagogia__section pedagogia__section--highlight" aria-labelledby="ped-local">
          <h2 id="ped-local">Qué significa que la IA sea local</h2>
          <p>
            {aiLocal ? (
              <>
                Ahora mismo este laboratorio está pensando con{' '}
                <strong>{aiModel}</strong> dentro del servidor de EDUmind.
              </>
            ) : (
              <>
                Atención: la comprobación automática indica que el punto de IA no
                es local. Revísalo antes de usarlo con alumnado.
              </>
            )}{' '}
            La pregunta que escribe un alumno de diez años entra en un ordenador,
            se responde en ese ordenador y ahí se queda.
          </p>
          <ul className="pedagogia__list">
            <li>
              <strong>Sin cesión a terceros.</strong> No hay proveedor externo al
              que ceder datos de menores, que son categoría especialmente
              protegida.
            </li>
            <li>
              <strong>Sin cuentas ni registro para el alumnado.</strong> Nadie
              tiene que dar un correo para aprender a encender un LED.
            </li>
            <li>
              <strong>Verificable, no prometido.</strong> La app comprueba en
              cada arranque que el punto de IA es local y lo muestra en pantalla.
              Si alguien lo cambiara, se vería.
            </li>
          </ul>
          <p className="pedagogia__note">
            Desde agosto de 2026 el Reglamento europeo de IA exige a los centros
            responsabilidades concretas sobre los sistemas que usan con su
            alumnado. Una herramienta que no envía nada fuera simplifica esa
            conversación antes de que empiece.
          </p>
        </section>

        <section className="pedagogia__section" aria-labelledby="ped-espera">
          <h2 id="ped-espera">Sobre la espera</h2>
          <p>
            El tutor tarda unos segundos en arrancar la respuesta. No está
            colgado: está pensando en local. Preferimos decirlo claro en vez de
            disimularlo, porque esa espera es la prueba visible de que la
            pregunta no ha salido del centro. Aun así hemos ajustado el sistema
            para que empiece a escribir cuanto antes y sea breve: en un aula, una
            respuesta corta y clara vale más que una larga y perfecta.
          </p>
        </section>

        <section className="pedagogia__section" aria-labelledby="ped-faq">
          <h2 id="ped-faq">Preguntas frecuentes</h2>
          <div className="pedagogia__faq">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="pedagogia__faq-item">
                <summary>{q}</summary>
                <div className="pedagogia__faq-answer">{a}</div>
              </details>
            ))}
          </div>
        </section>

        <div className="edm-hero-actions">
          <button className="edm-button" type="button" onClick={onStart}>
            🔬 Entrar al laboratorio
          </button>
        </div>
      </div>
    </main>
  )
}

export default Pedagogia
