// Yoga T20 - "What makes Yoga T20 Different?" Section

import { useNavigate } from "react-router-dom";
import { getSubscriptionRedirect } from "../../../../utils/subscriptionGuard";
import whatIsYogaT20Img from "../../../../assets/what-is-yogat20.png";
import dailyTrackingImg from "../../../../assets/daily-tracking-phone.png";
import doctorConsultImg from "../../../../assets/doctor-consult.png";

export default function ConditionsSection() {
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
    <section className="py-10 sm:py-14 lg:py-20 bg-orange-50/40">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADING */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-teal-900">
            What makes <span className="text-orange-400">Yoga T20</span>{" "}
            Different?
          </h2>
        </div>

        {/* CARD 1 — What is Yoga T20? */}
        <div className="bg-orange-400 rounded-3xl overflow-hidden mb-4 sm:mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center px-5 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-10 gap-4 md:gap-6">
            {/* Text */}
            <div className="text-white text-left">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
                What is Yoga T20?
              </h3>
              <p className="text-white text-xs sm:text-sm lg:text-base font-semibold mb-2 sm:mb-3">
                Your 100% Online Yoga and Habit-Building Journey
              </p>
              <ul className="text-white/95 text-xs sm:text-sm space-y-1 mb-5 sm:mb-6">
                <li>Just 20 Minutes Of Daily Yoga.</li>
                <li>Build Habits That Actually Stick.</li>
                <li>100% Web-Based — Join From Anywhere.</li>
              </ul>
              <button
                onClick={handleStartJourney}
                className="bg-white hover:bg-gray-50 text-orange-500 text-xs sm:text-sm font-semibold px-6 sm:px-7 py-2.5 rounded-full transition-colors shadow-sm"
              >
                Start Journey Today
              </button>
            </div>

            {/* Image */}
            <div className="relative h-[180px] lg:h-[280px] overflow-hidden flex justify-center md:justify-end">

  <img
    src={whatIsYogaT20Img}
    alt="Yoga lunge pose"
    className="
      absolute
      bottom-0

      w-[420px]
      sm:w-[400px]
      lg:w-[560px]

      h-auto
      object-contain
      -scale-x-100
    "
  />
</div>        </div>
        </div>

        {/* CARD 2 + 3 — Stack on mobile, side-by-side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Daily Tracking */}
          <div className="bg-orange-400 rounded-3xl overflow-hidden relative min-h-[260px] sm:min-h-[300px] lg:min-h-[340px]">
            <div className="px-5 sm:px-7 lg:px-8 py-6 sm:py-7 lg:py-8 flex flex-col justify-center text-white relative z-10 max-w-[65%] sm:max-w-[60%] h-full">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 leading-tight">
                Daily
                <br className="sm:hidden" /> Tracking
              </h3>
              <ul className="text-white/95 text-xs sm:text-sm space-y-1 leading-relaxed">
                <li>Log Your Water, Sleep, And Steps.</li>
                <li>See Your Progress Charts Grow.</li>
                <li>Stay Motivated With Daily Streaks.</li>
              </ul>
            </div>

            <img
              src={dailyTrackingImg}
              alt="Phone tracking dashboard"
              className="
                  absolute

                  bottom-[-2px]
                  right-[-45px]

                  sm:right-[-60px]
                  lg:right-[-120px]

                  w-[280px]
                  sm:w-[240px]
                  lg:w-[440px]

                  h-auto
                  object-contain

                  rotate-[16deg]
                  sm:rotate-[16deg]
                  lg:rotate-[18deg]

                  drop-shadow-[0_20px_30px_rgba(0,0,0,0.28)]
                  [filter:drop-shadow(-12px_6px_14px_rgba(0,0,0,0.14))]

                  z-0
                "
            />
          </div>

          {/* Doctor Consultation */}
          <div className="bg-orange-400 rounded-3xl overflow-hidden relative min-h-[260px] sm:min-h-[300px] lg:min-h-[340px]">
            <div className="px-5 sm:px-7 lg:px-8 py-6 sm:py-7 lg:py-8 flex flex-col justify-center text-white relative z-10 max-w-[60%] sm:max-w-[55%] h-full">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 leading-tight">
                Doctor
                <br className="sm:hidden" /> Consultation
              </h3>
              <p className="text-white/95 text-xs sm:text-sm mb-3 sm:mb-4">
                Book 1-On-1 Calls With Experts.
              </p>
              <button
                onClick={handleConsultDoctor}
                className="bg-white hover:bg-gray-50 text-orange-500 text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 rounded-full transition-colors shadow-sm self-start"
              >
                Get Consult Now
              </button>
            </div>

            <img
              src={doctorConsultImg}
              alt="Doctor video consultation"
              className="absolute bottom-[10px] right-[5px] sm:bottom-[10px] sm:right-[10px] lg:bottom-[15px] lg:right-[15px] w-[200px] sm:w-[290px] lg:w-[400px] h-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.3)] z-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}