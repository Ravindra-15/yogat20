// Yoga T20 - "What makes Yoga T20 Different?" Section
// Matches figma: peach bg, 3 orange cards, properly tilted phone, contained doctor screen
// Fully responsive — images scale and reposition cleanly on all screen sizes

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
    <section className="py-14 lg:py-20 bg-orange-50/40">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADING */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-teal-900">
            What makes{" "}
            <span className="text-orange-500">Yoga T20</span>{" "}
            Different?
          </h2>
        </div>

        {/* FULL-WIDTH CARD — What is Yoga T20? */}
        <div className="bg-orange-400 rounded-3xl overflow-hidden mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center px-6 sm:px-10 py-8 sm:py-10 gap-6">

            {/* Text */}
            <div className="text-white">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                What is Yoga T20?
              </h3>
              <p className="text-white text-sm sm:text-base font-semibold mb-3">
                Your 100% Online Yoga and Habit-Building Journey
              </p>
              <ul className="text-white/95 text-sm space-y-1 mb-6">
                <li>Just 20 Minutes Of Daily Yoga.</li>
                <li>Build Habits That Actually Stick.</li>
                <li>100% Web-Based — Join From Anywhere.</li>
              </ul>
              <button
                onClick={handleStartJourney}
                className="bg-white hover:bg-gray-50 text-orange-500 text-sm font-semibold px-7 py-2.5 rounded-full transition-colors shadow-sm"
              >
                Start Journey Today
              </button>
            </div>

            {/* Image */}
            <div className="relative flex justify-center md:justify-end items-center min-h-[220px] sm:min-h-[260px]">
              <img
                src={whatIsYogaT20Img}
                alt="Yoga lunge pose"
                className="
                  w-[220px] sm:w-[280px] lg:w-[340px]
                  h-auto object-contain
                "
              />
            </div>

          </div>
        </div>

        {/* 2-COL ROW: Daily Tracking + Doctor Consultation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* LEFT — Daily Tracking */}
          <div className="bg-orange-400 rounded-3xl overflow-hidden relative">
            <div className="px-6 sm:px-8 py-7 sm:py-8 min-h-[260px] flex flex-col justify-center text-white relative z-10 max-w-[60%]">
              <h3 className="text-xl sm:text-2xl font-bold mb-3">
                Daily Tracking
              </h3>
              <ul className="text-white/95 text-xs sm:text-sm space-y-1 leading-relaxed">
                <li>Log Your Water, Sleep, And Steps.</li>
                <li>See Your Progress Charts Grow.</li>
                <li>Stay Motivated With Daily Streaks.</li>
              </ul>
            </div>

            {/* Phone image — tilted LEFT (negative rotation) per figma */}
            <img
              src={dailyTrackingImg}
              alt="Phone with tracking dashboard"
              className="
                absolute
                bottom-[-20px]
                right-[-20px]
                sm:right-[-10px]
                w-[150px] sm:w-[180px] lg:w-[210px]
                h-auto object-contain
                rotate-[-12deg]
                drop-shadow-2xl
                z-0
              "
            />
          </div>

          {/* RIGHT — Doctor Consultation */}
          <div className="bg-orange-400 rounded-3xl overflow-hidden relative">
            <div className="px-6 sm:px-8 py-7 sm:py-8 min-h-[260px] flex flex-col justify-center text-white relative z-10 max-w-[55%]">
              <h3 className="text-xl sm:text-2xl font-bold mb-3">
                Doctor Consultation
              </h3>
              <p className="text-white/95 text-xs sm:text-sm mb-4">
                Book 1-On-1 Calls With Experts.
              </p>
              <button
                onClick={handleConsultDoctor}
                className="
                  bg-white hover:bg-gray-50
                  text-orange-500 text-xs font-semibold
                  px-5 py-2 rounded-full
                  transition-colors shadow-sm
                  self-start
                "
              >
                Get Consult Now
              </button>
            </div>

            {/* Doctor laptop image — contained within card, no overflow */}
            <img
              src={doctorConsultImg}
              alt="Doctor video consultation"
              className="
                absolute
                bottom-4 right-4
                w-[160px] sm:w-[190px] lg:w-[220px]
                h-auto object-contain
                rounded-xl
                drop-shadow-xl
                z-0
              "
            />
          </div>

        </div>

      </div>
    </section>
  );
}