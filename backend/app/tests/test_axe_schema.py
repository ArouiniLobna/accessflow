from pathlib import Path

import pytest
from pydantic import ValidationError

from app.schemas.axe import AxeReport, AxeViolation

FIXTURE_PATH = Path(__file__).parents[2] / "fixtures" / "sample_audit_axe.json"


def load_sample_report() -> AxeReport:
    raw_json = FIXTURE_PATH.read_text(encoding="utf-8")
    return AxeReport.model_validate_json(raw_json)


def test_sample_fixture_is_a_valid_axe_report():
    report = load_sample_report()

    assert report.test_engine.name == "axe-core"
    assert len(report.violations) == 4


def test_canel_case_json_maps_to_snake_case_fields():
    report = load_sample_report()
    first_violation = report.violations[0]

    assert str(first_violation.help_url).startswith("https://dequeuniversity.com/")
    assert first_violation.nodes[0].failure_summary is not None


def test_unknown_impact_value_is_rejected():
    violation_data = {
        "id": "image-alt",
        "impact": "urgent",
        "tags": [],
        "description": "test",
        "help": "test",
        "helpUrl": "https://example.com",
        "nodes": [{"html": "<img>", "target": ["img"]}],
    }

    with pytest.raises(ValidationError):
        AxeViolation.model_validate(violation_data)


def test_empty_nodes_list_is_rejected():
    violation_data = {
        "id": "contrast",
        "impact": "critical",
        "tags": [],
        "description": "test",
        "help": "test",
        "helpUrl": "https://example.com",
        "nodes": [],
    }
    with pytest.raises(ValidationError) as exc_info:
        AxeViolation.model_validate(violation_data)

    errors = exc_info.value.errors()
    assert errors[0]["loc"] == ("nodes",)
