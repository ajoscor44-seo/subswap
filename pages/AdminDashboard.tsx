import React, { useState, useEffect, useCallback } from "react";
// import { MasterAccount, Transaction, ProductCategory, AdminTab, AdminDashboardProps, Feedback, INITIAL_FORM } from "@/constants/types";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminInventory } from "@/components/admin/AdminInventory";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminTransactions } from "@/components/admin/AdminTransactions";
import { FeedbackToast } from "@/components/admin/FeedbackToast";
import {
  AdminDashboardProps,
  AdminTab,
  Feedback,
  MasterAccount,
  Transaction,
} from "@/constants/types";
import { supabase } from "@/lib/supabase";

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onRefreshUser,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>("stats");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Data
  const [accounts, setAccounts] = useState<MasterAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // ─── Feedback ──────────────────────────────────────────────────────────────

  const showFeedback = (
    message: string,
    type: Feedback["type"] = "success",
  ) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // ─── Data fetching ─────────────────────────────────────────────────────────

  const fetchData = useCallback(
    async (forceAll = false) => {
      setIsLoading(true);
      try {
        const needsAccounts =
          forceAll || activeTab === "inventory" || activeTab === "stats";
        const needsUsers =
          forceAll || activeTab === "users" || activeTab === "stats";
        const needsTransactions =
          forceAll || activeTab === "transactions" || activeTab === "stats";

        await Promise.all([
          needsAccounts
            ? supabase
                .from("master_accounts")
                .select("*")
                .order("created_at", { ascending: false })
                .then(({ data }) => data && setAccounts(data))
            : Promise.resolve(),

          needsUsers
            ? supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false })
                .then(({ data }) => data && setAllUsers(data))
            : Promise.resolve(),

          needsTransactions
            ? supabase
                .from("transactions")
                .select("*")
                .order("created_at", { ascending: false })
                .then(({ data }) => data && setTransactions(data))
            : Promise.resolve(),
        ]);
      } catch (err: any) {
        showFeedback(err.message, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Inventory handlers ────────────────────────────────────────────────────

  const sanitise = (data: Partial<MasterAccount>) => {
    const { _domain, _category, ...clean } = data as any;
    return clean;
  };

  const handleAddAccount = async (data: Partial<MasterAccount>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("master_accounts")
        .insert([{ ...sanitise(data), available_slots: data.total_slots }]);
      if (error) throw error;
      showFeedback("Log launched to marketplace.");
      fetchData(true);
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAccount = async (
    id: string,
    data: Partial<MasterAccount>,
  ) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("master_accounts")
        .update(sanitise(data))
        .eq("id", id);
      if (error) throw error;
      showFeedback("Log updated successfully.");
      fetchData(true);
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (
      !window.confirm(
        "Delete this log? It will be removed from the marketplace.",
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

  // ─── User handlers ─────────────────────────────────────────────────────────

  const handleFundUser = async (
    targetId: string,
    username: string,
    amount: number,
  ) => {
    if (!window.confirm(`Credit ₦${amount.toLocaleString()} to @${username}?`))
      return;

    setIsLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", targetId)
        .single();

      const newBalance = (Number(profile?.balance) || 0) + amount;

      const { error } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", targetId);
      if (error) throw error;

      await supabase.from("transactions").insert({
        user_id: targetId,
        amount,
        type: "Deposit",
        description: `Admin funding: ₦${amount.toLocaleString()}`,
      });

      showFeedback(`₦${amount.toLocaleString()} credited to @${username}`);
      fetchData(true);

      if (onRefreshUser && targetId === user.id) onRefreshUser();
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
    const action = currentStatus ? "Restore" : "Restrict";
    if (!window.confirm(`${action} access for @${username}?`)) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_banned: !currentStatus })
        .eq("id", targetId);
      if (error) throw error;
      showFeedback(
        `@${username} access ${currentStatus ? "restored" : "restricted"}.`,
      );
      fetchData(true);
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVerify = async (
    targetId: string,
    currentStatus: boolean,
    username: string,
  ) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_verified: !currentStatus })
        .eq("id", targetId);
      if (error) throw error;
      showFeedback(
        `@${username} ${currentStatus ? "unverified" : "verified"} successfully.`,
      );
      fetchData(true);
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <FeedbackToast feedback={feedback} />

      <AdminHeader
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isLoading={isLoading}
        onRefresh={() => fetchData(true)}
      />

      {activeTab === "stats" && (
        <AdminStats
          accounts={accounts}
          users={allUsers}
          transactions={transactions}
        />
      )}

      {activeTab === "inventory" && (
        <AdminInventory
          accounts={accounts}
          isLoading={isLoading}
          onRefresh={() => fetchData(true)}
          onAdd={handleAddAccount}
          onUpdate={handleUpdateAccount}
          onDelete={handleDeleteAccount}
        />
      )}

      {activeTab === "users" && (
        <AdminUsers
          users={allUsers}
          currentUserId={user.id}
          isLoading={isLoading}
          onFundUser={handleFundUser}
          onToggleBan={handleToggleBan}
          onToggleVerify={handleToggleVerify}
        />
      )}

      {activeTab === "transactions" && (
        <AdminTransactions
          transactions={transactions}
          onRefresh={() => fetchData(true)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
