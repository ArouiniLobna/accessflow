export type ListEntryState = { returnFocusTo: string };
export type IssueEntryState = { fromList: true };

export function readReturnFocusTo(state: unknown): string | undefined {
  if (
    typeof state === "object" &&
    state !== null &&
    "returnFocusTo" in state &&
    typeof state.returnFocusTo === "string"
  ) {
    return state.returnFocusTo;
  }
  return undefined;
}

export function cameFromList(state: unknown): boolean {
  return (
    typeof state === "object" &&
    state !== null &&
    "fromList" in state &&
    state.fromList === true
  );
}
