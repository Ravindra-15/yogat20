import { useEffect, useState } from "react";
import { Navigate, useParams, useLocation } from "react-router-dom";

import { hasActiveProgramSubscription } from "../../utils/subscriptionCheck";
import { PROGRAM_ID } from "../../utils/programConfig";
const ProtectedProgramRoute = ({ children }) => {
  // 🔒 this app only serves its OWN program (e.g. no YogaT20 videos inside Diabmukt)
  const { id } = useParams();
  const location = useLocation();

  // ============================================
  // 🔄 STATE
  // ============================================
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  // 🆓 Once a trial has been used (approved, regardless of current
  // status), a denied user gets sent to the upgrade page instead of the
  // homepage — "hide dashboard access, force them to the tenure page".
  const [hadTrial, setHadTrial] = useState(false);

  // ============================================
  // 🔐 TOKEN CHECK
  // ============================================
  const customerToken =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const doctorToken =
    localStorage.getItem("doctorToken") ||
    sessionStorage.getItem("doctorToken");

  const isAuthenticated = customerToken || doctorToken;

  // ============================================
  // 🚀 VERIFY SUBSCRIPTION
  // ============================================
  useEffect(() => {
    const verifySubscription = async () => {
      try {
        // 🚫 Not logged in
        if (!isAuthenticated) {
          setHasAccess(false);
          return;
        }

        // ✅ Active, unexpired subscription to THIS program only
        setHasAccess(await hasActiveProgramSubscription());
        // Only relevant when access is being denied — did this user ever
        // have a trial subscription (one per user, ever) for this program?
        if (!activeSubscription) {
          setHadTrial(subscriptions.some((sub) => sub.isTrial));
        }
      } catch (err) {
        console.error(
          "ProtectedProgramRoute error:",
          err
        );

        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    verifySubscription();
  }, [isAuthenticated]);
  // 🔀 Another program's URL opened in this app → same page for this app's program
  if (id && id !== PROGRAM_ID) {
    return (
      <Navigate
        to={location.pathname.replace(`/programs/${id}`, `/programs/${PROGRAM_ID}`) + location.search}
        replace
      />
    );
  }


  // ============================================
  // ⏳ LOADER
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />

          <p className="text-sm text-gray-500 font-medium">
            Verifying your subscription...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // 🚫 ACCESS DENIED
  // ============================================
  if (!hasAccess) {
    return <Navigate to={hadTrial ? "/programs/yogat20/tenure" : "/"} replace />;
  }

  // ============================================
  // ✅ ACCESS GRANTED
  // ============================================
  return children;
};

export default ProtectedProgramRoute;