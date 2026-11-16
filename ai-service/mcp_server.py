import sys
import json
import asyncio
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from schemas import HintRequest
from agents import coaching_pipeline, GuardrailAgent, DiagnosticASTAgent
from rag import rag_engine, KNOWLEDGE_CORPUS
from token_optimizer import prompt_cache
from prompts import PROMPT_REGISTRY


class JsonRpcRequest(BaseModel):
    jsonrpc: str = "2.0"
    id: Optional[Any] = 1
    method: str
    params: Optional[Dict[str, Any]] = None


MCP_SERVER_MANIFEST = {
    "protocolVersion": "2024-11-05",
    "serverInfo": {
        "name": "bugquest-ai-mcp-server",
        "version": "2.0.0",
        "description": "BugQuest AI Model Context Protocol Server exposing Socratic debugging tools, Contextual Hybrid RAG retrieval, AST complexity analysis, and prompt safety guardrails.",
    },
    "transports": ["stdio", "http-jsonrpc"],
    "capabilities": {
        "tools": {"listChanged": False},
        "resources": {"subscribe": False, "listChanged": False},
        "prompts": {"listChanged": False},
    },
}

MCP_TOOLS: List[Dict[str, Any]] = [
    {
        "name": "generate_debugging_hint",
        "description": "Executes the 5-agent Socratic debugging pipeline (Guardrail -> AST -> Contextual Hybrid RAG -> LLM Coach -> Critic) for a learner code submission.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "challenge_title": {"type": "string"},
                "challenge_description": {"type": "string"},
                "language": {"type": "string", "enum": ["python", "javascript"]},
                "code": {"type": "string"},
                "hint_level": {"type": "string", "enum": ["nudge", "direction", "debugging_guidance", "detailed_explanation"]},
                "error_context": {"type": "string"},
                "topics": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["challenge_title", "challenge_description", "language", "code"],
        },
    },
    {
        "name": "retrieve_debugging_knowledge",
        "description": "Queries the Contextual Hybrid RAG (BM25 + 128-d Vector Cosine + HyDE + Corrective RAG) knowledge base for algorithmic patterns and bug remedies.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "challenge_title": {"type": "string"},
                "code": {"type": "string"},
                "error_context": {"type": "string"},
                "topics": {"type": "array", "items": {"type": "string"}},
                "top_k": {"type": "integer", "default": 2},
            },
            "required": ["challenge_title", "code"],
        },
    },
    {
        "name": "analyze_code_complexity",
        "description": "Statically analyzes Python or JavaScript code AST and loop structure to estimate time complexity and detect hash lookups.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "code": {"type": "string"},
                "language": {"type": "string", "enum": ["python", "javascript"]},
            },
            "required": ["code", "language"],
        },
    },
    {
        "name": "verify_prompt_safety",
        "description": "Scans untrusted code and error logs for prompt injection attempts and scrubs accidental email PII.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "code": {"type": "string"},
                "error_context": {"type": "string"},
            },
            "required": ["code"],
        },
    },
]

MCP_RESOURCES: List[Dict[str, Any]] = [
    {
        "uri": "bugquest://knowledge/algorithms",
        "name": "Algorithmic & Debugging Knowledge Corpus",
        "mimeType": "application/json",
        "description": "Curated CS patterns indexed by Contextual Hybrid RAG.",
    },
    {
        "uri": "bugquest://metrics/token-optimization",
        "name": "Live Prompt Cache & Token Optimization Telemetry",
        "mimeType": "application/json",
        "description": "Real-time cache hits, misses, hit rate, and estimated tokens saved.",
    },
    {
        "uri": "bugquest://pedagogy/tiers",
        "name": "4-Tier Socratic Hint Discipline Specification",
        "mimeType": "application/json",
        "description": "Disclosure boundaries for nudge, direction, debugging_guidance, and detailed_explanation.",
    },
]

MCP_PROMPTS: List[Dict[str, Any]] = [
    {
        "name": "socratic-debugging-coach-v2",
        "description": "XML-structured Socratic debugging system prompt with Chain-of-Thought and few-shot examples.",
        "arguments": [{"name": "version", "description": "v1.0 or v2.0", "required": False}],
    }
]


