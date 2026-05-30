import pytest


@pytest.mark.asyncio
async def test_workload_empty_assignments(client):
    payload = {"student_id": "test-1", "assignments": []}
    async with client as ac:
        r = await ac.post("/workload/analyze", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["student_id"] == "test-1"
    assert data["workload_density"] == 0.0
    assert data["risk_level"] == "low"


@pytest.mark.asyncio
async def test_workload_low(client):
    payload = {
        "student_id": "test-2",
        "assignments": [
            {"title": "TD 1", "complexity": 1, "days_remaining": 10},
        ],
    }
    async with client as ac:
        r = await ac.post("/workload/analyze", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["workload_density"] == 0.1
    assert data["risk_level"] == "low"


@pytest.mark.asyncio
async def test_workload_medium(client):
    payload = {
        "student_id": "test-3",
        "assignments": [
            {"title": "Projet", "complexity": 4, "days_remaining": 2},
            {"title": "TD", "complexity": 3, "days_remaining": 3},
        ],
    }
    async with client as ac:
        r = await ac.post("/workload/analyze", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert 2.0 <= data["workload_density"] < 5.0
    assert data["risk_level"] == "medium"


@pytest.mark.asyncio
async def test_workload_high(client):
    payload = {
        "student_id": "test-4",
        "assignments": [
            {"title": "Examen", "complexity": 5, "days_remaining": 0.5},
            {"title": "Projet", "complexity": 5, "days_remaining": 1},
            {"title": "TD", "complexity": 4, "days_remaining": 0.3},
        ],
    }
    async with client as ac:
        r = await ac.post("/workload/analyze", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["workload_density"] >= 5.0
    assert data["risk_level"] == "high"


@pytest.mark.asyncio
async def test_workload_division_by_zero(client):
    payload = {
        "student_id": "test-5",
        "assignments": [
            {"title": "Urgent", "complexity": 5, "days_remaining": 0},
        ],
    }
    async with client as ac:
        r = await ac.post("/workload/analyze", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["workload_density"] == 50.0
    assert data["risk_level"] == "high"
