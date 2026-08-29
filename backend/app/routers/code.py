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
Router para validación y generación de código.
Fase 2: Validadores y Generadores de código educativo.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

from ..services.code_validator import code_validator, SeverityLevel
from ..services.code_generator import (
    code_generator, 
    Platform, 
    DifficultyLevel,
    CodeTemplate
)


router = APIRouter(
    prefix="/api/code",
    tags=["code"]
)


# ==================== SCHEMAS ====================

class ValidationMessageSchema(BaseModel):
    severity: str
    message: str
    line: Optional[int] = None
    column: Optional[int] = None
    suggestion: Optional[str] = None


class ValidationResultSchema(BaseModel):
    is_valid: bool
    messages: List[ValidationMessageSchema]
    score: int
    can_execute: bool


class ValidateCodeRequest(BaseModel):
    code: str = Field(..., max_length=50_000)


class SuggestionSchema(BaseModel):
    title: str
    description: str
    example: str


class SuggestionsResponse(BaseModel):
    suggestions: List[SuggestionSchema]


class TemplateSchema(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str
    platform: str
    code: str
    tags: List[str]
    explanation: str


class TemplatesResponse(BaseModel):
    templates: List[TemplateSchema]
    total: int


class GenerateCodeRequest(BaseModel):
    objective: str = Field(..., max_length=4_000)
    platform: Optional[str] = "microbit"


class GenerateCodeResponse(BaseModel):
    success: bool
    code: Optional[str] = None
    template_used: Optional[str] = None
    message: str


# ==================== ENDPOINTS ====================

@router.post("/validate", response_model=ValidationResultSchema)
async def validate_code(request: ValidateCodeRequest):
    """
    Valida código MicroPython antes de ejecutar.
    
    Retorna:
    - is_valid: Si el código puede ejecutarse
    - messages: Lista de errores, warnings y sugerencias
    - score: Puntuación de calidad (0-100)
    - can_execute: Si es seguro ejecutar en el simulador
    """
    result = code_validator.validate(request.code)
    
    messages = [
        ValidationMessageSchema(
            severity=msg.severity.value,
            message=msg.message,
            line=msg.line,
            column=msg.column,
            suggestion=msg.suggestion
        )
        for msg in result.messages
    ]
    
    return ValidationResultSchema(
        is_valid=result.is_valid,
        messages=messages,
        score=result.score,
        can_execute=result.can_execute
    )


@router.post("/suggestions", response_model=SuggestionsResponse)
async def get_code_suggestions(request: ValidateCodeRequest):
    """
    Obtiene sugerencias educativas para mejorar el código.
    """
    suggestions = code_validator.get_suggestions(request.code)
    
    return SuggestionsResponse(
        suggestions=[
            SuggestionSchema(
                title=s["title"],
                description=s["description"],
                example=s["example"]
            )
            for s in suggestions
        ]
    )


@router.get("/templates", response_model=TemplatesResponse)
async def list_templates(
    platform: Optional[str] = None,
    difficulty: Optional[str] = None
):
    """
    Lista plantillas de código disponibles.
    
    Parámetros opcionales:
    - platform: microbit, nezha, makey_makey
    - difficulty: beginner, intermediate, advanced
    """
    # Convertir strings a enums
    platform_enum = None
    if platform:
        try:
            platform_enum = Platform(platform)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Plataforma inválida. Opciones: {[p.value for p in Platform]}"
            )
    
    difficulty_enum = None
    if difficulty:
        try:
            difficulty_enum = DifficultyLevel(difficulty)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Dificultad inválida. Opciones: {[d.value for d in DifficultyLevel]}"
            )
    
    templates = code_generator.list_templates(platform_enum, difficulty_enum)
    
    return TemplatesResponse(
        templates=[
            TemplateSchema(
                id=t.id,
                title=t.title,
                description=t.description,
                difficulty=t.difficulty.value,
                platform=t.platform.value,
                code=t.code,
                tags=t.tags,
                explanation=t.explanation
            )
            for t in templates
        ],
        total=len(templates)
    )


@router.get("/templates/{template_id}", response_model=TemplateSchema)
async def get_template(template_id: str):
    """
    Obtiene una plantilla específica por ID.
    """
    template = code_generator.get_template(template_id)
    
    if not template:
        raise HTTPException(
            status_code=404,
            detail=f"Plantilla '{template_id}' no encontrada"
        )
    
    return TemplateSchema(
        id=template.id,
        title=template.title,
        description=template.description,
        difficulty=template.difficulty.value,
        platform=template.platform.value,
        code=template.code,
        tags=template.tags,
        explanation=template.explanation
    )


@router.get("/templates/search/{query}", response_model=TemplatesResponse)
async def search_templates(query: str):
    """
    Busca plantillas por texto en título, descripción o tags.
    """
    templates = code_generator.search_templates(query)
    
    return TemplatesResponse(
        templates=[
            TemplateSchema(
                id=t.id,
                title=t.title,
                description=t.description,
                difficulty=t.difficulty.value,
                platform=t.platform.value,
                code=t.code,
                tags=t.tags,
                explanation=t.explanation
            )
            for t in templates
        ],
        total=len(templates)
    )


@router.post("/generate", response_model=GenerateCodeResponse)
async def generate_code(request: GenerateCodeRequest):
    """
    Genera código basado en un objetivo del alumno.
    
    Primero busca una plantilla existente. Si no encuentra,
    genera un esqueleto base para que la IA complete.
    """
    # Convertir plataforma
    try:
        platform = Platform(request.platform)
    except ValueError:
        platform = Platform.MICROBIT
    
    # Buscar plantilla existente
    template = code_generator.get_template_for_objective(request.objective)
    
    if template:
        return GenerateCodeResponse(
            success=True,
            code=template.code,
            template_used=template.id,
            message=f"Usamos la plantilla '{template.title}' para tu objetivo"
        )
    
    # Generar código base
    code = code_generator.generate_from_description(
        request.objective,
        platform
    )
    
    return GenerateCodeResponse(
        success=True,
        code=code,
        template_used=None,
        message="Generamos un código base. Puedes modificarlo o pedir a la IA que lo complete."
    )
