"""
On-disk fixture catalogue for the demo (no live AI).

Loaded once at FastAPI startup. Each subdirectory under `fixtures/` holds
JSON files keyed by concept slug. The lookup helpers fall back to a generic
`_fallback.json` when a slug isn't curated.
"""
from __future__ import annotations

import json
import logging
import os
from itertools import cycle
from typing import Any

log = logging.getLogger(__name__)

FIXTURE_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures")


def _load_dir(name: str) -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    folder = os.path.join(FIXTURE_ROOT, name)
    if not os.path.isdir(folder):
        log.warning("Fixture directory missing: %s", folder)
        return out
    for fname in sorted(os.listdir(folder)):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(folder, fname)
        try:
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
            key = fname[:-5]  # strip .json
            out[key] = data
        except (json.JSONDecodeError, OSError) as e:
            log.warning("Skipping malformed fixture %s: %s", path, e)
    return out


_explain: dict[str, dict[str, Any]] = {}
_ocr: dict[str, dict[str, Any]] = {}
_videos: dict[str, dict[str, Any]] = {}
_ocr_rotator: cycle | None = None


def load_all() -> None:
    """Call from FastAPI lifespan startup."""
    global _explain, _ocr, _videos, _ocr_rotator
    _explain = _load_dir("explain")
    _ocr = _load_dir("ocr")
    _videos = _load_dir("videos")
    if not _explain:
        raise RuntimeError("No explainer fixtures loaded — refusing to start")
    if not _ocr:
        raise RuntimeError("No OCR fixtures loaded — refusing to start")
    if not _videos:
        raise RuntimeError("No video fixtures loaded — refusing to start")

    rotation_keys = [k for k in _ocr.keys() if not k.startswith("_")]
    _ocr_rotator = cycle(rotation_keys)
    log.info(
        "AI fixtures loaded: %d explain, %d ocr, %d videos",
        len(_explain), len(_ocr), len(_videos),
    )


def explain_lookup(concept_slug: str) -> tuple[dict[str, Any], bool]:
    """Returns (fixture, is_fallback)."""
    if concept_slug in _explain:
        return _explain[concept_slug], False
    return _explain.get("_fallback", {}), True


def ocr_lookup(fixture_slug: str | None) -> dict[str, Any]:
    if fixture_slug and fixture_slug in _ocr:
        return _ocr[fixture_slug]
    if _ocr_rotator is not None:
        return _ocr[next(_ocr_rotator)]
    raise RuntimeError("OCR fixtures not loaded")


def videos_lookup(concept_slug: str) -> tuple[dict[str, Any], bool]:
    if concept_slug in _videos:
        return _videos[concept_slug], False
    return _videos.get("_fallback", {"concept_slug": concept_slug, "videos": []}), True
