// Zealtho - Subscription Access Guard
// Ensures user is logged in AND fully onboarded before reaching subscription flow
// Used by PricingSection, SelectTenure, ProgramCheckout

export const getSubscriptionRedirect = (intendedPath) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // Not logged in → signup with return path
  if (!token) {
    return `/signup?next=${encodeURIComponent(intendedPath)}`;
  }

  // Logged in → check profile completion
  let user = null;
  try {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    user = raw ? JSON.parse(raw) : null;
  } catch {
    user = null;
  }

  // No user data → corrupted, force re-login
  if (!user) {
    return `/login?next=${encodeURIComponent(intendedPath)}`;
  }

  // Profile Step 1 incomplete
  if (!user.fullName || !user.nickName) {
    return `/profile-step-1?next=${encodeURIComponent(intendedPath)}`;
  }

  // Profile Step 2 incomplete
  if (!user.dob || !user.country || !user.city) {
    return `/profile-step-2?next=${encodeURIComponent(intendedPath)}`;
  }

  // Fully eligible → null means proceed to intended path
  return null;
};