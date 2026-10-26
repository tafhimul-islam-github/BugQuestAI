from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "BugQuest AI Debugging Service"
    port: int = 8001
    ai_provider: str = "fallback_simulated" # options: gemini, openai, fallback_simulated
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    max_request_size: int = 65536
    request_timeout_seconds: int = 15

    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
