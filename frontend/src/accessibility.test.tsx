import { screen } from "@testing-library/react";
import { afterEach, it, vi } from "vitest";

import { AppRoutes } from "./AppRoutes";
import { expectNoAxeViolations } from "./test/axe";
import {
  jsonResponse,
  makeAudit,
  makeIssue,
  makeTriageResponse,
} from "./test/fixtures";
import { mockFetch } from "./test/mockFetch";
import { renderWithProviders } from "./test/renderWithProviders";

const AUDIT_URL = "/api/v1/audits/sample";
const TRIAGE_URL = "/api/v1/triage";

const issues = [
  makeIssue({
    id: "c1",
    impact: "critical",
    title: "Form elements must have labels",
  }),
  makeIssue({ id: "u1", impact: null, title: "Unrated issue" }),
  makeIssue({
    id: "b1",
    impact: "moderate",
    title: "Heading order",
    wcag_criteria: [],
  }),
];
const audit = makeAudit({ issues });

function mockWorkingApi() {
  mockFetch({
    [AUDIT_URL]: () => jsonResponse(audit),
    [TRIAGE_URL]: () => jsonResponse(makeTriageResponse(issues)),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

it("audit page with priorities", async () => {
  mockWorkingApi();
  const { container } = renderWithProviders(<AppRoutes />);

  await screen.findAllByRole("cell", { name: "P1" });
  await expectNoAxeViolations(container);
});

it("audit page while loading", async () => {
  vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}));
  const { container } = renderWithProviders(<AppRoutes />);

  await screen.findByText("Loading audit…");
  await expectNoAxeViolations(container);
});

it("audit page when the audit can't be loaded", async () => {
  mockFetch({ [AUDIT_URL]: () => new Response(null, { status: 500 }) });
  const { container } = renderWithProviders(<AppRoutes />);

  await screen.findByText("The audit couldn't be loaded.");
  await expectNoAxeViolations(container);
});

it("audit page with no issues", async () => {
  mockFetch({ [AUDIT_URL]: () => jsonResponse(makeAudit({ issues: [] })) });
  const { container } = renderWithProviders(<AppRoutes />);

  await screen.findByText("Audit loaded: 0 issues found.");
  await expectNoAxeViolations(container);
});

it("audit page when priorities can't be calculated", async () => {
  mockFetch({
    [AUDIT_URL]: () => jsonResponse(audit),
    [TRIAGE_URL]: () => new Response(null, { status: 500 }),
  });
  const { container } = renderWithProviders(<AppRoutes />);

  await screen.findByText(/Priorities couldn't be calculated/);
  await expectNoAxeViolations(container);
});

it("issue page", async () => {
  mockWorkingApi();
  const { container } = renderWithProviders(<AppRoutes />, {
    route: "/issues/c1",
  });

  await screen.findByText("Test reason.");
  await expectNoAxeViolations(container);
});

it("issue not found page", async () => {
  mockWorkingApi();
  const { container } = renderWithProviders(<AppRoutes />, {
    route: "/issues/missing",
  });

  await screen.findByRole("heading", { level: 1, name: "Issue not found" });
  await expectNoAxeViolations(container);
});

it("page not found", async () => {
  const { container } = renderWithProviders(<AppRoutes />, {
    route: "/nowhere",
  });

  await screen.findByRole("heading", { level: 1, name: "Page not found" });
  await expectNoAxeViolations(container);
});
