import React from "react";
import { MasterAccount } from "@/constants/types";
import { calculateProratedSeatPrice } from "@/lib/billing";

interface JoinConfirmationProps {
  subscription: MasterAccount;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export const JoinConfirmation: React.FC<JoinConfirmationProps> = ({
  subscription,
  onClose,
  onConfirm,
  isProcessing,
}) => {
  // Calculate proration based on created_at + 30 days
  const cycleStart = new Date(subscription.created_at);
  const cycleEnd = new Date(cycleStart.getTime() + 30 * 24 * 60 * 60 * 1000);

  const { proratedPrice, remainingDays } = calculateProratedSeatPrice(
    subscription.price * (subscription.total_slots || 1),
    subscription.total_slots || 1,
    cycleStart,
    cycleEnd,
  );

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-all"
        >
          <i className="fa-solid fa-xmark text-lg" />
        </button>

        <div className="text-center mb-8">
          <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100 mx-auto mb-4 overflow-hidden">
            {subscription.icon_url ? (
              <img
                src={subscription.icon_url}
                alt={subscription.service_name}
                className="h-full w-full object-contain"
              />
            ) : (
              <i className="fa-solid fa-layer-group text-slate-300 text-3xl" />
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">
            {subscription.service_name}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Confirm your share for this cycle
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Standard Share
            </span>
            <span className="text-sm font-black text-slate-900 font-display">
              ₦{subscription.price.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">
                Pay Today
              </span>
              <span className="text-[10px] text-indigo-400 font-medium">
                Prorated for {remainingDays} days
              </span>
            </div>
            <span className="text-xl font-black text-indigo-700 font-display">
              ₦{proratedPrice.toLocaleString()}
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">
              Access Period Ends
            </p>
            <p className="text-xs font-black text-slate-700 font-display text-center">
              {cycleEnd.toLocaleDateString("en-NG", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 font-display"
          >
            {isProcessing ? (
              <i className="fa-solid fa-spinner fa-spin" />
            ) : (
              <i className="fa-solid fa-bolt" />
            )}
            Confirm & Pay ₦{proratedPrice.toLocaleString()}
          </button>
          <p className="text-[9px] text-center text-slate-400 font-medium uppercase tracking-wider">
            Funds will be deducted from your wallet balance instantly.
          </p>
        </div>
      </div>
    </div>
  );
};
