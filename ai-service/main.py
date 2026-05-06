from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time

import explain
import ocr
import workload


# ── Startup / shutdown events ─────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("EchoID AI service starting...")
    yield
    print("EchoID AI service shutting down.")


# ── App definition ────────────────────────────────────────────
app = FastAPI(
    title="EchoID Nexus — AI Microservice",
    description="AI engine for concept explanation, OCR, and workload analysis.",
    version="0.1.0",
    lifespan=lifespan,
)

# Allow the backend (Spring Boot) to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # restrict to backend URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────
app.include_router(explain.router,  prefix="/explain",  tags=["Explain"])
app.include_router(ocr.router,      prefix="/ocr",      tags=["OCR"])
app.include_router(workload.router, prefix="/workload", tags=["Workload"])


# ── Root ──────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "message": "EchoID AI Microservice is running.",
        "docs": "/docs",
    }


# ── Health check ──────────────────────────────────────────────
# The backend calls this to verify the AI service is reachable.
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": "echoid-ai",
        "version": "0.1.0",
        "timestamp": int(time.time()),
    }
