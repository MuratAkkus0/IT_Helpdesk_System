import React from "react";
import type { InputProps } from "../../types";

const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  error,
  disabled = false,
  className = "",
  ...props
}) => {
  const baseClasses =
    "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const errorClasses = error ? "border-red-500 focus:ring-red-500" : "";

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${baseClasses} ${errorClasses} ${
          icon ? "pl-10" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default Input;
