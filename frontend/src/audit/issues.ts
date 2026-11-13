import type { Issue } from "../api/types";
import { IMPACT_LABELS } from "./summary";
export type SortKey = "impact" | "title";
export type SortDirection = "ascending" | "descending";
export type SortState = { key: SortKey; direction: SortDirection };

export type ImpactOrUnknown = NonNullable<Issue["impact"]> | "unknown";

export const DEFAULT_SORT: SortState = {
  key: "impact",
  direction: "descending",
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

export const FIRST_DIRECTION: Record<SortKey, SortDirection> = {
  impact: "descending",
  title: "ascending",
};

export function nextSort(current: SortState, clicked: SortKey): SortState {
  if (current.key !== clicked) {
    return { key: clicked, direction: FIRST_DIRECTION[clicked] };
  }
  return {
    key: clicked,
    direction: current.direction === "ascending" ? "descending" : "ascending",
  };
}

const SEVERITY: Record<ImpactOrUnknown, number> = {
  critical: 4,
  serious: 3,
  moderate: 2,
  unknown: 1,
  minor: 0,
};

const titleCollator = new Intl.Collator(undefined, { sensitivity: "base" });

const COMPARE_ASCENDING: Record<SortKey, (a: Issue, b: Issue) => number> = {
  impact: (a, b) => SEVERITY[impactOf(a)] - SEVERITY[impactOf(b)],
  title: (a, b) => titleCollator.compare(a.title, b.title),
};

export function sortIssues(issues: readonly Issue[], sort: SortState): Issue[] {
  const compare = COMPARE_ASCENDING[sort.key];
  const sign = sort.direction === "ascending" ? 1 : -1;
  return [...issues].sort((a, b) => sign * compare(a, b));
}

const SORT_DESCRIPTIONS: Record<SortKey, Record<SortDirection, string>> = {
  impact: { descending: "most severe first", ascending: "least severe first" },
  title: { ascending: "by issue, A to Z", descending: "by issue, Z to A" },
};

export function describeSort(sort: SortState): string {
  return SORT_DESCRIPTIONS[sort.key][sort.direction];
}
