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
  ) => Promise<void>;
  onToggleBan: (
    userId: string,
    currentStatus: boolean,
    username: string,
  ) => Promise<void>;
  onToggleVerify: (
    userId: string,
    currentStatus: boolean,
    username: string,
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Mini stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Members",
            value: stats.total,
            icon: "fa-users",
            color: "text-slate-900",
          },
          {
            label: "Verified",
            value: stats.verified,
            icon: "fa-badge-check",
            color: "text-emerald-600",
          },
          {
            label: "Deposited",
            value: stats.deposited,
            icon: "fa-wallet",
            color: "text-indigo-600",
          },
          {
            label: "Restricted",
            value: stats.banned,
            icon: "fa-ban",
            color: "text-red-500",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-100 rounded-2xl px-6 py-5 flex items-center gap-4"
          >
            <i className={`fa-solid ${s.icon} ${s.color} text-lg`} />
            <div>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
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
          placeholder="Find by name, email, username..."
        />
        <div className="flex bg-white border border-slate-200 p-1 rounded-xl gap-0.5">
          {(["all", "verified", "banned"] as const).map((f) => (
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
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-4xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-7 py-5">Member</th>
                <th className="px-7 py-5">Status</th>
                <th className="px-7 py-5 text-right">Balance</th>
                <th className="px-7 py-5">Fund Wallet</th>
                <th className="px-7 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className={`hover:bg-slate-50/70 transition-colors ${u.is_banned ? "opacity-50" : ""}`}
                >
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={u.avatar}
                          className="h-9 w-9 rounded-full border-2 border-slate-100 object-cover"
                          alt=""
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://ui-avatars.com/api/?name=${u.username}&background=6366f1&color=fff`;
                          }}
                        />
                        {u.is_verified && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900 text-sm">
                            @{u.username}
                          </span>
                          {u.id === currentUserId && (
                            <span className="text-[8px] bg-indigo-100 text-indigo-600 font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 truncate max-w-45 block">
                          {u.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-7 py-5">
                    <div className="flex flex-col gap-1">
                      {u.is_banned && (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-red-50 text-red-600 font-black uppercase tracking-widest px-2 py-1 rounded-lg w-fit">
                          <i className="fa-solid fa-ban text-[8px]" /> Banned
                        </span>
                      )}
                      {u.is_verified && (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-600 font-black uppercase tracking-widest px-2 py-1 rounded-lg w-fit">
                          <i className="fa-solid fa-check text-[8px]" />{" "}
                          Verified
                        </span>
                      )}
                      {u.has_deposited && (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-indigo-50 text-indigo-600 font-black uppercase tracking-widest px-2 py-1 rounded-lg w-fit">
                          <i className="fa-solid fa-wallet text-[8px]" />{" "}
                          Deposited
                        </span>
                      )}
                      {!u.is_banned && !u.is_verified && !u.has_deposited && (
                        <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">
                          Standard
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-7 py-5 text-right font-black text-slate-900">
                    ₦{Number(u.balance || 0).toLocaleString()}
                  </td>
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">
                          ₦
                        </span>
                        <input
                          type="number"
                          placeholder="Amount"
                          className="w-28 bg-slate-50 border border-slate-100 py-2.5 pl-7 pr-3 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
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
                        disabled={isLoading || !fundAmounts[u.id]}
                        onClick={async () => {
                          const amt = parseFloat(fundAmounts[u.id]);
                          if (!isNaN(amt) && amt > 0) {
                            await onFundUser(u.id, u.username, amt);
                            setFundAmounts((prev) => ({ ...prev, [u.id]: "" }));
                          }
                        }}
                        className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-40"
                      >
                        Credit
                      </button>
                    </div>
                  </td>
                  <td className="px-7 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          onToggleVerify(u.id, u.is_verified, u.username)
                        }
                        title={
                          u.is_verified ? "Remove verification" : "Verify user"
                        }
                        className={`h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                          u.is_verified
                            ? "bg-emerald-50 text-emerald-600 hover:bg-slate-100 hover:text-slate-500"
                            : "bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                        }`}
                      >
                        <i
                          className={`fa-solid ${u.is_verified ? "fa-user-check" : "fa-user-plus"} mr-1`}
                        />
                        {u.is_verified ? "Verified" : "Verify"}
                      </button>
                      <button
                        onClick={() =>
                          onToggleBan(u.id, u.is_banned, u.username)
                        }
                        title={
                          u.is_banned ? "Restore access" : "Restrict access"
                        }
                        className={`h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                          u.is_banned
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-red-50 text-red-500 hover:bg-red-100"
                        }`}
                      >
                        <i
                          className={`fa-solid ${u.is_banned ? "fa-lock-open" : "fa-ban"} mr-1`}
                        />
                        {u.is_banned ? "Restore" : "Restrict"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <i className="fa-solid fa-users-slash text-slate-200 text-4xl mb-4 block" />
                    <span className="text-slate-400 font-black uppercase tracking-widest text-xs">
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
  );
};
