import { Transaction } from "@/constants/types";
import React, { useMemo, useState } from "react";
import { SearchBar } from "./SearchBar";

interface AdminTransactionsProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

type TxFilter = "all" | "Deposit" | "Purchase" | "Withdrawal";

const TX_META: Record<string, { accent: string; light: string; icon: string }> =
  {
    Deposit: { accent: "#10b981", light: "#f0fdf4", icon: "fa-arrow-down" },
    Purchase: { accent: "#7c5cfc", light: "#f5f3ff", icon: "fa-bag-shopping" },
    Withdrawal: { accent: "#f59e0b", light: "#fffbeb", icon: "fa-arrow-up" },
  };

export const AdminTransactions: React.FC<AdminTransactionsProps> = ({
  transactions,
  onRefresh,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TxFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.description?.toLowerCase().includes(q) ||
        tx.type?.toLowerCase().includes(q) ||
        tx.user_id?.toLowerCase().includes(q);
      const matchesFilter = filter === "all" || tx.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [transactions, search, filter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const totals = useMemo(
    () => ({
      deposits: transactions
        .filter((t) => t.type === "Deposit")
        .reduce((a, b) => a + Math.abs(b.amount), 0),
      purchases: transactions
        .filter((t) => t.type === "Purchase")
        .reduce((a, b) => a + Math.abs(b.amount), 0),
      count: transactions.length,
    }),
    [transactions],
  );

  const TX_FILTERS: TxFilter[] = ["all", "Deposit", "Purchase", "Withdrawal"];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        .txn2 * { box-sizing: border-box; }

        .txn2-stat-chip {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 18px; border-radius: 14px;
          background: #fff; border: 1.5px solid #f0eef9;
          transition: box-shadow 0.2s;
        }
        .txn2-stat-chip:hover { box-shadow: 0 6px 18px rgba(124,92,252,0.08); }

        .txn2-filter-bar {
          display: flex; background: #fafafe;
          border: 1.5px solid #f0eef9; border-radius: 12px;
          padding: 3px; gap: 2px;
        }
        .txn2-filter-btn {
          padding: 7px 14px; border-radius: 9px; border: none; cursor: pointer;
          font-family: 'Outfit', sans-serif; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          background: none; color: #b8addb; transition: all 0.18s;
          white-space: nowrap;
        }
        .txn2-filter-btn:hover:not(.active) { background: #f5f3ff; color: #7c5cfc; }
        .txn2-filter-btn.active {
          background: linear-gradient(135deg,#1a1230,#2d1f6e);
          color: #fff; box-shadow: 0 3px 8px rgba(26,18,48,0.2);
        }

        .txn2-refresh {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 16px; border-radius: 11px;
          border: 1.5px solid #ede9fe; background: #fff; cursor: pointer;
          font-family: 'Outfit', sans-serif; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.07em; color: #9b8fc2;
          transition: all 0.18s;
        }
        .txn2-refresh:hover { border-color: #c4b5fd; color: #7c5cfc; }

        .txn2-th {
          padding: 12px 18px;
          font-family: 'Outfit', sans-serif; font-size: 9px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em; color: #b8addb;
          background: #fafafe; border-bottom: 1.5px solid #f0eef9; white-space: nowrap;
        }
        .txn2-td { padding: 13px 18px; border-bottom: 1px solid #fafafe; }
        .txn2-tr:hover .txn2-td { background: #fafafe; }
        .txn2-tr:last-child .txn2-td { border-bottom: none; }

        /* Pagination */
        .txn2-pagination {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; margin-top: 24px;
        }
        .txn2-page-btn {
          width: 34px; height: 34px; border-radius: 10px; border: 1.5px solid #f0eef9;
          background: #fff; color: #9b8fc2; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 700;
          transition: all 0.2s;
        }
        .txn2-page-btn:hover:not(:disabled) { border-color: #7c5cfc; color: #7c5cfc; }
        .txn2-page-btn.active {
          background: linear-gradient(135deg, #7c5cfc, #6366f1);
          color: #fff; border-color: transparent;
          box-shadow: 0 4px 10px rgba(124,92,252,0.25);
        }
        .txn2-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── Responsive ── */
        .txn2-chips { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        .txn2-toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
        .txn2-toolbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }

        @media (max-width: 700px) {
          .txn2-chips { grid-template-columns:1fr 1fr; }
          .txn2-toolbar { flex-direction:column; align-items:stretch; }
          .txn2-toolbar-right { justify-content:space-between; }
          .txn2-filter-bar { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        }
        @media (max-width: 420px) {
          .txn2-chips { grid-template-columns:1fr; }
          .txn2-stat-chip { padding:12px 14px; }
        }
      `}</style>

      <div className="txn2 space-y-5 animate-in fade-in duration-300">
        {/* Summary chips */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 10,
          }}
        >
          {[
            {
              label: "Total Deposited",
              value: `₦${totals.deposits.toLocaleString()}`,
              icon: "fa-arrow-down",
              accent: "#10b981",
              light: "#f0fdf4",
            },
            {
              label: "Total Purchases",
              value: `₦${totals.purchases.toLocaleString()}`,
              icon: "fa-bag-shopping",
              accent: "#7c5cfc",
              light: "#f5f3ff",
            },
            {
              label: "Total Transactions",
              value: String(totals.count),
              icon: "fa-receipt",
              accent: "#6366f1",
              light: "#eef2ff",
            },
          ].map((s) => (
            <div key={s.label} className="txn2-stat-chip">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: s.light,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i
                  className={`fa-solid ${s.icon}`}
                  style={{ color: s.accent, fontSize: 16 }}
                />
              </div>
              <div>
                <p
                  className="font-display"
                  style={{
                    margin: "0 0 2px",
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#1a1230",
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
                    letterSpacing: "0.08em",
                    color: "#c4b5fd",
                  }}
                >
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            placeholder="Search by description, type, user..."
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="txn2-filter-bar">
              {TX_FILTERS.map((f) => (
                <button
                  key={f}
                  className={`txn2-filter-btn ${filter === f ? "active" : ""}`}
                  onClick={() => {
                    setFilter(f);
                    setCurrentPage(1);
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <button className="txn2-refresh" onClick={onRefresh}>
              <i className="fa-solid fa-rotate" style={{ fontSize: 12 }} />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            background: "#fff",
            border: "1.5px solid #f0eef9",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    ["Type", "left"],
                    ["Amount", "right"],
                    ["Details", "left"],
                    ["Timestamp", "right"],
                  ].map(([h, align]) => (
                    <th
                      key={h}
                      className="txn2-th"
                      style={{ textAlign: align as any }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((tx) => {
                  const meta = TX_META[tx.type] ?? {
                    accent: "#9b8fc2",
                    light: "#f5f3ff",
                    icon: "fa-circle",
                  };
                  return (
                    <tr key={tx.id} className="txn2-tr">
                      {/* Type */}
                      <td className="txn2-td">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 9,
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
                          <span
                            style={{
                              padding: "3px 9px",
                              borderRadius: 7,
                              background: meta.light,
                              fontFamily: "'Outfit',sans-serif",
                              fontSize: 9,
                              fontWeight: 700,
                              textTransform: "uppercase" as const,
                              letterSpacing: "0.06em",
                              color: meta.accent,
                              whiteSpace: "nowrap" as const,
                            }}
                          >
                            {tx.type}
                          </span>
                        </div>
                      </td>
                      {/* Amount */}
                      <td className="txn2-td" style={{ textAlign: "right" }}>
                        <span
                          className="font-display"
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: tx.amount < 0 ? "#ef4444" : "#10b981",
                          }}
                        >
                          {tx.amount > 0 ? "+" : ""}₦
                          {Math.abs(tx.amount).toLocaleString()}
                        </span>
                      </td>
                      {/* Details */}
                      <td className="txn2-td">
                        <p
                          style={{
                            margin: "0 0 2px",
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#1a1230",
                            maxWidth: 300,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap" as const,
                          }}
                        >
                          {tx.description}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: "monospace",
                            fontSize: 10,
                            color: "#c4b5fd",
                            letterSpacing: "0.05em",
                          }}
                        >
                          UID ···{tx.user_id?.slice(-8)}
                        </p>
                      </td>
                      {/* Timestamp */}
                      <td className="txn2-td" style={{ textAlign: "right" }}>
                        <p
                          style={{
                            margin: "0 0 2px",
                            fontSize: 11,
                            color: "#475569",
                          }}
                        >
                          {new Date(tx.created_at).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: "monospace",
                            fontSize: 10,
                            color: "#c4b5fd",
                          }}
                        >
                          {new Date(tx.created_at).toLocaleTimeString("en-NG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ padding: "56px", textAlign: "center" }}
                    >
                      <i
                        className="fa-solid fa-receipt"
                        style={{
                          fontSize: 32,
                          color: "#ede9fe",
                          display: "block",
                          marginBottom: 12,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'Outfit',sans-serif",
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.08em",
                          color: "#c4b5fd",
                        }}
                      >
                        No transactions found
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="txn2-pagination pb-6">
              <button
                className="txn2-page-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <i className="fa-solid fa-chevron-left" />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`txn2-page-btn ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="txn2-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <i className="fa-solid fa-chevron-right" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
