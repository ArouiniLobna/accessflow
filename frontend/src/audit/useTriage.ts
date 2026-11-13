import { skipToken, useQuery } from "@tanstack/react-query";

import { triageIssues } from "../api/triage";
import type { Audit, TriageResponse, TriageResult } from "../api/types";

export type TriageByIssue = ReadonlyMap<string, TriageResult>;

function indexByIssue(response: TriageResponse): TriageByIssue {
  return new Map<string, TriageResult>(
    response.results.map((result) => [result.issue_id, result]),
  );
}

export function useTriage(audit: Audit | undefined) {
  const canTriage = audit !== undefined && audit.issues.length > 0;

  return useQuery({
    queryKey: ["triage", audit?.id],
    queryFn: canTriage
      ? ({ signal }) => triageIssues(audit.issues, signal)
      : skipToken,
    staleTime: Infinity,
    select: indexByIssue,
  });
}
