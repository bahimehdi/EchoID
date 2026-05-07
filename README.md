# EchoID Nexus

EchoID Nexus is an MVP project developed for UIT University. Our goal is to create a seamless, AI-integrated platform with the potential for university-wide implementation. The system is designed to provide intelligent tooling for students and real-time insights (e.g., course comprehension predictions) for professors and administrators. 

By ensuring students utilize our AI tools for studying their courses, we gather high-quality, diverse data across various university branches (ENSA, EST, FAC, etc.) to continuously train and improve our models.

## Architecture & Services

The project is structured into distinct services:

- **[`backend/`](./backend)**: Spring Boot service handling the core logic and API.
- **[`frontend/`](./frontend)**: React Native mobile component.
- **[`ai-service/`](./ai-service)**: FastAPI service for our machine learning and AI features.
- **`db`**: PostgreSQL container managed by docker-compose.

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

<!-- TODO: Add React Native specific setup steps here once frontend starts development -->

## Environment Variables

Environment templates are located in `infra/env/`. The `.env.example` file is designed to be a conversation starter and contract so developers immediately know what secrets or config variables are expected across services.

## Service URLs (Local Development)

When running through the provided docker-compose:
- **Backend API**: `http://localhost:8080`
- **AI Service API**: `http://localhost:8000`
- **Database**: `localhost:5432`
