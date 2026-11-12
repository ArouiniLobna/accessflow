import type { Issue } from "../api/types";

type ImpactOrUnknown = NonNullable<Issue["impact"]> | "unknown";

const IMPACT_RANK: Record<ImpactOrUnknown, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  unknown: 3,
  minor: 4,
};

function rankOf(issue: Issue): number {
  return IMPACT_RANK[issue.impact ?? "unknown"];
}

export function sortIssuesByImpact(issues: readonly Issue[]): Issue[] {
  return [...issues].sort((a, b) => rankOf(a) - rankOf(b));
}

export function formatTarget(target: Issue["evidence"]["target"]): string {
  return target
    .map((step) => (Array.isArray(step) ? step.join(" / ") : step))
    .join(" / ");
}
