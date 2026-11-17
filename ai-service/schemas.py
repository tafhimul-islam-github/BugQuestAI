from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any

HintLevel = Literal['nudge', 'direction', 'debugging_guidance', 'detailed_explanation']

class HintRequest(BaseModel):
    challenge_title: str = Field(..., max_length=255)
    challenge_description: str = Field(..., max_length=10000)
    constraints: List[str] = Field(default_factory=list)
    public_examples: List[dict] = Field(default_factory=list)
    language: str = Field(..., pattern="^(javascript|python)$")
    code: str = Field(..., max_length=65536)
    hint_level: HintLevel = Field(default='nudge')
    error_context: Optional[str] = Field(None, max_length=4000)
    normalized_status: Optional[str] = Field(default='attempting')
    topics: List[str] = Field(default_factory=list)
    hint_history: List[str] = Field(default_factory=list)

class RetrievedChunk(BaseModel):
    id: str
    title: str
    topic: str
    score: float
    retrieval_method: str
    snippet: str

class HintResponse(BaseModel):
    summary: str
    likely_issue: Optional[str] = None
    hint_level: HintLevel
    explanation: str
    next_steps: List[str] = Field(default_factory=list)
    concept_tags: List[str] = Field(default_factory=list)
    confidence: float = Field(default=0.90, ge=0.0, le=1.0)
    model_used: str = "bugquest-ai-coach"
    tokens_used: Optional[int] = None
    cache_hit: bool = False
    prompt_version: str = "v2.0"
    retrieved_context: List[RetrievedChunk] = Field(default_factory=list)
    pipeline_trace: List[str] = Field(default_factory=list)
    eval_metrics: Optional[Dict[str, Any]] = None

class PostMortemGradeRequest(BaseModel):
    challenge_title: str
    category: Optional[str] = "general"
    root_cause_analysis: str
    preventative_measures: str
    patch_diff: Optional[str] = ""

class ByobImportRequest(BaseModel):
    repo_url: str
    issue_description: str
    framework: Optional[str] = "Node.js"
    difficulty: Optional[str] = "intermediate"
