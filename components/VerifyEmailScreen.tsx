import React, { useEffect, useMemo, useState } from "react";

interface VerifyEmailScreenProps {
  email: string;
  onDismiss: () => void;
  onResend?: () => void | Promise<void>;
  /** If true, auto-send the verification email when shown (throttled). */
  autoResend?: boolean;
  /** Minimum time between automatic resends. Default: 2 minutes. */
  autoResendThrottleMs?: number;
}

const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({
  email,
  onDismiss,
  onResend,
  autoResend = false,
  autoResendThrottleMs = 120_000,
}) => {
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  const resendThrottleKey = useMemo(
    () => `dz_verify_email_last_sent:${email.toLowerCase()}`,
    [email],
  );

  const handleResend = async () => {
    if (!onResend || resending) return;
    setResending(true);
    try {
      await onResend();
      setResendDone(true);
      try {
        localStorage.setItem(resendThrottleKey, String(Date.now()));
      } catch {}
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    if (!autoResend) return;
    if (!email || !onResend) return;
    try {
      const raw = localStorage.getItem(resendThrottleKey);
      const last = raw ? Number(raw) : 0;
      if (last && Date.now() - last < autoResendThrottleMs) return;
    } catch {}
    void handleResend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoResend, autoResendThrottleMs, email, onResend, resendThrottleKey]);

  return (
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
      <p className="text-slate-900 font-black text-sm mb-6 bg-slate-50 rounded-xl py-3 px-4 border border-slate-100">
        {email}
      </p>
      <p className="text-slate-500 text-xs mb-4 leading-relaxed">
        Click the link in that email to verify your account. Then you can sign in and use DiscountZAR.
      </p>
      {onResend && (
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-bold disabled:opacity-50 mb-4"
        >
          {resending
            ? "Sending…"
            : resendDone
              ? "Email sent again"
              : "Didn't get it? Resend verification email"}
        </button>
      )}
      <button
        onClick={onDismiss}
        className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
      >
        Got it — continue
      </button>
      <p className="text-[10px] text-slate-300 font-bold mt-4 uppercase tracking-widest">
        You can complete setup after verifying
      </p>
    </div>
  </div>
  );
};

export default VerifyEmailScreen;
