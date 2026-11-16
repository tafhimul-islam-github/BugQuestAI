from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "BugQuest AI Debugging Service"
    port: int = 8001
    # Options: gemini, openai, claude, deepseek, ollama, fallback_simulated
    ai_provider: str = "fallback_simulated"
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    deepseek_api_key: Optional[str] = None
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen2.5-coder:7b"
    enable_prompt_cache: bool = True
    enable_rag: bool = True
    enable_cheap_routing: bool = True
    prompt_version: str = "v2.0"
    max_request_size: int = 65536
    request_timeout_seconds: int = 15

    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
