/**
 * ============================================
 * CUSTOMER MODULE — Program Plan API Service
 * ============================================
 * Public service to fetch subscription plans for a program.
 * No auth required — used by landing page and tenure selection.
 *
 * Used by:
 *  - PricingSection (landing page — shows top 2 visible plans)
 *  - SelectTenure (subscription flow — shows all active plans)
 * ============================================
 */

import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// 🌐 Public instance — no auth interceptor
const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ============================================
// 📋 GET PROGRAM PLANS
// ============================================
/**
 * Fetch all active plans for a program.
 *
 * @param {string} programId - yogat20 | diabmukt | mommyfit | slimfitter
 * @param {Object} [options]
 * @param {boolean} [options.landingOnly] - if true, only plans flagged visible on landing
 * @returns Promise<Array<Plan>>
 *
 * Plan shape:
 *   {
 *     _id, programId, planName,
 *     originalPrice, offerPrice, offerBadge,
 *     displayOrder, durationMonths,
 *     isVisibleOnLanding, isActive, isBestseller
 *   }
 */
export const getProgramPlans = async (
  programId,
  { landingOnly = false } = {}
) => {
  const params = {};
  if (landingOnly) params.landing = "true";

  const response = await publicApi.get(
    `/customer/program-plans/${programId}`,
    { params }
  );

  return response.data.data.plans || [];
};