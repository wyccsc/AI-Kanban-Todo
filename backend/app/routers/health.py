import logging

from fastapi import APIRouter, Depends

from app.config import Settings, get_settings
from app.dependencies import get_ollama_service
from app.schemas.breakdown import HealthResponse
from app.services.ollama_service import OllamaService

logger = logging.getLogger(__name__)
router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check(
    settings: Settings = Depends(get_settings),
    ollama: OllamaService = Depends(get_ollama_service),
) -> HealthResponse:
    reachable = await ollama.check_health()
    model_ready = await ollama.is_model_available() if reachable else False
    status = "ok" if reachable and model_ready else "degraded"

    return HealthResponse(
        status=status,
        service=settings.app_name,
        ollama_reachable=reachable,
        ollama_model=settings.ollama_model,
        ollama_model_ready=model_ready,
    )
