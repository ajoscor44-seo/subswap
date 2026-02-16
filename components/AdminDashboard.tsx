
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { MasterAccount, User, Transaction } from '../types';

interface AdminDashboardProps {
  user: User;
}

interface Feedback {
  message: string;
  type: 'success' | 'error';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  // SECONDARY PROTECTION: Prevent unauthorized rendering
  if (!user.isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="h-24 w-24 bg-red-100 text-red-600 rounded-[2.5rem] flex items-center justify-center text-4xl mb-6 shadow-xl shadow-red-100">
          <i className="fa-solid fa-user-shield"></i>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Access Restricted</h2>
        <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
          This area is reserved for platform administrators only. If you believe this is an error, contact technical support.
        </p>
        <button 
          onClick={() => window.location.hash = '#/dashboard'}
          className="mt-8 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95"
        >
          Return to Safety
        </button>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'stats' | 'inventory' | 'users' | 'transactions'>('stats');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<MasterAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState<Partial<MasterAccount>>({
    service_name: '',
    master_email: '',
    master_password: '',
    total_slots: 5,
    available_slots: 5,
    price: 0,
    description: '',
    icon_url: 'https://ui-avatars.com/api/?name=S&background=6366f1&color=fff'
  });

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  const fetchAccounts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('master_accounts').select('*').order('created_at', { ascending: false });
    if (data) setAccounts(data);
    if (error) showFeedback(error.message, 'error');
    setIsLoading(false);
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setTransactions(data);
    if (error) showFeedback(error.message, 'error');
    setIsLoading(false);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setAllUsers(data);
    if (error) showFeedback(error.message, 'error');
    setIsLoading(false);
  };

