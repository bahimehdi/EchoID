import pytest
from unittest.mock import patch, MagicMock

import transcript as tr


class TestFetchTranscript:
    def test_youtube_transcript_api_import_error(self):
        import builtins
        import importlib
        import sys as _sys
        import transcript as _tr
        orig_import = builtins.__import__
        saved = {k: _sys.modules.pop(k) for k in list(_sys.modules) if "youtube_transcript_api" in k}

        def _import(name, *a, **kw):
            if "youtube_transcript_api" in name:
                raise ImportError(f"No module named {name}")
            return orig_import(name, *a, **kw)

        try:
            with patch("builtins.__import__", side_effect=_import):
                importlib.reload(_tr)
            assert _tr.HAS_TRANSCRIPT_API is False
            assert _tr.fetch_transcript("abc123") is None
        finally:
            _sys.modules.update(saved)
            importlib.reload(_tr)

    @patch("transcript.HAS_TRANSCRIPT_API", False)
    def test_api_not_available(self):
        result = tr.fetch_transcript("abc123")
        assert result is None

    @patch("transcript.HAS_TRANSCRIPT_API", True)
    @patch("transcript._YTAPI")
    def test_successful_fetch(self, mock_api):
        mock_api.get_transcript.return_value = [
            {"text": "Hello", "start": 0.0, "duration": 1.0},
            {"text": "World", "start": 1.0, "duration": 1.0},
        ]
        result = tr.fetch_transcript("abc123")
        assert result == [
            {"text": "Hello", "start": 0.0, "duration": 1.0},
            {"text": "World", "start": 1.0, "duration": 1.0},
        ]
        mock_api.get_transcript.assert_called_once_with("abc123", languages=("fr", "en"))

    @patch("transcript.HAS_TRANSCRIPT_API", True)
    @patch("transcript._YTAPI")
    def test_exception_during_fetch(self, mock_api):
        mock_api.get_transcript.side_effect = Exception("Transcripts disabled")
        result = tr.fetch_transcript("abc123")
        assert result is None

    @patch("transcript.HAS_TRANSCRIPT_API", True)
    @patch("transcript._YTAPI")
    def test_no_transcript_available(self, mock_api):
        mock_api.get_transcript.side_effect = Exception("No transcript found")
        result = tr.fetch_transcript("abc123")
        assert result is None


class TestChunkTranscript:
    def test_empty_transcript(self):
        assert tr.chunk_transcript([]) == []

    def test_single_chunk_when_below_chunk_size(self):
        transcript = [
            {"text": "Line 1", "start": 0.0, "duration": 1.0},
            {"text": "Line 2", "start": 1.0, "duration": 1.0},
        ]
        chunks = tr.chunk_transcript(transcript)
        assert len(chunks) == 1
        assert chunks[0]["text"] == "Line 1 Line 2"
        assert chunks[0]["start"] == 0.0
        assert chunks[0]["end"] == 2.0

    def test_exact_chunk_size(self):
        lines = [{"text": f"Line {i}", "start": float(i), "duration": 1.0} for i in range(30)]
        chunks = tr.chunk_transcript(lines)
        assert len(chunks) == 1
        assert "Line 0" in chunks[0]["text"]
        assert "Line 29" in chunks[0]["text"]

    def test_two_chunks(self):
        lines = [{"text": f"Line {i}", "start": float(i), "duration": 1.0} for i in range(31)]
        chunks = tr.chunk_transcript(lines)
        assert len(chunks) == 2
        assert chunks[0]["start"] == 0.0
        assert chunks[1]["start"] == 30.0

    def test_empty_text_lines(self):
        transcript = [
            {"text": "Visible", "start": 0.0, "duration": 1.0},
            {"text": "", "start": 1.0, "duration": 1.0},
            {"text": "  ", "start": 2.0, "duration": 1.0},
        ]
        chunks = tr.chunk_transcript(transcript)
        assert len(chunks) == 1
        assert chunks[0]["text"] == "Visible"
