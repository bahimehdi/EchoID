from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import time

import explain
import ocr
import videos
import workload
import recommendations
from settings import get_settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")
log = logging.getLogger("echoid.ai")

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("EchoID AI service starting...")
    yield
    log.info("EchoID AI service shutting down.")


app = FastAPI(
    title="EchoID Nexus — AI Microservice",
    description="EchoID AI Microservice — transcript-semantic video recommendations, "
    "Gemini-powered explainer, Tesseract OCR, live Wd scoring.",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(explain.router, prefix="/explain", tags=["Explain"])
app.include_router(ocr.router, prefix="/ocr", tags=["OCR"])
app.include_router(videos.router, prefix="/videos", tags=["Videos"])
app.include_router(workload.router, prefix="/workload", tags=["Workload"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])


@app.get("/", tags=["Health"])
def root():
    return {"message": "EchoID AI Microservice is running.", "docs": "/docs"}


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": "echoid-ai",
        "version": "0.2.0",
        "timestamp": int(time.time()),
    }
