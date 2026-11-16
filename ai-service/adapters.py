import json
import logging
import httpx
from abc import ABC, abstractmethod
from typing import List, Optional
from schemas import HintRequest, HintResponse, RetrievedChunk
from prompts import COACH_SYSTEM_PROMPT_V1, get_system_prompt, format_user_prompt
from token_optimizer import route_model_for_tier, estimate_tokens
from config import settings

logger = logging.getLogger("bugquest.ai")


class BaseLLMAdapter(ABC):
    @abstractmethod
    async def generate_hint(self, request: HintRequest, retrieved_chunks: Optional[List[RetrievedChunk]] = None) -> HintResponse:
        pass


class GeminiAdapter(BaseLLMAdapter):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate_hint(self, request: HintRequest, retrieved_chunks: Optional[List[RetrievedChunk]] = None) -> HintResponse:
        model_name = route_model_for_tier("gemini", request.hint_level) if settings.enable_cheap_routing else "gemini-1.5-flash"
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
        system_prompt = get_system_prompt(settings.prompt_version)
        user_prompt = format_user_prompt(request, retrieved_chunks)

        payload = {
            "systemInstruction": {"parts": [{"text": system_prompt}]},
            "contents": [
                {"role": "user", "parts": [{"text": user_prompt}]}
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.2
            }
        }

        async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
            resp = await client.post(
                f"{endpoint}?key={self.api_key}",
                json=payload,
                headers={"Content-Type": "application/json", "X-Gemini-Context-Cache": "enabled"}
            )
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            parsed = json.loads(raw_text)

            return HintResponse(
                summary=parsed.get("summary", "Debugging Hint"),
                likely_issue=parsed.get("likely_issue"),
                hint_level=request.hint_level,
                explanation=parsed.get("explanation", ""),
                next_steps=parsed.get("next_steps", []),
                concept_tags=parsed.get("concept_tags", request.topics),
                confidence=parsed.get("confidence", 0.92),
                model_used=model_name,
                tokens_used=data.get("usageMetadata", {}).get("totalTokenCount") or estimate_tokens(user_prompt + raw_text),
                prompt_version=settings.prompt_version,
                retrieved_context=retrieved_chunks or []
            )


class OpenAIAdapter(BaseLLMAdapter):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.endpoint = "https://api.openai.com/v1/chat/completions"

    async def generate_hint(self, request: HintRequest, retrieved_chunks: Optional[List[RetrievedChunk]] = None) -> HintResponse:
        model_name = route_model_for_tier("openai", request.hint_level) if settings.enable_cheap_routing else "gpt-4o-mini"
        system_prompt = get_system_prompt(settings.prompt_version)
        user_prompt = format_user_prompt(request, retrieved_chunks)

        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }

        async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
            resp = await client.post(
                self.endpoint,
                json=payload,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
            )
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["choices"][0]["message"]["content"]
            parsed = json.loads(raw_text)

            return HintResponse(
                summary=parsed.get("summary", "Debugging Hint"),
                likely_issue=parsed.get("likely_issue"),
                hint_level=request.hint_level,
                explanation=parsed.get("explanation", ""),
                next_steps=parsed.get("next_steps", []),
                concept_tags=parsed.get("concept_tags", request.topics),
                confidence=parsed.get("confidence", 0.92),
                model_used=model_name,
                tokens_used=data.get("usage", {}).get("total_tokens"),
                prompt_version=settings.prompt_version,
                retrieved_context=retrieved_chunks or []
            )


