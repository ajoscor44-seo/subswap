
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

const INITIAL_FORM: Partial<MasterAccount> = {
  service_name: '',
  master_email: '',
  master_password: '',
  total_slots: 5,
  available_slots: 5,
  price: 0,
  description: '',
  icon_url: 'https://ui-avatars.com/api/?name=S&background=6366f1&color=fff',
  category: 'Streaming'
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  if (!user.isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="h-20 w-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-xl shadow-red-50">
          <i className="fa-solid fa-lock"></i>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Unauthorized Access</h2>
        <p className="text-slate-500 max-w-sm">This dashboard is restricted to system administrators only.</p>
        <button onClick={() => window.location.hash = '#/dashboard'} className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Return Home</button>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'stats' | 'inventory' | 'users' | 'transactions'>('stats');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<MasterAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState<Partial<MasterAccount>>(INITIAL_FORM);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchAccounts = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('master_accounts').select('*').order('created_at', { ascending: false });
    if (data) setAccounts(data);
    setIsLoading(false);
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (data) setTransactions(data);
    setIsLoading(false);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setAllUsers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'inventory' || activeTab === 'stats') fetchAccounts();
    if (activeTab === 'transactions') fetchTransactions();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const handleEdit = (acc: MasterAccount) => {
    setFormData(acc);
    setEditingId(acc.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('master_accounts').update(formData).eq('id', editingId);
        if (error) throw error;
        showFeedback('Inventory item updated successfully.');
      } else {
        const { error } = await supabase.from('master_accounts').insert([formData]);
        if (error) throw error;
        showFeedback('New inventory entry deployed.');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(INITIAL_FORM);
      fetchAccounts();
    } catch (err: any) {
      showFeedback(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!window.confirm('Purge this account? All associated slots will be affected.')) return;
    try {
      const { error } = await supabase.from('master_accounts').delete().eq('id', id);
      if (error) throw error;
      showFeedback('Account purged.');
      fetchAccounts();
    } catch (err: any) {
      showFeedback(err.message, 'error');
    }
  };

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (activeTab === 'inventory') return accounts.filter(a => a.service_name.toLowerCase().includes(q));
    if (activeTab === 'users') return allUsers.filter(u => u.username?.toLowerCase().includes(q));
    return transactions;
  }, [searchQuery, accounts, allUsers, transactions, activeTab]);

  return (
    <div className="container mx-auto px-4 py-12 space-y-10">
      {feedback && (
        <div className={`fixed top-24 right-6 z-[200] px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-4 border ${
          feedback.type === 'success' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-red-500 border-red-400 text-white'
        }`}>
          <p className="font-black text-[10px] uppercase tracking-widest">{feedback.message}</p>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Command Center</h1>
          <p className="text-slate-500 font-medium">Platform control and inventory management.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
          {(['stats', 'inventory', 'users', 'transactions'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'inventory' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900">Market Inventory</h2>
            <button
              onClick={() => { setShowForm(!showForm); if(!showForm) {setEditingId(null); setFormData(INITIAL_FORM);} }}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100"
            >
              {showForm ? 'Cancel' : 'Add New Account'}
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-2xl animate-in zoom-in-95">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Service Name</label>
                  <input type="text" required className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold" value={formData.service_name} onChange={e => setFormData({...formData, service_name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Monthly Price (₦)</label>
                  <input type="number" required className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Master Email</label>
                  <input type="email" required className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold" value={formData.master_email} onChange={e => setFormData({...formData, master_email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Master Password</label>
                  <input type="text" required className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold" value={formData.master_password} onChange={e => setFormData({...formData, master_password: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">
                    {isLoading ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : null}
                    {editingId ? 'Update Inventory Item' : 'Deploy To Marketplace'}
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
                    <th className="px-8 py-6">Service</th>
                    <th className="px-8 py-6 text-right">Slots</th>
                    <th className="px-8 py-6 text-right">Price</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={acc.icon_url} className="h-10 w-10 rounded-xl object-cover" alt="" />
                          <div>
                            <div className="font-black text-slate-900">{acc.service_name}</div>
                            <div className="text-[10px] font-mono text-slate-400">{acc.master_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-xs">
                        <span className={acc.available_slots > 0 ? 'text-emerald-500' : 'text-red-500'}>
                          {acc.available_slots} / {acc.total_slots} Free
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-slate-900">₦{acc.price.toLocaleString()}</td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(acc)} className="h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button onClick={() => handleDeleteAccount(acc.id)} className="h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all">
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-500">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Projected Revenue</p>
            <h3 className="text-4xl font-black text-slate-900">₦{accounts.reduce((a, b) => a + (b.total_slots * b.price), 0).toLocaleString()}</h3>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Active Profiles</p>
            <h3 className="text-4xl font-black text-slate-900">{accounts.reduce((a, b) => a + (b.total_slots - b.available_slots), 0)}</h3>
          </div>
          <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-200">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">Verification Rate</p>
            <h3 className="text-4xl font-black">99.9%</h3>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden animate-in fade-in duration-500">
          <div className="p-8 border-b border-slate-100">
             <h2 className="text-xl font-black text-slate-900">Member Directory</h2>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-6">User</th>
                    <th className="px-8 py-6">Role</th>
                    <th className="px-8 py-6 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <img src={u.avatar} className="h-8 w-8 rounded-full" alt="" />
                           <span className="font-black text-slate-900">@{u.username}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                           {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-slate-900">₦{Number(u.balance).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden animate-in fade-in duration-500">
          <div className="p-8 border-b border-slate-100">
             <h2 className="text-xl font-black text-slate-900">Platform Ledger</h2>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-6">Type</th>
                    <th className="px-8 py-6">Amount</th>
                    <th className="px-8 py-6">User Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6">
                        <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                          tx.type === 'Deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                           {tx.type}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-black text-slate-900 text-sm">₦{Math.abs(tx.amount).toLocaleString()}</td>
                      <td className="px-8 py-6 font-mono text-[10px] text-slate-400">...{tx.user_id.slice(-12)}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
