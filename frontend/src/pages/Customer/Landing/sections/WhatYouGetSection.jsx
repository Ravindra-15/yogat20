// Yoga T20 - "What will you get?" Section
// Tighter circular arrangement — chips orbit closer around center figure

import { Heart, Activity, Bell, Users, Smile } from "lucide-react";
import yogaT20PersonImg from "../../../../assets/yoga-t20-person.png";

const benefits = [
  {
    id: 1,
    title: "Health Activity Tracking",
    description: "Build a clear, historical record of your wellness journey.",
    icon: Heart,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    id: 2,
    title: "Exercise Tracking",
    description: "Watch your daily habits visually close their Targets!",
    icon: Activity,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    id: 3,
    title: "Stand & Move Reminder",
    description: "Experience the motivating energy of group practices.",
    icon: Bell,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    id: 4,
    title: "Community Sessions",
    description: "Experience the motivating energy of group practices.",
    icon: Users,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    id: 5,
    title: "Laughing Therapy",
    description: "Release built-up stress and instantly boost your mood.",
    icon: Smile,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
];

const ChipCard = ({ benefit }) => {
  const Icon = benefit.icon;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_16px_rgba(16,24,40,0.06)] px-5 py-4 max-w-[220px]">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${benefit.bg}`}
      >
        <Icon size={18} className={benefit.color} />
      </div>
      <p className="font-bold text-gray-800 text-sm mb-1">{benefit.title}</p>
      <p className="text-gray-500 text-xs leading-relaxed">
        {benefit.description}
      </p>
    </div>
  );
};

export default function WhatYouGetSection() {
  return (
    <section className="py-14 lg:py-20 bg-white">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADING */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-teal-900 mb-2">
            What will you{" "}
            <span className="text-orange-500">get</span> ?
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            Lets List out the Benefits of the Yoga T20 Program
          </p>
        </div>

        {/* DESKTOP — Tight circular floating layout (xl and up) */}
        <div className="hidden xl:block relative h-[640px] max-w-[1100px] mx-auto">

          {/* Center yoga image */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
            <img
              src={yogaT20PersonImg}
              alt="Yoga T20 practitioner"
              className="w-[420px] h-[560px] object-contain"
            />
          </div>

          {/* Top-left chip — closer to center */}
          <div className="absolute top-20 left-[120px] z-10">
            <ChipCard benefit={benefits[0]} />
          </div>

          {/* Top-center chip */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
            <ChipCard benefit={benefits[1]} />
          </div>

          {/* Top-right chip — closer to center */}
          <div className="absolute top-20 right-[120px] z-10">
            <ChipCard benefit={benefits[2]} />
          </div>

          {/* Bottom-left chip — closer to center */}
          <div className="absolute bottom-16 left-[160px] z-10">
            <ChipCard benefit={benefits[3]} />
          </div>

          {/* Bottom-right chip — closer to center */}
          <div className="absolute bottom-16 right-[160px] z-10">
            <ChipCard benefit={benefits[4]} />
          </div>
        </div>

        {/* TABLET — Hybrid layout (lg only) */}
        <div className="hidden lg:block xl:hidden">
          <div className="grid grid-cols-3 gap-4 items-center max-w-4xl mx-auto">
            <div className="flex flex-col gap-6">
              <ChipCard benefit={benefits[0]} />
              <ChipCard benefit={benefits[3]} />
            </div>

            <div className="flex flex-col items-center gap-3">
              <ChipCard benefit={benefits[1]} />
              <img
                src={yogaT20PersonImg}
                alt="Yoga T20 practitioner"
                className="w-[260px] h-[360px] object-contain"
              />
            </div>

            <div className="flex flex-col gap-6">
              <ChipCard benefit={benefits[2]} />
              <ChipCard benefit={benefits[4]} />
            </div>
          </div>
        </div>

        {/* MOBILE / SMALL TABLET — Stacked grid (below lg) */}
        <div className="lg:hidden">
          <div className="flex justify-center mb-10">
            <img
              src={yogaT20PersonImg}
              alt="Yoga T20 practitioner"
              className="w-[260px] sm:w-[320px] h-auto object-contain"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto justify-items-center">
            {benefits.map((b) => (
              <ChipCard key={b.id} benefit={b} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}