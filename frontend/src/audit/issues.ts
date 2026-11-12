import type { Issue } from "../api/types";
import { IMPACT_LABELS } from "./summary";

export type ImpactOrUnknown = NonNullable<Issue["impact"]> | "unknown";

const IMPACT_RANK: Record<ImpactOrUnknown, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  unknown: 3,
  minor: 4,
};

export const IMPACT_FILTER_ORDER: readonly ImpactOrUnknown[] = [
  "critical",
  "serious",
  "moderate",
  "minor",
  "unknown",
];

export const IMPACT_FILTER_LABELS: Record<ImpactOrUnknown, string> = {
  ...IMPACT_LABELS,
  unknown: "Not reported",
};

export function impactOf(issue: Issue): ImpactOrUnknown {
  return issue.impact ?? "unknown";
}

export function sortIssuesByImpact(issues: readonly Issue[]): Issue[] {
  return [...issues].sort(
    (a, b) => IMPACT_RANK[impactOf(a)] - IMPACT_RANK[impactOf(b)],
  );
}

export function filterIssuesByImpact(
  issues: readonly Issue[],
  selected: ReadonlySet<ImpactOrUnknown>,
): Issue[] {
  return issues.filter((issue) => selected.has(impactOf(issue)));
}

export function formatTarget(target: Issue["evidence"]["target"]): string {
  return target
    .map((step) => (Array.isArray(step) ? step.join(" / ") : step))
    .join(" / ");
}
