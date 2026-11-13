import { useEffect, useRef, type RefObject } from "react";
import { Link, useLocation, useSearchParams } from "react-router";
import type { UseQueryResult } from "@tanstack/react-query";
import { useTriage, type TriageByIssue } from "./useTriage";
import type { Issue } from "../api/types";
import { ImpactFilter } from "./ImpactFilter";
import type { ImpactOrUnknown, SortKey, SortState } from "./issues";
import {
  describeSort,
  filterIssuesByImpact,
  formatTarget,
  nextSort,
  sortIssues,
} from "./issues";
import { parseListView, serializeListView, type ListView } from "./listView";
import {
  readReturnFocusTo,
  type IssueEntryState,
  type ListEntryState,
} from "./navigationState";
import { SortableHeader } from "./SortableHeader";
import { IMPACT_LABELS, countIssuesByImpact, issueCountText } from "./summary";
import { useSampleAudit } from "./useSampleAudit";

const FROM_LIST: IssueEntryState = { fromList: true };
function priorityText(
  triage: UseQueryResult<TriageByIssue>,
  issueId: string,
): string {
  if (triage.isError) {
    return "Unavailable";
  }
  if (!triage.isSuccess) {
    return "Calculating…";
  }
  return triage.data.get(issueId)?.priority ?? "Unavailable";
}

export function IssueList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const query = useSampleAudit();
  const triage = useTriage(query.data);
  const returnFocusTo = readReturnFocusTo(location.state);
  const returnLinkRef = useRef<HTMLAnchorElement>(null);
  const isLoaded = query.isSuccess;

  useEffect(() => {
    if (isLoaded) {
      returnLinkRef.current?.focus();
    }
  }, [isLoaded, returnFocusTo]);

  if (!query.isSuccess) {
    return null;
  }

  const view = parseListView(searchParams);

  function updateView(next: ListView) {
    setSearchParams(serializeListView(next), { replace: true });
  }

  function toggleImpact(impact: ImpactOrUnknown) {
    const impacts = new Set(view.impacts);
    if (impacts.has(impact)) {
      impacts.delete(impact);
    } else {
      impacts.add(impact);
    }
    updateView({ ...view, impacts });
  }

  function changeSort(key: SortKey) {
    updateView({ ...view, sort: nextSort(view.sort, key) });
  }

  function rememberOpenedIssue(issueId: string) {
    const state: ListEntryState = { returnFocusTo: issueId };
    setSearchParams(searchParams, { replace: true, state });
  }

  const allIssues = query.data.issues;
  const counts = countIssuesByImpact(allIssues);
  const visibleIssues = sortIssues(
    filterIssuesByImpact(allIssues, view.impacts),
    view.sort,
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
            selected={view.impacts}
            onToggle={toggleImpact}
          />

          <p role="status">
            Showing {visibleIssues.length} of {issueCountText(allIssues.length)}
            . Sorted {describeSort(view.sort)}.
            {triage.isError && " Priorities couldn't be calculated."}
          </p>
          {triage.isError && (
            <button type="button" onClick={() => triage.refetch()}>
              Try calculating priorities again
            </button>
          )}

          {visibleIssues.length === 0 ? (
            <p>No issues match the selected impact levels.</p>
          ) : (
            <IssueTable
              issues={visibleIssues}
              sort={view.sort}
              onSort={changeSort}
              onOpenIssue={rememberOpenedIssue}
              returnFocusTo={returnFocusTo}
              returnLinkRef={returnLinkRef}
              priorityOf={(issueId) => priorityText(triage, issueId)}
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
  onOpenIssue: (issueId: string) => void;
  returnFocusTo: string | undefined;
  returnLinkRef: RefObject<HTMLAnchorElement | null>;
  priorityOf: (issueId: string) => string;
};

function IssueTable({
  issues,
  sort,
  onSort,
  onOpenIssue,
  returnFocusTo,
  priorityOf,
  returnLinkRef,
}: IssueTableProps) {
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
            <th scope="col">Priority</th>
            <th scope="col">Element</th>
            <th scope="col">WCAG</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id}>
              <th scope="row">
                <Link
                  to={`/issues/${encodeURIComponent(issue.id)}`}
                  state={FROM_LIST}
                  ref={issue.id === returnFocusTo ? returnLinkRef : undefined}
                  onClick={() => onOpenIssue(issue.id)}
                >
                  {issue.title}
                </Link>
              </th>
              <td>
                {issue.impact ? IMPACT_LABELS[issue.impact] : "Not reported"}
              </td>
              <td>{priorityOf(issue.id)}</td>
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
