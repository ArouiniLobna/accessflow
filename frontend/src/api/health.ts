import type { HealthResponse } from "./types";
import { getJson } from "./client";

export async function fetchHealth(
  signal?: AbortSignal,
): Promise<HealthResponse> {
  return getJson<HealthResponse>("/health", signal);
}
