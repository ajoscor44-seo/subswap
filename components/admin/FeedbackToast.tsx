import { Feedback } from "@/constants/types";
import React, { useEffect, useState } from "react";

interface FeedbackToastProps {
  feedback: Feedback | null;
}

export const FeedbackToast: React.FC<FeedbackToastProps> = ({ feedback }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (feedback) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [feedback]);

  if (!feedback) return null;

  return (
    <div
      className={`fixed top-24 right-6 z-300 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border transition-all duration-300 ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
      } ${
        feedback.type === "success"
          ? "bg-slate-900 border-slate-700 text-white"
          : "bg-red-500 border-red-400 text-white"
      }`}
    >
      <div
        className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
          feedback.type === "success" ? "bg-emerald-500/20" : "bg-white/20"
        }`}
      >
        <i
          className={`fa-solid text-sm ${
            feedback.type === "success"
              ? "fa-circle-check text-emerald-400"
              : "fa-circle-exclamation"
          }`}
        />
      </div>
      <p className="font-black text-[11px] uppercase tracking-widest max-w-xs">
        {feedback.message}
      </p>
    </div>
  );
};
