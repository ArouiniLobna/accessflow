import { useState } from "react";
import { Link } from "react-router";
import type { Issue } from "../api/types";
import { ImpactFilter } from "./ImpactFilter";
import type { ImpactOrUnknown, SortKey, SortState } from "./issues";
import {
  DEFAULT_SORT,
  IMPACT_FILTER_ORDER,
  describeSort,
  filterIssuesByImpact,
  formatTarget,
  nextSort,
  sortIssues,
} from "./issues";
import { SortableHeader } from "./SortableHeader";
import { IMPACT_LABELS, countIssuesByImpact, issueCountText } from "./summary";
import { useSampleAudit } from "./useSampleAudit";

export function IssueList() {
  const query = useSampleAudit();
  const [selectedImpacts, setSelectedImpacts] = useState<
    ReadonlySet<ImpactOrUnknown>
  >(() => new Set(IMPACT_FILTER_ORDER));
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);

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

  function changeSort(key: SortKey) {
    setSort((current) => nextSort(current, key));
  }

  const allIssues = query.data.issues;
  const counts = countIssuesByImpact(allIssues);
  const visibleIssues = sortIssues(
    filterIssuesByImpact(allIssues, selectedImpacts),
    sort,
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
            . Sorted {describeSort(sort)}.
          </p>

          {visibleIssues.length === 0 ? (
            <p>No issues match the selected impact levels.</p>
          ) : (
            <IssueTable
              issues={visibleIssues}
              sort={sort}
              onSort={changeSort}
            />
          )}
        </>
      )}
    </section>
  );
}

type IssueTableProps = {
  issues: Issue[];
  sort: SortState;
  onSort: (key: SortKey) => void;
};

function IssueTable({ issues, sort, onSort }: IssueTableProps) {
  return (
    <div
      className="table-scroll"
      role="region"
      aria-labelledby="issue-table-caption"
      tabIndex={0}
    >
      <table>
        <caption id="issue-table-caption">
          {issueCountText(issues.length)}, {describeSort(sort)}
        </caption>
        <thead>
          <tr>
            <SortableHeader
              label="Issue"
              sortKey="title"
              sort={sort}
              onSort={onSort}
            />
            <SortableHeader
              label="Impact"
              sortKey="impact"
              sort={sort}
              onSort={onSort}
            />
            <th scope="col">Element</th>
            <th scope="col">WCAG</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id}>
              <th scope="row">
                <Link to={`/issues/${encodeURIComponent(issue.id)}`}>
                  {issue.title}
                </Link>
              </th>
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
