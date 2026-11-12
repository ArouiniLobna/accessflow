import { fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { jsonResponse, makeAudit, makeIssue } from "../test/fixtures";
import { renderWithQueryClient } from "../test/renderWithQueryClient";
import { IssueList } from "./IssueList";

const audit = makeAudit({
  issues: [
    makeIssue({ id: "c1", impact: "critical", title: "Critical one" }),
    makeIssue({ id: "c2", impact: "critical", title: "Critical two" }),
    makeIssue({ id: "m1", impact: "minor", title: "Minor one" }),
  ],
});

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(audit));
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("shows counts in each filter option", async () => {
  renderWithQueryClient(<IssueList />);

  expect(
    await screen.findByRole("checkbox", { name: "Critical (2)" }),
  ).toBeChecked();
  expect(
    screen.getByRole("checkbox", { name: "Serious (0)" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("checkbox", { name: /Not reported/ }),
  ).not.toBeInTheDocument();
});

it("hides unchecked impacts and announces the new count", async () => {
  renderWithQueryClient(<IssueList />);

  fireEvent.click(
    await screen.findByRole("checkbox", { name: "Critical (2)" }),
  );

  expect(screen.getByRole("status")).toHaveTextContent(
    "Showing 1 of 3 issues.",
  );
  expect(
    screen.queryByRole("rowheader", { name: "Critical one" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("rowheader", { name: "Minor one" }),
  ).toBeInTheDocument();
});

it("keeps the filters available when nothing matches", async () => {
  renderWithQueryClient(<IssueList />);

  fireEvent.click(
    await screen.findByRole("checkbox", { name: "Critical (2)" }),
  );
  fireEvent.click(screen.getByRole("checkbox", { name: "Minor (1)" }));

  expect(
    screen.getByText("No issues match the selected impact levels."),
  ).toBeInTheDocument();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
  expect(
    screen.getByRole("checkbox", { name: "Minor (1)" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("group", { name: "Filter by impact" }),
  ).toBeInTheDocument();
});
