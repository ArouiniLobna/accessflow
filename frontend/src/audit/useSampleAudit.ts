import { useQuery } from "@tanstack/react-query";

import { fetchSampleAudit } from "../api/audits";

export const sampleAuditQueryKey = ["audits", "sample"] as const;

export function useSampleAudit() {
  return useQuery({
    queryKey: sampleAuditQueryKey,
    queryFn: ({ signal }) => fetchSampleAudit(signal),
    staleTime: 30_000,
  });
}
