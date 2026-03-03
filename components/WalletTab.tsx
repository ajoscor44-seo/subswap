import React, { useState } from "react";
import { User } from "@/constants/types";

interface WalletTabProps {
  user: User;
  customAmount: string;
  setCustomAmount: (amount: string) => void;
  handleFlutterwavePayment: (amount: number) => void;
  showStatus: (text: string, type: "success" | "error") => void;
}

const QUICK_AMOUNTS = [2000, 5000, 10000, 20000];

const WalletTab: React.FC<WalletTabProps> = ({
  user,
  customAmount,
  setCustomAmount,
  handleFlutterwavePayment,
  showStatus,
}) => {
  const [focused, setFocused] = useState(false);

  const handlePay = () => {
    const amt = parseInt(customAmount);
    if (!amt || amt <= 0) {
      showStatus("Please enter a valid amount", "error");
      return;
    }
    handleFlutterwavePayment(amt);
  };

  const parsedAmount = parseInt(customAmount) || 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .wt-root { font-family: 'DM Sans', sans-serif; color: #1a1230; }
        .wt-root * { box-sizing: border-box; }
        .wt-heading { font-family: 'Syne', sans-serif; }

        /* Card surface */
        .wt-card {
          background: #fff;
          border: 1.5px solid #f0eef9;
          border-radius: 20px;
          transition: box-shadow 0.25s, transform 0.25s;
        }

        /* Balance card */
        .wt-balance-card {
          border-radius: 20px;
          background: linear-gradient(145deg, #1a1230 0%, #2d1f6e 50%, #3730a3 100%);
          position: relative; overflow: hidden;
          padding: 32px;
        }
        .wt-balance-card::before {
          content: '';
          position: absolute; top: -40px; right: -40px;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
        }
        .wt-balance-card::after {
          content: '';
          position: absolute; bottom: -60px; left: -20px;
          width: 240px; height: 240px;
          border-radius: 50%;
          background: rgba(124,92,252,0.15);
        }

        /* Amount input */
        .wt-input-wrap {
          display: flex; align-items: center;
          border: 1.5px solid #ede9fe; border-radius: 14px;
          background: #fafafe; overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .wt-input-wrap.focused { border-color: #7c5cfc; box-shadow: 0 0 0 4px rgba(124,92,252,0.1); }
        .wt-input-prefix {
          padding: 0 4px 0 18px;
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 18px; color: #7c5cfc;
          pointer-events: none; flex-shrink: 0;
        }
        .wt-input {
          flex: 1; border: none; background: transparent;
          padding: 16px 12px;
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 18px; color: #1a1230;
          outline: none;
        }
        .wt-input::placeholder { color: #d8d0f8; font-weight: 500; }

        /* Quick amount pills */
        .wt-quick-btn {
          padding: 13px 10px;
          border-radius: 12px;
          border: 1.5px solid #ede9fe;
          background: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700;
          color: #7c5cfc; cursor: pointer;
          transition: all 0.2s; text-align: center;
        }
        .wt-quick-btn:hover { border-color: #7c5cfc; background: #f5f3ff; box-shadow: 0 4px 12px rgba(124,92,252,0.12); transform: translateY(-1px); }
        .wt-quick-btn.selected { background: linear-gradient(135deg,#7c5cfc,#6366f1); color: #fff; border-color: transparent; box-shadow: 0 4px 14px rgba(124,92,252,0.3); }

        /* Pay button */
        .wt-pay-btn {
          width: 100%; padding: 16px;
          border-radius: 14px; border: none;
          background: linear-gradient(135deg, #7c5cfc 0%, #6366f1 100%);
          color: #fff; cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.06em;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all 0.2s;
          box-shadow: 0 6px 20px rgba(124,92,252,0.32);
        }
        .wt-pay-btn:hover { box-shadow: 0 10px 28px rgba(124,92,252,0.42); transform: translateY(-1px); }
        .wt-pay-btn:active { transform: scale(0.98); }
        .wt-pay-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

        /* History mini rows */
        .wt-mini-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 0; border-bottom: 1px solid #f5f3ff;
        }
        .wt-mini-row:last-child { border-bottom: none; }

        /* Security badge */
        .wt-security {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px; border-radius: 12px;
          background: #f5f3ff; border: 1px solid #ede9fe;
          margin-top: 12px;
        }

        /* Progress ring label */
        @keyframes countUp { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .wt-amount-preview { animation: countUp 0.25s ease forwards; }
      `}</style>

      <div className="wt-root bg-white p-8 rounded-4xl shadow-sm">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          <div>
            <div style={{ marginBottom: 24 }}>
              <p
                className="wt-heading"
                style={{
                  margin: "0 0 4px",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#a78bfa",
                }}
              >
                Manage Funds
              </p>
              <h2
                className="wt-heading"
                style={{
                  margin: 0,
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#1a1230",
                  lineHeight: 1.2,
                }}
              >
                Your Wallet
              </h2>
            </div>

            {/* ── LEFT: Balance card + stats ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Balance card */}
              <div className="wt-balance-card">
                <div style={{ position: "relative", zIndex: 1 }}>
                  <p
                    className="wt-heading"
                    style={{
                      margin: "0 0 6px",
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.18em",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    Available Balance
                  </p>
                  <h3
                    className="wt-heading"
                    style={{
                      margin: "0 0 4px",
                      fontSize: 38,
                      fontWeight: 800,
                      color: "#fff",
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    ₦{user.balance.toLocaleString()}
                  </h3>
                  <p
                    style={{
                      margin: "0 0 24px",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    @{user.username}
                  </p>

                  {/* Decorative card chip */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", gap: 6 }}>
                      <div
                        style={{
                          width: 28,
                          height: 20,
                          borderRadius: 4,
                          background: "rgba(255,255,255,0.15)",
                        }}
                      />
                      <div
                        style={{
                          width: 28,
                          height: 20,
                          borderRadius: 4,
                          background: "rgba(255,255,255,0.08)",
                        }}
                      />
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#10b981",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: "'Syne',sans-serif",
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.5)",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini stats row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div className="wt-card" style={{ padding: "16px 18px" }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: "#f0fdf4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 10,
                    }}
                  >
                    <i
                      className="fa-solid fa-arrow-down"
                      style={{ color: "#16a34a", fontSize: 13 }}
                    />
                  </div>
                  <p
                    style={{
                      margin: "0 0 2px",
                      fontSize: 9,
                      fontFamily: "'Syne',sans-serif",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      color: "#b8addb",
                    }}
                  >
                    Deposits
                  </p>
                  <p
                    className="wt-heading"
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#16a34a",
                    }}
                  >
                    ₦{(user.totalDeposited ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="wt-card" style={{ padding: "16px 18px" }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: "#f0eef9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 10,
                    }}
                  >
                    <i
                      className="fa-solid fa-bag-shopping"
                      style={{ color: "#7c5cfc", fontSize: 13 }}
                    />
                  </div>
                  <p
                    style={{
                      margin: "0 0 2px",
                      fontSize: 9,
                      fontFamily: "'Syne',sans-serif",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      color: "#b8addb",
                    }}
                  >
                    Spent
                  </p>
                  <p
                    className="wt-heading"
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#7c5cfc",
                    }}
                  >
                    ₦{(user.totalSpent ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Savings highlight */}
              {(user.totalSaved ?? 0) > 0 && (
                <div
                  className="wt-card"
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 11,
                      background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <i
                      className="fa-solid fa-piggy-bank"
                      style={{ color: "#16a34a", fontSize: 16 }}
                    />
                  </div>
                  <div>
                    <p
                      style={{
                        margin: "0 0 2px",
                        fontSize: 10,
                        fontFamily: "'Syne',sans-serif",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        color: "#b8addb",
                      }}
                    >
                      Total Saved via DiscountZAR
                    </p>
                    <p
                      className="wt-heading"
                      style={{
                        margin: 0,
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#16a34a",
                      }}
                    >
                      ₦{user.totalSaved.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Fund form ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="wt-card" style={{ padding: "24px 24px 20px" }}>
              <p
                className="wt-heading"
                style={{
                  margin: "0 0 16px",
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#1a1230",
                }}
              >
                Add Funds
              </p>

              {/* Amount input */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 10,
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "#b8addb",
                  }}
                >
                  Enter Amount
                </label>
                <div className={`wt-input-wrap ${focused ? "focused" : ""}`}>
                  <span className="wt-input-prefix">₦</span>
                  <input
                    className="wt-input"
                    type="number"
                    placeholder="0"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    min={0}
                  />
                </div>
              </div>

              {/* Quick amounts */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 10,
                    fontSize: 10,
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "#b8addb",
                  }}
                >
                  Quick Select
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setCustomAmount(amt.toString())}
                      className={`wt-quick-btn ${customAmount === amt.toString() ? "selected" : ""}`}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {parsedAmount > 0 && (
                <div
                  className="wt-amount-preview"
                  style={{
                    background: "#f5f3ff",
                    border: "1.5px solid #ede9fe",
                    borderRadius: 12,
                    padding: "12px 16px",
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ fontSize: 12, color: "#9b8fc2", fontWeight: 500 }}
                  >
                    New balance after top-up
                  </span>
                  <span
                    className="wt-heading"
                    style={{ fontSize: 15, fontWeight: 800, color: "#7c5cfc" }}
                  >
                    ₦{(user.balance + parsedAmount).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Pay button */}
              <button
                className="wt-pay-btn"
                disabled={!parsedAmount || parsedAmount <= 0}
                onClick={handlePay}
              >
                <i className="fa-solid fa-bolt" />
                {parsedAmount > 0
                  ? `Fund ₦${parsedAmount.toLocaleString()} via Flutterwave`
                  : "Enter Amount to Continue"}
              </button>

              {/* Security note */}
              <div className="wt-security">
                <i
                  className="fa-solid fa-lock"
                  style={{ color: "#a78bfa", fontSize: 11 }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "#b8addb",
                  }}
                >
                  Secured by Flutterwave · 256-bit SSL
                </span>
              </div>
            </div>

            {/* Payment methods row */}
            <div className="wt-card" style={{ padding: "16px 20px" }}>
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 10,
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "#b8addb",
                }}
              >
                Accepted methods
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  "fa-credit-card",
                  "fa-mobile-screen",
                  "fa-building-columns",
                ].map((icon, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 9,
                      background: "#f5f3ff",
                      border: "1px solid #ede9fe",
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <i
                      className={`fa-solid ${icon}`}
                      style={{ color: "#7c5cfc", fontSize: 12 }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "'Syne',sans-serif",
                        fontWeight: 600,
                        color: "#7c5cfc",
                      }}
                    >
                      {["Card", "Mobile Money", "USSD"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WalletTab;
