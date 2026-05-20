// Yoga T20 - Pricing Section

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { getSubscriptionRedirect } from "../../../../utils/subscriptionGuard";
import { getProgramPlans } from "../../../../services/programPlanService";

const features = [
  "Online Yoga",
  "Pranayama",
  "Meditation techniques",
  "Chair Yoga",
  "Mudras",
  "Strength training",
  "Pillates",
  "Dance yoga",
  "Face yoga",
  "Online massage workshop",
  "Fasting therapy",
  "Healthy diet and nutrition awareness",
  "Free doctor consultation *",
  "Flexible Batch timings",
];

const PROGRAM_ID = "yogat20";

const formatPrice = (n) => `$${Number(n || 0).toLocaleString("en-US")}`;

const calcMonthlyPrice = (plan) => {
  const months = plan.durationMonths || parseMonths(plan.planName) || 1;
  if (months <= 0) return plan.offerPrice;
  return Math.round(plan.offerPrice / months);
};

const parseMonths = (planName) => {
  if (!planName) return null;
  const m = String(planName).match(/(\d+)\s*month/i);
  return m ? parseInt(m[1], 10) : null;
};

export default function PricingSection() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const fetched = await getProgramPlans(PROGRAM_ID, {
          landingOnly: true,
        });
        if (!mounted) return;
        setPlans(fetched.slice(0, 2));
      } catch (err) {
        console.error("Failed to load plans:", err);
        if (mounted) setPlans([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleBuy = (planName) => {
    const intendedPath = `/programs/${PROGRAM_ID}/tenure`;
    const redirect = getSubscriptionRedirect(intendedPath);
    navigate(redirect || intendedPath);
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADING */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Simple, <span className="text-orange-500">transparent pricing</span>
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm lg:text-base">
            Pricing Options which are affordable
          </p>
        </div>

        {/* PRICING CARDS */}
        {loading ? (
          <div className="flex justify-center mb-4">
            <p className="text-sm text-gray-400 py-10">Loading plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="flex justify-center mb-4">
            <p className="text-sm text-gray-400 py-10">
              No plans available right now. Please check back soon.
            </p>
          </div>
        ) : (
          // <div className="flex flex-col md:flex-row items-stretch justify-end gap-4 mb-6 sm:mb-8 max-w-[calc(50%+40px)] ml-auto pr-0 sm:pr-2">
            <div className="flex flex-col md:flex-row items-stretch justify-center gap-5 mb-8 sm:mb-10">
            {plans.map((plan, idx) => {
              const isBestseller = plan.isBestseller || idx === 0;
              const monthlyPrice = calcMonthlyPrice(plan);

              return (
                <div
                  key={plan._id}
                  className={`relative rounded-[24px] sm:rounded-[28px] border transition-all duration-300 w-full md:w-[300px] lg:w-[330px] px-5 sm:px-6 py-5 flex flex-col ${
                    // className={`relative rounded-[20px] sm:rounded-[24px] border transition-all duration-300 w-full md:w-[230px] lg:w-[260px] px-4 sm:px-5 py-4 flex flex-col ${
                    isBestseller
                      ? "bg-[#0F5A53] border-[#0F5A53] text-white shadow-lg"
                      : "bg-white border-gray-200 text-gray-800 shadow-sm"
                  }`}
                >
                  {/* Bestseller badge */}
                  <div className="min-h-[24px] mb-3">
                    {isBestseller && (
                      <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
                        <span>★</span>
                        <span>Bestseller</span>
                      </div>
                    )}
                  </div>

                  {/* Plan name + offer badge */}
                  <div className="flex items-start justify-between mb-2">
                    <h3
                      className={`text-[18px] sm:text-[20px] leading-none font-bold ${
                        isBestseller ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {plan.planName}
                    </h3>

                    {plan.offerBadge && (
                      <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                        {plan.offerBadge}
                      </span>
                    )}
                  </div>

                  {/* Original price (strike-through) */}
                  <p
                    className={`text-xs sm:text-sm line-through mb-2 min-h-[18px] sm:min-h-[20px] ${
                      isBestseller ? "text-teal-200" : "text-gray-400"
                    }`}
                  >
                    {plan.originalPrice > plan.offerPrice
                      ? formatPrice(plan.originalPrice)
                      : "\u00A0"}
                  </p>

                  {/* Monthly price */}
                  <div className="mb-5 sm:mb-6">
                    <span
                      className={`text-[24px] sm:text-[28px] font-extrabold leading-none ${
                        isBestseller ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatPrice(monthlyPrice)}
                    </span>
                    <span
                      className={`ml-2 text-xs sm:text-sm font-medium ${
                        isBestseller ? "text-gray-100" : "text-gray-600"
                      }`}
                    >
                      / month
                    </span>
                  </div>

                  {/* Buy button */}
                  <div className="mt-auto">
                    <button
                      onClick={() => handleBuy(plan.planName)}
                      className="w-full h-10 rounded-xl bg-orange-500 hover:bg-orange-600 transition-all text-white text-xs sm:text-sm font-semibold shadow-md"
                    >
                      Buy now !
                    </button>
                  </div>

                  {/* Corner dot for bestseller */}
                  {isBestseller && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-orange-500" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* COMPARISON TABLE — with teal accent + blue divider lines */}
        <p className="lg:hidden text-center text-xs text-gray-500 mb-3 italic">
          ← Swipe to compare all plans →
        </p>
        <div className="overflow-x-auto rounded-[24px] sm:rounded-[28px] border-2 border-[#0F5A53]/15 shadow-sm bg-white">
          <table className="w-full min-w-[700px] text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-[#0F5A53]/20">
                <th className="text-left px-6 sm:px-10 py-4 sm:py-6 text-gray-400 font-normal w-[50%]" />

                {plans.map((plan, idx) => (
                  <th
                    key={plan._id}
                    className={`px-4 sm:px-6 py-4 sm:py-6 text-center font-bold text-[15px] sm:text-[18px] border-l-2 border-[#0F5A53]/15 ${
                      idx === 0
                        ? "text-[#0F5A53] bg-[#EAF7F5]"
                        : "text-gray-800"
                    }`}
                  >
                    {plan.planName}
                  </th>
                ))}

                {plans.length === 0 && (
                  <>
                    <th className="px-4 sm:px-6 py-4 sm:py-6 text-center font-bold text-[#0F5A53] bg-[#EAF7F5] text-[15px] sm:text-[18px] border-l-2 border-[#0F5A53]/15">
                      12 Months
                    </th>
                    <th className="px-4 sm:px-6 py-4 sm:py-6 text-center font-bold text-gray-800 text-[15px] sm:text-[18px] border-l-2 border-[#0F5A53]/15">
                      3 Months
                    </th>
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {features.map((feature, i) => (
                <tr
                  key={feature}
                  className="border-b border-[#0F5A53]/10 last:border-b-0"
                >
                  <td className="px-6 sm:px-10 py-3 sm:py-4 text-gray-900 font-bold">
                    {feature}
                  </td>

                  {(plans.length > 0
                    ? plans
                    : [{ _id: "fallback1" }, { _id: "fallback2" }]
                  ).map((plan, idx) => (
                    <td
                      key={plan._id}
                      className={`px-4 sm:px-6 py-3 sm:py-4 text-center border-l-2 border-[#0F5A53]/15 ${
                        idx === 0 ? "bg-[#EAF7F5]" : ""
                      }`}
                    >
                      <Check
                        size={16}
                        className="text-teal-600 mx-auto stroke-[3]"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
