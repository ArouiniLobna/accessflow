from pathlib import Path

import pytest

from app.schemas.axe import AxeReport

FIXTURE_PATH = Path(__file__).parent.parent / "fixtures" / "sample_audit_axe.json"


@pytest.fixture
def sample_axe_report() -> AxeReport:
    raw_json = FIXTURE_PATH.read_text(encoding="utf-8")
    return AxeReport.model_validate_json(raw_json)
