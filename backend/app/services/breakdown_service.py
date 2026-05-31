import logging
import re

from pydantic import ValidationError

from app.config import Settings
from app.exceptions import (
    OllamaConnectionError,
    OllamaParseError,
    OllamaResponseError,
    OllamaTimeoutError,
)
from app.schemas.breakdown import SubTaskItem
from app.services.ollama_service import OllamaService

logger = logging.getLogger(__name__)

BREAKDOWN_PROMPT = """你是一位任務拆解助手。
你的唯一工作是：將下列任務拆成清楚、可執行的子任務。

【重要指示】必須嚴格遵守以下規則：
- __LANGUAGE_INSTRUCTION__
- JSON 的鍵名必須使用英文。
- 只輸出一個 JSON 陣列，不要輸出其他任何文字。
- 不要寫 markdown、不要寫 code fence、不要寫說明文字、也不要寫額外的文字。
- 輸出內容必須 100% 有效的 JSON 陣列，每一項都必須是物件。
- 每個物件只能有這三個欄位：
   - "id": 從 1 開始、逐次遞增的整數
   - "title": 子任務標題（簡短、清楚）
   - "description": 子任務說明（同一語言、簡短）
- 產生 3 到 8 個子任務。
- 絕對不要加入任何其他欄位或元資料。

範例輸出（只輸出這個格式的內容）：
__EXAMPLE_OUTPUT__

現在，請拆解下列任務：
__TASK_DESCRIPTION__\n"""


class BreakdownService:
    def __init__(self, ollama: OllamaService, settings: Settings) -> None:
        self._ollama = ollama
        self._settings = settings

    @staticmethod
    def _is_chinese_text(text: str) -> bool:
        return bool(re.search(r"[\u4e00-\u9fff]", text))

    async def breakdown(self, description: str) -> list[SubTaskItem]:
        if self._is_chinese_text(description):
            language_instruction = (
                "目前輸入語言為中文。請以中文生成 title 和 description，且不要使用英文內容。"
            )
            example_output = (
                '[{"id": 1, "title": "建立專案架構", "description": "建立資料結構與專案目錄"}, '
                '{"id": 2, "title": "撰寫 API 端點", "description": "建立後端路由以處理任務新增與查詢"}]'
            )
        else:
            language_instruction = (
                "The input language is English. Please generate title and description in English only, and do not use Chinese text."
            )
            example_output = (
                '[{"id": 1, "title": "Set up project structure", "description": "Define the folder layout and main components"}, '
                '{"id": 2, "title": "Implement API endpoints", "description": "Create backend routes to handle task creation and retrieval"}]'
            )

        prompt = (
            BREAKDOWN_PROMPT
            .replace("__LANGUAGE_INSTRUCTION__", language_instruction)
            .replace("__EXAMPLE_OUTPUT__", example_output)
            .replace("__TASK_DESCRIPTION__", description.strip())
        )

        last_error: Exception | None = None
        for attempt in range(2):
            try:
                raw = await self._ollama.chat(prompt)
            except (OllamaResponseError, OllamaTimeoutError, OllamaConnectionError) as exc:
                logger.warning(
                    "Ollama breakdown attempt %s request failed: %s",
                    attempt + 1,
                    exc,
                )
                last_error = exc
                if attempt == 0:
                    continue
                raise

            try:
                items = self._ollama.parse_json_array(raw)
            except ValueError as exc:
                logger.warning(
                    "Ollama breakdown attempt %s parse failed: %s\n"
                    "Raw response (first 2000 chars):\n%s",
                    attempt + 1,
                    exc,
                    raw[:2000],
                )
                last_error = OllamaParseError(str(exc))
                if attempt == 0:
                    continue
                raise last_error

            if not isinstance(items, list):
                message = "Ollama response is not a JSON array"
                logger.warning(
                    "Ollama breakdown attempt %s invalid type: %s\n"
                    "Raw response (first 2000 chars):\n%s",
                    attempt + 1,
                    message,
                    raw[:2000],
                )
                last_error = OllamaParseError(message)
                if attempt == 0:
                    continue
                raise last_error
            if len(items) < 3 or len(items) > 8:
                message = (
                    f"Ollama response must contain 3 to 8 subtasks, got {len(items)}"
                )
                logger.warning(
                    "Ollama breakdown attempt %s count failed: %s\n"
                    "Raw response (first 2000 chars):\n%s",
                    attempt + 1,
                    message,
                    raw[:2000],
                )
                last_error = OllamaParseError(message)
                if attempt == 0:
                    continue
                raise last_error

            subtasks: list[SubTaskItem] = []
            try:
                for index, item in enumerate(items):
                    if not isinstance(item, dict):
                        raise OllamaParseError(
                            f"Item at index {index} is not an object"
                        )

                    task_id = item.get("id")
                    title = item.get("title")
                    description_text = item.get("description", "")

                    if not isinstance(task_id, int) or task_id < 1:
                        task_id = index + 1
                    if not isinstance(title, str) or not title.strip():
                        raise OllamaParseError(
                            f"Item at index {index} has invalid title"
                        )
                    if description_text is None:
                        description_text = ""
                    if not isinstance(description_text, str):
                        raise OllamaParseError(
                            f"Item at index {index} has invalid description"
                        )

                    subtasks.append(
                        SubTaskItem(
                            id=task_id,
                            title=title.strip(),
                            description=description_text.strip(),
                        )
                    )
            except ValidationError as exc:
                logger.warning(
                    "Ollama breakdown attempt %s validation failed: %s\n"
                    "Raw response (first 2000 chars):\n%s",
                    attempt + 1,
                    exc,
                    raw[:2000],
                )
                last_error = OllamaParseError(f"Invalid subtask schema: {exc}")
                if attempt == 0:
                    continue
                raise last_error

            logger.info("Generated %s subtasks", len(subtasks))
            return subtasks

        assert last_error is not None
        raise last_error
