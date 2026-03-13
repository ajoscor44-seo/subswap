import React, { useState, useMemo } from "react";
import { User } from "@/constants/types";

interface MyStacksTabProps {
  user: User;
  activeSubscriptions: any[];
  isLoading: boolean;
  changeTab: (tab: string) => void;
  copyToClipboard: (text: string) => void;
}

const getTimeRemaining = (dateStr: string) => {
  const purchaseDate = new Date(dateStr);
  const expiryDate = new Date(
    purchaseDate.getTime() + 30 * 24 * 60 * 60 * 1000,
  );
  const now = new Date();
  const diff = expiryDate.getTime() - now.getTime();
  if (diff <= 0) return { label: "Expired", urgent: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const urgent = days < 3;
  if (days > 0) return { label: `${days}d ${hours}h left`, urgent };
  return { label: `${hours}h left`, urgent: true };
};

const getDaysProgress = (dateStr: string) => {
  const purchaseDate = new Date(dateStr);
  const now = new Date();
  const elapsed = now.getTime() - purchaseDate.getTime();
  const total = 30 * 24 * 60 * 60 * 1000;
  return Math.min(100, Math.round((elapsed / total) * 100));
};

export const MyStacksTab: React.FC<MyStacksTabProps> = ({
  user,
  activeSubscriptions,
  isLoading,
  changeTab,
  copyToClipboard,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(activeSubscriptions.length / itemsPerPage);
  
  const paginatedSubscriptions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return activeSubscriptions.slice(start, start + itemsPerPage);
  }, [activeSubscriptions, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        .stk-card {
          background: #fff;
          border: 1.5px solid #f0eef9;
          border-radius: 20px;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .stk-card:hover {
          box-shadow: 0 16px 40px rgba(124,92,252,0.12);
          transform: translateY(-3px);
        }

        .stk-copy-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 13px;
          border-radius: 12px; border: none; cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.07em;
          transition: all 0.2s;
        }
        .stk-copy-btn.primary {
          background: linear-gradient(135deg, #1a1230, #2d1f6e);
          color: #fff;
          box-shadow: 0 4px 14px rgba(26,18,48,0.25);
        }
        .stk-copy-btn.primary:hover {
          background: linear-gradient(135deg, #7c5cfc, #6366f1);
          box-shadow: 0 8px 20px rgba(124,92,252,0.35);
        }
        .stk-copy-btn.secondary {
          background: #f5f3ff;
          color: #7c5cfc;
          border: 1.5px solid #ede9fe;
        }
        .stk-copy-btn.secondary:hover {
          background: #ede9fe;
          border-color: #c4b5fd;
        }
        .stk-copy-btn:active { transform: scale(0.97); }

        .stk-bar-bg { height: 4px; border-radius: 99px; background: #f0eef9; overflow: hidden; }
        .stk-bar-fill { height: 100%; border-radius: 99px; transition: width 1s cubic-bezier(0.34,1.2,0.64,1); }
        .stk-bar-fill.ok   { background: linear-gradient(90deg, #7c5cfc, #a78bfa); }
        .stk-bar-fill.warn { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
        .stk-bar-fill.exp  { background: #ef4444; }

        .stk-credential {
          background: #fafafe;
          border: 1.5px solid #f0eef9;
          border-radius: 12px;
          padding: 12px 14px;
          display: flex; justify-content: space-between; align-items: center;
        }

        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .stk-anim { animation: fadeUp 0.35s ease forwards; }

        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .stk-skeleton {
          background: linear-gradient(90deg,#f5f3ff 25%,#ede9fe 50%,#f5f3ff 75%);
          background-size: 200% 100%; animation: shimmer 1.6s infinite; border-radius: 10px;
        }

        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
        .dot-pulse { animation: pulse-dot 1.4s ease-in-out infinite; }

        .stk-pagination {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; margin-top: 24px;
        }
        .stk-page-btn {
          width: 34px; height: 34px; border-radius: 10px; border: 1.5px solid #f0eef9;
          background: #fff; color: #9b8fc2; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 700;
          transition: all 0.2s;
        }
        .stk-page-btn:hover:not(:disabled) { border-color: #7c5cfc; color: #7c5cfc; }
        .stk-page-btn.active {
          background: linear-gradient(135deg, #7c5cfc, #6366f1);
          color: #fff; border-color: transparent;
          box-shadow: 0 4px 10px rgba(124,92,252,0.25);
        }
        .stk-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div className="bg-white px-5 py-6 flex flex-col rounded-2xl gap-5">
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              className="font-display"
              style={{
                margin: "0 0 4px",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#a78bfa",
              }}
            >
              My Subscriptions
            </p>
            <h2
              className="font-display"
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 800,
                color: "#1a1230",
                lineHeight: 1.2,
              }}
            >
              Active Stacks
            </h2>
          </div>
          <button
            onClick={() => changeTab("explore")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 18px",
              borderRadius: 10,
              border: "1.5px solid #ede9fe",
              background: "#fff",
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "#7c5cfc",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#f5f3ff";
              e.currentTarget.style.borderColor = "#c4b5fd";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.borderColor = "#ede9fe";
            }}
          >
            <i className="fa-solid fa-plus" style={{ fontSize: 10 }} />
            Add Stack
          </button>
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="stk-card" style={{ padding: 24 }}>
                <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
                  <div
                    className="stk-skeleton"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      className="stk-skeleton"
                      style={{ height: 14, width: "60%", marginBottom: 8 }}
                    />
                    <div
                      className="stk-skeleton"
                      style={{ height: 10, width: "40%" }}
                    />
                  </div>
                </div>
                <div
                  className="stk-skeleton"
                  style={{ height: 44, borderRadius: 10, marginBottom: 10 }}
                />
                <div
                  className="stk-skeleton"
                  style={{ height: 44, borderRadius: 10 }}
                />
              </div>
            ))}
          </div>
        ) : activeSubscriptions.length > 0 ? (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 16,
              }}
            >
              {paginatedSubscriptions.map((sub, idx) => {
                const timeData = getTimeRemaining(
                  sub.purchased_at || sub.created_at || "",
                );
                const progress = getDaysProgress(
                  sub.purchased_at || sub.created_at || "",
                );
                const barClass = timeData.urgent
                  ? timeData.label === "Expired"
                    ? "exp"
                    : "warn"
                  : "ok";

                return (
                  <div
                    key={sub.id}
                    className="stk-card stk-anim"
                    style={{ animationDelay: `${idx * 50}ms`, padding: 22 }}
                  >
                    {/* Card header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 14,
                        marginBottom: 18,
                      }}
                    >
                      {/* Circular logo */}
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          overflow: "hidden",
                          flexShrink: 0,
                          border: "2.5px solid #ede9fe",
                          boxShadow: "0 4px 12px rgba(124,92,252,0.15)",
                        }}
                      >
                        <img
                          src={sub.master_accounts?.icon_url}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                          alt={sub.master_accounts?.service_name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.master_accounts?.service_name || "S")}&background=ede9fe&color=7c5cfc&size=56`;
                          }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4
                          className="font-display"
                          style={{
                            margin: "0 0 6px",
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#1a1230",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {sub.master_accounts?.service_name}
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          {/* Active badge */}
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "3px 9px",
                              borderRadius: 7,
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              fontFamily: "'Outfit', sans-serif",
                              fontSize: 9,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "#16a34a",
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "#16a34a",
                              }}
                              className={timeData.urgent ? "" : "dot-pulse"}
                            />
                            Active
                          </span>
                          {/* Time badge */}
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "3px 9px",
                              borderRadius: 7,
                              background: timeData.urgent ? "#fffbeb" : "#f0eef9",
                              border: `1px solid ${timeData.urgent ? "#fde68a" : "#ede9fe"}`,
                              fontFamily: "'Outfit', sans-serif",
                              fontSize: 9,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: timeData.urgent ? "#d97706" : "#7c5cfc",
                            }}
                          >
                            <i
                              className="fa-regular fa-clock"
                              style={{ fontSize: 8 }}
                            />
                            {timeData.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Time remaining bar */}
                    <div style={{ marginBottom: 16 }}>
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
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "#b8addb",
                          }}
                        >
                          Subscription period
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: 700,
                            color: timeData.urgent ? "#d97706" : "#7c5cfc",
                          }}
                        >
                          {progress}% elapsed
                        </span>
                      </div>
                      <div className="stk-bar-bg">
                        <div
                          className={`stk-bar-fill ${barClass}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Credentials */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        marginBottom: 16,
                      }}
                    >
                      {/* Email row */}
                      <div className="stk-credential">
                        <div>
                          <p
                            style={{
                              margin: "0 0 1px",
                              fontSize: 9,
                              fontFamily: "'Outfit', sans-serif",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.07em",
                              color: "#b8addb",
                            }}
                          >
                            Account Email
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 12,
                              fontFamily: "monospace",
                              fontWeight: 600,
                              color: "#475569",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 180,
                            }}
                          >
                            {sub.master_accounts?.master_email || "—"}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(sub.master_accounts?.master_email)
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "6px 8px",
                            borderRadius: 8,
                            color: "#a78bfa",
                            transition: "all 0.15s",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = "#f0eef9";
                            e.currentTarget.style.color = "#7c5cfc";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.color = "#a78bfa";
                          }}
                          title="Copy email"
                        >
                          <i
                            className="fa-solid fa-copy"
                            style={{ fontSize: 13 }}
                          />
                        </button>
                      </div>

                      {/* Profile name if available */}
                      {sub.profile_name && (
                        <div className="stk-credential">
                          <div>
                            <p
                              style={{
                                margin: "0 0 1px",
                                fontSize: 9,
                                fontFamily: "'Outfit', sans-serif",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.07em",
                                color: "#b8addb",
                              }}
                            >
                              Profile Name
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 12,
                                fontWeight: 500,
                                color: "#475569",
                              }}
                            >
                              {sub.profile_name}
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(sub.profile_name)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "6px 8px",
                              borderRadius: 8,
                              color: "#a78bfa",
                              transition: "all 0.15s",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = "#f0eef9";
                              e.currentTarget.style.color = "#7c5cfc";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = "none";
                              e.currentTarget.style.color = "#a78bfa";
                            }}
                          >
                            <i
                              className="fa-solid fa-copy"
                              style={{ fontSize: 13 }}
                            />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                      }}
                    >
                      <button
                        className="stk-copy-btn primary"
                        onClick={() =>
                          copyToClipboard(sub.master_accounts?.master_password)
                        }
                      >
                        <i className="fa-solid fa-key" />
                        Copy Password
                      </button>
                      <button
                        className="stk-copy-btn secondary"
                        onClick={() =>
                          copyToClipboard(sub.master_accounts?.master_email)
                        }
                      >
                        <i className="fa-solid fa-envelope" />
                        Copy Email
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="stk-pagination">
                <button
                  className="stk-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    className={`stk-page-btn ${currentPage === i + 1 ? "active" : ""}`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className="stk-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "64px 32px",
              background: "#fafafe",
              borderRadius: 20,
              border: "1.5px dashed #ede9fe",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: "linear-gradient(135deg, #f0eef9, #ede9fe)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <i
                className="fa-solid fa-layer-group"
                style={{ color: "#c4b5fd", fontSize: 24 }}
              />
            </div>
            <p
              className="font-display"
              style={{
                margin: "0 0 6px",
                fontSize: 15,
                fontWeight: 700,
                color: "#1a1230",
              }}
            >
              No active stacks yet
            </p>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#b8addb" }}>
              Join a shared plan to see your credentials here
            </p>
            <button
              onClick={() => changeTab("explore")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #7c5cfc, #6366f1)",
                color: "#fff",
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                boxShadow: "0 4px 16px rgba(124,92,252,0.3)",
              }}
            >
              <i className="fa-solid fa-compass" />
              Browse Marketplace
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MyStacksTab;
