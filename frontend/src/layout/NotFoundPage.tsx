import { Link } from "react-router";

import { PageHeading } from "./PageHeading";
import { usePageTitle } from "./usePageTitle";

export function NotFoundPage() {
  usePageTitle("Page not found");

  return (
    <>
      <PageHeading>Page not found</PageHeading>
      <p>
        <Link to="/">Go to the audit</Link>
      </p>
    </>
  );
}
