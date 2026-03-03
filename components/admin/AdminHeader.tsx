import { AdminTab } from "@/constants/types";
import React from "react";

const TABS: { id: AdminTab; label: string; icon: string }[] = [
  { id: "stats", label: "Analytics", icon: "fa-chart-line" },
  { id: "inventory", label: "Inventory", icon: "fa-layer-group" },
  { id: "users", label: "Members", icon: "fa-users" },
  { id: "transactions", label: "Transactions", icon: "fa-receipt" },
];

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
}) => (
  <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center">
        <i className="fa-solid fa-terminal text-indigo-400" />
      </div>
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
          Admin Console
        </h1>
        <p className="text-slate-400 font-medium text-sm mt-0.5">
          Master control · DiscountZAR platform
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3 w-full md:w-auto">
      {/* Refresh */}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all disabled:opacity-40"
      >
        <i
          className={`fa-solid fa-rotate text-sm ${isLoading ? "animate-spin" : ""}`}
        />
      </button>

      {/* Tab switcher */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar gap-0.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <i className={`fa-solid ${tab.icon} text-[9px]`} />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  </header>
);
