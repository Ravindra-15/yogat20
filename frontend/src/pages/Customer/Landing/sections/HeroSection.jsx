// Yoga T20 - Hero Section
// Top of landing page: headline, sub-copy, two CTAs, peach circle with yoga pose
// Replace dummy unsplash URL with /assets/yoga-hero.png when image is ready

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
      {/* Decorative mandala (top-left) */}
      <div className="absolute top-8 left-4 w-28 h-28 opacity-30 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#FB923C"
            strokeWidth="0.5"
          />
          <circle
            cx="50"
            cy="50"
            r="30"
            fill="none"
            stroke="#FB923C"
            strokeWidth="0.5"
          />
          <circle
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke="#FB923C"
            strokeWidth="0.5"
          />
          {[...Array(8)].map((_, i) => (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={50 + 40 * Math.cos((i * Math.PI) / 4)}
              y2={50 + 40 * Math.sin((i * Math.PI) / 4)}
              stroke="#FB923C"
              strokeWidth="0.5"
            />
          ))}
        </svg>
      </div>

      <div className="max-w-[1500px] mx-auto pl-8 pr-4 sm:pl-12 sm:pr-8 lg:pl-16 lg:pr-10 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.25fr] items-center">
          {/* LEFT — Copy + CTAs */}
          <div className="relative z-10 max-w-[620px]">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Achieve your Results <br />
              with <span className="text-orange-500">yoga & Meditation</span>
            </h1>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
              Build a Yoga Habit That Actually Sticks — in Just 20 Minutes a Day
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleStartJourney}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-7 py-3.5 rounded-full shadow-[0_4px_14px_rgba(249,115,22,0.35)] transition-colors"
              >
                Start Your Yoga T20 Journey
              </button>

              <button
                onClick={handleConsultDoctor}
                className="border-2 border-gray-300 hover:border-orange-400 hover:text-orange-500 text-gray-700 text-sm font-semibold px-7 py-3.5 rounded-full transition-colors"
              >
                Consult A Doctor Now
              </button>
            </div>
          </div>

          {/* RIGHT — Yoga pose with peach circle background */}
          <div className="relative flex items-center justify-end min-h-[560px]">
            <div className="absolute w-[480px] h-[480px] lg:w-[560px] lg:h-[560px] rounded-full bg-orange-100/70" />

            <img
              src={yogaHero}
              alt="Yoga warrior pose"
              className="relative z-10 w-[380px] sm:w-[450px] lg:w-[580px] h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
