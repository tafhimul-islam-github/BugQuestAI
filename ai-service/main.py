import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import HintRequest, HintResponse
from agents import coaching_pipeline
from evaluation import run_evaluation_benchmark
from mcp_server import (
    JsonRpcRequest,
    handle_mcp_request,
    MCP_SERVER_MANIFEST,
    MCP_TOOLS,
    MCP_RESOURCES,
    MCP_PROMPTS,
)
from rag import KNOWLEDGE_CORPUS
from token_optimizer import prompt_cache
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("bugquest-ai")

app = FastAPI(
    title="BugQuest AI Debugging Coach & MCP Service",
    description="Dedicated microservice providing 5-agent Socratic progressive hints, Contextual Hybrid RAG, Token Optimization, and Model Context Protocol (MCP) endpoints.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "BugQuest AI Coach",
        "version": "2.0.0",
        "provider": settings.ai_provider,
        "supported_providers": ["gemini", "openai", "claude", "deepseek", "ollama", "fallback_simulated"],
        "prompt_version": settings.prompt_version,
        "rag_enabled": settings.enable_rag,
        "rag_corpus_size": len(KNOWLEDGE_CORPUS),
        "mcp_enabled": True,
        "mcp_tools_count": len(MCP_TOOLS),
        "cache_stats": prompt_cache.stats(),
        "port": settings.port,
    }

@app.post("/api/v1/hint", response_model=HintResponse)
async def generate_hint(request: HintRequest):
    try:
        response = await coaching_pipeline.run(request)
        return response
    except Exception as e:
        logger.error(f"Error generating hint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@app.get("/api/v1/eval/benchmark")
async def execute_benchmark():
    return await run_evaluation_benchmark()

@app.get("/mcp/manifest")
async def mcp_manifest():
    return {
        **MCP_SERVER_MANIFEST,
        "tools": MCP_TOOLS,
        "resources": MCP_RESOURCES,
        "prompts": MCP_PROMPTS,
    }

@app.get("/mcp/tools")
async def mcp_list_tools():
    return {"tools": MCP_TOOLS, "count": len(MCP_TOOLS)}

@app.post("/mcp")
async def mcp_jsonrpc_endpoint(rpc: JsonRpcRequest):
    return await handle_mcp_request(rpc)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=True)
