import React, { useState, useEffect, useRef, useCallback } from "react";
import { MasterAccount } from "@/constants/types";
import { supabase } from "@/lib/supabase";
import { triggerEmail } from "@/lib/send-email";
import { toast } from "react-hot-toast";
import { useAuth } from "@/providers/auth";
import { useNavigator } from "@/providers/navigator";
import { JoinConfirmation } from "./sharing/JoinConfirmation";

export const DiscoverServices: React.FC = () => {
  const {
    user,
    refreshProfile,
    products,
    productsLoading: isLoading,
    refreshProducts,
    refreshSubscriptions,
  } = useAuth();
  const { goTo, changeTab } = useNavigator();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Scroll controls
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Join Confirmation State
  const [selectedAccount, setSelectedAccount] = useState<MasterAccount | null>(
    null,
  );

  // Quick Fund State
  const [showFundModal, setShowFundModal] = useState(false);
  const [neededAmount, setNeededAmount] = useState(0);
  const [activeAccount, setActiveAccount] = useState<MasterAccount | null>(
    null,
  );

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const t = setTimeout(checkScroll, 50);
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(t);
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products, checkScroll]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 260 : -260, behavior: "smooth" });
  };

  const handleJoinClick = (account: MasterAccount) => {
    if (!user) {
      toast.error("You need to be logged in to join a plan.");
      return;
    }

    if (user.balance < account.price) {
      setNeededAmount(account.price - user.balance);
      setActiveAccount(account);
      setShowFundModal(true);
      return;
    }

    setSelectedAccount(account);
  };

  const handleConfirmJoin = async (account: MasterAccount) => {
    setIsProcessing(account.id);
    setSelectedAccount(null);
    try {
      const { error } = await supabase.rpc("purchase_slot_v2", {
        p_buyer_id: user?.id,
        p_account_id: account.id,
        p_profile_name: user?.username || user?.name,
        p_amount: account.price,
      });
      if (error) throw error;
      toast.success(`Success! Taking you to your new stack...`);
      await triggerEmail("purchase", {
        email: user?.email,
        username: user?.username,
        serviceName: account.service_name,
        price: account.price,
        masterEmail: account.master_email,
        masterPassword: account.master_password,
        fulfillmentType: account.fulfillment_type,
      }).catch((err) => console.error("Email trigger failed:", err));

      if (refreshProfile) await refreshProfile();
      if (refreshProducts) await refreshProducts();
      if (refreshSubscriptions) await refreshSubscriptions();

      setTimeout(() => {
        changeTab("stacks");
        goTo("dashboard");
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Purchase failed. Please try again.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleFlutterwavePayment = (amount: number) => {
    if (!user) return;
    // @ts-ignore — FlutterwaveCheckout is injected by the v3 script tag
    FlutterwaveCheckout({
      public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: `tx-qf-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      amount,
      currency: "NGN",
      payment_options: "card,mobilemoney,ussd",
      customer: {
        email: user.email,
        phone_number: "",
        name: user.name || user.username || "",
      },
      customizations: {
        title: "DiscountZAR Wallet Top-up",
        description: `Quick Fund for ${activeAccount?.service_name || "Marketplace"}`,
        logo: "https://ui-avatars.com/api/?name=DiscountZAR&background=6366f1&color=fff",
      },
      callback: async (response: any) => {
        if (
          response.status === "successful" ||
          response.status === "completed"
        ) {
          try {
            const { data: freshProfile } = await supabase
              .from("profiles")
              .select("balance")
              .eq("id", user.id)
              .single();
            const newBalance = Number(freshProfile?.balance || 0) + amount;

            const { error } = await supabase
              .from("profiles")
              .update({ balance: newBalance })
              .eq("id", user.id);
            if (error) throw error;

            await supabase.from("transactions").insert({
              user_id: user.id,
              amount,
              type: "Deposit",
              description: `Quick Fund for ${activeAccount?.service_name || "Marketplace"}`,
            });
            await triggerEmail("wallet_funded", {
              email: user.email,
              username: user.username,
              amount,
              newBalance,
            });

            toast.success(`₦${amount.toLocaleString()} added successfully!`);
            setShowFundModal(false);

            if (refreshProfile) await refreshProfile();

            if (activeAccount && newBalance >= activeAccount.price) {
              setSelectedAccount(activeAccount);
            } else {
              changeTab("overview");
              goTo("dashboard");
            }
          } catch (err: any) {
            toast.error(err.message || "Failed to update balance");
          }
        } else {
          toast.error("Payment was not successful");
        }
      },
      onclose: async () => {
        if (refreshProfile) await refreshProfile();
      },
    });
  };

  const slotsPercent = (account: MasterAccount) =>
    Math.round(
      ((account.total_slots - account.available_slots) / account.total_slots) *
        100,
    );

  const isLow = (account: MasterAccount) =>
    account.available_slots <= 2 && account.available_slots > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .dcv-root { font-family: 'DM Sans', sans-serif; }
        .dcv-root * { box-sizing: border-box; }
        .dcv-heading { font-family: 'Outfit', sans-serif; }

        .dcv-card {
          background: #ffffff; border: 1.5px solid #f0eef9; border-radius: 20px;
          overflow: hidden;
          transition: box-shadow 0.35s ease, transform 0.35s ease, border-color 0.25s ease;
          display: flex; flex-direction: column; position: relative;
          min-width: 220px; width: 220px; flex-shrink: 0;
        }
        .dcv-card:hover {
          box-shadow: 0 24px 48px -8px rgba(99,76,201,0.14), 0 4px 16px -4px rgba(99,76,201,0.08);
          transform: translateY(-4px); border-color: #d8d0f8;
        }

        .dcv-card-img-wrap {
          width: 64px; height: 64px; border-radius: 50%; overflow: hidden;
          border: 3px solid #ede9fe; box-shadow: 0 4px 16px rgba(124,92,252,0.15);
          flex-shrink: 0; transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .dcv-card:hover .dcv-card-img-wrap {
          box-shadow: 0 8px 24px rgba(124,92,252,0.25); transform: scale(1.05);
        }
        .dcv-card-img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .dcv-bar-bg { background: #f0eef9; border-radius: 99px; height: 5px; overflow: hidden; }
        .dcv-bar-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, #7c5cfc, #a78bfa);
          transition: width 0.8s cubic-bezier(0.34,1.2,0.64,1);
        }
        .dcv-bar-fill.warn { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

        .dcv-join-btn {
          width: 100%; padding: 8px; border-radius: 10px;
          font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 12px;
          letter-spacing: 0.04em; text-transform: uppercase; border: none;
          cursor: pointer; transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .dcv-join-btn.primary {
          background: linear-gradient(135deg, #7c5cfc 0%, #6366f1 100%);
          color: #fff; box-shadow: 0 4px 16px rgba(124,92,252,0.3);
        }
        .dcv-join-btn.primary:hover { box-shadow: 0 8px 24px rgba(124,92,252,0.4); transform: translateY(-1px); }
        .dcv-join-btn.fund {
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
          color: #fff; box-shadow: 0 4px 16px rgba(245,158,11,0.28);
        }
        .dcv-join-btn.fund:hover { box-shadow: 0 8px 24px rgba(245,158,11,0.38); transform: translateY(-1px); }
        .dcv-join-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; }
        .dcv-join-btn:active:not(:disabled) { transform: scale(0.98) !important; }

        .dcv-cat-badge {
          display: inline-block; padding: 2px 8px; border-radius: 6px;
          background: #f0eef9; color: #7c5cfc; font-size: 9px;
          font-family: 'Outfit', sans-serif; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em;
        }

        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
        .dcv-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
        .dcv-dot.urgent { background: #f59e0b; animation: pulse-dot 1.4s ease-in-out infinite; }
        .dcv-dot.ok { background: #10b981; }

        @keyframes modalIn { from{opacity:0;transform:scale(0.94) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .dcv-modal { animation: modalIn 0.28s cubic-bezier(0.34,1.2,0.64,1) forwards; }

        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .dcv-skeleton {
          background: linear-gradient(90deg, #f5f3ff 25%, #ede9fe 50%, #f5f3ff 75%);
          background-size: 200% 100%; animation: shimmer 1.6s infinite; border-radius: 8px;
        }

        .dcv-scroll-row {
          display: flex; gap: 16px; overflow-x: auto; padding-bottom: 4px;
          scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
        }
        .dcv-scroll-row::-webkit-scrollbar { display: none; }
        .dcv-scroll-row { -ms-overflow-style: none; scrollbar-width: none; }
        .dcv-scroll-row > * { scroll-snap-align: start; }

        .dcv-nav-btn {
          width: 34px; height: 34px; border-radius: 50%;
          border: 1.5px solid #ede9fe; background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #7c5cfc; font-size: 12px;
          transition: all 0.2s; box-shadow: 0 2px 8px rgba(124,92,252,0.08);
          flex-shrink: 0;
        }
        .dcv-nav-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #7c5cfc, #6366f1);
          color: #fff; border-color: transparent;
          box-shadow: 0 4px 14px rgba(124,92,252,0.3);
          transform: scale(1.08);
        }
        .dcv-nav-btn:disabled { opacity: 0.25; cursor: default; }

        .dcv-nav-controls { display: none; }
        @media (min-width: 768px) {
          .dcv-nav-controls { display: flex; align-items: center; gap: 6px; }
        }

        .dcv-verified { color: #7c5cfc; font-size: 11px; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .fa-spin { animation: spin 0.8s linear infinite; display: inline-block; }

        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .dcv-card { animation: fadeIn 0.3s ease both; }
      `}</style>

      <div className="dcv-root" style={{ position: "relative" }}>
        {/* ── Quick Fund Modal ── */}
        {showFundModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              background: "rgba(15,10,40,0.5)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              className="dcv-modal"
              style={{
                background: "#fff",
                borderRadius: 24,
                padding: "36px 32px",
                width: "100%",
                maxWidth: 420,
                position: "relative",
                border: "1.5px solid #ede9fe",
                boxShadow: "0 32px 64px rgba(99,76,201,0.18)",
              }}
            >
              <button
                onClick={() => setShowFundModal(false)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "#f5f3ff",
                  border: "none",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#7c5cfc",
                  fontSize: 14,
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: "linear-gradient(135deg,#f0eef9,#ede9fe)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <i
                    className="fa-solid fa-wallet"
                    style={{ color: "#7c5cfc", fontSize: 22 }}
                  />
                </div>
                <h3
                  className="dcv-heading"
                  style={{
                    margin: "0 0 6px",
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#1a1230",
                  }}
                >
                  Top-up Required
                </h3>
                <p style={{ margin: 0, color: "#9b8fc2", fontSize: 13 }}>
                  You need{" "}
                  <strong style={{ color: "#7c5cfc" }}>
                    ₦{neededAmount.toLocaleString()}
                  </strong>{" "}
                  more to join this plan.
                </p>
              </div>
              <div
                style={{
                  background: "#fafafe",
                  borderRadius: 14,
                  padding: "18px 20px",
                  marginBottom: 24,
                  border: "1.5px solid #f0eef9",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "'Outfit',sans-serif",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "#b8addb",
                    }}
                  >
                    Plan Price
                  </span>
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: "#1a1230" }}
                  >
                    ₦{activeAccount?.price.toLocaleString()}
                  </span>
                </div>
                <div className="dcv-bar-bg" style={{ marginBottom: 10 }}>
                  <div
                    className="dcv-bar-fill"
                    style={{
                      width: `${Math.min(100, ((user?.balance || 0) / (activeAccount?.price || 1)) * 100)}%`,
                    }}
                  />
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ fontSize: 12, color: "#9b8fc2" }}>
                    Balance: ₦{user?.balance.toLocaleString()}
                  </span>
                  <span
                    style={{ fontSize: 12, color: "#7c5cfc", fontWeight: 600 }}
                  >
                    Needed: ₦{neededAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <button
                  className="dcv-join-btn primary"
                  onClick={() => handleFlutterwavePayment(neededAmount)}
                  disabled={isProcessing === "funding"}
                >
                  {isProcessing === "funding" ? (
                    <i className="fa-solid fa-spinner fa-spin" />
                  ) : (
                    <i className="fa-solid fa-bolt" />
                  )}
                  Pay ₦{neededAmount.toLocaleString()} via Flutterwave
                </button>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {[2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleFlutterwavePayment(amt)}
                      style={{
                        padding: "11px",
                        borderRadius: 11,
                        border: "1.5px solid #ede9fe",
                        background: "#fff",
                        fontFamily: "'Outfit',sans-serif",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#7c5cfc",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.borderColor = "#7c5cfc")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.borderColor = "#ede9fe")
                      }
                    >
                      + ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
              <p
                style={{
                  textAlign: "center",
                  marginTop: 18,
                  fontSize: 10,
                  color: "#c4b5fd",
                  fontFamily: "'Outfit',sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                🔒 Secured by Flutterwave
              </p>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <p
            className="dcv-heading"
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#a78bfa",
            }}
          >
            Discover &amp; Subscribe
          </p>

          {!isLoading && products.length > 0 && (
            <div className="dcv-nav-controls">
              <button
                className="dcv-nav-btn"
                disabled={!canScrollLeft}
                onClick={() => scroll("left")}
                aria-label="Previous"
              >
                <i className="fa-solid fa-chevron-left" />
              </button>
              <button
                className="dcv-nav-btn"
                disabled={!canScrollRight}
                onClick={() => scroll("right")}
                aria-label="Next"
              >
                <i className="fa-solid fa-chevron-right" />
              </button>
            </div>
          )}
        </div>

        {/* ── Skeleton ── */}
        {isLoading ? (
          <div className="dcv-scroll-row">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  minWidth: 220,
                  width: 220,
                  flexShrink: 0,
                  borderRadius: 20,
                  overflow: "hidden",
                  border: "1.5px solid #f0eef9",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    padding: "20px 16px 16px",
                    background: "linear-gradient(135deg,#f5f3ff,#ede9fe)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    className="dcv-skeleton"
                    style={{ width: 72, height: 72, borderRadius: "50%" }}
                  />
                  <div
                    className="dcv-skeleton"
                    style={{ width: 64, height: 46, borderRadius: 10 }}
                  />
                </div>
                <div
                  style={{
                    padding: "14px 14px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div
                    className="dcv-skeleton"
                    style={{ height: 14, width: "70%" }}
                  />
                  <div
                    className="dcv-skeleton"
                    style={{ height: 9, width: "40%", borderRadius: 6 }}
                  />
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 5 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        className="dcv-skeleton"
                        style={{ height: 9, width: "55%" }}
                      />
                      <div
                        className="dcv-skeleton"
                        style={{ height: 9, width: "15%" }}
                      />
                    </div>
                    <div
                      className="dcv-skeleton"
                      style={{ height: 5, borderRadius: 99 }}
                    />
                  </div>
                  <div
                    className="dcv-skeleton"
                    style={{ height: 36, borderRadius: 12, marginTop: 4 }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div ref={scrollRef} className="dcv-scroll-row">
            {products.map((account, idx) => {
              const pct = slotsPercent(account);
              const low = isLow(account);
              const needsFund = user && user.balance < account.price;
              return (
                <div
                  key={account.id}
                  className="dcv-card"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
                      padding: "20px 16px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div className="dcv-card-img-wrap">
                      <img
                        className="dcv-card-img"
                        src={account.icon_url}
                        alt={account.service_name}
                      />
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 5,
                      }}
                    >
                      <div
                        style={{
                          background: "#fff",
                          borderRadius: 10,
                          padding: "6px 6px",
                          border: "1.5px solid #ede9fe",
                          boxShadow: "0 2px 8px rgba(124,92,252,0.1)",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontFamily: "'Outfit',sans-serif",
                            fontWeight: 800,
                            fontSize: 14,
                            color: "#1a1230",
                            lineHeight: 1.1,
                          }}
                        >
                          ₦{account.price.toLocaleString()}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 8,
                            fontFamily: "'Outfit',sans-serif",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "#b8addb",
                          }}
                        >
                          / mo
                        </p>
                      </div>
                      {low && (
                        <div
                          style={{
                            background: "rgba(245,158,11,0.12)",
                            border: "1px solid rgba(245,158,11,0.28)",
                            borderRadius: 7,
                            padding: "3px 7px",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span className="dcv-dot urgent" />
                          <span
                            style={{
                              fontSize: 8,
                              fontFamily: "'Outfit',sans-serif",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              color: "#f59e0b",
                              letterSpacing: "0.06em",
                            }}
                          >
                            {account.available_slots} left
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "14px 14px 18px",
                      display: "flex",
                      flexDirection: "column",
                      flexGrow: 1,
                      gap: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 5,
                        }}
                      >
                        <h3
                          className="dcv-heading"
                          style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#1a1230",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "80%",
                          }}
                        >
                          {account.service_name}
                        </h3>
                        {account.owner?.is_verified && (
                          <i
                            className="fa-solid fa-circle-check dcv-verified"
                            title="Verified seller"
                          />
                        )}
                      </div>
                      <span className="dcv-cat-badge">{account.category}</span>
                    </div>

                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 5,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span
                            className={`dcv-dot ${low ? "urgent" : "ok"}`}
                          />
                          <span
                            style={{
                              fontSize: 10,
                              color: "#9b8fc2",
                              fontWeight: 500,
                            }}
                          >
                            {account.available_slots}/{account.total_slots} open
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "'Outfit',sans-serif",
                            fontWeight: 700,
                            color: low ? "#f59e0b" : "#7c5cfc",
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="dcv-bar-bg">
                        <div
                          className={`dcv-bar-fill ${low ? "warn" : ""}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {account.owner && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <img
                          src={
                            account.owner.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(account.owner.username || "U")}&background=ede9fe&color=7c5cfc&size=32`
                          }
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "1.5px solid #ede9fe",
                            flexShrink: 0,
                          }}
                          alt={account.owner.username}
                        />
                        <span
                          style={{
                            fontSize: 11,
                            color: "#b8addb",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          @{account.owner.username}
                        </span>
                        {account.owner.merchant_rating && (
                          <span
                            style={{
                              marginLeft: "auto",
                              fontSize: 10,
                              color: "#f59e0b",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              flexShrink: 0,
                            }}
                          >
                            <i
                              className="fa-solid fa-star"
                              style={{ fontSize: 8 }}
                            />
                            {account.owner.merchant_rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      className={`dcv-join-btn ${needsFund ? "fund" : "primary"}`}
                      disabled={!!isProcessing}
                      onClick={() => handleJoinClick(account)}
                      style={{ marginTop: "auto" }}
                    >
                      {isProcessing === account.id ? (
                        <i className="fa-solid fa-spinner fa-spin" />
                      ) : needsFund ? (
                        <>
                          <i className="fa-solid fa-wallet" /> Fund &amp; Join
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-arrow-right-to-bracket" />{" "}
                          Join Plan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "52px 32px",
              background: "#fafafe",
              borderRadius: 20,
              border: "1.5px dashed #ede9fe",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "#f0eef9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}
            >
              <i
                className="fa-solid fa-magnifying-glass"
                style={{ color: "#c4b5fd", fontSize: 18 }}
              />
            </div>
            <p
              className="dcv-heading"
              style={{
                margin: 0,
                color: "#b8addb",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              No active slots found
            </p>
            <p style={{ margin: "5px 0 0", color: "#c4b5fd", fontSize: 12 }}>
              Check back soon for new listings
            </p>
          </div>
        )}
      </div>

      {selectedAccount && (
        <JoinConfirmation
          subscription={selectedAccount as any}
          onClose={() => setSelectedAccount(null)}
          onConfirm={() => handleConfirmJoin(selectedAccount)}
          isProcessing={isProcessing === selectedAccount.id}
        />
      )}
    </>
  );
};
