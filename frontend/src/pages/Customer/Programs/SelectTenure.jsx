// Zealtho Programs - Select Tenure
// Plan picker between landing PricingSection and ProgramCheckout
// Prices must match backend programPrices in customer.program.controller.js

import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { getSubscriptionRedirect } from "../../../utils/subscriptionGuard";
const tenureOptions = [
  {
    id: "12months",
    label: "12 Months",
    price: 84,
    original: 504,
    discount: "84% Off",
    tenure: "12",
    bestseller: true,
  },
  {
    id: "3months",
    label: "3 Months",
    price: 45,
    original: 90,
    discount: "50% Off",
    tenure: "3",
    bestseller: false,
  },
];

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

  useEffect(() => {
    const redirect = getSubscriptionRedirect(`/programs/${id}/tenure`);
    if (redirect) navigate(redirect, { replace: true });
  }, [id, navigate]);

  const handleSelect = (option) => {
    navigate(`/programs/${id}/checkout`, {
      state: {
        tenure: option.label,
        price: option.price,
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tenureOptions.map((option) => (
            <div
              key={option.id}
              className={`relative border rounded-2xl p-5 hover:border-orange-400 hover:shadow-md transition-all cursor-pointer ${
                option.bestseller
                  ? "border-orange-300 bg-orange-50/30"
                  : "border-gray-200"
              }`}
              onClick={() => handleSelect(option)}
            >
              {option.bestseller && (
                <div className="absolute -top-2 left-4 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  ★ Bestseller
                </div>
              )}

              <div className="flex items-center justify-between mb-2 mt-1">
                <span className="font-semibold text-gray-800 text-base">
                  {option.label}
                </span>
                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {option.discount}
                </span>
              </div>

              <p className="text-xs text-gray-400 line-through mb-1">
                $ {option.original}
              </p>

              <p className="text-2xl font-bold text-gray-800 mb-4">
                $ {option.price}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(option);
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 rounded-full transition-colors shadow-[0_4px_14px_rgba(249,115,22,0.35)]"
              >
                Select Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
