# EchoID Nexus — Backend

AI-powered academic assistant backend for universities. Built with Java 25, Spring Boot 3.x, and PostgreSQL 17.

## Prerequisites

- Java 25+
- Maven 3.9+
- PostgreSQL 17 running locally or via Docker

## Running Locally

```bash
# Set required environment variables (see table below)
export DB_URL=jdbc:postgresql://localhost:5432/echoid
export DB_USERNAME=echoid
export DB_PASSWORD=secret
export GOOGLE_CLIENT_ID=your-google-client-id
export GOOGLE_CLIENT_SECRET=your-google-client-secret

# Run with dev profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

The server starts on `http://localhost:8080`.

## Environment Variables

| Variable              | Description                                        | Required |
|-----------------------|----------------------------------------------------|----------|
| `DB_URL`              | JDBC connection string for PostgreSQL              | Yes      |
| `DB_USERNAME`         | PostgreSQL username                                | Yes      |
| `DB_PASSWORD`         | PostgreSQL password                                | Yes      |
| `GOOGLE_CLIENT_ID`    | Google OAuth2 client ID                            | Yes      |
| `GOOGLE_CLIENT_SECRET`| Google OAuth2 client secret                        | Yes      |
| `CORS_ALLOWED_ORIGINS`| Comma-separated allowed origins (prod profile)     | No       |

## Docker

```bash
# Build
docker build -t echoid-nexus .

# Run
docker run -p 8080:8080 \
  -e DB_URL=jdbc:postgresql://host.docker.internal:5432/echoid \
  -e DB_USERNAME=echoid \
  -e DB_PASSWORD=secret \
  -e GOOGLE_CLIENT_ID=your-id \
  -e GOOGLE_CLIENT_SECRET=your-secret \
  -e SPRING_PROFILES_ACTIVE=prod \
  echoid-nexus
```

## API Endpoints

| Method | Path                            | Auth     | Description                              |
|--------|---------------------------------|----------|------------------------------------------|
| GET    | `/api/courses`                  | Required | List enrolled courses                    |
| GET    | `/api/courses/{id}/assignments` | Required | List assignments for a course            |
| GET    | `/api/users/me`                 | Required | Authenticated user's profile             |
| GET    | `/api/notifications`            | Required | List user notifications                  |
| POST   | `/api/notifications/{id}/read`  | Required | Mark a notification as read              |
| GET    | `/api/assignments/{id}/workload`| Required | Workload density for an assignment       |
| GET    | `/actuator/health`              | Public   | Health check (Spring Boot Actuator)      |

## Project Structure

```
com.echoid.nexus
├── config/          # Spring configuration (Security, CORS)
├── controller/      # REST controllers (no business logic)
├── service/         # Business logic layer
├── repository/      # Spring Data JPA repositories
├── model/           # JPA entities
│   └── enums/       # Java enums for DB check constraints
├── dto/             # Data transfer objects
├── security/        # OAuth2 user service
└── exception/       # Global exception handling
```

## Database Migrations

Flyway manages schema migrations automatically on startup. Migration files are in `src/main/resources/db/migration/`.
