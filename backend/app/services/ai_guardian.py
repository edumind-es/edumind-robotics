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
Guardrails educativos para la IA local.

La meta no es moderar pensamiento: es mantener el laboratorio centrado en
robótica educativa, transparencia, privacidad y seguridad de menores.
"""
from dataclasses import dataclass
from typing import Dict, Iterable, List


MAX_MESSAGE_CHARS = 4000
MAX_HISTORY_MESSAGES = 12


LOCAL_FIRST_SYSTEM_PROMPT = """
MARCO EDUCATIVO Y DE PRIVACIDAD:
- Eres un tutor de robótica educativa, no un agente autónomo.
- Explica siempre con intención didáctica: qué hace el código, por qué funciona y cómo comprobarlo en el simulador.
- No pidas datos personales, credenciales, nombres completos, direcciones, teléfonos ni información de menores.
- No generes instrucciones para hackear, evadir controles, robar datos, persistir malware, ocultar actividad o dañar sistemas.
- No ayudes a conectar con servicios externos si no es imprescindible para una práctica docente segura y explicada.
- Si una petición es peligrosa o no educativa, recházala brevemente y reconduce a una alternativa de robótica segura.
- Mantén las respuestas adecuadas para alumnado y profesorado.
- Cuando generes código, usa solo APIs compatibles con el simulador local salvo que indiques claramente que requiere hardware real.
"""


BLOCKED_TOPICS: Dict[str, List[str]] = {
    "ciberseguridad ofensiva o abuso": [
        "hackear",
        "robar contraseña",
        "robar contrasena",
        "phishing",
        "keylogger",
        "malware",
        "ransomware",
        "botnet",
        "ddos",
        "bypass",
        "exfiltrar",
        "exfiltration",
        "payload",
        "reverse shell",
        "backdoor",
        "escalar privilegios",
    ],
    "evasión de supervisión": [
        "ocultar al profesor",
        "sin que el profesor",
        "borrar logs",
        "evadir filtro",
        "evadir controles",
        "saltarse seguridad",
        "desactivar seguridad",
    ],
    "datos personales o credenciales": [
        "token secreto",
        "api key",
        "clave privada",
        "credenciales",
        "dni",
        "direccion de casa",
        "dirección de casa",
        "telefono personal",
        "teléfono personal",
    ],
}


@dataclass(frozen=True)
class GuardrailResult:
    allowed: bool
    reason: str = ""
    category: str = ""


def sanitize_text(text: str, max_chars: int = MAX_MESSAGE_CHARS) -> str:
    """Recorta texto para reducir exposición de datos y coste de contexto."""
    compact = " ".join((text or "").split())
    if len(compact) <= max_chars:
        return compact
    return compact[:max_chars] + "\n\n[Contenido recortado por privacidad y seguridad.]"


def sanitize_history(messages: Iterable[Dict[str, str]]) -> List[Dict[str, str]]:
    """Limita el historial enviado al modelo local."""
    safe_messages: List[Dict[str, str]] = []
    for message in list(messages)[-MAX_HISTORY_MESSAGES:]:
        role = message.get("role", "user")
        if role not in {"user", "assistant", "system"}:
            role = "user"
        safe_messages.append({
            "role": role,
            "content": sanitize_text(message.get("content", "")),
        })
    return safe_messages


def assess_prompt(text: str) -> GuardrailResult:
    """Evalúa si la petición encaja en un laboratorio educativo seguro."""
    normalized = (text or "").lower()
    for category, terms in BLOCKED_TOPICS.items():
        if any(term in normalized for term in terms):
            return GuardrailResult(
                allowed=False,
                category=category,
                reason=(
                    "La solicitud se sale del propósito educativo seguro de robótica "
                    "y podría facilitar daño, abuso o exposición de datos."
                ),
            )
    return GuardrailResult(allowed=True)


def refusal_message(result: GuardrailResult) -> str:
    """Respuesta breve, transparente y reconducida."""
    return (
        "No puedo ayudar con esa solicitud porque no encaja con un uso seguro "
        "del laboratorio educativo. Puedo ayudarte a convertirla en una práctica "
        "de robótica responsable, por ejemplo: validar sensores, simular errores, "
        "proteger datos del proyecto o explicar por qué una acción no es segura."
    )


def build_guarded_system_prompt(base_prompt: str) -> str:
    """Une el prompt pedagógico de la app con el marco local/privacy-first."""
    return f"{LOCAL_FIRST_SYSTEM_PROMPT}\n\n{base_prompt}".strip()
