import type { ImpactOrUnknown } from "./issues";
import { IMPACT_FILTER_LABELS, IMPACT_FILTER_ORDER } from "./issues";
import type { ImpactCounts } from "./summary";

type ImpactFilterProps = {
  counts: ImpactCounts;
  selected: ReadonlySet<ImpactOrUnknown>;
  onToggle: (impact: ImpactOrUnknown) => void;
};

export function ImpactFilter({
  counts,
  selected,
  onToggle,
}: ImpactFilterProps) {
  const options = IMPACT_FILTER_ORDER.filter(
    (impact) => impact !== "unknown" || counts.unknown > 0,
  );

  return (
    <fieldset className="impact-filter">
      <legend>Filter by impact</legend>
      {options.map((impact) => (
        <label key={impact}>
          <input
            type="checkbox"
            checked={selected.has(impact)}
            onChange={() => onToggle(impact)}
          />
          {IMPACT_FILTER_LABELS[impact]} ({counts[impact]})
        </label>
      ))}
    </fieldset>
  );
}
