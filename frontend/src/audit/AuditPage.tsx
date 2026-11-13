import { PageHeading } from "../layout/PageHeading";
import { usePageTitle } from "../layout/usePageTitle";
import { AuditSummary } from "./AuditSummary";
import { IssueList } from "./IssueList";

export function AuditPage() {
  usePageTitle("Accessibility audit");

  return (
    <>
      <PageHeading>Accessibility audit</PageHeading>
      <AuditSummary />
      <IssueList />
    </>
  );
}
