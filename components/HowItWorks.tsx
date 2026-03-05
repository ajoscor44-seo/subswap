import { STEPS } from "@/constants/data";
import { Step } from "@/constants/types";
import React, { useEffect, useRef, useState } from "react";

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
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(36px)",
        transition: `opacity 0.6s ease ${index * 0.14}s, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${index * 0.14}s`,
        position: "relative",
      }}
    >
      {/* Connector arrow between cards */}
      {index < STEPS.length - 1 && (
        <div
          style={{
            position: "absolute",
            top: 36,
            right: -20,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div className="w-8 h-8 rounded-full bg-white border-[1.5px] border-[#ede9fe] flex items-center justify-center shadow-[0_2px_8px_rgba(124,92,252,0.1)]">
            <span className="inline-flex md:hidden items-center gap-1">
              <i className="fa-solid fa-arrow-down text-[#c4b5fd] text-sm" />
            </span>
            <span className="hidden md:inline-flex items-center gap-1">
              <i className="fa-solid fa-arrow-right hidden md:inline text-[#c4b5fd] text-sm" />
            </span>
          </div>
        </div>
      )}

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? "#fafafe" : "#fff",
          border: `1.5px solid ${hovered ? "#d8d0f8" : "#f0eef9"}`,
          borderRadius: 20,
          padding: "28px 24px 24px",
          position: "relative",
          overflow: "hidden",
          cursor: "default",
          height: "100%",
          transition: "all 0.3s ease",
          boxShadow: hovered ? `0 20px 48px rgba(124,92,252,0.11)` : "none",
        }}
      >
        {/* Corner glow */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${step.accent}14, transparent 70%)`,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s",
            pointerEvents: "none",
          }}
        />

        {/* Step number watermark */}
        <div
          className="font-display"
          style={{
            position: "absolute",
            top: 16,
            right: 20,
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1,
            color: hovered ? `${step.accent}14` : "#f5f3ff",
            transition: "color 0.3s",
            pointerEvents: "none",
            letterSpacing: "-0.04em",
          }}
        >
          {step.number}
        </div>

        {/* Icon */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 15,
            marginBottom: 20,
            background: hovered
              ? `linear-gradient(135deg, ${step.accent}, ${step.accent}cc)`
              : step.light,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            transform: hovered
              ? "scale(1.08) rotate(-4deg)"
              : "scale(1) rotate(0)",
            boxShadow: hovered ? `0 8px 20px ${step.accent}30` : "none",
            position: "relative",
            zIndex: 1,
          }}
        >
          <i
            className={`fa-solid ${step.icon}`}
            style={{
              fontSize: 20,
              color: hovered ? "#fff" : step.accent,
              transition: "color 0.2s",
            }}
          />
        </div>

        {/* Text */}
        <h4
          className="font-display"
          style={{
            margin: "0 0 10px",
            fontSize: 16,
            fontWeight: 800,
            color: "#1a1230",
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            position: "relative",
            zIndex: 1,
          }}
        >
          {step.title}
        </h4>
        <p
          style={{
            margin: "0 0 20px",
            fontSize: 13,
            color: "#9b8fc2",
            lineHeight: 1.7,
            position: "relative",
            zIndex: 1,
          }}
        >
          {step.description}
        </p>

        {/* Detail badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 11px",
            borderRadius: 8,
            background: hovered ? step.light : "#fafafe",
            border: `1px solid ${hovered ? step.accent + "30" : "#f0eef9"}`,
            transition: "all 0.2s",
            position: "relative",
            zIndex: 1,
          }}
        >
          <i
            className={`fa-solid ${step.detailIcon}`}
            style={{ fontSize: 10, color: step.accent }}
          />
          <span
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: hovered ? step.accent : "#b8addb",
              transition: "color 0.2s",
            }}
          >
            {step.detail}
          </span>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            borderRadius: "0 0 18px 18px",
            background: `linear-gradient(90deg, ${step.accent}, transparent)`,
            opacity: hovered ? 0.5 : 0.15,
            transition: "opacity 0.3s",
          }}
        />
      </div>
    </div>
  );
};

export const HowItWorks: React.FC = () => {
  const { ref, inView } = useInView();
  const { ref: headerRef, inView: headerInView } = useInView(0.4);

  return (
    <>
      <style>{`
        .hiw-root { font-family: 'DM Sans', sans-serif; }
        .hiw-root * { box-sizing: border-box; }
        .hiw-divider {
          height: 3px; width: 44px; border-radius: 99px;
          background: linear-gradient(90deg,#7c5cfc,#6366f1);
          margin-bottom: 14px;
        }
      `}</style>

      <section
        className="hiw-root"
        id="how-it-works"
        style={{
          padding: "80px 0",
          background: "linear-gradient(180deg, #f8f7ff 0%, #fff 100%)",
          borderTop: "1.5px solid #f0eef9",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Background blobs */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(124,92,252,0.06),transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(16,185,129,0.05),transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* ── Header ── */}
          <div
            ref={headerRef}
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 32,
              marginBottom: 48,
              flexWrap: "wrap",
              opacity: headerInView ? 1 : 0,
              transform: headerInView ? "translateY(0)" : "translateY(20px)",
              transition:
                "opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <div style={{ maxWidth: 460 }}>
              <div className="hiw-divider" />
              <p
                className="font-display"
                style={{
                  margin: "0 0 6px",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#a78bfa",
                }}
              >
                How it Works
              </p>
              <h2
                className="font-display"
                style={{
                  margin: "0 0 12px",
                  fontSize: "clamp(26px,3.5vw,40px)",
                  fontWeight: 800,
                  color: "#1a1230",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                }}
              >
                Offer a subscription <br />
                <span
                  style={{
                    background: "linear-gradient(135deg,#7c5cfc,#6366f1)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  in minutes.
                </span>
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  color: "#9b8fc2",
                  lineHeight: 1.6,
                }}
              >
                Turn your extra subscription slots into passive income.
                DiscountZAR handles billing, access delivery, and buyer trust
                automatically.
              </p>
            </div>

            {/* Right: CTA nudge */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {[
                { icon: "fa-bolt", text: "List in under 2 minutes" },
                { icon: "fa-naira-sign", text: "Instant Naira settlements" },
                { icon: "fa-shield-halved", text: "Buyer protection included" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "#f5f3ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i
                      className={`fa-solid ${item.icon}`}
                      style={{ color: "#7c5cfc", fontSize: 11 }}
                    />
                  </div>
                  <span
                    style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Steps ── */}
          <div
            ref={ref}
            className="flex flex-col md:grid md:grid-cols-3 gap-8 relative"
          >
            {STEPS.map((step, i) => (
              <StepCard
                key={step.number}
                step={step}
                index={i}
                inView={inView}
              />
            ))}
          </div>

          {/* ── Footer strip ── */}
          <div
            style={{
              marginTop: 48,
              padding: "20px 28px",
              borderRadius: 18,
              background: "linear-gradient(135deg,#1a1230,#2d1f6e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 20,
              position: "relative",
              overflow: "hidden",
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s",
            }}
          >
            {/* Decorative blob */}
            <div
              style={{
                position: "absolute",
                right: -40,
                top: -40,
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: "rgba(124,92,252,0.15)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                position: "relative",
                zIndex: 1,
              }}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/79/Flag_of_Nigeria.svg"
                style={{ height: 20, borderRadius: 4 }}
                alt="Nigeria"
              />
              <div>
                <p
                  className="font-display"
                  style={{
                    margin: "0 0 2px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  Built for Nigerians
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Naira pricing · Local support · NGN settlements
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                position: "relative",
                zIndex: 1,
              }}
            >
              {[
                { icon: "fa-naira-sign", text: "Naira Settlements" },
                { icon: "fa-headset", text: "Local Support" },
                { icon: "fa-lock", text: "Secure & Private" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 9,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <i
                    className={`fa-solid ${item.icon}`}
                    style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  />
                  <span
                    style={{
                      fontFamily: "'Syne',sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      color: "rgba(255,255,255,0.55)",
                    }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
