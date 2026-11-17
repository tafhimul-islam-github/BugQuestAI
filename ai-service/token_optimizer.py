import hashlib
import re
import time
from typing import Dict, List, Optional, Tuple, Any
from schemas import HintRequest, HintResponse

class PromptCache:
    """
    Semantic & deterministic prompt/response cache with token-savings telemetry.
    Supports KV/prefix cache alignment and ephemeral response deduplication.
    """
    def __init__(self, max_entries: int = 512, ttl_seconds: int = 3600):
        self.max_entries = max_entries
        self.ttl_seconds = ttl_seconds
        self._store: Dict[str, Tuple[float, HintResponse, int]] = {}
        self.hits: int = 0
        self.misses: int = 0
        self.tokens_saved: int = 0

    def _compute_key(self, req: HintRequest, prompt_version: str) -> str:
        normalized_code = re.sub(r"\s+", " ", req.code.strip())
        normalized_err = re.sub(r"\s+", " ", (req.error_context or "").strip())
        raw = f"{prompt_version}|{req.challenge_title}|{req.language}|{req.hint_level}|{req.normalized_status}|{normalized_code}|{normalized_err}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def get(self, req: HintRequest, prompt_version: str = "v2.0") -> Optional[HintResponse]:
        key = self._compute_key(req, prompt_version)
        entry = self._store.get(key)
        if not entry:
            self.misses += 1
            return None
        ts, resp, est_tokens = entry
        if time.time() - ts > self.ttl_seconds:
            del self._store[key]
            self.misses += 1
            return None
        self.hits += 1
        self.tokens_saved += est_tokens
        cached_copy = resp.model_copy(deep=True)
        cached_copy.cache_hit = True
        return cached_copy

    def set(self, req: HintRequest, resp: HintResponse, prompt_version: str = "v2.0") -> None:
        if len(self._store) >= self.max_entries:
            oldest_key = min(self._store.keys(), key=lambda k: self._store[k][0])
            del self._store[oldest_key]
        key = self._compute_key(req, prompt_version)
        est_tokens = resp.tokens_used or estimate_tokens(req.code + (req.error_context or "") + resp.explanation)
        self._store[key] = (time.time(), resp.model_copy(deep=True), est_tokens)

    def stats(self) -> Dict[str, Any]:
        total = self.hits + self.misses
        return {
            "entries": len(self._store),
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": round(self.hits / total, 4) if total > 0 else 0.0,
            "estimated_tokens_saved": self.tokens_saved,
        }


def estimate_tokens(text: str) -> int:
    """Fast heuristic token estimator (~4 chars per token)."""
    if not text:
        return 0
    return max(1, len(text) // 4)


def semantic_dedup_lines(text: str) -> str:
    """
    Semantic chunk/line deduplication: collapses repeated compiler/runtime traceback
    frames and duplicate blank/comment lines while preserving order.
    """
    if not text:
        return ""
    seen = set()
    deduped: List[str] = []
    for line in text.splitlines():
        norm = line.strip()
        if not norm:
            if deduped and deduped[-1] != "":
                deduped.append("")
            continue
        # Deduplicate repeated traceback or identical diagnostic lines
        if norm in seen and (norm.startswith("at ") or norm.startswith("File ") or len(norm) > 30):
            continue
        seen.add(norm)
        deduped.append(line)
    return "\n".join(deduped)


def sliding_window_trim(text: str, max_chars: int = 2400) -> str:
    """
    Sliding-window context trimming: preserves head declarations and tail error/return
    context when code or error logs exceed token budgets.
    """
    if not text or len(text) <= max_chars:
        return text
    head_budget = int(max_chars * 0.55)
    tail_budget = max_chars - head_budget - 45
    return f"{text[:head_budget]}\n... [sliding-window trimmed {len(text) - max_chars} chars] ...\n{text[-tail_budget:]}"


def compress_code_for_prompt(code: str, max_chars: int = 3200) -> str:
    """
    Code-aware prompt optimizer (Codeburn-style): strips trailing whitespace,
    collapses excessive blank lines, and applies sliding-window trimming.
    """
    lines = [line.rstrip() for line in code.splitlines()]
    compact = re.sub(r"\n{3,}", "\n\n", "\n".join(lines))
    return sliding_window_trim(compact, max_chars=max_chars)


def rolling_summary_memory(hint_history: List[str], max_chars: int = 280) -> str:
    """
    Compresses multi-turn coaching history into a compact rolling memory digest
    so subsequent tiers do not repeat already-delivered hints.
    """
    if not hint_history:
        return "No prior hints requested in this session."
    deduped = list(dict.fromkeys(h.strip() for h in hint_history if h.strip()))
    summary = " -> ".join(deduped[-3:])
    if len(summary) > max_chars:
        summary = summary[: max_chars - 3] + "..."
    return f"Prior coaching progression ({len(deduped)} turns): {summary}"


def route_model_for_tier(provider: str, hint_level: str, default_ollama: str = "qwen2.5-coder:7b") -> str:
    """
    Cheap-model routing: routes lightweight conceptual tiers (nudge, direction) to fast,
    low-cost flash/mini models and deeper diagnostic tiers (debugging_guidance,
    detailed_explanation) to reasoning-capable models.
    """
    is_light_tier = hint_level in ("nudge", "direction")
    provider = provider.lower()

    routing_table = {
        "gemini": ("gemini-1.5-flash", "gemini-1.5-pro"),
        "openai": ("gpt-4o-mini", "gpt-4o"),
        "claude": ("claude-3-5-haiku-latest", "claude-3-5-sonnet-latest"),
        "deepseek": ("deepseek-chat", "deepseek-coder"),
        "ollama": (default_ollama, default_ollama),
    }
    light_model, deep_model = routing_table.get(provider, ("bugquest-pedagogical-engine-v1", "bugquest-pedagogical-engine-v1"))
    return light_model if is_light_tier else deep_model


prompt_cache = PromptCache()
