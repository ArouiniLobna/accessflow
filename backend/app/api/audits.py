from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import SAMPLE_AUDIT_PATH
from app.schemas.audit import Audit
from app.services.sample_audits import SampleAuditUnavailableError, load_sample_audit

router = APIRouter(prefix="/api/v1/audits", tags=["audits"])


def get_sample_audit_path() -> Path:
    return SAMPLE_AUDIT_PATH


@router.get("/sample", response_model=Audit)
def get_sample_audit(path: Annotated[Path, Depends(get_sample_audit_path)]) -> Audit:
    try:
        return load_sample_audit(path)
    except SampleAuditUnavailableError as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Sample audit data is unavailable.",
        ) from error
