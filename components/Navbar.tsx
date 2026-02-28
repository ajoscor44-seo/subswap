import React, { useState } from "react";
import { useNavigator } from "@/providers/navigator";
import { useAuth } from "@/providers/auth";

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentView, changeView } = useNavigator();
  const { openLoginModal, logout, user, loading } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-6 lg:gap-10">
            <div
              onClick={() => changeView("home")}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl transition-transform group-hover:scale-110">
                S
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter hidden sm:inline">
                SUBSWAP
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => changeView("marketplace")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentView === "marketplace" ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
              >
                Marketplace
              </button>
              <button
                onClick={() => changeView("about")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentView === "about" ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
              >
                About Us
              </button>
              {user && (
                <button
                  onClick={() => changeView("dashboard")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentView === "dashboard" ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
                >
                  My Dashboard
                </button>
              )}
              {user?.isAdmin && (
                <button
                  onClick={() => changeView("admin")}
                  className={`px-4 py-2 rounded-lg text-sm font-black transition-all ${currentView === "admin" ? "bg-slate-900 text-white shadow-lg" : "text-indigo-600 hover:bg-indigo-50"}`}
                >
                  <i className="fa-solid fa-shield-halved mr-2"></i>
                  Admin Panel
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center">
            {loading ? (
              <div className="flex items-center justify-center flex-1">
                <i className="fa-solid fa-spinner fa-spin text-slate-400"></i>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {user ? (
                  <div className="flex items-center gap-2 md:gap-4">
                    <button
                      onClick={() => changeView("dashboard")}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 font-black text-xs uppercase tracking-widest hover:bg-emerald-100 transition-all"
                    >
                      <i className="fa-solid fa-plus-circle"></i>
                      <span>Top Up</span>
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all"
                      >
                        <img
                          src={user.avatar}
                          className="h-8 w-8 rounded-full border border-white shadow-sm"
                          alt="Avatar"
                        />
                        <div className="text-left hidden sm:block">
                          <p className="text-xs font-black text-slate-900 leading-none">
                            ₦{user.balance.toLocaleString()}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                            Balance
                          </p>
                        </div>
                        <i
                          className={`fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                        ></i>
                      </button>

                      {isDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 animate-in fade-in slide-in-from-top-2">
                          <div className="px-4 py-3 border-b border-slate-100 mb-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                              Account
                            </p>
                            <p className="text-sm font-black text-slate-900 truncate">
                              @{user.username}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              changeView("dashboard");
                              setIsDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <i className="fa-solid fa-wallet mr-2"></i> Wallet &
                            Fund
                          </button>
                          <button
                            onClick={() => {
                              changeView("transactions");
                              setIsDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <i className="fa-solid fa-receipt mr-2"></i> History
                          </button>
                          <button
                            onClick={() => {
                              changeView("dashboard");
                              setIsDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <i className="fa-solid fa-layer-group mr-2"></i> My
                            Stacks
                          </button>
                          {user.isAdmin && (
                            <button
                              onClick={() => {
                                changeView("admin");
                                setIsDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm font-black text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                              <i className="fa-solid fa-gauge-high mr-2"></i>{" "}
                              Admin Dashboard
                            </button>
                          )}
                          <button
                            onClick={() => {
                              logout();
                              setIsDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i>{" "}
                            Log Out
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={openLoginModal}
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
                  >
                    Sign In
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
