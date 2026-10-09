/**
 * CUSTOMER MODULE — Free Trial Modal (YogaT20)
 * Shows trial benefits + lets the user request a 14-day free trial.
 * Content adapts to the user's current trial state (none / pending /
 * active / expired / rejected / already has a paid plan).
 */

import { useEffect, useState } from "react";
import { X, Loader2, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { fetchTrialStatus, requestFreeTrial } from "../../../../services/customerFreeTrialService";

const BENEFITS = [
  "Full YogaT20 dashboard access for 14 days",
  "Normal, Chair & High Intensity yoga videos",
  "Daily progress tracking",
];

export default function FreeTrialModal({ open, onClose }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setLoading(true);
    fetchTrialStatus()
      .then((data) => {
        if (mounted) setStatus(data);
      })
      .catch(() => {
        if (mounted) setStatus({ state: "none" });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [open]);

  if (!open) return null;

  const handleRequest = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      await requestFreeTrial();
      toast.success("Your free trial request has been sent for approval!");
      setStatus({ state: "pending" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const renderBody = () => {
    if (loading) {
      return (
        <div className="py-10 flex justify-center">
          <Loader2 size={24} className="animate-spin text-orange-400" />
        </div>
      );
    }

    switch (status?.state) {
      case "pending":
        return (
          <div className="text-center py-4">
            <Clock size={36} className="text-orange-500 mx-auto mb-3" />
            <p className="text-sm text-gray-700 font-medium">Your request is pending approval</p>
            <p className="text-xs text-gray-500 mt-1.5">
              We'll notify you by email as soon as it's reviewed.
            </p>
          </div>
        );

      case "active_trial":
        return (
          <div className="text-center py-4">
            <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-3" />
            <p className="text-sm text-gray-700 font-medium">
              You're already on your free trial — {status.daysRemaining} day
              {status.daysRemaining === 1 ? "" : "s"} left
            </p>
            <button
              type="button"
              onClick={() => navigate("/programs/yogat20/dashboard")}
              className="mt-4 inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        );

      case "trial_expired":
        return (
          <div className="text-center py-4">
            <p className="text-sm text-gray-700 font-medium">
              You've already used your one-time free trial for YogaT20.
            </p>
            <button
              type="button"
              onClick={() => navigate("/programs/yogat20/tenure")}
              className="mt-4 inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
            >
              View Plans
            </button>
          </div>
        );

      case "has_purchased_plan":
        return (
          <div className="text-center py-4">
            <p className="text-sm text-gray-700 font-medium">
              Free trials are only for new users — you've already purchased a YogaT20 plan.
            </p>
            <button
              type="button"
              onClick={() => navigate("/my-plans-and-billings")}
              className="mt-4 inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
            >
              View My Plans
            </button>
          </div>
        );

      case "rejected":
      case "none":
      default:
        return (
          <>
            {status?.state === "rejected" && (
              <div className="mb-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-2.5">
                <p className="text-xs text-amber-700">
                  Your previous request wasn't approved
                  {status.rejectionReason ? `: ${status.rejectionReason}` : "."} You can request again below.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-orange-500" />
              <h3 className="text-base font-bold text-gray-900">What's included</h3>
            </div>
            <ul className="space-y-2 mb-6">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-gray-400 mb-4">
              Your request needs a quick admin approval before access is granted. You'll be notified by email.
            </p>

            <button
              type="button"
              onClick={handleRequest}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors disabled:opacity-60"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              Request Free Trial
            </button>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center px-4">
      <div className="relative bg-white rounded-3xl w-full max-w-md p-7 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
          Free 14-Day Trial
        </h2>
        <p className="text-sm text-gray-500 mb-5">Try YogaT20, on us.</p>

        {renderBody()}
      </div>
    </div>
  );
}
