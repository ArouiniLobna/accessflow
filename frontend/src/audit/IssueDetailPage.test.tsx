import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";

import { AppRoutes } from "../AppRoutes";
import {
  jsonResponse,
  makeAudit,
  makeIssue,
  makeTriageResponse,
} from "../test/fixtures";
import { renderWithProviders } from "../test/renderWithProviders";
import { mockFetch, requestsTo } from "../test/mockFetch";

afterEach(() => {
  vi.restoreAllMocks();
});

function mockAudit(issues = [makeIssue()]) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(jsonResponse(makeAudit({ issues })));
}

it("shows the issue, focuses its heading and sets the page title", async () => {
  mockAudit([
    makeIssue({ id: "abc", title: "Images must have alternative text" }),
  ]);

  renderWithProviders(<AppRoutes />, { route: "/issues/abc" });

  const heading = await screen.findByRole("heading", {
    level: 1,
    name: "Images must have alternative text",
  });
  expect(heading).toHaveFocus();
  expect(document.title).toBe("Images must have alternative text - AccessFlow");
  expect(
    screen.getByRole("region", { name: "From the scanner" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("region", { name: "Added by AccessFlow" }),
  ).toBeInTheDocument();
});

it("shows evidence HTML as text and never renders it", async () => {
  const malicious = '<img src="x" onerror="alert(1)">';
  mockAudit([
    makeIssue({
      id: "abc",
      evidence: { html: malicious, target: ["img"], failure_summary: null },
    }),
  ]);

  const { container } = renderWithProviders(<AppRoutes />, {
    route: "/issues/abc",
  });

  expect(await screen.findByText(malicious)).toBeInTheDocument();
  expect(container.querySelector("img")).toBeNull();
});

it("shows an unsafe documentation link as plain text", async () => {
  mockAudit([makeIssue({ id: "abc", help_url: "javascript:alert(1)" })]);

  renderWithProviders(<AppRoutes />, { route: "/issues/abc" });

  expect(await screen.findByText("javascript:alert(1)")).toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: /rule documentation/i }),
  ).not.toBeInTheDocument();
});

it("explains when the issue isn't in the audit", async () => {
  mockAudit();

  renderWithProviders(<AppRoutes />, { route: "/issues/does-not-exist" });

  expect(
    await screen.findByRole("heading", { level: 1, name: "Issue not found" }),
  ).toHaveFocus();
  expect(
    screen.getByRole("link", { name: "Back to all issues" }),
  ).toBeInTheDocument();
});

it("opens an issue from the list without fetching the audit again", async () => {
  const user = userEvent.setup();
  const issues = [
    makeIssue({ id: "abc", title: "Form elements must have labels" }),
  ];
  const spy = mockFetch({
    "/api/v1/audits/sample": () => jsonResponse(makeAudit({ issues })),
    "/api/v1/triage": () => jsonResponse(makeTriageResponse(issues)),
  });

  renderWithProviders(<AppRoutes />);

  await user.click(
    await screen.findByRole("link", { name: "Form elements must have labels" }),
  );

  expect(
    await screen.findByRole("heading", {
      level: 1,
      name: "Form elements must have labels",
    }),
  ).toHaveFocus();
  expect(requestsTo(spy, "/api/v1/audits/sample")).toHaveLength(1);
  expect(requestsTo(spy, "/api/v1/triage")).toHaveLength(1);
});

it("shows a not-found page for unknown addresses", async () => {
  renderWithProviders(<AppRoutes />, { route: "/nowhere" });

  expect(
    await screen.findByRole("heading", { level: 1, name: "Page not found" }),
  ).toHaveFocus();
});
