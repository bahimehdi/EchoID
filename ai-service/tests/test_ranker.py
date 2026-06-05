import pytest
from unittest.mock import patch, MagicMock

import ranker


class TestRankChunks:
    def test_empty_query(self):
        chunks = [{"text": "hello world"}]
        result = ranker.rank_chunks("", chunks)
        assert all(c["score"] == 0.0 for c in result)

    def test_empty_chunks(self):
        result = ranker.rank_chunks("query", [])
        assert result == []

    def test_no_sklearn(self):
        chunks = [{"text": "hello world"}]
        with patch("ranker.HAS_SKLEARN", False):
            result = ranker.rank_chunks("test query", chunks)
        assert result[0]["score"] == 0.0

    def test_sklearn_import_failure(self):
        chunks = [{"text": "hello world"}]
        ranker.HAS_SKLEARN = False
        result = ranker.rank_chunks("test query", chunks)
        assert result[0]["score"] == 0.0
        ranker.HAS_SKLEARN = True

    def test_sort_descending_by_score(self):
        chunks = [{"text": "python programming loops"}, {"text": "irrelevant text here"}]
        mock_sims = MagicMock()
        mock_sims.flatten.return_value = [0.9, 0.1]
        with patch("ranker.HAS_SKLEARN", True), \
             patch("ranker.TfidfVectorizer"), \
             patch("ranker.cosine_similarity", return_value=mock_sims):
            result = ranker.rank_chunks("python programming", chunks)
        assert result[0]["score"] == 0.9
        assert result[1]["score"] == 0.1

    @patch("ranker.TfidfVectorizer")
    @patch("ranker.cosine_similarity")
    def test_tfidf_exception(self, mock_cos, mock_vec):
        mock_vec.side_effect = Exception("TF-IDF failed")
        chunks = [{"text": "hello world"}]
        result = ranker.rank_chunks("test query", chunks)
        assert result[0]["score"] == 0.0


    def test_scored_chunks_respect_scores(self):
        chunks = [{"text": "a"}, {"text": "b"}]
        mock_sims = MagicMock()
        mock_sims.flatten.return_value = [0.3, 0.7]
        with patch("ranker.HAS_SKLEARN", True), \
             patch("ranker.TfidfVectorizer"), \
             patch("ranker.cosine_similarity", return_value=mock_sims):
            result = ranker.rank_chunks("test", chunks)
        assert result[0]["text"] == "b"
        assert result[0]["score"] == 0.7
        assert result[1]["text"] == "a"
        assert result[1]["score"] == 0.3


class TestImportError:
    def test_sklearn_import_error(self):
        import builtins
        import importlib
        import sys as _sys
        orig_import = builtins.__import__
        saved = {}
        for k in list(_sys.modules):
            if "sklearn" in k:
                saved[k] = _sys.modules.pop(k)

        def _import(name, *a, **kw):
            if "sklearn" in name:
                raise ImportError(f"No module named {name}")
            return orig_import(name, *a, **kw)

        try:
            with patch("builtins.__import__", side_effect=_import):
                import ranker as _r
                importlib.reload(_r)
            assert _r.HAS_SKLEARN is False
        finally:
            _sys.modules.update(saved)
            import ranker
            importlib.reload(ranker)


class TestBestScore:
    def test_empty_list(self):
        assert ranker.best_score([]) == 0.0

    def test_single_chunk(self):
        chunks = [{"text": "hello", "score": 0.5}]
        assert ranker.best_score(chunks) == 0.5

    def test_multiple_chunks(self):
        chunks = [{"text": "a", "score": 0.1}, {"text": "b", "score": 0.9}]
        assert ranker.best_score(chunks) == 0.9

    def test_all_zero_scores(self):
        chunks = [{"text": "a", "score": 0.0}, {"text": "b", "score": 0.0}]
        assert ranker.best_score(chunks) == 0.0
