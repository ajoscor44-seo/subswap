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

// Helper function to get time remaining
const getTimeRemaining = (dateStr: string) => {
  const purchaseDate = new Date(dateStr);
  const expiryDate = new Date(
    purchaseDate.getTime() + 30 * 24 * 60 * 60 * 1000,
  );
  const now = new Date();
  const diff = expiryDate.getTime() - now.getTime();

  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
};

// MyStacks Tab Component
const MyStacksTab: React.FC<{
  user: User;
  activeSubscriptions: any[];
  isLoading: boolean;
  changeTab: (tab: string) => void;
  copyToClipboard: (text: string) => void;
}> = ({ user, activeSubscriptions, isLoading, changeTab, copyToClipboard }) => {
  return (
    <div className="bg-white rounded-4xl md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          My Active Access
        </h3>
        <button
          onClick={() => changeTab("explore")}
          className="text-xs font-black text-indigo-600"
        >
          Buy New +
        </button>
      </div>
      {isLoading ? (
        <div className="text-center py-20">
          <i className="fa-solid fa-spinner fa-spin text-indigo-600 text-2xl"></i>
        </div>
      ) : activeSubscriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {activeSubscriptions.map((sub) => (
            <div
              key={sub.id}
              className="p-6 md:p-8 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={sub.master_accounts?.icon_url}
                    className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-white shadow-sm object-cover"
                    alt=""
                  />
                  <div>
                    <h4 className="font-black text-slate-900 text-base md:text-lg">
                      {sub.master_accounts?.service_name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-black text-[8px] uppercase tracking-widest">
                        Active
                      </span>
                      <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-black text-[8px] uppercase tracking-widest flex items-center gap-1">
                        <i className="fa-regular fa-clock"></i>
                        {getTimeRemaining(
                          sub.purchased_at || sub.created_at || "",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/50 rounded-2xl p-4 mb-6 border border-slate-100/50 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                    Account ID
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700 font-mono font-bold truncate max-w-37.5">
                      {sub.master_accounts?.master_email}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(sub.master_accounts?.master_email)
                      }
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <i className="fa-solid fa-copy"></i>
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  copyToClipboard(sub.master_accounts?.master_password)
                }
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest group-hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
              >
                <i className="fa-solid fa-key mr-2"></i> Copy Password
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 md:py-20 bg-slate-50/50 rounded-4xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-medium text-sm">
            No active subscriptions yet.
          </p>
          <button
            onClick={() => changeTab("explore")}
            className="mt-4 bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-[10px] cursor-pointer tracking-widest"
          >
            Start a new subscription
          </button>
        </div>
      )}
    </div>
  );
};

// Explore Tab Component
const ExploreTab: React.FC<{
  user: User;
  onPurchaseSuccess?: () => void;
}> = ({ user, onPurchaseSuccess }) => {
  return (
    <div className="bg-white rounded-4xl md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 animate-in fade-in duration-500">
      <Marketplace
        user={user}
        onAuthRequired={() => {}}
        onPurchaseSuccess={onPurchaseSuccess}
      />
    </div>
  );
};

// History Tab Component
const HistoryTab: React.FC<{
  user: User;
}> = ({ user }) => {
  return (
    <div className="bg-white rounded-4xl md:rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in duration-500 overflow-hidden">
      <TransactionHistory user={user} isDashboardView={true} />
    </div>
  );
};

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

      const purchaseDate = new Date(date);
      const expiryDate = new Date(
        purchaseDate.getTime() + 30 * 24 * 60 * 60 * 1000,
      );
      return expiryDate > new Date();
    });
  }, [subscriptions]);

  const fwConfig = {
    public_key:
      import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY ||
      "FLWPUBK_TEST-1ee9d1185c08b3332a2192bcf4702b37-X",
    tx_ref: Date.now().toString(),
    amount: 0, // Placeholder, overridden in handle
    currency: "NGN",
    payment_options: "card,mobilemoney,ussd",
    customer: {
      email: user.email,
      phone_number: "",
      name: user.name || user.username,
    },
    customizations: {
      title: "DiscountZAR Wallet Top-up",
      description: `Payment for wallet credit`,
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
      amount: amount,
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
                amount: amount,
                type: "Deposit",
                description: `Flutterwave Top-up: ₦${amount.toLocaleString()}`,
              });
            if (txError) throw txError;

            const { error: balError } = await supabase
              .from("profiles")
              .update({
                balance: user.balance + amount,
              })
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
      onClose: () => {
        console.log("Payment modal closed");
      },
    });
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: "fa-house-chimney" },
    { id: "stacks", label: "My Stacks", icon: "fa-layer-group" },
    { id: "explore", label: "Explore", icon: "fa-compass" },
    { id: "wallet", label: "Wallet", icon: "fa-wallet" },
    { id: "history", label: "History", icon: "fa-receipt" },
  ] as const;

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100">
      {statusMsg && (
        <div
          className={`fixed top-24 right-6 z-300 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-4 border ${
            statusMsg.type === "success"
              ? "bg-slate-900 border-slate-700 text-white"
              : "bg-red-500 border-red-400 text-white"
          }`}
        >
          <i
            className={`fa-solid ${statusMsg.type === "success" ? "fa-circle-check text-emerald-400" : "fa-triangle-exclamation"}`}
          ></i>
          <p className="font-black text-[10px] uppercase tracking-widest">
            {statusMsg.text}
          </p>
        </div>
      )}

      <div className="bg-linear-to-r from-indigo-600 to-indigo-700 h-32 md:h-40 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 -mt-16 md:-mt-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-4xl md:rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100 text-center relative overflow-hidden">
              <div className="flex lg:flex-col items-center gap-4 lg:gap-0">
                <div className="relative inline-block lg:mb-4 shrink-0">
                  <img
                    src={user.avatar}
                    className="h-16 w-16 md:h-24 md:w-24 rounded-3xl md:rounded-4xl border-4 border-white shadow-xl object-cover"
                    alt={user.username}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff`;
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 md:h-8 md:w-8 bg-emerald-500 rounded-lg md:rounded-xl border-2 md:border-4 border-white flex items-center justify-center text-white text-[8px] md:text-[10px]">
                    <i className="fa-solid fa-check"></i>
                  </div>
                </div>
                <div className="text-left lg:text-center min-w-0">
                  <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight truncate">
                    @{user.username}
                  </h2>
                  <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-1">
                    Naira Verified
                  </p>
                </div>
              </div>

              <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-slate-50">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 md:gap-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => changeTab(item.id as any)}
                      className={`text-left px-3 md:px-5 py-3 rounded-xl flex items-center gap-2 md:gap-3 transition-all ${
                        dashboardTab === item.id
                          ? "bg-indigo-50 text-indigo-600 font-black"
                          : "text-slate-500 font-bold hover:bg-slate-50"
                      }`}
                    >
                      <i
                        className={`fa-solid ${item.icon} w-4 md:w-5 text-xs md:text-base`}
                      ></i>
                      <span className="text-[10px] md:text-sm truncate">
                        {item.label}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => changeTab("settings")}
                    className={`text-left px-3 md:px-5 py-3 rounded-xl flex items-center gap-2 md:gap-3 transition-all ${
                      dashboardTab === "settings"
                        ? "bg-indigo-50 text-indigo-600 font-black"
                        : "text-slate-500 font-bold hover:bg-slate-50"
                    }`}
                  >
                    <i className="fa-solid fa-gear w-4 md:w-5 text-xs md:text-base"></i>
                    <span className="text-[10px] md:text-sm truncate">
                      Settings
                    </span>
                  </button>
                </div>
              </div>

              <button
                onClick={logout}
                className="hidden lg:block mt-10 w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="z-20 lg:col-span-9 space-y-6 md:space-y-8">
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
              <ExploreTab user={user} onPurchaseSuccess={onPurchaseSuccess} />
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
            {dashboardTab === "history" && <HistoryTab user={user} />}
            {dashboardTab === "settings" && (
              <SettingsTab
                user={user}
                showStatus={showStatus}
                logout={logout}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
