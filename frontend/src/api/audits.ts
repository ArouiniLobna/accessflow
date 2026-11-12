import { getJson } from "./client";
import type { Audit } from "./types";

export function fetchSampleAudit(signal?: AbortSignal): Promise<Audit> {
  return getJson<Audit>("/api/v1/audits/sample", signal);
}
