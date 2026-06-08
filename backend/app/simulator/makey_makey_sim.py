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
Simulador de Makey Makey.
Emula el comportamiento de un Makey Makey conectado a micro:bit.
"""
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from enum import Enum
import time


class TouchState(str, Enum):
    """Estados de toque de los pines"""
    TOUCHED = "touched"
    RELEASED = "released"


@dataclass
class PinState:
    """Estado de un pin táctil"""
    state: TouchState = TouchState.RELEASED
    touch_count: int = 0
    last_touch_time: float = 0.0
    was_touched_flag: bool = False


@dataclass
class MakeyMakeyState:
    """Estado completo del Makey Makey"""
    pins: Dict[int, PinState] = field(default_factory=dict)
    ground_connected: bool = True
    sensitivity: int = 50  # 0-100, umbral de detección


class MakeyMakeySimulator:
    """
    Simulador de Makey Makey con pines táctiles capacitivos.
    
    Emula los pines táctiles del micro:bit (0, 1, 2) como 
    entradas de un Makey Makey, permitiendo crear instrumentos
    musicales, controles de juego, etc.
    """

    # Pines táctiles disponibles
    TOUCH_PINS = [0, 1, 2]

    def __init__(self, simulator_id: str = "makey_default"):
        self.simulator_id = simulator_id
        self.state = MakeyMakeyState()
        self.start_time = time.time()
        self.output_log: List[str] = []
        self.error_log: List[str] = []
        
        # Inicializar estado de pines
        for pin in self.TOUCH_PINS:
            self.state.pins[pin] = PinState()

    # ==================== CONTROL DE PINES ====================

    def touch_pin(self, pin: int):
        """Simula tocar un pin (conectar a tierra)"""
        if pin not in self.TOUCH_PINS:
            self.add_error(f"Pin {pin} no es un pin táctil válido")
            return
        
        pin_state = self.state.pins[pin]
        pin_state.state = TouchState.TOUCHED
        pin_state.touch_count += 1
        pin_state.last_touch_time = time.time()
        pin_state.was_touched_flag = True
        self.add_log(f"🖐️ Pin {pin} tocado")

    def release_pin(self, pin: int):
        """Simula soltar un pin (desconectar de tierra)"""
        if pin not in self.TOUCH_PINS:
            return
        
        self.state.pins[pin].state = TouchState.RELEASED
        self.add_log(f"✋ Pin {pin} soltado")

    def is_touched(self, pin: int) -> bool:
        """Verifica si un pin está siendo tocado"""
        if pin not in self.TOUCH_PINS:
            return False
        return self.state.pins[pin].state == TouchState.TOUCHED

    def was_touched(self, pin: int) -> bool:
        """
        Verifica si un pin fue tocado desde la última comprobación.
        Resetea el flag después de verificar.
        """
        if pin not in self.TOUCH_PINS:
            return False
        
        pin_state = self.state.pins[pin]
        was = pin_state.was_touched_flag
        pin_state.was_touched_flag = False
        return was

    def get_touch_count(self, pin: int) -> int:
        """Obtiene el contador de toques de un pin"""
        if pin not in self.TOUCH_PINS:
            return 0
        return self.state.pins[pin].touch_count

    def reset_touch_count(self, pin: int):
        """Resetea el contador de toques de un pin"""
        if pin in self.TOUCH_PINS:
            self.state.pins[pin].touch_count = 0

    # ==================== SENSIBILIDAD ====================

    def set_sensitivity(self, level: int):
        """
        Ajusta la sensibilidad de detección.
        
        Args:
            level: 0-100 (más alto = más sensible)
        """
        self.state.sensitivity = max(0, min(100, level))
        self.add_log(f"⚡ Sensibilidad ajustada a {self.state.sensitivity}")

    def get_sensitivity(self) -> int:
        """Obtiene el nivel de sensibilidad actual"""
        return self.state.sensitivity

    # ==================== ESTADO ====================

    def get_state(self) -> Dict:
        """Retorna el estado completo del simulador"""
        return {
            "simulator_id": self.simulator_id,
            "platform": "makey_makey",
            "pins": {
                pin: {
                    "state": self.state.pins[pin].state.value,
                    "is_touched": self.is_touched(pin),
                    "touch_count": self.get_touch_count(pin)
                }
                for pin in self.TOUCH_PINS
            },
            "sensitivity": self.state.sensitivity,
            "ground_connected": self.state.ground_connected,
            "uptime_ms": int((time.time() - self.start_time) * 1000)
        }

    def to_json(self) -> Dict:
        """Alias para get_state()"""
        return self.get_state()

    # ==================== LOGGING ====================

    def add_log(self, message: str):
        """Añade mensaje al log de salida"""
        self.output_log.append(f"[{time.strftime('%H:%M:%S')}] {message}")
        if len(self.output_log) > 100:
            self.output_log.pop(0)

    def add_error(self, error: str):
        """Añade error al log de errores"""
        self.error_log.append(f"[{time.strftime('%H:%M:%S')}] ❌ {error}")
        if len(self.error_log) > 50:
            self.error_log.pop(0)

    def get_logs(self) -> Dict[str, List[str]]:
        """Retorna todos los logs"""
        return {
            "output": self.output_log,
            "errors": self.error_log
        }

    def clear_logs(self):
        """Limpia todos los logs"""
        self.output_log = []
        self.error_log = []

    # ==================== RESET ====================

    def reset(self):
        """Resetea el simulador a estado inicial"""
        for pin in self.TOUCH_PINS:
            self.state.pins[pin] = PinState()
        self.state.sensitivity = 50
        self.output_log = []
        self.error_log = []
        self.start_time = time.time()
        self.add_log("🔄 Simulador Makey Makey reiniciado")


# ==================== GESTOR DE SESIONES ====================

class MakeyMakeyManager:
    """Gestor de sesiones de Makey Makey"""

    def __init__(self):
        self.sessions: Dict[str, MakeyMakeySimulator] = {}

    def create_session(self, session_id: str) -> MakeyMakeySimulator:
        """Crea una nueva sesión"""
        simulator = MakeyMakeySimulator(session_id)
        self.sessions[session_id] = simulator
        return simulator

    def get_session(self, session_id: str) -> Optional[MakeyMakeySimulator]:
        """Obtiene una sesión existente"""
        return self.sessions.get(session_id)

    def delete_session(self, session_id: str) -> bool:
        """Elimina una sesión"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False

    def list_sessions(self) -> List[str]:
        """Lista todas las sesiones activas"""
        return list(self.sessions.keys())


# Instancia global del gestor
makey_makey_manager = MakeyMakeyManager()
