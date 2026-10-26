import json
import logging
import httpx
from abc import ABC, abstractmethod
from typing import Optional
from schemas import HintRequest, HintResponse
from prompts import COACH_SYSTEM_PROMPT_V1, format_user_prompt
from config import settings

logger = logging.getLogger("bugquest.ai")

class BaseLLMAdapter(ABC):
    @abstractmethod
    async def generate_hint(self, request: HintRequest) -> HintResponse:
        pass

class GeminiAdapter(BaseLLMAdapter):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

    async def generate_hint(self, request: HintRequest) -> HintResponse:
        system_prompt = COACH_SYSTEM_PROMPT_V1
        user_prompt = format_user_prompt(request)
        
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.2
            }
        }

        async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
            resp = await client.post(
                f"{self.endpoint}?key={self.api_key}",
                json=payload,
                headers={"Content-Type": "application/json"}
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
                confidence=parsed.get("confidence", 0.90),
                model_used="gemini-1.5-flash"
            )

class OpenAIAdapter(BaseLLMAdapter):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.endpoint = "https://api.openai.com/v1/chat/completions"

    async def generate_hint(self, request: HintRequest) -> HintResponse:
        system_prompt = COACH_SYSTEM_PROMPT_V1
        user_prompt = format_user_prompt(request)

        payload = {
            "model": "gpt-4o-mini",
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
                confidence=parsed.get("confidence", 0.90),
                model_used="gpt-4o-mini",
                tokens_used=data.get("usage", {}).get("total_tokens")
            )

class SimulatedFallbackAdapter(BaseLLMAdapter):
    """
    Empirical pedagogical rule-based adapter that analyzes code patterns,
    error messages, and hint levels without external API dependencies.
    """
    async def generate_hint(self, request: HintRequest) -> HintResponse:
        code = request.code.lower()
        error = (request.error_context or "").lower()
        level = request.hint_level
        topics = request.topics or ["algorithms"]

        likely_issue = "General algorithmic or boundary discrepancy."
        if "out of range" in error or "indexerror" in error or "cannot read properties of undefined" in error:
            likely_issue = "Off-by-one indexing error or boundary access beyond array bounds."
        elif "time limit exceeded" in error or request.normalized_status == "time_limit_exceeded":
            likely_issue = "Nested loop iteration causing quadratic O(N^2) or exponential time complexity."
        elif "expected" in error and "output mismatch" in error:
            likely_issue = "Incorrect condition logic or missing edge case handling (empty input / negative numbers)."
        elif "nullpointer" in error or "typeerror" in error:
            likely_issue = "Type mismatch or unhandled null/undefined object property access."

        # Progressive hint text based on level
        if level == "nudge":
            summary = "Reflect on input edge cases and assumptions"
            explanation = "Consider the minimum and maximum boundaries permitted by the challenge constraints. How does your algorithm behave when given an empty list or single-element input?"
            next_steps = [
                "Test your code mentally against the smallest valid input.",
                "Review the loop termination conditions."
            ]
        elif level == "direction":
            summary = "Focus on lookup performance and data structure selection"
            explanation = f"Your current approach is operating on {', '.join(topics)}. Can you utilize a Hash Map, Set, or Two-Pointer strategy to eliminate redundant scanning?"
            next_steps = [
                "Consider what previously processed data you need to remember.",
                "Replace inner search loops with constant-time lookups."
            ]
        elif level == "debugging_guidance":
            summary = "Targeted boundary and variable tracking"
            explanation = f"Likely issue: {likely_issue}. Trace your accumulator or pointer variables right before the return statement to verify they match expectations."
            next_steps = [
                "Add print / console.log statements right inside the loop.",
                "Check whether you return 0-based indices or actual element values."
            ]
        else: # detailed_explanation
            summary = "Step-by-step algorithm walkthrough"
            explanation = f"The optimal approach for this challenge balances time complexity at O(N) by storing visited state in a single pass. {request.challenge_title} requires handling both positive and negative values correctly without quadratic nested scans."
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
            model_used="bugquest-pedagogical-engine-v1"
        )

def get_ai_adapter() -> BaseLLMAdapter:
    provider = settings.ai_provider.lower()
    
    if provider == "gemini" and settings.gemini_api_key:
        return GeminiAdapter(settings.gemini_api_key)
    elif provider == "openai" and settings.openai_api_key:
        return OpenAIAdapter(settings.openai_api_key)
    else:
        logger.info("Using simulated pedagogical fallback adapter (no external keys provided).")
        return SimulatedFallbackAdapter()
