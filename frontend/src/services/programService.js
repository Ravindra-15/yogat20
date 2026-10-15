import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

// ============================================
// 🔐 GET AUTH TOKEN
// ============================================
const getToken = () => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("doctorToken") ||
    sessionStorage.getItem("doctorToken")
  );
};

// ============================================
// 📦 CREATE SUBSCRIPTION
// ============================================
export const subscribeToProgram = async (
  payload
) => {
  const token = getToken();

  const response = await axios.post(
    `${API_BASE}/customer/programs/subscribe`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type":
          "application/json",
      },
    }
  );

  return response.data;
};

// ============================================
// 🅿️ PAYPAL — START PLAN CHECKOUT
// Returns { orderId, approveUrl, amount, currency } — redirect to approveUrl.
// The price is always re-calculated on the server, never taken from here.
// ============================================
export const createProgramPaypalOrder = async ({ programId, tenure, weeks, returnUrl, cancelUrl }) => {
  const token = getToken();
  const response = await axios.post(
    `${API_BASE}/customer/programs/paypal/create-order`,
    { programId, tenure, weeks, returnUrl, cancelUrl },
    {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      timeout: 30000,
    }
  );
  return response.data.data;
};

// ============================================
// 🅿️ PAYPAL — FINISH PLAN CHECKOUT
// Only needs the orderId — plan details are stored server-side.
// Safe to call repeatedly (never double-charges or double-subscribes).
// ============================================
export const captureProgramPaypalOrder = async ({ orderId }) => {
  const token = getToken();
  const response = await axios.post(
    `${API_BASE}/customer/programs/paypal/capture-order`,
    { orderId },
    {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      timeout: 45000, // PayPal capture can be slow — don't give up early
    }
  );
  return response.data;
};

// ============================================
// 📋 GET MY SUBSCRIPTIONS
// ============================================
export const getMySubscriptions =
  async () => {
    const token = getToken();

    const response = await axios.get(
      `${API_BASE}/customer/programs/my-subscriptions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  };

// ============================================
// 🎯 GET PROGRAM STATUS
// ============================================
export const getProgramStatus =
  async (programId) => {
    const token = getToken();

    const response = await axios.get(
      `${API_BASE}/customer/programs/${programId}/status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  };

// ============================================
// ❌ CANCEL SUBSCRIPTION
// ============================================
export const cancelSubscription =
  async (subscriptionId) => {
    const token = getToken();

    const response = await axios.patch(
      `${API_BASE}/customer/programs/${subscriptionId}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  };