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
Router para endpoints de chat con IA educativa.
Soporta streaming de respuestas para mejor UX.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
import json
import logging

from ..models.schemas import (
    ChatRequest,
    ChatResponse,
    CodeGenerationRequest,
    CodeExplanationRequest,
    MessageRole
)
from ..services import ollama_service, lesson_engine
from ..services.ai_guardian import (
    assess_prompt,
    build_guarded_system_prompt,
    refusal_message,
    sanitize_history,
    sanitize_text,
)

router = APIRouter(prefix="/api/chat", tags=["Chat"])
logger = logging.getLogger(__name__)


def sse_data(payload: str) -> str:
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


@router.post("/message/stream")
async def chat_message_stream(request: ChatRequest):
    """
    Chat con la IA con respuestas en streaming.

    Returns:
        StreamingResponse con texto de la IA en tiempo real
    """
    try:
        guardrail = assess_prompt(request.message)
        if not guardrail.allowed:
            async def blocked_generate():
                yield sse_data(refusal_message(guardrail))
                yield "data: [DONE]\n\n"

            return StreamingResponse(
                blocked_generate(),
                media_type="text/event-stream",
                headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
            )

        # Detectar si es una solicitud DIRECTA de código (desde Vibe Coding)
        is_direct_code_request = request.message.startswith("GENERA CÓDIGO")

        # Preparar historial de mensajes para Ollama
        messages = sanitize_history(
            {"role": msg.role.value, "content": msg.content}
            for msg in request.conversation_history
        )

        # Añadir mensaje actual del usuario
        messages.append({
            "role": "user",
            "content": sanitize_text(request.message)
        })

        # Elegir contexto según el tipo de solicitud
        if is_direct_code_request:
            # Para Vibe Coding: prompt directo sin contexto educativo complejo
            system_prompt = """Eres un generador de código MicroPython para micro:bit.
Tu ÚNICA tarea es generar código funcional siguiendo EXACTAMENTE las instrucciones del usuario.
SIEMPRE escribe el código dentro de bloques ```python
NO añadas explicaciones largas ANTES del código.
El código DEBE ser completo y ejecutable."""
        else:
            # Para chat educativo: contexto completo con markdown
            system_prompt = lesson_engine.build_educational_context(
                objective=request.message,
                platform=request.platform,
                language=request.language,
                difficulty=request.difficulty
            )
        system_prompt = build_guarded_system_prompt(system_prompt)

        # Streaming de respuesta
        async def generate():
            try:
                async for chunk in ollama_service.chat_stream(
                    messages=messages,
                    system_prompt=system_prompt,
                    temperature=0.3 if is_direct_code_request else 0.7
                ):
                    # Enviar chunk como Server-Sent Event
                    yield sse_data(chunk)

                # Señal de fin
                yield "data: [DONE]\n\n"

            except Exception as e:
                logger.error(f"Error in streaming: {e}")
                yield sse_data(f"⚠️ Error: {str(e)}")
                yield "data: [DONE]\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",  # Disable nginx buffering
            }
        )

    except Exception as e:
        logger.error(f"Error in chat_message_stream: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest):
    """
    Chat con la IA (sin streaming - para compatibilidad).

    Returns:
        Respuesta completa de la IA
    """
    try:
        guardrail = assess_prompt(request.message)
        if not guardrail.allowed:
            return ChatResponse(
                response=refusal_message(guardrail),
                suggested_code=None,
                explanation=guardrail.reason
            )

        # Construir contexto educativo
        educational_context = lesson_engine.build_educational_context(
            objective=request.message,
            platform=request.platform,
            language=request.language,
            difficulty=request.difficulty
        )
        educational_context = build_guarded_system_prompt(educational_context)

        # Preparar mensajes
        messages = sanitize_history(
            {"role": msg.role.value, "content": msg.content}
            for msg in request.conversation_history
        )
        messages.append({
            "role": "user",
            "content": sanitize_text(request.message)
        })

        # Recopilar respuesta completa
        full_response = ""
        async for chunk in ollama_service.chat_stream(
            messages=messages,
            system_prompt=educational_context,
            temperature=0.7
        ):
            full_response += chunk

        return ChatResponse(
            response=full_response,
            suggested_code=None,
            explanation=None
        )

    except Exception as e:
        logger.error(f"Error in chat_message: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-code/stream")
async def generate_code_stream(request: CodeGenerationRequest):
    """
    Genera código basado en objetivo del alumno (streaming).

    Returns:
        StreamingResponse con código generado
    """
    try:
        guardrail = assess_prompt(request.objective)
        if not guardrail.allowed:
            async def blocked_generate():
                yield sse_data(refusal_message(guardrail))
                yield "data: [DONE]\n\n"

            return StreamingResponse(
                blocked_generate(),
                media_type="text/event-stream",
                headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
            )

        async def generate():
            try:
                async for chunk in ollama_service.generate_code(
                    objective=request.objective,
                    language=request.language.value,
                    context=request.platform.value,
                    difficulty=request.difficulty.value
                ):
                    yield sse_data(chunk)

                yield "data: [DONE]\n\n"

            except Exception as e:
                logger.error(f"Error in code generation: {e}")
                yield sse_data(f"⚠️ Error: {str(e)}")
                yield "data: [DONE]\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            }
        )

    except Exception as e:
        logger.error(f"Error in generate_code_stream: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/explain-code/stream")
async def explain_code_stream(request: CodeExplanationRequest):
    """
    Explica código paso a paso (streaming).

    Returns:
        StreamingResponse con explicación educativa
    """
    try:
        guardrail = assess_prompt(request.code)
        if not guardrail.allowed:
            async def blocked_generate():
                yield sse_data(refusal_message(guardrail))
                yield "data: [DONE]\n\n"

            return StreamingResponse(
                blocked_generate(),
                media_type="text/event-stream",
                headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
            )

        async def generate():
            try:
                async for chunk in ollama_service.generate_code_explanation(
                    code=request.code,
                    language=request.language.value,
                    context=request.platform.value,
                    focus_line=request.focus_line,
                ):
                    yield sse_data(chunk)

                yield "data: [DONE]\n\n"

            except Exception as e:
                logger.error(f"Error in code explanation: {e}")
                yield sse_data(f"⚠️ Error: {str(e)}")
                yield "data: [DONE]\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            }
        )

    except Exception as e:
        logger.error(f"Error in explain_code_stream: {e}")
        raise HTTPException(status_code=500, detail=str(e))
