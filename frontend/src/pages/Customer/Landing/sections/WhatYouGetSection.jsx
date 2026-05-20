// Yoga T20 - "What will you get?" Section

import { useState, useRef, useEffect } from "react";
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

// Card — fixed size for uniform layout
const ChipCard = ({ benefit, isActive = false }) => {
  const Icon = benefit.icon;
  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl shadow-[0_8px_24px_rgba(16,24,40,0.08)] px-5 py-5 w-[200px] h-[180px] flex flex-col items-center justify-center text-center transition-all duration-300 ${
        isActive ? "scale-110 shadow-[0_12px_32px_rgba(16,24,40,0.15)]" : "scale-100"
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${benefit.bg}`}>
        <Icon size={20} className={benefit.color} />
      </div>
      <p className="font-bold text-gray-800 text-sm mb-1.5 leading-tight">{benefit.title}</p>
      <p className="text-gray-500 text-xs leading-relaxed">{benefit.description}</p>
    </div>
  );
};

export default function WhatYouGetSection() {
  // Track which card is centered for mobile zoom effect
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(1); // middle card default

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const containerCenter = el.scrollLeft + el.clientWidth / 2;
      const cards = el.querySelectorAll("[data-card]");
      let closest = 0;
      let minDist = Infinity;
      cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(cardCenter - containerCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      setActiveIndex(closest);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // 📍 Scroll to second card on mount (mobile only — shows user there's more to scroll)
useEffect(() => {
  const el = scrollRef.current;
  if (!el) return;
  const cards = el.querySelectorAll("[data-card]");
  if (cards[1]) {
    const containerCenter = el.clientWidth / 2;
    const cardCenter = cards[1].offsetLeft + cards[1].offsetWidth / 2;
    el.scrollTo({ left: cardCenter - containerCenter, behavior: "instant" });
  }
}, []);

  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-white">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADING */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-teal-900 mb-2">
            What will you <span className="text-orange-500">get</span> ?
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm italic">
            "Lets List out the Benefits of the Yoga T20 Program"
          </p>
        </div>

        {/* DESKTOP — Half-circle orbit */}
        <div className="hidden lg:block relative h-[620px] max-w-[1200px] mx-auto">
{/* Center yoga image — bigger + shadow */}
<div className="absolute left-1/2 bottom-0 -translate-x-1/2 z-0">
  <div className="relative">
    <img
      src={yogaT20PersonImg}
      alt="Yoga T20 practitioner"
      className="w-[380px] lg:w-[640px] h-auto object-contain relative z-10"
    />
    {/* Floor shadow */}
   <div
  className="absolute left-1/2 -translate-x-1/2 rounded-[50%] z-0"
  style={{
    bottom: "-10px",
    width: "70%",
    height: "40px",
    background: "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)",
    filter: "blur(8px)",
  }}
/>
  </div>
</div>
          {/* 
            Half-circle math:
            - center X = 50% of container
            - top arc has 3 cards (left, top-center, right)
            - bottom arc has 2 cards (lower-left, lower-right) closer to bottom edge
          */}

          {/* TOP-CENTER (peak of arc) */}
          <div className="absolute top-[20px] left-1/2 -translate-x-1/2 z-10">
            <ChipCard benefit={benefits[1]} />
          </div>

          {/* TOP-LEFT (closer to center for half-circle look) */}
          <div className="absolute top-[140px] left-[180px] z-10">
            <ChipCard benefit={benefits[0]} />
          </div>

          {/* TOP-RIGHT */}
          <div className="absolute top-[140px] right-[180px] z-10">
            <ChipCard benefit={benefits[2]} />
          </div>

          {/* BOTTOM-LEFT */}
          <div className="absolute bottom-[80px] left-[20px] z-10">
            <ChipCard benefit={benefits[3]} />
          </div>

          {/* BOTTOM-RIGHT */}
          <div className="absolute bottom-[80px] right-[20px] z-10">
            <ChipCard benefit={benefits[4]} />
          </div>
        </div>

        {/* MOBILE / TABLET — Horizontal scroll with zoom on center card */}
        <div className="lg:hidden">
          <div className="flex justify-center mb-8">
            <div className="relative">
  <img
    src={yogaT20PersonImg}
    alt="Yoga T20 practitioner"
    className="w-[360px] sm:w-[360px] h-auto object-contain relative z-10"
  />
  <div
    className="absolute left-1/2 -translate-x-1/2 rounded-[50%] z-0"
    style={{
      bottom: "-10px",
      width: "70%",
      height: "40px",
      background: "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)",
      filter: "blur(8px)",
    }}
  />
</div>
          </div>

          {/* Snap scroll with center-zoom effect */}
          <div
            ref={scrollRef}
            className="overflow-x-auto pb-6 pt-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex gap-4 w-max items-center px-[calc(50%-110px)]">
              {benefits.map((b, i) => (
                <div
                  key={b.id}
                  data-card
                  className="flex-shrink-0 snap-center"
                >
                  <ChipCard benefit={b} isActive={i === activeIndex} />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}