from fastapi import APIRouter, status

from app.schemas.triage import TriageRequest, TriageResponse
from app.services.triage import triage_issues

router = APIRouter(prefix="/api/v1", tags=["triage"])


@router.post("/triage", response_model=TriageResponse, status_code=status.HTTP_200_OK)
def triage(request: TriageRequest) -> TriageResponse:
    return triage_issues(request.issues)
