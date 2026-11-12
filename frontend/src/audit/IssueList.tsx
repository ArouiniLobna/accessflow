import type { Issue } from "../api/types";
import { formatTarget, sortIssuesByImpact } from "./issues";
import { IMPACT_LABELS, issueCountText } from "./summary";
import { useSampleAudit } from "./useSampleAudit";

export function IssueList() {
  const query = useSampleAudit();

  if (!query.isSuccess) {
    return null;
  }

  const issues = sortIssuesByImpact(query.data.issues);

  return (
    <section aria-labelledby="issue-list-heading">
      <h2 id="issue-list-heading">Issues</h2>
      {issues.length === 0 ? (
        <p>No issues to list.</p>
      ) : (
        <IssueTable issues={issues} />
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
