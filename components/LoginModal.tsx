import React, { useState } from "react";
import { validateUsername } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import Logo from "@/components/Logo";
import { DEFAULT_FORM, type FormState } from "@/constants/types";
import VerifyEmailScreen from "./VerifyEmailScreen";
import SocialButtons from "./SocialButtons";
import Divider from "./Divider";
import InputField from "./InputField";

const LoginModal: React.FC = () => {
  const {
    signUp,
    login,
    closeLoginModal,
    user,
    refreshSession,
    resendVerificationEmail,
  } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const setField =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const switchMode = () => {
    setIsSignUp((prev) => !prev);
    setError(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignUp) {
      if (!validateUsername(form.username)) {
        setError(
          "Username must be at least 3 characters (letters, numbers, or underscores only).",
        );
        return;
      }

      setLoading(true);
      const err = await signUp(form);
      setLoading(false);

      if (err?.message) {
        setError(err.message || "Failed to create account");
        return;
      }

      setSignUpSuccess(true);
    } else {
      setLoading(true);
      const err = await login(form.email, form.password);
      setLoading(false);

      if (err) {
        setError(err.message || "Failed to login");
        return;
      }

      closeLoginModal();
      toast.success("You're now logged in!");
    }
  };

  // ── State: verify email (after signup; no session until they click the link)
  if (signUpSuccess) {
    const resend = user?.email
      ? async () => {
          await resendVerificationEmail(user.email);
          refreshSession();
        }
      : undefined;

    return (
      <VerifyEmailScreen
        email={form.email}
        onDismiss={() => setSignUpSuccess(false)}
        onResend={resend}
      />
    );
  }

  // ── State: main auth form
  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Close */}
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all z-10"
        >
          <i className="fa-solid fa-xmark" />
        </button>

        {/* Header */}
        <div className="text-center pb-8 flex flex-col items-center gap-2">
          <Logo />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-slate-500 font-medium text-xs mt-1">
            {isSignUp
              ? "Join thousands sharing premium subscriptions."
              : "Access your shared subscription stacks."}
          </p>
        </div>

        {/* Social auth */}
        <SocialButtons onError={(msg) => setError(msg)} />

        <Divider />

        {/* Email / password form */}
        <form onSubmit={handleAuth} className="space-y-4 mt-2">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-[10px] font-bold border border-red-100 flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          {isSignUp && (
            <div className="flex flex-col md:flex-row gap-4">
              <InputField
                label="Name"
                type="text"
                required
                placeholder="Bolu Akilu"
                value={form.name}
                onChange={setField("name")}
              />
              <InputField
                label="Username"
                type="text"
                required
                placeholder="nigerian_saver"
                value={form.username}
                onChange={setField("username")}
              />
            </div>
          )}

          <InputField
            label="Email"
            type="email"
            required
            placeholder="name@email.com"
            value={form.email}
            onChange={setField("email")}
          />

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full bg-slate-50 border-2 border-slate-50 p-4 pr-12 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm"
                value={form.password}
                onChange={setField("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 h-8 w-8 flex items-center justify-center"
              >
                <i
                  className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50 mt-4 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading && <i className="fa-solid fa-spinner fa-spin" />}
            {isSignUp ? "Get Started" : "Login"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={switchMode}
            className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {isSignUp
              ? "Already have an account? Login"
              : "Need an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
