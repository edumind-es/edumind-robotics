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
Servicio de integración con Ollama para chat educativo con IA local.
Soporta streaming de respuestas para mejor experiencia de usuario.
"""
import httpx
import json
import os
from typing import AsyncGenerator, Optional, Dict, List
import logging
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _is_local_url(url: str) -> bool:
    parsed = urlparse(url)
    host = parsed.hostname or ""
    return host in {"localhost", "127.0.0.1", "::1"} or host.startswith("192.168.") or host.startswith("10.")


class OllamaService:
    """Servicio para interactuar con modelos Ollama (Phi3, Mistral, etc.)"""

    def __init__(self, base_url: Optional[str] = None, default_model: Optional[str] = None):
        base_url = base_url or os.getenv("OLLAMA_BASE_URL", os.getenv("OLLAMA_HOST", "http://localhost:11434"))
        if base_url.startswith("127.0.0.1:") or base_url.startswith("localhost:"):
            base_url = f"http://{base_url}"

        self.base_url = base_url
        self.default_model = default_model or os.getenv("OLLAMA_MODEL", "phi3:latest")
        self.allow_remote = _env_bool("EDUMIND_ALLOW_REMOTE_AI", False)
        self.num_predict = int(os.getenv("OLLAMA_NUM_PREDICT", "400"))
        self.keep_alive = os.getenv("OLLAMA_KEEP_ALIVE", "30m")
        self.client = httpx.AsyncClient(timeout=120.0)

    @property
    def is_local_first_safe(self) -> bool:
        """Evita enviar mensajes a IA remota por error."""
        return self.allow_remote or _is_local_url(self.base_url)

    def get_policy_status(self) -> Dict:
        return {
            "mode": "local-first",
            "privacy": "privacy-first",
            "offline": "frontend-cache-and-local-simulator",
            "ai_provider": "ollama",
            "ai_endpoint": self.base_url,
            "ai_endpoint_local": _is_local_url(self.base_url),
            "remote_ai_allowed": self.allow_remote,
            "model": self.default_model,
            "prompts_persisted": False,
            "conversation_history_limit": 12,
            "message_char_limit": 4000,
        }

    async def check_health(self) -> bool:
        """Verifica si Ollama está disponible"""
        if not self.is_local_first_safe:
            logger.error("Remote AI endpoint blocked by privacy-first policy: %s", self.base_url)
            return False
        try:
            response = await self.client.get(f"{self.base_url}/api/tags")
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Ollama health check failed: {e}")
            return False

    async def list_models(self) -> List[Dict]:
        """Lista modelos disponibles en Ollama"""
        try:
            response = await self.client.get(f"{self.base_url}/api/tags")
            if response.status_code == 200:
                data = response.json()
                return data.get("models", [])
            return []
        except Exception as e:
            logger.error(f"Error listing models: {e}")
            return []

    async def chat_stream(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        system_prompt: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Chat con streaming de respuestas.

        Args:
            messages: Lista de mensajes [{"role": "user", "content": "..."}]
            model: Modelo a usar (default: phi3:latest)
            temperature: Creatividad de las respuestas (0.0-1.0)
            system_prompt: Prompt del sistema para contexto educativo

        Yields:
            Fragmentos de texto de la respuesta
        """
        model = model or self.default_model
        if not self.is_local_first_safe:
            yield (
                "IA local bloqueada por política privacy-first: el endpoint configurado "
                "no parece local. Configura OLLAMA_BASE_URL en localhost o habilita "
                "EDUMIND_ALLOW_REMOTE_AI=true solo con autorización explícita."
            )
            return

        # Preparar mensajes con system prompt si existe
        if system_prompt:
            messages = [{"role": "system", "content": system_prompt}] + messages

        payload = {
            "model": model,
            "messages": messages,
            "stream": True,
            # Mantener el modelo cargado en RAM entre preguntas: recargar 3,7 GB
            # desde disco añadía varios segundos a la primera pregunta de cada clase.
            "keep_alive": self.keep_alive,
            "options": {
                "temperature": temperature,
                # Tope de respuesta. En CPU generamos ~13 tokens/s, así que 2048
                # tokens eran más de 2 minutos de espera; 400 deja respuestas de
                # ~30 s. Ajustable con OLLAMA_NUM_PREDICT.
                "num_predict": self.num_predict,
            }
        }

        try:
            async with self.client.stream(
                "POST",
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=120.0
            ) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    logger.error(f"Ollama error: {error_text}")
                    yield f"Error: {error_text.decode()}"
                    return

                async for line in response.aiter_lines():
                    if line.strip():
                        try:
                            data = json.loads(line)
                            if "message" in data:
                                content = data["message"].get("content", "")
                                if content:
                                    yield content

                            # Verificar si es el último mensaje
                            if data.get("done", False):
                                break
                        except json.JSONDecodeError:
                            logger.warning(f"Could not parse line: {line}")
                            continue

        except Exception as e:
            logger.error(f"Error in chat_stream: {e}")
            yield f"\n\n⚠️ Error de conexión con la IA: {str(e)}"

    async def generate_code_explanation(
        self,
        code: str,
        language: str,
        context: str = "micro:bit",
        focus_line: Optional[int] = None,
    ) -> AsyncGenerator[str, None]:
        """
        Genera explicación de código paso a paso.

        Args:
            code: Código a explicar
            language: Lenguaje (micropython, javascript, scratch)
            context: Contexto (micro:bit, nezha)
            focus_line: Si viene, se explica SOLO esa línea, pero con el
                programa entero delante como contexto. Una línea aislada no
                se puede explicar bien: `sleep(500)` significa una cosa dentro
                de un bucle y otra fuera de él.
        """
        system_prompt = f"""Eres un tutor de robótica educativa especializado en {context}.
Tu trabajo es explicar código de forma clara y pedagógica para estudiantes.

IMPORTANTE:
- Actúas en un laboratorio local-first y privacy-first.
- No pidas ni reveles datos personales, credenciales ni información sensible.
- Si detectas código con intención de daño, abuso o exfiltración, explícalo como riesgo y reconduce a una alternativa segura.
- Explica línea por línea qué hace el código
- Usa lenguaje simple y ejemplos prácticos
- Relaciona el código con el hardware ({context})
- Menciona qué sensores/actuadores se usan
- Da consejos de mejora si aplica"""

        if focus_line is not None:
            lineas = code.split("\n")
            indice = focus_line - 1
            objetivo = lineas[indice].strip() if 0 <= indice < len(lineas) else ""
            numerado = "\n".join(
                f"{n:>3} | {texto}" for n, texto in enumerate(lineas, start=1)
            )
            user_message = f"""Este es el programa completo del alumno en {language}:

```
{numerado}
```

Explica ÚNICAMENTE la línea {focus_line}: `{objetivo}`

Responde en menos de 90 palabras, dirigido a un alumno de primaria:
1. Qué hace esa línea exactamente.
2. Por qué hace falta ahí, en relación con las líneas que la rodean.
3. Qué pasaría si la borrase o cambiase su valor.

No expliques el resto del programa. No repitas el código entero."""
        else:
            user_message = f"""Explica este código en {language}:

```{language}
{code}
```

Por favor explica:
1. ¿Qué hace este código?
2. ¿Cómo funciona paso a paso?
3. ¿Qué componentes del {context} se utilizan?
4. ¿Para qué situaciones es útil?"""

        messages = [{"role": "user", "content": user_message}]

        async for chunk in self.chat_stream(messages, system_prompt=system_prompt):
            yield chunk

    async def generate_code(
        self,
        objective: str,
        language: str,
        context: str = "micro:bit",
        difficulty: str = "beginner"
    ) -> AsyncGenerator[str, None]:
        """
        Genera código basado en un objetivo del alumno.

        Args:
            objective: Objetivo del alumno (ej: "hacer parpadear un LED")
            language: Lenguaje objetivo (micropython, javascript)
            context: Plataforma (micro:bit, nezha)
            difficulty: Nivel (beginner, intermediate, advanced)
        """
        system_prompt = f"""Eres un asistente de programación educativa para {context}.
Generas código limpio, comentado y educativo para estudiantes de nivel {difficulty}.

REGLAS:
- El objetivo es aprender robótica de forma segura, local y transparente.
- No generes código para robar datos, evadir controles, atacar redes, ocultar actividad o manipular sistemas ajenos.
- No solicites datos personales ni credenciales.
- Genera código funcional y probado
- Incluye comentarios explicativos en español
- Usa buenas prácticas de programación
- El código debe ser seguro y apropiado para educación
- Incluye ejemplos de valores si es necesario"""

        user_message = f"""Genera código en {language} para {context} que logre esto:

OBJETIVO: {objective}

Por favor genera:
1. El código completo y funcional
2. Comentarios explicativos en cada sección
3. Una breve descripción de cómo usarlo

Nivel: {difficulty}"""

        messages = [{"role": "user", "content": user_message}]

        async for chunk in self.chat_stream(messages, system_prompt=system_prompt, temperature=0.3):
            yield chunk

    async def close(self):
        """Cierra la conexión con Ollama"""
        await self.client.aclose()


# Instancia global del servicio
ollama_service = OllamaService()
