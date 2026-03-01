import React from "react";
import { User } from "@/constants/types";

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  activeTab: string;
  onTabChange: (tab: any) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div
                className="shrink-0 flex items-center cursor-pointer"
                onClick={() => onTabChange("marketplace")}
              >
                <span className="text-2xl font-black text-indigo-600 tracking-tighter">
                  DiscountZAR
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => onTabChange("marketplace")}
                  className={`${activeTab === "marketplace" ? "border-indigo-500 text-slate-900" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16 transition-colors`}
                >
                  Marketplace
                </button>
                <button
                  onClick={() => onTabChange("dashboard")}
                  className={`${activeTab === "dashboard" ? "border-indigo-500 text-slate-900" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16 transition-colors`}
                >
                  My Subscriptions
                </button>
                {/* Fixed: Use isAdmin instead of role */}
                {user?.isAdmin && (
                  <button
                    onClick={() => onTabChange("admin")}
                    className={`${activeTab === "admin" ? "border-indigo-500 text-slate-900" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16 transition-colors`}
                  >
                    Admin Panel
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-900">
                      {user.email}
                    </p>
                    {/* Fixed: Use isAdmin to display role */}
                    <p className="text-xs text-slate-500 uppercase tracking-widest">
                      {user.isAdmin ? "Admin" : "User"}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                    {user.email[0].toUpperCase()}
                  </div>
                </div>
              ) : (
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="grow">{children}</main>
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} DiscountZAR Subscription
          Marketplace.
        </div>
      </footer>
    </div>
  );
};
