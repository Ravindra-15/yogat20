// Zealtho Programs - Program Checkout (PayPal)
// Shows the order summary and sends the buyer to PayPal to pay. The amount
// charged is always re-calculated on the server — the price shown here is
// for display only and can't be tampered with.
// Gates user — redirects to signup/login/profile-step-x if not eligible.

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { X, Shield, Calendar, Lock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createProgramPaypalOrder, getSubscriptionQuote } from "../../../services/programService";
import { useCurrency } from "../../../hooks/useCurrency";
import { getSubscriptionRedirect } from "../../../utils/subscriptionGuard";
import { fetchMyReferrer } from "../../../services/customerReferralService";
import { getPaymentErrorMessage } from "../../../utils/paymentErrors";

// THEME-START
const THEME = {
  wrapper: "fixed inset-0 z-50 bg-gray-500/60 flex items-center justify-center px-4 py-10 overflow-y-auto",
  card: "bg-white rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100",
  header: "bg-gradient-to-r from-orange-500 to-orange-400",
  headerSub: "text-orange-100",
  closeBtn: "bg-white text-orange-500 hover:bg-orange-50",
  accentText: "text-orange-500",
  softBox: "bg-orange-50 border border-orange-100",
  summaryBorder: "border-gray-200",
  inputBox: "border-gray-200 bg-gray-50",
  button: "bg-orange-500 hover:bg-orange-600 shadow-[0_8px_24px_rgba(249,115,22,0.35)]",
};
// THEME-END

// Plan details are saved before redirecting to PayPal, because in-app route
// state doesn't survive the round trip to PayPal and back.
const checkoutKey = (programId) => `programCheckout:${programId}`;

const readSavedPlan = (programId) => {
  try {
    return JSON.parse(sessionStorage.getItem(checkoutKey(programId)) || "null");
  } catch {
    return null;
  }
};

