import { vi } from "vitest";

type RouteHandler = () => Response;

export function mockFetch(routes: Record<string, RouteHandler>) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const path =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.pathname
          : input.url;
    const handler = routes[path];
    if (!handler) {
      throw new Error(`Test made an unexpected request to ${path}`);
    }
    return handler();
  });
}

export function requestsTo(spy: ReturnType<typeof mockFetch>, path: string) {
  return spy.mock.calls.filter(([input]) => input === path);
}
