from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.modules.accf.api import router as accf_router, ws_router as accf_ws_router

app = FastAPI(title="arviva-nexus-backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Keep existing health contract unchanged
@app.get("/health")
async def health() -> dict:
    return {"ok": True}


@app.get("/api/health")
async def api_health() -> dict:
    return {"ok": True, "service": "backend"}


app.include_router(accf_router)
app.include_router(accf_ws_router)
