// Yoga T20 - Landing Page
// Final section order matching figma flow

import CustomerNavbar from "../../../components/customer/layout/CustomerNavbar";
import CustomerFooter from "../../../components/customer/layout/CustomerFooter";
import HeroSection from "./sections/HeroSection";
import ConditionsSection from "./sections/ConditionsSection";
import OurStructureSection from "./sections/OurStructureSection";
import WhatYouGetSection from "./sections/WhatYouGetSection";
import PricingSection from "./sections/PricingSection";
import HealingCTASection from "./sections/HealingCTASection";
import ReviewsSection from "./sections/ReviewsSection";
import ProgramsSection from "./sections/ProgramsSection";
import FAQSection from "./sections/FAQSection";
import CallbackSection from "./sections/CallbackSection";
import ReferAndEarnSection from "./sections/ReferAndEarnSection";
import WelcomePopup from "./components/WelcomePopup";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <CustomerNavbar />
      <WelcomePopup />

      <main className="flex-1 w-full">
        <HeroSection />
        <ConditionsSection />
        <OurStructureSection />
        <WhatYouGetSection />
        <PricingSection />
        <HealingCTASection />
        <ReviewsSection />
        <ProgramsSection />
        <FAQSection />
        <CallbackSection />
        <ReferAndEarnSection />
      </main>

      <CustomerFooter />
    </div>
  );
}