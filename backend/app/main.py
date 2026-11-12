from fastapi import FastAPI

from app.api.audits import router as audits_router
from app.api.health import router as health_router

app = FastAPI(
    title="AccessFlow Ai Api",
    version="0.1.0",
    description="Accessibility audit triage API (step 1: deterministic, no AI).",
)

app.include_router(health_router)
app.include_router(audits_router)
