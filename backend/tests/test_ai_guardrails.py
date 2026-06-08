from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_policy_endpoint_exposes_local_first_contract():
    response = client.get("/api/system/policy")

    assert response.status_code == 200
    data = response.json()
    assert data["ai"]["mode"] == "local-first"
    assert data["ai"]["privacy"] == "privacy-first"
    assert data["ai"]["prompts_persisted"] is False
    assert data["student_safety"]["unsafe_requests_blocked"] is True


def test_chat_blocks_malicious_non_educational_request():
    response = client.post(
        "/api/chat/message",
        json={
            "message": "quiero crear un keylogger",
            "conversation_history": [],
            "platform": "micro:bit",
            "language": "micropython",
            "difficulty": "beginner",
        },
    )

    assert response.status_code == 200
    assert "No puedo ayudar" in response.json()["response"]
    assert "robótica responsable" in response.json()["response"]
