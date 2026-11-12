import pytest

from app.schemas.axe import AxeReport
from app.schemas.triage import TriageIssueInput
from app.services.audit_import import audit_from_axe_report
from app.services.triage import lower_priority, triage_issue, triage_issues


def make_issue(
    issue_id: str = "issue-1",
    impact: str | None = "serious",
    wcag_criteria: list[str] | None = None,
) -> TriageIssueInput:
    return TriageIssueInput(
        id=issue_id,
        rule_id="test-rule",
        impact=impact,
        wcag_criteria=["1.4.3"] if wcag_criteria is None else wcag_criteria,
    )


@pytest.mark.parametrize(
    ("impact", "expected_priority"),
    [
        ("critical", "P1"),
        ("serious", "P2"),
        ("moderate", "P3"),
        ("minor", "P4"),
    ],
)
def test_impact_sets_base_priority(impact: str, expected_priority: str):
    result = triage_issue(make_issue(impact=impact))

    assert result.priority == expected_priority


def test_unknown_impact_is_p3_and_flagged_for_review():
    result = triage_issue(make_issue(impact=None))

    assert result.priority == "P3"
    assert any("manual review" in reason for reason in result.reasons)


def test_best_practice_issue_is_lowered_one_level():
    result = triage_issue(make_issue(impact="serious", wcag_criteria=[]))

    assert result.priority == "P3"


def test_lowering_never_goes_below_p4():
    assert lower_priority("P4") == "P4"


def test_every_result_explains_itself():
    result = triage_issue(make_issue(impact=None, wcag_criteria=[]))

    assert result.priority == "P4"
    assert len(result.reasons) == 2


def test_minor_best_practice_issue_stays_p4():
    result = triage_issue(make_issue(impact="minor", wcag_criteria=[]))

    assert result.priority == "P4"
    assert len(result.reasons) == 2
    assert "already at the lowest priority" in result.reasons[1]


def test_results_sorted_by_priority_keeping_input_order_on_ties():
    issues = [
        make_issue(issue_id="minor-1", impact="minor"),
        make_issue(issue_id="critical-1", impact="critical"),
        make_issue(issue_id="minor-2", impact="minor"),
        make_issue(issue_id="critical-2", impact="critical"),
    ]

    response = triage_issues(issues)

    assert [r.issue_id for r in response.results] == [
        "critical-1",
        "critical-2",
        "minor-1",
        "minor-2",
    ]


def test_counts_always_include_every_priority():
    response = triage_issues([make_issue(impact="critical")])

    assert response.counts == {"P1": 1, "P2": 0, "P3": 0, "P4": 0}


def test_sample_audit_triage_end_to_end(sample_axe_report: AxeReport):
    audit = audit_from_axe_report(sample_axe_report)
    triage_inputs = [TriageIssueInput.model_validate(issue.model_dump()) for issue in audit.issues]

    response = triage_issues(triage_inputs)

    assert response.counts == {"P1": 3, "P2": 1, "P3": 0, "P4": 1}
