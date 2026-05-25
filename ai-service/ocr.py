from __future__ import annotations
import logging
import os
import tempfile
import time
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional

from settings import get_settings

log = logging.getLogger(__name__)
router = APIRouter()

ALLOWED_EXTENSIONS = (".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".bmp")

_CONCEPT_KEYWORDS: list[tuple[str, list[str]]] = [
    ("thermodynamique", ["thermo", "thermodynamique", "entropie", "enthalpie", "carnot", "chaleur"]),
    ("algèbre linéaire", ["matrice", "diagonalisation", "vecteur propre", "valeur propre", "déterminant"]),
    ("analyse", ["limite", "continuité", "dérivée", "intégrale", "série", "convergence"]),
    ("chimie", ["équilibre chimique", "pH", "titrage", "oxydoréduction", "cinétique"]),
    ("électronique", ["amplificateur", "opérationnel", "montage", "tension", "courant"]),
    ("électrostatique", ["gauss", "champ électrique", "potentiel", "charge"]),
    ("mécanique", ["newton", "force", "moment", "énergie cinétique", "travail"]),
    ("optique", ["lentille", "foyer", "image", "verge", "distance focale"]),
    ("probabilités", ["bayes", "probabilité", "loi normale", "variance", "estimateur"]),
    ("signal", ["fourier", "fréquence", "échantillonnage", "filtrage", "convolution"]),
    ("algorithmique", ["récursivité", "algorithme", "complexité", "itération", "récursif"]),
]


class OcrResponse(BaseModel):
    fixtureSlug: str
    courseId: Optional[str] = None
    ocrStatus: str
    pageCount: int
    extractedText: str
    indexedConcepts: list[str]
    confidence: float
    processingMs: int


def _index_concepts(text: str) -> list[str]:
    text_lower = text.lower()
    found: list[str] = []
    for concept, keywords in _CONCEPT_KEYWORDS:
        for kw in keywords:
            if kw.lower() in text_lower:
                found.append(concept)
                break
    return found


def _ocr_image(image_path: str, lang: str) -> tuple[str, float]:
    try:
        import pytesseract
        from PIL import Image
    except ImportError:
        log.warning("pytesseract or Pillow not installed")
        return ("", 0.0)

    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img, lang=lang)
        data = pytesseract.image_to_data(img, lang=lang, output_type=pytesseract.Output.DICT)
        confs = [c for c in data.get("conf", []) if isinstance(c, (int, float)) and c >= 0]
        confidence = round(sum(confs) / len(confs) / 100, 3) if confs else 0.0
        return text, confidence
    except Exception as e:
        log.error("OCR failed on %s: %s", image_path, e)
        return ("", 0.0)


def _ocr_pdf(pdf_path: str, lang: str) -> tuple[str, float, int]:
    try:
        import fitz
    except ImportError:
        log.warning("PyMuPDF not installed")
        return ("", 0.0, 0)

    import tempfile as _tf

    doc = fitz.open(pdf_path)
    all_text: list[str] = []
    confidences: list[float] = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        pix = page.get_pixmap(dpi=200)
        tmp = _tf.NamedTemporaryFile(suffix=".png", delete=False)
        try:
            pix.save(tmp.name)
            text, conf = _ocr_image(tmp.name, lang)
            if text.strip():
                all_text.append(text)
                confidences.append(conf)
        finally:
            os.unlink(tmp.name)
    doc.close()

    page_count = len(doc) if hasattr(doc, "__len__") else len(all_text)
    avg_conf = round(sum(confidences) / len(confidences), 3) if confidences else 0.0
    return "\n\n".join(all_text), avg_conf, page_count


@router.post("/process-notes", response_model=OcrResponse)
async def process_notes(
    file: UploadFile = File(...),
    fixture_slug: Optional[str] = None,
) -> OcrResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Format non supporté. Types acceptés : {', '.join(ALLOWED_EXTENSIONS)}",
        )

    t0 = time.time()
    lang = get_settings().ocr_language_hint or "fra"

    tmp = tempfile.NamedTemporaryFile(suffix=ext, delete=False)
    try:
        content = await file.read()
        tmp.write(content)
        tmp.close()

        if ext == ".pdf":
            text, confidence, page_count = _ocr_pdf(tmp.name, lang)
        else:
            text, confidence = _ocr_image(tmp.name, lang)
            page_count = 1
    except Exception as e:
        log.error("Processing failed: %s", e)
        raise HTTPException(status_code=500, detail="Erreur lors du traitement du fichier")
    finally:
        os.unlink(tmp.name)

    elapsed = int((time.time() - t0) * 1000)
    concepts = _index_concepts(text)

    return OcrResponse(
        fixtureSlug=fixture_slug or os.path.splitext(file.filename)[0],
        ocrStatus="OK" if text.strip() else "FAILED",
        pageCount=page_count or 1,
        extractedText=text.strip() or "(Aucun texte détecté)",
        indexedConcepts=concepts,
        confidence=confidence or 0.0,
        processingMs=elapsed,
    )
