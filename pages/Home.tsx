import { Faq } from "@/components/Faq";
import { Features } from "@/components/Features";
import Footer from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { PopularServices } from "@/components/PopularServices";
import { SubscriptionList } from "@/components/sharing/SubscriptionList";

const Home = () => {
  return (
    <div className="animate-in fade-in duration-700">
      <Hero />
      <PopularServices />
      <HowItWorks />
      <Features />
      <div className="container mx-auto max-w-6xl px-4 py-20" id="marketplace">
        <SubscriptionList />
      </div>
      <Faq />
      <Footer />
    </div>
  );
};

export default Home;
