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

1. Copy the example environment template:
   ```bash
   cp infra/env/.env.example infra/env/.env
   ```
2. Ask the team members for any missing secrets for `.env`.
3. Stand up the services with Docker Compose (from the project root):
   ```bash
   docker-compose -f infra/docker/docker-compose.dev.yml up --build
   ```

<!-- TODO: Add React Native specific setup steps here once frontend starts development -->

## Environment Variables

Environment templates are located in `infra/env/`. The `.env.example` file is designed to be a conversation starter and contract so developers immediately know what secrets or config variables are expected across services.

## Service URLs (Local Development)

When running through the provided docker-compose:
- **Backend API**: `http://localhost:8080`
- **AI Service API**: `http://localhost:8000`
- **Database**: `localhost:5432`

## Sprint 1 Objectives

| Role | Deliverable | Status |
|---|---|---|
| **All-in-One Engineer** | Repository Structure & Context | Done |
| | Dev/Staging Environment Configs | Done |
| | Integration: AI API Contract | Done |
| | Root README Documentation | Done |
| **Backend Engineer** | Spring Boot Skeleton with PostgreSQL connection | In Progress |
| | OAuth 2.0 flow (@uit.ac.ma restriction) | In Progress |
| | Core API Routing Stubs (Mock data) | In Progress |
| | Database Schema (User, Course, Assignment, Notification) | In Progress |
| **AI Engineer** | FastAPI skeleton with health-check endpoint | In Progress |
| | Research/Lock LLM choice & OCR engine | In Progress |
| | Write `/explain` stub with hardcoded response | In Progress |
| **Frontend/Mobile Dev** | React Native project skeleton | In Progress |
| | Static UI (login, dashboard, course list) | In Progress |
| | Wire login to backend OAuth | In Progress |
| | Load mocked Moodle data | In Progress |

## Team Setup
- **Backend Engineer**: Java / Spring Boot.
- **Frontend & Mobile Dev**: React Native.
- **AI Engineer**: Python / FastAPI / Machine Learning.
- **All-in-One / Integration Engineer**: Infrastructure, documentation, and service integration.

## Sprint & Demo Cycle
We follow an agile process, delivering a training presentation after each sprint, culminating in a live demo at the end of Sprint 4 for professors and IT experts. Quality and coherence are our top priorities.
