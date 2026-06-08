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
Gestor de simuladores - maneja múltiples instancias de simuladores.
Permite crear sesiones de simulación únicas por usuario.
"""
from typing import Dict, Optional
import uuid
from .microbit_sim import MicrobitSimulator
from .nezha_sim import NezhaSimulator
from .code_executor import CodeExecutor


class SimulatorSession:
    """Sesión de simulación que contiene micro:bit y opcionalmente Nezha"""

    def __init__(self, session_id: str, platform: str = "microbit"):
        self.session_id = session_id
        self.platform = platform

        # Crear simuladores
        self.microbit = MicrobitSimulator(session_id)
        self.nezha: Optional[NezhaSimulator] = None

        if platform == "nezha":
            self.nezha = NezhaSimulator(session_id)

        # Crear ejecutor de código
        self.executor = CodeExecutor(self.microbit, self.nezha)

    def get_state(self) -> Dict:
        """Obtiene estado completo de la sesión"""
        state = {
            "session_id": self.session_id,
            "platform": self.platform,
            "microbit": self.microbit.get_state()
        }

        if self.nezha:
            state["nezha"] = self.nezha.get_state()

        return state

    def reset(self):
        """Resetea todos los simuladores"""
        self.microbit.reset()
        if self.nezha:
            self.nezha.reset()
        self.executor = CodeExecutor(self.microbit, self.nezha)


class SimulatorManager:
    """
    Gestor centralizado de sesiones de simulación.
    Permite múltiples usuarios simulando simultáneamente.
    """

    def __init__(self):
        self.sessions: Dict[str, SimulatorSession] = {}

    def create_session(self, platform: str = "microbit") -> str:
        """
        Crea una nueva sesión de simulación.

        Args:
            platform: "microbit" o "nezha"

        Returns:
            session_id: ID único de la sesión
        """
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = SimulatorSession(session_id, platform)
        return session_id

    def get_session(self, session_id: str) -> Optional[SimulatorSession]:
        """Obtiene una sesión existente"""
        return self.sessions.get(session_id)

    def delete_session(self, session_id: str) -> bool:
        """Elimina una sesión"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False

    def get_all_sessions(self) -> Dict[str, Dict]:
        """Obtiene información de todas las sesiones activas"""
        return {
            sid: session.get_state()
            for sid, session in self.sessions.items()
        }

    def cleanup_old_sessions(self, max_age_seconds: int = 3600):
        """
        Limpia sesiones antiguas (más de 1 hora por defecto).
        TODO: Implementar tracking de última actividad.
        """
        # Por ahora solo contamos sesiones
        if len(self.sessions) > 100:  # Límite de seguridad
            # Eliminar las más antiguas
            oldest_sessions = list(self.sessions.keys())[:20]
            for sid in oldest_sessions:
                self.delete_session(sid)


# Instancia global del gestor
simulator_manager = SimulatorManager()
