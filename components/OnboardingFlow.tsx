import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import OptionCard from "./OptionCard";
import StepProgress from "./StepProgress";
import { ONBOARDING_STEPS } from "@/constants/data";
import { DEFAULT_ONBOARDING, type OnboardingState } from "@/constants/types";

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

  const currentStep = ONBOARDING_STEPS[step];
  const isLastStep = step === ONBOARDING_STEPS.length - 1;
  const currentValue = data[currentStep.field];

  const handleSelect = (value: string) =>
    setData((prev) => ({ ...prev, [currentStep.field]: value }));

  const handleNext = async () => {
    if (!currentValue) return;
    if (!isLastStep) return setStep((s) => s + 1);

    setSaving(true);
    try {
      const { error } = await supabase.from("user_onboarding").insert({
        user_id: userId,
        use_case: data.useCase,
        role: data.role,
        referral_source: data.referralSource,
      });
      if (error) throw error;
    } catch (err) {
      console.error("Failed to save onboarding data:", err);
    } finally {
      setSaving(false);
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
        <StepProgress current={step} total={ONBOARDING_STEPS.length} />

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

        <div className="flex flex-wrap gap-3 mb-8">
          {currentStep.options.map((opt) => (
            <OptionCard
              key={opt.label}
              icon={opt.icon}
              label={opt.label}
              selected={currentValue === opt.label}
              onClick={() => handleSelect(opt.label)}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-6 py-4 rounded-2xl font-black text-sm border-2 border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600 transition-all"
            >
              <i className="fa-solid fa-arrow-left" />
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!currentValue || saving}
            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-40 active:scale-95 flex items-center justify-center gap-2"
          >
            {saving && <i className="fa-solid fa-spinner fa-spin" />}
            {isLastStep ? "Finish" : "Continue"}
            {!isLastStep && !saving && (
              <i className="fa-solid fa-arrow-right" />
            )}
          </button>
        </div>

        <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-4">
          Step {step + 1} of {ONBOARDING_STEPS.length}
        </p>
      </div>
    </div>
  );
};

export default OnboardingFlow;
