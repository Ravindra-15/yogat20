// Yoga T20 - "Our Structure" Section

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
    <section className="py-8 sm:py-12 lg:py-14 bg-white">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 items-stretch">
          {/* LEFT — Heading + Accordion */}
          {/* LEFT — Heading + Accordion */}
          <div className="w-full flex flex-col justify-center h-full">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-teal-900 mb-6 sm:mb-8 lg:mb-10">
              Our <span className="text-orange-500">Structure</span>
            </h2>

            <div className="space-y-3">
              {accordionItems.map((item) => {
                const isOpen = openId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                      isOpen
                        ? "bg-orange-400 shadow-sm"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <button
                      onClick={() => toggle(item.id)}
                      className="w-full flex items-center justify-between px-5 sm:px-6 py-6 sm:py-7 text-left"
                    >
                      <span
                        className={`font-semibold text-sm sm:text-base ${
                          isOpen ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {item.title}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`flex-shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-white" : "text-gray-500"
                        }`}
                      />
                    </button>

                    {/* Slide animation */}
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 sm:px-6 pb-4 sm:pb-5 text-sm leading-relaxed text-white/95">
                          {item.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — Image + Weekly Activity Card */}
         <div className="relative w-full pb-10 sm:pb-12 lg:pb-5">
            <div className="rounded-3xl overflow-hidden">
              <img
                src="/images/ourStructure.png"
                alt="Yoga group practice"
                className="w-full h-[280px] sm:h-[380px] lg:h-[460px] object-cover"
              />
            </div>

            {/* Weekly activity card */}
            <div className="absolute -bottom-8 left-4 sm:-bottom-10 sm:-left-6 lg:-bottom-12 lg:-left-10 bg-white rounded-2xl shadow-2xl px-4 py-3 w-[150px] sm:w-[180px] lg:w-[200px]">
              {" "}
              <p className="text-[11px] sm:text-xs text-gray-500 mb-2 font-medium">
                Your weekly activity
              </p>
              <div className="flex items-end justify-between gap-1 h-[40px] sm:h-[50px]">
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
