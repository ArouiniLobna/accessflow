import pytest

from app.schemas.axe import AxeReport
from app.services.audit_import import audit_from_axe_report, wcag_criteria_from_tags


def test_each_affected_element_becomes_one_issue(sample_axe_report: AxeReport):
    audit = audit_from_axe_report(sample_axe_report)

    assert len(audit.issues) == 5


def test_issue_ids_are_unique(sample_axe_report: AxeReport):
    audit = audit_from_axe_report(sample_axe_report)
    ids = [issue.id for issue in audit.issues]

    assert len(set(ids)) == len(ids)


def test_new_issues_start_unreviewed(sample_axe_report: AxeReport):
    audit = audit_from_axe_report(sample_axe_report)

    assert all(issue.review_status == "unreviewed" for issue in audit.issues)


def test_ids_are_stable_across_imports(sample_axe_report: AxeReport):
    first = audit_from_axe_report(sample_axe_report)
    second = audit_from_axe_report(sample_axe_report)

    assert first.id == second.id
    assert [i.id for i in first.issues] == [i.id for i in second.issues]


def test_password_issue_preserves_rule_and_html(sample_axe_report: AxeReport):
    audit = audit_from_axe_report(sample_axe_report)
    password_issue = next(i for i in audit.issues if i.evidence.target == ["#password"])

    assert password_issue.rule_id == "label"
    assert (
        password_issue.evidence.html
        == '<input type="password" id="password" placeholder="Password">'
    )


@pytest.mark.parametrize(
    ("tags", "expected"),
    [
        (["wcag2a", "wcag111"], ["1.1.1"]),
        (["wcag2aa", "wcag1412"], ["1.4.12"]),
        (["wcag2a", "wcag412", "wcag131"], ["4.1.2", "1.3.1"]),
        (["cat.semantics", "best-practice"], []),
    ],
)
def test_wcag_criteria_parsed_from_tags(tags: list[str], expected: list[str]):
    assert wcag_criteria_from_tags(tags) == expected
