from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    port: int = 8000
    # When empty or missing, features fall back gracefully (no search results,
    # fallback explanation, empty OCR) instead of crashing.
    llm_api_key: str = ""
    google_api_key: str = ""
    youtube_api_key: str = ""
    ocr_language_hint: str = "fr"
    backend_url: str = "http://backend:8080"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
