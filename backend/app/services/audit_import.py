"""Convert raw axe-core reports into AccessFlow audits."""

import hashlib
import json
import re

from app.schemas.audit import Audit, Issue, IssueEvidence
from app.schemas.axe import AxeReport

WCAG_CRITERION_TAG = re.compile(r"^wcag(\d)(\d)(\d+)$")


def make_stable_id(*parts: str) -> str:
    joined = "|".join(parts)
    return hashlib.sha256(joined.encode("utf-8")).hexdigest()[:12]


def wcag_criteria_from_tags(tags: list[str]) -> list[str]:
    criteria: list[str] = []
    for tag in tags:
        match = WCAG_CRITERION_TAG.match(tag)
        if match:
            criteria.append(".".join(match.groups()))
    return criteria


def audit_from_axe_report(report: AxeReport) -> Audit:
    issues: list[Issue] = []

    for violation in report.violations:
        criteria = wcag_criteria_from_tags(violation.tags)

        for node in violation.nodes:
            issue = Issue(
                id=make_stable_id(report.url, violation.id, json.dumps(node.target)),
                rule_id=violation.id,
                impact=violation.impact,
                title=violation.help,
                description=violation.description,
                help_url=violation.help_url,
                wcag_criteria=criteria,
                evidence=IssueEvidence(
                    html=node.html,
                    target=node.target,
                    failure_summary=node.failure_summary,
                ),
            )
            issues.append(issue)

    return Audit(
        id=make_stable_id(report.url, report.timestamp.isoformat()),
        page_url=report.url,
        scanned_at=report.timestamp,
        engine=f"{report.test_engine.name} {report.test_engine.version}",
        issues=issues,
    )
