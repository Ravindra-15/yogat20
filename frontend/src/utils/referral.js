// utils/referral.js
// Captures a referral code from the URL (?ref=CODE) and remembers it
// until the user signs up. Program is this site's own identity.

import { PROGRAM_ID } from "./programConfig";

const REF_KEY = "referralCode";
const REF_PROGRAM_KEY = "referralProgram";

// Call on landing/signup mount — stores ?ref= if present
export const captureReferralFromUrl = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && ref.trim()) {
      localStorage.setItem(REF_KEY, ref.trim());
      localStorage.setItem(REF_PROGRAM_KEY, PROGRAM_ID);
    }
  } catch {
    // ignore
  }
};

// Read the stored referral (used at signup submit)
export const getStoredReferral = () => ({
  ref: localStorage.getItem(REF_KEY) || null,
  refProgram: localStorage.getItem(REF_PROGRAM_KEY) || null,
});

// Clear after a successful signup
export const clearStoredReferral = () => {
  localStorage.removeItem(REF_KEY);
  localStorage.removeItem(REF_PROGRAM_KEY);
};

// True when the current URL carries a referral code (?ref=CODE)
export const hasReferralInUrl = () => {
  try {
    return !!new URLSearchParams(window.location.search).get("ref")?.trim();
  } catch {
    return false;
  }
};

// Referral visitors land straight on the pricing section.
// Runs twice so it re-aligns after images above the section finish loading,
// and stops as soon as the visitor scrolls on their own. Returns a cleanup fn.
export const scrollToPricingOnReferral = () => {
  if (!hasReferralInUrl()) return undefined;

  const goToPricing = () =>
    document
      .getElementById("pricing")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  const timers = [setTimeout(goToPricing, 400), setTimeout(goToPricing, 1600)];
  const stop = () => timers.forEach(clearTimeout);

  window.addEventListener("wheel", stop, { once: true, passive: true });
  window.addEventListener("touchmove", stop, { once: true, passive: true });

  return () => {
    stop();
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchmove", stop);
  };
};