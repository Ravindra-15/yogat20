/**
 * Checks if the logged-in user has an active subscription for THIS program.
 * Matches by programId so other programs' subs don't unlock this one.
 */

import { getMySubscriptions } from "../services/programService";
import { PROGRAM_ID } from "./programConfig";

// Returns true if an active, non-expired subscription exists for PROGRAM_ID
export const hasActiveProgramSubscription = async () => {
  try {
    const data = await getMySubscriptions();
    const subscriptions = data?.subscriptions || [];
    const now = new Date();

    return subscriptions.some(
      (sub) =>
        sub.programId === PROGRAM_ID &&
        sub.status === "active" &&
        new Date(sub.endDate) > now
    );
  } catch (err) {
    return false; // soft fail — treat as no subscription
  }
};