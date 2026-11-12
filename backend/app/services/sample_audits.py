"""Load the bundled sample audit used for demos and development."""

from pathlib import Path

from pydantic import ValidationError

from app.schemas.audit import Audit
from app.schemas.axe import AxeReport
from app.services.audit_import import audit_from_axe_report


class SampleAuditUnavailableError(Exception):
    """Raised when the bundled sample audit can't be loaded."""


def load_sample_audit(path: Path) -> Audit:
    try:
        raw_json = path.read_text(encoding="utf-8")
        report = AxeReport.model_validate_json(raw_json)
    except (OSError, ValidationError) as error:
        raise SampleAuditUnavailableError(str(path)) from error
    return audit_from_axe_report(report)
