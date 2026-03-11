import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth";
import { useNavigator } from "@/providers/navigator";
import Logo from "@/components/Logo";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

const ResetPasswordPage: React.FC = () => {
  const { updatePassword } = useAuth();
  const { goTo } = useNavigator();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    const handleSession = async () => {
      // 1. Try standard session retrieval
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsSessionReady(true);
        return;
      }

      // 2. If no session, check if tokens are trapped in the hash (Hash Routing issue)
      const hash = window.location.hash;
      if (hash.includes("access_token=")) {
        // Manually parse the fragment
        const fragment = hash.includes("#access_token") 
          ? hash.split("#").find(s => s.startsWith("access_token"))
          : hash.split("#")[1];
          
        if (fragment) {
          const params = new URLSearchParams(fragment);
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!error && data.session) {
              setIsSessionReady(true);
              return;
            }
          }
        }
      }

      // 3. Last resort delay
      setTimeout(async () => {
        const { data: { session: finalTry } } = await supabase.auth.getSession();
        if (finalTry) setIsSessionReady(true);
        else toast.error("Reset session not found. Please try the email link again.");
      }, 1500);
    };

    handleSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSessionReady) {
      toast.error("Security session not ready. Please wait or refresh.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const err = await updatePassword(password);
    setLoading(false);

    if (err) {
      toast.error(err.message);
    } else {
      toast.success("Password updated! Logging you in...");
      // Use window.location to clear the hash tokens entirely
      window.location.href = window.location.origin + "/#/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-slate-100">
        <div className="text-center mb-8 flex flex-col items-center gap-2">
          <Logo />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            New Password
          </h2>
          <p className="text-slate-500 font-medium text-xs">
            Set a new secure password for your account.
          </p>
        </div>

        {!isSessionReady && (
          <div className="flex items-center gap-3 p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-6">
            <i className="fa-solid fa-spinner fa-spin" />
            <p className="text-[11px] font-bold uppercase tracking-wider">Verifying secure link...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              New Password
            </label>
            <input
              type="password"
              required
              disabled={!isSessionReady}
              placeholder="••••••••"
              className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm disabled:opacity-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              disabled={!isSessionReady}
              placeholder="••••••••"
              className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm disabled:opacity-50"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isSessionReady}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {loading && <i className="fa-solid fa-spinner fa-spin" />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
