# Environment Variables

This file is the source of truth for local EchoID configuration. Docker Compose loads the shared file at `infra/env/.env`; start from `infra/env/.env.example` and replace values marked `REQUIRED`.

## Shared Docker Environment

| Variable name | Service | Description | Example value | Required? |
| --- | --- | --- | --- | --- |
| `POSTGRES_DB` | Postgres, backend, Grafana | Database name created by the Postgres container and used by dependent services. | `echoid` | Yes |
| `POSTGRES_USER` | Postgres, Grafana | Database user created by the Postgres container. | `echoid_user` | Yes |
| `POSTGRES_PASSWORD` | Postgres, Grafana | Password for `POSTGRES_USER`. Use a real secret outside local dev. | `CHANGE_ME` | Yes |
| `SERVER_PORT` | Backend | Spring Boot HTTP port inside the backend container. | `8080` | No, defaults to `8080` |
| `SPRING_DATASOURCE_URL` | Backend | JDBC URL the backend uses inside Docker. Use the Compose service name `postgres`, not `localhost`. | `jdbc:postgresql://postgres:5432/echoid` | Yes for Docker |
| `SPRING_DATASOURCE_USERNAME` | Backend | Backend database username. Should match `POSTGRES_USER`. | `echoid_user` | Yes for Docker |
| `SPRING_DATASOURCE_PASSWORD` | Backend | Backend database password. Should match `POSTGRES_PASSWORD`. | `CHANGE_ME` | Yes for Docker |
| `JWT_SECRET` | Backend | Secret used to sign or validate JWTs. Must be strong in shared or production environments. | `CHANGE_ME` | Yes |
| `JWT_EXPIRY_MS` | Backend | JWT lifetime in milliseconds. | `86400000` | No, dev default is one day |
| `GOOGLE_CLIENT_ID` | Backend | Google OAuth2 client ID. Dev placeholders are enough for health checks. | `CHANGE_ME` | Required for real OAuth login |
| `GOOGLE_CLIENT_SECRET` | Backend | Google OAuth2 client secret. Dev placeholders are enough for health checks. | `CHANGE_ME` | Required for real OAuth login |
| `AI_SERVICE_URL` | Backend | Internal URL used by the backend to call the AI service. | `http://ai-service:8000` | Yes |
| `CORS_ALLOWED_ORIGINS` | Backend | Comma-separated list of browser origins allowed by backend CORS. | `http://localhost:3000` | No for local, required for prod |
| `PORT` | AI service | FastAPI service port. The Dockerfile currently exposes and starts Uvicorn on `8000`. | `8000` | No, local standard is `8000` |
| `LLM_API_KEY` | AI service | API key for the LLM provider planned for Sprint 2. Placeholder is acceptable for Sprint 1 mocks. | `CHANGE_ME` | Required when live LLM calls are enabled |
| `GOOGLE_API_KEY` | AI service | Google Gemini API key used by the AI engineer's branch convention. Keep it aligned with `LLM_API_KEY` until the settings layer chooses one canonical name. | `CHANGE_ME` | Required when Gemini calls are enabled |
| `YOUTUBE_API_KEY` | AI service | YouTube Data API key planned for video recommendations. Placeholder is acceptable for Sprint 1 mocks. | `CHANGE_ME` | Required when YouTube integration is enabled |
| `OCR_LANGUAGE_HINT` | AI service | Preferred OCR language hint for future OCR processing. | `en` | No |
| `BACKEND_URL` | AI service | URL the AI service can use to call back to the backend. In Docker, use the Compose service name. | `http://backend:8080` | No for current mocks |
| `GRAFANA_ADMIN_PASSWORD` | Grafana | Initial Grafana admin password. | `CHANGE_ME` | Yes |

## Local Backend Alternatives

Spring Boot also supports these variables when running the backend outside Docker. They are fallback inputs for `backend/src/main/resources/application.yml`; Docker Compose should prefer the `SPRING_DATASOURCE_*` variables above.

| Variable name | Service | Description | Example value | Required? |
| --- | --- | --- | --- | --- |
| `DB_URL` | Backend | Full JDBC URL override for local backend runs. | `jdbc:postgresql://localhost:5432/echoid` | No |
| `DB_HOST` | Backend | Database host used when `DB_URL` is not set. | `localhost` | No |
| `DB_PORT` | Backend | Database port used when `DB_URL` is not set. | `5432` | No |
| `DB_NAME` | Backend | Database name used when `DB_URL` is not set. | `echoid_dev` | No |
| `DB_USERNAME` | Backend | Database username used when `SPRING_DATASOURCE_USERNAME` is not set. | `postgres` | No |
| `DB_PASSWORD` | Backend | Database password used when `SPRING_DATASOURCE_PASSWORD` is not set. | `postgres` | No |

## Compose-Managed Variables

These are set directly by Docker Compose and usually should not be added to `.env`.

| Variable name | Service | Description | Example value | Required? |
| --- | --- | --- | --- | --- |
| `GF_SECURITY_ADMIN_PASSWORD` | Grafana | Grafana's native admin password variable. Compose maps it from `GRAFANA_ADMIN_PASSWORD`. | `${GRAFANA_ADMIN_PASSWORD}` | Managed by Compose |
| `GF_USERS_ALLOW_SIGN_UP` | Grafana | Disables Grafana self-service sign-up in local dev. | `false` | Managed by Compose |

## AI Settings Note

`ai-service/settings.py` uses Pydantic `BaseSettings` through `pydantic-settings`, and `ai-service/main.py` loads it at startup. Missing required AI keys now fail during service startup instead of surfacing later during a demo. The latest `origin/AI_Engineer` env example uses `GOOGLE_API_KEY` for Gemini; the shared env also keeps `LLM_API_KEY` as a provider-neutral name until the LLM provider contract settles.
