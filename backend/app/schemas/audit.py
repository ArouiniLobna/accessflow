"""AccessFlow's own audit models.

Evidence copied from the scanner is kept separate from fields
AccessFlow adds (IDs, review status, parsed WCAG criteria).
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, HttpUrl

from app.schemas.axe import Impact

ReviewStatus = Literal["unreviewed", "confirmed", "dismissed"]


class IssueEvidence(BaseModel):
    html: str
    target: list[str | list[str]]
    failure_summary: str | None = None


class Issue(BaseModel):
    id: str
    rule_id: str
    impact: Impact | None
    title: str
    description: str
    help_url: HttpUrl
    wcag_criteria: list[str]
    evidence: IssueEvidence
    review_status: ReviewStatus = "unreviewed"


class Audit(BaseModel):
    id: str
    page_url: str
    scanned_at: datetime
    engine: str
    issues: list[Issue]
