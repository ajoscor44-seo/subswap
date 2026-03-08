import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { MasterAccount, User, Transaction } from "@/constants/types";
import { AdminHeader } from "./admin/AdminHeader";
import { AdminStats } from "./admin/AdminStats";
import { AdminInventory } from "./admin/AdminInventory";
import { AdminUsers } from "./admin/AdminUsers";
import { AdminTransactions } from "./admin/AdminTransactions";

type AdminTab = "stats" | "inventory" | "users" | "transactions";

interface AdminDashboardProps {
  user: User;
  onRefreshUser?: () => void;
}

interface Feedback {
  message: string;
  type: "success" | "error";
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onRefreshUser,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>("stats");
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<MasterAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fundAmount, setFundAmount] = useState<Record<string, string>>({});

  // ── Feedback toast ─────────────────────────────────────────────────────────
  const showFeedback = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchData = async (forceAll = false) => {
    setIsLoading(true);
    try {
      const doAccounts =
        activeTab === "inventory" || activeTab === "stats" || forceAll;
      const doProfiles =
        activeTab === "users" || activeTab === "stats" || forceAll;
      const doTransactions =
        activeTab === "transactions" || activeTab === "stats" || forceAll;

      await Promise.all([
        doAccounts &&
          supabase
            .from("master_accounts")
            .select("*")
            .order("created_at", { ascending: false })
            .then(({ data }) => data && setAccounts(data)),
        doProfiles &&
          supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false })
            .then(({ data }) => data && setAllUsers(data)),
        doTransactions &&
          supabase
            .from("transactions")
            .select("*")
            .order("created_at", { ascending: false })
            .then(({ data }) => data && setTransactions(data)),
      ]);
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setSearchQuery("");
  }, [activeTab]);

  // ── Fund user ──────────────────────────────────────────────────────────────
  const handleFundUser = async (targetId: string, username: string) => {
    const amount = parseFloat(fundAmount[targetId]);
    if (isNaN(amount) || amount <= 0) {
      showFeedback("Enter a valid amount", "error");
      return;
    }
    if (
      !window.confirm(
        `Add ₦${amount.toLocaleString()} to @${username}'s wallet?`,
      )
    )
      return;
    setIsLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", targetId)
        .single();
      const newBalance = (Number(profile?.balance) || 0) + amount;
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", targetId);
      if (updateError) throw updateError;
      await supabase.from("transactions").insert({
        user_id: targetId,
        amount,
        type: "Deposit",
        description: `Admin manual funding: ₦${amount.toLocaleString()}`,
      });
      showFeedback(`₦${amount.toLocaleString()} credited to @${username}`);
      setFundAmount({ ...fundAmount, [targetId]: "" });
      await fetchData(true);
      if (onRefreshUser && targetId === user.id) onRefreshUser();
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Ban/unban ──────────────────────────────────────────────────────────────
  const handleToggleBan = async (
    targetId: string,
    current: boolean,
    username: string,
  ) => {
    const action = current ? "Unban" : "Ban";
    if (!window.confirm(`${action} user @${username}?`)) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_banned: !current })
        .eq("id", targetId);
      if (error) throw error;
      showFeedback(`@${username} ${action}ned.`);
      fetchData(true);
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Inventory CRUD ─────────────────────────────────────────────────────────
  const handleInventorySubmit = async (
    formData: Partial<MasterAccount>,
    editingId: string | null,
  ) => {
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        available_slots: editingId
          ? formData.available_slots
          : formData.total_slots,
      };
      if (editingId) {
        const { error } = await supabase
          .from("master_accounts")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("master_accounts")
          .insert([payload]);
        if (error) throw error;
      }
      await fetchData(true);
      showFeedback(
        editingId ? "Listing updated." : "Listing launched successfully.",
      );
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Delete this listing? It will be removed from the marketplace.",
      )
    )
      return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("master_accounts")
        .delete()
        .eq("id", id);
      if (error) throw error;
      showFeedback("Listing deleted.");
      fetchData(true);
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Tab labels ─────────────────────────────────────────────────────────────
  const TAB_LABELS: Record<AdminTab, string> = {
    stats: "Overview",
    inventory: "Inventory",
    users: "Members",
    transactions: "Transactions",
  };

  return (
    <>
      <style>{`
        .adm-root { font-family: 'DM Sans', sans-serif; color: #1a1230; }
        .adm-root * { box-sizing: border-box; }

        /* Toast */
        @keyframes toastIn { from{opacity:0;transform:translateY(-10px) scale(0.96)} to{opacity:1;transform:scale(1)} }
        .adm-toast { animation: toastIn 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .fa-spin { animation: spin 0.8s linear infinite; display: inline-block; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .adm-content { animation: fadeUp 0.3s ease; }

        /* ── Layout ── */
        .adm-layout { max-width:1280px; margin:0 auto; padding:24px 24px 64px; display:grid; grid-template-columns:220px 1fr; gap:24px; align-items:start; }
        .adm-sidebar { background:#fff; border:1.5px solid #f0eef9; border-radius:20px; overflow:hidden; position:sticky; top:20px; }

        /* ── Mobile top bar (hidden on desktop) ── */
        .adm-mobile-bar { display:none; align-items:center; justify-content:space-between; padding:0 16px; height:52px; background:#fff; border-bottom:1.5px solid #f0eef9; }
        .adm-mobile-tab-scroll { display:none; overflow-x:auto; -webkit-overflow-scrolling:touch; background:#fff; border-bottom:1.5px solid #f0eef9; padding:8px 12px; gap:6px; }
        .adm-mobile-tab-scroll::-webkit-scrollbar { display:none; }
        .adm-mob-tab { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:99px; border:none; white-space:nowrap; cursor:pointer; font-family:'Syne',sans-serif; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; background:#f5f3ff; color:#b8addb; transition:all 0.18s; flex-shrink:0; }
        .adm-mob-tab.active { background:linear-gradient(135deg,#7c5cfc,#6366f1); color:#fff; box-shadow:0 3px 10px rgba(124,92,252,0.3); }

        @media (max-width: 900px) {
          .adm-layout { grid-template-columns:1fr; padding:16px 12px 80px; gap:16px; }
          .adm-sidebar { display:none; }
          .adm-mobile-bar { display:flex; }
          .adm-mobile-tab-scroll { display:flex; }
        }

        @media (max-width: 480px) {
          .adm-layout { padding:12px 8px 80px; }
        }
      `}</style>

      <div
        className="adm-root"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg,#f8f7ff 0%,#f1f0f9 100%)",
        }}
      >
        {/* ── Toast ── */}
        {feedback && (
          <div
            className="adm-toast"
            style={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 18px",
              borderRadius: 14,
              background: feedback.type === "success" ? "#fff" : "#fef2f2",
              border: `1.5px solid ${feedback.type === "success" ? "#d8d0f8" : "#fca5a5"}`,
              boxShadow: "0 12px 32px rgba(0,0,0,0.1)",
              maxWidth: 340,
            }}
          >
            <i
              className={`fa-solid ${feedback.type === "success" ? "fa-circle-check" : "fa-triangle-exclamation"}`}
              style={{
                color: feedback.type === "success" ? "#10b981" : "#ef4444",
                fontSize: 16,
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 500,
                color: "#1a1230",
              }}
            >
              {feedback.message}
            </p>
          </div>
        )}

        {/* ── Header band ── */}
        <div
          style={{
            background:
              "linear-gradient(135deg,#1a1230 0%,#2d1f6e 55%,#3730a3 100%)",
            padding: "0 28px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "rgba(124,92,252,0.15)",
              pointerEvents: "none",
            }}
          />
          {/* Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "linear-gradient(135deg,#7c5cfc,#6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i
                className="fa-solid fa-bolt"
                style={{ color: "#fff", fontSize: 13 }}
              />
            </div>
            <span
              className="font-display"
              style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}
            >
              DiscountZAR
            </span>
            <span
              style={{
                marginLeft: 4,
                padding: "2px 8px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                fontFamily: "'Syne',sans-serif",
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Admin
            </span>
          </div>
          {/* Admin user */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              position: "relative",
              zIndex: 1,
            }}
          >
            <div style={{ textAlign: "right" }}>
              <p
                className="font-display"
                style={{
                  margin: "0 0 1px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                @{user.username}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  color: "rgba(255,255,255,0.35)",
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.06em",
                }}
              >
                Super Admin
              </p>
            </div>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            >
              <img
                src={user.avatar}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                alt=""
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://ui-avatars.com/api/?name=${user.username}&background=7c5cfc&color=fff&size=34`;
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Layout ── */}
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "24px 24px 64px",
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* ── Sidebar ── */}
          <aside
            style={{
              background: "#fff",
              border: "1.5px solid #f0eef9",
              borderRadius: 20,
              overflow: "hidden",
              position: "sticky",
              top: 20,
            }}
          >
            {/* Sidebar header */}
            <div
              style={{
                padding: "20px 16px 14px",
                borderBottom: "1.5px solid #f5f3ff",
              }}
            >
              <p
                style={{
                  margin: "0 0 2px",
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.1em",
                  color: "#d8d0f8",
                }}
              >
                Admin Console
              </p>
              <h2
                className="font-display"
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#1a1230",
                }}
              >
                Control Panel
              </h2>
            </div>

            {/* Nav */}
            <div style={{ padding: "12px" }}>
              <AdminHeader
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                accountsCount={accounts.length}
                usersCount={allUsers.length}
                transactionsCount={transactions.length}
              />
            </div>

            {/* Sidebar footer */}
            <div
              style={{
                padding: "12px 16px 16px",
                borderTop: "1.5px solid #f5f3ff",
              }}
            >
              {/* Quick stats */}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#1a1230,#2d1f6e)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: -12,
                    right: -12,
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "rgba(124,92,252,0.2)",
                    pointerEvents: "none",
                  }}
                />
                <p
                  style={{
                    margin: "0 0 2px",
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.1em",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  Platform Escrow
                </p>
                <p
                  className="font-display"
                  style={{
                    margin: "0 0 8px",
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-0.02em",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  ₦
                  {allUsers
                    .reduce((a, b) => a + (Number(b.balance) || 0), 0)
                    .toLocaleString()}
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                  <div>
                    <p
                      style={{
                        margin: "0 0 1px",
                        fontSize: 8,
                        color: "rgba(255,255,255,0.3)",
                        fontFamily: "'Syne',sans-serif",
                        fontWeight: 700,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.07em",
                      }}
                    >
                      Listings
                    </p>
                    <p
                      className="font-display"
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#a78bfa",
                      }}
                    >
                      {accounts.length}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: "0 0 1px",
                        fontSize: 8,
                        color: "rgba(255,255,255,0.3)",
                        fontFamily: "'Syne',sans-serif",
                        fontWeight: 700,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.07em",
                      }}
                    >
                      Members
                    </p>
                    <p
                      className="font-display"
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#a78bfa",
                      }}
                    >
                      {allUsers.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Loading indicator */}
              {isLoading && (
                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: "#f5f3ff",
                  }}
                >
                  <i
                    className="fa-solid fa-spinner fa-spin"
                    style={{ color: "#7c5cfc", fontSize: 12 }}
                  />
                  <span
                    style={{
                      fontFamily: "'Syne',sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.07em",
                      color: "#a78bfa",
                    }}
                  >
                    Syncing…
                  </span>
                </div>
              )}
            </div>
          </aside>

          {/* ── Main content ── */}
          <main style={{ minWidth: 0, overflow: "hidden" }}>
            {/* Page header */}
            <div style={{ marginBottom: 20 }}>
              <p
                className="font-display"
                style={{
                  margin: "0 0 2px",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.12em",
                  color: "#a78bfa",
                }}
              >
                Admin Console
              </p>
              <h1
                className="font-display"
                style={{
                  margin: 0,
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#1a1230",
                  letterSpacing: "-0.02em",
                }}
              >
                {TAB_LABELS[activeTab]}
              </h1>
            </div>

            {/* Tab content */}
            <div className="adm-content" key={activeTab}>
              {activeTab === "stats" && (
                <AdminStats
                  accounts={accounts}
                  allUsers={allUsers}
                  transactions={transactions}
                />
              )}
              {activeTab === "inventory" && (
                <AdminInventory
                  accounts={accounts}
                  isLoading={isLoading}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onRefresh={() => fetchData(true)}
                  onSubmit={handleInventorySubmit}
                  onDelete={handleDelete}
                />
              )}
              {activeTab === "users" && (
                <AdminUsers
                  allUsers={allUsers}
                  isLoading={isLoading}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  fundAmount={fundAmount}
                  setFundAmount={setFundAmount}
                  onFundUser={handleFundUser}
                  onToggleBan={handleToggleBan}
                />
              )}
              {activeTab === "transactions" && (
                <AdminTransactions
                  transactions={transactions}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onRefresh={() => fetchData(true)}
                  isLoading={isLoading}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
