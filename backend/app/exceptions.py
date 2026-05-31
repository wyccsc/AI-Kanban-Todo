class AppError(Exception):
    def __init__(self, message: str, status_code: int = 500) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class OllamaConnectionError(AppError):
    def __init__(self, message: str = "Unable to connect to Ollama") -> None:
        super().__init__(message, status_code=503)


class OllamaTimeoutError(AppError):
    def __init__(self, message: str = "Ollama request timed out") -> None:
        super().__init__(message, status_code=504)


class OllamaResponseError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__(message, status_code=502)


class OllamaParseError(AppError):
    def __init__(
        self, message: str = "Failed to parse Ollama response as JSON array"
    ) -> None:
        super().__init__(message, status_code=422)


class OllamaModelNotFoundError(AppError):
    def __init__(self, model: str) -> None:
        super().__init__(
            f"Ollama 模型「{model}」尚未下載。請執行："
            f" docker exec -it ai-kanban-ollama ollama pull {model}",
            status_code=503,
        )
