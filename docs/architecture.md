# Architecture

## Positioning

EchoID Nexus is a **layer on top of** existing university LMS platforms (Moodle, Google Classroom). It does not replace them. Course delivery, enrollment, and grading remain in the LMS. EchoID adds:

- A unified `CourseDTO` aggregated across multiple LMS sources.
- An AI explanation layer adapted to student level.
- An OCR ingestion pipeline that turns handwritten notes into searchable, explainer-friendly text.
- A predictive workload index `Wd = Σ Cᵢ/Tᵢ` and a notification trigger filtered by deadline + current pressure.
- Aggregated, anonymised cohort comprehension panels for professors and admins.

## Services

```
┌─────────────────┐       ┌──────────────────────┐       ┌──────────────┐
│  React Native   │ HTTPS │  Spring Boot Backend │  HTTP │  FastAPI AI  │
│  (Expo, mobile) │ ────▶ │  :8080  (JWT + RBAC) │ ────▶ │  :8000       │
└─────────────────┘       └──────────────────────┘       └──────────────┘
                                    │ ▲                          │
                                    ▼ │                          ▼
                          ┌──────────────────┐         ┌────────────────────┐
                          │  PostgreSQL 16   │         │  Fixture catalogue │
                          │  + Flyway        │         │  (no live AI)      │
                          └──────────────────┘         └────────────────────┘
                                    ▲
┌─────────────────┐                 │
│  Vite + React   │           ┌─────┴──────┐
│  /professor     │ iframe ── │  Grafana   │  reads PostgreSQL views
│  /admin         │           │  :3001     │
└─────────────────┘           └────────────┘
```

## Stack

| Layer | Technology |
|---|---|
| Mobile | React Native (Expo SDK 51, TypeScript), expo-router, TanStack Query, Zustand, NativeWind |
| Web (professor / admin) | Vite + React + TypeScript |
| Backend | Spring Boot 3.4, Java 21, Spring Security 6, jjwt, Flyway, Hypersistence Utils |
| AI service | FastAPI 0.111, Python 3.11, Pydantic v2 |
| Database | PostgreSQL 16 |
| Dashboards | Grafana, dashboards provisioned as code |
| Infra | Docker Compose, healthchecks, named volumes |

## Demo posture

For the competition the AI service is **fixture-backed**: explainer / OCR / YouTube responses come from JSON files keyed by concept slug. The same endpoints, shapes, and adapter seam are production-ready — when a real LLM is wired in, the fixture lookup becomes a cache layer.

LMS integration is **fixture-backed in the same spirit**: Moodle and Google Classroom adapters serve curated ENSAK courses. Production swap-in calls the live Web Services / Classroom APIs without changing anything downstream.

## Further reading

- `.context/` — full knowledge base (cahier, skills, delivery plan).
- `.context/POSITIONING.md` — augment-don't-replace thesis.
- `.context/ENSAK_CATALOG.md` — pilot course catalogue.
- `.context/DEMO_FALLBACKS.md` — AI fixture spec.
- `docs/openapi.yaml` — API contract source of truth.
