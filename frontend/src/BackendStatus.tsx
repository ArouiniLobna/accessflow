import { use, useEffect, useState } from "react";

import { fetchHealth } from "./api/health";

type Status = "checking" | "online" | "offline";

const MESSAGES: Record<Status, string> = {
  checking: "Checking the API…",
  online: "API is online.",
  offline: "Can't reach the API. Is the backend running?",
};

export function BackendStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const controller = new AbortController();

    fetchHealth(controller.signal)
      .then(() => setStatus("online"))
      .catch(() => {
        if (!controller.signal.aborted) {
          setStatus("offline");
        }
      });

    return () => controller.abort();
  }, []);

  return <p role="status">{MESSAGES[status]}</p>;
}
