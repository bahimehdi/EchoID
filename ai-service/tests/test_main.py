import pytest
from fastapi.testclient import TestClient


def test_lifespan_and_health():
    from main import app
    with TestClient(app) as client:
        r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert data["service"] == "echoid-ai"


def test_root():
    from main import app
    with TestClient(app) as client:
        r = client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert "EchoID AI" in data["message"]
    assert "/docs" in data["docs"]
