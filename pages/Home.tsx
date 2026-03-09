import { Faq } from "@/components/Faq";
import { Features } from "@/components/Features";
import Footer from "@/components/Footer";
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

  return (
    <div className="animate-in fade-in duration-700">
      <Hero
        onGetStarted={() => (user ? changeView("dashboard") : openLoginModal())}
      />
      <PopularServices />
      <HowItWorks />
      <Features />
      <div className="container mx-auto max-w-6xl px-4 py-20" id="marketplace">
        <Marketplace />
      </div>
      <Faq />
      <Footer />
    </div>
  );
};

export default Home;
