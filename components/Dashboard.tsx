import React, { useState, useEffect } from 'react';
import { User, Transaction } from '../types';
import { Marketplace } from './Marketplace';
import TransactionHistory from './TransactionHistory';
import { supabase } from '../lib/supabase';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  initialTab?: 'overview' | 'stacks' | 'explore' | 'wallet' | 'history' | 'settings';
  onPurchaseSuccess?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, initialTab = 'overview', onPurchaseSuccess }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [fundAmount, setFundAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');

  const fwConfig = {
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-1ee9d1185c08b3332a2192bcf4702b37-X',
    tx_ref: Date.now().toString(),
    amount: fundAmount,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: user.email,
      phone_number: '',
      name: user.name || user.username,
    },
    customizations: {
      title: 'SubSwap Wallet Top-up',
      description: `Payment for ₦${fundAmount.toLocaleString()} wallet credit`,
      logo: 'https://ui-avatars.com/api/?name=SubSwap&background=6366f1&color=fff',
    },
  };

  const handleFlutterPayment = useFlutterwave(fwConfig);

  // Sync state with prop if it changes externally
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: subs } = await supabase
        .from('user_subscriptions')
        .select('*, master_accounts(*)')
        .eq('user_id', user.id);
      if (subs) setSubscriptions(subs);

      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      if (txs) setRecentTransactions(txs);

    } catch (err: any) {
      console.error("Dashboard sync error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id, activeTab]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showStatus("Copied to clipboard!");
  };

  const handleFlutterwavePayment = (amount: number) => {
    setFundAmount(amount);
    
    handleFlutterPayment({
      callback: async (response) => {
        if (response.status === "successful") {
          try {
            const { error: txError } = await supabase.from('transactions').insert({
              user_id: user.id,
              amount: amount,
              type: 'Deposit',
              description: `Flutterwave Top-up: ₦${amount.toLocaleString()}`
            });
            if (txError) throw txError;

            const { error: balError } = await supabase.from('profiles').update({
              balance: user.balance + amount
            }).eq('id', user.id);
            if (balError) throw balError;

            showStatus(`₦${amount.toLocaleString()} added successfully!`, 'success');
            fetchData();
            if (onPurchaseSuccess) onPurchaseSuccess();
          } catch (err: any) {
            showStatus(err.message, 'error');
          }
        } else {
          showStatus("Payment was not successful", "error");
        }
        closePaymentModal();
      },
      onClose: () => {
        console.log("Payment modal closed");
      },
    });
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'fa-house-chimney' },
    { id: 'stacks', label: 'My Stacks', icon: 'fa-layer-group' },
    { id: 'explore', label: 'Marketplace', icon: 'fa-compass' },
    { id: 'wallet', label: 'Wallet', icon: 'fa-wallet' },
    { id: 'history', label: 'History', icon: 'fa-receipt' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50">
      {statusMsg && (
        <div className={`fixed top-24 right-6 z-[300] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-4 border ${
          statusMsg.type === 'success' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-red-500 border-red-400 text-white'
        }`}>
           <i className={`fa-solid ${statusMsg.type === 'success' ? 'fa-circle-check text-emerald-400' : 'fa-triangle-exclamation'}`}></i>
           <p className="font-black text-[10px] uppercase tracking-widest">{statusMsg.text}</p>
        </div>
      )}

      <div className="bg-indigo-600 h-32 md:h-40 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 -mt-16 md:-mt-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100 text-center relative overflow-hidden">
               <div className="flex lg:flex-col items-center gap-4 lg:gap-0">
                  <div className="relative inline-block lg:mb-4 flex-shrink-0">
                      <img src={user.avatar} className="h-16 w-16 md:h-24 md:w-24 rounded-[1.5rem] md:rounded-[2rem] border-4 border-white shadow-xl object-cover" alt={user.username} />
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 md:h-8 md:w-8 bg-emerald-500 rounded-lg md:rounded-xl border-2 md:border-4 border-white flex items-center justify-center text-white text-[8px] md:text-[10px]">
                        <i className="fa-solid fa-check"></i>
                      </div>
                  </div>
                  <div className="text-left lg:text-center min-w-0">
                    <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight truncate">@{user.username}</h2>
                    <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-1">Naira Verified</p>
                  </div>
               </div>
               
               <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-slate-50">
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 md:gap-1">
                    {navItems.map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`text-left px-3 md:px-5 py-3 rounded-xl flex items-center gap-2 md:gap-3 transition-all ${
                          activeTab === item.id 
                            ? 'bg-indigo-50 text-indigo-600 font-black' 
                            : 'text-slate-500 font-bold hover:bg-slate-50'
                        }`}
                      >
                        <i className={`fa-solid ${item.icon} w-4 md:w-5 text-xs md:text-base`}></i>
                        <span className="text-[10px] md:text-sm truncate">{item.label}</span>
                      </button>
                    ))}
                    <button 
                      onClick={() => setActiveTab('settings')}
                      className={`text-left px-3 md:px-5 py-3 rounded-xl flex items-center gap-2 md:gap-3 transition-all ${
                        activeTab === 'settings' 
                          ? 'bg-indigo-50 text-indigo-600 font-black' 
                          : 'text-slate-500 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <i className="fa-solid fa-gear w-4 md:w-5 text-xs md:text-base"></i>
                      <span className="text-[10px] md:text-sm truncate">Settings</span>
                    </button>
                  </div>
               </div>

               <button 
                onClick={onLogout}
                className="hidden lg:block mt-10 w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
               >
                 Sign Out
               </button>
            </div>
          </div>

          <div className="lg:col-span-9 space-y-6 md:space-y-8">
            
            {activeTab === 'overview' && (
              <div className="animate-in fade-in duration-500 space-y-6 md:space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="md:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <i className="fa-solid fa-naira-sign text-[8rem] rotate-12"></i>
                      </div>
                      <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">My Balance</p>
                        <h4 className="text-5xl md:text-6xl font-black tracking-tighter mb-10">₦{user.balance.toLocaleString()}</h4>
                        
                        <div className="flex flex-wrap gap-3">
                           <button 
                             onClick={() => setActiveTab('wallet')}
                             className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-indigo-900/40"
                           >
                             <i className="fa-solid fa-plus mr-2"></i> Fund Wallet
                           </button>
                           <button 
                             onClick={() => setActiveTab('explore')}
                             className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                           >
                             Find Slots
                           </button>
                        </div>
                      </div>
                   </div>

                   <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl mb-4">
                           <i className="fa-solid fa-piggy-bank"></i>
                        </div>
                        <h5 className="font-black text-slate-900 text-lg mb-1">Total Saved</h5>
                        <p className="text-slate-500 text-sm font-medium">You've saved ₦{user.totalSaved.toLocaleString()} using SubSwap.</p>
                      </div>
                      <div className="pt-6 border-t border-slate-50">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Rate</p>
                         <p className="text-sm font-black text-slate-900">₦1.00 = 1 Credit</p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent Activity Mini Widget */}
                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-black text-slate-900 text-lg">Recent Activity</h4>
                      <button onClick={() => setActiveTab('history')} className="text-[10px] font-black uppercase tracking-widest text-indigo-600">View All</button>
                    </div>
                    <div className="space-y-4">
                      {recentTransactions.length > 0 ? recentTransactions.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs ${tx.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>
                              <i className={`fa-solid ${tx.amount > 0 ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-900 line-clamp-1">{tx.description}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{new Date(tx.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-black ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-900'}`}>
                            {tx.amount > 0 ? '+' : ''}₦{Math.abs(tx.amount).toLocaleString()}
                          </span>
                        </div>
                      )) : (
                        <p className="text-[10px] text-slate-400 font-bold uppercase py-4 text-center">No recent activity</p>
                      )}
                    </div>
                  </div>

                  {/* Active Slots Snapshot */}
                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-black text-slate-900 text-lg">Active Stacks</h4>
                      <button onClick={() => setActiveTab('stacks')} className="text-[10px] font-black uppercase tracking-widest text-indigo-600">My Stacks</button>
                    </div>
                    <div className="flex -space-x-3 overflow-hidden mb-6">
                      {subscriptions.map((sub, i) => (
                        <img key={i} src={sub.master_accounts?.icon_url} className="inline-block h-10 w-10 rounded-full ring-4 ring-white object-cover" alt="" />
                      ))}
                      {subscriptions.length === 0 && <p className="text-[10px] text-slate-400 font-bold uppercase py-4">No active stacks yet</p>}
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">You have {subscriptions.length} active premium subscriptions.</p>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Quick Join</h3>
                        <p className="text-slate-500 text-sm font-medium">Join a new group in seconds.</p>
                      </div>
                   </div>
                   <Marketplace user={user} onAuthRequired={() => {}} onPurchaseSuccess={onPurchaseSuccess} />
                </div>
              </div>
            )}

            {activeTab === 'stacks' && (
              <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-8 md:mb-10">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">My Active Access</h3>
                  <button onClick={() => setActiveTab('explore')} className="text-xs font-black text-indigo-600">Buy New +</button>
                </div>
                {isLoading ? (
                  <div className="text-center py-20">
                    <i className="fa-solid fa-spinner fa-spin text-indigo-600 text-2xl"></i>
                  </div>
                ) : subscriptions.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 md:gap-6">
                    {subscriptions.map(sub => (
                      <div key={sub.id} className="p-4 md:p-6 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-4 md:mb-6">
                          <img src={sub.master_accounts?.icon_url} className="h-10 w-10 md:h-14 md:w-14 rounded-lg md:rounded-2xl bg-white shadow-sm object-cover" alt="" />
                          <div>
                            <h4 className="font-black text-slate-900 text-[10px] md:text-base truncate max-w-[100px] md:max-w-none">{sub.master_accounts?.service_name}</h4>
                            <p className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-emerald-500">Active</p>
                          </div>
                        </div>
                        <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                           <div className="flex justify-between items-center text-[8px] md:text-xs">
                              <span className="text-slate-400 font-bold uppercase tracking-widest text-[7px] md:text-[9px]">ID</span>
                              <div className="flex items-center gap-1 md:gap-2 max-w-[60%]">
                                <span className="text-slate-700 font-mono font-bold truncate">{sub.master_accounts?.master_email}</span>
                              </div>
                           </div>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(sub.master_accounts?.master_password)}
                          className="w-full bg-slate-900 text-white py-2.5 md:py-3.5 rounded-lg md:rounded-xl font-black text-[8px] md:text-[10px] uppercase tracking-widest group-hover:bg-indigo-600 transition-all"
                        >
                           Password
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 md:py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium text-sm">No active subscriptions yet.</p>
                    <button onClick={() => setActiveTab('explore')} className="mt-4 bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Marketplace</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'explore' && (
              <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 animate-in fade-in duration-500">
                <Marketplace user={user} onAuthRequired={() => {}} onPurchaseSuccess={onPurchaseSuccess} />
              </div>
            )}

            {activeTab === 'wallet' && (
              <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-sm border border-slate-100 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-6 md:mb-12">
                   <div className="flex items-center gap-3 md:gap-6">
                      <div className="h-10 w-10 md:h-16 md:w-16 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-[1.5rem] flex items-center justify-center text-xl md:text-3xl">
                        <i className="fa-solid fa-naira-sign"></i>
                      </div>
                      <div>
                        <h3 className="text-lg md:text-2xl font-black text-slate-900">Wallet</h3>
                        <p className="text-slate-500 text-[10px] md:text-sm font-medium">Add Naira to your wallet.</p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                   <div className="bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white flex flex-col justify-between min-h-[140px] md:min-h-0">
                      <div>
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1 md:mb-2">Balance</p>
                        <h4 className="text-3xl md:text-5xl font-black tracking-tighter">₦{user.balance.toLocaleString()}</h4>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-3">
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Custom Amount</p>
                        <div className="flex gap-2">
                          <div className="relative flex-grow">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₦</span>
                            <input 
                              type="number" 
                              value={customAmount}
                              onChange={(e) => setCustomAmount(e.target.value)}
                              placeholder="Enter amount"
                              className="w-full pl-8 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-900 focus:outline-none focus:border-indigo-600 transition-all"
                            />
                          </div>
                          <button 
                            onClick={() => {
                              const amt = parseInt(customAmount);
                              if (amt > 0) handleFlutterwavePayment(amt);
                              else showStatus("Please enter a valid amount", "error");
                            }}
                            className="px-8 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                          >
                            Fund
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Select</p>
                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                          {[2000, 5000, 10000, 20000].map(amt => (
                            <button 
                              key={amt}
                              onClick={() => handleFlutterwavePayment(amt)}
                              className="p-3 md:p-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl font-black text-xs md:text-base text-slate-900 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
                            >
                              ₦{amt.toLocaleString()}
                            </button>
                          ))}
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in duration-500 overflow-hidden">
                <TransactionHistory user={user} isDashboardView={true} />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-sm border border-slate-100 animate-in fade-in duration-500">
                <div className="mb-8 md:mb-12">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Account Settings</h3>
                  <p className="text-slate-500 text-sm font-medium">Manage your profile and preferences.</p>
                </div>

                <div className="max-w-xl space-y-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profile Information</p>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">Display Name</label>
                        <input 
                          type="text" 
                          defaultValue={user.name}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600 transition-all"
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">Username</label>
                        <input 
                          type="text" 
                          defaultValue={user.username}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600 transition-all"
                          placeholder="username"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security</p>
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">Email Address</h4>
                        <p className="text-slate-500 text-xs font-medium">{user.email}</p>
                      </div>
                      <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg font-black text-[8px] uppercase tracking-widest">Verified</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50 flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => showStatus("Profile updated successfully!")}
                      className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={onLogout}
                      className="px-8 py-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
