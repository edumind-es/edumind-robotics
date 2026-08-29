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
import time
import uuid
from .microbit_sim import MicrobitSimulator
from .nezha_sim import NezhaSimulator
from .code_executor import CodeExecutor


class SimulatorSession:
    """Sesión de simulación que contiene micro:bit y opcionalmente Nezha"""

    def __init__(
        self,
        session_id: str,
        platform: str = "microbit",
        owner_id: str = "local-dev",
    ):
        self.session_id = session_id
        self.platform = platform
        self.owner_id = owner_id
        self.created_at = time.time()
        self.last_activity = self.created_at

        # Crear simuladores
        self.microbit = MicrobitSimulator(session_id)
        self.nezha: Optional[NezhaSimulator] = None

        if platform == "nezha":
            self.nezha = NezhaSimulator(session_id)

        # Crear ejecutor de código
        self.executor = CodeExecutor(self.microbit, self.nezha)

    def get_state(self) -> Dict:
        """Obtiene estado completo de la sesión"""
        self.touch()
        state = {
            "session_id": self.session_id,
            "platform": self.platform,
            "microbit": self.microbit.get_state()
        }

        if self.nezha:
            state["nezha"] = self.nezha.get_state()

        return state

    def touch(self):
        """Actualiza la marca de actividad de la sesión."""
        self.last_activity = time.time()

    def reset(self):
        """Resetea todos los simuladores"""
        self.microbit.reset()
        if self.nezha:
            self.nezha.reset()
        self.executor = CodeExecutor(self.microbit, self.nezha)
        self.touch()


class SimulatorManager:
    """
    Gestor centralizado de sesiones de simulación.
    Permite múltiples usuarios simulando simultáneamente.
    """

    def __init__(self):
        self.sessions: Dict[str, SimulatorSession] = {}

    def create_session(
        self,
        platform: str = "microbit",
        owner_id: str = "local-dev",
    ) -> str:
        """
        Crea una nueva sesión de simulación.

        Args:
            platform: "microbit" o "nezha"

        Returns:
            session_id: ID único de la sesión
        """
        session_id = str(uuid.uuid4())
        self.cleanup_old_sessions()
        self.sessions[session_id] = SimulatorSession(session_id, platform, owner_id)
        return session_id

    def get_session(
        self,
        session_id: str,
        owner_id: Optional[str] = None,
    ) -> Optional[SimulatorSession]:
        """Obtiene una sesión existente"""
        session = self.sessions.get(session_id)
        if session is None or (owner_id is not None and session.owner_id != owner_id):
            return None
        session.touch()
        return session

    def delete_session(self, session_id: str, owner_id: Optional[str] = None) -> bool:
        """Elimina una sesión"""
        session = self.sessions.get(session_id)
        if session is not None and (owner_id is None or session.owner_id == owner_id):
            del self.sessions[session_id]
            return True
        return False

    def get_all_sessions(self, owner_id: Optional[str] = None) -> Dict[str, Dict]:
        """Obtiene información de todas las sesiones activas"""
        return {
            sid: session.get_state()
            for sid, session in self.sessions.items()
            if owner_id is None or session.owner_id == owner_id
        }

    def cleanup_old_sessions(self, max_age_seconds: int = 3600):
        """
        Limpia sesiones inactivas y aplica un límite global de seguridad.
        """
        cutoff = time.time() - max_age_seconds
        expired = [
            sid for sid, session in self.sessions.items()
            if session.last_activity < cutoff
        ]
        for sid in expired:
            self.delete_session(sid)

        if len(self.sessions) > 500:
            oldest_sessions = sorted(
                self.sessions.values(),
                key=lambda session: session.last_activity,
            )[:len(self.sessions) - 500]
            for session in oldest_sessions:
                self.delete_session(session.session_id)


# Instancia global del gestor
simulator_manager = SimulatorManager()
