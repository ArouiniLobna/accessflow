from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.axe import AxeReport

FIXTURE_PATH = Path(__file__).parent.parent / "fixtures" / "sample_audit_axe.json"


@pytest.fixture
def sample_axe_report() -> AxeReport:
    raw_json = FIXTURE_PATH.read_text(encoding="utf-8")
    return AxeReport.model_validate_json(raw_json)


@pytest.fixture
def client() -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
