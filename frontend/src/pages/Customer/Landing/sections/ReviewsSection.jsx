// Yoga T20 - "Reviews from Real People" section

import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const reviews = [
  {
    id: 1,
    text: "After 12 weeks of tracking my sugar and walking steps on DiabMukth, my doctor helped me safely reduce my dosage",
    name: "Yash Chopra",
    role: "Corporate Professional",
  },
  {
    id: 2,
    text: "Being able to show my real-time logs for sleep and water intake to my consultant changed everything",
    name: "Yash Chopra",
    role: "Corporate Professional",
  },
  {
    id: 3,
    text: "I started with Yogat20 and moved to DiabMukth for my sugar management. The habit-building streaks kept me motivated even on busy days",
    name: "Yash Chopra",
    role: "Corporate Professional",
  },
  {
    id: 4,
    text: "I started with Yogat20 and moved to DiabMukth for my sugar management. The habit-building streaks kept me motivated even on busy days",
    name: "Yash Chopra",
    role: "Corporate Professional",
  },
  {
    id: 5,
    text: "After 12 weeks of tracking my sugar and walking steps on DiabMukth, my doctor helped me safely reduce my dosage",
    name: "Yash Chopra",
    role: "Corporate Professional",
  },
  {
    id: 6,
    text: "Being able to show my real-time logs for sleep and water intake to my consultant changed everything",
    name: "Yash Chopra",
    role: "Corporate Professional",
  },
  {
    id: 7,
    text: "I started with Yogat20 and moved to DiabMukth for my sugar management. The habit-building streaks kept me motivated even on busy days",
    name: "Yash Chopra",
    role: "Corporate Professional",
  },
];

function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 sm:p-6 flex flex-col gap-3 h-[260px] sm:h-[280px] w-[300px] sm:w-[340px]">
      <span className="text-orange-400 text-5xl font-serif leading-none select-none -mb-2">
        &ldquo;
      </span>
      <p className="text-gray-700 text-sm leading-relaxed flex-1 line-clamp-5">
        {review.text}
      </p>
      <div className="pt-2">
        <p className="text-gray-900 font-bold text-sm">{review.name}</p>
        <p className="text-gray-500 text-xs mt-0.5">{review.role}</p>
      </div>
    </div>
  );
}

// 🔄 Row 1 — 3 cards, fixed grid on desktop (no loop)
function StaticRow({ items }) {
  return (
    <div className="hidden lg:grid grid-cols-3 gap-6 max-w-5xl mx-auto mb-6">
      {items.map((r) => (
        <ReviewCard key={r.id} review={r} />
      ))}
    </div>
  );
}

// 🔁 Row 2 — looping infinite scroll showing 3 full + 2 edge-cropped cards
function LoopingRow({ items }) {
  const scrollRef = useRef(null);

  const CARD_WIDTH = 340;
  const GAP = 24;
  const STEP = CARD_WIDTH + GAP;
  const COPIES = 5; // 5 copies = enough buffer for very wide viewports

  // Five copies for a wider loop buffer (was 3 — too short on large screens)
  const cloned = Array.from({ length: COPIES }, () => items).flat();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const singleSetWidth = items.length * STEP;
    // Start in the middle copy (index 2 of 0..4)
    el.scrollLeft = singleSetWidth * Math.floor(COPIES / 2);

    const handleScroll = () => {
      const singleSet = items.length * STEP;
      const middleStart = singleSet * Math.floor(COPIES / 2);
      // If we drift more than one set away from the middle in either direction,
      // teleport back by one set. This keeps us perpetually buffered.
      if (el.scrollLeft < middleStart - singleSet) {
        el.scrollLeft += singleSet;
      } else if (el.scrollLeft > middleStart + singleSet) {
        el.scrollLeft -= singleSet;
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [items.length]);

  const scrollBy = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * STEP, behavior: "smooth" });
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-4 pt-2 scrollbar-hide w-full"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div
          className="flex gap-6 w-max items-center"
          style={{
            paddingLeft: `max(16px, calc((100% - ${4 * CARD_WIDTH + 4 * GAP}px) / 2))`,
            paddingRight: `max(16px, calc((100% - ${4 * CARD_WIDTH + 4 * GAP}px) / 2))`,
          }}
        >
          {cloned.map((r, i) => (
            <div key={`${r.id}-${i}`} className="flex-shrink-0">
              <ReviewCard review={r} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-3 mt-6">
        <button
          onClick={() => scrollBy(-1)}
          className="w-10 h-10 rounded-full border border-gray-300 hover:border-orange-400 hover:text-orange-500 text-gray-500 flex items-center justify-center transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scrollBy(1)}
          className="w-10 h-10 rounded-full border border-gray-300 hover:border-orange-400 hover:text-orange-500 text-gray-500 flex items-center justify-center transition-colors"
          aria-label="Next"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default function ReviewsSection() {
  const topRow = reviews.slice(0, 3);
  const bottomRow = reviews.slice(3, 7);

  return (
    <section className="py-10 sm:py-14 lg:py-5 bg-white w-full overflow-hidden">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-3">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-teal-900">
            Reviews from <span className="text-orange-500">Real People</span>
          </h2>
        </div>

        <p className="text-center text-gray-600 text-sm sm:text-base max-w-xl mx-auto mb-10 sm:mb-12 leading-relaxed">
          "From building daily yoga habits to managing diabetes reversal, hear how our members are taking control of their health"
        </p>

        <StaticRow items={topRow} />
      </div>

      <div className="hidden lg:block w-full">
        <LoopingRow items={bottomRow} />
      </div>

      <div className="lg:hidden w-full">
        <LoopingRow items={reviews} />
      </div>
    </section>
  );
}