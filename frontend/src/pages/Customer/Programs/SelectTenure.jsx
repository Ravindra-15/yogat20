// Zealtho Programs - Select Tenure
// Plan picker between landing PricingSection and ProgramCheckout
// Plans fetched dynamically from API (admin-configured pricing)

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSubscriptionRedirect } from "../../../utils/subscriptionGuard";
import { getProgramPlans } from "../../../services/programPlanService";

const programNames = {
  yogat20: "Yoga T20",
  diabmukt: "Diabmukt",
  mommyfit: "MommyFit",
  slimfitter: "Slimfitter",
};

export default function SelectTenure() {
  const { id } = useParams();
  const navigate = useNavigate();
  const programName = programNames[id] || id;

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔒 Subscription guard (existing logic preserved)
  useEffect(() => {
    const redirect = getSubscriptionRedirect(`/programs/${id}/tenure`);
    if (redirect) navigate(redirect, { replace: true });
  }, [id, navigate]);

  // 📥 Load plans
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // Subscription flow shows ALL active plans (not just landing-visible)
        const fetched = await getProgramPlans(id);
        // const fetched = await getProgramPlans(id, { landingOnly: true });
        if (!mounted) return;
        setPlans(fetched);
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
  }, [id]);

  const handleSelect = (plan) => {
    navigate(`/programs/${id}/checkout`, {
      state: {
        tenure: plan.planName,
        price: plan.offerPrice,
        programId: id,
        programName,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-900/80 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg px-8 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Select your Tenure
          </h2>
          <p className="text-sm text-gray-500">
            Hey{" "}
            <span className="text-orange-500 font-semibold">{programName}</span>
            , Select your Program Duration
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <p className="text-center text-sm text-gray-400 py-10">
            Loading plans...
          </p>
        ) : plans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-4">
              No plans available right now. Please check back soon.
            </p>
            <button
              onClick={() => navigate(`/programs/${id}`)}
              className="text-sm text-orange-500 hover:underline font-medium"
            >
              ← Back to program
            </button>
          </div>
        ) : (
          <div
            className={`grid gap-4 ${
              plans.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
            }`}
          >
            {plans.map((plan, idx) => {
              const isBestseller = plan.isBestseller || idx === 0;
              return (
                <div
                  key={plan._id}
                  className={`relative border rounded-2xl p-5 hover:border-orange-400 hover:shadow-md transition-all cursor-pointer flex flex-col ${
                    isBestseller
                      ? "border-orange-300 bg-orange-50/30"
                      : "border-gray-200"
                  }`}
                  onClick={() => handleSelect(plan)}
                >
                  {isBestseller && (
                    <div className="absolute -top-2 left-4 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      ★ Bestseller
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2 mt-1">
                    <span className="font-semibold text-gray-800 text-base">
                      {plan.planName}
                    </span>
                    {plan.offerBadge && (
                      <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {plan.offerBadge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 line-through mb-1 min-h-[16px]">
                    {plan.originalPrice > plan.offerPrice
                      ? `$ ${plan.originalPrice}`
                      : "\u00A0"}
                  </p>

                  <p className="text-2xl font-bold text-gray-800 mb-4">
                    $ {plan.offerPrice}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(plan);
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 rounded-full transition-colors shadow-[0_4px_14px_rgba(249,115,22,0.35)] mt-auto"
                  >
                    Select Plan
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
