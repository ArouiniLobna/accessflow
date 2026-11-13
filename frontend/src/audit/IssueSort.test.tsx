import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { jsonResponse, makeAudit, makeIssue } from "../test/fixtures";
import { renderWithProviders } from "../test/renderWithProviders";
import { IssueList } from "./IssueList";

const audit = makeAudit({
  issues: [
    makeIssue({ id: "1", impact: "minor", title: "Banana issue" }),
    makeIssue({ id: "2", impact: "critical", title: "Cherry issue" }),
    makeIssue({ id: "3", impact: "serious", title: "Apple issue" }),
  ],
});

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(audit));
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function rowTitles() {
  const table = await screen.findByRole("table");
  return within(table)
    .getAllByRole("rowheader")
    .map((header) => header.textContent);
}

it("starts sorted by impact, and only that column has aria-sort", async () => {
  renderWithProviders(<IssueList />);

  expect(await rowTitles()).toEqual([
    "Cherry issue",
    "Apple issue",
    "Banana issue",
  ]);
  expect(screen.getByRole("columnheader", { name: "Impact" })).toHaveAttribute(
    "aria-sort",
    "descending",
  );
  expect(
    screen.getByRole("columnheader", { name: "Issue" }),
  ).not.toHaveAttribute("aria-sort");
});

it("sorts by issue A to Z, then Z to A, and announces it", async () => {
  const user = userEvent.setup();
  renderWithProviders(<IssueList />);

  await user.click(await screen.findByRole("button", { name: "Issue" }));

  expect(await rowTitles()).toEqual([
    "Apple issue",
    "Banana issue",
    "Cherry issue",
  ]);
  expect(screen.getByRole("columnheader", { name: "Issue" })).toHaveAttribute(
    "aria-sort",
    "ascending",
  );
  expect(
    screen.getByRole("columnheader", { name: "Impact" }),
  ).not.toHaveAttribute("aria-sort");
  expect(screen.getByRole("status")).toHaveTextContent(
    "Sorted by issue, A to Z.",
  );

  await user.click(screen.getByRole("button", { name: "Issue" }));

  expect(await rowTitles()).toEqual([
    "Cherry issue",
    "Banana issue",
    "Apple issue",
  ]);
});

it("sorts with the keyboard and keeps focus on the header button", async () => {
  const user = userEvent.setup();
  renderWithProviders(<IssueList />);

  const issueButton = await screen.findByRole("button", { name: "Issue" });
  issueButton.focus();
  await user.keyboard("{Enter}");

  expect(await rowTitles()).toEqual([
    "Apple issue",
    "Banana issue",
    "Cherry issue",
  ]);
  expect(issueButton).toHaveFocus();

  await user.keyboard(" ");

  expect(await rowTitles()).toEqual([
    "Cherry issue",
    "Banana issue",
    "Apple issue",
  ]);
  expect(issueButton).toHaveFocus();
});
