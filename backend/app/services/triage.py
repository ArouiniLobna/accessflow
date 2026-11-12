"""Deterministic issue triage.

Priorities come from fixed, documented rules, not AI.
Every result lists the reasons that produced it.
"""

from app.schemas.axe import Impact
from app.schemas.triage import Priority, TriageIssueInput, TriageResponse, TriageResult

PRIORITY_ORDER: tuple[Priority, ...] = ("P1", "P2", "P3", "P4")

IMPACT_TO_PRIORITY: dict[Impact, Priority] = {
    "critical": "P1",
    "serious": "P2",
    "moderate": "P3",
    "minor": "P4",
}

UNKNOWN_IMPACT_PRIORITY: Priority = "P3"


def lower_priority(priority: Priority) -> Priority:
    index = PRIORITY_ORDER.index(priority)
    lower_index = len(PRIORITY_ORDER) - 1
    return PRIORITY_ORDER[min(index + 1, lower_index)]


def triage_issue(issue: TriageIssueInput) -> TriageResult:
    reasons: list[str] = []

    if issue.impact is None:
        priority = UNKNOWN_IMPACT_PRIORITY
        reasons.append("Scanner reported no impact level, so this needs manual review.")
    else:
        priority = IMPACT_TO_PRIORITY[issue.impact]
        reasons.append(f"Scanner impact is '{issue.impact}'.")

    if issue.wcag_criteria:
        reasons.append(f"Fails WCAG {', '.join(issue.wcag_criteria)}.")
    else:
        lowered = lower_priority(priority)
        if lowered == priority:
            reasons.append(
                "Not mapped to a WCAG success criterion (best practice); "
                "already at the lowest priority."
            )
        else:
            reasons.append(
                "Not mapped to a WCAG success criterion (best practice), so lowered one level."
            )
        priority = lowered
    return TriageResult(issue_id=issue.id, priority=priority, reasons=reasons)


def triage_issues(issues: list[TriageIssueInput]) -> TriageResponse:
    results = [triage_issue(issue) for issue in issues]
    results.sort(key=lambda result: PRIORITY_ORDER.index(result.priority))

    counts: dict[Priority, int] = {priority: 0 for priority in PRIORITY_ORDER}
    for result in results:
        counts[result.priority] += 1

    return TriageResponse(results=results, counts=counts)
