
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { MasterAccount, User, Transaction, ProductCategory } from '../types';

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
  category: ProductCategory.STREAMING
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'inventory' | 'users' | 'transactions'>('stats');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<MasterAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fundAmount, setFundAmount] = useState<{[key: string]: string}>({});
  
  const [formData, setFormData] = useState<Partial<MasterAccount>>(INITIAL_FORM);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'inventory' || activeTab === 'stats') {
        const { data } = await supabase.from('master_accounts').select('*').order('created_at', { ascending: false });
        if (data) setAccounts(data);
      }
      if (activeTab === 'transactions') {
        const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
        if (data) setTransactions(data);
      }
      if (activeTab === 'users') {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (data) setAllUsers(data);
      }
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

    if (!window.confirm(`Add ₦${amount.toLocaleString()} to @${username}'s wallet?`)) return;

    setIsLoading(true);
    try {
      // 1. Update Profile Balance
      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', targetId).single();
      const newBalance = (profile?.balance || 0) + amount;
      
      const { error: updateError } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', targetId);
      if (updateError) throw updateError;

      // 2. Create Transaction Log
      await supabase.from('transactions').insert({
        user_id: targetId,
        amount: amount,
        type: 'Deposit',
        description: `Admin manual funding: ₦${amount.toLocaleString()}`
      });

      showFeedback(`₦${amount.toLocaleString()} credited to @${username}`);
      setFundAmount({ ...fundAmount, [targetId]: '' });
      fetchData();
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBan = async (targetId: string, currentStatus: boolean, username: string) => {
    const action = currentStatus ? "Unban" : "Ban";
    if (!window.confirm(`${action} user @${username}?`)) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({ is_banned: !currentStatus }).eq('id', targetId);
      if (error) throw error;
      showFeedback(`User ${username} ${action}ned successfully.`);
      fetchData();
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
      if (editingId) {
        await supabase.from('master_accounts').update(formData).eq('id', editingId);
      } else {
        await supabase.from('master_accounts').insert([formData]);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(INITIAL_FORM);
      fetchData();
      showFeedback("Inventory updated.");
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (activeTab === 'inventory') return accounts.filter(a => a.service_name.toLowerCase().includes(q));
    if (activeTab === 'users') return allUsers.filter(u => u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
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
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Console</h1>
          <p className="text-slate-500 font-medium">Control inventory and user accounts.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
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
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900">Inventory</h2>
            <button
              onClick={() => { setShowForm(!showForm); if(!showForm) {setEditingId(null); setFormData(INITIAL_FORM);} }}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100"
            >
              {showForm ? 'Cancel' : 'Add Account'}
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
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Price (₦)</label>
                  <input type="number" required className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                  <input type="email" required className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold" value={formData.master_email} onChange={e => setFormData({...formData, master_email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                  <input type="text" required className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold" value={formData.master_password} onChange={e => setFormData({...formData, master_password: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">
                    {editingId ? 'Update Item' : 'Create Item'}
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6 font-black text-slate-900">{acc.service_name}</td>
                      <td className="px-8 py-6 text-right font-black text-xs text-indigo-600">{acc.available_slots} / {acc.total_slots}</td>
                      <td className="px-8 py-6 text-right font-black text-slate-900">₦{acc.price.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden animate-in fade-in duration-300 shadow-sm">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
             <h2 className="text-xl font-black text-slate-900">Member Directory</h2>
             <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{allUsers.length} Users</span>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-6">User</th>
                    <th className="px-8 py-6 text-right">Balance</th>
                    <th className="px-8 py-6 text-right">Fund Account</th>
                    <th className="px-8 py-6 text-right">Access Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((u: any) => (
                    <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${u.is_banned ? 'opacity-50' : ''}`}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <img src={u.avatar} className="h-8 w-8 rounded-full" alt="" />
                           <div className="flex flex-col">
                             <span className="font-black text-slate-900">@{u.username}</span>
                             <span className="text-[9px] text-slate-400 truncate max-w-[150px]">{u.email}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-slate-900">₦{Number(u.balance).toLocaleString()}</td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <input 
                             type="number" 
                             placeholder="Amount" 
                             className="w-20 bg-slate-100 border-none p-2 rounded-lg text-xs font-bold"
                             value={fundAmount[u.id] || ''}
                             onChange={e => setFundAmount({...fundAmount, [u.id]: e.target.value})}
                           />
                           <button 
                             onClick={() => handleFundUser(u.id, u.username)}
                             className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-indigo-700"
                           >
                             Fund
                           </button>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleToggleBan(u.id, u.is_banned, u.username)}
                          className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                            u.is_banned ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          {u.is_banned ? 'Unban User' : 'Ban User'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Platform Balance</p>
            <h3 className="text-4xl font-black text-slate-900">₦{allUsers.reduce((a, b) => a + (Number(b.balance) || 0), 0).toLocaleString()}</h3>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Users</p>
            <h3 className="text-4xl font-black text-slate-900">{allUsers.length}</h3>
          </div>
          <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-xl shadow-indigo-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">Operational Health</p>
            <h3 className="text-4xl font-black">100%</h3>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden animate-in fade-in duration-300 shadow-sm">
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-6">Type</th>
                    <th className="px-8 py-6">Amount</th>
                    <th className="px-8 py-6">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td className="px-8 py-6">
                        <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${tx.type === 'Deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                           {tx.type}
                        </span>
                      </td>
                      <td className={`px-8 py-6 font-black text-sm ${tx.amount < 0 ? 'text-red-500' : 'text-emerald-500'}`}>₦{Math.abs(tx.amount).toLocaleString()}</td>
                      <td className="px-8 py-6 text-xs text-slate-500">{tx.description}</td>
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
