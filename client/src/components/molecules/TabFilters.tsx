import { FiFilter } from "react-icons/fi";
import Button from "../atoms/Button";
import type { TabFiltersProps } from "../../types";

const TabFilters = ({
  tabs,
  activeTab,
  onTabChange,
  filters,
  onFilterClick,
}: TabFiltersProps) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "primary" : "secondary"}
            size="md"
            onClick={() => onTabChange(tab.key)}
            className="whitespace-nowrap"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {filters && onFilterClick && (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={onFilterClick}
            className="flex items-center gap-2"
          >
            <FiFilter />
            Filtrele
          </Button>
        </div>
      )}
    </div>
  );
};

export default TabFilters;
