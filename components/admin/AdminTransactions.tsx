import { Transaction } from "@/constants/types";
import React, { useMemo, useState } from "react";
import { SearchBar } from "./SearchBar";

interface AdminTransactionsProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

type TxFilter = "all" | "Deposit" | "Purchase" | "Withdrawal";

const TYPE_STYLES: Record<string, string> = {
  Deposit: "bg-emerald-50 text-emerald-600",
  Purchase: "bg-indigo-50 text-indigo-600",
  Withdrawal: "bg-amber-50 text-amber-600",
};

export const AdminTransactions: React.FC<AdminTransactionsProps> = ({
  transactions,
  onRefresh,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TxFilter>("all");

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Total Deposited",
            value: `₦${totals.deposits.toLocaleString()}`,
            icon: "fa-arrow-down",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Total Purchases",
            value: `₦${totals.purchases.toLocaleString()}`,
            icon: "fa-bag-shopping",
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
          {
            label: "Total Transactions",
            value: totals.count,
            icon: "fa-receipt",
            color: "text-slate-900",
            bg: "bg-slate-100",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-100 rounded-2xl px-6 py-5 flex items-center gap-4"
          >
            <div
              className={`h-10 w-10 ${s.bg} rounded-xl flex items-center justify-center`}
            >
              <i className={`fa-solid ${s.icon} ${s.color}`} />
            </div>
            <div>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by description, type, user..."
        />
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 p-1 rounded-xl gap-0.5">
            {(["all", "Deposit", "Purchase", "Withdrawal"] as TxFilter[]).map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f
                      ? "bg-slate-900 text-white"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {f}
                </button>
              ),
            )}
          </div>
          <button
            onClick={onRefresh}
            className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:border-indigo-300 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-rotate" />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-4xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-7 py-5">Type</th>
                <th className="px-7 py-5 text-right">Amount</th>
                <th className="px-7 py-5">Details</th>
                <th className="px-7 py-5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="px-7 py-5">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        TYPE_STYLES[tx.type] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td
                    className={`px-7 py-5 text-right font-black text-sm ${
                      tx.amount < 0 ? "text-red-500" : "text-emerald-600"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}₦
                    {Math.abs(tx.amount).toLocaleString()}
                  </td>
                  <td className="px-7 py-5">
                    <p className="text-sm font-bold text-slate-800">
                      {tx.description}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                      UID ···{tx.user_id?.slice(-8)}
                    </p>
                  </td>
                  <td className="px-7 py-5 text-right">
                    <p className="text-[10px] font-bold text-slate-500">
                      {new Date(tx.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-[9px] text-slate-300 font-mono">
                      {new Date(tx.created_at).toLocaleTimeString("en-NG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-20 text-center flex flex-col items-center justify-center gap-4"
                  >
                    <i className="fa-solid fa-receipt text-slate-200 text-4xl block" />
                    <span className="text-slate-400 font-black uppercase tracking-widest text-xs">
                      No transactions found
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
