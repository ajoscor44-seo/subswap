import { OUR_FEATURES, STATS, VALUES } from "@/constants/data";
import { useAuth } from "@/providers/auth";
import { useNavigator } from "@/providers/navigator";
import React from "react";

const AboutUs: React.FC = () => {
  const { user, openLoginModal } = useAuth();
  const { goTo } = useNavigator();

  const goToDashboard = () => {
    if (user) {
      goTo("dashboard");
    } else {
      openLoginModal();
    }
  };

  return (
    <>
      <style>{`
        .ab-root { font-family: 'DM Sans', sans-serif; color: #1a1230; }
        .ab-root * { box-sizing: border-box; }

        .ab-card {
          background: #fff; border: 1.5px solid #f0eef9;
          border-radius: 20px; padding: 24px;
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .ab-card:hover {
          box-shadow: 0 16px 40px rgba(124,92,252,0.1);
          transform: translateY(-3px);
        }

        .ab-divider {
          height: 3px; width: 44px; border-radius: 99px;
          background: linear-gradient(90deg,#7c5cfc,#6366f1);
          margin-bottom: 14px;
        }

        .ab-stat-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px; padding: 28px 20px;
          text-align: center;
          transition: background 0.2s;
        }
        .ab-stat-card:hover { background: rgba(255,255,255,0.1); }

        .ab-value-card {
          background: #fff; border: 1.5px solid #f0eef9;
          border-radius: 20px; padding: 22px 20px;
          transition: box-shadow 0.25s, transform 0.25s, border-color 0.2s;
        }
        .ab-value-card:hover {
          box-shadow: 0 12px 32px rgba(124,92,252,0.09);
          transform: translateY(-3px);
          border-color: #d8d0f8;
        }

        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .ab-anim { opacity: 0; animation: fadeUp 0.5s ease forwards; }
      `}</style>

      <div className="ab-root">
        {/* ── Hero ── */}
        <section
          style={{
            background:
              "linear-gradient(145deg, #1a1230 0%, #2d1f6e 50%, #3730a3 100%)",
            padding: "96px 24px 80px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative blobs */}
          <div
            style={{
              position: "absolute",
              top: -80,
              left: -80,
              width: 360,
              height: 360,
              borderRadius: "50%",
              background: "rgba(124,92,252,0.12)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -60,
              right: -60,
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: "rgba(99,102,241,0.1)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              maxWidth: 720,
              margin: "0 auto",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 99,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#a78bfa",
                  display: "inline-block",
                }}
              />
              <span
                className="font-display"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                Our Mission
              </span>
            </div>

            <h1
              className="font-display"
              style={{
                margin: "0 0 20px",
                fontSize: "clamp(24px, 5vw, 56px)",
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
              }}
            >
              Democratizing Premium
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg,#a78bfa,#818cf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                for Every Nigerian.
              </span>
            </h1>

            <p
              style={{
                margin: 0,
                fontSize: 17,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.7,
                maxWidth: 560,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              DiscountZAR was born from a simple observation: digital
              subscriptions are getting more expensive, yet most of us leave
              paid slots completely empty.
            </p>
          </div>
        </section>

        {/* ── Problem / Solution ── */}
        <section style={{ padding: "80px 24px", background: "#fff" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            {/* Left: copy */}
            <div>
              <div className="ab-divider" />
              <p
                className="font-display"
                style={{
                  margin: "0 0 32px",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#a78bfa",
                }}
              >
                Why We Exist
              </p>

              <div style={{ marginBottom: 32 }}>
                <h2
                  className="font-display"
                  style={{
                    margin: "0 0 12px",
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#1a1230",
                    letterSpacing: "-0.02em",
                  }}
                >
                  The Problem
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    color: "#9b8fc2",
                    lineHeight: 1.75,
                  }}
                >
                  Family plans for Netflix, Spotify, and Canva are built for
                  sharing — but finding trustworthy people to share with is a
                  nightmare. Managing payments, credentials, and access is a
                  full-time job nobody signed up for.
                </p>
              </div>

              <div style={{ paddingTop: 28, borderTop: "1.5px solid #f0eef9" }}>
                <h2
                  className="font-display"
                  style={{
                    margin: "0 0 12px",
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#1a1230",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Our Solution
                </h2>
                <p
                  style={{
                    margin: "0 0 24px",
                    fontSize: 15,
                    color: "#9b8fc2",
                    lineHeight: 1.75,
                  }}
                >
                  DiscountZAR is a secure, automated marketplace where
                  subscription owners sell unused slots to verified buyers. We
                  handle payments, credentials, and access — you just enjoy the
                  service.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    "Automated billing",
                    "Secure credentials",
                    "Verified buyers",
                  ].map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 8,
                        background: "#f5f3ff",
                        border: "1px solid #ede9fe",
                        fontFamily: "'Syne',sans-serif",
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "#7c5cfc",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: feature cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {OUR_FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="ab-card ab-anim"
                  style={{
                    animationDelay: `${i * 80}ms`,
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: f.light,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <i
                      className={`fa-solid ${f.icon}`}
                      style={{ color: f.accent, fontSize: 17 }}
                    />
                  </div>
                  <div>
                    <p
                      className="font-display"
                      style={{
                        margin: "0 0 5px",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#1a1230",
                      }}
                    >
                      {f.title}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "#9b8fc2",
                        lineHeight: 1.6,
                      }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats strip ── */}
        <section className="px-4 my-5 md:my-20">
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center max-w-6xl mx-auto relative bg-linear-to-br from-[#1a1230] to-[#3730a3] rounded-2xl p-8 overflow-hidden">
              <div
                style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background: "rgba(124,92,252,0.15)",
                  pointerEvents: "none",
                }}
              />
              {STATS.map((s, i) => (
                <div
                  key={i}
                  className="ab-stat-card"
                  style={{
                    borderRight:
                      i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 11,
                      background: "rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 14px",
                    }}
                  >
                    <i
                      className={`fa-solid ${s.icon}`}
                      style={{ color: "#a78bfa", fontSize: 16 }}
                    />
                  </div>
                  <p
                    className="font-display"
                    style={{
                      margin: "0 0 6px",
                      fontSize: 32,
                      fontWeight: 800,
                      color: "#fff",
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "'Syne',sans-serif",
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Values ── */}
        <section className="px-4 my-32 md:my-20">
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ marginBottom: 40 }}>
              <div className="ab-divider" />
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
                What We Stand For
              </p>
              <h2
                className="font-display"
                style={{
                  margin: 0,
                  fontSize: "clamp(24px,3vw,36px)",
                  fontWeight: 800,
                  color: "#1a1230",
                  letterSpacing: "-0.02em",
                }}
              >
                Our Core Values
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
                gap: 16,
              }}
            >
              {VALUES.map((v, i) => (
                <div
                  key={i}
                  className="ab-value-card ab-anim"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "#f5f3ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <i
                      className={`fa-solid ${v.icon}`}
                      style={{ color: "#7c5cfc", fontSize: 18 }}
                    />
                  </div>
                  <h4
                    className="font-display"
                    style={{
                      margin: "0 0 8px",
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#1a1230",
                    }}
                  >
                    {v.title}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: "#9b8fc2",
                      lineHeight: 1.65,
                    }}
                  >
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="px-4 my-5 md:my-20">
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div
              style={{
                background: "linear-gradient(135deg,#f5f3ff,#ede9fe)",
                border: "1.5px solid #d8d0f8",
                borderRadius: 20,
                padding: "48px 40px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  background: "rgba(124,92,252,0.08)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
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
                  Join the Movement
                </p>
                <h3
                  className="font-display"
                  style={{
                    margin: "0 0 12px",
                    fontSize: "clamp(22px,3vw,32px)",
                    fontWeight: 800,
                    color: "#1a1230",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Start saving today.
                </h3>
                <p
                  style={{
                    margin: "0 0 28px",
                    fontSize: 15,
                    color: "#9b8fc2",
                    maxWidth: 400,
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  Join 12,000+ Nigerians who are already enjoying premium
                  digital services at a fraction of the cost.
                </p>
                <button
                  onClick={goToDashboard}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 28px",
                    borderRadius: 13,
                    border: "none",
                    background: "linear-gradient(135deg,#7c5cfc,#6366f1)",
                    color: "#fff",
                    cursor: "pointer",
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    boxShadow: "0 6px 20px rgba(124,92,252,0.35)",
                  }}
                >
                  <i className="fa-solid fa-bolt" style={{ fontSize: 11 }} />
                  Get Started Free
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutUs;
