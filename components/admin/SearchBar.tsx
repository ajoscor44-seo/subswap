import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
}) => (
  <div className="relative w-full md:w-80">
    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
    <input
      type="text"
      placeholder={placeholder}
      className="w-full bg-white border border-slate-200 py-3 pl-11 pr-4 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);