  useEffect(() => {
    setSearchQuery(''); // Reset search when switching tabs
    if (activeTab === 'inventory' || activeTab === 'stats') fetchAccounts();
    if (activeTab === 'transactions') fetchTransactions();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.from('master_accounts').insert([formData]);
      if (error) throw error;
      showFeedback('Account added successfully to inventory!');
      setShowAddForm(false);
      setFormData({
        service_name: '',
        master_email: '',
        master_password: '',
        total_slots: 5,
        available_slots: 5,
        price: 0,
        description: '',
        icon_url: 'https://ui-avatars.com/api/?name=S&background=6366f1&color=fff'
      });
      fetchAccounts();
    } catch (err: any) {
      showFeedback(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!window.confirm('Are you sure? This will remove the account from the marketplace.')) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.from('master_accounts').delete().eq('id', id);
      if (error) throw error;
      showFeedback('Account purged from inventory.');
      fetchAccounts();
    } catch (err: any) {
      showFeedback(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('profiles').update({ is_verified: !currentStatus }).eq('id', userId);
      if (error) throw error;
      showFeedback(`User ${!currentStatus ? 'verified' : 'unverified'} successfully.`);
      fetchUsers();
    } catch (err: any) {
      showFeedback(err.message, 'error');
    }
  };

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (activeTab === 'inventory') {
      return accounts.filter(a => a.service_name.toLowerCase().includes(q) || a.master_email.toLowerCase().includes(q));
    }
    if (activeTab === 'users') {
      return allUsers.filter(u => u.username?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q));
    }
    if (activeTab === 'transactions') {
      return transactions.filter(t => t.description?.toLowerCase().includes(q) || t.type.toLowerCase().includes(q));
    }
    return [];
  }, [searchQuery, accounts, allUsers, transactions, activeTab]);

  return (
    <div className="container mx-auto px-4 py-12 space-y-10">
      {/* Global Feedback Notification */}
      {feedback && (
        <div className={`fixed top-24 right-4 z-[200] px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-4 duration-300 border ${
          feedback.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-red-500 border-red-400 text-white'
        }`}>
          <div className="flex items-center gap-3">
            <i className={`fa-solid ${feedback.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
            <p className="font-black text-xs uppercase tracking-widest">{feedback.message}</p>
            <button onClick={() => setFeedback(null)} className="ml-4 opacity-70 hover:opacity-100">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Command Center</h1>
          <p className="text-slate-500 font-medium">Platform management and inventory control.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {activeTab !== 'stats' && (
            <div className="relative">
               <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
               <input 
                 type="text" 
                 placeholder={`Search ${activeTab}...`}
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-50 outline-none w-full sm:w-64"
               />
            </div>
          )}
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
            {(['stats', 'inventory', 'users', 'transactions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <i className="fa-solid fa-naira-sign text-9xl -rotate-12"></i>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Total Est. Revenue</p>
            <h3 className="text-4xl font-black text-slate-900">₦{accounts.reduce((acc, curr) => acc + (curr.total_slots - curr.available_slots) * curr.price, 0).toLocaleString()}</h3>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <i className="fa-solid fa-users text-9xl -rotate-12"></i>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Active Slots</p>
            <h3 className="text-4xl font-black text-slate-900">{accounts.reduce((acc, curr) => acc + (curr.total_slots - curr.available_slots), 0)}</h3>
          </div>
          <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <i className="fa-solid fa-shield-heart text-9xl -rotate-12"></i>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-2">Inventory Health</p>
            <h3 className="text-4xl font-black">98.4%</h3>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900">Master Accounts</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              {showAddForm ? 'Cancel' : 'Add New Entry'}
            </button>
          </div>

          {showAddForm && (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-2xl animate-in fade-in slide-in-from-top-4">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Service Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Netflix Premium 4K"
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold"
                    value={formData.service_name}
                    onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price (₦)</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Master Email</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold"
                    value={formData.master_email}
                    onChange={(e) => setFormData({ ...formData, master_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Master Password</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold"
                    value={formData.master_password}
                    onChange={(e) => setFormData({ ...formData, master_password: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl"
                  >
                    {isLoading ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : 'Deploy Inventory Entry'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Service</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Credentials</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Slots</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Price</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr><td colSpan={5} className="text-center py-20"><i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-600"></i></td></tr>
                  ) : filteredData.length > 0 ? (
                    (filteredData as MasterAccount[]).map((acc) => (
                      <tr key={acc.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <img src={acc.icon_url} className="h-10 w-10 rounded-xl" alt="" />
                            <span className="font-black text-slate-900">{acc.service_name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-mono text-xs text-slate-500">
                          <div>{acc.master_email}</div>
                          <div className="text-slate-300">••••••••</div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                            acc.available_slots > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {acc.available_slots} / {acc.total_slots} Free
                          </span>
                        </td>
                        <td className="px-8 py-6 font-black text-slate-900">₦{acc.price.toLocaleString()}</td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"><i className="fa-solid fa-pen-to-square"></i></button>
                            <button onClick={() => handleDeleteAccount(acc.id)} className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"><i className="fa-solid fa-trash-can"></i></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-[10px]">No matches found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900">Community Directory</h2>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Users: {allUsers.length}</div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">User</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Balance</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Verified</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr><td colSpan={5} className="text-center py-20"><i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-600"></i></td></tr>
                  ) : filteredData.length > 0 ? (
                    (filteredData as any[]).map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=random`} className="h-10 w-10 rounded-full border border-slate-100" alt="" />
                            <div>
                               <div className="font-black text-slate-900">@{u.username}</div>
                               <div className="text-[10px] text-slate-400 font-medium">{u.email || u.id.slice(0, 16)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                              {u.role}
                           </span>
                        </td>
                        <td className="px-8 py-6 font-black text-slate-900 text-sm">₦{Number(u.balance).toLocaleString()}</td>
                        <td className="px-8 py-6">
                           <div className={`h-6 w-12 rounded-full p-1 cursor-pointer transition-colors ${u.is_verified ? 'bg-emerald-500' : 'bg-slate-200'}`} onClick={() => toggleUserVerification(u.id, u.is_verified)}>
                              <div className={`h-4 w-4 bg-white rounded-full transition-transform ${u.is_verified ? 'translate-x-6' : 'translate-x-0'}`}></div>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:text-indigo-800">Manage</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-[10px]">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900">Platform Ledger</h2>
            <button 
              onClick={fetchTransactions}
              className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm"
            >
              <i className={`fa-solid fa-rotate ${isLoading ? 'fa-spin' : ''}`}></i>
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">User ID</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr><td colSpan={5} className="text-center py-20"><i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-600"></i></td></tr>
                  ) : filteredData.length > 0 ? (
                    (filteredData as Transaction[]).map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6">
                          <span className="font-mono text-[10px] text-slate-400">...{tx.user_id.slice(-12)}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                            tx.type === 'Deposit' ? 'bg-emerald-50 text-emerald-600' :
                            tx.type === 'Purchase' ? 'bg-indigo-50 text-indigo-600' :
                            tx.type === 'Withdrawal' ? 'bg-red-50 text-red-600' :
                            'bg-slate-50 text-slate-600'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={`px-8 py-6 font-black text-sm ${tx.amount < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {tx.amount < 0 ? '-' : '+'}₦{Math.abs(tx.amount).toLocaleString()}
                        </td>
                        <td className="px-8 py-6 text-xs text-slate-500 font-medium">
                          {tx.description || 'System transaction'}
                        </td>
                        <td className="px-8 py-6 text-right text-[10px] font-black text-slate-300">
                          {new Date(tx.created_at).toLocaleDateString(undefined, {
                             month: 'short',
                             day: 'numeric',
                             year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-[10px]">No transaction history</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