export default function ProgramCheckout() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { convert, currency } = useCurrency();

  // From the plan-selection page, or (after coming back from PayPal) from
  // what was saved before the redirect.
  const [plan] = useState(() => {
    const s = location.state;
    if (s && (s.tenure || s.weeks) && s.price != null) return s;
    return readSavedPlan(id);
  });

  const [loading, setLoading] = useState(false);
  // 🔒 name of whoever sent the referral link (read-only; empty if nobody did)
  const [referrerName, setReferrerName] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 💾 Keep the plan available for a cancel/return from PayPal
  useEffect(() => {
    if (plan) sessionStorage.setItem(checkoutKey(id), JSON.stringify(plan));
  }, [id, plan]);

  // ============================================
  // 🔒 ACCESS GATE
  // Redirects to signup/login/profile-step if not fully onboarded
  // ============================================
  useEffect(() => {
    const redirect = getSubscriptionRedirect(`/programs/${id}/checkout`);
    if (redirect) navigate(redirect, { replace: true });
  }, [id, navigate]);

  // ============================================
  // 🅿️ PAYPAL CANCELLED — buyer backed out on PayPal's page
  // ============================================
  useEffect(() => {
    if (new URLSearchParams(location.search).get("paypalCancelled") === "1") {
      toast("Payment cancelled — no money was taken. You can try again whenever you're ready.", { icon: "ℹ️" });
      navigate(location.pathname, { replace: true, state: plan });
    }
  }, [location.search, location.pathname, navigate, plan]);

  // ============================================
  // 👤 REFERRAL NAME
  // Who sent the link — shown read-only so the friend knows (hidden if nobody)
  // ============================================
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const name = await fetchMyReferrer();
        if (mounted && name) setReferrerName(name);
      } catch {
        // soft fail — checkout works fine without the referral name
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ============================================
  // 💲 LIVE PRICE — re-checked with the server so a plan edited by the
  // admin never shows an old price here (PayPal charges this amount).
  // ============================================
  const [livePrice, setLivePrice] = useState(null);
  const [quoteError, setQuoteError] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(!!plan);

  useEffect(() => {
    if (!plan) return;
    let active = true;
    setQuoteLoading(true);
    getSubscriptionQuote({
      programId: id,
      tenure: plan.tenure,
      weeks: plan.pricingType === "weekly" ? plan.weeks : undefined,
    })
      .then((q) => {
        if (!active) return;
        const amount = Number(q?.amount);
        if (!Number.isFinite(amount)) throw new Error("bad quote");
        setLivePrice(amount);
        setQuoteError("");
        if (Math.abs(amount - (Number(plan.price) || 0)) > 0.009) {
          toast("This plan's price was just updated — showing the latest price.", { icon: "ℹ️" });
        }
      })
      .catch((err) => {
        if (active) setQuoteError(err?.response?.data?.message || "Couldn't confirm the latest price. Please try again.");
      })
      .finally(() => {
        if (active) setQuoteLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, plan]);

  const isWeekly = plan?.pricingType === "weekly";
  const tenure = plan?.tenure || (plan?.weeks ? `${plan.weeks} Weeks` : "");
  const price = livePrice != null ? livePrice : Number(plan?.price) || 0;
  const programName = plan?.programName || id;

  // ============================================
  // 💳 PAY WITH PAYPAL — redirect to PayPal's secure page
  // ============================================
  const payWithPaypal = async () => {
    if (loading || !plan || quoteLoading || quoteError) return;
    let redirecting = false;

    try {
      setLoading(true);
      const origin = window.location.origin;
      const result = await createProgramPaypalOrder({
        programId: id,
        tenure: plan.tenure,
        weeks: isWeekly ? plan.weeks : undefined,
        returnUrl: `${origin}/programs/${id}/paypal/return`,
        cancelUrl: `${origin}/programs/${id}/checkout?paypalCancelled=1`,
      });

      // Keep the button disabled while the browser leaves for PayPal, so a
      // second click can't start another order.
      redirecting = true;
      window.location.href = result.approveUrl;
    } catch (err) {
      if (!mountedRef.current) return;
      const msg = getPaymentErrorMessage(err, "Couldn't start payment. Please try again.");
      toast.error(err?.response ? msg : `${msg} You haven't been charged.`);
    } finally {
      if (mountedRef.current && !redirecting) setLoading(false);
    }
  };

  // ============================================
  // 🚫 NO PLAN (opened directly / session cleared)
  // ============================================
  if (!plan) {
    return (
      <div className={THEME.wrapper}>
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">No plan selected</h2>
          <p className="text-sm text-gray-500 mb-6">
            Please choose a plan first — you haven't been charged anything.
          </p>
          <button
            onClick={() => navigate(`/programs/${id}/tenure`, { replace: true })}
            className={`w-full text-white font-bold py-3.5 rounded-full transition-all ${THEME.button}`}
          >
            Choose a plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={THEME.wrapper}>
      <div className={THEME.card}>
        {/* HEADER */}
        <div className={`${THEME.header} px-6 sm:px-8 py-6 sm:py-7 relative`}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Close checkout"
            className={`absolute top-4 right-4 rounded-full p-1.5 transition-all ${THEME.closeBtn}`}
          >
            <X size={16} />
          </button>
          <h2 className="text-white text-xl sm:text-2xl font-bold text-center">
            Secure Checkout
          </h2>
          <p className={`${THEME.headerSub} text-sm text-center mt-1`}>
            Complete your payment to start your wellness journey
          </p>
        </div>

        {/* BODY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 p-5 sm:p-7 lg:p-9">
          {/* LEFT — order summary */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                  Your <span className={THEME.accentText}>{tenure}</span> Wellness Plan
                </h3>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  Access guided recovery videos, premium wellness content,
                  expert-led sessions and progress tracking.
                </p>
              </div>
              <div className={`${THEME.softBox} rounded-2xl px-4 py-3 flex flex-col items-center gap-1 shrink-0`}>
                <Calendar size={18} className={THEME.accentText} />
                <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
                  {tenure}
                </span>
              </div>
            </div>

            <div className={`bg-white border ${THEME.summaryBorder} rounded-2xl p-5 mb-5`}>
              <h4 className="font-bold text-gray-800 mb-4 text-base">Order Summary</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-500">Program</span>
                  <span className="font-semibold text-gray-800 text-right">{programName}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-semibold text-gray-800 text-right">{tenure}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between gap-3">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className={`text-2xl sm:text-3xl font-bold ${THEME.accentText}`}>
                    {convert(price)}
                  </span>
                </div>
              </div>
            </div>

            {/* 🔒 Read-only — shows who sent the referral link (hidden if nobody did) */}
            {referrerName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Referral Name</label>
                <div className="relative">
                  <input
                    value={referrerName}
                    readOnly
                    aria-readonly="true"
                    className={`w-full border ${THEME.inputBox} rounded-2xl pl-4 pr-11 py-3 text-sm font-medium text-gray-700 outline-none cursor-not-allowed`}
                  />
                  <Lock size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — PayPal */}
          <div className="flex flex-col">
            <h4 className="text-xl font-bold text-gray-800 mb-5">Payment</h4>

            <div className={`${THEME.softBox} rounded-2xl p-5 mb-5`}>
              <p className="text-2xl font-extrabold italic tracking-tight mb-2" aria-label="PayPal">
                <span className="text-[#003087]">Pay</span>
                <span className="text-[#009CDE]">Pal</span>
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                You'll be redirected to PayPal to pay securely with your PayPal
                balance or a card, then brought straight back here.
              </p>
            </div>

            <button
              onClick={payWithPaypal}
              disabled={loading || quoteLoading || !!quoteError}
              className={`w-full text-white font-bold py-4 rounded-full transition-all inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${THEME.button}`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Redirecting to PayPal…
                </>
              ) : (
                `Pay ${convert(price)} with PayPal`
              )}
            </button>

            {quoteError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-center">
                <p className="text-xs text-red-700">{quoteError}</p>
                <button
                  type="button"
                  onClick={() => navigate(`/programs/${id}/tenure`)}
                  className="mt-1 text-xs font-semibold text-red-700 underline"
                >
                  Choose a plan again
                </button>
              </div>
            )}

            {currency && currency !== "USD" && (
              <p className="text-xs text-gray-500 text-center mt-3 leading-relaxed">
                PayPal will charge <span className="font-semibold">${price.toFixed(2)} USD</span>{" "}
                (≈ {convert(price)}). Your bank or PayPal may apply its own conversion rate.
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-4">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Shield size={12} className="text-green-500" />
                SSL Secure
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Shield size={12} className="text-green-500" />
                PayPal Buyer Protection
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Lock size={12} className="text-green-500" />
                We never see your card details
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
