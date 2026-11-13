import type {
  ImpactOrUnknown,
  SortDirection,
  SortKey,
  SortState,
} from "./issues";
import { DEFAULT_SORT, FIRST_DIRECTION, IMPACT_FILTER_ORDER } from "./issues";

export type ListView = {
  impacts: ReadonlySet<ImpactOrUnknown>;
  sort: SortState;
};

const SORT_KEYS: readonly SortKey[] = ["impact", "title"];
const SORT_DIRECTIONS: readonly SortDirection[] = ["ascending", "descending"];
const NOTHING_SELECTED = "none";

function isOneOf<T extends string>(
  value: string | null,
  allowed: readonly T[],
): value is T {
  return value !== null && (allowed as readonly string[]).includes(value);
}

function parseImpacts(params: URLSearchParams): ReadonlySet<ImpactOrUnknown> {
  const requested = params.getAll("impact");
  if (requested.length === 0) {
    return new Set(IMPACT_FILTER_ORDER);
  }
  return new Set(
    requested.filter((value) => isOneOf(value, IMPACT_FILTER_ORDER)),
  );
}

function parseSort(params: URLSearchParams): SortState {
  const key = params.get("sort");
  if (!isOneOf(key, SORT_KEYS)) {
    return DEFAULT_SORT;
  }
  const order = params.get("order");
  return {
    key,
    direction: isOneOf(order, SORT_DIRECTIONS) ? order : FIRST_DIRECTION[key],
  };
}

export function parseListView(params: URLSearchParams): ListView {
  return { impacts: parseImpacts(params), sort: parseSort(params) };
}

export function serializeListView(view: ListView): URLSearchParams {
  const params = new URLSearchParams();

  if (view.impacts.size === 0) {
    params.append("impact", NOTHING_SELECTED);
  } else if (view.impacts.size < IMPACT_FILTER_ORDER.length) {
    for (const impact of IMPACT_FILTER_ORDER) {
      if (view.impacts.has(impact)) {
        params.append("impact", impact);
      }
    }
  }

  const isDefaultSort =
    view.sort.key === DEFAULT_SORT.key &&
    view.sort.direction === DEFAULT_SORT.direction;
  if (!isDefaultSort) {
    params.set("sort", view.sort.key);
    params.set("order", view.sort.direction);
  }

  return params;
}
