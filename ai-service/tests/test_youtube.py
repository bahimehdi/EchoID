import pytest
from unittest.mock import patch, MagicMock

import youtube as yt


class TestParseIso8601:
    def test_full_duration(self):
        assert yt.parse_iso8601("PT1H2M3S") == 3723

    def test_minutes_seconds(self):
        assert yt.parse_iso8601("PT10M12S") == 612

    def test_hours_only(self):
        assert yt.parse_iso8601("PT2H") == 7200

    def test_seconds_only(self):
        assert yt.parse_iso8601("PT45S") == 45

    def test_empty_string(self):
        assert yt.parse_iso8601("") == 0

    def test_none(self):
        assert yt.parse_iso8601(None) == 0

    def test_malformed(self):
        assert yt.parse_iso8601("not-a-duration") == 0


class TestRelevanceScore:
    def test_zero_views(self):
        assert yt.relevance_score(0, 0) == 0.5

    def test_negative_views(self):
        assert yt.relevance_score(-5, 0) == 0.5

    def test_high_like_rate(self):
        score = yt.relevance_score(1000, 100)
        assert 0.0 < score <= 1.0

    def test_low_engagement(self):
        score = yt.relevance_score(10000000, 1)
        assert score > 0.0

    def test_exact_values(self):
        score = yt.relevance_score(100, 10)
        assert isinstance(score, float)
        assert score >= 0.0


class TestSearchVideoIds:
    def test_empty_api_key(self):
        assert yt.search_video_ids("", "query") == []

    def test_blank_api_key(self):
        assert yt.search_video_ids("   ", "thermodynamique") == []

    def test_empty_query(self):
        assert yt.search_video_ids("key", "") == []

    @patch("youtube.httpx.get")
    def test_successful_search(self, mock_get):
        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "items": [
                    {"id": {"videoId": "abc123"}},
                    {"id": {"videoId": "def456"}},
                ]
            },
        )
        ids = yt.search_video_ids("fake-key", "thermodynamique")
        assert ids == ["abc123", "def456"]

    @patch("youtube.httpx.get")
    def test_non_200(self, mock_get):
        mock_get.return_value = MagicMock(status_code=403, text=lambda: "Forbidden")
        ids = yt.search_video_ids("fake-key", "query")
        assert ids == []

    @patch("youtube.httpx.get")
    def test_no_items(self, mock_get):
        mock_get.return_value = MagicMock(status_code=200, json=lambda: {"items": []})
        ids = yt.search_video_ids("fake-key", "query")
        assert ids == []

    @patch("youtube.httpx.get")
    def test_missing_video_id(self, mock_get):
        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: {"items": [{"id": {"channelId": "ch123"}}]},
        )
        ids = yt.search_video_ids("fake-key", "query")
        assert ids == []

    @patch("youtube.httpx.get")
    def test_http_error(self, mock_get):
        mock_get.side_effect = Exception("Network error")
        ids = yt.search_video_ids("fake-key", "query")
        assert ids == []


class TestFetchMetadata:
    def test_empty_api_key(self):
        assert yt.fetch_metadata("", ["abc"]) == {}

    def test_empty_ids(self):
        assert yt.fetch_metadata("key", []) == {}

    @patch("youtube.httpx.get")
    def test_successful_fetch(self, mock_get):
        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "items": [
                    {
                        "id": "abc123",
                        "snippet": {"title": "Video Title", "channelTitle": "Channel"},
                        "contentDetails": {"duration": "PT10M"},
                        "statistics": {"viewCount": "5000", "likeCount": "200"},
                    }
                ]
            },
        )
        result = yt.fetch_metadata("fake-key", ["abc123"])
        assert "abc123" in result
        assert result["abc123"]["title"] == "Video Title"
        assert result["abc123"]["channel"] == "Channel"
        assert result["abc123"]["durationSec"] == 600
        assert result["abc123"]["viewCount"] == 5000
        assert result["abc123"]["likeCount"] == 200
        assert "score" in result["abc123"]

    @patch("youtube.httpx.get")
    def test_non_200(self, mock_get):
        mock_get.return_value = MagicMock(status_code=403, text=lambda: "Forbidden")
        result = yt.fetch_metadata("fake-key", ["abc"])
        assert result == {}

    @patch("youtube.httpx.get")
    def test_missing_statistics(self, mock_get):
        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "items": [
                    {
                        "id": "abc123",
                        "snippet": {"title": "Title", "channelTitle": "Chan"},
                        "contentDetails": {"duration": "PT5M"},
                    }
                ]
            },
        )
        result = yt.fetch_metadata("fake-key", ["abc123"])
        assert result["abc123"]["viewCount"] == 0

    @patch("youtube.httpx.get")
    def test_http_exception(self, mock_get):
        mock_get.side_effect = Exception("Timeout")
        result = yt.fetch_metadata("fake-key", ["abc"])
        assert result == {}
