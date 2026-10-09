// Yoga T20 — "Free 14-Day Trial" CTA banner
import { Sparkles, Check } from "lucide-react";

const PERKS = ["No payment required", "Full dashboard access", "14 days, no strings"];

export default function FreeTrialCTASection({ onStartTrial }) {
  return (
    <section className="py-10 sm:py-12 bg-white">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl px-6 sm:px-10 py-9 sm:py-11 text-center shadow-[0_12px_30px_rgba(249,115,22,0.25)]">
          <div className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Sparkles size={13} />
            Limited Time
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
            Try YogaT20 Free for 14 Days
          </h2>
          <p className="text-sm sm:text-base text-white/90 mb-6 max-w-xl mx-auto">
            Full access to videos, tracking, and your dashboard — no payment required to start.
          </p>

          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-7">
            {PERKS.map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-white/95">
                <Check size={14} strokeWidth={3} />
                {p}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={onStartTrial}
            className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold text-orange-600 bg-white hover:bg-gray-50 transition-colors shadow-lg"
          >
            Start Your Free Trial
          </button>
        </div>
      </div>
    </section>
  );
}
