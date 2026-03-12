import React from "react";
import Logo from "./Logo";
import { useNavigator } from "@/providers/navigator";
import { SOCIALS } from "@/constants/data";
import { useAuth } from "@/providers/auth";

const Footer: React.FC = () => {
  const { user, openLoginModal } = useAuth();
  const { goTo } = useNavigator();
  const currentYear = new Date().getFullYear();

  const LINKS = {
    Marketplace: [
      { label: "Streaming Services", action: () => goTo("home") },
      { label: "Software & Tools", action: () => goTo("home") },
      { label: "Education", action: () => goTo("home") },
      { label: "Productivity", action: () => goTo("home") },
    ],
    Company: [
      { label: "About Us", action: () => goTo("about") },
      { label: "Contact Support", action: () => goTo("contact") },
      { label: "Terms of Service", action: () => goTo("home") },
      { label: "Privacy Policy", action: () => goTo("home") },
    ],
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
        .ft-root { font-family: 'DM Sans', sans-serif; }
        .ft-root * { box-sizing: border-box; }

        .ft-link {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 500; color: #9b8fc2;
          background: none; border: none; cursor: pointer;
          padding: 0; text-align: left;
          transition: color 0.18s;
        }
        .ft-link:hover { color: #7c5cfc; }
        .ft-link:hover .ft-link-dot { background: #7c5cfc; }

        .ft-link-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: #ede9fe; flex-shrink: 0;
          transition: background 0.18s;
        }

        .ft-social {
          width: 36px; height: 36px; border-radius: 10px;
          border: 1.5px solid #ede9fe; background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 14px; color: #c4b5fd;
          transition: all 0.2s; text-decoration: none;
        }
        .ft-social:hover {
          background: linear-gradient(135deg,#7c5cfc,#6366f1);
          border-color: transparent; color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(124,92,252,0.3);
        }

        .ft-col-label {
          font-family: 'Syne', sans-serif;
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: #1a1230; margin: 0 0 16px;
        }

        .ft-divider {
          height: 3px; width: 32px; border-radius: 99px;
          background: linear-gradient(90deg,#7c5cfc,#6366f1);
          margin-bottom: 12px;
        }
      `}</style>

      <footer
        className="ft-root"
        style={{
          background: "linear-gradient(180deg, #fff 0%, #f8f7ff 100%)",
        }}
      >
        {/* ── Top CTA band ── */}
        <div
          hidden={!!user}
          style={{
            background:
              "linear-gradient(135deg, #1a1230 0%, #2d1f6e 50%, #3730a3 100%)",
            padding: "40px 24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
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
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              flexWrap: "wrap",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div>
              <p
                className="font-display"
                style={{
                  margin: "0 0 4px",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                Ready to start saving?
              </p>
              <h3
                className="font-display"
                style={{
                  margin: 0,
                  fontSize: "clamp(20px,3vw,28px)",
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.02em",
                }}
              >
                Join 2,400+ members saving up to 80%.
              </h3>
            </div>
            <button
              onClick={goToDashboard}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 26px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg,#7c5cfc,#6366f1)",
                color: "#fff",
                cursor: "pointer",
                flexShrink: 0,
                fontFamily: "'Syne',sans-serif",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                boxShadow: "0 4px 16px rgba(124,92,252,0.4)",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(124,92,252,0.5)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(124,92,252,0.4)";
              }}
            >
              <i className="fa-solid fa-bolt" style={{ fontSize: 11 }} />
              Get Started Free
            </button>
          </div>
        </div>

        {/* ── Main footer body ── */}
        <div
          style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 0" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-12 mb-12">
            {/* Brand column */}
            <div className="col-span-2">
              <div className="ft-divider" />
              <div style={{ marginBottom: 16 }}>
                <Logo size={16} />
              </div>
              <p
                style={{
                  margin: "0 0 24px",
                  fontSize: 13,
                  color: "#9b8fc2",
                  lineHeight: 1.7,
                  maxWidth: 280,
                }}
              >
                The most secure and transparent way to share premium digital
                subscriptions in Nigeria. Trusted by thousands.
              </p>

              {/* Socials */}
              <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {SOCIALS.map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ft-social"
                    aria-label={s.label}
                  >
                    <i className={s.icon} />
                  </a>
                ))}
              </div>

              {/* Trust badges */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { icon: "fa-shield-halved", text: "Verified Platform" },
                  { icon: "fa-lock", text: "256-bit SSL" },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "5px 10px",
                      borderRadius: 8,
                      background: "#f5f3ff",
                      border: "1px solid #ede9fe",
                    }}
                  >
                    <i
                      className={`fa-solid ${item.icon}`}
                      style={{ color: "#a78bfa", fontSize: 10 }}
                    />
                    <span
                      style={{
                        fontFamily: "'Syne',sans-serif",
                        fontSize: 9,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        color: "#b8addb",
                      }}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(LINKS).map(([col, links]) => (
              <div key={col}>
                <p className="ft-col-label">{col}</p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {links.map((link, i) => (
                    <button key={i} className="ft-link" onClick={link.action}>
                      <span className="ft-link-dot" />
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Contact column */}
            <div>
              <p className="ft-col-label">Get in Touch</p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {[
                  { icon: "fa-envelope", text: "support@wsv.com.ng" },
                  { icon: "fa-headset", text: "24/7 Live Chat" },
                  { icon: "fa-location-dot", text: "Lagos, Nigeria" },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 9 }}
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
                        flexShrink: 0,
                      }}
                    >
                      <i
                        className={`fa-solid ${item.icon}`}
                        style={{ color: "#a78bfa", fontSize: 11 }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#9b8fc2",
                        fontWeight: 400,
                        lineHeight: 1.3,
                      }}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div
            style={{
              padding: "20px 0",
              borderTop: "1.5px solid #f0eef9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontFamily: "'Syne',sans-serif",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#c4b5fd",
              }}
            >
              © {currentYear} Gigsflix Digitals. All rights reserved.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/79/Flag_of_Nigeria.svg"
                style={{ height: 14, borderRadius: 3 }}
                alt="Nigeria"
              />
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#c4b5fd",
                }}
              >
                Made in Nigeria
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
