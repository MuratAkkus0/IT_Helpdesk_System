import { FiSearch } from "react-icons/fi";
import Input from "../atoms/Input";
import type { SearchBarProps } from "../../types";

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search tickets...",
}: SearchBarProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        icon={<FiSearch />}
        className="w-full"
      />
    </div>
  );
};

export default SearchBar;
