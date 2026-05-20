// Yoga T20 - Refer and Earn Section

import { Send, Trophy, Users } from "lucide-react";

function StepCircle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center shadow-md mb-4 relative z-10">
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
        {title}
        <br />
        {subtitle}
      </p>
    </div>
  );
}

export default function ReferAndEarnSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gray-50 rounded-3xl border border-gray-100 px-6 sm:px-12 py-10 sm:py-14 mb-10">
          {/* Top-right decorative image */}
          <img
            src="/images/referandearn.png"
            alt=""
            className="absolute -top-6 -right-6 sm:-top-24 sm:-right-24 lg:-top-28 lg:-right-28 w-20 sm:w-64 lg:w-80 pointer-events-none select-none"
          />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Refer and Earn
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Wellness is better with friends{" "}
              <span className="inline-block">👋</span>
            </p>
          </div>

          {/* 3 steps with dashed connector */}
          <div className="relative z-10 mt-10 sm:mt-14">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 relative">
              {/* Dashed line — desktop only */}
              <div
                className="hidden sm:block absolute top-6 left-[16.66%] right-[16.66%] border-t-2 border-dashed border-gray-300"
                aria-hidden
              />

              <StepCircle
                icon={Send}
                title="Share your"
                subtitle="invite link"
              />
              <StepCircle
                icon={Trophy}
                title="Your friend gets 30"
                subtitle="Days of Yoga T20"
              />
              <StepCircle
                icon={Users}
                title="You receive 30 Days of"
                subtitle="Yoga T20 Subscription"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}