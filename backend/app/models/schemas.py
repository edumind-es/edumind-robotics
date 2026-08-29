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
Modelos Pydantic para validación de peticiones y respuestas.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class DifficultyLevel(str, Enum):
    """Niveles de dificultad"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class PlatformType(str, Enum):
    """Plataformas soportadas"""
    MICROBIT = "micro:bit"
    NEZHA = "nezha"


class LanguageType(str, Enum):
    """Lenguajes de programación"""
    MICROPYTHON = "micropython"
    JAVASCRIPT = "javascript"
    MAKECODE = "makecode"
    SCRATCH = "scratch"


class MessageRole(str, Enum):
    """Roles en conversación"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


# ==================== CHAT MODELS ====================

class ChatMessage(BaseModel):
    """Mensaje individual en el chat"""
    role: MessageRole
    content: str = Field(..., max_length=4_000)
    timestamp: Optional[str] = None


class ChatRequest(BaseModel):
    """Petición de chat con la IA"""
    message: str = Field(..., max_length=4_000, description="Mensaje del usuario")
    conversation_history: List[ChatMessage] = Field(
        default_factory=list,
        max_length=12,
        description="Historial de conversación"
    )
    platform: PlatformType = Field(
        default=PlatformType.MICROBIT,
        description="Plataforma objetivo"
    )
    language: LanguageType = Field(
        default=LanguageType.MICROPYTHON,
        description="Lenguaje de programación"
    )
    difficulty: DifficultyLevel = Field(
        default=DifficultyLevel.BEGINNER,
        description="Nivel de dificultad"
    )
    lesson_id: Optional[str] = Field(
        default=None,
        description="ID de lección activa (opcional)"
    )
    objective_id: Optional[str] = Field(
        default=None,
        description="ID de objetivo específico (opcional)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "message": "¿Cómo puedo hacer parpadear un LED en micro:bit?",
                "conversation_history": [],
                "platform": "micro:bit",
                "language": "micropython",
                "difficulty": "beginner"
            }
        }


class ChatResponse(BaseModel):
    """Respuesta del chat (sin streaming)"""
    response: str
    suggested_code: Optional[str] = None
    explanation: Optional[str] = None


# ==================== CODE GENERATION MODELS ====================

class CodeGenerationRequest(BaseModel):
    """Petición para generar código"""
    objective: str = Field(
        ...,
        max_length=4_000,
        description="Objetivo que quiere lograr el alumno",
    )
    platform: PlatformType
    language: LanguageType
    difficulty: DifficultyLevel = DifficultyLevel.BEGINNER
    include_explanation: bool = Field(
        default=True,
        description="Incluir explicación del código"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "objective": "Hacer que los LEDs parpadeen formando un corazón",
                "platform": "micro:bit",
                "language": "micropython",
                "difficulty": "beginner",
                "include_explanation": True
            }
        }


class CodeExplanationRequest(BaseModel):
    """Petición para explicar código"""
    code: str = Field(..., max_length=50_000, description="Código a explicar")
    language: LanguageType
    platform: PlatformType
    specific_question: Optional[str] = Field(
        default=None,
        description="Pregunta específica sobre el código"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "code": "from microbit import *\nwhile True:\n    display.show(Image.HEART)\n    sleep(1000)",
                "language": "micropython",
                "platform": "micro:bit"
            }
        }


# ==================== LESSON MODELS ====================

class LessonObjective(BaseModel):
    """Objetivo dentro de una lección"""
    id: str
    title: str
    description: str
    estimated_time: str
    languages: List[LanguageType]


class Lesson(BaseModel):
    """Lección educativa completa"""
    id: str
    title: str
    description: str
    platform: PlatformType
    difficulty: DifficultyLevel
    objectives: List[LessonObjective]


class LessonListResponse(BaseModel):
    """Respuesta con lista de lecciones"""
    lessons: List[Lesson]
    total: int


class Challenge(BaseModel):
    """Reto creativo"""
    id: str
    title: str
    description: str
    difficulty: DifficultyLevel
    platform: PlatformType
    estimated_time: str
    hint: Optional[str] = None


class ChallengeListResponse(BaseModel):
    """Respuesta con lista de retos"""
    challenges: List[Challenge]
    total: int


# ==================== EXPORT MODELS ====================

class ExportFormat(str, Enum):
    """Formatos de exportación"""
    HEX = "hex"  # micro:bit
    PY = "py"    # MicroPython
    JS = "js"    # JavaScript
    SB3 = "sb3"  # Scratch 3


class ExportRequest(BaseModel):
    """Petición de exportación de código"""
    code: str = Field(..., max_length=50_000, description="Código a exportar")
    language: LanguageType
    platform: PlatformType
    format: ExportFormat
    filename: Optional[str] = Field(
        default=None,
        description="Nombre del archivo (opcional)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "code": "from microbit import *\ndisplay.show(Image.HEART)",
                "language": "micropython",
                "platform": "micro:bit",
                "format": "hex",
                "filename": "mi_proyecto"
            }
        }


class ExportResponse(BaseModel):
    """Respuesta con archivo exportado"""
    filename: str
    download_url: str
    format: ExportFormat
    size_bytes: int


# ==================== HEALTH & STATUS MODELS ====================

class HealthResponse(BaseModel):
    """Estado de salud del sistema"""
    status: str
    ollama_available: bool
    models_available: List[str]
    version: str


class OllamaModel(BaseModel):
    """Información de modelo Ollama"""
    name: str
    size: Optional[int] = None
    modified_at: Optional[str] = None


class ModelsListResponse(BaseModel):
    """Lista de modelos disponibles"""
    models: List[OllamaModel]
    total: int
