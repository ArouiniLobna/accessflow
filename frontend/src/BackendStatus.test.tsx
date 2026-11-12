import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { BackendStatus } from "./BackendStatus";

afterEach(() => {
  vi.restoreAllMocks();
});

it("starts by saying it is checking", () => {
  vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}));

  render(<BackendStatus />);

  expect(screen.getByRole("status")).toHaveTextContent("Checking the API…");
});

it("announces when the API is online", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ status: "ok", service: "accessflow-api" }), {
      status: 200,
    }),
  );

  render(<BackendStatus />);

  await screen.findByText("API is online.");
  expect(screen.getByRole("status")).toHaveTextContent("API is online.");
});

it("announces when the API returns an error", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(null, { status: 500 }),
  );

  render(<BackendStatus />);

  await screen.findByText(/can't reach the api/i);
});

it("announces when the API can't be reached at all", async () => {
  vi.spyOn(globalThis, "fetch").mockRejectedValue(
    new TypeError("Failed to fetch"),
  );

  render(<BackendStatus />);

  await screen.findByText(/can't reach the api/i);
});
