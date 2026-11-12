import { AuditSummary } from "./audit/AuditSummary";
import { IssueList } from "./audit/IssueList";
import { BackendStatus } from "./BackendStatus";

export default function App() {
  return (
    <main>
      <h1>AccessFlow</h1>
      <BackendStatus />
      <AuditSummary />
      <IssueList />
    </main>
  );
}