class ClaudeAdapter(BaseLLMAdapter):
    """Anthropic Claude 3.5 Sonnet / Haiku Adapter with ephemeral Prompt Caching."""
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.endpoint = "https://api.anthropic.com/v1/messages"

    async def generate_hint(self, request: HintRequest, retrieved_chunks: Optional[List[RetrievedChunk]] = None) -> HintResponse:
        model_name = route_model_for_tier("claude", request.hint_level) if settings.enable_cheap_routing else "claude-3-5-sonnet-latest"
        system_prompt = get_system_prompt(settings.prompt_version)
        user_prompt = format_user_prompt(request, retrieved_chunks)

        payload = {
            "model": model_name,
            "max_tokens": 1024,
            "temperature": 0.2,
            "system": [
                {
                    "type": "text",
                    "text": system_prompt,
                    "cache_control": {"type": "ephemeral"}
                }
            ],
            "messages": [
                {"role": "user", "content": user_prompt}
            ]
        }

        async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
            resp = await client.post(
                self.endpoint,
                json=payload,
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "anthropic-beta": "prompt-caching-2024-07-31",
                    "Content-Type": "application/json"
                }
            )
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["content"][0]["text"]
            parsed = json.loads(raw_text)
            usage = data.get("usage", {})

            return HintResponse(
                summary=parsed.get("summary", "Debugging Hint"),
                likely_issue=parsed.get("likely_issue"),
                hint_level=request.hint_level,
                explanation=parsed.get("explanation", ""),
                next_steps=parsed.get("next_steps", []),
                concept_tags=parsed.get("concept_tags", request.topics),
                confidence=parsed.get("confidence", 0.94),
                model_used=model_name,
                tokens_used=(usage.get("input_tokens", 0) + usage.get("output_tokens", 0)) or estimate_tokens(user_prompt + raw_text),
                prompt_version=settings.prompt_version,
                retrieved_context=retrieved_chunks or []
            )


class DeepSeekAdapter(BaseLLMAdapter):
    """DeepSeek V3 / Coder Adapter with automatic prefix context caching."""
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.endpoint = "https://api.deepseek.com/chat/completions"

    async def generate_hint(self, request: HintRequest, retrieved_chunks: Optional[List[RetrievedChunk]] = None) -> HintResponse:
        model_name = route_model_for_tier("deepseek", request.hint_level)
        system_prompt = get_system_prompt(settings.prompt_version)
        user_prompt = format_user_prompt(request, retrieved_chunks)

        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }

        async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
            resp = await client.post(
                self.endpoint,
                json=payload,
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
            )
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["choices"][0]["message"]["content"]
            parsed = json.loads(raw_text)

            return HintResponse(
                summary=parsed.get("summary", "Debugging Hint"),
                likely_issue=parsed.get("likely_issue"),
                hint_level=request.hint_level,
                explanation=parsed.get("explanation", ""),
                next_steps=parsed.get("next_steps", []),
                concept_tags=parsed.get("concept_tags", request.topics),
                confidence=parsed.get("confidence", 0.93),
                model_used=model_name,
                tokens_used=data.get("usage", {}).get("total_tokens"),
                prompt_version=settings.prompt_version,
                retrieved_context=retrieved_chunks or []
            )


class OllamaLocalAdapter(BaseLLMAdapter):
    """
    On-device / Local LLM adapter powered by Ollama (supporting Qwen 2.5 Coder,
    Llama 3.2, DeepSeek-R1, and Mistral in GGUF Q4_K_M quantization).
    """
    def __init__(self, base_url: str, model_name: str):
        self.base_url = base_url.rstrip("/")
        self.model_name = model_name

    async def generate_hint(self, request: HintRequest, retrieved_chunks: Optional[List[RetrievedChunk]] = None) -> HintResponse:
        system_prompt = get_system_prompt(settings.prompt_version)
        user_prompt = format_user_prompt(request, retrieved_chunks)
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "format": "json",
            "stream": False,
            "options": {"temperature": 0.2, "num_ctx": 4096}
        }
        async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
            resp = await client.post(f"{self.base_url}/api/chat", json=payload)
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["message"]["content"]
            parsed = json.loads(raw_text)
            return HintResponse(
                summary=parsed.get("summary", "Debugging Hint"),
                likely_issue=parsed.get("likely_issue"),
                hint_level=request.hint_level,
                explanation=parsed.get("explanation", ""),
                next_steps=parsed.get("next_steps", []),
                concept_tags=parsed.get("concept_tags", request.topics),
                confidence=parsed.get("confidence", 0.91),
                model_used=f"ollama/{self.model_name}",
                tokens_used=(data.get("prompt_eval_count", 0) + data.get("eval_count", 0)) or estimate_tokens(user_prompt + raw_text),
                prompt_version=settings.prompt_version,
                retrieved_context=retrieved_chunks or []
            )


