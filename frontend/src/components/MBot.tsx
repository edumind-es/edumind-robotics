/*
 * Copyright (C) 2024-2026 Luis Vilela Acuña <contacto@edumind.es>
 * Author: Luis Vilela Acuña
 *
 * El mBot virtual.
 *
 * Es el robot de los Polos Creativos. A diferencia del Nezha, que se acopla
 * a un micro:bit, lleva su propia placa: dos motores, ultrasonidos, seguidor
 * de línea, dos LEDs RGB y zumbador.
 *
 * Los controles son accesibles por teclado y todo lo que el color comunica
 * se dice también con palabras, por lo mismo que en el resto de la app.
 */
import React from 'react'
import './MBot.css'

export interface EstadoMBot {
  motors: { m1: number; m2: number }
  leds: {
    izquierdo: { r: number; g: number; b: number }
    derecho: { r: number; g: number; b: number }
  }
  sensors: {
    ultrasonic: number
    line: { izquierdo: boolean; derecho: boolean }
    light: number
  }
  buzzer: number
}

interface MBotProps {
  estado: EstadoMBot
  onMotor: (motor: string, velocidad: number) => void
  onSensor: (cambio: Record<string, number | boolean>) => void
}

/* Un color RGB en palabras, para quien no lo ve. */
function describirColor(c: { r: number; g: number; b: number }): string {
  if (c.r === 0 && c.g === 0 && c.b === 0) return 'apagado'
  const nombres: [string, boolean][] = [
    ['rojo', c.r > 128 && c.g < 128 && c.b < 128],
    ['verde', c.g > 128 && c.r < 128 && c.b < 128],
    ['azul', c.b > 128 && c.r < 128 && c.g < 128],
    ['amarillo', c.r > 128 && c.g > 128 && c.b < 128],
    ['morado', c.r > 128 && c.b > 128 && c.g < 128],
    ['blanco', c.r > 200 && c.g > 200 && c.b > 200],
  ]
  return nombres.find(([, coincide]) => coincide)?.[0] ?? 'encendido'
}

/* Qué está haciendo el robot, deducido de los dos motores. */
function describirMovimiento(m: { m1: number; m2: number }): string {
  if (m.m1 === 0 && m.m2 === 0) return 'parado'
  if (m.m1 > 0 && m.m2 > 0) return 'avanzando'
  if (m.m1 < 0 && m.m2 < 0) return 'retrocediendo'
  if (m.m1 < 0 && m.m2 > 0) return 'girando a la izquierda'
  if (m.m1 > 0 && m.m2 < 0) return 'girando a la derecha'
  return 'moviéndose con un solo motor'
}

const MBot: React.FC<MBotProps> = ({ estado, onMotor, onSensor }) => {
  const movimiento = describirMovimiento(estado.motors)
  const resumen =
    `El mBot está ${movimiento}. ` +
    `Ve una pared a ${estado.sensors.ultrasonic} centímetros. ` +
    `LED izquierdo ${describirColor(estado.leds.izquierdo)}, ` +
    `derecho ${describirColor(estado.leds.derecho)}.`

  const colorCss = (c: { r: number; g: number; b: number }) =>
    `rgb(${c.r}, ${c.g}, ${c.b})`

  return (
    <div className="mbot" role="group" aria-label="mBot virtual">
      {/* Lo que pasa se anuncia, igual que en la pantalla del micro:bit. */}
      <p className="solo-lectores" aria-live="polite">{resumen}</p>

      <div className="mbot-chasis">
        <div className="mbot-cabeza">
          <span className="mbot-sensor-us" aria-hidden="true">
            <i /><i />
          </span>
          <span className="mbot-distancia">{estado.sensors.ultrasonic} cm</span>
        </div>

        <div className="mbot-leds">
          <span
            className="mbot-led"
            style={{ background: colorCss(estado.leds.izquierdo) }}
            title={`LED izquierdo: ${describirColor(estado.leds.izquierdo)}`}
          />
          <span className="mbot-placa">mBot</span>
          <span
            className="mbot-led"
            style={{ background: colorCss(estado.leds.derecho) }}
            title={`LED derecho: ${describirColor(estado.leds.derecho)}`}
          />
        </div>

        <div className="mbot-ruedas">
          {(['m1', 'm2'] as const).map((motor) => (
            <span
              key={motor}
              className={`mbot-rueda ${estado.motors[motor] !== 0 ? 'mbot-rueda--gira' : ''}`}
            >
              {estado.motors[motor]}
            </span>
          ))}
        </div>

        <div className="mbot-linea" aria-hidden="true">
          {(['izquierdo', 'derecho'] as const).map((lado) => (
            <span
              key={lado}
              className={`mbot-ojo ${estado.sensors.line[lado] ? 'mbot-ojo--negro' : ''}`}
            />
          ))}
        </div>
      </div>

      <p className="mbot-estado">{movimiento}</p>

      <div className="mbot-controles">
        {(['m1', 'm2'] as const).map((motor) => (
          <label key={motor} className="mbot-control">
            <span>{motor === 'm1' ? 'Motor izquierdo' : 'Motor derecho'}</span>
            <input
              type="range"
              min={-255}
              max={255}
              step={5}
              value={estado.motors[motor]}
              onChange={(e) => onMotor(motor, Number(e.target.value))}
            />
            <output>{estado.motors[motor]}</output>
          </label>
        ))}

        <label className="mbot-control">
          <span>Pared a</span>
          <input
            type="range"
            min={3}
            max={400}
            step={1}
            value={estado.sensors.ultrasonic}
            onChange={(e) => onSensor({ ultrasonic: Number(e.target.value) })}
          />
          <output>{estado.sensors.ultrasonic} cm</output>
        </label>

        <fieldset className="mbot-seguidor">
          <legend>Sensores de línea</legend>
          {(['izquierdo', 'derecho'] as const).map((lado) => (
            <label key={lado} className="mbot-check">
              <input
                type="checkbox"
                checked={estado.sensors.line[lado]}
                onChange={(e) =>
                  onSensor({
                    [lado === 'izquierdo' ? 'line_left' : 'line_right']: e.target.checked,
                  })
                }
              />
              <span>{lado === 'izquierdo' ? 'Izquierdo' : 'Derecho'} ve negro</span>
            </label>
          ))}
        </fieldset>
      </div>
    </div>
  )
}

export default MBot
