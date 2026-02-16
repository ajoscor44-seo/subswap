
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Transaction } from '../types';

interface TransactionHistoryProps {
  user: User;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        let query = supabase.from('transactions').select('*');
        
        // If regular user, only show their own. Admins see all.
        if (!user.isAdmin) {
          query = query.eq('user_id', user.id);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setTransactions(data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Financial Ledger</h1>
          <p className="text-slate-500 font-medium mt-1">
            {user.isAdmin ? 'Global platform transaction history.' : 'Your complete wallet and subscription history.'}
          </p>
        </header>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">User ID</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-6">
                        <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-6">
                        <span className="font-mono text-[10px] text-slate-400 group-hover:text-slate-600 transition-colors">
                          {tx.user_id === user.id ? 'Self' : `...${tx.user_id.slice(-8)}`}
                        </span>
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
                      <td className={`px-8 py-6 font-black text-sm text-right ${tx.amount < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {tx.amount < 0 ? '-' : '+'}₦{Math.abs(tx.amount).toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-xs text-slate-500 font-medium">
                        {tx.description || 'No description provided'}
                      </td>
                      <td className="px-8 py-6 text-right text-[10px] font-black text-slate-300">
                        {new Date(tx.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                          <i className="fa-solid fa-receipt text-xl"></i>
                        </div>
                        No transactions found
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
