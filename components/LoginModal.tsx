import React, { useState } from "react";
import { validateUsername } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import { supabase } from "@/lib/supabase"; // adjust import path
import toast from "react-hot-toast";
import Logo from "./Logo";

/* ─────────────────────── Types ─────────────────────── */
interface FormState {
  email: string;
  name: string;
  username: string;
  password: string;
}

interface OnboardingState {
  useCase: string;
  referralSource: string;
  savingsGoal: string;
}

const DEFAULT_FORM: FormState = {
  email: "",
  name: "",
  username: "",
  password: "",
};
const DEFAULT_ONBOARDING: OnboardingState = {
  useCase: "",
  referralSource: "",
  savingsGoal: "",
};

/* ─────────────────────── Reusable Input ─────────────────────── */
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

/* ─────────────────────── Option Card ─────────────────────── */
interface OptionCardProps {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}
const OptionCard: React.FC<OptionCardProps> = ({
  icon,
  label,
  selected,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 min-w-[calc(50%-8px)] p-4 rounded-2xl border-2 text-center transition-all font-bold text-sm flex flex-col items-center gap-2 ${
      selected
        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
        : "border-slate-100 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/40"
    }`}
  >
    <span
      className={`text-xl ${selected ? "text-indigo-500" : "text-slate-400"}`}
    >
      {icon}
    </span>
    <span className="text-xs leading-tight">{label}</span>
  </button>
);

/* ─────────────────────── Progress Bar ─────────────────────── */
const StepProgress: React.FC<{ current: number; total: number }> = ({
  current,
  total,
}) => (
  <div className="flex gap-1.5 mb-6">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
          i < current
            ? "bg-indigo-500"
            : i === current
              ? "bg-indigo-300"
              : "bg-slate-100"
        }`}
      />
    ))}
  </div>
);

/* ─────────────────────── Verify Email Screen ─────────────────────── */
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

