import React, { useState } from "react";
import { validateUsername } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import { useNavigator } from "@/providers/navigator";
import toast from "react-hot-toast";

interface FormState {
  email: string;
  name: string;
  username: string;
  password: string;
}

const DEFAULT_FORM: FormState = {
  email: "",
  name: "",
  username: "",
  password: "",
};

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, ...props }) => (
  <div className="space-y-1 flex-1">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
      {label}
    </label>
    <input
      className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm"
      {...props}
    />
  </div>
);

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
      <h2 className="text-2xl font-black text-slate-900 mb-4">Verify Email</h2>
      <p className="text-slate-500 font-medium mb-8 leading-relaxed text-sm">
        Check <span className="text-slate-900 font-bold">{email}</span> to
        verify your account.
      </p>
      <button
        onClick={onDismiss}
        className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
      >
        Got it
      </button>
    </div>
  </div>
);

const LoginModal: React.FC = () => {
  const { signUp, login, closeLoginModal } = useAuth();
  const { changeView } = useNavigator();

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
      const error = await signUp(form);
      setLoading(false);

      if (error) {
        setError(error.message || "Failed to create account");
        return;
      }

      setSignUpSuccess(true);
      closeLoginModal();
    } else {
      setLoading(true);
      const error = await login(form.email, form.password);
      setLoading(false);

      if (error) {
        setError(error.message || "Failed to login");
        return;
      }

      closeLoginModal();
      toast.success("You're now logged in!");
    }
  };

  if (signUpSuccess) {
    return <VerifyEmailScreen email={form.email} onDismiss={switchMode} />;
  }

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-4xl md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all z-10"
        >
          <i className="fa-solid fa-xmark" />
        </button>

        <div className="text-center mb-8">
          <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">
            S
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-slate-500 font-medium text-xs mt-1">
            {isSignUp
              ? "Join the smart community of savers."
              : "Access your premium shared stacks."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
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
                onClick={() => setShowPassword((prev) => !prev)}
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
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50 mt-4 active:scale-95"
          >
            {loading && <i className="fa-solid fa-spinner fa-spin mr-2" />}
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
