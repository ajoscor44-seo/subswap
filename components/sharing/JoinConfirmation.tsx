import React, { useState, useEffect } from "react";
import { Subscription } from "@/constants/sharing-types";
import { supabase } from "@/lib/supabase";
import { calculateProratedSeatPrice } from "@/lib/billing";

interface JoinConfirmationProps {
  subscription: Subscription;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export const JoinConfirmation: React.FC<JoinConfirmationProps> = ({
  subscription,
  onClose,
  onConfirm,
  isProcessing = false,
}) => {
  const [proratedData, setProratedPrice] = useState<any>(null);

  useEffect(() => {
    console.log("Calculating prorated price for subscription:", subscription);
    const getProrated = async () => {
      // Find the group we would join to get its cycle info
      const { data: groups } = await supabase.rpc("find_available_group", {
        p_subscription_id: subscription.id,
      });

      if (groups && groups.length > 0) {
        const group = groups[0];
        const data = calculateProratedSeatPrice(
          subscription.price,
          subscription.total_slots,
          new Date(group.cycle_start),
          new Date(group.cycle_end),
        );
        setProratedPrice(data);
      } else {
        // New group would be created, pay full seat price
        const fullPrice = subscription.price / subscription.total_slots;
        setProratedPrice({
          proratedPrice: fullPrice,
          remainingDays: 30,
          fullRenewalPrice: fullPrice,
        });
      }
    };

    getProrated();
  }, [subscription]);

  if (!proratedData) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <i className="fa-solid fa-xmark text-lg" />
        </button>

        <div className="text-center mb-8">
          <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100 mx-auto mb-4 overflow-hidden">
            {subscription.icon_url ? (
              <img
                src={subscription.icon_url}
                alt={subscription.service_name}
                className="h-20 w-20 object-contain"
              />
            ) : (
              <i className="fa-solid fa-layer-group text-slate-300 text-3xl" />
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-display">
            {subscription.service_name}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {`Confirm your seat in this ${subscription.service_name} plan`}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Seat Price
            </span>
            <span className="text-sm font-black text-slate-900 font-display">
              ₦{proratedData.fullRenewalPrice.toLocaleString()} / mo
            </span>
          </div>

          <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">
                Pay Today
              </span>
              <span className="text-[10px] text-indigo-400 font-medium">
                Prorated for {proratedData.remainingDays} days
              </span>
            </div>
            <span className="text-xl font-black text-indigo-700 font-display">
              ₦{proratedData.proratedPrice.toLocaleString()}
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Next Billing
            </p>
            <p className="text-xs font-black text-slate-700 font-display">
              ₦{proratedData.fullRenewalPrice.toLocaleString()} on{" "}
              {new Date(
                new Date().getTime() +
                  proratedData.remainingDays * 24 * 60 * 60 * 1000,
              ).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={onConfirm}
          disabled={isProcessing}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 font-display"
        >
          {isProcessing && <i className="fa-solid fa-spinner fa-spin" />}
          Confirm & Join
        </button>
      </div>
    </div>
  );
};