interface OnboardingFlowProps {
  userId: string;
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  userId,
  onComplete,
}) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingState>(DEFAULT_ONBOARDING);
  const [saving, setSaving] = useState(false);

  /* ─────────────────────── Updated Survey Data ─────────────────────── */

  const USE_CASES = [
    {
      icon: <i className="fa-solid fa-film" />,
      label: "Stream movies & shows",
    },
    { icon: <i className="fa-solid fa-music" />, label: "Music streaming" },
    {
      icon: <i className="fa-solid fa-laptop-code" />,
      label: "Software & dev tools",
    },
    {
      icon: <i className="fa-solid fa-graduation-cap" />,
      label: "Online courses",
    },
    { icon: <i className="fa-solid fa-gamepad" />, label: "Gaming" },
    {
      icon: <i className="fa-solid fa-briefcase" />,
      label: "Business & productivity",
    },
  ];

  const REFERRAL_SOURCES = [
    { icon: <i className="fa-brands fa-instagram" />, label: "Instagram" },
    { icon: <i className="fa-brands fa-tiktok" />, label: "TikTok" },
    { icon: <i className="fa-brands fa-x-twitter" />, label: "Twitter / X" },
    { icon: <i className="fa-solid fa-users" />, label: "Friend or Family" },
    { icon: <i className="fa-brands fa-google" />, label: "Google Search" },
    { icon: <i className="fa-solid fa-microphone" />, label: "Podcast" },
  ];

  const SHARING_ROLES = [
    {
      icon: <i className="fa-solid fa-crown" />,
      label: "I want to host a slot",
    },
    {
      icon: <i className="fa-solid fa-ticket" />,
      label: "I want to join a slot",
    },
    {
      icon: <i className="fa-solid fa-shuffle" />,
      label: "Both — host & join",
    },
    { icon: <i className="fa-solid fa-eye" />, label: "Just browsing for now" },
  ];

  const STEPS = [
    {
      title: "What do you want to share?",
      subtitle: "Pick the category you're most interested in.",
      field: "useCase" as keyof OnboardingState,
      options: USE_CASES,
    },
    {
      title: "How will you use the platform?",
      subtitle: "This helps us tailor your dashboard experience.",
      field: "role" as keyof OnboardingState,
      options: SHARING_ROLES,
    },
    {
      title: "How did you find us?",
      subtitle: "We'd love to know where you came from.",
      field: "referralSource" as keyof OnboardingState,
      options: REFERRAL_SOURCES,
    },
  ];

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  const handleSelect = (value: string) => {
    setData((prev) => ({ ...prev, [currentStep.field]: value }));
  };

  const handleNext = async () => {
    if (!data[currentStep.field]) return;

    if (!isLastStep) {
      setStep((s) => s + 1);
      return;
    }

    // Save to Supabase
    setSaving(true);
    try {
      const { error } = await supabase.from("user_onboarding").insert({
        user_id: userId,
        use_case: data.useCase,
        referral_source: data.referralSource,
        savings_goal: data.savingsGoal,
      });

      if (error) throw error;
    } catch (err) {
      console.error("Failed to save onboarding data:", err);
      // Non-blocking — don't stop the user
    } finally {
      setSaving(false);
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
        {/* Progress */}
        <StepProgress current={step} total={STEPS.length} />

        {/* Skip */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 leading-tight">
              {currentStep.title}
            </h2>
            <p className="text-slate-400 text-xs font-medium mt-1">
              {currentStep.subtitle}
            </p>
          </div>
          <button
            onClick={onComplete}
            className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-slate-500 transition-colors ml-4 mt-1 whitespace-nowrap"
          >
            Skip all
          </button>
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-3 mb-8">
          {currentStep.options.map((opt) => (
            <OptionCard
              key={opt.label}
              icon={opt.icon}
              label={opt.label}
              selected={data[currentStep.field] === opt.label}
              onClick={() => handleSelect(opt.label)}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-sm border-2 border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600 transition-all"
            >
              <i className="fa-solid fa-arrow-left" />
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!data[currentStep.field] || saving}
            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-40 active:scale-95"
          >
            {saving ? <i className="fa-solid fa-spinner fa-spin mr-2" /> : null}
            {isLastStep ? "Finish" : "Continue"}
            {!isLastStep && <i className="fa-solid fa-arrow-right ml-2" />}
          </button>
        </div>

        {/* Step counter */}
        <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-4">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────── Divider ─────────────────────── */
const Divider = () => (
  <div className="flex items-center gap-3 my-2">
    <div className="flex-1 h-px bg-slate-100" />
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
      or
    </span>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

/* ─────────────────────── Main Modal ─────────────────────── */
const LoginModal: React.FC = () => {
  const { signUp, login, closeLoginModal } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [onboardingUserId, setOnboardingUserId] = useState<string | null>(null);

  const setField =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const switchMode = () => {
    setIsSignUp((prev) => !prev);
    setError(null);
  };

  /* ── Google OAuth ── */
  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // Supabase redirects — no need to closeLoginModal here
  };

  /* ── Email Auth ── */
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

      // Get current user id to tie onboarding to
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setOnboardingUserId(user?.id ?? "pending");
      setSignUpSuccess(true);
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

  /* ── Render states ── */
  if (onboardingUserId && signUpSuccess) {
    return (
      <>
        <VerifyEmailScreen
          email={form.email}
          onDismiss={() => setSignUpSuccess(false)}
        />
        {/* Onboarding shown after email screen is dismissed */}
      </>
    );
  }

  // Show onboarding after they dismiss the verify email screen
  if (!signUpSuccess && onboardingUserId) {
    return (
      <OnboardingFlow
        userId={onboardingUserId}
        onComplete={() => {
          setOnboardingUserId(null);
          closeLoginModal();
          toast.success("Welcome aboard! 🎉");
        }}
      />
    );
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

        <div className="text-center pb-8 flex flex-col items-center gap-2">
          <Logo />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-slate-500 font-medium text-xs mt-1">
            {isSignUp
              ? "Join the smart community of savers."
              : "Access your premium shared stacks."}
          </p>
        </div>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 border-2 border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 py-3.5 rounded-2xl font-black text-sm text-slate-700 transition-all disabled:opacity-50 active:scale-95 mb-4"
        >
          {googleLoading ? (
            <i className="fa-solid fa-spinner fa-spin text-slate-400" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
          )}
          Continue with Google
        </button>

        <Divider />

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
