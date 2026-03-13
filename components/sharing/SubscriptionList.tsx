import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Subscription } from "@/constants/sharing-types";
import { toast } from "react-hot-toast";
import { JoinConfirmation } from "./JoinConfirmation";

export const SubscriptionList: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error: any) {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <i className="fa-solid fa-spinner fa-spin text-indigo-600 text-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.map((sub) => (
          <div 
            key={sub.id} 
            className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden shrink-0">
                {sub.logo_url ? (
                  <img src={sub.logo_url} alt={sub.name} className="h-10 w-10 object-contain" />
                ) : (
                  <i className="fa-solid fa-layer-group text-slate-300 text-xl" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-slate-900 truncate font-display">{sub.name}</h3>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                  ₦{(sub.monthly_price / sub.max_seats).toLocaleString()} / seat
                </p>
              </div>
            </div>

            <p className="text-slate-500 text-xs mb-6 flex-1 line-clamp-3 leading-relaxed">
              {sub.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-users text-slate-400 text-[10px]" />
                <span className="text-[11px] font-bold text-slate-600">{sub.max_seats} Seats Total</span>
              </div>
              <button
                onClick={() => setSelectedSub(sub)}
                className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"
              >
                Join Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedSub && (
        <JoinConfirmation 
          subscription={selectedSub} 
          onClose={() => setSelectedSub(null)} 
        />
      )}
    </div>
  );
};
