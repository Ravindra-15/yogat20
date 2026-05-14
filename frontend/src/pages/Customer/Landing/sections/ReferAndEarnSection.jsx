// Yoga T20 - Refer and Earn Section
// Matches figma exactly: grey card with orange circular hero, 3-step process line

import { Zap, Crown, Users } from "lucide-react";

const steps = [
  {
    id: 1,
    icon: Zap,
    label: "Share your\ninvite link",
  },
  {
    id: 2,
    icon: Crown,
    label: "Your friend gets 30\nDays of Yoga T20",
  },
  {
    id: 3,
    icon: Users,
    label: "You receive 30 Days of\nYoga T20 Subscription",
  },
];

export default function ReferAndEarnSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Outer light-grey card */}
        <div className="relative bg-gray-100/70 rounded-[28px] sm:rounded-[36px] overflow-hidden px-6 sm:px-10 lg:px-14 py-10 sm:py-12 lg:py-14">

          {/* Decorative orange circular hero — top right */}
          <div className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 lg:-top-10 lg:-right-10 w-32 h-32 sm:w-44 sm:h-44 lg:w-52 lg:h-52 pointer-events-none">
            <div className="relative w-full h-full">
              {/* Orange gradient circle */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-[0_10px_40px_rgba(249,115,22,0.35)]" />
              {/* White star icon in middle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="white"
                  className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 drop-shadow-md"
                >
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6L12 2z" />
                </svg>
              </div>
              {/* Inner highlight (glossy effect) */}
              <div className="absolute top-3 left-4 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white/20 blur-md" />
            </div>
          </div>

          {/* HEADING */}
          <div className="text-center mb-10 sm:mb-14 relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Refer and Earn
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-700">
              Wellness is better with friends{" "}
              <span aria-label="party emoji" role="img">
                🎉
              </span>
            </p>
          </div>

          {/* STEPS — 3 icons connected by dotted line */}
          <div className="relative max-w-4xl mx-auto">

            {/* Dotted connecting line — desktop only, positioned behind icons */}
            <div className="hidden md:block absolute top-5 left-[16%] right-[16%] border-t-2 border-dotted border-gray-300" />

            {/* 3 steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative z-10">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center text-center"
                  >
                    {/* Icon circle */}
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-900 flex items-center justify-center shadow-md mb-4">
                      <Icon size={18} className="text-white" />
                    </div>
                    {/* Label */}
                    <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line leading-relaxed">
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}