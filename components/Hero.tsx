import { useAuth } from "@/providers/auth";
import { useNavigator } from "@/providers/navigator";
import React, { useEffect, useState } from "react";

const PARTNER_DOMAINS = [
  { domain: "netflix.com", label: "Netflix" },
  { domain: "spotify.com", label: "Spotify" },
  { domain: "apple.com", label: "Apple TV" },
  { domain: "youtube.com", label: "YouTube" },
  { domain: "amazon.com", label: "Prime" },
  { domain: "canva.com", label: "Canva" },
  { domain: "chatgpt.com", label: "ChatGPT" },
  { domain: "duolingo.com", label: "Duolingo" },
];

const STATS = [
  { value: "4,000+", label: "Active Slots" },
  { value: "80%", label: "Avg. Savings" },
  { value: "2.4k+", label: "Members" },
  { value: "₦0", label: "Hidden Fees" },
];

export const Hero: React.FC = () => {
  const { openLoginModal, user } = useAuth();
  const { goTo, changeTab } = useNavigator();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const goToExplore = () => {
    if (user) {
      goTo("dashboard");
      changeTab("explore");
    } else {
      openLoginModal();
    }
  };

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
        .hero-root { font-family: 'DM Sans', sans-serif; }
        .hero-root * { box-sizing: border-box; }

        /* ── Entrance animations ── */
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-animate {
          opacity: 0;
          animation: heroFadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .hero-animate.d1 { animation-delay: 0.05s; }
        .hero-animate.d2 { animation-delay: 0.15s; }
        .hero-animate.d3 { animation-delay: 0.25s; }
        .hero-animate.d4 { animation-delay: 0.38s; }
        .hero-animate.d5 { animation-delay: 0.50s; }

        /* ── Badge pulse ── */
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .hero-ping {
          animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        /* ── CTA primary ── */
        .hero-cta-primary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 32px; border-radius: 14px; border: none;
          background: linear-gradient(135deg, #1a1230 0%, #2d1f6e 100%);
          color: #fff; cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.07em;
          box-shadow: 0 8px 24px rgba(26,18,48,0.28);
          transition: all 0.25s;
        }
        .hero-cta-primary:hover {
          background: linear-gradient(135deg, #7c5cfc 0%, #6366f1 100%);
          box-shadow: 0 12px 32px rgba(124,92,252,0.4);
          transform: translateY(-2px);
        }
        .hero-cta-primary:active { transform: scale(0.97); }
        .hero-cta-primary svg { transition: transform 0.2s; }
        .hero-cta-primary:hover svg { transform: translateX(4px); }

        /* ── CTA secondary ── */
        .hero-cta-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 16px 28px; border-radius: 14px;
          border: 1.5px solid #ede9fe; background: #fff;
          color: #7c5cfc; cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.07em;
          transition: all 0.2s;
        }
        .hero-cta-secondary:hover {
          background: #f5f3ff;
          border-color: #c4b5fd;
          transform: translateY(-2px);
        }

        /* ── Stat cards ── */
        .hero-stat {
          background: #fff;
          border: 1.5px solid #f0eef9;
          border-radius: 16px;
          padding: 18px 22px;
          text-align: center;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .hero-stat:hover {
          box-shadow: 0 8px 24px rgba(124,92,252,0.1);
          transform: translateY(-3px);
        }

        /* ── Service logos ── */
        .hero-logo-pill {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 14px 16px; border-radius: 16px;
          background: #fff; border: 1.5px solid #f0eef9;
          cursor: default;
          transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
        }
        .hero-logo-pill:hover {
          box-shadow: 0 8px 20px rgba(124,92,252,0.12);
          transform: translateY(-4px);
          border-color: #d8d0f8;
        }
        .hero-logo-pill img {
          width: 44px; height: 44px; object-fit: contain;
          border-radius: 10px;
          transition: transform 0.2s;
        }
        .hero-logo-pill:hover img { transform: scale(1.08); }

        /* ── Marquee ── */
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .hero-marquee-track {
          display: flex; gap: 14px;
          animation: marquee 22s linear infinite;
          width: max-content;
        }
        .hero-marquee-track:hover { animation-play-state: paused; }

        /* ── Savings pill ── */
        .hero-savings-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 99px;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          font-family: 'Syne', sans-serif; font-size: 11px;
          font-weight: 700; color: #16a34a;
          text-transform: uppercase; letter-spacing: 0.06em;
        }

        /* ── Noise overlay ── */
        .hero-noise {
          position: absolute; inset: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          opacity: 0.4;
        }

        /* Avatar cluster */
        .hero-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          object-fit: cover;
        }
      `}</style>

      <section
        className="hero-root"
        style={{
          background: "linear-gradient(180deg, #f8f7ff 0%, #ffffff 60%)",
          overflow: "hidden",
          position: "relative",
          paddingTop: 80,
          paddingBottom: 80,
        }}
      >
        {/* ── Background blobs ── */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -120,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,92,252,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div className="hero-noise" />

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* ── Badge + headline ── */}
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            {/* Live badge */}
            <div
              className={`hero-animate d1 ${mounted ? "" : ""}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 16px",
                borderRadius: 99,
                background: "#fff",
                border: "1.5px solid #ede9fe",
                boxShadow: "0 2px 12px rgba(124,92,252,0.1)",
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  position: "relative",
                  display: "inline-flex",
                  width: 8,
                  height: 8,
                }}
              >
                <span
                  className="hero-ping"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "#7c5cfc",
                    opacity: 0.5,
                  }}
                />
                <span
                  style={{
                    position: "relative",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#7c5cfc",
                    display: "inline-block",
                  }}
                />
              </span>
              <span
                className="font-display"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#7c5cfc",
                }}
              >
                Live · 4,000+ Active Slots in Nigeria
              </span>
            </div>

            {/* Headline */}
            <h1
              className={`hero-animate d2 font-display`}
              style={{
                margin: "0 0 20px",
                fontSize: "clamp(40px, 6vw, 72px)",
                fontWeight: 800,
                color: "#1a1230",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              The Smartest Way to
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #7c5cfc 0%, #6366f1 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Enjoy Premium.
              </span>
            </h1>

            {/* Subheading */}
            <p
              className={`hero-animate d3`}
              style={{
                maxWidth: 520,
                margin: "0 auto 32px",
                fontSize: 17,
                lineHeight: 1.6,
                color: "#9b8fc2",
                fontWeight: 400,
              }}
            >
              Join verified shared plans or list your own. Save up to{" "}
              <strong style={{ color: "#16a34a", fontWeight: 700 }}>80%</strong>{" "}
              on Netflix, Spotify, Canva and more.
            </p>

            {/* CTAs */}
            <div
              className={`hero-animate d4`}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                marginBottom: 40,
              }}
            >
              <button className="hero-cta-primary" onClick={goToDashboard}>
                Start Saving Now
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
              <button className="hero-cta-secondary" onClick={goToExplore}>
                <i className="fa-solid fa-compass" style={{ fontSize: 12 }} />
                Explore Plans
              </button>
            </div>

            {/* Social proof */}
            <div
              className={`hero-animate d5`}
              style={{ display: "inline-flex", alignItems: "center", gap: 12 }}
            >
              <div style={{ display: "flex" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <img
                    key={i}
                    className="hero-avatar"
                    src={`https://i.pravatar.cc/80?u=${i + 20}`}
                    alt="Member"
                    style={{ marginLeft: i > 1 ? -10 : 0 }}
                  />
                ))}
              </div>
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    marginBottom: 2,
                  }}
                >
                  {[1, 2, 3, 4, 5].map((s) => (
                    <i
                      key={s}
                      className="fa-solid fa-star"
                      style={{ color: "#f59e0b", fontSize: 10 }}
                    />
                  ))}
                </div>
                <p
                  className="font-display"
                  style={{
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#1a1230",
                  }}
                >
                  Trusted by 2,400+ members
                </p>
              </div>
            </div>
          </div>

          {/* ── Stats row ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 14,
              marginBottom: 64,
            }}
          >
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="hero-stat hero-animate"
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                <p
                  className="font-display"
                  style={{
                    margin: "0 0 4px",
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#1a1230",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "#b8addb",
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* ── Services marquee ── */}
          <div>
            <p
              className="font-display"
              style={{
                textAlign: "center",
                margin: "0 0 24px",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "#c4b5fd",
              }}
            >
              Available Subscriptions
            </p>

            {/* Fade edge masks */}
            <div style={{ position: "relative", overflow: "hidden" }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 80,
                  background: "linear-gradient(90deg, #f8f7ff, transparent)",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 80,
                  background: "linear-gradient(270deg, #f8f7ff, transparent)",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />

              <div style={{ overflow: "hidden" }}>
                <div className="hero-marquee-track">
                  {/* Double the array for seamless loop */}
                  {[...PARTNER_DOMAINS, ...PARTNER_DOMAINS].map((p, i) => (
                    <div key={i} className="hero-logo-pill">
                      <img
                        src={`https://cdn.brandfetch.io/${p.domain}/w/88/h/88?fallback=transparent`}
                        alt={p.label}
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: "'Syne',sans-serif",
                          fontWeight: 700,
                          color: "#9b8fc2",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom trust strip ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              marginTop: 48,
              flexWrap: "wrap",
            }}
          >
            {[
              { icon: "fa-shield-halved", text: "Verified Sellers Only" },
              { icon: "fa-lock", text: "Secure Payments via Flutterwave" },
              { icon: "fa-rotate-left", text: "Easy Cancellation" },
            ].map((item, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 7 }}
              >
                <i
                  className={`fa-solid ${item.icon}`}
                  style={{ color: "#a78bfa", fontSize: 13 }}
                />
                <span
                  style={{ fontSize: 12, color: "#9b8fc2", fontWeight: 500 }}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
