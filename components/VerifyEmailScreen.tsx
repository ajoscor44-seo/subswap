import React from "react";

interface VerifyEmailScreenProps {
  email: string;
  onDismiss: () => void;
}

const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({
  email,
  onDismiss,
}) => (
  <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-center border border-slate-100 animate-in zoom-in-95 duration-300">
      <div className="h-20 w-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm">
        <i className="fa-solid fa-paper-plane" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-4">
        Check your inbox
      </h2>
      <p className="text-slate-500 font-medium mb-2 leading-relaxed text-sm">
        We sent a verification link to
      </p>
      <p className="text-slate-900 font-black text-sm mb-8 bg-slate-50 rounded-xl py-3 px-4 border border-slate-100">
        {email}
      </p>
      <button
        onClick={onDismiss}
        className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
      >
        Got it — continue
      </button>
      <p className="text-[10px] text-slate-300 font-bold mt-4 uppercase tracking-widest">
        You can complete setup now
      </p>
    </div>
  </div>
);

export default VerifyEmailScreen;
