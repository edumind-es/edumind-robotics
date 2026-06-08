#
# Copyright (C) 2024-2025 EDUmind - Los Mundos Edufis
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
Simulador de micro:bit con matriz LED 5x5, botones y sensores.
Emula el comportamiento real del hardware para pruebas sin dispositivo físico.
"""
import time
import random
from typing import List, Dict, Optional, Tuple
from enum import Enum
import json


class Image:
    """Imágenes predefinidas y personalizadas de micro:bit."""

    def __init__(self, pattern: str):
        rows = pattern.split(":")
        if len(rows) != 5 or any(len(row) != 5 for row in rows):
            raise ValueError("Image pattern must have 5 rows of 5 digits")

        self.grid = [
            [max(0, min(9, int(value))) for value in row]
            for row in rows
        ]

    def to_grid(self) -> List[List[int]]:
        return [row[:] for row in self.grid]
    HEART = [
        [0, 1, 0, 1, 0],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0]
    ]

    HEART_SMALL = [
        [0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0]
    ]

    HAPPY = [
        [0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0]
    ]

    SAD = [
        [0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1]
    ]

    ARROW_N = [
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 0, 1, 0, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0]
    ]

    ARROW_S = [
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [1, 0, 1, 0, 1],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0]
    ]

    ARROW_E = [
        [0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0],
        [1, 1, 1, 1, 1],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0]
    ]

    ARROW_W = [
        [0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0],
        [1, 1, 1, 1, 1],
        [0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0]
    ]

    YES = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1],
        [0, 0, 0, 1, 0],
        [1, 0, 1, 0, 0],
        [0, 1, 0, 0, 0]
    ]

    NO = [
        [1, 0, 0, 0, 1],
        [0, 1, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0],
        [1, 0, 0, 0, 1]
    ]

    TARGET = [
        [0, 9, 9, 9, 0],
        [9, 0, 0, 0, 9],
        [9, 0, 9, 0, 9],
        [9, 0, 0, 0, 9],
        [0, 9, 9, 9, 0]
    ]

    SQUARE = [
        [9, 9, 9, 9, 9],
        [9, 0, 0, 0, 9],
        [9, 0, 0, 0, 9],
        [9, 0, 0, 0, 9],
        [9, 9, 9, 9, 9]
    ]

    DIAMOND_SMALL = [
        [0, 0, 9, 0, 0],
        [0, 9, 0, 9, 0],
        [9, 0, 0, 0, 9],
        [0, 9, 0, 9, 0],
        [0, 0, 9, 0, 0]
    ]


CHAR_PATTERNS: Dict[str, List[List[int]]] = {
    "0": [[0, 9, 9, 9, 0], [9, 0, 0, 0, 9], [9, 0, 0, 0, 9], [9, 0, 0, 0, 9], [0, 9, 9, 9, 0]],
    "1": [[0, 0, 9, 0, 0], [0, 9, 9, 0, 0], [0, 0, 9, 0, 0], [0, 0, 9, 0, 0], [0, 9, 9, 9, 0]],
    "2": [[0, 9, 9, 9, 0], [9, 0, 0, 0, 9], [0, 0, 0, 9, 0], [0, 0, 9, 0, 0], [9, 9, 9, 9, 9]],
    "3": [[9, 9, 9, 9, 0], [0, 0, 0, 0, 9], [0, 0, 9, 9, 0], [0, 0, 0, 0, 9], [9, 9, 9, 9, 0]],
    "4": [[9, 0, 0, 9, 0], [9, 0, 0, 9, 0], [9, 9, 9, 9, 9], [0, 0, 0, 9, 0], [0, 0, 0, 9, 0]],
    "5": [[9, 9, 9, 9, 9], [9, 0, 0, 0, 0], [9, 9, 9, 9, 0], [0, 0, 0, 0, 9], [9, 9, 9, 9, 0]],
    "6": [[0, 9, 9, 9, 0], [9, 0, 0, 0, 0], [9, 9, 9, 9, 0], [9, 0, 0, 0, 9], [0, 9, 9, 9, 0]],
    "7": [[9, 9, 9, 9, 9], [0, 0, 0, 0, 9], [0, 0, 0, 9, 0], [0, 0, 9, 0, 0], [0, 9, 0, 0, 0]],
    "8": [[0, 9, 9, 9, 0], [9, 0, 0, 0, 9], [0, 9, 9, 9, 0], [9, 0, 0, 0, 9], [0, 9, 9, 9, 0]],
    "9": [[0, 9, 9, 9, 0], [9, 0, 0, 0, 9], [0, 9, 9, 9, 9], [0, 0, 0, 0, 9], [0, 9, 9, 9, 0]],
    "A": [[0, 9, 9, 9, 0], [9, 0, 0, 0, 9], [9, 9, 9, 9, 9], [9, 0, 0, 0, 9], [9, 0, 0, 0, 9]],
    "E": [[9, 9, 9, 9, 9], [9, 0, 0, 0, 0], [9, 9, 9, 9, 0], [9, 0, 0, 0, 0], [9, 9, 9, 9, 9]],
    "N": [[9, 0, 0, 0, 9], [9, 9, 0, 0, 9], [9, 0, 9, 0, 9], [9, 0, 0, 9, 9], [9, 0, 0, 0, 9]],
    "O": [[0, 9, 9, 9, 0], [9, 0, 0, 0, 9], [9, 0, 0, 0, 9], [9, 0, 0, 0, 9], [0, 9, 9, 9, 0]],
    "S": [[0, 9, 9, 9, 9], [9, 0, 0, 0, 0], [0, 9, 9, 9, 0], [0, 0, 0, 0, 9], [9, 9, 9, 9, 0]],
    "!": [[0, 0, 9, 0, 0], [0, 0, 9, 0, 0], [0, 0, 9, 0, 0], [0, 0, 0, 0, 0], [0, 0, 9, 0, 0]],
    "<": [[0, 0, 0, 9, 0], [0, 0, 9, 0, 0], [0, 9, 0, 0, 0], [0, 0, 9, 0, 0], [0, 0, 0, 9, 0]],
    ">": [[0, 9, 0, 0, 0], [0, 0, 9, 0, 0], [0, 0, 0, 9, 0], [0, 0, 9, 0, 0], [0, 9, 0, 0, 0]],
}


class ButtonState(str, Enum):
    """Estados posibles de los botones"""
    RELEASED = "released"
    PRESSED = "pressed"


class MicrobitSimulator:
    """
    Simulador completo de micro:bit.
    Emula display, botones, sensores y pines.
    """

    def __init__(self, simulator_id: str = "default"):
        self.simulator_id = simulator_id

        # Display 5x5 (0-9 para intensidad de LED)
        self.display_grid: List[List[int]] = [[0]*5 for _ in range(5)]
        self.display_text: str = ""
        self.display_scrolling: bool = False

        # Botones
        self.button_a_state: ButtonState = ButtonState.RELEASED
        self.button_b_state: ButtonState = ButtonState.RELEASED
        self.button_a_pressed_count: int = 0
        self.button_b_pressed_count: int = 0

        # Sensores
        self.temperature: int = 22  # Celsius
        self.light_level: int = 128  # 0-255

        # Acelerómetro (x, y, z en mg - mili-g)
        self.accelerometer: Dict[str, int] = {"x": 0, "y": 0, "z": -1024}

        # Brújula (heading en grados)
        self.compass_heading: int = 0
        self.compass_calibrated: bool = False

        # Pines (0, 1, 2)
        self.pins: Dict[int, Dict] = {
            0: {"analog": 0, "digital": 0, "mode": "input"},
            1: {"analog": 0, "digital": 0, "mode": "input"},
            2: {"analog": 0, "digital": 0, "mode": "input"}
        }

        # Estado de ejecución
        self.running: bool = False
        self.code: str = ""
        self.output_log: List[str] = []
        self.error_log: List[str] = []

        # Timestamp
        self.last_update = time.time()

    # ==================== DISPLAY ====================

    def display_show(self, image_or_text):
        """Muestra imagen o texto en el display"""
        if isinstance(image_or_text, Image):
            self.display_grid = image_or_text.to_grid()
            self.display_text = ""
            self.display_scrolling = False
        elif isinstance(image_or_text, list):
            # Es una matriz (imagen)
            self.display_grid = [
                [9 if value == 1 else max(0, min(9, int(value))) for value in row]
                for row in image_or_text
            ]
            self.display_text = ""
            self.display_scrolling = False
        elif isinstance(image_or_text, str):
            self.display_text = image_or_text
            self.display_scrolling = False
            first_char = image_or_text[:1].upper()
            self.display_grid = [
                row[:] for row in CHAR_PATTERNS.get(first_char, [[0]*5 for _ in range(5)])
            ]
        self.last_update = time.time()

    def display_clear(self):
        """Limpia el display"""
        self.display_grid = [[0]*5 for _ in range(5)]
        self.display_text = ""
        self.display_scrolling = False
        self.last_update = time.time()

    def display_scroll(self, text: str):
        """Activa modo scroll de texto"""
        self.display_text = text
        self.display_scrolling = True
        first_char = text[:1].upper()
        self.display_grid = [
            row[:] for row in CHAR_PATTERNS.get(first_char, [[0]*5 for _ in range(5)])
        ]
        self.last_update = time.time()

    def display_set_pixel(self, x: int, y: int, value: int):
        """Enciende/apaga un pixel específico"""
        if 0 <= x < 5 and 0 <= y < 5:
            self.display_grid[y][x] = min(9, max(0, value))
            self.last_update = time.time()

    def display_get_pixel(self, x: int, y: int) -> int:
        """Obtiene el valor de un pixel"""
        if 0 <= x < 5 and 0 <= y < 5:
            return self.display_grid[y][x]
        return 0

    # ==================== BOTONES ====================

    def button_a_press(self):
        """Simula presión del botón A"""
        self.button_a_state = ButtonState.PRESSED
        self.button_a_pressed_count += 1
        self.last_update = time.time()

    def button_a_release(self):
        """Simula liberación del botón A"""
        self.button_a_state = ButtonState.RELEASED
        self.last_update = time.time()

    def button_a_is_pressed(self) -> bool:
        """Verifica si botón A está presionado"""
        return self.button_a_state == ButtonState.PRESSED

    def button_a_was_pressed(self) -> bool:
        """Verifica si botón A fue presionado (y resetea contador)"""
        if self.button_a_pressed_count > 0:
            self.button_a_pressed_count = 0
            return True
        return False

    def button_b_press(self):
        """Simula presión del botón B"""
        self.button_b_state = ButtonState.PRESSED
        self.button_b_pressed_count += 1
        self.last_update = time.time()

    def button_b_release(self):
        """Simula liberación del botón B"""
        self.button_b_state = ButtonState.RELEASED
        self.last_update = time.time()

    def button_b_is_pressed(self) -> bool:
        """Verifica si botón B está presionado"""
        return self.button_b_state == ButtonState.PRESSED

    def button_b_was_pressed(self) -> bool:
        """Verifica si botón B fue presionado (y resetea contador)"""
        if self.button_b_pressed_count > 0:
            self.button_b_pressed_count = 0
            return True
        return False

    # ==================== SENSORES ====================

    def get_temperature(self) -> int:
        """Obtiene temperatura en Celsius"""
        # Añadir un poco de variación aleatoria
        variation = random.randint(-1, 1)
        return self.temperature + variation

    def set_temperature(self, temp: int):
        """Establece temperatura simulada"""
        self.temperature = temp
        self.last_update = time.time()

    def get_light_level(self) -> int:
        """Obtiene nivel de luz (0-255)"""
        variation = random.randint(-5, 5)
        return max(0, min(255, self.light_level + variation))

    def set_light_level(self, level: int):
        """Establece nivel de luz simulado"""
        self.light_level = max(0, min(255, level))
        self.last_update = time.time()

    def get_accelerometer(self) -> Dict[str, int]:
        """Obtiene valores del acelerómetro"""
        return self.accelerometer.copy()

    def set_accelerometer(self, x: int, y: int, z: int):
        """Establece valores del acelerómetro (para simular movimiento)"""
        self.accelerometer = {"x": x, "y": y, "z": z}
        self.last_update = time.time()

    def get_compass_heading(self) -> int:
        """Obtiene dirección de la brújula (0-359 grados)"""
        if not self.compass_calibrated:
            return 0
        return self.compass_heading

    def set_compass_heading(self, heading: int):
        """Establece dirección de la brújula"""
        self.compass_heading = heading % 360
        self.compass_calibrated = True
        self.last_update = time.time()

    # ==================== PINES ====================

    def pin_read_analog(self, pin: int) -> int:
        """Lee valor analógico de un pin (0-1023)"""
        if pin in self.pins:
            return self.pins[pin]["analog"]
        return 0

    def pin_read_digital(self, pin: int) -> int:
        """Lee valor digital de un pin (0 o 1)"""
        if pin in self.pins:
            return self.pins[pin]["digital"]
        return 0

    def pin_write_analog(self, pin: int, value: int):
        """Escribe valor analógico en un pin (0-1023)"""
        if pin in self.pins:
            self.pins[pin]["analog"] = max(0, min(1023, value))
            self.pins[pin]["mode"] = "output"
            self.last_update = time.time()

    def pin_write_digital(self, pin: int, value: int):
        """Escribe valor digital en un pin (0 o 1)"""
        if pin in self.pins:
            self.pins[pin]["digital"] = 1 if value else 0
            self.pins[pin]["mode"] = "output"
            self.last_update = time.time()

    # ==================== ESTADO Y SERIALIZACIÓN ====================

    def get_state(self) -> Dict:
        """Obtiene el estado completo del simulador"""
        return {
            "simulator_id": self.simulator_id,
            "display": {
                "grid": self.display_grid,
                "text": self.display_text,
                "scrolling": self.display_scrolling
            },
            "buttons": {
                "a": {
                    "state": self.button_a_state.value,
                    "pressed_count": self.button_a_pressed_count
                },
                "b": {
                    "state": self.button_b_state.value,
                    "pressed_count": self.button_b_pressed_count
                }
            },
            "sensors": {
                "temperature": self.temperature,
                "light_level": self.light_level,
                "accelerometer": self.accelerometer,
                "compass": {
                    "heading": self.compass_heading,
                    "calibrated": self.compass_calibrated
                }
            },
            "pins": self.pins,
            "running": self.running,
            "output_log": self.output_log,
            "error_log": self.error_log,
            "last_update": self.last_update
        }

    def to_json(self) -> str:
        """Convierte el estado a JSON"""
        return json.dumps(self.get_state())

    def add_log(self, message: str):
        """Añade mensaje al log de salida"""
        self.output_log.append(f"[{time.time()}] {message}")
        self.last_update = time.time()

    def add_error(self, error: str):
        """Añade error al log de errores"""
        self.error_log.append(f"[{time.time()}] {error}")
        self.last_update = time.time()

    def reset(self):
        """Resetea el simulador a estado inicial"""
        self.__init__(self.simulator_id)


# Instancia global del simulador (para pruebas rápidas)
default_simulator = MicrobitSimulator("default")
