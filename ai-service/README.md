# EchoID AI Service

FastAPI 0.111 / Python 3.11 — fixture-backed explainer / OCR / videos + scikit-learn-style recommendations + workload formula.

## Quick start

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Docs: `http://localhost:8000/docs`.

## Endpoints

| Path | What |
|---|---|
| `POST /explain/concept` | Curated explanation by concept slug + level |
| `POST /ocr/process-notes` | Canned OCR (rotates fixtures or by `fixture_slug`) |
| `POST /videos/search` | 3 curated YouTube videos per concept slug |
| `POST /workload/analyze` | `Wd = Σ Cᵢ/Tᵢ` portable computation |
| `GET /recommendations/concept-bottlenecks` | Cohort confusion ranking |
| `GET /recommendations/at-risk-students` | Logistic-regression at-risk classifier |
| `GET /recommendations/intervention-suggestions` | Rule-based suggestions |
| `GET /health` | Healthcheck |

## Fixtures

All explainer / OCR / video responses are loaded at startup from `fixtures/`:

```
fixtures/
├── _build_fixtures.py   # regenerate from .context/DEMO_FALLBACKS.md
├── explain/             # 12 concepts + _fallback.json
├── ocr/                 # 4 documents
└── videos/              # 6 video lists + _fallback.json
```

To regenerate after editing the spec:

```bash
python fixtures/_build_fixtures.py
```

## Recommendations

`recommendations.py` runs a deterministic synthetic cohort through:
- **Risk:** closed-form logistic over `(wd_trend, days_since_last_login, active_days_14d)`.
- **Bottlenecks:** weighted query-count ranking per concept slug, filterable by school.
- **Interventions:** rule-based templates with confidence scores.

Production swap-in path: read seed/event data from PostgreSQL instead of the synthetic generator. Same endpoint shapes.

## Settings

Demo posture: `LLM_API_KEY`, `GOOGLE_API_KEY`, `YOUTUBE_API_KEY` are all optional defaults to empty. They become required only when the real LLM / YouTube paths are wired in.
