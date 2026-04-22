import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ChatPopup from "@/components/ChatPopup";

const Index = () => (
  <div className="min-h-screen">
    <Header />
    <HeroSection />
    <FeaturesSection />
    <Footer />
    <ChatPopup />
  </div>
);

export default Index;
