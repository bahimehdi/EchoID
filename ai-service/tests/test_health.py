import pytest


@pytest.mark.asyncio
async def test_root(client):
    async with client as ac:
        r = await ac.get("/")
    assert r.status_code == 200
    data = r.json()
    assert "message" in data
    assert "EchoID AI Microservice" in data["message"]


@pytest.mark.asyncio
async def test_health(client):
    async with client as ac:
        r = await ac.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert data["service"] == "echoid-ai"
    assert data["version"] == "0.2.0"
    assert isinstance(data["timestamp"], int)
