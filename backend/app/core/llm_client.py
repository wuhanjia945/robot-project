import json
import logging
from typing import Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


class LLMClient:
    def __init__(self):
        self._base_url = settings.LLM_BASE_URL
        self._api_key = settings.LLM_API_KEY
        self._model = settings.LLM_MODEL
        self._temperature = settings.LLM_TEMPERATURE
        self._max_tokens = settings.LLM_MAX_TOKENS

    @property
    def is_available(self) -> bool:
        return settings.LLM_ENABLED and bool(self._api_key)

    def chat(self, system_prompt: str, user_prompt: str) -> Optional[str]:
        if not self.is_available:
            logger.warning("[LLMClient] LLM is not available (disabled or no API key)")
            return None
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self._api_key}",
            }
            payload = {
                "model": self._model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": self._temperature,
                "max_tokens": self._max_tokens,
            }
            resp = httpx.post(
                f"{self._base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=60.0,
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            logger.info("[LLMClient] LLM chat completed successfully")
            return content
        except httpx.HTTPStatusError as e:
            logger.error(f"[LLMClient] HTTP error: {e.response.status_code} - {e.response.text}")
            return None
        except httpx.RequestError as e:
            logger.error(f"[LLMClient] Request error: {e}")
            return None
        except Exception as e:
            logger.error(f"[LLMClient] Unexpected error: {e}")
            return None

    def chat_json(self, system_prompt: str, user_prompt: str) -> Optional[dict]:
        content = self.chat(system_prompt, user_prompt)
        if not content:
            return None
        try:
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
            else:
                json_str = content.strip()
            result = json.loads(json_str)
            logger.info("[LLMClient] JSON parsing completed successfully")
            return result
        except json.JSONDecodeError as e:
            logger.error(f"[LLMClient] JSON decode error: {e}")
            return None


llm_client = LLMClient()
