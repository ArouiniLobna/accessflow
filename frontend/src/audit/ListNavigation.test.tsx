import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { AppRoutes } from "../AppRoutes";
import { jsonResponse, makeAudit, makeIssue } from "../test/fixtures";
import { renderWithProviders } from "../test/renderWithProviders";

const audit = makeAudit({
  issues: [
    makeIssue({ id: "c1", impact: "critical", title: "Critical one" }),
    makeIssue({ id: "m1", impact: "minor", title: "Minor one" }),
  ],
});

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(audit));
});

afterEach(() => {
  vi.restoreAllMocks();
});

function LocationProbe() {
  const location = useLocation();
  return (
    <output data-testid="location">
      {location.pathname + location.search}
    </output>
  );
}

function renderApp(route: string) {
  return renderWithProviders(
    <>
      <AppRoutes />
      <LocationProbe />
    </>,
    { route },
  );
}

it("restores the filters from the address", async () => {
  renderApp("/?impact=minor");

  expect(
    await screen.findByRole("checkbox", { name: "Minor (1)" }),
  ).toBeChecked();
  expect(
    screen.getByRole("checkbox", { name: "Critical (1)" }),
  ).not.toBeChecked();
  expect(
    screen.queryByRole("link", { name: "Critical one" }),
  ).not.toBeInTheDocument();
});

it("writes filter changes to the address", async () => {
  const user = userEvent.setup();
  renderApp("/");

  await user.click(
    await screen.findByRole("checkbox", { name: "Critical (1)" }),
  );

  expect(screen.getByTestId("location")).toHaveTextContent(
    "/?impact=serious&impact=moderate&impact=minor&impact=unknown",
  );
});

it("returns focus to the issue you opened, keeping the filters", async () => {
  const user = userEvent.setup();
  renderApp("/?impact=critical");

  await user.click(await screen.findByRole("link", { name: "Critical one" }));
  await screen.findByRole("heading", { level: 1, name: "Critical one" });

  await user.click(screen.getByRole("link", { name: "Back to all issues" }));

  expect(
    await screen.findByRole("link", { name: "Critical one" }),
  ).toHaveFocus();
  expect(screen.getByTestId("location")).toHaveTextContent("/?impact=critical");
});

it("goes to the list's start when the issue was opened from a shared link", async () => {
  const user = userEvent.setup();
  renderApp("/issues/c1");

  await user.click(
    await screen.findByRole("link", { name: "Back to all issues" }),
  );

  expect(
    await screen.findByRole("heading", {
      level: 1,
      name: "Accessibility audit",
    }),
  ).toHaveFocus();
  expect(screen.getByTestId("location")).toHaveTextContent(/^\/$/);
});
