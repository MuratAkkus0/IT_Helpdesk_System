import React from "react";
import { FiChevronDown } from "react-icons/fi";
import type { SelectProps } from "../../types";

const Select: React.FC<SelectProps> = ({
  options = [],
  value,
  onChange,
  placeholder = "Seçiniz...",
  disabled = false,
  error,
  className = "",
  ...props
}) => {
  const baseClasses =
    "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pr-10 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed appearance-none";

  const errorClasses = error ? "border-red-500 focus:ring-red-500" : "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="relative">
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`${baseClasses} ${errorClasses} ${className}`}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option key={index} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <FiChevronDown className="w-4 h-4 text-gray-400" />
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default Select;
