# AI Service API Contract

This document outlines the expected request/response contracts for the AI Service to allow parallel development and frontend integration.

## Base URL
Local: `http://localhost:8000`

---

## 1. Explain Concept

Generates an explanation for a student based on their requested concept and knowledge level.

**Endpoint:** `POST /explain`

### Request Body
```json
{
  "concept": "string",
  "student_level": "beginner|intermediate|advanced"
}
```

### Response (200 OK)
```json
{
  "explanation": "string",
  "videos": [
    {
      "title": "string",
      "url": "string"
    }
  ]
}
```

---

## 2. Healthcheck

Used by Docker and the Integration layer to ensure the AI Service is up and running.

**Endpoint:** `GET /health`

### Response (200 OK)
```json
{
  "status": "ok"
}
```
