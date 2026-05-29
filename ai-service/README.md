# EchoID AI Service

FastAPI 0.111 / Python 3.11 — real AI explanations (Gemini), OCR (Tesseract), YouTube transcript ranking (TF-IDF), plus synthetic recommendations for dashboards + workload formula.

## Quick start

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Docs: `http://localhost:8000/docs`.

## Endpoints

| Path | What |
|---|---|
| `POST /explain/concept` | Gemini-generated explanation by concept slug + level |
| `POST /ocr/process-notes` | Tesseract OCR on PDF/image upload |
| `POST /videos/search` | YouTube search + transcript ranking via TF-IDF |
| `POST /workload/analyze` | `Wd = Σ Cᵢ/Tᵢ` portable computation |
| `GET /recommendations/concept-bottlenecks` | Cohort confusion ranking |
| `GET /recommendations/at-risk-students` | Logistic-regression at-risk classifier |
| `GET /recommendations/intervention-suggestions` | Rule-based suggestions |
| `GET /health` | Healthcheck |

## Recommendations

`recommendations.py` runs a deterministic synthetic cohort through:
- **Risk:** closed-form logistic over `(wd_trend, days_since_last_login, active_days_14d)`.
- **Bottlenecks:** weighted query-count ranking per concept slug, filterable by school.
- **Interventions:** rule-based templates with confidence scores.

Production swap-in path: read seed/event data from PostgreSQL instead of the synthetic generator. Same endpoint shapes.

## Settings

`LLM_API_KEY`, `GOOGLE_API_KEY`, `YOUTUBE_API_KEY` are all optional and default to empty. When absent, features return graceful fallback responses — the app never crashes.
