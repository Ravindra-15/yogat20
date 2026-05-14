// Yoga T20 - Pricing Section
// Now fetches plans dynamically from API (admin-configured pricing)
// Shows top 2 plans marked visible on landing, with the first as bestseller

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

// 💵 Format helper
const formatPrice = (n) => `$${Number(n || 0).toLocaleString("en-US")}`;

// 📅 Monthly price helper — for "$/month" display
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

  // 📥 Fetch plans on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const fetched = await getProgramPlans(PROGRAM_ID, {
          landingOnly: true,
        });
        if (!mounted) return;
        // Take only top 2 plans (landing shows max 2)
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
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADING */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Simple, <span className="text-orange-500">transparent pricing</span>
          </h2>

          <p className="text-gray-500 text-sm sm:text-base">
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
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-4">
            {plans.map((plan, idx) => {
              const isBestseller = plan.isBestseller || idx === 0;
              const monthlyPrice = calcMonthlyPrice(plan);

              return (
                <div
                  key={plan._id}
                  className={`relative rounded-[28px] border transition-all duration-300 w-full md:w-[330px] min-h-[205px] px-6 py-5 flex flex-col ${
                    isBestseller
                      ? "bg-[#0F5A53] border-[#0F5A53] text-white shadow-md"
                      : "bg-white border-gray-200 text-gray-800 shadow-sm"
                  }`}
                >
                  {/* Bestseller badge */}
                  <div className="min-h-[24px] mb-4">
                    {isBestseller && (
                      <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
                        <span>★</span>
                        <span>Bestseller</span>
                      </div>
                    )}
                  </div>

                  {/* Top row: name + offer badge */}
                  <div className="flex items-start justify-between mb-2">
                    <h3
                      className={`text-[20px] leading-none font-bold ${
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

                   
                  {/* Original price (struck-through) — reserves space even when empty */}
                  <p
                    className={`text-sm line-through mb-2 min-h-[20px] ${
                      isBestseller ? "text-teal-200" : "text-gray-400"
                    }`}
                  >
                    {plan.originalPrice > plan.offerPrice
                      ? formatPrice(plan.originalPrice)
                      : "\u00A0"}
                  </p>
                  {/* Monthly price */}
                  <div className="mb-6">
                    <span
                      className={`text-[28px] font-extrabold leading-none ${
                        isBestseller ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatPrice(monthlyPrice)}
                    </span>

                    <span
                      className={`ml-2 text-sm font-medium ${
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
                      className="w-full h-10 text-xs rounded-xl bg-orange-500 hover:bg-orange-600 transition-all text-white text-sm font-semibold shadow-md"
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

        {/* COMPARISON TABLE — features stay hardcoded as decided */}
        <div className="overflow-x-auto rounded-[28px] border border-gray-100 shadow-sm bg-white">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr>
                <th className="text-left px-10 py-6 text-gray-400 font-normal w-[50%]" />

                {/* Dynamic header columns from fetched plans */}
                {plans.map((plan, idx) => (
                  <th
                    key={plan._id}
                    className={`px-6 py-6 text-center font-bold text-[18px] ${
                      idx === 0
                        ? "text-[#0F5A53] bg-[#EAF7F5]"
                        : "text-gray-800"
                    }`}
                  >
                    {plan.planName}
                  </th>
                ))}

                {/* Fallback headers if no plans loaded */}
                {plans.length === 0 && (
                  <>
                    <th className="px-6 py-6 text-center font-bold text-[#0F5A53] bg-[#EAF7F5] text-[18px]">
                      12 Months
                    </th>
                    <th className="px-6 py-6 text-center font-bold text-gray-800 text-[18px]">
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
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="px-10 py-4 text-gray-700 font-medium border-b border-gray-100">
                    {feature}
                  </td>

                  {/* Render a checkmark column per plan */}
                  {(plans.length > 0
                    ? plans
                    : [{ _id: "fallback1" }, { _id: "fallback2" }]
                  ).map((plan, idx) => (
                    <td
                      key={plan._id}
                      className={`px-6 py-4 text-center border-b ${
                        idx === 0
                          ? "bg-[#EAF7F5] border-[#D8EFEB]"
                          : "border-gray-100"
                      }`}
                    >
                      <Check
                        size={18}
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
