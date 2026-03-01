import React from "react";
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
// import AdminDashboard from "@/components/AdminDashboard";

const View = () => {
  const { currentView, isReady } = useNavigator();
  const { user, logout, refreshSession, loading } = useAuth();

  if (loading || !isReady) {
    return (
      <div className="flex items-center justify-center flex-1">
        <SyncLoader color="#4F46E5" />
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
        <AdminDashboard user={user} onRefreshUser={refreshSession} />
      ) : user ? (
        <Dashboard user={user} onLogout={logout} />
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
