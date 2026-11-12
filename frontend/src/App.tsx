import { AuditSummary } from "./audit/AuditSummary";
import { BackendStatus } from "./BackendStatus";

export default function App() {
  return (
    <main>
      <h1>AccessFlow</h1>
      <BackendStatus />
      <AuditSummary />
    </main>
  );
}
