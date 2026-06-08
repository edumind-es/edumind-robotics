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

from app.main import app


client = TestClient(app)


def _create_session(platform: str = "micro:bit") -> str:
    response = client.post("/api/simulator/session/create", json={"platform": platform})
    assert response.status_code == 200
    return response.json()["session_id"]


def test_microbit_simulator_executes_code_and_updates_state():
    session_id = _create_session()

    response = client.post(
        "/api/simulator/execute",
        json={
            "session_id": session_id,
            "code": "from microbit import *\ndisplay.set_pixel(2, 2, 9)\nprint('ok')",
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["success"] is True
    assert result["state"]["display"]["grid"][2][2] == 9
    assert any("PRINT: ok" in entry for entry in result["output_log"])


def test_microbit_buttons_and_sensors_are_stateful():
    session_id = _create_session()

    button_response = client.post(
        "/api/simulator/button",
        json={"session_id": session_id, "button": "a", "action": "press"},
    )
    assert button_response.status_code == 200

    sensor_response = client.post(
        "/api/simulator/sensor",
        json={"session_id": session_id, "sensor": "temperature", "value": 25},
    )
    assert sensor_response.status_code == 200

    state = client.get(f"/api/simulator/session/{session_id}").json()
    assert state["microbit"]["buttons"]["a"]["state"] == "pressed"
    assert state["microbit"]["sensors"]["temperature"] == 25


def test_custom_images_text_and_music_are_supported():
    session_id = _create_session()
    code = """
from microbit import *
import music

pin0.write_digital(1)
if pin0.is_touched():
    music.play("C4:4")
    display.show(Image("00900:00900:00900:00000:00000"))
"""

    response = client.post(
        "/api/simulator/execute",
        json={"session_id": session_id, "code": code},
    )

    assert response.status_code == 200
    result = response.json()
    assert result["success"] is True
    assert result["state"]["display"]["grid"][0][2] == 9
    assert any("music.play" in entry for entry in result["output_log"])


def test_nezha_simulator_controls_motors_and_servos():
    session_id = _create_session("nezha")

    motor_response = client.post(
        "/api/simulator/nezha/motor",
        params={"session_id": session_id, "motor": 1, "speed": 75},
    )
    servo_response = client.post(
        "/api/simulator/nezha/servo",
        params={"session_id": session_id, "servo": 1, "angle": 45},
    )

    assert motor_response.status_code == 200
    assert servo_response.status_code == 200

    state = client.get(f"/api/simulator/session/{session_id}").json()
    assert state["nezha"]["motors"]["1"]["speed"] == 75
    assert state["nezha"]["servos"]["1"]["angle"] == 45


def test_syntax_errors_are_reported_without_crashing_api():
    session_id = _create_session()

    response = client.post(
        "/api/simulator/execute",
        json={
            "session_id": session_id,
            "code": "from microbit import *\ndisplay.show(Image.HEART",
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["success"] is False
    assert "Syntax Error" in result["error"]
