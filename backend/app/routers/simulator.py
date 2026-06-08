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
Router para el simulador de micro:bit y Nezha.
Permite ejecutar código y controlar simuladores sin hardware físico.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from ..simulator import simulator_manager
from ..models.schemas import PlatformType

router = APIRouter(prefix="/api/simulator", tags=["Simulator"])


# ==================== MODELOS ====================

class CreateSessionRequest(BaseModel):
    """Petición para crear sesión de simulación"""
    platform: PlatformType = Field(
        default=PlatformType.MICROBIT,
        description="Plataforma a simular"
    )


class CreateSessionResponse(BaseModel):
    """Respuesta con ID de sesión"""
    session_id: str
    platform: str
    message: str


class ExecuteCodeRequest(BaseModel):
    """Petición para ejecutar código"""
    session_id: str = Field(..., description="ID de sesión del simulador")
    code: str = Field(..., description="Código MicroPython a ejecutar")

    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "abc123",
                "code": "from microbit import *\ndisplay.show(Image.HEART)\nsleep(1000)\ndisplay.clear()"
            }
        }


class ExecuteCodeResponse(BaseModel):
    """Respuesta de ejecución de código"""
    success: bool
    state: Dict[str, Any]
    error: Optional[str] = None
    output_log: list
    error_log: list


class ButtonActionRequest(BaseModel):
    """Petición para accionar botones"""
    session_id: str
    button: str = Field(..., description="'a' o 'b'")
    action: str = Field(..., description="'press' o 'release'")


class SensorUpdateRequest(BaseModel):
    """Petición para actualizar valores de sensores"""
    session_id: str
    sensor: str = Field(..., description="Tipo de sensor")
    value: Any = Field(..., description="Valor del sensor")


# ==================== ENDPOINTS DE SESIÓN ====================

def _create_session_response(request: CreateSessionRequest) -> CreateSessionResponse:
    platform_value = request.platform.value if hasattr(request.platform, 'value') else str(request.platform)

    session_id = simulator_manager.create_session(platform_value)

    return CreateSessionResponse(
        session_id=session_id,
        platform=platform_value,
        message="Simulation session created successfully"
    )


@router.post("/session/create", response_model=CreateSessionResponse)
async def create_session(request: CreateSessionRequest):
    """
    Crea una nueva sesión de simulación.

    Returns:
        session_id único para usar en peticiones posteriores
    """
    return _create_session_response(request)


@router.post("/session", response_model=CreateSessionResponse)
async def create_session_compat(request: CreateSessionRequest = CreateSessionRequest()):
    """
    Crea una sesión de simulación usando la ruta histórica.
    Mantiene compatibilidad con scripts y pruebas existentes.
    """
    return _create_session_response(request)


