import pytest
from unittest.mock import patch, MagicMock

import videos


class TestReadableQuery:
    def test_known_slug(self):
        assert videos._readable_query("thermo-1er-principe") == "thermodynamique premier principe cours"
        assert videos._readable_query("algebre-diagonalisation") == "diagonalisation matrice algèbre linéaire"
        assert videos._readable_query("analyse-limites") == "limites continuité analyse mathématique"

    def test_unknown_slug(self):
        result = videos._readable_query("some-unknown-slug")
        assert result == "some unknown slug"


class TestScoreVideo:
    @patch("videos.tr.fetch_transcript")
    @patch("videos.tr.chunk_transcript")
    @patch("videos.ranker.rank_chunks")
    def test_best_chunk_returned(self, mock_rank, mock_chunk, mock_fetch):
        mock_fetch.return_value = [{"text": "hello", "start": 0.0, "duration": 1.0}]
        mock_chunk.return_value = [{"text": "hello chunked", "start": 0.0, "end": 1.0}]
        mock_rank.return_value = [
            {"text": "hello chunked", "score": 0.85},
        ]
        score, excerpt = videos._score_video("thermodynamique", "abc123")
        assert score == 0.85
        assert "hello chunked" in excerpt

    @patch("videos.tr.fetch_transcript")
    def test_no_transcript(self, mock_fetch):
        mock_fetch.return_value = None
        score, excerpt = videos._score_video("thermodynamique", "abc123")
        assert score == 0.0
        assert excerpt is None

    @patch("videos.tr.fetch_transcript")
    @patch("videos.tr.chunk_transcript")
    @patch("videos.ranker.rank_chunks")
    def test_zero_score(self, mock_rank, mock_chunk, mock_fetch):
        mock_fetch.return_value = [{"text": "hello", "start": 0.0, "duration": 1.0}]
        mock_chunk.return_value = [{"text": "hello chunked", "start": 0.0, "end": 1.0}]
        mock_rank.return_value = [{"text": "hello chunked", "score": 0.0}]
        score, excerpt = videos._score_video("thermodynamique", "abc123")
        assert score == 0.0
        assert excerpt is None


class TestSearchEndpoint:
    @patch("videos.yt.search_video_ids")
    @patch("videos.yt.fetch_metadata")
    @patch("videos._score_video")
    def test_no_api_key(self, mock_score, mock_fetch, mock_search):
        mock_search.return_value = []
        with patch("videos.get_settings") as mock_settings:
            mock_settings.return_value.youtube_api_key = ""
            from videos import VideoSearchRequest
            req = VideoSearchRequest(conceptSlug="thermo-1er-principe")
            resp = videos.search_videos(req)
        assert resp.conceptSlug == "thermo-1er-principe"
        assert resp.videos == []
        assert resp.method == "no_api_key"

    @patch("videos.yt.search_video_ids")
    @patch("videos.yt.fetch_metadata")
    @patch("videos._score_video")
    def test_cache_hit(self, mock_score, mock_fetch, mock_search):
        from videos import Video
        videos._CACHE["cached-slug"] = [
            Video(title="Cached", channel="YT", url="http://example.com", videoId="x", thumbnailUrl="x.jpg")
        ]
        try:
            from videos import VideoSearchRequest
            req = VideoSearchRequest(conceptSlug="cached-slug")
            resp = videos.search_videos(req)
            assert len(resp.videos) == 1
            assert resp.videos[0].title == "Cached"
        finally:
            videos._CACHE.clear()

    @patch("videos.yt.search_video_ids")
    @patch("videos.yt.fetch_metadata")
    @patch("videos._score_video")
    def test_results_sorted_by_score(self, mock_score, mock_fetch, mock_search):
        mock_search.return_value = ["id1", "id2"]
        mock_fetch.return_value = {
            "id1": {"title": "A", "channel": "Ch", "durationSec": 100, "viewCount": 10, "likeCount": 1},
            "id2": {"title": "B", "channel": "Ch", "durationSec": 200, "viewCount": 20, "likeCount": 2},
        }
        mock_score.side_effect = [(0.3, "excerpt a"), (0.9, "excerpt b")]
        with patch("videos.get_settings") as mock_settings:
            mock_settings.return_value.youtube_api_key = "fake-key"
            from videos import VideoSearchRequest
            req = VideoSearchRequest(conceptSlug="thermo-1er-principe")
            resp = videos.search_videos(req)
        assert len(resp.videos) == 2
        assert resp.videos[0].title == "B"
        assert resp.videos[1].title == "A"
        videos._CACHE.clear()

    def test_french_stop_words_defined(self):
        assert isinstance(videos.FRENCH_STOP, set)
        assert len(videos.FRENCH_STOP) > 0