async def handle_mcp_request(rpc: JsonRpcRequest) -> Dict[str, Any]:
    method = rpc.method
    params = rpc.params or {}

    if method == "initialize":
        return {"jsonrpc": "2.0", "id": rpc.id, "result": MCP_SERVER_MANIFEST}

    if method == "tools/list":
        return {"jsonrpc": "2.0", "id": rpc.id, "result": {"tools": MCP_TOOLS}}

    if method == "tools/call":
        tool_name = params.get("name")
        args = params.get("arguments", {})

        if tool_name == "generate_debugging_hint":
            req = HintRequest(
                challenge_title=args.get("challenge_title", "Coding Challenge"),
                challenge_description=args.get("challenge_description", "Solve the problem."),
                language=args.get("language", "python"),
                code=args.get("code", ""),
                hint_level=args.get("hint_level", "nudge"),
                error_context=args.get("error_context"),
                topics=args.get("topics", ["algorithms"]),
            )
            res = await coaching_pipeline.run(req)
            return {
                "jsonrpc": "2.0",
                "id": rpc.id,
                "result": {"content": [{"type": "text", "text": res.model_dump_json()}], "isError": False},
            }

        if tool_name == "retrieve_debugging_knowledge":
            req = HintRequest(
                challenge_title=args.get("challenge_title", "Query"),
                challenge_description=args.get("challenge_description", "Query"),
                language="python",
                code=args.get("code", ""),
                error_context=args.get("error_context"),
                topics=args.get("topics", []),
            )
            chunks = rag_engine.retrieve(req, top_k=int(args.get("top_k", 2)))
            return {
                "jsonrpc": "2.0",
                "id": rpc.id,
                "result": {
                    "content": [{"type": "text", "text": json.dumps([c.model_dump() for c in chunks])}],
                    "isError": False,
                },
            }

        if tool_name == "analyze_code_complexity":
            analyzer = DiagnosticASTAgent()
            analysis = analyzer.analyze(args.get("code", ""), args.get("language", "python"))
            return {
                "jsonrpc": "2.0",
                "id": rpc.id,
                "result": {"content": [{"type": "text", "text": json.dumps(analysis)}], "isError": False},
            }

        if tool_name == "verify_prompt_safety":
            guard = GuardrailAgent()
            req = HintRequest(
                challenge_title="Safety Check",
                challenge_description="Safety Check",
                language="python",
                code=args.get("code", ""),
                error_context=args.get("error_context"),
            )
            report = guard.inspect_and_sanitize(req)
            return {
                "jsonrpc": "2.0",
                "id": rpc.id,
                "result": {"content": [{"type": "text", "text": json.dumps(report)}], "isError": False},
            }

        return {
            "jsonrpc": "2.0",
            "id": rpc.id,
            "error": {"code": -32601, "message": f"Unknown MCP tool: {tool_name}"},
        }

    if method == "resources/list":
        return {"jsonrpc": "2.0", "id": rpc.id, "result": {"resources": MCP_RESOURCES}}

    if method == "resources/read":
        uri = params.get("uri", "")
        if uri == "bugquest://knowledge/algorithms":
            payload = KNOWLEDGE_CORPUS
        elif uri == "bugquest://metrics/token-optimization":
            payload = prompt_cache.stats()
        elif uri == "bugquest://pedagogy/tiers":
            payload = {
                "nudge": "Conceptual question only; zero variable or code references.",
                "direction": "Data structure and algorithmic pattern guidance.",
                "debugging_guidance": "Targeted edge-case and invariant bug diagnosis.",
                "detailed_explanation": "Complete O(N) architectural walkthrough.",
            }
        else:
            return {"jsonrpc": "2.0", "id": rpc.id, "error": {"code": -32602, "message": f"Unknown resource URI: {uri}"}}

        return {
            "jsonrpc": "2.0",
            "id": rpc.id,
            "result": {"contents": [{"uri": uri, "mimeType": "application/json", "text": json.dumps(payload)}]},
        }

    if method == "prompts/list":
        return {"jsonrpc": "2.0", "id": rpc.id, "result": {"prompts": MCP_PROMPTS}}

    if method == "prompts/get":
        version = (params.get("arguments") or {}).get("version", "v2.0")
        prompt_text = PROMPT_REGISTRY.get(version, PROMPT_REGISTRY["v2.0"])
        return {
            "jsonrpc": "2.0",
            "id": rpc.id,
            "result": {
                "description": f"BugQuest Socratic Debugging Coach Prompt ({version})",
                "messages": [{"role": "user", "content": {"type": "text", "text": prompt_text}}],
            },
        }

    return {"jsonrpc": "2.0", "id": rpc.id, "error": {"code": -32601, "message": f"Method not found: {method}"}}


async def _stdio_loop():
    """Stdio transport loop for CLI MCP clients (Claude Desktop / Cursor / Antigravity)."""
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            raw = json.loads(line)
            rpc = JsonRpcRequest(**raw)
            resp = await handle_mcp_request(rpc)
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()
        except Exception as exc:
            err = {"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": str(exc)}}
            sys.stdout.write(json.dumps(err) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    asyncio.run(_stdio_loop())
