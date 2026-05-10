from __future__ import annotations
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
import time

import fixture_loader

router = APIRouter()


class OcrResponse(BaseModel):
    fixtureSlug: str
    courseId: Optional[str] = None
    ocrStatus: str
    pageCount: int
    extractedText: str
    indexedConcepts: list[str]
    confidence: float
    processingMs: int


@router.post("/process-notes", response_model=OcrResponse)
async def process_notes(
    file: UploadFile = File(...),
    fixture_slug: Optional[str] = Form(None),
) -> OcrResponse:
    """
    Demo posture: bytes are validated then ignored. Response is selected
    by the optional `fixture_slug` form field; otherwise rotates through
    the four canned OCR fixtures so repeated uploads feel realistic.

    Production swap-in: pass bytes through Tesseract, post-process,
    cache the result by content hash.
    """
    allowed = (".pdf", ".png", ".jpg", ".jpeg")
    if not file.filename or not file.filename.lower().endswith(allowed):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed)}",
        )

    # Simulate a small processing delay so the UI shows a meaningful spinner.
    time.sleep(0.8)

    fx = fixture_loader.ocr_lookup(fixture_slug)
    return OcrResponse(
        fixtureSlug=fx["fixture_slug"],
        courseId=fx.get("course_id"),
        ocrStatus=fx.get("ocr_status", "OK"),
        pageCount=fx.get("page_count", 1),
        extractedText=fx.get("extracted_text", ""),
        indexedConcepts=fx.get("indexed_concepts", []),
        confidence=fx.get("confidence", 0.9),
        processingMs=fx.get("processing_ms", 1000),
    )
