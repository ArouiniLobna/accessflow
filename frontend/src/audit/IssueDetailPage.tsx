import type { MouseEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import type { UseQueryResult } from "@tanstack/react-query";
import { useTriage, type TriageByIssue } from "./useTriage";
import { cameFromList } from "./navigationState";
import type { Issue, ReviewStatus } from "../api/types";
import { PageHeading } from "../layout/PageHeading";
import { usePageTitle } from "../layout/usePageTitle";
import { isSafeHttpUrl } from "../lib/urls";
import { IMPACT_FILTER_LABELS, formatTarget, impactOf } from "./issues";
import { useSampleAudit } from "./useSampleAudit";

const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  unreviewed: "Not reviewed yet",
  confirmed: "Confirmed",
  dismissed: "Dismissed",
};

export function IssueDetailPage() {
  const { issueId } = useParams();
  const query = useSampleAudit();
  const triage = useTriage(query.data);

  if (query.isSuccess) {
    const issue = query.data.issues.find(
      (candidate) => candidate.id === issueId,
    );
    return (
      <>
        <BackToList />
        {issue ? (
          <IssueDetails key={issue.id} issue={issue} triage={triage} />
        ) : (
          <IssueNotFound />
        )}
      </>
    );
  }

  return (
    <>
      <BackToList />
      <p role="status">
        {query.isError ? "The audit couldn't be loaded." : "Loading issue…"}
      </p>
      {query.isError && (
        <button type="button" onClick={() => query.refetch()}>
          Try again
        </button>
      )}
    </>
  );
}

function IssueDetails({
  issue,
  triage,
}: {
  issue: Issue;
  triage: UseQueryResult<TriageByIssue>;
}) {
  usePageTitle(issue.title);
  const { evidence } = issue;

  return (
    <>
      <PageHeading>{issue.title}</PageHeading>

      <section aria-labelledby="scanner-heading">
        <h2 id="scanner-heading">From the scanner</h2>
        <p>Reported by the automated scan and shown exactly as received.</p>
        <dl>
          <dt>Rule</dt>
          <dd>
            <code>{issue.rule_id}</code>
          </dd>
          <dt>Impact</dt>
          <dd>{IMPACT_FILTER_LABELS[impactOf(issue)]}</dd>
          <dt>WCAG</dt>
          <dd>
            {issue.wcag_criteria.length > 0
              ? issue.wcag_criteria.join(", ")
              : "Best practice"}
          </dd>
          <dt>Description</dt>
          <dd>{issue.description}</dd>
          <dt>Element</dt>
          <dd>
            <code>{formatTarget(evidence.target)}</code>
          </dd>
          <dt>HTML</dt>
          <dd>
            <pre>
              <code>{evidence.html}</code>
            </pre>
          </dd>
          {evidence.failure_summary && (
            <>
              <dt>What failed</dt>
              <dd className="preserve-lines">{evidence.failure_summary}</dd>
            </>
          )}
          <dt>Rule documentation</dt>
          <dd>
            <HelpLink url={issue.help_url} />
          </dd>
        </dl>
      </section>

      <section aria-labelledby="accessflow-heading">
        <h2 id="accessflow-heading">Added by AccessFlow</h2>
        <dl>
          <dt>Priority</dt>
          <dd>
            <PriorityDetails triage={triage} issueId={issue.id} />
          </dd>
          <dt>Review status</dt>
          <dd>{REVIEW_STATUS_LABELS[issue.review_status ?? "unreviewed"]}</dd>
        </dl>
      </section>
    </>
  );
}

function PriorityDetails({
  triage,
  issueId,
}: {
  triage: UseQueryResult<TriageByIssue>;
  issueId: string;
}) {
  if (triage.isError) {
    return <>Couldn't be calculated.</>;
  }
  if (!triage.isSuccess) {
    return <>Calculating…</>;
  }

  const result = triage.data.get(issueId);
  if (!result) {
    return <>Not available.</>;
  }

  return (
    <>
      <p>{result.priority}</p>
      <p>Set by fixed rules, not AI. Why:</p>
      <ul>
        {result.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </>
  );
}

function HelpLink({ url }: { url: string }) {
  if (!isSafeHttpUrl(url)) {
    return <span>{url}</span>;
  }
  return (
    <a href={url}>Read the rule documentation ({new URL(url).hostname})</a>
  );
}

function IssueNotFound() {
  usePageTitle("Issue not found");

  return (
    <>
      <PageHeading>Issue not found</PageHeading>
      <p>
        This issue isn't in the current audit. The link may be from a different
        scan.
      </p>
    </>
  );
}

function BackToList() {
  const location = useLocation();
  const navigate = useNavigate();
  const fromList = cameFromList(location.state);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const opensElsewhere =
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey;

    if (fromList && !opensElsewhere) {
      event.preventDefault();
      navigate(-1);
    }
  }

  return (
    <p>
      <Link to="/" onClick={handleClick}>
        Back to all issues
      </Link>
    </p>
  );
}
