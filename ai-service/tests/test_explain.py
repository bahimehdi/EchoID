import pytest
from unittest.mock import MagicMock, patch


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


@pytest.mark.asyncio
async def test_explain_concept_cache_hit(client):
    import explain
    explain._CACHE["thermo-1er-principe:beginner"] = {
        "explanation": "Explication mise en cache",
        "key_points": ["Point clé 1", "Point clé 2"],
    }

    payload = {"conceptSlug": "thermo-1er-principe", "level": "beginner"}
    async with client as ac:
        r = await ac.post("/explain/concept", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["isFallback"] is False
    assert data["explanation"] == "Explication mise en cache"
    assert data["keyPoints"] == ["Point clé 1", "Point clé 2"]

    explain._CACHE.clear()


@pytest.mark.asyncio
async def test_explain_concept_cache_hit_different_level(client):
    import explain
    explain._CACHE["analyse-limites:visual"] = {
        "explanation": "Visual cache",
        "key_points": ["Visual point"],
    }

    payload = {"conceptSlug": "analyse-limites", "level": "visual"}
    async with client as ac:
        r = await ac.post("/explain/concept", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["isFallback"] is False
    assert data["explanation"] == "Visual cache"

    explain._CACHE.clear()


def test_call_gemini_import_error():
    import builtins

    with patch("explain.get_settings") as mock_get:
        mock_get.return_value.google_api_key = "dummy-key"
        real_import = builtins.__import__

        def fail_genai_import(name, *args, **kwargs):
            if name == "google.generativeai":
                raise ImportError("No module named google.generativeai")
            return real_import(name, *args, **kwargs)

        with patch.object(builtins, "__import__", fail_genai_import):
            from explain import _call_gemini
            result = _call_gemini("thermo-1er-principe", "beginner")

    assert result is None


@pytest.mark.asyncio
async def test_explain_concept_with_gemini_success(client):
    import explain
    with patch.object(explain, "_call_gemini", return_value={
        "explanation": "Explication réussie par Gemini",
        "key_points": ["Point A", "Point B"],
    }):
        payload = {"conceptSlug": "thermo-1er-principe", "level": "beginner"}
        async with client as ac:
            r = await ac.post("/explain/concept", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["isFallback"] is False
    assert data["explanation"] == "Explication réussie par Gemini"
    assert data["keyPoints"] == ["Point A", "Point B"]


def test_call_gemini_api_error():
    mock_genai = MagicMock()
    mock_genai.GenerativeModel.side_effect = Exception("API call failed")

    with patch("explain.get_settings") as mock_get:
        mock_get.return_value.google_api_key = "dummy-key"
        with patch.dict("sys.modules", {"google.generativeai": mock_genai}):
            from explain import _call_gemini
            result = _call_gemini("thermo-1er-principe", "beginner")

    assert result is None


def test_call_gemini_success():
    mock_response = MagicMock()
    mock_response.text = (
        '{"explanation": "Voici une explication détaillée",'
        '"key_points": ["Point 1", "Point 2", "Point 3"]}'
    )
    mock_model = MagicMock()
    mock_model.generate_content.return_value = mock_response
    mock_genai = MagicMock()
    mock_genai.GenerativeModel.return_value = mock_model

    with patch("explain.get_settings") as mock_get:
        mock_get.return_value.google_api_key = "dummy-key"
        with patch.dict("sys.modules", {"google.generativeai": mock_genai}):
            from explain import _call_gemini
            result = _call_gemini("thermo-1er-principe", "beginner")

    assert result is not None
    assert result["explanation"] == "Voici une explication détaillée"
    assert len(result["key_points"]) == 3


def test_call_gemini_malformed_response():
    mock_response = MagicMock()
    mock_response.text = "not valid json"
    mock_model = MagicMock()
    mock_model.generate_content.return_value = mock_response
    mock_genai = MagicMock()
    mock_genai.GenerativeModel.return_value = mock_model

    with patch("explain.get_settings") as mock_get:
        mock_get.return_value.google_api_key = "dummy-key"
        with patch.dict("sys.modules", {"google.generativeai": mock_genai}):
            from explain import _call_gemini
            result = _call_gemini("thermo-1er-principe", "beginner")

    assert result is None


def test_call_gemini_wrong_shape():
    mock_response = MagicMock()
    mock_response.text = '{"explanation": "text"}'
    mock_model = MagicMock()
    mock_model.generate_content.return_value = mock_response
    mock_genai = MagicMock()
    mock_genai.GenerativeModel.return_value = mock_model

    with patch("explain.get_settings") as mock_get:
        mock_get.return_value.google_api_key = "dummy-key"
        with patch.dict("sys.modules", {"google.generativeai": mock_genai}):
            from explain import _call_gemini
            result = _call_gemini("thermo-1er-principe", "beginner")

    assert result is None


def test_call_gemini_with_markdown_codeblock():
    mock_response = MagicMock()
    mock_response.text = (
        "```json\n"
        '{"explanation": "Explication avec markdown",'
        '"key_points": ["Point 1"]}\n'
        "```"
    )
    mock_model = MagicMock()
    mock_model.generate_content.return_value = mock_response
    mock_genai = MagicMock()
    mock_genai.GenerativeModel.return_value = mock_model

    with patch("explain.get_settings") as mock_get:
        mock_get.return_value.google_api_key = "dummy-key"
        with patch.dict("sys.modules", {"google.generativeai": mock_genai}):
            from explain import _call_gemini
            result = _call_gemini("thermo-1er-principe", "beginner")

    assert result is not None
    assert result["explanation"] == "Explication avec markdown"
