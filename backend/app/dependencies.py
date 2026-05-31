from functools import lru_cache

from app.config import get_settings
from app.services.breakdown_service import BreakdownService
from app.services.ollama_service import OllamaService


@lru_cache
def get_ollama_service() -> OllamaService:
    return OllamaService(get_settings())


@lru_cache
def get_breakdown_service() -> BreakdownService:
    return BreakdownService(get_ollama_service(), get_settings())
