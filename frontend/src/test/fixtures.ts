import type { Audit, Issue, Priority, TriageResponse } from "../api/types";

export function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: "issue-1",
    rule_id: "label",
    impact: "critical",
    title: "Form elements must have labels",
    description: "Ensure every form element has a label",
    help_url: "https://dequeuniversity.com/rules/axe/4.10/label",
    wcag_criteria: ["1.3.1"],
    evidence: {
      html: '<input id="email">',
      target: ["#email"],
      failure_summary: null,
    },
    review_status: "unreviewed",
    ...overrides,
  };
}

export function makeAudit(overrides: Partial<Audit> = {}): Audit {
  return {
    id: "audit-1",
    page_url: "http://localhost:5173/signup",
    scanned_at: "2026-11-10T08:00:00Z",
    engine: "axe-core 4.10.2",
    issues: [makeIssue()],
    ...overrides,
  };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function makeTriageResponse(
  issues: readonly Issue[],
  priority: Priority = "P1",
): TriageResponse {
  const counts = { P1: 0, P2: 0, P3: 0, P4: 0 };
  counts[priority] = issues.length;

  return {
    results: issues.map((issue) => ({
      issue_id: issue.id,
      priority,
      reasons: ["Test reason."],
    })),
    counts,
  };
}
