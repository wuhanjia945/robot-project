from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "一起动手来手搓机器人"
    APP_VERSION: str = "1.0.0"
    DATA_DIR: Path = Path(__file__).parent.parent / "data"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    LLM_ENABLED: bool = False
    LLM_PROVIDER: str = "openai"
    LLM_API_KEY: str = ""
    LLM_BASE_URL: str = "https://api.openai.com/v1"
    LLM_API_BASE: str = "https://api.openai.com/v1"
    LLM_MODEL: str = "gpt-4o"
    LLM_TEMPERATURE: float = 0.3
    LLM_MAX_TOKENS: int = 4096
    LLM_TIMEOUT: int = 60
    LLM_FALLBACK_ENABLED: bool = True

    class Config:
        env_prefix = "APP_"
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
