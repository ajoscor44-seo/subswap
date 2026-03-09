import React, { useState } from "react";
import Footer from "./Footer";

const WA_NUMBER = "2347053428345";

const WA_LINKS = {
  contactSupport: `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    "Hi DiscountZAR Support 👋\n\nI need help with an issue on my account.\n\nIssue: \nMy username: \n\nPlease assist at your earliest convenience. Thank you!",
  )}`,
  chatWithUs: `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    "Hey DiscountZAR 👋\n\nI have a quick question about your platform. Can someone assist me?",
  )}`,
};

const CONTACT_METHODS = [
  {
    label: "Email Support",
    value: "support@wsv.com.ng",
    sub: "We reply within 2 hours",
    icon: "fa-solid fa-envelope",
    accent: "#7c5cfc",
    light: "#f5f3ff",
    href: "mailto:support@wsv.com.ng",
  },
  {
    label: "WhatsApp Chat",
    value: "+234 705 342 8345",
    sub: "Available 24/7",
    icon: "fa-brands fa-whatsapp",
    accent: "#10b981",
    light: "#f0fdf4",
    href: WA_LINKS.chatWithUs,
  },
  {
    label: "Main Office",
    value: "Lekki Phase 1, Lagos",
    sub: "Nigeria",
    icon: "fa-solid fa-location-dot",
    accent: "#f59e0b",
    light: "#fffbeb",
    href: "https://maps.google.com/?q=Lekki+Phase+1+Lagos",
  },
];

const QUICK_LINKS = [
  {
    label: "Contact Support",
    href: WA_LINKS.contactSupport,
    icon: "fa-headset",
    desc: "Account or access issues",
  },
  {
    label: "Chat With Us",
    href: WA_LINKS.chatWithUs,
    icon: "fa-brands fa-whatsapp",
    desc: "General questions",
  },
];

