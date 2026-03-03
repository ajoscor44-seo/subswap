import { FAQS, WA_LINKS } from "@/constants/data";
import React, { useState } from "react";

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  Legal: { bg: "#f0eef9", color: "#7c5cfc" },
  Reliability: { bg: "#fffbeb", color: "#d97706" },
  Access: { bg: "#f0fdf4", color: "#16a34a" },
  Billing: { bg: "#fef2f2", color: "#ef4444" },
  Trust: { bg: "#f0fdf4", color: "#10b981" },
  Security: { bg: "#f0eef9", color: "#6366f1" },
};

const FaqItem: React.FC<{
  question: string;
  answer: string;
  icon: string;
  tag: string;
  index: number;
}> = ({ question, answer, icon, tag, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tagStyle = TAG_COLORS[tag] ?? { bg: "#f0eef9", color: "#7c5cfc" };

  return (
    <div
      style={{
        background: isOpen ? "#fafafe" : "#fff",
        border: `1.5px solid ${isOpen ? "#d8d0f8" : "#f0eef9"}`,
        borderRadius: 16,
        overflow: "hidden",
        transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
        boxShadow: isOpen ? "0 8px 24px rgba(124,92,252,0.08)" : "none",
        animationDelay: `${index * 60}ms`,
      }}
      className="faq-anim"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "20px 22px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            flexShrink: 0,
            background: isOpen
              ? "linear-gradient(135deg,#7c5cfc,#6366f1)"
              : tagStyle.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s",
            boxShadow: isOpen ? "0 4px 10px rgba(124,92,252,0.3)" : "none",
          }}
        >
          <i
            className={`fa-solid ${icon}`}
            style={{
              fontSize: 14,
              color: isOpen ? "#fff" : tagStyle.color,
              transition: "color 0.2s",
            }}
          />
        </div>

        {/* Question + tag */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 6,
                background: tagStyle.bg,
                color: tagStyle.color,
                fontFamily: "'Syne',sans-serif",
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              {tag}
            </span>
          </div>
          <span
            className="font-display"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: isOpen ? "#7c5cfc" : "#1a1230",
              lineHeight: 1.3,
              transition: "color 0.2s",
            }}
          >
            {question}
          </span>
        </div>

        {/* Toggle */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            flexShrink: 0,
            background: isOpen ? "#7c5cfc" : "#f5f3ff",
            border: `1.5px solid ${isOpen ? "#7c5cfc" : "#ede9fe"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.25s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <i
            className="fa-solid fa-chevron-down"
            style={{ fontSize: 10, color: isOpen ? "#fff" : "#a78bfa" }}
          />
        </div>
      </button>

      {/* Answer */}
      <div
        style={{
          maxHeight: isOpen ? 240 : 0,
          overflow: "hidden",
          transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <p
          style={{
            margin: 0,
            padding: "0 22px 22px 78px",
            fontSize: 13,
            lineHeight: 1.7,
            color: "#9b8fc2",
            fontWeight: 400,
          }}
        >
          {answer}
        </p>
      </div>
    </div>
  );
};

export const Faq: React.FC = () => {
  return (
    <>
      <style>{`
        .faq-root { font-family: 'DM Sans', sans-serif; }
        .faq-root * { box-sizing: border-box; }

        .faq-divider {
          height: 3px; width: 44px; border-radius: 99px;
          background: linear-gradient(90deg,#7c5cfc,#6366f1);
          margin-bottom: 14px;
        }

        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .faq-anim { opacity: 0; animation: fadeUp 0.45s ease forwards; }
      `}</style>

      <section
        className="faq-root"
        style={{
          padding: "80px 0",
          background: "linear-gradient(180deg,#fff 0%,#f8f7ff 100%)",
          borderTop: "1.5px solid #f0eef9",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          {/* ── Header ── */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 32,
              marginBottom: 40,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div className="faq-divider" />
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
                F.A.Q
              </p>
              <h2
                className="font-display"
                style={{
                  margin: "0 0 10px",
                  fontSize: "clamp(26px,3.5vw,40px)",
                  fontWeight: 800,
                  color: "#1a1230",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                }}
              >
                Common Questions
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  color: "#9b8fc2",
                  maxWidth: 400,
                  lineHeight: 1.6,
                }}
              >
                Everything you need to know before you start saving. Still
                unsure? Reach out — we're always here.
              </p>
            </div>

            {/* Contact nudge */}
            <div
              style={{
                padding: "20px 24px",
                borderRadius: 16,
                background: "linear-gradient(135deg,#f5f3ff,#ede9fe)",
                border: "1.5px solid #d8d0f8",
                maxWidth: 280,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "linear-gradient(135deg,#7c5cfc,#6366f1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i
                    className="fa-solid fa-headset"
                    style={{ color: "#fff", fontSize: 15 }}
                  />
                </div>
                <span
                  className="font-display"
                  style={{ fontSize: 13, fontWeight: 700, color: "#1a1230" }}
                >
                  Still have questions?
                </span>
              </div>
              <p
                style={{
                  margin: "0 0 14px",
                  fontSize: 12,
                  color: "#9b8fc2",
                  lineHeight: 1.5,
                }}
              >
                Our support team replies in under 5 minutes.
              </p>
              <div
                onClick={() => window.open(WA_LINKS.chatWithUs, "_blank")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 16px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#7c5cfc,#6366f1)",
                  cursor: "pointer",
                  width: "fit-content",
                  boxShadow: "0 4px 12px rgba(124,92,252,0.28)",
                }}
              >
                <i
                  className="fa-brands fa-whatsapp"
                  style={{ color: "#fff", fontSize: 13 }}
                />
                <span
                  className="font-display"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "#fff",
                  }}
                >
                  Chat with Us
                </span>
              </div>
            </div>
          </div>

          {/* ── Two-column FAQ grid ── */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {FAQS.map((faq, i) => (
              <FaqItem key={i} index={i} {...faq} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
