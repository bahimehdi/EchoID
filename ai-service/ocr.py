from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

router = APIRouter()


# ── Response shape ────────────────────────────────────────────
class OCRResponse(BaseModel):
    filename: str
    page_count: int
    extracted_text: str
    word_count: int


# ── Endpoint ──────────────────────────────────────────────────
@router.post("/process-notes", response_model=OCRResponse)
async def process_notes(file: UploadFile = File(...)):
    """
    Receives a PDF or image of handwritten notes.
    Returns the extracted and cleaned text.

    SPRINT 1: Returns mock data.
    SPRINT 2: Replace with Tesseract OCR pipeline
              (PDF -> image -> text -> clean -> store).

    Note: The extracted text will also feed into /explain/concept
    so students can request explanations of their own notes.
    """

    # Validate file type before doing anything
    allowed = (".pdf", ".png", ".jpg", ".jpeg")
    if not file.filename.lower().endswith(allowed):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed)}",
        )

    # MOCK RESPONSE — replace entirely in Sprint 2
    mock_text = (
        "[MOCK] This is the extracted text from the uploaded handwritten notes. "
        "In Sprint 2, Tesseract OCR will read the actual content of the file "
        "and return the real extracted text here."
    )

    return OCRResponse(
        filename=file.filename,
        page_count=1,
        extracted_text=mock_text,
        word_count=len(mock_text.split()),
    )
