from __future__ import annotations
import logging
import re
from fastapi import APIRouter
from pydantic import BaseModel

import fixture_loader
import youtube as yt
from settings import get_settings

log = logging.getLogger(__name__)
router = APIRouter()

# Per-concept cache: concept_slug → list[Video] in display order.
# Populated lazily on first request, persists for the process lifetime.
_CONCEPT_CACHE: dict[str, list["Video"]] = {}


class VideoSearchRequest(BaseModel):
    conceptSlug: str


class Video(BaseModel):
    title: str
    channel: str
    url: str
    videoId: str | None
    thumbnailUrl: str | None
    durationSec: int | None = None
    viewCount: int | None = None
    likeCount: int | None = None
    score: float | None = None


class VideoSearchResponse(BaseModel):
    conceptSlug: str
    videos: list[Video]
    isFallback: bool


def _yt_id(url: str) -> str | None:
    m = re.search(r"[?&]v=([^&]+)", url) or re.search(r"youtu\.be/([^?]+)", url)
    return m.group(1) if m else None


def _build_video(vid: str | None, live: dict | None, fallback_title: str = "", fallback_channel: str = "") -> Video:
    title = (live or {}).get("title") or fallback_title or "Vidéo YouTube"
    channel = (live or {}).get("channel") or fallback_channel or ""
    url = f"https://www.youtube.com/watch?v={vid}" if vid else "https://www.youtube.com/results"
    return Video(
        title=title,
        channel=channel,
        url=url,
        videoId=vid,
        thumbnailUrl=f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg" if vid else None,
        durationSec=(live or {}).get("durationSec"),
        viewCount=(live or {}).get("viewCount"),
        likeCount=(live or {}).get("likeCount"),
        score=(live or {}).get("score"),
    )


def _live_search_or_fallback(slug: str, fx: dict, api_key: str) -> tuple[list[Video], bool]:
    """
    Try YouTube search.list with the fixture's `query` (or display name); on
    failure, fall back to the curated `videos[]` list in the fixture. Returns
    (list, used_fallback_videos).
    """
    query: str = (fx.get("query") or fx.get("display_name") or slug).strip()
    fallback_entries = fx.get("videos", [])

    # 1) Live search → top N IDs
    ids = yt.search_video_ids(api_key, query, max_results=3) if api_key else []

    # 2) If no live results, use the curated IDs as a backup list
    if not ids:
        ids = [vid for v in fallback_entries if (vid := _yt_id(v.get("url", "")))]

    used_fallback = not bool(api_key) or ids == [
        _yt_id(v.get("url", "")) for v in fallback_entries
    ]

    if not ids:
        return [], True

    # 3) Enrich with stats / duration / canonical title
    meta = yt.fetch_metadata(api_key, ids) if api_key else {}

    # 4) Build Video objects, preserving search-result order (relevance) but
    #    bubbling our score-derived sort if metadata is available.
    videos: list[Video] = []
    fallback_by_id = {_yt_id(v.get("url", "")): v for v in fallback_entries}
    for vid in ids:
        live = meta.get(vid) if vid else None
        fb = fallback_by_id.get(vid, {})
        videos.append(_build_video(vid, live, fb.get("title", ""), fb.get("channel", "")))

    if any(v.score is not None for v in videos):
        videos.sort(key=lambda x: -(x.score or 0))

    return videos, used_fallback


@router.post("/search", response_model=VideoSearchResponse)
def search_videos(req: VideoSearchRequest) -> VideoSearchResponse:
    """
    Hybrid YouTube search:
      1. concept_slug → fixture lookup gets a curated French search query
      2. YouTube Data API search.list (relevance-ranked, French, medium length)
      3. videos.list batched for duration / view-count / like-count
      4. relevance score derived from like-rate × log(views), in-memory cached

    Demo posture: API key in `.env`. Without a key (or on quota / network
    failure) the endpoint serves the fixture's curated `videos[]` list with
    only thumbnails — same response shape, frontend doesn't branch.
    """
    fx, is_concept_fallback = fixture_loader.videos_lookup(req.conceptSlug)

    cached = _CONCEPT_CACHE.get(req.conceptSlug)
    if cached is not None:
        return VideoSearchResponse(
            conceptSlug=req.conceptSlug, videos=cached, isFallback=is_concept_fallback,
        )

    api_key = get_settings().youtube_api_key
    videos, _ = _live_search_or_fallback(req.conceptSlug, fx, api_key)
    _CONCEPT_CACHE[req.conceptSlug] = videos

    return VideoSearchResponse(
        conceptSlug=req.conceptSlug, videos=videos, isFallback=is_concept_fallback,
    )
