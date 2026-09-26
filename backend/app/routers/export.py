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
Router para exportación de código.
Permite descargar código en diferentes formatos para hardware real.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from ..services.export_service import export_service
from ..services.hex_builder import crear_hex, ScriptDemasiadoLargo


router = APIRouter(
    prefix="/api/export",
    tags=["export"]
)


# ==================== SCHEMAS ====================

class ExportRequest(BaseModel):
    code: str = Field(..., max_length=50_000)
    project_name: Optional[str] = Field(default="EDUmind_Project", max_length=100)


class HardwareBundleRequest(ExportRequest):
    hardware_target: str = "microbit_v2"
    settings: Optional[Dict[str, Any]] = None


class ExportInstructionsResponse(BaseModel):
    instructions: str


# ==================== ENDPOINTS ====================

@router.post("/micropython")
async def export_micropython(request: ExportRequest):
    """
    Exporta código como archivo MicroPython (.py).
    
    El archivo se puede cargar directamente al micro:bit
    usando mu-editor o copiándolo a la unidad MICROBIT.
    """
    result = export_service.export_micropython(
        request.code,
        request.project_name
    )
    
    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)
    
    return Response(
        content=result.data,
        media_type=result.content_type,
        headers={
            "Content-Disposition": f"attachment; filename={result.filename}"
        }
    )


@router.post("/hex")
async def export_hex(request: ExportRequest):
    """
    Genera el .hex que el micro:bit puede arrancar.

    Es el runtime de MicroPython con el programa del alumno dentro. Se copia
    a la unidad MICROBIT y la placa se reinicia ejecutándolo.

    Antes esta ruta no existía: el formato .hex del exportador devolvía
    instrucciones para ir a MakeCode a descargarlo.
    """
    try:
        contenido = crear_hex(request.code)
    except ScriptDemasiadoLargo as error:
        # 413: el programa no cabe. El mensaje explica qué hacer.
        raise HTTPException(status_code=413, detail=str(error))

    nombre = f"{export_service._safe_name(request.project_name or 'edumind')}.hex"
    return Response(
        content=contenido,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={nombre}"},
    )


@router.post("/makecode")
async def export_makecode(request: ExportRequest):
    """
    Exporta código como proyecto MakeCode (JSON).
    
    El archivo JSON se puede importar en MakeCode:
    https://makecode.microbit.org/
    """
    result = export_service.export_makecode_json(
        request.code,
        request.project_name
    )
    
    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)
    
    return Response(
        content=result.data,
        media_type=result.content_type,
        headers={
            "Content-Disposition": f"attachment; filename={result.filename}"
        }
    )


@router.post("/scratch")
async def export_scratch(request: ExportRequest):
    """
    Exporta código como proyecto Scratch 3.0 (.sb3).
    
    El archivo .sb3 se puede abrir en Scratch:
    https://scratch.mit.edu/
    
    Nota: Requiere la extensión micro:bit en Scratch.
    """
    result = export_service.export_scratch_sb3(
        request.code,
        request.project_name
    )

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    return Response(
        content=result.data,
        media_type=result.content_type,
        headers={
            "Content-Disposition": f"attachment; filename={result.filename}"
        }
    )


@router.post("/hardware-bundle")
async def export_hardware_bundle(request: HardwareBundleRequest):
    """
    Exporta un ZIP autocontenido para pasar del simulador al hardware real.

    Incluye código, perfil de hardware, ajustes de puertos y guía de carga.
    """
    result = export_service.export_hardware_bundle(
        code=request.code,
        project_name=request.project_name,
        hardware_target=request.hardware_target,
        settings=request.settings,
    )

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    return Response(
        content=result.data,
        media_type=result.content_type,
        headers={
            "Content-Disposition": f"attachment; filename={result.filename}"
        }
    )


@router.get("/instructions", response_model=ExportInstructionsResponse)
async def get_export_instructions():
    """
    Obtiene instrucciones para cargar código al micro:bit físico.
    """
    return ExportInstructionsResponse(
        instructions=export_service.get_hex_instructions()
    )
