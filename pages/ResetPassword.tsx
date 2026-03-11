import React, { useState } from "react";
import { useAuth } from "@/providers/auth";
import { useNavigator } from "@/providers/navigator";
import Logo from "@/components/Logo";
import toast from "react-hot-toast";

const ResetPasswordPage: React.FC = () => {
  const { updatePassword } = useAuth();
  const { goTo } = useNavigator();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      toast.success("Password updated successfully!");
      goTo("dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-slate-100">
        <div className="text-center mb-8 flex flex-col items-center gap-2">
          <Logo />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Create New Password
          </h2>
          <p className="text-slate-500 font-medium text-xs">
            Secure your account with a strong password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              New Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
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
