import type { Impact, Issue } from "../api/types";

export const IMPACT_ORDER: readonly Impact[] = [
  "critical",
  "serious",
  "moderate",
  "minor",
];

export const IMPACT_LABELS: Record<Impact, string> = {
  critical: "Critical",
  serious: "Serious",
  moderate: "Moderate",
  minor: "Minor",
};

export type ImpactCounts = Record<Impact | "unknown", number>;

export function countIssuesByImpact(issues: readonly Issue[]): ImpactCounts {
  const counts: ImpactCounts = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
    unknown: 0,
  };

  for (const issue of issues) {
    counts[issue.impact ?? "unknown"] += 1;
  }

  return counts;
}

export function issueCountText(count: number): string {
  return `${count} ${count === 1 ? "issue" : "issues"}`;
}
