// Yoga T20 - "Start your healing journey by Booking Health Expert" CTA
// Doctor image anchored to bottom-right of card with no gap

import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import doctorCouple from "../../../../assets/doctor-consult-couple.png";

const benefits = [
  "1-on-1 guidance",
  "Personalized plan",
  "Trusted by 10,000+ users",
];

export default function HealingCTASection() {
  const navigate = useNavigate();

  const handleBookConsultation = () => {
    navigate("/book-doctor");
  };

  return (
    <section className="py-14 lg:py-20 bg-white">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-orange-100/70 rounded-3xl overflow-hidden relative">
          <div className="grid grid-cols-1 md:grid-cols-2 items-stretch min-h-[320px] sm:min-h-[360px]">

            {/* LEFT — Copy + checkmarks + CTA */}
            <div className="px-8 sm:px-12 py-10 sm:py-12 flex flex-col justify-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug mb-5">
                Start your healing journey
                <br />
                by Booking{" "}
                <span className="text-orange-500">Health Expert</span>
              </h2>

              <ul className="space-y-2 mb-7">
                {benefits.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <span className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleBookConsultation}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-3 rounded-full shadow-[0_4px_14px_rgba(249,115,22,0.35)] transition-colors self-start"
              >
                Book Doctor Consultation
              </button>
            </div>

            {/* RIGHT — Doctor image, anchored to bottom */}
            <div className="relative flex items-end justify-center md:justify-end">
              <img
                src={doctorCouple}
                alt="Healthcare professionals"
                className="
                  w-[280px] sm:w-[360px] md:w-[440px] lg:w-[520px] xl:w-[600px]
                  h-auto object-contain
                  block
                "
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}