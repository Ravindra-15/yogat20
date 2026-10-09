// Yoga T20 - Landing Page
// Final section order matching figma flow

import { useEffect, useState } from "react";
import {
  captureReferralFromUrl,
  scrollToPricingOnReferral,
} from "../../../utils/referral";
import CustomerNavbar from "../../../components/customer/layout/CustomerNavbar";
import CustomerFooter from "../../../components/customer/layout/CustomerFooter";
import HeroSection from "./sections/HeroSection";
import ConditionsSection from "./sections/ConditionsSection";
import OurStructureSection from "./sections/OurStructureSection";
import WhatYouGetSection from "./sections/WhatYouGetSection";
import PricingSection from "./sections/PricingSection";
import HealingCTASection from "./sections/HealingCTASection";
import FreeTrialCTASection from "./sections/FreeTrialCTASection";
import ReviewsSection from "./sections/ReviewsSection";
import ProgramsSection from "./sections/ProgramsSection";
import FAQSection from "./sections/FAQSection";
import CallbackSection from "./sections/CallbackSection";
import ReferAndEarnSection from "./sections/ReferAndEarnSection";
import WelcomePopup from "./components/WelcomePopup";
import FreeTrialModal from "./components/FreeTrialModal";

import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { isCustomerLoggedIn, buildLoginRedirect } from "../../../utils/customerAuthHelper";
import { fetchTrialStatus } from "../../../services/customerFreeTrialService";

// Only users who've never touched the trial (or were rejected, and can
// resubmit) should see the CTA — anyone who's purchased a plan, is
// pending, or already used a trial gets it hidden for consistency.
const TRIAL_CTA_ELIGIBLE_STATES = ["none", "rejected"];

export default function LandingPage() {
  // 🔗 capture ?ref= referral code from the URL on landing,
  // then take referral visitors straight to the pricing section
  useEffect(() => {
    captureReferralFromUrl();
    return scrollToPricingOnReferral();
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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

  // ============================================
  // 🆓 FREE TRIAL MODAL
  // CTA → not logged in: send to login/signup, then land back here with
  // ?openTrial=1 so the modal auto-opens (same "arrive with a param →
  // auto-open UI" pattern used on the dashboard for ?openProgress=1).
  // ============================================
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  // 🙈 Hide the CTA section entirely once it's not relevant to this user
  // (guests always see it — null = "not checked / show by default").
  const [showTrialCta, setShowTrialCta] = useState(true);

  useEffect(() => {
    if (!isCustomerLoggedIn()) return; // guests: CTA stays visible, nothing to check
    let mounted = true;
    fetchTrialStatus()
      .then((data) => {
        if (mounted) setShowTrialCta(TRIAL_CTA_ELIGIBLE_STATES.includes(data?.state));
      })
      .catch(() => {
        // soft fail — leave the CTA visible rather than risk hiding it wrongly
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (searchParams.get("openTrial") === "1") {
      setTrialModalOpen(true);
      searchParams.delete("openTrial");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleStartTrial = () => {
    if (!isCustomerLoggedIn()) {
      navigate(buildLoginRedirect("/?openTrial=1"));
      return;
    }
    setTrialModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <CustomerNavbar />
      <WelcomePopup />

      <main className="flex-1 w-full">
        <HeroSection />
        {showTrialCta && <FreeTrialCTASection onStartTrial={handleStartTrial} />}
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

      <FreeTrialModal open={trialModalOpen} onClose={() => setTrialModalOpen(false)} />

      <CustomerFooter />
    </div>
  );
}