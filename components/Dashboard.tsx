import React, { useState, useEffect, useMemo } from "react";
import { User, Transaction } from "@/constants/types";
import { Marketplace } from "./Marketplace";
import TransactionHistory from "./TransactionHistory";
import { supabase } from "../lib/supabase";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { useAuth } from "@/providers/auth";
import { useNavigator } from "@/providers/navigator";
import { SettingsTab } from "./SettingsTab";
import WalletTab from "./WalletTab";
import OverviewTab from "./OverviewTab";
import MyStacksTab from "./MyStacksTab";
import { NAV_ITEMS } from "@/constants/data";

interface DashboardProps {
  user: User;
  onLogout: () => void;
  initialTab?:
    | "overview"
    | "stacks"
    | "explore"
    | "wallet"
    | "history"
    | "settings";
  onPurchaseSuccess?: () => void;
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
export const Dashboard: React.FC<DashboardProps> = ({ onPurchaseSuccess }) => {
  const { user, logout } = useAuth();
  const { dashboardTab, changeTab } = useNavigator();

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const activeSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      if (sub.status === "Expired" || sub.status === "Cancelled") return false;
      const date = sub.purchased_at || sub.created_at;
      if (!date) return true;
      const expiry = new Date(
        new Date(date).getTime() + 30 * 24 * 60 * 60 * 1000,
      );
      return expiry > new Date();
    });
  }, [subscriptions]);

  const fwConfig = {
    public_key:
      import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY ||
      "FLWPUBK_TEST-1ee9d1185c08b3332a2192bcf4702b37-X",
    tx_ref: Date.now().toString(),
    amount: 0,
    currency: "NGN",
    payment_options: "card,mobilemoney,ussd",
    customer: {
      email: user.email,
      phone_number: "",
      name: user.name || user.username,
    },
    customizations: {
      title: "DiscountZAR Wallet Top-up",
      description: "Payment for wallet credit",
      logo: "https://ui-avatars.com/api/?name=DiscountZAR&background=6366f1&color=fff",
    },
  };

  const handleFlutterPayment = useFlutterwave(fwConfig);

  const showStatus = (text: string, type: "success" | "error" = "success") => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: subs } = await supabase
        .from("user_subscriptions")
        .select("*, master_accounts(*)")
        .eq("user_id", user.id);
      if (subs) setSubscriptions(subs);

      const { data: txs } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);
      if (txs) setRecentTransactions(txs);
    } catch (err: any) {
      console.error("Dashboard sync error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id, dashboardTab]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showStatus("Copied to clipboard!");
  };

  const handleFlutterwavePayment = (amount: number) => {
    const config = {
      ...fwConfig,
      amount,
      tx_ref: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customizations: {
        ...fwConfig.customizations,
        description: `Payment for ₦${amount.toLocaleString()} wallet credit`,
      },
    };
    handleFlutterPayment({
      ...config,
      callback: async (response) => {
        if (response.status === "successful") {
          try {
            const { error: txError } = await supabase
              .from("transactions")
              .insert({
                user_id: user.id,
                amount,
                type: "Deposit",
                description: `Flutterwave Top-up: ₦${amount.toLocaleString()}`,
              });
            if (txError) throw txError;
            const { error: balError } = await supabase
              .from("profiles")
              .update({ balance: user.balance + amount })
              .eq("id", user.id);
            if (balError) throw balError;
            showStatus(
              `₦${amount.toLocaleString()} added successfully!`,
              "success",
            );
            fetchData();
            if (onPurchaseSuccess) onPurchaseSuccess();
          } catch (err: any) {
            showStatus(err.message, "error");
          }
        } else {
          showStatus("Payment was not successful", "error");
        }
        closePaymentModal();
      },
      onClose: () => {},
    });
  };

  return (
    <>
      <style>{`
        .db-root { font-family: 'DM Sans', sans-serif; }
        .db-root * { box-sizing: border-box; }

        /* ── Sidebar ── */
        .db-sidebar {
          background: #fff;
          border: 1.5px solid #f0eef9;
          border-radius: 20px;
          overflow: hidden;
          position: sticky;
          top: 20px;
        }

        /* Avatar ring */
        .db-avatar-ring {
          width: 72px; height: 72px; border-radius: 50%;
          border: 3px solid #ede9fe;
          box-shadow: 0 4px 16px rgba(124,92,252,0.2);
          overflow: hidden; flex-shrink: 0;
        }
        .db-avatar-ring img { width: 100%; height: 100%; object-fit: cover; display: block; }

        /* Nav item */
        .db-nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 16px; border-radius: 12px;
          border: none; background: none; cursor: pointer;
          width: 100%; text-align: left;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          color: #9b8fc2;
          transition: all 0.18s;
          position: relative;
        }
        .db-nav-item:hover { background: #fafafe; color: #1a1230; }
        .db-nav-item.active {
          background: linear-gradient(135deg, #f5f3ff, #ede9fe);
          color: #7c5cfc;
          font-weight: 600;
        }
        .db-nav-item.active .db-nav-icon-wrap {
          background: linear-gradient(135deg, #7c5cfc, #6366f1);
          box-shadow: 0 4px 10px rgba(124,92,252,0.35);
        }
        .db-nav-item.active .db-nav-icon-wrap i { color: #fff; }
        .db-nav-item:hover:not(.active) .db-nav-icon-wrap { background: #f0eef9; }
        .db-nav-item:hover:not(.active) .db-nav-icon-wrap i { color: #7c5cfc; }

        /* Nav icon circle */
        .db-nav-icon-wrap {
          width: 34px; height: 34px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          background: #f5f3ff; flex-shrink: 0;
          transition: all 0.18s;
        }
        .db-nav-icon-wrap i { font-size: 13px; color: #c4b5fd; transition: color 0.18s; }

        /* Active indicator dot */
        .db-active-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #7c5cfc; margin-left: auto; flex-shrink: 0;
        }

        /* Balance mini card in sidebar */
        .db-balance-mini {
          background: linear-gradient(135deg, #1a1230, #2d1f6e);
          border-radius: 14px;
          padding: 16px 18px;
          position: relative; overflow: hidden;
        }
        .db-balance-mini::after {
          content: '';
          position: absolute; bottom: -20px; right: -20px;
          width: 80px; height: 80px; border-radius: 50%;
          background: rgba(124,92,252,0.2);
        }

        /* Logout */
        .db-logout {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 10px 16px; border-radius: 12px;
          border: none; background: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          font-weight: 500; color: #fca5a5;
          transition: all 0.18s;
        }
        .db-logout:hover { background: #fef2f2; color: #ef4444; }

        /* Toast */
        @keyframes toastIn { from{opacity:0;transform:translateY(-10px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        .db-toast { animation: toastIn 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }

        /* Mobile nav bar */
        .db-mobile-nav {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0;
          background: #fff; border-top: 1.5px solid #f0eef9;
          z-index: 200; padding: 8px 12px 12px;
        }
        @media (max-width: 1023px) {
          .db-sidebar { display: none; }
          .db-mobile-nav { display: flex; justify-content: space-around; align-items: center; }
        }

        .db-mob-btn {
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          background: none; border: none; cursor: pointer;
          padding: 6px 10px; border-radius: 10px;
          transition: background 0.15s; flex: 1;
        }
        .db-mob-btn i { font-size: 16px; color: #c4b5fd; transition: color 0.15s; }
        .db-mob-btn span { font-size: 9px; font-family: 'Syne',sans-serif; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #c4b5fd; }
        .db-mob-btn.active i { color: #7c5cfc; }
        .db-mob-btn.active span { color: #7c5cfc; }
        .db-mob-btn:hover { background: #f5f3ff; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .fa-spin { animation: spin 0.8s linear infinite; display: inline-block; }
      `}</style>

      <div
        className="db-root"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #f8f7ff 0%, #f1f0f9 100%)",
        }}
      >
        {/* ── Toast ── */}
        {statusMsg && (
          <div
            className="db-toast"
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
              background: statusMsg.type === "success" ? "#fff" : "#fef2f2",
              border: `1.5px solid ${statusMsg.type === "success" ? "#d8d0f8" : "#fca5a5"}`,
              boxShadow: "0 12px 32px rgba(0,0,0,0.1)",
              maxWidth: 320,
            }}
          >
            <i
              className={`fa-solid ${statusMsg.type === "success" ? "fa-circle-check" : "fa-triangle-exclamation"}`}
              style={{
                color: statusMsg.type === "success" ? "#10b981" : "#ef4444",
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
              {statusMsg.text}
            </p>
          </div>
        )}

        {/* ── Page header band ── */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #1a1230 0%, #2d1f6e 50%, #3730a3 100%)",
            height: 120,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.03)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -60,
              left: 200,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "rgba(124,92,252,0.12)",
            }}
          />
        </div>

        {/* ── Layout ── */}
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 24px 80px",
            marginTop: -60,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "260px 1fr",
              gap: 24,
              alignItems: "start",
            }}
          >
            {/* ── Sidebar ── */}
            <aside className="db-sidebar">
              {/* Profile section */}
              <div
                style={{
                  padding: "24px 20px 16px",
                  borderBottom: "1.5px solid #f5f3ff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginBottom: 16,
                  }}
                >
                  <div className="db-avatar-ring">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=7c5cfc&color=fff&size=72`;
                      }}
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3
                      className="font-display"
                      style={{
                        margin: "0 0 3px",
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#1a1230",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      @{user.username}
                    </h3>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#10b981",
                          display: "inline-block",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: "'Syne',sans-serif",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "#10b981",
                        }}
                      >
                        Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mini balance */}
                <div className="db-balance-mini">
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: 9,
                      fontFamily: "'Syne',sans-serif",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "rgba(255,255,255,0.4)",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    Balance
                  </p>
                  <p
                    className="font-display"
                    style={{
                      margin: "0 0 10px",
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#fff",
                      letterSpacing: "-0.02em",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    ₦{user.balance.toLocaleString()}
                  </p>
                  <button
                    onClick={() => changeTab("wallet")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 14px",
                      borderRadius: 8,
                      border: "none",
                      background: "rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.85)",
                      fontFamily: "'Syne',sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      position: "relative",
                      zIndex: 1,
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.2)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.12)")
                    }
                  >
                    <i className="fa-solid fa-plus" style={{ fontSize: 9 }} />
                    Fund Wallet
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <nav style={{ padding: "12px 12px 8px" }}>
                <p
                  style={{
                    margin: "0 4px 8px 4px",
                    fontSize: 9,
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#d8d0f8",
                  }}
                >
                  Navigation
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  {NAV_ITEMS.map((item) => {
                    const isActive = dashboardTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => changeTab(item.id as any)}
                        className={`db-nav-item ${isActive ? "active" : ""}`}
                      >
                        <span className="db-nav-icon-wrap">
                          <i className={`fa-solid ${item.icon}`} />
                        </span>
                        <span>{item.label}</span>
                        {isActive && <span className="db-active-dot" />}
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* Bottom: active stacks count + logout */}
              <div
                style={{
                  padding: "8px 12px 16px",
                  borderTop: "1.5px solid #f5f3ff",
                }}
              >
                {activeSubscriptions.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: "#f5f3ff",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: "flex", gap: -4 }}>
                      {activeSubscriptions.slice(0, 3).map((sub, i) => (
                        <img
                          key={i}
                          src={sub.master_accounts?.icon_url}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #fff",
                            marginLeft: i > 0 ? -6 : 0,
                          }}
                          alt=""
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://ui-avatars.com/api/?name=S&background=ede9fe&color=7c5cfc&size=22`;
                          }}
                        />
                      ))}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#7c5cfc",
                        fontWeight: 500,
                      }}
                    >
                      {activeSubscriptions.length} active stack
                      {activeSubscriptions.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                <button className="db-logout" onClick={logout}>
                  <i
                    className="fa-solid fa-arrow-right-from-bracket"
                    style={{ fontSize: 13 }}
                  />
                  Sign Out
                </button>
              </div>
            </aside>

            {/* ── Main content ── */}
            <main style={{ minWidth: 0, zIndex: 10 }}>
              {dashboardTab === "overview" && (
                <OverviewTab
                  user={user}
                  activeSubscriptions={activeSubscriptions}
                  recentTransactions={recentTransactions}
                  changeTab={changeTab}
                  onPurchaseSuccess={onPurchaseSuccess}
                />
              )}
              {dashboardTab === "stacks" && (
                <MyStacksTab
                  user={user}
                  activeSubscriptions={activeSubscriptions}
                  isLoading={isLoading}
                  changeTab={changeTab}
                  copyToClipboard={copyToClipboard}
                />
              )}
              {dashboardTab === "explore" && (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 15,
                    border: "1.5px solid #f0eef9",
                    padding: "32px",
                  }}
                >
                  <Marketplace
                    user={user}
                    onAuthRequired={() => {}}
                    onPurchaseSuccess={onPurchaseSuccess}
                  />
                </div>
              )}
              {dashboardTab === "wallet" && (
                <WalletTab
                  user={user}
                  customAmount={customAmount}
                  setCustomAmount={setCustomAmount}
                  handleFlutterwavePayment={handleFlutterwavePayment}
                  showStatus={showStatus}
                />
              )}
              {dashboardTab === "history" && (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 15,
                    border: "1.5px solid #f0eef9",
                    overflow: "hidden",
                  }}
                >
                  <TransactionHistory user={user} isDashboardView={true} />
                </div>
              )}
              {dashboardTab === "settings" && (
                <SettingsTab
                  user={user}
                  showStatus={showStatus}
                  logout={logout}
                />
              )}
            </main>
          </div>
        </div>

        {/* ── Mobile bottom nav ── */}
        <nav className="db-mobile-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => changeTab(item.id as any)}
              className={`db-mob-btn ${dashboardTab === item.id ? "active" : ""}`}
            >
              <i className={`fa-solid ${item.icon}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};
