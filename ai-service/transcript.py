from __future__ import annotations

import logging
from typing import Any

log = logging.getLogger(__name__)

CHUNK_SIZE = 30

try:
    from youtube_transcript_api import YouTubeTranscriptApi as _YTAPI
    HAS_TRANSCRIPT_API = True
except ImportError:
    _YTAPI = None
    HAS_TRANSCRIPT_API = False
    log.warning("youtube-transcript-api not installed — transcript fetching disabled")


def fetch_transcript(video_id: str) -> list[dict[str, Any]] | None:
    """Fetch raw transcript for a video ID. Returns list of {text, start, duration} or None."""
    if not HAS_TRANSCRIPT_API:
        return None
    try:
        transcript = _YTAPI.get_transcript(video_id, languages=("fr", "en"))
        return transcript
    except Exception as e:
        log.info("Transcript unavailable for %s: %s", video_id, e)
        return None


def chunk_transcript(transcript: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Group transcript segments into chunks of ~CHUNK_SIZE lines."""
    chunks: list[dict[str, Any]] = []
    buffer: list[str] = []
    start_time = 0.0
    for i, seg in enumerate(transcript):
        text = seg.get("text", "").strip()
        if not text:
            continue
        if not buffer:
            start_time = seg.get("start", 0.0)
        buffer.append(text)
        if len(buffer) >= CHUNK_SIZE or i == len(transcript) - 1:
            chunks.append({
                "text": " ".join(buffer),
                "start": start_time,
                "end": seg.get("start", 0.0) + seg.get("duration", 0.0),
            })
            buffer = []
    if buffer:
        chunks.append({"text": " ".join(buffer), "start": start_time, "end": transcript[-1]["start"] + transcript[-1]["duration"]})
    return chunks
