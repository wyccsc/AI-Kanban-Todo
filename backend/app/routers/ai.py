import logging

from fastapi import APIRouter, Depends

from app.config import Settings, get_settings
from app.dependencies import get_breakdown_service, get_ollama_service
from app.exceptions import OllamaModelNotFoundError
from app.schemas.breakdown import BreakdownRequest, SubTaskItem
from app.services.breakdown_service import BreakdownService
from app.services.ollama_service import OllamaService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/breakdown", response_model=list[SubTaskItem])
async def ai_breakdown(
    payload: BreakdownRequest,
    settings: Settings = Depends(get_settings),
    ollama: OllamaService = Depends(get_ollama_service),
    service: BreakdownService = Depends(get_breakdown_service),
) -> list[SubTaskItem]:
    logger.info("AI breakdown requested, length=%s", len(payload.description))

    if not await ollama.is_model_available():
        raise OllamaModelNotFoundError(settings.ollama_model)

    return await service.breakdown(payload.description)
