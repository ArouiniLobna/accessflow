import { Route, Routes } from "react-router";

import { AuditPage } from "./audit/AuditPage";
import { IssueDetailPage } from "./audit/IssueDetailPage";
import { NotFoundPage } from "./layout/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuditPage />} />
      <Route path="/issues/:issueId" element={<IssueDetailPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
