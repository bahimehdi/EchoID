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
    def test_pytesseract_import_error(self):
        import builtins
        import sys as _sys
        orig_import = builtins.__import__
        saved_pyt = _sys.modules.pop("pytesseract", None)
        saved_pil = _sys.modules.pop("PIL", None)

        def _import(name, *a, **kw):
            if name in ("pytesseract", "PIL"):
                raise ImportError(f"No module named {name}")
            return orig_import(name, *a, **kw)

        try:
            with patch("builtins.__import__", side_effect=_import):
                from ocr import _ocr_image
                text, conf = _ocr_image("fake.png", "fra")
            assert text == ""
            assert conf == 0.0
        finally:
            if saved_pyt is not None:
                _sys.modules["pytesseract"] = saved_pyt
            if saved_pil is not None:
                _sys.modules["PIL"] = saved_pil

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
    def test_fitz_import_error(self):
        import builtins
        import sys as _sys
        orig_import = builtins.__import__
        saved_fitz = _sys.modules.pop("fitz", None)

        def _import(name, *a, **kw):
            if name == "fitz":
                raise ImportError("No module named fitz")
            return orig_import(name, *a, **kw)

        try:
            with patch("builtins.__import__", side_effect=_import):
                from ocr import _ocr_pdf
                text, conf, pages = _ocr_pdf("fake.pdf", "fra")
            assert text == ""
            assert conf == 0.0
            assert pages == 0
        finally:
            if saved_fitz is not None:
                _sys.modules["fitz"] = saved_fitz


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


class TestOcrEndpointProcess:
    @pytest.mark.asyncio
    @patch("ocr._ocr_image", return_value=("texte extrait", 0.85))
    async def test_image_file_success(self, mock_ocr, client):
        async with client as ac:
            r = await ac.post(
                "/ocr/process-notes",
                files={"file": ("note.png", b"fake", "image/png")},
            )
        assert r.status_code == 200
        data = r.json()
        assert data["extractedText"] == "texte extrait"
        assert data["confidence"] == 0.85
        assert data["ocrStatus"] == "OK"
        assert data["pageCount"] == 1
        assert "processingMs" in data

    @pytest.mark.asyncio
    @patch("ocr._ocr_image", return_value=("", 0.0))
    async def test_image_file_failed(self, mock_ocr, client):
        async with client as ac:
            r = await ac.post(
                "/ocr/process-notes",
                files={"file": ("blank.png", b"fake", "image/png")},
            )
        assert r.status_code == 200
        data = r.json()
        assert data["extractedText"] == "(Aucun texte détecté)"
        assert data["ocrStatus"] == "FAILED"

    @pytest.mark.asyncio
    @patch("ocr._ocr_pdf", return_value=("pdf text", 0.92, 3))
    async def test_pdf_file_success(self, mock_ocr, client):
        async with client as ac:
            r = await ac.post(
                "/ocr/process-notes",
                files={"file": ("notes.pdf", b"fake", "application/pdf")},
            )
        assert r.status_code == 200
        data = r.json()
        assert data["extractedText"] == "pdf text"
        assert data["pageCount"] == 3
        assert data["confidence"] == 0.92
        assert data["ocrStatus"] == "OK"

    @pytest.mark.asyncio
    @patch("ocr._ocr_image", side_effect=Exception("processing failed"))
    async def test_processing_error(self, mock_ocr, client):
        async with client as ac:
            r = await ac.post(
                "/ocr/process-notes",
                files={"file": ("bad.png", b"fake", "image/png")},
            )
        assert r.status_code == 500
        assert "Erreur" in r.json()["detail"]
