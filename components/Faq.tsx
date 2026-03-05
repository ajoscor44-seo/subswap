import { FAQS, WA_LINKS } from "@/constants/data";
import React, { useState } from "react";

const TAG_COLORS: Record<string, string> = {
  Legal: "bg-[#f0eef9] text-[#7c5cfc]",
  Reliability: "bg-amber-50 text-amber-600",
  Access: "bg-emerald-50 text-emerald-600",
  Billing: "bg-red-50 text-red-500",
  Trust: "bg-emerald-50 text-emerald-600",
  Security: "bg-indigo-50 text-indigo-500",
};

const TAG_ICON_STYLES: Record<
  string,
  { closedColor: string; closedBg: string }
> = {
  Legal: { closedColor: "#7c5cfc", closedBg: "#f0eef9" },
  Reliability: { closedColor: "#d97706", closedBg: "#fffbeb" },
  Access: { closedColor: "#16a34a", closedBg: "#f0fdf4" },
  Billing: { closedColor: "#ef4444", closedBg: "#fef2f2" },
  Trust: { closedColor: "#10b981", closedBg: "#f0fdf4" },
  Security: { closedColor: "#6366f1", closedBg: "#eef2ff" },
};

const FaqItem: React.FC<{
  question: string;
  answer: string;
  icon: string;
  tag: string;
  index: number;
}> = ({ question, answer, icon, tag, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tagCls = TAG_COLORS[tag] ?? "bg-[#f0eef9] text-[#7c5cfc]";
  const iconMeta = TAG_ICON_STYLES[tag] ?? TAG_ICON_STYLES["Legal"];

  return (
    <div
      className={[
        "rounded-2xl overflow-hidden transition-all duration-200 faq-item",
        isOpen
          ? "bg-[#fafafe] border-[1.5px] border-[#d8d0f8] shadow-[0_8px_24px_rgba(124,92,252,0.08)]"
          : "bg-white border-[1.5px] border-[#f0eef9]",
      ].join(" ")}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 px-5 py-5 text-left bg-transparent border-0 cursor-pointer"
      >
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
          style={{
            background: isOpen
              ? "linear-gradient(135deg,#7c5cfc,#6366f1)"
              : iconMeta.closedBg,
            boxShadow: isOpen ? "0 4px 10px rgba(124,92,252,0.3)" : "none",
          }}
        >
          <i
            className={`fa-solid ${icon} text-sm`}
            style={{
              color: isOpen ? "#fff" : iconMeta.closedColor,
              transition: "color 0.2s",
            }}
          />
        </div>

        {/* Question + tag */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-md font-[Syne] text-[9px] font-bold uppercase tracking-[0.07em] ${tagCls}`}
            >
              {tag}
            </span>
          </div>
          <span
            className="font-display text-sm font-bold leading-snug transition-colors duration-200"
            style={{ color: isOpen ? "#7c5cfc" : "#1a1230" }}
          >
            {question}
          </span>
        </div>

        {/* Chevron */}
        <div
          className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0 transition-all duration-200"
          style={{
            background: isOpen ? "#7c5cfc" : "#f5f3ff",
            border: `1.5px solid ${isOpen ? "#7c5cfc" : "#ede9fe"}`,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <i
            className="fa-solid fa-chevron-down text-[10px]"
            style={{ color: isOpen ? "#fff" : "#a78bfa" }}
          />
        </div>
      </button>

      {/* Answer */}
      <div
        className="overflow-hidden transition-[max-height] duration-400 ease-in-out"
        style={{ maxHeight: isOpen ? 240 : 0 }}
      >
        <p className="m-0 pb-5 pr-5 pl-19.5 text-[13px] leading-[1.7] text-[#9b8fc2] font-normal">
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
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .faq-item { opacity: 0; animation: fadeUp 0.45s ease forwards; }
      `}</style>

      <section
        className="faq-root py-20 border-t border-[#f0eef9]"
        style={{ background: "linear-gradient(180deg,#fff 0%,#f8f7ff 100%)" }}
      >
        <div className="max-w-300 mx-auto px-6">
          {/* ── Header ── */}
          <div className="flex items-end justify-between gap-8 mb-10 flex-wrap">
            {/* Copy */}
            <div>
              <div className="faq-divider" />
              <p className="font-display m-0 mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#a78bfa]">
                F.A.Q
              </p>
              <h2
                className="font-display m-0 mb-2.5 font-extrabold text-[#1a1230] leading-[1.15] tracking-[-0.02em]"
                style={{ fontSize: "clamp(26px,3.5vw,40px)" }}
              >
                Common Questions
              </h2>
              <p className="m-0 text-[15px] text-[#9b8fc2] max-w-100 leading-[1.6]">
                Everything you need to know before you start saving. Still
                unsure? Reach out — we're always here.
              </p>
            </div>

            {/* Support nudge */}
            <div
              className="p-5 rounded-2xl border-[1.5px] border-[#d8d0f8] w-full sm:max-w-70"
              style={{ background: "linear-gradient(135deg,#f5f3ff,#ede9fe)" }}
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#7c5cfc,#6366f1)",
                  }}
                >
                  <i className="fa-solid fa-headset text-white text-[15px]" />
                </div>
                <span className="font-display text-[13px] font-bold text-[#1a1230]">
                  Still have questions?
                </span>
              </div>
              <p className="m-0 mb-3.5 text-xs text-[#9b8fc2] leading-normal">
                Our support team replies in under 5 minutes.
              </p>
              <button
                onClick={() => window.open(WA_LINKS.chatWithUs, "_blank")}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] border-0 cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(124,92,252,0.4)] active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg,#7c5cfc,#6366f1)",
                  boxShadow: "0 4px 12px rgba(124,92,252,0.28)",
                }}
              >
                <i className="fa-brands fa-whatsapp text-white text-[13px]" />
                <span className="font-display text-[11px] font-bold uppercase tracking-[0.07em] text-white">
                  Chat with Us
                </span>
              </button>
            </div>
          </div>

          {/* ── Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FAQS.map((faq, i) => (
              <FaqItem key={i} index={i} {...faq} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
