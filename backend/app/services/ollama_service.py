import ast
import json
import logging
import re
from typing import Any

import httpx

from app.config import Settings
from app.exceptions import (
    OllamaConnectionError,
    OllamaModelNotFoundError,
    OllamaResponseError,
    OllamaTimeoutError,
)

logger = logging.getLogger(__name__)


class OllamaService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._chat_url = settings.ollama_chat_url
        self._model = settings.ollama_model
        self._timeout = settings.ollama_timeout_seconds

    async def check_health(self) -> bool:
        tags_url = f"{self._settings.ollama_base_url.rstrip('/')}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(tags_url)
                return response.status_code == 200
        except httpx.HTTPError as exc:
            logger.warning("Ollama health check failed: %s", exc)
            return False

    async def is_model_available(self) -> bool:
        tags_url = f"{self._settings.ollama_base_url.rstrip('/')}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(tags_url)
                if response.status_code != 200:
                    return False
                data = response.json()
        except httpx.HTTPError as exc:
            logger.warning("Ollama model check failed: %s", exc)
            return False

        target = self._model
        for item in data.get("models", []):
            if not isinstance(item, dict):
                continue
            name = item.get("name", "")
            if name == target or name.startswith(f"{target}:"):
                return True
        return False

    async def chat(self, user_content: str) -> str:
        payload = {
            "model": self._model,
            "messages": [{"role": "user", "content": user_content}],
            "stream": False,
        }

        logger.info("Ollama chat model=%s url=%s", self._model, self._chat_url)

        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.post(self._chat_url, json=payload)
        except httpx.TimeoutException as exc:
            raise OllamaTimeoutError() from exc
        except httpx.RequestError as exc:
            raise OllamaConnectionError(str(exc)) from exc

        if response.status_code >= 400:
            body = response.text[:500]
            if response.status_code == 404 and "not found" in body.lower():
                raise OllamaModelNotFoundError(self._model)
            raise OllamaResponseError(
                f"Ollama HTTP {response.status_code}: {body[:200]}"
            )

        try:
            data = response.json()
        except json.JSONDecodeError as exc:
            raise OllamaResponseError("Ollama returned invalid JSON") from exc

        if isinstance(data, dict):
            message = data.get("message")
            if isinstance(message, dict) and isinstance(message.get("content"), str):
                return message["content"].strip()

            choices = data.get("choices")
            if isinstance(choices, list) and choices:
                first_choice = choices[0]
                if isinstance(first_choice, dict):
                    message = first_choice.get("message")
                    if isinstance(message, dict) and isinstance(message.get("content"), str):
                        return message["content"].strip()
                    if isinstance(first_choice.get("text"), str):
                        return first_choice["text"].strip()

        raise OllamaResponseError("Ollama response missing message.content")

    @staticmethod
    def _extract_json_array(content: str) -> str:
        content = content.strip()
        
        fenced = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", content, re.IGNORECASE)
        if fenced:
            content = fenced.group(1).strip()

        start = content.find("[")
        if start == -1:
            raise ValueError("Response does not contain a JSON array")

        depth = 0
        in_string = False
        escape = False
        last_bracket = -1
        
        for index, char in enumerate(content[start:], start=start):
            if in_string:
                if escape:
                    escape = False
                elif char == "\\":
                    escape = True
                elif char == '"':
                    in_string = False
                continue

            if char == '"':
                in_string = True
            elif char == "[":
                depth += 1
            elif char == "]":
                depth -= 1
                if depth == 0:
                    last_bracket = index + 1
                    break

        if last_bracket == -1:
            raise ValueError("Could not extract a complete JSON array from response")
        
        return content[start:last_bracket]

    @staticmethod
    def parse_json_array(raw_content: str) -> list[dict[str, Any]]:
        try:
            content = OllamaService._extract_json_array(raw_content)
        except ValueError as extract_error:
            logger.error(
                "Failed to extract JSON array from raw response. "
                "Raw content (first 1000 chars): %s",
                raw_content[:1000],
            )
            raise ValueError(f"Invalid response format: {extract_error}") from extract_error

        try:
            parsed = json.loads(content)
        except json.JSONDecodeError:
            try:
                parsed = ast.literal_eval(content)
            except (ValueError, SyntaxError) as exc:
                logger.error(
                    "Failed to parse extracted JSON. "
                    "Extracted content: %s | Raw (first 1000 chars): %s",
                    content[:500],
                    raw_content[:1000],
                )
                raise ValueError("Response is not a valid JSON array") from exc

        if not isinstance(parsed, list):
            logger.error(
                "Parsed content is not a list. Type: %s | Content: %s | Raw (first 1000 chars): %s",
                type(parsed).__name__,
                str(parsed)[:500],
                raw_content[:1000],
            )
            raise ValueError("Response is not a JSON array")
        return parsed
