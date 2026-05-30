import pytest


@pytest.mark.asyncio
async def test_explain_concept_no_api_key(client):
    payload = {"conceptSlug": "thermo-1er-principe", "level": "beginner"}
    async with client as ac:
        r = await ac.post("/explain/concept", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["conceptSlug"] == "thermo-1er-principe"
    assert data["level"] == "beginner"
    assert "keyPoints" in data
    assert isinstance(data["keyPoints"], list)
    assert data["isFallback"] is True


@pytest.mark.asyncio
async def test_explain_concept_unknown_slug(client):
    payload = {"conceptSlug": "unknown-concept", "level": "advanced"}
    async with client as ac:
        r = await ac.post("/explain/concept", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["conceptSlug"] == "unknown-concept"
    assert data["level"] == "advanced"
    assert data["isFallback"] is True


@pytest.mark.asyncio
async def test_explain_concept_default_level(client):
    payload = {"conceptSlug": "algebre-diagonalisation"}
    async with client as ac:
        r = await ac.post("/explain/concept", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["level"] == "beginner"


@pytest.mark.asyncio
async def test_explain_concept_visual_level(client):
    payload = {"conceptSlug": "analyse-limites", "level": "visual"}
    async with client as ac:
        r = await ac.post("/explain/concept", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["level"] == "visual"
