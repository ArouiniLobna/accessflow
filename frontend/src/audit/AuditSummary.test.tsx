import { fireEvent, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { jsonResponse, makeAudit, makeIssue } from "../test/fixtures";
import { renderWithProviders } from "../test/renderWithProviders";
import { AuditSummary } from "./AuditSummary";

afterEach(() => {
  vi.restoreAllMocks();
});

it("announces that the audit is loading", () => {
  vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}));

  renderWithProviders(<AuditSummary />);

  expect(screen.getByRole("status")).toHaveTextContent("Loading audit…");
});

it("announces the result and shows counts by impact", async () => {
  const audit = makeAudit({
    issues: [
      makeIssue({ id: "a", impact: "critical" }),
      makeIssue({ id: "b", impact: null }),
    ],
  });
  vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(audit));

  renderWithProviders(<AuditSummary />);

  await screen.findByText("Audit loaded: 2 issues found.");
  expect(screen.getByText("Critical: 1")).toBeInTheDocument();
  expect(screen.getByText("Serious: 0")).toBeInTheDocument();
  expect(screen.getByText("Impact not reported: 1")).toBeInTheDocument();
  expect(
    screen.getByRole("region", { name: "Audit summary" }),
  ).toBeInTheDocument();
});

it("reminds the user that no violations doesn't mean accessible", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    jsonResponse(makeAudit({ issues: [] })),
  );

  renderWithProviders(<AuditSummary />);

  await screen.findByText("Audit loaded: 0 issues found.");
  expect(
    screen.getByText(/manual testing is still needed/i),
  ).toBeInTheDocument();
});

it("shows an error and loads successfully after trying again", async () => {
  vi.spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(new Response(null, { status: 500 }))
    .mockResolvedValueOnce(jsonResponse(makeAudit()));

  renderWithProviders(<AuditSummary />);

  await screen.findByText("The audit couldn't be loaded.");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));

  await screen.findByText("Audit loaded: 1 issue found.");
  expect(
    screen.queryByRole("button", { name: "Try again" }),
  ).not.toBeInTheDocument();
});
