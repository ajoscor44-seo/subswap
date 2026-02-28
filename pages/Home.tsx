import { Faq } from "@/components/Faq";
import { Features } from "@/components/Features";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Marketplace } from "@/components/Marketplace";
import { PopularServices } from "@/components/PopularServices";
import { useAuth } from "@/providers/auth";
import { useNavigator } from "@/providers/navigator";
import React from "react";

const Home = () => {
  const { user, openLoginModal } = useAuth();
  const { changeView } = useNavigator();

  const handlePurchaseSuccess = () => {
    changeView("dashboard");
  };

  return (
    <div className="animate-in fade-in duration-700">
      <Hero
        onGetStarted={() => (user ? changeView("dashboard") : openLoginModal())}
      />
      <PopularServices />
      <HowItWorks />
      <Features />
      <div className="container mx-auto px-4 py-20" id="marketplace">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">
            Marketplace
          </h2>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Available Premium Stacks
          </h3>
        </div>
        <Marketplace
          user={user}
          onAuthRequired={() => openLoginModal()}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      </div>
      <Faq />
    </div>
  );
};

export default Home;
