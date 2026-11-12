import { useState } from "react";

import type { Issue } from "../api/types";
import { ImpactFilter } from "./ImpactFilter";
import type { ImpactOrUnknown } from "./issues";
import {
  IMPACT_FILTER_ORDER,
  filterIssuesByImpact,
  formatTarget,
  sortIssuesByImpact,
} from "./issues";
import { IMPACT_LABELS, countIssuesByImpact, issueCountText } from "./summary";
import { useSampleAudit } from "./useSampleAudit";

export function IssueList() {
  const query = useSampleAudit();
  const [selectedImpacts, setSelectedImpacts] = useState<
    ReadonlySet<ImpactOrUnknown>
  >(() => new Set(IMPACT_FILTER_ORDER));

  if (!query.isSuccess) {
    return null;
  }

  function toggleImpact(impact: ImpactOrUnknown) {
    setSelectedImpacts((current) => {
      const next = new Set(current);
      if (next.has(impact)) {
        next.delete(impact);
      } else {
        next.add(impact);
      }
      return next;
    });
  }

  const allIssues = query.data.issues;
  const counts = countIssuesByImpact(allIssues);
  const visibleIssues = sortIssuesByImpact(
    filterIssuesByImpact(allIssues, selectedImpacts),
  );

  return (
    <section aria-labelledby="issue-list-heading">
      <h2 id="issue-list-heading">Issues</h2>

      {allIssues.length === 0 ? (
        <p>No issues to list.</p>
      ) : (
        <>
          <ImpactFilter
            counts={counts}
            selected={selectedImpacts}
            onToggle={toggleImpact}
          />

          <p role="status">
            Showing {visibleIssues.length} of {issueCountText(allIssues.length)}
            .
          </p>

          {visibleIssues.length === 0 ? (
            <p>No issues match the selected impact levels.</p>
          ) : (
            <IssueTable issues={visibleIssues} />
          )}
        </>
      )}
    </section>
  );
}

function IssueTable({ issues }: { issues: Issue[] }) {
  return (
    <div
      className="table-scroll"
      role="region"
      aria-labelledby="issue-table-caption"
      tabIndex={0}
    >
      <table>
        <caption id="issue-table-caption">
          {issueCountText(issues.length)}, most severe first
        </caption>
        <thead>
          <tr>
            <th scope="col">Issue</th>
            <th scope="col">Impact</th>
            <th scope="col">Element</th>
            <th scope="col">WCAG</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id}>
              <th scope="row">{issue.title}</th>
              <td>
                {issue.impact ? IMPACT_LABELS[issue.impact] : "Not reported"}
              </td>
              <td>
                <code>{formatTarget(issue.evidence.target)}</code>
              </td>
              <td>
                {issue.wcag_criteria.length > 0
                  ? issue.wcag_criteria.join(", ")
                  : "Best practice"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
