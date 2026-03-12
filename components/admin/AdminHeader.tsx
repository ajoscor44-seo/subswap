import React from "react";
import { AdminTab } from "@/constants/types";
import Logo from "../Logo";

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
}) => {
  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: "stats", label: "Overview", icon: "fa-chart-pie" },
    { id: "inventory", label: "Inventory", icon: "fa-layer-group" },
    { id: "users", label: "Members", icon: "fa-users" },
    { id: "transactions", label: "Ledger", icon: "fa-receipt" },
  ];

  return (
    <>
      <style>{`
        .ah-root { font-family: 'DM Sans', sans-serif; }
        .ah-root * { box-sizing: border-box; }

        .ah-tab {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 18px; border-radius: 12px;
          border: none; background: none; cursor: pointer;
          font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #9b8fc2; transition: all 0.2s;
        }
        .ah-tab:hover { background: #f5f3ff; color: #7c5cfc; }
        .ah-tab.active {
          background: linear-gradient(135deg,#7c5cfc,#6366f1);
          color: #fff; box-shadow: 0 4px 12px rgba(124,92,252,0.3);
        }

        .ah-refresh {
          width: 38px; height: 38px; border-radius: 11px;
          border: 1.5px solid #ede9fe; background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #7c5cfc; transition: all 0.2s;
        }
        .ah-refresh:hover { border-color: #c4b5fd; background: #f5f3ff; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ah-spin { animation: spin 0.8s linear infinite; }
      `}</style>

      <header className="ah-root bg-white border-b border-[#f0eef9] sticky top-0 z-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <Logo size={9} />
              <div className="hidden sm:block">
                <h1
                  className="font-display"
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 900,
                    color: "#1a1230",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Admin Panel
                </h1>
                <p
                  style={{
                    margin: 0,
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "#a78bfa",
                    letterSpacing: "0.05em",
                  }}
                >
                  Master control · DiscountZAR
                </p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onTabChange(t.id)}
                  className={`ah-tab ${activeTab === t.id ? "active" : ""}`}
                >
                  <i className={`fa-solid ${t.icon} text-xs`} />
                  {t.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="ah-refresh"
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh Data"
            >
              <i
                className={`fa-solid fa-rotate ${isLoading ? "ah-spin" : ""}`}
              />
            </button>
            <div className="h-10 w-[1.5px] bg-[#f0eef9] mx-1 hidden sm:block" />
            <div className="flex items-center gap-3 pl-1">
              <div className="text-right hidden sm:block">
                <p
                  className="font-display"
                  style={{
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#1a1230",
                  }}
                >
                  System Admin
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "#10b981",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Online
                  </span>
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#f5f3ff,#ede9fe)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1.5px solid #ede9fe",
                }}
              >
                <i
                  className="fa-solid fa-user-shield"
                  style={{ color: "#7c5cfc", fontSize: 16 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="lg:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`ah-tab ${activeTab === t.id ? "active" : ""}`}
              style={{ whiteSpace: "nowrap" }}
            >
              <i className={`fa-solid ${t.icon} text-xs`} />
              {t.label}
            </button>
          ))}
        </div>
      </header>
    </>
  );
};
