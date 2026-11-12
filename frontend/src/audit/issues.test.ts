import { describe, expect, it } from "vitest";

import { makeIssue } from "../test/fixtures";
import {
  filterIssuesByImpact,
  formatTarget,
  sortIssuesByImpact,
} from "./issues";

describe("sortIssuesByImpact", () => {
  it("puts the most severe first and unreported impact between moderate and minor", () => {
    const issues = [
      makeIssue({ id: "minor", impact: "minor" }),
      makeIssue({ id: "unknown", impact: null }),
      makeIssue({ id: "critical", impact: "critical" }),
      makeIssue({ id: "moderate", impact: "moderate" }),
    ];

    expect(sortIssuesByImpact(issues).map((i) => i.id)).toEqual([
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

    expect(sortIssuesByImpact(issues).map((i) => i.id)).toEqual([
      "first",
      "second",
    ]);
  });

  it("does not change the array it was given", () => {
    const issues = [
      makeIssue({ id: "b", impact: "minor" }),
      makeIssue({ id: "a", impact: "critical" }),
    ];

    sortIssuesByImpact(issues);

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
