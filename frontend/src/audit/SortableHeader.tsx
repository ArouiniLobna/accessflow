import type { SortKey, SortState } from "./issues";

type SortableHeaderProps = {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
};

export function SortableHeader({
  label,
  sortKey,
  sort,
  onSort,
}: SortableHeaderProps) {
  const isActive = sort.key === sortKey;
  const icon = !isActive ? "↕" : sort.direction === "ascending" ? "▲" : "▼";

  return (
    <th scope="col" aria-sort={isActive ? sort.direction : undefined}>
      <button
        type="button"
        className="sort-button"
        onClick={() => onSort(sortKey)}
      >
        {label}
        <span className="sort-icon" aria-hidden="true">
          {icon}
        </span>
      </button>
    </th>
  );
}
