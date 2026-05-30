import pytest


@pytest.mark.asyncio
async def test_concept_bottlenecks(client):
    async with client as ac:
        r = await ac.get("/recommendations/concept-bottlenecks?school=ALL")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    if data:
        assert "conceptSlug" in data[0]
        assert "queryCount" in data[0]


@pytest.mark.asyncio
async def test_concept_bottlenecks_filtered(client):
    async with client as ac:
        r = await ac.get("/recommendations/concept-bottlenecks?school=ENSA")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_at_risk_students(client):
    async with client as ac:
        r = await ac.get("/recommendations/at-risk-students?school=ALL&limit=5")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    if data:
        assert "studentId" in data[0]
        assert "riskScore" in data[0]


@pytest.mark.asyncio
async def test_intervention_suggestions(client):
    async with client as ac:
        r = await ac.get("/recommendations/intervention-suggestions")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_explainer_history(client):
    async with client as ac:
        r = await ac.get("/recommendations/explainer-history?module=algebre")
    assert r.status_code == 200
    data = r.json()
    assert "weeks" in data or "module" in data


@pytest.mark.asyncio
async def test_submission_stats(client):
    async with client as ac:
        r = await ac.get("/recommendations/submission-stats?module=algebre")
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_module_kpis(client):
    async with client as ac:
        r = await ac.get("/recommendations/module-kpis?module=algebre")
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_all_modules_history(client):
    async with client as ac:
        r = await ac.get("/recommendations/all-modules-history")
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_engagement_by_day(client):
    async with client as ac:
        r = await ac.get("/recommendations/engagement-by-day")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_cohort_submissions(client):
    async with client as ac:
        r = await ac.get("/recommendations/cohort-submissions")
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_professor_performance(client):
    async with client as ac:
        r = await ac.get("/recommendations/professor-performance")
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_cheating_clusters(client):
    async with client as ac:
        r = await ac.get("/recommendations/cheating-clusters?school=ENSA")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
