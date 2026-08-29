import time

from fastapi.testclient import TestClient

from app import auth
from app import main
from app.main import app


client = TestClient(app)


def test_auth_config_reports_local_mode_in_tests():
    response = client.get("/api/auth/config")
    assert response.status_code == 200
    assert response.json()["sso_enabled"] is False


def test_auth_me_rejects_missing_session():
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_signed_session_round_trip(monkeypatch):
    monkeypatch.setattr(
        auth,
        "settings",
        auth.AuthSettings(
            enabled=True,
            app_base_url="https://robotics.edumind.es",
            issuer_url="https://auth.edumind.es/application/o/edumind-robotics",
            client_id="robotics-test",
            client_secret="secret",
            scopes="openid profile email",
            session_cookie_name="edumind_robotics_session",
            session_secret="a" * 64,
            session_max_age=3600,
        ),
    )
    value = auth.sign_session(
        {
            "id": "user-1",
            "username": "teacher",
            "email": "teacher@example.test",
            "role": "teacher",
        }
    )
    assert auth.verify_session(value)["id"] == "user-1"
    assert auth.verify_session(f"{value}tampered") is None


def test_expired_session_is_rejected(monkeypatch):
    monkeypatch.setattr(time, "time", lambda: 100)
    value = auth.sign_session(
        {"id": "user-1", "username": "student", "email": None, "role": "student"}
    )
    monkeypatch.setattr(time, "time", lambda: 100 + auth.settings.session_max_age + 1)
    assert auth.verify_session(value) is None


def test_next_redirect_is_restricted_to_frontend_paths():
    assert auth._safe_next("/lab?lesson=1") == "/lab?lesson=1"
    assert auth._safe_next("https://evil.example") == "/"
    assert auth._safe_next("//evil.example") == "/"
    assert auth._safe_next("/api/metrics") == "/"


def test_protected_api_requires_session_when_sso_is_enabled(monkeypatch):
    monkeypatch.setattr(
        main,
        "auth_settings",
        auth.AuthSettings(
            enabled=True,
            app_base_url="https://robotics.edumind.es",
            issuer_url="https://auth.edumind.es/application/o/edumind-robotics",
            client_id="robotics-test",
            client_secret="secret",
            scopes="openid profile email",
            session_cookie_name="edumind_robotics_session",
            session_secret="a" * 64,
            session_max_age=3600,
        ),
    )
    response = client.get("/api/code/templates")
    assert response.status_code == 401
