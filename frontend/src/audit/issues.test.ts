import { describe, expect, it } from "vitest";

import { makeIssue } from "../test/fixtures";
import {
  filterIssuesByImpact,
  formatTarget,
  sortIssues,
  DEFAULT_SORT,
  nextSort,
  describeSort,
} from "./issues";

describe("sortIssues", () => {
  it("puts the most severe first and unreported impact between moderate and minor", () => {
    const issues = [
      makeIssue({ id: "minor", impact: "minor" }),
      makeIssue({ id: "unknown", impact: null }),
      makeIssue({ id: "critical", impact: "critical" }),
      makeIssue({ id: "moderate", impact: "moderate" }),
    ];

    expect(sortIssues(issues, DEFAULT_SORT).map((i) => i.id)).toEqual([
      "critical",
      "moderate",
      "unknown",
      "minor",
    ]);
  });

  it("keeps the original order for equal impact", () => {
    const issues = [
      makeIssue({ id: "first", impact: "critical" }),
      makeIssue({ id: "second", impact: "critical" }),
    ];

    expect(sortIssues(issues, DEFAULT_SORT).map((i) => i.id)).toEqual([
      "first",
      "second",
    ]);
  });

  it("does not change the array it was given", () => {
    const issues = [
      makeIssue({ id: "b", impact: "minor" }),
      makeIssue({ id: "a", impact: "critical" }),
    ];

    sortIssues(issues, DEFAULT_SORT);

    expect(issues.map((i) => i.id)).toEqual(["b", "a"]);
  });
});

describe("formatTarget", () => {
  it.each([
    [["#email"], "#email"],
    [["iframe#payment", "#card-number"], "iframe#payment / #card-number"],
    [[["my-date-picker", "button.next"]], "my-date-picker / button.next"],
  ])("formats %j as %s", (target, expected) => {
    expect(formatTarget(target)).toEqual(expected);
  });
});

describe("filterIssuesByImpact", () => {
  const issues = [
    makeIssue({ id: "critical", impact: "critical" }),
    makeIssue({ id: "minor", impact: "minor" }),
    makeIssue({ id: "unknown", impact: null }),
  ];

  it("keeps only issues with a selected impact", () => {
    const result = filterIssuesByImpact(
      issues,
      new Set(["critical", "minor"] as const),
    );

    expect(result.map((i) => i.id)).toEqual(["critical", "minor"]);
  });

  it("treats a missing impact as the 'unknown' option", () => {
    const result = filterIssuesByImpact(issues, new Set(["unknown"] as const));

    expect(result.map((i) => i.id)).toEqual(["unknown"]);
  });
});

describe("sortIssues", () => {
  const issues = [
    makeIssue({ id: "b-minor", impact: "minor", title: "banana" }),
    makeIssue({ id: "a-critical", impact: "critical", title: "Apple" }),
    makeIssue({ id: "c-critical", impact: "critical", title: "cherry" }),
  ];

  it("sorts least severe first when ascending, keeping ties in order", () => {
    const result = sortIssues(issues, {
      key: "impact",
      direction: "ascending",
    });

    expect(result.map((i) => i.id)).toEqual([
      "b-minor",
      "a-critical",
      "c-critical",
    ]);
  });

  it("keeps ties in their original order when descending too", () => {
    const result = sortIssues(issues, DEFAULT_SORT);

    expect(result.map((i) => i.id)).toEqual([
      "a-critical",
      "c-critical",
      "b-minor",
    ]);
  });

  it("sorts titles alphabetically regardless of capital letters", () => {
    const result = sortIssues(issues, { key: "title", direction: "ascending" });

    expect(result.map((i) => i.title)).toEqual(["Apple", "banana", "cherry"]);
  });
});

describe("nextSort", () => {
  it("flips direction when the same column is chosen again", () => {
    expect(nextSort(DEFAULT_SORT, "impact")).toEqual({
      key: "impact",
      direction: "ascending",
    });
  });

  it("uses the column's natural first direction when switching columns", () => {
    expect(nextSort(DEFAULT_SORT, "title")).toEqual({
      key: "title",
      direction: "ascending",
    });
  });
});

it("describes the default sort in the existing wording", () => {
  expect(describeSort(DEFAULT_SORT)).toBe("most severe first");
});