class SimulatedFallbackAdapter(BaseLLMAdapter):
    """
    Empirical pedagogical rule-based adapter that analyzes code patterns,
    error messages, retrieved RAG chunks, and hint levels without external API dependencies.
    """
    async def generate_hint(self, request: HintRequest, retrieved_chunks: Optional[List[RetrievedChunk]] = None) -> HintResponse:
        error = (request.error_context or "").lower()
        level = request.hint_level
        topics = request.topics or ["algorithms"]

        likely_issue = "General algorithmic or boundary discrepancy."
        if "out of range" in error or "indexerror" in error or "cannot read properties of undefined" in error:
            likely_issue = "Off-by-one indexing error or boundary access beyond array bounds."
        elif "time limit exceeded" in error or request.normalized_status == "time_limit_exceeded":
            likely_issue = "Nested loop iteration causing quadratic O(N^2) or exponential time complexity."
        elif "expected" in error or "output" in error or request.normalized_status == "wrong_answer":
            likely_issue = "Incorrect condition logic or missing edge case handling (empty input / negative numbers)."
        elif "nullpointer" in error or "typeerror" in error:
            likely_issue = "Type mismatch or unhandled null/undefined object property access."

        rag_title = retrieved_chunks[0].title if retrieved_chunks else None

        if level == "nudge":
            summary = "Reflect on input edge cases and assumptions"
            explanation = (
                "Consider the minimum and maximum boundaries permitted by the challenge constraints. "
                "How does your algorithm behave when given an empty list, duplicate elements, or single-element input?"
            )
            next_steps = [
                "Test your code mentally against the smallest valid input.",
                "Review the loop termination conditions."
            ]
        elif level == "direction":
            summary = "Focus on lookup performance and data structure selection"
            pattern_note = f" Relevant pattern: {rag_title}." if rag_title else ""
            explanation = (
                f"Your current approach is operating on {', '.join(topics)}.{pattern_note} "
                "Can you utilize a Hash Map, Set, or Two-Pointer strategy to eliminate redundant scanning?"
            )
            next_steps = [
                "Consider what previously processed data you need to remember.",
                "Replace inner search loops with constant-time lookups."
            ]
        elif level == "debugging_guidance":
            summary = "Targeted boundary and variable tracking"
            explanation = (
                f"Likely issue: {likely_issue} Trace your accumulator or pointer variables right before "
                "the return statement to verify they match expectations on boundary inputs."
            )
            next_steps = [
                "Add print / console.log statements right inside the loop.",
                "Check whether you return 0-based indices or actual element values."
            ]
        else:  # detailed_explanation
            summary = "Step-by-step algorithm walkthrough"
            explanation = (
                f"The optimal approach for this challenge balances time complexity at O(N) by storing visited state in a single pass. "
                f"{request.challenge_title} requires handling both positive and negative values correctly without quadratic nested scans."
            )
            next_steps = [
                "Initialize your lookup structure before the primary loop.",
                "In each iteration, calculate the target complement before recording the current element.",
                "Return early as soon as the valid condition is satisfied."
            ]

        return HintResponse(
            summary=summary,
            likely_issue=likely_issue,
            hint_level=level,
            explanation=explanation,
            next_steps=next_steps,
            concept_tags=topics,
            confidence=0.92,
            model_used="bugquest-pedagogical-engine-v1",
            tokens_used=estimate_tokens(request.code + explanation),
            prompt_version=settings.prompt_version,
            retrieved_context=retrieved_chunks or []
        )


def get_ai_adapter() -> BaseLLMAdapter:
    provider = settings.ai_provider.lower()

    if provider == "gemini" and settings.gemini_api_key:
        return GeminiAdapter(settings.gemini_api_key)
    elif provider == "openai" and settings.openai_api_key:
        return OpenAIAdapter(settings.openai_api_key)
    elif provider == "claude" and settings.anthropic_api_key:
        return ClaudeAdapter(settings.anthropic_api_key)
    elif provider == "deepseek" and settings.deepseek_api_key:
        return DeepSeekAdapter(settings.deepseek_api_key)
    elif provider == "ollama":
        return OllamaLocalAdapter(settings.ollama_base_url, settings.ollama_model)
    else:
        logger.info("Using simulated pedagogical fallback adapter (no external keys provided).")
        return SimulatedFallbackAdapter()
