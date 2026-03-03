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
      <div className="container mx-auto max-w-6xl px-4 py-20" id="marketplace">
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
