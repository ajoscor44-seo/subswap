import { FEATURES } from "@/constants/data";
import React from "react";

export const Features: React.FC = () => {
  return (
    <>
      <style>{`
        .ft-root { font-family: 'DM Sans', sans-serif; }
        .ft-root * { box-sizing: border-box; }

        .ft-card {
          background: #fff;
          border: 1.5px solid #f0eef9;
          border-radius: 20px;
          padding: 28px 24px;
          position: relative; overflow: hidden;
          transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.2s;
        }
        .ft-card:hover {
          box-shadow: 0 20px 48px rgba(124,92,252,0.11);
          transform: translateY(-5px);
          border-color: #d8d0f8;
        }
        .ft-card:hover .ft-icon-wrap { transform: scale(1.08) rotate(-4deg); }
        .ft-card:hover .ft-corner-glow { opacity: 1; }

        /* Decorative corner blob */
        .ft-corner-glow {
          position: absolute; top: -30px; right: -30px;
          width: 100px; height: 100px; border-radius: 50%;
          opacity: 0; transition: opacity 0.4s;
          pointer-events: none;
        }

        .ft-icon-wrap {
          width: 56px; height: 56px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 20px;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }

        .ft-stat-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 8px;
          font-family: 'Syne', sans-serif; font-size: 10px;
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em;
          margin-bottom: 14px;
        }

        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .ft-anim { opacity: 0; animation: fadeUp 0.5s ease forwards; }

        .ft-divider {
          height: 3px; width: 44px; border-radius: 99px;
          background: linear-gradient(90deg,#7c5cfc,#6366f1);
          margin-bottom: 14px;
        }

        /* Wide proof strip */
        .ft-strip {
          display: flex; align-items: center; justify-content: center;
          gap: 0; margin-top: 48px;
          background: linear-gradient(135deg, #1a1230, #2d1f6e);
          border-radius: 20px; overflow: hidden;
          position: relative;
        }
        .ft-strip::before {
          content: '';
          position: absolute; top: -60px; right: -60px;
          width: 220px; height: 220px; border-radius: 50%;
          background: rgba(124,92,252,0.15); pointer-events: none;
        }
        .ft-strip-item {
          flex: 1; padding: 28px 20px; text-align: center;
          border-right: 1px solid rgba(255,255,255,0.07);
          position: relative; z-index: 1;
        }
        .ft-strip-item:last-child { border-right: none; }
      `}</style>

      <section
        className="ft-root"
        style={{ padding: "80px 0", background: "#fff" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          {/* ── Header ── */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 32,
              marginBottom: 48,
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: 480 }}>
              <div className="ft-divider" />
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
                Why DiscountZAR?
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
                Built for secure, <br />
                effortless sharing.
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  color: "#9b8fc2",
                  lineHeight: 1.6,
                  maxWidth: 400,
                }}
              >
                Every feature is designed to make shared subscriptions as safe
                and seamless as buying your own.
              </p>
            </div>

            {/* Right: quick trust badges */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "fa-circle-check", text: "No hidden fees ever" },
                { icon: "fa-circle-check", text: "Cancel anytime, instantly" },
                {
                  icon: "fa-circle-check",
                  text: "Real credentials, guaranteed",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <i
                    className={`fa-solid ${item.icon}`}
                    style={{ color: "#10b981", fontSize: 14 }}
                  />
                  <span
                    style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Feature cards ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))",
              gap: 16,
            }}
          >
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="ft-card ft-anim"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Corner glow */}
                <div
                  className="ft-corner-glow"
                  style={{
                    background: `radial-gradient(circle, ${f.accent}22, transparent 70%)`,
                  }}
                />

                {/* Icon */}
                <div className="ft-icon-wrap" style={{ background: f.light }}>
                  <i
                    className={`fa-solid ${f.icon}`}
                    style={{ color: f.accent }}
                  />
                </div>

                {/* Stat badge */}
                <div
                  className="ft-stat-badge"
                  style={{ background: f.light, color: f.accent }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: f.accent,
                      display: "inline-block",
                    }}
                  />
                  {f.stat}
                </div>

                <h4
                  className="font-display"
                  style={{
                    margin: "0 0 8px",
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#1a1230",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {f.title}
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "#9b8fc2",
                    lineHeight: 1.65,
                  }}
                >
                  {f.desc}
                </p>

                {/* Bottom accent line */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    borderRadius: "0 0 18px 18px",
                    background: `linear-gradient(90deg, ${f.accent}, transparent)`,
                    opacity: 0.35,
                  }}
                />
              </div>
            ))}
          </div>

          {/* ── Social proof strip ── */}
          <div className="ft-strip">
            {[
              { value: "4,000+", label: "Active Slots" },
              { value: "₦0", label: "Hidden Fees" },
              { value: "80%", label: "Average Savings" },
              { value: "< 10s", label: "Access Delivery" },
              { value: "2,400+", label: "Happy Members" },
            ].map((item, i) => (
              <div key={i} className="ft-strip-item">
                <p
                  className="font-display"
                  style={{
                    margin: "0 0 4px",
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {item.value}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.09em",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
