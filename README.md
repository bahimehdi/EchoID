# EchoID Nexus

EchoID Nexus is an MVP project developed for UIT University. Our goal is to create a seamless, AI-integrated platform with the potential for university-wide implementation. The system is designed to provide intelligent tooling for students and real-time insights (e.g., course comprehension predictions) for professors and administrators. 

By ensuring students utilize our AI tools for studying their courses, we gather high-quality, diverse data across various university branches (ENSA, EST, FAC, etc.) to continuously train and improve our models.

## Repository Structure

The project is structured into distinct services:

- **[`backend/`](./backend)**: Spring Boot service handling the core logic and API.
- **[`frontend/`](./frontend)**: Flutter or React Native mobile component.
- **[`ai-service/`](./ai-service)**: FastAPI service for our machine learning and AI features.
- **[`infra/`](./infra)**: Infrastructure configuration, including Docker Compose setups (`dev` & `staging`) and environment variable templates.
- **[`docs/`](./docs)**: Project documentation and architecture diagrams.

*(Note: Environment configurations and setup instructions can be found in each specific service's directory or within the `infra/` folder).*

## Team Setup
- **Backend Engineer**: Java / Spring Boot.
- **Frontend & Mobile Dev**: React Native / Flutter.
- **AI Engineer**: Python / FastAPI / Machine Learning.
- **All-in-One / Integration Engineer**: Infrastructure, documentation, and service integration.

## Sprint & Demo Cycle
We follow an agile process, delivering a training presentation after each sprint, culminating in a live demo at the end of Sprint 4 for professors and IT experts. quality and coherence are our top priorities.