@router.get("/session/{session_id}")
async def get_session_state(session_id: str):
    """
    Obtiene el estado actual de una sesión de simulación.
    """
    session = simulator_manager.get_session(session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return session.get_state()


@router.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """
    Elimina una sesión de simulación.
    """
    success = simulator_manager.delete_session(session_id)

    if not success:
        raise HTTPException(status_code=404, detail="Session not found")

    return {"message": "Session deleted successfully", "session_id": session_id}


@router.post("/session/{session_id}/reset")
async def reset_session(session_id: str):
    """
    Resetea una sesión de simulación a su estado inicial.
    """
    session = simulator_manager.get_session(session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.reset()

    return {"message": "Session reset successfully", "state": session.get_state()}


# ==================== EJECUCIÓN DE CÓDIGO ====================

@router.post("/execute", response_model=ExecuteCodeResponse)
async def execute_code(request: ExecuteCodeRequest):
    """
    Ejecuta código MicroPython en el simulador.

    El código se ejecuta en un sandbox seguro y actualiza el estado
    del simulador (display, sensores, etc.).
    """
    session = simulator_manager.get_session(request.session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Ejecutar código
    result = session.executor.execute_code(request.code)

    return ExecuteCodeResponse(
        success=result["success"],
        state=result["state"],
        error=result.get("error"),
        output_log=session.microbit.output_log,
        error_log=session.microbit.error_log
    )


# ==================== CONTROL DE BOTONES ====================

@router.post("/button")
async def button_action(request: ButtonActionRequest):
    """
    Simula presión/liberación de botones A o B.
    """
    session = simulator_manager.get_session(request.session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    button = request.button.lower()
    action = request.action.lower()

    if button not in ["a", "b"]:
        raise HTTPException(status_code=400, detail="Invalid button. Use 'a' or 'b'")

    if action not in ["press", "release"]:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'press' or 'release'")

    # Ejecutar acción
    if button == "a":
        if action == "press":
            session.microbit.button_a_press()
        else:
            session.microbit.button_a_release()
    else:
        if action == "press":
            session.microbit.button_b_press()
        else:
            session.microbit.button_b_release()

    return {
        "message": f"Button {button} {action}ed",
        "state": session.microbit.get_state()
    }


# ==================== ACTUALIZACIÓN DE SENSORES ====================

@router.post("/sensor")
async def update_sensor(request: SensorUpdateRequest):
    """
    Actualiza valores de sensores para simulación.

    Sensores soportados:
    - temperature: int (Celsius)
    - light_level: int (0-255)
    - accelerometer: {"x": int, "y": int, "z": int}
    - compass: int (0-359 grados)
    - ultrasonic (Nezha): int (distancia en cm)
    """
    session = simulator_manager.get_session(request.session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    sensor = request.sensor.lower()

    try:
        if sensor == "temperature":
            session.microbit.set_temperature(int(request.value))

        elif sensor == "light_level":
            session.microbit.set_light_level(int(request.value))

        elif sensor == "accelerometer":
            if not isinstance(request.value, dict):
                raise ValueError("Accelerometer requires dict with x, y, z")
            session.microbit.set_accelerometer(
                request.value["x"],
                request.value["y"],
                request.value["z"]
            )

        elif sensor == "compass":
            session.microbit.set_compass_heading(int(request.value))

        elif sensor == "ultrasonic":
            if not session.nezha:
                raise HTTPException(status_code=400, detail="Nezha not enabled for this session")
            session.nezha.ultrasonic_set_distance(int(request.value))

        else:
            raise HTTPException(status_code=400, detail=f"Unknown sensor: {sensor}")

        return {
            "message": f"Sensor {sensor} updated",
            "state": session.get_state()
        }

    except (ValueError, KeyError) as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== CONTROL DE NEZHA ====================

@router.post("/nezha/motor")
async def nezha_motor_control(
    session_id: str,
    motor: int,
    speed: int
):
    """
    Controla motores DC de Nezha.

    Args:
        motor: Número de motor (1-4)
        speed: Velocidad (-100 a 100)
    """
    session = simulator_manager.get_session(session_id)

    if not session or not session.nezha:
        raise HTTPException(status_code=404, detail="Nezha session not found")

    session.nezha.motor_set(motor, speed)

    return {
        "message": f"Motor {motor} set to speed {speed}",
        "state": session.nezha.get_state()
    }


@router.post("/nezha/servo")
async def nezha_servo_control(
    session_id: str,
    servo: int,
    angle: int
):
    """
    Controla servomotores de Nezha.

    Args:
        servo: Número de servo (1-4)
        angle: Ángulo (0-180 grados)
    """
    session = simulator_manager.get_session(session_id)

    if not session or not session.nezha:
        raise HTTPException(status_code=404, detail="Nezha session not found")

    session.nezha.servo_set(servo, angle)

    return {
        "message": f"Servo {servo} set to {angle} degrees",
        "state": session.nezha.get_state()
    }


# ==================== INFORMACIÓN ====================

@router.get("/sessions")
async def list_sessions():
    """
    Lista todas las sesiones activas.
    """
    sessions = simulator_manager.get_all_sessions()

    return {
        "total": len(sessions),
        "sessions": sessions
    }
