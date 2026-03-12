import { MasterAccount, Transaction } from "@/constants/types";
import React, { useMemo } from "react";
import { OnboardingAnalytics } from "./OnboardingAnalytics";

interface AdminStatsProps {
  accounts: MasterAccount[];
  users: any[];
  transactions: Transaction[];
}

export const AdminStats: React.FC<AdminStatsProps> = ({
  accounts,
  users,
  transactions,
}) => {
  const stats = useMemo(() => {
    const totalEscrow = users.reduce((a, u) => a + (Number(u.balance) || 0), 0);
    const totalRevenue = transactions
      .filter((t) => t.type === "Purchase")
      .reduce((a, t) => a + Math.abs(t.amount), 0);
    const totalDeposits = transactions
      .filter((t) => t.type === "Deposit")
      .reduce((a, t) => a + Math.abs(t.amount), 0);
    const availableSlots = accounts.reduce((a, b) => a + b.available_slots, 0);
    const totalSlots = accounts.reduce((a, b) => a + b.total_slots, 0);
    const occupiedSlots = totalSlots - availableSlots;
    const fillRate =
      totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

    const serviceMap: Record<string, { purchases: number; revenue: number }> =
      {};
    transactions
      .filter((t) => t.type === "Purchase")
      .forEach((t) => {
        const match = t.description?.match(/purchased (.+?) slot/i);
        const name = match?.[1] || "Unknown";
        if (!serviceMap[name]) serviceMap[name] = { purchases: 0, revenue: 0 };
        serviceMap[name].purchases += 1;
        serviceMap[name].revenue += Math.abs(t.amount);
      });

    const topServices = Object.entries(serviceMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.purchases - a.purchases)
      .slice(0, 5);

    const recentTx = [...transactions]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 6);

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newUsersThisWeek = users.filter(
      (u) => new Date(u.created_at).getTime() > oneWeekAgo,
    ).length;

    return {
      totalEscrow,
      totalRevenue,
      totalDeposits,
      availableSlots,
      totalSlots,
      occupiedSlots,
      fillRate,
      topServices,
      recentTx,
      newUsersThisWeek,
      bannedUsers: users.filter((u) => u.is_banned).length,
      verifiedUsers: users.filter((u) => u.is_verified).length,
    };
  }, [accounts, users, transactions]);

  const TX_META: Record<
    string,
    { accent: string; light: string; icon: string }
  > = {
    Deposit: { accent: "#10b981", light: "#f0fdf4", icon: "fa-arrow-down" },
    Purchase: { accent: "#7c5cfc", light: "#f5f3ff", icon: "fa-bag-shopping" },
    Withdrawal: { accent: "#ef4444", light: "#fef2f2", icon: "fa-arrow-up" },
  };

  return (
    <>
      <style>{`
        .ast2 * { box-sizing: border-box; }
        .ast2-panel {
          background: #fff; border: 1.5px solid #f0eef9;
          border-radius: 20px; padding: 24px;
        }
        .ast2-panel-title {
          margin: 0 0 18px; display: flex; align-items: center; gap: 8px;
          font-family: 'Outfit', sans-serif; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em; color: #b8addb;
        }
        .ast2-inv-bar-bg {
          height: 5px; border-radius: 99px;
          background: #f0eef9; overflow: hidden; margin-top: 5px;
        }
        .ast2-inv-bar-fill { height: 100%; border-radius: 99px; transition: width 0.9s cubic-bezier(0.34,1,0.64,1); }
        .ast2-health {
          background: linear-gradient(135deg,#1a1230,#2d1f6e,#3730a3);
          border-radius: 20px; padding: 28px 32px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 24px; position: relative; overflow: hidden;
        }
        .ast2-health-blob {
          position: absolute; top: -40px; right: -40px;
          width: 180px; height: 180px; border-radius: 50%;
          background: rgba(124,92,252,0.15); pointer-events: none;
        }
        .ast2-health-divider { width: 1px; background: rgba(255,255,255,0.08); align-self: stretch; }

        /* Hero KPI card — matches OverviewTab balance card */
        .ast2-kpi {
          border-radius: 20px;
          background: linear-gradient(145deg, #1a1230 0%, #2d1f6e 55%, #3730a3 100%);
          position: relative; overflow: hidden;
          padding: 28px 28px 24px;
          display: flex; flex-direction: column; justify-content: space-between;
          min-height: 148px;
        }
        .ast2-kpi::before {
          content: ''; position: absolute; top: -50px; right: -50px;
          width: 200px; height: 200px; border-radius: 50%;
          background: rgba(255,255,255,0.03); pointer-events: none;
        }
        .ast2-kpi::after {
          content: ''; position: absolute; bottom: -60px; left: -20px;
          width: 220px; height: 220px; border-radius: 50%;
          background: rgba(124,92,252,0.1); pointer-events: none;
        }
        .ast2-kpi-watermark {
          position: absolute; right: 20px; top: 16px;
          font-size: 80px; font-family: 'Outfit', sans-serif; font-weight: 800;
          line-height: 1; pointer-events: none; z-index: 0;
          color: rgba(255,255,255,0.04);
        }
        .ast2-kpi-label {
          font-family: 'Outfit', sans-serif; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: rgba(255,255,255,0.35); margin: 0 0 8px;
          position: relative; z-index: 1;
        }
        .ast2-kpi-value {
          font-family: 'Outfit', sans-serif; font-size: 36px; font-weight: 800;
          color: #fff; letter-spacing: -0.03em; line-height: 1;
          margin: 0 0 6px; position: relative; z-index: 1;
        }
        .ast2-kpi-sub {
          font-family: 'DM Sans', sans-serif; font-size: 12px;
          color: rgba(255,255,255,0.3); margin: 0;
          position: relative; z-index: 1;
        }
        .ast2-kpi-icon {
          position: absolute; bottom: 22px; right: 24px; z-index: 1;
          width: 40px; height: 40px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(8px);
          font-size: 16px;
        }
        /* accent tints */
        .ast2-kpi.green  { background: linear-gradient(145deg,#052e16,#14532d,#166534); }
        .ast2-kpi.green::after { background: rgba(16,185,129,0.12); }
        .ast2-kpi.amber  { background: linear-gradient(145deg,#1c1407,#78350f,#92400e); }
        .ast2-kpi.amber::after { background: rgba(245,158,11,0.12); }
        .ast2-kpi.indigo { background: linear-gradient(145deg,#0f0a2e,#1e1b4b,#312e81); }
        .ast2-kpi.indigo::after { background: rgba(99,102,241,0.15); }

        /* secondary mini-hero */
        .ast2-mini {
          border-radius: 16px;
          background: linear-gradient(145deg,#1a1230,#2d1f6e);
          position: relative; overflow: hidden; padding: 20px 20px 16px;
        }
        .ast2-mini::after {
          content:''; position:absolute; bottom:-40px; left:-20px;
          width:140px; height:140px; border-radius:50%;
          background:rgba(124,92,252,0.1); pointer-events:none;
        }
        .ast2-mini-label {
          font-family:'Outfit',sans-serif; font-size:9px; font-weight:700;
          text-transform:uppercase; letter-spacing:0.12em;
          color:rgba(255,255,255,0.3); margin:0 0 6px; position:relative; z-index:1;
        }
        .ast2-mini-value {
          font-family:'Outfit',sans-serif; font-size:26px; font-weight:800;
          color:#fff; letter-spacing:-0.03em; line-height:1;
          margin:0 0 4px; position:relative; z-index:1;
        }
        .ast2-mini-sub {
          font-family:'DM Sans',sans-serif; font-size:11px;
          color:rgba(255,255,255,0.28); margin:0; position:relative; z-index:1;
        }
        .ast2-mini-icon {
          position:absolute; top:18px; right:18px; z-index:1;
          width:34px; height:34px; border-radius:9px;
          display:flex; align-items:center; justify-content:center;
          background:rgba(255,255,255,0.08); font-size:14px;
        }
        .ast2-mini.green  { background:linear-gradient(145deg,#052e16,#14532d); }
        .ast2-mini.amber  { background:linear-gradient(145deg,#1c1407,#78350f); }
        .ast2-mini.indigo { background:linear-gradient(145deg,#0f0a2e,#1e1b4b); }

        /* ── Responsive ── */
        .ast2-kpi-row  { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .ast2-mini-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }

        /* Panel row: hard containment so neither column can stretch the other */
        .ast2-panel-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; min-width:0; overflow:hidden; }
        .ast2-panel-row > * { min-width:0; overflow:hidden; }

        /* Recent activity rows: full overflow containment chain */
        .ast2-activity-row { display:flex; align-items:center; gap:12px; min-width:0; overflow:hidden; }
        .ast2-activity-text { flex:1; min-width:0; overflow:hidden; }
        .ast2-activity-desc { margin:0 0 2px; font-size:12px; font-weight:500; color:#1a1230; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .ast2-activity-time { margin:0; font-size:10px; font-family:monospace; color:#c4b5fd; }
        .ast2-activity-amt  { font-size:13px; font-weight:700; flex-shrink:0; white-space:nowrap; font-family:'Outfit',sans-serif; }

        @media (max-width: 900px) {
          .ast2-kpi-row  { grid-template-columns:1fr 1fr; }
          .ast2-mini-row { grid-template-columns:1fr 1fr; }
          .ast2-panel-row{ grid-template-columns:1fr; }
          .ast2-health   { flex-direction:column; align-items:flex-start; padding:20px; gap:16px; }
          .ast2-kpi      { padding:20px; min-height:120px; }
          .ast2-kpi-value{ font-size:28px !important; }
          .ast2-mini     { padding:16px; }
          .ast2-mini-value{ font-size:22px !important; }
        }

        @media (max-width: 560px) {
          .ast2-kpi-row  { grid-template-columns:1fr; }
          .ast2-mini-row { grid-template-columns:1fr 1fr; }
        }
      `}</style>

      <div className="ast2 space-y-6 animate-in fade-in duration-300">
        {/* ── Primary KPI hero cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Platform Escrow */}
          <div className="ast2-kpi">
            <span className="ast2-kpi-watermark">₦</span>
            <div>
              <p className="ast2-kpi-label">Platform Escrow</p>
              <p className="ast2-kpi-value">
                ₦{stats.totalEscrow.toLocaleString()}
              </p>
              <p className="ast2-kpi-sub">Total user wallet balances</p>
            </div>
            <div className="ast2-kpi-icon" style={{ color: "#a78bfa" }}>
              <i className="fa-solid fa-naira-sign" />
            </div>
          </div>

          {/* Purchase Revenue */}
          <div className="ast2-kpi indigo">
            <span className="ast2-kpi-watermark">₦</span>
            <div>
              <p className="ast2-kpi-label">Purchase Revenue</p>
              <p className="ast2-kpi-value">
                ₦{stats.totalRevenue.toLocaleString()}
              </p>
              <p className="ast2-kpi-sub">
                From {transactions.filter((t) => t.type === "Purchase").length}{" "}
                purchases
              </p>
            </div>
            <div className="ast2-kpi-icon" style={{ color: "#818cf8" }}>
              <i className="fa-solid fa-bag-shopping" />
            </div>
          </div>

          {/* Total Deposits */}
          <div className="ast2-kpi green">
            <span className="ast2-kpi-watermark">₦</span>
            <div>
              <p className="ast2-kpi-label">Total Deposits</p>
              <p className="ast2-kpi-value">
                ₦{stats.totalDeposits.toLocaleString()}
              </p>
              <p className="ast2-kpi-sub">
                {transactions.filter((t) => t.type === "Deposit").length}{" "}
                deposit events
              </p>
            </div>
            <div className="ast2-kpi-icon" style={{ color: "#34d399" }}>
              <i className="fa-solid fa-arrow-down" />
            </div>
          </div>
        </div>

        {/* ── Secondary mini-hero cards ── */}
        <div className="flex overflow-auto max-w-screen md:grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Members */}
          <div className="ast2-mini min-w-xs md:min-w-0">
            <div className="ast2-mini-icon" style={{ color: "#a78bfa" }}>
              <i className="fa-solid fa-users" />
            </div>
            <p className="ast2-mini-label">Total Members</p>
            <p className="ast2-mini-value">{users.length}</p>
            <p className="ast2-mini-sub">+{stats.newUsersThisWeek} this week</p>
          </div>

          {/* Active Logs */}
          <div className="ast2-mini min-w-xs md:min-w-0 indigo">
            <div className="ast2-mini-icon" style={{ color: "#818cf8" }}>
              <i className="fa-solid fa-layer-group" />
            </div>
            <p className="ast2-mini-label">Active Logs</p>
            <p className="ast2-mini-value">{accounts.length}</p>
            <p className="ast2-mini-sub">
              {accounts.filter((a) => a.available_slots > 0).length} with open
              slots
            </p>
          </div>

          {/* Slot Fill Rate */}
          <div
            className={`ast2-mini min-w-xs md:min-w-0 ${stats.fillRate > 80 ? "green" : "amber"}`}
          >
            <div
              className="ast2-mini-icon"
              style={{ color: stats.fillRate > 80 ? "#34d399" : "#fbbf24" }}
            >
              <i className="fa-solid fa-chart-pie" />
            </div>
            <p className="ast2-mini-label">Slot Fill Rate</p>
            <p className="ast2-mini-value">{stats.fillRate}%</p>
            <p className="ast2-mini-sub">
              {stats.occupiedSlots} / {stats.totalSlots} slots
            </p>
          </div>

          {/* Verified Members */}
          <div className="ast2-mini min-w-xs md:min-w-0 green">
            <div className="ast2-mini-icon" style={{ color: "#34d399" }}>
              <i className="fa-solid fa-user-check" />
            </div>
            <p className="ast2-mini-label">Verified Members</p>
            <p className="ast2-mini-value">{stats.verifiedUsers}</p>
            <p className="ast2-mini-sub">{stats.bannedUsers} restricted</p>
          </div>
        </div>

        {/* Two-col panels */}
        <div className="ast2-panel-row">
          {/* Inventory health */}
          <div
            className="ast2-panel"
            style={{ minWidth: 0, overflow: "hidden" }}
          >
            <p className="ast2-panel-title">
              <i
                className="fa-solid fa-layer-group"
                style={{ color: "#7c5cfc", fontSize: 12 }}
              />
              Inventory Health
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {accounts.length === 0 && (
                <p
                  style={{
                    textAlign: "center",
                    padding: "32px 0",
                    color: "#c4b5fd",
                    fontSize: 13,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  No inventory yet
                </p>
              )}
              {accounts.slice(0, 6).map((acc) => {
                const pct = Math.round(
                  ((acc.total_slots - acc.available_slots) / acc.total_slots) *
                    100,
                );
                const barColor =
                  pct >= 100 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#10b981";
                return (
                  <div
                    key={acc.id}
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "2px solid #f0eef9",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={acc.icon_url}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                        alt=""
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://ui-avatars.com/api/?name=${acc.service_name}&background=ede9fe&color=7c5cfc&size=32`;
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          className="font-display"
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#1a1230",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap" as const,
                          }}
                        >
                          {acc.service_name}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: "#c4b5fd",
                            marginLeft: 8,
                            flexShrink: 0,
                            fontFamily: "'Outfit',sans-serif",
                            fontWeight: 700,
                          }}
                        >
                          {acc.available_slots}/{acc.total_slots}
                        </span>
                      </div>
                      <div className="ast2-inv-bar-bg">
                        <div
                          className="ast2-inv-bar-fill"
                          style={{ width: `${pct}%`, background: barColor }}
                        />
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: "'Outfit',sans-serif",
                        fontWeight: 700,
                        color: barColor,
                        flexShrink: 0,
                        minWidth: 28,
                        textAlign: "right" as const,
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div
            className="ast2-panel"
            style={{ minWidth: 0, overflow: "hidden" }}
          >
            <p className="ast2-panel-title">
              <i
                className="fa-solid fa-bolt"
                style={{ color: "#f59e0b", fontSize: 12 }}
              />
              Recent Activity
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {stats.recentTx.length === 0 && (
                <p
                  style={{
                    textAlign: "center",
                    padding: "32px 0",
                    color: "#c4b5fd",
                    fontSize: 13,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  No transactions yet
                </p>
              )}
              {stats.recentTx.map((tx) => {
                const meta = TX_META[tx.type] ?? TX_META["Withdrawal"];
                return (
                  <div key={tx.id} className="ast2-activity-row">
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: meta.light,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <i
                        className={`fa-solid ${meta.icon}`}
                        style={{ color: meta.accent, fontSize: 12 }}
                      />
                    </div>
                    <div className="ast2-activity-text">
                      <p className="ast2-activity-desc">{tx.description}</p>
                      <p className="ast2-activity-time">
                        {new Date(tx.created_at).toLocaleString("en-NG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className="ast2-activity-amt"
                      style={{ color: tx.amount >= 0 ? "#10b981" : "#ef4444" }}
                    >
                      {tx.amount > 0 ? "+" : ""}₦
                      {Math.abs(tx.amount).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Platform health banner */}
        <div className="ast2-health">
          <div className="ast2-health-blob" />
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
            <h4
              className="font-display"
              style={{
                margin: "0 0 4px",
                fontSize: 18,
                fontWeight: 800,
                color: "#fff",
              }}
            >
              Platform Health
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "rgba(255,255,255,0.35)",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Automated slot management · Real-time inventory tracking
            </p>
          </div>
          <div style={{ display: "flex", position: "relative", zIndex: 1 }}>
            {[
              {
                label: "Open Slots",
                value: stats.availableSlots,
                color: "#10b981",
              },
              {
                label: "Occupied",
                value: stats.occupiedSlots,
                color: "#a78bfa",
              },
              {
                label: "Fill Rate",
                value: `${stats.fillRate}%`,
                color: "#f59e0b",
              },
            ].map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <div className="text-center px-4 md:px-7">
                  <p
                    className="font-display"
                    style={{
                      margin: "0 0 4px",
                      fontSize: 28,
                      fontWeight: 800,
                      color: s.color,
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "'Outfit',sans-serif",
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.1em",
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    {s.label}
                  </p>
                </div>
                {i < arr.length - 1 && <div className="ast2-health-divider" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <OnboardingAnalytics />
      </div>
    </>
  );
};
