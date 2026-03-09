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

// Per-section colour palettes (accent, bar gradient)
const SECTION_PALETTES = [
  ["#a78bfa", "#7c5cfc", "#6366f1"], // purple
  ["#34d399", "#10b981", "#059669"], // green
  ["#fbbf24", "#f59e0b", "#d97706"], // amber
];

// ─── Bar ─────────────────────────────────────────────────────────────────────

const ChartBar: React.FC<{
  label: string;
  count: number;
  total: number;
  accent: string;
  barGradient: string;
  icon?: string;
  rank: number;
}> = ({ label, count, total, accent, barGradient, icon, rank }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {/* Rank + icon */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          flexShrink: 0,
          background: "rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {icon ? (
          <i
            className={`fa-solid ${icon}`}
            style={{ color: accent, fontSize: 13 }}
          />
        ) : (
          <span
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 11,
              fontWeight: 800,
              color: accent,
            }}
          >
            #{rank}
          </span>
        )}
      </div>
      {/* Bar + label */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 5,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "rgba(255,255,255,0.75)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap" as const,
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 10,
              fontWeight: 700,
              color: accent,
              marginLeft: 8,
              flexShrink: 0,
            }}
          >
            {count} · {pct}%
          </span>
        </div>
        <div
          style={{
            height: 5,
            borderRadius: 99,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 99,
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${barGradient})`,
              transition: "width 0.9s cubic-bezier(0.34,1,0.64,1)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Section card ─────────────────────────────────────────────────────────────

const Section: React.FC<{
  title: string;
  icon: string;
  palette: string[];
  items: { label: string; count: number }[];
  total: number;
  gradient: string;
}> = ({ title, icon, palette, items, total, gradient }) => (
  <>
    <style>{`
      .oba-section {
        border-radius: 20px; padding: 24px;
        position: relative; overflow: hidden;
      }
      .oba-section::before {
        content: ''; position: absolute; bottom: -50px; right: -50px;
        width: 160px; height: 160px; border-radius: 50%;
        background: rgba(255,255,255,0.04); pointer-events: none;
      }
    `}</style>
    <div className="oba-section" style={{ background: gradient }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <i
            className={`fa-solid ${icon}`}
            style={{ color: palette[0], fontSize: 14 }}
          />
        </div>
        <div>
          <div
            style={{
              height: 2,
              width: 24,
              borderRadius: 99,
              background: palette[0],
              marginBottom: 4,
            }}
          />
          <p
            style={{
              margin: 0,
              fontFamily: "'Syne',sans-serif",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            {title}
          </p>
        </div>
      </div>

      {/* Bars */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          position: "relative",
          zIndex: 1,
        }}
      >
        {items.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              padding: "24px 0",
              color: "rgba(255,255,255,0.25)",
              fontSize: 13,
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            No data yet
          </p>
        ) : (
          items.map((item, i) => (
            <ChartBar
              key={item.label}
              label={item.label}
              count={item.count}
              total={total}
              accent={palette[0]}
              barGradient={`${palette[2]}, ${palette[0]}`}
              icon={ICONS[item.label]}
              rank={i + 1}
            />
          ))
        )}
      </div>
    </div>
  </>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export const OnboardingAnalytics: React.FC = () => {
  const [rows, setRows] = useState<OnboardingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOnboadingResponses = async () => {
      const { data, error } = await supabase
        .from("user_onboarding")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching onboarding responses:", error);
      } else if (data) {
        setRows(data as OnboardingRow[]);
      }
      setLoading(false);
    };

    fetchOnboadingResponses();
  }, []);

  const useCaseTally = useMemo(() => tally(rows, "use_case"), [rows]);
  const roleTally = useMemo(() => tally(rows, "role"), [rows]);
  const referralTally = useMemo(() => tally(rows, "referral_source"), [rows]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 0",
        }}
      >
        <i
          className="fa-solid fa-spinner fa-spin"
          style={{ color: "#7c5cfc", fontSize: 24 }}
        />
      </div>
    );
  }

  return (
    <>
      <style>{`
        .oba * { box-sizing: border-box; }

        /* Header hero card */
        .oba-header {
          border-radius: 20px; padding: 24px 28px;
          background: linear-gradient(145deg,#1a1230,#2d1f6e,#3730a3);
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: space-between; gap: 20px;
          flex-wrap: wrap;
        }
        .oba-header::before {
          content: ''; position: absolute; top: -50px; right: -50px;
          width: 200px; height: 200px; border-radius: 50%;
          background: rgba(255,255,255,0.03); pointer-events: none;
        }
        .oba-header::after {
          content: ''; position: absolute; bottom: -60px; left: -20px;
          width: 200px; height: 200px; border-radius: 50%;
          background: rgba(124,92,252,0.1); pointer-events: none;
        }

        /* Insight banner */
        .oba-insight {
          border-radius: 20px; padding: 24px 28px;
          background: linear-gradient(145deg,#1a1230,#2d1f6e);
          position: relative; overflow: hidden;
          display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
        }
        .oba-insight::after {
          content: ''; position: absolute; bottom: -50px; right: -30px;
          width: 160px; height: 160px; border-radius: 50%;
          background: rgba(124,92,252,0.12); pointer-events: none;
        }
      `}</style>

      <div
        className="oba"
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        {/* ── Header ── */}
        <div className="oba-header">
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                height: 3,
                width: 32,
                borderRadius: 99,
                background: "linear-gradient(90deg,#7c5cfc,#6366f1)",
                marginBottom: 10,
              }}
            />
            <h2
              style={{
                margin: "0 0 4px",
                fontFamily: "'Syne',sans-serif",
                fontSize: 18,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              Signup Survey Analytics
            </h2>
            <p
              style={{
                margin: 0,
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.35)",
              }}
            >
              Insights from user onboarding responses
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i
                className="fa-solid fa-chart-bar"
                style={{ color: "#a78bfa", fontSize: 20 }}
              />
            </div>
            <div>
              <p
                style={{
                  margin: "0 0 2px",
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {rows.length}
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                Responses
              </p>
            </div>
          </div>
        </div>

        {/* ── Three section cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Section
            title="What do they share?"
            icon="fa-film"
            palette={SECTION_PALETTES[0]}
            items={useCaseTally}
            total={rows.filter((r) => r.use_case).length}
            gradient="linear-gradient(145deg,#1a1230,#2d1f6e,#3730a3)"
          />
          <Section
            title="How they plan to use it"
            icon="fa-user"
            palette={SECTION_PALETTES[1]}
            items={roleTally}
            total={rows.filter((r) => r.role).length}
            gradient="linear-gradient(145deg,#052e16,#14532d,#166534)"
          />
          <Section
            title="Where they found us"
            icon="fa-location-dot"
            palette={SECTION_PALETTES[2]}
            items={referralTally}
            total={rows.filter((r) => r.referral_source).length}
            gradient="linear-gradient(145deg,#1c1407,#78350f,#92400e)"
          />
        </div>

        {/* ── Top insight banner ── */}
        {useCaseTally[0] && roleTally[0] && referralTally[0] && (
          <div className="oba-insight">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                flexShrink: 0,
                background: "rgba(124,92,252,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              <i
                className="fa-solid fa-lightbulb"
                style={{ color: "#a78bfa", fontSize: 18 }}
              />
            </div>
            <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
              <p
                style={{
                  margin: "0 0 5px",
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.12em",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                Top Insight
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.6,
                }}
              >
                Most users want{" "}
                <span style={{ color: "#a78bfa", fontWeight: 700 }}>
                  {useCaseTally[0].label}
                </span>
                , prefer to{" "}
                <span style={{ color: "#34d399", fontWeight: 700 }}>
                  {roleTally[0].label.toLowerCase()}
                </span>
                , and found you via{" "}
                <span style={{ color: "#fbbf24", fontWeight: 700 }}>
                  {referralTally[0].label}
                </span>
                .
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
