from __future__ import annotations
import logging
from fastapi import APIRouter
from pydantic import BaseModel

import youtube as yt
import transcript as tr
import ranker
from settings import get_settings

log = logging.getLogger(__name__)
router = APIRouter()

_CACHE: dict[str, list["Video"]] = {}

FRENCH_STOP: set[str] = {
    "le", "la", "les", "de", "des", "du", "un", "une", "dans", "pour",
    "sur", "avec", "par", "est", "sont", "pas", "que", "qui", "quoi",
    "dont", "ou", "où", "mais", "donc", "car", "ni", "ce", "cet",
    "cette", "ces", "mon", "ton", "son", "mes", "tes", "ses", "nos",
    "nos", "vos", "leurs", "au", "aux", "en", "y", "à", "et", "se",
    "si", "s", "il", "elle", "on", "nous", "vous", "ils", "elles",
    "je", "tu", "ne", "n", "plus", "moins", "très", "peu", "tout",
    "tous", "toutes", "chaque", "certain", "comme", "quand", "alors",
    "après", "avant", "depuis", "pendant", "sans", "sous", "entre",
    "chez", "faire", "fait", "peut", "peuvent", "doit", "doivent",
    "être", "avoir", "aller", "dire", "voir", "savoir", "pouvoir",
    "vouloir", "devoir", "falloir", "même", "aussi", "bien", "mal",
    "non", "oui", "merci",
}


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
    transcriptScore: float | None = None
    matchedExcerpt: str | None = None


class VideoSearchResponse(BaseModel):
    conceptSlug: str
    videos: list[Video]
    method: str = "transcript_semantic"


def _readable_query(slug: str) -> str:
    """Convert a concept slug into a readable French search query."""
    mapping: dict[str, str] = {
        "thermo-1er-principe": "thermodynamique premier principe cours",
        "algebre-diagonalisation": "diagonalisation matrice algèbre linéaire",
        "analyse-limites": "limites continuité analyse mathématique",
        "analyse-series": "séries numériques convergence analyse",
        "chimie-equilibre": "équilibres chimiques réaction chimique",
        "electronique-amplificateur-op": "amplificateur opérationnel montages électronique",
        "electrostatique-gauss": "théorème de Gauss électrostatique",
        "mecanique-newton": "lois de Newton mécanique classique",
        "optique-lentilles-minces": "lentilles minces optique géométrique",
        "proba-bayes": "théorème de Bayes probabilités",
        "signal-fourier": "transformée de Fourier traitement du signal",
        "algo-recursivite": "récursivité algorithmique programmation Python",
    }
    return mapping.get(slug, slug.replace("-", " "))


def _score_video(query: str, video_id: str) -> tuple[float, str | None]:
    """Fetch transcript, chunk it, rank against query, return (best_score, excerpt)."""
    raw = tr.fetch_transcript(video_id)
    if not raw:
        return 0.0, None
    chunks = tr.chunk_transcript(raw)
    ranked = ranker.rank_chunks(query, chunks)
    if not ranked or ranked[0]["score"] == 0.0:
        return 0.0, None
    best = ranked[0]
    excerpt = best["text"][:300]
    return best["score"], excerpt


@router.post("/search", response_model=VideoSearchResponse)
def search_videos(req: VideoSearchRequest) -> VideoSearchResponse:
    """Real YouTube search + transcript-based semantic matching.
    For each candidate video, fetches the transcript (French first, English fallback),
    chunks it, and scores each chunk against the concept query via TF-IDF cosine
    similarity. Returns videos sorted by transcript relevance."""
    cached = _CACHE.get(req.conceptSlug)
    if cached is not None:
        return VideoSearchResponse(conceptSlug=req.conceptSlug, videos=cached)

    settings = get_settings()
    api_key = settings.youtube_api_key
    query = _readable_query(req.conceptSlug)

    ids = yt.search_video_ids(api_key, query, max_results=5) if api_key else []
    if not ids:
        return VideoSearchResponse(
            conceptSlug=req.conceptSlug,
            videos=[],
            method="no_api_key",
        )

    meta = yt.fetch_metadata(api_key, ids) if api_key else {}

    scored: list[tuple[float, Video]] = []
    for video_id in ids:
        md = meta.get(video_id, {}) if video_id else {}
        title = md.get("title", "") or "Vidéo YouTube"
        channel = md.get("channel", "") or ""
        score, excerpt = _score_video(query, video_id)

        v = Video(
            title=title,
            channel=channel,
            url=f"https://www.youtube.com/watch?v={video_id}",
            videoId=video_id,
            thumbnailUrl=f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
            durationSec=md.get("durationSec"),
            viewCount=md.get("viewCount"),
            likeCount=md.get("likeCount"),
            transcriptScore=score,
            matchedExcerpt=excerpt,
        )
        scored.append((score, v))

    scored.sort(key=lambda x: -x[0])
    videos = [v for _, v in scored]
    _CACHE[req.conceptSlug] = videos

    return VideoSearchResponse(conceptSlug=req.conceptSlug, videos=videos)
