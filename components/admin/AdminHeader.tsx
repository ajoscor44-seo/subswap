import { AdminTab } from "@/constants/types";
import React from "react";

const TABS: { id: AdminTab; label: string; icon: string }[] = [
  { id: "stats", label: "Analytics", icon: "fa-chart-line" },
  { id: "inventory", label: "Inventory", icon: "fa-layer-group" },
  { id: "users", label: "Members", icon: "fa-users" },
  { id: "transactions", label: "Transactions", icon: "fa-receipt" },
];

interface AdminHeaderProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  onTabChange,
  isLoading,
  onRefresh,
}) => (
  <>
    <style>{`
      .adm-hdr * { box-sizing: border-box; }

      .adm-tab {
        display: flex; align-items: center; gap: 7px;
        padding: 9px 16px; border-radius: 11px; border: none;
        background: none; cursor: pointer; white-space: nowrap;
        font-family: 'Syne', sans-serif; font-size: 10px;
        font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
        color: #b8addb; transition: all 0.18s;
      }
      .adm-tab:hover:not(.active) { background: #f5f3ff; color: #7c5cfc; }
      .adm-tab.active {
        background: linear-gradient(135deg, #7c5cfc, #6366f1);
        color: #fff;
        box-shadow: 0 4px 12px rgba(124,92,252,0.35);
      }
      .adm-tab .adm-tab-icon {
        width: 22px; height: 22px; border-radius: 6px;
        display: flex; align-items: center; justify-content: center;
        font-size: 10px;
        background: rgba(255,255,255,0.15);
      }
      .adm-tab:not(.active) .adm-tab-icon { background: #f0eef9; }
      .adm-tab:not(.active):hover .adm-tab-icon { background: #ede9fe; }

      @keyframes spin { to { transform: rotate(360deg); } }
      .adm-spin { animation: spin 0.7s linear infinite; display: inline-block; }
    `}</style>

    <header
      className="adm-hdr max-w-300 mx-auto"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        padding: "20px 28px",
        background: "#fff",
        borderBottom: "1.5px solid #f0eef9",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* ── Brand ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "linear-gradient(135deg,#1a1230,#2d1f6e)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(26,18,48,0.25)",
          }}
        >
          <i
            className="fa-solid fa-bolt"
            style={{ color: "#a78bfa", fontSize: 16 }}
          />
        </div>
        <div>
          <h1
            className="font-display"
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 800,
              color: "#1a1230",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Admin Console
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: "#b8addb",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Master control · DiscountZAR
          </p>
        </div>
        <div
          style={{
            marginLeft: 4,
            padding: "3px 10px",
            borderRadius: 7,
            background: "#f5f3ff",
            border: "1px solid #ede9fe",
            fontFamily: "'Syne',sans-serif",
            fontSize: 9,
            fontWeight: 700,
            textTransform: "uppercase" as const,
            letterSpacing: "0.08em",
            color: "#a78bfa",
          }}
        >
          Super Admin
        </div>
      </div>

      {/* ── Right controls ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh data"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            border: "1.5px solid #ede9fe",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isLoading ? "#7c5cfc" : "#c4b5fd",
            transition: "all 0.18s",
            opacity: isLoading ? 1 : undefined,
          }}
          onMouseOver={(e) => {
            if (!isLoading) {
              e.currentTarget.style.borderColor = "#c4b5fd";
              e.currentTarget.style.color = "#7c5cfc";
            }
          }}
          onMouseOut={(e) => {
            if (!isLoading) {
              e.currentTarget.style.borderColor = "#ede9fe";
              e.currentTarget.style.color = "#c4b5fd";
            }
          }}
        >
          <i
            className={`fa-solid fa-rotate ${isLoading ? "adm-spin" : ""}`}
            style={{ fontSize: 13 }}
          />
        </button>

        {/* Tab switcher */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#fafafe",
            border: "1.5px solid #f0eef9",
            borderRadius: 14,
            padding: 4,
            gap: 2,
            overflowX: "auto",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`adm-tab ${activeTab === tab.id ? "active" : ""}`}
            >
              <span className="adm-tab-icon">
                <i className={`fa-solid ${tab.icon}`} />
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  </>
);
