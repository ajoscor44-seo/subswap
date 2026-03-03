import React from "react";
import { User, Transaction } from "@/constants/types";
import { Marketplace } from "./Marketplace";

interface OverviewTabProps {
  user: User;
  activeSubscriptions: any[];
  recentTransactions: Transaction[];
  changeTab: (tab: string) => void;
  onPurchaseSuccess?: () => void;
}

// ── Helper: Time remaining ──
const getTimeRemaining = (dateStr: string) => {
  if (!dateStr) return "Expired";
  const purchaseDate = new Date(dateStr);
  const expiryDate = new Date(
    purchaseDate.getTime() + 30 * 24 * 60 * 60 * 1000,
  );
  const now = new Date();
  const diff = expiryDate.getTime() - now.getTime();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
};

const OverviewTab: React.FC<{
  user: User;
  activeSubscriptions: any[];
  recentTransactions: Transaction[];
  changeTab: (tab: string) => void;
  onPurchaseSuccess?: () => void;
}> = ({
  user,
  activeSubscriptions,
  recentTransactions,
  changeTab,
  onPurchaseSuccess,
}) => {
  return (
    <div className="animate-in fade-in duration-500 space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-linear-to-br from-slate-900 to-indigo-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <i className="fa-solid fa-naira-sign text-[8rem] rotate-12"></i>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
              My Balance
            </p>
            <h4 className="text-5xl md:text-6xl font-black tracking-tighter mb-10">
              ₦{user.balance.toLocaleString()}
            </h4>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => changeTab("wallet")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-indigo-900/40"
              >
                <i className="fa-solid fa-plus mr-2"></i> Fund Wallet
              </button>
              <button
                onClick={() => changeTab("explore")}
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
              >
                Find Slots
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white z-20 rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-piggy-bank"></i>
            </div>
            <h5 className="font-black text-slate-900 text-lg mb-1">
              Total Saved
            </h5>
            <p className="text-slate-500 text-sm font-medium">
              You've saved ₦{user.totalSaved.toLocaleString()} using
              DiscountZAR.
            </p>
          </div>
          <div className="pt-6 border-t border-slate-50">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Current Rate
            </p>
            <p className="text-sm font-black text-slate-900">
              ₦1.00 = 1 Credit
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity Mini Widget */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-black text-slate-900 text-lg">
              Recent Activity
            </h4>
            <button
              onClick={() => changeTab("history")}
              className="text-[10px] font-black uppercase tracking-widest text-indigo-600"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-slate-100 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs ${tx.amount > 0 ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-600"}`}
                    >
                      <i
                        className={`fa-solid ${tx.amount > 0 ? "fa-arrow-down" : "fa-arrow-up"}`}
                      ></i>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 line-clamp-1">
                        {tx.description}
                      </p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-black ${tx.amount > 0 ? "text-emerald-500" : "text-slate-900"}`}
                  >
                    {tx.amount > 0 ? "+" : ""}₦
                    {Math.abs(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-slate-400 font-bold uppercase py-4 text-center">
                No recent activity
              </p>
            )}
          </div>
        </div>

        {/* Active Slots Snapshot */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-black text-slate-900 text-lg">Active Stacks</h4>
            <button
              onClick={() => changeTab("stacks")}
              className="text-[10px] font-black uppercase tracking-widest text-indigo-600"
            >
              My Stacks
            </button>
          </div>
          <div className="flex -space-x-3 overflow-hidden mb-6">
            {activeSubscriptions.map((sub, i) => (
              <img
                key={i}
                src={sub.master_accounts?.icon_url}
                className="inline-block h-10 w-10 rounded-full ring-4 ring-white object-cover"
                alt=""
              />
            ))}
            {activeSubscriptions.length === 0 && (
              <p className="text-[10px] text-slate-400 font-bold uppercase py-4">
                No active stacks yet
              </p>
            )}
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            You have {activeSubscriptions.length} active premium subscriptions.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Quick Join
            </h3>
            <p className="text-slate-500 text-sm font-medium">
              Join a new group in seconds.
            </p>
          </div>
        </div>
        <Marketplace
          user={user}
          onAuthRequired={() => {}}
          onPurchaseSuccess={onPurchaseSuccess}
        />
      </div>
    </div>
  );
};

export default OverviewTab;
