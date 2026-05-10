# EchoID Backend

Spring Boot 3.4 / Java 21 — auth, RBAC, LMS aggregation, AI proxy, workload, events, admin.

## Quick start

```bash
JAVA_HOME=/path/to/jdk-21 ./mvnw spring-boot:run
```

Or via Docker compose from the repo root.

## Run tests

```bash
./mvnw test
```

37 tests cover auth, courses, LMS mocks, AI proxy, events, students/workload, admin recommendations, and the OpenAPI contract.

## Layout

- `controller/` — REST endpoints, one class per resource.
- `service/` — business logic (`AuthService`, `JwtService`, `LmsService`, `CourseService`, `WorkloadService`, `AiClient`).
- `dto/` — Lombok DTOs with Swagger annotations.
- `model/` + `repository/` — JPA entities and Spring Data repositories.
- `security/` — `JwtAuthenticationFilter`, `CustomOAuth2UserService`.
- `config/` — `SecurityConfig`, `CorsConfig`, `OpenApiConfig`.
- `src/main/resources/fixtures/` — ENSAK Moodle + Google Classroom JSON.
- `src/main/resources/db/migration/` — Flyway V1–V6.

## Endpoints

Swagger UI: `http://localhost:8080/swagger-ui.html`. The OpenAPI spec at `/v3/api-docs` is the single source of truth.

## Key env vars

| Var | Default | What |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/echoid_dev` | Postgres connection |
| `JWT_SECRET` | dev value | base64-encoded 256-bit key |
| `AI_SERVICE_URL` | `http://localhost:8000` | FastAPI service URL for the proxy |

Full reference: [`../ENV_VARS.md`](../ENV_VARS.md).
