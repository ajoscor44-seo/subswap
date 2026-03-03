import React from "react";

interface OptionCardProps {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({
  icon,
  label,
  selected,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 min-w-[calc(50%-8px)] p-4 rounded-2xl border-2 text-center transition-all font-bold text-sm flex flex-col items-center gap-2 ${
      selected
        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
        : "border-slate-100 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/40"
    }`}
  >
    <span
      className={`text-xl ${selected ? "text-indigo-500" : "text-slate-400"}`}
    >
      {icon}
    </span>
    <span className="text-xs leading-tight">{label}</span>
  </button>
);

export default OptionCard;
