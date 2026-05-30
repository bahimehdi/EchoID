import pytest
from unittest.mock import patch, MagicMock

from ocr import _index_concepts, ALLOWED_EXTENSIONS


class TestIndexConcepts:
    def test_empty_text(self):
        assert _index_concepts("") == []

    def test_single_concept_match(self):
        concepts = _index_concepts("étude des matrices et diagonalisation")
        assert "algèbre linéaire" in concepts
        assert len(concepts) == 1

    def test_multiple_concepts(self):
        concepts = _index_concepts("thermodynamique et matrices")
        assert "thermodynamique" in concepts
        assert "algèbre linéaire" in concepts

    def test_no_match(self):
        concepts = _index_concepts("recette de cuisine")
        assert concepts == []

    def test_case_insensitive(self):
        concepts = _index_concepts("MATRICES")
        assert "algèbre linéaire" in concepts

    def test_keyword_substring_match(self):
        concepts = _index_concepts("étude de la récursivité en Python")
        assert "algorithmique" in concepts

    def test_concept_with_special_chars(self):
        concepts = _index_concepts("équilibre chimique pH")
        assert "chimie" in concepts


class TestOcrEndpoint:
    @pytest.mark.asyncio
    async def test_no_file(self, client):
        async with client as ac:
            r = await ac.post("/ocr/process-notes")
        assert r.status_code == 422

    @pytest.mark.asyncio
    async def test_empty_filename(self, client):
        async with client as ac:
            r = await ac.post("/ocr/process-notes", files={"file": ("", b"data", "image/png")})
        assert r.status_code == 422

    @pytest.mark.asyncio
    async def test_unsupported_extension(self, client):
        async with client as ac:
            r = await ac.post("/ocr/process-notes", files={"file": ("doc.txt", b"data", "text/plain")})
        assert r.status_code == 400
        assert "Format non supporté" in r.json()["detail"]

    def test_supported_extensions_listed(self):
        assert ".pdf" in ALLOWED_EXTENSIONS
        assert ".png" in ALLOWED_EXTENSIONS
        assert ".jpg" in ALLOWED_EXTENSIONS
        assert ".jpeg" in ALLOWED_EXTENSIONS
        assert ".tiff" in ALLOWED_EXTENSIONS
        assert ".bmp" in ALLOWED_EXTENSIONS


class TestOcrImage:
    @patch("pytesseract.image_to_string")
    @patch("pytesseract.image_to_data")
    @patch("PIL.Image.open")
    def test_success(self, mock_img_open, mock_img_data, mock_img_str):
        mock_img_str.return_value = "extracted text from image"
        mock_img_data.return_value = {"conf": [95, 85, 90]}
        from ocr import _ocr_image
        text, conf = _ocr_image("fake.png", "fra")
        assert text == "extracted text from image"
        assert conf == pytest.approx(0.9, abs=0.01)

    @patch("pytesseract.image_to_string")
    @patch("PIL.Image.open")
    def test_exception(self, mock_img_open, mock_img_str):
        mock_img_str.side_effect = Exception("OCR failed")
        from ocr import _ocr_image
        text, conf = _ocr_image("fake.png", "fra")
        assert text == ""
        assert conf == 0.0

    @patch("pytesseract.image_to_string")
    @patch("pytesseract.image_to_data")
    @patch("PIL.Image.open")
    def test_empty_confidence(self, mock_img_open, mock_img_data, mock_img_str):
        mock_img_str.return_value = "some text"
        mock_img_data.return_value = {"conf": []}
        from ocr import _ocr_image
        text, conf = _ocr_image("fake.png", "fra")
        assert text == "some text"
        assert conf == 0.0


class TestOcrPdf:
    @patch("ocr.os.unlink")
    @patch("tempfile.NamedTemporaryFile")
    @patch("ocr._ocr_image")
    @patch("fitz.open")
    def test_single_page(self, mock_fitz_open, mock_ocr_img, mock_temp, mock_unlink):
        mock_doc = MagicMock()
        mock_doc.__len__.return_value = 1
        mock_page = MagicMock()
        mock_doc.__getitem__.return_value = mock_page
        mock_pix = MagicMock()
        mock_page.get_pixmap.return_value = mock_pix
        mock_fitz_open.return_value = mock_doc
        mock_temp.return_value.name = "tmp.png"
        mock_ocr_img.return_value = ("page text", 0.95)

        from ocr import _ocr_pdf
        text, conf, pages = _ocr_pdf("fake.pdf", "fra")
        assert "page text" in text
        assert conf == 0.95
        assert pages == 1

    @patch("ocr._ocr_image")
    @patch("fitz.open")
    def test_empty_pages(self, mock_fitz_open, mock_ocr_img):
        mock_doc = MagicMock()
        mock_doc.__len__.return_value = 0
        mock_fitz_open.return_value = mock_doc
        mock_ocr_img.return_value = ("", 0.0)

        from ocr import _ocr_pdf
        text, conf, pages = _ocr_pdf("fake.pdf", "fra")
        assert text == ""
        assert conf == 0.0
        assert pages == 0
