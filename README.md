# EchoID Nexus

EchoID Nexus is an AI-integrated layer **on top of** existing university LMS platforms (Moodle, Google Classroom) — augmenting them with level-adapted explanations, OCR ingestion, and predictive workload modeling instead of replacing them.

**Pilot scope (competition demo):** ENSAK preparatory cycle — CP1 (S1+S2) and CP2 (S3+S4). Course catalogue is grounded in the real ENSAK syllabus. The same architecture extends to the rest of UIT (ENSA, EST, FAC) by adding rows to the same fixtures.

**Demo posture:** the live demo runs offline — no AI / YouTube API keys required. The AI service is backed by a curated fixture catalogue keyed by concept slug. See [`.context/POSITIONING.md`](./.context/POSITIONING.md) and [`.context/DEMO_FALLBACKS.md`](./.context/DEMO_FALLBACKS.md) for details.

## Architecture & Services

The project is structured into distinct services:

- **[`backend/`](./backend)**: Spring Boot 3 / Java 21. Auth (JWT + refresh, OAuth2 Google), RBAC, course/LMS aggregation, events, workload, notifications.
- **[`ai-service/`](./ai-service)**: FastAPI 0.111 / Python 3.11. Explainer, OCR, YouTube — fixture-backed for the demo (see `.context/DEMO_FALLBACKS.md`).
- **[`frontend/`](./frontend)**: React Native (Expo, TypeScript) — student mobile app.
- **`web/`**: Vite + React (TS) — professor / admin dashboards with Grafana iframes.
- **PostgreSQL 16** + **Grafana** containers managed by docker-compose.

*For detailed API contracts, see the `docs/` folder (e.g. [`ai_api_contract.md`](./docs/ai_api_contract.md)).*

## Prerequisites

To run this project, make sure you have:
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- Java 21 (Backend)
- Python 3.11 (AI Service)
- Node/React Native environment (Frontend)

## Running Locally

### First-Time Setup

1. Copy the shared environment template:
   ```bash
   cp infra/env/.env.example infra/env/.env
   ```
2. Fill in every value marked `REQUIRED` or set to `CHANGE_ME`.
3. Start the full local stack from the project root:
   ```bash
   docker compose -f infra/docker/docker-compose.dev.yml --env-file infra/env/.env up --build
   ```

For the full environment variable reference, see [`ENV_VARS.md`](./ENV_VARS.md).

### Mobile app (Expo)

```bash
cd frontend
npm install
npx expo start
```

Then press `a` for Android emulator, `i` for iOS simulator, or scan the QR code with the Expo Go app on a physical device. The app expects the backend on `http://localhost:8080`; for a physical device, set `EXPO_PUBLIC_API_BASE_URL` to your machine's LAN IP.

## Environment Variables

Environment templates are located in `infra/env/`. The `.env.example` file is designed to be a conversation starter and contract so developers immediately know what secrets or config variables are expected across services.

## Service URLs (Local Development)

When running through the provided docker-compose:
- **Backend API**: `http://localhost:8080` (Swagger UI at `/swagger-ui.html`)
- **AI Service API**: `http://localhost:8000`
- **Web dashboards** (professor / admin): `http://localhost:3000`
- **Grafana**: `http://localhost:3001`
- **Database**: `localhost:5432`

## Project context

For the full project knowledge base (architecture deep-dive, Jira ticket sync, fixture catalogue, skill modules), see the gitignored `.context/` folder. Start with [`.context/INDEX.md`](./.context/INDEX.md).
