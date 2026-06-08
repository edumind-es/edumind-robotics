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
WebSocket service for real-time sensor updates.
"""
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json
import asyncio


class ConnectionManager:
    """Manages WebSocket connections and broadcasts."""

    def __init__(self):
        # session_id -> set of websockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = set()
        self.active_connections[session_id].add(websocket)

    def disconnect(self, websocket: WebSocket, session_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id].discard(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def broadcast_to_session(self, session_id: str, message: dict):
        """Broadcast message to all connections in a session."""
        if session_id not in self.active_connections:
            return
        
        dead_connections = set()
        for connection in self.active_connections[session_id]:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.add(connection)
        
        # Clean up dead connections
        for conn in dead_connections:
            self.active_connections[session_id].discard(conn)

    async def send_sensor_update(self, session_id: str, sensors: dict):
        """Send sensor data update."""
        await self.broadcast_to_session(session_id, {
            "type": "sensor_update",
            "data": sensors
        })

    async def send_display_update(self, session_id: str, display: dict):
        """Send display state update."""
        await self.broadcast_to_session(session_id, {
            "type": "display_update",
            "data": display
        })

    async def send_execution_output(self, session_id: str, output: str, is_error: bool = False):
        """Send code execution output."""
        await self.broadcast_to_session(session_id, {
            "type": "execution_output",
            "data": {
                "output": output,
                "is_error": is_error
            }
        })


# Global connection manager
ws_manager = ConnectionManager()
