from pydantic import BaseModel, Field


class BreakdownRequest(BaseModel):
    description: str = Field(..., min_length=1, max_length=8000)


class SubTaskItem(BaseModel):
    id: int = Field(..., ge=1)
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field(default="", max_length=1000)


class HealthResponse(BaseModel):
    status: str
    service: str
    ollama_reachable: bool
    ollama_model: str
    ollama_model_ready: bool
