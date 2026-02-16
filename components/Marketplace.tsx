
import React, { useState, useEffect, useMemo } from 'react';
// Fixed: Removed non-existent Product type from imports
import { ProductCategory, User, MasterAccount } from '../types';
import { supabase } from '../lib/supabase';

export const Marketplace: React.FC<{ user: User | null; onAuthRequired: () => void }> = ({ user, onAuthRequired }) => {
  const [dbProducts, setDbProducts] = useState<MasterAccount[]>([]);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('master_accounts')
          .select(`
            *,
            owner:profiles!owner_id (
              username,
              is_verified,
              avatar,
              merchant_rating
            )
          `)
          .gt('available_slots', 0)
          .order('created_at', { ascending: false });

        if (data) setDbProducts(data as MasterAccount[]);
        if (error) throw error;
      } catch (err) {
        console.error("Error fetching marketplace:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleJoin = async (account: MasterAccount) => {
    if (!user) {
      onAuthRequired();
      return;
    }

    if (user.balance < account.price) {
      alert(`Insufficient balance! This plan costs ₦${account.price.toLocaleString()}. Please fund your wallet in the dashboard first.`);
      return;
    }

    const confirmJoin = window.confirm(`Join ${account.service_name} for ₦${account.price.toLocaleString()}?`);
    if (!confirmJoin) return;

    setIsProcessing(account.id);
    try {
      const { error } = await supabase.rpc('purchase_slot_v2', {
        p_buyer_id: user.id,
        p_account_id: account.id,
        p_profile_name: user.username || user.name,
        p_amount: account.price
      });

      if (error) throw error;

      alert("Success! You have joined the group. Access your credentials in 'My Stacks' on your dashboard.");
      window.location.reload();
    } catch (err: any) {
      console.error("Purchase failed:", err);
      alert(err.message || "Purchase failed. Please try again.");
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return dbProducts.filter(p => {
      const matchesFilter = filter === 'All' || p.category === filter;
      const matchesSearch = p.service_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery, dbProducts]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Marketplace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="relative w-full max-w-2xl mx-auto">
          <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text"
            placeholder="Search for Netflix, Spotify, Canva..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 p-5 pl-14 rounded-3xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="flex justify-center gap-2 p-1 overflow-x-auto no-scrollbar pb-2">
          {['All', ProductCategory.STREAMING, ProductCategory.SOFTWARE, ProductCategory.MUSIC, ProductCategory.EDUCATION].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${filter === f ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(account => (
            <div key={account.id} className="bg-white rounded-[2.5rem] border-2 border-slate-50 overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
              <div className="h-56 relative overflow-hidden">
                <img src={account.icon_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={account.service_name} />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100">
                  <p className="text-xl font-black text-slate-900 leading-none">₦{account.price.toLocaleString()}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Per Month</p>
                </div>
                {account.available_slots <= 2 && (
                   <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg font-black text-[8px] uppercase tracking-widest animate-pulse">
                      Only {account.available_slots} Left
                   </div>
                )}
              </div>
              
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex-grow space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">{account.service_name}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest">{account.category}</span>
                      <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest">Verified</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{account.description}</p>
                  </div>

                  {/* Merchant/Owner Section */}
                  <div className="flex items-center justify-between py-4 border-y border-slate-50">
                    {account.owner ? (
                      <div className="flex items-center gap-2">
                        <img src={account.owner.avatar} className="h-7 w-7 rounded-full border border-white shadow-sm" alt="" />
                        <span className="text-[10px] font-black text-slate-900">@{account.owner.username}</span>
                        {account.owner.is_verified && <i className="fa-solid fa-circle-check text-blue-500 text-[10px]"></i>}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black">SS</div>
                        <span className="text-[10px] font-black text-slate-900">Official SubSwap</span>
                        <i className="fa-solid fa-shield-check text-indigo-500 text-[10px]"></i>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 text-amber-400 text-[8px]">
                      <i className="fa-solid fa-star"></i>
                      <span className="font-black text-slate-900">{account.owner?.merchant_rating || '5.0'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                       <span className="text-slate-400">Slots Taken</span>
                       <span className="text-indigo-600">{account.total_slots - account.available_slots} / {account.total_slots}</span>
                    </div>
                    <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                        style={{ width: `${((account.total_slots - account.available_slots) / account.total_slots) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={isProcessing === account.id}
                  onClick={() => handleJoin(account)}
                  className="w-full mt-8 bg-slate-900 text-white py-4.5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {isProcessing === account.id ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : null}
                  Join for ₦{account.price.toLocaleString()}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4 text-2xl">
            <i className="fa-solid fa-search"></i>
          </div>
          <p className="text-slate-500 font-black text-sm uppercase tracking-widest">No results found</p>
          <button onClick={() => {setSearchQuery(''); setFilter('All');}} className="mt-4 text-indigo-600 font-bold hover:underline">Clear search</button>
        </div>
      )}
    </div>
  );
};
