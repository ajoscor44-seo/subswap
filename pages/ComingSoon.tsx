import React, { useState, useEffect, useRef } from "react";

// ─── Floating orb ─────────────────────────────────────────────────────────────
const Orb = ({
  size,
  x,
  y,
  delay,
  duration,
}: {
  size: number;
  x: string;
  y: string;
  delay: number;
  duration: number;
}) => (
  <div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
      background:
        "radial-gradient(circle at 40% 40%, rgba(99,91,255,0.18), rgba(79,70,229,0.06) 60%, transparent 80%)",
      filter: "blur(40px)",
      animation: `float ${duration}s ease-in-out ${delay}s infinite alternate`,
    }}
  />
);

// ─── Grid lines ───────────────────────────────────────────────────────────────
const GridLines = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path
          d="M 60 0 L 0 0 0 60"
          fill="none"
          stroke="#4F46E5"
          strokeWidth="1"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

// ─── Countdown digit ──────────────────────────────────────────────────────────
const Digit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div
      className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(79,70,229,0.25)",
        boxShadow: "0 0 24px rgba(79,70,229,0.08) inset",
      }}
    >
      <span
        className="text-2xl md:text-3xl font-black tabular-nums"
        style={{
          fontFamily: "'DM Mono', 'Fira Mono', monospace",
          color: "#e0e0ff",
          letterSpacing: "-0.02em",
        }}
      >
        {String(value).padStart(2, "0")}
      </span>
    </div>
    <span
      className="text-[10px] uppercase tracking-[0.2em] font-bold"
      style={{ color: "rgba(139,132,255,0.6)" }}
    >
      {label}
    </span>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const TARGET = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

const ComingSoon: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ d: 30, h: 0, m: 0, s: 0 });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const diff = TARGET.getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        @keyframes float {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes reveal {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); opacity: 0.6; }
          70%  { transform: scale(1.08); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
        @keyframes scan {
          0%   { transform: translateY(-100%); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .reveal { animation: reveal 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.22s; }
        .delay-3 { animation-delay: 0.34s; }
        .delay-4 { animation-delay: 0.46s; }
        .delay-5 { animation-delay: 0.58s; }

        .notify-btn {
          background: linear-gradient(135deg, #4F46E5, #6366f1);
          transition: all 0.2s ease;
        }
        .notify-btn:hover {
          background: linear-gradient(135deg, #4338CA, #4F46E5);
          box-shadow: 0 0 28px rgba(79,70,229,0.45);
          transform: translateY(-1px);
        }
        .notify-btn:active { transform: translateY(0); }

        .input-glow:focus {
          border-color: rgba(99,91,255,0.6) !important;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
        }
      `}</style>

      <div
        className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
        style={{ background: "#08080f" }}
      >
        {/* Grid */}
        <GridLines />

        {/* Scan line */}
        <div
          className="absolute inset-x-0 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(79,70,229,0.4), transparent)",
            animation: "scan 8s linear 2s infinite",
            zIndex: 1,
          }}
        />

        {/* Orbs */}
        <Orb size={600} x="-10%" y="-20%" delay={0} duration={7} />
        <Orb size={400} x="60%" y="50%" delay={2} duration={9} />
        <Orb size={300} x="20%" y="60%" delay={1} duration={11} />

        {/* Content */}
        <div
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl mx-auto"
          style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.3s" }}
        >
          {/* Badge */}
          <div
            className="reveal delay-1 inline-flex items-center gap-2 px-4 py-2 rounded-full mb-10 text-xs font-bold uppercase tracking-[0.18em]"
            style={{
              background: "rgba(79,70,229,0.12)",
              border: "1px solid rgba(79,70,229,0.3)",
              color: "#8b84ff",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span
              className="relative w-2 h-2 rounded-full"
              style={{ background: "#4F46E5" }}
            >
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background: "#4F46E5",
                  animation: "pulse-ring 2s ease-out infinite",
                }}
              />
            </span>
            In Development
          </div>

          {/* Headline */}
          <h1
            className="reveal delay-2 text-5xl md:text-7xl font-black leading-[0.95] tracking-tight mb-6"
            style={{
              fontFamily: "'Syne', sans-serif",
              color: "#f0f0ff",
            }}
          >
            Something
            <br />
            <span
              style={{
                background:
                  "linear-gradient(135deg, #8b84ff 0%, #4F46E5 50%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              epic
            </span>{" "}
            is coming.
          </h1>

          {/* Subtext */}
          <p
            className="reveal delay-3 text-base md:text-lg leading-relaxed mb-12 max-w-md"
            style={{
              color: "rgba(180,176,220,0.6)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            We're putting the finishing touches on something you'll love. Drop
            your email and be the first to know.
          </p>

          {/* Countdown */}
          <div className="reveal delay-3 flex items-center gap-3 md:gap-5 mb-12">
            <Digit value={timeLeft.d} label="Days" />
            <span
              className="text-2xl font-black mb-6"
              style={{ color: "rgba(79,70,229,0.4)" }}
            >
              :
            </span>
            <Digit value={timeLeft.h} label="Hours" />
            <span
              className="text-2xl font-black mb-6"
              style={{ color: "rgba(79,70,229,0.4)" }}
            >
              :
            </span>
            <Digit value={timeLeft.m} label="Mins" />
            <span
              className="text-2xl font-black mb-6"
              style={{ color: "rgba(79,70,229,0.4)" }}
            >
              :
            </span>
            <Digit value={timeLeft.s} label="Secs" />
          </div>

          {/* Email form */}
          <div className="reveal delay-4 w-full max-w-md">
            {submitted ? (
              <div
                className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl"
                style={{
                  background: "rgba(79,70,229,0.1)",
                  border: "1px solid rgba(79,70,229,0.25)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M4 10l4.5 4.5L16 6"
                    stroke="#8b84ff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  className="font-semibold text-sm"
                  style={{
                    color: "#8b84ff",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  You're on the list! We'll reach out soon.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-glow flex-1 px-5 py-4 rounded-2xl text-sm font-medium outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#e0e0ff",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
                <button
                  type="submit"
                  className="notify-btn px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-wider text-white whitespace-nowrap"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Notify me
                </button>
              </form>
            )}
          </div>

          {/* Footer note */}
          <p
            className="reveal delay-5 mt-6 text-[11px] uppercase tracking-[0.15em]"
            style={{
              color: "rgba(139,132,255,0.3)",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </>
  );
};

export default ComingSoon;
