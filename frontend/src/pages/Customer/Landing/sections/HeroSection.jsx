// Yoga T20 - Hero Section

import { useNavigate } from "react-router-dom";
import { getSubscriptionRedirect } from "../../../../utils/subscriptionGuard";
import yogaHero from "../../../../assets/yoga-hero.png";

export default function HeroSection() {
  const navigate = useNavigate();

  const handleStartJourney = () => {
    const intendedPath = "/programs/yogat20/tenure";
    const redirect = getSubscriptionRedirect(intendedPath);
    navigate(redirect || intendedPath);
  };

  const handleConsultDoctor = () => {
    navigate("/book-doctor");
  };

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute -top-16 -left-16 sm:-top-24 sm:-left-24 lg:-top-28 lg:-left-28 opacity-30 pointer-events-none select-none">
        <img
          src="/images/bg-pattern.png"
          alt="background pattern"
          className="w-[180px] sm:w-[280px] lg:w-[420px] h-auto object-contain"
        />
      </div>

      <div className="max-w-[1500px] mx-auto px-5 sm:px-10 lg:px-16 pt-6 sm:pt-8 lg:pt-10 pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] items-center gap-6 lg:gap-2">
          {/* LEFT — Copy + CTAs */}
          <div className="relative z-10 max-w-[820px] mx-auto lg:mx-0 text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-[26px] sm:text-[36px] lg:text-[50px] leading-[1.15] lg:leading-[1.05] font-bold text-[#0F172A] mb-3 sm:mb-5 lg:mb-6">
              Achieve your Results <br />
              with <span className="text-orange-500">yoga & Meditation</span>
            </h1>

            <p className="text-[#475569] text-[14px] sm:text-[16px] lg:text-[20px] leading-[1.6] mb-6 sm:mb-8 lg:mb-10 max-w-[540px] mx-auto lg:mx-0">
              Build a Yoga Habit That Actually Sticks — in Just 20 Minutes a Day
            </p>

            <div className="flex flex-col gap-3 lg:gap-4 max-w-[280px] sm:max-w-[320px] mx-auto lg:mx-0">
              <button
                onClick={handleStartJourney}
                className="bg-orange-500 hover:bg-orange-600 text-white text-[14px] sm:text-[16px] lg:text-[17px] font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-[0_8px_24px_rgba(249,115,22,0.28)] transition-all"
              >
                Start Your Yoga T20 Journey
              </button>

              <button
                onClick={handleConsultDoctor}
                className="border border-gray-300 hover:border-orange-400 hover:text-orange-500 text-gray-700 text-[14px] sm:text-[16px] lg:text-[17px] font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-white transition-all"
              >
                Consult A Doctor Now
              </button>
            </div>
          </div>

          {/* RIGHT — Yoga pose */}
          <div className="relative flex items-center justify-center order-1 lg:order-2 min-h-[340px] sm:min-h-[480px] lg:min-h-[620px]">
            {/* Peach Circle */}
            <div
              className="
                absolute
                right-[15%] sm:right-[12%] lg:right-[8%]
                top-[52%]
                -translate-y-1/2
                w-[260px] h-[260px]
                sm:w-[380px] sm:h-[380px]
                lg:w-[520px] lg:h-[520px]
                rounded-full
                bg-[#F9EEDF]
              "
            />

            {/* Girl */}
            <img
              src={yogaHero}
              alt="Yoga warrior pose"
              className="
                relative z-10
                w-[360px] sm:w-[540px] lg:w-[860px]
                h-auto
                object-contain
                translate-x-4 sm:translate-x-6 lg:translate-x-8
              "
            />
          </div>
        </div>
      </div>
    </section>
  );
}