import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  accent?: "indigo" | "emerald" | "amber" | "red" | "dark";
  sub?: string;
  trend?: { value: number; label: string };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  accent = "indigo",
  sub,
  trend,
}) => {
  const styles = {
    indigo: {
      bg: "bg-indigo-600",
      text: "text-white",
      sub: "text-indigo-300",
      label: "text-indigo-200",
      icon: "text-white/10",
      trend: "bg-white/10 text-indigo-100",
    },
    emerald: {
      bg: "bg-white",
      text: "text-slate-900",
      sub: "text-emerald-600",
      label: "text-slate-400",
      icon: "text-slate-100",
      trend: "bg-emerald-50 text-emerald-600",
    },
    amber: {
      bg: "bg-white",
      text: "text-slate-900",
      sub: "text-amber-600",
      label: "text-slate-400",
      icon: "text-slate-100",
      trend: "bg-amber-50 text-amber-600",
    },
    red: {
      bg: "bg-white",
      text: "text-slate-900",
      sub: "text-red-500",
      label: "text-slate-400",
      icon: "text-slate-100",
      trend: "bg-red-50 text-red-500",
    },
    dark: {
      bg: "bg-slate-900",
      text: "text-white",
      sub: "text-slate-400",
      label: "text-slate-500",
      icon: "text-white/5",
      trend: "bg-white/10 text-slate-300",
    },
  };

  const s = styles[accent];

  return (
    <div
      className={`${s.bg} p-8 rounded-[2.5rem] border border-slate-100 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300`}
    >
      {/* Decorative icon */}
      <div
        className={`absolute -bottom-4 -right-4 ${s.icon} text-[6rem] leading-none pointer-events-none select-none group-hover:scale-110 transition-transform duration-500`}
      >
        <i className={`fa-solid ${icon}`} />
      </div>

      <p
        className={`text-[10px] font-black uppercase tracking-[0.25em] ${s.label} mb-3`}
      >
        {label}
      </p>

      <h3
        className={`text-4xl font-black ${s.text} tracking-tight leading-none mb-2`}
      >
        {value}
      </h3>

      {sub && <p className={`text-xs font-bold ${s.sub} mt-1`}>{sub}</p>}

      {trend && (
        <div
          className={`inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${s.trend}`}
        >
          <i
            className={`fa-solid ${trend.value >= 0 ? "fa-arrow-trend-up" : "fa-arrow-trend-down"} text-[9px]`}
          />
          {trend.label}
        </div>
      )}
    </div>
  );
};
