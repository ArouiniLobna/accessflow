import type { UseQueryResult } from "@tanstack/react-query";

import type { Audit } from "../api/types";
import { IMPACT_LABELS, IMPACT_ORDER, countIssuesByImpact } from "./summary";
import { useSampleAudit } from "./useSampleAudit";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function issueCountText(count: number): string {
  return `${count} ${count === 1 ? "issue" : "issues"}`;
}

function statusMessage(query: UseQueryResult<Audit>): string {
  if (query.isPending) {
    return "Loading audit…";
  }
  if (query.isError) {
    return query.isFetching ? "Trying again…" : "The audit couldn't be loaded.";
  }
  return `Audit loaded: ${issueCountText(query.data.issues.length)} found.`;
}

export function AuditSummary() {
  const query = useSampleAudit();

  return (
    <section aria-labelledby="audit-summary-heading">
      <h2 id="audit-summary-heading">Audit summary</h2>

      <p role="status">{statusMessage(query)}</p>

      {query.isError && (
        <button type="button" onClick={() => query.refetch()}>
          Try again
        </button>
      )}

      {query.isSuccess && <AuditDetails audit={query.data} />}
    </section>
  );
}

function AuditDetails({ audit }: { audit: Audit }) {
  const counts = countIssuesByImpact(audit.issues);

  return (
    <>
      <dl>
        <dt>Page</dt>
        <dd>{audit.page_url}</dd>
        <dt>Scanned</dt>
        <dd>
          <time dateTime={audit.scanned_at}>
            {dateFormatter.format(new Date(audit.scanned_at))}
          </time>
        </dd>
        <dt>Engine</dt>
        <dd>{audit.engine}</dd>
      </dl>

      {audit.issues.length === 0 ? (
        <p>
          The automated scan found no violations. Automated checks can't catch
          every issue, so manual testing is still needed.
        </p>
      ) : (
        <>
          <h3>Issues by impact</h3>
          <ul>
            {IMPACT_ORDER.map((impact) => (
              <li key={impact}>
                {IMPACT_LABELS[impact]}: {counts[impact]}
              </li>
            ))}
            {counts.unknown > 0 && (
              <li>Impact not reported: {counts.unknown}</li>
            )}
          </ul>
        </>
      )}
    </>
  );
}
