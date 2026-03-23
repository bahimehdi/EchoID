from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time

from routers import explain, ocr, workload


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("EchoID AI service starting...")
    yield
    # Shutdown
    print("EchoID AI service shutting down.")


app = FastAPI(
    title="EchoID Nexus — AI Microservice",
    description="AI engine for concept explanation, OCR, and workload analysis.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your backend URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(explain.router, prefix="/explain",   tags=["Explain"])
app.include_router(ocr.router,     prefix="/ocr",       tags=["OCR"])
app.include_router(workload.router, prefix="/workload", tags=["Workload"])


# ── Health check ──────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health_check():
    """
    Returns service status and current timestamp.
    Used by the backend to verify the AI service is reachable.
    """
    return {
        "status": "ok",
        "service": "echoid-ai",
        "version": "0.1.0",
        "timestamp": int(time.time()),
    }


@app.get("/", tags=["Health"])
def root():
    return {"message": "EchoID AI Microservice is running. Visit /docs for the API."}
