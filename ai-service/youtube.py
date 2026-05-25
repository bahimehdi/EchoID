"""
YouTube Data API v3 enrichment.

Given a list of curated video IDs (from fixtures), fetch the canonical
title / channel / duration / view-count / like-count via one batched
`videos.list` call, then cache the result in memory.

Quota cost: 1 unit per 50 video IDs requested. The default daily quota
is 10,000 units, so this is essentially free at our scale.

Falls back gracefully to the fixture's own metadata when:
  - the API key is missing / empty (graceful fallback — returns empty result)
  - the call fails (network / quota)
  - a particular video ID is no longer available

Production swap-in plan documented in `.context/DEMO_FALLBACKS.md`.
"""
from __future__ import annotations
import logging
import re
from typing import Iterable

import httpx

log = logging.getLogger(__name__)

VIDEOS_LIST_URL = "https://www.googleapis.com/youtube/v3/videos"
SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"

# ISO 8601 duration: PT[#H][#M][#S]
_ISO = re.compile(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?")


def parse_iso8601(s: str) -> int:
    """Convert YouTube's PT10M12S → seconds. Returns 0 on parse failure."""
    if not s:
        return 0
    m = _ISO.fullmatch(s)
    if not m:
        return 0
    h, mn, sc = (int(g) if g else 0 for g in m.groups())
    return h * 3600 + mn * 60 + sc


def relevance_score(view_count: int, like_count: int) -> float:
    """
    Cheap, defensible relevance proxy: like-rate clamped to 0–10%, plus a
    log-views booster. Educational content typically lands in 0.6–0.95.
    """
    if view_count <= 0:
        return 0.5
    like_rate = min(0.10, like_count / view_count) / 0.10  # 0..1
    # Log-scale popularity, capped: 100 views → 0.4, 100k → 0.7, 10M → 1.0
    import math
    pop = min(1.0, math.log10(max(view_count, 10)) / 7)
    return round(0.5 * like_rate + 0.5 * pop, 3)


def search_video_ids(api_key: str, query: str, max_results: int = 3) -> list[str]:
    """
    YouTube search.list ordered by relevance, restricted to French videos
    of moderate length (4–20 min — long enough to teach, short enough to
    finish before the next class). Quota cost: 100 units per call.
    Returns a list of video IDs (no metadata yet — pair with fetch_metadata).
    """
    if not api_key or not query.strip():
        return []
    try:
        r = httpx.get(
            SEARCH_URL,
            params={
                "part": "id",
                "q": query,
                "type": "video",
                "videoEmbeddable": "true",
                "videoDuration": "medium",  # 4–20 min sweet spot
                "relevanceLanguage": "fr",
                "maxResults": max_results,
                "key": api_key,
            },
            timeout=8.0,
        )
        if r.status_code != 200:
            log.warning("YouTube search.list non-200: %s %s", r.status_code, r.text[:200])
            return []
        ids = [it["id"]["videoId"] for it in r.json().get("items", []) if "videoId" in it.get("id", {})]
        log.info("YouTube search.list '%s' → %d result(s)", query, len(ids))
        return ids
    except Exception as e:
        log.warning("YouTube search.list call failed: %s", e)
        return []


def fetch_metadata(api_key: str, video_ids: Iterable[str]) -> dict[str, dict]:
    """
    One batched call to YouTube Data API videos.list for up to 50 IDs.
    Returns { video_id: { title, channel, durationSec, viewCount, likeCount, score } }.
    Empty dict on any failure (caller should fall back to fixture metadata).
    """
    ids = [v for v in video_ids if v]
    if not api_key or not ids:
        return {}
    try:
        r = httpx.get(
            VIDEOS_LIST_URL,
            params={
                "part": "snippet,contentDetails,statistics",
                "id": ",".join(ids[:50]),
                "key": api_key,
            },
            timeout=8.0,
        )
        if r.status_code != 200:
            log.warning("YouTube Data API non-200: %s %s", r.status_code, r.text[:200])
            return {}
        out: dict[str, dict] = {}
        for item in r.json().get("items", []):
            vid = item["id"]
            sn = item.get("snippet", {})
            cd = item.get("contentDetails", {})
            st = item.get("statistics", {})
            views = int(st.get("viewCount", 0) or 0)
            likes = int(st.get("likeCount", 0) or 0)
            out[vid] = {
                "title": sn.get("title", "").strip(),
                "channel": sn.get("channelTitle", "").strip(),
                "durationSec": parse_iso8601(cd.get("duration", "")),
                "viewCount": views,
                "likeCount": likes,
                "score": relevance_score(views, likes),
            }
        log.info("YouTube Data API enriched %d/%d video(s)", len(out), len(ids))
        return out
    except Exception as e:
        log.warning("YouTube Data API call failed: %s", e)
        return {}
