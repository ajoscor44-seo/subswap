import React, { useState, useEffect } from "react";
import { User, Transaction } from "@/constants/types";
import { Marketplace } from "./Marketplace";

function useWindowWidth() {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  useEffect(() => {
    const handle = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);
  return width;
}

interface OverviewTabProps {
  user: User;
  activeSubscriptions: any[];
  recentTransactions: Transaction[];
  changeTab: (tab: string) => void;
}

const TYPE_ICON: Record<string, { icon: string; bg: string; color: string }> = {
  Deposit: { icon: "fa-arrow-down", bg: "#f0fdf4", color: "#16a34a" },
  Purchase: { icon: "fa-bag-shopping", bg: "#f0eef9", color: "#7c5cfc" },
  Withdrawal: {
    icon: "fa-arrow-up-from-line",
    bg: "#fef2f2",
    color: "#ef4444",
  },
  default: { icon: "fa-circle-dot", bg: "#f8fafc", color: "#64748b" },
};
const getTxStyle = (type: string) => TYPE_ICON[type] ?? TYPE_ICON.default;

export const OverviewTab: React.FC<OverviewTabProps> = ({
  user,
  activeSubscriptions,
  recentTransactions,
  changeTab,
}) => {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .ov-root { font-family: 'DM Sans', sans-serif; color: #1a1230; }
        .ov-root * { box-sizing: border-box; }
        .ov-heading { font-family: 'Syne', sans-serif; }

        .ov-label {
          font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.12em; color: #a78bfa; margin: 0 0 4px;
        }

        .ov-card {
          background: #fff; border: 1.5px solid #f0eef9; border-radius: 20px;
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .ov-card:hover { box-shadow: 0 12px 32px rgba(124,92,252,0.09); }

        /* Hero */
        .ov-hero {
          border-radius: 20px;
          background: linear-gradient(145deg, #1a1230 0%, #2d1f6e 55%, #3730a3 100%);
          position: relative; overflow: hidden; padding: 36px 36px 32px;
        }
        .ov-hero::before { content:''; position:absolute; top:-60px; right:-60px; width:260px; height:260px; border-radius:50%; background:rgba(255,255,255,0.03); }
        .ov-hero::after  { content:''; position:absolute; bottom:-80px; left:-30px; width:300px; height:300px; border-radius:50%; background:rgba(124,92,252,0.12); }
        .ov-hero-naira { position:absolute; right:28px; top:28px; font-size:100px; color:rgba(255,255,255,0.04); font-family:'Syne',sans-serif; font-weight:800; line-height:1; pointer-events:none; z-index:0; }

        .ov-btn-primary {
          display:inline-flex; align-items:center; gap:8px; padding:12px 22px; border-radius:12px; border:none;
          background:linear-gradient(135deg,#7c5cfc,#6366f1); color:#fff; cursor:pointer;
          font-family:'Syne',sans-serif; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em;
          transition:all 0.2s; box-shadow:0 4px 16px rgba(124,92,252,0.38);
        }
        .ov-btn-primary:hover { box-shadow:0 8px 24px rgba(124,92,252,0.5); transform:translateY(-1px); }

        .ov-btn-ghost {
          display:inline-flex; align-items:center; gap:8px; padding:12px 22px; border-radius:12px; border:none;
          background:rgba(255,255,255,0.1); backdrop-filter:blur(8px); color:rgba(255,255,255,0.8); cursor:pointer;
          font-family:'Syne',sans-serif; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; transition:all 0.2s;
        }
        .ov-btn-ghost:hover { background:rgba(255,255,255,0.18); color:#fff; }

        .ov-stat { padding:20px 22px; border-radius:16px; border:1.5px solid #f0eef9; background:#fff; transition:box-shadow 0.2s,transform 0.2s; }
        .ov-stat:hover { box-shadow:0 8px 24px rgba(124,92,252,0.1); transform:translateY(-2px); }

        .ov-tx-row { display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:12px; transition:background 0.15s; cursor:default; min-width:0; overflow:hidden; }
        .ov-tx-row:hover { background:#fafafe; }

        .ov-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; }

        .ov-stack-avatar { width:44px; height:44px; border-radius:50%; border:3px solid #fff; object-fit:cover; box-shadow:0 2px 8px rgba(124,92,252,0.15); transition:transform 0.2s; flex-shrink:0; }
        .ov-stack-avatar:hover { transform:scale(1.12) translateY(-3px); z-index:10; }

        .ov-link { font-family:'Syne',sans-serif; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:#7c5cfc; background:none; border:none; cursor:pointer; padding:4px 10px; border-radius:8px; transition:background 0.15s; }
        .ov-link:hover { background:#f0eef9; }

        .ov-bar-bg { height:5px; border-radius:99px; background:#f0eef9; overflow:hidden; margin-top:10px; }
        .ov-bar-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#7c5cfc,#a78bfa); transition:width 1s cubic-bezier(0.34,1.2,0.64,1); }

        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .ov-fade   { animation:fadeUp 0.4s ease forwards; }
        .ov-fade-2 { animation:fadeUp 0.4s 0.08s ease both; }
        .ov-fade-3 { animation:fadeUp 0.4s 0.16s ease both; }
        .ov-fade-4 { animation:fadeUp 0.4s 0.24s ease both; }

        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .ov-skeleton { background:linear-gradient(90deg,#f5f3ff 25%,#ede9fe 50%,#f5f3ff 75%); background-size:200% 100%; animation:shimmer 1.6s infinite; border-radius:8px; }

        /* ── Responsive grid helpers ── */
        .ov-row1  { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }
        .ov-row2  { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .ov-row3  { display:grid; gap:16px; }

        /* hero spans 2 of 3 columns by default */
        .ov-hero-cell  { grid-column: span 2; }
        .ov-savings-cell { grid-column: span 1; }

        @media (max-width: 767px) {
          /* Row 1: hero full width, savings below */
          .ov-row1 { grid-template-columns: 1fr; }
          .ov-hero-cell { grid-column: span 1; }
          .ov-hero { padding: 28px 22px 24px; }
          .ov-hero-naira { font-size: 72px; }
          .ov-hero h2 { font-size: 36px !important; }

          /* Row 2: 1 col on small, 2 col on medium */
          .ov-row2 { grid-template-columns: 1fr 1fr; }

          /* Row 3: stack vertically */
          .ov-row3 { grid-template-columns: 1fr; }

          /* Quick join padding */
          .ov-quickjoin { padding: 20px 16px 16px !important; }

          /* Stat cards compact */
          .ov-stat { padding: 14px 16px; }

          /* Buttons stack */
          .ov-hero-btns { flex-direction: column !important; }
          .ov-btn-primary, .ov-btn-ghost { width: 100%; justify-content: center; }
        }

        @media (max-width: 479px) {
          /* Row 2: single column on very small */
          .ov-row2 { grid-template-columns: 1fr; }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          /* Tablet: hero + savings side by side, savings 1 col */
          .ov-row1 { grid-template-columns: 1fr 1fr; }
          .ov-hero-cell { grid-column: span 1; }
          .ov-savings-cell { grid-column: span 1; }
          .ov-row2 { grid-template-columns: repeat(3,1fr); }
          .ov-row3 { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div
        className="ov-root"
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {/* ── Row 1: Hero + Savings ── */}
        <div
          className="ov-row1 ov-fade"
          style={{
            gridTemplateColumns: isMobile
              ? "1fr"
              : isTablet
                ? "1fr 1fr"
                : "1fr 1fr 1fr",
          }}
        >
          <div
            className="ov-hero ov-hero-cell"
            style={{
              gridColumn: isMobile ? "span 1" : isTablet ? "span 1" : "span 2",
            }}
          >
            <span className="ov-hero-naira">₦</span>
            <div style={{ position: "relative", zIndex: 1 }}>
              <p
                className="ov-label"
                style={{ color: "rgba(255,255,255,0.35)", marginBottom: 8 }}
              >
                Available Balance
              </p>
              <h2
                className="ov-heading"
                style={{
                  margin: "0 0 6px",
                  fontSize: 48,
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                ₦{user.balance.toLocaleString()}
              </h2>
              <p
                style={{
                  margin: "0 0 28px",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                ₦1.00 = 1 Credit
              </p>
              <div
                className="ov-hero-btns"
                style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
              >
                <button
                  className="ov-btn-primary"
                  onClick={() => changeTab("wallet")}
                >
                  <i className="fa-solid fa-plus" /> Fund Wallet
                </button>
                <button
                  className="ov-btn-ghost"
                  onClick={() => changeTab("explore")}
                >
                  <i className="fa-solid fa-compass" /> Explore Plans
                </button>
              </div>
            </div>
          </div>

          {/* Savings card */}
          <div
            className="ov-card ov-savings-cell"
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: "#f0fdf4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <i
                  className="fa-solid fa-piggy-bank"
                  style={{ color: "#16a34a", fontSize: 17 }}
                />
              </div>
              <p className="ov-label">Total Saved</p>
              <h3
                className="ov-heading"
                style={{
                  margin: "0 0 6px",
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#16a34a",
                  lineHeight: 1.1,
                }}
              >
                ₦{user.totalSaved.toLocaleString()}
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: "#9b8fc2" }}>
                saved using DiscountZAR
              </p>
            </div>
            <div
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: "1.5px solid #f0eef9",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "#b8addb",
                  }}
                >
                  vs. Retail price
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 800,
                    color: "#7c5cfc",
                  }}
                >
                  {user.totalSaved > 0
                    ? `${Math.round((user.totalSaved / (user.totalSaved + user.balance)) * 100)}%`
                    : "0%"}
                </span>
              </div>
              <div className="ov-bar-bg">
                <div
                  className="ov-bar-fill"
                  style={{
                    width:
                      user.totalSaved > 0
                        ? `${Math.min(100, Math.round((user.totalSaved / (user.totalSaved + user.balance)) * 100))}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: Quick stats ── */}
        <div
          className="ov-row2 ov-fade-2"
          style={{
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
          }}
        >
          {[
            {
              label: "Active Stacks",
              value: activeSubscriptions.length,
              icon: "fa-layer-group",
              color: "#7c5cfc",
              bg: "#f0eef9",
              action: () => changeTab("stacks"),
            },
            {
              label: "Recent Transactions",
              value: recentTransactions.length,
              icon: "fa-receipt",
              color: "#6366f1",
              bg: "#eef2ff",
              action: () => changeTab("history"),
            },
            {
              label: "Wallet Credits",
              value: `₦${user.balance.toLocaleString()}`,
              icon: "fa-wallet",
              color: "#0ea5e9",
              bg: "#f0f9ff",
              action: () => changeTab("wallet"),
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="ov-stat"
              style={{ display: "flex", alignItems: "center", gap: 14 }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: stat.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i
                  className={`fa-solid ${stat.icon}`}
                  style={{ color: stat.color, fontSize: 17 }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: "0 0 2px",
                    fontSize: 10,
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "#b8addb",
                  }}
                >
                  {stat.label}
                </p>
                <p
                  className="ov-heading"
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#1a1230",
                  }}
                >
                  {stat.value}
                </p>
              </div>
              <button
                className="ov-link"
                onClick={stat.action}
                style={{ flexShrink: 0 }}
              >
                <i
                  className="fa-solid fa-chevron-right"
                  style={{ color: stat.color, fontSize: 20 }}
                />
              </button>
            </div>
          ))}
        </div>

        {/* ── Row 3: Transactions + Stacks ── */}
        <div
          className="ov-row3 ov-fade-3"
          style={{ gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}
        >
          {/* Recent transactions */}
          <div
            className="ov-card"
            style={{ padding: "24px", overflow: "hidden", minWidth: 0 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <div>
                <p className="ov-label">Latest Activity</p>
                <h4
                  className="ov-heading"
                  style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 800,
                    color: "#1a1230",
                  }}
                >
                  Recent Transactions
                </h4>
              </div>
              <button className="ov-link" onClick={() => changeTab("history")}>
                View all
              </button>
            </div>

            {recentTransactions.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {recentTransactions.map((tx) => {
                  const cfg = getTxStyle(tx.type);
                  const isPos = tx.amount > 0;
                  return (
                    <div key={tx.id} className="ov-tx-row">
                      <div
                        className="ov-icon"
                        style={{ background: cfg.bg, flexShrink: 0 }}
                      >
                        <i
                          className={`fa-solid ${cfg.icon}`}
                          style={{ color: cfg.color }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                        <p
                          style={{
                            margin: "0 0 2px",
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#1a1230",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {tx.description || "No description"}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 10,
                            color: "#b8addb",
                            fontFamily: "'Syne',sans-serif",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {new Date(tx.created_at).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </p>
                      </div>
                      <span
                        className="ov-heading"
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: isPos ? "#16a34a" : "#ef4444",
                          flexShrink: 0,
                          whiteSpace: "nowrap" as const,
                        }}
                      >
                        {isPos ? "+" : "−"}₦
                        {Math.abs(tx.amount).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "32px 16px" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "#f5f3ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px",
                  }}
                >
                  <i
                    className="fa-solid fa-receipt"
                    style={{ color: "#c4b5fd", fontSize: 18 }}
                  />
                </div>
                <p
                  style={{ margin: "0 0 12px", fontSize: 12, color: "#b8addb" }}
                >
                  No activity yet
                </p>
                <button
                  className="ov-link"
                  onClick={() => changeTab("wallet")}
                  style={{ fontSize: 11 }}
                >
                  Fund your wallet{" "}
                  <i
                    className="fa-solid fa-chevron-right"
                    style={{ color: "#7c5cfc", fontSize: 11 }}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Active stacks */}
          <div
            className="ov-card"
            style={{ padding: "24px", overflow: "hidden", minWidth: 0 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <div>
                <p className="ov-label">Subscriptions</p>
                <h4
                  className="ov-heading"
                  style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 800,
                    color: "#1a1230",
                  }}
                >
                  Active Stacks
                </h4>
              </div>
              <button className="ov-link" onClick={() => changeTab("stacks")}>
                Manage
              </button>
            </div>

            {activeSubscriptions.length > 0 ? (
              <>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: 18,
                  }}
                >
                  {activeSubscriptions.slice(0, 8).map((sub, i) => (
                    <img
                      key={i}
                      src={sub.master_accounts?.icon_url}
                      className="ov-stack-avatar"
                      alt={sub.master_accounts?.service_name || ""}
                      title={sub.master_accounts?.service_name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.master_accounts?.service_name || "S")}&background=ede9fe&color=7c5cfc`;
                      }}
                    />
                  ))}
                  {activeSubscriptions.length > 8 && (
                    <div
                      className="ov-stack-avatar"
                      style={{
                        background: "#f0eef9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Syne',sans-serif",
                          fontWeight: 800,
                          fontSize: 11,
                          color: "#7c5cfc",
                        }}
                      >
                        +{activeSubscriptions.length - 8}
                      </span>
                    </div>
                  )}
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {activeSubscriptions.slice(0, 3).map((sub, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 12px",
                        borderRadius: 10,
                        background: "#fafafe",
                        border: "1px solid #f0eef9",
                      }}
                    >
                      <img
                        src={sub.master_accounts?.icon_url}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid #fff",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                        }}
                        alt=""
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://ui-avatars.com/api/?name=S&background=ede9fe&color=7c5cfc&size=28`;
                        }}
                      />
                      <span
                        style={{
                          flex: 1,
                          fontSize: 12,
                          fontWeight: 500,
                          color: "#1a1230",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {sub.master_accounts?.service_name}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: "'Syne',sans-serif",
                          fontWeight: 700,
                          color: "#10b981",
                          background: "#f0fdf4",
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        Active
                      </span>
                    </div>
                  ))}
                  {activeSubscriptions.length > 3 && (
                    <button
                      className="ov-link"
                      onClick={() => changeTab("stacks")}
                      style={{
                        textAlign: "center",
                        width: "100%",
                        fontSize: 11,
                      }}
                    >
                      +{activeSubscriptions.length - 3} more stacks →
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "32px 16px" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "#f5f3ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px",
                  }}
                >
                  <i
                    className="fa-solid fa-layer-group"
                    style={{ color: "#c4b5fd", fontSize: 18 }}
                  />
                </div>
                <p
                  style={{ margin: "0 0 12px", fontSize: 12, color: "#b8addb" }}
                >
                  No active stacks yet
                </p>
                <button
                  className="ov-link"
                  onClick={() => changeTab("explore")}
                  style={{ fontSize: 11 }}
                >
                  Browse marketplace{" "}
                  <i
                    className="fa-solid fa-chevron-right"
                    style={{ color: "#7c5cfc", fontSize: 11 }}
                  />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Row 4: Quick Join ── */}
        <div
          className="ov-fade-4 ov-card ov-quickjoin"
          style={{ padding: "28px 28px 24px" }}
        >
          <div style={{ marginBottom: 24 }}>
            <p className="ov-label">Discover</p>
            <h3
              className="ov-heading"
              style={{
                margin: "0 0 4px",
                fontSize: 20,
                fontWeight: 800,
                color: "#1a1230",
              }}
            >
              Quick Join
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "#9b8fc2" }}>
              Browse and join a shared plan in seconds.
            </p>
          </div>
          <Marketplace />
        </div>
      </div>
    </>
  );
};

export default OverviewTab;
