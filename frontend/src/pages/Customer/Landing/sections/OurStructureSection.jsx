// Yoga T20 - "Our Structure" Section (NEW)
// Left: heading + 3 accordion items (first one open with details)
// Right: yoga group image + "Your weekly activity" mini chart card overlay
// Replace dummy unsplash URL with /assets/yoga-group.png when image is ready

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const accordionItems = [
  {
    id: 1,
    title: "Building a Proper Structure",
    content: "Most wellness attempts fail because they lack a clear roadmap.",
  },
  {
    id: 2,
    title: "Building a Proper Structure",
    content:
      "Daily routines, weekly goals, and monthly milestones keep you accountable.",
  },
  {
    id: 3,
    title: "Motivation Throughout the Program",
    content:
      "Streak tracking, community support, and reminders keep your energy high.",
  },
];

const weeklyData = [3, 5, 8, 6, 9, 4, 7];

export default function OurStructureSection() {
  const [openId, setOpenId] = useState(1);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section className="py-14 lg:py-20 bg-white">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">

          {/* LEFT — Heading + Accordion */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
              Our <span className="text-orange-500">Structure</span>
            </h2>

            <div className="space-y-3">
              {accordionItems.map((item) => {
                const isOpen = openId === item.id;
                const isFirst = item.id === 1;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl overflow-hidden transition-all ${
                      isFirst && isOpen
                        ? "bg-orange-400 text-white"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <button
                      onClick={() => toggle(item.id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left"
                    >
                      <span
                        className={`font-semibold text-sm sm:text-base ${
                          isFirst && isOpen ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {item.title}
                      </span>
                      {isOpen ? (
                        <ChevronUp
                          size={18}
                          className={isFirst && isOpen ? "text-white" : "text-gray-500"}
                        />
                      ) : (
                        <ChevronDown size={18} className="text-gray-500" />
                      )}
                    </button>

                    {isOpen && (
                      <div
                        className={`px-5 pb-4 text-sm leading-relaxed ${
                          isFirst ? "text-white/95" : "text-gray-600"
                        }`}
                      >
                        {item.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — Image + Weekly Activity Card Overlay */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&q=80"
                alt="Yoga group practice"
                className="w-full h-[420px] object-cover"
              />
            </div>

            {/* Weekly activity mini-card overlay */}
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white rounded-2xl shadow-lg px-4 py-3 w-[180px]">
              <p className="text-[11px] text-gray-500 mb-2">Your weekly activity</p>
              <div className="flex items-end justify-between gap-1 h-[50px]">
                {weeklyData.map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-orange-500 rounded-sm"
                    style={{ height: `${val * 10}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}