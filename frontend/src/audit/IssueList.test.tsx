import { screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { jsonResponse, makeAudit, makeIssue } from "../test/fixtures";
import { renderWithQueryClient } from "../test/renderWithQueryClient";
import { AuditSummary } from "./AuditSummary";
import { IssueList } from "./IssueList";

afterEach(() => {
  vi.restoreAllMocks();
});

it("lists issues most severe first, with each title as its row header", async () => {
  const audit = makeAudit({
    issues: [
      makeIssue({ id: "m", impact: "minor", title: "Minor problem" }),
      makeIssue({ id: "c", impact: "critical", title: "Critical problem" }),
    ],
  });
  vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(audit));

  renderWithQueryClient(<IssueList />);

  const table = await screen.findByRole("table", {
    name: "2 issues, most severe first",
  });
  const rowHeaders = within(table).getAllByRole("rowheader");
  expect(rowHeaders.map((header) => header.textContent)).toEqual([
    "Critical problem",
    "Minor problem",
  ]);
});

it("explains missing impact and best-practice rules in words", async () => {
  const audit = makeAudit({
    issues: [makeIssue({ impact: null, wcag_criteria: [] })],
  });
  vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(audit));

  renderWithQueryClient(<IssueList />);

  await screen.findByRole("table");
  expect(
    screen.getByRole("cell", { name: "Not reported" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("cell", { name: "Best practice" }),
  ).toBeInTheDocument();
});

it("makes the scrollable table reachable by keyboard", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(makeAudit()));

  renderWithQueryClient(<IssueList />);

  const region = await screen.findByRole("region", {
    name: "1 issue, most severe first",
  });
  expect(region).toHaveAttribute("tabindex", "0");
});

it("shares one request between the summary and the list", async () => {
  const fetchSpy = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(jsonResponse(makeAudit()));

  renderWithQueryClient(
    <>
      <AuditSummary />
      <IssueList />
    </>,
  );

  await screen.findByRole("table");
  expect(fetchSpy).toHaveBeenCalledTimes(1);
});
