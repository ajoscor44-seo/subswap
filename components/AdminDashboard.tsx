import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import {
  MasterAccount,
  User,
  Transaction,
  ProductCategory,
  FulfillmentType,
} from "../types";

interface AdminDashboardProps {
  user: User;
  onRefreshUser?: () => void;
}

interface Feedback {
  message: string;
  type: "success" | "error";
}

const PRESET_ICONS = [
  {
    name: "Netflix",
    url: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Spotify",
    url: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Canva",
    url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "ChatGPT",
    url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "YouTube",
    url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=400",
  },
];

const INITIAL_FORM: Partial<MasterAccount> = {
  service_name: "",
  master_email: "",
  master_password: "",
  total_slots: 5,
  available_slots: 5,
  price: 0,
  original_price: 0,
  description: "",
  icon_url: PRESET_ICONS[0].url,
  category: ProductCategory.STREAMING,
  fulfillment_type: "Password",
  features: [],
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onRefreshUser,
}) => {
  const [activeTab, setActiveTab] = useState<
    "stats" | "inventory" | "users" | "transactions"
  >("stats");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<MasterAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fundAmount, setFundAmount] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] =
    useState<Partial<MasterAccount>>(INITIAL_FORM);

  const showFeedback = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchData = async (forceAll = false) => {
    setIsLoading(true);
    try {
      // stats needs everything, users needs profiles, inventory needs accounts, transactions needs transactions
      const fetchAccounts =
        activeTab === "inventory" || activeTab === "stats" || forceAll;
      const fetchProfiles =
        activeTab === "users" || activeTab === "stats" || forceAll;
      const fetchTransactions =
        activeTab === "transactions" || activeTab === "stats" || forceAll;

      const promises = [];

      if (fetchAccounts) {
        promises.push(
          supabase
            .from("master_accounts")
            .select("*")
            .order("created_at", { ascending: false })
            .then(({ data }) => data && setAccounts(data)),
        );
      }
      if (fetchProfiles) {
        promises.push(
          supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false })
            .then(({ data }) => data && setAllUsers(data)),
        );
      }
      if (fetchTransactions) {
        promises.push(
          supabase
            .from("transactions")
            .select("*")
            .order("created_at", { ascending: false })
            .then(({ data }) => data && setTransactions(data)),
        );
      }

      await Promise.all(promises);
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

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
        amount: amount,
        type: "Deposit",
        description: `Admin manual funding: ₦${amount.toLocaleString()}`,
      });

      showFeedback(`₦${amount.toLocaleString()} credited to @${username}`);
      setFundAmount({ ...fundAmount, [targetId]: "" });

      // Update local and global state
      await fetchData(true);
      if (onRefreshUser && targetId === user.id) {
        onRefreshUser();
      }
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBan = async (
    targetId: string,
    currentStatus: boolean,
    username: string,
  ) => {
    const action = currentStatus ? "Unban" : "Ban";
    if (!window.confirm(`${action} user @${username}?`)) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_banned: !currentStatus })
        .eq("id", targetId);
      if (error) throw error;
      showFeedback(`User ${username} ${action}ned successfully.`);
      fetchData(true);
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      setShowForm(false);
      setEditingId(null);
      setFormData(INITIAL_FORM);
      fetchData(true);
      showFeedback(
        editingId ? "Account updated." : "New log added to marketplace.",
      );
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (acc: MasterAccount) => {
    setFormData(acc);
    setEditingId(acc.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this log? It will disappear from the marketplace.",
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
      showFeedback("Log deleted.");
      fetchData(true);
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (activeTab === "inventory")
      return accounts.filter(
        (a) =>
          a.service_name.toLowerCase().includes(q) ||
          a.master_email.toLowerCase().includes(q),
      );
    if (activeTab === "users")
      return allUsers.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q),
      );
    if (activeTab === "transactions")
      return transactions.filter(
        (tx) =>
          tx.description.toLowerCase().includes(q) ||
          tx.type.toLowerCase().includes(q),
      );
    return [];
  }, [searchQuery, accounts, allUsers, transactions, activeTab]);

  return (
    <div className="container mx-auto px-4 py-12 space-y-10">
      {feedback && (
        <div
          className={`fixed top-24 right-6 z-300 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-4 border flex items-center gap-3 ${
            feedback.type === "success"
              ? "bg-slate-900 border-slate-700 text-white"
              : "bg-red-500 border-red-400 text-white"
          }`}
        >
          <i
            className={`fa-solid ${feedback.type === "success" ? "fa-circle-check text-emerald-400" : "fa-circle-exclamation"}`}
          ></i>
          <p className="font-black text-[10px] uppercase tracking-widest">
            {feedback.message}
          </p>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Admin Console
          </h1>
          <p className="text-slate-500 font-medium">
            Master control for SubSwap inventory and members.
          </p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
          {(["stats", "inventory", "users", "transactions"] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-slate-900 text-white shadow-lg"
                    : "text-slate-400 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>
      </header>

      {activeTab === "inventory" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                placeholder="Search logs..."
                className="w-full bg-white border border-slate-200 p-3 pl-10 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => fetchData(true)}
                className="flex-1 md:flex-none bg-white border border-slate-200 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50"
              >
                <i className="fa-solid fa-rotate mr-2"></i> Sync
              </button>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  if (!showForm) {
                    setEditingId(null);
                    setFormData(INITIAL_FORM);
                  }
                }}
                className="flex-1 md:flex-none bg-indigo-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                {showForm ? "Close Form" : "+ Add Log"}
              </button>
            </div>
          </div>

          {showForm && (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-2xl animate-in zoom-in-95">
              <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <i className="fa-solid fa-file-invoice text-indigo-600"></i>
                {editingId ? "Edit Log Entry" : "Create New Log Entry"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Service Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold"
                      value={formData.service_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          service_name: e.target.value,
                        })
                      }
                      placeholder="e.g. Netflix Premium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Category
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as ProductCategory,
                        })
                      }
                    >
                      {Object.values(ProductCategory).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Fulfillment Method
                    </label>
                    <select
                      className="w-full bg-slate-50 border-2 border-indigo-100 p-4 rounded-xl font-black text-indigo-600"
                      value={formData.fulfillment_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fulfillment_type: e.target.value as FulfillmentType,
                        })
                      }
                    >
                      <option value="Password">Direct Password</option>
                      <option value="Invite Link">Invite Link</option>
                      <option value="OTP / Instruction">
                        OTP / Instructions
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Price (₦)
                    </label>
                    <input
                      type="number"
                      required
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Original Price (₦)
                    </label>
                    <input
                      type="number"
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold"
                      value={formData.original_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          original_price: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Total Slots
                    </label>
                    <input
                      type="number"
                      required
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold"
                      value={formData.total_slots}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          total_slots: parseInt(e.target.value),
                          available_slots: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-1">
                      {formData.fulfillment_type === "Invite Link"
                        ? "Activation Link"
                        : "Log Email / ID"}
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-white border border-indigo-50 p-4 rounded-xl font-bold"
                      value={formData.master_email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          master_email: e.target.value,
                        })
                      }
                      placeholder={
                        formData.fulfillment_type === "Invite Link"
                          ? "https://..."
                          : "account@email.com"
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-1">
                      {formData.fulfillment_type === "OTP / Instruction"
                        ? "Setup Note"
                        : "Log Password"}
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-white border border-indigo-50 p-4 rounded-xl font-bold"
                      value={formData.master_password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          master_password: e.target.value,
                        })
                      }
                      placeholder={
                        formData.fulfillment_type === "OTP / Instruction"
                          ? "Instructions for customer..."
                          : "••••••••"
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block">
                    Quick Icon Select
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {PRESET_ICONS.map((icon) => (
                      <button
                        key={icon.url}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, icon_url: icon.url })
                        }
                        className={`p-1 rounded-2xl border-2 transition-all ${formData.icon_url === icon.url ? "border-indigo-600 scale-110 shadow-lg" : "border-transparent opacity-50"}`}
                      >
                        <img
                          src={icon.url}
                          className="h-12 w-12 rounded-xl object-cover"
                          alt={icon.name}
                        />
                      </button>
                    ))}
                    <input
                      type="text"
                      placeholder="Custom URL..."
                      className="grow bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-xs"
                      value={formData.icon_url}
                      onChange={(e) =>
                        setFormData({ ...formData, icon_url: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Description / Internal Notes
                  </label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold h-24"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Tell users about this log..."
                  ></textarea>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="grow bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    ) : null}
                    {editingId ? "Update Log" : "Launch New Log"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="px-8 bg-slate-100 text-slate-400 font-black uppercase tracking-widest rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-6">Log Service</th>
                    <th className="px-8 py-6">Type</th>
                    <th className="px-8 py-6">Credentials</th>
                    <th className="px-8 py-6 text-right">Slots</th>
                    <th className="px-8 py-6 text-right">Price</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((acc: any) => (
                    <tr
                      key={acc.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={acc.icon_url}
                            className="h-10 w-10 rounded-xl object-cover shadow-sm"
                            alt=""
                          />
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 text-sm">
                              {acc.service_name}
                            </span>
                            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">
                              {acc.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                          {acc.fulfillment_type || "Password"}
                        </span>
                      </td>
                      <td className="px-8 py-6 max-w-50">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700 truncate">
                            {acc.master_email}
                          </span>
                          <span className="text-[9px] text-slate-300 font-mono tracking-widest mt-0.5">
                            ••••••••
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-xs text-indigo-600">
                        {acc.available_slots} / {acc.total_slots}
                      </td>
                      <td className="px-8 py-6 text-right font-black text-slate-900">
                        ₦{acc.price.toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(acc)}
                            className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 hover:bg-indigo-600 hover:text-white transition-all"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(acc.id)}
                            className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-8 py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs"
                      >
                        No logs found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="relative w-full md:w-96">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Find users..."
              className="w-full bg-white border border-slate-200 p-3 pl-10 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900">
                Member Directory
              </h2>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {allUsers.length} Users Total
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-6">User Profile</th>
                    <th className="px-8 py-6 text-right">Balance</th>
                    <th className="px-8 py-6 text-right">Fund Wallet</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((u: any) => (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50 transition-colors ${u.is_banned ? "opacity-50" : ""}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            className="h-9 w-9 rounded-full border border-slate-100"
                            alt=""
                          />
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 text-sm">
                              @{u.username}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-37.5">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-slate-900">
                        ₦{Number(u.balance).toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            placeholder="Add Amount"
                            className="w-24 bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={fundAmount[u.id] || ""}
                            onChange={(e) =>
                              setFundAmount({
                                ...fundAmount,
                                [u.id]: e.target.value,
                              })
                            }
                          />
                          <button
                            onClick={() => handleFundUser(u.id, u.username)}
                            className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
                          >
                            Credit
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() =>
                            handleToggleBan(u.id, u.is_banned, u.username)
                          }
                          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            u.is_banned
                              ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                        >
                          {u.is_banned ? "Restore Access" : "Restrict Access"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "stats" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute -bottom-4 -right-4 text-slate-50 opacity-10 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-naira-sign text-[8rem]"></i>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 relative">
                Platform Escrow
              </p>
              <h3 className="text-5xl font-black text-slate-900 relative tracking-tighter">
                ₦
                {allUsers
                  .reduce((a, b) => a + (Number(b.balance) || 0), 0)
                  .toLocaleString()}
              </h3>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm group relative">
              <div className="absolute -bottom-4 -right-4 text-slate-50 opacity-10 group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-users text-[8rem]"></i>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 relative">
                Registered Savers
              </p>
              <h3 className="text-5xl font-black text-slate-900 relative tracking-tighter">
                {allUsers.length}
              </h3>
            </div>
            <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <i className="fa-solid fa-bolt text-[8rem] rotate-12"></i>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 mb-2 relative">
                Active Logs
              </p>
              <h3 className="text-5xl font-black relative tracking-tighter">
                {accounts.length}
              </h3>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 text-center">
            <h4 className="text-xl font-black text-white mb-2">
              Automated Inventory System
            </h4>
            <p className="text-slate-500 font-medium mb-8">
              All slots are automatically managed. When a user buys, inventory
              deducts in real-time.
            </p>
            <div className="flex justify-center gap-12">
              <div className="flex flex-col items-center">
                <span className="text-emerald-400 text-2xl font-black">
                  {accounts.reduce(
                    (a, b) => a + (Number(b.available_slots) || 0),
                    0,
                  )}
                </span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Slots Available
                </span>
              </div>
              <div className="h-10 w-px bg-slate-800"></div>
              <div className="flex flex-col items-center">
                <span className="text-indigo-400 text-2xl font-black">
                  {accounts.reduce(
                    (a, b) => a + (Number(b.total_slots) || 0),
                    0,
                  )}
                </span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Total Capacity
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden animate-in fade-in duration-300 shadow-sm">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-900">
              Global Financial Log
            </h2>
            <button
              onClick={() => fetchData(true)}
              className="text-xs font-black text-indigo-600 uppercase tracking-widest"
            >
              <i className="fa-solid fa-rotate mr-2"></i> Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-8 py-6">Transaction Type</th>
                  <th className="px-8 py-6 text-right">Value</th>
                  <th className="px-8 py-6">Record Details</th>
                  <th className="px-8 py-6 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((tx: any) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          tx.type === "Deposit"
                            ? "bg-emerald-50 text-emerald-600"
                            : tx.type === "Purchase"
                              ? "bg-indigo-50 text-indigo-600"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td
                      className={`px-8 py-6 text-right font-black text-sm ${tx.amount < 0 ? "text-red-500" : "text-emerald-500"}`}
                    >
                      {tx.amount > 0 ? "+" : ""}₦{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-xs text-slate-500 font-medium">
                      <div className="flex flex-col">
                        <span className="text-slate-900 font-bold">
                          {tx.description}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          UID: ...{tx.user_id.slice(-8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right text-[10px] font-bold text-slate-400 uppercase">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-8 py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs"
                    >
                      No transaction records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
