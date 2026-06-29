// Yoga T20 - Landing Page
// Final section order matching figma flow

import { useEffect } from "react";
import { captureReferralFromUrl } from "../../../utils/referral";
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

import { useLocation } from "react-router-dom";
export default function LandingPage() {
  // 🔗 capture ?ref= referral code from the URL on landing
  useEffect(() => {
    captureReferralFromUrl();
  }, []);

  const location = useLocation();

  // 📍 scroll to a section when arriving from the footer (state.scrollTo)
  useEffect(() => {
    const target = location.state?.scrollTo;
    if (target) {
      // wait a tick for sections to render
      const t = setTimeout(() => {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [location.state]);

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