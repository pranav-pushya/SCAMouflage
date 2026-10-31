"""Tests for health check and /analyze contract."""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_check():
    """Ensure /health returns 200 with status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_analyze_contract_keys():
    """Ensure POST /analyze returns the expected contract keys and dummy structure."""
    payload = {
        "type": "url",
        "content": "hxxp://fake-scam-bank-kyc.example.com",
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200

    data = response.json()
    # Check top-level contract keys
    assert data["dummy"] is True
    assert "verdict" in data
    assert "score" in data
    assert "engines" in data
    assert "reasons" in data
    assert "next_steps" in data

    # Check engines keys
    engines = data["engines"]
    assert "url" in engines
    assert "text" in engines
    assert "header" in engines

    # Check engine output structure
    for engine_name in ["url", "text", "header"]:
        assert "score" in engines[engine_name]
        assert "flags" in engines[engine_name]


def test_analyze_rejects_empty_content():
    """Ensure /analyze rejects empty or whitespace-only content with 422."""
    empty_payload = {
        "type": "url",
        "content": "",
    }
    response = client.post("/analyze", json=empty_payload)
    assert response.status_code == 422

    whitespace_payload = {
        "type": "sms",
        "content": "   ",
    }
    response_ws = client.post("/analyze", json=whitespace_payload)
    assert response_ws.status_code == 422
