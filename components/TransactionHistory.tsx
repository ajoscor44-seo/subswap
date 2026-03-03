import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { User, Transaction } from "@/constants/types";

interface TransactionHistoryProps {
  user: User;
  isDashboardView?: boolean;
}

const TYPE_CONFIG: Record<string, { bg: string; color: string; icon: string }> =
  {
    Deposit: { bg: "#f0fdf4", color: "#16a34a", icon: "fa-arrow-down-to-line" },
    Purchase: { bg: "#f0eef9", color: "#7c5cfc", icon: "fa-bag-shopping" },
    Withdrawal: {
      bg: "#fef2f2",
      color: "#ef4444",
      icon: "fa-arrow-up-from-line",
    },
    default: { bg: "#f8fafc", color: "#64748b", icon: "fa-circle-dot" },
  };

const getTypeConfig = (type: string) =>
  TYPE_CONFIG[type] ?? TYPE_CONFIG.default;

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  user,
  isDashboardView = false,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filters = ["All", "Deposit", "Purchase", "Withdrawal"];

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        let query = supabase.from("transactions").select("*");
        if (!user.isAdmin) query = query.eq("user_id", user.id);
        const { data, error } = await query.order("created_at", {
          ascending: false,
        });
        if (error) throw error;
        if (data) setTransactions(data);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [user]);

  const filtered = transactions.filter((tx) => {
    const matchesType = activeFilter === "All" || tx.type === activeFilter;
    const matchesSearch = (tx.description || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Summary stats
  const totalIn = transactions
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .th-root { font-family: 'DM Sans', sans-serif; color: #1a1230; }
        .th-root * { box-sizing: border-box; }
        .th-heading { font-family: 'Syne', sans-serif; }

        /* Stat card */
        .th-stat {
          background: #fff;
          border: 1.5px solid #f0eef9;
          border-radius: 16px;
          padding: 18px 20px;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .th-stat:hover { box-shadow: 0 8px 24px rgba(124,92,252,0.1); transform: translateY(-2px); }

        /* Filter pills */
        .th-pill {
          padding: 7px 16px;
          border-radius: 99px;
          font-family: 'Syne', sans-serif;
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em;
          cursor: pointer; border: 1.5px solid #ede9fe;
          background: #fff; color: #9b8fc2;
          white-space: nowrap; transition: all 0.2s;
        }
        .th-pill:hover { border-color: #c4b5fd; color: #6d4fc8; }
        .th-pill.active {
          background: linear-gradient(135deg, #7c5cfc, #6366f1);
          color: #fff; border-color: transparent;
          box-shadow: 0 4px 12px rgba(124,92,252,0.25);
        }

        /* Search */
        .th-search-wrap { position: relative; }
        .th-search-input {
          width: 100%; background: #fff;
          border: 1.5px solid #ede9fe; border-radius: 12px;
          padding: 11px 16px 11px 44px;
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          color: #1a1230; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .th-search-input::placeholder { color: #c4b5fd; }
        .th-search-input:focus { border-color: #7c5cfc; box-shadow: 0 0 0 4px rgba(124,92,252,0.08); }
        .th-search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #c4b5fd; font-size: 13px; pointer-events: none; }

        /* Row */
        .th-row {
          display: grid;
          gap: 0;
          border-bottom: 1px solid #f5f3ff;
          transition: background 0.15s;
          cursor: default;
        }
        .th-row:last-child { border-bottom: none; }
        .th-row:hover { background: #fafafe; }

        /* Type badge */
        .th-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 9px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.07em;
        }

        /* Amount */
        .th-amount-pos { color: #16a34a; font-family: 'Syne', sans-serif; font-weight: 800; }
        .th-amount-neg { color: #ef4444; font-family: 'Syne', sans-serif; font-weight: 800; }

        /* Icon circle */
        .th-icon-circle {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; flex-shrink: 0;
        }

        /* Skeleton */
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .th-skeleton {
          background: linear-gradient(90deg,#f5f3ff 25%,#ede9fe 50%,#f5f3ff 75%);
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite; border-radius: 8px;
        }

        /* Stagger in */
        @keyframes rowIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .th-row-anim { animation: rowIn 0.3s ease forwards; }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      <div
        className="th-root"
        style={{ padding: isDashboardView ? 0 : "32px 0" }}
      >
        {/* ── Header ── */}
        <div style={{ padding: isDashboardView ? "28px 28px 0" : "0 0 24px" }}>
          <p
            className="th-heading"
            style={{
              margin: "0 0 4px",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#a78bfa",
            }}
          >
            {user.isAdmin ? "Platform Ledger" : "Activity"}
          </p>
          <h2
            className="th-heading"
            style={{
              margin: "0 0 4px",
              fontSize: isDashboardView ? 22 : 28,
              fontWeight: 800,
              color: "#1a1230",
              lineHeight: 1.2,
            }}
          >
            {isDashboardView ? "Financial History" : "Transaction Ledger"}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#9b8fc2",
              fontWeight: 400,
            }}
          >
            {user.isAdmin
              ? "Global platform transaction history."
              : "Your complete wallet and subscription history."}
          </p>
        </div>

        {/* ── Summary Stats ── */}
        {!isLoading && transactions.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 12,
              padding: isDashboardView ? "20px 28px" : "20px 0",
            }}
          >
            <div className="th-stat">
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 10,
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "#b8addb",
                }}
              >
                Total In
              </p>
              <p
                className="th-heading"
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#16a34a",
                }}
              >
                +₦{totalIn.toLocaleString()}
              </p>
            </div>
            <div className="th-stat">
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 10,
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "#b8addb",
                }}
              >
                Total Out
              </p>
              <p
                className="th-heading"
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#ef4444",
                }}
              >
                -₦{totalOut.toLocaleString()}
              </p>
            </div>
            <div className="th-stat">
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 10,
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "#b8addb",
                }}
              >
                Transactions
              </p>
              <p
                className="th-heading"
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#7c5cfc",
                }}
              >
                {transactions.length}
              </p>
            </div>
          </div>
        )}

        {/* ── Filters + Search ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: isDashboardView ? "0 28px 20px" : "0 0 20px",
          }}
        >
          <div
            style={{ display: "flex", gap: 8, overflowX: "auto" }}
            className="no-scrollbar"
          >
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`th-pill ${activeFilter === f ? "active" : ""}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="th-search-wrap" style={{ maxWidth: 400 }}>
            <i className="fa-solid fa-magnifying-glass th-search-icon" />
            <input
              className="th-search-input"
              type="text"
              placeholder="Search by description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ── Table / List ── */}
        <div
          style={{
            borderTop: "1.5px solid #f0eef9",
            margin: isDashboardView ? "0" : "0",
          }}
        >
          {/* Desktop header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: user.isAdmin
                ? "1fr 120px 120px 2fr 110px"
                : "120px 120px 2fr 110px",
              padding: "10px 28px",
              background: "#fafafe",
              borderBottom: "1.5px solid #f0eef9",
            }}
          >
            {user.isAdmin && (
              <span
                style={{
                  fontSize: 9,
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#c4b5fd",
                }}
              >
                User
              </span>
            )}
            <span
              style={{
                fontSize: 9,
                fontFamily: "'Syne',sans-serif",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#c4b5fd",
              }}
            >
              Type
            </span>
            <span
              style={{
                fontSize: 9,
                fontFamily: "'Syne',sans-serif",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#c4b5fd",
                textAlign: "right",
              }}
            >
              Amount
            </span>
            <span
              style={{
                fontSize: 9,
                fontFamily: "'Syne',sans-serif",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#c4b5fd",
              }}
            >
              Description
            </span>
            <span
              style={{
                fontSize: 9,
                fontFamily: "'Syne',sans-serif",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#c4b5fd",
                textAlign: "right",
              }}
            >
              Date
            </span>
          </div>

          {isLoading ? (
            <div style={{ padding: "8px 28px" }}>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 0",
                    borderBottom: "1px solid #f5f3ff",
                  }}
                >
                  <div
                    className="th-skeleton"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      className="th-skeleton"
                      style={{ height: 11, width: "40%", marginBottom: 8 }}
                    />
                    <div
                      className="th-skeleton"
                      style={{ height: 10, width: "70%" }}
                    />
                  </div>
                  <div
                    className="th-skeleton"
                    style={{ height: 14, width: 80 }}
                  />
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div>
              {filtered.map((tx, i) => {
                const cfg = getTypeConfig(tx.type);
                const isPos = tx.amount > 0;
                return (
                  <div
                    key={tx.id}
                    className="th-row th-row-anim"
                    style={{
                      gridTemplateColumns: user.isAdmin
                        ? "1fr 120px 120px 2fr 110px"
                        : "120px 120px 2fr 110px",
                      display: "grid",
                      alignItems: "center",
                      padding: "14px 28px",
                      animationDelay: `${Math.min(i * 30, 300)}ms`,
                    }}
                  >
                    {/* Mobile-friendly: on small screens show compact card */}
                    {user.isAdmin && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          className="th-icon-circle"
                          style={{ background: cfg.bg }}
                        >
                          <i
                            className={`fa-solid ${cfg.icon}`}
                            style={{ color: cfg.color }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: 10,
                            color: "#94a3b8",
                          }}
                        >
                          {tx.user_id === user.id
                            ? "Self"
                            : `···${tx.user_id.slice(-6)}`}
                        </span>
                      </div>
                    )}

                    {/* Type badge (non-admin gets icon here) */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: user.isAdmin ? 0 : 10,
                      }}
                    >
                      {!user.isAdmin && (
                        <div
                          className="th-icon-circle"
                          style={{ background: cfg.bg, marginRight: 10 }}
                        >
                          <i
                            className={`fa-solid ${cfg.icon}`}
                            style={{ color: cfg.color }}
                          />
                        </div>
                      )}
                      <span
                        className="th-badge"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {tx.type}
                      </span>
                    </div>

                    {/* Amount */}
                    <div style={{ textAlign: "right" }}>
                      <span
                        className={isPos ? "th-amount-pos" : "th-amount-neg"}
                        style={{ fontSize: 14 }}
                      >
                        {isPos ? "+" : "−"}₦
                        {Math.abs(tx.amount).toLocaleString()}
                      </span>
                    </div>

                    {/* Description */}
                    <div style={{ padding: "0 16px" }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: "#475569",
                          fontWeight: 400,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {tx.description || "No description provided"}
                      </p>
                    </div>

                    {/* Date */}
                    <div style={{ textAlign: "right" }}>
                      <p
                        style={{
                          margin: "0 0 2px",
                          fontSize: 11,
                          fontFamily: "'Syne',sans-serif",
                          fontWeight: 700,
                          color: "#1a1230",
                        }}
                      >
                        {formatDate(tx.created_at)}
                      </p>
                      <p style={{ margin: 0, fontSize: 10, color: "#c4b5fd" }}>
                        {formatTime(tx.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "56px 32px" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "#f5f3ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                <i
                  className="fa-solid fa-receipt"
                  style={{ color: "#c4b5fd", fontSize: 20 }}
                />
              </div>
              <p
                className="th-heading"
                style={{
                  margin: "0 0 4px",
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#b8addb",
                }}
              >
                No transactions found
              </p>
              <p style={{ margin: 0, color: "#c4b5fd", fontSize: 13 }}>
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TransactionHistory;
