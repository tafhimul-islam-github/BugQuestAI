import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import HintRequest, HintResponse
from adapters import get_ai_adapter
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("bugquest-ai")

app = FastAPI(
    title="BugQuest AI Debugging Coach Service",
    description="Dedicated microservice providing pedagogical progressive hints and code diagnostics.",
    version="1.0.0"
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
        "provider": settings.ai_provider,
        "port": settings.port,
    }

@app.post("/api/v1/hint", response_model=HintResponse)
async def generate_hint(request: HintRequest):
    try:
        adapter = get_ai_adapter()
        response = await adapter.generate_hint(request)
        return response
    except Exception as e:
        logger.error(f"Error generating hint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=True)
