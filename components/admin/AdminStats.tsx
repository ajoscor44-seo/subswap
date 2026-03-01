import { MasterAccount, Transaction } from "@/constants/types";
import React, { useMemo } from "react";
import { StatCard } from "./StatCard";

interface AdminStatsProps {
  accounts: MasterAccount[];
  users: any[];
  transactions: Transaction[];
}

export const AdminStats: React.FC<AdminStatsProps> = ({
  accounts,
  users,
  transactions,
}) => {
  const stats = useMemo(() => {
    const totalEscrow = users.reduce((a, u) => a + (Number(u.balance) || 0), 0);
    const totalRevenue = transactions
      .filter((t) => t.type === "Purchase")
      .reduce((a, t) => a + Math.abs(t.amount), 0);
    const totalDeposits = transactions
      .filter((t) => t.type === "Deposit")
      .reduce((a, t) => a + Math.abs(t.amount), 0);
    const availableSlots = accounts.reduce((a, b) => a + b.available_slots, 0);
    const totalSlots = accounts.reduce((a, b) => a + b.total_slots, 0);
    const occupiedSlots = totalSlots - availableSlots;
    const fillRate =
      totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

    // Top services by purchases (from transactions descriptions)
    const serviceMap: Record<string, { purchases: number; revenue: number }> =
      {};
    transactions
      .filter((t) => t.type === "Purchase")
      .forEach((t) => {
        // Try to extract service name from description
        const match = t.description?.match(/purchased (.+?) slot/i);
        const name = match?.[1] || "Unknown";
        if (!serviceMap[name]) serviceMap[name] = { purchases: 0, revenue: 0 };
        serviceMap[name].purchases += 1;
        serviceMap[name].revenue += Math.abs(t.amount);
      });

    const topServices = Object.entries(serviceMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.purchases - a.purchases)
      .slice(0, 5);

    // Recent transactions
    const recentTx = [...transactions]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 6);

    // New users this week
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newUsersThisWeek = users.filter(
      (u) => new Date(u.created_at).getTime() > oneWeekAgo,
    ).length;

    return {
      totalEscrow,
      totalRevenue,
      totalDeposits,
      availableSlots,
      totalSlots,
      occupiedSlots,
      fillRate,
      topServices,
      recentTx,
      newUsersThisWeek,
      bannedUsers: users.filter((u) => u.is_banned).length,
      verifiedUsers: users.filter((u) => u.is_verified).length,
    };
  }, [accounts, users, transactions]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          label="Platform Escrow"
          value={`₦${stats.totalEscrow.toLocaleString()}`}
          icon="fa-naira-sign"
          accent="dark"
          sub="Total user wallet balances"
        />
        <StatCard
          label="Purchase Revenue"
          value={`₦${stats.totalRevenue.toLocaleString()}`}
          icon="fa-bag-shopping"
          accent="indigo"
          sub={`From ${transactions.filter((t) => t.type === "Purchase").length} purchases`}
        />
        <StatCard
          label="Total Deposits"
          value={`₦${stats.totalDeposits.toLocaleString()}`}
          icon="fa-arrow-down-to-line"
          accent="emerald"
          sub={`${transactions.filter((t) => t.type === "Deposit").length} deposit events`}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard
          label="Total Members"
          value={users.length}
          icon="fa-users"
          sub={`+${stats.newUsersThisWeek} this week`}
          trend={{
            value: stats.newUsersThisWeek,
            label: `${stats.newUsersThisWeek} new`,
          }}
        />
        <StatCard
          label="Active Logs"
          value={accounts.length}
          icon="fa-layer-group"
          sub={`${accounts.filter((a) => a.available_slots > 0).length} with open slots`}
        />
        <StatCard
          label="Slot Fill Rate"
          value={`${stats.fillRate}%`}
          icon="fa-chart-pie"
          accent={stats.fillRate > 80 ? "emerald" : "amber"}
          sub={`${stats.occupiedSlots} / ${stats.totalSlots} slots`}
        />
        <StatCard
          label="Verified Members"
          value={stats.verifiedUsers}
          icon="fa-user-check"
          accent="emerald"
          sub={`${stats.bannedUsers} restricted`}
        />
      </div>

      {/* Two column: inventory health + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory health */}
        <div className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-indigo-500 text-xs" />
            Inventory Health
          </h3>
          <div className="space-y-4">
            {accounts.length === 0 && (
              <p className="text-slate-400 text-sm font-medium text-center py-8">
                No inventory yet
              </p>
            )}
            {accounts.slice(0, 6).map((acc) => {
              const pct = Math.round(
                ((acc.total_slots - acc.available_slots) / acc.total_slots) *
                  100,
              );
              return (
                <div key={acc.id} className="flex items-center gap-4">
                  <img
                    src={acc.icon_url}
                    className="h-8 w-8 rounded-lg object-cover shrink-0"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {acc.service_name}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 ml-2 shrink-0">
                        {acc.available_slots}/{acc.total_slots}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          pct >= 100
                            ? "bg-red-500"
                            : pct >= 70
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-black shrink-0 ${
                      pct >= 100
                        ? "text-red-500"
                        : pct >= 70
                          ? "text-amber-500"
                          : "text-emerald-600"
                    }`}
                  >
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity feed */}
        <div className="bg-white rounded-4xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i className="fa-solid fa-bolt text-amber-500 text-xs" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {stats.recentTx.length === 0 && (
              <p className="text-slate-400 text-sm font-medium text-center py-8">
                No transactions yet
              </p>
            )}
            {stats.recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.type === "Deposit"
                      ? "bg-emerald-50 text-emerald-600"
                      : tx.type === "Purchase"
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <i
                    className={`fa-solid text-xs ${
                      tx.type === "Deposit"
                        ? "fa-arrow-down"
                        : tx.type === "Purchase"
                          ? "fa-bag-shopping"
                          : "fa-arrow-up"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {tx.description}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono">
                    {new Date(tx.created_at).toLocaleString("en-NG", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs font-black shrink-0 ${
                    tx.amount >= 0 ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {tx.amount > 0 ? "+" : ""}₦
                  {Math.abs(tx.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform health banner */}
      <div className="bg-slate-900 rounded-4xl p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h4 className="text-xl font-black text-white mb-1">
              Platform Health
            </h4>
            <p className="text-slate-500 font-medium text-sm">
              Automated slot management · Real-time inventory tracking
            </p>
          </div>
          <div className="flex gap-10">
            {[
              {
                label: "Open Slots",
                value: stats.availableSlots,
                color: "text-emerald-400",
              },
              {
                label: "Occupied",
                value: stats.occupiedSlots,
                color: "text-indigo-400",
              },
              {
                label: "Fill Rate",
                value: `${stats.fillRate}%`,
                color: "text-amber-400",
              },
            ].map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <div className="text-center">
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                    {s.label}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-px bg-slate-800 self-stretch" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
