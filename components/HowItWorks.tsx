import React, { useEffect, useRef, useState } from "react";

interface Step {
  number: string;
  accent: string;
  accentBg: string;
  accentText: string;
  icon: string;
  title: string;
  description: string;
  detail: string;
}

const STEPS: Step[] = [
  {
    number: "01",
    accent: "#4F46E5",
    accentBg: "bg-indigo-600",
    accentText: "text-indigo-600",
    icon: "fa-solid fa-layer-group",
    title: "Create your subscription",
    description:
      "Describe what it offers, set the number of slots available, and price it monthly in Naira.",
    detail: "Takes less than 2 minutes",
  },
  {
    number: "02",
    accent: "#059669",
    accentBg: "bg-emerald-600",
    accentText: "text-emerald-600",
    icon: "fa-solid fa-link",
    title: "Share it online",
    description:
      "Get a unique invite link instantly. Share with friends or list it publicly on our marketplace.",
    detail: "Reach thousands of buyers",
  },
  {
    number: "03",
    accent: "#D97706",
    accentBg: "bg-amber-600",
    accentText: "text-amber-600",
    icon: "fa-solid fa-wallet",
    title: "Collect your payments",
    description:
      "Money hits your wallet automatically every month. We handle collection so you never chase payments.",
    detail: "Instant Naira settlements",
  },
];

const useInView = (threshold = 0.15) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
};

const StepCard: React.FC<{ step: Step; index: number; inView: boolean }> = ({
  step,
  index,
  inView,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.6s ease ${index * 0.15}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 0.15}s`,
      }}
    >
      {/* Connector line (desktop) */}
      {index < STEPS.length - 1 && (
        <div
          className="absolute top-15 left-[calc(100%+0.5rem)] w-[calc(100%-1rem)] h-0.5 hidden lg:block"
          style={{ zIndex: 0 }}
        >
          <div
            className="h-full w-full relative overflow-hidden rounded-full"
            style={{ background: "#f1f5f9" }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${step.accent}, transparent)`,
                width: inView ? "100%" : "0%",
                transition: `width 0.8s ease ${index * 0.15 + 0.4}s`,
              }}
            />
          </div>
          {/* Arrow tip */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2"
            style={{ color: "#e2e8f0" }}
          >
            <i className="fa-solid fa-chevron-right text-xs" />
          </div>
        </div>
      )}

      {/* Card */}
      <div
        className="relative p-8 rounded-4xl border bg-white cursor-default flex flex-col h-full overflow-hidden"
        style={{
          borderColor: hovered ? `${step.accent}30` : "#f1f5f9",
          boxShadow: hovered
            ? `0 20px 60px -12px ${step.accent}18, 0 4px 16px -4px ${step.accent}10`
            : "0 1px 4px rgba(0,0,0,0.04)",
          transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Subtle background glow on hover */}
        <div
          className="absolute inset-0 rounded-4xl pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 20% 20%, ${step.accent}08, transparent 60%)`,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />

        {/* Step number — top right */}
        <div
          className="absolute top-6 right-7 font-black tabular-nums select-none"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "3rem",
            lineHeight: 1,
            color: hovered ? `${step.accent}18` : "#f8fafc",
            transition: "color 0.4s ease",
          }}
        >
          {step.number}
        </div>

        {/* Icon */}
        <div
          className="relative z-10 h-14 w-14 rounded-2xl flex items-center justify-center mb-7 transition-all duration-400"
          style={{
            background: hovered ? step.accent : `${step.accent}12`,
            boxShadow: hovered ? `0 8px 24px ${step.accent}30` : "none",
            transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <i
            className={`${step.icon} text-xl`}
            style={{ color: hovered ? "#fff" : step.accent }}
          />
        </div>

        {/* Text */}
        <h4 className="relative z-10 text-lg font-black text-slate-900 mb-3 leading-tight">
          {step.title}
        </h4>
        <p className="relative z-10 text-slate-500 font-medium leading-relaxed text-sm flex-1">
          {step.description}
        </p>

        {/* Bottom tag */}
        <div
          className="relative z-10 mt-6 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest"
          style={{ color: step.accent }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: step.accent }}
          />
          {step.detail}
        </div>
      </div>
    </div>
  );
};

export const HowItWorks: React.FC = () => {
  const { ref, inView } = useInView();
  const { ref: badgeRef, inView: badgeInView } = useInView(0.5);

  return (
    <section
      className="py-28 bg-white relative overflow-hidden"
      id="how-it-works"
    >
      {/* Decorative background blobs */}
      <div
        className="absolute top-0 right-0 w-125 h-125 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(79,70,229,0.04) 0%, transparent 70%)",
          transform: "translate(30%, -30%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-100 h-100 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(5,150,105,0.04) 0%, transparent 70%)",
          transform: "translate(-30%, 30%)",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div
          ref={badgeRef}
          className="text-center mb-20 max-w-2xl mx-auto"
          style={{
            opacity: badgeInView ? 1 : 0,
            transform: badgeInView ? "translateY(0)" : "translateY(24px)",
            transition:
              "opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6">
            <i className="fa-solid fa-bolt text-[10px]" />
            How it Works
          </div>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Offer a subscription
            <br />
            <span className="text-indigo-600">in minutes</span>
          </h3>
          <p className="mt-5 text-slate-500 font-medium leading-relaxed max-w-lg mx-auto">
            Turn your extra subscription slots into cash. SubSwap makes it easy
            for Nigerians to share costs securely and automatically.
          </p>
        </div>

        {/* Steps */}
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative"
        >
          {STEPS.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} inView={inView} />
          ))}
        </div>

        {/* Footer strip */}
        <div
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.6s, transform 0.6s ease 0.6s",
          }}
        >
          <div className="h-px w-16 bg-slate-100 hidden sm:block" />

          <div className="flex items-center gap-2">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/79/Flag_of_Nigeria.svg"
              className="h-4 w-auto rounded-sm"
              alt="Nigeria"
            />
            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
              Built for Nigeria
            </span>
          </div>

          <span className="text-slate-200 hidden sm:block">·</span>

          <div className="flex items-center gap-2">
            <i className="fa-solid fa-naira-sign text-slate-400 text-xs" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
              Naira Settlements
            </span>
          </div>

          <span className="text-slate-200 hidden sm:block">·</span>

          <div className="flex items-center gap-2">
            <i className="fa-solid fa-headset text-slate-400 text-xs" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
              Local Support
            </span>
          </div>

          <div className="h-px w-16 bg-slate-100 hidden sm:block" />
        </div>
      </div>
    </section>
  );
};
