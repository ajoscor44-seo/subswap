import React, { useState, useEffect, useMemo } from "react";
import { ProductCategory, MasterAccount } from "@/constants/types";
import { supabase } from "@/lib/supabase";
import { triggerEmail } from "@/lib/send-email";
import { toast } from "react-hot-toast";
import { useAuth } from "@/providers/auth";
import { useNavigator } from "@/providers/navigator";

export const Marketplace: React.FC = () => {
  const { user } = useAuth();
  const { changeView } = useNavigator();
  const [dbProducts, setDbProducts] = useState<MasterAccount[]>([]);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Quick Fund State
  const [showFundModal, setShowFundModal] = useState(false);
  const [neededAmount, setNeededAmount] = useState(0);
  const [activeAccount, setActiveAccount] = useState<MasterAccount | null>(
    null,
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("master_accounts")
        .select(
          `*, owner:profiles!owner_id (username, is_verified, avatar, merchant_rating)`,
        )
        .gt("available_slots", 0)
        .order("created_at", { ascending: false });

      if (data) setDbProducts(data as MasterAccount[]);
      if (error) throw error;
    } catch (err) {
      console.error("Error fetching marketplace:", err);
      toast.error("Failed to fetch marketplace items.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (account: MasterAccount) => {
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
    setIsProcessing(account.id);
    try {
      const { error } = await supabase.rpc("purchase_slot_v2", {
        p_buyer_id: user.id,
        p_account_id: account.id,
        p_profile_name: user.username || user.name,
        p_amount: account.price,
      });
      if (error) throw error;
      toast.success(`Success! Taking you to your new stack...`);
      await triggerEmail("purchase", {
        email: user.email,
        username: user.username,
        serviceName: account.service_name,
        price: account.price,
        masterEmail: account.master_email,
        masterPassword: account.master_password,
        fulfillmentType: account.fulfillment_type,
      });
      setTimeout(() => changeView("dashboard"), 1500);
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
            const newBalance = Number(user?.balance || 0) + amount;

            const { error: balanceError } = await supabase
              .from("profiles")
              .update({ balance: newBalance })
              .eq("id", user.id);
            if (balanceError) throw balanceError;

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

            if (activeAccount && newBalance >= activeAccount.price) {
              handleJoin(activeAccount);
            } else {
              changeView("dashboard");
            }
          } catch (err: any) {
            toast.error(err.message || "Failed to update balance");
          }
        } else {
          toast.error("Payment was not successful");
        }
      },
      onclose: () => toast("Payment cancelled", { icon: "👋" }),
    });
  };

  const filteredProducts = useMemo(() => {
    return dbProducts.filter((p) => {
      const matchesFilter = filter === "All" || p.category === filter;
      const matchesSearch = p.service_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery, dbProducts]);

  const slotsPercent = (account: MasterAccount) =>
    Math.round(
      ((account.total_slots - account.available_slots) / account.total_slots) *
        100,
    );

  const isFull = (account: MasterAccount) => account.available_slots === 0;
  const isLow = (account: MasterAccount) =>
    account.available_slots <= 2 && account.available_slots > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .mkt-root { font-family: 'DM Sans', sans-serif; }
        .mkt-root * { box-sizing: border-box; }

        .mkt-heading { font-family: 'Syne', sans-serif; }

        /* Card */
        .mkt-card {
          background: #ffffff;
          border: 1.5px solid #f0eef9;
          border-radius: 20px;
          overflow: hidden;
          transition: box-shadow 0.35s ease, transform 0.35s ease, border-color 0.25s ease;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .mkt-card:hover {
          box-shadow: 0 24px 48px -8px rgba(99,76,201,0.14), 0 4px 16px -4px rgba(99,76,201,0.08);
          transform: translateY(-4px);
          border-color: #d8d0f8;
        }

        /* Image zone */
        .mkt-card-img-wrap {
          width: 80px; height: 80px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #ede9fe;
          box-shadow: 0 4px 16px rgba(124,92,252,0.15);
          flex-shrink: 0;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .mkt-card:hover .mkt-card-img-wrap {
          box-shadow: 0 8px 24px rgba(124,92,252,0.25);
          transform: scale(1.05);
        }
        .mkt-card-img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
        }


        /* Slots bar */
        .mkt-bar-bg { background: #f0eef9; border-radius: 99px; height: 6px; overflow: hidden; }
        .mkt-bar-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, #7c5cfc, #a78bfa);
          transition: width 0.8s cubic-bezier(0.34,1.2,0.64,1);
        }
        .mkt-bar-fill.warn { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

        /* Join button */
        .mkt-join-btn {
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .mkt-join-btn.primary {
          background: linear-gradient(135deg, #7c5cfc 0%, #6366f1 100%);
          color: #fff;
          box-shadow: 0 4px 16px rgba(124,92,252,0.3);
        }
        .mkt-join-btn.primary:hover {
          box-shadow: 0 8px 24px rgba(124,92,252,0.4);
          transform: translateY(-1px);
        }
        .mkt-join-btn.fund {
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
          color: #fff;
          box-shadow: 0 4px 16px rgba(245,158,11,0.28);
        }
        .mkt-join-btn.fund:hover { box-shadow: 0 8px 24px rgba(245,158,11,0.38); transform: translateY(-1px); }
        .mkt-join-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; }
        .mkt-join-btn:active:not(:disabled) { transform: scale(0.98) !important; }

        /* Filter pills */
        .mkt-pill {
          padding: 8px 18px;
          border-radius: 99px;
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          cursor: pointer;
          border: 1.5px solid #ede9fe;
          background: #fff;
          color: #9b8fc2;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .mkt-pill:hover { border-color: #c4b5fd; color: #6d4fc8; }
        .mkt-pill.active {
          background: linear-gradient(135deg, #7c5cfc, #6366f1);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(124,92,252,0.28);
        }

        /* Search box */
        .mkt-search-wrap { position: relative; }
        .mkt-search-input {
          width: 100%;
          background: #fff;
          border: 1.5px solid #ede9fe;
          border-radius: 14px;
          padding: 14px 18px 14px 50px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: #1a1230;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .mkt-search-input::placeholder { color: #b8addb; }
        .mkt-search-input:focus { border-color: #7c5cfc; box-shadow: 0 0 0 4px rgba(124,92,252,0.1); }
        .mkt-search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #b8addb; font-size: 14px; pointer-events: none; }

        /* Category badge on card */
        .mkt-cat-badge {
          display: inline-block;
          padding: 3px 9px;
          border-radius: 6px;
          background: #f0eef9;
          color: #7c5cfc;
          font-size: 10px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* Urgency dot */
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
        .mkt-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
        .mkt-dot.urgent { background: #f59e0b; animation: pulse-dot 1.4s ease-in-out infinite; }
        .mkt-dot.ok { background: #10b981; }

        /* Modal */
        @keyframes modalIn { from{opacity:0;transform:scale(0.94) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .mkt-modal { animation: modalIn 0.28s cubic-bezier(0.34,1.2,0.64,1) forwards; }

        /* Skeleton */
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .mkt-skeleton {
          background: linear-gradient(90deg, #f5f3ff 25%, #ede9fe 50%, #f5f3ff 75%);
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite;
          border-radius: 8px;
        }

        /* Verified badge */
        .mkt-verified { color: #7c5cfc; font-size: 11px; }

        /* No-scroll bar */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Spin */
        @keyframes spin { to { transform: rotate(360deg); } }
        .fa-spin { animation: spin 0.8s linear infinite; display: inline-block; }
      `}</style>

      <div className="mkt-root" style={{ position: "relative" }}>
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
              className="mkt-modal"
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
                  className="mkt-heading"
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
                      fontFamily: "'Syne',sans-serif",
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
                <div className="mkt-bar-bg" style={{ marginBottom: 10 }}>
                  <div
                    className="mkt-bar-fill"
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
                  className="mkt-join-btn primary"
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
                        fontFamily: "'Syne',sans-serif",
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
                  fontFamily: "'Syne',sans-serif",
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
        <div>
          <p
            className="mkt-heading"
            style={{
              margin: "0 0 4px",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#a78bfa",
            }}
          >
            Browse &amp; Subscribe
          </p>
          <h2
            className="mkt-heading"
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 800,
              color: "#1a1230",
              lineHeight: 1.2,
            }}
          >
            Shared Plans Marketplace
          </h2>
        </div>

        {/* ── Search + Filters ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 32,
            marginTop: 8,
          }}
        >
          <div className="mkt-search-wrap" style={{ maxWidth: 560 }}>
            <i className="fa-solid fa-magnifying-glass mkt-search-icon" />
            <input
              className="mkt-search-input"
              type="text"
              placeholder="Search Netflix, Spotify, Canva..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div
            style={{ display: "flex", gap: 8, overflowX: "auto" }}
            className="no-scrollbar"
          >
            {["All", ...Object.keys(ProductCategory)].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`mkt-pill ${filter === f ? "active" : ""}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        {isLoading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
              gap: 20,
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  border: "1.5px solid #f0eef9",
                  background: "#fff",
                }}
              >
                <div className="mkt-skeleton" style={{ height: 160 }} />
                <div style={{ padding: "18px 18px 20px" }}>
                  <div
                    className="mkt-skeleton"
                    style={{ height: 14, width: "65%", marginBottom: 10 }}
                  />
                  <div
                    className="mkt-skeleton"
                    style={{ height: 10, width: "90%", marginBottom: 6 }}
                  />
                  <div
                    className="mkt-skeleton"
                    style={{ height: 10, width: "75%", marginBottom: 20 }}
                  />
                  <div
                    className="mkt-skeleton"
                    style={{ height: 44, borderRadius: 12 }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
              gap: 20,
            }}
          >
            {filteredProducts.map((account) => {
              const pct = slotsPercent(account);
              const low = isLow(account);
              const needsFund = user && user.balance < account.price;
              return (
                <div
                  key={account.id}
                  className="mkt-card"
                  onMouseEnter={() => setHoveredCard(account.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Card Header — gradient band with circular logo */}
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
                      padding: "24px 18px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      position: "relative",
                    }}
                  >
                    {/* Circular image */}
                    <div className="mkt-card-img-wrap">
                      <img
                        className="mkt-card-img"
                        src={account.icon_url}
                        alt={account.service_name}
                      />
                    </div>

                    {/* Price + urgency stacked on the right */}
                    <div
                      style={{
                        textAlign: "right",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          background: "#fff",
                          borderRadius: 10,
                          padding: "7px 12px",
                          border: "1.5px solid #ede9fe",
                          boxShadow: "0 2px 8px rgba(124,92,252,0.1)",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontFamily: "'Syne',sans-serif",
                            fontWeight: 800,
                            fontSize: 15,
                            color: "#1a1230",
                            lineHeight: 1.1,
                          }}
                        >
                          ₦{account.price.toLocaleString()}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 9,
                            fontFamily: "'Syne',sans-serif",
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
                            padding: "3px 8px",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <span className="mkt-dot urgent" />
                          <span
                            style={{
                              fontSize: 9,
                              fontFamily: "'Syne',sans-serif",
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

                  {/* Body */}
                  <div
                    style={{
                      padding: "18px 18px 20px",
                      display: "flex",
                      flexDirection: "column",
                      flexGrow: 1,
                      gap: 12,
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
                          className="mkt-heading"
                          style={{
                            margin: 0,
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#1a1230",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "75%",
                          }}
                        >
                          {account.service_name}
                        </h3>
                        {account.owner?.is_verified && (
                          <i
                            className="fa-solid fa-circle-check mkt-verified"
                            title="Verified seller"
                          />
                        )}
                      </div>
                      <span className="mkt-cat-badge">{account.category}</span>
                    </div>

                    {/* Slots */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 6,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <span
                            className={`mkt-dot ${low ? "urgent" : "ok"}`}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              fontFamily: "'DM Sans',sans-serif",
                              color: "#9b8fc2",
                              fontWeight: 500,
                            }}
                          >
                            {account.available_slots} of {account.total_slots}{" "}
                            slots open
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: "'Syne',sans-serif",
                            fontWeight: 700,
                            color: low ? "#f59e0b" : "#7c5cfc",
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="mkt-bar-bg">
                        <div
                          className={`mkt-bar-fill ${low ? "warn" : ""}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Seller info */}
                    {account.owner && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <img
                          src={
                            account.owner.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(account.owner.username || "U")}&background=ede9fe&color=7c5cfc&size=32`
                          }
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "1.5px solid #ede9fe",
                          }}
                          alt={account.owner.username}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            color: "#b8addb",
                            fontWeight: 400,
                          }}
                        >
                          @{account.owner.username}
                        </span>
                        {account.owner.merchant_rating && (
                          <span
                            style={{
                              marginLeft: "auto",
                              fontSize: 11,
                              color: "#f59e0b",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            <i
                              className="fa-solid fa-star"
                              style={{ fontSize: 9 }}
                            />
                            {account.owner.merchant_rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      className={`mkt-join-btn ${needsFund ? "fund" : "primary"}`}
                      disabled={isProcessing === account.id}
                      onClick={() => handleJoin(account)}
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
              padding: "64px 32px",
              background: "#fafafe",
              borderRadius: 20,
              border: "1.5px dashed #ede9fe",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "#f0eef9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <i
                className="fa-solid fa-magnifying-glass"
                style={{ color: "#c4b5fd", fontSize: 20 }}
              />
            </div>
            <p
              className="mkt-heading"
              style={{
                margin: 0,
                color: "#b8addb",
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              No active slots found
            </p>
            <p style={{ margin: "6px 0 0", color: "#c4b5fd", fontSize: 13 }}>
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </>
  );
};
