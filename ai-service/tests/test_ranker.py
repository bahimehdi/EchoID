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
        with patch("ranker.HAS_SKLEARN", True), \
             patch("ranker.TfidfVectorizer"), \
             patch("ranker.cosine_similarity") as mock_cos:
            mock_cos.return_value = [[0.9, 0.1]]
            result = ranker.rank_chunks("python programming", chunks)
        assert result[0]["score"] >= result[1]["score"]

    @patch("ranker.TfidfVectorizer")
    @patch("ranker.cosine_similarity")
    def test_tfidf_exception(self, mock_cos, mock_vec):
        mock_vec.side_effect = Exception("TF-IDF failed")
        chunks = [{"text": "hello world"}]
        result = ranker.rank_chunks("test query", chunks)
        assert result[0]["score"] == 0.0


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
