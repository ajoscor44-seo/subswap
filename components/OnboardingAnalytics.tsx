import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingRow {
  id: string;
  user_id: string;
  use_case: string | null;
  role: string | null;
  referral_source: string | null;
  created_at: string;
}

interface ChartBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
  icon?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const tally = (rows: OnboardingRow[], field: keyof OnboardingRow) => {
  const map: Record<string, number> = {};
  for (const row of rows) {
    const val = row[field] as string | null;
    if (!val) continue;
    map[val] = (map[val] || 0) + 1;
  }
  return Object.entries(map)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
};

// Icons for known onboarding labels
const ICONS: Record<string, string> = {
  "Movies & Shows": "fa-film",
  "Music Streaming": "fa-music",
  "Software & Dev Tools": "fa-laptop-code",
  "Online Courses": "fa-graduation-cap",
  Gaming: "fa-gamepad",
  "Business & Productivity": "fa-briefcase",
  "I want to host a slot": "fa-crown",
  "I want to join a slot": "fa-ticket",
  "Both — host & join": "fa-shuffle",
  "Just browsing for now": "fa-eye",
  Instagram: "fa-brands fa-instagram",
  TikTok: "fa-brands fa-tiktok",
  "Twitter / X": "fa-brands fa-x-twitter",
  "Friend or Family": "fa-users",
  "Google Search": "fa-brands fa-google",
  Podcast: "fa-microphone",
};

const COLORS = [
  "#4F46E5",
  "#059669",
  "#D97706",
  "#DC2626",
  "#7C3AED",
  "#0891B2",
];

// ─── Bar component ────────────────────────────────────────────────────────────

const ChartBar: React.FC<ChartBarProps> = ({
  label,
  count,
  total,
  color,
  icon,
}) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3 group">
      {icon && (
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-white text-[10px]"
          style={{ background: color }}
        >
          <i className={`fa-solid ${icon}`} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1">
          <span className="text-xs font-bold text-slate-700 truncate">
            {label}
          </span>
          <span className="text-[10px] font-black text-slate-400 ml-2 shrink-0">
            {count} · {pct}%
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Section ─────────────────────────────────────────────────────────────────

const Section: React.FC<{
  title: string;
  icon: string;
  iconColor: string;
  items: { label: string; count: number }[];
  total: number;
}> = ({ title, icon, iconColor, items, total }) => (
  <div className="bg-white rounded-4xl border border-slate-200 p-7 shadow-sm">
    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
      <i className={`fa-solid ${icon} text-xs`} style={{ color: iconColor }} />
      {title}
    </h3>
    {items.length === 0 ? (
      <p className="text-slate-400 text-sm font-medium text-center py-6">
        No data yet
      </p>
    ) : (
      <div className="space-y-4">
        {items.map((item, i) => (
          <ChartBar
            key={item.label}
            label={item.label}
            count={item.count}
            total={total}
            color={COLORS[i % COLORS.length]}
            icon={ICONS[item.label]}
          />
        ))}
      </div>
    )}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const OnboardingAnalytics: React.FC = () => {
  const [rows, setRows] = useState<OnboardingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("user_onboarding")
      .select("*")
      .then(({ data }) => {
        if (data) setRows(data as OnboardingRow[]);
        setLoading(false);
      });
  }, []);

  const useCaseTally = useMemo(() => tally(rows, "use_case"), [rows]);
  const roleTally = useMemo(() => tally(rows, "role"), [rows]);
  const referralTally = useMemo(() => tally(rows, "referral_source"), [rows]);

  const completionRate = rows.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <i className="fa-solid fa-spinner fa-spin text-indigo-500 text-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <i className="fa-solid fa-chart-bar text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Signup Survey Analytics
            </h2>
            <p className="text-slate-400 text-xs font-medium">
              {completionRate} users completed onboarding
            </p>
          </div>
        </div>

        {/* Completion pill */}
        <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">
          {completionRate} responses
        </span>
      </div>

      {/* Three survey charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Section
          title="What do they share?"
          icon="fa-film"
          iconColor="#4F46E5"
          items={useCaseTally}
          total={rows.filter((r) => r.use_case).length}
        />
        <Section
          title="How they plan to use it"
          icon="fa-user"
          iconColor="#059669"
          items={roleTally}
          total={rows.filter((r) => r.role).length}
        />
        <Section
          title="Where they found us"
          icon="fa-location-dot"
          iconColor="#D97706"
          items={referralTally}
          total={rows.filter((r) => r.referral_source).length}
        />
      </div>

      {/* Top insight callout */}
      {useCaseTally[0] && roleTally[0] && referralTally[0] && (
        <div className="bg-slate-900 rounded-4xl p-6 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <i className="fa-solid fa-lightbulb text-white text-lg" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
              Top Insight
            </p>
            <p className="text-white font-bold text-sm leading-relaxed">
              Most users want{" "}
              <span className="text-indigo-400 font-black">
                {useCaseTally[0].label}
              </span>
              , prefer to{" "}
              <span className="text-emerald-400 font-black">
                {roleTally[0].label.toLowerCase()}
              </span>
              , and found you via{" "}
              <span className="text-amber-400 font-black">
                {referralTally[0].label}
              </span>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
