from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "AI Kanban Todo API"
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:3000,http://localhost"

    data_dir: str = "./data"

    ollama_base_url: str = "http://ollama:11434"
    ollama_model: str = "llama3.2:3b"
    ollama_timeout_seconds: float = 120.0
    ollama_chat_path: str = "/api/chat"

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]

    @property
    def ollama_chat_url(self) -> str:
        base = self.ollama_base_url.rstrip("/")
        path = (
            self.ollama_chat_path
            if self.ollama_chat_path.startswith("/")
            else f"/{self.ollama_chat_path}"
        )
        return f"{base}{path}"


@lru_cache
def get_settings() -> Settings:
    return Settings()
