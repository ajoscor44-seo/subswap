import React, { useState, useMemo } from "react";
import { SearchBar } from "./SearchBar";

interface AdminUsersProps {
  users: any[];
  currentUserId: string;
  isLoading: boolean;
  onFundUser: (
    userId: string,
    username: string,
    amount: number,
    email: string,
  ) => Promise<void>;
  onToggleBan: (
    userId: string,
    currentStatus: boolean,
    username: string,
    email: string,
  ) => Promise<void>;
  onToggleVerify: (
    userId: string,
    currentStatus: boolean,
    username: string,
    email: string,
  ) => Promise<void>;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  users,
  currentUserId,
  isLoading,
  onFundUser,
  onToggleBan,
  onToggleVerify,
}) => {
  const [search, setSearch] = useState("");
  const [fundAmounts, setFundAmounts] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "banned" | "verified">("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.name?.toLowerCase().includes(q);
      if (filter === "banned") return matchesSearch && u.is_banned;
      if (filter === "verified") return matchesSearch && u.is_verified;
      return matchesSearch;
    });
  }, [users, search, filter]);

  const stats = useMemo(
    () => ({
      total: users.length,
      banned: users.filter((u) => u.is_banned).length,
      verified: users.filter((u) => u.is_verified).length,
      deposited: users.filter((u) => u.has_deposited).length,
    }),
    [users],
  );

  const STAT_CHIPS = [
    {
      label: "Total Members",
      value: stats.total,
      icon: "fa-users",
      accent: "#7c5cfc",
      light: "#f5f3ff",
    },
    {
      label: "Verified",
      value: stats.verified,
      icon: "fa-circle-check",
      accent: "#10b981",
      light: "#f0fdf4",
    },
    {
      label: "Deposited",
      value: stats.deposited,
      icon: "fa-wallet",
      accent: "#6366f1",
      light: "#eef2ff",
    },
    {
      label: "Restricted",
      value: stats.banned,
      icon: "fa-ban",
      accent: "#ef4444",
      light: "#fef2f2",
    },
  ];

  const FILTERS: { id: "all" | "verified" | "banned"; label: string }[] = [
    { id: "all", label: "All" },
    { id: "verified", label: "Verified" },
    { id: "banned", label: "Banned" },
  ];

  return (
    <>
      <style>{`
        .usr2 * { box-sizing: border-box; }

        .usr2-stat-chip {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 18px; border-radius: 14px;
          background: #fff; border: 1.5px solid #f0eef9;
          transition: box-shadow 0.2s;
        }
        .usr2-stat-chip:hover { box-shadow: 0 6px 18px rgba(124,92,252,0.08); }

        .usr2-filter-bar {
          display: flex; background: #fafafe;
          border: 1.5px solid #f0eef9; border-radius: 12px;
          padding: 3px; gap: 2px;
        }
        .usr2-filter-btn {
          padding: 7px 16px; border-radius: 9px; border: none; cursor: pointer;
          font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          background: none; color: #b8addb; transition: all 0.18s;
        }
        .usr2-filter-btn:hover:not(.active) { background: #f5f3ff; color: #7c5cfc; }
        .usr2-filter-btn.active {
          background: linear-gradient(135deg,#1a1230,#2d1f6e);
          color: #fff; box-shadow: 0 3px 8px rgba(26,18,48,0.2);
        }

        .usr2-th {
          padding: 12px 18px;
          font-family: 'Syne', sans-serif; font-size: 9px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em; color: #b8addb;
          background: #fafafe; border-bottom: 1.5px solid #f0eef9; white-space: nowrap;
        }
        .usr2-td { padding: 13px 18px; border-bottom: 1px solid #fafafe; }
        .usr2-tr:hover .usr2-td { background: #fafafe; }
        .usr2-tr:last-child .usr2-td { border-bottom: none; }
        .usr2-tr.banned { opacity: 0.55; }

        .usr2-fund-input {
          width: 108px; padding: 8px 10px 8px 26px;
          background: #fafafe; border: 1.5px solid #ede9fe; border-radius: 9px;
          font-family: 'DM Sans', sans-serif; font-size: 12px; color: #1a1230;
          outline: none; transition: border-color 0.2s;
        }
        .usr2-fund-input:focus { border-color: #7c5cfc; }

        .usr2-credit-btn {
          padding: 8px 14px; border-radius: 9px; border: none; cursor: pointer;
          background: linear-gradient(135deg,#7c5cfc,#6366f1); color: #fff;
          font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.07em;
          box-shadow: 0 3px 8px rgba(124,92,252,0.3);
          transition: all 0.18s;
        }
        .usr2-credit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(124,92,252,0.35); }
        .usr2-credit-btn:active { transform: scale(0.97); }
        .usr2-credit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .usr2-action-btn {
          height: 30px; padding: 0 12px; border-radius: 8px; border: none; cursor: pointer;
          font-family: 'Syne', sans-serif; font-size: 9px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.07em;
          display: flex; align-items: center; gap: 5px; transition: all 0.18s;
        }
        .usr2-action-btn.verify-on  { background: #f0fdf4; color: #10b981; }
        .usr2-action-btn.verify-off { background: #fafafe; color: #9b8fc2;  }
        .usr2-action-btn.verify-off:hover { background: #f0fdf4; color: #10b981; }
        .usr2-action-btn.verify-on:hover  { background: #fafafe; color: #9b8fc2;  }
        .usr2-action-btn.ban   { background: #fef2f2; color: #ef4444; }
        .usr2-action-btn.ban:hover   { background: #fee2e2; }
        .usr2-action-btn.unban { background: #f0fdf4; color: #16a34a; }
        .usr2-action-btn.unban:hover { background: #dcfce7; }

        .usr2-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 7px; border-radius: 7px;
          font-family: 'Syne', sans-serif; font-size: 9px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em;
        }

        /* ── Responsive ── */
        .usr2-chips   { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
        .usr2-toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }

        @media (max-width: 800px) {
          .usr2-chips { grid-template-columns:repeat(2,1fr); }
          .usr2-toolbar { flex-direction:column; align-items:stretch; }
          .usr2-filter-bar { overflow-x:auto; -webkit-overflow-scrolling:touch; justify-content:flex-start; }
        }
        @media (max-width: 440px) {
          .usr2-chips { grid-template-columns:1fr 1fr; }
          .usr2-stat-chip { padding:12px 14px; }
          .usr2-fund-input { width:88px; }
        }
      `}</style>

      <div className="usr2 space-y-5 animate-in fade-in duration-300">
        {/* Stat chips */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 10,
          }}
        >
          {STAT_CHIPS.map((s) => (
            <div key={s.label} className="usr2-stat-chip">
              <div
                style={{
                  width: 38,
                  height: 38,
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
                    fontFamily: "'Syne',sans-serif",
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
            onChange={setSearch}
            placeholder="Find by name, email, username..."
          />
          <div className="usr2-filter-bar">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                className={`usr2-filter-btn ${filter === f.id ? "active" : ""}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
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
                    ["Member", "left"],
                    ["Status", "left"],
                    ["Balance", "right"],
                    ["Fund Wallet", "left"],
                    ["Actions", "right"],
                  ].map(([h, align]) => (
                    <th
                      key={h}
                      className="usr2-th"
                      style={{ textAlign: align as any }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className={`usr2-tr ${u.is_banned ? "banned" : ""}`}
                  >
                    {/* Member */}
                    <td className="usr2-td">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              overflow: "hidden",
                              border: "2px solid #ede9fe",
                            }}
                          >
                            <img
                              src={
                                u.avatar ||
                                `https://ui-avatars.com/api/?name=${u.username}&background=ede9fe&color=7c5cfc&size=36`
                              }
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                              alt=""
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  `https://ui-avatars.com/api/?name=${u.username}&background=ede9fe&color=7c5cfc&size=36`;
                              }}
                            />
                          </div>
                          {u.is_verified && (
                            <span
                              style={{
                                position: "absolute",
                                bottom: -1,
                                right: -1,
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                background: "#10b981",
                                border: "2px solid #fff",
                              }}
                            />
                          )}
                        </div>
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span
                              className="font-display"
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#1a1230",
                              }}
                            >
                              @{u.username}
                            </span>
                            {u.id === currentUserId && (
                              <span
                                style={{
                                  padding: "2px 6px",
                                  borderRadius: 5,
                                  background: "#f5f3ff",
                                  border: "1px solid #ede9fe",
                                  fontFamily: "'Syne',sans-serif",
                                  fontSize: 8,
                                  fontWeight: 700,
                                  textTransform: "uppercase" as const,
                                  letterSpacing: "0.07em",
                                  color: "#7c5cfc",
                                }}
                              >
                                You
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              color: "#b8addb",
                              display: "block",
                              maxWidth: 180,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap" as const,
                            }}
                          >
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    {/* Status badges */}
                    <td className="usr2-td">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        {u.is_banned && (
                          <span
                            className="usr2-badge"
                            style={{ background: "#fef2f2", color: "#ef4444" }}
                          >
                            <i
                              className="fa-solid fa-ban"
                              style={{ fontSize: 8 }}
                            />{" "}
                            Banned
                          </span>
                        )}
                        {u.is_verified && (
                          <span
                            className="usr2-badge"
                            style={{ background: "#f0fdf4", color: "#10b981" }}
                          >
                            <i
                              className="fa-solid fa-check"
                              style={{ fontSize: 8 }}
                            />{" "}
                            Verified
                          </span>
                        )}
                        {u.has_deposited && (
                          <span
                            className="usr2-badge"
                            style={{ background: "#f5f3ff", color: "#7c5cfc" }}
                          >
                            <i
                              className="fa-solid fa-wallet"
                              style={{ fontSize: 8 }}
                            />{" "}
                            Deposited
                          </span>
                        )}
                        {!u.is_banned && !u.is_verified && !u.has_deposited && (
                          <span
                            style={{
                              fontFamily: "'Syne',sans-serif",
                              fontSize: 9,
                              fontWeight: 700,
                              textTransform: "uppercase" as const,
                              letterSpacing: "0.07em",
                              color: "#d8d0f8",
                            }}
                          >
                            Standard
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Balance */}
                    <td className="usr2-td" style={{ textAlign: "right" }}>
                      <span
                        className="font-display"
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#1a1230",
                        }}
                      >
                        ₦{Number(u.balance || 0).toLocaleString()}
                      </span>
                    </td>
                    {/* Fund wallet */}
                    <td className="usr2-td">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div style={{ position: "relative" }}>
                          <span
                            style={{
                              position: "absolute",
                              left: 9,
                              top: "50%",
                              transform: "translateY(-50%)",
                              fontSize: 11,
                              color: "#c4b5fd",
                              fontWeight: 700,
                              pointerEvents: "none",
                            }}
                          >
                            ₦
                          </span>
                          <input
                            type="number"
                            placeholder="Amount"
                            className="usr2-fund-input"
                            value={fundAmounts[u.id] || ""}
                            onChange={(e) =>
                              setFundAmounts((prev) => ({
                                ...prev,
                                [u.id]: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <button
                          className="usr2-credit-btn"
                          disabled={isLoading || !fundAmounts[u.id]}
                          onClick={async () => {
                            const amt = parseFloat(fundAmounts[u.id]);
                            if (!isNaN(amt) && amt > 0) {
                              await onFundUser(u.id, u.username, amt, u.email);
                              setFundAmounts((prev) => ({
                                ...prev,
                                [u.id]: "",
                              }));
                            }
                          }}
                        >
                          Credit
                        </button>
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="usr2-td" style={{ textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 6,
                        }}
                      >
                        <button
                          className={`usr2-action-btn ${u.is_verified ? "verify-on" : "verify-off"}`}
                          onClick={() =>
                            onToggleVerify(
                              u.id,
                              u.is_verified,
                              u.username,
                              u.email,
                            )
                          }
                          title={
                            u.is_verified
                              ? "Remove verification"
                              : "Verify user"
                          }
                        >
                          <i
                            className={`fa-solid ${u.is_verified ? "fa-user-check" : "fa-user-plus"}`}
                          />
                          {u.is_verified ? "Verified" : "Verify"}
                        </button>
                        <button
                          className={`usr2-action-btn ${u.is_banned ? "unban" : "ban"}`}
                          onClick={() =>
                            onToggleBan(u.id, u.is_banned, u.username, u.email)
                          }
                          title={
                            u.is_banned ? "Restore access" : "Restrict access"
                          }
                        >
                          <i
                            className={`fa-solid ${u.is_banned ? "fa-lock-open" : "fa-ban"}`}
                          />
                          {u.is_banned ? "Restore" : "Restrict"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ padding: "56px", textAlign: "center" }}
                    >
                      <i
                        className="fa-solid fa-users-slash"
                        style={{
                          fontSize: 32,
                          color: "#ede9fe",
                          display: "block",
                          marginBottom: 12,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'Syne',sans-serif",
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.08em",
                          color: "#c4b5fd",
                        }}
                      >
                        No members found
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
