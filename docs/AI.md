# BugQuest AI — AI Debugging Coach, RAG & MCP Architecture (v2.0)

## 1. Philosophical Grounding

The AI Debugging Coach in BugQuest AI is engineered as an **educational scaffold**, not a solution generator. Its primary goal is to guide the student toward independent reasoning without prematurely revealing code answers or spoiling the problem.

### Fundamental Principles:
1. **Advisory, Not Authoritative**: The isolated test judge is the sole source of truth for code correctness. The AI coach interprets diagnostics and suggests debugging strategies.
2. **Never Leak Hidden Tests**: Private test cases and boundary conditions are never passed to the LLM context.
3. **Progressive Assistance**: Students must start with low-disclosure conceptual nudges before requesting detailed architectural walk-throughs.
4. **Resistant to Prompt Injection**: Student code comments and error logs are treated as strictly untrusted user input.

---

## 2. 5-Stage Multi-Agent Pedagogical Pipeline (`ai-service/agents.py`)

Every hint request flows through five specialized agents coordinated by `MultiAgentCoachingPipeline`:
1. **`GuardrailAgent`**: Inspects untrusted student code and compiler stderr for jailbreak/override patterns (`ignore previous instructions`, `system override`, `reveal hidden test`) and redacts email PII.
2. **`DiagnosticASTAgent`**: Statically parses Python (`ast.parse`) and JavaScript code structure to count loop nesting depth, detect hash-table usage (`dict`/`set`/`Map`/`Set`), and estimate time complexity (`O(N)` vs `O(N^2)`).
3. **`KnowledgeRetrieverAgent` (`rag.py`)**: Executes **Query Rewriting (HyDE)** + **Contextual Hybrid RAG** (BM25 lexical scoring + 128-dim L2-normalized dense vector cosine similarity) + **Cross-Feature Reranking** + **Corrective RAG (CRAG)** confidence gating (`>= 0.18`).
4. **`SocraticCoachAgent` (`adapters.py`)**: Dynamically routes the request across Gemini, OpenAI, Claude, DeepSeek, local Ollama, or the deterministic Pedagogical Fallback Engine using our XML Prompt Registry (`v2.0`).
5. **`PedagogicalCriticAgent`**: Audits the generated response to redact any accidental code blocks on `nudge` or `direction` tiers and attaches real-time RAGAS faithfulness and context-relevance scores (`eval_metrics`).

---

## 3. Progressive Hint Tiers

| Tier | Name | Target Outcome | Disclosure Level |
|---|---|---|---|
| **Level 1** | `nudge` | Provoke thought; highlight problem statement nuances or edge case assumptions. | Conceptual only; zero code or direct algorithm names. |
| **Level 2** | `direction` | Point toward relevant computer science data structures or algorithmic patterns. | Pattern identification (e.g. "consider a sliding window or hash map"). |
| **Level 3** | `debugging_guidance` | Diagnose the probable cause of failure (e.g., off-by-one, index out of bounds, mutation bug). | Specific debugging steps and invariant tracing. |
| **Level 4** | `detailed_explanation` | Provide a comprehensive algorithmic explanation and time/space complexity breakdown. | Full post-attempt educational walk-through. |

---

## 4. Token Optimization Engine (`ai-service/token_optimizer.py`)

- **SHA-256 Semantic & Ephemeral Prompt Cache (`PromptCache`)**: Deduplicates repeated diagnostic requests and attaches provider-specific caching headers (`anthropic-beta: prompt-caching-2024-07-31` with `cache_control: {"type": "ephemeral"}`, Gemini Context Caching, and OpenAI/DeepSeek prefix caching).
- **Codeburn-Style Compression & Sliding-Window Trimming**: Collapses excessive blank lines, deduplicates repeated stack-trace frames (`semantic_dedup_lines`), and bounds large files via `sliding_window_trim`.
- **Rolling Summary Memory**: Compresses multi-turn `hint_history` into a `<= 280` character rolling digest.
- **Cheap-Model Routing**: Routes Tier 1/2 (`nudge`, `direction`) to high-speed models (`gemini-1.5-flash`, `gpt-4o-mini`, `claude-3-5-haiku-latest`, `deepseek-chat`, `qwen2.5-coder:7b`) and Tier 3/4 to deep reasoning models (`gemini-1.5-pro`, `gpt-4o`, `claude-3-5-sonnet-latest`, `deepseek-coder`).

---

## 5. Model Context Protocol (MCP) Server (`ai-service/mcp_server.py`)

BugQuest AI includes a built-in **MCP Server** (`bugquest-ai-mcp-server` v2.0.0, protocol `2024-11-05`) supporting both **stdio** (`python mcp_server.py`) and **HTTP JSON-RPC 2.0** (`POST /mcp`, `GET /mcp/manifest`, `GET /mcp/tools`):
- **4 MCP Tools**: `generate_debugging_hint`, `retrieve_debugging_knowledge`, `analyze_code_complexity`, `verify_prompt_safety`.
- **3 MCP Resources**: `bugquest://knowledge/algorithms`, `bugquest://metrics/token-optimization`, `bugquest://pedagogy/tiers`.
- **MCP Prompts**: `socratic-debugging-coach-v2`.

---

## 6. Evaluation & Golden Benchmark Harness (`ai-service/evaluation.py`)

- Exposed at `GET /api/v1/eval/benchmark` and verified in `ai-service/tests/test_ai_service.py`.
- Measures **Schema Compliance Rate**, **Mean RAGAS Context Relevance**, **Mean RAGAS Faithfulness**, and **Pedagogical Non-Leakage Score** across golden debugging scenarios.
