from __future__ import annotations
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Literal, Optional

import fixture_loader

router = APIRouter()

Level = Literal["beginner", "visual", "advanced"]


class ExplainRequest(BaseModel):
    conceptSlug: str
    level: Level = "beginner"


class ExplainResponse(BaseModel):
    conceptSlug: str
    courseId: Optional[str] = None
    explanation: str
    keyPoints: list[str]
    level: Level
    videosSlug: Optional[str] = None
    isFallback: bool


@router.post("/concept", response_model=ExplainResponse)
def explain_concept(req: ExplainRequest) -> ExplainResponse:
    """
    Demo posture: serves curated French explanations from
    `ai-service/fixtures/explain/<slug>.json`. Misses fall back to
    `_fallback.json` so the demo never errors.

    Production swap-in: hit fixtures first as cache, fall through to LLM
    on miss, write LLM response back to the fixture cache.
    """
    fixture, is_fallback = fixture_loader.explain_lookup(req.conceptSlug)
    levels = fixture.get("levels", {})
    level_data = levels.get(req.level) or levels.get("beginner") or {
        "explanation": "Réponse générique.",
        "key_points": [],
    }
    return ExplainResponse(
        conceptSlug=req.conceptSlug,
        courseId=fixture.get("course_id"),
        explanation=level_data["explanation"],
        keyPoints=level_data.get("key_points", []),
        level=req.level,
        videosSlug=fixture.get("videos_slug"),
        isFallback=is_fallback,
    )
