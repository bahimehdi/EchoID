from __future__ import annotations

import logging
from typing import Any

log = logging.getLogger(__name__)

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    HAS_SKLEARN = True
except ImportError:
    TfidfVectorizer = None
    cosine_similarity = None
    HAS_SKLEARN = False
    log.warning("scikit-learn not installed — transcript ranking disabled")


def rank_chunks(query: str, chunks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Score each transcript chunk by cosine similarity against the query.
    Returns chunks sorted descending by score, with a `score` key added."""
    if not HAS_SKLEARN or not query.strip() or not chunks:
        for c in chunks:
            c["score"] = 0.0
        return chunks

    texts = [c["text"] for c in chunks]
    corpus = [query] + texts
    try:
        vec = TfidfVectorizer(stop_words="french", max_features=5000, ngram_range=(1, 2))
        tfidf = vec.fit_transform(corpus)
        sims = cosine_similarity(tfidf[0:1], tfidf[1:]).flatten()
    except Exception as e:
        log.warning("TF-IDF ranking failed: %s", e)
        for c in chunks:
            c["score"] = 0.0
        return chunks

    for chunk, score in zip(chunks, sims):
        chunk["score"] = round(float(score), 4)
    chunks.sort(key=lambda c: -c["score"])
    return chunks


def best_score(chunks: list[dict[str, Any]]) -> float:
    return max((c["score"] for c in chunks), default=0.0)
