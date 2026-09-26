#
# Copyright (C) 2024-2026 Luis Vilela Acuña <contacto@edumind.es>
# Author: Luis Vilela Acuña
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
#

"""
Simulador del mBot (Makeblock).

Es el robot que más se ve en las aulas de Polos Creativos de Galicia. A
diferencia del Nezha, que se acopla a un micro:bit, el mBot lleva su propia
placa: dos motores, sensor de ultrasonidos, seguidor de línea, dos LEDs RGB
y zumbador.

Los rangos son los del robot real, para que lo que el alumno aprende aquí le
sirva cuando tenga el mBot delante:
- Motores: -255 a 255 (el mBot usa la escala del PWM de Arduino, no
  porcentajes como el Nezha).
- Ultrasonidos: 3 a 400 cm.
- Seguidor de línea: dos sensores, cada uno ve negro o blanco.
"""
import time
from dataclasses import dataclass, field
from typing import Dict, List

# Escala de los motores del mBot: es la del PWM de Arduino.
VELOCIDAD_MAXIMA = 255

# Lo que el sensor de ultrasonidos puede medir.
DISTANCIA_MINIMA = 3
DISTANCIA_MAXIMA = 400


@dataclass
class EstadoMBot:
    """Todo lo que el robot tiene en un momento dado."""

    # M1 es el motor izquierdo y M2 el derecho, como serigrafía la placa.
    motores: Dict[str, int] = field(default_factory=lambda: {"m1": 0, "m2": 0})
    # Dos LEDs RGB en la placa, cada uno con su color.
    leds: Dict[str, Dict[str, int]] = field(
        default_factory=lambda: {
            "izquierdo": {"r": 0, "g": 0, "b": 0},
            "derecho": {"r": 0, "g": 0, "b": 0},
        }
    )
    ultrasonidos: int = 100
    # True = el sensor ve línea negra.
    seguidor: Dict[str, bool] = field(
        default_factory=lambda: {"izquierdo": False, "derecho": False}
    )
    zumbador: int = 0  # frecuencia en hercios; 0 es silencio
    luz: int = 512  # sensor de luz, 0-1023 como en Arduino


class MBotSimulator:
    """Simulador del mBot con la misma forma que los demás simuladores."""

    def __init__(self, simulator_id: str = "mbot_default"):
        self.simulator_id = simulator_id
        self.estado = EstadoMBot()
        self.registro: List[str] = []
        self.inicio = time.time()

    # ── Motores ───────────────────────────────────────────────────────────

    def mover_motor(self, motor: str, velocidad: int) -> None:
        """Velocidad de un motor, recortada al rango real de la placa."""
        clave = motor.lower()
        if clave not in self.estado.motores:
            raise ValueError(f"El mBot no tiene el motor '{motor}'. Usa m1 o m2.")
        self.estado.motores[clave] = max(
            -VELOCIDAD_MAXIMA, min(VELOCIDAD_MAXIMA, int(velocidad))
        )
        self._anotar(f"Motor {clave.upper()} a {self.estado.motores[clave]}")

    def avanzar(self, velocidad: int = 150) -> None:
        """Los dos motores hacia adelante."""
        self.mover_motor("m1", velocidad)
        self.mover_motor("m2", velocidad)

    def retroceder(self, velocidad: int = 150) -> None:
        self.mover_motor("m1", -velocidad)
        self.mover_motor("m2", -velocidad)

    def girar_izquierda(self, velocidad: int = 150) -> None:
        """Un motor adelante y el otro atrás: el robot gira sobre sí mismo."""
        self.mover_motor("m1", -velocidad)
        self.mover_motor("m2", velocidad)

    def girar_derecha(self, velocidad: int = 150) -> None:
        self.mover_motor("m1", velocidad)
        self.mover_motor("m2", -velocidad)

    def parar(self) -> None:
        self.mover_motor("m1", 0)
        self.mover_motor("m2", 0)
        self._anotar("Robot parado")

    # ── LEDs y zumbador ───────────────────────────────────────────────────

    def encender_led(self, cual: str, r: int, g: int, b: int) -> None:
        """
        Color de un LED. 'ambos' cambia los dos a la vez, que es lo que el
        alumno quiere casi siempre.
        """
        color = {c: max(0, min(255, int(v))) for c, v in (("r", r), ("g", g), ("b", b))}
        objetivo = cual.lower()
        if objetivo == "ambos":
            self.estado.leds["izquierdo"] = dict(color)
            self.estado.leds["derecho"] = dict(color)
        elif objetivo in self.estado.leds:
            self.estado.leds[objetivo] = color
        else:
            raise ValueError(
                f"El mBot no tiene el LED '{cual}'. Usa izquierdo, derecho o ambos."
            )
        self._anotar(f"LED {objetivo} en ({color['r']}, {color['g']}, {color['b']})")

    def pitar(self, frecuencia: int) -> None:
        self.estado.zumbador = max(0, int(frecuencia))
        self._anotar(
            "Zumbador apagado" if not frecuencia else f"Zumbador a {frecuencia} Hz"
        )

    # ── Sensores ──────────────────────────────────────────────────────────

    def poner_distancia(self, centimetros: int) -> None:
        """Simula lo que ve el sensor de ultrasonidos."""
        self.estado.ultrasonidos = max(
            DISTANCIA_MINIMA, min(DISTANCIA_MAXIMA, int(centimetros))
        )

    def poner_seguidor(self, izquierdo: bool, derecho: bool) -> None:
        """Simula qué ve cada sensor de línea."""
        self.estado.seguidor = {
            "izquierdo": bool(izquierdo),
            "derecho": bool(derecho),
        }

    def poner_luz(self, nivel: int) -> None:
        self.estado.luz = max(0, min(1023, int(nivel)))

    # ── Estado ────────────────────────────────────────────────────────────

    def _anotar(self, mensaje: str) -> None:
        self.registro.append(mensaje)
        # El registro es para que el alumno vea qué ha pasado, no un historial
        # completo: se queda con lo último.
        if len(self.registro) > 50:
            self.registro = self.registro[-50:]

    def get_state(self) -> Dict:
        """Estado completo, con la misma forma que los demás simuladores."""
        return {
            "simulator_id": self.simulator_id,
            "platform": "mbot",
            "motors": dict(self.estado.motores),
            "leds": {k: dict(v) for k, v in self.estado.leds.items()},
            "sensors": {
                "ultrasonic": self.estado.ultrasonidos,
                "line": dict(self.estado.seguidor),
                "light": self.estado.luz,
            },
            "buzzer": self.estado.zumbador,
            "log": list(self.registro),
            "uptime_ms": int((time.time() - self.inicio) * 1000),
        }

    def reset(self) -> None:
        self.estado = EstadoMBot()
        self.registro = []
        self._anotar("mBot reiniciado")
