import { screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import type { TriageResponse } from "../api/types";
import { AppRoutes } from "../AppRoutes";
import { jsonResponse, makeAudit, makeIssue } from "../test/fixtures";
import { mockFetch, requestsTo } from "../test/mockFetch";
import { renderWithProviders } from "../test/renderWithProviders";
import { IssueList } from "./IssueList";

const AUDIT_URL = "/api/v1/audits/sample";
const TRIAGE_URL = "/api/v1/triage";

const issues = [
  makeIssue({ id: "c1", impact: "critical", title: "Critical one" }),
  makeIssue({
    id: "m1",
    impact: "minor",
    title: "Minor one",
    wcag_criteria: [],
  }),
];
const audit = makeAudit({ issues });

const triage: TriageResponse = {
  results: [
    {
      issue_id: "c1",
      priority: "P1",
      reasons: ["Scanner impact is 'critical'.", "Fails WCAG 1.3.1."],
    },
    {
      issue_id: "m1",
      priority: "P4",
      reasons: [
        "Scanner impact is 'minor'.",
        "Not mapped to a WCAG success criterion (best practice); already at the lowest priority.",
      ],
    },
  ],
  counts: { P1: 1, P2: 0, P3: 0, P4: 1 },
};

afterEach(() => {
  vi.restoreAllMocks();
});

it("shows each issue's priority from the backend", async () => {
  mockFetch({
    [AUDIT_URL]: () => jsonResponse(audit),
    [TRIAGE_URL]: () => jsonResponse(triage),
  });

  renderWithProviders(<IssueList />);

  const row = await screen.findByRole("row", { name: /Critical one/ });
  expect(
    await within(row).findByRole("cell", { name: "P1" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "Priority" }),
  ).toBeInTheDocument();
});

it("sends only the fields triage needs", async () => {
  const spy = mockFetch({
    [AUDIT_URL]: () => jsonResponse(audit),
    [TRIAGE_URL]: () => jsonResponse(triage),
  });

  renderWithProviders(<IssueList />);
  await screen.findByRole("cell", { name: "P1" });

  const calls = requestsTo(spy, TRIAGE_URL);
  expect(calls).toHaveLength(1);
  const sentBody: unknown = JSON.parse(String(calls[0]?.[1]?.body));
  expect(sentBody).toEqual({
    issues: [
      {
        id: "c1",
        rule_id: "label",
        impact: "critical",
        wcag_criteria: ["1.3.1"],
      },
      { id: "m1", rule_id: "label", impact: "minor", wcag_criteria: [] },
    ],
  });
});

it("keeps the list usable when priorities can't be calculated", async () => {
  mockFetch({
    [AUDIT_URL]: () => jsonResponse(audit),
    [TRIAGE_URL]: () => new Response(null, { status: 500 }),
  });

  renderWithProviders(<IssueList />);

  await screen.findByText(/Priorities couldn't be calculated/);
  expect(
    screen.getByRole("rowheader", { name: "Critical one" }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("cell", { name: "Unavailable" })).toHaveLength(2);
  expect(
    screen.getByRole("button", { name: "Try calculating priorities again" }),
  ).toBeInTheDocument();
});

it("explains the priority on the issue page", async () => {
  mockFetch({
    [AUDIT_URL]: () => jsonResponse(audit),
    [TRIAGE_URL]: () => jsonResponse(triage),
  });

  renderWithProviders(<AppRoutes />, { route: "/issues/m1" });

  expect(
    await screen.findByText(/already at the lowest priority/),
  ).toBeInTheDocument();
  expect(screen.getByText("P4")).toBeInTheDocument();
  expect(screen.getByText(/not AI/)).toBeInTheDocument();
});
