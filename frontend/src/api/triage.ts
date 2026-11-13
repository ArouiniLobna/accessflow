import { postJson } from "./client";
import type {
  Issue,
  TriageIssueInput,
  TriageRequest,
  TriageResponse,
} from "./types";

function toTriageInput(issue: Issue): TriageIssueInput {
  return {
    id: issue.id,
    rule_id: issue.rule_id,
    impact: issue.impact,
    wcag_criteria: issue.wcag_criteria,
  };
}

export function triageIssues(
  issues: readonly Issue[],
  signal?: AbortSignal,
): Promise<TriageResponse> {
  const body: TriageRequest = { issues: issues.map(toTriageInput) };
  return postJson<TriageResponse>("/api/v1/triage", body, signal);
}
