import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { User, Transaction } from "@/constants/types";

interface TransactionHistoryProps {
  user: User;
  isDashboardView?: boolean;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  user,
  isDashboardView = false,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        let query = supabase.from("transactions").select("*");

        // If regular user, only show their own. Admins see all.
        if (!user.isAdmin) {
          query = query.eq("user_id", user.id);
        }

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

  const containerClasses = isDashboardView
    ? "bg-white"
    : "min-h-screen bg-slate-50 py-12";

  return (
    <div className={containerClasses}>
      <div className={isDashboardView ? "" : "container mx-auto px-4"}>
        {!isDashboardView && (
          <header className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Financial Ledger
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              {user.isAdmin
                ? "Global platform transaction history."
                : "Your complete wallet and subscription history."}
            </p>
          </header>
        )}

        {isDashboardView && (
          <div className="p-8 border-b border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Financial History
            </h3>
            <p className="text-slate-500 text-sm font-medium">
              Complete record of your wallet movements.
            </p>
          </div>
        )}

        <div
          className={`overflow-hidden ${isDashboardView ? "" : "bg-white rounded-[2.5rem] border border-slate-200 shadow-sm"}`}
        >
          {/* Mobile View: Cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="p-6 animate-pulse space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                </div>
              ))
            ) : transactions.length > 0 ? (
              transactions.map((tx) => (
                <div key={tx.id} className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <span
                      className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                        tx.type === "Deposit"
                          ? "bg-emerald-50 text-emerald-600"
                          : tx.type === "Purchase"
                            ? "bg-indigo-50 text-indigo-600"
                            : tx.type === "Withdrawal"
                              ? "bg-red-50 text-red-600"
                              : "bg-slate-50 text-slate-600"
                      }`}
                    >
                      {tx.type}
                    </span>
                    <span
                      className={`font-black text-sm ${tx.amount < 0 ? "text-red-500" : "text-emerald-500"}`}
                    >
                      {tx.amount < 0 ? "-" : "+"}₦
                      {Math.abs(tx.amount).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {tx.description || "No description provided"}
                  </p>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                    {user.isAdmin && (
                      <span className="font-mono text-[8px] text-slate-400">
                        ID:{" "}
                        {tx.user_id === user.id
                          ? "Self"
                          : `...${tx.user_id.slice(-6)}`}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                No transactions found
              </div>
            )}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {user.isAdmin && (
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      User ID
                    </th>
                  )}
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Type
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                    Amount
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Description
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={user.isAdmin ? 5 : 4} className="px-8 py-6">
                        <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      {user.isAdmin && (
                        <td className="px-8 py-6">
                          <span className="font-mono text-[10px] text-slate-400 group-hover:text-slate-600 transition-colors">
                            {tx.user_id === user.id
                              ? "Self"
                              : `...${tx.user_id.slice(-8)}`}
                          </span>
                        </td>
                      )}
                      <td className="px-8 py-6">
                        <span
                          className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                            tx.type === "Deposit"
                              ? "bg-emerald-50 text-emerald-600"
                              : tx.type === "Purchase"
                                ? "bg-indigo-50 text-indigo-600"
                                : tx.type === "Withdrawal"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td
                        className={`px-8 py-6 font-black text-sm text-right ${tx.amount < 0 ? "text-red-500" : "text-emerald-500"}`}
                      >
                        {tx.amount < 0 ? "-" : "+"}₦
                        {Math.abs(tx.amount).toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-xs text-slate-500 font-medium">
                        {tx.description || "No description provided"}
                      </td>
                      <td className="px-8 py-6 text-right text-[10px] font-black text-slate-300">
                        {new Date(tx.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={user.isAdmin ? 5 : 4}
                      className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-[10px]"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                          <i className="fa-solid fa-receipt text-xl"></i>
                        </div>
                        No transactions found
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
