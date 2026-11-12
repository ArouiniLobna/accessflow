import { expect, it } from "vitest";

import { makeIssue } from "../test/fixtures";
import { countIssuesByImpact } from "./summary";

it("counts issues by impact, including unreported impact", () => {
  const issues = [
    makeIssue({ id: "a", impact: "critical" }),
    makeIssue({ id: "b", impact: "critical" }),
    makeIssue({ id: "c", impact: "minor" }),
    makeIssue({ id: "d", impact: null }),
  ];

  expect(countIssuesByImpact(issues)).toEqual({
    critical: 2,
    serious: 0,
    moderate: 0,
    minor: 1,
    unknown: 1,
  });
});
