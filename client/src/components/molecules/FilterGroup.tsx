import Button from "../atoms/Button";
import type { FilterGroupProps } from "../../types";

const FilterGroup = ({
  filters,
  activeFilter,
  onFilterChange,
}: FilterGroupProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.value ? "primary" : "secondary"}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
          className="whitespace-nowrap"
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};

export default FilterGroup;