const ContactUs: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputStyle = (name: string): React.CSSProperties => ({
    width: "100%",
    padding: "13px 16px",
    background: "#fff",
    border: `1.5px solid ${focused === name ? "#7c5cfc" : "#ede9fe"}`,
    borderRadius: 12,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 400,
    color: "#1a1230",
    outline: "none",
    boxShadow: focused === name ? "0 0 0 4px rgba(124,92,252,0.08)" : "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    appearance: "none" as any,
  });

  return (
    <>
      <style>{`
        .ct-root { font-family: 'DM Sans', sans-serif; color: #1a1230; }
        .ct-root * { box-sizing: border-box; }

        .ct-divider {
          height: 3px; width: 44px; border-radius: 99px;
          background: linear-gradient(90deg,#7c5cfc,#6366f1);
          margin-bottom: 14px;
        }

        .ct-method {
          display: flex; align-items: center; gap: 16px;
          padding: 18px 20px; border-radius: 16px;
          background: #fff; border: 1.5px solid #f0eef9;
          text-decoration: none; color: inherit;
          transition: all 0.2s;
        }
        .ct-method:hover {
          border-color: #d8d0f8;
          box-shadow: 0 8px 24px rgba(124,92,252,0.1);
          transform: translateY(-2px);
        }

        .ct-quick-btn {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 18px; border-radius: 14px;
          background: #fff; border: 1.5px solid #f0eef9;
          text-decoration: none; color: inherit;
          transition: all 0.2s; flex: 1;
        }
        .ct-quick-btn:hover {
          border-color: #d8d0f8;
          box-shadow: 0 6px 18px rgba(124,92,252,0.1);
          transform: translateY(-2px);
        }

        .ct-label {
          display: block; margin-bottom: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.09em;
          color: #b8addb;
        }

        .ct-submit {
          width: 100%; padding: 14px;
          border-radius: 13px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #1a1230, #2d1f6e);
          color: #fff; font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          box-shadow: 0 4px 16px rgba(26,18,48,0.2);
          transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .ct-submit:hover {
          background: linear-gradient(135deg, #7c5cfc, #6366f1);
          box-shadow: 0 8px 24px rgba(124,92,252,0.35);
          transform: translateY(-1px);
        }
        .ct-submit:active { transform: scale(0.98); }

        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .ct-anim   { opacity:0; animation: fadeUp 0.45s ease forwards; }
        .ct-anim-2 { opacity:0; animation: fadeUp 0.45s 0.07s ease forwards; }
        .ct-anim-3 { opacity:0; animation: fadeUp 0.45s 0.14s ease forwards; }

        @keyframes checkIn { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
        .ct-check { animation: checkIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>

      <div
        className="ct-root"
        style={{ background: "linear-gradient(180deg,#f8f7ff 0%,#fff 30%)" }}
      >
        {/* ── Hero band ── */}
        <div
          style={{
            background:
              "linear-gradient(135deg,#1a1230 0%,#2d1f6e 55%,#3730a3 100%)",
            padding: "72px 24px 64px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -60,
              left: -60,
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: "rgba(124,92,252,0.12)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -40,
              right: -40,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "rgba(99,102,241,0.1)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              maxWidth: 560,
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
                marginBottom: 20,
              }}
            >
              <i
                className="fa-solid fa-headset"
                style={{ color: "#a78bfa", fontSize: 11 }}
              />
              <span
                className="font-display"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                We're here 24/7
              </span>
            </div>
            <h1
              className="font-display"
              style={{
                margin: "0 0 16px",
                fontSize: "clamp(28px,5vw,48px)",
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              Get in Touch
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 16,
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.7,
              }}
            >
              Questions about sharing? Access issues? Payment help?
              <br />
              Our team typically replies in under 2 hours.
            </p>
          </div>
        </div>

        {/* ── Main content ── */}
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "56px 24px 80px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.1fr",
              gap: 40,
              alignItems: "start",
            }}
          >
            {/* ── LEFT: contact info ── */}
            <div>
              {/* Contact methods */}
              <div className="ct-anim" style={{ marginBottom: 32 }}>
                <div className="ct-divider" />
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
                  Contact Info
                </p>
                <h2
                  className="font-display"
                  style={{
                    margin: "0 0 20px",
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#1a1230",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Reach us directly
                </h2>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {CONTACT_METHODS.map((m, i) => (
                    <a
                      key={i}
                      href={m.href}
                      className="ct-method"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 13,
                          background: m.light,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <i
                          className={m.icon}
                          style={{ color: m.accent, fontSize: 18 }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: "0 0 2px",
                            fontFamily: "'Syne',sans-serif",
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "#b8addb",
                          }}
                        >
                          {m.label}
                        </p>
                        <p
                          className="font-display"
                          style={{
                            margin: "0 0 2px",
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#1a1230",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {m.value}
                        </p>
                        <p
                          style={{ margin: 0, fontSize: 11, color: "#b8addb" }}
                        >
                          {m.sub}
                        </p>
                      </div>
                      <i
                        className="fa-solid fa-arrow-up-right-from-square"
                        style={{
                          color: "#d8d0f8",
                          fontSize: 12,
                          flexShrink: 0,
                        }}
                      />
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick WhatsApp links */}
              <div className="ct-anim-2">
                <p
                  className="font-display"
                  style={{
                    margin: "0 0 12px",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#b8addb",
                  }}
                >
                  Quick WhatsApp Links
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  {QUICK_LINKS.map((q, i) => (
                    <a
                      key={i}
                      href={q.href}
                      className="ct-quick-btn"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: "#f0fdf4",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <i
                          className={`fa-solid ${q.icon}`}
                          style={{ color: "#10b981", fontSize: 14 }}
                        />
                      </div>
                      <div>
                        <p
                          className="font-display"
                          style={{
                            margin: "0 0 2px",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#1a1230",
                          }}
                        >
                          {q.label}
                        </p>
                        <p
                          style={{ margin: 0, fontSize: 11, color: "#b8addb" }}
                        >
                          {q.desc}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Response time strip */}
              <div
                className="ct-anim-3"
                style={{
                  marginTop: 24,
                  padding: "16px 20px",
                  borderRadius: 14,
                  background: "linear-gradient(135deg,#f5f3ff,#ede9fe)",
                  border: "1.5px solid #d8d0f8",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
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
                    flexShrink: 0,
                  }}
                >
                  <i
                    className="fa-solid fa-clock"
                    style={{ color: "#fff", fontSize: 14 }}
                  />
                </div>
                <div>
                  <p
                    className="font-display"
                    style={{
                      margin: "0 0 2px",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#1a1230",
                    }}
                  >
                    Average response time: &lt; 2 hours
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "#9b8fc2" }}>
                    Mon – Sun, including public holidays
                  </p>
                </div>
              </div>
            </div>

            {/* ── RIGHT: form ── */}
            <div
              style={{
                background: "#fff",
                border: "1.5px solid #f0eef9",
                borderRadius: 20,
                padding: "32px 28px",
                boxShadow: "0 8px 32px rgba(124,92,252,0.06)",
              }}
            >
              {submitted ? (
                <div
                  className="ct-check"
                  style={{ textAlign: "center", padding: "40px 20px" }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#10b981,#059669)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px",
                      boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
                    }}
                  >
                    <i
                      className="fa-solid fa-check"
                      style={{ color: "#fff", fontSize: 28 }}
                    />
                  </div>
                  <p
                    className="font-display"
                    style={{
                      margin: "0 0 8px",
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#1a1230",
                    }}
                  >
                    Message Sent!
                  </p>
                  <p
                    style={{
                      margin: "0 0 24px",
                      fontSize: 14,
                      color: "#9b8fc2",
                      lineHeight: 1.6,
                    }}
                  >
                    We've received your inquiry and will get back to you within
                    2 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "'Syne',sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#7c5cfc",
                    }}
                  >
                    <i
                      className="fa-solid fa-arrow-left"
                      style={{ marginRight: 6, fontSize: 10 }}
                    />
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 24 }}>
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
                      Send a Message
                    </p>
                    <h3
                      className="font-display"
                      style={{
                        margin: 0,
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#1a1230",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      We'll get back to you fast.
                    </h3>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {/* Name + Email row */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <div>
                        <label className="ct-label">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          style={inputStyle("name")}
                          onFocus={() => setFocused("name")}
                          onBlur={() => setFocused(null)}
                        />
                      </div>
                      <div>
                        <label className="ct-label">Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="you@email.com"
                          style={inputStyle("email")}
                          onFocus={() => setFocused("email")}
                          onBlur={() => setFocused(null)}
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="ct-label">Subject</label>
                      <div style={{ position: "relative" }}>
                        <select
                          style={{ ...inputStyle("subject"), paddingRight: 36 }}
                          onFocus={() => setFocused("subject")}
                          onBlur={() => setFocused(null)}
                        >
                          <option>General Inquiry</option>
                          <option>Subscription Help</option>
                          <option>Payment Issue</option>
                          <option>Become an Owner</option>
                          <option>Service Request</option>
                        </select>
                        <i
                          className="fa-solid fa-chevron-down"
                          style={{
                            position: "absolute",
                            right: 14,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#c4b5fd",
                            fontSize: 11,
                            pointerEvents: "none",
                          }}
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="ct-label">Message</label>
                      <textarea
                        required
                        placeholder="Describe your question or issue in detail…"
                        style={{
                          ...inputStyle("message"),
                          height: 120,
                          resize: "vertical" as any,
                          lineHeight: 1.6,
                        }}
                        onFocus={() => setFocused("message")}
                        onBlur={() => setFocused(null)}
                      />
                    </div>

                    <button type="submit" className="ct-submit">
                      <i
                        className="fa-solid fa-paper-plane"
                        style={{ fontSize: 12 }}
                      />
                      Send Message
                    </button>

                    <p
                      style={{
                        margin: 0,
                        textAlign: "center",
                        fontSize: 11,
                        color: "#c4b5fd",
                      }}
                    >
                      <i
                        className="fa-solid fa-clock"
                        style={{ marginRight: 4, fontSize: 10 }}
                      />
                      We typically respond within 2 hours
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactUs;
