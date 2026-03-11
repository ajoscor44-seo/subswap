import React, { useState, useEffect, useMemo } from "react";
import { Transaction } from "@/constants/types";
import { Marketplace } from "./Marketplace";
import TransactionHistory from "./TransactionHistory";
import { supabase } from "../lib/supabase";
import { useAuth } from "@/providers/auth";
import { useNavigator } from "@/providers/navigator";
import { SettingsTab } from "./SettingsTab";
import WalletTab from "./WalletTab";
import OverviewTab from "./OverviewTab";
import MyStacksTab from "./MyStacksTab";
import { NAV_ITEMS } from "@/constants/data";

export const Dashboard: React.FC = () => {
  const { 
    user, 
    logout, 
    refreshProfile, 
    subscriptions: contextSubs, 
    refreshSubscriptions 
  } = useAuth();
  const { dashboardTab, changeTab, goTo } = useNavigator();

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [dashboardTab]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const activeSubscriptions = useMemo(() => {
    if (!contextSubs) return [];
    return contextSubs.filter((sub) => {
      if (sub.status === "Expired" || sub.status === "Cancelled") return false;
      const date = sub.purchased_at || sub.created_at;
      if (!date) return true;
      return (
        new Date(new Date(date).getTime() + 30 * 24 * 60 * 60 * 1000) >
        new Date()
      );
    });
  }, [contextSubs]);

  const showStatus = (text: string, type: "success" | "error" = "success") => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // We rely on useAuth for subscriptions now, but we can trigger a refresh
      if (refreshSubscriptions) await refreshSubscriptions();
      
      const { data: txs } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);
      if (txs) setRecentTransactions(txs);
      
      if (refreshProfile) await refreshProfile();
    } catch (err: any) {
      console.error("Dashboard sync error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id, dashboardTab]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showStatus("Copied to clipboard!");
  };

  const handleFlutterwavePayment = (amount: number) => {
    if (!user) return;
    // @ts-ignore — FlutterwaveCheckout is injected by the v3 script tag
    FlutterwaveCheckout({
      public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY!,
      tx_ref: `tx-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      amount,
      currency: "NGN",
      payment_options: "card,mobilemoney,ussd",
      customer: {
        email: user.email,
        phone_number: "",
        name: user.name || user.username,
      },
      customizations: {
        title: "DiscountZAR Wallet Top-up",
        description: `Payment for ₦${amount.toLocaleString()} wallet credit`,
        logo: "https://ui-avatars.com/api/?name=DiscountZAR&background=6366f1&color=fff",
      },
      callback: async (response: any) => {
        if (
          response.status === "successful" ||
          response.status === "completed"
        ) {
          try {
            const newBalance = Number(user?.balance || 0) + amount;

            const { error: balanceError } = await supabase
              .from("profiles")
              .update({ balance: newBalance })
              .eq("id", user.id);
            if (balanceError) throw balanceError;

            await supabase.from("transactions").insert({
              user_id: user.id,
              amount,
              type: "Deposit",
              description: `Wallet Top-up: ₦${amount.toLocaleString()}`,
            });

            showStatus(
              `₦${amount.toLocaleString()} added to your wallet!`,
              "success",
            );
            fetchData();
            goTo("dashboard");
          } catch (err: any) {
            showStatus(err.message || "Failed to update balance.", "error");
          }
        } else {
          showStatus("Payment was not completed.", "error");
        }
      },
      onclose: async () => {
        if (refreshProfile) await refreshProfile();
      },
    });
  };

  if (!user) return null;

  // ── Sidebar content ──────────────
  const SidebarContent = () => (
    <>
      {/* Profile */}
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
              src={
                user.avatar ||
                `https://ui-avatars.com/api/?name=${user.username}&background=ede9fe&color=7c5cfc&size=36`
              }
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
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
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
              (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
            }
          >
            <i className="fa-solid fa-plus" style={{ fontSize: 9 }} /> Fund
            Wallet
          </button>
        </div>
      </div>

      {/* Nav */}
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
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
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

      {/* Footer */}
      <div
        style={{ padding: "8px 12px 16px", borderTop: "1.5px solid #f5f3ff" }}
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
            <div style={{ display: "flex" }}>
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
            <span style={{ fontSize: 12, color: "#7c5cfc", fontWeight: 500 }}>
              {activeSubscriptions.length} active stack
              {activeSubscriptions.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
        <button className="db-logout" onClick={logout}>
          <i
            className="fa-solid fa-arrow-right-from-bracket"
            style={{ fontSize: 13 }}
          />{" "}
          Sign Out
        </button>
      </div>
    </>
  );

  const currentNavItem = NAV_ITEMS.find((n) => n.id === dashboardTab);

  return (
    <>
      <style>{`
        .db-root { font-family: 'DM Sans', sans-serif; }
        .db-root * { box-sizing: border-box; }

        .db-sidebar { background: #fff; border: 1.5px solid #f0eef9; border-radius: 20px; overflow: hidden; position: sticky; top: 20px; }
        .db-avatar-ring { width: 72px; height: 72px; border-radius: 50%; border: 3px solid #ede9fe; box-shadow: 0 4px 16px rgba(124,92,252,0.2); overflow: hidden; flex-shrink: 0; }
        .db-avatar-ring img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .db-nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 12px; border: none; background: none; cursor: pointer; width: 100%; text-align: left; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #9b8fc2; transition: all 0.18s; position: relative; }
        .db-nav-item:hover { background: #fafafe; color: #1a1230; }
        .db-nav-item.active { background: linear-gradient(135deg,#f5f3ff,#ede9fe); color: #7c5cfc; font-weight: 600; }
        .db-nav-item.active .db-nav-icon-wrap { background: linear-gradient(135deg,#7c5cfc,#6366f1); box-shadow: 0 4px 10px rgba(124,92,252,0.35); }
        .db-nav-item.active .db-nav-icon-wrap i { color: #fff; }
        .db-nav-item:hover:not(.active) .db-nav-icon-wrap { background: #f0eef9; }
        .db-nav-item:hover:not(.active) .db-nav-icon-wrap i { color: #7c5cfc; }
        .db-nav-icon-wrap { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; background: #f5f3ff; flex-shrink: 0; transition: all 0.18s; }
        .db-nav-icon-wrap i { font-size: 13px; color: #c4b5fd; transition: color 0.18s; }
        .db-active-dot { width: 6px; height: 6px; border-radius: 50%; background: #7c5cfc; margin-left: auto; flex-shrink: 0; }

        .db-balance-mini { background: linear-gradient(135deg,#1a1230,#2d1f6e); border-radius: 14px; padding: 16px 18px; position: relative; overflow: hidden; }
        .db-balance-mini::after { content:''; position:absolute; bottom:-20px; right:-20px; width:80px; height:80px; border-radius:50%; background:rgba(124,92,252,0.2); }

        .db-logout { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 16px; border-radius: 12px; border: none; background: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #fca5a5; transition: all 0.18s; }
        .db-logout:hover { background: #fef2f2; color: #ef4444; }

        @keyframes toastIn { from{opacity:0;transform:translateY(-10px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        .db-toast { animation: toastIn 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fa-spin { animation: spin 0.8s linear infinite; display: inline-block; }

        /* Mobile topbar */
        .db-topbar { display: none; align-items: center; justify-content: space-between; padding: 10px 16px; background: rgba(255,255,255,0.92); backdrop-filter: blur(16px); border-bottom: 1.5px solid #f0eef9; position: sticky; top: 0; z-index: 80; gap: 12px; }

        /* Drawer */
        .db-drawer-overlay { position: fixed; inset: 0; z-index: 150; background: rgba(26,18,48,0.45); backdrop-filter: blur(4px); opacity: 0; pointer-events: none; transition: opacity 0.25s; }
        .db-drawer-overlay.open { opacity: 1; pointer-events: all; }
        .db-drawer { position: fixed; top: 0; left: 0; bottom: 0; width: min(300px,85vw); z-index: 151; background: #fff; overflow-y: auto; box-shadow: 12px 0 40px rgba(26,18,48,0.16); transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.34,1,0.64,1); }
        .db-drawer.open { transform: translateX(0); }
        .db-drawer-close { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; border-radius: 9px; border: 1.5px solid #f0eef9; background: #fafafe; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 12px; color: #b8addb; transition: all 0.18s; z-index: 2; }
        .db-drawer-close:hover { border-color: #d8d0f8; color: #7c5cfc; background: #f5f3ff; }

        /* Bottom nav */
        .db-mobile-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1.5px solid #f0eef9; z-index: 85; padding: 8px 8px env(safe-area-inset-bottom,12px); }
        .db-mob-btn { display: flex; flex-direction: column; align-items: center; gap: 3px; background: none; border: none; cursor: pointer; padding: 5px 4px; border-radius: 10px; transition: background 0.15s; flex: 1; }
        .db-mob-btn .db-mob-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 15px; transition: all 0.18s; color: #c4b5fd; }
        .db-mob-btn span { font-size: 9px; font-family: 'Syne',sans-serif; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #c4b5fd; transition: color 0.15s; }
        .db-mob-btn.active .db-mob-icon { background: linear-gradient(135deg,#7c5cfc,#6366f1); color: #fff; box-shadow: 0 3px 8px rgba(124,92,252,0.3); }
        .db-mob-btn.active span { color: #7c5cfc; }

        @media (max-width: 1023px) {
          .db-sidebar    { display: none !important; }
          .db-topbar     { display: flex !important; }
          .db-mobile-nav { display: flex !important; justify-content: space-around; align-items: flex-start; }
          .db-layout     { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div
        className="db-root"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg,#f8f7ff 0%,#f1f0f9 100%)",
        }}
      >
        {/* Toast */}
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

        {/* ── Mobile top bar ── */}
        <div className="db-topbar">
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              border: "1.5px solid #f0eef9",
              background: "#fafafe",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 16,
                height: 2,
                borderRadius: 99,
                background: "#7c5cfc",
                display: "block",
              }}
            />
            <span
              style={{
                width: 11,
                height: 2,
                borderRadius: 99,
                background: "#7c5cfc",
                display: "block",
              }}
            />
            <span
              style={{
                width: 16,
                height: 2,
                borderRadius: 99,
                background: "#7c5cfc",
                display: "block",
              }}
            />
          </button>

          {/* Current tab pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flex: 1,
              justifyContent: "center",
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
                className={`fa-solid ${currentNavItem?.icon ?? "fa-gauge"}`}
                style={{ color: "#fff", fontSize: 12 }}
              />
            </div>
            <span
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 14,
                fontWeight: 800,
                color: "#1a1230",
              }}
            >
              {currentNavItem?.label ?? "Dashboard"}
            </span>
          </div>

          {/* Balance chip */}
          <button
            onClick={() => changeTab("wallet")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "6px 10px",
              borderRadius: 10,
              border: "1.5px solid #f0eef9",
              background: "#fafafe",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid #ede9fe",
              }}
            >
              <img
                src={user.avatar}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                alt=""
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://ui-avatars.com/api/?name=${user.username}&background=ede9fe&color=7c5cfc&size=24`;
                }}
              />
            </div>
            <div>
              <p
                style={{
                  margin: "0 0 1px",
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#1a1230",
                  lineHeight: 1,
                }}
              >
                ₦{user.balance.toLocaleString()}
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 8,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#c4b5fd",
                  lineHeight: 1,
                }}
              >
                Balance
              </p>
            </div>
          </button>
        </div>

        {/* ── Drawer overlay ── */}
        <div
          className={`db-drawer-overlay ${sidebarOpen ? "open" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* ── Slide-in drawer ── */}
        <div className={`db-drawer ${sidebarOpen ? "open" : ""}`}>
          <button
            className="db-drawer-close"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="fa-solid fa-xmark" />
          </button>
          <SidebarContent />
        </div>

        {/* ── Header band ── */}
        <div
          style={{
            background:
              "linear-gradient(135deg,#1a1230 0%,#2d1f6e 50%,#3730a3 100%)",
            height: 120,
            position: "relative",
            overflow: "hidden",
          }}
        >
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

        {/* ── Grid layout ── */}
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 24px 80px",
            marginTop: -60,
          }}
        >
          <div
            className="db-layout"
            style={{
              display: "grid",
              gridTemplateColumns: "260px 1fr",
              gap: 24,
              alignItems: "start",
            }}
          >
            {/* Desktop sidebar */}
            <aside className="db-sidebar">
              <SidebarContent />
            </aside>

            {/* Main */}
            <main className="db-main" style={{ minWidth: 0, zIndex: 10 }}>
              {dashboardTab === "overview" && (
                <OverviewTab
                  user={user}
                  activeSubscriptions={activeSubscriptions}
                  recentTransactions={recentTransactions}
                  changeTab={changeTab}
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
                    padding: "20px 15px",
                  }}
                >
                  <Marketplace />
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
              <span className="db-mob-icon mb-2">
                <i className={`fa-solid ${item.icon}`} />
              </span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};
