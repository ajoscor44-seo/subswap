import React, { useState, useEffect } from "react";
import { useNavigator } from "@/providers/navigator";
import { useAuth } from "@/providers/auth";
import Logo from "./Logo";

const NAV_LINKS = [
  { id: "marketplace", label: "Marketplace", icon: "fa-store" },
  { id: "about", label: "About Us", icon: "fa-circle-info" },
];

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentView, goTo, changeTab } = useNavigator();
  const { openLoginModal, logout, user, loading } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [currentView]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const dropdown = document.querySelector(".nb-dropdown");
      const balanceBtn = document.querySelector(".nb-balance");
      if (
        dropdown &&
        !dropdown.contains(e.target as Node) &&
        balanceBtn &&
        !balanceBtn.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const allLinks = [
    ...NAV_LINKS,
    ...(user
      ? [{ id: "dashboard", label: "My Dashboard", icon: "fa-gauge" }]
      : []),
    ...(user?.isAdmin
      ? [{ id: "admin", label: "Admin Panel", icon: "fa-shield-halved" }]
      : []),
  ];

  return (
    <>
      <style>{`
        .nb * { box-sizing: border-box; }

        /* ── Desktop nav pill ── */
        .nb-link {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 10px; border: none;
          background: none; cursor: pointer;
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em;
          color: #9b8fc2; transition: all 0.18s;
        }
        .nb-link:hover    { background: #f5f3ff; color: #7c5cfc; }
        .nb-link.active   { background: #f0eef9; color: #7c5cfc; }
        .nb-link.admin    { color: #ef4444; }
        .nb-link.admin:hover   { background: #fef2f2; }
        .nb-link.admin.active  { background: #fef2f2; color: #ef4444; }

        /* ── Balance chip ── */
        .nb-balance {
          display: flex; align-items: center; gap: 10px;
          padding: 6px 14px 6px 6px;
          border-radius: 99px; border: 1.5px solid #f0eef9;
          background: #fafafe; cursor: pointer; transition: all 0.18s;
        }
        .nb-balance:hover { border-color: #d8d0f8; background: #f5f3ff; }

        /* ── Dropdown ── */
        .nb-dropdown {
          position: absolute; right: 0; top: calc(100% + 10px);
          width: 220px; border-radius: 18px;
          background: #fff; border: 1.5px solid #f0eef9;
          box-shadow: 0 16px 40px rgba(26,18,48,0.12);
          overflow: hidden;
          animation: nbDrop 0.18s cubic-bezier(0.34,1.4,0.64,1);
          z-index: 200;
        }
        @keyframes nbDrop {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .nb-dd-item {
          width: 100%; text-align: left; padding: 10px 16px;
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          color: #1a1230; transition: background 0.15s;
        }
        .nb-dd-item i { width: 16px; text-align: center; color: #b8addb; font-size: 12px; }
        .nb-dd-item:hover { background: #fafafe; }
        .nb-dd-item.danger { color: #ef4444; }
        .nb-dd-item.danger i { color: #fca5a5; }
        .nb-dd-item.danger:hover { background: #fef2f2; }
        .nb-dd-item.admin-link { color: #7c5cfc; }
        .nb-dd-item.admin-link i { color: #a78bfa; }
        .nb-dd-item.admin-link:hover { background: #f5f3ff; }

        /* ── Hamburger — 3 lines that morph to X ── */
        .nb-burger {
          width: 38px; height: 38px; border-radius: 11px;
          border: 1.5px solid #f0eef9; background: #fafafe;
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 5px; cursor: pointer;
          transition: all 0.2s; padding: 0; flex-shrink: 0;
        }
        .nb-burger:hover { border-color: #d8d0f8; background: #f5f3ff; }
        .nb-burger span {
          display: block; height: 2px; border-radius: 99px;
          background: #7c5cfc; transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          transform-origin: center;
        }
        .nb-burger span:nth-child(1) { width: 18px; }
        .nb-burger span:nth-child(2) { width: 12px; }
        .nb-burger span:nth-child(3) { width: 18px; }
        .nb-burger.open span:nth-child(1) { width: 18px; transform: translateY(7px) rotate(45deg); }
        .nb-burger.open span:nth-child(2) { width: 0; opacity: 0; }
        .nb-burger.open span:nth-child(3) { width: 18px; transform: translateY(-7px) rotate(-45deg); }

        /* ── Mobile drawer ── */
        .nb-drawer-overlay {
          position: fixed; inset: 0; z-index: 90;
          background: rgba(26,18,48,0.4); backdrop-filter: blur(4px);
          animation: nbFadeIn 0.2s ease;
        }
        .nb-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(320px, 88vw); z-index: 91;
          background: #fff; padding: 0;
          box-shadow: -20px 0 60px rgba(26,18,48,0.18);
          display: flex; flex-direction: column;
          animation: nbSlideIn 0.28s cubic-bezier(0.34,1,0.64,1);
        }
        @keyframes nbFadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes nbSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

        .nb-drawer-header {
          padding: 20px 20px 0;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1.5px solid #f0eef9; padding-bottom: 16px;
        }
        .nb-drawer-close {
          width: 34px; height: 34px; border-radius: 10px;
          border: 1.5px solid #f0eef9; background: #fafafe;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.18s; flex-shrink: 0;
          font-size: 12px; color: #b8addb;
        }
        .nb-drawer-close:hover { border-color: #d8d0f8; background: #f5f3ff; color: #7c5cfc; }

        /* Mobile nav items */
        .nb-mob-link {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 20px; background: none; border: none;
          cursor: pointer; text-align: left; width: 100%;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600;
          color: #1a1230; transition: all 0.15s; border-radius: 0;
        }
        .nb-mob-link .nb-mob-icon {
          width: 38px; height: 38px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 15px; transition: all 0.15s;
          background: #f5f3ff; color: #a78bfa;
        }
        .nb-mob-link:hover { background: #fafafe; }
        .nb-mob-link:hover .nb-mob-icon { background: #ede9fe; color: #7c5cfc; }
        .nb-mob-link.active { background: #f5f3ff; }
        .nb-mob-link.active .nb-mob-icon { background: linear-gradient(135deg,#7c5cfc,#6366f1); color: #fff; box-shadow: 0 4px 10px rgba(124,92,252,0.3); }
        .nb-mob-link.active .nb-mob-label { color: #7c5cfc; font-weight: 700; }
        .nb-mob-link.admin-mob .nb-mob-icon { background: #fef2f2; color: #f87171; }
        .nb-mob-link.admin-mob:hover .nb-mob-icon { background: #fee2e2; color: #ef4444; }

        /* Mobile user card inside drawer */
        .nb-mob-user {
          margin: 16px; border-radius: 16px; padding: 16px;
          background: linear-gradient(135deg,#1a1230,#2d1f6e);
          position: relative; overflow: hidden;
        }
        .nb-mob-user::after {
          content:''; position:absolute; bottom:-30px; right:-30px;
          width:100px; height:100px; border-radius:50%;
          background:rgba(124,92,252,0.15); pointer-events:none;
        }
      `}</style>

      {/* ── Mobile drawer overlay + panel ── */}
      {menuOpen && (
        <>
          <div
            className="nb-drawer-overlay"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="nb-drawer nb">
            {/* Drawer header */}
            <div className="nb-drawer-header">
              <Logo />
              <button
                className="nb-drawer-close"
                onClick={() => setMenuOpen(false)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* User card (when logged in) */}
            {user && (
              <div
                className="nb-mob-user"
                style={{ position: "relative", zIndex: 1 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid rgba(255,255,255,0.2)",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={
                        user.avatar ||
                        `https://ui-avatars.com/api/?name=${user.username}&background=ede9fe&color=7c5cfc&size=36`
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      alt=""
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: "0 0 2px",
                        fontFamily: "'Syne',sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#fff",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      @{user.username}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: 12,
                        color: "rgba(255,255,255,0.45)",
                      }}
                    >
                      ₦{user.balance.toLocaleString()} balance
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      goTo("dashboard");
                      changeTab("wallet");
                      setMenuOpen(false);
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 9,
                      border: "none",
                      cursor: "pointer",
                      background: "rgba(255,255,255,0.12)",
                      flexShrink: 0,
                      fontFamily: "'Syne',sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.07em",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <i className="fa-solid fa-plus" style={{ fontSize: 9 }} />{" "}
                    Top Up
                  </button>
                </div>
              </div>
            )}

            {/* Nav links */}
            <div style={{ flex: 1, overflowY: "auto", paddingTop: 8 }}>
              <p
                style={{
                  margin: "0 20px 6px",
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.12em",
                  color: "#c4b5fd",
                }}
              >
                Navigation
              </p>
              {allLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => goTo(link.id as any)}
                  className={`nb-mob-link ${currentView === link.id ? "active" : ""} ${link.id === "admin" ? "admin-mob" : ""}`}
                >
                  <span className="nb-mob-icon">
                    <i className={`fa-solid ${link.icon}`} />
                  </span>
                  <span className="nb-mob-label">{link.label}</span>
                  {currentView === link.id && (
                    <i
                      className="fa-solid fa-chevron-right"
                      style={{
                        marginLeft: "auto",
                        fontSize: 10,
                        color: "#a78bfa",
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Drawer footer */}
            <div
              style={{ borderTop: "1.5px solid #f0eef9", padding: "12px 16px" }}
            >
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: "#fef2f2",
                    border: "1.5px solid #fecaca",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.07em",
                    color: "#ef4444",
                    transition: "all 0.18s",
                  }}
                >
                  <i className="fa-solid fa-arrow-right-from-bracket" />
                  Log Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    openLoginModal();
                    setMenuOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg,#7c5cfc,#6366f1)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.08em",
                    color: "#fff",
                    boxShadow: "0 4px 14px rgba(124,92,252,0.35)",
                  }}
                >
                  <i className="fa-solid fa-arrow-right-to-bracket" />
                  Sign In
                </button>
              )}
            </div>
          </aside>
        </>
      )}

      {/* ── Navbar ── */}
      <nav
        className="nb sticky top-0 z-50"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1.5px solid #f0eef9",
        }}
      >
        <div className="max-w-300 mx-auto px-5">
          <div className="flex items-center justify-between h-17 gap-3">
            {/* Logo */}
            <Logo />

            {/* ── Desktop nav links (hidden on mobile) ── */}
            <div className="hidden lg:flex items-center gap-1 flex-1 px-4">
              {allLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => goTo(link.id as any)}
                  className={`nb-link ${currentView === link.id ? "active" : ""} ${link.id === "admin" ? "admin" : ""}`}
                >
                  <i className={`fa-solid ${link.icon} text-[11px]`} />
                  {link.label}
                </button>
              ))}
            </div>

            {/* ── Right controls ── */}
            <div className="flex items-center gap-2">
              {loading ? (
                <i className="fa-solid fa-spinner fa-spin text-[#c4b5fd] text-sm" />
              ) : user ? (
                <>
                  {/* Top up — desktop only */}
                  <button
                    onClick={() => {
                      goTo("dashboard");
                      changeTab("wallet");
                    }}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 font-[Syne] text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-all"
                  >
                    <i className="fa-solid fa-plus-circle" />
                    Top Up
                  </button>

                  {/* Balance chip + dropdown — desktop */}
                  <div className="relative hidden lg:block">
                    <button
                      className="nb-balance"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: "2px solid #ede9fe",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={user.avatar}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                          alt=""
                        />
                      </div>
                      <div className="text-left">
                        <p
                          style={{
                            margin: "0 0 1px",
                            fontFamily: "'Syne',sans-serif",
                            fontSize: 13,
                            fontWeight: 800,
                            color: "#1a1230",
                            lineHeight: 1,
                          }}
                        >
                          ₦{user.balance.toLocaleString()}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: "'Syne',sans-serif",
                            fontSize: 9,
                            fontWeight: 700,
                            textTransform: "uppercase" as const,
                            letterSpacing: "0.08em",
                            color: "#c4b5fd",
                            lineHeight: 1,
                          }}
                        >
                          Balance
                        </p>
                      </div>
                      <i
                        className={`fa-solid fa-chevron-down text-[10px] text-[#c4b5fd] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isDropdownOpen && (
                      <>
                        <div className="nb-dropdown">
                          <div
                            style={{
                              padding: "14px 16px 12px",
                              borderBottom: "1.5px solid #f0eef9",
                            }}
                          >
                            <p
                              style={{
                                margin: "0 0 2px",
                                fontFamily: "'Syne',sans-serif",
                                fontSize: 9,
                                fontWeight: 700,
                                textTransform: "uppercase" as const,
                                letterSpacing: "0.1em",
                                color: "#c4b5fd",
                              }}
                            >
                              Account
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontFamily: "'Syne',sans-serif",
                                fontSize: 14,
                                fontWeight: 800,
                                color: "#1a1230",
                              }}
                            >
                              @{user.username}
                            </p>
                          </div>
                          <div style={{ padding: "6px 0" }}>
                            {[
                              {
                                tab: "wallet",
                                label: "Wallet & Fund",
                                icon: "fa-wallet",
                                cls: "",
                              },
                              {
                                tab: "history",
                                label: "History",
                                icon: "fa-receipt",
                                cls: "",
                              },
                              {
                                tab: "stacks",
                                label: "My Stacks",
                                icon: "fa-layer-group",
                                cls: "",
                              },
                            ].map((item) => (
                              <button
                                key={item.tab}
                                className="nb-dd-item"
                                onClick={() => {
                                  goTo("dashboard");
                                  changeTab(item.tab);
                                  setIsDropdownOpen(false);
                                }}
                              >
                                <i className={`fa-solid ${item.icon}`} />{" "}
                                {item.label}
                              </button>
                            ))}
                            {user.isAdmin && (
                              <button
                                className="nb-dd-item admin-link"
                                onClick={() => {
                                  goTo("admin");
                                  setIsDropdownOpen(false);
                                }}
                              >
                                <i className="fa-solid fa-shield-halved" />{" "}
                                Admin Dashboard
                              </button>
                            )}
                            <div
                              style={{
                                height: 1,
                                background: "#f0eef9",
                                margin: "6px 16px",
                              }}
                            />
                            <button
                              className="nb-dd-item danger"
                              onClick={() => {
                                logout();
                                setIsDropdownOpen(false);
                              }}
                            >
                              <i className="fa-solid fa-arrow-right-from-bracket" />{" "}
                              Log Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-xl border-none cursor-pointer font-[Syne] text-[11px] font-bold uppercase tracking-[0.08em] text-white transition-all hover:-translate-y-px"
                  style={{
                    background: "linear-gradient(135deg,#7c5cfc,#6366f1)",
                    boxShadow: "0 4px 14px rgba(124,92,252,0.35)",
                  }}
                >
                  <i className="fa-solid fa-arrow-right-to-bracket text-xs" />
                  Sign In
                </button>
              )}

              {/* ── Hamburger (mobile only) ── */}
              <button
                className={`nb-burger lg:hidden! ${menuOpen ? "open" : ""}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <span />
                <span />
                <span />
              </button>

              {/* Mobile sign in (if not logged in, show beside burger) */}
              {!user && !loading && (
                <button
                  onClick={openLoginModal}
                  className="lg:hidden flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-none cursor-pointer font-[Syne] text-[10px] font-bold uppercase tracking-[0.07em] text-white"
                  style={{
                    background: "linear-gradient(135deg,#7c5cfc,#6366f1)",
                    boxShadow: "0 3px 10px rgba(124,92,252,0.3)",
                  }}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
