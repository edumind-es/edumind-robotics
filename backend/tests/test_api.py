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
from app.services.metrics_service import metrics


client = TestClient(app)


def test_health_endpoint_returns_status():
    response = client.get("/api/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] in {"ok", "degraded"}
    assert "ollama_available" in data
    assert data["version"]


def test_readiness_endpoint_exposes_operational_contract():
    response = client.get("/api/ready")

    assert response.status_code == 200
    data = response.json()
    assert data["ready"] is True
    assert data["capabilities"]["simulator"] is True
    assert data["capabilities"]["privacy_first_policy"] is True
    assert data["policy"]["mode"] == "local-first"
    assert data["policy"]["remote_ai_allowed"] is False


def test_application_metrics_record_requests_by_route_template():
    before = metrics.request_counts["/api/health"]

    assert client.get("/api/health").status_code == 200

    response = client.get("/api/metrics")
    assert response.status_code == 200
    assert response.json()["requests"]["/api/health"] == before + 1


def test_code_templates_endpoint_returns_catalog():
    response = client.get("/api/code/templates")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert data["templates"][0]["code"]


def test_code_validator_accepts_basic_micropython():
    response = client.post(
        "/api/code/validate",
        json={"code": "from microbit import *\ndisplay.show(Image.HEART)"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["can_execute"] is True


def test_legacy_and_current_simulator_session_routes_work():
    legacy = client.post("/api/simulator/session")
    current = client.post("/api/simulator/session/create", json={"platform": "micro:bit"})

    assert legacy.status_code == 200
    assert current.status_code == 200
    assert legacy.json()["session_id"]
    assert current.json()["session_id"]


def test_export_micropython_downloads_python_file():
    response = client.post(
        "/api/export/micropython",
        json={"code": "print('test')"},
    )

    assert response.status_code == 200
    assert response.headers["content-disposition"].endswith(".py")
    assert "print('test')" in response.text


def test_export_scratch_downloads_valid_sb3_archive():
    response = client.post(
        "/api/export/scratch",
        json={
            "code": "from microbit import *\ndisplay.show(Image.HEART)",
            "project_name": "Robot Aula",
        },
    )

    assert response.status_code == 200
    assert response.headers["content-disposition"].endswith(".sb3")
    assert response.headers["content-type"] == "application/x-scratch"

    import io
    import zipfile

    with zipfile.ZipFile(io.BytesIO(response.content)) as zf:
        assert "project.json" in zf.namelist()


def test_export_hardware_bundle_contains_code_profile_and_instructions():
    response = client.post(
        "/api/export/hardware-bundle",
        json={
            "code": "from microbit import *\ndisplay.show(Image.HEART)",
            "project_name": "Robot Aula",
            "hardware_target": "nezha",
            "settings": {"safe_motor_speed": 35},
        },
    )

    assert response.status_code == 200
    assert "hardware_bundle.zip" in response.headers["content-disposition"]
    assert response.headers["content-type"] == "application/zip"

    import io
    import json
    import zipfile

    with zipfile.ZipFile(io.BytesIO(response.content)) as zf:
        names = set(zf.namelist())
        assert {"main.py", "hardware_settings.py", "hardware_profile.json", "README_HARDWARE.md"} <= names
        profile = json.loads(zf.read("hardware_profile.json"))
        assert profile["hardware_target"] == "nezha"
        assert profile["settings"]["safe_motor_speed"] == 35
        assert profile["privacy"]["requires_cloud_service"] is False
