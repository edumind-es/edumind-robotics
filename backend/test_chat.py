#!/usr/bin/env python3

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

from fastapi.testclient import TestClient
import json

from app.main import app
from app.routers import chat as chat_router


client = TestClient(app)


def _sse_text(response) -> str:
    chunks = []
    for line in response.text.splitlines():
        if not line.startswith("data: ") or line == "data: [DONE]":
            continue
        payload = line.removeprefix("data: ")
        try:
            chunks.append(json.loads(payload))
        except json.JSONDecodeError:
            chunks.append(payload)
    return "\n".join(chunks)


def test_chat_stream_uses_local_tutor_contract(monkeypatch):
    async def fake_chat_stream(*args, **kwargs):
        system_prompt = kwargs["system_prompt"]
        assert "MARCO EDUCATIVO Y DE PRIVACIDAD" in system_prompt
        assert "robótica" in system_prompt or "robotica" in system_prompt
        yield "Respuesta educativa local"

    monkeypatch.setattr(chat_router.ollama_service, "chat_stream", fake_chat_stream)

    response = client.post(
        "/api/chat/message/stream",
        json={
            "message": "Como hago parpadear el display",
            "conversation_history": [],
            "platform": "micro:bit",
            "language": "micropython",
            "difficulty": "beginner",
        },
    )

    assert response.status_code == 200
    assert "Respuesta educativa local" in _sse_text(response)


def test_code_generation_stream_can_be_mocked_without_ollama(monkeypatch):
    async def fake_generate_code(*args, **kwargs):
        yield "```python\nfrom microbit import *\ndisplay.show(Image.HEART)\n```"

    monkeypatch.setattr(chat_router.ollama_service, "generate_code", fake_generate_code)

    response = client.post(
        "/api/chat/generate-code/stream",
        json={
            "objective": "Mostrar un corazon",
            "platform": "micro:bit",
            "language": "micropython",
            "difficulty": "beginner",
            "include_explanation": True,
        },
    )

    assert response.status_code == 200
    assert "display.show(Image.HEART)" in response.text
