# AI Service API Contract

The AI service (`http://localhost:8000`) exposes three feature endpoints plus a healthcheck. **For the competition demo, every feature endpoint is fixture-backed** — no live LLM / OCR / YouTube API calls. The catalogue lives in `ai-service/fixtures/` and is specified by `.context/DEMO_FALLBACKS.md`.

Backend's `AiProxyController` forwards requests at `/api/ai/*` to the corresponding endpoints below.

## Base URL
- Local direct: `http://localhost:8000`
- Through backend proxy: `http://localhost:8080/api/ai/*`

---

## 1. Healthcheck

`GET /health` → `{ "status": "ok" }`

---

## 2. Explain Concept

`POST /explain/concept`

### Request
```json
{
  "concept_slug": "thermo-1er-principe",
  "level": "beginner"
}
```
- `concept_slug` (required): lowercased / hyphenated / accent-stripped concept identifier. Must match an entry in `.context/DEMO_FALLBACKS.md` for a curated response; otherwise a generic fallback is returned with `is_fallback: true`.
- `level` (required): `beginner` | `visual` | `advanced`.

### Response 200
```json
{
  "concept_slug": "thermo-1er-principe",
  "course_id": "ENSAK-CP1-S2-05",
  "explanation": "Le 1er principe dit que l'énergie d'un système isolé se conserve...",
  "key_points": ["Conservation de l'énergie", "ΔU = Q + W", "..."],
  "level": "beginner",
  "videos_slug": "thermo-1er-principe",
  "is_fallback": false
}
```

---

## 3. OCR — Process Notes

`POST /ocr/process-notes` (multipart/form-data)

Accepts a file (PDF or image). For the demo the bytes are ignored; the response is selected by an optional `fixture_slug` form field, otherwise rotates through the four canned fixtures.

### Response 200
```json
{
  "fixture_slug": "td-thermo-handwritten",
  "course_id": "ENSAK-CP1-S2-05",
  "ocr_status": "OK",
  "page_count": 1,
  "extracted_text": "TD 3 — Application du 1er principe...",
  "indexed_concepts": ["thermo-1er-principe"],
  "confidence": 0.94,
  "processing_ms": 1180
}
```

The mobile client uses `indexed_concepts` to deep-link directly into the explainer.

---

## 4. YouTube — Concept Videos

`POST /videos/search`

### Request
```json
{ "concept_slug": "thermo-1er-principe" }
```

### Response 200
```json
{
  "concept_slug": "thermo-1er-principe",
  "videos": [
    { "title": "...", "channel": "...", "url": "https://...", "duration_sec": 612, "score": 0.92 }
  ],
  "is_fallback": false
}
```

Unknown slug → single placeholder video, `is_fallback: true`.

---

## 5. Workload (live, not fixture-backed)

`POST /workload/analyze` — production formula `Wd = Σ Cᵢ/Tᵢ`. Backend has the canonical implementation at `/api/students/{id}/workload`; the ai-service version is exercised for portability only.

### Request
```json
{
  "assignments": [
    { "complexity": 3, "due_in_hours": 48 },
    { "complexity": 5, "due_in_hours": 120 }
  ]
}
```

### Response 200
```json
{
  "wd_score": 0.104,
  "breakdown": [
    { "complexity": 3, "due_in_hours": 48, "contribution": 0.0625 },
    { "complexity": 5, "due_in_hours": 120, "contribution": 0.0417 }
  ]
}
```

---

## Error shape (all endpoints)
```json
{ "code": "FIXTURE_LOAD_FAILED", "message": "Could not load fixture catalogue at startup", "details": null }
```

## Notes for production swap-in

When a real LLM ships post-competition:
1. Keep these endpoint shapes.
2. Add a cache layer: fixtures first, fall through to the LLM on miss, write the LLM response back to the fixture cache.
3. Same for OCR (Tesseract) and YouTube (Data API).

The mobile and backend code do not change.
