/**
 * Root gate for "/" — decides landing vs dashboard.
 * Logged-in + active subscription for this program → dashboard.
 * Otherwise → render the landing page.
 */

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { hasActiveProgramSubscription } from "../../utils/subscriptionCheck";
import { PROGRAM_ID } from "../../utils/programConfig";

const RootGate = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [redirectToDashboard, setRedirectToDashboard] = useState(false);

  // token presence — only subscribed logged-in users get redirected
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      // not logged in → just show landing
      if (!token) {
        if (mounted) setChecking(false);
        return;
      }
      const subscribed = await hasActiveProgramSubscription();
      if (!mounted) return;
      setRedirectToDashboard(subscribed);
      setChecking(false);
    };

    check();
    return () => {
      mounted = false;
    };
  }, [token]);

  // brief loader while we check subscription (avoids landing flash)
  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (redirectToDashboard) {
    return <Navigate to={`/programs/${PROGRAM_ID}/dashboard`} replace />;
  }

  return children;
};

export default RootGate;