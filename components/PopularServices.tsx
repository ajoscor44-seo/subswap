import { SERVICES, WA_LINKS } from "@/constants/data";
import React from "react";

export const PopularServices: React.FC = () => {
  return (
    <>
      <style>{`
        .ps-root { font-family: 'DM Sans', sans-serif; }
        .ps-root * { box-sizing: border-box; }

        .ps-card {
          background: #fff;
          border: 1.5px solid #f0eef9;
          border-radius: 20px;
          padding: 28px 16px 22px;
          text-align: center;
          cursor: pointer;
          transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.2s;
          position: relative;
          overflow: hidden;
        }
        .ps-card::before {
          content: '';
          position: absolute; inset: 0;
          opacity: 0;
          transition: opacity 0.3s;
          border-radius: 18px;
        }
        .ps-card:hover {
          transform: translateY(-6px);
          border-color: #d8d0f8;
          box-shadow: 0 20px 40px rgba(124,92,252,0.12);
        }
        .ps-card:hover .ps-logo-wrap { transform: scale(1.1); }
        .ps-card:hover .ps-card-glow { opacity: 1; }

        .ps-card-glow {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 3px; border-radius: 0 0 18px 18px;
          opacity: 0; transition: opacity 0.3s;
        }

        .ps-logo-wrap {
          width: 64px; height: 64px; border-radius: 18px;
          margin: 0 auto 14px;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .ps-logo-wrap img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }

        .ps-name {
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 700;
          color: #1a1230; letter-spacing: -0.01em;
          margin: 0 0 6px;
        }

        .ps-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 8px; border-radius: 99px;
          font-family: 'Syne', sans-serif; font-size: 9px;
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
          background: #f0eef9; color: #a78bfa;
        }

        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .ps-anim { opacity: 0; animation: fadeUp 0.5s ease forwards; }

        /* Section header bar */
        .ps-divider {
          height: 3px; border-radius: 99px;
          background: linear-gradient(90deg, #7c5cfc, #6366f1, transparent);
          width: 48px; margin-bottom: 16px;
        }
      `}</style>

      <section
        className="ps-root"
        style={{
          padding: "80px 0",
          background: "linear-gradient(180deg, #ffffff 0%, #f8f7ff 100%)",
          borderTop: "1.5px solid #f0eef9",
          borderBottom: "1.5px solid #f0eef9",
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
              marginBottom: 48,
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: 440 }}>
              <div className="ps-divider" />
              <p
                className="font-display"
                style={{
                  margin: "0 0 4px",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#a78bfa",
                }}
              >
                What's Available
              </p>
              <h2
                className="font-display"
                style={{
                  margin: "0 0 10px",
                  fontSize: "clamp(24px,3vw,36px)",
                  fontWeight: 800,
                  color: "#1a1230",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                }}
              >
                All Your Favorite <br />
                Services, Cheaper.
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  color: "#9b8fc2",
                  lineHeight: 1.6,
                }}
              >
                From entertainment to productivity — the most popular digital
                services in Nigeria, at a fraction of the price.
              </p>
            </div>

            {/* Right: social proof cluster */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex" }}>
                  {[...Array(5)].map((_, i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/80?u=${i + 50}`}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        border: "3px solid #fff",
                        objectFit: "cover",
                        marginLeft: i > 0 ? -10 : 0,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      }}
                      alt="member"
                    />
                  ))}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#7c5cfc,#6366f1)",
                      border: "3px solid #fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: -10,
                      boxShadow: "0 2px 6px rgba(124,92,252,0.3)",
                    }}
                  >
                    <span
                      className="font-display"
                      style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}
                    >
                      +2k
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", gap: 2, marginBottom: 3 }}>
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
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#1a1230",
                    }}
                  >
                    2,400+ active members
                  </p>
                </div>
              </div>

              {/* Stats pills */}
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { icon: "fa-shield-halved", text: "Verified Sellers" },
                  { icon: "fa-bolt", text: "Instant Access" },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 99,
                      background: "#fff",
                      border: "1.5px solid #f0eef9",
                      fontSize: 11,
                      color: "#9b8fc2",
                    }}
                  >
                    <i
                      className={`fa-solid ${item.icon}`}
                      style={{ color: "#a78bfa", fontSize: 11 }}
                    />
                    <span
                      style={{
                        fontFamily: "'Syne',sans-serif",
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "#9b8fc2",
                      }}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Service cards grid ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: 14,
            }}
          >
            {SERVICES.map((s, i) => (
              <div
                key={i}
                className="ps-card ps-anim"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Coloured bottom glow bar */}
                <div
                  className="ps-card-glow"
                  style={{
                    background: `linear-gradient(90deg, ${s.accent}, transparent)`,
                  }}
                />

                {/* Logo */}
                <div className="ps-logo-wrap" style={{ background: s.light }}>
                  <img
                    src={`https://cdn.brandfetch.io/${s.domain}/w/88/h/88?fallback=transparent`}
                    alt={s.name}
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.style.display = "none";
                      const parent = el.parentElement;
                      if (parent) {
                        const icon = document.createElement("i");
                        icon.className = "fa-solid fa-globe";
                        icon.style.cssText = `font-size:28px;color:${s.accent}`;
                        parent.appendChild(icon);
                      }
                    }}
                  />
                </div>

                {/* Name */}
                <p className="ps-name">{s.name}</p>

                {/* Badge */}
                <span
                  className="ps-badge"
                  style={{ background: s.light, color: s.accent }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: s.accent,
                      display: "inline-block",
                    }}
                  />
                  Available
                </span>
              </div>
            ))}
          </div>

          {/* ── Bottom CTA strip ── */}
          <div
            style={{
              marginTop: 40,
              padding: "20px 28px",
              borderRadius: 18,
              background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
              border: "1.5px solid #d8d0f8",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <p
                className="font-display"
                style={{
                  margin: "0 0 3px",
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#1a1230",
                }}
              >
                Don't see your service?
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "#9b8fc2" }}>
                We're adding new platforms every week based on demand.
              </p>
            </div>
            <div
              onClick={() => window.open(WA_LINKS.serviceRequest, "_blank")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 20px",
                borderRadius: 11,
                background: "linear-gradient(135deg,#7c5cfc,#6366f1)",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(124,92,252,0.3)",
              }}
            >
              <i
                className="fa-solid fa-plus"
                style={{ color: "#fff", fontSize: 11 }}
              />
              <span
                className="font-display"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "#fff",
                }}
              >
                Request a Service
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
