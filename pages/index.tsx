import React, { useEffect, useState } from "react";
import Home from "./Home";
import { Dashboard } from "@/components/Dashboard";
import { Hero } from "@/components/Hero";
import AdminDashboard from "./AdminDashboard";
import AboutUs from "@/components/AboutUs";
import ContactUs from "@/components/ContactUs";
import { useNavigator } from "@/providers/navigator";
import { useAuth } from "@/providers/auth";
import ComingSoon from "./ComingSoon";
import { SyncLoader } from "react-spinners";
import VerifyEmailScreen from "@/components/VerifyEmailScreen";

const View = () => {
  const { currentView, isReady } = useNavigator();
  const {
    user,
    session,
    emailVerified,
    refreshSession,
    loading,
    resendVerificationEmail,
  } = useAuth();
  const [showStuckHelp, setShowStuckHelp] = useState(false);

  useEffect(() => {
    if (!loading && isReady) {
      setShowStuckHelp(false);
      return;
    }
    const t = setTimeout(() => setShowStuckHelp(true), 6000);
    return () => clearTimeout(t);
  }, [loading, isReady]);

  if (loading || !isReady) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-6 px-4">
        <SyncLoader color="#4F46E5" />
        {showStuckHelp && (
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-100 shadow-sm p-5 text-center">
            <p className="text-slate-900 font-black text-sm mb-1">
              Still loading…
            </p>
            <p className="text-slate-500 text-xs mb-4">
              This usually means auth initialization is stuck (often due to a
              bad cached session).
            </p>

            <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4 text-left">
              <div>
                <span className="font-bold">auth.loading</span>:{" "}
                {String(loading)}
              </div>
              <div>
                <span className="font-bold">navigator.isReady</span>:{" "}
                {String(isReady)}
              </div>
              <div>
                <span className="font-bold">session</span>:{" "}
                {session ? "present" : "none"}
              </div>
              <div>
                <span className="font-bold">emailVerified</span>:{" "}
                {String(emailVerified)}
              </div>
            </div>

            <button
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all text-xs"
              onClick={refreshSession}
            >
              Reset session and reload
            </button>
          </div>
        )}
      </div>
    );
  }

  if (currentView === "verify-email") {
    const email = session?.user?.email ?? "";
    const resend = email
      ? async () => {
          await resendVerificationEmail(email);
          refreshSession();
        }
      : undefined;
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-slate-50 to-white p-4">
        <VerifyEmailScreen
          email={email}
          onDismiss={() => {}}
          onResend={resend}
          autoResend
        />
      </div>
    );
  }

  switch (currentView) {
    case "home":
      return <Home />;
    case "marketplace":
      return <ComingSoon />;
    case "dashboard":
    case "settings":
      return user ? <Dashboard /> : <Hero />;
    case "admin":
      return user?.isAdmin ? (
        <AdminDashboard />
      ) : user ? (
        <Dashboard />
      ) : (
        <Hero />
      );
    case "about":
      return <AboutUs />;
    case "contact":
      return <ContactUs />;
    default:
      return <Hero />;
  }
};

export default View;
