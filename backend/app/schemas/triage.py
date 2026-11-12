"""Request and response models for deterministic triage."""

from typing import Annotated, Literal, Self

from pydantic import BaseModel, Field, model_validator

from app.schemas.axe import Impact

Priority = Literal["P1", "P2", "P3", "P4"]

WcagCriterion = Annotated[str, Field(pattern=r"^\d\.\d\.\d{1,2}$")]

MAX_ISSUES_PER_REQUEST = 500


class TriageIssueInput(BaseModel):
    id: str = Field(min_length=1, max_length=64)
    rule_id: str = Field(min_length=1, max_length=100)
    impact: Impact | None
    wcag_criteria: list[WcagCriterion] = Field(default_factory=list, max_length=20)


class TriageRequest(BaseModel):
    issues: list[TriageIssueInput] = Field(min_length=1, max_length=MAX_ISSUES_PER_REQUEST)

    @model_validator(mode="after")
    def issue_ids_must_be_unique(self) -> Self:
        ids = [issue.id for issue in self.issues]
        if len(set(ids)) != len(ids):
            raise ValueError("Issue IDs must be unique within a triage request")
        return self


class TriageResult(BaseModel):
    issue_id: str
    priority: Priority
    reasons: list[str]


class TriageResponse(BaseModel):
    results: list[TriageResult]
    counts: dict[Priority, int]
