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

interface ProratedData {
  proratedPrice: number;
  remainingDays: number;
  fullRenewalPrice: number;
  cycleStart: Date;
  cycleEnd: Date;
  totalCycleDays: number;
  elapsedDays: number;
  isNewGroup: boolean;
}

export const JoinConfirmation: React.FC<JoinConfirmationProps> = ({
  subscription,
  onClose,
  onConfirm,
  isProcessing = false,
}) => {
  const [proratedData, setProratedData] = useState<ProratedData | null>(null);

  useEffect(() => {
    const getProrated = async () => {
      const today = new Date();

      const { data: groups } = await supabase.rpc("find_available_group", {
        p_subscription_id: subscription.id,
      });

      if (groups && groups.length > 0) {
        const group = groups[0];
        const cycleStart = new Date(group.cycle_start);
        const cycleEnd = new Date(group.cycle_end);

        const data = calculateProratedSeatPrice(
          subscription.price,
          1, // price is already per-seat, no need to divide again
          cycleStart,
          cycleEnd,
          today,
        );

        const totalCycleDays = Math.ceil(
          (cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24),
        );
        const elapsedDays = Math.ceil(
          (today.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24),
        );

        setProratedData({
          ...data,
          cycleStart,
          cycleEnd,
          totalCycleDays,
          elapsedDays: Math.max(0, elapsedDays),
          isNewGroup: false,
        });
      } else {
        // New group — full 30-day cycle starting today
        const cycleStart = today;
        const cycleEnd = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        // price is already per-seat
        const fullPrice = subscription.price;

        setProratedData({
          proratedPrice: fullPrice,
          remainingDays: 30,
          fullRenewalPrice: fullPrice,
          cycleStart,
          cycleEnd,
          totalCycleDays: 30,
          elapsedDays: 0,
          isNewGroup: true,
        });
      }
    };

    getProrated();
  }, [subscription]);

  if (!proratedData) {
    return (
      <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl flex items-center justify-center min-h-50">
          <i className="fa-solid fa-spinner fa-spin text-indigo-400 text-2xl" />
        </div>
      </div>
    );
  }

  const progressPercent = proratedData.isNewGroup
    ? 0
    : Math.round(
        (proratedData.elapsedDays / proratedData.totalCycleDays) * 100,
      );

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const isProrated = !proratedData.isNewGroup && proratedData.elapsedDays > 0;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <i className="fa-solid fa-xmark text-lg" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
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
            Confirm your seat in this shared plan
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {/* Cycle period block with progress bar */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {proratedData.isNewGroup
                  ? "Your Subscription Period"
                  : "Current Billing Cycle"}
              </span>
              {isProrated && (
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  Mid-cycle join
                </span>
              )}
            </div>

            {/* Date range with timeline */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-left">
                <p className="text-[10px] text-slate-400 font-medium mb-0.5">
                  {proratedData.isNewGroup ? "Starts" : "Cycle Start"}
                </p>
                <p className="text-xs font-black text-slate-700 font-display">
                  {fmt(
                    proratedData.isNewGroup
                      ? new Date()
                      : proratedData.cycleStart,
                  )}
                </p>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 px-2">
                <span className="text-[9px] text-slate-400 font-medium">
                  {proratedData.totalCycleDays} days
                </span>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-medium mb-0.5">
                  {proratedData.isNewGroup ? "Renews" : "Cycle End"}
                </p>
                <p className="text-xs font-black text-slate-700 font-display">
                  {fmt(proratedData.cycleEnd)}
                </p>
              </div>
            </div>

            {/* Progress bar — shows how far into cycle we are, and highlights your paid portion */}
            <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
              {/* Elapsed (already paid by others / gone) */}
              <div
                className="absolute left-0 top-0 h-full rounded-l-full bg-slate-300"
                style={{ width: `${progressPercent}%` }}
              />
              {/* Your paid portion (remaining days) */}
              <div
                className="absolute top-0 h-full bg-linear-to-r from-violet-500 to-indigo-400"
                style={{
                  left: `${progressPercent}%`,
                  width: `${100 - progressPercent}%`,
                }}
              />
              {/* "You are here" marker */}
              {isProrated && (
                <div
                  className="absolute top-1/2 w-3 h-3 rounded-full bg-white border-2 border-indigo-500 shadow-md"
                  style={{
                    left: `${progressPercent}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: 2,
                  }}
                />
              )}
            </div>

            <div className="flex justify-between mt-2">
              {isProrated ? (
                <>
                  <span className="text-[10px] text-slate-400">
                    <span className="inline-block w-2 h-2 rounded-sm bg-slate-300 mr-1 align-middle" />
                    {proratedData.elapsedDays}d elapsed
                  </span>
                  <span className="text-[10px] text-indigo-500 font-semibold">
                    <span className="inline-block w-2 h-2 rounded-sm bg-indigo-400 mr-1 align-middle" />
                    {proratedData.remainingDays}d you pay for
                  </span>
                </>
              ) : (
                <span className="text-[10px] text-slate-400 w-full text-center">
                  Full 30-day cycle
                </span>
              )}
            </div>
          </div>

          {/* Monthly seat price */}
          <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Monthly Seat Price
            </span>
            <span className="text-sm font-black text-slate-900 font-display">
              ₦{proratedData.fullRenewalPrice.toLocaleString()} / mo
            </span>
          </div>

          {/* Pay today */}
          <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">
                Pay Today
              </span>
              <span className="text-[10px] text-indigo-400 font-medium">
                {isProrated
                  ? `Prorated for ${proratedData.remainingDays} of ${proratedData.totalCycleDays} days`
                  : "Full first month"}
              </span>
            </div>
            <span className="text-xl font-black text-indigo-700 font-display">
              ₦{proratedData.proratedPrice.toLocaleString()}
            </span>
          </div>

          {/* Next billing — correctly points to cycle end, not today + 30 */}
          <div className="flex justify-between items-center px-4 py-3 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Next Billing
              </span>
              <span className="text-[10px] text-slate-400">
                {fmt(proratedData.cycleEnd)}
              </span>
            </div>
            <span className="text-sm font-black text-slate-700 font-display">
              ₦{proratedData.fullRenewalPrice.toLocaleString()}
            </span>
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
