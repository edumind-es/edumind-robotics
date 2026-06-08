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
Simulador de Nezha (robot expansion board para micro:bit).
Emula motores DC, servomotores y sensores.
"""
import time
from typing import Dict, List, Optional
from enum import Enum
import json


class MotorDirection(str, Enum):
    """Dirección de rotación del motor"""
    FORWARD = "forward"
    BACKWARD = "backward"
    STOP = "stop"


class NezhaSimulator:
    """
    Simulador del sistema Nezha (expansion board).
    Incluye motores DC, servomotores y sensores.
    """

    def __init__(self, simulator_id: str = "default"):
        self.simulator_id = simulator_id

        # Motores DC (M1, M2, M3, M4)
        # speed: -100 to 100 (negativo = reversa)
        self.motors: Dict[int, Dict] = {
            1: {"speed": 0, "direction": MotorDirection.STOP},
            2: {"speed": 0, "direction": MotorDirection.STOP},
            3: {"speed": 0, "direction": MotorDirection.STOP},
            4: {"speed": 0, "direction": MotorDirection.STOP}
        }

        # Servomotores (S1, S2, S3, S4)
        # angle: 0-180 grados
        self.servos: Dict[int, Dict] = {
            1: {"angle": 90, "enabled": False},
            2: {"angle": 90, "enabled": False},
            3: {"angle": 90, "enabled": False},
            4: {"angle": 90, "enabled": False}
        }

        # Sensor ultrasónico (distancia en cm)
        self.ultrasonic_distance: int = 100  # cm

        # Sensor de línea (0 = negro, 1 = blanco)
        self.line_sensors: Dict[str, int] = {
            "left": 0,
            "center": 0,
            "right": 0
        }

        # Sensor de color (RGB)
        self.color_sensor: Dict[str, int] = {
            "r": 0,
            "g": 0,
            "b": 0
        }

        # Estado
        self.running: bool = False
        self.output_log: List[str] = []
        self.error_log: List[str] = []
        self.last_update = time.time()

    # ==================== MOTORES DC ====================

    def motor_set(self, motor: int, speed: int):
        """
        Establece velocidad de un motor DC.

        Args:
            motor: Número de motor (1-4)
            speed: Velocidad (-100 a 100)
                  Positivo = adelante
                  Negativo = atrás
                  0 = detener
        """
        if motor not in self.motors:
            self.add_error(f"Invalid motor: {motor}")
            return

        speed = max(-100, min(100, speed))
        self.motors[motor]["speed"] = speed

        if speed > 0:
            self.motors[motor]["direction"] = MotorDirection.FORWARD
        elif speed < 0:
            self.motors[motor]["direction"] = MotorDirection.BACKWARD
        else:
            self.motors[motor]["direction"] = MotorDirection.STOP

        self.last_update = time.time()
        self.add_log(f"Motor {motor} set to speed {speed}")

    def motor_stop(self, motor: int):
        """Detiene un motor específico"""
        self.motor_set(motor, 0)

    def motor_stop_all(self):
        """Detiene todos los motores"""
        for motor in self.motors:
            self.motor_stop(motor)
        self.add_log("All motors stopped")

    def get_motor_speed(self, motor: int) -> int:
        """Obtiene velocidad actual de un motor"""
        if motor in self.motors:
            return self.motors[motor]["speed"]
        return 0

    # ==================== SERVOMOTORES ====================

    def servo_set(self, servo: int, angle: int):
        """
        Establece ángulo de un servomotor.

        Args:
            servo: Número de servo (1-4)
            angle: Ángulo (0-180 grados)
        """
        if servo not in self.servos:
            self.add_error(f"Invalid servo: {servo}")
            return

        angle = max(0, min(180, angle))
        self.servos[servo]["angle"] = angle
        self.servos[servo]["enabled"] = True

        self.last_update = time.time()
        self.add_log(f"Servo {servo} set to {angle} degrees")

    def servo_disable(self, servo: int):
        """Desactiva un servomotor"""
        if servo in self.servos:
            self.servos[servo]["enabled"] = False
            self.add_log(f"Servo {servo} disabled")

    def servo_get_angle(self, servo: int) -> int:
        """Obtiene ángulo actual de un servo"""
        if servo in self.servos:
            return self.servos[servo]["angle"]
        return 90

    # ==================== SENSOR ULTRASÓNICO ====================

    def ultrasonic_get_distance(self) -> int:
        """
        Obtiene distancia del sensor ultrasónico en cm.

        Returns:
            Distancia en centímetros (0-400)
        """
        # Añadir pequeña variación aleatoria para realismo
        import random
        variation = random.randint(-2, 2)
        distance = max(2, min(400, self.ultrasonic_distance + variation))
        return distance

    def ultrasonic_set_distance(self, distance: int):
        """Establece distancia simulada del sensor (para testing)"""
        self.ultrasonic_distance = max(0, min(400, distance))
        self.last_update = time.time()

    # ==================== SENSOR DE LÍNEA ====================

    def line_sensor_read(self, position: str) -> int:
        """
        Lee sensor de línea.

        Args:
            position: "left", "center", o "right"

        Returns:
            0 = línea negra, 1 = superficie blanca
        """
        if position in self.line_sensors:
            return self.line_sensors[position]
        return 0

    def line_sensor_set(self, left: int, center: int, right: int):
        """Establece valores de sensores de línea (para testing)"""
        self.line_sensors["left"] = 1 if left else 0
        self.line_sensors["center"] = 1 if center else 0
        self.line_sensors["right"] = 1 if right else 0
        self.last_update = time.time()

    # ==================== SENSOR DE COLOR ====================

    def color_sensor_read(self) -> Dict[str, int]:
        """
        Lee sensor de color RGB.

        Returns:
            Dict con valores r, g, b (0-255)
        """
        return self.color_sensor.copy()

    def color_sensor_set(self, r: int, g: int, b: int):
        """Establece color detectado (para testing)"""
        self.color_sensor = {
            "r": max(0, min(255, r)),
            "g": max(0, min(255, g)),
            "b": max(0, min(255, b))
        }
        self.last_update = time.time()

    # ==================== MOVIMIENTO PRE-PROGRAMADO ====================

    def move_forward(self, speed: int = 50):
        """Mueve el robot hacia adelante"""
        self.motor_set(1, speed)
        self.motor_set(2, speed)
        self.add_log(f"Moving forward at speed {speed}")

    def move_backward(self, speed: int = 50):
        """Mueve el robot hacia atrás"""
        self.motor_set(1, -speed)
        self.motor_set(2, -speed)
        self.add_log(f"Moving backward at speed {speed}")

    def turn_left(self, speed: int = 50):
        """Gira a la izquierda"""
        self.motor_set(1, -speed)
        self.motor_set(2, speed)
        self.add_log(f"Turning left at speed {speed}")

    def turn_right(self, speed: int = 50):
        """Gira a la derecha"""
        self.motor_set(1, speed)
        self.motor_set(2, -speed)
        self.add_log(f"Turning right at speed {speed}")

    def stop(self):
        """Detiene todos los movimientos"""
        self.motor_stop_all()

    # ==================== ESTADO Y SERIALIZACIÓN ====================

    def get_state(self) -> Dict:
        """Obtiene el estado completo del simulador Nezha"""
        return {
            "simulator_id": self.simulator_id,
            "motors": self.motors,
            "servos": self.servos,
            "sensors": {
                "ultrasonic": {
                    "distance": self.ultrasonic_distance
                },
                "line": self.line_sensors,
                "color": self.color_sensor
            },
            "running": self.running,
            "output_log": self.output_log,
            "error_log": self.error_log,
            "last_update": self.last_update
        }

    def to_json(self) -> str:
        """Convierte el estado a JSON"""
        return json.dumps(self.get_state())

    def add_log(self, message: str):
        """Añade mensaje al log"""
        self.output_log.append(f"[{time.time()}] {message}")
        if len(self.output_log) > 100:  # Limitar tamaño del log
            self.output_log = self.output_log[-100:]
        self.last_update = time.time()

    def add_error(self, error: str):
        """Añade error al log"""
        self.error_log.append(f"[{time.time()}] {error}")
        if len(self.error_log) > 50:
            self.error_log = self.error_log[-50:]
        self.last_update = time.time()

    def reset(self):
        """Resetea el simulador a estado inicial"""
        self.__init__(self.simulator_id)


# Instancia global
default_nezha = NezhaSimulator("default")
