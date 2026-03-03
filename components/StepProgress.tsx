import React from "react";

interface StepProgressProps {
  current: number;
  total: number;
}

const StepProgress: React.FC<StepProgressProps> = ({ current, total }) => (
  <div className="flex gap-1.5 mb-6">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
          i < current
            ? "bg-indigo-500"
            : i === current
              ? "bg-indigo-300"
              : "bg-slate-100"
        }`}
      />
    ))}
  </div>
);

export default StepProgress;
